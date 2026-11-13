# شناسنامه: «فایل اکسل برای مالی» — همان ۲۰ ستون فایلی که کاربر از اکسل خودش برای مالی می‌فرستاد
# (ردیف، سال، ماه، روز، نام ماه، دستگاه، شرح خرابی، شرح قطعه، دسته فعالیت، شروع، پایان، کارکرد، تعمیرکار، تامین‌کننده،
#  نوع پرداخت اجرت/قطعه، سند، سند خرید، هزینه اجرت، هزینه خرید). ماه = ماه ثبت (y/m). فایل در پوسته ساخته می‌شود (ntReport.finance).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='شناسنامه')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:70],t.count(a)); t=t.replace(a,b)
rep('    <div id="cmBox" hidden>','''    <button type="button" class="btn btn-ghost" id="fnBtn" aria-expanded="false" style="width:100%;min-height:44px;margin-bottom:10px">فایل اکسل برای مالی</button>
    <div id="fnBox" class="fnbox" hidden>
      <label for="fnSel">کدام ردیف‌ها؟</label>
      <select id="fnSel"></select>
      <button type="button" class="btn" id="fnGo">ساخت فایل</button>
      <div id="fnMsg" class="fnmsg" role="status"></div>
    </div>
    <div id="cmBox" hidden>''')
JS=r"""
/* ===== فایل اکسل برای مالی (add_sh_finance) ===== */
const FN_HEAD=['ردیف','سال','ماه','روز','نام ماه','نام دستگاه','شرح خرابی','شرح قطعه مصرفی','دسته فعالیت','تاریخ شروع (شمسی)','تاریخ پایان (شمسی)','ساعت کارکرد','تعمیرکار','تامین‌کننده قطعه','نوع پرداخت اجرت','نوع پرداخت قطعه','سند','سند خرید','هزینه اجرت','هزینه خرید قطعه'];
const fnLat=v=>String(v==null?'':v).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).trim();
/* عدد خالص (با یا بدون جداکننده) → عدد؛ بقیه همان متن */
const fnN=v=>{ const x=fnLat(v), y=x.replace(/[,٬\s]/g,''); return /^\d+(\.\d+)?$/.test(y)?+y:x; };
const fnKey=r=>(+fnLat(r.y))*100+(+fnLat(r.m));
function fnMonths(){ const S={}; rows.forEach(r=>{ if(r&&r.dev&&+fnLat(r.y)&&+fnLat(r.m)) S[fnKey(r)]=1; }); return Object.keys(S).map(Number).sort((a,b)=>b-a); }
function fnFill(){ const M=fnMonths(), sel=$('fnSel'), old=sel.value;
  sel.innerHTML='<option value="all">همه ردیف‌های لیست ('+fa(rows.filter(r=>r&&r.dev).length)+')</option>'+M.map(k=>{ const y=Math.floor(k/100), m=k%100, n=rows.filter(r=>r&&r.dev&&fnKey(r)===k).length;
    return '<option value="'+k+'">'+esc((DATA.months[m-1]||m)+' '+fa(y))+' ('+fa(n)+')</option>'; }).join('');
  if([...sel.options].some(o=>o.value===old)) sel.value=old; }
function fnRows(v){ return rows.filter(r=>r&&r.dev&&(v==='all'||fnKey(r)===+v)).slice().sort((a,b)=>dkey(a)-dkey(b)); }
function fnAoa(L){ return [FN_HEAD].concat(L.map((r,k)=>[k+1,fnN(r.y),fnN(r.m),fnN(r.d),r.mn||'',r.dev||'',r.desc||'',r.part||'',r.act||'',r.st||'',r.en||'',fnN(r.meter),r.rep||'',r.sup||'',r.payA||'',r.payK||'',fnN(r.docA),fnN(r.docK),fnN(r.costA),fnN(r.costK)])); }
$('fnBtn').addEventListener('click',()=>{ const b=$('fnBox'); b.hidden=!b.hidden; $('fnBtn').setAttribute('aria-expanded',String(!b.hidden)); if(!b.hidden){ fnFill(); $('fnMsg').textContent=''; } });
$('fnGo').addEventListener('click',async()=>{
  const v=$('fnSel').value, L=fnRows(v), m=$('fnMsg'); m.classList.remove('bad');
  if(!L.length){ m.textContent='ردیفی برای این انتخاب نیست.'; m.classList.add('bad'); return; }
  const R=parent.ntReport; if(!R||!R.finance){ m.textContent='این بخش در دسترس نیست.'; m.classList.add('bad'); return; }
  const b=$('fnGo'); b.disabled=true; m.textContent='در حال ساخت…';
  try{ const nm='NT-shenasnameh-'+(v==='all'?'all':String(Math.floor(v/100))+'-'+String(v%100).padStart(2,'0'))+'.xlsx';
    const f=await R.finance(fnAoa(L),nm); m.textContent='فایل «'+f+'» با '+fa(L.length)+' ردیف ساخته شد. در پوشه دانلودها است.'; }
  catch(e){ m.textContent=e&&e.message==='lib'?'کتابخانه اکسل بارگذاری نشد. اینترنت را بررسی کنید و دوباره بزنید.':'فایل ساخته نشد'; m.classList.add('bad'); }
  b.disabled=false; });
{ const _rf=render; render=function(){ _rf.apply(this,arguments); try{ if(!$('fnBox').hidden) fnFill(); }catch(e){} }; }
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
k=t.rfind("</style>"); t=t[:k]+"\n.fnbox{display:grid;gap:8px;margin:0 0 12px;padding:12px;border:1px solid #DDE3E9;border-radius:12px;background:#fff}\n.fnbox select{min-height:44px;font:inherit;padding:0 8px;border:1px solid #C7D0D9;border-radius:10px;background:#fff}\n.fnmsg{font-size:.85rem;color:#2C5E3A}.fnmsg.bad{color:#9B2C2C}\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh finance')
