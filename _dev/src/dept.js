/* بخش‌های دستگاه‌ها (برای «مدیریت»: ناوگان بر اساس بخش). تطبیق با بخشی از نام دستگاه. دستگاهی که در هیچ بخشی نیست → «سایر». */
(function(){
const GROUPS=[
  {n:'تولید',      m:['WA470','ZL50','مایلر','2624']},
  {n:'استخراج',    m:['PC290','PC400','TRS01','TRS02','TRS03']},
  {n:'نگهداری و تعمیرات', m:[], all:true}   /* همه دستگاه‌ها را می‌بیند؛ گروه ناوگان نیست */
];
const k=s=>String(s??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,'').toLowerCase();
function of(name){ const n=k(name); const g=GROUPS.find(g=>g.m.some(x=>n.indexOf(k(x))>-1)); return g?g.n:'سایر'; }
/* بخش این سیستم (از تنظیم کاربر توسط مدیر): '' = همه بخش‌ها */
function my(){ try{ return (window.ntSync && ntSync.myDept && ntSync.myDept())||''; }catch(e){ return ''; } }
function mine(name){ const d=my(); if(!d) return true; const g=GROUPS.find(g=>g.n===d); return !!(g&&g.all) || of(name)===d; }
window.ntDept={groups:()=>GROUPS.map(g=>g.n),of,my,mine};
})();
