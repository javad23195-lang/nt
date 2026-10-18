# برون‌سپاری = «پیگیری فاکتور»: کارها خودکار از «خدمات» (خدمت خارجی بسته‌شده) می‌آیند (invoice.js در پوسته).
# مرحله آخر «ثبت در شناسنامه» (نه سندپرداز). کار خودکار حذف‌شده با del=1 می‌ماند تا دوباره ساخته نشود.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='برون‌سپاری')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:70],t.count(a)); t=t.replace(a,b)
rep('<p class="sub">یادآور فاکتور تعمیر بیرونی: گرفتن فاکتور از پیمانکار و ثبت آن در سندپرداز.</p>',
    '<p class="sub">پیگیری فاکتور تعمیر بیرونی: خدمت خارجی که بسته شد خودکار اینجا می‌آید؛ فاکتور را بگیرید و در شناسنامه ثبت کنید.</p>')
rep("{k:'fin',n:'ثبت در سندپرداز',need:[]}","{k:'fin',n:'ثبت در شناسنامه',need:[]}")
rep("'ثبت فاکتور در سندپرداز'","'ثبت فاکتور در شناسنامه'")
rep("'ثبت فاکتور دیگر در سندپرداز'","'ثبت فاکتور دیگر در شناسنامه'")
rep("ثبت در سندپرداز<small>","ثبت در شناسنامه<small>")
rep("say('اول «ثبت در سندپرداز» را بردارید',true)","say('اول «ثبت در شناسنامه» را بردارید',true)")
rep("'«ثبت در سندپرداز» ثبت شد'","'«ثبت در شناسنامه» ثبت شد'")
rep('aria-label="برگه سندپرداز"','aria-label="جزئیات کار"')
rep('>در سندپرداز زدم، ثبت شد</button>','>ثبت شد</button>')
rep('همه قدم‌های بعدی، گروه‌بندی‌شده بر اساس صفحه سندپرداز. هر گروه را پشت سر هم بزنید.','همه قدم‌های بعدی، گروه‌بندی‌شده بر اساس مرحله.')
# کارهای حذف‌شده دیده نشوند
rep("jobs.filter(j=>j&&j.id","jobs.filter(j=>j&&j.id&&!j.del",3)
# حذف: کار خودکار (از خدمات) علامت del می‌گیرد
rep("if(armDel===id){ jobs=jobs.filter(x=>x.id!==id);","if(armDel===id){ const _j=jobs.find(x=>x.id===id); if(_j&&_j.key){ _j.del=1; } else jobs=jobs.filter(x=>x.id!==id);")
# برچسب «از خدمات» و تاریخ پایان کار
rep("<h3>${esc(j.dev)} <span class=\"chip\">${esc(j.ven||'پیمانکار نامعلوم')}</span></h3>",
    "<h3>${esc(j.dev)} <span class=\"chip\">${esc(j.ven||'پیمانکار نامعلوم')}</span>${j.src==='kh'?' <span class=\"chip g\">از خدمات</span>':''}</h3>")
rep("if(j.ws) meta.push(`<span class=\"chip\">کار ${fa(j.ws)}${j.we?' تا '+fa(j.we):''}</span>`);\n    if(j.amt)",
    "if(j.ws) meta.push(`<span class=\"chip\">${j.src==='kh'?'پایان کار':'کار'} ${fa(j.ws)}${j.we?' تا '+fa(j.we):''}</span>`);\n    if(j.amt)")
# پیش از نمایش، کارهای تازه از خدمات
rep("function reload(){ const d=LS(KEY,[]);","function reload(){ try{ P().ntInvoice&&P().ntInvoice.sync(); }catch(e){} const d=LS(KEY,[]);")
JS=r"""
/* راهنما برای مرحله «ثبت در شناسنامه»: از «خدمات» دکمه شناسنامه را بزنید تا خودکار تمام شود */
try{ const h=document.createElement('p'); h.className='sub'; h.style.marginTop='4px'; h.textContent='نکته: در «خدمات» روی دکمه شناسنامه همان خدمت بزنید؛ بعد از ذخیره در شناسنامه، اینجا خودکار تمام می‌شود.'; const sub=document.querySelector('header .sub'); if(sub) sub.after(h); }catch(e){}
try{ P().ntInvoice&&P().ntInvoice.sync(); jobs=LS(KEY,[]); if(!Array.isArray(jobs)) jobs=[]; render(); }catch(e){}
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('outsrc inv')
