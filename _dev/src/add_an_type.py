# انبار، ثبت خروج: (۱) زبانه «تعویض روغن» = سرویس دوره‌ای: فهرست سرویس‌های همان دستگاه خودکار باز می‌شود.
# (۲) «چند قلم با هم» و «پیام مسنجر» هم نوع خروجِ زبانه انتخاب‌شده را می‌گیرند (قبلاً بی‌نوع می‌ماندند و
#     tagOldSvc در باز شدن بعدی، روغن‌ها را به «تعویض روغن» می‌برد — مثلاً ۲۰ لیتر روغن هیدرولیک مصرفی بیل).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='انبار')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:70],t.count(a)); t=t.replace(a,b)
rep("$('oTypeSeg').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ $('oType').value=b.dataset.t; typeSegSync(); }));",
    "$('oTypeSeg').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ $('oType').value=b.dataset.t; typeSegSync(); try{ anTypeAlt(b.dataset.t); }catch(e){} }));")
rep("    outRows.push({date:dt.s,y:dt.y,m:dt.m,d:dt.d,dev,item,qty,why,cond});",
    "    { const nr={date:dt.s,y:dt.y,m:dt.m,d:dt.d,dev,item,qty,why,cond}; setTyp(nr,$('oType').value||'msr'); outRows.push(nr); }")
rep("""      outRows.push({date:dt.s,y:dt.y,m:dt.m,d:dt.d,dev,item,qty,
        why:wv||fw||('مورد نیاز '+dev), cond:$('oCond').value});""",
    """      { const nr={date:dt.s,y:dt.y,m:dt.m,d:dt.d,dev,item,qty,
        why:wv||fw||('مورد نیاز '+dev), cond:$('oCond').value}; setTyp(nr,$('oType').value||'msr'); outRows.push(nr); }""")
JS=r"""
/* زبانه «تعویض روغن» = سرویس دوره‌ای: فهرست سرویس‌های دستگاه زیر فرم باز می‌شود؛ زبانه دیگر → بسته */
function anTypeAlt(t){
  const sh=$('oSheet'); if(!sh || sh.classList.contains('edit')) return;
  const net=$('altNet'); if(!net) return;
  if(t==='svc'){
    ['altNet','altMsg','altMulti'].forEach(x=>{ if($(x)) $(x).hidden=true; }); net.hidden=false;
    const dev=cODev.val(); try{ netRender(dev); }catch(e){} altSync();
    if(!dev){ say('اول دستگاه را انتخاب کنید؛ سرویس‌های همان دستگاه می‌آید'); try{ $('oDev').focus(); }catch(e){} }
    else if($('netBox') && $('netBox').style.display==='none') say('برای «'+dev+'» سرویس دوره‌ای ثبت نشده؛ کالا را دستی بنویسید');
    try{ net.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){}
  } else if(!net.hidden){ net.hidden=true; altSync(); }
}
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('an type')
