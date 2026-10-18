# برون‌سپاری: بخش «اطلاعات بیشتر» (کد تجهیز، خرابی، کدها، مبلغ، شماره فاکتور) از فرم برداشته شد — کاربر فقط پیگیری فاکتور می‌خواهد.
# خانه‌ها پنهان در صفحه می‌مانند تا اطلاعات کارهای قدیمی با «ویرایش» پاک نشود. در کامپیوتر، ردیف‌های «مبلغ» و «شماره فاکتور» هم نمایش داده نمی‌شود.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='برون‌سپاری')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:70],t.count(a)); t=t.replace(a,b)
rep('<details class="more" id="fMore">','<details class="more" id="fMore" hidden>')
rep("rcv:[],fin:[['پیمانکار',j.ven],['مبلغ (ریال)',j.amt],['شماره فاکتور',j.inv],['شرح',j.desc]]}[k]||[]; }",
    "rcv:[],fin:[['پیمانکار',j.ven],['شرح',j.desc]]}[k]||[]; }")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('outsrc more')
