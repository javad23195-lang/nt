# طرح تازه — مرحله ۴: «دفترچه قرائت»
# ۱) دکمه‌های فیلتر زیر جستجو: همه، ثبت‌نشده امروز، سرویس (گذشته/نزدیک)، و بخش‌ها (فقط برای کاربر بدون بخش). با شمارنده.
# ۲) کارت دستگاه: زیر نام «بخش · آخرین قرائت …» و نشان توقف باز (خراب/منتظر/در سرویس)؛
#    خلاصه نزدیک‌ترین سرویس («۱۴ ساعت تا سرویس» یا «۳۸ ساعت گذشته») با نوار پیشرفت؛ کادر ساعت‌کار درشت و دکمه ذخیره نارنجی؛
#    سرویس‌ها، سوخت و تاریخچه در «جزئیات ⌄» (اگر سرویس گذشته دارد یا در حال ویرایش است، باز).
# ۳) گوشی: عنوان و تاریخ تکراری بالای صفحه پنهان (برچسب بخش می‌ماند).
# کارت‌ها بعد از هر render با MutationObserver آراسته می‌شوند (به قالب اصلی دست نمی‌زند).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d['b64']).decode('utf-8')
JS=r"""
/* ===== طرح تازه دفترچه (add_daftar2) ===== */
(function(){
  const DZ={f:'all'}, OPEN=new Set();
  const nk=s=>String(s||'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\s‌]+/g,'').toLowerCase();
  const dept=n=>{ try{ return (parent.ntDept&&parent.ntDept.of(n))||''; }catch(e){ return ''; } };
  const myDept=()=>{ try{ return (parent.ntDept&&parent.ntDept.my())||''; }catch(e){ return ''; } };
  function stopsOpen(){ const o={}; try{ const tv=JSON.parse(localStorage.getItem('nt_tavaqof_v1')||'{}');
      Object.keys(tv).forEach(k=>{ if(k.split('|')[1]==='اضافه') return; ((tv[k]&&tv[k].stops)||[]).forEach(x=>{ if(x&&x.dev&&!x.to){ let c='idle'; try{ c=parent.ntStops.clsOf(x.cause); }catch(e){} o[nk(x.dev)]={c:c==='em'?'bad':(c==='pm'?'svc':'wa'),cause:x.cause||''}; } }); }); }catch(e){} return o; }
  const SW={bad:'خراب',wa:'منتظر',svc:'در سرویس'};
  function svcOf(dev,unit){ try{ const it=svGet(SVK).filter(x=>x&&x.dev===dev); if(!it.length) return null; const A=ntSvc.all(it,log,svDay());
      const U=A.filter(x=>x.rem!==null&&x.every); const pick=U.sort((a,b)=>a.rem-b.rem)[0]; const anyR=A.some(x=>x.st==='r'), anyO=A.some(x=>x.st==='o');
      if(pick){ const fr=Math.max(0,Math.min(1,(pick.every-pick.rem)/pick.every));
        return {st:pick.rem<0?'r':(pick.st==='o'?'o':(anyR?'r':'g')),t:pick.rem<0?fa(Math.round(-pick.rem).toLocaleString('en-US'))+' '+(unit||'')+' گذشته':fa(Math.round(pick.rem).toLocaleString('en-US'))+' '+(unit||'')+' تا سرویس',fr,anyR,anyO,name:pick.it.name}; }
      const T=A.filter(x=>x.days!==null).sort((a,b)=>a.days-b.days)[0];
      if(T) return {st:T.days<0?'r':(T.days<=15?'o':'g'),t:T.days<0?fa(-T.days)+' روز از موعد گذشته':fa(T.days)+' روز تا سرویس',fr:null,anyR,anyO,name:T.it.name};
      return null; }catch(e){ return null; } }
  function readToday(dev){ try{ return todayVal(dev)!==undefined; }catch(e){ return false; } }
  function decorate(){
    const L=$('list'); if(!L) return; const SO=stopsOpen();
    L.querySelectorAll('.dev').forEach(c=>{
      const inp=c.querySelector('input.rv'); if(!inp) return; const dev=inp.dataset.dev, unit=inp.dataset.unit||'';
      c.dataset.dev=dev; c.dataset.dept=dept(dev);
      const sv=svcOf(dev,unit); c.dataset.sv=sv?sv.st:''; c.dataset.rd=readToday(dev)?'1':'';
      if(c.dataset.dz) return; c.dataset.dz='1';
      const nm=c.querySelector('.nm');
      /* زیرعنوان: بخش · آخرین قرائت */
      const lastEl=c.querySelector('.last'); const lastTxt=lastEl?lastEl.textContent.replace(/\s+/g,' ').trim():'';
      const dp=dept(dev); const st=SO[nk(dev)];
      if(nm){ const b=document.createElement('div'); b.className='dzm';
        b.innerHTML=(st?`<span class="dzs dz-${st.c}">${esc(SW[st.c])}</span>`:'')+(dp&&dp!=='سایر'?`<span>بخش ${esc(dp)}</span>`:'');
        if(b.innerHTML) nm.parentNode.insertBefore(b,nm.nextSibling); }
      /* خلاصه سرویس با نوار */
      if(sv){ const s2=document.createElement('div'); s2.className='dzv dzv-'+sv.st;
        s2.innerHTML=`<div class="l"><span>${esc(sv.name)}</span><b>${esc(sv.t)}</b></div>${sv.fr!==null?`<div class="bar"><i style="width:${Math.round(sv.fr*100)}%"></i></div>`:''}`;
        const top=c.querySelector('.top'); if(top) top.appendChild(s2); }
      /* جزئیات: سرویس‌ها، سوخت، تاریخچه */
      const parts=[...c.children].filter(x=>!x.classList.contains('top'));
      if(parts.length){ const dt=document.createElement('details'); dt.className='dzd';
        const hasForm=c.querySelector('.svc form,.svc .sform,.svc input:not([type=checkbox])');
        if(OPEN.has(dev) || (sv&&sv.anyR) || hasForm) dt.open=true;
        dt.innerHTML=`<summary>سرویس‌ها، سوخت و تاریخچه</summary>`; parts.forEach(p=>dt.appendChild(p)); c.appendChild(dt);
        dt.addEventListener('toggle',()=>{ if(dt.open) OPEN.add(dev); else OPEN.delete(dev); }); }
    });
    chips(); apply();
  }
  function chips(){
    const bar=document.querySelector('.bar'); if(!bar) return; let box=$('dzF');
    if(!box){ box=document.createElement('div'); box.id='dzF'; box.className='dzf'; box.setAttribute('role','group'); box.setAttribute('aria-label','فیلتر دستگاه‌ها'); bar.parentNode.insertBefore(box,bar.nextSibling); }
    const C=[...document.querySelectorAll('#list .dev')]; const n=f=>C.filter(c=>match(c,f)).length;
    const F=[['all','همه'],['todo','ثبت‌نشده امروز'],['svc','سرویس']];
    if(!myDept()){ const D=[...new Set(C.map(c=>c.dataset.dept).filter(x=>x&&x!=='سایر'))]; D.forEach(x=>F.push(['d:'+x,x])); if(C.some(c=>c.dataset.dept==='سایر')) F.push(['d:سایر','سایر']); }
    const h=F.map(([k,l])=>{ const c=k==='all'?C.length:n(k); return `<button type="button" class="dzc${DZ.f===k?' on':''}${k!=='all'&&!c?' z':''}" data-f="${esc(k)}" aria-pressed="${DZ.f===k}">${esc(l)}${k==='all'?'':' <small>'+fa(c)+'</small>'}</button>`; }).join('');
    if(box.innerHTML!==h){ box.innerHTML=h; box.querySelectorAll('.dzc').forEach(b=>b.addEventListener('click',()=>{ DZ.f=DZ.f===b.dataset.f&&b.dataset.f!=='all'?'all':b.dataset.f; chips(); apply(); })); }
  }
  function match(c,f){ if(f==='all') return true; if(f==='todo') return !c.dataset.rd; if(f==='svc') return c.dataset.sv==='r'||c.dataset.sv==='o'; if(f.startsWith('d:')) return c.dataset.dept===f.slice(2); return true; }
  function apply(){ let shown=0; document.querySelectorAll('#list .dev').forEach(c=>{ const ok=match(c,DZ.f); c.classList.toggle('dzh',!ok); if(ok) shown++; });
    let e=$('dzE'); if(!shown && DZ.f!=='all'){ if(!e){ e=document.createElement('div'); e.id='dzE'; e.className='none'; $('list').appendChild(e); } e.textContent=DZ.f==='todo'?'✓ قرائت همه دستگاه‌ها امروز ثبت شده است.':'دستگاهی در این دسته نیست.'; } else if(e) e.remove(); }
  try{ new MutationObserver(()=>{ if(!document.querySelector('#list .dev:not([data-dz])')) { chips(); apply(); return; } decorate(); }).observe($('list'),{childList:true}); }catch(e){}
  decorate();
  window.ntDz={decorate,set:f=>{ DZ.f=f; chips(); apply(); },openAll:()=>{ document.querySelectorAll('#list .dev').forEach(c=>{ OPEN.add(c.dataset.dev); const d=c.querySelector('details.dzd'); if(d) d.open=true; }); }};
})();
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""
/* ===== طرح تازه دفترچه (add_daftar2) ===== */
.dzf{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
.dzf::-webkit-scrollbar{display:none}
.dzc{flex:none;min-height:42px;padding:0 14px;border-radius:21px;border:1.5px solid #C9D2DA;background:#fff;font:inherit;font-size:.88rem;font-weight:800;color:#17212B;white-space:nowrap;cursor:pointer}
.dzc small{font-weight:700;color:#5B6874;margin-inline-start:2px}
.dzc.on{background:#1B2430;border-color:#1B2430;color:#fff}.dzc.on small{color:#E6A52E}
.dzc.z{opacity:.55}
.dev.dzh{display:none!important}
.dev{border-radius:16px!important}
.dzm{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:.8rem;color:#5B6874;margin:-2px 0 4px}
.dzs{display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:12px;font-weight:800;font-size:.78rem}
.dz-bad{background:#C62828;color:#fff}.dz-wa{background:#E6A52E;color:#1B2430}.dz-svc{background:#1F5F99;color:#fff}
.dzv{margin-top:10px}
.dzv .l{display:flex;justify-content:space-between;gap:8px;font-size:.84rem;color:#3B4856}
.dzv .l b{font-weight:800;white-space:nowrap}
.dzv-r .l b{color:#C62828}.dzv-o .l b{color:#8A5A12}.dzv-g .l b{color:#17663F}
.dzv .bar{height:8px;border-radius:4px;background:#E8ECF0;margin-top:6px;overflow:hidden;display:block!important;padding:0!important;border:0!important}
.dzv .bar i{display:block;height:100%;border-radius:4px;background:#17663F}
.dzv-o .bar i{background:#E6A52E}.dzv-r .bar i{background:#C62828}
.dev .inp input.rv{min-height:56px;font-size:1.25rem;font-weight:800}
.dev .inp button.sv.on{background:#E6A52E!important;border-color:#E6A52E!important;color:#1B2430!important;font-weight:900}
details.dzd{margin-top:6px;border-top:1px dashed #D5DCE3}
body.fast .dzv,body.fast .dzm,body.fast details.dzd,body.fast #dzF{display:none!important}
details.dzd>summary{list-style:none;cursor:pointer;min-height:44px;display:flex;align-items:center;justify-content:space-between;font-size:.86rem;font-weight:800;color:#3B4856;padding:0 14px}
details.dzd>summary::-webkit-details-marker{display:none}
details.dzd>summary::after{content:"⌄";font-size:1.2rem;transition:transform .2s}
details.dzd[open]>summary::after{transform:rotate(180deg)}
@media (max-width:899px){
  .nh2 h1{font-size:0!important}
  .nh2 h1 .dpt{font-size:.78rem!important}
  .nh2 .nhd{display:none!important}
  .nh2:not(:has(.dpt)){display:none!important}
}
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('daftar2')
