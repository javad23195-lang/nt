/* ============ توقف دستگاه‌ها: یک قاعده برای نمودار، گزارش اکسل و صفحه دستگاه ============
   - دستگاه‌های تولید (TRACKED: بیل‌ها، لودرها، کامیون‌ها) در فرم «توقف شیفت» دقیق ثبت می‌شوند (ساعت شروع و پایان).
     همه ساعت‌های توقف این دستگاه‌ها فقط از فرم توقف خوانده می‌شود.
   - بقیه دستگاه‌ها: «مدت توقف» هر کار در «برنامه روزانه» (عدد حدودی).
   پس هیچ توقفی دو بار شمرده نمی‌شود. */
(function(){
'use strict';
const TRACKED=['بیل مکانیکی کوماتسو PC290','بیل مکانیکی کوماتسو PC400','لودر کوماتسو WA470','لودر ZL50',
  'کامیون TRS01','کامیون TRS02','کامیون TRS03','کامیون مایلر 2624'];
/* علت‌های فرم توقف. گروه «خرابی» = BROKEN؛ «سرویس دوره‌ای» در گروه سرویس و نگهداری حساب می‌شود */
const BROKEN=['خرابی موتور','خرابی هیدرولیک','خرابی برق','خرابی گیربکس','خرابی لاستیک','زنجیر و زیربندی','پاکت و ناخن','سرویس دوره‌ای','خرابی دیگر'];
const IDLE=['نبود راننده','نبود سوخت','انتظار کامیون','انتظار بارگیری','جابه‌جایی دستگاه','هوا (باران شدید، مه غلیظ، برف)','سایر'];
const SERVICE=['سرویس دوره‌ای'];
const ALIAS={'جابه‌جایی بیل':'جابه‌جایی دستگاه'};
const CLS={em:'خرابی',pm:'سرویس و نگهداری',idle:'سالم ولی کار نکرد'};
const SHIFT_ORDER={'صبح':0,'عصر':1,'شب':2};
/* روز کاری ۷ تا ۱۵. استراحت‌ها «توقف» حساب نمی‌شوند. (دقیقه از نیمه‌شب) */
const HOURS={from:420,to:900};
const BREAKS=[{from:540,to:555,n:'صبحانه'},{from:720,to:765,n:'نهار و استراحت'}];
/** چند دقیقه از بازه [a,b) (دقیقه از نیمه‌شب؛ اگر b<a از نیمه‌شب رد می‌شود) در استراحت است */
function brk(a,b){ if(a===null||b===null) return 0; const seg=b>a?[[a,b]]:[[a,1440],[0,b]]; let s=0;
  seg.forEach(g=>BREAKS.forEach(x=>{ const o=Math.min(g[1],x.to)-Math.max(g[0],x.from); if(o>0) s+=o; })); return s; }
const p2=n=>String(n).padStart(2,'0');
const latin=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
const key=s=>latin(s).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s\-_]+/g,'').toLowerCase();
const TK=new Set(TRACKED.map(key));
const tracked=dev=>TK.has(key(dev));
function LS(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
function nd(s){ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/.exec(latin(s).trim()); return m?`${m[1]}/${p2(+m[2])}/${p2(+m[3])}`:''; }
const mins=t=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(t||''); return m?(+m[1])*60+(+m[2]):null; };
const dur=(a,b)=>{ const x=mins(a), y=mins(b); return (x===null||y===null)?null:(y-x+1440)%1440; };
/** مدت به دقیقه: «2:30»، «2» (ساعت)، «۲ ساعت و ۳۰ دقیقه» */
function toMin(v){
  const t=latin(v).replace(/[٫,]/g,'.').trim(); if(!t) return null;
  let m=/^(\d{1,3}):(\d{1,2})$/.exec(t); if(m) return (+m[1])*60+(+m[2]);
  if(/^\d+(\.\d+)?$/.test(t)) return Math.round(parseFloat(t)*60);
  const h=/(\d+(?:\.\d+)?)\s*ساعت/.exec(t), mi=/(\d+)\s*دقیقه/.exec(t);
  if(h||mi) return Math.round((h?parseFloat(h[1])*60:0)+(mi?+mi[1]:0));
  return null;
}
const clsOf=cause=>SERVICE.indexOf(cause)>-1?'pm':(BROKEN.indexOf(cause)>-1?'em':'idle');
/** همه توقف‌های بازه. opt.shift / opt.prog = خواندن هر منبع (بر اساس دسترسی).
    هر ردیف: {day,sh,dev,from,to,min(null=هنوز متوقف),cause,cls,src,note,by} */
function list(from,to,opt){
  opt=opt||{}; const out=[]; const In=d=>d && d>=from && d<=to;
  if(opt.shift!==false){
    const tv=LS('nt_tavaqof_v1')||{};
    Object.keys(tv).forEach(k=>{ const [d,sh]=k.split('|'), day=nd(d); if(!In(day)) return;
      ((tv[k]&&tv[k].stops)||[]).forEach(s=>{ if(!s || !s.dev) return; const cause=ALIAS[s.cause]||s.cause||'نامشخص';
        out.push({day,sh:sh||'',dev:s.dev,from:s.from||'',to:s.to||'',min:s.to?Math.max(0,(dur(s.from,s.to)||0)-brk(mins(s.from),mins(s.to))):null,cause,cls:clsOf(cause),src:'توقف شیفت',note:s.note||'',by:s.by||''}); }); });
  }
  if(opt.prog!==false){
    const db=LS('nt_prog_v1')||{};
    Object.keys(db).forEach(k=>{ const day=nd(k); if(!In(day)) return;
      ((db[k]&&db[k].tasks)||[]).forEach(t=>{ if(!t || !t.dev || tracked(t.dev)) return;
        let m=toMin(t.sdur); if(m===null) m=toMin(t.stop); if(!m || m<=0) return;
        const em=t.kind==='EM' || (!t.kind && !!t.fault);
        out.push({day,sh:'',dev:t.dev,from:'',to:'',min:m,cause:String(t.act||'').trim()||'سایر',cls:em?'em':'pm',src:'برنامه روزانه',note:t.prog||'',by:''}); }); });
  }
  out.sort((a,b)=>a.day.localeCompare(b.day)||(SHIFT_ORDER[a.sh]??9)-(SHIFT_ORDER[b.sh]??9)||(mins(a.from)??0)-(mins(b.from)??0));
  return out;
}
/** اضافه‌کار (کار خارج از ساعت کاری): کلید «روز|اضافه» در همان nt_tavaqof_v1، فهرست work */
function work(from,to){ const tv=LS('nt_tavaqof_v1')||{}, out=[];
  Object.keys(tv).forEach(k=>{ const [d,sh]=k.split('|'), day=nd(d); if(sh!=='اضافه' || !day || day<from || day>to) return;
    ((tv[k]&&tv[k].work)||[]).forEach(w=>{ if(!w||!w.dev) return; out.push({day,dev:w.dev,from:w.from||'',to:w.to||'',min:w.to?dur(w.from,w.to):null,by:w.by||''}); }); });
  return out.sort((a,b)=>a.day.localeCompare(b.day)||(mins(a.from)??0)-(mins(b.from)??0)); }
window.ntStops={TRACKED,BROKEN,IDLE,SERVICE,CLS,tracked,list,toMin,dur,clsOf,HOURS,BREAKS,brk,work};
})();
