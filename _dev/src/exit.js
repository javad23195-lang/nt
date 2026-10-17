/* ============ دکمه «خروج» ============
   سامانه را همین الان قفل می‌کند (ntSync.lockNow): تغییرها فرستاده می‌شود، اطلاعات روی گوشی می‌ماند،
   ورود دوباره فقط با رمز ورود. سیستم بدون رمز: توضیح می‌دهد (خروج کامل = «قطع اتصال» در همگام‌سازی).
   جاها: منوی کناری کامپیوتر، صفحه «بیشتر» گوشی، صفحه اصلی راننده. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const ICON='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/></svg>';
const st=document.createElement('style'); st.textContent=`
@media (min-width:1000px){ #ntExitBtn{width:100%;justify-content:center;min-height:44px;background:#fff!important;border:1px solid #E0A39C!important;color:#A32018!important;border-radius:10px!important;font-size:.85rem!important} #ntExitBtn .tx{display:inline!important} }
@media (max-width:999px){ #ntExitBtn{display:none!important} }
body.ntlocked #ntExitBtn,body.ntpin #ntExitBtn{display:none}
#ntExitRow{color:#A32018;margin-bottom:64px}
#ntDrvExit{margin-top:10px;width:100%;min-height:48px;border:1px solid #E0A39C;border-radius:12px;background:#fff;color:#A32018;font:inherit;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}`;
document.head.appendChild(st);
function say(m,bad){ try{ if(typeof toast==='function'){ toast(m,bad); return; } }catch(e){} try{ (window.ntSync&&ntSync.toast||alert)(m); }catch(e){} }
function exit(){
  let ok=false; try{ ok=!!(window.ntSync && ntSync.lockNow && ntSync.lockNow()); }catch(e){}
  if(ok){ try{ const sh=$('ntNavSh'); if(sh && sh.classList.contains('on')) sh.querySelector('[data-close],.x')?.click(); }catch(e){} return; }
  say('این سیستم رمز ورود ندارد، پس قفل نمی‌شود. برای خروج کامل: همگام‌سازی ← «قطع اتصال این سیستم».',true);
}
function desk(){ const row=document.querySelector('.tabrow'); if(!row || $('ntExitBtn')) return;
  const b=document.createElement('button'); b.type='button'; b.className='qrscan'; b.id='ntExitBtn'; b.setAttribute('aria-label','خروج (قفل سامانه)');
  b.innerHTML=ICON+'<span class="tx">خروج</span>'; b.addEventListener('click',exit); row.appendChild(b); }
function sheet(){ const sh=$('ntNavSh'); if(!sh) return; const L=sh.querySelector('.ntmore'); if(!L || $('ntExitRow')) return;
  const b=document.createElement('button'); b.type='button'; b.className='ntmr'; b.id='ntExitRow'; b.innerHTML=ICON+'خروج (قفل سامانه)';
  b.addEventListener('click',e=>{ e.stopPropagation(); exit(); }); L.appendChild(b); }
function drv(){ const d=$('ntDrv'); if(!d || $('ntDrvExit')) return; const box=d.querySelector('.sybox')||d;
  const b=document.createElement('button'); b.type='button'; b.id='ntDrvExit'; b.innerHTML=ICON+'خروج (قفل سامانه)'; b.addEventListener('click',exit); box.appendChild(b); }
try{ new MutationObserver(sheet).observe($('ntNavSh'),{childList:true}); }catch(e){}
desk(); setInterval(()=>{ try{ desk(); drv(); }catch(e){} },1000);
window.ntExit={exit};
})();
