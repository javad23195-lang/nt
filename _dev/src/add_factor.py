# زبانه تازه «فاکتور خرید» (src/factor.html) — بخش «خرید» سامانه: ثبت فاکتور، دفتر طرف حساب‌ها، خروجی برای شیت روزانه اکسل.
# در انتهای DOCS (شماره زبانه‌های قبلی عوض نمی‌شود). داده: nt_factor_v1 (فاکتورها)، nt_factor_lex_v1 (فهرست پیشنهاد)،
# nt_factor_learn_v1 (متن فاکتور → کالای درخواست)، nt_factor_cfg_v1 — همه همگام و رمزدار. هیچ نام فروشنده یا کالایی در کد نیست.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
N='فاکتور خرید'
assert not any(d['name']==N for d in docs)
t=open('factor.html',encoding='utf-8').read()
# طرح برگه گزارش مالی (فقط برچسب‌ها و فرمول‌های شیت خالی؛ بدون اطلاعات): factor_tpl.json
tpl=open('factor_tpl.json',encoding='utf-8').read().strip()
assert t.count('/*TPL*/null')==1; t=t.replace('/*TPL*/null',tpl)
docs.append({"name":N,"icon":"▦","color":"#1B2430","b64":base64.b64encode(t.encode('utf-8')).decode('ascii')})
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('factor')
