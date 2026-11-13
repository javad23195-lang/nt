# دکمه «پرونده» (صفحه دستگاه، dev.js) در دفترچه قرائت (کنار نام دستگاه) و تابلوی خرابی‌ها (روی کارت).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
def get(name):
    d=next(x for x in docs if x['name']==name); return d,base64.b64decode(d['b64']).decode('utf-8')
def put(d,t): d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
def rep(t,a,b):
    assert t.count(a)==1,(a[:60],t.count(a)); return t.replace(a,b)
GO=r"""
/* «پرونده» → صفحه دستگاه در پوسته */
document.addEventListener('click',e=>{ const b=e.target&&e.target.closest&&e.target.closest('[data-pf]'); if(!b) return;
  e.preventDefault(); e.stopPropagation(); try{ parent.postMessage({nt:'devfile',name:String(b.dataset.pf||'')},'*'); }catch(x){} },true);
"""
BTN=""".pfb{flex:none;min-height:44px;margin-inline-start:8px;border:1px solid #9FB4C3;background:#fff;color:#0B3F5C;border-radius:16px;font:inherit;font-size:.74rem;font-weight:700;padding:0 10px;cursor:pointer;vertical-align:middle}
.pfb:focus-visible{outline:2px solid #0B5C7A;outline-offset:2px}
body.fast .pfb{display:none!important}
"""
def addjs(t,js,css):
    k=t.rfind("</script>"); t=t[:k]+js+"\n"+t[k:]
    k0=t.rfind("</style>"); return t[:k0]+css+t[k0:]
d,t=get('دفترچه قرائت')
t=rep(t,'''<div class="nm">${esc(m.dev)}${sv!==undefined?'<span class="badge">ثبت شد</span>':''}''',
        '''<div class="nm">${esc(m.dev)}<button type="button" class="pfb" data-pf="${esc(m.dev)}" aria-label="پرونده ${esc(m.dev)}">پرونده</button>${sv!==undefined?'<span class="badge">ثبت شد</span>':''}''')
t=addjs(t,GO,BTN); put(d,t)
d,t=get('ثبت مشکلات')
t=rep(t,'''<button type="button" class="bed" data-i="${i}" aria-label="ویرایش">✎</button></div>''',
        '''<button type="button" class="bed" data-i="${i}" aria-label="ویرایش">✎</button><button type="button" class="pfb" data-pf="${esc(r.dev)}" aria-label="پرونده ${esc(r.dev)}">پرونده</button></div>''')
t=addjs(t,GO,BTN+".bcard .bb .pfb{margin:0;min-height:44px;border-radius:8px}\n"); put(d,t)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('devlink')
