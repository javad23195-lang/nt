# زبانه تازه «مدیریت»: کارت‌های خلاصه (سرویس گذشته، توقف، خرابی باز، هزینه)، «نیاز به توجه»، «ناوگان»، «خط زمان»، «نمودارها» و «گزارش اکسل».
# همان صفحه «امروز» است با html.mgmt (یک کد، دو نما). در «امروز» کارت‌های خلاصه، ناوگان و خط زمان پنهان می‌شوند؛
# «نیاز به توجه» در هر دو هست. زبانه در انتهای DOCS (شماره زبانه‌های قبلی عوض نمی‌شود)؛ ترتیب نمایش در nav.js.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
assert not any(d['name']=='مدیریت' for d in docs)
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
CSS="""
/* دو نما: امروز / مدیریت */
html:not(.mgmt) #kpis,html:not(.mgmt) #flCard,html:not(.mgmt) #tlCard,html:not(.mgmt) #chCard,html:not(.mgmt) #rpCard{display:none!important}
html.mgmt .wrap>*:not(header):not(#kpis):not(#atCard):not(#flCard):not(#tlCard):not(#chCard):not(#rpCard){display:none!important}
html.mgmt #hSum{display:none!important}
"""
k=t.find("</style>"); assert k>0
t=t[:k]+CSS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
m=t
def rep(a,b):
    global m
    assert m.count(a)==1,(a[:60],m.count(a)); m=m.replace(a,b)
rep('<html lang="fa" dir="rtl">','<html lang="fa" dir="rtl" class="mgmt">')
rep('<title>کارهای امروز</title>','<title>مدیریت</title>')
rep('<h1><span>▣</span> امروز</h1>','<h1><span>▣</span> مدیریت</h1>')
docs.append({"name":"مدیریت","icon":"▤","color":"#1B2430","b64":base64.b64encode(m.encode('utf-8')).decode('ascii')})
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('mgmt')
