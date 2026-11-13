# دستگاه‌هایی که دیگر در معدن نیستند: از دفترچه قرائت حذف (DATA.d). سرویس‌هایشان در svc.js (GONE) نشان داده نمی‌شود.
# قرائت‌های قبلی آن‌ها در حافظه می‌ماند (تاریخچه)، فقط کارت دستگاه نیست.
import json,base64,sys,re
GONE=['ژنراتور کامینز17KVA']
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d['b64']).decode('utf-8')
a=t.index('const DATA = ')+len('const DATA = '); b=t.index(';\n',a)
D=json.loads(t[a:b]); n0=len(D['d'])
k=lambda x:re.sub(r'\s+','',x)
D['d']=[m for m in D['d'] if k(m['dev']) not in {k(g) for g in GONE}]
assert len(D['d'])==n0-len(GONE),(n0,len(D['d']))
t=t[:a]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+t[b:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('df retire',n0,'->',len(D['d']))
