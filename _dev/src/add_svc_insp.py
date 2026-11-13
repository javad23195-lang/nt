# برنامه سرویس: «بازرسی شد» (۱۴۰۵/۰۸/۰۴). قلمی که فقط زمانش گذشته (کارکرد نرسیده) برچسب «بازرسی کنید» می‌گیرد.
# «بازرسی شد» با نتیجه (مثلاً سالم، یا نتیجه آنالیز): it.ti = تاریخ؛ سقف زمانی از آن روز (svc.js)؛ ساعت/کیلومتر آخرین تعویض عوض نمی‌شود.
# سابقه: nt_svc_log_v1 با kind:'insp' و note. «تعویض شد» ti را پاک می‌کند.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
def rep(t,a,b):
    assert t.count(a)==1,(a[:60],t.count(a)); return t.replace(a,b)
def df(t):
    t=rep(t,"let svEdit=null, svNew=null;","let svEdit=null, svNew=null, svInsp=null;")
    t=rep(t,"hot=A.filter(x=>x.st==='r'||x.st==='o'||svEdit===x.it.id)","hot=A.filter(x=>x.st==='r'||x.st==='o'||svEdit===x.it.id||svInsp===x.it.id)")
    t=rep(t,"""    <span class="sm">${esc(svText(x,unit))}${x.next!==null?` · بعدی ${faN(x.next)}`:''}</span>""",
      """    <span class="sm">${esc(svText(x,unit))}${x.next!==null?` · بعدی ${faN(x.next)}`:''}${x.tonly?' <em class="sinsp">بازرسی کنید</em>':''}${it.insp&&it.insp.d?`<span class="sih">بازرسی ${esc(fa(it.insp.d))}${it.insp.note?': '+esc(it.insp.note):''}</span>`:''}</span>""")
    t=rep(t,"""<button type="button" class="sdone" data-id="${esc(it.id)}">تعویض شد</button>""",
      """<button type="button" class="sdone" data-id="${esc(it.id)}">تعویض شد</button><button type="button" class="sins" data-id="${esc(it.id)}">بازرسی شد</button>""")
    # فرم کوچک بازرسی زیر همان ردیف
    t=rep(t,"""function svRow(x,unit){
  const it=x.it;
  if(svEdit===it.id) return svForm(it,unit);""","""function svInspForm(it){ return `<div class="sr sform sinf" data-id="${esc(it.id)}"><b style="display:block;margin-bottom:6px">بازرسی ${esc(it.name)}</b>
    <label>نتیجه بازرسی یا آنالیز<input data-f="note" maxlength="120" placeholder="مثلاً: سالم؛ رنگ و بو عادی، بدون آب و براده"></label>
    <div class="sfb"><button type="button" class="sisave" data-id="${esc(it.id)}">ثبت بازرسی (سقف زمانی از امروز)</button><button type="button" class="scan">انصراف</button></div></div>`; }
function svRow(x,unit){
  const it=x.it;
  if(svEdit===it.id) return svForm(it,unit);
  if(svInsp===it.id) return svInspForm(it);""")
    t=rep(t,"      x.last=cur.val; x.ld=day; delete x.ok;","      x.last=cur.val; x.ld=day; delete x.ok; delete x.ti;")
    t=rep(t,"  box.querySelectorAll('.sed').forEach(b=>b.addEventListener('click',()=>{ svEdit=b.dataset.id; svNew=null; render()",
      """  box.querySelectorAll('.sins').forEach(b=>b.addEventListener('click',()=>{ svInsp=b.dataset.id; svEdit=null; svNew=null; render(); const f=box.querySelector('.sinf [data-f=note]'); if(f) f.focus(); }));
  box.querySelectorAll('.sisave').forEach(b=>b.addEventListener('click',()=>{ const f=b.closest('.sinf'), note=String((f.querySelector('[data-f=note]')||{}).value||'').replace(/[<>"]/g,'').trim().slice(0,120);
    if(!note){ say('نتیجه بازرسی را بنویسید (مثلاً «سالم»)',true); return; }
    const L=svGet(SVK), x=L.find(y=>y.id===b.dataset.id); if(!x) return; const day=svDay(), cur=ntSvc.latest(log)[x.dev];
    x.ti=day; x.insp={d:day,note}; let by=''; try{ by=(parent.ntSync&&parent.ntSync.myName&&parent.ntSync.myName())||''; }catch(e){}
    const G=svGet(SVL); G.push(Object.assign({id:svId(),item:x.id,dev:x.dev,name:x.name,kind:'insp',d:day,note,at:cur?cur.val:''},by?{by}:{}));
    if(svSet(SVK,L) && svSet(SVL,G)){ svInsp=null; render(); say(`بازرسی ${x.name} ثبت شد؛ سقف زمانی از ${fa(day)}`); } }));
  box.querySelectorAll('.scan').forEach(b=>b.addEventListener('click',()=>{ svInsp=null; }));
  box.querySelectorAll('.sed').forEach(b=>b.addEventListener('click',()=>{ svEdit=b.dataset.id; svNew=null; render()""")
    t=rep(t,".sr .sb .sed{min-width:44px}",""".sr .sb .sed{min-width:44px}
.sr .sb .sins{border-color:#0B5C7A;color:#0B5C7A}
.sr .sinsp{white-space:nowrap;font-style:normal;font-size:.72rem;font-weight:800;color:#0B5C7A;background:#E3EEF5;border-radius:8px;padding:1px 7px;margin-inline-start:4px}
.sr .sih{display:block;font-size:.76rem;color:#1E7F4F;font-weight:700;margin-top:2px}
@media (max-width:560px){ .sr{grid-template-columns:14px 1fr} .sr .sb{grid-column:1/-1;grid-row:auto;justify-content:flex-end;margin-top:4px} }""")
    return t
d=next(x for x in docs if x['name']=='دفترچه قرائت'); t=base64.b64decode(d['b64']).decode('utf-8'); d['b64']=base64.b64encode(df(t).encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('svc insp')
