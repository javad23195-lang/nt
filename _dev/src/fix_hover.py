# رنگ «hover» در گوشی بعد از لمس گیر می‌کند → قاعده‌های :hover فقط برای موس (@media (hover:hover)).
# روی خروجی نهایی (پوسته + همه بخش‌ها) اجرا می‌شود. قاعده‌ای که بخش‌های غیر hover هم دارد، دو تکه می‌شود.
import json,base64,re,sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
R=re.compile(r'(?<=[}{>\n`;])([ \t]*)([^{}<>;`@/]*:hover[^{}<>;`@]*)\{([^{}]*)\}')
n=0
def fix(t):
    global n
    def sub(m):
        global n
        ind,sel,body=m.group(1),m.group(2),m.group(3)
        parts=[x.strip() for x in sel.split(',') if x.strip()]
        h=[x for x in parts if ':hover' in x]; o=[x for x in parts if ':hover' not in x]
        n+=1
        out=(ind+','.join(o)+'{'+body+'}') if o else ind
        return out+'@media (hover:hover){'+','.join(h)+'{'+body+'}}'
    return R.sub(sub,t)
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
for d in docs:
    t=base64.b64decode(d['b64']).decode('utf-8'); d['b64']=base64.b64encode(fix(t).encode('utf-8')).decode('ascii')
s=fix(s[:i])+json.dumps(docs,ensure_ascii=False)+fix(s[j:])
open(p,'w',encoding='utf-8').write(s); print('hover',n)
