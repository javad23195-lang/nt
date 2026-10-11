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
    # ---- ارسال برگه به‌صورت عکس (بله، تلگرام، ...) ----
    t=rep(t,"function printHTML(html){","""/* «ارسال برگه»: هر برگه به عکس PNG تبدیل و با منوی اشتراک گوشی فرستاده می‌شود (اگر نبود، دانلود). داخل صفحه برگه اجرا می‌شود. */
function ntShare(){
  const pgs=[].slice.call(document.querySelectorAll('.reqpg,.intpg')); if(!pgs.length) return;
  const b=document.getElementById('shBtn'); const old=b?b.textContent:''; if(b){ b.disabled=true; b.textContent='در حال ساخت…'; }
  const css=[].slice.call(document.querySelectorAll('style')).map(function(x){ return x.textContent; }).join('\\n').replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const name=(document.title||'برگه').replace(/[\\\\/:*?"<>|]+/g,'_');
  const one=function(el,i){ return new Promise(function(res,rej){
    const tb=el.querySelector('table')||el, r=tb.getBoundingClientRect(), W=Math.ceil(r.width)+24, H=Math.ceil(el.getBoundingClientRect().height)+24;
    const xml='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="background:#fff;padding:12px;width:'+(W-24)+'px"><style>'+css+'</style>'+new XMLSerializer().serializeToString(el)+'</div></foreignObject></svg>';
    const img=new Image(); img.onerror=function(){ rej(new Error('img')); };
    img.onload=function(){ const k=2, c=document.createElement('canvas'); c.width=W*k; c.height=H*k; const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height);
      c.toBlob(function(bl){ if(!bl) return rej(new Error('blob')); res(new File([bl],name+(pgs.length>1?'_'+(i+1):'')+'.png',{type:'image/png'})); },'image/png'); };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml); }); };
  Promise.all(pgs.map(one)).then(function(files){
    window.__shFiles=files;
    if(navigator.canShare && navigator.canShare({files:files})) return navigator.share({files:files,title:name}).catch(function(e){ if(e&&e.name==='AbortError') return; throw e; });
    files.forEach(function(f){ const a=document.createElement('a'); a.href=URL.createObjectURL(f); a.download=f.name; document.body.appendChild(a); a.click(); a.remove(); });
  }).catch(function(){ alert('ساخت عکس ممکن نشد. از «چاپ / ذخیره PDF» استفاده کنید.'); })
  .then(function(){ if(b){ b.disabled=false; b.textContent=old; } });
}
function printHTML(html){""")
    BTN='<div class="noprint"><button onclick="window.print()">چاپ / ذخیره PDF</button></div>'
    assert t.count(BTN)==2, t.count(BTN)
    t=t.replace(BTN,'<div class="noprint"><button onclick="window.print()">چاپ / ذخیره PDF</button> <button id="shBtn" onclick="ntShare()">ارسال برگه (عکس)</button></div><script>${ntShare.toString()}<\\/script>')
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
