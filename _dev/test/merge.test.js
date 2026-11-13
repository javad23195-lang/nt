const fs=require('fs'); const src=fs.readFileSync(require('path').join(__dirname,'..','src','sync.js'),'utf8');
const a=src.indexOf('/* ---------- ادغام سه‌طرفه'), b=src.indexOf('/* ---------- رمزگذاری');
let W=null;   // null = همه
const code=`const LKEY='nt_log_v1', LMAX=1500; const CALC={nt_anbar_sum_v1:1}; const QUIET={nt_users_v1:1,nt_seen_v1:1}; ${src.slice(src.indexOf('const IDF='),src.indexOf('\n',src.indexOf('IDF.nt_kharid9_v1=')))}
const canWrite=k=>!W||W.includes(k);
${src.slice(a,b)}
return {mergeAll,get note(){return mergeNote;}};`;
const M=new Function('W_get',code.replace(/\bW\b(?=\|\||\.includes)/g,'W_get()'))(()=>W);
let fails=0; const eq=(x,y,m)=>{ const ok=JSON.stringify(x)===JSON.stringify(y); console.log((ok?'  ok  ':'  FAIL ')+m); if(!ok){ fails++; console.log('     got ',JSON.stringify(x)); console.log('     want',JSON.stringify(y)); } };
const S=o=>{ const r={}; for(const k in o) r[k]=JSON.stringify(o[k]); return r; };
const P=o=>{ const r={}; for(const k in o) r[k]=JSON.parse(o[k]); return r; };
const R=(n)=>({date:'1405/07/'+n,dev:'D'+n,item:'I'+n,qty:n});
const m=(b,l,r)=>P(M.mergeAll(S(b),S(l),S(r)));

// 1) دو نفر در دو بخش جدا
eq(m({out:{row:1,rows:[R(1)]},daf:[]},{out:{row:1,rows:[R(1),R(2)]},daf:[]},{out:{row:1,rows:[R(1)]},daf:[{dev:'L',date:'d1',val:5,unit:'h'}]}),
   {out:{row:1,rows:[R(1),R(2)]},daf:[{dev:'L',date:'d1',val:5,unit:'h'}]},'دو بخش جدا: هر دو می‌ماند');
// 2) هر دو در یک لیست ردیف تازه اضافه کردند
eq(m({out:{rows:[R(1)]}},{out:{rows:[R(1),R(2)]}},{out:{rows:[R(1),R(3)]}}),{out:{rows:[R(1),R(2),R(3)]}},'یک لیست، دو ردیف تازه: هر دو می‌ماند');
// 3) یکی حذف کرد، دیگری اضافه
eq(m({out:{rows:[R(1),R(2)]}},{out:{rows:[R(2)]}},{out:{rows:[R(1),R(2),R(3)]}}),{out:{rows:[R(2),R(3)]}},'حذف در این سیستم + ردیف تازه از دیگری');
eq(m({out:{rows:[R(1),R(2)]}},{out:{rows:[R(1),R(2),R(4)]}},{out:{rows:[R(2)]}}),{out:{rows:[R(2),R(4)]}},'حذف در سیستم دیگر + ردیف تازه این سیستم');
// 4) سیستم دیگر یک ردیف را اصلاح کرد (سر جای خودش)، این سیستم ردیف تازه اضافه کرد
const R2e=Object.assign(R(2),{doc:'45'});
eq(m({out:{rows:[R(1),R(2),R(3)]}},{out:{rows:[R(1),R(2),R(3),R(4)]}},{out:{rows:[R(1),R2e,R(3)]}}),{out:{rows:[R(1),R2e,R(3),R(4)]}},'اصلاح از سیستم دیگر سر جای خودش می‌نشیند');
// 5) این سیستم اصلاح کرد، سیستم دیگر اضافه کرد
eq(m({out:{rows:[R(1),R(2)]}},{out:{rows:[R(1),R2e]}},{out:{rows:[R(1),R(2),R(5)]}}),{out:{rows:[R(1),R2e,R(5)]}},'اصلاح این سیستم می‌ماند، ردیف تازه دیگری اضافه می‌شود');
// 6) هر دو همان ردیف را دو جور اصلاح کردند → هر دو نسخه
const R2f=Object.assign(R(2),{doc:'99'});
let x=m({out:{rows:[R(1),R(2)]}},{out:{rows:[R(1),R2e]}},{out:{rows:[R(1),R2f]}});
eq(x,{out:{rows:[R(1),R2e,R2f]}},'اصلاح هم‌زمان یک ردیف: هر دو نسخه می‌ماند'); eq(Object.keys(M.note),['out'],'… و خبر داده می‌شود');
// 7) هر دو همان ردیف یکسان را اضافه کردند (مثلاً یک لیست را هر دو وارد کردند) → یک بار
eq(m({out:{rows:[R(1)]}},{out:{rows:[R(1),R(7)]}},{out:{rows:[R(1),R(7),R(8)]}}),{out:{rows:[R(1),R(7),R(8)]}},'ردیف یکسان از دو سیستم دو بار نمی‌شود');
// 8) بدون پایه (اتصال اول): اجتماع، بدون تکرار
eq(m({},{out:{row:3,rows:[R(1),R(2)]}},{out:{row:3,rows:[R(2),R(3)]}}),{out:{row:3,rows:[R(1),R(2),R(3)]}},'بدون پایه: اجتماع بدون تکرار');
// 9) دفترچه قرائت: شناسه دستگاه+تاریخ
const D=(dev,date,val)=>({dev,unit:'ساعت',val,date});
W=null;
let d=P(M.mergeAll(S({nt_daftar_v1:[D('A','1',10)]}),S({nt_daftar_v1:[D('A','1',10),D('B','1',5)]}),S({nt_daftar_v1:[D('A','1',10),D('C','1',7)]})));
eq(d,{nt_daftar_v1:[D('A','1',10),D('B','1',5),D('C','1',7)]},'قرائت دو دستگاه جدا از دو سیستم');
d=P(M.mergeAll(S({nt_daftar_v1:[]}),S({nt_daftar_v1:[D('A','1',10)]}),S({nt_daftar_v1:[D('A','1',12)]})));
eq(d,{nt_daftar_v1:[D('A','1',12)]},'قرائت یک دستگاه در یک روز از دو سیستم: یک ردیف (عدد بزرگ‌تر)');
d=P(M.mergeAll(S({nt_daftar_v1:[D('A','1',10),D('B','1',5)]}),S({nt_daftar_v1:[D('B','1',5)]}),S({nt_daftar_v1:[D('A','1',10),D('B','1',6)]})));
eq(d,{nt_daftar_v1:[D('B','1',6)]},'حذف قرائت در این سیستم + اصلاح قرائت دیگر در سیستم دیگر');
// 10) توقف شیفت: شناسه id
const st=(id,to,note)=>({id,dev:'PC290',from:'08:00',to:to||'',cause:'خرابی موتور',note:note||''});
x=m({tv:{'d|صبح':{stops:[st('a')],sent:false}}},{tv:{'d|صبح':{stops:[st('a','09:00')],sent:false}}},{tv:{'d|صبح':{stops:[st('a','','شیلنگ')],sent:false},'d|عصر':{stops:[st('b')],sent:true}}});
eq(x,{tv:{'d|صبح':{stops:[st('a','09:00','شیلنگ')],sent:false},'d|عصر':{stops:[st('b')],sent:true}}},'توقف: دو تغییر روی دو خانه یک ردیف با هم ادغام می‌شود');
x=m({tv:{'d|صبح':{stops:[st('a'),st('b')]}}},{tv:{'d|صبح':{stops:[st('b')]}}},{tv:{'d|صبح':{stops:[st('a'),st('b'),st('c')]}}});
eq(x,{tv:{'d|صبح':{stops:[st('b'),st('c')]}}},'توقف: حذف + اضافه');
// 11) برنامه روزانه: شیء با کلید تاریخ
eq(m({pr:{'d1':{tasks:[{t:'x',done:false}]}}},{pr:{'d1':{tasks:[{t:'x',done:true}]}}},{pr:{'d1':{tasks:[{t:'x',done:false}]},'d2':{tasks:[{t:'y',done:false}]}}}),
   {pr:{'d1':{tasks:[{t:'x',done:true}]},'d2':{tasks:[{t:'y',done:false}]}}},'برنامه: تیک این سیستم + روز تازه از دیگری');
// 12) دسترسی محدود: فقط کلیدهای مجاز از این سیستم
W=['nt_daftar_v1'];
d=P(M.mergeAll(S({nt_daftar_v1:[],out:{rows:[R(1)]}}),S({nt_daftar_v1:[D('A','1',10)],out:{rows:[]}}),S({nt_daftar_v1:[],out:{rows:[R(1),R(2)]}})));
eq(d,{nt_daftar_v1:[D('A','1',10)],out:{rows:[R(1),R(2)]}},'دسترسی محدود: قرائت می‌ماند، دستکاری انبار نادیده گرفته می‌شود');
W=null;
// 13) یک طرف بدون تغییر
eq(m({a:[1,2]},{a:[1,2]},{a:[1,2,3]}),{a:[1,2,3]},'بدون تغییر محلی: همان اطلاعات مشترک');
eq(m({a:[1,2]},{a:[1,2,9]},{a:[1,2]}),{a:[1,2,9]},'بدون تغییر در اطلاعات مشترک: همان این سیستم');
eq(m({a:['x']},{a:['x','y']},{a:['x','y']}),{a:['x','y']},'هر دو یک مقدار ساده یکسان اضافه کردند: یک بار');
// 14) کلید حذف‌شده
eq(m({a:[1],b:[1]},{a:[1]},{a:[1],b:[1]}),{a:[1]},'حذف کامل یک بخش در این سیستم');
// 15) تصادفی: ادغام نباید ردیف بسازد یا گم کند (افزودن‌های دو طرف)
let bad=0;
for(let t=0;t<300;t++){
  const base=[...Array(6)].map((_,i)=>R(i+1));
  const l=base.slice(), r=base.slice(); const la=[], ra=[], ld=[], rd=[];
  for(let k=0;k<3;k++){ if(Math.random()<.6){ const v=R(100+t*10+k); l.push(v); la.push(v); } if(Math.random()<.6){ const v=R(500+t*10+k); r.push(v); ra.push(v); } }
  if(Math.random()<.5){ const i=Math.floor(Math.random()*l.length); if(i<6){ ld.push(JSON.stringify(l[i])); l.splice(i,1); } }
  if(Math.random()<.5){ const i=Math.floor(Math.random()*6); const s=JSON.stringify(base[i]); const q=r.findIndex(z=>JSON.stringify(z)===s); if(q>-1){ rd.push(s); r.splice(q,1); } }
  const res=m({k:base},{k:l},{k:r}).k.map(z=>JSON.stringify(z));
  const want=new Set(base.map(z=>JSON.stringify(z)).filter(s=>!ld.includes(s)&&!rd.includes(s)).concat(la.map(z=>JSON.stringify(z)),ra.map(z=>JSON.stringify(z))));
  if(res.length!==want.size || res.some(s=>!want.has(s))) bad++;
}
eq(bad,0,'۳۰۰ ترکیب تصادفی افزودن/حذف: نتیجه دقیق');
// انبار: دو سیستم همان اصلاح خودکار (کد جدید / دلیل نیاز) را جدا انجام دادند → تکراری نشود
{ const o=R(5), n=Object.assign(R(5),{item:'NEW'}), n2=Object.assign(R(6),{why:'W6'});
  eq(m({out:{rows:[R(1),o,R(6)]}},{out:{rows:[R(1),n,n2]}},{out:{rows:[R(1),n,n2,R(7)]}}),{out:{rows:[R(1),n,n2,R(7)]}},'اصلاح یکسان در دو سیستم: ردیف تکراری نمی‌شود'); }
// تاریخچه تغییرات: فقط اضافه می‌شود؛ حذف یا تغییر یک سیستم اثر ندارد
{ const E=(id,u)=>({id,u,t:'2026-10-16T0'+id+':00:00Z',k:'nt_daftar_v1',a:1,c:0,d:0,s:[]});
  const r=m({nt_log_v1:[E('1','a'),E('2','b')]},{nt_log_v1:[E('3','b')]},{nt_log_v1:[E('1','a'),E('2','b'),E('4','a')]});
  eq(r.nt_log_v1.map(e=>e.id),['1','2','3','4'],'تاریخچه: ردیف‌هایی که یک سیستم پاک کرده برمی‌گردد و ردیف تازه هر دو می‌ماند'); }
// درخواست خرید: ردیف‌ها شناسه دارند (یا اثر متن)؛ اصلاح هم‌زمان دو سیستم ← یک ردیف، نه دو
{ const K=(item,x)=>Object.assign({date:'1405/07/20',unit:'WA470',item,qty:1,d1:'',d2:'',buy:''},x||{});
  const H=o=>{ const x=JSON.stringify(o); let h=0x811c9dc5; for(let i=0;i<x.length;i++){ h^=x.charCodeAt(i); h=Math.imul(h,16777619); } return 'h'+(h>>>0).toString(36)+x.length.toString(36); };
  const a=K('ترموستات'), b=K('واترپمپ'), id=H(a);
  // ردیف قدیمی (بدون id): این سیستم سند مصرف زد (id = اثر پیش از اصلاح)، سیستم دیگر هم با کد تازه «خرید» زد
  let r=m({nt_kharid9_v1:{rows:[a,b]}},{nt_kharid9_v1:{rows:[Object.assign({},a,{id,d1:'55'}),b]}},{nt_kharid9_v1:{rows:[Object.assign({},a,{id,buy:'خریده شد'}),b]}});
  eq(r.nt_kharid9_v1.rows,[Object.assign({},a,{id,d1:'55'},{buy:'خریده شد'}),b],'خرید: اصلاح هم‌زمان یک ردیف ← یک ردیف با هر دو اصلاح');
  // فقط این سیستم اصلاح کرد، سیستم دیگر ردیف تازه افزود
  const c=K('فیلتر',{id:'hz1'});
  r=m({nt_kharid9_v1:{rows:[a,b]}},{nt_kharid9_v1:{rows:[Object.assign({},a,{id,d1:'55'}),b]}},{nt_kharid9_v1:{rows:[a,b,c]}});
  eq(r.nt_kharid9_v1.rows,[Object.assign({},a,{id,d1:'55'}),b,c],'خرید: اصلاح این سیستم + ردیف تازه دیگری، بدون تکرار');
  // دو ردیف کاملاً یکسان قدیمی: سیستم دیگر یکی را حذف کرد
  r=m({nt_kharid9_v1:{rows:[a,a,b]}},{nt_kharid9_v1:{rows:[a,a,b]}},{nt_kharid9_v1:{rows:[a,b]}});
  eq(r.nt_kharid9_v1.rows,[a,b],'خرید: حذف یکی از دو ردیف یکسان در سیستم دیگر'); }
// شماره ترتیب __i: تغییر آن در دو سیستم، ردیف را تکراری نمی‌کند (خطای «دو بار ثبت شده» در خروج انبار)
{ const X=(n,i,x)=>Object.assign({date:'1405/07/2'+n,dev:'ZL50',item:'روغن H68',qty:160,__i:i},x||{});
  const r=m({nt_anbar_out_v1:{rows:[X(1,0),X(2,1)]}},{nt_anbar_out_v1:{rows:[X(0,0,{item:'فیلتر'}),X(1,1,{doc:'55'}),X(2,2)]}},{nt_anbar_out_v1:{rows:[X(1,5,{doc:'55'}),X(2,6)]}});
  eq(r.nt_anbar_out_v1.rows.length,3,'__i متفاوت در دو سیستم: ردیف‌ها تکراری نمی‌شوند');
  eq(r.nt_anbar_out_v1.rows.some(x=>'__i' in x),false,'__i در نتیجه ادغام نیست'); }
console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق'); process.exit(fails?1:0);
