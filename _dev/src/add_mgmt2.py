# طرح تازه — مرحله ۵: «مدیریت»
# ۱) کارت‌های خلاصه: چهار کارت جدا (۲×۲ در گوشی)؛ سرویس گذشته = تعداد دستگاه + نام آن‌ها؛ خرابی باز = «مورد» + «N دستگاه خراب در توقف»؛
#    مقایسه با نام ماه قبل («۱۲٪ بیشتر از شهریور»)؛ هزینه بدون مقایسه = «اجرت و قطعه · مهر». نمودار کوچک فقط در رایانه.
# ۲) ناوگان: انتخاب بخش (همه / تولید / استخراج) + کارت «آماده به کار ٪» با نوار رنگی و راهنما؛
#    فهرست دستگاه‌ها (آیکون، نام، وضعیت، کارکرد و توقف ماه)؛ ضربه = جزئیات (علت و مدت توقف، کار مانده، «پرونده دستگاه»، «توقف شیفت»).
# ۳) گوشی: ناوگان درست زیر کارت‌های خلاصه، بعد «نیاز به توجه».
# فقط زبانه «مدیریت» (کپی «امروز») تغییر می‌کند.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='مدیریت')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:80],t.count(a)); t=t.replace(a,b)

# --- کارت‌های خلاصه ---
rep("function kpDelta(cur,prev){ if(!prev) return ''; const p=Math.round((cur-prev)/prev*100); if(!p) return '<span class=\"kpd eq\">مثل ماه قبل</span>';",
    "const KP_MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];\n"
    "function kpMon(back){ const T=parseKey(K); return KP_MN[((T.m-1-(back||0))%12+12)%12]||''; }\n"
    "function kpDelta(cur,prev){ if(!prev) return ''; const p=Math.round((cur-prev)/prev*100); if(!p) return '<span class=\"kpd eq\">مثل '+kpMon(1)+'</span>';")
rep("<small>نسبت به ماه قبل</small>","<small>${p<0?'کمتر':'بیشتر'} از ${kpMon(1)}</small>")
rep("""    C.push({k:'oil',t:'سرویس گذشته',v:fa(r),d:o?`<span class="kpd warn">${fa(o)} سرویس نزدیک</span>`:'<span class="kpd eq">موردی نزدیک نیست</span>',cls:r?'hot':'',go:'دفترچه قرائت'});""",
    """    const rd=[...new Set(A.filter(x=>x.st==='r').map(x=>x.it.dev))], rn=rd.map(n=>String(n).split(' ').filter(w=>/[A-Za-z0-9]/.test(w)).join(' ')||n);
    C.push({k:'oil',t:'سرویس گذشته',v:fa(rd.length)+' <small>دستگاه</small>',d:rd.length?`<span class="kpd warn">${esc(rn.slice(0,3).join('، '))}${rn.length>3?' و '+fa(rn.length-3)+' دیگر':''}${o?' · '+fa(o)+' سرویس نزدیک':''}</span>`:(o?`<span class="kpd warn">${fa(o)} سرویس نزدیک</span>`:'<span class="kpd eq">موردی نزدیک نیست</span>'),cls:rd.length?'hot':'',go:'دفترچه قرائت'});""")
rep("C.push({k:'cost',t:'هزینه تعمیر این ماه',v:M,d:kpDelta(cur,prev),",
    "C.push({k:'cost',t:'هزینه تعمیر این ماه',v:M,d:kpDelta(cur,prev)||`<span class=\"kpd eq\">اجرت و قطعه · ${kpMon(0)}</span>`,")
rep("""    C.push({k:'fix',t:'خرابی باز',v:fa(open.length),d:`<span class="kpd eq">${[act?fa(act)+' در حال اقدام':'',wp?fa(wp)+' منتظر قطعه':''].filter(Boolean).join(' · ')||'هیچ‌کدام در حال اقدام نیست'}</span>`,""",
    """    let nbs=0; try{ const F=flBuild(); if(F) nbs=F.list.filter(x=>x.st==='bad').length; }catch(e){}
    C.push({k:'fix',t:'خرابی باز',v:fa(open.length)+' <small>مورد</small>',d:`<span class="kpd eq">${[nbs?fa(nbs)+' دستگاه خراب در توقف':'',act?fa(act)+' در حال اقدام':'',wp?fa(wp)+' منتظر قطعه':''].filter(Boolean).join(' · ')||'هیچ‌کدام در حال اقدام نیست'}</span>`,""")

# --- عنوان ناوگان ---
rep('<h2 style="color:#1B2430">ناوگان <small id="flSub"></small></h2>','<h2 style="color:#1B2430">ناوگان دستگاه‌ها <small id="flSub"></small></h2>')

JS=r"""
/* ===== طرح تازه مدیریت (add_mgmt2): ناوگان = بخش + آماده به کار + فهرست دستگاه‌ها ===== */
(function(){ try{
  if(!document.documentElement.classList.contains('mgmt') || typeof flRender!=='function') return;
  let SEG=null; try{ SEG=localStorage.getItem('nt_flseg'); }catch(e){}
  const OPEN2=new Set();
  const W2={bad:'خراب',wa:'منتظر',svc:'در سرویس',ok:'در کار',off:'پایان کار'};
  const CV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const gOf=n=>{ try{ return parent.ntDept?parent.ntDept.of(n):'سایر'; }catch(e){ return 'سایر'; } };
  const monStop=()=>{ const r={}; try{ const T=parseKey(K); parent.ntStops.list(mkKey(T.y,T.m,1),K).forEach(x=>{ if(x&&x.min>0){ const k=flKey(x.dev); r[k]=(r[k]||0)+x.min; } }); }catch(e){} return r; };
  const useOf=()=>{ const r={}; try{ const L=window.ntSvc?ntSvc.latest(LS('nt_daftar_v1')||[]):{}; Object.keys(L).forEach(n=>{ r[flKey(n)]=L[n].val; }); }catch(e){} return r; };
  const num=v=>fa(Math.round(v).toLocaleString('en-US')).replace(/,/g,'٬');
  flRender=function(){
    try{ tlRender(); }catch(e){}
    const box=$('flCard'); if(!box) return;
    if(!flCan()){ box.hidden=true; return; }
    const D=flBuild(); if(!D){ box.hidden=true; return; }
    box.hidden=false; box.classList.add('fl2');
    let host=$('fl2'); if(!host){ host=document.createElement('div'); host.id='fl2'; box.appendChild(host); host.addEventListener('click',onClick); }
    let order=[]; try{ order=(parent.ntDept&&parent.ntDept.groups())||[]; }catch(e){}
    const G=[]; order.concat(['سایر']).forEach(g=>{ if(D.list.some(x=>gOf(x.n)===g)) G.push(g); });
    D.list.forEach(x=>{ const g=gOf(x.n); if(!G.includes(g)) G.push(g); });
    const sel=(G.length>1 && SEG && G.includes(SEG))?SEG:'*';
    const L=sel==='*'?D.list:D.list.filter(x=>gOf(x.n)===sel);
    const c=k=>L.filter(x=>k.includes(x.st)).length, nb=c(['bad']), nw=c(['wa','svc']), no=c(['ok']), nf=c(['off']);
    const pct=L.length?Math.round((no+nf)/L.length*100):0;
    $('flSub').textContent=fa(no+nf)+' از '+fa(L.length)+' دستگاه آماده';
    const seg=G.length>1?`<div class="fsg" role="group" aria-label="بخش">${[['*','همه',D.list.length]].concat(G.map(g=>[g,g,D.list.filter(x=>gOf(x.n)===g).length])).map(a=>`<button type="button" data-seg="${esc(a[0])}" aria-pressed="${a[0]===sel}">${esc(a[1])} · ${fa(a[2])}</button>`).join('')}</div>`:'';
    const bar=[[no,'g'],[nf,'f'],[nw,'a'],[nb,'r']].filter(a=>a[0]).map(a=>`<i class="${a[1]}" style="flex:${a[0]}"></i>`).join('');
    const rd=`<div class="frd ${pct<50?'lo':(pct<80?'mid':'hi')}"><div class="frh"><span>آماده به کار</span><b class="num">${fa(pct)}٪</b></div>
      <div class="frb" aria-hidden="true">${bar}</div>
      <div class="frl"><span><i class="g"></i>در کار ${fa(no)}</span>${nf?`<span><i class="f"></i>پایان کار ${fa(nf)}</span>`:''}<span><i class="a"></i>منتظر / سرویس ${fa(nw)}</span><span><i class="r"></i>خراب / تعمیر ${fa(nb)}</span></div></div>`;
    const MS=monStop(), U=useOf(), showG=sel==='*' && G.length>1;
    const rows=L.map(x=>{ const op=OPEN2.has(x.dk), u=U[x.dk], ms=(MS[x.dk]||0)+(x.o&&x.o.el?x.o.el:0);
      const sub=[showG?esc(gOf(x.n)):'', u!=null?'کارکرد '+num(u)+(/کامیون/.test(x.n)?' کیلومتر':' ساعت'):'', ms?'توقف ماه '+flHM(ms)+' ساعت':'بدون توقف در ماه'].filter(Boolean).join(' · ');
      const now=x.o?`${esc(x.o.cause)}${x.o.el!==null?' · '+flDur(x.o.el)+(x.o.from?' (از ساعت '+fa(x.o.from)+')':''):''}`:(x.st==='off'?'خارج از ساعت کاری':(x.ow!==undefined?'اضافه‌کار از '+fa(x.ow):(x.cm>0?'توقف امروز: '+flHM(x.cm)+' ساعت':'امروز بدون توقف')));
      return `<div class="fr2 fl-${x.st}${op?' on':''}" data-k="${esc(x.dk)}">
        <button type="button" class="frw" aria-expanded="${op}"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">${FL_I[x.st]}</svg></span>
          <span class="tx"><b><bdi>${esc(x.n)}</bdi></b><small>${sub}</small></span><em>${W2[x.st]}</em><span class="cv">${CV}</span></button>
        <div class="frx"><p>${now}</p>${x.o&&x.o.el!==null&&x.o.el>=2880?'<p class="tk">اگر تمام شده، پایان را در «توقف شیفت» ثبت کنید</p>':''}${x.pt?`<p class="tk">${fa(x.pt)} کار مانده در برنامه امروز</p>`:''}
          <div class="fra"><button type="button" class="bt" data-dev="${esc(x.n)}">پرونده دستگاه</button><button type="button" class="bt" data-go="توقف شیفت">توقف شیفت</button></div></div></div>`; }).join('');
    host.innerHTML=seg+rd+`<div class="frs">${rows}</div>`;
  };
  function onClick(e){
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.seg!==undefined){ SEG=b.dataset.seg; try{ localStorage.setItem('nt_flseg',SEG); }catch(_){} flRender(); return; }
    if(b.classList.contains('frw')){ const r=b.closest('.fr2'), k=r.dataset.k, on=!OPEN2.has(k); if(on) OPEN2.add(k); else OPEN2.delete(k); r.classList.toggle('on',on); b.setAttribute('aria-expanded',on); return; }
    if(b.dataset.dev){ try{ const dv=(parent.ntQr&&parent.ntQr.DEVS||[]).find(q=>flKey(q.name)===flKey(b.dataset.dev));
      if(dv) parent.postMessage({nt:'qrdev',id:dv.id},'*'); else parent.postMessage({nt:'go',tab:'توقف شیفت'},'*'); }catch(_){} return; }
    if(b.dataset.go){ try{ parent.postMessage({nt:'go',tab:b.dataset.go},'*'); }catch(_){} }
  }
  flRender();
}catch(e){} })();
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]

CSS="""
/* ===== طرح تازه مدیریت (add_mgmt2) ===== */
.kpis{gap:10px;background:none;border:0;border-radius:0;overflow:visible}
.kp,.kp+.kp,.kp:nth-child(3),.kp:nth-child(n+3){background:#fff;border:1px solid var(--ln);border-radius:16px}
.kp{min-height:118px;box-shadow:0 1px 2px rgba(27,36,48,.05)}
.kpv small{margin-inline-start:4px}
.kp.hot{border-color:#EBC3BF}
@media (max-width:959px){ .kpsp{display:none} .kp{min-height:0;padding:12px 14px} .kpv{font-size:2rem} }
@media (max-width:959px){ html.mgmt #flCard{order:2!important} html.mgmt #atCard{order:3!important} html.mgmt #tlCard{order:4!important} html.mgmt .tools{order:5!important} }
#flCard.fl2>#flSum,#flCard.fl2>#flBar,#flCard.fl2>#flGrid,#flCard.fl2>.flnote{display:none!important}
#flCard.fl2{background:transparent;border:0;padding:0}
#flCard.fl2 h2{font-size:1.1rem;margin:4px 2px 10px}
.fsg{display:flex;gap:4px;padding:4px;background:#fff;border:1px solid var(--ln);border-radius:14px;margin-bottom:10px}
.fsg button{flex:1;min-height:44px;border:0;border-radius:10px;background:transparent;font:inherit;font-weight:800;font-size:.9rem;color:var(--nv);cursor:pointer}
.fsg button[aria-pressed="true"]{background:var(--nv);color:#fff}
.frd{background:#fff;border:1px solid var(--ln);border-radius:16px;padding:14px 16px;margin-bottom:10px}
.frh{display:flex;align-items:center;justify-content:space-between}
.frh span{font-weight:800;color:#3D4852}
.frh b{font-size:1.9rem;font-weight:900;color:var(--nv);line-height:1.2}
.frd.lo .frh b{color:var(--red)}.frd.mid .frh b{color:#8A5300}.frd.hi .frh b{color:#17663F}
.frb{display:flex;gap:3px;height:12px;margin:10px 0;border-radius:6px;overflow:hidden;background:#EEF1F4}
.frb i{display:block;min-width:6px}
.frb .g,.frl .g{background:#17663F}.frb .f,.frl .f{background:#8FC3A5}.frb .a,.frl .a{background:#E6A52E}.frb .r,.frl .r{background:#C62828}
.frl{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.84rem;font-weight:700;color:#2B3846}
.frl span{display:inline-flex;align-items:center;gap:6px}
.frl i{width:12px;height:12px;border-radius:3px;display:inline-block}
.frs{background:#fff;border:1px solid var(--ln);border-radius:16px;overflow:hidden}
.fr2+.fr2{border-top:1px solid #EEF1F4}
.frw{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:10px 14px;border:0;background:transparent;font:inherit;color:inherit;text-align:start;cursor:pointer}
.frw:focus-visible{outline:3px solid var(--nv);outline-offset:-3px}
.fr2 .ic{flex:none;width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:#E4F2EA;color:#17663F}
.fr2 .ic svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.fr2.fl-bad .ic{background:#C62828;color:#fff}.fr2.fl-wa .ic{background:#E6A52E;color:#1B2430}.fr2.fl-svc .ic{background:#1F5F99;color:#fff}.fr2.fl-off .ic{background:#EEF1F4;color:#5B6874}
.fr2 .tx{flex:1;min-width:0}
.fr2 .tx b{display:block;font-size:.98rem;font-weight:800;color:var(--nv);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fr2 .tx small{display:block;font-size:.78rem;color:var(--mut);margin-top:2px}
.fr2 em{flex:none;font-style:normal;font-size:.82rem;font-weight:800;color:#17663F}
.fr2.fl-bad em{color:#C62828}.fr2.fl-wa em{color:#8A5300}.fr2.fl-svc em{color:#1F5F99}.fr2.fl-off em{color:#5B6874}
.fr2 .cv{flex:none;width:22px;height:22px;color:#7A8792;transition:transform .15s}
.fr2 .cv svg{width:22px;height:22px}
.fr2.on .cv{transform:rotate(180deg)}
.frx{display:none;padding:0 14px 12px;padding-inline-start:66px}
.fr2.on .frx{display:block}
.frx p{margin:0 0 6px;font-size:.88rem;color:#2B3846}
.frx p.tk{color:#8A5300;font-weight:700}
.fra{display:flex;gap:8px;margin-top:8px}
.fra .bt{flex:1;min-height:44px;border-radius:12px;border:1px solid var(--nv);background:#fff;color:var(--nv);font:inherit;font-weight:800;font-size:.88rem;cursor:pointer}
.fra .bt:first-child{background:var(--nv);color:#fff}
@media (min-width:700px){ .frs{display:grid;grid-template-columns:1fr 1fr} .fr2+.fr2{border-top:0} .fr2{border-bottom:1px solid #EEF1F4} .fr2:nth-child(odd){border-inline-end:1px solid #EEF1F4} }
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('mgmt2')
