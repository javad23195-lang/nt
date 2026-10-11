# زبانه «عکس‌ها»: عکس هر دستگاه به تفکیک بخش و قطعه (خود عکس روی همان گوشی، اطلاعات همگام)
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
assert not any(d['name']=='عکس‌ها' for d in docs)
h=open('photos-src.html',encoding='utf-8').read()
docs.append({"name":"عکس‌ها","icon":"▣","color":"#3B8EA5","b64":base64.b64encode(h.encode('utf-8')).decode('ascii')})
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('photos tab')
