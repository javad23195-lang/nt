# درخواست خرید: «زیر حداقل انبار» — قلم‌های کاتالوگ که موجودی زنده (فایل + ورود − خروج انبار) به حداقل یا کمتر رسیده
# و درخواست باز ندارند. پیشنهاد تعداد = رساندن به ۲ برابر حداقل. با یک ضربه، ردیف‌های درخواست ساخته می‌شوند (دستگاه: «انبار»).
# «نادیده» برای یک قلم: ۳۰ روز پیشنهاد نمی‌شود (فقط همین گوشی، کلید ntkh_lowskip — همگام نمی‌شود).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='درخواست خرید')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
rep('  <div class="ksrch">','  <div class="klow" id="kLow" hidden></div>\n  <div class="ksrch">')
JS=r"""
/* ---------- زیر حداقل انبار ---------- */
const KLS='ntkh_lowskip';
function kSkipGet(){ try{ const o=JSON.parse(localStorage.getItem(KLS)||'{}'); return (o&&typeof o==='object')?o:{}; }catch(e){ return {}; } }
function kCanW(){ try{ return !parent.ntSync || parent.ntSync.canWriteTab('درخواست خرید'); }catch(e){ return true; } }
function kLowList(){
  const sk=kSkipGet(), now=Date.now(), out=[];
  ITEMS.forEach(o=>{
    const mn=o.min, st=o.stk; if(typeof mn!=='number' || !(mn>0) || typeof st!=='number') return;
    let live=st; try{ live=st+liveDelta(o.d).net; }catch(e){}
    if(live>mn) return;
    const k=sq(o.d); if(sk[k] && now-sk[k]<30*864e5) return;
    const openRow=rows.some(r=>sq(r.item)===k && !/لغو/.test(String(r.over||'')) && autoStat(r)!=='خریداری شده');
    const openHist=(hist||[]).some(x=>sq(x.item)===k && OPEN_ST.includes(x.stat));
    if(openRow||openHist) return;
    out.push({o,k,live,min:mn,q:Math.max(1,Math.ceil(mn*2-live))});
  });
  return out.sort((a,b)=>(a.live/a.min)-(b.live/b.min));
}
let kLowOpen=false;
function kLowDraw(){
  const box=$('kLow'); if(!box) return;
  const L=kLowList(); if(!L.length){ box.hidden=true; box.innerHTML=''; kLowOpen=false; return; }
  box.hidden=false; const w=kCanW();
  if(!kLowOpen){ box.innerHTML=`<button type="button" class="klhd" id="kLowGo" aria-expanded="false"><b>⚠ ${fa(L.length)} قلم انبار به حداقل رسیده</b><span>بررسی و ساخت درخواست ‹</span></button>`;
    $('kLowGo').addEventListener('click',()=>{ kLowOpen=true; kLowDraw(); }); return; }
  box.innerHTML=`<div class="klhd2"><b>زیر حداقل انبار (${fa(L.length)})</b><button type="button" id="kLowX" aria-label="بستن">✕</button></div>
    <div class="klhint">موجودی = فایل انبار + ورود − خروج ثبت‌شده. تعداد پیشنهادی تا ۲ برابر حداقل است؛ می‌توانید عوض کنید.</div>
    <div class="kll">${L.map((x,n)=>`<div class="klr${x.live<=0?' z':''}" data-k="${esc(x.k)}">
      <label class="klc"><input type="checkbox" data-n="${n}" checked ${w?'':'disabled'}><span><b>${esc(x.o.d)}</b>
        <small>موجودی <i>${fa(x.live)}</i> / حداقل ${fa(x.min)} ${esc(x.o.u||'')}${x.o.c?` · کد <span class="mono">${esc(String(x.o.c))}</span>`:''}</small></span></label>
      <input class="klq" type="text" inputmode="numeric" data-n="${n}" value="${x.q}" aria-label="تعداد درخواست ${esc(x.o.d)}" ${w?'':'disabled'}>
      <button type="button" class="kls" data-n="${n}" title="۳۰ روز پیشنهاد نشود">نادیده</button></div>`).join('')}</div>
    ${w?`<button type="button" class="klgo" id="kLowAdd">افزودن به درخواست‌ها</button>`:'<div class="klhint">اجازه ثبت در این بخش را ندارید.</div>'}`;
  $('kLowX').addEventListener('click',()=>{ kLowOpen=false; kLowDraw(); });
  box.querySelectorAll('.klq').forEach(el=>el.addEventListener('input',()=>{ el.value=el.value.replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[^\d]/g,'').slice(0,5); }));
  box.querySelectorAll('.kls').forEach(b=>b.addEventListener('click',()=>{ const x=L[+b.dataset.n]; if(!x) return; const o=kSkipGet(); o[x.k]=Date.now(); try{ localStorage.setItem(KLS,JSON.stringify(o)); }catch(e){} kLowDraw(); say('«'+x.o.d+'» تا ۳۰ روز پیشنهاد نمی‌شود'); }));
  const add=$('kLowAdd'); if(add) add.addEventListener('click',()=>{
    let n=0; const day=TODAY||'';
    box.querySelectorAll('.klc input[type=checkbox]').forEach(cb=>{ if(!cb.checked) return; const x=L[+cb.dataset.n]; if(!x) return;
      const q=+(box.querySelector(`.klq[data-n="${cb.dataset.n}"]`)||{}).value||x.q; if(!(q>0)) return;
      rows.push({date:day,unit:'انبار',item:x.o.d,u:x.o.u||'',isNew:false,qty:q,bought:'',desc:'',d1:'',d2:'',pri:'',buy:'',req:'',apr:'',over:'',note:'تأمین حداقل انبار'}); n++; });
    if(!n){ say('قلمی انتخاب نشده',true); return; }
    kLowOpen=false; render(); say(fa(n)+' درخواست برای تأمین حداقل انبار ساخته شد');
  });
}
{ const _rl=render; render=function(){ _rl.apply(this,arguments); try{ if(!kLowOpen) kLowDraw(); }catch(e){ console.error(e); } }; }
window.addEventListener('storage',e=>{ if(e && /^nt_anbar_(in|out)_v1$/.test(e.key||'') && !kLowOpen){ try{ kLowDraw(); }catch(x){} } });
setTimeout(()=>{ try{ kLowDraw(); }catch(e){} },0);
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""
.klow{margin:12px 0 4px}
.klow .klhd{width:100%;min-height:52px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-radius:12px;border:1px solid #E0A75E;background:#FFF1DB;color:#5C3300;font:inherit;padding:8px 12px;cursor:pointer;text-align:right}
.klow .klhd span{font-size:.82rem;font-weight:700;color:#7A4300;white-space:nowrap}
.klow .klhd2{display:flex;justify-content:space-between;align-items:center;margin:0 0 6px}
.klow .klhd2 button{min-width:44px;min-height:44px;border:1px solid #C3CDD5;border-radius:10px;background:#fff;font:inherit;cursor:pointer}
.klow .klhint{font-size:.78rem;color:#51606E;margin:0 0 8px;line-height:1.7}
.klow .kll{display:flex;flex-direction:column;gap:6px;max-height:55vh;overflow:auto}
.klow .klr{display:grid;grid-template-columns:1fr 64px auto;gap:6px;align-items:center;background:#fff;border:1px solid #DDE3E9;border-radius:10px;padding:6px 8px}
.klow .klr.z{border-color:#E0A39C}
.klow .klc{display:flex;gap:8px;align-items:flex-start;cursor:pointer;min-width:0}
.klow .klc input{width:22px;height:22px;margin-top:2px;flex:none}
.klow .klc b{display:block;font-size:.86rem;overflow-wrap:anywhere}
.klow .klc small{display:block;font-size:.74rem;color:#51606E}
.klow .klr.z .klc small i{color:#A32018;font-weight:800;font-style:normal}
.klow .klq{min-height:44px;border:1px solid #9AA6AF;border-radius:8px;text-align:center;font:inherit;font-size:1rem;width:100%;box-sizing:border-box}
.klow .kls{min-height:44px;border:1px solid #C3CDD5;border-radius:8px;background:#fff;font:inherit;font-size:.74rem;color:#51606E;padding:0 8px;cursor:pointer}
.klow .klgo{width:100%;min-height:50px;margin-top:8px;border:0;border-radius:12px;background:#0B5C7A;color:#fff;font:inherit;font-weight:800;cursor:pointer}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('kh low')
