# کارت «نمودارها» در زبانه «امروز»
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
h=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:50],h.count(a)); h=h.replace(a,b)
rep('  <div class="card" id="rpCard">\n',
    '  <div class="card" id="chCard">\n'
    '    <h2 style="color:#B3261E">نمودارها</h2>\n'
    '    <p class="sub">ساعت توقف هر دستگاه، علت‌های توقف، کارکرد ماهانه و مصرف روغن — برای این ماه، ماه قبل یا ۶ ماه اخیر.</p>\n'
    '    <div class="bkrow"><button type="button" class="bkb pri" id="chOpen">دیدن نمودارها</button></div>\n'
    '  </div>\n\n'
    '  <div class="card" id="rpCard">\n')
rep("\n</script></body></html>","\n$('chOpen').addEventListener('click',()=>{ try{ parent.postMessage({nt:'charts'},'*'); }catch(e){} });\n</script></body></html>")
d['b64']=base64.b64encode(h.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('charts card added')
