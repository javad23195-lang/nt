# امروز: «خرابی تکراری» در «نیاز به توجه» (تا ۷ روز بعد از ثبت تعمیر تکراری). قاعده در repeat.js (مشترک با ربات).
import json,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
RJ=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'repeat.js'),encoding='utf-8').read()
assert '</script' not in RJ
JS=RJ+r"""
function rpRows(){
  const sh=LS('nt_sh8_v1'), rows=(sh&&Array.isArray(sh.rows))?sh.rows:[], k=ntRepeat.dn(K); if(k===null) return [];
  return ntRepeat.find(rows,{days:30}).filter(x=>k-x.reg<=7 && k-x.reg>=0).map(x=>({c:'w',
    t:`خرابی تکراری: ${x.dev} — ${x.type}`,
    s:`${fa(x.n)} بار در ${fa(x.gap)} روز: `+x.list.map(l=>fa(l.date)+(l.rep?' '+l.rep:'')).join(' · '),
    tag:fa(x.n)+' بار',go:'شناسنامه'}));
}
"""
rep("function atRows(){",JS+"function atRows(){")
rep("  try{ osRows().forEach(r=>R.push(r)); }catch(e){}","  try{ osRows().forEach(r=>R.push(r)); }catch(e){}\n  try{ rpRows().forEach(r=>R.push(r)); }catch(e){}")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('repeat')
