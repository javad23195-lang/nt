# فهرست‌های پایه (نام افراد، فروشنده‌ها، کاتالوگ انبار، شرح کارها، قرائت اولیه) در کد عمومی نیست.
# در کد جای آن‌ها خالی است (base-user-1047.html) و از اطلاعات رمزدار می‌آید: nt_lists_v1 = {app:'nt-lists', v, at, docs:{نام زبانه:{کلید:[...]}}}.
# این مرحله بعد از «const DATA = {...};» هر فرم، پر کردن از nt_lists_v1 را می‌گذارد: فقط کلیدی که در DATA هست و آرایه است؛ متن‌ها از < > " پاک می‌شوند.
# بارگذاری و گرفتن فایل فهرست‌ها: sync.js (فقط سیستم مدیر).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j]); n=0
JS=r"""
/* ===== فهرست‌های رمزدار (add_lists.py) ===== */
(function(){ try{ const L=JSON.parse(localStorage.getItem('nt_lists_v1')||'null'), o=L&&L.docs&&L.docs[%s]; if(!o||typeof o!=='object') return;
  const cl=(v,dp)=>typeof v==='string'?v.replace(/[<>"]/g,'').slice(0,1200):(typeof v==='number'&&isFinite(v))?v:(v===null||typeof v==='boolean')?v:(dp<4&&Array.isArray(v))?v.slice(0,5000).map(x=>cl(x,dp+1)):(dp<4&&v&&typeof v==='object')?Object.keys(v).slice(0,40).reduce((a,k)=>{ a[String(k).replace(/[<>"]/g,'').slice(0,40)]=cl(v[k],dp+1); return a; },{}):'';
  Object.keys(o).forEach(k=>{ if(Object.prototype.hasOwnProperty.call(DATA,k) && Array.isArray(DATA[k]) && Array.isArray(o[k])) DATA[k]=cl(o[k],0); }); }catch(e){} })();
"""
for d in docs:
    t=base64.b64decode(d['b64']).decode('utf-8')
    k=t.find('const DATA = {')
    if k<0: continue
    assert t.count('const DATA = {')==1,(d['name'],t.count('const DATA = {'))
    try: obj,end=json.JSONDecoder().raw_decode(t[k+13:])
    except ValueError: continue          # DATA که JSON نیست (شیء جاوااسکریپت): فهرست پایه ندارد
    e=k+13+end
    assert t[e:e+2]==';\n',(d['name'],t[e:e+10])
    t=t[:e+2]+(JS%json.dumps(d['name'],ensure_ascii=False))+t[e+2:]
    d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii'); n+=1
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('lists',n)
