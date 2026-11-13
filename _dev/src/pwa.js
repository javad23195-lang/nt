/* ============ نصب روی گوشی و کار بدون اینترنت ============
   sw.js (ریشه مخزن) صفحه و کتابخانه‌ها را نگه می‌دارد تا سامانه بدون اینترنت هم باز شود.
   ثبت‌ها مثل همیشه در حافظه همین گوشی است و با برگشتن اینترنت فرستاده می‌شود (sync.js). */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const DKEY='ntpwa_hide';          // «بعداً» — نام با nt_ شروع نمی‌شود، پس ارسال نمی‌شود
const standalone=()=>{ try{ return matchMedia('(display-mode: standalone)').matches || navigator.standalone===true; }catch(e){ return false; } };
const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent||'');
let prompt=null;

/* ۱) ثبت Service Worker */
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')){
  window.addEventListener('load',()=>{ navigator.serviceWorker.register('sw.js').catch(()=>{}); });
}
/* ۲) حافظه ماندگار: مرورگر اطلاعات را هنگام کمبود جا پاک نکند */
try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p=>{ if(!p) navigator.storage.persist().catch(()=>{}); }).catch(()=>{}); }catch(e){}

/* ۳) نوار «نصب روی گوشی» */
function hidden(){ try{ return Date.now()-(+localStorage.getItem(DKEY)||0) < 7*86400000; }catch(e){ return false; } }
function bar(){
  const old=$('ntPwaBar'); if(old) old.remove();
  if(standalone() || hidden() || window.ntLocked || !mobile) return;
  if(!prompt && !(ios && mobile)) return;
  const b=document.createElement('div'); b.className='sybar new'; b.id='ntPwaBar';
  b.innerHTML='<span>'+(prompt?'سامانه را روی گوشی نصب کنید تا بدون اینترنت هم باز شود.'
    :'برای کار بدون اینترنت: در Safari دکمه اشتراک‌گذاری ← «Add to Home Screen» را بزنید.')+'</span>'
    +(prompt?'<button type="button" id="ntPwaGo">نصب</button>':'')+'<button type="button" id="ntPwaNo">بعداً</button>';
  const at=$('ntSyBar'); if(at && at.parentNode) at.parentNode.insertBefore(b,at.nextSibling); else document.body.prepend(b);
  const go=$('ntPwaGo'); if(go) go.addEventListener('click',async()=>{ const p=prompt; prompt=null; b.remove(); try{ p.prompt(); await p.userChoice; }catch(e){} });
  $('ntPwaNo').addEventListener('click',()=>{ try{ localStorage.setItem(DKEY,String(Date.now())); }catch(e){} b.remove(); });
}
function later(){ if(window.ntLocked){ setTimeout(later,3000); return; } bar(); }   // بعد از اتصال هم نشان داده شود
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); prompt=e; later(); });
window.addEventListener('appinstalled',()=>{ prompt=null; const b=$('ntPwaBar'); if(b) b.remove(); });
if(ios && mobile) setTimeout(later,4000);
/* ۴) نسخه تازه: اگر گوشی نسخه ذخیره‌شده قبلی را باز کرد (اینترنت کند)، نسخه تازه را پیدا کن و جایگزین کن.
   تا وقتی کاربر چیزی را لمس نکرده، بی‌صدا دوباره بارگذاری می‌شود؛ بعد از آن فقط نوار «به‌روزرسانی» نشان داده می‌شود. */
const BUILD=(()=>{ try{ return document.querySelector('meta[name="nt-build"]').content||''; }catch(e){ return ''; } })();
let touched=false, upShown=false, lastChk=0;
document.addEventListener('pointerdown',()=>{ touched=true; },{capture:true,passive:true});
document.addEventListener('keydown',()=>{ touched=true; },{capture:true});
async function checkNew(force){
  if(!BUILD || upShown || !navigator.onLine || (!force && Date.now()-lastChk<60000)) return; lastChk=Date.now();
  try{ const r=await fetch(location.href.split('#')[0],{cache:'no-store',credentials:'same-origin'}); if(!r.ok) return;
    const m=/<meta name="nt-build" content="([0-9a-f]+)"/.exec(await r.text()); if(!m || m[1]===BUILD) return;
    if(!touched && !document.querySelector('.sydlg:not([hidden]):not(#ntSyDlg)')){ location.reload(); return; }
    upShown=true; const b=document.createElement('div'); b.className='sybar new'; b.id='ntUpBar';
    b.innerHTML='<span>نسخه تازه سامانه آماده است.</span><button type="button" id="ntUpGo">به‌روزرسانی</button>';
    const at=$('ntSyBar'); if(at && at.parentNode) at.parentNode.insertBefore(b,at.nextSibling); else document.body.prepend(b);
    $('ntUpGo').addEventListener('click',()=>location.reload());
  }catch(e){}
}
if(location.protocol==='https:'){ window.addEventListener('load',()=>setTimeout(checkNew,1500));
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') checkNew(); });
  setInterval(checkNew,30*60000); }
window.ntPwa={standalone,checkNew,build:BUILD,get canInstall(){ return !!prompt; },install:()=>{ if(prompt){ const p=prompt; prompt=null; try{ p.prompt(); }catch(e){} } }};
})();
