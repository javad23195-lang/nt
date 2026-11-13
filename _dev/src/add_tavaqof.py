# افزودن زبانه «توقف شیفت» به سامانه
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
assert not any(d['name']=='توقف شیفت' for d in docs)
h=open('tavaqof-src.html',encoding='utf-8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:60],h.count(a)); h=h.replace(a,b)
# گزارش‌ها بیشتر نگه داشته شود (قبلاً ۳۰ گزارش آخر)
rep("// گزارش‌های خالی و قدیمی‌تر از ۳۰ گزارش آخر نگه داشته نمی‌شوند","// گزارش‌های خالی و قدیمی‌تر از ۶۰۰ گزارش آخر (حدود ۶ ماه) نگه داشته نمی‌شوند")
rep("while(ks.length>30) delete db[ks.shift()];","while(ks.length>600) delete db[ks.shift()];")
# وقتی زبانه دوباره باز می‌شود، آخرین اطلاعات خوانده شود
rep("\nrender();\n</script>","""
/* داخل سامانه: هر بار که این زبانه باز می‌شود، آخرین اطلاعات ذخیره‌شده خوانده می‌شود */
window.addEventListener('message',e=>{
  if(!e || !e.data || e.data.nt!=='show') return;
  if($('fSheet').classList.contains('on') || $('sSheet').classList.contains('on')) return;
  const d=LS(KEY,{}); if(d && typeof d==='object' && !Array.isArray(d)){ db=d; render(); }
});

render();
</script>""")
# نام ثبت‌کننده روی هر توقف نگه داشته می‌شود تا در سیستم‌های دیگر هم دیده شود
rep("else R.stops.push({id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),dev:fDev,from,to,cause:fCause,note});",
    "else R.stops.push({id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),dev:fDev,from,to,cause:fCause,note,by:$('who').value.trim()});")
rep("""<div class="why"><span class="chip">${esc(s.cause)}</span>${s.note?`<span>${esc(s.note)}</span>`:''}</div>""",
    """<div class="why"><span class="chip">${esc(s.cause)}</span>${s.note?`<span>${esc(s.note)}</span>`:''}${s.by?`<span>· ثبت: ${esc(s.by)}</span>`:''}</div>""")
# هر دو کادر ساعت همیشه آزاد است؛ با نوشتن «ساعت شروع دوباره»، تیک «هنوز متوقف است» خودش برداشته می‌شود
rep("  $('fTo').disabled=$('fOpen').checked; document.querySelector('[data-now=\"fTo\"]').disabled=$('fOpen').checked;\n","")
rep("['fFrom','fTo','fOpen'].forEach(id=>$(id).addEventListener('input',()=>{ $('eFrom').classList.remove('show');",
    "$('fTo').addEventListener('input',()=>{ if($('fTo').value) $('fOpen').checked=false; });\n['fFrom','fTo','fOpen'].forEach(id=>$(id).addEventListener('input',()=>{ $('eFrom').classList.remove('show');")
rep("const from=$('fFrom').value, open=$('fOpen').checked, to=open?'':$('fTo').value;",
    "const from=$('fFrom').value, to=$('fTo').value, open=!to && $('fOpen').checked;")
docs.append({"name":"توقف شیفت","icon":"▥","color":"#E0A75E","b64":base64.b64encode(h.encode('utf-8')).decode('ascii')})
import os
if os.environ.get('NT_DOCS'): open(os.path.join(os.environ['NT_DOCS'],'doc_توقف شیفت.html'),'w',encoding='utf-8').write(h)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('tabs:',[d['name'] for d in docs])
