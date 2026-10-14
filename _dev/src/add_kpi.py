# امروز: چهار کارت عددی بالای صفحه (طرح «Femly»):
#  ۱) توقف این ماه (ساعت) + مقایسه با همان بازه ماه قبل + نمودار کوچک ۳۰ روز
#  ۲) سرویس گذشته (برنامه سرویس) + تعداد نزدیک
#  ۳) هزینه تعمیر این ماه (شناسنامه، ماه = تاریخ ارسال) + مقایسه + ستون‌های ۶ ماه
#  ۴) خرابی باز (ثبت مشکلات، وضعیت ≠ بسته) + «در حال اقدام»
# هر کارت با زدن، زبانه مربوط را باز می‌کند. هیچ اطلاعاتی نوشته نمی‌شود.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
rep('  <div class="card at" id="atCard" hidden>','  <div class="kpis" id="kpis" aria-label="خلاصه ماه"></div>\n\n  <div class="card at" id="atCard" hidden>')
JS=r"""
/* ============ کارت‌های عددی بالای «امروز» ============ */
const KP_I={stop:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M9 12h6"/>',oil:'<path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/>',
  cost:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',fix:'<path d="M14 7a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 00-2-2z"/>'};
function kpPrev(k){ let {y,m,d}=parseKey(k); d--; if(d<1){ m--; if(m<1){ m=12; y--; } d=MLEN(m); } return mkKey(y,m,d); }
const kpLat=s=>String(s==null?'':s).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));
const kpNum=v=>{ const n=+kpLat(v).replace(/[,\s٬]/g,''); return isFinite(n)&&n>0?n:0; };
function kpSpark(vals,bars){
  const W=120,H=30, mx=Math.max(1,...vals);
  if(bars){ const bw=W/vals.length; return `<svg class="kpsp" viewBox="0 0 ${W} ${H}" aria-hidden="true">${vals.map((v,k)=>`<rect x="${(k*bw+2).toFixed(1)}" y="${(H-2-(v/mx)*(H-4)).toFixed(1)}" width="${(bw-4).toFixed(1)}" height="${((v/mx)*(H-4)+0.5).toFixed(1)}" rx="2"${k===vals.length-1?' class="cur"':''}/>`).join('')}</svg>`; }
  const pts=vals.map((v,k)=>`${(k*(W/(vals.length-1||1))).toFixed(1)},${(H-2-(v/mx)*(H-4)).toFixed(1)}`).join(' ');
  return `<svg class="kpsp" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="0,${H} ${pts} ${W},${H}" class="ar"/><polyline points="${pts}" class="ln"/></svg>`;
}
function kpDelta(cur,prev){ if(!prev) return ''; const p=Math.round((cur-prev)/prev*100); if(!p) return '<span class="kpd eq">مثل ماه قبل</span>';
  return `<span class="kpd ${p<0?'good':'bad'}">${p<0?'▼':'▲'}${fa(Math.abs(p))}٪ <small>نسبت به ماه قبل</small></span>`; }
function kpRender(){
  const box=$('kpis'); if(!box) return;
  const T=parseKey(K), C=[];
  /* ۱) توقف */
  try{ const N=parent.ntStops; if(N && N.list){
    const mStart=mkKey(T.y,T.m,1), pm=T.m===1?12:T.m-1, py=T.m===1?T.y-1:T.y, pStart=mkKey(py,pm,1), pEnd=mkKey(py,pm,Math.min(T.d,MLEN(pm)));
    const sum=L=>L.reduce((a,x)=>a+(x.min||0),0);
    const cur=sum(N.list(mStart,K)), prev=sum(N.list(pStart,pEnd));
    const days=[]; let k=K; for(let q=0;q<30;q++){ days.unshift(k); k=kpPrev(k); }
    const all=N.list(days[0],K), per={}; all.forEach(x=>{ per[x.day]=(per[x.day]||0)+(x.min||0); });
    const h=Math.round(cur/6)/10;
    C.push({k:'stop',t:'توقف این ماه',v:fa(h)+' <small>ساعت</small>',d:kpDelta(cur,prev),sp:kpSpark(days.map(x=>per[x]||0)),go:'توقف شیفت'});
  } }catch(e){}
  /* ۲) سرویس */
  try{ const items=LS('nt_svc_v1'); if(Array.isArray(items)&&items.length&&window.ntSvc){
    const A=ntSvc.all(items,LS('nt_daftar_v1')||[],K), r=A.filter(x=>x.st==='r').length, o=A.filter(x=>x.st==='o').length;
    C.push({k:'oil',t:'سرویس گذشته',v:fa(r),d:o?`<span class="kpd warn">${fa(o)} سرویس نزدیک</span>`:'<span class="kpd eq">موردی نزدیک نیست</span>',cls:r?'hot':'',go:'دفترچه قرائت'});
  } }catch(e){}
  /* ۳) هزینه */
  try{ const sh=LS('nt_sh8_v1'), rows=(sh&&Array.isArray(sh.rows))?sh.rows:[]; if(rows.length){
    const ym=r=>{ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})(?:[\/\-.](\d{1,2}))?/.exec(kpLat(r.st).trim()); return m?{y:+m[1],m:+m[2],d:+(m[3]||1)}:(r.y&&r.m?{y:+kpLat(r.y),m:+kpLat(r.m),d:+kpLat(r.d)||1}:null); };
    const tot=(y,m,dmax)=>rows.reduce((a,r)=>{ const q=ym(r); return (q&&q.y===y&&q.m===m&&(!dmax||q.d<=dmax))?a+kpNum(r.costA)+kpNum(r.costK):a; },0);
    const pm=T.m===1?12:T.m-1, py=T.m===1?T.y-1:T.y, cur=tot(T.y,T.m), prev=tot(py,pm,T.d);
    const six=[]; let y=T.y, m=T.m; for(let q=0;q<6;q++){ six.unshift(tot(y,m)); m--; if(m<1){ m=12; y--; } }
    const M=cur>=1e9?fa(Math.round(cur/1e8)/10)+' <small>میلیارد</small>':cur>=1e6?fa(Math.round(cur/1e5)/10)+' <small>میلیون</small>':fa(cur.toLocaleString('en-US'));
    C.push({k:'cost',t:'هزینه تعمیر این ماه',v:M,d:kpDelta(cur,prev),sp:kpSpark(six,true),go:'شناسنامه'});
  } }catch(e){}
  /* ۴) خرابی باز */
  try{ const mk=LS('nt_moshkel_v1'), rows=(mk&&Array.isArray(mk.rows))?mk.rows:[]; if(rows.length){
    const open=rows.filter(r=>r&&r.dev&&String(r.state||'باز').trim()!=='بسته'), act=open.filter(r=>String(r.state).trim()==='در حال اقدام').length, wp=open.filter(r=>String(r.state).trim()==='منتظر قطعه').length;
    C.push({k:'fix',t:'خرابی باز',v:fa(open.length),d:`<span class="kpd eq">${[act?fa(act)+' در حال اقدام':'',wp?fa(wp)+' منتظر قطعه':''].filter(Boolean).join(' · ')||'هیچ‌کدام در حال اقدام نیست'}</span>`,cls:open.length?'hot':'',go:'ثبت مشکلات'});
  } }catch(e){}
  if(!C.length){ box.innerHTML=''; box.hidden=true; return; }
  box.hidden=false; if(!kpRender.n){ kpRender.n=1; box.classList.add('anim'); setTimeout(()=>box.classList.remove('anim'),900); }
  box.innerHTML=C.map(c=>`<button type="button" class="kp ${c.k} ${c.cls||''}" data-go="${esc(c.go)}" aria-label="${esc(c.t)}"><span class="kph"><span class="kpi"><svg viewBox="0 0 24 24" aria-hidden="true">${KP_I[c.k]}</svg></span>${esc(c.t)}</span>
    <span class="kpv">${c.v}</span>${c.d||''}${c.sp||''}</button>`).join('');
  box.querySelectorAll('.kp').forEach(b=>b.addEventListener('click',()=>{ try{ parent.postMessage({nt:'go',tab:b.dataset.go},'*'); }catch(e){} }));
}
{ const _ar=atRender; atRender=function(){ _ar.apply(this,arguments); try{ kpRender(); }catch(e){} }; }
"""
rep("setInterval(()=>{ try{ atRender(); }catch(e){} },20000);",JS+"\nsetInterval(()=>{ try{ atRender(); }catch(e){} },20000);")
CSS="""
.kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 12px}
.kpis[hidden]{display:none}
.kp{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:118px;padding:12px 14px;border-radius:14px;border:1px solid #DDE3E9;background:#fff;color:#17212B;font:inherit;text-align:start;cursor:pointer;position:relative;overflow:hidden}
.kp:hover{border-color:#9AA6AF}
.kp:focus-visible{outline:3px solid #1B2430;outline-offset:2px}
.kph{display:flex;align-items:center;gap:8px;font-size:.82rem;font-weight:700;color:#3D4852}
.kpi{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:#EEF1F4;color:#3D4852}
.kpi svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.kp.hot .kpi{background:#FBE5E2;color:#B3261E}
.kp.oil .kpi{background:#FFF1D6;color:#7A4300}.kp.oil.hot .kpi{background:#FBE5E2;color:#B3261E}
.kpv{font-size:1.7rem;font-weight:800;line-height:1.2;font-variant-numeric:tabular-nums}
.kpv small{font-size:.8rem;font-weight:600;color:#51606E}
.kp.hot .kpv{color:#A32018}
.kpd{font-size:.76rem;font-weight:700;color:#51606E}
.kpd small{font-weight:500;color:#51606E}
.kpd.good{color:#1E7F4F}.kpd.bad{color:#A32018}.kpd.warn{color:#7A4300}
.kpsp{width:100%;height:30px;margin-top:auto}
.kpsp .ln{fill:none;stroke:#0B5C7A;stroke-width:1.8;stroke-linejoin:round}
.kpsp .ar{fill:rgba(11,92,122,.10);stroke:none}
.kpsp rect{fill:#C6D6DE}.kpsp rect.cur{fill:#0B5C7A}
@media (min-width:700px){ .kpis{grid-template-columns:repeat(4,minmax(0,1fr))} }
@media (min-width:960px){
  #kpis{grid-column:1/-1;grid-row:2}
  #atCard{grid-row:3/span 2!important}
  #flCard{grid-row:3!important}
  #tlCard{grid-row:4!important}
  .kp{min-height:132px;padding:14px 16px}
  .kpv{font-size:2rem}
}
@media (prefers-reduced-motion:no-preference){ .kpis.anim .kp{animation:kpIn .35s ease-out both} .kpis.anim .kp:nth-child(2){animation-delay:.05s}.kpis.anim .kp:nth-child(3){animation-delay:.1s}.kpis.anim .kp:nth-child(4){animation-delay:.15s}
  @keyframes kpIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}} }
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('kpi')
