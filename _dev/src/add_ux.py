# بازبینی طراحی (قاعده‌های اپل/Emil): پنجره خاکستری مرورگر (prompt/alert) → انتخاب داخل صفحه / پیام سامانه.
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
d,t=get('برنامه روزانه')
t=rep(t,"""  const list=all.slice(0,10).map((k,i)=>`${fa(i+1)}) ${k} — ${fa(db[k].tasks.length)} کار`).join('\\n');
  const ans=prompt('شماره روز را بزنید:\\n\\n'+list);
  if(!ans) return;
  const i=parseInt(String(ans).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]),10);
  if(!i || i<1 || i>Math.min(all.length,10)){ say('شماره معتبر نیست',true); return; }
  copyFrom(all[i-1]);""","""  /* فهرست دکمه‌دار زیر همین دکمه (به جای پنجره مرورگر) */
  const old=document.getElementById('pickDays'); if(old){ old.remove(); return; }
  const box=document.createElement('div'); box.id='pickDays'; box.className='pickd'; box.setAttribute('role','group'); box.setAttribute('aria-label','از کدام روز کپی شود؟');
  const hd=document.createElement('div'); hd.className='pkh'; hd.textContent='از کدام روز کپی شود؟';
  const x=document.createElement('button'); x.type='button'; x.className='pkx'; x.textContent='✕'; x.setAttribute('aria-label','بستن'); x.addEventListener('click',()=>box.remove()); hd.appendChild(x); box.appendChild(hd);
  all.slice(0,10).forEach(k=>{ const b=document.createElement('button'); b.type='button'; b.className='pkd';
    const a=document.createElement('b'); a.textContent=fa(k); const n=document.createElement('span'); n.textContent=fa(db[k].tasks.length)+' کار'; b.append(a,n);
    b.addEventListener('click',()=>{ box.remove(); copyFrom(k); }); box.appendChild(b); });
  $('bCopyPick').insertAdjacentElement('afterend',box); try{ box.querySelector('.pkd').focus(); }catch(e){}""")
t=rep(t,"</style>","""
.pickd{flex-basis:100%;width:100%;margin:8px 0;border:1px solid #C3CDD5;border-radius:12px;background:#fff;padding:6px;display:flex;flex-direction:column;gap:6px;box-shadow:0 6px 20px rgba(23,33,43,.12)}
.pickd .pkh{display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:.86rem;padding:0 4px}
.pickd .pkx{min-width:44px;min-height:44px;border:0;background:none;font:inherit;cursor:pointer}
.pickd .pkd{display:flex;justify-content:space-between;align-items:center;min-height:48px;border:1px solid #DDE3E9;border-radius:10px;background:#F7F9FA;font:inherit;padding:0 12px;cursor:pointer}
.pickd .pkd span{color:#51606E;font-size:.82rem}
@media (prefers-reduced-motion:no-preference){ .pickd{animation:pkIn .2s cubic-bezier(.23,1,.32,1)} @keyframes pkIn{from{opacity:0;transform:translateY(-6px)}} }
</style>""" if t.count("</style>")==1 else None) if t.count("</style>")==1 else t
if 'pickd{' not in t:
    k0=t.rfind("</style>"); t=t[:k0]+"""
.pickd{flex-basis:100%;width:100%;margin:8px 0;border:1px solid #C3CDD5;border-radius:12px;background:#fff;padding:6px;display:flex;flex-direction:column;gap:6px;box-shadow:0 6px 20px rgba(23,33,43,.12)}
.pickd .pkh{display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:.86rem;padding:0 4px}
.pickd .pkx{min-width:44px;min-height:44px;border:0;background:none;font:inherit;cursor:pointer}
.pickd .pkd{display:flex;justify-content:space-between;align-items:center;min-height:48px;border:1px solid #DDE3E9;border-radius:10px;background:#F7F9FA;font:inherit;padding:0 12px;cursor:pointer}
.pickd .pkd span{color:#51606E;font-size:.82rem}
@media (prefers-reduced-motion:no-preference){ .pickd{animation:pkIn .2s cubic-bezier(.23,1,.32,1)} @keyframes pkIn{from{opacity:0;transform:translateY(-6px)}} }
"""+t[k0:]
put(d,t)
d,t=get('خدمات')
t=rep(t,"alert('ساخت عکس ممکن نشد. از «چاپ / ذخیره PDF» استفاده کنید.')","(typeof say==='function'?say('ساخت عکس ممکن نشد. از «چاپ / ذخیره PDF» استفاده کنید.',true):alert('ساخت عکس ممکن نشد. از «چاپ / ذخیره PDF» استفاده کنید.'))")
put(d,t)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('ux')
