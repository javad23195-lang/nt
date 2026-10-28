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
  const b=document.body; if(!b.classList.contains('ws-'+cur)){ b.classList.remove('ws-nt','ws-kh'); b.classList.add('ws-'+cur); } ['ntKSet','ntKQuick'].forEach(id=>{ const e=$(id); if(e) e.hidden=cur!=='kh'; });
  const one=cur==='kh' && khSolo(); if(b.classList.contains('ntkh1')!==one) b.classList.toggle('ntkh1',one);
  /* نام واحد در سربرگ و منوی کناری */
  document.querySelectorAll('.topbar .brand .un').forEach(e=>{ if(e.dataset.u0===undefined) e.dataset.u0=e.textContent; const t=cur==='kh'?'واحد تدارکات':e.dataset.u0; if(e.textContent!==t) e.textContent=t; });
  const sw=$('ntWsBtn'); if(sw){ sw.hidden=!both(); const o=cur==='nt'?'kh':'nt'; const t=cur==='kh'?'تغییر واحد':'رفتن به بخش «'+NAME[o]+'»'; if(sw.dataset.t!==t){ sw.dataset.t=t; sw.innerHTML=ico('swap')+'<span>'+t+'</span>'; } }
}
/* آیکن‌های صفحه انتخاب (طرح تازه): خطی، سرمه‌ای */
const WS_I={nt:'<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.1-3.1a5 5 0 01-6.6 6.6L7.6 19.4a2 2 0 01-2.9-2.9l6.6-6.6a5 5 0 016.6-6.6z"/><path d="M3 5.5L5.5 3l4 4-2.5 2.5zM13.5 14.5l6.5 6.5"/></svg>',
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
#ntWs{position:fixed;inset:0;z-index:300;background:#F3F1EC;color:#1B2430;display:flex;flex-direction:column;overflow:auto}
#ntWs[hidden]{display:none}
#ntWs .wbody{width:100%;max-width:560px;margin:0 auto;padding:16px 18px 30px;padding-top:calc(14px + env(safe-area-inset-top))}
#ntWs .wtop{display:flex;align-items:center;gap:10px;margin-bottom:22px}
#ntWs .wtop .tt{flex:1;min-width:0}
#ntWs .wtop b{display:block;font-size:1.75rem;font-weight:900;line-height:1.3}
#ntWs .wtop small{display:block;color:#4E5864;font-size:.98rem;font-weight:800}
#ntWs .wsy{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;border:1px solid #DAD5CC;border-radius:20px;font-size:.86rem;font-weight:800;white-space:nowrap}
#ntWs .wsy i{width:9px;height:9px;border-radius:50%;background:#1C6B3A}
#ntWs .wsy.bad i{background:#A21F17}
#ntWs .wc{display:grid;grid-template-columns:1fr;gap:16px;align-items:start}
@media (min-width:900px){ #ntWs .wc{grid-template-columns:1fr 1fr} #ntWs .wbody{max-width:1000px} }
#ntWs .wb{border:1px solid #DAD5CC;border-radius:22px;background:#fff;color:#1B2430;overflow:hidden}
#ntWs .wb.last{border:2px solid #E6A52E}
#ntWs .wh{display:flex;align-items:flex-start;gap:14px;padding:20px 20px 0}
#ntWs .wh .tx{flex:1;min-width:0;text-align:end}
#ntWs .wh .lt{display:block;color:#8A5A00;font-size:.82rem;font-weight:900;margin-bottom:2px}
#ntWs .wh b{display:block;font-size:1.22rem;font-weight:900;line-height:1.45}
#ntWs .wh .d{display:block;font-size:.86rem;color:#4E5864;margin-top:2px}
#ntWs .wh .ic{flex:none;width:52px;height:52px;border-radius:18px;background:#EDEAE3;display:grid;place-items:center;color:#1B2430}
#ntWs .wb.last .wh .ic{background:#E6A52E}
#ntWs .wh .ic svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
#ntWs .wn{display:block;text-align:end;padding:12px 20px 14px;color:#A21F17;font-size:.92rem;font-weight:900}
#ntWs .wn.z{color:#1C6B3A}
#ntWs .wr{display:flex;align-items:center;gap:14px;width:100%;min-height:66px;padding:10px 20px;border:0;border-top:1px solid #DAD5CC;background:transparent;font:inherit;color:#1B2430;text-align:start;cursor:pointer}
#ntWs .wr:hover{background:#F7F5F0}
#ntWs .wr .ri{flex:none;width:26px;height:26px;display:grid;place-items:center}
#ntWs .wr .ri svg{width:24px;height:24px}
#ntWs .wr .rt{flex:1;min-width:0}
#ntWs .wr .rt b{display:block;font-size:1rem;font-weight:900;line-height:1.5}
#ntWs .wr .rt span{display:block;font-size:.9rem;color:#4E5864;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ntWs .wr .cv{flex:none;color:#4E5864;line-height:0}
#ntWs .wr .cv svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
#ntWs .we{display:block;padding:0 20px 20px;border-top:1px solid #DAD5CC}
#ntWs .we button{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:56px;margin-top:20px;border:1px solid #DAD5CC;border-radius:16px;background:#fff;font:inherit;font-size:1.05rem;font-weight:900;color:#1B2430;cursor:pointer}
#ntWs .we button svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
#ntWs .wr:focus-visible,#ntWs .we button:focus-visible{outline:3px solid #E6A52E;outline-offset:-3px}
body.ws-kh #ntQrScan,body.ws-kh #ntDevBtn{display:none!important}
#ntDrw .di.ws{border:1px dashed #9AA8B5;margin:2px 0 6px;color:#0B5C7A}
#ntWsBtn{display:none}
@media (min-width:1000px){ #ntWsBtn:not([hidden]){display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:0 0 8px;padding:0 12px;border:1px dashed #9AA8B5;border-radius:12px;background:transparent;font:inherit;font-weight:800;font-size:.86rem;color:#1B2430;cursor:pointer} }
`;
const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
const num=s=>{ try{ return JSON.parse(localStorage.getItem(s)||'null'); }catch(e){ return null; } };
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
/** کارهای باز هر بخش (فقط شمارش، از اطلاعات همین سیستم) */
/** کارهای باز هر بخش (فقط شمارش، از اطلاعات همین سیستم) — بخش خرید: «کار فوری» (آب، ضروری‌ها، خدمات بی‌شماره، تایید پیش‌فاکتور) */
function counts(){ let att=0, kh=0; const sees=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } };
  try{ const a=num('nt_alerts_v1'); att=+(a&&a.n)||0; }catch(e){}
  try{ kh=khUrgent(); }catch(e){}
  return {att,kh}; }
/* مأمور خرید (agent.js): کلید تهران _th_v1. numA = همه مأمورهای این سیستم، numC = مأمور جاری */
const AGS=()=>{ try{ return window.ntAg?ntAg.allowed():['nb']; }catch(e){ return ['nb']; } };
const AGC=()=>{ try{ return window.ntAg?ntAg.cur():'nb'; }catch(e){ return 'nb'; } };
const akey=(k,a)=>a==='th'?k.replace(/_v1$/,'_th_v1'):k;
const numA=k=>{ const o=[]; AGS().forEach(a=>{ const v=num(akey(k,a)); if(Array.isArray(v)) o.push(...v); }); return o; };
const numC=k=>num(akey(k,AGC()));
function khUrgent(){ const sees=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } }; let k=0;
  const jd=()=>{ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()), g=t=>+p.find(x=>x.type===t).value; return [g('year'),g('month'),g('day')]; }catch(e){ return null; } };
  const dn=s=>{ const m=/^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(String(s||'')); if(!m) return null; const y=+m[1], mo=+m[2], d=+m[3]; return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; };
  if(sees('آب شیرین') && AGS().includes('nb')){ const w=num('nt_kwater_v1')||{}, T=(Array.isArray(w.trips)?w.trips:[]).map(t=>t&&t.d).filter(Boolean).sort(), t=jd(); const last=T[T.length-1];
    if(t){ const g=t[1]<=6?(+w.a||2):(+w.b||3), today=dn(t.join('/')); if(!last || today-dn(last)>=g) k++; } }
  if(sees('باکس سندپرداز')){ const b=numA('nt_kbox_v1'); (Array.isArray(b)?b:[]).forEach(x=>{ if(x&&x.imp&&!x.st&&!x.gone) k++; }); }
  if(sees('خدمات تدارکات')){ const v=numA('nt_ksvc_v1'); (Array.isArray(v)?v:[]).forEach(x=>{ if(x&&!x.done&&!x.no) k++; }); }
  let ap=false; try{ ap=!window.ntSync || !ntSync.canApprove || ntSync.canApprove(); }catch(e){}
  if(ap && sees('پیش‌فاکتور')){ const p=numA('nt_kpre_v1'); (Array.isArray(p)?p:[]).forEach(x=>{ if(x&&x.st==='wait') k++; }); }
  return k; }
/* صفحه انتخاب (طرح تازه): هر کارت = کارهای فوری آن واحد + دکمه «ورود به ...» */
const RI={
  bad:'<circle cx="12" cy="12" r="10" fill="#A21F17"/><path d="M12 7v6M12 16.5h.01" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  wait:'<path d="M6 2h12v2h-1.2v2.6c0 1.4-.6 2.7-1.7 3.6L13.2 12l1.9 1.8c1.1.9 1.7 2.2 1.7 3.6V20H18v2H6v-2h1.2v-2.6c0-1.4.6-2.7 1.7-3.6l1.9-1.8-1.9-1.8C7.8 9.3 7.2 8 7.2 6.6V4H6z" fill="#8A5A00"/><path d="M9.6 18.4h4.8" stroke="#F3D9A8" stroke-width="1.6" stroke-linecap="round"/>',
  svc:'<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="#8A5A00"/>',
  hand:'<path d="M13 24c-3.26 0-6.19-1.99-7.4-5.02l-3.03-7.61C2.26 10.58 3 9.79 3.81 10.05l.79.26c.56.18 1.02.61 1.24 1.16L7.25 15H8V3.25C8 2.56 8.56 2 9.25 2s1.25.56 1.25 1.25V12h1V1.25C11.5.56 12.06 0 12.75 0S14 .56 14 1.25V12h1V2.75c0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25V12h1V5.75c0-.69.56-1.25 1.25-1.25S21 5.06 21 5.75V16c0 4.42-3.58 8-8 8z" fill="#A21F17"/>',
  drop:'<path d="M12 2.7S5 10.4 5 15a7 7 0 0 0 14 0c0-4.6-7-12.3-7-12.3z" fill="#A21F17"/>',
  star:'<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#A21F17"/>',
  tool:'<path d="M18 16h-2v-1H8v1H6v-1H2v5h20v-5h-4zm2-8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v4h4v-2h2v2h8v-2h2v2h4v-4c0-1.1-.9-2-2-2zm-5 0H9V6h6v2z" fill="#A21F17"/>'};
const CHEV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>', ARR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
const seeT=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } };
const nl=a=>a.slice(0,3).join('، ')+(a.length>3?' و '+fa(a.length-3)+' دیگر':'');
/** کارهای «نگهداری و تعمیرات»: خلاصه‌ای که زبانه «امروز» در همین گوشی می‌نویسد + منتظر قطعه از «ثبت مشکلات» */
function ntRows(){ const R=[], S=num('nt_ws_nt_v1')||{};
  const bad=Array.isArray(S.bad)?S.bad:[], svc=Array.isArray(S.svc)?S.svc:[];
  if(bad.length) R.push({ic:'bad',t:fa(bad.length)+' دستگاه خراب',s:nl(bad),go:'امروز'});
  if(seeT('ثبت مشکلات')){ const M=num('nt_moshkel_v1'); const W=[...new Set((Array.isArray(M)?M:[]).filter(r=>r&&r.dev&&String(r.state||'').trim()==='منتظر قطعه'&&(!window.ntDept||!ntDept.mine||ntDept.mine(r.dev))).map(r=>String(r.dev)))];
    if(W.length) R.push({ic:'wait',t:fa(W.length)+' دستگاه منتظر قطعه',s:nl(W),go:'ثبت مشکلات'}); }
  if(svc.length) R.push({ic:'svc',t:fa(svc.length)+' سرویس گذشته',s:nl(svc),go:'دفترچه قرائت'});
  return {n:+S.n||0,R}; }
/** کارهای فوری «تدارکات» (همان کارت «فوری امروز» میز خرید) */
function khRows(){ const R=[];
  const jd=()=>{ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()), g=t=>+p.find(x=>x.type===t).value; return g('year')+'/'+g('month')+'/'+g('day'); }catch(e){ return ''; } };
  const dn=s=>{ const m=/^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(String(s||'')); if(!m) return null; const y=+m[1], mo=+m[2], d=+m[3]; return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; };
  const T=jd(), today=dn(T);
  let ap=false; try{ ap=!window.ntSync || !ntSync.canApprove || ntSync.canApprove(); }catch(e){}
  if(ap && seeT('پیش‌فاکتور')){ const P=numA('nt_kpre_v1').filter(x=>x&&x.st==='wait'); if(P.length) R.push({ic:'hand',t:fa(P.length)+' پیش‌فاکتور منتظر تایید شما',s:String(P[0].title||''),go:'پیش‌فاکتور',k:'ntp_pane',p:'open',iq:P[0].id}); }
  if(seeT('آب شیرین') && AGS().includes('nb')){ const w=num('nt_kwater_v1')||{}, L=(Array.isArray(w.trips)?w.trips:[]).map(t=>t&&t.d).filter(Boolean).sort(), last=L[L.length-1], mo=+String(T).split('/')[1]||1, gap=mo<=6?(+w.a||2):(+w.b||3);
    const dl=dn(last), ds=dl!=null&&today!=null?today-dl:null; if(ds==null || ds>=gap) R.push({ic:'drop',t:'نوبت آوردن آب شیرین است',s:ds==null?'هنوز نوبتی ثبت نشده':fa(ds)+' روز از آخرین نوبت',go:'لیست خرید',k:'ntk_pane',p:'water'}); }
  if(seeT('باکس سندپرداز')){ const B=numA('nt_kbox_v1').filter(x=>x&&x.imp&&!x.st&&!x.gone); if(B.length){ const lt=B.filter(x=>{ const d=dn(x.need); return d!=null&&today!=null&&today-d>0; }).length;
    R.push({ic:'star',t:fa(B.length)+' قلم ضروری خریده نشده',s:lt?fa(lt)+' قلم از تاریخ نیاز گذشته':'از باکس سندپرداز',go:'لیست خرید',k:'ntk_pane',p:'box',bf:'imp'}); } }
  if(seeT('خدمات تدارکات')){ const V=numA('nt_ksvc_v1').filter(x=>x&&!x.done&&!x.no); if(V.length) R.push({ic:'tool',t:fa(V.length)+' خدمات بدون شماره ثبت',s:String(V[0].title||''),go:'لیست خرید',k:'ntk_pane',p:'svc'}); }
  return R; }
function chooser(){
  let el=$('ntWs'); if(!el){ el=document.createElement('div'); el.id='ntWs'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','ntWsT'); document.body.appendChild(el);
    el.addEventListener('click',e=>{ const r=e.target.closest('[data-wr]'); if(r){ const o=(el._rows||{})[r.dataset.wr]; el.hidden=true; set(r.dataset.w);
        if(o){ try{ if(o.k) localStorage.setItem(o.k,o.p); if(o.bf) localStorage.setItem('ntk_bf',o.bf); if(o.iq) localStorage.setItem('ntp_open',o.iq); }catch(x){} try{ window.postMessage({nt:'go',tab:o.go},'*'); }catch(x){} } return; }
      const b=e.target.closest('[data-ws]'); if(!b) return; el.hidden=true; set(b.dataset.ws); }); }
  const co=document.querySelector('.topbar .brand .co'), un=document.querySelector('.topbar .brand .un');
  const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let who=''; try{ who=(window.ntSync&&ntSync.myName&&ntSync.myName())||''; }catch(e){}
  if(!who && co) who=String(co.textContent||'').trim().split(/\s+/)[0]||'';
  const draw=()=>{ if(el.hidden) return;
    const sb=$('ntSyBtn'), sl=sb&&sb.querySelector('.l'), slt=sl?sl.textContent.trim():'', syt=slt?(/همگام/.test(slt)?slt:'همگام '+slt):'';
    const last=ls('ntws_last')==='kh'?'kh':'nt', unN=(un&&(un.dataset.u0||un.textContent))||'واحد نگهداری و تعمیرات';
    const N=ntRows(); let K=[]; try{ K=khRows(); }catch(e){} let kn=0; try{ kn=K.length; }catch(e){}
    const rows={}; let i=0;
    const row=(w,o)=>{ const id='r'+(i++); rows[id]=o; return `<button type="button" class="wr" data-wr="${id}" data-w="${w}"><span class="ri"><svg viewBox="0 0 24 24" aria-hidden="true">${RI[o.ic]||''}</svg></span><span class="rt"><b>${esc(o.t)}</b>${o.s?`<span><bdi>${esc(o.s)}</bdi></span>`:''}</span><span class="cv">${CHEV}</span></button>`; };
    const card=(w,name,desc,n,lab,R)=>`<div class="wb${last===w?' last':''}"><div class="wh"><span class="ic">${WS_I[w]}</span><span class="tx">${last===w?'<span class="lt">آخرین واحدی که باز کردید</span>':''}<b>${esc(name)}</b><span class="d">${esc(desc)}</span></span></div>
      <span class="wn${n?'':' z'}">${n?fa(n)+' '+lab:'کار فوری نیست'}</span>${R.map(o=>row(w,o)).join('')}<span class="we"><button type="button" data-ws="${w}">ورود به ${esc(name)} ${ARR}</button></span></div>`;
    const html=`<div class="wbody"><div class="wtop"><div class="tt"><b id="ntWsT">سلام${who?'، '+esc(who):''}</b><small>کدام واحد را باز کنیم؟</small></div>${syt?`<span class="wsy${/نشد|نیست/.test(slt)?' bad':''}"><i></i>${esc(syt)}</span>`:''}</div>
      <div class="wc">${card('nt',unN,'توقف، قرائت، سرویس و خرابی دستگاه‌ها',Math.max(N.n,N.R.length),'نیاز به توجه',N.R)}${card('kh','واحد تدارکات','لیست خرید، پیش‌فاکتور و فاکتور خرید',kn,'کار فوری',K)}</div></div>`;
    if(el._h!==html){ el._h=html; el._rows=rows; el.innerHTML=html; } };
  el.hidden=false; draw();
  /* خلاصه «امروز» ممکن است کمی بعد برسد: تا وقتی صفحه باز است، هر ۲ ثانیه تازه شود */
  clearInterval(el._t); el._t=setInterval(()=>{ if(el.hidden){ clearInterval(el._t); return; } draw(); },2000);
}
const locked=()=>window.ntLocked || document.body.classList.contains('ntlocked') || document.body.classList.contains('ntpin') || document.body.classList.contains('ntdriver') || document.body.classList.contains('ntsplash');
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
/* عدد زبانه‌های خرید (نوار پایین و منوی کناری): لیست = کارهای فوری، پیش‌فاکتور = منتظر تایید، فاکتور = منتظر سندپرداز */
try{ if(typeof window.pending==='function'){ const P0=window.pending; const sees=n=>{ try{ return !window.ntSync || ntSync.canSee(n); }catch(e){ return true; } };
  window.pending=function(n){ try{
    if(n==='لیست خرید'){ let k=0; const W=num('nt_kwater_v1')||{}, b=numC('nt_kbox_v1'), v=numC('nt_ksvc_v1');
      if(sees('آب شیرین') && AGC()==='nb'){ try{ const T=(Array.isArray(W.trips)?W.trips:[]).map(t=>t&&t.d).filter(Boolean).sort(), last=T[T.length-1]; const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()), g=t=>+p.find(x=>x.type===t).value;
        const dn=s=>{ const m=/^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(String(s||'')); if(!m) return null; const y=+m[1], mo=+m[2], d=+m[3]; return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; };
        const gap=g('month')<=6?(+W.a||2):(+W.b||3); if(!last || dn(g('year')+'/'+g('month')+'/'+g('day'))-dn(last)>=gap) k++; }catch(e){} }
      if(sees('باکس سندپرداز')) (Array.isArray(b)?b:[]).forEach(x=>{ if(x&&x.imp&&!x.st&&!x.gone) k++; });
      if(sees('خدمات تدارکات')) (Array.isArray(v)?v:[]).forEach(x=>{ if(x&&!x.done&&!x.no) k++; });
      return k; }
    if(n==='پیش‌فاکتور'){ const p=numC('nt_kpre_v1'); return (Array.isArray(p)?p:[]).filter(x=>x&&x.st==='wait').length; }
    if(n==='فاکتور خرید'){ const f=numC('nt_factor_v1'); return (Array.isArray(f)?f:[]).filter(r=>r&&r.id&&r.cat==='kala'&&!r.sp).length; }
    if(n==='میز خرید') return 0;
  }catch(e){} return P0.apply(this,arguments); }; } }catch(e){}
/* دکمه رایانه: بالای فهرست زبانه‌ها */
(function(){ const T=$('tabs'); if(!T) return; const b=document.createElement('button'); b.type='button'; b.id='ntWsBtn'; b.hidden=true; T.insertBefore(b,T.firstChild);
  b.addEventListener('click',()=>set(cur==='nt'?'kh':'nt')); })();
apply();
setInterval(tick,700); setTimeout(tick,50);
window.ntWs={khUrgent,get cur(){ return cur; },set,both,has,wsOf,toggle:()=>set(cur==='nt'?'kh':'nt'),chooser,
  drw:()=>both()?`<button type="button" class="di ws" data-a="ws">${ico('swap')}<span>رفتن به بخش «${NAME[cur==='nt'?'kh':'nt']}»</span></button>`:''};
})();
