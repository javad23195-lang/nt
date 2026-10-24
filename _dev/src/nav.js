/* ============ نوار پایین و دکمه «+» (گوشی) ============
   فقط ظاهر و رفتن بین زبانه‌ها. هیچ اطلاعاتی نمی‌خواند و نمی‌نویسد.
   زبانه‌های قبلی در همان جا هستند (دسترسی، شمارنده، قفل ورود و حالت راننده همان قبل کار می‌کنند).
   روی صفحه متوسط (۹۰۰ تا ۹۹۹) زبانه‌های بالا؛ روی کامپیوتر (≥۱۰۰۰) منوی کناری سمت راست. */
(function(){
'use strict';
if(typeof DOCS==='undefined' || typeof tabs==='undefined' || typeof frames==='undefined') return;
const $=id=>document.getElementById(id);
const idx=n=>DOCS.findIndex(d=>d.name===n);
const vis=n=>{ const i=idx(n); return i>-1 && tabs[i] && !tabs[i].hidden; };
const canW=n=>{ try{ return !window.ntSync || window.ntSync.canWriteTab(n); }catch(e){ return true; } };
const ICON={
  today:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M8 15l3 3 5-5"/>',
  plan:'<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  box:'<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>',
  more:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  stop:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M9 12h6"/>',
  warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  read:'<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM9 9h6M9 13h6"/>',
  doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
  wr:'<path d="M14 7a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 00-2-2z"/>',
  cart:'<path d="M3 4h2l2.4 11h10.2L20 7H6.2M9 20h.01M17 20h.01"/>',
  photo:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.5"/>',
  out:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
  id:'<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2 3-2s2.4.4 3 2M14 10h4M14 14h4"/>'
};
/* آیکون‌های تازه (سرمه‌ای + کهربایی) از uicons.js؛ ICON بالا فقط پشتیبان است */
const svg=k=>(window.NTI && NTI.P[k||'doc'])?NTI.svg(k||'doc'):`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]||ICON.doc}</svg>`;
const TABICON={'امروز':'today','مدیریت':'mgmt','برنامه روزانه':'plan','انبار':'box','دفترچه قرائت':'read','ثبت مشکلات':'warn','شناسنامه':'id','خدمات':'wr','درخواست خرید':'cart','توقف شیفت':'stop','برون‌سپاری':'out','عکس‌ها':'photo','تردد و اضافه‌کار':'clock','فاکتور خرید':'rcpt','میز خرید':'mgmt','لیست خرید':'plan','پیش‌فاکتور':'doc'};
const MAIN=['امروز','توقف شیفت','دفترچه قرائت','مدیریت'];
/* بخش خرید (ws.js): نوار پایین و دکمه «+» خودش */
const KMAIN=['میز خرید','لیست خرید','پیش‌فاکتور','فاکتور خرید'];
const KH=()=>!!(window.ntWs && ntWs.cur==='kh');
const KACTS=[
  ['فاکتور خرید','goAdd','ثبت فاکتور','فاکتور تازه، همین‌جا','rcpt','y','فاکتور خرید'],
  ['لیست خرید','goImp','ضروری‌ها','لیست باکس سندپرداز','star','b','باکس سندپرداز'],
  ['پیش‌فاکتور','goNew','پیش‌فاکتور تازه','استعلام قیمت','doc','g','پیش‌فاکتور'],
  ['لیست خرید','goWater','آب شیرین','ثبت آوردن آب','drop','r','آب شیرین']
];   /* مثل طرح تازه؛ [۶] = فرمی که اجازه ثبت آن لازم است؛ بقیه در منوی ☰ سربرگ (mhead.js) */
const KI={rcpt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M12 11v7M14 12.5c-.5-.7-1.2-1-2-1-1.1 0-2 .6-2 1.5s.9 1.3 2 1.5 2 .6 2 1.5-.9 1.5-2 1.5c-.8 0-1.5-.3-2-1"/>',drop:'<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>'};
Object.assign(KI,{layout:'<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M10 3.5v17M10 12h10.5"/>',list:'<path d="M11 6h10M11 12h10M11 18h10M3 6l1.5 1.5L7.5 4.5M3 12l1.5 1.5 3-3M3 18l1.5 1.5 3-3"/>'});
const KTI={'میز خرید':'layout','لیست خرید':'list','پیش‌فاکتور':'doc','فاکتور خرید':'rcpt'};
const kSvg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${KI[k]||KI.doc}</svg>`;
const actOk=a=>vis(a[0]) && canW(a[6]||a[0]);
/* کارهای دکمه «+»: [نام زبانه، دکمه افزودن داخل آن، عنوان، توضیح، آیکون، رنگ] */
const ACTS=[
  ['توقف شیفت','bNew','ثبت توقف','دستگاه ایستاد','stop','y'],
  ['ثبت مشکلات','xNew','ثبت مشکل','خرابی یا ایراد','warn','r'],
  ['انبار','oNew','خروج انبار','قطعه یا روغن','box','b'],
  ['دفترچه قرائت','mNew','قرائت دفترچه','ساعت کار','read','g']
];

const CSS=`
#ntNav,#ntFab,#ntNavBd,#ntNavSh,#ntTabInd{display:none}
@media (max-width:899px){
body.ntnav .tabs{display:none}
body.ntnav .topbar{background:#1B2430;border-bottom:3px solid #E6A52E;padding:10px 12px 10px;padding-top:calc(10px + env(safe-area-inset-top));
  display:flex;flex-wrap:wrap;align-items:center;gap:8px}
body.ntnav .brand{display:flex;order:1;flex:1;min-width:0;padding:0;color:#fff}
body.ntnav .brand{align-items:center;gap:10px}
body.ntnav .brand .lg{width:38px;height:38px;background:#fff;border-radius:50%;padding:3px;box-sizing:border-box;box-shadow:0 0 0 2px rgba(230,165,46,.55)}
body.ntnav .brand .co{color:#E6A52E;font-size:.75rem}
body.ntnav .brand .un{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.ntnav .brand .tt{color:#fff;font-size:.95rem;font-weight:800}
body.ntnav .brand .dt{display:block;color:#AEB9C5;font-size:.74rem;font-weight:400;margin-top:2px}
body.ntnav .tabrow{order:2;flex:none;display:flex;gap:8px;align-items:center}
body.ntnav .sybar,body.ntnav .ntpwa{order:3;flex-basis:100%}
body.ntnav .topbar button:not(.tab){background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:14px}
body.ntnav .topbar button:not(.tab) svg{stroke:#fff}
body.ntnav:not(.ntlocked):not(.ntdriver) #ntNav{display:flex}
body.ntnav:not(.ntlocked):not(.ntdriver) #ntFab.has{display:grid}
#ntNav{flex:none;position:relative;justify-content:space-around;align-items:flex-start;height:calc(70px + env(safe-area-inset-bottom));
  padding:8px 4px env(safe-area-inset-bottom);background:#fff;border-top:1px solid #DDE3E9;box-shadow:0 -4px 14px rgba(27,36,48,.07);z-index:40}
.ntnb{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;width:64px;min-height:52px;padding:2px 0 0;
  background:none;border:0;font:inherit;font-size:.7rem;font-weight:700;color:#5B6874;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ntnb svg,.ntfab svg,.ntac .ic svg,.ntmr svg{stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ntnb svg{width:26px;height:26px;color:#2B3846}
.ntnb.on svg{color:#1B2430}
.ntnbw{display:contents}
#ntNavBub{position:absolute;left:0;top:8px;width:56px;height:32px;border-radius:16px;background:#E6A52E;box-shadow:0 2px 6px rgba(185,126,16,.35);opacity:0;pointer-events:none;z-index:0;transition:opacity .2s}
.ntnb{z-index:1}
.ntnb svg{transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.ntnb.on{color:#1B2430;font-weight:800}
.ntnb.on svg{transform:translateY(-1px) scale(1.08)}
.ntnb.on::after{content:none}
.ntnb .b{position:absolute;top:-5px;left:auto;right:calc(50% + 5px);inset-inline-end:auto;min-width:17px;height:17px;padding:0 3px;border-radius:9px;background:#C0392B;color:#fff;font-size:.7rem;font-weight:800;display:none;align-items:center;justify-content:center;border:2px solid #fff;box-sizing:content-box}
.ntnb .b.show{display:flex}
.ntnb:focus-visible,.ntfab:focus-visible,.ntac:focus-visible,.ntmr:focus-visible{outline:3px solid #1B2430;outline-offset:2px}
.ntsp{width:64px;flex:none}
.ntfab{position:fixed;left:50%;bottom:calc(8px + env(safe-area-inset-bottom));transform:translateX(-50%);width:56px;height:56px;border-radius:50%;
  background:#E6A52E;color:#1B2430;border:0;place-items:center;cursor:pointer;z-index:72;box-shadow:0 4px 12px rgba(185,126,16,.45);-webkit-tap-highlight-color:transparent}
.ntfab svg{width:30px;height:30px;stroke-width:2.6;transition:transform .18s}
.ntfab.open svg{transform:rotate(45deg)}
#ntNavBd{position:fixed;inset:0;background:rgba(18,25,33,.55);z-index:70}
#ntNavBd.on{display:block}
#ntNavSh{position:fixed;inset-inline:0;bottom:0;background:#fff;border-radius:24px 24px 0 0;padding:10px 16px calc(92px + env(safe-area-inset-bottom));z-index:71;max-height:86vh;overflow:auto}
#ntNavSh.on{display:block}
#ntNavSh .h{width:44px;height:5px;border-radius:3px;background:#CBD3DB;margin:0 auto 12px}
#ntNavSh h3{margin:0 0 10px;font-size:.98rem;color:#17212B}
.ntacts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ntac{position:relative}.ntac>.b{position:absolute;top:10px;inset-inline-end:10px;min-width:22px;height:22px;border-radius:11px;background:#C0392B;color:#fff;font-size:.72rem;display:none;align-items:center;justify-content:center;padding:0 6px}.ntac>.b.show{display:flex}
.ntac.cur,.ntmr.cur{border-color:#E6A52E;box-shadow:inset 0 0 0 1.5px #E6A52E}
.ntfab[data-b]:not([data-b=""])::after{content:attr(data-b);position:absolute;top:-2px;inset-inline-end:-2px;min-width:22px;height:22px;border-radius:11px;background:#C0392B;color:#fff;font-size:.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 6px;border:2px solid #fff}
.ntac{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:104px;padding:12px;border-radius:16px;border:1px solid #DDE3E9;background:#F3F5F7;font:inherit;color:#17212B;text-align:start;cursor:pointer}
.ntac .ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#fff;color:#1B2430;box-shadow:inset 0 0 0 1.5px #F1D9A8}
.ntac .ic svg{width:26px;height:26px}
.ntac.r .ic{background:#FBE5E2;color:#B3261E}.ntac.b .ic{background:#E2EEFA;color:#1F5F99}.ntac.g .ic{background:#E3F4EA;color:#1E7F4F}
.ntac b{font-size:.92rem}.ntac span{font-size:.74rem;color:#5B6874}
.ntmore{display:flex;flex-direction:column;gap:8px}
.ntmr{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:14px;border:1px solid #DDE3E9;background:#F3F5F7;font:inherit;font-size:.92rem;font-weight:700;color:#17212B;cursor:pointer;position:relative}
.ntmr svg{width:26px;height:26px;color:#1B2430}
.ntmr .b{margin-inline-start:auto;min-width:22px;height:22px;border-radius:11px;background:#C0392B;color:#fff;font-size:.72rem;display:none;align-items:center;justify-content:center;padding:0 6px}
.ntmr .b.show{display:flex}
/* بخش خرید (طرح v2): نوار پایین شناور تیره، دکمه + مربعی کهربایی، عدد قرمز روشن */
body.ws-kh #ntNav{position:fixed;left:12px;right:12px;bottom:calc(10px + env(safe-area-inset-bottom));height:76px;padding:0 6px;border-radius:26px;background:#1B2430;border:0;box-shadow:0 10px 28px rgba(27,36,48,.32);align-items:center;justify-content:space-around;z-index:60}
body.ws-kh #ntNavBub{display:none}
body.ws-kh .ntnb{width:auto;min-width:64px;min-height:56px;justify-content:center;gap:4px;color:#D5D8DC;font-size:.84rem;font-weight:800}
body.ws-kh .ntnb svg{color:#D5D8DC;width:28px;height:28px}
body.ws-kh .ntnb.on,body.ws-kh .ntnb.on svg{color:#E6A52E}
body.ws-kh .ntnb.on svg{transform:none}
body.ws-kh .ntnb .b{top:2px;right:calc(50% + 4px);min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:11px;background:#FF6B5E!important;color:#1B2430;border:0;font-weight:900;font-size:.74rem}
body.ws-kh .ntsp{width:72px}
body.ws-kh .ntfab{bottom:calc(19px + env(safe-area-inset-bottom));width:64px;height:60px;border-radius:18px;box-shadow:none;z-index:61}
body.ws-kh .ntfab svg{width:32px;height:32px;stroke-width:2.8}
html.ntdark body.ws-kh #ntNav,html.ntdark body.ws-kh .ntfab{filter:invert(1) hue-rotate(180deg)}
.ntkl{display:flex;flex-direction:column;gap:2px}
.ntkr{display:flex;align-items:center;gap:14px;min-height:58px;padding:6px 4px;border:0;background:none;font:inherit;color:#17212B;text-align:start;cursor:pointer;border-radius:12px}
.ntkr .ic{width:44px;height:44px;border-radius:12px;background:#F1F4F7;display:grid;place-items:center;color:#1B2430}
.ntkr .ic svg,.ntkr .cv{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ntkr b{flex:1;font-size:1rem;font-weight:800}
.ntkr .cv{color:#51606E;width:20px;height:20px}
body.ntkh1 #ntNav,body.ntkh1 #ntFab{display:none!important}
@media (prefers-reduced-motion:no-preference){ #ntNavSh.on{animation:ntUp .2s ease-out} @keyframes ntUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}} }
}`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
/* ---------- کامپیوتر (≥۱۰۰۰): منوی کناری سمت راست ---------- */
const CSSD=`
.tab .i svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:block}
@media (min-width:1000px){
body{flex-direction:row}
.topbar{width:236px;flex:none;height:100%;display:flex;flex-direction:column;background:#fff;border:0;border-inline-end:1px solid #DDE3E9;padding:18px 12px 14px;overflow-y:auto;overflow-x:hidden}
.topbar .brand{display:flex!important;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:6px 8px 16px;margin-bottom:10px;border-bottom:1px solid #EEF1F4;position:relative}
.topbar .brand::after{content:"";position:absolute;bottom:-1px;left:50%;width:56px;height:3px;margin-left:-28px;border-radius:3px;background:#E6A52E}
.topbar .brand .lg{width:64px;height:64px;padding:6px;box-sizing:border-box;border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(27,36,48,.10),0 0 0 1px #EEF1F4}
.topbar .brand .tt{color:#17212B;font-size:1rem;font-weight:800;line-height:1.45;flex:none;width:100%}
.topbar .brand .co{color:#8A6418;font-size:.74rem;font-weight:800;margin-bottom:1px}
.topbar .brand .un{font-size:.98rem;white-space:nowrap}
.topbar .brand .dt{display:block;color:#51606E;font-size:.76rem;font-weight:400;margin-top:3px}
.tabrow{flex:1;display:flex!important;flex-direction:column;align-items:stretch;gap:8px;min-height:0}
.tabs{flex-direction:column;overflow:visible!important;gap:2px;padding:0!important}
.tab{width:100%;justify-content:flex-start;border:0!important;border-radius:10px!important;min-height:44px;padding:0 12px!important;background:transparent!important;color:#3D4852!important;font-size:.93rem;font-weight:600!important;gap:12px}
.tab:hover{background:#F1F4F7!important;color:#17212B!important}
.tab .i{color:#2B3846!important;font-size:1rem;width:18px;display:flex;justify-content:center}
.tab.on{background:#E7F1F5!important;color:#0B5C7A!important;font-weight:800!important}
.tabs{position:relative}
.tab{position:relative;z-index:1}
#ntTabInd{display:block;position:absolute;top:0;left:0;right:0;height:44px;border-radius:10px;background:#E7F1F5;opacity:0;pointer-events:none;z-index:0}
#ntTabInd::before{content:"";position:absolute;inset-inline-start:-12px;top:9px;bottom:9px;width:4px;border-radius:0 4px 4px 0;background:#0B5C7A}
body.ntind .tab.on{background:transparent!important}
body.ntind .tab.on::before{display:none}
.tab.on .i{color:#0B5C7A!important}
.tab.on::before{content:"";position:absolute;inset-inline-start:-12px;top:9px;bottom:9px;width:4px;border-radius:0 4px 4px 0;background:#0B5C7A}
.tab .n{position:static!important;margin-inline-start:auto;min-width:22px;height:22px;border-radius:11px;font-size:.72rem;background:#C0392B!important;color:#fff!important;border:0!important}
.tab .n:not(.show){display:none!important}
#ntSyBtn,#ntQrScan,#ntDevBtn{width:100%;justify-content:center;min-height:44px;background:#F7F9FA!important;border:1px solid #D5DCE3!important;color:#17212B!important;border-radius:10px!important;font-size:.85rem!important}
#ntSyBtn svg,#ntQrScan svg,#ntDevBtn svg{stroke:#1B2430!important;color:#1B2430!important}
#ntSyBtn .tx,#ntQrScan .tx,#ntDevBtn .tx{display:inline!important}
#ntSyBtn.err{border-color:#C0392B!important;color:#8E2219!important}
.tabrow>.tabs+*{margin-top:auto}
.topbar .sybar{margin-top:8px}
.stage{flex:1;min-width:0;height:100%}
body.ntdriver .topbar{width:200px}
.tab,.tab .i svg,#ntSyBtn,#ntQrScan,#ntDevBtn{transition:background-color .18s,color .18s,transform .18s,box-shadow .18s}
#ntSyBtn:hover,#ntQrScan:hover,#ntDevBtn:hover{background:#EEF3F6!important;box-shadow:0 1px 4px rgba(27,36,48,.08)}
@media (prefers-reduced-motion:no-preference){
  .topbar .brand .lg{animation:ntLogo .8s cubic-bezier(.2,.8,.2,1) both}
  .topbar .brand .tt{animation:ntUp2 .5s .25s ease-out both}
  .topbar .brand::after{animation:ntLine .6s .45s ease-out both}
  .topbar .brand .lg:hover{animation:ntSpin .9s ease-in-out}
  .tab{animation:ntIn .38s ease-out both;animation-delay:calc(var(--k,0) * 45ms + .2s)}
  .tab:hover .i svg{transform:scale(1.15)}
  .tab:active{transform:scale(.98)}
  .tab.on::before{animation:ntBar .28s ease-out both;transform-origin:center}
  .tab.on .i svg{animation:ntPop .2s cubic-bezier(.23,1,.32,1)}
  .tab .n.show{animation:ntPop .2s cubic-bezier(.23,1,.32,1)}
  #ntSyBtn.ok .d{animation:ntPulse 2.4s ease-out infinite}
  @keyframes ntLogo{from{opacity:0;transform:rotate(-140deg) scale(.5)}to{opacity:1;transform:none}}
  @keyframes ntSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes ntUp2{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes ntLine{from{width:0;margin-left:0}to{width:56px;margin-left:-28px}}
  @keyframes ntIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
  @keyframes ntBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  @keyframes ntPop{0%{transform:scale(.88)}100%{transform:scale(1)}}
  @keyframes ntPulse{0%{box-shadow:0 0 0 0 rgba(30,142,90,.55)}70%{box-shadow:0 0 0 7px rgba(30,142,90,0)}100%{box-shadow:0 0 0 0 rgba(30,142,90,0)}}
}
}
@media (max-width:999px) and (prefers-reduced-motion:no-preference){
  body.ntnav .brand .lg{animation:ntLogoM .7s cubic-bezier(.2,.8,.2,1) both}
  .ntnb.on svg{animation:ntPopM .2s cubic-bezier(.23,1,.32,1)}
  .ntnb .b.show{animation:ntPopM .2s cubic-bezier(.23,1,.32,1)}
  @keyframes ntLogoM{from{opacity:0;transform:rotate(-140deg) scale(.5)}to{opacity:1;transform:none}}
  @keyframes ntPopM{0%{transform:scale(.88)}100%{transform:scale(1)}}
}`;
const CSSK=`
#ntKQuick,#ntKSet{display:none}
body:not(.ws-kh) #ntKSet,body:not(.ws-kh) #ntKQuick{display:none!important}
@media (min-width:1000px){
body.ws-kh{background:#F3F1EC}
body.ws-kh .topbar{width:264px;background:#F3F1EC;border-inline-end:1px solid #DAD5CC;padding:20px 16px 16px}
body.ws-kh .topbar .brand{flex-direction:row;align-items:center;text-align:start;gap:12px;padding:0 4px 18px;margin-bottom:0;border-bottom:0}
body.ws-kh .topbar .brand::after{display:none}
body.ws-kh .topbar .brand .lg{width:48px;height:48px;padding:4px;animation:none}
body.ws-kh .topbar .brand .tt{text-align:start;width:auto;flex:1}
body.ws-kh .topbar .brand .co{color:#8A5A00;font-size:.8rem}
body.ws-kh .topbar .brand .un{font-size:1.02rem;font-weight:900}
body.ws-kh .topbar .brand .dt{display:none}
body.ws-kh #ntKQuick{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:56px;margin:0 0 14px;border:0;border-radius:14px;background:#E6A52E;color:#1B2430;font:inherit;font-size:1.05rem;font-weight:900;cursor:pointer}
body.ws-kh #ntKQuick svg{width:26px;height:26px;stroke:currentColor;stroke-width:2.8;fill:none;stroke-linecap:round}
body.ws-kh .tab{min-height:56px;font-size:1.05rem;font-weight:800!important;color:#1B2430!important;border-radius:14px!important;gap:14px;padding:0 14px!important}
body.ws-kh .tab .i{color:#1B2430!important;width:24px}
body.ws-kh .tab .i svg{width:24px;height:24px}
body.ws-kh .tab.on,body.ws-kh .tab:hover{background:#EDEAE3!important;color:#1B2430!important}
body.ws-kh .tab.on::before,body.ws-kh #ntTabInd::before{display:none}
body.ws-kh #ntTabInd{background:#EDEAE3;height:56px;border-radius:14px}
body.ws-kh .tab .n{min-width:30px;height:30px;border-radius:15px;background:#A21F17!important;font-size:.82rem}
body.ws-kh .tab .tl{display:none}
body.ws-kh #ntKSet{display:flex}
body.ws-kh #ntHam{display:none!important}
body.ws-kh #ntMenuBtn,body.ws-kh #ntSyBtn{display:none!important}
body.ws-kh #ntWsBtn svg{width:20px;height:20px;fill:none!important;stroke:#1B2430!important;color:#1B2430!important}
body.ws-kh #ntWsBtn:not([hidden]){order:10000;margin:auto 0 0;min-height:52px;justify-content:center;border:1px solid #DAD5CC;border-radius:14px;background:transparent;font-size:.98rem}
body.ws-kh .tabrow>.tabs+*{margin-top:0}
body.ws-kh #ntSyBtn,body.ws-kh #ntThBtn{min-height:40px!important;background:transparent!important;border-color:#DAD5CC!important;font-size:.82rem!important}
}
.tab .ts{display:none}
@media (min-width:1000px){ body.ws-kh .tab .ts{display:inline} }`;
const stD=document.createElement('style'); stD.textContent=CSSD+CSSK; document.head.appendChild(stD);
/* منوی کناری بخش خرید: «ثبت سریع» (فاکتور تازه) بالای زبانه‌ها و «تنظیم» (تنظیم فاکتور) پایین آن‌ها */
try{ const T=$('tabs');
  const q=document.createElement('button'); q.type='button'; q.id='ntKQuick'; q.hidden=!document.body.classList.contains('ws-kh'); q.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>ثبت سریع'; T.parentNode.insertBefore(q,T);
  q.addEventListener('click',()=>{ const a=KACTS.find(actOk); if(a) go(a[0],a[1]); });
  const g=document.createElement('button'); g.type='button'; g.id='ntKSet'; g.className='tab'; g.hidden=!document.body.classList.contains('ws-kh'); g.style.order='-1'; g.innerHTML='<span class="i"><svg viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg></span><span class="ts">تنظیم</span>';
  T.appendChild(g); g.addEventListener('click',()=>{ try{ localStorage.setItem('ntf_pane','set'); }catch(e){} go('فاکتور خرید'); try{ const i=idx('فاکتور خرید'); frames[i].contentWindow.postMessage({nt:'show'},'*'); }catch(e){} });
  /* نام کوتاه زبانه‌های خرید در منوی کناری (میز، لیست، پیش‌فاکتور، فاکتور) */
  const SH={'میز خرید':'میز','لیست خرید':'لیست','پیش‌فاکتور':'پیش‌فاکتور','فاکتور خرید':'فاکتور'};
  const KO={'میز خرید':-8,'لیست خرید':-6,'پیش‌فاکتور':-4,'فاکتور خرید':-2};
  setTimeout(()=>{tabs.forEach((t,i)=>{ const n=DOCS[i].name; if(!SH[n]) return; t.style.order=KO[n]; const ie=t.querySelector('.i'); if(ie && KTI[n]) ie.innerHTML=kSvg(KTI[n]); [...t.childNodes].forEach(c=>{ if(c.nodeType===3 && c.textContent.trim()===n){ const a=document.createElement('span'); a.className='tl'; a.textContent=n; const b=document.createElement('span'); b.className='ts'; b.textContent=SH[n]; c.replaceWith(a,b); } }); }); },0);
}catch(e){}
try{ tabs.forEach((t,i)=>{ t.style.order=DOCS[i].name==='مدیریت'?1:i*2; t.style.setProperty('--k',i); const k=TABICON[DOCS[i].name]; const e=t.querySelector('.i'); if(k && e) e.innerHTML=svg(k); }); }catch(e){}

document.body.classList.add('ntnav');

const nav=document.createElement('nav'); nav.id='ntNav'; nav.setAttribute('aria-label','منوی اصلی');
/* حباب متحرک زیر گزینه فعال (گوشی) و نشانگر متحرک منوی کناری (کامپیوتر) — فقط ظاهر */
const bub=document.createElement('span'); bub.id='ntNavBub'; bub.setAttribute('aria-hidden','true');
const navIn=document.createElement('div'); navIn.className='ntnbw'; nav.append(bub,navIn);
const ind=document.createElement('span'); ind.id='ntTabInd'; ind.setAttribute('aria-hidden','true'); try{ $('tabs').prepend(ind); document.body.classList.add('ntind'); }catch(e){}
const calm=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
let bubX=null, indY=null;
function moveBub(){ const b=(openKind==='more'&&nav.querySelector('[data-more]'))||nav.querySelector('.ntnb.on'); if(!b || !nav.offsetWidth){ bub.style.opacity='0'; return; }
  const x=b.offsetLeft+b.offsetWidth/2-26; bub.style.opacity='1';
  if(bubX!==null && bubX!==x && !calm() && bub.animate){ const d=x-bubX; bub.animate([{transform:`translateX(${bubX}px)`},{transform:`translateX(${bubX+d*.55}px) scaleX(1.45)`,offset:.45},{transform:`translateX(${x}px) scaleX(.92)`,offset:.8},{transform:`translateX(${x}px)`}],{duration:480,easing:'cubic-bezier(.3,.7,.3,1)'}); }
  bub.style.transform=`translateX(${x}px)`; bubX=x; }
function moveInd(){ const t=tabs.find(x=>x.classList.contains('on') && !x.hidden); if(!t || !t.offsetHeight || getComputedStyle(ind).display==='none'){ indY=null; return; }
  const y=t.offsetTop, h=t.offsetHeight; ind.style.height=h+'px'; ind.style.opacity='1';
  if(indY!==null && indY!==y && !calm() && ind.animate){ const d=y-indY; ind.animate([{transform:`translateY(${indY}px)`},{transform:`translateY(${indY+d*.6}px) scaleY(1.25)`,offset:.5},{transform:`translateY(${y}px)`}],{duration:420,easing:'cubic-bezier(.3,.7,.3,1)'}); }
  ind.style.transform=`translateY(${y}px)`; indY=y; }
window.addEventListener('resize',()=>{ bubX=null; indY=null; moveBub(); moveInd(); });
const fab=document.createElement('button'); fab.id='ntFab'; fab.type='button'; fab.className='ntfab'; fab.setAttribute('aria-label','ثبت تازه'); fab.setAttribute('aria-haspopup','dialog'); fab.innerHTML=svg('plus');
const bd=document.createElement('div'); bd.id='ntNavBd';
const sh=document.createElement('div'); sh.id='ntNavSh'; sh.setAttribute('role','dialog'); sh.setAttribute('aria-modal','true');
document.body.append(nav,bd,sh,fab);

function badgeOf(name){ const i=idx(name); const e=$('badge'+i); return e&&e.classList.contains('show')?String(e.textContent).replace(/[^\d۰-۹٠-٩]/g,''):''; }
/** عدد نوار پایین: بیشتر از ۹۹ → «۹۹+» تا آیکون را نپوشاند */
const cap99=v=>{ const n=+String(v||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)); return n>99?'۹۹+':String(v||''); };  /* فقط رقم (امن برای innerHTML) */
function activeName(){ const i=tabs.findIndex(t=>t.classList.contains('on')); return i>-1?DOCS[i].name:''; }
function rest0(){ return DOCS.map(d=>d.name).filter(n=>MAIN.indexOf(n)<0 && vis(n)); }
/* نوار پایین: زبانه‌های اصلی؛ اگر کاربر آن‌ها را ندارد، جای خالی (تا ۴ دکمه) با زبانه‌های دیگرش پر می‌شود و همان‌ها در «بیشتر» تکرار نمی‌شوند */
function barTabs(){ if(KH()) return KMAIN.filter(vis); const m=MAIN.filter(vis), r=rest0(); while(r.length && m.length<4) m.push(r.shift()); return m; }   /* «بیشتر» نیست: همه زبانه‌ها در منوی ☰ */
function others(){ const b=barTabs(); return rest0().filter(n=>b.indexOf(n)<0); }
/* کاربر محدود (بدون «امروز» و «برنامه روزانه»): نوار پایین فقط دکمه وسط؛ همه زبانه‌ها یک بار در برگه همان دکمه */
const solo=()=>!KH() && !vis('امروز') && !vis('برنامه روزانه');
const curActs=()=>KH()?KACTS:ACTS;
const soloActs=()=>curActs().filter(actOk);
const soloTabs=()=>{ const A=soloActs().map(a=>a[0]); return DOCS.map(d=>d.name).filter(n=>vis(n) && A.indexOf(n)<0); };
function paint(){
  if(solo()){ navIn.innerHTML=''; if(!document.body.classList.contains('ntsolo')) document.body.classList.add('ntsolo');   /* بدون تغییر بی‌جا: body زیر نظر است */ fab.classList.add('has');
    const tot=DOCS.reduce((s,d)=>s+(vis(d.name)?(+String(badgeOf(d.name)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c))||0):0),0);
    fab.dataset.b=tot?(tot>99?'۹۹+':String(tot).replace(/\d/g,c=>'۰۱۲۳۴۵۶۷۸۹'[c])):'';
    requestAnimationFrame(()=>{ moveBub(); moveInd(); }); return; }
  if(document.body.classList.contains('ntsolo')) document.body.classList.remove('ntsolo'); delete fab.dataset.b;
  const act=activeName(), main=barTabs(), more=others();
  const mk=(n,label,icon,on,badge,extra)=>`<button type="button" class="ntnb${on?' on':''}" data-n="${n}" ${on?'aria-current="page"':''}>${KH()&&KTI[n]?kSvg(KTI[n]):svg(icon)}${label}<span class="b${badge?' show':''}">${cap99(badge)}</span></button>`;
  let h=''; const lab={'امروز':'امروز','مدیریت':'مدیریت','برنامه روزانه':'برنامه','انبار':'انبار','دفترچه قرائت':'قرائت','توقف شیفت':'توقف','ثبت مشکلات':'مشکلات','درخواست خرید':'خرید','برون‌سپاری':'برون‌سپاری','شناسنامه':'شناسنامه','خدمات':'خدمات','عکس‌ها':'عکس‌ها','تردد و اضافه‌کار':'تردد','میز خرید':'میز','لیست خرید':'لیست','پیش‌فاکتور':'پیش‌فاکتور','فاکتور خرید':'فاکتور'};
  const first=main.slice(0,2), last=main.slice(2);
  first.forEach(n=>h+=mk(n,lab[n]||n,TABICON[n],act===n,badgeOf(n)));
  h+='<span class="ntsp" aria-hidden="true"></span>';
  last.forEach(n=>h+=mk(n,lab[n]||n,TABICON[n],act===n,badgeOf(n)));
  if(false && more.length){ const faN=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]); const mb=more.reduce((s,n)=>s+(+badgeOf(n).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))||0),0);
    h+=`<button type="button" class="ntnb${more.indexOf(act)>-1?' on':''}" data-more="1">${svg('more')}بیشتر<span class="b${mb?' show':''}">${mb?(mb>99?'۹۹+':faN(mb)):''}</span></button>`; }
  navIn.innerHTML=h;
  requestAnimationFrame(()=>{ moveBub(); moveInd(); });
  const fi=KH()?'kh':'nt'; if(fab.dataset.ic!==fi){ fab.dataset.ic=fi; fab.innerHTML=KH()?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>':svg('plus'); }
  const canAdd=curActs().some(actOk);
  fab.classList.toggle('has',canAdd);
}
let openKind='';
function closeSheet(back){ openKind=''; requestAnimationFrame(moveBub); bd.classList.remove('on'); sh.classList.remove('on'); fab.classList.remove('open'); fab.setAttribute('aria-expanded','false'); if(back!==false){ try{ fab.focus(); }catch(e){} } }
function openSheet(kind){
  openKind=kind; let h='<div class="h"></div>';
  if(kind==='add' && solo()){
    const act=activeName(), A=soloActs(), T=soloTabs(), bd=n=>{ const b=badgeOf(n); return `<span class="b${b?' show':''}">${b}</span>`; };
    if(A.length){ h+='<h3>چه چیزی ثبت می‌کنید؟</h3><div class="ntacts">';
      A.forEach(a=>{ h+=`<button type="button" class="ntac ${a[5]}${act===a[0]?' cur':''}" data-n="${a[0]}" data-b="${a[1]}"><span class="ic">${svg(a[4])}</span><b>${a[2]}</b><span>${a[3]}</span>${bd(a[0])}</button>`; });
      h+='</div>'; }
    h+=`<h3${A.length?' style="margin-top:14px"':''}>${A.length?'بخش‌های دیگر':'بخش‌ها'}</h3><div class="ntmore">`;
    T.forEach(n=>{ h+=`<button type="button" class="ntmr${act===n?' cur':''}" data-n="${n}">${svg(TABICON[n])}${n}${bd(n)}</button>`; });
    h+='</div>';
  }else if(kind==='add' && KH()){
    /* بخش خرید (طرح تازه): فهرست با آیکن و فلش */
    h+='<div class="ntkl">';
    curActs().filter(actOk).forEach(a=>{ h+=`<button type="button" class="ntkr" data-n="${a[0]}" data-b="${a[1]}"><span class="ic">${kSvg(a[4])}</span><b>${a[2]}</b><svg class="cv" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>`; });
    h+='</div>';
  }else if(kind==='add'){
    h+='<h3>چه چیزی ثبت می‌کنید؟</h3><div class="ntacts">';
    curActs().filter(a=>vis(a[0]) && canW(a[0])).forEach(a=>{ h+=`<button type="button" class="ntac ${a[5]}" data-n="${a[0]}" data-b="${a[1]}"><span class="ic">${svg(a[4])}</span><b>${a[2]}</b><span>${a[3]}</span></button>`; });
    h+='</div>';
  }else{
    h+='<h3>زبانه‌های دیگر</h3><div class="ntmore">';
    others().forEach(n=>{ const b=badgeOf(n); h+=`<button type="button" class="ntmr" data-n="${n}">${svg(TABICON[n])}${n}<span class="b${b?' show':''}">${b}</span></button>`; });
    h+='</div>';
  }
  sh.innerHTML=h; bd.classList.add('on'); sh.classList.add('on'); requestAnimationFrame(moveBub);
  if(kind==='add'){ fab.classList.add('open'); fab.setAttribute('aria-expanded','true'); }
  const f=sh.querySelector('button'); if(f) try{ f.focus(); }catch(e){}
}
/** رفتن به زبانه و (اگر خواسته شد) زدن دکمه افزودن همان زبانه، بعد از بارگذاری */
function go(name,btn){
  const i=idx(name); if(i<0 || tabs[i].hidden) return;
  closeSheet(false); show(i);
  if(!btn) return; let n=0;
  const t=setInterval(()=>{ n++;
    try{ const d=frames[i].contentDocument, b=d && d.getElementById(btn);
      if(b && frames[i].dataset.loaded && d.readyState==='complete'){ clearInterval(t); setTimeout(()=>{ try{ b.click(); }catch(e){} },200); return; } }catch(e){}
    if(n>40) clearInterval(t); },150);
}
nav.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.more){ openKind==='more'?closeSheet():openSheet('more'); return; }
  if(b.dataset.n) go(b.dataset.n); });
fab.addEventListener('click',()=>{ try{ navigator.vibrate&&navigator.vibrate(10); }catch(e){} openKind==='add'?closeSheet():openSheet('add'); });
sh.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b && b.dataset.n) go(b.dataset.n,b.dataset.b); });
bd.addEventListener('click',()=>closeSheet());
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && openKind) closeSheet(); });

let q=0; const sched=()=>{ if(q) return; q=setTimeout(()=>{ q=0; paint(); },30); };
const mo=new MutationObserver(sched);
mo.observe($('tabs'),{subtree:true,childList:true,attributes:true,characterData:true,attributeFilter:['class','hidden']});
mo.observe(document.body,{attributes:true,attributeFilter:['class']});
paint();
window.ntNav={paint,openSheet,closeSheet,badgeOf,barTabs,vis};
/* اعلان کارهای فوری بخش خرید (تنظیم «اعلان کارهای فوری»؛ فقط همین گوشی، وقتی سامانه باز است):
   کار فوری تازه (نوبت آب، قلم ضروری، خدمات بی‌شماره، پیش‌فاکتور منتظر تایید شما) یک بار اعلان می‌شود. هیچ اطلاعاتی بیرون نمی‌رود. */
(function(){ const J=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
  const sees=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } };
  function keys(){ const K=[], T=[];
    try{ const W=J('nt_kwater_v1')||{}, tr=(Array.isArray(W.trips)?W.trips:[]).map(t=>t&&t.d).filter(Boolean).sort(), last=tr[tr.length-1]||'';
      if(sees('آب شیرین')){ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()), g=t=>+p.find(x=>x.type===t).value;
        const dn=s=>{ const m=/^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(String(s||'')); if(!m) return null; const y=+m[1], mo=+m[2], d=+m[3]; return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; };
        const gap=g('month')<=6?(+W.a||2):(+W.b||3), td=g('year')+'/'+g('month')+'/'+g('day'); if(!last || dn(td)-dn(last)>=gap){ K.push('w|'+td); T.push('نوبت آوردن آب شیرین است'); } } }catch(e){}
    try{ if(sees('باکس سندپرداز')) (J('nt_kbox_v1')||[]).forEach(x=>{ if(x&&x.imp&&!x.st&&!x.gone){ K.push('b|'+x.id); T.push('قلم ضروری: '+String(x.name||'').slice(0,40)); } }); }catch(e){}
    try{ if(sees('خدمات تدارکات')) (J('nt_ksvc_v1')||[]).forEach(x=>{ if(x&&!x.done&&!x.no){ K.push('s|'+x.id); T.push('خدمات بدون شماره: '+String(x.title||'').slice(0,40)); } }); }catch(e){}
    try{ const ap=!window.ntSync || !ntSync.canApprove || ntSync.canApprove(); if(ap && sees('پیش‌فاکتور')) (J('nt_kpre_v1')||[]).forEach(x=>{ if(x&&x.st==='wait'){ K.push('p|'+x.id); T.push('پیش‌فاکتور منتظر تایید: '+String(x.title||'').slice(0,40)); } }); }catch(e){}
    return {K,T}; }
  async function check(){ try{ if(localStorage.getItem('ntui_notify')!=='1' || typeof Notification==='undefined' || Notification.permission!=='granted') return;
      if(window.ntLocked || document.body.classList.contains('ntlocked')) return;
      const {K,T}=keys(), seen=new Set(J('ntui_nseen')||[]), fresh=K.map((k,i)=>[k,T[i]]).filter(([k])=>!seen.has(k)); localStorage.setItem('ntui_nseen',JSON.stringify(K.slice(0,500)));
      if(!fresh.length) return; const title=fresh.length===1?'کار فوری تازه':fa2(fresh.length)+' کار فوری تازه', body=fresh.slice(0,4).map(x=>x[1]).join('\n');
      let done=false; try{ const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration(); if(r&&r.showNotification){ await r.showNotification(title,{body,tag:'nt-kh',lang:'fa',dir:'rtl'}); done=true; } }catch(e){}
      if(!done) try{ new Notification(title,{body,tag:'nt-kh',lang:'fa',dir:'rtl'}); }catch(e){} }catch(e){} }
  const fa2=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  setTimeout(check,8000); setInterval(check,60000); })();
})();
