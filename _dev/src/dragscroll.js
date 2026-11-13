/* ردیف‌های دکمه که به چپ و راست جا نمی‌شوند (.chips.scroll، .seg): روی کامپیوتر با موس بکشید، یا چرخ موس (بدون نیاز به Shift).
   کشیدن بیش از ۶ پیکسل = اسکرول، و آن ضربه دیگر دکمه را نمی‌زند. لمس گوشی دست نمی‌خورد (خود مرورگر اسکرول می‌کند). */
(function(){
  const SEL='.chips.scroll,.seg';
  const can=el=>el && el.scrollWidth>el.clientWidth+2;
  let d=null, eat=false;
  document.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse'||e.button!==0) return; const el=e.target.closest(SEL); if(!can(el)) return;
    d={el,x:e.clientX,sl:el.scrollLeft,moved:false}; eat=false; },true);
  document.addEventListener('pointermove',e=>{ if(!d) return; const dx=e.clientX-d.x; if(!d.moved && Math.abs(dx)<6) return;
    if(!d.moved){ d.moved=true; d.el.style.cursor='grabbing'; d.el.style.userSelect='none'; }
    d.el.scrollLeft=d.sl-dx; e.preventDefault(); },true);
  const up=()=>{ if(!d) return; if(d.moved){ eat=true; setTimeout(()=>{ eat=false; },0); } d.el.style.cursor=''; d.el.style.userSelect=''; d=null; };
  document.addEventListener('pointerup',up,true); document.addEventListener('pointercancel',up,true);
  document.addEventListener('click',e=>{ if(eat){ e.preventDefault(); e.stopPropagation(); eat=false; } },true);
  document.addEventListener('wheel',e=>{ const el=e.target.closest(SEL); if(!can(el)||Math.abs(e.deltaY)<=Math.abs(e.deltaX)) return;
    const max=el.scrollWidth-el.clientWidth, before=el.scrollLeft; el.scrollLeft=before+(document.dir==='rtl'||getComputedStyle(el).direction==='rtl'?-1:1)*e.deltaY;
    if(el.scrollLeft!==before) e.preventDefault(); },{passive:false,capture:true});
  try{ const st=document.createElement('style'); st.textContent='@media (hover:hover) and (pointer:fine){ .chips.scroll,.seg{cursor:grab} .chips.scroll .cp,.seg button{cursor:pointer} }'; document.head.appendChild(st); }catch(e){}
})();
