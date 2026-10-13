# شناسنامه: یک کار برای چند دستگاه. هر دستگاه مدت، توقف، وضعیت، ساعت کارکرد و مبلغ خودش (روش «ج» کاربر)؛ بقیه یک بار
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
rep('''    <div class="sect inv">۴ — فاکتورها</div>''','''    <div id="dvBox"><div id="dvList"></div>
      <button type="button" class="btn btn-ghost" id="dvAdd" style="width:100%;min-height:48px">+ دستگاه دیگر با همین کار</button>
      <div class="fhint">برای هر دستگاه یک ردیف جدا ساخته می‌شود؛ مدت، توقف و مبلغ هر دستگاه جداست. تاریخ، شرح، فعالیت، تعمیرکار و سند همان است.</div></div>

    <div class="sect inv">۴ — فاکتورها</div>''')
JS=r"""
/* ---------- دستگاه‌های دیگر با همین کار ---------- */
let dvs=[], dvC=[];
function dvSync(){ document.querySelectorAll('#dvList .dvc').forEach(c=>{ const k=+c.dataset.k; if(!dvs[k]) return; c.querySelectorAll('[data-f]').forEach(e=>{ dvs[k][e.dataset.f]=e.value; }); try{ dvs[k].dev=dvC[k].value(); dvs[k].devTxt=c.querySelector('[data-f=devTxt]').value; }catch(x){} }); }
function dvRender(){
  const box=$('dvList'); if(!box) return; $('dvBox').hidden=(editIdx!==null);
  const A=$('onAjr').checked, K=$('onKhr').checked;
  const opt=(id,v)=>[...$(id).options].map(o=>`<option${o.value===v?' selected':''}>${esc(o.value)}</option>`).join('');
  box.innerHTML=dvs.map((x,k)=>`<div class="inv dvc" data-k="${k}">
    <div class="invhd"><span class="t" style="white-space:nowrap">دستگاه ${fa(k+2)}</span>
      <button type="button" class="dvdel" data-k="${k}" aria-label="حذف دستگاه ${fa(k+2)}" style="margin-inline-start:auto;min-width:44px;min-height:44px;border:1px solid #C3CDD5;border-radius:8px;background:#fff;color:#A32018">✕</button></div>
    <div class="field"><label for="dv${k}n">نام دستگاه <span class="req">*</span></label><div class="combo"><input id="dv${k}n" data-f="devTxt" value="${esc(x.devTxt||x.dev||'')}" autocomplete="off" placeholder="تایپ کنید و از فهرست انتخاب کنید"><div class="combo-list" id="dl${k}n"></div></div><div class="err" id="dv${k}e">دستگاه را از فهرست انتخاب کنید.</div></div>
    <div class="row3">
      <div class="field"><label for="dv${k}d">مدت (ساعت) <span class="req">*</span></label><input id="dv${k}d" data-f="dur" class="mono tm" value="${esc(x.dur||'')}" placeholder="8:00" inputmode="numeric" autocomplete="off"><div class="fhint">فقط رقم: <b>800</b>←<b>8:00</b></div><div class="err" id="dv${k}de">قالب ساعت:دقیقه</div></div>
      <div class="field"><label for="dv${k}s">توقف</label><select id="dv${k}s" data-f="stop">${opt('fStop',x.stop||$('fStop').value)}</select></div>
      <div class="field"><label for="dv${k}c">وضعیت</label><select id="dv${k}c" data-f="cond">${opt('fCond',x.cond||$('fCond').value)}</select></div>
    </div>
    <div class="row3">
      <div class="field"><label for="dv${k}m">ساعت کارکرد</label><input id="dv${k}m" data-f="meter" class="mono" type="number" min="0" value="${esc(x.meter||'')}" placeholder="${esc($('fMeter').getAttribute('placeholder')||'')}"></div>
      ${A?`<div class="field"><label for="dv${k}a">مبلغ اجرت (ریال)</label><input id="dv${k}a" data-f="costA" class="mono" type="number" min="0" step="1000" value="${esc(x.costA||'')}"><div class="fhint dvh">${(+x.costA||0)?faNum(x.costA)+' ریال':'—'}</div></div>`:''}
      ${K?`<div class="field"><label for="dv${k}k">مبلغ خرید (ریال)</label><input id="dv${k}k" data-f="costK" class="mono" type="number" min="0" step="1000" value="${esc(x.costK||'')}"><div class="fhint dvh">${(+x.costK||0)?faNum(x.costK)+' ریال':'—'}</div></div>`:''}
    </div></div>`).join('');
  dvC=dvs.map((x,k)=>{ const c=combo('dv'+k+'n','dl'+k+'n',src(DATA.dev),false); if(x.dev) c.force(x.dev); return c; });
}
$('dvAdd').addEventListener('click',()=>{ dvSync(); dvs.push({dev:'',devTxt:'',dur:$('fDur').value,stop:$('fStop').value,cond:$('fCond').value,meter:'',costA:'',costK:''}); dvRender();
  try{ const el=$('dvList').querySelectorAll('.dvc'); el[el.length-1].querySelector('[data-f=devTxt]').focus(); }catch(e){} });
$('dvList').addEventListener('click',e=>{ const b=e.target.closest('.dvdel'); if(!b) return; dvSync(); dvs.splice(+b.dataset.k,1); dvRender(); try{ showTotal(); }catch(x){} });
$('dvList').addEventListener('input',e=>{ const f=e.target.dataset.f; if(f==='dur'){ maskTime(e.target); return; } if(f==='costA'||f==='costK'){ const h=e.target.parentElement.querySelector('.dvh'); if(h) h.textContent=(+e.target.value||0)?faNum(e.target.value)+' ریال':'—'; try{ showTotal(); }catch(x){} } });
['onAjr','onKhr'].forEach(id=>{ try{ $(id).addEventListener('change',()=>{ dvSync(); dvRender(); }); }catch(e){} });
$('dvList').addEventListener('focusout',e=>{ const el=e.target; if(!el||el.dataset.f!=='dur') return;
  let v=el.value.trim(); if(/^\d{1,2}$/.test(v)) v='0:'+v.padStart(2,'0');
  const mm=/^(\d{1,3}):(\d{0,2})$/.exec(v); if(mm) v=mm[1]+':'+(mm[2]===''?'00':mm[2].padStart(2,'0'));
  const t=parseTime(v); if(t!==null&&v!=='') el.value=hhmm(t).replace(/:00$/,''); });
/** پیش از ثبت: هر دستگاه از فهرست انتخاب شده و مدت درست است؟ */
function dvValid(){
  dvSync(); let ok=true, first=null;
  dvs.forEach((x,k)=>{ const e1=$('dv'+k+'e'), e2=$('dv'+k+'de'), bad1=!x.dev, bad2=parseTime(x.dur)===null;
    if(e1) e1.classList.toggle('show',bad1); if(e2) e2.classList.toggle('show',bad2);
    if(bad1||bad2){ ok=false; if(!first) first=$(bad1?'dv'+k+'n':'dv'+k+'d'); } });
  if(!ok && first){ try{ first.focus(); first.scrollIntoView({block:'center'}); }catch(e){} say('اطلاعات دستگاه‌های دیگر کامل نیست',true); }
  return ok;
}
/** بعد از ثبت ردیف اصلی: برای هر دستگاه یک ردیف با همان کار */
function dvPush(rec){
  dvSync(); let n=0;
  dvs.forEach(x=>{ if(!x.dev) return;
    const r=Object.assign({},rec,{dev:x.dev, dur:hhmm(parseTime(x.dur)), stop:x.stop, cond:x.cond, meter:String(x.meter||'').trim(),
      costA:rec.hasA?String(x.costA||'').trim():'', costK:rec.hasK?String(x.costK||'').trim():''});
    delete r.__i; delete r.xof; rows.push(r); n++; });
  if(n) rows.forEach((r,k)=>{ r.__i=k; });
  dvs=[]; dvC=[]; dvRender(); return n;
}
$('bAdd').addEventListener('click',e=>{ if(editIdx===null && dvs.length && !dvValid()) e.stopImmediatePropagation(); },true);
"""
rep("$('bAdd').addEventListener('click',()=>{",JS+"\n$('bAdd').addEventListener('click',()=>{")
rep("const _xn=xPush(rec); clearForm();","const _xn=xPush(rec); const _dn=dvPush(rec); clearForm();")
rep("if(_xn) setTimeout(()=>say(fa(_xn+1)+' ردیف ثبت شد (۱ تعمیر، '+fa(_xn+1)+' فاکتور)'),300);","if(_xn||_dn) setTimeout(()=>say(fa(_xn+_dn+1)+' ردیف ثبت شد'+(_dn?' ('+fa(_dn+1)+' دستگاه)':'')),300);")
rep("function clearForm(){","function clearForm(){\n  try{ dvs=[]; dvC=[]; dvRender(); }catch(e){}")
rep("  let xs=0; document.querySelectorAll('#xInv .xinv [data-f=cost]').forEach(e=>{ xs+=(+e.value||0); });","  let xs=0; document.querySelectorAll('#xInv .xinv [data-f=cost],#dvList [data-f=costA],#dvList [data-f=costK]').forEach(e=>{ xs+=(+e.value||0); });")
rep("+(xs?` + فاکتورهای دیگر <span class=\"n\">${faNum(xs)}</span>`:'')","+(xs?` + دستگاه‌ها و فاکتورهای دیگر <span class=\"n\">${faNum(xs)}</span>`:'')")
rep("function stopEdit(){ editIdx=null;","function stopEdit(){ editIdx=null; setTimeout(()=>{ try{ dvRender(); }catch(e){} },0);")
rep("function beginEdit(i){","function beginEdit(i){\n  setTimeout(()=>{ try{ dvRender(); }catch(e){} },0);")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh devs')
