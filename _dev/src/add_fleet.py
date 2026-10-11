# کارت «ناوگان» در زبانه «امروز»: وضعیت ۸ دستگاه اصلی از فرم توقف شیفت (فقط می‌خواند)
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
h=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:60],h.count(a)); h=h.replace(a,b)

CSS=r"""
/* ---------- ناوگان ---------- */
.fl h2{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.fl h2 small{font-size:.74rem;font-weight:400;color:#51606E}
.flsum{display:flex;gap:8px;margin:2px 0 10px}
.flsum .k{flex:1;background:#fff;border:1px solid #DDE3E9;border-radius:14px;padding:8px 6px;text-align:center}
.flsum .k b{display:block;font-size:1.45rem;line-height:1.25;font-variant-numeric:tabular-nums}
.flsum .k span{font-size:.72rem;color:#51606E}
.flsum .bad b{color:#B3261E}.flsum .wa b{color:#9A5B00}.flsum .ok b{color:#1E7F4F}
.flg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.fld{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-height:104px;padding:10px 12px;text-align:start;font:inherit;color:#17212B;
  background:#fff;border:1px solid #DDE3E9;border-radius:14px;box-shadow:inset -5px 0 0 var(--c);cursor:pointer;-webkit-tap-highlight-color:transparent}
.fld:focus-visible{outline:3px solid #1B2430;outline-offset:2px}
.fld .cp{font-size:.7rem;color:#51606E;line-height:1.2}
.fld .md{font-size:1.02rem;font-weight:800;line-height:1.25;overflow-wrap:anywhere}
.fld .ch{display:inline-flex;align-items:center;gap:4px;margin-top:3px;padding:3px 9px;border-radius:20px;font-size:.72rem;font-weight:800;background:var(--cb);color:var(--c)}
.fld .ch svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.fld .sb{font-size:.7rem;color:#51606E;line-height:1.5;margin-top:2px}
.fld .tk{font-size:.7rem;color:#9A5B00;font-weight:700}
.fl-off{--c:#51606E;--cb:#E9EDF1}.flsum .off b{color:#51606E}
.fl-bad{--c:#B3261E;--cb:#FBE5E2}.fl-wa{--c:#9A5B00;--cb:#FFF1D6}.fl-svc{--c:#1F5F99;--cb:#E2EEFA}.fl-ok{--c:#1E7F4F;--cb:#E3F4EA}
.flnote{margin:8px 2px 0;font-size:.7rem;color:#51606E}
"""
k=h.find("</style>"); assert k>0; h=h[:k]+CSS+h[k:]

HTML="""  <div class="card fl" id="flCard" hidden>
    <h2 style="color:#1B2430">ناوگان <small id="flSub"></small></h2>
    <div class="flsum" id="flSum"></div>
    <div class="flg" id="flGrid"></div>
    <p class="flnote">بر اساس توقف‌هایی که در «توقف شیفت» ثبت شده است.</p>
  </div>

"""
rep('  <div id="alBox" aria-live="polite"></div>\n',HTML+'  <div id="alBox" aria-live="polite"></div>\n')

JS=r"""
/* ============ ناوگان: وضعیت دستگاه‌های اصلی (فقط می‌خواند) ============ */
const FL_I={
  bad:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M9 12h6"/>',
  wa:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  svc:'<path d="M14 7a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 00-2-2z"/>',
  off:'<path d="M20 14a8 8 0 11-10-10 7 7 0 0010 10z"/>',
  ok:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'};
const flLat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
const flKey=s=>flLat(s).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s\-_]+/g,'').toLowerCase();
const flDay=s=>{ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/.exec(flLat(s).trim()); return m?`${m[1]}/${String(+m[2]).padStart(2,'0')}/${String(+m[3]).padStart(2,'0')}`:''; };
const flMin=t=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(String(t||'')); return m?(+m[1])*60+(+m[2]):null; };
const flJ=dt=>{ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(dt); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; }catch(e){ return ''; } };
const flLS=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null')||{}; }catch(e){ return {}; } };
const flHM=m=>{ m=Math.max(0,Math.round(m)); return fa(Math.floor(m/60))+':'+fa(String(m%60).padStart(2,'0')); };

/** تاریخ شمسی «۱۴۰۵/۰۷/۱۶» → [سال، ماه، روز] میلادی */
function flJ2G(dy){ const m=/^(\d{4})\/(\d{2})\/(\d{2})$/.exec(dy); if(!m) return null;
  let jy=+m[1]-979, jm=+m[2]-1, jd=+m[3]-1;
  let n=365*jy+Math.floor(jy/33)*8+Math.floor(((jy%33)+3)/4); for(let i=0;i<jm;i++) n+=i<6?31:30; n+=jd;
  let g=n+79, gy=1600+400*Math.floor(g/146097); g%=146097; let leap=true;
  if(g>=36525){ g--; gy+=100*Math.floor(g/36524); g%=36524; if(g>=365) g++; else leap=false; }
  gy+=4*Math.floor(g/1461); g%=1461; if(g>=366){ leap=false; g--; gy+=Math.floor(g/365); g%=365; }
  const ml=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31]; let gm=0; while(gm<12 && g>=ml[gm]){ g-=ml[gm]; gm++; }
  return [gy,gm+1,g+1]; }
/** چند دقیقه از شروع توقف گذشته (null = ساعت شروع معلوم نیست) */
function flSince(dy,from,now){ const f=flMin(from), g=flJ2G(dy); if(f===null||!g) return null;
  const ms=now.getTime()-new Date(g[0],g[1]-1,g[2],Math.floor(f/60),f%60).getTime(); return ms<0?0:Math.floor(ms/60000); }
const flDur=m=>{ if(m<1440) return flHM(m)+' ساعت'; const d=Math.floor(m/1440), h=Math.floor((m%1440)/60); return fa(d)+' روز'+(h?' و '+fa(h)+' ساعت':''); };
function flParts(n){ const w=String(n).split(' '); let i=w.findIndex(x=>/[A-Za-z0-9]/.test(x)); if(i<1) return {cp:'',md:String(n)}; return {cp:w.slice(0,i).join(' '),md:w.slice(i).join(' ')}; }
function flCan(){ try{ return !parent.ntSync || parent.ntSync.canSee('توقف شیفت'); }catch(e){ return true; } }
function flBuild(){
  const S=parent.ntStops; if(!S || !S.TRACKED) return null;
  const now=new Date();
  const tv=flLS('nt_tavaqof_v1'), pg=flLS('nt_prog_v1');
  const open={}, ow={};                                  // هر توقف باز (تا وقتی بسته نشده، باز می‌ماند)؛ ow = اضافه‌کار در جریان
  const H=S.HOURS||{from:0,to:1440}, nmin=now.getHours()*60+now.getMinutes(), inH=nmin>=H.from && nmin<H.to;
  Object.keys(tv).forEach(k=>{ const dy=flDay(k.split('|')[0]); if(!dy) return;
    if(k.split('|')[1]==='اضافه'){ ((tv[k]&&tv[k].work)||[]).forEach(w=>{ if(w&&w.dev&&!w.to) ow[flKey(w.dev)]=w.from||''; }); return; }
    ((tv[k]&&tv[k].stops)||[]).forEach(x=>{ if(!x||!x.dev||x.to) return; const dk=flKey(x.dev), el=flSince(dy,x.from,now);
      const o=open[dk]; if(!o || (el!==null && (o.el===null || el<o.el))) open[dk]={cause:x.cause||'نامشخص',el}; }); });
  const closed={}; try{ S.list(K,K,{prog:false}).forEach(r=>{ if(r.min!==null && r.min>0){ const dk=flKey(r.dev); closed[dk]=(closed[dk]||0)+r.min; } }); }catch(e){}
  const pk=Object.keys(pg).find(k=>flDay(k)===K), tasks=((pk&&pg[pk]&&pg[pk].tasks)||[]).filter(t=>t&&t.dev&&!t.done);
  const rank={bad:0,wa:1,svc:1,ok:2,off:3};
  const list=S.TRACKED.map((n,idx)=>{ const dk=flKey(n), o=open[dk], pt=tasks.filter(t=>flKey(t.dev)===dk).length;
    let st=(inH||ow[dk]!==undefined)?'ok':'off'; if(o){ const c=S.clsOf(o.cause); st=c==='em'?'bad':c==='pm'?'svc':'wa'; }
    return {n,dk,st,o,pt,cm:closed[dk]||0,idx,ow:ow[dk]}; });
  list.sort((a,b)=>rank[a.st]-rank[b.st]||a.idx-b.idx);
  return {list,pend:tasks.length};
}
function flRender(){
  const box=$('flCard'); if(!box) return;
  if(!flCan()){ box.hidden=true; return; }
  const D=flBuild(); if(!D){ box.hidden=true; return; }
  box.hidden=false;
  const nb=D.list.filter(x=>x.st==='bad').length, nw=D.list.filter(x=>x.st==='wa'||x.st==='svc').length, no=D.list.filter(x=>x.st==='ok').length, nf=D.list.filter(x=>x.st==='off').length;
  $('flSub').textContent=fa(D.list.length)+' دستگاه اصلی';
  $('flSum').innerHTML=`<div class="k bad"><b>${fa(nb)}</b><span>خراب</span></div><div class="k wa"><b>${fa(nw)}</b><span>منتظر یا سرویس</span></div><div class="k ok"><b>${fa(no)}</b><span>در کار</span></div>${nf?`<div class="k off"><b>${fa(nf)}</b><span>پایان کار</span></div>`:''}`;
  const W={bad:'خراب',wa:'منتظر',svc:'در سرویس',ok:'در کار',off:'پایان کار'};
  $('flGrid').innerHTML=D.list.map(x=>{ const p=flParts(x.n);
    const sb=x.o?`${esc(x.o.cause)}${x.o.el!==null?' · '+flDur(x.o.el):''}`:(x.st==='off'?'خارج از ساعت کاری':(x.ow!==undefined?'اضافه‌کار از '+fa(x.ow):(x.cm>0?'توقف امروز: '+flHM(x.cm)+' ساعت':'امروز بدون توقف')));
    return `<button type="button" class="fld fl-${x.st}" data-dev="${esc(x.n)}" aria-label="${esc(x.n)}: ${W[x.st]}">
      <span class="cp">${esc(p.cp)}</span><span class="md">${esc(p.md)}</span>
      <span class="ch"><svg viewBox="0 0 24 24" aria-hidden="true">${FL_I[x.st]}</svg>${W[x.st]}</span>
      <span class="sb">${sb}</span>${x.o&&x.o.el!==null&&x.o.el>=2880?'<span class="tk">اگر تمام شده، پایان را ثبت کنید</span>':''}${x.pt?`<span class="tk">${fa(x.pt)} کار مانده</span>`:''}</button>`; }).join('');
  box.querySelectorAll('.fld').forEach(b=>b.addEventListener('click',()=>{
    try{ const dv=(parent.ntQr&&parent.ntQr.DEVS||[]).find(d=>flKey(d.name)===flKey(b.dataset.dev));
      if(dv) parent.postMessage({nt:'qrdev',id:dv.id},'*'); else parent.postMessage({nt:'go',tab:'توقف شیفت'},'*'); }catch(e){} }));
}
setInterval(()=>{ try{ flRender(); }catch(e){} },20000);
"""
rep("function refreshLive(){ try{ head(); }catch(e){}", JS+"function refreshLive(){ try{ head(); }catch(e){} try{ flRender(); }catch(e){}")
rep("  try{ tilesRender(); }catch(e){}\n  try{ bkState(); }catch(e){}","  try{ tilesRender(); }catch(e){}\n  try{ flRender(); }catch(e){}\n  try{ bkState(); }catch(e){}")

d['b64']=base64.b64encode(h.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('fleet card added')
