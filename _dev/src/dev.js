/* ============ پرونده دستگاه ============
   به صفحه دستگاه (qr.js → home) یک بخش «پرونده» اضافه می‌کند: سرویس بعدی، این ماه (توقف، هزینه، خرید باز)،
   خرابی تکراری و آخرین رویدادها از همه بخش‌ها. فقط بخش‌هایی که کاربر اجازه دیدنشان را دارد.
   ورود: کارت ناوگان «امروز»، اسکن QR، دکمه «دستگاه‌ها» بالای صفحه، دکمه «پرونده» در دفترچه قرائت و تابلوی خرابی‌ها.
   فقط می‌خواند؛ چیزی ذخیره نمی‌کند. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fa=n=>esc(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const latin=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
const norm=s=>latin(s).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s\-_]+/g,'').toLowerCase();
const sep=n=>fa(Math.round(Number(n)).toLocaleString('en-US'));
const dec=n=>fa(n).replace('.','٫');
const faD=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const p2=n=>String(n).padStart(2,'0');
const LS=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
const rowsOf=k=>{ const o=LS(k); return o&&Array.isArray(o.rows)?o.rows:(Array.isArray(o)?o:[]); };
const S=()=>window.ntSync||null;
const canSee=n=>{ try{ return S()&&S().canSee?S().canSee(n):true; }catch(e){ return true; } };
const myDevs=()=>{ try{ return S()&&S().myDevs?S().myDevs():null; }catch(e){ return null; } };
const day=s=>{ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/.exec(latin(s).trim()); return m?`${m[1]}/${p2(+m[2])}/${p2(+m[3])}`:''; };
const today=()=>{ try{ return window.ntSvc?ntSvc.today():''; }catch(e){ return ''; } };

/* نام‌های دیگرِ هر دستگاه در بخش‌های مختلف (مثلاً «بیل PC290» در شناسنامه) — تکه‌ای که در نام هست */
const TOK={WA470:'wa470',ZL50:'zl50',LIFT6:'لیفتراک',PC290:'pc290',PC400:'pc400',GD705:'gd705',G1030:'1030',G700:'700kva',G220:'کوماتسو220',
  KIPOR:'کیپور',TRS01:'trs01',TRS02:'trs02',TRS03:'trs03',MYLER:'2624',ZAMYAD:'زامیاد',CAPRA:'کاپرا',CITRA:'سیترا'};
function isDev(dev,name){ const n=norm(name); if(!n) return false; if(n===norm(dev.name)) return true; const t=TOK[dev.id]; return !!(t && n.indexOf(t)>-1); }
const DEVS=()=>(window.ntQr&&ntQr.DEVS)||[];
function find(name){ return DEVS().find(d=>norm(d.name)===norm(name)) || DEVS().find(d=>isDev(d,name)) || null; }

/* ---------- داده‌ها ---------- */
function svcOf(dev){
  if(!canSee('دفترچه قرائت') || !window.ntSvc) return [];
  const items=LS('nt_svc_v1'); if(!Array.isArray(items)) return [];
  return ntSvc.all(items,LS('nt_daftar_v1')||[]).filter(x=>isDev(dev,x.it.dev));
}
function stopsMonth(dev){
  if(!window.ntStops) return null; const sh=canSee('توقف شیفت'), pg=canSee('برنامه روزانه'); if(!sh&&!pg) return null;
  const t=today(); if(!t) return null; const L=ntStops.list(t.slice(0,8)+'01',t.slice(0,8)+'31',{shift:sh,prog:pg}).filter(x=>isDev(dev,x.dev));
  return {min:L.reduce((a,x)=>a+(x.min||0),0),n:L.length,open:L.some(x=>x.min===null)};
}
function costMonth(dev){
  if(!canSee('شناسنامه') || !window.ntCost) return null; const t=today(); if(!t) return null;
  return ntCost.month(rowsOf('nt_sh8_v1').filter(r=>r&&isDev(dev,r.dev)),+t.slice(0,4),+t.slice(5,7));
}
function buysOpen(dev){
  if(!canSee('درخواست خرید')) return null;
  return rowsOf('nt_kharid9_v1').filter(r=>r && isDev(dev,r.unit) && !/لغو/.test(String(r.over||''))
    && (r.bought===''||r.bought==null||+latin(r.bought)<+latin(r.qty)));
}
function repeatOf(dev){ if(!canSee('شناسنامه') || !window.ntRepeat) return []; try{ return ntRepeat.find(rowsOf('nt_sh8_v1'),{days:30}).filter(x=>isDev(dev,x.dev)); }catch(e){ return []; } }
/** آخرین رویدادها از همه بخش‌ها: {d,k,t} — k: stop/fault/fix/rep/svc/buy */
function events(dev){
  const E=[], add=(d,k,t)=>{ d=day(d); if(d) E.push({d,k,t}); };
  if(window.ntStops && (canSee('توقف شیفت')||canSee('برنامه روزانه'))){
    ntStops.list('1300/01/01','1499/12/31',{shift:canSee('توقف شیفت'),prog:canSee('برنامه روزانه')}).filter(x=>isDev(dev,x.dev))
      .forEach(x=>add(x.day,'stop',`توقف: ${x.cause}${x.min===null?' (هنوز متوقف)':x.min?` — ${faD(Math.round(x.min/6)/10).replace('.','٫')} ساعت`:''}`));
  }
  if(canSee('ثبت مشکلات')) rowsOf('nt_moshkel_v1').filter(r=>r&&isDev(dev,r.dev)).forEach(r=>{
    add(`${r.y}/${r.m}/${r.d}`,'fault',`خرابی: ${r.sys||''} — ${r.desc||''}`);
    if(String(r.state||'').trim()==='بسته' && r.fix) add(r.fix,'fix',`رفع شد: ${r.desc||''}`); });
  if(canSee('شناسنامه')) rowsOf('nt_sh8_v1').filter(r=>r&&!r.xof&&isDev(dev,r.dev)).forEach(r=>add(r.st||r.reg||(r.y?`${r.y}/${r.m}/${r.d}`:''),'rep',`تعمیر: ${[r.type,r.desc].filter(Boolean).join(' — ')}`));
  if(canSee('دفترچه قرائت')){ const G=LS('nt_svc_log_v1'); (Array.isArray(G)?G:[]).filter(x=>x&&isDev(dev,x.dev)).forEach(x=>add(x.d,'svc',`سرویس: ${x.name||''}${x.at!=null?' در '+faD(Number(x.at).toLocaleString('en-US')).replace(/,/g,'٬'):''}${x.late?' (دیر)':''}`)); }
  if(canSee('درخواست خرید')) rowsOf('nt_kharid9_v1').filter(r=>r&&isDev(dev,r.unit)).forEach(r=>add(r.date,'buy',`درخواست خرید (${faD(r.qty||'')}): ${r.item||''}${/لغو/.test(String(r.over||''))?' — لغو شد':''}`));
  // رویدادهای یکسان (همان روز، همان متن) یکی شوند با «N بار»
  const M=new Map(); E.forEach(e=>{ const k=e.d+'|'+e.k+'|'+e.t, o=M.get(k); if(o) o.n++; else M.set(k,Object.assign(e,{n:1})); });
  return [...M.values()].sort((a,b)=>b.d.localeCompare(a.d));
}

const evLi=e=>`<li class="k-${e.k}"><span>${fa(e.d)}</span><bdi>${esc(e.t)}</bdi>${e.n>1?` <b class="pfn">${fa(e.n)} بار</b>`:''}</li>`;

/* ---------- شاخص‌های نگهداری یک ماه (آمادگی، MTBF، MTTR، سهم کار برنامه‌ای) ----------
   کارکرد = قرائت آخر ماه − قرائت قبل از ماه (دفترچه قرائت). خرابی = توقف‌های گروه «خرابی» (em) در توقف شیفت / برنامه روزانه.
   آمادگی = کارکرد ÷ (کارکرد + ساعت توقف خرابی) — فقط دستگاه‌های ساعتی. MTBF = کارکرد ÷ تعداد خرابی. MTTR = ساعت توقف خرابی ÷ تعداد خرابی.
   برنامه‌ای = توقف سرویس (pm) ÷ (سرویس + خرابی). */
function kpi(dev,y,m,toDay){
  const sh=canSee('توقف شیفت'), pg=canSee('برنامه روزانه'); if(!window.ntStops || (!sh&&!pg)) return null;
  const from=`${y}/${p2(m)}/01`, to=toDay||`${y}/${p2(m)}/31`;
  const L=ntStops.list(from,to,{shift:sh,prog:pg}).filter(x=>isDev(dev,x.dev));
  const em=L.filter(x=>x.cls==='em'), pm=L.filter(x=>x.cls==='pm');
  const n=em.length, D=em.reduce((a,x)=>a+(x.min||0),0)/60, P=pm.reduce((a,x)=>a+(x.min||0),0)/60;
  let run=null;
  if(canSee('دفترچه قرائت')){ const R=(LS('nt_daftar_v1')||[]).filter(x=>x&&isDev(dev,x.dev)&&isFinite(+x.val)).map(x=>({d:day(x.date),v:+x.val})).filter(x=>x.d).sort((a,b)=>a.d.localeCompare(b.d));
    const before=R.filter(x=>x.d<from), inM=R.filter(x=>x.d>=from&&x.d<=to);
    if(inM.length){ const base=before.length?before[before.length-1].v:inM[0].v, end=inM[inM.length-1].v; if(end>=base) run=end-base; } }
  const hourly=dev.unit==='ساعت';
  const avail=(hourly&&run!==null&&run>0)?Math.round(run/(run+D)*1000)/10:null;
  const mtbf=(run!==null&&run>0&&n)?run/n:null, mttr=n?D/n:null;
  const plan=(P+D)>0?Math.round(P/(P+D)*100):null;
  return {n,D,P,run,avail,mtbf,mttr,plan,hourly};
}
const prevYM=(y,m)=>m>1?[y,m-1]:[y-1,12];
function kpiHtml(dev){
  const t=today(); if(!t) return '';
  const y=+t.slice(0,4), m=+t.slice(5,7), K=kpi(dev,y,m,t); if(!K) return '';
  const [py,pm]=prevYM(y,m), Q=kpi(dev,py,pm);
  const u=esc(dev.unit), h1=v=>v>=100?sep(v):dec(Math.round(v*10)/10);
  const arrow=(a,b,up)=>{ if(a===null||b===null||!isFinite(a)||!isFinite(b)||Math.abs(a-b)<0.05*Math.max(1,Math.abs(b))) return '';
    const good=up?a>b:a<b; return `<i class="${good?'up':'dn'}">${a>b?'▲':'▼'}</i>`; };
  const cls=v=>v===null?'':(v>=90?'g':(v>=75?'o':'r'));
  const T=[];
  if(K.hourly) T.push(`<div class="pk ${cls(K.avail)}"><span>آمادگی</span><b>${K.avail===null?'—':dec(K.avail)+'٪'}${arrow(K.avail,Q&&Q.avail,true)}</b><small>${K.run!==null?h1(K.run)+' ساعت کار':'قرائت این ماه نیست'}</small></div>`);
  T.push(`<div class="pk"><span>MTBF · کار بین دو خرابی</span><b>${K.mtbf!==null?h1(K.mtbf)+' '+u:(K.n?'—':(K.run?'بدون خرابی':'—'))}${arrow(K.mtbf,Q&&Q.mtbf,true)}</b><small>${fa(K.n)} خرابی در این ماه</small></div>`);
  T.push(`<div class="pk"><span>MTTR · زمان هر تعمیر</span><b>${K.mttr!==null?h1(K.mttr)+' ساعت':'—'}${arrow(K.mttr,Q&&Q.mttr,false)}</b><small>${K.D?h1(K.D)+' ساعت توقف خرابی':'توقف خرابی ندارد'}</small></div>`);
  T.push(`<div class="pk"><span>کار برنامه‌ای</span><b>${K.plan===null?'—':fa(K.plan)+'٪'}${arrow(K.plan,Q&&Q.plan,true)}</b><small>سرویس در برابر خرابی</small></div>`);
  return `<h3>شاخص‌های این ماه <small class="pkq" title="▲▼ = نسبت به ماه قبل">نسبت به ماه قبل ▲▼</small></h3><div class="pkg">${T.join('')}</div>`;
}
/* ---------- بخش «پرونده» در صفحه دستگاه ---------- */
const ST={r:['گذشته','r'],o:['نزدیک','o'],g:['وقت هست','g'],n:['—','n']};
function fileHtml(dev){
  let h='';
  const sv=svcOf(dev);
  if(sv.length){
    h+=`<h3>سرویس‌ها</h3><div class="pfsv">${sv.slice(0,4).map(x=>{ const s=ST[x.st]||ST.n;
      const mo=window.ntSvc?(ntSvc.num(x.it.months)||12):12;
      const rem=(x.by==='time'&&x.days!==null&&(x.st==='r'||x.st==='o'))?(x.days<0?`${fa(-x.days)} روز از سقف ${fa(mo)} ماه گذشته`:`${fa(x.days)} روز تا سقف ${fa(mo)} ماه`):x.rem!==null?(x.rem>=0?`${sep(x.rem)} ${esc(dev.unit)} مانده`:`${sep(-x.rem)} ${esc(dev.unit)} گذشته`):(x.days!==null?(x.days>=0?`${fa(x.days)} روز مانده`:`${fa(-x.days)} روز گذشته`):'');
      return `<div class="pfsr"><span class="pill ${s[1]}">${s[0]}</span><b>${esc(x.it.name)}</b><span>${rem}</span></div>`; }).join('')}
      ${sv.length>4?`<div class="pfmore">و ${fa(sv.length-4)} سرویس دیگر</div>`:''}</div>`;
  }
  const st=stopsMonth(dev), co=costMonth(dev), bu=buysOpen(dev);
  const tiles=[];
  if(st) tiles.push(`<div class="pft"><span>توقف این ماه</span><b>${st.n?dec(Math.round(st.min/6)/10)+' ساعت':'ندارد'}</b><small>${st.n?fa(st.n)+' بار'+(st.open?'، هنوز متوقف':''):''}</small></div>`);
  if(co) tiles.push(`<div class="pft"><span>هزینه تعمیر این ماه</span><b>${co.sum?(co.sum>=1e6?dec(Math.round(co.sum/1e5)/10)+' میلیون':sep(co.sum)):'ندارد'}</b><small>${co.sum?'ریال، '+fa(co.n)+' فاکتور':''}</small></div>`);
  if(bu) tiles.push(`<div class="pft"><span>خرید باز</span><b>${bu.length?fa(bu.length)+' قلم':'ندارد'}</b><small>${bu.length?(()=>{ const U=[...new Set(bu.map(r=>String(r.item||'').trim()).filter(Boolean))], cut=x=>x.length>34?x.slice(0,33)+'…':x;
    return U.slice(0,2).map(x=>`<bdi>${esc(cut(x))}</bdi>`).join('، ')+(U.length>2?` و ${fa(U.length-2)} قلم دیگر`:''); })():''}</small></div>`);
  if(tiles.length) h+=`<div class="pftiles">${tiles.join('')}</div>`;
  try{ h+=kpiHtml(dev); }catch(e){}
  try{ if(canSee('دفترچه قرائت') && window.ntFluid){ const F=ntFluid.state(LS('nt_fluid_v1')||[],LS('nt_daftar_v1')||[],dev.name,today(),dev.unit==='کیلومتر');
    if(F.length) h+=`<h3>مصرف سوخت و روغن (۳۰ روز)</h3><div class="pfsv">${F.map(x=>`<div class="pfsr"><span class="pill ${x.warn?'o':'g'}">${x.warn?'▲ '+fa(Math.round((x.ratio-1)*100))+'٪':'عادی'}</span><b>${esc(x.name)}</b><span>${x.now!==null?dec(Math.round(x.now*10)/10)+' '+esc(x.unit):'—'}${x.base!==null?' · معمول '+dec(Math.round(x.base*10)/10):''}</span></div>`).join('')}</div>`; } }catch(e){}
  const rp=repeatOf(dev);
  if(rp.length) h+=`<div class="pfrep">⚠ خرابی تکراری: ${rp.map(x=>`«${esc(x.type)}» ${fa(x.n)} بار در ${fa(x.gap)} روز`).join('؛ ')}</div>`;
  const E=events(dev);
  if(E.length){
    h+=`<h3>آخرین رویدادها</h3><ol class="pfev">${E.slice(0,10).map(evLi).join('')}</ol>`;
    if(E.length>10) h+=`<button type="button" id="pfAll">همه رویدادها (${fa(E.length)})</button>`;
  }
  return h;
}
function attach(dev,body){
  if(!body || !dev || myDevs()) return;   // راننده: همان صفحه ساده
  const old=body.querySelector('.pf'); if(old) old.remove();
  const h=fileHtml(dev); if(!h) return;
  const box=document.createElement('section'); box.className='pf'; box.setAttribute('aria-label','پرونده دستگاه');
  box.innerHTML='<h2 class="pfh">پرونده</h2>'+h;
  const cl=body.querySelector('#qrClose'); if(cl) body.insertBefore(box,cl); else body.appendChild(box);
  const all=box.querySelector('#pfAll'); if(all) all.addEventListener('click',()=>{ const E=events(dev);
    box.querySelector('.pfev').innerHTML=E.map(evLi).join(''); all.remove(); });
}

/* ---------- «دستگاه‌ها»: فهرست همه دستگاه‌ها ---------- */
function line(dev){
  const bits=[];
  try{ if(canSee('ثبت مشکلات')){ const n=rowsOf('nt_moshkel_v1').filter(r=>r&&isDev(dev,r.dev)&&String(r.state||'باز').trim()!=='بسته').length; if(n) bits.push(['r',fa(n)+' خرابی باز']); } }catch(e){}
  try{ const sv=svcOf(dev); const r=sv.filter(x=>x.st==='r').length, o=sv.filter(x=>x.st==='o').length; if(r) bits.push(['r',fa(r)+' سرویس گذشته']); else if(o) bits.push(['o','سرویس نزدیک']); }catch(e){}
  try{ const st=stopsMonth(dev); if(st&&st.open) bits.push(['r','متوقف']); }catch(e){}
  try{ const t=today(); const K=t&&kpi(dev,+t.slice(0,4),+t.slice(5,7),t); if(K&&K.avail!==null) bits.push([K.avail>=90?'g':(K.avail>=75?'o':'r'),'آمادگی '+dec(K.avail)+'٪']); }catch(e){}
  return bits;
}
function pick(){
  if(myDevs()) return;
  let d=$('ntDevDlg');
  if(!d){ d=document.createElement('div'); d.className='sydlg'; d.id='ntDevDlg'; d.hidden=true; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-labelledby','ntDevH');
    d.innerHTML='<div class="sybox pfpick"><h2 id="ntDevH">دستگاه‌ها</h2><input id="ntDevQ" type="search" autocomplete="off" placeholder="جستجوی دستگاه…" aria-label="جستجوی دستگاه"><div id="ntDevL"></div><button type="button" id="ntDevX">بستن</button></div>';
    d.addEventListener('click',e=>{ if(e.target===d) d.hidden=true; }); document.body.appendChild(d);
    $('ntDevX').addEventListener('click',()=>{ d.hidden=true; });
    $('ntDevQ').addEventListener('input',draw); }
  function draw(){ const q=norm($('ntDevQ').value);
    const L=DEVS().filter(x=>!q||norm(x.name).indexOf(q)>-1);
    $('ntDevL').innerHTML=L.length?L.map(x=>{ const b=line(x); return `<button type="button" data-id="${esc(x.id)}"><b>${esc(x.name)}</b>${b.length?`<span>${b.map(([c,t])=>`<i class="${c}">${t}</i>`).join('')}</span>`:'<span><i class="g">بدون کار باز</i></span>'}</button>`; }).join(''):'<p>دستگاهی پیدا نشد.</p>';
    $('ntDevL').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ d.hidden=true; open(b.dataset.id); })); }
  $('ntDevQ').value=''; draw(); d.hidden=false; setTimeout(()=>{ try{ $('ntDevQ').focus(); }catch(e){} },30);
}
function open(idOrName){
  if(window.ntLocked) return;
  const dev=DEVS().find(d=>d.id===idOrName) || find(idOrName); if(!dev || !window.ntQr) return false;
  ntQr.home(dev.id); return true;
}
function addBtn(){
  const row=document.querySelector('.tabrow'); if(!row || $('ntDevBtn')) return;
  const b=document.createElement('button'); b.type='button'; b.className='qrscan'; b.id='ntDevBtn'; b.setAttribute('aria-label','پرونده دستگاه‌ها');
  b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h6l2 2h8v12H4z"/><path d="M8 13h8"/></svg><span class="tx">دستگاه‌ها</span>';
  b.addEventListener('click',pick);
  const sc=$('ntQrScan'); if(sc) row.insertBefore(b,sc); else row.appendChild(b);
}
(function hide(){ try{ const b=$('ntDevBtn'); if(b) b.hidden=!!myDevs(); }catch(e){} setTimeout(hide,3000); })();
const CSS=`
.qrdev .pf{margin:4px 0 10px;border-top:2px solid #E3E8ED;padding-top:8px}
.qrdev .pf .pfh{font-size:1rem;margin:2px 0 6px}
.qrdev .pf h3{font-size:.86rem;margin:10px 0 6px;color:#3D4852}
.qrdev .pfsv{display:flex;flex-direction:column;gap:4px}
.qrdev .pfsr{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;font-size:.84rem;background:#F7F9FA;border:1px solid #E3E8ED;border-radius:10px;padding:6px 8px}
.qrdev .pfsr span:last-child{color:#3D4852;font-variant-numeric:tabular-nums}
.qrdev .pill{font-size:.72rem;font-weight:800;border-radius:10px;padding:2px 8px;background:#EEF1F4;color:#3D4852}
.qrdev .pill.r{background:#FBE5E2;color:#A32018}.qrdev .pill.o{background:#FFF1D6;color:#7A4300}.qrdev .pill.g{background:#E3F4EA;color:#17663F}
.qrdev .pfev .pfn{font-size:.72rem;background:#FFF1D6;color:#7A4300;border-radius:8px;padding:1px 6px}
.qrdev .pfmore{font-size:.76rem;color:#51606E}
.qrdev .pftiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;margin-top:10px}
.qrdev .pft{border:1px solid #DDE3E9;border-radius:12px;padding:8px 10px;background:#fff}
.qrdev .pft span{display:block;font-size:.74rem;color:#51606E}
.qrdev .pft b{display:block;font-size:1.05rem;margin:2px 0}
.qrdev .pft small{display:block;font-size:.72rem;color:#51606E;overflow-wrap:anywhere}
.qrdev .pkg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.qrdev .pk{border:1px solid #DDE3E9;border-radius:12px;padding:8px 10px;background:#fff;border-top:3px solid #9AA6AF}
.qrdev .pk.g{border-top-color:#1E7F4F}.qrdev .pk.o{border-top-color:#C98A1B}.qrdev .pk.r{border-top-color:#B3261E}
.qrdev .pk span{display:block;font-size:.72rem;color:#51606E}
.qrdev .pk b{display:flex;align-items:center;gap:6px;font-size:1.05rem;margin:2px 0}
.qrdev .pk b i{font-style:normal;font-size:.75rem}.qrdev .pk b i.up{color:#1E7F4F}.qrdev .pk b i.dn{color:#B3261E}
.qrdev .pk small{display:block;font-size:.7rem;color:#51606E}
.qrdev .pkq{font-weight:400;font-size:.7rem;color:#8A959E}
.qrdev .pfrep{margin-top:10px;background:#FFF1DB;color:#7A4300;border-radius:10px;padding:8px 10px;font-size:.84rem;font-weight:700}
.qrdev .pfev{list-style:none;margin:0;padding:0 14px 0 0;border-right:2px solid #DDE3E9}
.qrdev .pfev li{position:relative;font-size:.82rem;padding:4px 0;line-height:1.6;overflow-wrap:anywhere}
.qrdev .pfev li::before{content:'';position:absolute;right:-20px;top:11px;width:10px;height:10px;border-radius:50%;background:#9AA6AF;border:2px solid #fff}
.qrdev .pfev li span{display:inline-block;min-width:78px;color:#51606E;font-variant-numeric:tabular-nums;margin-left:6px}
.qrdev .pfev .k-stop::before{background:#C98A1B}.qrdev .pfev .k-fault::before{background:#B3261E}.qrdev .pfev .k-fix::before{background:#1E7F4F}
.qrdev .pfev .k-rep::before{background:#1F5F99}.qrdev .pfev .k-svc::before{background:#0B5C7A}.qrdev .pfev .k-buy::before{background:#6B4FA0}
#ntDevBtn[hidden],body.ntdriver #ntDevBtn{display:none!important}
.pfpick #ntDevQ{width:100%;box-sizing:border-box;min-height:46px;border:1px solid #C3CDD5;border-radius:10px;padding:0 12px;font:inherit;margin:0 0 8px}
.pfpick #ntDevL{max-height:60vh;overflow:auto;display:flex;flex-direction:column;gap:6px;margin:0 0 8px}
.pfpick #ntDevL button{margin:0;text-align:right;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:56px}
.pfpick #ntDevL span{display:flex;flex-wrap:wrap;gap:4px}
.pfpick #ntDevL i{font-style:normal;font-size:.72rem;font-weight:700;border-radius:10px;padding:1px 8px;background:#EEF1F4;color:#3D4852}
.pfpick #ntDevL i.r{background:#FBE5E2;color:#A32018}.pfpick #ntDevL i.o{background:#FFF1D6;color:#7A4300}.pfpick #ntDevL i.g{background:#E3F4EA;color:#17663F}
`;
{ const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st); }
addBtn();
window.addEventListener('message',e=>{ const d=e&&e.data; if(!d) return;
  if(d.nt==='devfile' && typeof d.name==='string') open(d.name.slice(0,120)); else if(d.nt==='devpick') pick(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && $('ntDevDlg') && !$('ntDevDlg').hidden) $('ntDevDlg').hidden=true; });
window.ntDev={attach,open,pick,events,isDev,find,kpi};
})();
