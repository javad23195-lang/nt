# بازبینی دسترس‌پذیری (چک‌لیست Vercel): برای همه زبانه‌ها
#  - هر کادر ورودی نام دارد (برای صفحه‌خوان)، اندازه متن کادر ۱۶ پیکسل (گوشی بزرگ‌نمایی نکند)
#  - دکمه‌ها حداقل ۴۴ پیکسل، متن‌های ریز حداقل ۱۲ پیکسل، رنگ‌های کم‌کنتراست تیره‌تر
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
CSS="""<style id="ntA11y">
input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]),select{font-size:16px!important}
button.go,button.btn,button.mini,button.kbtn,button.mkcam,button.xd,.btn.s,.btn-ghost,.seg button,#tlSh button,.phr button,.xa,
.slip .drop,.slip .edit,.slip .prn,.slip .tosh,#selAll,#selInt,#selExt,#selNone,input#mRow,input.xn,.ar button,.al button{min-height:44px!important}
.slip .drop,.slip .edit,.slip .prn,.slip .tosh,button.xd{min-width:44px}
input.pick{width:30px!important;height:30px!important}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
input[type=number]{-moz-appearance:textfield}
.wd,.sb,.cp,.ch,#flSub,.sp small,.kbtn,.flnote,small{font-size:max(12px,.75rem)!important}
.slip .op{color:#7A4E00!important}
#mAjr{color:#8A5300!important}#mKhr{color:#17663F!important}
</style>"""
JS=r"""<script>
/* نام برای کادرهای بدون برچسب: از placeholder، یا عنوان کارت؛ بعد از هر بار رسم دوباره هم اجرا می‌شود */
(function(){
  function nm(e){
    if(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.closest('label')) return;
    if(e.id){ try{ if(document.querySelector('label[for="'+CSS.escape(e.id)+'"]')) return; }catch(x){} }
    var t=e.getAttribute('placeholder')||e.getAttribute('title')||'';
    var card=e.closest('.dev,.slip,.card,section,.xr');
    if(e.classList.contains('rv')&&card){ var h=card.querySelector('h3,h2,b,.name'); if(h) t='قرائت '+h.textContent.trim().slice(0,40); }
    if(!t && e.id==='mRow') t='شماره ردیف شروع در اکسل';
    if(!t && e.tagName==='TEXTAREA') t='متن برای کپی';
    if(t) e.setAttribute('aria-label',t.trim());
  }
  function run(){ try{ document.querySelectorAll('input:not([type=hidden]),select,textarea').forEach(nm); }catch(x){} }
  var tm=null; function later(){ clearTimeout(tm); tm=setTimeout(run,150); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  try{ new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true}); }catch(x){}
})();
</script>"""
for d in docs:
    t=base64.b64decode(d['b64']).decode('utf-8')
    if d['name']=='خدمات':
        assert t.count('style="color:#8A959E">ثبت ')==1; t=t.replace('style="color:#8A959E">ثبت ','style="color:#5F6B76">ثبت ')
    k=t.rfind('</body>'); assert k>0, d['name']
    t=t[:k]+CSS+JS+t[k:]
    d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('a11y',len(docs))
