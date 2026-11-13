# درخواست خرید، «کد تازه»: کد سندپرداز تکراری قبول نمی‌شود (اگر در کاتالوگ انبار برای کالای دیگری ثبت شده).
# چهار جا: افزودن دستی، اصلاح ردیف کاتالوگ، ثبت کد یک قلم منتظر، «ثبت همه».
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='درخواست خرید')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:70],t.count(a)); t=t.replace(a,b)
MSG="'این کد در انبار مال «'+x.d+'» است — کد دیگری بنویسید'"
rep("  if(!c){ say('کد سندپرداز را بنویسید',true); return; }\n",
    "  if(!c){ say('کد سندپرداز را بنویسید',true); return; }\n  { const x=codeDup(c,d); if(x){ say("+MSG+",true); try{ $('cCode').focus(); }catch(e){} return; } }\n")
rep("    if(!c){ say('کد را بنویسید',true); return; }\n",
    "    if(!c){ say('کد را بنویسید',true); return; }\n    { const x=codeDup(c,old.d); if(x){ say("+MSG+",true); try{ row.querySelector('.ec').focus(); }catch(e){} return; } }\n")
rep("  if(!c){ say('کد این قلم را بنویسید',true); row.querySelector('.cc').focus(); return; }\n",
    "  if(!c){ say('کد این قلم را بنویسید',true); row.querySelector('.cc').focus(); return; }\n  { const x=codeDup(c,d); if(x){ say("+MSG+",true); row.querySelector('.cc').classList.add('dup'); row.querySelector('.cc').focus(); return; } }\n")
rep("    const done=[];\n    box.querySelectorAll('.cwrow').forEach(r=>{",
    "    const done=[], dup=[];\n    box.querySelectorAll('.cwrow').forEach(r=>{")
rep("      if(ITEMS.some(o=>norm(o.d)===norm(d))) return;\n",
    "      if(ITEMS.some(o=>norm(o.d)===norm(d))) return;\n      if(codeDup(c,d)){ dup.push(c); r.querySelector('.cc').classList.add('dup'); return; }\n")
rep("    if(!done.length){ say('کدی وارد نکرده‌اید',true); return; }",
    "    if(!done.length){ say(dup.length?'کد تکراری: '+dup.join('، ')+' — این کدها در انبار مال کالای دیگری است':'کدی وارد نکرده‌اید',true); return; }")
rep("    say(`${fa(done.length)} کد ثبت شد — ${fa(upd)} ردیف به‌روز شد`);",
    "    say(`${fa(done.length)} کد ثبت شد — ${fa(upd)} ردیف به‌روز شد`+(dup.length?` · ${fa(dup.length)} کد تکراری ثبت نشد: ${dup.join('، ')}`:''),!!dup.length);")
JS=r"""
/* کد تکراری: آیا این کد در کاتالوگ انبار برای کالای دیگری ثبت شده؟ (رقم فارسی، فاصله و خط تیره یکسان) */
function codeKey(c){ return String(c??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s\-_.\/]/g,'').toLowerCase(); }
function codeDup(c,exceptName){ const k=codeKey(c); if(!k) return null; const ex=norm(exceptName||'');
  return ITEMS.find(o=>o && o.c!=null && String(o.c)!=='' && codeKey(o.c)===k && norm(o.d)!==ex)||null; }
try{ const st=document.createElement('style'); st.textContent='#cWait .cc.dup,#catList .ec.dup{border-color:#C0392B!important;background:#FDECEA!important}'; document.head.appendChild(st);
  document.addEventListener('input',e=>{ const t=e.target; if(t&&t.classList&&t.classList.contains('dup')) t.classList.remove('dup'); }); }catch(e){}
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('code dup')
