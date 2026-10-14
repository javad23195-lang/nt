# امروز: سرویس‌های گذشته و نزدیک (از برنامه سرویس دفترچه قرائت) در «نیاز به توجه». قاعده در svc.js.
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
SJ=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'svc.js'),encoding='utf-8').read()
JS=SJ+r"""
function svRows(){
  const items=LS('nt_svc_v1'); if(!Array.isArray(items)||!items.length) return [];
  const A=ntSvc.all(items,LS('nt_daftar_v1')||[],K), R=A.filter(x=>x.st==='r'), O=A.filter(x=>x.st==='o'), out=[];
  const lst=L=>L.slice(0,3).map(x=>x.it.dev+' — '+x.it.name).join('، ')+(L.length>3?' و '+fa(L.length-3)+' مورد دیگر':'');
  if(R.length) out.push({c:'r',t:fa(R.length)+' سرویس گذشته است',s:lst(R),go:'دفترچه قرائت'});
  if(O.length) out.push({c:'w',t:fa(O.length)+' سرویس نزدیک است',s:lst(O),go:'دفترچه قرائت'});
  return out;
}
"""
rep("function atRows(){",JS+"function atRows(){")
rep("  try{ rpRows().forEach(r=>R.push(r)); }catch(e){}","  try{ rpRows().forEach(r=>R.push(r)); }catch(e){}\n  try{ svRows().forEach(r=>R.push(r)); }catch(e){}")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('svc today')
