# شناسنامه: چند فاکتور برای یک تعمیر. ردیف اول مدت و توقف را دارد؛ هر «فاکتور دیگر» یک ردیف جدا بدون مدت و توقف (روش «الف» کاربر)
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='شناسنامه')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
rep('    <div class="total" id="tot" style="display:none"></div>','''    <div class="total" id="tot" style="display:none"></div>
    <div id="xInvBox"><div id="xInv"></div>
      <button type="button" class="btn btn-ghost" id="xInvAdd" style="width:100%;min-height:48px">+ فاکتور دیگر برای همین تعمیر (مثلاً جوش تراش)</button>
      <div class="fhint" id="xInvHint">هر فاکتور دیگر یک ردیف جدا در اکسل می‌شود؛ مدت و توقف فقط در ردیف اول است.</div></div>''')
JS=r"""
/* ---------- فاکتورهای دیگرِ همین تعمیر ---------- */
let xinv=[];
const XT={A:'اجرت',K:'خرید قطعه'};
function xRender(){
  const box=$('xInv'); if(!box) return;
  $('xInvBox').hidden=false;
  box.innerHTML=xinv.map((x,k)=>`<div class="inv xinv" data-k="${k}">
    <div class="invhd"><span class="t" style="white-space:nowrap">فاکتور ${fa(k+2)}</span>
      <select data-f="t" aria-label="نوع فاکتور ${fa(k+2)}"><option value="A"${x.t==='A'?' selected':''}>اجرت</option><option value="K"${x.t==='K'?' selected':''}>خرید قطعه</option></select>
      <button type="button" class="xdel" data-k="${k}" aria-label="حذف فاکتور ${fa(k+2)}" style="margin-inline-start:auto;min-width:44px;min-height:44px;border:1px solid #C3CDD5;border-radius:8px;background:#fff;color:#A32018">✕</button></div>
    <div class="field"><label>${x.t==='A'?'شرح کار (مثلاً جوش و تراش)':'شرح قطعه'}</label><input data-f="desc" value="${esc(x.desc)}" autocomplete="off" aria-label="${x.t==='A'?'شرح کار':'شرح قطعه'} فاکتور ${fa(k+2)}"></div>
    <div class="field"><label>${x.t==='A'?'تعمیرکار':'تامین‌کننده'}</label><input data-f="who" aria-label="${x.t==='A'?'تعمیرکار':'تامین‌کننده'} فاکتور ${fa(k+2)}" value="${esc(x.who)}" autocomplete="off" list="${x.t==='A'?'xlRep':'xlSup'}"></div>
    <div class="row3">
      <div class="field"><label>مبلغ (ریال)</label><input data-f="cost" aria-label="مبلغ فاکتور ${fa(k+2)}" class="mono" type="number" min="0" step="1000" value="${esc(x.cost)}"></div>
      <div class="field"><label>نوع پرداخت</label><select data-f="pay" aria-label="نوع پرداخت فاکتور ${fa(k+2)}"><option value="">— انتخاب —</option><option${x.pay==='اعتباری'?' selected':''}>اعتباری</option><option${x.pay==='نقدی'?' selected':''}>نقدی</option></select></div>
      <div class="field"><label>شماره سند</label><input data-f="doc" aria-label="شماره سند فاکتور ${fa(k+2)}" class="mono" value="${esc(x.doc)}" autocomplete="off"></div>
    </div></div>`).join('')
    +`<datalist id="xlRep">${(typeof myReps!=='undefined'?myReps:[]).map(v=>`<option value="${esc(v)}">`).join('')}</datalist><datalist id="xlSup">${(typeof mySups!=='undefined'?mySups:[]).map(v=>`<option value="${esc(v)}">`).join('')}</datalist>`;
}
$('xInvAdd').addEventListener('click',()=>{ xinv.push({t:'A',desc:'',who:'',cost:'',pay:'',doc:''}); xRender(); try{ $('xInv').lastElementChild.previousElementSibling&&0; const el=$('xInv').querySelectorAll('.xinv'); el[el.length-1].querySelector('[data-f=desc]').focus(); }catch(e){} });
$('xInv').addEventListener('input',e=>{ const c=e.target.closest('.xinv'), f=e.target.dataset.f; if(!c||!f) return; xinv[+c.dataset.k][f]=e.target.value; });
$('xInv').addEventListener('change',e=>{ const c=e.target.closest('.xinv'), f=e.target.dataset.f; if(!c||!f) return; xinv[+c.dataset.k][f]=e.target.value; if(f==='t') xRender(); });
$('xInv').addEventListener('click',e=>{ const b=e.target.closest('.xdel'); if(!b) return; xinv.splice(+b.dataset.k,1); xRender(); });
/** بعد از ثبت ردیف اصلی: هر فاکتور دیگر یک ردیف جدا (بدون مدت و توقف) */
function xPush(rec,at){
  const L=xinv.filter(x=>String(x.who||'').trim()||String(x.cost||'').trim()||String(x.doc||'').trim()); let n=0;
  L.forEach(x=>{ const A=x.t==='A';
    const r=Object.assign({},rec,{dur:'',stop:'',xof:1,
      hasA:A, rep:A?x.who.trim():'', costA:A?String(x.cost).trim():'', payA:A?x.pay:'', docA:A?String(x.doc).trim():'',
      hasK:!A, sup:A?'':x.who.trim(), costK:A?'':String(x.cost).trim(), payK:A?'':x.pay, docK:A?'':String(x.doc).trim(),
      desc:(A&&x.desc.trim())?x.desc.trim():rec.desc, part:(!A&&x.desc.trim())?x.desc.trim():'**'});
    delete r.__i; if(at===undefined) rows.push(r); else rows.splice(at+n,0,r); n++;
    try{ if(A) remember(r.rep,myReps,cRep); else remember(r.sup,mySups,cSup); }catch(e){} });
  if(n) rows.forEach((r,k)=>{ r.__i=k; });
  xinv=[]; xRender(); return n;
}
"""
rep("  if(editIdx!==null){ const n=editIdx+1; rows[editIdx]=rec; stopEdit(); clearForm(); render();","  if(editIdx!==null){ const n=editIdx+1; rows[editIdx]=rec; const _xe=xPush(rec,editIdx+1); stopEdit(); clearForm(); render(); if(_xe) setTimeout(()=>say(fa(_xe)+' فاکتور دیگر زیر همین ردیف اضافه شد'),300);")
rep("function clearForm(){","function clearForm(){\n  try{ xinv=[]; xRender(); }catch(e){}")
rep("  else{ rows.push(rec); clearForm(); $('fDesc').focus(); render();","  else{ rows.push(rec); const _xn=xPush(rec); clearForm(); $('fDesc').focus(); render(); if(_xn) setTimeout(()=>say(fa(_xn+1)+' ردیف ثبت شد (۱ تعمیر، '+fa(_xn+1)+' فاکتور)'),300);")
rep("$('bAdd').addEventListener('click',()=>{",JS+"\n$('bAdd').addEventListener('click',()=>{")
rep("""          ${r.hasA?`<span class="aj">اجرت""","""          ${r.xof?'<span>فاکتور دیگرِ همین تعمیر</span>':''}${r.hasA?`<span class="aj">اجرت""")
# در حالت ویرایش، بخش فاکتور دیگر پنهان
rep("function stopEdit(){ editIdx=null;","function stopEdit(){ editIdx=null; setTimeout(()=>{ try{ xRender(); }catch(e){} },0);")
rep("function beginEdit(i){","function beginEdit(i){\n  setTimeout(()=>{ try{ xRender(); }catch(e){} },0);")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh multi')
