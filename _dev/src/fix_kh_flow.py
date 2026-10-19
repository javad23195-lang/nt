# سند خرید:
# ۱) خرید ناقص: اگر تعداد خریده کمتر از تعداد درخواست است، ردیف دو تکه می‌شود — تکه خریده‌شده (qty = تعداد خریده)
#    و تکه مانده (qty = بقیه، «در انتظار خرید») در همان سند می‌ماند تا بعداً خرید و وارد انبار شود. هر دو spl مشترک دارند
#    (نوار «ردیف تکراری» آن‌ها را تکراری نمی‌شمارد).
# ۲) «عدم تایید» در مرحله منصوری/گودرزی: قلم‌های سند لغو می‌شوند (over='لغو شد'، rej = نام مهندس، rejAt). سند به فهرست
#    «سند بسته» می‌رود با برچسب «عدم تایید — مهندس …» و دکمه «برگرداندن».
# ۳) تکه‌های خرید ناقص وقتی هیچ‌کدام خریده نشده (مثلاً بعد از «یک مرحله عقب») دوباره یک ردیف می‌شوند (kSplJoin).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='درخواست خرید')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:70],t.count(a)); t=t.replace(a,b)
# ۱) خرید ناقص
rep("""        got.forEach(x=>{ x[0].bought=x[1]; x[0].over=''; delete x[0]._bq; delete x[0]._bk; });
        const left=pend.length-got.length;""","""        let part=0;
        got.forEach(x=>{ const r=x[0], q=+spNum(r.qty)||0, v=x[1];
          if(q>0 && v<q){ const sp=r.spl||('s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5));
            const c=Object.assign({},r); ['id','_bq','_bk','inw','__i','bought'].forEach(f=>delete c[f]);
            c.qty=Math.round((q-v)*1000)/1000; c.over='در انتظار خرید'; c.bought=''; c.spl=sp; r.spl=sp; r.qty=v;
            const at=rows.indexOf(r); rows.splice(at+1,0,c); part++; }
          r.bought=v; r.over=''; delete r._bq; delete r._bk; });
        const left=d.rows.filter(r=>stageOf(r)<3).length+part;   /* got اینجا دیگر مرحله ۳ است */""")
rep("""        const tail=left?` · ${fa(left)} قلم مانده`:'';""","""        const tail=(left?` · ${fa(left)} قلم مانده`:'')+(part?` (${fa(part)} قلم ناقص — بقیه در سند ماند)`:'');""")
# ۲) عدم تایید: دکمه
rep("""        ${st>0?`<button type="button" class="gray fback">یک مرحله عقب</button>`:''}
      </div>`}""","""        ${st>0?`<button type="button" class="gray fback">یک مرحله عقب</button>`:''}
        ${st<2?`<button type="button" class="frej">عدم تایید</button>`:''}
      </div>`}""")
# ۳) یکی کردن دوباره تکه‌ها، پیش از رسم اسناد
rep("""function flowRender(){
  const box=$('flowList'), sec=$('flowBox');""","""function kSplJoin(){
  try{ if(typeof kCanW==='function' && !kCanW()) return; }catch(e){}
  const G={}; rows.forEach(r=>{ if(r&&r.spl) (G[r.spl]=G[r.spl]||[]).push(r); });
  Object.values(G).forEach(L=>{
    if(L.some(r=>String(r.bought||'').trim()!=='' || (Array.isArray(r.inw)&&r.inw.length))) return;   // هنوز خرید دارد
    const k=L[0]; k.qty=Math.round(L.reduce((a,r)=>a+(+spNum(r.qty)||0),0)*1000)/1000; delete k.spl;
    L.slice(1).forEach(r=>{ const i=rows.indexOf(r); if(i>-1) rows.splice(i,1); try{ const t=kTicks.indexOf(r); if(t>-1) kTicks.splice(t,1); }catch(e){} });
  });
}
function flowRender(){
  try{ kSplJoin(); }catch(e){}
  const box=$('flowList'), sec=$('flowBox');""")
# سند ردشده: جدا از سندهای باز
rep("""  const act=keys.filter(k=>!isFin(k)), fin=keys.filter(isFin);""","""  const isRej=k=>g[k].rows.every(r=>r.rej);
  const act=keys.filter(k=>!isFin(k)&&!isRej(k)), fin=keys.filter(k=>isFin(k)||isRej(k));""")
rep("""  const card=k=>{
    const d=g[k];""","""  const card=k=>{
    const d=g[k];
    if(isRej(k)){ const who=[...new Set(d.rows.map(r=>r.rej))].join('، ');
      return `<div class="fdoc rej" data-k="${esc(k)}"><div class="h"><span class="no"><span>سند خرید</span><span>${esc(k)}</span></span><span class="cnt"><span>${fa(d.rows.length)} قلم</span></span></div>
        <div class="rejt">عدم تایید — مهندس ${esc(who)}${d.rows[0].rejAt?` (${esc(d.rows[0].rejAt)})`:''}</div>
        <div class="items">${d.rows.slice(0,3).map(r=>esc(String(r.item||'').slice(0,26))).join('، ')}${d.rows.length>3?` و ${fa(d.rows.length-3)} قلم دیگر`:''}</div>
        <div class="nx"><button type="button" class="gray funrej">برگرداندن (تایید دوباره لازم است)</button></div></div>`; }""")
rep("""    + (fin.length?`<button type="button" class="fdmore" id="flowDoneBtn" aria-expanded="${flowDoneOpen?'true':'false'}">${fa(fin.length)} سند کامل‌شده — ${flowDoneOpen?'پنهان':'نمایش'}</button>""",
    """    + (fin.length?`<button type="button" class="fdmore" id="flowDoneBtn" aria-expanded="${flowDoneOpen?'true':'false'}">${fa(fin.length)} سند بسته (کامل یا عدم تایید) — ${flowDoneOpen?'پنهان':'نمایش'}</button>""")
# رفتار دکمه‌ها
rep("""    const bb=card.querySelector('.fback');""","""    const rj=card.querySelector('.frej');
    if(rj) armButton(rj,'عدم تایید','تأیید «عدم تایید»؟',()=>{
      const who=st===0?'منصوری':'گودرزی', n=d.rows.filter(r=>stageOf(r)<3).length;
      d.rows.forEach(r=>{ if(stageOf(r)>=3) return; r.rej=who; r.rejAt=TODAY; r.overOld=r.over||''; r.over='لغو شد'; delete r._bq; delete r._bk; });
      render(); say(`سند ${k} — ${fa(n)} قلم عدم تایید مهندس ${who}`); },6000);
    const ur=card.querySelector('.funrej');
    if(ur) ur.addEventListener('click',()=>{
      d.rows.forEach(r=>{ if(!r.rej) return; r.over=''; r.apr=''; delete r.rej; delete r.rejAt; delete r.overOld; });
      render(); say(`سند ${k} برگشت — دوباره در انتظار تایید مهندس منصوری`); });
    const bb=card.querySelector('.fback');""")
k=t.rfind("</style>"); t=t[:k]+"""
.fdoc .nx{flex-wrap:wrap}
.fdoc .nx button.frej{flex:1 1 100%;min-height:44px;background:#fff;border:1.5px solid #B03A3A;color:#8E2B2B;font-weight:800}
.fdoc .nx button.frej.armed{background:#8E2B2B;color:#fff}
.fdoc.rej{border-color:#E3B4B4;background:#FFF7F7}
.fdoc .rejt{color:#8E2B2B;font-weight:800;font-size:.88rem}
"""+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('kh flow')
