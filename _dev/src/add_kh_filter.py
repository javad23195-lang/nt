# درخواست خرید: دکمه‌های «بدون سند مصرف/خرید/منتظر کد» فیلتر واقعی شوند (همه روزها، فقط همان ردیف‌ها)
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
rep("""    const kDay=kSel(), kVis=[];
    rows.forEach((r,i)=>{ if(r.date===kDay) kVis.push([r,i]); });
    box.innerHTML=`<div id="kTop">${kTopHTML()}</div>`
      + (kVis.length""","""    const kDay=kSel(), kVis=[];
    if(kFlt){ rows.forEach((r,i)=>{ if(kWarn(r).indexOf(kFlt)>-1) kVis.push([r,i]); }); }
    else rows.forEach((r,i)=>{ if(r.date===kDay) kVis.push([r,i]); });
    if(kFlt){
      const KT={d1:'بدون سند مصرف',d2:'بدون سند خرید',code:'منتظر کد'}; let last=null, h='';
      kVis.forEach(([r,i])=>{ const dd=String(r.date||''); if(dd!==last){ last=dd; h+=`<div class="gsec"><span class="gt">${esc(kDayText(dd)||'بدون تاریخ')}</span></div>`; } h+=krow(r,i); });
      box.innerHTML=`<div id="kTop">${kTopHTML()}</div><div class="kfbar" role="status"><b>فقط «${KT[kFlt]}»: ${fa(kVis.length)} ردیف</b><button type="button" id="kfOff">نمایش همه</button></div>`
        + (kVis.length?h:'<div class="empty">ردیفی نمانده است.</div>') + '<div id="kBarBox"></div>';
    } else
    box.innerHTML=`<div id="kTop">${kTopHTML()}</div>`
      + (kVis.length""")
rep("""  t.querySelectorAll('.kflags button').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.f, cur=kSel();
    const days=[...new Set(rows.filter(r=>kWarn(r).indexOf(k)>-1).map(r=>r.date||'').filter(x=>normDate(x)))].sort();
    if(!days.length) return;
    rowOpen=null; kPick(days.find(d=>d>cur)||days[0]);
  }));""","""  t.querySelectorAll('.kflags button').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.f; kFlt=(kFlt===k)?'':k; rowOpen=null; render();
    try{ const bar=document.querySelector('.kfbar')||document.getElementById('kTop'); bar.scrollIntoView({block:'start'}); }catch(e){}
  }));
  const off=document.getElementById('kfOff'); if(off) off.addEventListener('click',()=>{ kFlt=''; rowOpen=null; render(); });""")
rep("""  const flags=FL.length?`<div class="kflags">${FL.map(x=>`<button type="button" data-f="${x[0]}">""","""  const flags=FL.length?`<div class="kflags">${FL.map(x=>`<button type="button" data-f="${x[0]}" aria-pressed="${kFlt===x[0]}" class="${kFlt===x[0]?'on':''}">""")
rep("function kWarn(r){","let kFlt='';   // فیلتر فعال: '' یا d1/d2/code\nfunction kWarn(r){")
CSSK=""".kflags button.on{background:#7A4300!important;color:#fff!important;border-color:#7A4300!important}
.kfbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0;padding:10px 12px;border-radius:12px;background:#FFF1DB;border:1px solid #E0A75E;color:#5C3300}
.kfbar button{min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #7A4300;background:#fff;color:#5C3300;font:inherit;font-weight:800}
</style>"""
k=t.find("</style>"); t=t[:k]+CSSK+t[k+len("</style>"):]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('kh filter')
