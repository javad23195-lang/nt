/* ============ ظاهر: روشن / تیره (شیفت شب) / آفتاب + بازخورد بعد از ذخیره ============
   - انتخاب فقط روی همین گوشی (ntui_theme؛ با nt_ شروع نمی‌شود، پس ارسال نمی‌شود).
   - تیره: کل صفحه با filter برعکس می‌شود؛ عکس، نمودار، دوربین، آرم، صفحه شروع و قفل دوباره برعکس می‌شوند تا رنگ واقعی بماند.
   - آفتاب: کنتراست و پررنگی بیشتر، متن کمی ضخیم‌تر.
   - بازخورد: وقتی یک بخش پیام موفق می‌دهد (say)، دکمه‌ای که زده شد یک حلقه سبز و تیک کوتاه می‌گیرد و گوشی کوتاه می‌لرزد؛
     پیام خطا: حلقه قرمز و لرزش دوتایی. فقط ظاهر؛ هیچ اطلاعاتی نمی‌خواند و نمی‌نویسد. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const K='ntui_theme', MODES=['light','dark','sun'], NAME={light:'روشن',dark:'تیره (شب)',sun:'آفتاب'};
const get=()=>{ try{ const v=localStorage.getItem(K); return MODES.indexOf(v)>-1?v:'light'; }catch(e){ return 'light'; } };
const calm=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const ICON={light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dark:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  sun:'<circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M3.5 3.5l2 2M18.5 18.5l2 2M1 12h3M20 12h3M3.5 20.5l2-2M18.5 5.5l2-2"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'};
/* CSS پوسته */
const CSS=`
html.ntdark{filter:invert(.93) hue-rotate(180deg);background:#fff}
html.ntdark img,html.ntdark video,html.ntdark canvas,html.ntdark #ntSplash,html.ntdark #ntPin,html.ntdark #ntPinFx,html.ntdark #ntQrCam,html.ntdark .chmini canvas,html.ntdark .ntico{filter:invert(1) hue-rotate(180deg)}
html.ntdark #ntSplash img,html.ntdark #ntPin img,html.ntdark #ntPinFx img{filter:none}
@media (max-width:999px){ html.ntdark .topbar{filter:invert(1) hue-rotate(180deg)} html.ntdark .topbar img{filter:none} }
html.ntsun{filter:saturate(1.25) contrast(1.12) brightness(.95)}
#ntThBtn svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
@media (min-width:1000px){ #ntThBtn{width:100%;justify-content:center;min-height:44px;background:#F7F9FA!important;border:1px solid #D5DCE3!important;color:#17212B!important;border-radius:10px!important;font-size:.85rem!important} #ntThBtn .tx{display:inline!important} #ntThBtn svg{stroke:#51606E} }
body.ntlocked #ntThBtn{display:none}
@media (prefers-reduced-motion:no-preference){ button:active:not(:disabled),.btn:active,[role=button]:active,label.chk:active{scale:.97} }
@media (max-width:999px){ #ntThBtn{display:none!important} }
body.ntnav .brand .tt{min-width:0;overflow:hidden}
#ntThRow .tv{margin-inline-start:auto;font-size:.8rem;font-weight:700;color:#0B5C7A;background:#E2EEF3;border-radius:10px;padding:2px 10px}
`;
/* CSS داخل هر بخش */
const FCSS={
  dark:'img,video,canvas,.ntico{filter:invert(1) hue-rotate(180deg)}',
  sun:'body{font-weight:500}small,.dim,.hint,.fhint{opacity:1!important}',
  fx:`@media (prefers-reduced-motion:no-preference){ button:active:not(:disabled),.btn:active,[role=button]:active,label.chk:active{scale:.97} }
.ntok{animation:ntOk .7s ease-out}.ntbad{animation:ntBad .5s ease-in-out}
@keyframes ntOk{0%{box-shadow:0 0 0 0 rgba(30,127,79,.55)}100%{box-shadow:0 0 0 14px rgba(30,127,79,0)}}
@keyframes ntBad{0%,100%{transform:none;box-shadow:0 0 0 3px rgba(179,38,30,.5)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.ntokck{position:fixed;z-index:9999;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:#1E7F4F;pointer-events:none;display:grid;place-items:center;animation:ntCk .75s ease-out forwards}
.ntokck svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;animation:ntCkD .3s .08s ease-out forwards}
@keyframes ntCk{0%{transform:scale(.3);opacity:0}25%{transform:scale(1.1);opacity:1}70%{transform:scale(1);opacity:1}100%{transform:translateY(-14px) scale(.9);opacity:0}}
@keyframes ntCkD{to{stroke-dashoffset:0}}`};
const stEl=document.createElement('style'); stEl.textContent=CSS; document.head.appendChild(stEl);

let mode=get();
function apply(){
  const h=document.documentElement; h.classList.toggle('ntdark',mode==='dark'); h.classList.toggle('ntsun',mode==='sun');
  try{ const m=document.querySelector('meta[name=theme-color]'); if(m) m.setAttribute('content',mode==='dark'?'#10161D':'#0B5C7A'); }catch(e){}
  const b=$('ntThBtn'); if(b){ b.innerHTML=`${NTI.svg('theme',18)}<span class="tx">${NAME[mode]}</span>`; b.setAttribute('aria-label','ظاهر: '+NAME[mode]+' — برای عوض کردن بزنید'); }
  frames.forEach(fr=>frameCss(fr));
}
function frameCss(fr){ try{ const d=fr.contentDocument; if(!d || !d.head) return;
  let s=d.getElementById('ntThCss'); if(!s){ s=d.createElement('style'); s.id='ntThCss'; d.head.appendChild(s); }
  const t=(mode==='dark'?FCSS.dark:'')+(mode==='sun'?FCSS.sun:'')+FCSS.fx; if(s.textContent!==t) s.textContent=t;
  hookSay(fr); }catch(e){} }
/* بازخورد: say هر بخش را می‌پیچد */
function hookSay(fr){ const w=fr.contentWindow, d=fr.contentDocument; if(!w || w.__ntSay || typeof w.say!=='function') return;
  const orig=w.say; w.__ntSay=1; let last=null, lastT=0, lx=0, ly=0;
  d.addEventListener('pointerdown',e=>{ const b=e.target&&e.target.closest&&e.target.closest('button,.btn,[role=button]'); if(b){ last=b; lastT=Date.now(); lx=e.clientX; ly=e.clientY; } },true);
  w.say=function(msg,bad){ const r=orig.apply(this,arguments);
    try{ const fresh=last&&Date.now()-lastT<4000, b=(fresh&&last.isConnected)?last:null;
      try{ if(fresh && navigator.vibrate) navigator.vibrate(bad?[25,60,25]:12); }catch(e){}
      if(b && !calm()){ b.classList.remove('ntok','ntbad'); void b.offsetWidth; b.classList.add(bad?'ntbad':'ntok'); setTimeout(()=>b.classList.remove('ntok','ntbad'),800);
      }
      if(!bad && fresh && !calm()){ let x=lx, y=ly; if(b){ const r2=b.getBoundingClientRect(); if(r2.width){ x=r2.left+r2.width/2; y=r2.top+r2.height/2; } }
        if(x||y){ const c=d.createElement('div'); c.className='ntokck'; c.style.left=x+'px'; c.style.top=y+'px';
          c.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; d.body.appendChild(c); setTimeout(()=>c.remove(),800); } }
    }catch(e){} return r; };
}
function addBtn(){
  const row=document.querySelector('.tabrow'); if(!row || $('ntThBtn')) return;
  const b=document.createElement('button'); b.type='button'; b.className='qrscan'; b.id='ntThBtn';
  b.addEventListener('click',()=>{ mode=MODES[(MODES.indexOf(mode)+1)%MODES.length]; try{ localStorage.setItem(K,mode); }catch(e){} apply();
    try{ if(typeof toast==='function') toast('ظاهر: '+NAME[mode]); }catch(e){} });
  const sy=$('ntSyBtn'); if(sy) row.insertBefore(b,sy); else row.appendChild(b);
}
/* گوشی: جای دکمه ظاهر در صفحه «بیشتر» (نوار بالا جا ندارد) */
function sheetRow(){ const sh=$('ntNavSh'); if(!sh) return; const L=sh.querySelector('.ntmore'); if(!L || $('ntThRow')) return;
  const b=document.createElement('button'); b.type='button'; b.className='ntmr'; b.id='ntThRow';
  const draw=()=>{ b.innerHTML=`${NTI.svg('theme')}ظاهر<span class="tv">${NAME[mode]}</span>`; b.setAttribute('aria-label','ظاهر: '+NAME[mode]+' — برای عوض کردن بزنید'); };
  draw(); b.addEventListener('click',e=>{ e.stopPropagation(); mode=MODES[(MODES.indexOf(mode)+1)%MODES.length]; try{ localStorage.setItem(K,mode); }catch(x){} apply(); draw(); });
  L.appendChild(b); }
try{ new MutationObserver(sheetRow).observe($('ntNavSh'),{childList:true}); }catch(e){}
addBtn(); apply();
setInterval(()=>{ try{ frames.forEach(fr=>{ if(fr.dataset.loaded) frameCss(fr); }); if(!$('ntThBtn')) addBtn(); }catch(e){} },1000);
window.ntTheme={get:()=>mode,set:v=>{ if(MODES.indexOf(v)>-1){ mode=v; try{ localStorage.setItem(K,v); }catch(e){} apply(); } }};
})();
