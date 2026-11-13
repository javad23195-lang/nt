/* ============ ظاهر یکدست (طرح نو، مرحله ۱): فونت، رنگ زمینه، کارت آرام، سربرگ روشن گوشی ============
   - فونت وزیرمتن (Vazirmatn، مجوز OFL؛ زیرمجموعه فارسی و لاتین، vazirmatn-sub.woff2) داخل خود صفحه است، نه از اینترنت؛
     build.py جای __NT_VZ_B64__ را با base64 فایل پر می‌کند. CSP: font-src data: مجاز است.
   - هر قاب (srcdoc) در srcFor یک <style id="ntLook"> می‌گیرد: فونت، زمینه کرم روشن (#F4F3F0)، خط‌های کم‌رنگ، سایه ملایم کارت.
   - گوشی: سربرگ پوسته روشن (نه سرمه‌ای). حالت تیره (theme.js) با invert کار می‌کند و به این رنگ‌ها وابسته نیست.
   فقط ظاهر؛ هیچ اطلاعاتی نمی‌خواند و نمی‌نویسد. */
(function(){
'use strict';
const VZ='__NT_VZ_B64__';
const FACE=VZ.length>100?`@font-face{font-family:'Vazirmatn';src:url(data:font/woff2;base64,${VZ}) format('woff2');font-weight:100 900;font-display:swap}`:'';
const BG='#F4F3F0', INK='#15212C', DIM='#5B6774', RULE='#E6E3DD', SH='0 1px 2px rgba(21,33,44,.05),0 4px 14px rgba(21,33,44,.045)';
/* --- پوسته --- */
const SHELL=FACE+`
html body{font-family:'Vazirmatn',Tahoma,sans-serif;background:${BG}}
button,input,select,textarea{font-family:inherit}
.stage{background:${BG}}
@media (max-width:899px){
  body.ntnav .topbar{background:${BG}!important;box-shadow:none!important;border-bottom:1px solid ${RULE}!important}
  #ntHT{color:${INK}!important;font-weight:850}
  html body.ntnav .topbar .brand .dt{color:#5E6670!important}
  #ntHam{background:#fff!important;box-shadow:${SH}}
  #ntHam svg{stroke:${INK}!important;color:${INK}!important;width:24px;height:24px}
  #ntHam .b{border-color:${BG}}
  body.ntnav .topbar #ntQrScan{background:#fff!important;border:0!important;box-shadow:${SH};color:${INK}!important}
  body.ntnav .topbar #ntQrScan svg{stroke:${INK}!important;color:${INK}!important}
  body.ntnav .topbar #ntSyBtn{background:#fff!important;border:0!important;box-shadow:${SH};color:${INK}!important}
  body.ntnav .topbar #ntSyBtn .l{color:${INK}!important}
  #ntMoon{background:#fff!important;box-shadow:${SH}}
  html.ntdark body.ntnav .topbar{filter:none!important}
  html.ntdark body.ntnav .topbar img{filter:invert(1) hue-rotate(180deg)!important}
}
`;
try{ const st=document.createElement('style'); st.id='ntLookShell'; st.textContent=SHELL; document.head.appendChild(st); }catch(e){}
/* --- قاب‌ها --- */
const FRAME=FACE+`
:root{--bg:${BG};--paper:${BG};--soft:#EFEDE8}
html body{font-family:'Vazirmatn',Tahoma,sans-serif;background-color:${BG}!important}
button,input,select,textarea{font-family:inherit}
`;
const FRAME_LIGHT=`
:root{--rule:${RULE}}
`;
function look(html,name){
  const light=/--bg\s*:/.test(html.slice(0,6000));   // خانواده‌های تازه (bg/card)؛ در خانواده قدیمی --rule رنگ تیره سربرگ است
  const css='<style id="ntLook">'+FRAME+(light?FRAME_LIGHT:'')+'</style>';
  const k=html.indexOf('</head>'); return k>-1?html.slice(0,k)+css+html.slice(k):css+html; }
try{ if(typeof window.srcFor==='function' && !window.srcFor.__look){ const f=window.srcFor;
  window.srcFor=function(i){ const h=f(i); try{ return look(h,(DOCS[i]||{}).name); }catch(e){ return h; } }; window.srcFor.__look=1; } }catch(e){}
window.ntLook={look};
})();
