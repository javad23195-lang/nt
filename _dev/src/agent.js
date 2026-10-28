/* ============ مأمور خرید: نهبندان و تهران (بخش خرید دو تکه) ============
   هر مأمور اطلاعات جدا دارد: باکس سندپرداز، خدمات، پیش‌فاکتور و فاکتور. کلید تهران = کلید نهبندان با _th_v1 (agK در kh_common.js).
   «خرید هفتگی» و «آب شیرین» فقط نهبندان. مأمور جاری در localStorage «ntk_ag» (بدون پیشوند nt_؛ همگام نمی‌شود).
   دسترسی: کاربری که مدیر برایش «فقط تهران» یا «فقط نهبندان» گذاشته (ntSync.myAg) فقط همان را دارد.
   فقط ظاهر و جداسازی اطلاعات است؛ هر سیستم وصل‌شده همه اطلاعات مشترک را دارد (محدودیت ذاتی). */
(function(){
'use strict';
if(typeof DOCS==='undefined' || typeof tabs==='undefined') return;
const $=id=>document.getElementById(id);
const AGN={nb:'نهبندان',th:'تهران'};
const KT=['میز خرید','لیست خرید','پیش‌فاکتور','فاکتور خرید'];
const ls=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
function allowed(){ let m=''; try{ m=window.ntSync&&ntSync.myAg?ntSync.myAg():''; }catch(e){} return m?[m]:['nb','th']; }
function cur(){ const A=allowed(), s=ls('ntk_ag'); return A.indexOf(s)>-1?s:A[0]; }
const kh=()=>document.body.classList.contains('ws-kh');
/** رفتن به مأمور دیگر: زبانه‌های خرید که باز شده‌اند دوباره ساخته می‌شوند (با کلیدهای همان مأمور) */
function set(a){ if(allowed().indexOf(a)<0) return false; if(a===cur()){ paint(); return true; }
  ls('ntk_ag',a);
  DOCS.forEach((d,i)=>{ if(KT.indexOf(d.name)>-1 && frames[i] && frames[i].dataset.loaded){ try{ frames[i].srcdoc=srcFor(i); }catch(e){} } });
  paint(); try{ if(window.ntMHead) ntMHead.paint(); }catch(e){} try{ window.dispatchEvent(new Event('ntag')); }catch(e){}
  return true; }
const CSS=`
#ntAgC{display:none;align-items:center;gap:6px;margin-top:4px;width:max-content;max-width:100%;min-height:32px;padding:0 12px;border-radius:16px;border:0;background:#0F1A2A;color:#fff;font:inherit;font-size:.86rem;font-weight:800;cursor:default}
#ntAgC[data-th]{background:#1E6B8F}
#ntAgC.sw{cursor:pointer}
#ntAgC svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
body.ws-kh #ntAgC:not(.dsk){display:inline-flex}
#ntAgSeg{display:none}
body.ws-kh #ntAgSeg:not([hidden]){display:flex;flex-direction:column;gap:4px;order:-7;margin:6px 0 2px;padding:6px;border-radius:14px;background:#EDEAE3}
#ntAgSeg small{font-size:.76rem;font-weight:800;color:#4E5864;padding:0 6px}
#ntAgSeg .r{display:flex;gap:4px}
#ntAgSeg button{flex:1;min-height:40px;border:0;border-radius:10px;background:transparent;font:inherit;font-size:.9rem;font-weight:800;color:#1B2430;cursor:pointer}
#ntAgSeg button[aria-pressed="true"]{background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.15)}
#ntDrw .dg{margin:10px 6px 2px;padding:8px 10px 2px;border-top:1px solid #E2DED5;display:flex;align-items:center;gap:8px;font-weight:900;font-size:.95rem;color:#0F1A2A}
#ntDrw .dg i{flex:none;width:10px;height:10px;border-radius:5px;background:#0F1A2A}
#ntDrw .dg i.th{background:#1E6B8F}
html.ntdark #ntDrw .dg{color:#E8EDF2;border-color:#33404C}
@media print{ #ntAgC,#ntAgSeg{display:none!important} }`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
const SW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h14l-4-4M20 16H6l4 4"/></svg>';
function build(){
  const tt=document.querySelector('.topbar .brand .tt');
  if(tt && !$('ntAgC')){ const c=document.createElement('button'); c.type='button'; c.id='ntAgC'; tt.appendChild(c);
    c.addEventListener('click',()=>{ const A=allowed(); if(A.length<2) return; set(cur()==='nb'?'th':'nb'); }); }
  const T=$('tabs');
  if(T && !$('ntAgSeg')){ const g=document.createElement('div'); g.id='ntAgSeg'; g.setAttribute('role','group'); g.setAttribute('aria-label','مأمور خرید');
    g.innerHTML='<small>مأمور خرید</small><div class="r"><button type="button" data-ag="nb">نهبندان</button><button type="button" data-ag="th">تهران</button></div>'; T.appendChild(g);
    g.addEventListener('click',e=>{ const b=e.target.closest('[data-ag]'); if(b) set(b.dataset.ag); }); }
}
function paint(){ build(); const a=cur(), A=allowed(), c=$('ntAgC'), g=$('ntAgSeg');
  if(c){ const sw=A.length>1, h=(sw?SW:'')+'مأمور '+AGN[a];
    if(c.innerHTML!==h) c.innerHTML=h; c.classList.toggle('sw',sw); c.toggleAttribute('data-th',a==='th');
    c.setAttribute('aria-label',sw?'مأمور '+AGN[a]+' — برای رفتن به مأمور '+AGN[a==='nb'?'th':'nb']+' بزنید':'مأمور '+AGN[a]); c.disabled=!sw; }
  if(g){ g.hidden=A.length<2 || !kh(); if(c) c.classList.toggle('dsk',!g.hidden && g.offsetHeight>0); g.querySelectorAll('[data-ag]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ag===a))); } }
ls('ntk_ag',cur());
window.ntAg={cur,set,allowed,name:a=>AGN[a]||'',KT};
paint(); setInterval(paint,2000);
})();
