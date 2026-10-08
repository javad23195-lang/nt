/* ============ گزارش اکسل (چند برگه) ============
   از زبانه «امروز» باز می‌شود (پیام {nt:'report'}). کتابخانه SheetJS فقط هنگام ساخت فایل بارگذاری می‌شود. */
(function(){
'use strict';
const LIB_LOCAL='lib/xlsx.mini.min.js', LIB_CDN='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.mini.min.js';
const MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
/* گروه علت‌های توقف — همان فهرست فرم «توقف شیفت» */
const BROKEN=['خرابی موتور','خرابی هیدرولیک','خرابی برق','زنجیر و زیربندی','پاکت و ناخن','سرویس دوره‌ای','خرابی دیگر'];
const SHIFT_ORDER={'صبح':0,'عصر':1,'شب':2};
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const p2=n=>String(n).padStart(2,'0');
const latin=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
function LS(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
const rowsOf=k=>{ const o=LS(k); return o && Array.isArray(o.rows) ? o.rows : (Array.isArray(o)?o:[]); };
/** تاریخ شمسی به شکل 1405/07/16، یا '' */
function nd(s){
  const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/.exec(latin(s).trim());
  return m?`${m[1]}/${p2(+m[2])}/${p2(+m[3])}`:'';
}
function rowDate(r){
  if(!r) return '';
  if(r.y && r.m && r.d) return nd(`${r.y}/${r.m}/${r.d}`);
  return nd(r.date||r.reg||r.open||r.done||'');
}
function today(){
  try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
       const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; }catch(e){ return ''; }
}
const mins=t=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(t||''); return m?(+m[1])*60+(+m[2]):null; };
const dur=(a,b)=>{ const x=mins(a), y=mins(b); return (x===null||y===null)?null:(y-x+1440)%1440; };
const hm=m=>Math.floor(m/60)+':'+p2(m%60);
const hrs=m=>Math.round(m/60*100)/100;
const num=v=>{ const s=latin(v).replace(/,/g,'').trim(); return s!=='' && !isNaN(+s) ? +s : (v==null?'':v); };
const canSee=name=>{ try{ return window.ntSync && ntSync.canSee ? ntSync.canSee(name) : true; }catch(e){ return true; } };

/* ---------- کد کالا: همان ترتیب زبانه «انبار» ----------
   کاتالوگ انبار داخل خود فرم انبار است (const DATA)، نه در localStorage؛ پس از DOCS خوانده می‌شود. */
const norm=s=>latin(s||'').replace(/[ىي]/g,'ی').replace(/ك/g,'ک').replace(/‌/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
let CAT=null;
function catalog(){
  if(CAT) return CAT;
  CAT=new Map();
  try{
    const doc=(typeof DOCS!=='undefined'?DOCS:[]).find(x=>x && x.name==='انبار');
    if(doc){
      const bin=atob(doc.b64), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
      const html=new TextDecoder('utf-8').decode(u);
      const m=/const DATA\s*=\s*(\{.*?\});\s*\n/.exec(html);
      if(m) (JSON.parse(m[1]).items||[]).forEach(o=>{ const k=norm(o.d); if(k && o.c!=null && o.c!=='' && !CAT.has(k)) CAT.set(k,String(o.c)); });
    }
  }catch(e){}
  /* کدهای تازه «درخواست خرید» */
  try{ (LS('nt_kharid_cat_v1')||[]).forEach(o=>{ const k=o&&norm(o.d); if(k && o.c!=null && o.c!=='' && !CAT.has(k)) CAT.set(k,String(o.c)); }); }catch(e){}
  return CAT;
}
function codeOf(r){
  const c=catalog().get(norm(r.item)); if(c) return c;
  const own=String(r.code||'').trim(); if(own) return own;
  const mem=(LS('nt_anbar_codes_v1')||{})[norm(r.item)];
  return mem && mem.c ? String(mem.c) : '';
}

/* ---------- جمع‌آوری ردیف‌ها در بازه ---------- */
function collect(from,to){
  CAT=null;   // کدهای «درخواست خرید» شاید تازه شده باشند
  const In=d=>d && d>=from && d<=to;
  const R={};
  /* توقف‌ها */
  const tv=LS('nt_tavaqof_v1')||{}, stops=[];
  Object.keys(tv).forEach(k=>{
    const [d,sh]=k.split('|'); const day=nd(d); if(!In(day)) return;
    ((tv[k]&&tv[k].stops)||[]).forEach(s=>stops.push({day,sh:sh||'',s}));
  });
  stops.sort((a,b)=>a.day.localeCompare(b.day)||(SHIFT_ORDER[a.sh]??9)-(SHIFT_ORDER[b.sh]??9)||(mins(a.s.from)??0)-(mins(b.s.from)??0));
  R.stops=stops;
  /* قرائت */
  const daf=(LS('nt_daftar_v1')||[]).filter(x=>x && x.dev).map(x=>Object.assign({},x,{date:nd(x.date)})).filter(x=>x.date);
  R.read=daf.filter(x=>In(x.date)).sort((a,b)=>a.date.localeCompare(b.date)||String(a.dev).localeCompare(String(b.dev),'fa'));
  R.allRead=daf;
  /* بقیه بخش‌ها */
  const pick=(k)=>rowsOf(k).map(r=>({d:rowDate(r),r})).filter(x=>In(x.d)).sort((a,b)=>a.d.localeCompare(b.d));
  R.out=pick('nt_anbar_out_v1'); R.inn=pick('nt_anbar_in_v1'); R.buy=pick('nt_kharid9_v1');
  R.svc=pick('nt_khadamat_v1'); R.prob=pick('nt_moshkel_v1');
  return R;
}
/* هر بخش: کدام زبانه، چه نامی */
const PARTS=[
  {k:'stops',tab:'توقف شیفت',label:'توقف‌ها (خلاصه و لیست)'},
  {k:'read',tab:'دفترچه قرائت',label:'قرائت و کارکرد دستگاه‌ها'},
  {k:'out',tab:'انبار',label:'خروج انبار'},
  {k:'inn',tab:'انبار',label:'ورود انبار'},
  {k:'buy',tab:'درخواست خرید',label:'درخواست خرید'},
  {k:'svc',tab:'خدمات',label:'خدمات'},
  {k:'prob',tab:'ثبت مشکلات',label:'مشکلات'}
];

/* ---------- ساخت برگه‌ها ---------- */
function sheets(R,from,to,sel){
  const S=[];
  const made='ساخته شده: '+today()+' — بازه: '+from+' تا '+to;
  if(sel.stops){
    const per={}, cause={};
    R.stops.forEach(({s})=>{
      const d=s.to?dur(s.from,s.to):null, g=BROKEN.indexOf(s.cause)>-1?'خرابی':'سالم ولی کار نکرد';
      const P=per[s.dev]||(per[s.dev]={n:0,t:0,b:0,i:0,open:0});
      P.n++; if(d===null) P.open++; else { P.t+=d; if(g==='خرابی') P.b+=d; else P.i+=d; }
      const C=cause[s.cause]||(cause[s.cause]={g,n:0,t:0}); C.n++; if(d!==null) C.t+=d;
    });
    const aoa=[[ 'خلاصه توقف — '+made ],[],
      ['دستگاه','تعداد توقف','جمع مدت (ساعت)','جمع مدت (س:د)','خرابی (ساعت)','سالم ولی کار نکرد (ساعت)','هنوز متوقف']];
    const devs=Object.keys(per).sort((a,b)=>per[b].t-per[a].t);
    devs.forEach(d=>{ const P=per[d]; aoa.push([d,P.n,hrs(P.t),hm(P.t),hrs(P.b),hrs(P.i),P.open]); });
    if(devs.length>1){ const T=devs.reduce((a,d)=>{ const P=per[d]; a.n+=P.n; a.t+=P.t; a.b+=P.b; a.i+=P.i; a.o+=P.open; return a; },{n:0,t:0,b:0,i:0,o:0});
      aoa.push(['جمع',T.n,hrs(T.t),hm(T.t),hrs(T.b),hrs(T.i),T.o]); }
    if(!devs.length) aoa.push(['در این بازه توقفی ثبت نشده است']);
    aoa.push([],['علت','گروه','تعداد','جمع مدت (ساعت)','جمع مدت (س:د)']);
    Object.keys(cause).sort((a,b)=>cause[b].t-cause[a].t).forEach(c=>{ const C=cause[c]; aoa.push([c,C.g,C.n,hrs(C.t),hm(C.t)]); });
    S.push({name:'خلاصه توقف',aoa,head:2});
    const L=[['تاریخ','شیفت','دستگاه','از ساعت','تا ساعت','مدت (دقیقه)','مدت (س:د)','علت','گروه علت','توضیح','ثبت‌کننده']];
    R.stops.forEach(({day,sh,s})=>{ const d=s.to?dur(s.from,s.to):null;
      L.push([day,sh,s.dev,s.from||'',s.to||'هنوز متوقف',d===null?'':d,d===null?'':hm(d),s.cause||'',BROKEN.indexOf(s.cause)>-1?'خرابی':'سالم ولی کار نکرد',s.note||'',s.by||'']); });
    S.push({name:'توقف‌ها',aoa:L,head:0});
  }
  if(sel.read){
    const by={};
    R.allRead.forEach(x=>{ (by[x.dev]=by[x.dev]||[]).push(x); });
    const K=[['دستگاه','واحد','تاریخ قرائت شروع','قرائت شروع','تاریخ قرائت پایان','قرائت پایان','کارکرد در بازه']];
    Object.keys(by).sort((a,b)=>a.localeCompare(b,'fa')).forEach(dev=>{
      const L=by[dev].slice().sort((a,b)=>a.date.localeCompare(b.date));
      const inR=L.filter(x=>x.date>=from && x.date<=to); if(!inR.length) return;
      const before=L.filter(x=>x.date<from), start=before.length?before[before.length-1]:inR[0], end=inR[inR.length-1];
      K.push([dev,end.unit||'',start.date,num(start.val),end.date,num(end.val),(typeof num(end.val)==='number'&&typeof num(start.val)==='number')?num(end.val)-num(start.val):'']);
    });
    S.push({name:'کارکرد دستگاه‌ها',aoa:K,head:0});
    const Q=[['تاریخ','دستگاه','واحد','عدد کنتور','منبع']];
    R.read.forEach(x=>Q.push([x.date,x.dev,x.unit||'',num(x.val),x.src||'دفترچه']));
    S.push({name:'قرائت',aoa:Q,head:0});
  }
  const typ=r=>r.svc?(r.svcName||'تعویض روغن'):(r.rep?'نت تعمیرات':'مصرف');
  if(sel.out){ const A=[['تاریخ','دستگاه','کد کالا','شرح کالا','مقدار','مورد نیاز','وضعیت','نوع خروج','شماره درخواست مصرف']];
    R.out.forEach(({d,r})=>A.push([d,r.dev||'',num(codeOf(r)),r.item||'',num(r.qty),r.why||'',r.cond||'',typ(r),r.doc||''])); S.push({name:'خروج انبار',aoa:A,head:0}); }
  if(sel.inn){ const A=[['تاریخ','کد کالا','شرح کالا','مقدار','نوع','وضعیت','منبع']];
    R.inn.forEach(({d,r})=>A.push([d,num(codeOf(r)),r.item||'',num(r.qty),r.type||'',r.cond||'',r.src||''])); S.push({name:'ورود انبار',aoa:A,head:0}); }
  if(sel.buy){ const A=[['تاریخ','دستگاه / واحد','کالا','شرح اقلام','تعداد','خریداری‌شده','اولویت','سند مصرف','سند خرید','درخواست‌کننده','تأیید','وضعیت','یادداشت']];
    R.buy.forEach(({d,r})=>A.push([d,r.unit||'',r.item||'',r.desc||'',num(r.qty),num(r.bought),r.pri||'',r.d1||'',r.d2||'',r.req||'',r.apr||'',r.over||'',r.note||''])); S.push({name:'درخواست خرید',aoa:A,head:0}); }
  if(sel.svc){ const A=[['تاریخ','دستگاه','نوع','شرح فعالیت','قطعه','شروع','انجام','کارکرد','واحد کارکرد','بسته شده','علت']];
    R.svc.forEach(({d,r})=>A.push([d,r.dev||'',r.kind||'',r.act||'',r.part||'',r.open||'',r.done||'',num(r.meter),r.munit||'',r.cdate||'',r.reason||''])); S.push({name:'خدمات',aoa:A,head:0}); }
  if(sel.prob){ const A=[['تاریخ','دستگاه','سیستم','شرح مشکل','شدت','وضعیت دستگاه','نیاز به قطعه','وضعیت پرونده','تاریخ رفع','منبع']];
    R.prob.forEach(({d,r})=>A.push([d,r.dev||'',r.sys||'',r.desc||'',r.sev||'',r.cur||'',r.part||'',r.state||'',r.fix||'',r.src||''])); S.push({name:'مشکلات',aoa:A,head:0}); }
  return S;
}
function workbook(S){
  const X=window.XLSX, wb=X.utils.book_new();
  S.forEach(sh=>{
    const ws=X.utils.aoa_to_sheet(sh.aoa);
    const w=[]; sh.aoa.forEach((row,i)=>{ if(i<sh.head) return; row.forEach((c,j)=>{ const l=String(c==null?'':c).length; w[j]=Math.max(w[j]||6,Math.min(48,l+2)); }); });
    ws['!cols']=w.map(x=>({wch:x}));
    const hr=sh.aoa[sh.head]||[]; const nRows=sh.name==='خلاصه توقف'?sh.aoa.findIndex((r,i)=>i>sh.head && !r.length):sh.aoa.length;
    if(hr.length && (nRows<0?sh.aoa.length:nRows)>sh.head+1) ws['!autofilter']={ref:X.utils.encode_range({s:{r:sh.head,c:0},e:{r:(nRows<0?sh.aoa.length:nRows)-1,c:hr.length-1}})};
    X.utils.book_append_sheet(wb,ws,sh.name);
  });
  wb.Workbook={Views:[{RTL:true}]};
  return wb;
}
function loadLib(){
  if(window.XLSX) return Promise.resolve();
  const one=src=>new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=()=>window.XLSX?res():rej(new Error('lib')); s.onerror=()=>{ s.remove(); rej(new Error('lib')); }; document.head.appendChild(s); });
  let local=''; try{ local=new URL(LIB_LOCAL,location.href).href; }catch(e){}
  return (local?one(local):Promise.reject()).catch(()=>one(LIB_CDN));
}

/* ---------- پنجره ---------- */
function monthRange(off){
  const t=today(); if(!t) return ['',''];
  let y=+t.slice(0,4), m=+t.slice(5,7)+off; while(m<1){ m+=12; y--; } while(m>12){ m-=12; y++; }
  return [`${y}/${p2(m)}/01`,`${y}/${p2(m)}/31`];
}
const mName=r=>{ const m=+r[0].slice(5,7); return MONTHS[m-1]+' '+fa(r[0].slice(0,4)); };
function ensureDlg(){
  if($('ntRpDlg')) return;
  const d=document.createElement('div'); d.className='sydlg'; d.id='ntRpDlg'; d.hidden=true; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-labelledby','ntRpH');
  d.innerHTML='<div class="sybox"><h2 id="ntRpH">گزارش اکسل</h2><div id="ntRpBody"></div></div>';
  document.body.appendChild(d);
}
function mask(el){ let g=latin(el.value).replace(/\D/g,'').slice(0,8), o=g.slice(0,4); if(g.length>4) o+='/'+g.slice(4,6); if(g.length>6) o+='/'+g.slice(6,8); if(o!==el.value) el.value=o; }
function open(){
  ensureDlg();
  const cur=monthRange(0), prev=monthRange(-1), parts=PARTS.filter(p=>canSee(p.tab));
  $('ntRpBody').innerHTML=`
    <p>یک فایل اکسل با چند برگه ساخته و دانلود می‌شود. ستون‌ها راست‌به‌چپ و عددها قابل جمع هستند.</p>
    <div class="sycard"><h3>بازه</h3>
      <label class="chk"><input type="radio" name="rpR" value="cur" checked>این ماه (${esc(mName(cur))})</label>
      <label class="chk"><input type="radio" name="rpR" value="prev">ماه قبل (${esc(mName(prev))})</label>
      <label class="chk"><input type="radio" name="rpR" value="own">بازه دلخواه</label>
      <div id="rpOwn" hidden>
        <label>از تاریخ<input type="text" id="rpFrom" inputmode="numeric" placeholder="1405/07/01" style="direction:ltr" value="${esc(cur[0])}"></label>
        <label>تا تاریخ<input type="text" id="rpTo" inputmode="numeric" placeholder="1405/07/30" style="direction:ltr" value="${esc(today())}"></label>
      </div></div>
    <div class="sycard"><h3>برگه‌ها</h3>
      ${parts.map(p=>`<label class="chk"><input type="checkbox" data-k="${p.k}" checked>${esc(p.label)} <small id="rpN_${p.k}" style="display:inline;margin-inline-start:6px"></small></label>`).join('')}
    </div>
    <div class="symsg" id="rpMsg"></div>
    <button type="button" class="go" id="rpGo">ساخت فایل اکسل</button>
    <button type="button" id="rpClose">بستن</button>`;
  $('ntRpDlg').hidden=false;
  const range=()=>{ const v=document.querySelector('input[name="rpR"]:checked').value;
    if(v==='cur') return cur; if(v==='prev') return prev; return [nd($('rpFrom').value),nd($('rpTo').value)]; };
  const msg=(t,bad)=>{ const m=$('rpMsg'); m.textContent=t||''; m.className='symsg'+(bad?' bad':''); };
  const counts=()=>{
    const [f,t]=range(); if(!f||!t){ parts.forEach(p=>{ const e=$('rpN_'+p.k); if(e) e.textContent=''; }); return; }
    const R=collect(f,t);
    parts.forEach(p=>{ const e=$('rpN_'+p.k); if(e) e.textContent='('+fa(R[p.k].length)+' ردیف)'; });
  };
  document.querySelectorAll('input[name="rpR"]').forEach(r=>r.addEventListener('change',()=>{ $('rpOwn').hidden=document.querySelector('input[name="rpR"]:checked').value!=='own'; counts(); }));
  ['rpFrom','rpTo'].forEach(id=>$(id).addEventListener('input',()=>{ mask($(id)); counts(); }));
  counts();
  $('rpClose').addEventListener('click',close);
  $('rpGo').addEventListener('click',async()=>{
    const [f,t]=range();
    if(!f||!t){ msg('تاریخ درست نیست. قالب درست: 1405/07/01',true); return; }
    if(f>t){ msg('«از تاریخ» بعد از «تا تاریخ» است',true); return; }
    const sel={}; let any=false; document.querySelectorAll('#ntRpBody input[data-k]').forEach(c=>{ sel[c.dataset.k]=c.checked; if(c.checked) any=true; });
    if(!any){ msg('حداقل یک برگه را انتخاب کنید',true); return; }
    const b=$('rpGo'); b.disabled=true; msg('در حال ساخت…');
    try{
      await loadLib();
      const S=sheets(collect(f,t),f,t,sel);
      const name='NT-report-'+f.replace(/\//g,'-')+'_'+t.replace(/\//g,'-')+'.xlsx';   // نام لاتین: در همه مرورگرها و سیستم‌ها درست ذخیره می‌شود
      const buf=window.XLSX.write(workbook(S),{bookType:'xlsx',type:'array',compression:true});
      const url=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      const a=document.createElement('a'); a.href=url; a.download=name; a.rel='noopener'; a.style.display='none';
      document.body.appendChild(a); a.click(); setTimeout(()=>{ try{ a.remove(); URL.revokeObjectURL(url); }catch(e){} },8000);
      msg('فایل «'+name+'» ساخته شد. در پوشه دانلودها است.');
    }catch(e){ msg(e && e.message==='lib'?'کتابخانه اکسل بارگذاری نشد. اینترنت را بررسی کنید و دوباره بزنید.':'فایل ساخته نشد',true); }
    b.disabled=false;
  });
}
function close(){ const d=$('ntRpDlg'); if(d){ d.hidden=true; $('ntRpBody').innerHTML=''; } }
window.addEventListener('message',e=>{ if(e && e.data && e.data.nt==='report') open(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && $('ntRpDlg') && !$('ntRpDlg').hidden) close(); });
window.ntReport={open,collect,sheets,workbook};
})();
