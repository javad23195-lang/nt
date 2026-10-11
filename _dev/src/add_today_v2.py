# طراحی تازه «امروز»: نیاز به توجه (فقط استثناها)، ناوگان آرام، دو ستون در کامپیوتر
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:60],t.count(a)); t=t.replace(a,b)
CSS=r"""
/* ---------- طراحی ۲: وضعیت عادی ساکت، فقط استثنا رنگی ---------- */
#hSum{display:none}
header h1{font-size:1.2rem}header h1 span{display:none}
.at h2{display:flex;align-items:center;gap:8px}
.atn{min-width:24px;height:24px;border-radius:12px;background:#1B2430;color:#fff;font-size:.78rem;display:inline-grid;place-items:center;padding:0 7px;font-weight:800}
.atn.z{background:#1E7F4F}
.atl{margin:8px -14px -14px;border-top:1px solid #EEF1F4}
.ar{display:flex;align-items:center;gap:12px;width:100%;min-height:62px;padding:9px 14px;background:transparent;border:0;border-bottom:1px solid #EEF1F4;text-align:start;font:inherit;color:#17212B;cursor:pointer}
.ar:last-child{border-bottom:0;border-radius:0 0 12px 12px}
.ar:hover{background:#F8FAFB}
.ar:focus-visible{outline:3px solid #1B2430;outline-offset:-3px}
.ar .ico{flex:none;width:36px;height:36px;border-radius:10px;display:grid;place-items:center}
.ar .ico svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ar.r .ico{background:#FBE5E2;color:#B3261E}.ar.w .ico{background:#FFF1D6;color:#8A5300}.ar.i .ico{background:#E2EEFA;color:#1F5F99}
.ar .tx{flex:1;min-width:0}.ar .tx b{display:block;font-size:.95rem;line-height:1.45;overflow-wrap:anywhere}.ar .tx span{display:block;font-size:.8rem;color:#51606E;overflow-wrap:anywhere}
.ar .tag{flex:none;font-size:.76rem;font-weight:800;padding:2px 10px;border-radius:12px;white-space:nowrap}
.ar.r .tag{background:#FBE5E2;color:#B3261E}.ar.w .tag{background:#FFF1D6;color:#8A5300}
.ar .go{flex:none;color:#51606E;font-size:1.2rem}
.atz{padding:18px 14px;text-align:center;color:#1E7F4F;font-weight:700}
.atm{padding:8px 14px;font-size:.8rem;color:#51606E;border-top:1px solid #EEF1F4}
/* ناوگان */
.flsum{display:none}
.flbar{display:flex;gap:4px;margin:2px 0 10px}.flbar i{flex:1;height:10px;border-radius:3px;background:#C9D1D9}
.flbar i.b-bad{background:#B3261E}.flbar i.b-wa,.flbar i.b-svc{background:#C98A1B}.flbar i.b-off{background:#E3E8ED}
.fl-ok{--c:#51606E;--cb:#EEF1F4}.fl-off{--c:#7B8793;--cb:#EEF1F4}
.fld{min-height:0;padding:9px 12px}
.fld.fl-ok,.fld.fl-off{box-shadow:none}
.fld .nmb{display:flex;flex-direction:column}
.flnote{display:none}
@media (min-width:960px){
  .wrap{max-width:1240px;display:grid;grid-template-columns:400px minmax(0,1fr);gap:0 20px;align-items:start}
  .wrap>*{grid-column:1/-1}
  #atCard{grid-column:1;grid-row:2/span 2}
  #flCard{grid-column:2;grid-row:2}
  #tlCard{grid-column:2;grid-row:3}
  .flg{grid-template-columns:1fr;gap:0}
  .fld{display:grid;grid-template-columns:minmax(0,1.3fr) 104px minmax(0,1.6fr);align-items:center;gap:10px;min-height:50px;border:0;border-bottom:1px solid #EEF1F4;border-radius:0;padding:8px 6px}
  .fld .ch{margin:0;justify-self:start}.fld .tk{grid-column:1/-1}
  .fld:last-child{border-bottom:0}
}
"""
k=t.find("</style>"); assert k>0; t=t[:k]+CSS+t[k:]
rep('<h1><span>▣</span> کارهای امروز</h1>','<h1><span>▣</span> امروز</h1>')
rep('  <div class="card fl" id="flCard" hidden>','''  <div class="card at" id="atCard" hidden>
    <h2 style="color:#1B2430">نیاز به توجه <span class="atn" id="atN"></span></h2>
    <div class="atl" id="atList"></div>
  </div>

  <div class="card fl" id="flCard" hidden>''')
JS=r"""
/* ============ نیاز به توجه: فقط استثناها (دستگاه خراب، دیرکرد فاکتور، کار معوق، پشتیبان) ============ */
const AT_I={r:FL_I.bad,w:FL_I.wa,i:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'};
let AT_CH=[];
function atRows(){
  const R=[]; let D=null; try{ if(flCan()) D=flBuild(); }catch(e){}
  if(D){
    D.list.filter(x=>x.st==='bad').forEach(x=>R.push({c:'r',t:x.n+' خراب است',s:(x.o&&x.o.cause)||'',tag:(x.o&&x.o.el!==null)?flDur(x.o.el):'',dev:x.n}));
    D.list.filter(x=>x.st==='wa'||x.st==='svc').forEach(x=>R.push({c:'w',t:x.n+(x.st==='svc'?' در سرویس':' منتظر است'),s:(x.o&&x.o.cause)||'',tag:(x.o&&x.o.el!==null)?flDur(x.o.el):'',dev:x.n}));
  }
  try{ osRows().forEach(r=>R.push(r)); }catch(e){}
  AT_CH=[];
  try{ autoItems().filter(x=>x.lv==='hot'||x.lv==='warn').forEach(x=>{
    if(x.lv==='warn' && x.go!=='برنامه روزانه'){ if(AT_CH.indexOf(x.go)<0) AT_CH.push(x.go); return; }
    R.push({c:'w',t:x.t,s:x.s,go:x.go}); }); }catch(e){}
  try{ const b=bkAge(); if(b===null||b>7) R.push({c:'i',t:b===null?'پشتیبان ندارید':'آخرین پشتیبان '+fa(b)+' روز پیش',s:'یک نسخه پشتیبان بگیرید',bk:1}); }catch(e){}
  return R;
}
function atRender(){
  const box=$('atCard'); if(!box) return; const R=atRows(), MAX=7; box.hidden=false;
  const n=$('atN'); n.textContent=R.length?fa(R.length):'✓'; n.classList.toggle('z',!R.length);
  $('atList').innerHTML=R.length?R.slice(0,MAX).map((r,i)=>`<button type="button" class="ar ${r.c}" data-i="${i}"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${AT_I[r.c]}</svg></span><span class="tx"><b>${esc(r.t)}</b>${r.s?`<span>${esc(r.s)}</span>`:''}</span>${r.tag?`<span class="tag">${esc(r.tag)}</span>`:'<span class="go" aria-hidden="true">‹</span>'}</button>`).join('')+(R.length>MAX?`<div class="atm">و ${fa(R.length-MAX)} مورد دیگر در بخش‌های پایین</div>`:''):'<div class="atz">✓ چیزی نیاز به توجه ندارد</div>'
  if(AT_CH.length) $('atList').insertAdjacentHTML('beforeend','<div class="atm">لیست آماده انتقال به اکسل: '+AT_CH.map(esc).join('، ')+'</div>');
  $('atList').querySelectorAll('.ar').forEach(b=>b.addEventListener('click',()=>{ const r=R[+b.dataset.i]; try{
    if(r.dev){ const dv=(parent.ntQr&&parent.ntQr.DEVS||[]).find(d=>flKey(d.name)===flKey(r.dev)); if(dv) parent.postMessage({nt:'qrdev',id:dv.id},'*'); else parent.postMessage({nt:'go',tab:'توقف شیفت'},'*'); }
    else if(r.go) parent.postMessage({nt:'go',tab:r.go},'*');
    else if(r.bk){ const e=$('bkCard'); if(e) e.scrollIntoView({behavior:'smooth',block:'center'}); } }catch(e){} }));
}
setInterval(()=>{ try{ atRender(); }catch(e){} },20000);
"""
rep("function refreshLive(){ try{ head(); }catch(e){}", JS+"function refreshLive(){ try{ head(); }catch(e){} try{ atRender(); }catch(e){}")
rep("  try{ flRender(); }catch(e){}\n  try{ osRender(); }catch(e){}","  try{ flRender(); }catch(e){}\n  try{ atRender(); }catch(e){}\n  try{ osRender(); }catch(e){}")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('today v2')
