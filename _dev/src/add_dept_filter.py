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
# «نیاز به توجه» و هشدارها: فقط دستگاه‌های بخش؛ موردی که زبانه‌اش برای کاربر پنهان است نمی‌آید
rep("  const kr=kh.rows||[];","  const kr=(kh.rows||[]).filter(r=>r&&ntIn(r.unit));")
rep("  const sh=LS('nt_sh8_v1')||{}; const sr=sh.rows||[];","  const sh=LS('nt_sh8_v1')||{}; const sr=(sh.rows||[]).filter(r=>r&&ntIn(r.dev));")
rep("  const kd=LS('nt_khadamat_v1')||{}; const dr=kd.rows||[];","  const kd=LS('nt_khadamat_v1')||{}; const dr=(kd.rows||[]).filter(r=>r&&ntIn(r.dev));")
rep("  const mk=LS('nt_moshkel_v1')||{}; const mr=mk.rows||[];","  const mk=LS('nt_moshkel_v1')||{}; const mr=(mk.rows||[]).filter(r=>r&&ntIn(r.dev));")
rep("  if(Array.isArray(df)&&df.length) out.push(","  if(Array.isArray(df)&&df.filter(x=>x&&ntIn(x.dev)).length) out.push(")
rep("t:`${fa(df.length)} قرائت در دفترچه`","t:`${fa(df.filter(x=>x&&ntIn(x.dev)).length)} قرائت در دفترچه`")
rep("  const A=ntSvc.all(items,LS('nt_daftar_v1')||[],K), R=A.filter(x=>x.st==='r')","  const A=ntSvc.all(items.filter(x=>x&&ntIn(x.dev)),LS('nt_daftar_v1')||[],K), R=A.filter(x=>x.st==='r')")
rep("const W=ntFluid.warnings(E,LS('nt_daftar_v1')||[],K,unit); if(!W.length) return [];","const W=ntFluid.warnings(E,LS('nt_daftar_v1')||[],K,unit).filter(x=>ntIn(x.dev)); if(!W.length) return [];")
rep("  const sh=LS('nt_sh8_v1'), rows=(sh&&Array.isArray(sh.rows))?sh.rows:[], k=ntRepeat.dn(K); if(k===null) return [];","  const sh=LS('nt_sh8_v1'), rows=((sh&&Array.isArray(sh.rows))?sh.rows:[]).filter(r=>r&&ntIn(r.dev)), k=ntRepeat.dn(K); if(k===null) return [];")
rep("  const kh=((LS('nt_kharid9_v1')||{}).rows||[]).filter(r=>r.over!=='لغو شد' && r.over!=='بسته شد');","  const kh=((LS('nt_kharid9_v1')||{}).rows||[]).filter(r=>r && ntIn(r.unit) && r.over!=='لغو شد' && r.over!=='بسته شد');")
rep("""    if(old) R.push({c:'i',t:fa(old)+' عکس پشتیبان ندارد',s:'در زبانه «عکس‌ها» به بله یا تلگرام بفرستید',go:'عکس‌ها'}); }catch(e){}
  try{ const b=bkAge(); if(b===null||b>7) R.push({c:'i',t:b===null?'پشتیبان ندارید':'آخرین پشتیبان '+fa(b)+' روز پیش',s:'یک نسخه پشتیبان بگیرید',bk:1}); }catch(e){}
  return R;""","""    if(old) R.push({c:'i',t:fa(old)+' عکس پشتیبان ندارد',s:'در زبانه «عکس‌ها» به بله یا تلگرام بفرستید',go:'عکس‌ها'}); }catch(e){}
  try{ const b=bkAge(); if(b===null||b>7) R.push({c:'i',t:b===null?'پشتیبان ندارید':'آخرین پشتیبان '+fa(b)+' روز پیش',s:'یک نسخه پشتیبان بگیرید',bk:1}); }catch(e){}
  { const cs=n=>{ try{ return !parent.ntSync || parent.ntSync.canSee(n); }catch(e){ return true; } };
    AT_CH=AT_CH.filter(cs); return R.filter(r=>!r.go || cs(r.go)); }""")
rep("  return jobs.filter(j=>j&&j.id&&!j.del&&osOpen(j))","  return jobs.filter(j=>j&&j.id&&!j.del&&ntIn(j.dev)&&osOpen(j))")
JS=r"""
/* ===== بخش کاربر: فقط دستگاه‌های همان بخش (add_dept_filter) ===== */
(function ntDeptGo(n){ try{
  if(!parent.ntDept || !parent.ntSync || !parent.ntSync.myDept){ if((n||0)<100) setTimeout(()=>ntDeptGo((n||0)+1),100); return; }   /* پوسته هنوز آماده نیست */
  const dp=parent.ntDept.my()||''; if(!dp) return;
  const _fl=flBuild; flBuild=function(){ const D=_fl.apply(this,arguments); if(D&&Array.isArray(D.list)) D.list=D.list.filter(x=>ntIn(x.n)); return D; };
  const _tl=tlBuild; tlBuild=function(){ const D=_tl.apply(this,arguments); if(D&&Array.isArray(D.rows)) D.rows=D.rows.filter(r=>ntIn(r.n)); return D; };
  const h=document.querySelector('header h1'); if(h){ const b=document.createElement('span'); b.className='dpt'; b.textContent='بخش '+dp; h.appendChild(b); }
  try{ flRender(); }catch(e){} try{ kpRender(); }catch(e){} try{ atRender(); }catch(e){} try{ tlRender(); }catch(e){} try{ alRender(); }catch(e){}
}catch(e){} })(0);
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
k=t.index('<script>')+8; t=t[:k]+"\nfunction ntIn(dev){ try{ return !parent.ntDept || parent.ntDept.mine(dev); }catch(e){ return true; } }\n"+t[k:]
k=t.rfind("</style>"); t=t[:k]+"\nheader .dpt{display:inline-block!important;vertical-align:middle;margin-inline-start:8px;padding:1px 10px;border-radius:10px;background:#FFF1D6;color:#7A4300;font-weight:700;font-size:.78rem}\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
# «دفترچه قرائت»: فهرست دستگاه‌ها (و شمارش، ورود از اکسل) فقط دستگاه‌های بخش کاربر
d2=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d2['b64']).decode('utf-8')
a='\nconst $ = id=>document.getElementById(id);\n'; assert t.count(a)==1
t=t.replace(a,"\n/* بخش کاربر: اگر پوسته هنوز آماده نیست (این زبانه اولین زبانه باز است)، بعداً اعمال و دوباره نمایش داده می‌شود */\nfunction ntDeptD(){ try{ const _D=parent.ntDept; if(!_D || !parent.ntSync || !parent.ntSync.myDept) return false; const dp=_D.my(); if(dp){ DATA.d=DATA.d.filter(m=>_D.mine(m.dev)); const h=document.querySelector('.nh2 h1'); if(h && !h.querySelector('.dpt')){ const b=document.createElement('span'); b.className='dpt'; b.textContent='بخش '+dp; h.appendChild(b); } } return true; }catch(e){ return true; } }\nconst ntDeptLate=!ntDeptD();"+a)
a="nh.innerHTML='<h1>دفترچه قرائت</h1><span class=\"nhd\"></span>';"; assert t.count(a)==1
t=t.replace(a,a+" try{ ntDeptD.lbl=1; const dp=parent.ntDept&&parent.ntDept.my(); if(dp){ const b=document.createElement('span'); b.className='dpt'; b.textContent='بخش '+dp; nh.querySelector('h1').appendChild(b); } }catch(e){}")
k2=t.rfind("</script>"); t=t[:k2]+"\nif(ntDeptLate){ let n=0; const tm=setInterval(()=>{ n++; if(ntDeptD()||n>100){ clearInterval(tm); try{ render(); }catch(e){} } },100); }\n"+t[k2:]
k=t.rfind("</style>"); t=t[:k]+"\n.nh2 .dpt{display:inline-block;vertical-align:middle;margin-inline-start:8px;padding:1px 10px;border-radius:10px;background:#FFF1D6;color:#7A4300;font-weight:700;font-size:.78rem}\n"+t[k:]
d2['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('dept filter')
