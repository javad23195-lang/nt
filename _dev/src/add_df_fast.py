# دفترچه قرائت: «قرائت سریع» — همه دستگاه‌ها فشرده، یک خط برای هر دستگاه؛ Enter = دستگاه بعدی؛ در آخر «ذخیره همه».
# همچنین: اگر برنامه سرویس در زبانه دیگر (انبار) عوض شد، دفترچه دوباره رسم می‌شود.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
rep('<div class="bar"><input type="search" id="q" placeholder="جستجوی دستگاه…"></div>',
    '<div class="bar"><input type="search" id="q" placeholder="جستجوی دستگاه…"><button type="button" id="fastBtn" aria-pressed="false">⚡ قرائت سریع</button></div>\n<div class="fasthint" id="fastHint">عدد هر دستگاه را بزنید و <b>Enter</b> (یا «بعدی» در صفحه‌کلید) بزنید تا به دستگاه بعدی بروید. در آخر «ذخیره همه» را بزنید.</div>')
JS=r"""
/* ---------- قرائت سریع ---------- */
(function(){
  const K='ntdf_fast'; let on=false; try{ on=localStorage.getItem(K)==='1'; }catch(e){}
  const set=v=>{ on=v; document.body.classList.toggle('fast',on); $('fastBtn').setAttribute('aria-pressed',String(on)); $('fastBtn').textContent=on?'⚡ قرائت سریع (روشن)':'⚡ قرائت سریع'; try{ localStorage.setItem(K,on?'1':'0'); }catch(e){} };
  $('fastBtn').addEventListener('click',()=>{ set(!on); if(on){ const f=document.querySelector('#list .rv'); if(f) f.focus(); } });
  set(on);
  document.addEventListener('keydown',e=>{
    if(!on || e.key!=='Enter') return; const el=e.target; if(!el || !el.classList || !el.classList.contains('rv')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const all=[...document.querySelectorAll('#list .rv')], k=all.indexOf(el);
    if(k>-1 && k<all.length-1){ all[k+1].focus(); all[k+1].scrollIntoView({block:'center'}); }
    else{ const b=$('bSave'); if(b && !b.disabled){ b.focus(); } }
  },true);
  document.querySelectorAll('#list .rv').forEach(x=>x.setAttribute('enterkeyhint','next'));
  new MutationObserver(()=>document.querySelectorAll('#list .rv').forEach(x=>x.setAttribute('enterkeyhint','next'))).observe($('list'),{childList:true});
})();
window.addEventListener('storage',e=>{ if(e && (e.key==='nt_svc_v1'||e.key==='nt_svc_log_v1')){ const a=document.activeElement; if(a && a.tagName==='INPUT') return; try{ render(); }catch(x){} } });
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""#fastBtn{flex:none;min-height:44px;border-radius:10px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-weight:700;padding:0 12px;cursor:pointer;color:#17212B;margin-inline-start:8px}
#fastBtn[aria-pressed=true]{background:#0B5C7A;border-color:#0B5C7A;color:#fff}
.bar{display:flex;align-items:center}.bar #q{flex:1;min-width:0}
.fasthint{display:none;font-size:.82rem;color:#3D4852;margin:4px 2px 8px;line-height:1.7}
body.fast .fasthint{display:block}
body.fast .dev .svc,body.fast .dev details.hist,body.fast .dev .nm>span,body.fast .dev .inp .sv,body.fast .dev .inp .u,body.fast .dev .badge{display:none!important}
body.fast .dev{padding:6px 12px!important;margin-bottom:4px!important}
body.fast .dev .top{display:grid;grid-template-columns:minmax(0,1fr) 140px;gap:0 10px;align-items:center;padding:0!important}
body.fast .dev .inp .rv{min-height:44px;height:44px}
body.fast .dev .nm{font-size:.92rem;margin:0}
body.fast .dev .inp{margin:0}
body.fast .dev .inp input{width:100%}
body.fast .dev .last{grid-column:1/-1;font-size:.75rem;margin:0;padding:0;border:0}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('df fast')
