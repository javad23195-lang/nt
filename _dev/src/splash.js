/* ===== صفحه آغاز (طرح 2s/2t): هنگام باز کردن برنامه، تا اولین همگام‌سازی تمام شود =====
   فقط سیستم وصل‌شده (w یا v). قفل ورود، رمز (PIN) و دستگاه راننده: صفحه آغاز نمی‌آید.
   «ادامه با داده‌های ذخیره‌شده» = همان لحظه ورود؛ همگام‌سازی در پس‌زمینه ادامه دارد. */
(function(){
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const quiet=()=>{ try{ return navigator.webdriver && !localStorage.getItem('ntsp_test'); }catch(e){ return false; } };
const blocked=()=>{ const b=document.body.classList; return window.ntLocked || b.contains('ntlocked') || b.contains('ntpin') || b.contains('ntdriver'); };
const CSS=`
#ntSp{position:fixed;inset:0;z-index:350;background:#1C2331;color:#E9EDF2;display:flex;flex-direction:column;align-items:center;overflow:auto;padding:calc(20px + env(safe-area-inset-top)) 22px calc(20px + env(safe-area-inset-bottom));transition:opacity .3s}
#ntSp[hidden]{display:none}
#ntSp.out{opacity:0}
#ntSp .sl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;width:100%}
#ntSp .lgw{position:relative;width:min(62vw,250px);aspect-ratio:1;border-radius:50%;box-shadow:0 0 0 14px rgba(255,255,255,.035),0 22px 50px rgba(0,0,0,.45)}
#ntSp .lgw img{display:block;width:100%;height:100%;border-radius:50%}
#ntSp .lgw .lt{position:absolute;inset-inline:0;top:61%;text-align:center;color:#fff;font-weight:900;font-size:min(3.6vw,.92rem);line-height:1.55;text-shadow:0 1px 2px rgba(0,0,0,.4)}
#ntSp .an{margin-top:26px;font-size:1.02rem;font-weight:900;color:#C9D0D9}
#ntSp .co{margin-top:6px;font-size:.88rem;color:#8E98A5}
#ntSp .sb{width:100%;max-width:400px}
#ntSp .bar{height:6px;border-radius:3px;background:#3A4352;overflow:hidden;display:flex;justify-content:flex-start}
#ntSp .bar i{display:block;height:100%;width:5%;border-radius:3px;background:#E6A52E;transition:width .45s ease}
#ntSp .bl{display:flex;justify-content:space-between;gap:10px;margin-top:12px;font-size:.92rem;color:#C9D0D9}
#ntSp .bl b{font-weight:800}
#ntSp .go{display:block;width:100%;min-height:56px;margin-top:22px;border-radius:14px;border:1px solid #5A6474;background:transparent;color:#fff;font:inherit;font-size:1rem;font-weight:900;cursor:pointer}
#ntSp .ver{margin-top:14px;text-align:center;font-size:.82rem;color:#8E98A5}
#ntSp .off{width:100%;max-width:420px;background:#253041;border-radius:22px;padding:18px}
#ntSp .off .oh{display:flex;align-items:flex-start;gap:14px}
#ntSp .off .oh .tx{flex:1;min-width:0;text-align:end}
#ntSp .off .oh b{display:block;font-size:1.12rem;font-weight:900;color:#fff}
#ntSp .off .oh .tx span{display:block;margin-top:4px;font-size:.8rem;line-height:1.7;color:#C9D0D9}
#ntSp .off .oi{flex:none;width:44px;height:44px;border-radius:12px;background:#3A3A35;display:grid;place-items:center;color:#E6A52E}
#ntSp .off .oi svg,#ntSp .rt svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
#ntSp .off .gp{display:block;width:100%;min-height:56px;margin-top:16px;border:0;border-radius:14px;background:#E6A52E;color:#1B2430;font:inherit;font-size:1rem;font-weight:900;cursor:pointer}
#ntSp .rt{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:50px;margin-top:10px;border:1px solid #5A6474;border-radius:14px;background:transparent;color:#fff;font:inherit;font-size:.98rem;font-weight:900;cursor:pointer}
#ntSp button:focus-visible{outline:3px solid #E6A52E;outline-offset:3px}
@media (prefers-reduced-motion:reduce){ #ntSp,#ntSp .bar i{transition:none} }
`;
const OFF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M8.5 6.6A6.5 6.5 0 0 1 18 11a4.5 4.5 0 0 1 2.4 7.6M17 19H7a5 5 0 0 1-1.6-9.7"/></svg>';
const RETRY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>';
const STEP=['','دریافت اطلاعات','باز کردن و ادغام اطلاعات','ارسال کارهای تازه'];
let el=null, pct=5, crawl=null, view='', t0=0;
function close(fast){ if(!el || el.hidden) return; clearInterval(crawl); document.body.classList.remove('ntsplash');
  if(fast){ el.hidden=true; } else { el.classList.add('out'); setTimeout(()=>{ el.hidden=true; },300); }
  window.removeEventListener('ntsyncphase',upd);
  try{ window.ntWs && ntWs.tick && ntWs.tick(); }catch(e){} }
function head(){ const co=document.querySelector('.topbar .brand .co'); const L=window.NT_LOGO_BIG||'';
  return `<div class="sl"><div class="lgw">${L?`<img src="${L}" alt="">`:''}<div class="lt">واحد نگهداری و تعمیرات<br>واحد تدارکات</div></div>
    <div class="an">سامانه نت معدن</div>${co&&co.textContent.trim()?`<div class="co">${esc(co.textContent.trim())}</div>`:''}</div>`; }
function drawBusy(){ view='busy'; const v=(document.querySelector('meta[name="nt-ver"]')||{}).content||'';
  el.innerHTML=head()+`<div class="sb"><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="پیشرفت همگام‌سازی"><i></i></div>
    <div class="bl"><b id="ntSpT">${esc(STEP[1])}، ${fa(1)} از ${fa(3)}</b><span id="ntSpP">${fa(pct)}٪</span></div>
    <button type="button" class="go" data-sp="go">ادامه با داده‌های ذخیره‌شده</button>${v?`<div class="ver">نسخه ${esc(fa(v))}</div>`:''}</div>`;
  setPct(pct); }
function drawOff(){ view='off'; clearInterval(crawl); let at=''; try{ const s=ntSync.state(); at=s.at?ntSync.fmtAt(s.at):''; }catch(e){}
  el.innerHTML=head()+`<div class="off" role="alert"><div class="oh"><span class="oi">${OFF}</span><span class="tx"><b>اینترنت در دسترس نیست</b><span>${at&&at!=='—'?'آخرین همگام‌سازی '+esc(at)+'. ':''}کارهایی که ثبت کنید ذخیره می‌شوند و بعد فرستاده می‌شوند.</span></span></div>
    <button type="button" class="gp" data-sp="go">ادامه با داده‌های ذخیره‌شده</button><button type="button" class="rt" data-sp="retry">${RETRY}تلاش دوباره</button></div>`; }
function setPct(p){ pct=Math.max(pct,Math.min(100,Math.round(p))); const i=el&&el.querySelector('.bar i'), b=el&&el.querySelector('.bar'), t=$('ntSpP');
  if(i) i.style.width=pct+'%'; if(b) b.setAttribute('aria-valuenow',String(pct)); if(t) t.textContent=fa(pct)+'٪'; }
/* هر مرحله یک‌سوم نوار؛ درون مرحله آرام جلو می‌رود (تا سقف همان مرحله) */
function upd(){ if(!el || el.hidden) return; let s={}; try{ s=ntSync.state(); }catch(e){}
  if(blocked()){ close(true); return; }
  if(s.phase==='off'){ if(view!=='off') drawOff(); return; }
  if(s.phase==='err' || s.mode==='' || (s.mode!=='w' && s.mode!=='v')){ close(); return; }
  if(s.phase==='ok' && !s.busy && Date.now()-t0>300){ setPct(100); setTimeout(()=>close(),350); return; }
  if(view!=='busy') drawBusy();
  const k=s.stage||1, t=$('ntSpT'); if(t) t.textContent=STEP[k]+'، '+fa(k)+' از '+fa(3);
  const lo=[0,8,40,72][k]; if(pct<lo) setPct(lo); }
function start(){ if(el || quiet() || blocked()) return; let s={}; try{ s=ntSync.state(); }catch(e){ return; }
  if(s.mode!=='w' && s.mode!=='v') return;
  if(s.phase==='ok' && !s.busy) return;                          /* همگام‌سازی تمام شده است */
  const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
  el=document.createElement('div'); el.id='ntSp'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','سامانه نت معدن، در حال همگام‌سازی');
  document.body.appendChild(el); document.body.classList.add('ntsplash'); t0=Date.now();
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-sp]'); if(!b) return;
    if(b.dataset.sp==='go') close();
    else { pct=5; drawBusy(); try{ ntSync.sync({manual:true}); }catch(x){} } });
  if(!navigator.onLine && s.phase!=='busy') drawOff(); else drawBusy();
  crawl=setInterval(()=>{ if(view!=='busy'){ upd(); return; } let k=1; try{ k=ntSync.state().stage||1; }catch(e){} const cap=[0,36,68,96][k]; if(pct<cap) setPct(pct+Math.max(1,(cap-pct)/8)); upd(); },400);
  window.addEventListener('ntsyncphase',upd); upd(); }
window.ntSplash={start,close,get open(){ return !!(el && !el.hidden); }};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(start,0)); else setTimeout(start,0);
})();
