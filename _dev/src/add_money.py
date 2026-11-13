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

# شناسنامه و برون‌سپاری: کسی که مبلغ‌ها را نمی‌بیند (canMoney=false، مثلاً سرپرست نگهداری) مبلغ را نمی‌بیند و ثبت نمی‌کند.
# فقط پنهان (html.nomoney)؛ فیلدها در صفحه می‌مانند، پس ویرایش ردیف مبلغ قبلی را پاک نمی‌کند. خروجی اکسل مالی و کپی خروجی هم پنهان است.
NM_JS="<script>try{ if(parent.ntSync && parent.ntSync.canMoney && !parent.ntSync.canMoney()) document.documentElement.classList.add('nomoney'); }catch(e){}</script>"
NM_FIELDS=r"""
/* ===== پنهان کردن مبلغ (add_money.py) ===== */
(function(){ ['fCostA','fCostK','fAmt'].forEach(id=>{ const e=document.getElementById(id), f=e&&e.closest('.field,.fld'); if(f) f.classList.add('mny'); }); })();
"""
def patch(name,css,reps):
    d=next(x for x in docs if x['name']==name)
    t=base64.b64decode(d['b64']).decode('utf-8')
    k=t.find('<script>'); assert k>0; t=t[:k]+NM_JS+t[k:]
    k=t.rfind('</style>'); t=t[:k]+css+t[k:]
    for a,b in reps:
        assert t.count(a)==1,(name,a[:60],t.count(a)); t=t.replace(a,b)
    k=t.rfind('</script></body>'); assert k>0; t=t[:k]+NM_FIELDS+t[k:]
    d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
patch('شناسنامه',"""
html.nomoney .mny,html.nomoney #tot,html.nomoney #cmBtn,html.nomoney #cmBox,html.nomoney .meter.aj,html.nomoney .meter.kh,html.nomoney .gc,html.nomoney .gsum,
html.nomoney .slip .cost,html.nomoney #fnBtn,html.nomoney #fnBox,html.nomoney #bCopy,html.nomoney .out{display:none!important}
""",[
 ('<div class="field"><label>مبلغ (ریال)</label><input data-f="cost"','<div class="field mny"><label>مبلغ (ریال)</label><input data-f="cost"'),
 ('<div class="field"><label for="dv${k}a">','<div class="field mny"><label for="dv${k}a">'),
 ('<div class="field"><label for="dv${k}k">','<div class="field mny"><label for="dv${k}k">'),
 ("<span class=\"aj\">اجرت ${faNum(r.costA||0)}","<span class=\"aj\">اجرت<i class=\"mny\" style=\"font-style:normal\"> ${faNum(r.costA||0)}</i>"),
 ("<span class=\"kh\">خرید ${faNum(r.costK||0)}","<span class=\"kh\">خرید<i class=\"mny\" style=\"font-style:normal\"> ${faNum(r.costK||0)}</i>")])
patch('برون‌سپاری',"""
html.nomoney .mny{display:none!important}
""",[
 ("if(j.amt) meta.push(`<span class=\"chip\">","if(j.amt) meta.push(`<span class=\"chip mny\">"),
 ("${rowH('مبلغ (ریال)',j.amt)}","<div class=\"mny\">${rowH('مبلغ (ریال)',j.amt)}</div>")])
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('money')
