/* ============ طراحی تازه، مرحله ۲: نوار پایین شناور (گوشی) و منوی کناری گروه‌بندی‌شده (کامپیوتر) ============
   فقط ظاهر و ترتیب. هیچ اطلاعاتی نمی‌خواند و نمی‌نویسد. دسترسی‌ها همان قبل است:
   زبانه‌ای که پنهان است (دسترسی، بخش دیگر، حالت راننده) پنهان می‌ماند؛ عنوان گروهی که هیچ زبانه پیدا ندارد هم پنهان می‌شود.
   بخش «تدارکات» (ws-kh) طرح خودش را دارد و اینجا فقط برای «نگهداری» است. */
(function(){
'use strict';
if(typeof DOCS==='undefined' || typeof tabs==='undefined') return;
const $=id=>document.getElementById(id);
const INK='#15212C', ACC='#E2A12E';
const CSS=`
@media (max-width:899px){
body.ntnav:not(.ws-kh) #ntNav{margin:0 12px calc(10px + env(safe-area-inset-bottom));height:72px;padding:0 6px;border-radius:24px;background:${INK};border:0;
  box-shadow:0 10px 28px rgba(21,33,44,.28);align-items:center;justify-content:space-around}
body.ntnav:not(.ws-kh) #ntNavBub{display:none}
body.ntnav:not(.ws-kh) .ntnb{width:auto;min-width:60px;min-height:54px;justify-content:center;gap:4px;color:#C9CED4;font-size:.76rem;font-weight:700}
body.ntnav:not(.ws-kh) .ntnb svg{color:#C9CED4;width:26px;height:26px}
body.ntnav:not(.ws-kh) .ntnb.on,body.ntnav:not(.ws-kh) .ntnb.on svg{color:${ACC};font-weight:800}
body.ntnav:not(.ws-kh) .ntnb.on svg{transform:none}
body.ntnav:not(.ws-kh) .ntnb .b{top:2px;right:calc(50% + 4px);min-width:20px;height:20px;padding:0 5px;box-sizing:border-box;border-radius:10px;background:#FF6B5E!important;color:${INK};border:0;font-weight:900;font-size:.72rem}
body.ntnav:not(.ws-kh) .ntsp{width:70px}
body.ntnav:not(.ws-kh) .ntfab{bottom:calc(18px + env(safe-area-inset-bottom));width:60px;height:56px;border-radius:18px;box-shadow:0 6px 16px rgba(226,161,46,.4)}
body.ntnav:not(.ws-kh) .ntfab svg{width:30px;height:30px;stroke-width:2.8}
body.ntnav:not(.ws-kh) .ntfab svg circle{display:none}
body.ntnav:not(.ws-kh) .ntfab svg path{stroke:${INK}!important;stroke-width:2.8}
html.ntdark body.ntnav:not(.ws-kh) #ntNav,html.ntdark body.ntnav:not(.ws-kh) .ntfab{filter:invert(1) hue-rotate(180deg)}
}
.ntgrp{display:none}
@media (min-width:1000px){
body:not(.ws-kh) .topbar{width:248px;padding:16px 12px 14px}
body:not(.ws-kh) .topbar .brand{flex-direction:row;align-items:center;text-align:start;gap:10px;padding:2px 6px 14px;padding-inline-end:40px;margin-bottom:6px;border-bottom:1px solid #ECE9E3}
body:not(.ws-kh) .topbar .brand::after{display:none}
body:not(.ws-kh) .topbar .brand .lg{width:44px;height:44px;box-shadow:0 0 0 2px ${ACC};animation:none}
body:not(.ws-kh) .topbar .brand .tt{text-align:start;width:auto;flex:1;font-size:.92rem;line-height:1.4}
body:not(.ws-kh) .topbar .brand .co{font-size:.7rem}
body:not(.ws-kh) .topbar .brand .un{font-size:.92rem;white-space:normal}
body:not(.ws-kh) #ntWsBtn{order:99;margin-top:10px}
body:not(.ws-kh) .topbar .brand .dt{font-size:.72rem;margin-top:1px}
body:not(.ws-kh) .tab{min-height:40px;font-size:.9rem;font-weight:650!important;color:#3A4450!important;border-radius:11px!important}
body:not(.ws-kh) .tab .i{color:#8C9198!important}
body:not(.ws-kh) .tab:hover{background:#F4F3F0!important}
body:not(.ws-kh) .tab.on{color:#fff!important;font-weight:800!important}
body:not(.ws-kh) .tab.on .i{color:${ACC}!important}
body:not(.ws-kh) .tab.on::before,body:not(.ws-kh) #ntTabInd::before{display:none}
body:not(.ws-kh) #ntTabInd{background:${INK};border-radius:11px}
body:not(.ws-kh):not(.ntind) .tab.on{background:${INK}!important}
body:not(.ws-kh) .tab.on .n{background:${ACC}!important;color:${INK}!important}
body:not(.ws-kh):not(.ntdriver) .ntgrp:not([hidden]){display:block;font-size:.7rem;font-weight:800;color:#8C9198;padding:12px 12px 3px;pointer-events:none;user-select:none}
}`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
/* ترتیب و گروه‌ها (فقط «نگهداری»). [عنوان گروه، زبانه‌ها] */
const G=[[null,['امروز','مدیریت']],
  ['ثبت روزانه',['برنامه روزانه','دفترچه قرائت','توقف شیفت','ثبت مشکلات']],
  ['پرونده دستگاه',['شناسنامه','خدمات','برون‌سپاری','عکس‌ها']],
  ['انبار و خرید',['انبار','برنامه هفتگی انبار','درخواست خرید']],
  ['کارکنان',['تردد و اضافه‌کار']]];
const T=$('tabs'); if(!T) return;
const idx=n=>DOCS.findIndex(d=>d.name===n);
const labs=[];
function setup(){
  G.forEach(([title,names],g)=>{
    const base=g*20;
    names.forEach((n,k)=>{ const i=idx(n); if(i>-1 && tabs[i]) tabs[i].style.order=base+1+k; });
    if(!title) return;
    const e=document.createElement('div'); e.className='ntgrp'; e.setAttribute('aria-hidden','true'); e.style.order=base; e.textContent=title;
    T.appendChild(e); labs.push([e,names]);
  });
  sync();
}
/* عنوان گروه فقط وقتی یکی از زبانه‌هایش پیداست */
function sync(){ labs.forEach(([e,names])=>{ const any=names.some(n=>{ const i=idx(n); return i>-1 && tabs[i] && !tabs[i].hidden; }); if(e.hidden===any) e.hidden=!any; }); }
setTimeout(()=>{ try{ setup(); new MutationObserver(sync).observe(T,{subtree:true,attributes:true,attributeFilter:['hidden']}); }catch(e){} },60);
})();
