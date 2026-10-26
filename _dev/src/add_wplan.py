# زبانه تازه «برنامه هفتگی انبار» (src/wplan.html): سرویس‌های پیش رو از برنامه سرویس (nt_svc_v1 + دفترچه)،
# لیتر و نوع روغن از جدول روغن (nt_oil_v1)، موجودی از فایل سندپرداز (nt_stock_v1)، علامت «آماده شد» انبار (nt_wplan_v1).
# همه در اطلاعات رمزشده؛ هیچ نام کالا، کد یا لیتری در کد نیست.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
N='برنامه هفتگی انبار'
assert not any(d['name']==N for d in docs)
t=open('wplan.html',encoding='utf-8').read()
css=open('kh_common.css',encoding='utf-8').read(); js=open('kh_common.js',encoding='utf-8').read()
assert t.count('/*KH_COMMON_CSS*/')==1 and t.count('/*KH_COMMON_JS*/')==1
t=t.replace('/*KH_COMMON_CSS*/',css).replace('/*KH_COMMON_JS*/',js)
docs.append({"name":N,"icon":"▤","color":"#0B5C7A","b64":base64.b64encode(t.encode('utf-8')).decode('ascii')})
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('wplan')
