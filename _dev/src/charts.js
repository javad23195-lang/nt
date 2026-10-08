/* ============ نمودارها (Chart.js) ============
   از زبانه «امروز» باز می‌شود (پیام {nt:'charts'}). کتابخانه فقط هنگام نیاز بارگذاری می‌شود.
   ۱) ساعت توقف هر دستگاه  ۲) علت‌های توقف  ۳) کارکرد ماهانه (قرائت)  ۴) مصرف روغن ماهانه (تعویض روغن انبار)
   + نمودار کوچک کارکرد ۶ ماه در صفحه دستگاه (کد QR). */
(function(){
'use strict';
const LIB=['lib/chart.umd.js','https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'];
const BROKEN=['خرابی موتور','خرابی هیدرولیک','خرابی برق','زنجیر و زیربندی','پاکت و ناخن','سرویس دوره‌ای','خرابی دیگر'];
const MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const C={red:'#B3261E',gray:'#8A97A3',blue:'#0B5C7A',green:'#1E8E5A'};
const OILC=['#0B5C7A','#C77A1A','#1E8E5A','#7B3FA0','#B3261E','#8A97A3'];
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const p2=n=>String(n).padStart(2,'0');
const latin=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
const norm=s=>latin(s).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s]+/g,' ').trim().toLowerCase();
const r1=n=>Math.round(n*10)/10;
const nf=n=>fa(Number(r1(n)).toLocaleString('en-US'));
function LS(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
const rowsOf=k=>{ const o=LS(k); return o && Array.isArray(o.rows)?o.rows:(Array.isArray(o)?o:[]); };
const canSee=n=>{ try{ return window.ntSync && ntSync.canSee ? ntSync.canSee(n) : true; }catch(e){ return true; } };
function nd(s){ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/.exec(latin(s).trim()); return m?`${m[1]}/${p2(+m[2])}/${p2(+m[3])}`:''; }
const rDate=r=>r.y&&r.m&&r.d?nd(`${r.y}/${r.m}/${r.d}`):nd(r.date||'');
function jToday(){ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; }catch(e){ return ''; } }
const mins=t=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(t||''); return m?(+m[1])*60+(+m[2]):null; };
const dur=(a,b)=>{ const x=mins(a), y=mins(b); return (x===null||y===null)?null:(y-x+1440)%1440; };
/** ماه (سال، ماه) با جابه‌جایی */
function addM(y,m,k){ m+=k; while(m<1){ m+=12; y--; } while(m>12){ m-=12; y++; } return [y,m]; }
const mKey=(y,m)=>`${y}/${p2(m)}`;
const mLabel=k=>MONTHS[+k.slice(5,7)-1]+' '+fa(k.slice(2,4));
function loadLib(){
  if(window.Chart) return Promise.resolve();
  const one=src=>new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=()=>window.Chart?res():rej(new Error('lib')); s.onerror=()=>{ s.remove(); rej(new Error('lib')); }; document.head.appendChild(s); });
  let local=''; try{ local=new URL(LIB[0],location.href).href; }catch(e){}
  return (local?one(local):Promise.reject()).catch(()=>one(LIB[1]));
}
let setupDone=false;
function setup(){
  if(setupDone) return; setupDone=true;
  const Ch=window.Chart;
  Ch.defaults.font.family='"Vazirmatn","IRANSans","Segoe UI",Tahoma,sans-serif';
  Ch.defaults.font.size=12; Ch.defaults.color='#17212B';
  Ch.defaults.animation=false;
  /* پس‌زمینه سفید (برای ذخیره عکس) */
  Ch.register({id:'ntWhite',beforeDraw(c){ const x=c.ctx; x.save(); x.globalCompositeOperation='destination-over'; x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.restore(); }});
}

/* ---------- داده ---------- */
function stopsIn(from,to){
  const tv=LS('nt_tavaqof_v1')||{}, out=[];
  Object.keys(tv).forEach(k=>{ const day=nd(k.split('|')[0]); if(!day || day<from || day>to) return;
    ((tv[k]&&tv[k].stops)||[]).forEach(s=>{ if(s && s.dev) out.push(s); }); });
  return out;
}
function stopData(from,to){
  const per={}, cause={}; let open=0;
  stopsIn(from,to).forEach(s=>{
    const d=s.to?dur(s.from,s.to):null; if(d===null){ open++; return; }
    const b=BROKEN.indexOf(s.cause)>-1;
    const P=per[s.dev]||(per[s.dev]={b:0,i:0}); if(b) P.b+=d; else P.i+=d;
    const c=s.cause||'نامشخص', X=cause[c]||(cause[c]={t:0,b}); X.t+=d;
  });
  return {per,cause,open};
}
function readingsByDev(){
  const by={};
  (LS('nt_daftar_v1')||[]).forEach(x=>{ if(!x||!x.dev) return; const d=nd(x.date), v=+latin(x.val); if(!d||isNaN(v)) return;
    (by[x.dev]=by[x.dev]||[]).push({d,v,u:x.unit||''}); });
  Object.keys(by).forEach(k=>by[k].sort((a,b)=>a.d.localeCompare(b.d)));
  return by;
}
/** کارکرد هر ماه = آخرین قرائت ماه − آخرین قرائت پیش از ماه */
function workMonths(list,months){
  return months.map(mk=>{
    const end=list.filter(x=>x.d.slice(0,7)===mk).pop(), before=list.filter(x=>x.d.slice(0,7)<mk).pop();
    return end && before ? Math.max(0,end.v-before.v) : null;
  });
}
const isOil=r=>r && r.svc && /^\s*(روغن|واسکازین|گریس)/.test(r.item||'');
function oilData(months){
  const set=new Set(months), by={};
  rowsOf('nt_anbar_out_v1').forEach(r=>{ if(!isOil(r)) return; const d=rDate(r); if(!d) return; const mk=d.slice(0,7); if(!set.has(mk)) return;
    const q=+latin(r.qty); if(isNaN(q)) return; const it=String(r.item).trim(); (by[it]=by[it]||{})[mk]=((by[it]||{})[mk]||0)+q; });
  let items=Object.keys(by).map(k=>({k,t:months.reduce((a,m)=>a+(by[k][m]||0),0)})).sort((a,b)=>b.t-a.t);
  if(items.length>6){ const rest=items.slice(5); const o={}; rest.forEach(x=>months.forEach(m=>{ o[m]=(o[m]||0)+(by[x.k][m]||0); })); by['سایر روغن‌ها']=o; items=items.slice(0,5).concat([{k:'سایر روغن‌ها'}]); }
  return items.map((x,i)=>({label:x.k,data:months.map(m=>by[x.k][m]?r1(by[x.k][m]):0),backgroundColor:OILC[i%OILC.length]}));
}

/* ---------- پنجره ---------- */
let charts=[];
function kill(){ charts.forEach(c=>{ try{ c.destroy(); }catch(e){} }); charts=[]; }
function dlg(){
  if($('ntChDlg')) return;
  const st=document.createElement('style'); st.textContent=`
.chbox{max-width:720px}
.chseg{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
.chseg button{display:inline-block;width:auto;flex:1;min-width:90px;min-height:40px;margin:0;font-size:.84rem}
.chseg button[aria-pressed="true"]{background:#0B5C7A;border-color:#0B5C7A;color:#fff}
.chcard{border:1px solid #D5DCE3;border-radius:12px;padding:10px;margin:0 0 12px;background:#fff}
.chcard h3{margin:0 0 2px}.chcard .sub{font-size:.78rem;color:#51606E;margin:0 0 6px}
.chcard .cv{position:relative;width:100%}
.chcard .empty{font-size:.86rem;color:#51606E;padding:14px 0;text-align:center}
.chcard .row{display:flex;gap:8px;align-items:center;margin:0 0 6px}
.chcard .row select{flex:1;min-height:40px}
.chcard button.png{display:inline-block;width:auto;min-height:36px;margin:6px 0 0;padding:0 12px;font-size:.8rem}
.qrdev .chmini{border:1px solid #D5DCE3;border-radius:10px;padding:6px 8px;margin:0 0 10px;background:#fff}
.qrdev .chmini b{font-size:.8rem}`;
  document.head.appendChild(st);
  const d=document.createElement('div'); d.className='sydlg'; d.id='ntChDlg'; d.hidden=true;
  d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-labelledby','ntChH');
  d.innerHTML='<div class="sybox chbox"><h2 id="ntChH">نمودارها</h2><div id="ntChBody"></div></div>';
  d.addEventListener('click',e=>{ if(e.target===d) close(); });
  document.body.appendChild(d);
}
function close(){ kill(); const d=$('ntChDlg'); if(d){ d.hidden=true; $('ntChBody').innerHTML=''; } }
let range='m0';
function rangeOf(r){
  const t=jToday(); const y=+t.slice(0,4), m=+t.slice(5,7);
  if(r==='m1'){ const [a,b]=addM(y,m,-1); return {from:`${mKey(a,b)}/01`,to:`${mKey(a,b)}/31`,months:6,end:[a,b],label:MONTHS[b-1]+' '+fa(a)}; }
  if(r==='m6'){ const [a,b]=addM(y,m,-5); return {from:`${mKey(a,b)}/01`,to:`${mKey(y,m)}/31`,months:6,end:[y,m],label:'۶ ماه اخیر'}; }
  return {from:`${mKey(y,m)}/01`,to:`${mKey(y,m)}/31`,months:6,end:[y,m],label:MONTHS[m-1]+' '+fa(y)};
}
const monthsTo=(end,n)=>{ const r=[]; for(let i=n-1;i>=0;i--){ const [a,b]=addM(end[0],end[1],-i); r.push(mKey(a,b)); } return r; };
function open(){
  dlg(); $('ntChDlg').hidden=false;
  $('ntChBody').innerHTML='<div class="symsg" id="chMsg">در حال آماده‌سازی نمودارها…</div><button type="button" id="chClose">بستن</button>';
  $('chClose').addEventListener('click',close);
  loadLib().then(()=>{ setup(); draw(); }).catch(()=>{ const m=$('chMsg'); if(m){ m.className='symsg bad'; m.textContent='کتابخانه نمودار بارگذاری نشد. اتصال اینترنت را بررسی کنید.'; } });
}
function card(id,title,sub,h,extra){ return `<div class="chcard" id="${id}"><h3>${title}</h3><div class="sub">${sub}</div>${extra||''}<div class="cv" style="height:${h}px"><canvas aria-label="${esc(title)}" role="img"></canvas></div><button type="button" class="png" data-png="${id}">ذخیره عکس</button></div>`; }
const emptyCard=(id,title,txt)=>`<div class="chcard" id="${id}"><h3>${title}</h3><div class="empty">${txt}</div></div>`;
function draw(){
  kill();
  const R=rangeOf(range), months=monthsTo(R.end,R.months), mrange=mLabel(months[0])+' تا '+mLabel(months[months.length-1]);
  const seg=`<div class="chseg" role="group" aria-label="بازه">${[['m0','این ماه'],['m1','ماه قبل'],['m6','۶ ماه اخیر']].map(([k,t])=>`<button type="button" data-r="${k}" aria-pressed="${k===range}">${t}</button>`).join('')}</div>`;
  let html=seg, jobs=[];
  if(canSee('توقف شیفت')){
    const S=stopData(R.from,R.to), devs=Object.keys(S.per).sort((a,b)=>(S.per[b].b+S.per[b].i)-(S.per[a].b+S.per[a].i));
    const note=S.open?`، ${fa(S.open)} توقف هنوز باز است و حساب نشده`:'';
    if(devs.length){
      html+=card('ch1','ساعت توقف هر دستگاه',R.label+note,Math.max(140,60+devs.length*42));
      jobs.push(()=>bar('ch1',{labels:devs,datasets:[
        {label:'خرابی',data:devs.map(d=>r1(S.per[d].b/60)),backgroundColor:C.red},
        {label:'سالم ولی کار نکرد',data:devs.map(d=>r1(S.per[d].i/60)),backgroundColor:C.gray}]},{horizontal:true,stacked:true,unit:'ساعت'}));
      const cs=Object.keys(S.cause).sort((a,b)=>S.cause[b].t-S.cause[a].t);
      html+=card('ch2','علت‌های توقف',R.label+'، قرمز = خرابی، خاکستری = سالم ولی کار نکرد',Math.max(140,40+cs.length*34));
      jobs.push(()=>bar('ch2',{labels:cs,datasets:[{label:'ساعت',data:cs.map(c=>r1(S.cause[c].t/60)),backgroundColor:cs.map(c=>S.cause[c].b?C.red:C.gray)}]},{horizontal:true,unit:'ساعت',noLegend:true}));
    } else html+=emptyCard('ch1','ساعت توقف هر دستگاه','در '+R.label+' توقفی ثبت نشده است'+note);
  }
  if(canSee('دفترچه قرائت')){
    const by=readingsByDev(), devs=Object.keys(by).filter(d=>by[d].length>1).sort((a,b)=>a.localeCompare(b,'fa'));
    if(devs.length){
      const sel=`<div class="row"><select id="chDev" aria-label="دستگاه">${devs.map(d=>`<option>${esc(d)}</option>`).join('')}</select></div>`;
      html+=card('ch3','کارکرد ماهانه',mrange+'، از روی قرائت‌ها (آخرین قرائت ماه − آخرین قرائت ماه قبل)',220,sel);
      jobs.push(()=>{ const f=()=>{ const d=$('chDev').value, L=by[d], u=(L[L.length-1]||{}).u||'';
        const c=charts.find(x=>x.canvas.closest('#ch3')); if(c){ c.destroy(); charts=charts.filter(x=>x!==c); }
        bar('ch3',{labels:months.map(mLabel),datasets:[{label:u||'کارکرد',data:workMonths(L,months),backgroundColor:C.blue}]},{unit:u,noLegend:true}); };
        $('chDev').addEventListener('change',f); f(); });
    } else html+=emptyCard('ch3','کارکرد ماهانه','برای هیچ دستگاهی دو قرائت ثبت نشده است');
  }
  if(canSee('انبار')){
    const ds=oilData(months);
    if(ds.length){ html+=card('ch4','مصرف روغن ماهانه (لیتر)',mrange+'، از خروج‌های «تعویض روغن» انبار',260);
      jobs.push(()=>bar('ch4',{labels:months.map(mLabel),datasets:ds},{stacked:true,unit:'لیتر'})); }
    else html+=emptyCard('ch4','مصرف روغن ماهانه (لیتر)','در '+mrange+' خروج «تعویض روغن» ثبت نشده است');
  }
  html+='<button type="button" id="chClose">بستن</button>';
  $('ntChBody').innerHTML=html;
  $('ntChBody').querySelectorAll('[data-r]').forEach(b=>b.addEventListener('click',()=>{ range=b.dataset.r; draw(); }));
  $('ntChBody').querySelectorAll('[data-png]').forEach(b=>b.addEventListener('click',()=>png(b.dataset.png)));
  $('chClose').addEventListener('click',close);
  jobs.forEach(f=>{ try{ f(); }catch(e){} });
}
function bar(id,data,o){
  const cv=$(id).querySelector('canvas'), Ch=window.Chart;
  const valAx={beginAtZero:true,stacked:!!o.stacked,ticks:{callback:v=>nf(v)},title:{display:!!o.unit,text:o.unit||''}};
  const catAx={stacked:!!o.stacked,ticks:{autoSkip:false,font:{size:11}}};
  const c=new Ch(cv,{type:'bar',data,options:{indexAxis:o.horizontal?'y':'x',responsive:true,maintainAspectRatio:false,
    scales:o.horizontal?{x:Object.assign({reverse:true},valAx),y:Object.assign({position:'right'},catAx)}:{x:Object.assign({reverse:true},catAx),y:Object.assign({position:'right'},valAx)},
    plugins:{legend:{display:!o.noLegend,rtl:true,position:'bottom',labels:{boxWidth:12}},
      tooltip:{rtl:true,callbacks:{label:t=>`${t.dataset.label||''}: ${nf(o.horizontal?t.parsed.x:t.parsed.y)} ${o.unit||''}`}}}}});
  charts.push(c); return c;
}
function png(id){
  const c=charts.find(x=>x.canvas.closest('#'+id)); if(!c) return;
  const a=document.createElement('a'); a.href=c.toBase64Image('image/png',1); a.download='NT-chart-'+id+'-'+jToday().replace(/\//g,'-')+'.png';
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- نمودار کوچک در صفحه دستگاه ---------- */
let mini=null;
function devMini(devName){
  try{ if(mini){ mini.destroy(); mini=null; } }catch(e){}
  if(!canSee('دفترچه قرائت')) return;
  const body=$('ntQrBody'); if(!body || !body.querySelector('.acts')) return;
  const L=readingsByDev()[Object.keys(readingsByDev()).find(k=>norm(k)===norm(devName))||'']||[];
  if(L.length<2) return;
  const t=jToday(), months=monthsTo([+t.slice(0,4),+t.slice(5,7)],6), w=workMonths(L,months);
  if(!w.some(v=>v)) return;
  const box=document.createElement('div'); box.className='chmini';
  box.innerHTML=`<b>کارکرد ۶ ماه (${esc(L[L.length-1].u||'')})</b><div style="position:relative;height:120px"><canvas role="img" aria-label="کارکرد ۶ ماه"></canvas></div>`;
  body.insertBefore(box,body.querySelector('.acts'));
  loadLib().then(()=>{ setup(); if(!box.isConnected) return;
    mini=new window.Chart(box.querySelector('canvas'),{type:'bar',data:{labels:months.map(mLabel),datasets:[{data:w,backgroundColor:C.blue}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{rtl:true,callbacks:{label:x=>nf(x.parsed.y)}}},
        scales:{y:{position:'right',beginAtZero:true,ticks:{callback:v=>nf(v),maxTicksLimit:4}},x:{reverse:true,ticks:{font:{size:10}}}}}}); }).catch(()=>{ box.remove(); });
}
window.addEventListener('message',e=>{ if(e && e.data && e.data.nt==='charts') open(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && $('ntChDlg') && !$('ntChDlg').hidden) close(); });
window.ntCharts={open,close,devMini,stopData,workMonths,oilData,readingsByDev};
})();
