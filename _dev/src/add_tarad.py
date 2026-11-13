# زبانه تازه «تردد و اضافه‌کار» (src/tarad.html): ثبت اضافه‌کار نهاری/بعدازظهر و مأموریت؛ بررسی فایل تردد ets؛ افراد و برنامه کاری.
# در انتهای DOCS (شماره زبانه‌های قبلی عوض نمی‌شود). داده: nt_staff_v1، nt_ezafe_v1 (همگام، رمزدار). فایل تردد ذخیره نمی‌شود.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
N='تردد و اضافه‌کار'
assert not any(d['name']==N for d in docs)
t=open('tarad.html',encoding='utf-8').read()
docs.append({"name":N,"icon":"◷","color":"#0B5C7A","b64":base64.b64encode(t.encode('utf-8')).decode('ascii')})
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('tarad')
