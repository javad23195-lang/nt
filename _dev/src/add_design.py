# طراحی (بازبینی طراحی): دفترچه قرائت در کامپیوتر چند ستونه؛ انبار: دکمه پایین وقتی فرم سریع هست «فرم کامل خروج» (ثانوی) و در کامپیوتر هم‌عرض صفحه.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
def doc(name): return next(x for x in docs if x['name']==name)
def css(d,c):
    t=base64.b64decode(d['b64']).decode('utf-8'); k=t.rfind('</style>'); t=t[:k]+c+t[k:]; d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
def js(d,c):
    t=base64.b64decode(d['b64']).decode('utf-8'); k=t.rfind('</script></body>'); assert k>0; t=t[:k]+c+t[k:]; d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
css(doc('دفترچه قرائت'),"""
/* ===== کامپیوتر: کارت دستگاه‌ها دو یا سه ستون (add_design.py) ===== */
@media (min-width:1000px){
  .wrap{max-width:1180px}
  #list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
  #list>.dev{margin:0!important}
  #list>:not(.dev){grid-column:1/-1}
}
@media (min-width:1500px){ .wrap{max-width:1560px} #list{grid-template-columns:repeat(3,minmax(0,1fr))} }
""")
an=doc('انبار')
css(an,"""
/* ===== دکمه پایین (add_design.py) ===== */
.obar.qk .pri{background:#fff;color:var(--ink);border:1px solid var(--line2);box-shadow:none}
.obar.qk .pri svg{stroke:currentColor}
@media (min-width:1000px){ .obar{max-width:820px;margin:0 auto;border-inline:1px solid var(--rule);border-radius:14px 14px 0 0} .obar button{min-height:44px} }
""")
js(an,r"""
/* ===== فرم سریع هست: دکمه پایین = «فرم کامل خروج» (add_design.py) ===== */
(function(){ const b=document.getElementById('oBar'), q=document.getElementById('qkCard'), t=b&&b.querySelector('#oNew span'); if(!b||!q||!t) return;
  const set=()=>{ const on=!q.hidden && q.offsetParent!==null; b.classList.toggle('qk',on); const w=on?'فرم کامل خروج':'ثبت خروج'; if(t.textContent!==w) t.textContent=w; };
  set(); try{ new MutationObserver(set).observe(document.body,{attributes:true,subtree:true,attributeFilter:['hidden','class']}); }catch(e){} })();
""")
td=doc('امروز'); t=base64.b64decode(td['b64']).decode('utf-8')
a="$('hDate').textContent = K ? `${DAYS[WD]||''} ${K}` : '';"
assert t.count(a)==1; t=t.replace(a,"$('hDate').textContent = K ? `${DAYS[WD]||''} ${fa(K)}` : '';   /* تاریخ با عدد فارسی (add_design.py) */")
td['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('layout')
