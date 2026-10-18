/* دفترچه قرائت: یک قرائت برای هر دستگاه در هر روز.
   قبلاً «خدمات» برای هر ردیف تازه یک قرائت دیگر اضافه می‌کرد (همان روز، همان عدد) و تاریخچه دستگاه تکراری می‌شد.
   اینجا ردیف‌های تکراری (دستگاه + تاریخ یکسان) یکی می‌شوند؛ آخرین ردیف می‌ماند. هنگام باز شدن سامانه یک بار. */
(function(){
const K='nt_daftar_v1';
const nd=s=>String(s??'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s]+/g,' ').trim();
const nt=s=>{ const t=String(s??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();
  const m=/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(t); return m?m[1]+'/'+m[2].padStart(2,'0')+'/'+m[3].padStart(2,'0'):t; };
function dedup(L){
  if(!Array.isArray(L)) return null;
  const last=new Map();
  L.forEach((x,i)=>{ if(x && typeof x==='object' && x.dev && x.date) last.set(nd(x.dev)+'|'+nt(x.date),i); });
  const out=L.filter((x,i)=>!(x && typeof x==='object' && x.dev && x.date) || last.get(nd(x.dev)+'|'+nt(x.date))===i);
  return out.length===L.length?null:out;
}
function run(){ try{ const raw=localStorage.getItem(K); if(!raw) return 0; const o=dedup(JSON.parse(raw)); if(!o) return 0;
  const n=JSON.parse(raw).length-o.length; localStorage.setItem(K,JSON.stringify(o));
  try{ if(window.ntSync && ntSync.touch) ntSync.touch([K]); }catch(e){}
  return n; }catch(e){ return 0; } }
window.ntDaftarDedup={dedup,run};
run(); setTimeout(run,8000);
})();
