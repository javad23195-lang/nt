/* ============ دکمه «خروج» ============
   سامانه را می‌بندد: قفل (ntSync.lockNow) یا صفحه «بسته شد» برای سیستم بدون رمز، بعد window.close().
   قبلاً: سامانه را همین الان قفل می‌کند (ntSync.lockNow): تغییرها فرستاده می‌شود، اطلاعات روی گوشی می‌ماند،
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
#ntShut{position:fixed;inset:0;z-index:2147482000;background:radial-gradient(circle at 50% 44%,#0A4A70 0%,#03263D 55%,#011826 100%);display:flex;align-items:center;justify-content:center;padding:20px}
#ntShut .sb{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;color:#E3EEF5;max-width:340px}
#ntShut b{font-size:1.15rem}#ntShut small{font-size:.86rem;line-height:1.8;color:#B8CAD6}
#ntShut button{min-height:48px;padding:0 22px;border:0;border-radius:12px;background:#F0C24E;color:#17212B;font:inherit;font-weight:800;cursor:pointer}
#ntDrvExit{margin-top:10px;width:100%;min-height:48px;border:1px solid #E0A39C;border-radius:12px;background:#fff;color:#A32018;font:inherit;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}`;
document.head.appendChild(st);
function say(m,bad){ try{ if(typeof toast==='function'){ toast(m,bad); return; } }catch(e){} try{ (window.ntSync&&ntSync.toast||alert)(m); }catch(e){} }
function exit(){
  let ok=false; try{ ok=!!(window.ntSync && ntSync.lockNow && ntSync.lockNow()); }catch(e){}
  if(!ok) shut();      // سیستم بدون رمز: صفحه «بسته شد» (اطلاعات می‌ماند؛ «باز کردن دوباره» = بارگذاری صفحه)
  /* بستن کامل برنامه: برنامه نصب‌شده روی کامپیوتر بسته می‌شود؛ اندروید معمولاً اجازه نمی‌دهد صفحه خودش را ببندد،
     پس اگر بسته نشد، همان صفحه قفل/بسته می‌ماند و راهنما نشان داده می‌شود. */
  if(window.NTSYNC_TEST) return;
  setTimeout(()=>{ try{ window.close(); }catch(e){} setTimeout(hint,500); },700);
}
function desk(){ const row=document.querySelector('.tabrow'); if(!row || $('ntExitBtn')) return;
  const b=document.createElement('button'); b.type='button'; b.className='qrscan'; b.id='ntExitBtn'; b.setAttribute('aria-label','خروج (بستن سامانه)');
  b.innerHTML=ICON+'<span class="tx">خروج</span>'; b.addEventListener('click',exit); row.appendChild(b); }
function sheet(){ const sh=$('ntNavSh'); if(!sh) return; const L=sh.querySelector('.ntmore'); if(!L || $('ntExitRow')) return;
  const b=document.createElement('button'); b.type='button'; b.className='ntmr'; b.id='ntExitRow'; b.innerHTML=ICON+'خروج (بستن سامانه)';
  b.addEventListener('click',e=>{ e.stopPropagation(); exit(); }); L.appendChild(b); }
function drv(){ const d=$('ntDrv'); if(!d || $('ntDrvExit')) return; const box=d.querySelector('.sybox')||d;
  const b=document.createElement('button'); b.type='button'; b.id='ntDrvExit'; b.innerHTML=ICON+'خروج (بستن سامانه)'; b.addEventListener('click',exit); box.appendChild(b); }
try{ new MutationObserver(sheet).observe($('ntNavSh'),{childList:true}); }catch(e){}
desk(); setInterval(()=>{ try{ desk(); drv(); }catch(e){} },1000);
function shut(){ if($('ntShut')) return; const d=document.createElement('div'); d.id='ntShut'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true');
  d.innerHTML='<div class="sb"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true" style="fill:none;stroke:#F0C24E;stroke-width:2;stroke-linecap:round"><path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/></svg><b>سامانه بسته شد</b><small id="ntShutH"></small><button type="button" id="ntShutGo">باز کردن دوباره</button></div>';
  document.body.appendChild(d); document.body.classList.add('ntpin'); $('ntShutGo').addEventListener('click',()=>location.reload()); }
function hint(){ const t='اگر صفحه هنوز باز است: برنامه را از فهرست برنامه‌های باز گوشی (دکمه ▢ یا کشیدن از پایین) ببندید.';
  const h=$('ntShutH'); if(h){ h.textContent=t; return; } const pm=$('pinMsg'); if(pm && !pm.textContent) { pm.className='symsg'; pm.textContent=t; } }
window.ntExit={exit};
})();
