/* ============ گوشی: سربرگ تازه و منوی ☰ (طرح «Mine Maintenance Mobile») ============
   سربرگ: ☰ | نام زبانه باز + تاریخ | «همگام ۰۷:۲۰» | اسکن | ماه (ظاهر).
   منوی ☰ (کشویی از راست): نشان شرکت و کاربر، همه زبانه‌های دیده‌شدنی با شمارنده، ابزارها (پرونده دستگاه‌ها، اسکن، ظاهر، اطلاعات مشترک، خروج).
   دکمه‌های اصلی (ntDevBtn، ntThBtn، ntExitBtn، ntSyBtn) سر جایشان می‌مانند؛ منو فقط آن‌ها را می‌زند. فقط زیر ۹۰۰ پیکسل. */
(function(){
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(k,s)=>{ try{ return NTI.svg(k,s||22); }catch(e){ return ''; } };
const MOON='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7z" fill="#E6A52E"/></svg>';
const TABICON={'امروز':'today','مدیریت':'mgmt','برنامه روزانه':'plan','انبار':'box','دفترچه قرائت':'read','ثبت مشکلات':'warn','شناسنامه':'id','خدمات':'wr','درخواست خرید':'cart','توقف شیفت':'stop','برون‌سپاری':'out','عکس‌ها':'photo','تردد و اضافه‌کار':'clock'};
const CSS=`
#ntHam,#ntMoon,#ntHT,#ntDrw,#ntDrwBd{display:none}
@media (max-width:899px){
body.ntnav .topbar{flex-wrap:nowrap;gap:6px;padding:8px 10px 10px;padding-top:calc(8px + env(safe-area-inset-top));border-bottom:0;box-shadow:0 2px 10px rgba(0,0,0,.18)}
body.ntnav .topbar:has(.sybar:not([hidden])),body.ntnav .topbar:has(.ntpwa){flex-wrap:wrap}
body.ntnav .brand{gap:8px}
body.ntnav .brand>img,body.ntnav .brand .co,body.ntnav .brand .un{display:none!important}
body.ntnav .brand .tt{display:flex;flex-direction:column;min-width:0}
#ntHT{display:block;color:#fff;font-size:1.15rem;font-weight:800;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.ntnav .brand .dt{margin-top:0!important;color:#AEB9C5!important}
#ntHam{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:12px;border:0!important;background:transparent!important;color:#fff;cursor:pointer;position:relative}
#ntHam svg{width:28px;height:28px;stroke:#fff!important;color:#fff!important}
#ntHam .b{position:absolute;top:2px;inset-inline-start:2px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:#C0392B;color:#fff;font-size:.68rem;font-weight:800;display:none;align-items:center;justify-content:center;border:2px solid #1B2430}
#ntHam .b.show{display:flex}
body.ntnav #ntDevBtn,body.ntnav #ntThBtn,body.ntnav #ntExitBtn{display:none!important}
body.ntnav .tabrow{gap:6px!important}
body.ntnav .topbar #ntQrScan,body.ntnav .topbar #ntMoon{width:44px;height:44px;min-height:0;padding:0;display:grid;place-items:center;border-radius:12px!important}
body.ntnav .topbar #ntQrScan .tx{display:none}
#ntMoon{background:transparent!important;border:0!important;cursor:pointer}
body.ntnav .topbar #ntSyBtn{display:inline-flex;align-items:center;gap:6px;height:36px;min-height:0;padding:0 12px;border-radius:18px!important;background:rgba(255,255,255,.1)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important;font-size:.78rem;font-weight:700;white-space:nowrap}
body.ntnav .topbar #ntSyBtn svg{display:none}
body.ntnav .topbar #ntSyBtn .tx{display:none!important}
body.ntnav .topbar #ntSyBtn .l{display:inline;max-width:76px;overflow:hidden;text-overflow:ellipsis}
#ntSyBtn .l{display:none}
body.ntnav .topbar #ntSyBtn .d{display:inline-block;width:8px;height:8px;border-radius:50%;flex:none}
@media (max-width:370px){ body.ntnav .topbar #ntSyBtn .l{max-width:52px} }
#ntDrwBd{position:fixed;inset:0;background:rgba(18,25,33,.55);z-index:90}
#ntDrw{position:fixed;top:0;bottom:0;right:0;width:min(86vw,340px);background:#fff;z-index:91;overflow-y:auto;box-shadow:-8px 0 24px rgba(0,0,0,.25);
  padding:calc(14px + env(safe-area-inset-top)) 14px calc(20px + env(safe-area-inset-bottom));direction:rtl}
body.ntdrw #ntDrwBd,body.ntdrw #ntDrw{display:block}
@media (prefers-reduced-motion:no-preference){ body.ntdrw #ntDrw{animation:ntDrwIn .2s ease-out} @keyframes ntDrwIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}} }
#ntDrw .dh{display:flex;align-items:center;gap:10px;padding:10px;border-radius:16px;background:#1B2430;color:#fff;margin-bottom:12px}
#ntDrw .dh img{width:44px;height:44px;border-radius:50%;background:#fff;padding:3px;box-sizing:border-box;box-shadow:0 0 0 2px rgba(230,165,46,.6)}
#ntDrw .dh b{display:block;font-size:.95rem}#ntDrw .dh small{display:block;color:#E6A52E;font-size:.74rem}#ntDrw .dh span{display:block;color:#AEB9C5;font-size:.74rem}
#ntDrw .dx{margin-inline-start:auto;width:40px;height:40px;border:0;border-radius:10px;background:rgba(255,255,255,.1);color:#fff;display:grid;place-items:center;cursor:pointer}
#ntDrw .dx svg{width:22px;height:22px;stroke:#fff!important;color:#fff!important}
#ntDrw h4{margin:14px 4px 6px;font-size:.78rem;color:#5B6874;font-weight:800}
#ntDrw .di{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:6px 10px;border:0;border-radius:12px;background:none;font:inherit;font-size:.95rem;font-weight:700;color:#17212B;cursor:pointer;text-align:start}
#ntDrw .di:hover{background:#F3F5F7}
#ntDrw .di.on{background:#FFF4DF;box-shadow:inset -3px 0 0 #E6A52E}
#ntDrw .di svg{width:24px;height:24px;flex:none;color:#1B2430}
#ntDrw .di .b{margin-inline-start:auto;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#C0392B;color:#fff;font-size:.72rem;font-weight:800;display:flex;align-items:center;justify-content:center}
#ntDrw .di .v{margin-inline-start:auto;font-size:.78rem;color:#5B6874;font-weight:700}
#ntDrw .di.x{color:#B3261E}
#ntDrw .di:focus-visible,#ntHam:focus-visible,#ntMoon:focus-visible{outline:3px solid #E6A52E;outline-offset:1px}
}
html.ntdark #ntDrw{background:#1A222B}html.ntdark #ntDrw .di{color:#E8EDF2}html.ntdark #ntDrw .di svg{color:#E8EDF2}html.ntdark #ntDrw .di:hover{background:#24303B}html.ntdark #ntDrw .di.on{background:#3A2F17}
@media print{ #ntHam,#ntMoon,#ntDrw,#ntDrwBd{display:none!important} }
body.ntlocked #ntHam,body.ntlocked #ntMoon,body.ntdriver #ntHam{display:none!important}`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);

const tabsEl=()=>[...document.querySelectorAll('#tabs .tab')];
function activeIdx(){ return tabsEl().findIndex(t=>t.classList.contains('on')); }
const vis=i=>{ const t=tabsEl()[i]; return !!t && !t.hidden; };
const badge=n=>{ try{ return (window.ntNav&&ntNav.badgeOf)?ntNav.badgeOf(n):''; }catch(e){ return ''; } };
const num=v=>+String(v||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))||0;

function build(){
  const brand=document.querySelector('.topbar .brand'), row=document.querySelector('.topbar .tabrow');
  if(!brand || !row) return false;
  if(!$('ntHam')){ const b=document.createElement('button'); b.type='button'; b.id='ntHam'; b.setAttribute('aria-label','منو: همه بخش‌ها و ابزارها'); b.setAttribute('aria-expanded','false'); b.setAttribute('aria-controls','ntDrw');
    b.innerHTML=ic('menu',28)+'<span class="b"></span>'; brand.insertBefore(b,brand.firstChild); b.addEventListener('click',open); }
  const tt=brand.querySelector('.tt');
  if(tt && !$('ntHT')){ const h=document.createElement('span'); h.id='ntHT'; tt.insertBefore(h,tt.firstChild); }
  if(!$('ntMoon')){ const m=document.createElement('button'); m.type='button'; m.id='ntMoon'; m.innerHTML=MOON; m.setAttribute('aria-label','ظاهر (روشن، تیره، آفتاب)');
    m.addEventListener('click',()=>{ const t=$('ntThBtn'); if(t) t.click(); setTimeout(paint,50); }); row.appendChild(m); }
  if(!$('ntDrw')){ const bd=document.createElement('div'); bd.id='ntDrwBd'; bd.addEventListener('click',close); document.body.appendChild(bd);
    const d=document.createElement('aside'); d.id='ntDrw'; d.setAttribute('aria-label','منو'); d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); document.body.appendChild(d);
    d.addEventListener('click',onDrw); }
  return true;
}
function paint(){
  if(!build()) return;
  const i=activeIdx(), name=i>-1&&DOCS[i]?DOCS[i].name:'';
  const h=$('ntHT'); if(h && h.textContent!==name) h.textContent=name;
  /* قرص همگام: فقط ساعت آخرین همگام‌سازی (کوتاه، تا نام زبانه جا شود) */
  const sb=$('ntSyBtn'); if(sb){ const tx=sb.querySelector('.tx'); let l=sb.querySelector('.l'); if(!l){ l=document.createElement('span'); l.className='l'; sb.appendChild(l); }
    const raw=tx?tx.textContent.trim():'', m=/^همگام\s+(.+)$/.exec(raw), lab=m?m[1]:(raw==='اطلاعات مشترک'?'همگام نیست':raw);
    if(l.textContent!==lab) l.textContent=lab; }
  /* شمارنده ☰: زبانه‌هایی که در نوار پایین نیستند */
  let bar=[]; try{ bar=(window.ntNav&&ntNav.barTabs)?ntNav.barTabs():[]; }catch(e){}
  const solo=document.body.classList.contains('ntsolo');
  const n=DOCS.reduce((s,d,k)=>s+((vis(k)&&(solo||bar.indexOf(d.name)<0))?num(badge(d.name)):0),0);
  const b=$('ntHam') && $('ntHam').querySelector('.b'); if(b){ const t=n?(n>99?'۹۹+':fa(n)):''; if(b.textContent!==t) b.textContent=t; b.classList.toggle('show',!!n); }
  if(document.body.classList.contains('ntdrw')) fill();
}
function fill(){
  const d=$('ntDrw'); if(!d) return; const i=activeIdx();
  const lg=document.querySelector('.topbar .brand>img'), co=document.querySelector('.topbar .brand .co'), un=document.querySelector('.topbar .brand .un');
  let who=''; try{ who=(window.ntSync&&ntSync.myName&&ntSync.myName())||''; }catch(e){}
  let h=`<div class="dh">${lg?`<img src="${esc(lg.getAttribute('src')||'')}" alt="">`:''}<div><small>${esc(co?co.textContent:'')}</small><b>${esc(un?un.textContent:'')}</b>${who?`<span>${esc(who)}</span>`:''}</div>
    <button type="button" class="dx" data-a="close" aria-label="بستن منو">${ic('close',22)}</button></div><h4>بخش‌ها</h4>`;
  DOCS.forEach((doc,k)=>{ if(!vis(k)) return; const bg=badge(doc.name);
    h+=`<button type="button" class="di${k===i?' on':''}" data-t="${k}"${k===i?' aria-current="page"':''}>${ic(TABICON[doc.name]||'doc',24)}<span>${esc(doc.name)}</span>${bg?`<span class="b">${esc(fa(bg))}</span>`:''}</button>`; });
  const th=$('ntThBtn'), thx=th&&th.querySelector('.tx')?th.querySelector('.tx').textContent:'';
  const sy=$('ntSyBtn'), syx=sy&&sy.querySelector('.tx')?sy.querySelector('.tx').textContent:'';
  h+='<h4>ابزارها</h4>';
  if($('ntDevBtn')) h+=`<button type="button" class="di" data-a="ntDevBtn">${ic('files',24)}<span>پرونده دستگاه‌ها</span></button>`;
  if($('ntQrScan')) h+=`<button type="button" class="di" data-a="ntQrScan">${ic('scan',24)}<span>اسکن QR دستگاه</span></button>`;
  if(th) h+=`<button type="button" class="di" data-a="ntThBtn" data-keep="1">${ic('theme',24)}<span>ظاهر</span><span class="v">${esc(thx)}</span></button>`;
  if(sy) h+=`<button type="button" class="di" data-a="ntSyBtn">${ic('sync',24)}<span>اطلاعات مشترک</span><span class="v">${esc(syx)}</span></button>`;
  if($('ntExitBtn')) h+=`<button type="button" class="di x" data-a="ntExitBtn">${ic('exit',24)}<span>خروج (بستن سامانه)</span></button>`;
  d.innerHTML=h;
}
function onDrw(e){ const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.a==='close'){ close(); return; }
  if(b.dataset.t!==undefined){ close(); try{ show(+b.dataset.t); }catch(x){} return; }
  if(b.dataset.a){ const t=$(b.dataset.a); if(b.dataset.keep){ if(t) t.click(); setTimeout(fill,60); return; } close(); if(t) setTimeout(()=>t.click(),30); } }
let last=null;
function open(){ if(document.body.classList.contains('ntdrw')) return; last=document.activeElement; fill(); document.body.classList.add('ntdrw'); $('ntHam').setAttribute('aria-expanded','true');
  const f=$('ntDrw').querySelector('.di.on')||$('ntDrw').querySelector('button'); if(f) try{ f.focus(); }catch(e){} }
function close(){ if(!document.body.classList.contains('ntdrw')) return; document.body.classList.remove('ntdrw'); const b=$('ntHam'); if(b) b.setAttribute('aria-expanded','false'); try{ if(last&&last.focus) last.focus(); }catch(e){} }
document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
let q=0; const sched=()=>{ if(q) return; q=setTimeout(()=>{ q=0; paint(); },60); };
try{ new MutationObserver(sched).observe($('tabs'),{subtree:true,childList:true,attributes:true,characterData:true,attributeFilter:['class','hidden']}); }catch(e){}
setInterval(paint,2000);
try{ const sb=$('ntSyBtn'); if(sb) new MutationObserver(sched).observe(sb,{subtree:true,characterData:true,childList:true}); }catch(e){}
paint();
window.ntMHead={open,close,paint};
})();
