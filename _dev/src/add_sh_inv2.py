# شناسنامه — طراحی تازه بخش فاکتورها: فقط یک فهرست «+ فاکتور» (اجرت یا خرید قطعه).
# بخش‌های ثابت اجرت/خرید پنهان می‌شوند ولی هنگام ثبت از همین فهرست پر می‌شوند (اولین اجرت و اولین خرید = ردیف اول اکسل).
# «شرح خرابی» جدا فقط وقتی دیده می‌شود که فاکتور اجرت نیست (گزینه «ب» کاربر).
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
rep("${x.t==='A'?'شرح کار (مثلاً جوش و تراش)':'شرح قطعه مصرفی'}","${x.t==='A'?'شرح خرابی / شرح کار':'شرح قطعه مصرفی'}")
rep('+ فاکتور دیگر برای همین تعمیر (مثلاً جوش تراش)</button>','+ فاکتور (اجرت یا خرید قطعه)</button>')
rep('هر فاکتور دیگر یک ردیف جدا در اکسل می‌شود؛ مدت و توقف فقط در ردیف اول است.','اولین اجرت و اولین خرید در ردیف اول اکسل (با مدت و توقف)؛ هر فاکتور دیگر یک ردیف جدا.')
rep('placeholder="چون فاکتور اجرت ندارید، شرح را اینجا بنویسید"','placeholder="چون فاکتور اجرت ندارید، شرح خرابی را اینجا بنویسید"')
rep('<span class="t" style="white-space:nowrap">فاکتور ${fa(xBase()+k+1)}</span>','<span class="t" style="white-space:nowrap">فاکتور ${fa(invNum(k))}</span>')
rep("const L=xinv.filter(x=>String(x.who||'').trim()","const L=xinv.filter(x=>!x.__main).filter(x=>String(x.who||'').trim()")
rep("  const A=$('onAjr').checked, K=$('onKhr').checked;","  const A=invHas('A'), K=invHas('K');")
JS=r"""
/* ---------- طراحی تازه فاکتورها: یک فهرست ---------- */
function invHas(tp){ return xinv.some(x=>x.t===tp); }
function invMain(){ const a=xinv.findIndex(x=>x.t==='A'), k=xinv.findIndex(x=>x.t==='K'); return {a,k}; }
/** شماره هر فاکتور: اولین اجرت و اولین خرید (ردیف اول) جلوتر؛ در ویرایش، فاکتورهای قبلیِ زیر همین ردیف هم شمرده می‌شود */
function invNum(k){ const m=invMain(), main=[m.a,m.k].filter(x=>x>-1).sort((p,q)=>p-q);
  const mi=main.indexOf(k); if(mi>-1) return mi+1;
  let e=0; for(let q=0;q<k;q++) if(main.indexOf(q)<0) e++;
  return main.length+(typeof xAfter==='function'?xAfter():0)+e+1; }
/** وضعیت «دارم» و کادر «شرح خرابی» را با فهرست هماهنگ می‌کند */
function invShow(){ try{ $('onAjr').checked=invHas('A'); $('onKhr').checked=invHas('K'); toggleInv(); }catch(e){} }
/** پیش از ثبت: اولین اجرت و اولین خرید در کادرهای ثابت (پنهان) نوشته می‌شوند؛ بقیه «فاکتور دیگر» می‌شوند */
function invToFixed(){
  xSync(); xinv.forEach(x=>{ delete x.__main; }); const m=invMain(), A=m.a>-1?xinv[m.a]:null, K=m.k>-1?xinv[m.k]:null;
  $('onAjr').checked=!!A; $('onKhr').checked=!!K;
  if(A){ A.__main=1; cDesc.force(String(A.desc||'').trim()); cRep.force(String(A.who||'').trim()); $('fCostA').value=String(A.cost||'').trim(); $('fPayA').value=A.pay||''; $('fDocA').value=String(A.doc||'').trim(); }
  if(K){ K.__main=1; cPart.force(String(K.desc||'').trim()); cSup.force(String(K.who||'').trim()); $('fCostK').value=String(K.cost||'').trim(); $('fPayK').value=K.pay||''; $('fDocK').value=String(K.doc||'').trim(); }
  toggleInv();
  if(A && !String(A.desc||'').trim()){ const c=$('xInv').querySelector('.xinv[data-k="'+m.a+'"] [data-f=desc]'); if(c){ c.focus(); c.scrollIntoView({block:'center'}); } say('شرح کار فاکتور اجرت را بنویسید (همان شرح خرابی اکسل است)',true); return false; }
  return true;
}
/** در ویرایش: کادرهای ثابت ردیف به فهرست برگردانده می‌شوند */
function invFromFixed(){
  const L=[];
  if($('onAjr').checked) L.push({t:'A',desc:cDesc.value(),who:cRep.value(),cost:$('fCostA').value,pay:$('fPayA').value,doc:$('fDocA').value});
  if($('onKhr').checked){ const p=cPart.value(); L.push({t:'K',desc:p==='**'?'':p,who:cSup.value(),cost:$('fCostK').value,pay:$('fPayK').value,doc:$('fDocK').value}); }
  xinv=L; xRender();
}
{ const _xr=xRender; xRender=function(){ _xr(); invShow(); try{ dvSync(); dvRender(); }catch(e){} try{ showTotal(); }catch(e){} }; }
showTotal=function(){
  const b=$('tot'); if(!b) return; let a=0,k=0,dv=0;
  document.querySelectorAll('#xInv .xinv').forEach(c=>{ const x=xinv[+c.dataset.k]; const v=+(c.querySelector('[data-f=cost]')||{}).value||0; if(x&&x.t==='K') k+=v; else a+=v; });
  document.querySelectorAll('#dvList [data-f=costA],#dvList [data-f=costK]').forEach(e=>{ dv+=(+e.value||0); });
  if(!a&&!k&&!dv){ b.style.display='none'; return; }
  b.style.display='block';
  b.innerHTML=`اجرت <span class="n">${faNum(a)}</span> + خرید <span class="n">${faNum(k)}</span>`+(dv?` + دستگاه‌های دیگر <span class="n">${faNum(dv)}</span>`:'')+` = جمع <span class="n">${faNum(a+k+dv)}</span> ریال`;
};
/* ترتیب: فهرست فاکتورها، بعد «شرح خرابی» (فقط بدون اجرت)، بعد جمع */
try{ const box=$('xInvBox'); box.after($('descAlone')); $('descAlone').after($('tot')); }catch(e){}
$('bAdd').addEventListener('click',e=>{ if(!invToFixed()) e.stopImmediatePropagation(); },true);
"""
rep("$('bAdd').addEventListener('click',()=>{",JS+"\n$('bAdd').addEventListener('click',()=>{")
rep("function beginEdit(i){","function beginEdit(i){\n  setTimeout(()=>{ try{ invFromFixed(); }catch(e){} },0);")
k0=t.find("</style>"); t=t[:k0]+"#invAjr,#invKhr{display:none!important}\n#xInvBox{margin-bottom:12px}\n"+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh inv2')
