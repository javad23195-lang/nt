/* ============ چک روزانه راننده (پیش از روشن کردن، هر شیفت) ============
   داده: nt_dchk_v1 = [{id:'دستگاه|روز|شیفت', dev, d, sh, at, by, r:{کلید:'ok'|'bad'}, n:{کلید:توضیح}}] — در TABKEYS «دفترچه قرائت».
   شیفت: «صبح» از ساعت ۵ تا ۱۵، «شب» از ۱۵ تا ۵ صبح روز بعد (ساعت ۰ تا ۵ = شب روز قبل). فقط همین دو ثابت را عوض کنید.
   موردهای هر نوع دستگاه پیش‌فرض اینجاست (ITEMS + TYPES). «مشکل دارد» در qr.js به «ثبت مشکلات» می‌رود (sys = سیستم همان مورد). */
(function(root){
'use strict';
const DAY_FROM=5, NIGHT_FROM=15;
const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const nk=s=>lat(s).replace(/[\s‌\-_]+/g,'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').toLowerCase();
const p2=n=>String(n).padStart(2,'0');
/* d = نوع دکمه‌ها: '' = سالم / مشکل دارد، 'dn' = انجام شد / نشد */
const ITEMS={
  oil:{t:'روغن موتور',h:'با گیج',sys:'موتور و قطعات'},
  cool:{t:'آب رادیاتور',h:'مخزن انبساط، موتور سرد',sys:'سیستم خنک کاری'},
  hyd:{t:'روغن هیدرولیک',h:'شیشه مخزن',sys:'سیستم هیدرولیک'},
  air:{t:'نشانگر فیلتر هوا',h:'قرمز نباشد',sys:'موتور و قطعات'},
  water:{t:'تخلیه آب ته مخزن سوخت',d:'dn',sys:'سیستم سوخت رسانی'},
  grease:{t:'گریس پین‌ها',d:'dn',sys:'سرویس و نگهداری'},
  tires:{t:'لاستیک‌ها',h:'باد، بریدگی، مهره رینگ',sys:'چرخ و لاستیک'},
  track:{t:'زنجیر و غلتک‌ها',h:'شل یا سفت نباشد، پیچ و کفشک',sys:'سیستم حرکتی'},
  teeth:{t:'دندانه و تیغه باکت',h:'شکسته یا گم‌شده نباشد',sys:'پاکت واتصالات'},
  blade:{t:'تیغه و لبه',h:'سایش و پیچ‌ها',sys:'پاکت واتصالات'},
  leak:{t:'نشتی زیر دستگاه',h:'روغن، سوخت، آب',sys:'سیستم هیدرولیک'},
  belt:{t:'تسمه‌ها',h:'ترک و شل نباشد',sys:'موتور و قطعات'},
  batt:{t:'باتری و کابل‌ها',h:'سر باتری محکم و تمیز',sys:'سیستم برقی'},
  brake:{t:'ترمز',h:'ترمز پایی و دستی',sys:'سیستم ترمز'},
  safe:{t:'ترمز، بوق، چراغ، آلارم دنده عقب',sys:'سیستم ترمز'},
  lights:{t:'چراغ‌ها، بوق، آینه‌ها',sys:'سیستم برقی'},
  airtank:{t:'باد مخزن ترمز',h:'تخلیه آب مخزن باد',sys:'سیستم بادی'},
  chain:{t:'زنجیر و چنگال',h:'ترک و سایش',sys:'پاکت واتصالات'}};
const TYPES=[
  [/wa470|zl50|لودر/,['oil','cool','hyd','air','water','grease','tires','teeth','leak','safe']],
  [/pc290|pc400|بیل/,['oil','cool','hyd','air','water','grease','track','teeth','leak','safe']],
  [/gd705|گریدر/,['oil','cool','hyd','air','water','grease','tires','blade','leak','safe']],
  [/لیفتراک/,['oil','cool','hyd','tires','chain','leak','safe']],
  [/ژنراتور|kva|کیپور/,['oil','cool','air','water','belt','batt','leak']],
  [/زامیاد|کاپرا|نیسان|سیترا|مینیبوس/,['oil','cool','tires','brake','lights','leak']],
  [/کامیون|trs|مایلر|2624/,['oil','cool','air','water','tires','airtank','hyd','leak','lights','brake']]];
/** موردهای چک یک دستگاه: [{k,t,h,d,sys}] */
function items(dev){ const d=nk(dev), hit=TYPES.find(x=>x[0].test(d)), L=hit?hit[1]:['oil','cool','hyd','tires','leak','safe'];
  return L.map(k=>Object.assign({k},ITEMS[k])); }
function jOf(dt){ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(dt), g=t=>+p.find(x=>x.type===t).value;
  return g('year')+'/'+p2(g('month'))+'/'+p2(g('day')); }catch(e){ return ''; } }
function hourTehran(dt){ try{ return +new Intl.DateTimeFormat('en-u-nu-latn',{timeZone:'Asia/Tehran',hour:'2-digit',hourCycle:'h23'}).format(dt); }catch(e){ return dt.getHours(); } }
/** شیفت الان: {d,sh} — ساعت ۰ تا ۵ = شب روز قبل */
function now(dt){ dt=dt||new Date(); const h=hourTehran(dt);
  if(h>=DAY_FROM && h<NIGHT_FROM) return {d:jOf(dt),sh:'صبح'};
  if(h>=NIGHT_FROM) return {d:jOf(dt),sh:'شب'};
  return {d:jOf(new Date(dt.getTime()-864e5)),sh:'شب'}; }
const idOf=(dev,d,sh)=>String(dev)+'|'+d+'|'+sh;
function list(raw){ return (Array.isArray(raw)?raw:[]).filter(x=>x&&x.dev&&x.d&&x.sh&&x.r&&typeof x.r==='object'); }
/** چک یک دستگاه در یک شیفت (یا null) */
function get(raw,dev,d,sh){ const k=nk(dev); return list(raw).filter(x=>nk(x.dev)===k && x.d===d && x.sh===sh).pop()||null; }
const bads=rec=>rec?Object.keys(rec.r).filter(k=>rec.r[k]==='bad'):[];
root.ntDChk={ITEMS,items,now,idOf,list,get,bads,nk,DAY_FROM,NIGHT_FROM};
})(typeof window!=='undefined'?window:globalThis);
