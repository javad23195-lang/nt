# خدمات، برگه درخواست خدمات (چاپ): تاریخ برگه = تاریخ ثبت ردیف (y/m/d)، نه امروز.
# قبلاً r.open || r.done || TODAY بود؛ ردیف بدون «تاریخ باز» با تاریخ روز چاپ چاپ می‌شد.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='خدمات')
t=base64.b64decode(d['b64']).decode('utf-8')
a="  const raw = r.open || r.done || TODAY;\n"
assert t.count(a)==1
t=t.replace(a,"  const raw = (r.y && r.m && r.d) ? `${r.y}/${String(r.m).padStart(2,'0')}/${String(r.d).padStart(2,'0')}` : (r.date || r.reg || r.open || r.done || TODAY);\n")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('req date')
