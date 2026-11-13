# متن فارسی بدون «·»: در خروجی نهایی (پوسته و همه فرم‌ها) « · » و «·» به «، » تبدیل می‌شود.
# «·» در هیچ‌جای کد برای جدا کردن یا جستجو به کار نمی‌رود (فقط در متن نمایشی)؛ آزمایش‌ها «، » را می‌پذیرند.
import json,base64,sys,re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def fix(t): return re.sub(r'\s*·\s*','، ',t)
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j]); n=0
for d in docs:
    t=base64.b64decode(d['b64']).decode('utf-8'); c=t.count('·')
    if c: n+=c; d['b64']=base64.b64encode(fix(t).encode('utf-8')).decode('ascii')
a,b=s[:i],s[j:]; n+=a.count('·')+b.count('·')
s=fix(a)+json.dumps(docs,ensure_ascii=False)+fix(b)
assert '·' not in s
open(p,'w',encoding='utf-8').write(s); print('no-dot',n)
