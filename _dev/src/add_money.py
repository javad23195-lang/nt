# مبلغ‌ها: کارت «هزینه تعمیر این ماه» در «امروز» و «مدیریت» فقط برای کسی که مبلغ‌ها را می‌بیند (ntSync.canMoney:
# سیستم مدیر، دسترسی کامل، یا کسی که پیش‌فاکتور / فاکتور خرید را می‌بیند؛ مثلاً مدیریت کل و تدارکات).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
a="/* ۳) هزینه */\n  try{ const sh=LS('nt_sh8_v1')"
for name in ('امروز','مدیریت'):
    d=next(x for x in docs if x['name']==name)
    t=base64.b64decode(d['b64']).decode('utf-8')
    assert t.count(a)==1,(name,t.count(a))
    t=t.replace(a,"/* ۳) هزینه (فقط اگر مبلغ‌ها را می‌بیند) */\n  try{ let mo=true; try{ mo=!parent.ntSync || !parent.ntSync.canMoney || parent.ntSync.canMoney(); }catch(e){} const sh=mo?LS('nt_sh8_v1'):null")
    d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('money')
