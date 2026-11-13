# درخواست خرید: (۱) جستجو در همه درخواست‌ها (نام کالا، دستگاه، شرح، یادداشت، شماره سند، تاریخ).
# (۲) کالای تکراری با فاصله/حروف متفاوت هم شناخته شود: «کوماتسوPC400» = «کوماتسو PC400».
#     مقایسه با sq() = norm بدون فاصله. برای کالای تازه، نام‌های شبیه (کاتالوگ + درخواست‌های قبلی) پیشنهاد می‌شود.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='درخواست خرید')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)

# کلید فشرده + شباهت
rep("function tokens(s){const n=norm(s);return n?n.split(' '):[];}","""function tokens(s){const n=norm(s);return n?n.split(' '):[];}
/** کلید فشرده: بدون فاصله — «کوماتسوPC400» = «کوماتسو PC400» */
function sq(s){ return norm(s).replace(/ /g,'').replace(/\u0626/g,'\u06CC').replace(/\u0624/g,'\u0648'); }
/** شباهت دو متن (Dice روی جفت‌حرف‌ها، ۰ تا ۱) */
function kDice(a,b){ if(a===b) return 1; if(a.length<2||b.length<2) return 0;
  const m=new Map(); for(let k=0;k<a.length-1;k++){ const g=a.substr(k,2); m.set(g,(m.get(g)||0)+1); }
  let n=0; for(let k=0;k<b.length-1;k++){ const g=b.substr(k,2), c=m.get(g); if(c){ n++; m.set(g,c-1); } }
  return 2*n/(a.length+b.length-2); }""")
rep("  const hit=ITEMS.find(o=>norm(o.d)===norm(raw));","  const hit=ITEMS.find(o=>sq(o.d)===sq(raw));")
rep("""  const prior=hist.filter(x=>norm(x.item)===norm(inf.d)).sort((a,b)=>b.date.localeCompare(a.date));
  const now=rows.filter(r=>norm(r.item)===norm(inf.d));""","""  const prior=hist.filter(x=>sq(x.item)===sq(inf.d)).sort((a,b)=>b.date.localeCompare(a.date));
  const now=rows.filter((r,k)=>k!==editIdx && sq(r.item)===sq(inf.d));""")
rep('<div class="dup" id="vDup"></div>','<div class="dup" id="vDup"></div>\n      <div class="ksim" id="vSim" aria-live="polite"></div>')
# جعبه جستجو
rep('  <div class="slips" id="slips"></div>','''  <div class="ksrch"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>
    <input id="kQ" type="search" autocomplete="off" placeholder="جستجو در همه درخواست‌ها: کالا، دستگاه، شرح…" aria-label="جستجو در درخواست‌ها">
  </div>
  <div class="slips" id="slips"></div>''')
rep("""    if(kFlt){ rows.forEach((r,i)=>{ if(kWarn(r).indexOf(kFlt)>-1) kVis.push([r,i]); }); }""",
"""    if(kQ){ rows.forEach((r,i)=>{ if(kHit(r)) kVis.push([r,i]); }); }
    else if(kFlt){ rows.forEach((r,i)=>{ if(kWarn(r).indexOf(kFlt)>-1) kVis.push([r,i]); }); }""")
rep("""    if(kFlt){
      const KT={d1:'بدون سند مصرف',d2:'بدون سند خرید',code:'منتظر کد'}; let last=null, h='';""","""    if(kFlt||kQ){
      const KT={d1:'بدون سند مصرف',d2:'بدون سند خرید',code:'منتظر کد'}; let last=null, h='';""")
rep("""<div class="kfbar" role="status"><b>فقط «${KT[kFlt]}»: ${fa(kVis.length)} ردیف</b>""",
    """<div class="kfbar${kQ?' kq':''}" role="status"><b>${kQ?`جستجوی «${esc(kQ)}»`:`فقط «${KT[kFlt]}»`}: ${fa(kVis.length)} ردیف</b>""")
rep("""  const off=document.getElementById('kfOff'); if(off) off.addEventListener('click',()=>{ kFlt=''; rowOpen=null; render(); });""",
    """  const off=document.getElementById('kfOff'); if(off) off.addEventListener('click',()=>{ kFlt=''; kQ=''; const q=document.getElementById('kQ'); if(q) q.value=''; rowOpen=null; render(); });""")
rep("let kFlt='';","""let kFlt='', kQ='';
/** ردیف با همه کلمه‌های جستجو جور است؟ (بدون فاصله مقایسه می‌شود) */
function kHit(r){ const toks=norm(kQ).split(' ').map(sq).filter(Boolean); if(!toks.length) return true;
  const h=sq([r.item,r.unit,r.desc,r.note,r.d1,r.d2,r.date,r.buy,r.req].join(' '));
  return toks.every(x=>h.indexOf(x)>-1); }""")

JS=r"""
/* ---------- جستجو + پیشنهاد کالای شبیه ---------- */
{ const q=$('kQ'); let tm=0;
  q.addEventListener('input',()=>{ clearTimeout(tm); tm=setTimeout(()=>{ kQ=q.value.trim(); if(kQ) kFlt=''; rowOpen=null; render(); },200); });
  q.addEventListener('keydown',e=>{ if(e.key==='Escape'){ q.value=''; kQ=''; render(); } }); }
function kSimList(raw){
  const a=sq(raw); if(a.length<3) return [];
  const seen=new Map(), add=(name,cat)=>{ name=String(name||'').trim(); if(!name) return; const k=sq(name); if(!k||seen.has(k)) return; seen.set(k,{name,cat,k}); };
  ITEMS.forEach(o=>add(o.d,true)); rows.forEach(r=>add(r.item,false)); (hist||[]).forEach(x=>add(x.item,false));
  const out=[];
  seen.forEach(o=>{ if(o.name===raw) return;
    let s=o.k===a?1:kDice(a,o.k);
    if(s<0.72 && a.length>=6 && (o.k.indexOf(a)>-1||a.indexOf(o.k)>-1) && Math.min(a.length,o.k.length)/Math.max(a.length,o.k.length)>0.6) s=0.72;
    if(s>=0.72) out.push({...o,s}); });
  return out.sort((x,y)=>y.s-x.s||(y.cat-x.cat)).slice(0,4);
}
function showSim(){
  const box=$('vSim'); if(!box) return;
  const inf=itemInfo();
  if(!inf || !inf.isNew){ box.className='ksim'; box.innerHTML=''; return; }
  const L=kSimList($('fItem').value.trim());
  if(!L.length){ box.className='ksim'; box.innerHTML=''; return; }
  box.className='ksim show';
  box.innerHTML='<b>شبیه این است؟</b> اگر همان است، بزنید تا دوباره «کالای تازه» ثبت نشود:'
    +`<div class="ksl">${L.map((o,k)=>`<button type="button" data-k="${k}">${esc(o.name)}<small>${o.cat?'کاتالوگ':'قبلاً درخواست شده'}</small></button>`).join('')}</div>`;
  box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    const o=L[+b.dataset.k]; if(!o) return;
    const hit=ITEMS.find(x=>sq(x.d)===o.k);
    cItem.force(hit?{...hit,label:hit.d}:null); $('fItem').value=hit?hit.d:o.name;
    try{ showStock(); }catch(e){} try{ showDup(); }catch(e){} showSim(); say('«'+(hit?hit.d:o.name)+'» انتخاب شد');
  }));
}
{ let tm=0; $('fItem').addEventListener('input',()=>{ clearTimeout(tm); tm=setTimeout(()=>{ try{ showSim(); }catch(e){} },250); });
  $('fItem').addEventListener('change',()=>{ try{ showSim(); }catch(e){} }); }
{ const _sd=showDup; showDup=function(){ _sd.apply(this,arguments); try{ showSim(); }catch(e){} }; }
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""
.ksrch{position:relative;margin:12px 0 4px}
.ksrch svg{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#51606E;pointer-events:none}
.ksrch input{width:100%;box-sizing:border-box;min-height:46px;border:1px solid #C3CDD5;border-radius:12px;padding:0 40px 0 12px;font:inherit;font-size:.95rem;background:#fff;color:#17212B}
.ksrch input:focus{outline:2px solid #0B5C7A;outline-offset:1px;border-color:#0B5C7A}
.kfbar.kq{background:#E6F0F7;border-color:#7FA9C9;color:#0B3F5C}
.kfbar.kq button{border-color:#0B5C7A;color:#0B3F5C}
.ksim{display:none}
.ksim.show{display:block;margin-top:8px;padding:10px 12px;border-radius:12px;background:#FFF6E0;border:1px solid #E0B45E;color:#5C3300;font-size:.88rem;line-height:1.7}
.ksim .ksl{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.ksim .ksl button{min-height:44px;border-radius:10px;border:1px solid #B07A1E;background:#fff;color:#3D2600;font:inherit;font-size:.88rem;font-weight:700;padding:4px 12px;cursor:pointer;text-align:right;display:flex;flex-direction:column;align-items:flex-start}
.ksim .ksl small{font-weight:400;font-size:.72rem;color:#7A5A20}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('kh search')
