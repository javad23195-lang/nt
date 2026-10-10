/* ============ نوار پایین و دکمه «+» (گوشی) ============
   فقط ظاهر و رفتن بین زبانه‌ها. هیچ اطلاعاتی نمی‌خواند و نمی‌نویسد.
   زبانه‌های قبلی در همان جا هستند (دسترسی، شمارنده، قفل ورود و حالت راننده همان قبل کار می‌کنند).
   روی صفحه بزرگ (≥۹۰۰) همان زبانه‌های بالا می‌ماند. */
(function(){
'use strict';
if(typeof DOCS==='undefined' || typeof tabs==='undefined' || typeof frames==='undefined') return;
const $=id=>document.getElementById(id);
const idx=n=>DOCS.findIndex(d=>d.name===n);
const vis=n=>{ const i=idx(n); return i>-1 && tabs[i] && !tabs[i].hidden; };
const canW=n=>{ try{ return !window.ntSync || window.ntSync.canWriteTab(n); }catch(e){ return true; } };
const ICON={
  today:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M8 15l3 3 5-5"/>',
  plan:'<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  box:'<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>',
  more:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  stop:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M9 12h6"/>',
  warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  read:'<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM9 9h6M9 13h6"/>',
  doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
  wr:'<path d="M14 7a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 00-2-2z"/>',
  cart:'<path d="M3 4h2l2.4 11h10.2L20 7H6.2M9 20h.01M17 20h.01"/>',
  id:'<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2 3-2s2.4.4 3 2M14 10h4M14 14h4"/>'
};
const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]||ICON.doc}</svg>`;
const TABICON={'امروز':'today','برنامه روزانه':'plan','انبار':'box','دفترچه قرائت':'read','ثبت مشکلات':'warn','شناسنامه':'id','خدمات':'wr','درخواست خرید':'cart','توقف شیفت':'stop'};
const MAIN=['امروز','برنامه روزانه','انبار'];
/* کارهای دکمه «+»: [نام زبانه، دکمه افزودن داخل آن، عنوان، توضیح، آیکون، رنگ] */
const ACTS=[
  ['توقف شیفت','bNew','ثبت توقف','دستگاه ایستاد','stop','y'],
  ['ثبت مشکلات','xNew','ثبت مشکل','خرابی یا ایراد','warn','r'],
  ['انبار','oNew','خروج انبار','قطعه یا روغن','box','b'],
  ['دفترچه قرائت','mNew','قرائت دفترچه','ساعت کار','read','g']
];

const CSS=`
#ntNav,#ntFab,#ntNavBd,#ntNavSh{display:none}
@media (max-width:899px){
body.ntnav .tabs{display:none}
body.ntnav .topbar{background:#1B2430;border-bottom:3px solid #E6A52E;padding:10px 12px 10px;padding-top:calc(10px + env(safe-area-inset-top));
  display:flex;flex-wrap:wrap;align-items:center;gap:8px}
body.ntnav .brand{display:flex;order:1;flex:1;min-width:0;padding:0;color:#fff}
body.ntnav .brand .lg{color:#E6A52E}
body.ntnav .brand .tt{color:#fff;font-size:.95rem;font-weight:800}
body.ntnav .brand .dt{display:block;color:#AEB9C5;font-size:.74rem;font-weight:400;margin-top:2px}
body.ntnav .tabrow{order:2;flex:none;display:flex;gap:8px;align-items:center}
body.ntnav .sybar,body.ntnav .ntpwa{order:3;flex-basis:100%}
body.ntnav .topbar button:not(.tab){background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:14px}
body.ntnav .topbar button:not(.tab) svg{stroke:#fff}
body.ntnav:not(.ntlocked):not(.ntdriver) #ntNav{display:flex}
body.ntnav:not(.ntlocked):not(.ntdriver) #ntFab.has{display:grid}
#ntNav{flex:none;position:relative;justify-content:space-around;align-items:flex-start;height:calc(70px + env(safe-area-inset-bottom));
  padding:8px 4px env(safe-area-inset-bottom);background:#fff;border-top:1px solid #DDE3E9;box-shadow:0 -4px 14px rgba(27,36,48,.07);z-index:40}
.ntnb{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;width:64px;min-height:52px;padding:2px 0 0;
  background:none;border:0;font:inherit;font-size:.7rem;font-weight:700;color:#5B6874;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ntnb svg,.ntfab svg,.ntac .ic svg,.ntmr svg{stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ntnb svg{width:26px;height:26px}
.ntnb.on{color:#1B2430}
.ntnb.on::before{content:"";position:absolute;top:-8px;width:36px;height:4px;border-radius:0 0 4px 4px;background:#E6A52E}
.ntnb .b{position:absolute;top:-4px;inset-inline-end:4px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#C0392B;color:#fff;font-size:.62rem;font-weight:800;display:none;align-items:center;justify-content:center;border:2px solid #fff;box-sizing:content-box}
.ntnb .b.show{display:flex}
.ntnb:focus-visible,.ntfab:focus-visible,.ntac:focus-visible,.ntmr:focus-visible{outline:3px solid #1B2430;outline-offset:2px}
.ntsp{width:64px;flex:none}
.ntfab{position:fixed;left:50%;bottom:calc(8px + env(safe-area-inset-bottom));transform:translateX(-50%);width:56px;height:56px;border-radius:50%;
  background:#E6A52E;color:#1B2430;border:0;place-items:center;cursor:pointer;z-index:72;box-shadow:0 4px 12px rgba(185,126,16,.45);-webkit-tap-highlight-color:transparent}
.ntfab svg{width:30px;height:30px;stroke-width:2.6;transition:transform .18s}
.ntfab.open svg{transform:rotate(45deg)}
#ntNavBd{position:fixed;inset:0;background:rgba(18,25,33,.55);z-index:70}
#ntNavBd.on{display:block}
#ntNavSh{position:fixed;inset-inline:0;bottom:0;background:#fff;border-radius:24px 24px 0 0;padding:10px 16px calc(92px + env(safe-area-inset-bottom));z-index:71;max-height:86vh;overflow:auto}
#ntNavSh.on{display:block}
#ntNavSh .h{width:44px;height:5px;border-radius:3px;background:#CBD3DB;margin:0 auto 12px}
#ntNavSh h3{margin:0 0 10px;font-size:.98rem;color:#17212B}
.ntacts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ntac{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:104px;padding:12px;border-radius:16px;border:1px solid #DDE3E9;background:#F3F5F7;font:inherit;color:#17212B;text-align:start;cursor:pointer}
.ntac .ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#E6A52E;color:#1B2430}
.ntac .ic svg{width:26px;height:26px}
.ntac.r .ic{background:#FBE5E2;color:#B3261E}.ntac.b .ic{background:#E2EEFA;color:#1F5F99}.ntac.g .ic{background:#E3F4EA;color:#1E7F4F}
.ntac b{font-size:.92rem}.ntac span{font-size:.74rem;color:#5B6874}
.ntmore{display:flex;flex-direction:column;gap:8px}
.ntmr{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:14px;border:1px solid #DDE3E9;background:#F3F5F7;font:inherit;font-size:.92rem;font-weight:700;color:#17212B;cursor:pointer;position:relative}
.ntmr svg{width:26px;height:26px;color:#1B2430}
.ntmr .b{margin-inline-start:auto;min-width:22px;height:22px;border-radius:11px;background:#C0392B;color:#fff;font-size:.72rem;display:none;align-items:center;justify-content:center;padding:0 6px}
.ntmr .b.show{display:flex}
@media (prefers-reduced-motion:no-preference){ #ntNavSh.on{animation:ntUp .2s ease-out} @keyframes ntUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}} }
}`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
document.body.classList.add('ntnav');

const nav=document.createElement('nav'); nav.id='ntNav'; nav.setAttribute('aria-label','منوی اصلی');
const fab=document.createElement('button'); fab.id='ntFab'; fab.type='button'; fab.className='ntfab'; fab.setAttribute('aria-label','ثبت تازه'); fab.setAttribute('aria-haspopup','dialog'); fab.innerHTML=svg('plus');
const bd=document.createElement('div'); bd.id='ntNavBd';
const sh=document.createElement('div'); sh.id='ntNavSh'; sh.setAttribute('role','dialog'); sh.setAttribute('aria-modal','true');
document.body.append(nav,bd,sh,fab);

function badgeOf(name){ const i=idx(name); const e=$('badge'+i); return e&&e.classList.contains('show')?String(e.textContent).replace(/[^\d۰-۹٠-٩]/g,''):''; }  /* فقط رقم (امن برای innerHTML) */
function activeName(){ const i=tabs.findIndex(t=>t.classList.contains('on')); return i>-1?DOCS[i].name:''; }
function others(){ return DOCS.map(d=>d.name).filter(n=>MAIN.indexOf(n)<0 && vis(n)); }
function paint(){
  const act=activeName(), main=MAIN.filter(vis), more=others();
  const mk=(n,label,icon,on,badge,extra)=>`<button type="button" class="ntnb${on?' on':''}" data-n="${n}" ${on?'aria-current="page"':''}>${svg(icon)}${label}<span class="b${badge?' show':''}">${badge||''}</span></button>`;
  let h=''; const lab={'امروز':'امروز','برنامه روزانه':'برنامه','انبار':'انبار'};
  const first=main.slice(0,2), last=main.slice(2);
  first.forEach(n=>h+=mk(n,lab[n],TABICON[n],act===n,badgeOf(n)));
  h+='<span class="ntsp" aria-hidden="true"></span>';
  last.forEach(n=>h+=mk(n,lab[n],TABICON[n],act===n,badgeOf(n)));
  if(more.length){ const faN=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]); const mb=more.reduce((s,n)=>s+(+badgeOf(n).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))||0),0);
    h+=`<button type="button" class="ntnb${more.indexOf(act)>-1?' on':''}" data-more="1">${svg('more')}بیشتر<span class="b${mb?' show':''}">${mb?faN(mb):''}</span></button>`; }
  nav.innerHTML=h;
  const canAdd=ACTS.some(a=>vis(a[0]) && canW(a[0]));
  fab.classList.toggle('has',canAdd);
}
let openKind='';
function closeSheet(back){ openKind=''; bd.classList.remove('on'); sh.classList.remove('on'); fab.classList.remove('open'); fab.setAttribute('aria-expanded','false'); if(back!==false){ try{ fab.focus(); }catch(e){} } }
function openSheet(kind){
  openKind=kind; let h='<div class="h"></div>';
  if(kind==='add'){
    h+='<h3>چه چیزی ثبت می‌کنید؟</h3><div class="ntacts">';
    ACTS.filter(a=>vis(a[0]) && canW(a[0])).forEach(a=>{ h+=`<button type="button" class="ntac ${a[5]}" data-n="${a[0]}" data-b="${a[1]}"><span class="ic">${svg(a[4])}</span><b>${a[2]}</b><span>${a[3]}</span></button>`; });
    h+='</div>';
  }else{
    h+='<h3>زبانه‌های دیگر</h3><div class="ntmore">';
    others().forEach(n=>{ const b=badgeOf(n); h+=`<button type="button" class="ntmr" data-n="${n}">${svg(TABICON[n])}${n}<span class="b${b?' show':''}">${b}</span></button>`; });
    h+='</div>';
  }
  sh.innerHTML=h; bd.classList.add('on'); sh.classList.add('on');
  if(kind==='add'){ fab.classList.add('open'); fab.setAttribute('aria-expanded','true'); }
  const f=sh.querySelector('button'); if(f) try{ f.focus(); }catch(e){}
}
/** رفتن به زبانه و (اگر خواسته شد) زدن دکمه افزودن همان زبانه، بعد از بارگذاری */
function go(name,btn){
  const i=idx(name); if(i<0 || tabs[i].hidden) return;
  closeSheet(false); show(i);
  if(!btn) return; let n=0;
  const t=setInterval(()=>{ n++;
    try{ const d=frames[i].contentDocument, b=d && d.getElementById(btn);
      if(b && frames[i].dataset.loaded && d.readyState==='complete'){ clearInterval(t); setTimeout(()=>{ try{ b.click(); }catch(e){} },200); return; } }catch(e){}
    if(n>40) clearInterval(t); },150);
}
nav.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.more){ openKind==='more'?closeSheet():openSheet('more'); return; }
  if(b.dataset.n) go(b.dataset.n); });
fab.addEventListener('click',()=>{ try{ navigator.vibrate&&navigator.vibrate(10); }catch(e){} openKind==='add'?closeSheet():openSheet('add'); });
sh.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b && b.dataset.n) go(b.dataset.n,b.dataset.b); });
bd.addEventListener('click',()=>closeSheet());
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && openKind) closeSheet(); });

let q=0; const sched=()=>{ if(q) return; q=setTimeout(()=>{ q=0; paint(); },30); };
const mo=new MutationObserver(sched);
mo.observe($('tabs'),{subtree:true,childList:true,attributes:true,characterData:true,attributeFilter:['class','hidden']});
mo.observe(document.body,{attributes:true,attributeFilter:['class']});
paint();
window.ntNav={paint,openSheet,closeSheet};
})();
