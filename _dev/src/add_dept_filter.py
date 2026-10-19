# «امروز»/«مدیریت»: کاربری که مدیر برایش «بخش» گذاشته (ntDept.my) فقط دستگاه‌های همان بخش را می‌بیند:
# ناوگان، خط زمان، نیاز به توجه (خرابی‌ها، فاکتورها) و کارت‌های خلاصه (توقف، سرویس، هزینه، خرابی باز). پیش از add_mgmt اجرا می‌شود.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:70],t.count(a)); t=t.replace(a,b)
k0=t.index('function kpRender'); k1=t.index('if(!C.length){ box.innerHTML',k0)
K=t[k0:k1]
def kr(a,b,n=1):
    global K
    assert K.count(a)==n,(a[:70],K.count(a)); K=K.replace(a,b)
kr("try{ const N=parent.ntStops; if(N && N.list){","try{ const N0=parent.ntStops; const N=N0&&N0.list?{list:(a,b,o)=>N0.list(a,b,o).filter(x=>ntIn(x.dev))}:null; if(N && N.list){")
kr("const A=ntSvc.all(items,LS('nt_daftar_v1')||[],K)","const A=ntSvc.all(items.filter(x=>x&&ntIn(x.dev)),LS('nt_daftar_v1')||[],K)")
kr("const sh=LS('nt_sh8_v1'), rows=(sh&&Array.isArray(sh.rows))?sh.rows:[];","const sh=LS('nt_sh8_v1'), rows=((sh&&Array.isArray(sh.rows))?sh.rows:[]).filter(r=>r&&ntIn(r.dev));")
kr("const mk=LS('nt_moshkel_v1'), rows=(mk&&Array.isArray(mk.rows))?mk.rows:[];","const mk=LS('nt_moshkel_v1'), rows=((mk&&Array.isArray(mk.rows))?mk.rows:[]).filter(r=>r&&ntIn(r.dev));")
t=t[:k0]+K+t[k1:]
rep("  return jobs.filter(j=>j&&j.id&&!j.del&&osOpen(j))","  return jobs.filter(j=>j&&j.id&&!j.del&&ntIn(j.dev)&&osOpen(j))")
JS=r"""
/* ===== بخش کاربر: فقط دستگاه‌های همان بخش (add_dept_filter) ===== */
(function(){ try{
  const dp=(parent.ntDept&&parent.ntDept.my())||''; if(!dp) return;
  const _fl=flBuild; flBuild=function(){ const D=_fl.apply(this,arguments); if(D&&Array.isArray(D.list)) D.list=D.list.filter(x=>ntIn(x.n)); return D; };
  const _tl=tlBuild; tlBuild=function(){ const D=_tl.apply(this,arguments); if(D&&Array.isArray(D.rows)) D.rows=D.rows.filter(r=>ntIn(r.n)); return D; };
  const h=document.querySelector('header h1'); if(h){ const b=document.createElement('span'); b.className='dpt'; b.textContent='بخش '+dp; h.appendChild(b); }
  try{ flRender(); }catch(e){} try{ kpRender(); }catch(e){} try{ atRender(); }catch(e){}
}catch(e){} })();
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
k=t.index('<script>')+8; t=t[:k]+"\nfunction ntIn(dev){ try{ return !parent.ntDept || parent.ntDept.mine(dev); }catch(e){ return true; } }\n"+t[k:]
k=t.rfind("</style>"); t=t[:k]+"\nheader .dpt{display:inline-block!important;vertical-align:middle;margin-inline-start:8px;padding:1px 10px;border-radius:10px;background:#FFF1D6;color:#7A4300;font-weight:700;font-size:.78rem}\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
# «دفترچه قرائت»: فهرست دستگاه‌ها (و شمارش، ورود از اکسل) فقط دستگاه‌های بخش کاربر
d2=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d2['b64']).decode('utf-8')
a='\nconst $ = id=>document.getElementById(id);\n'; assert t.count(a)==1
t=t.replace(a,"\ntry{ const _D=parent.ntDept; if(_D && _D.my()) DATA.d=DATA.d.filter(m=>_D.mine(m.dev)); }catch(e){}"+a)
a="nh.innerHTML='<h1>دفترچه قرائت</h1><span class=\"nhd\"></span>';"; assert t.count(a)==1
t=t.replace(a,a+" try{ const dp=parent.ntDept&&parent.ntDept.my(); if(dp){ const b=document.createElement('span'); b.className='dpt'; b.textContent='بخش '+dp; nh.querySelector('h1').appendChild(b); } }catch(e){}")
k=t.rfind("</style>"); t=t[:k]+"\n.nh2 .dpt{display:inline-block;vertical-align:middle;margin-inline-start:8px;padding:1px 10px;border-radius:10px;background:#FFF1D6;color:#7A4300;font-weight:700;font-size:.78rem}\n"+t[k:]
d2['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('dept filter')
