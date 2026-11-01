# تسمه‌ها: بارگذاری فایل «مشخصات تسمه‌ها» و اصلاح ردیف‌ها در «انبار ← موجودی»؛ ردیف «نیاز به توجه» در «امروز».
# قاعده و داده در belts.js (پوسته)؛ صفحه دستگاه و چک روزانه در qr.js.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='انبار')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:70],t.count(a)); t=t.replace(a,b)
CSS=r"""
/* ===== تسمه‌ها (add_belts.py) ===== */
details.blt{margin:12px 0 4px;border:1px solid #D5DCE3;border-radius:12px;background:#fff}
details.blt>summary{min-height:48px;display:flex;align-items:center;gap:8px;padding:0 12px;font-weight:900;cursor:pointer;list-style:none}
details.blt>summary::-webkit-details-marker{display:none}
details.blt>summary small{margin-inline-start:auto;font-weight:600;color:var(--dim)}
.bltb{padding:0 12px 12px}
.bltr{border-top:1px solid #EEF1F4;padding:8px 0}
.bltr b{display:block;font-size:.88rem}.bltr b small{font-weight:500;color:var(--dim);margin-inline-start:6px}
.bltg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin-top:4px}
.bltg label{display:grid;grid-template-columns:1fr 46px;gap:4px;align-items:center;font-size:.72rem;color:var(--dim);font-weight:700}
.bltg label span{grid-column:1/-1}
.bltg input{min-height:38px;border:1px solid #C3CDD5;border-radius:8px;padding:0 6px;font:inherit;font-size:.82rem;direction:ltr;text-align:left;width:100%;box-sizing:border-box}
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]
rep('''<div class="stu"><button type="button" id="stUp">بارگذاری فایل موجودی سندپرداز</button><span id="stAt"></span><input type="file" id="stFile" accept=".xlsx,.xls,.csv" hidden></div>''',
'''<div class="stu"><button type="button" id="stUp">بارگذاری فایل موجودی سندپرداز</button><span id="stAt"></span><input type="file" id="stFile" accept=".xlsx,.xls,.csv" hidden></div>
      <details class="blt" id="bltW"><summary>تسمه‌های دستگاه‌ها <small id="bltAt"></small></summary><div class="bltb">
        <div class="stu" style="margin:4px 0 8px"><button type="button" id="bltUp">بارگذاری فایل «مشخصات تسمه‌ها»</button><input type="file" id="bltFile" accept=".xlsx,.xls" hidden><span id="bltMsg"></span></div>
        <div id="bltList"></div></div></details>''')
JS=r"""
/* ===== تسمه‌ها (add_belts.py) ===== */
(function(){
const B=()=>{ try{ return parent.ntBelt; }catch(e){ return null; } };
const canW=()=>{ try{ return !parent.ntSync || parent.ntSync.canWriteTab('انبار'); }catch(e){ return true; } };
const get=()=>{ try{ const o=JSON.parse(localStorage.getItem('nt_belts_v1')||'null'); return o&&Array.isArray(o.rows)?o:null; }catch(e){ return null; } };
function draw(){ const o=get(), L=$('bltList'); if(!L) return; $('bltUp').hidden=!canW();
  $('bltAt').textContent=o?fa(o.rows.length)+' دستگاه — '+fa(o.at||''):'هنوز فایلی نیست';
  if(!o){ L.innerHTML='<p class="sub">فایل اکسل «مشخصات تسمه‌ها» را بارگذاری کنید (ستون‌ها: نام دستگاه، تسمه دینام، تسمه کولر، تسمه پروانه، تسمه واترپمپ، هر کدام با «تعداد»).</p>'; return; }
  const K=(B()&&B().KINDS)||[];
  L.innerHTML=o.rows.map(r=>`<div class="bltr" data-id="${esc(r.id)}"><b>${esc(r.name)}<small>${r.devs&&r.devs.length?esc(r.devs.join('، ')):'در فهرست دستگاه‌های سامانه نیست'}</small></b>
    <div class="bltg">${K.map(([k,tt])=>{ const x=(r.b&&r.b[k])||{}; return `<label><span>${esc(tt)}</span><input data-k="${k}" data-f="code" value="${esc(x.code||'')}" ${canW()?'':'readonly'} aria-label="${esc(tt)} ${esc(r.name)}"><input data-k="${k}" data-f="n" inputmode="numeric" value="${x.code?esc(String(x.n||1)):''}" ${canW()?'':'readonly'} aria-label="تعداد ${esc(tt)} ${esc(r.name)}"></label>`; }).join('')}</div></div>`).join(''); }
$('bltUp').addEventListener('click',()=>$('bltFile').click());
$('bltFile').addEventListener('change',async()=>{ const f=$('bltFile').files&&$('bltFile').files[0]; $('bltFile').value=''; if(!f||!canW()||!B()) return; $('bltMsg').textContent='در حال خواندن…';
  try{ const A=await parent.ntReport.readAoa(await f.arrayBuffer()); const R=B().parse(A); if(!R||!R.length) throw new Error('head');
    localStorage.setItem('nt_belts_v1',JSON.stringify({at:todayKey(),rows:R})); const nd=R.filter(r=>r.devs.length).length;
    $('bltMsg').textContent=fa(R.length)+' ردیف خوانده شد؛ '+fa(nd)+' ردیف به دستگاه‌های سامانه وصل شد'; draw(); }
  catch(e){ $('bltMsg').textContent=e&&e.message==='head'?'ستون «نام دستگاه» و «تسمه دینام/پروانه» پیدا نشد':'فایل خوانده نشد (برای بار اول اینترنت لازم است)'; } });
$('bltList').addEventListener('change',e=>{ const i=e.target.closest('input[data-k]'); if(!i||!canW()) return; const o=get(); if(!o) return; const r=o.rows.find(x=>x.id===i.closest('[data-id]').dataset.id); if(!r) return;
  r.b=r.b||{}; const k=i.dataset.k, cur=r.b[k]||{};
  if(i.dataset.f==='code'){ const v=String(i.value||'').replace(/[<>"]/g,'').trim().slice(0,60); if(v) r.b[k]={code:v,n:cur.n||1}; else delete r.b[k]; }
  else { const n=parseInt(String(i.value).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)),10); if(cur.code) r.b[k]={code:cur.code,n:n>0&&n<20?n:1}; }
  localStorage.setItem('nt_belts_v1',JSON.stringify(o)); draw(); });
window.addEventListener('storage',e=>{ if(e.key==='nt_belts_v1'){ const a=document.activeElement; if(a&&a.closest&&a.closest('#bltList')) return; draw(); } });
draw();
})();
"""
k=t.rfind("</script></body></html>"); t=t[:k]+JS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
# امروز: دستگاه‌های اصلی بدون تسمه یدکی
d2=next(x for x in docs if x['name']=='امروز')
t2=base64.b64decode(d2['b64']).decode('utf-8')
a="  try{ svRows().forEach(r=>R.push(r)); }catch(e){}"
assert t2.count(a)==1
t2=t2.replace(a,a+r"""
  try{ const P=parent, cs=n=>{ try{ return !P.ntSync || P.ntSync.canSee(n); }catch(e){ return true; } };
    if(P.ntBelt && P.ntStops && cs('انبار')){ const M=P.ntBelt.missing(P.ntStops.TRACKED||[]);
      if(M.length) R.push({c:'w',t:fa(M.length)+' دستگاه اصلی تسمه یدکی در انبار ندارد',s:M.slice(0,3).map(x=>x.dev.replace(/^(لودر|بیل مکانیکی|کامیون)\s+(کوماتسو\s+)?/,'')+' ('+x.L.map(y=>y.code).join('، ')+')').join('، ')+(M.length>3?' و '+fa(M.length-3)+' دستگاه دیگر':''),go:'انبار'}); } }catch(e){}""")
d2['b64']=base64.b64encode(t2.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('belts')
