# «:» خودکار در کادرهای ساعت/مدت متنی (برنامه روزانه، شناسنامه). پوسته (فرم‌های QR) همان hmmask.js را در build.py دارد.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
M=open('hmmask.js',encoding='utf-8').read()
for d in docs:
    if d['name'] not in ('برنامه روزانه','شناسنامه'): continue
    t=base64.b64decode(d['b64']).decode('utf-8')
    k=t.rfind("</script>"); t=t[:k]+M+"\n"+t[k:]
    d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('hm mask')
