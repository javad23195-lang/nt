/* رایانه (≥۱۰۰۰px): دکمه‌های پایین کنار صفحه (دستگاه‌ها، اسکن، ظاهر، خروج) در کشوی «سه خط» بالای کنار صفحه.
   «همگام» بیرون می‌ماند تا وضعیت اتصال همیشه دیده شود. روی گوشی هیچ تغییری نیست (ntMenuBox = display:contents). */
(function(){
const $=id=>document.getElementById(id);
const IDS=['ntDevBtn','ntQrScan','ntThBtn','ntExitBtn'];
const CSS=`
#ntMenuBox{display:contents}
#ntMenuBtn,#ntMenuBd,#ntMenuBox>.mh{display:none}
@media (min-width:1000px){
  #ntMenuBtn{display:grid;place-items:center;position:absolute;top:-6px;inset-inline-end:-4px;width:44px;height:44px;border:0;border-radius:12px;background:none;color:#1B2430;cursor:pointer;z-index:2}
  #ntMenuBtn:hover{background:#EEF3F6}
  #ntMenuBtn:focus-visible{outline:3px solid #E6A52E;outline-offset:1px}
  #ntMenuBtn svg{width:26px;height:26px}
  #ntMenuBox{display:flex;flex-direction:column;gap:8px;position:fixed;top:0;bottom:0;inset-inline-start:0;width:280px;z-index:120;background:#fff;padding:16px 14px;box-sizing:border-box;
    box-shadow:-12px 0 40px rgba(16,24,34,.22);border-inline-end:3px solid #E6A52E;transform:translateX(105%);visibility:hidden;transition:transform .26s cubic-bezier(.2,.8,.25,1),visibility 0s .26s;overflow-y:auto}
  body.ntmenu #ntMenuBox{transform:none;visibility:visible;transition:transform .26s cubic-bezier(.2,.8,.25,1)}
  #ntMenuBox>.mh{display:flex;align-items:center;justify-content:space-between;margin:0 0 8px;padding-bottom:12px;border-bottom:1px solid #EEF1F4;font-weight:800;color:#1B2430;font-size:1.02rem}
  #ntMenuBox>.mh button{width:44px;height:44px;border:0;background:none;border-radius:12px;display:grid;place-items:center;color:#1B2430;cursor:pointer}
  #ntMenuBox>.mh button:hover{background:#EEF3F6}
  #ntMenuBox>.mh svg{width:22px;height:22px}
  #ntMenuBox>button{width:100%!important;justify-content:flex-start!important;gap:12px!important;min-height:52px!important;padding:0 14px!important;font-size:.95rem!important;font-weight:700;background:#F7F9FA!important;border:1px solid #DDE3E9!important;border-radius:12px!important;color:#17212B!important}
  #ntMenuBox>button:hover{background:#EEF3F6!important}
  #ntMenuBox>button svg{width:22px!important;height:22px!important;color:#1B2430!important;stroke:#1B2430!important}
  #ntMenuBtn svg,#ntMenuBox>.mh svg{color:#1B2430!important;stroke:#1B2430!important}
  #ntMenuBox>button .tx{display:inline!important}
  #ntMenuBox>#ntExitBtn{margin-top:auto;border-color:#F0C6C0!important;color:#A32018!important;background:#fff!important}
  #ntMenuBd{display:block;position:fixed;inset:0;z-index:119;background:rgba(16,24,34,.35);opacity:0;visibility:hidden;transition:opacity .2s,visibility 0s .2s}
  body.ntmenu #ntMenuBd{opacity:1;visibility:visible;transition:opacity .2s}
  .tabrow>#ntSyBtn{margin-top:auto}
}
@media (prefers-reduced-motion:reduce){ #ntMenuBox,#ntMenuBd{transition:none!important} }
@media print{ #ntMenuBtn,#ntMenuBox,#ntMenuBd{display:none!important} }
body.ntlocked #ntMenuBtn{display:none}`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
let last=null;
function open(){ if(document.body.classList.contains('ntmenu')) return; last=document.activeElement; document.body.classList.add('ntmenu'); const b=$('ntMenuBtn'); if(b) b.setAttribute('aria-expanded','true');
  setTimeout(()=>{ try{ const f=$('ntMenuBox').querySelector('button:not(.mx)'); if(f) f.focus(); }catch(e){} },30); }
function close(){ if(!document.body.classList.contains('ntmenu')) return; document.body.classList.remove('ntmenu'); const b=$('ntMenuBtn'); if(b) b.setAttribute('aria-expanded','false');
  try{ if(last && last.focus && matchMedia('(min-width:1000px)').matches) last.focus(); }catch(e){} }
function init(){ try{
  const row=document.querySelector('.tabrow'); if(!row) return;
  let box=$('ntMenuBox');
  if(!box){ box=document.createElement('div'); box.id='ntMenuBox'; box.setAttribute('aria-label','منو');
    box.innerHTML='<div class="mh"><span>منو</span><button type="button" class="mx" aria-label="بستن منو">'+NTI.svg('close')+'</button></div>';
    box.querySelector('.mx').addEventListener('click',close);
    const sy=$('ntSyBtn'); if(sy && sy.parentNode===row) row.insertBefore(box,sy); else row.appendChild(box);  try{ new MutationObserver(()=>{ if(IDS.some(id=>{ const b=$(id); return b && b.parentNode!==box; })) init(); }).observe(row,{childList:true}); }catch(e){} }
  IDS.forEach(id=>{ const b=$(id); if(b && b.parentNode!==box){ box.appendChild(b); if(id!=='ntThBtn') b.addEventListener('click',()=>setTimeout(close,0)); } });
  const ex=$('ntExitBtn'); if(ex && ex!==box.lastElementChild) box.appendChild(ex);
  if(!$('ntMenuBd')){ const d=document.createElement('div'); d.id='ntMenuBd'; d.addEventListener('click',close); document.body.appendChild(d); }
  const br=document.querySelector('.topbar .brand');
  if(br && !$('ntMenuBtn')){ const m=document.createElement('button'); m.type='button'; m.id='ntMenuBtn'; m.setAttribute('aria-label','منو (دستگاه‌ها، اسکن، ظاهر، خروج)'); m.setAttribute('aria-expanded','false'); m.setAttribute('aria-controls','ntMenuBox');
    m.innerHTML=NTI.svg('menu'); m.addEventListener('click',e=>{ e.stopPropagation(); document.body.classList.contains('ntmenu')?close():open(); }); br.appendChild(m); }
}catch(e){} }
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && document.body.classList.contains('ntmenu')){ e.stopPropagation(); close(); } },true);
matchMedia('(min-width:1000px)').addEventListener('change',e=>{ if(!e.matches) close(); });
window.ntMenu={open,close,init};
init(); setTimeout(init,600); setTimeout(init,2500);
})();
