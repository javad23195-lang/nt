# بخش «خرید»: زبانه‌های «میز خرید» (kdesk.html)، «لیست خرید» (kbox.html)، «پیش‌فاکتور» (kpre.html).
# ابزار مشترک (kh_common.css / kh_common.js) در هر سه گذاشته می‌شود. داده: nt_kbox_v1، nt_kweek_v1، nt_kwater_v1، nt_ksvc_v1،
# nt_kpre_v1، nt_kpre_files_v1 — همه همگام و رمزدار. هیچ نام فروشنده، کالا یا فردی در کد نیست.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
css=open('kh_common.css',encoding='utf-8').read(); js=open('kh_common.js',encoding='utf-8').read()
for N,f,ic in [('میز خرید','kdesk.html','▤'),('لیست خرید','kbox.html','☰'),('پیش‌فاکتور','kpre.html','⚖')]:
  assert not any(d['name']==N for d in docs)
  t=open(f,encoding='utf-8').read()
  assert t.count('/*KH_COMMON_CSS*/')==1 and t.count('/*KH_COMMON_JS*/')==1, f
  t=t.replace('/*KH_COMMON_CSS*/',css).replace('/*KH_COMMON_JS*/',js)
  docs.append({"name":N,"icon":ic,"color":"#1B2430","b64":base64.b64encode(t.encode('utf-8')).decode('ascii')})
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('kharid2')
