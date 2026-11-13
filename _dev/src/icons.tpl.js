/* ============ تصویر دستگاه‌ها ============
   ساخته‌شده با mk_icons.py از src/icons/*.svg (کشیده‌شده از روی عکس دستگاه‌های معدن، بدون آرم و نوشته کارخانه).
   ntIcon.byName(نام دستگاه) → متن SVG ثابت (هیچ اطلاعات کاربر داخل آن نمی‌رود). نام ناشناخته → ''.
   در بخش‌ها: <i class="dico" data-ico="نام"></i> خودکار پر می‌شود (ntIcon.fill). */
(function(){
'use strict';
const SVG=/*SVG*/{};
const nk=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[\s‌\-_]+/g,'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').toLowerCase();
/* ترتیب مهم است: اول نام دقیق، بعد نوع کلی */
const MAP=[[/pc290/,'pc2'],[/pc400/,'pc'],[/wa470/,'wa'],[/zl50/,'zl'],[/لیفتراک/,'fk'],[/gd705|گریدر/,'gd'],
  [/کیپور/,'kp2'],[/1030/,'gn2'],[/کوماتسو220|ژنراتورکوماتسو/,'gn3'],[/فرگوسن/,'gn4'],[/700/,'gn'],
  [/مایلر|2624|تانکر/,'my'],[/trs|lk1924/,'lk'],[/زامیاد|نیسان/,'zm'],[/کاپرا/,'kp'],[/سیترا|مینیبوس/,'mb'],
  [/لودر/,'wa'],[/بیل/,'pc'],[/کامیون/,'lk'],[/ژنراتور|kva/,'gn']];
function key(name){ const n=nk(name); if(!n) return ''; const m=MAP.find(x=>x[0].test(n)); return m?m[1]:''; }
function byName(name){ const k=key(name); return k&&SVG[k]?SVG[k]:''; }
/* پر کردن جای خالی تصویرها در یک صفحه (پوسته یا بخش) */
function fill(root){ try{ (root||document).querySelectorAll('i.dico:empty').forEach(el=>{ const s=byName(el.getAttribute('data-ico')); if(s) el.innerHTML=s; else el.remove(); }); }catch(e){} }
window.ntIcon={byName,key,fill};
})();
