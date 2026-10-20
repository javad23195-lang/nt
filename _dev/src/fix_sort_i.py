# همه زبانه‌ها: sortByDate دیگر شماره ترتیب (__i) را در ردیف نمی‌نویسد (مرتب‌سازی پایدار). __i در هم‌زمانی ردیف تکراری می‌ساخت؛
# sync.js هم هنگام ادغام __i را نادیده می‌گیرد (stripI). شناسنامه هنوز پس از درج __i می‌نویسد؛ بی‌اثر است.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
A="""  arr.forEach((r,i)=>{ if(r.__i===undefined) r.__i=i; });
  arr.sort((a,b)=> dkey(a)-dkey(b) || a.__i-b.__i );
  arr.forEach((r,i)=>{ r.__i=i; });"""
B="""  arr.sort((a,b)=> dkey(a)-dkey(b));   /* پایدار؛ بدون __i */
  arr.forEach(r=>{ if(r && typeof r==='object') delete r.__i; });"""
n=0
for d in docs:
    t=base64.b64decode(d['b64']).decode('utf-8')
    if A in t:
        t=t.replace(A,B); n+=1
        d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
assert n>=4,n
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sort __i',n)
