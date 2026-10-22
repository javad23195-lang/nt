/* ============ دو بخش سامانه: «نت» (تعمیرات) و «خرید» (فاکتورها) ============
   هنگام باز شدن سامانه، اگر کاربر هر دو بخش را دارد، صفحه انتخاب نمایش داده می‌شود (یک بار در هر باز شدن).
   هر بخش فقط زبانه‌های خودش را در منو و نوار پایین دارد. رفتن به بخش دیگر: منوی ☰ (گوشی) یا دکمه بالای فهرست زبانه‌ها (رایانه).
   فقط ظاهر است: دسترسی همان ntSync.canSee است؛ زبانه‌ای که کاربر اجازه ندارد هرگز نمایش داده نمی‌شود.
   انتخاب در sessionStorage/localStorage با نام ntws_* (بدون پیشوند nt_؛ همگام نمی‌شود). */
(function(){
'use strict';
if(typeof DOCS==='undefined' || typeof tabs==='undefined') return;
const $=id=>document.getElementById(id);
const KH=['میز خرید','لیست خرید','پیش‌فاکتور','فاکتور خرید'];
const wsOf=n=>KH.indexOf(n)>-1?'kh':'nt';
const NAME={nt:'نت',kh:'خرید'};
const can=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } };
const has=w=>DOCS.some(d=>wsOf(d.name)===w && can(d.name));
const ss=(k,v)=>{ try{ if(v===undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k,v); }catch(e){ return null; } };
const ls=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
let cur=(()=>{ const s=ss('ntws'); if(s==='nt'||s==='kh') return s; const l=ls('ntws_last'); return l==='kh'?'kh':'nt'; })();
const both=()=>has('nt') && has('kh');
/** کاربر بخش خرید که فقط یک فرم دارد: نه «میز خرید»، نه نوار پایین؛ فقط همان فرم */
const khForms=()=>{ try{ return window.ntSync&&ntSync.khForms?ntSync.khForms():[]; }catch(e){ return []; } };
const khSolo=()=>khForms().length===1;
const MINE=new Set();
/** زبانه‌های بخش دیگر پنهان؛ زبانه‌های بی‌اجازه دست نمی‌خورند (همیشه پنهان) */
function apply(){
  if(!has(cur)) cur=has('nt')?'nt':'kh';
  if(document.body.classList.contains('ntdriver')) return;
  /* فقط زبانه‌هایی که خودش پنهان کرده دوباره نمایش می‌دهد (پنهان‌شدن به دلیل دسترسی دست نمی‌خورد) */
  DOCS.forEach((d,i)=>{ const t=tabs[i]; if(!t) return;
    if(wsOf(d.name)!==cur || !can(d.name) || (d.name==='میز خرید' && khSolo())){ if(!t.hidden){ t.hidden=true; MINE.add(i); } }
    else if(MINE.has(i)){ t.hidden=false; MINE.delete(i); } });
  const b=document.body; if(!b.classList.contains('ws-'+cur)){ b.classList.remove('ws-nt','ws-kh'); b.classList.add('ws-'+cur); }
  const one=cur==='kh' && khSolo(); if(b.classList.contains('ntkh1')!==one) b.classList.toggle('ntkh1',one);
  /* نام واحد در سربرگ و منوی کناری */
  document.querySelectorAll('.topbar .brand .un').forEach(e=>{ if(e.dataset.u0===undefined) e.dataset.u0=e.textContent; const t=cur==='kh'?'واحد تدارکات':e.dataset.u0; if(e.textContent!==t) e.textContent=t; });
  const sw=$('ntWsBtn'); if(sw){ sw.hidden=!both(); const o=cur==='nt'?'kh':'nt'; const t='رفتن به بخش «'+NAME[o]+'»'; if(sw.dataset.t!==t){ sw.dataset.t=t; sw.innerHTML=ico('swap')+'<span>'+t+'</span>'; } }
}
/* آیکن‌های صفحه انتخاب (طرح تازه): خطی، سرمه‌ای */
const WS_I={nt:'<svg viewBox="0 0 24 24"><path d="M14 7a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 00-2-2z"/><path d="M4 4l4 4M3 7l4-4"/></svg>',
  kh:'<svg viewBox="0 0 24 24"><path d="M6 7h12l1 14H5zM9 7a3 3 0 016 0"/></svg>'};
const ARW='<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const ico=k=>(window.NTI&&NTI.P[k])?NTI.svg(k,22):'';
function activeIdx(){ return tabs.findIndex(t=>t.classList.contains('on')); }
/** اولین زبانه بخش: آخرین زبانه‌ای که در همان بخش باز بود، وگرنه اولین زبانه مجاز */
function firstOf(w){ const l=+ls('ntws_t_'+w); if(DOCS[l] && wsOf(DOCS[l].name)===w && can(DOCS[l].name) && !(DOCS[l].name==='میز خرید' && khSolo())) return l;
  return DOCS.findIndex(d=>wsOf(d.name)===w && can(d.name) && !(d.name==='میز خرید' && khSolo())); }
function set(w,opt){ opt=opt||{}; if(w!=='nt'&&w!=='kh') return; if(!has(w)) return;
  cur=w; ss('ntws',w); ls('ntws_last',w); apply();
  const a=activeIdx(); if(!opt.noShow && (a<0 || wsOf(DOCS[a].name)!==w)){ const i=firstOf(w); if(i>-1) try{ show(i); }catch(e){} }
  try{ window.ntNav&&ntNav.paint(); }catch(e){} try{ window.ntMHead&&ntMHead.paint(); }catch(e){} }
/* رفتن به زبانه‌ای از بخش دیگر (مثلاً از پیام {nt:'go'}): بخش هم عوض می‌شود */
const _show=window.show;
window.show=function(i){ const d=DOCS[i]; if(d && can(d.name)){ const w=wsOf(d.name); if(w!==cur && has(w)){ cur=w; ss('ntws',w); ls('ntws_last',w); apply(); } ls('ntws_t_'+w,String(i)); }
  const r=_show.apply(this,arguments); try{ window.ntNav&&ntNav.paint(); }catch(e){} return r; };

/* ---------- صفحه انتخاب ---------- */
const CSS=`
#ntWs{position:fixed;inset:0;z-index:300;background:#EEF1F4;color:#17212B;display:flex;flex-direction:column;overflow:auto}
#ntWs[hidden]{display:none}
#ntWs .wtop{background:#1B2430;color:#fff;padding:14px 18px;padding-top:calc(14px + env(safe-area-inset-top));display:flex;align-items:center;gap:12px}
#ntWs .wtop .tt{flex:1;min-width:0}
#ntWs .wtop b{display:block;font-size:1.25rem;font-weight:900}
#ntWs .wtop small{color:#AEB9C5;font-size:.8rem}
#ntWs .wtop img{width:40px;height:40px;border-radius:50%;background:#fff;padding:3px;box-sizing:border-box}
#ntWs .wbody{width:100%;max-width:560px;margin:0 auto;padding:18px 16px 30px}
#ntWs .wq{font-size:.95rem;font-weight:800;color:#3D4852;margin:4px 2px 12px}
#ntWs .wc{display:grid;grid-template-columns:1fr;gap:14px}
#ntWs .wb{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;width:100%;padding:18px;border:1px solid #D5DCE3;border-radius:20px;background:#fff;color:#17212B;font:inherit;text-align:start;cursor:pointer;box-shadow:0 2px 8px rgba(27,36,48,.05)}
#ntWs .wb:focus-visible{outline:3px solid #E6A52E;outline-offset:3px}
#ntWs .wb .ic{width:60px;height:60px;border-radius:16px;background:#F1F4F7;display:grid;place-items:center;color:#1B2430;margin-bottom:6px}
#ntWs .wb .ic svg,#ntWs .wb .ar svg{width:32px;height:32px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#ntWs .wb b{font-size:1.2rem;font-weight:900}
#ntWs .wb .d{font-size:.9rem;color:#51606E}
#ntWs .wb .bd{position:absolute;top:18px;inset-inline-end:18px;font-size:.8rem;font-weight:900;color:#A32018;background:#FBE5E2;padding:4px 12px;border-radius:14px}
#ntWs .wb .ar{color:#51606E;align-self:flex-end;margin-top:2px}
#ntWs .wb .ar svg{width:26px;height:26px}
#ntWs .wb.last{border-color:#E6A52E;box-shadow:inset 0 0 0 1px #E6A52E}
body.ws-kh #ntQrScan,body.ws-kh #ntDevBtn{display:none!important}
#ntDrw .di.ws{border:1px dashed #9AA8B5;margin:2px 0 6px;color:#0B5C7A}
#ntWsBtn{display:none}
@media (min-width:1000px){ #ntWsBtn:not([hidden]){display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:0 0 8px;padding:0 12px;border:1px dashed #9AA8B5;border-radius:12px;background:transparent;font:inherit;font-weight:800;font-size:.86rem;color:#1B2430;cursor:pointer} }
`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
const num=s=>{ try{ return JSON.parse(localStorage.getItem(s)||'null'); }catch(e){ return null; } };
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
/** کارهای باز هر بخش (فقط شمارش، از اطلاعات همین سیستم) */
function counts(){ let att=0, kh=0; const sees=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } };
  try{ const a=num('nt_alerts_v1'); att=+(a&&a.n)||0; }catch(e){}
  try{ if(sees('باکس سندپرداز')){ const b=num('nt_kbox_v1'); (Array.isArray(b)?b:[]).forEach(x=>{ if(x&&x.imp&&!x.st&&!x.gone) kh++; }); } }catch(e){}
  try{ if(sees('خدمات تدارکات')){ const v=num('nt_ksvc_v1'); (Array.isArray(v)?v:[]).forEach(x=>{ if(x&&!x.done&&!x.no) kh++; }); } }catch(e){}
  try{ if(sees('پیش‌فاکتور')){ const p=num('nt_kpre_v1'); (Array.isArray(p)?p:[]).forEach(x=>{ if(x&&x.st==='wait') kh++; }); } }catch(e){}
  try{ if(sees('فاکتور خرید')){ const f=num('nt_factor_v1'); (Array.isArray(f)?f:[]).forEach(r=>{ if(r&&r.id&&((r.cat!=='sookht'&&!String(r.title||'').trim())||(r.cat==='kala'&&!r.sp))) kh++; }); } }catch(e){}
  return {att,kh}; }
function chooser(){
  let el=$('ntWs'); if(!el){ el=document.createElement('div'); el.id='ntWs'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','ntWsT'); document.body.appendChild(el);
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-ws]'); if(!b) return; el.hidden=true; set(b.dataset.ws); }); }
  const lg=document.querySelector('.topbar .brand>img'), co=document.querySelector('.topbar .brand .co'), un=document.querySelector('.topbar .brand .un'), dt=document.querySelector('.topbar .brand .dt');
  const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const c=counts(), last=ls('ntws_last')==='kh'?'kh':'nt', unN=(un&&(un.dataset.u0||un.textContent))||'واحد نگهداری و تعمیرات', coN=co?co.textContent.trim():'';
  el.innerHTML=`<div class="wtop">${lg?`<img src="${esc(lg.getAttribute('src')||'')}" alt="">`:''}<div class="tt"><b>سامانه نت</b><small>${esc(dt?dt.textContent:'')}</small></div></div>
    <div class="wbody"><p class="wq" id="ntWsT">${coN?esc(coN)+'، ':''}کدام واحد؟</p><div class="wc">
      <button type="button" class="wb${last==='nt'?' last':''}" data-ws="nt">${c.att?`<span class="bd">${fa(c.att)} نیاز به توجه</span>`:''}<span class="ic">${WS_I.nt}</span><b>${esc(unN)}</b><span class="d">توقف، قرائت، سرویس و خرابی دستگاه‌ها</span><span class="ar">${ARW}</span></button>
      <button type="button" class="wb${last==='kh'?' last':''}" data-ws="kh">${c.kh?`<span class="bd">${fa(c.kh)} کار باز</span>`:''}<span class="ic">${WS_I.kh}</span><b>واحد تدارکات</b><span class="d">لیست خرید، پیش‌فاکتور و فاکتور خرید</span><span class="ar">${ARW}</span></button>
    </div></div>`;
  el.hidden=false; try{ el.querySelector('.wb.last').focus(); }catch(e){}
}
const locked=()=>window.ntLocked || document.body.classList.contains('ntlocked') || document.body.classList.contains('ntpin') || document.body.classList.contains('ntdriver');
/* در آزمایش‌های خودکار (webdriver) صفحه انتخاب نمی‌آید، مگر آزمایش آن را بخواهد (ntws_test) */
const quiet=()=>{ try{ return navigator.webdriver && !localStorage.getItem('ntws_test'); }catch(e){ return false; } };
let asked=false;
function tick(){
  apply();
  if(!asked && !locked() && (typeof ntBooted==='undefined' || ntBooted)){
    asked=true;
    if(both() && !ss('ntws') && !quiet()) chooser(); else set(cur,{});
  }
}
/* دکمه رایانه: بالای فهرست زبانه‌ها */
(function(){ const T=$('tabs'); if(!T) return; const b=document.createElement('button'); b.type='button'; b.id='ntWsBtn'; b.hidden=true; T.insertBefore(b,T.firstChild);
  b.addEventListener('click',()=>set(cur==='nt'?'kh':'nt')); })();
apply();
setInterval(tick,700); setTimeout(tick,50);
window.ntWs={get cur(){ return cur; },set,both,has,wsOf,toggle:()=>set(cur==='nt'?'kh':'nt'),chooser,
  drw:()=>both()?`<button type="button" class="di ws" data-a="ws">${ico('swap')}<span>رفتن به بخش «${NAME[cur==='nt'?'kh':'nt']}»</span></button>`:''};
})();
