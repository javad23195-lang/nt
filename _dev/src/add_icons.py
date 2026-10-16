# تصویر کوچک دستگاه کنار نام هر دستگاه در دفترچه قرائت (icons.js در پوسته؛ اینجا فقط جای خالی <i class="dico">).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
rep('<div class="nm">${esc(m.dev)}<button type="button" class="pfb"','<div class="nm"><i class="dico" data-ico="${esc(m.dev)}"></i>${esc(m.dev)}<button type="button" class="pfb"')
JS=r"""
/* تصویر دستگاه‌ها: جای خالی را از پوسته (ntIcon) پر می‌کند */
(function(){ const go=()=>{ try{ if(parent!==window && parent.ntIcon) parent.ntIcon.fill(document); }catch(e){} };
  try{ new MutationObserver(go).observe(document.body,{childList:true,subtree:true}); }catch(e){} go(); setTimeout(go,300); })();
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""
.nm .dico{display:inline-block;width:48px;height:30px;vertical-align:middle;margin-inline-end:8px}
.dico svg{display:block;width:100%;height:100%}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('icons')
