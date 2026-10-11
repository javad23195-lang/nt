# برچسب «چاپ نشده» روی خدمات + یک خط در «امروز»
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
def doc(n): return next(x for x in docs if x['name']==n)
def patch(n,fn):
    d=doc(n); t=base64.b64decode(d['b64']).decode('utf-8'); t=fn(t); d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
def rep(t,a,b):
    assert t.count(a)==1,(a[:60],t.count(a)); return t.replace(a,b)
def kh(t):
    t=rep(t,"""<span class="tag${r.kind==='داخلی'?' in':''}">${esc(r.kind)}</span>""",
      """<span class="tag${r.kind==='داخلی'?' in':''}">${esc(r.kind)}</span>${npr(r)?'<span class="tag np">چاپ نشده</span>':''}""")
    t=rep(t,"function dayGap(a,b){","""/* چاپ‌نشده: خدمت دو هفته‌ی اخیر که هنوز برگه‌اش چاپ نشده (خدمت‌های قدیمی برچسب نمی‌گیرند) */
function npr(r){ try{ if(!r||r.pr) return false; return dayGap(r.y+'/'+r.m+'/'+r.d,TODAY)<=14; }catch(e){ return false; } }
function dayGap(a,b){""")
    t=rep(t,"/* ============ انتخاب ردیف برای چاپ ============ */","""/* ثبت چاپ: هر ردیفی که برگه‌اش باز شد، «چاپ‌شده» می‌شود */
(function(){
  const pi=printInternal, pq=printReq;
  function mk(l){ try{ (l||[]).forEach(r=>{ if(r && !r.pr) r.pr=TODAY; }); saveRows(); render(); }catch(e){} }
  printInternal=function(list){ const L=(list&&list.length)?list:rows.filter(r=>r.kind==='داخلی'); const x=pi(list); mk(L); return x; };
  printReq=function(list){ const x=pq(list); mk(list); return x; };
})();
/* ============ انتخاب ردیف برای چاپ ============ */""")
    t=rep(t,".slip .tag.in{background:#E6F0F4;color:var(--acc)}",".slip .tag.in{background:#E6F0F4;color:var(--acc)}\n.slip .tag.np{background:#FFF1D6;color:#8A5300;font-weight:800;margin-inline-start:6px}")
    return t
def td(t):
    return rep(t,"  const kd=LS('nt_khadamat_v1')||{}; const dr=kd.rows||[];",
"""  const kd=LS('nt_khadamat_v1')||{}; const dr=kd.rows||[];
  { const p=String(K).split('/').map(Number), tj=p[0]*372+(p[1]-1)*31+p[2];
    const np=dr.filter(r=>r&&!r.pr&&Math.abs(tj-((+r.y)*372+((+r.m)-1)*31+(+r.d)))<=14).length;
    if(np) out.push({lv:'hot', t:`${fa(np)} خدمت چاپ‌نشده`, s:'آیکون چاپگر را در زبانه «خدمات» بزنید', go:'خدمات'}); }""")
patch('خدمات',kh); patch('امروز',td)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('print flag')
