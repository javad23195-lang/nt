# کارت «کد QR دستگاه‌ها» در زبانه «امروز»
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
rep('    <div class="bkrow"><button type="button" class="bkb pri" id="rpOpen">ساخت گزارش اکسل</button></div>\n  </div>\n',
    '    <div class="bkrow"><button type="button" class="bkb pri" id="rpOpen">ساخت گزارش اکسل</button></div>\n  </div>\n\n'
    '  <div class="card" id="qrCard">\n'
    '    <h2 style="color:#0B5C7A">کد QR دستگاه‌ها</h2>\n'
    '    <p class="sub">برچسب هر دستگاه را چاپ کنید و داخل کابین بچسبانید. با اسکن برچسب، صفحه همان دستگاه باز می‌شود: ثبت قرائت، شروع و پایان توقف، ثبت مشکل و سوابق.</p>\n'
    '    <div class="bkrow"><button type="button" class="bkb pri" id="qrLabels">چاپ برچسب‌ها</button><button type="button" class="bkb" id="qrScanT">اسکن</button></div>\n'
    '  </div>\n')
rep("\n</script></body></html>","\n$('qrLabels').addEventListener('click',()=>{ try{ parent.postMessage({nt:'qrlabels'},'*'); }catch(e){} });\n$('qrScanT').addEventListener('click',()=>{ try{ parent.postMessage({nt:'qrscan'},'*'); }catch(e){} });\n</script></body></html>")
d['b64']=base64.b64encode(h.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('qr card added')
