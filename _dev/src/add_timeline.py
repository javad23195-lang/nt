# «خط زمان شیفت» زیر کارت ناوگان در زبانه «امروز» (فقط می‌خواند، از فرم توقف شیفت)
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
h=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:60],h.count(a)); h=h.replace(a,b)

CSS=r"""
/* ---------- خط زمان شیفت ---------- */
.tl h2{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.tl h2 small{font-size:.74rem;font-weight:400;color:#51606E}
.tlsh{display:flex;gap:6px;margin:2px 0 10px}
.tlsh button{flex:1;min-height:40px;font:inherit;font-size:.82rem;font-weight:700;color:#1B2430;background:#fff;border:1px solid #DDE3E9;border-radius:12px;cursor:pointer}
.tlsh button[aria-pressed="true"]{background:#1B2430;color:#fff;border-color:#1B2430}
.tlsh button:focus-visible{outline:3px solid #E6A52E;outline-offset:2px}
.tlr{display:block;width:100%;padding:6px 2px;margin:0;font:inherit;text-align:start;color:#17212B;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.tlr:focus-visible{outline:3px solid #1B2430;outline-offset:2px;border-radius:8px}
.tlr .tt{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:.8rem;margin-bottom:3px}
.tlr .tt b{font-weight:800}.tlr .tt span{font-size:.72rem;color:#51606E;font-variant-numeric:tabular-nums;white-space:nowrap}
.tlr .tt span.has{color:#B3261E;font-weight:700}
.tlr .tt span.okc{color:#1E7F4F;font-weight:700}
.tlb{position:relative;direction:rtl;height:22px;border-radius:7px;background:#E7EBEF;overflow:hidden}
.tlb .tlok{position:absolute;top:0;bottom:0;right:0;background:#CFEBDA}
.tlb .sg{position:absolute;top:0;bottom:0;min-width:3px}
.tlb .wk{position:absolute;top:0;bottom:0;min-width:3px;background:#2E9E68}
.tlb .br{position:absolute;top:0;bottom:0;background:#AEB8C2;border-inline:1px solid #8E9AA6}
.tlb .em{background:#B3261E}
.tlb .pm{background:repeating-linear-gradient(45deg,#1F5F99 0 4px,#7FA9D3 4px 8px)}
.tlb .idle{background:radial-gradient(#7A4A00 28%,transparent 30%) 0 0/6px 6px,#F2B544}
.tlb .nw{position:absolute;top:0;bottom:0;width:3px;margin-right:-1px;background:#1B2430}
.tlax{display:flex;justify-content:space-between;direction:rtl;font-size:.68rem;color:#51606E;margin:2px 0 8px;font-variant-numeric:tabular-nums}
.tlsm{margin:4px 2px 8px;font-size:.78rem;color:#17212B}
.tlg{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 2px 0;font-size:.72rem;color:#51606E}
.tlg i{display:inline-block;width:16px;height:10px;border-radius:3px;vertical-align:-1px;margin-inline-end:4px}
.tlg .em{background:#B3261E}.tlg .pm{background:repeating-linear-gradient(45deg,#1F5F99 0 3px,#7FA9D3 3px 6px)}
.tlg .id{background:radial-gradient(#7A4A00 28%,transparent 30%) 0 0/5px 5px,#F2B544}.tlg .ok{background:#CFEBDA;border:1px solid #9CCFB1}.tlg .wkl{background:#2E9E68}.tlg .brl{background:#AEB8C2;border:1px solid #8E9AA6}
"""
k=h.find("</style>"); assert k>0; h=h[:k]+CSS+h[k:]

HTML="""  <div class="card tl" id="tlCard" hidden>
    <h2 style="color:#1B2430">خط زمان <small id="tlSub"></small></h2>
    <div class="tlsh" id="tlSh" role="group" aria-label="انتخاب بازه"></div>
    <div class="tlsm" id="tlSum" aria-live="polite"></div>
    <div id="tlRows"></div>
    <div class="tlax" id="tlAx" aria-hidden="true"></div>
    <div class="tlg"><span><i class="em"></i>خرابی</span><span><i class="pm"></i>سرویس</span><span><i class="id"></i>سالم ولی کار نکرد</span><span><i class="ok"></i>بدون توقف ثبت‌شده</span><span><i class="wkl"></i>اضافه‌کار</span><span><i class="brl"></i>استراحت</span></div>
  </div>

"""
rep('  <div id="alBox" aria-live="polite"></div>\n',HTML+'  <div id="alBox" aria-live="polite"></div>\n')

JS=r"""
/* ============ خط زمان: روز کاری ۷ تا ۱۵ و اضافه‌کار ۱۵ تا ۲۳ (فقط می‌خواند) ============ */
const TL_V=[{k:'day',n:'روز کاری',h:7},{k:'ot',n:'اضافه‌کار',h:15}];
let tlSel=null;
function tlSet(k){ tlSel=k; tlRender(); }
function tlCur(now){ return now.getHours()>=15?'ot':'day'; }
function tlWin(k,now){ const sh=TL_V.find(x=>x.k===k)||TL_V[0]; const a=new Date(now); a.setHours(sh.h,0,0,0); if(a.getTime()>now.getTime()) a.setDate(a.getDate()-1);
  return {a:a.getTime(),b:a.getTime()+480*60000,sh}; }
function tlAt(dy,t,addDay){ const g=flJ2G(dy), m=flMin(t); if(!g||m===null) return null; return new Date(g[0],g[1]-1,g[2]+(addDay?1:0),Math.floor(m/60),m%60).getTime(); }
/** یکی کردن بازه‌های هم‌پوشان */
function tlMerge(L){ L=L.slice().sort((p,q)=>p.s-q.s); const o=[]; L.forEach(g=>{ const z=o[o.length-1]; if(z && g.s<=z.e){ if(g.e>z.e) z.e=g.e; } else o.push({s:g.s,e:g.e}); }); return o; }
const tlLen=L=>L.reduce((a,g)=>a+(g.e-g.s)/60000,0);
function tlBuild(k,now){
  const S=parent.ntStops; if(!S||!S.TRACKED) return null;
  const W=tlWin(k,now), tv=flLS('nt_tavaqof_v1'), cap=Math.min(W.b,now.getTime());
  const base=new Date(W.a); base.setHours(0,0,0,0);
  const brs=k==='day'?(S.BREAKS||[]).map(b=>({n:b.n,s:base.getTime()+b.from*60000,e:base.getTime()+b.to*60000})):[];
  const rows=S.TRACKED.map(n=>({n,dk:flKey(n),seg:[],wk:[],min:0,wmin:0}));
  Object.keys(tv).forEach(key=>{ const parts=key.split('|'), dy=flDay(parts[0]); if(!dy) return; const rec=tv[key]||{};
    if(parts[1]==='اضافه'){
      (rec.work||[]).forEach(x=>{ if(!x||!x.dev) return; const r=rows.find(q=>q.dk===flKey(x.dev)); if(!r) return;
        let a=tlAt(dy,x.from,false); if(a===null) return; let b;
        if(x.to){ b=tlAt(dy,x.to,false); if(b===null) return; if(b<=a) b=tlAt(dy,x.to,true); } else b=now.getTime();
        const s=Math.max(a,W.a), e=Math.min(b,cap); if(e>s) r.wk.push({s,e,from:x.from,to:x.to||''}); });
      return; }
    (rec.stops||[]).forEach(x=>{ if(!x||!x.dev) return; const r=rows.find(q=>q.dk===flKey(x.dev)); if(!r) return;
      let a=tlAt(dy,x.from,false); if(a===null) return; let b;
      if(x.to){ b=tlAt(dy,x.to,false); if(b===null) return; if(b<=a) b=tlAt(dy,x.to,true); } else b=now.getTime();
      const s=Math.max(a,W.a), e=Math.min(b,cap); if(e<=s) return;
      r.seg.push({s,e,cause:x.cause||'نامشخص',cls:S.clsOf(x.cause||''),open:!x.to,from:x.from,to:x.to||''}); }); });
  rows.forEach(r=>{ r.seg.sort((p,q)=>p.s-q.s); const m=tlMerge(r.seg); let tot=tlLen(m);
    brs.forEach(b=>{ m.forEach(g=>{ const o=Math.min(g.e,b.e)-Math.max(g.s,b.s); if(o>0) tot-=o/60000; }); });   // استراحت توقف نیست
    r.min=Math.max(0,tot); r.wmin=tlLen(tlMerge(r.wk)); });
  return {W,rows,cap,brs,k,now:now.getTime()};
}
const tlHour=h=>fa(String(((h%24)+24)%24).padStart(2,'0'))+':۰۰';
function tlRender(){
  const box=$('tlCard'); if(!box) return;
  if(!flCan()){ box.hidden=true; return; }
  const now=new Date(), cur=tlCur(now), sel=tlSel||cur;
  const D=tlBuild(sel,now); if(!D){ box.hidden=true; return; }
  box.hidden=false;
  const live=now.getTime()>=D.W.a && now.getTime()<D.W.b, ot=sel==='ot';
  $('tlSub').textContent=D.W.sh.n+' · '+tlHour(D.W.sh.h)+' تا '+tlHour(D.W.sh.h+8);
  $('tlSh').innerHTML=TL_V.map(x=>`<button type="button" data-s="${x.k}" aria-pressed="${x.k===sel}">${x.n}${x.k===cur?' (اکنون)':''}</button>`).join('');
  const P=m=>(m/480*100);
  const tot=D.rows.reduce((a,r)=>a+(ot?r.wmin:r.min),0), nd=D.rows.filter(r=>(ot?r.wmin:r.min)>0).length;
  $('tlSum').textContent=ot?(nd?`${fa(nd)} دستگاه اضافه‌کار داشته؛ مجموع کار ${flHM(tot)} ساعت.`:'در این بازه اضافه‌کاری ثبت نشده است.')
    :(nd?`${fa(nd)} دستگاه توقف داشته؛ مجموع ${flHM(tot)} ساعت (بدون استراحت).`:'در این روز توقفی ثبت نشده است.');
  $('tlRows').innerHTML=D.rows.map(r=>{ const p=flParts(r.n);
    const okW=Math.max(0,Math.min(480,(D.cap-D.W.a)/60000));
    const sg=r.seg.map(g=>{ const l=(g.s-D.W.a)/60000, w=(g.e-g.s)/60000; const t=`${g.cause}${g.from?' · '+fa(g.from)+' تا '+(g.to?fa(g.to):'هنوز ادامه دارد'):''}`;
      return `<span class="sg ${g.cls}" style="right:${P(l)}%;width:${P(w)}%" title="${esc(t)}"></span>`; }).join('');
    const wk=r.wk.map(g=>{ const l=(g.s-D.W.a)/60000, w=(g.e-g.s)/60000; const t='اضافه‌کار · '+fa(g.from)+' تا '+(g.to?fa(g.to):'هنوز ادامه دارد');
      return `<span class="wk" style="right:${P(l)}%;width:${P(w)}%" title="${esc(t)}"></span>`; }).join('');
    const bs=D.brs.map(b=>`<span class="br" style="right:${P((b.s-D.W.a)/60000)}%;width:${P((b.e-b.s)/60000)}%" title="${esc(b.n)}"></span>`).join('');
    const nw=live?`<span class="nw" style="right:${P(okW)}%"></span>`:'';
    const lab=ot?(r.wmin>0?'کار '+flHM(r.wmin)+' ساعت':'کار نکرده'):(r.min>0?'توقف '+flHM(r.min)+' ساعت':'بدون توقف');
    const has=ot?r.wmin>0:r.min>0;
    return `<button type="button" class="tlr" data-dev="${esc(r.n)}" aria-label="${esc(r.n)}: ${lab}">
      <div class="tt"><b>${esc(p.cp)} ${esc(p.md)}</b><span class="${has?(ot?'okc':'has'):''}">${lab}</span></div>
      <div class="tlb">${ot?'':`<span class="tlok" style="width:${P(okW)}%"></span>`}${wk}${sg}${bs}${nw}</div></button>`; }).join('');
  $('tlAx').innerHTML=[0,2,4,6,8].map(i=>`<span>${tlHour(D.W.sh.h+i)}</span>`).join('');
  box.querySelectorAll('.tlsh button').forEach(b=>b.addEventListener('click',()=>{ tlSel=b.dataset.s===cur?null:b.dataset.s; tlRender(); }));
  box.querySelectorAll('.tlr').forEach(b=>b.addEventListener('click',()=>{
    try{ const dv=(parent.ntQr&&parent.ntQr.DEVS||[]).find(d=>flKey(d.name)===flKey(b.dataset.dev));
      if(dv) parent.postMessage({nt:'qrdev',id:dv.id},'*'); else parent.postMessage({nt:'go',tab:'توقف شیفت'},'*'); }catch(e){} }));
}
"""
rep("function flRender(){\n  const box=$('flCard'); if(!box) return;","function flRender(){\n  try{ tlRender(); }catch(e){}\n  const box=$('flCard'); if(!box) return;")
rep("setInterval(()=>{ try{ flRender(); }catch(e){} },20000);","setInterval(()=>{ try{ flRender(); }catch(e){} },20000);\n"+JS)

d['b64']=base64.b64encode(h.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('timeline added')
