/* ============ دو بخش سامانه: «نت» (تعمیرات) و «خرید» (فاکتورها) ============
   هنگام باز شدن سامانه، اگر کاربر هر دو بخش را دارد، صفحه انتخاب نمایش داده می‌شود (یک بار در هر باز شدن).
   هر بخش فقط زبانه‌های خودش را در منو و نوار پایین دارد. رفتن به بخش دیگر: منوی ☰ (گوشی) یا دکمه بالای فهرست زبانه‌ها (رایانه).
   فقط ظاهر است: دسترسی همان ntSync.canSee است؛ زبانه‌ای که کاربر اجازه ندارد هرگز نمایش داده نمی‌شود.
   انتخاب در sessionStorage/localStorage با نام ntws_* (بدون پیشوند nt_؛ همگام نمی‌شود). */
(function(){
'use strict';
if(typeof DOCS==='undefined' || typeof tabs==='undefined') return;
const $=id=>document.getElementById(id);
const KH=['فاکتور خرید'];
const wsOf=n=>KH.indexOf(n)>-1?'kh':'nt';
const NAME={nt:'نت',kh:'خرید'};
const can=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } };
const has=w=>DOCS.some(d=>wsOf(d.name)===w && can(d.name));
const ss=(k,v)=>{ try{ if(v===undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k,v); }catch(e){ return null; } };
const ls=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
let cur=(()=>{ const s=ss('ntws'); if(s==='nt'||s==='kh') return s; const l=ls('ntws_last'); return l==='kh'?'kh':'nt'; })();
const both=()=>has('nt') && has('kh');
const MINE=new Set();
/** زبانه‌های بخش دیگر پنهان؛ زبانه‌های بی‌اجازه دست نمی‌خورند (همیشه پنهان) */
function apply(){
  if(!has(cur)) cur=has('nt')?'nt':'kh';
  if(document.body.classList.contains('ntdriver')) return;
  /* فقط زبانه‌هایی که خودش پنهان کرده دوباره نمایش می‌دهد (پنهان‌شدن به دلیل دسترسی دست نمی‌خورد) */
  DOCS.forEach((d,i)=>{ const t=tabs[i]; if(!t) return;
    if(wsOf(d.name)!==cur || !can(d.name)){ if(!t.hidden){ t.hidden=true; MINE.add(i); } }
    else if(MINE.has(i)){ t.hidden=false; MINE.delete(i); } });
  const b=document.body; if(!b.classList.contains('ws-'+cur)){ b.classList.remove('ws-nt','ws-kh'); b.classList.add('ws-'+cur); }
  const sw=$('ntWsBtn'); if(sw){ sw.hidden=!both(); const o=cur==='nt'?'kh':'nt'; const t='رفتن به بخش «'+NAME[o]+'»'; if(sw.dataset.t!==t){ sw.dataset.t=t; sw.innerHTML=ico('swap')+'<span>'+t+'</span>'; } }
}
const ico=k=>(window.NTI&&NTI.P[k])?NTI.svg(k,22):'';
function activeIdx(){ return tabs.findIndex(t=>t.classList.contains('on')); }
/** اولین زبانه بخش: آخرین زبانه‌ای که در همان بخش باز بود، وگرنه اولین زبانه مجاز */
function firstOf(w){ const l=+ls('ntws_t_'+w); if(DOCS[l] && wsOf(DOCS[l].name)===w && can(DOCS[l].name)) return l;
  return DOCS.findIndex(d=>wsOf(d.name)===w && can(d.name)); }
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
#ntWs{position:fixed;inset:0;z-index:300;background:#1B2430;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 18px;padding-top:calc(24px + env(safe-area-inset-top));overflow:auto}
#ntWs[hidden]{display:none}
#ntWs .wh{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;margin-bottom:22px}
#ntWs .wh img{width:72px;height:72px;border-radius:50%;background:#fff;padding:5px;box-sizing:border-box;box-shadow:0 0 0 3px rgba(230,165,46,.6)}
#ntWs .wh small{color:#E6A52E;font-weight:700;font-size:.85rem}
#ntWs .wh b{font-size:1.2rem;font-weight:800}
#ntWs .wh span{color:#AEB9C5;font-size:.9rem}
#ntWs .wc{display:grid;grid-template-columns:1fr;gap:12px;width:100%;max-width:520px}
@media (min-width:640px){ #ntWs .wc{grid-template-columns:1fr 1fr} }
#ntWs .wb{display:flex;align-items:center;gap:14px;width:100%;min-height:112px;padding:16px;border:0;border-radius:18px;background:#fff;color:#17212B;font:inherit;text-align:start;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25);position:relative}
#ntWs .wb:focus-visible{outline:3px solid #E6A52E;outline-offset:3px}
#ntWs .wb .ic{flex:none;width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:#EEF1F4;color:#1B2430}
#ntWs .wb .ic svg{width:34px;height:34px}
#ntWs .wb .tx{flex:1;min-width:0}
#ntWs .wb b{display:block;font-size:1.25rem;font-weight:900}
#ntWs .wb .d{display:block;font-size:.84rem;color:#51606E;margin-top:2px}
#ntWs .wb .n{display:block;font-size:.8rem;font-weight:800;color:#8A5300;margin-top:4px}
#ntWs .wb.last::after{content:"آخرین بار";position:absolute;top:10px;inset-inline-end:12px;font-size:.7rem;font-weight:800;color:#1E6B3A;background:#E4F3E8;padding:1px 8px;border-radius:9px}
body.ws-kh #ntNav,body.ws-kh #ntFab,body.ws-kh #ntQrScan,body.ws-kh #ntDevBtn{display:none!important}
#ntDrw .di.ws{border:1px dashed #9AA8B5;margin:2px 0 6px;color:#0B5C7A}
#ntWsBtn{display:none}
@media (min-width:1000px){ #ntWsBtn:not([hidden]){display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:0 0 8px;padding:0 12px;border:1px dashed #9AA8B5;border-radius:12px;background:transparent;font:inherit;font-weight:800;font-size:.86rem;color:#1B2430;cursor:pointer} }
`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
const num=s=>{ try{ return JSON.parse(localStorage.getItem(s)||'null'); }catch(e){ return null; } };
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
function counts(){ let att=0, req=0, xl=0;
  try{ const a=num('nt_alerts_v1'); att=+(a&&a.n)||0; }catch(e){}
  try{ const o=num('nt_kharid9_v1'); (o&&Array.isArray(o.rows)?o.rows:[]).forEach(r=>{ if(r && r.over==='در انتظار خرید' && String(r.bought||'').trim()==='') req++; }); }catch(e){}
  try{ const f=num('nt_factor_v1'); (Array.isArray(f)?f:[]).forEach(r=>{ if(r && r.id && !r.rep) xl++; }); }catch(e){}
  return {att,req,xl}; }
function chooser(){
  let el=$('ntWs'); if(!el){ el=document.createElement('div'); el.id='ntWs'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','ntWsT'); document.body.appendChild(el);
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-ws]'); if(!b) return; el.hidden=true; set(b.dataset.ws); }); }
  const lg=document.querySelector('.topbar .brand>img'), co=document.querySelector('.topbar .brand .co'), un=document.querySelector('.topbar .brand .un');
  const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const c=counts(), last=ls('ntws_last')==='kh'?'kh':'nt';
  el.innerHTML=`<div class="wh">${lg?`<img src="${esc(lg.getAttribute('src')||'')}" alt="">`:''}<small>${esc(co?co.textContent:'')}</small><b>${esc(un?un.textContent:'')}</b><span id="ntWsT">کدام بخش را باز می‌کنید؟</span></div>
    <div class="wc">
      <button type="button" class="wb${last==='nt'?' last':''}" data-ws="nt"><span class="ic">${ico('wr')}</span><span class="tx"><b>نت</b><span class="d">تعمیرات، توقف، قرائت، انبار و درخواست خرید</span>${c.att?`<span class="n">${fa(c.att)} مورد نیاز به توجه</span>`:''}</span></button>
      <button type="button" class="wb${last==='kh'?' last':''}" data-ws="kh"><span class="ic">${ico('rcpt')}</span><span class="tx"><b>خرید</b><span class="d">ثبت فاکتور، دفتر طرف حساب‌ها، خروجی اکسل</span>${(c.req||c.xl)?`<span class="n">${[c.req?fa(c.req)+' درخواست در انتظار خرید':'',c.xl?fa(c.xl)+' فاکتور هنوز در گزارش مالی نیست':''].filter(Boolean).join('، ')}</span>`:''}</span></button>
    </div>`;
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
