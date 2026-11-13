# کارت «گزارش اکسل» در زبانه «امروز»
import json,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
h=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:50],h.count(a)); h=h.replace(a,b)
rep('  <div class="tiles" id="tiles" aria-label="بخش‌های سامانه"></div>\n',
    '  <div class="tiles" id="tiles" aria-label="بخش‌های سامانه"></div>\n\n'
    '  <div class="card" id="rpCard">\n'
    '    <h2 style="color:#1E8E5A">گزارش اکسل</h2>\n'
    '    <p class="sub">یک فایل اکسل با چند برگه برای یک ماه یا بازه دلخواه: خلاصه توقف، توقف‌ها، کارکرد دستگاه‌ها، قرائت، انبار، خرید، خدمات و مشکلات.</p>\n'
    '    <div class="bkrow"><button type="button" class="bkb pri" id="rpOpen">ساخت گزارش اکسل</button></div>\n'
    '  </div>\n')
rep("\n</script></body></html>","\n$('rpOpen').addEventListener('click',()=>{ try{ parent.postMessage({nt:'report'},'*'); }catch(e){} });\n</script></body></html>")
d['b64']=base64.b64encode(h.encode('utf-8')).decode('ascii')
if os.environ.get('NT_DOCS'): open(os.path.join(os.environ['NT_DOCS'],'doc_امروز.html'),'w',encoding='utf-8').write(h)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('report card added')
