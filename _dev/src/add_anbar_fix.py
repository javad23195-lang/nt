# انبار: کدهای منتقل‌شده (کد قدیمی → کد جدید) و «دلیل نیاز» دستگاه دیگر
import json,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='انبار')
h=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global h
    c=h.count(a)
    assert (c==n if n else c>0),(a[:60],c); h=h.replace(a,b)

# ۱) فهرست تعویض روغن: روغن هیدرولیک با کد جدید
rep('"oil":"روغن هیدرولیک H 68","code":"40240034"','"oil":"روغن هیدرولیک H68","code":"966651"',0)

# ۲) قانون‌ها — بعد از تعریف srcItems
JS=r"""
/* ============ کدهای منتقل‌شده و «دلیل نیاز» دستگاه دیگر ============ */
/* کد قدیمی → کد جدید (موجودی کد قدیمی به کد جدید منتقل شده است) */
const MOVED={'40240034':'966651','40370067':'967281'};
const MOVED_BY_NAME=new Map();
DATA.items.forEach(o=>{ const to=MOVED[String(o.c)]; if(!to) return;
  const n=DATA.items.find(x=>String(x.c)===to); if(n) MOVED_BY_NAME.set(norm(o.d),n); });
/** اگر نام، کالای کد قدیمی است، کالای کد جدید را می‌دهد */
function movedTo(name){ return MOVED_BY_NAME.get(norm(name))||null; }
srcItems.forEach(o=>{ const n=movedTo(o.label); if(n) o.note='کد عوض شده ← '+n.c+' (از آن استفاده کنید)'; });
const dk=s=>norm(s).replace(/[۰-۹]/g,x=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(x)]).replace(/\s+/g,'');
const DEVK=new Set(DATA.devs.map(dk));
const GENERAL=new Set(['خط','متفرقه','واحد نگهداری و تعمیرات'].map(dk));
/** «مورد نیاز X» که X دستگاه دیگری از فهرست است */
function whyWrong(r){
  const m=/^مورد نیاز\s+(.+)$/.exec(String(r.why||'').trim()); if(!m || !r.dev) return false;
  const x=dk(m[1]), dv=dk(r.dev);
  return x!==dv && DEVK.has(x) && DEVK.has(dv) && !GENERAL.has(dv);
}
/** یک ردیف را درست می‌کند؛ اگر چیزی عوض شد true */
function fixRow(r,isOut){
  if(!r) return false; let ch=false;
  const n=movedTo(r.item);
  if(n){ r.item=n.d; if(r.code) r.code=''; ch=true; }
  if(isOut && whyWrong(r)){ r.why='مورد نیاز '+r.dev; ch=true; }
  return ch;
}
function fixAll(){
  let n=0;
  outRows.forEach(r=>{ if(fixRow(r,true)) n++; });
  inRows.forEach(r=>{ if(fixRow(r,false)) n++; });
  return n;
}
"""
rep("const srcWhy=DATA.reasons.map(d=>({label:d}));\n","const srcWhy=DATA.reasons.map(d=>({label:d}));\n"+JS)

# ۳) هر ذخیره: اول درست کردن ردیف‌ها
rep("function save(){\n","function save(){\n  try{ fixAll(); }catch(e){}\n")

# ۴) هنگام باز شدن: ردیف‌های قدیمی درست و ذخیره شوند
rep("load(); render();\n","load(); try{ if(fixAll()) save(); }catch(e){} render();\n")

# ۵) انتخاب کالای کد قدیمی در فرم → کالای جدید + پیام
rep("const cOItem=combo('oItem','lOItem',srcItems,o=>{ ",
    "const cOItem=combo('oItem','lOItem',srcItems,o=>{ if(o){ const n=movedTo(o.label); if(n){ say('کد «'+o.label+'» عوض شده ← '+n.c+' — کالای جدید گذاشته شد'); o=srcItems.find(x=>norm(x.label)===norm(n.d))||o; setTimeout(()=>{ $('oItem').value=o.label; if($('oCode')) $('oCode').value=String(o.c); stockBox(o.label,'oStk'); },0); } } ")
rep("const cIItem=combo('iItem','lIItem',srcItems,o=>{ ",
    "const cIItem=combo('iItem','lIItem',srcItems,o=>{ if(o){ const n=movedTo(o.label); if(n){ say('کد «'+o.label+'» عوض شده ← '+n.c+' — کالای جدید گذاشته شد'); o=srcItems.find(x=>norm(x.label)===norm(n.d))||o; setTimeout(()=>{ $('iItem').value=o.label; if($('iCode')) $('iCode').value=String(o.c); stockBox(o.label,'iStk'); },0); } } ")

d['b64']=base64.b64encode(h.encode('utf-8')).decode('ascii')
if os.environ.get('NT_DOCS'): open(os.path.join(os.environ['NT_DOCS'],'doc_انبار.html'),'w',encoding='utf-8').write(h)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('anbar fix added')
