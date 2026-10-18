# دفترچه قرائت تکراری: «خدمات» برای هر ردیف تازه یک قرائت دیگر push می‌کرد (همان دستگاه، همان روز).
# (۱) خدمات: قرائت همان دستگاه و همان روز جایگزین می‌شود، نه اضافه.
# (۲) دفترچه قرائت: هنگام بارگذاری، ردیف‌های تکراری (دستگاه + تاریخ) یکی می‌شوند (dedup.js در پوسته هم همین کار را می‌کند).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j]); D={d['name']:d for d in docs}
def doc(n,pairs):
    d=D[n]; t=base64.b64decode(d['b64']).decode('utf-8')
    for a,b in pairs:
        assert t.count(a)==1,(n,a[:70],t.count(a)); t=t.replace(a,b)
    d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
doc('خدمات',[("""    const L=readLog();
    L.push({dev:dev, unit:unitOf(dev), val:+_mv, date:(reg&&reg.s)?reg.s:TODAY, src:'خدمات'});
    writeLog(L);""","""    const L=readLog(), _dt=(reg&&reg.s)?reg.s:TODAY, _nr={dev:dev, unit:unitOf(dev), val:+_mv, date:_dt, src:'خدمات'};
    const _i=L.findIndex(x=>x && norm(x.dev)===norm(dev) && String(x.date)===String(_dt));
    if(_i>-1) L[_i]=Object.assign({},L[_i],{val:+_mv,unit:L[_i].unit||_nr.unit}); else L.push(_nr);
    writeLog(L);""")])
doc('دفترچه قرائت',[("  try{ const raw=SS.getItem(SKEY); if(raw){const o=JSON.parse(raw); if(Array.isArray(o)) log=o;} }catch(e){}\n}",
 "  try{ const raw=SS.getItem(SKEY); if(raw){const o=JSON.parse(raw); if(Array.isArray(o)) log=o;} }catch(e){}\n  try{ const D=parent.ntDaftarDedup&&parent.ntDaftarDedup.dedup(log); if(D){ log=D; SS.setItem(SKEY,JSON.stringify(log)); } }catch(e){}\n}")])
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('daftar dup')
