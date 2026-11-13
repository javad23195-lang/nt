# انبار: «ثبت مصرف» سریع (انباردار، گوشی و کامپیوتر)، «منتظر سندپرداز» (شماره سند، برگرداندن با توضیح)، «ثبت‌های من»،
# بارگذاری فایل موجودی سندپرداز در زبانه انبار، و دو ردیف «نیاز به توجه» در «امروز». داده همان nt_anbar_out_v1 (هر ردیف id می‌گیرد).
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
/* ===== جریان مصرف: انباردار ← شما (add_an_flow.py) ===== */
.anf{border:1px solid var(--rule);border-radius:14px;background:var(--steel);padding:14px;margin-bottom:12px}
.anf h2{margin:0 0 2px;font-size:1rem;font-weight:900;display:flex;align-items:center;gap:8px}
.anf h2 em{font-style:normal;margin-inline-start:auto;font-size:.76rem;font-weight:900;padding:2px 10px;border-radius:10px;background:#FBE3DF;color:#A32018}
.anf h2 em.ok{background:#E6F4EA;color:#1E5E3A}
.anf p.sub{margin:0 0 8px;font-size:.78rem;color:var(--dim)}
.anf .lb{display:block;font-size:.78rem;font-weight:800;color:var(--dim);margin:10px 0 4px}
.anf input{width:100%;box-sizing:border-box;min-height:46px;border:1px solid #9AA8B5;border-radius:10px;padding:0 10px;font:inherit;font-size:.95rem;background:#fff;color:#17212B}
.anf input:focus-visible,.anf button:focus-visible{outline:2px solid var(--acc);outline-offset:1px}
.qdv{display:flex;flex-wrap:wrap;gap:6px}
.qdv button{min-height:38px;padding:0 12px;border-radius:19px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-size:.84rem;font-weight:700;color:#17212B;cursor:pointer}
.qdv button[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:#fff}
.qsug{border:1px solid #D5DCE3;border-radius:10px;margin-top:4px;overflow:hidden;background:#fff}
.qsug:empty{display:none}
.qsug button{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;padding:6px 10px;border:0;border-top:1px solid #EEF1F4;background:#fff;font:inherit;font-size:.86rem;text-align:start;cursor:pointer;color:#17212B}
.qsug button:first-child{border-top:0}.qsug button:hover,.qsug button:focus-visible{background:#EAF3F7}
.qsug button span{flex:1;min-width:0}.qsug small{color:var(--dim);font-size:.74rem}.qsug .st{flex:none;font-size:.74rem;color:#1E5E3A;font-weight:800}.qsug .st.z{color:#A32018}
.qpk{margin-top:6px;font-size:.8rem;color:#1E5E3A;font-weight:800}.qpk:empty{display:none}
.qr2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.qsg{display:flex;gap:6px}.qsg button{flex:1;min-height:44px;border-radius:10px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-weight:800;cursor:pointer;color:#17212B}
.qsg button[aria-pressed="true"]{background:#17212B;border-color:#17212B;color:#fff}
.qgo{display:block;width:100%;min-height:52px;margin-top:12px;border:0;border-radius:12px;background:var(--acc);color:#fff;font:inherit;font-size:1rem;font-weight:900;cursor:pointer}
.qx{display:block;width:100%;min-height:42px;margin-top:6px;border:1px solid #C3CDD5;border-radius:10px;background:#fff;font:inherit;font-weight:700;cursor:pointer}
.qmsg{margin-top:8px;font-size:.84rem;font-weight:800}.qmsg:empty{display:none}.qmsg.bad{color:#A32018}.qmsg.ok{color:#1E5E3A}
.pdk{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 10px}
.pdk div{border:1px solid #D5DCE3;border-radius:12px;background:#fff;padding:6px;text-align:center;font-size:.74rem;color:var(--dim)}
.pdk b{display:block;font-size:1.3rem;color:#17212B;font-variant-numeric:tabular-nums}.pdk .r b{color:#A32018}
.pd{border:1px solid #D5DCE3;border-radius:12px;background:#fff;padding:10px 12px;margin-top:8px}
.pd.old{border-inline-start:4px solid #A32018}
.pd .h{display:flex;align-items:flex-start;gap:8px}.pd .h b{flex:1;min-width:0;font-size:.95rem}.pd .h small{display:block;font-weight:500;color:var(--dim);font-size:.74rem}
.pill{flex:none;font-size:.72rem;font-weight:900;padding:2px 9px;border-radius:9px;background:#FFF1CF;color:#7A4D00;white-space:nowrap}
.pill.r{background:#FBE3DF;color:#A32018}.pill.g{background:#E6F4EA;color:#1E5E3A}.pill.n{background:#EEF1F4;color:#51606E}
.kv2{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.kv2 span{background:#EEF1F4;border-radius:8px;padding:1px 8px;font-size:.76rem}
.pda{display:grid;grid-template-columns:auto 1fr auto;gap:6px;align-items:center}
.pda button{min-height:44px;padding:0 12px;border-radius:10px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-size:.84rem;font-weight:800;cursor:pointer;color:#17212B}
.pda button.go{background:var(--acc);border-color:var(--acc);color:#fff}
.pda input{min-height:44px;text-align:center;font-variant-numeric:tabular-nums}
.pdb{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
.pdb button{min-height:36px;padding:0 10px;border:0;background:none;font:inherit;font-size:.8rem;font-weight:800;color:#A32018;cursor:pointer}
.pdbk{margin-top:6px;display:grid;grid-template-columns:1fr auto;gap:6px}.pdbk[hidden]{display:none}
.pdbk button{min-height:44px;padding:0 12px;border-radius:10px;border:1px solid #A32018;background:#fff;color:#A32018;font:inherit;font-weight:800;cursor:pointer}
.bknote{margin-top:6px;font-size:.8rem;color:#A32018;font-weight:800}
.pdall{display:block;width:100%;min-height:46px;margin-top:10px;border:1.5px solid var(--acc);border-radius:12px;background:#fff;color:var(--acc);font:inherit;font-weight:900;cursor:pointer}
.mn{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-top:1px solid #EEF1F4;font-size:.88rem}
.mn:first-of-type{border-top:0}.mn .tx{flex:1;min-width:0}.mn .tx small{display:block;color:var(--dim);font-size:.74rem}
.mn .ac{display:flex;gap:4px;margin-top:4px}.mn .ac button{min-height:34px;padding:0 10px;border-radius:8px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-size:.78rem;font-weight:800;cursor:pointer}
.mn .ac button.del{color:#A32018;border-color:#E0A39C}
.stu{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.stu button{min-height:44px;padding:0 14px;border-radius:10px;border:1px solid var(--acc);background:#fff;color:var(--acc);font:inherit;font-weight:800;cursor:pointer}
.stu span{font-size:.8rem;color:var(--dim)}
@media (min-width:900px){ .anfw{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start} .anfw>.anf{margin-bottom:0} }
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]

rep('<div class="pane on" id="pOut">\n    <div id="sOut"></div>',
'''<div class="pane on" id="pOut">
    <div class="anfw">
    <section class="anf" id="qkCard" aria-labelledby="qkT"><h2 id="qkT">ثبت مصرف</h2><p class="sub">دستگاه، کالا از موجودی سندپرداز، مقدار — بعد «ثبت مصرف».</p>
      <span class="lb">دستگاه یا محل مصرف</span><div class="qdv" id="qDevs" role="group" aria-label="دستگاه"></div>
      <input id="qDev" autocomplete="off" placeholder="یا بنویسید (مثلاً خط والس، تانکر ۱۲۰۰۰ لیتری)" aria-label="دستگاه یا محل مصرف" style="margin-top:6px">
      <label class="lb" for="qItem">کالا</label><input id="qItem" autocomplete="off" placeholder="نام یا کد کالا (مثلاً روغن هیدرولیک ۶۸)">
      <div class="qsug" id="qSug" role="listbox" aria-label="کالاهای پیشنهادی"></div><div class="qpk" id="qPk"></div>
      <div class="qr2"><div><label class="lb" for="qQty">مقدار <span id="qU"></span></label><input id="qQty" inputmode="decimal" autocomplete="off" placeholder="۱"></div>
        <div><label class="lb" for="qDate">تاریخ</label><input id="qDate" inputmode="numeric" autocomplete="off"></div></div>
      <span class="lb">نوع</span><div class="qsg" id="qTyp" role="group" aria-label="نوع خروج"><button type="button" data-t="msr" aria-pressed="true">مصرف</button><button type="button" data-t="svc" aria-pressed="false">تعویض روغن (سرویس)</button></div>
      <button type="button" class="qgo" id="qGo">ثبت مصرف</button><button type="button" class="qx" id="qCancel" hidden>لغو اصلاح</button>
      <div class="qmsg" id="qMsg" role="status"></div></section>
    <section class="anf" id="pdCard" aria-labelledby="pdT" hidden><h2 id="pdT">منتظر سندپرداز <em id="pdN"></em></h2><p class="sub">ثبت در سندپرداز، بعد شماره سند را بنویسید و «ثبت شد» را بزنید. انباردار شماره را در سامانه می‌بیند.</p>
      <div class="pdk" id="pdK"></div><div id="pdList"></div></section>
    <section class="anf" id="mnCard" aria-labelledby="mnT" hidden><h2 id="mnT">ثبت‌های من</h2><p class="sub">وضعیت مصرف‌هایی که ثبت کرده‌اید.</p><div id="mnList"></div></section>
    </div>
    <div id="sOut"></div>''')

rep('''      <h2>موجودی انبار</h2>''','''      <h2>موجودی انبار</h2>
      <div class="stu"><button type="button" id="stUp">بارگذاری فایل موجودی سندپرداز</button><span id="stAt"></span><input type="file" id="stFile" accept=".xlsx,.xls,.csv" hidden></div>''')

# خروجی اکسل فقط ردیف‌های آماده؛ «پاک کردن لیست» ردیف‌های منتظر سندپرداز را نگه می‌دارد
rep("  return outRows.map(window.__oTSV).join('\\n');","  return outRows.filter(anReady).map(window.__oTSV).join('\\n');")
rep("say(ok?`${fa(outRows.length)} ردیف کپی شد — در شیت «خروج انبار» ستون A بچسبانید`:'کپی نشد',!ok);});",
    "const nr=outRows.filter(anReady).length, np=outRows.length-nr; say(ok?`${fa(nr)} ردیف کپی شد — در شیت «خروج انبار» ستون A بچسبانید`+(np?`؛ ${fa(np)} ردیف منتظر سندپرداز در خروجی نیست`:''):'کپی نشد',!ok);});")
rep("armButton($('oClear'),'پاک کردن لیست','⚠ دوباره بزنید',()=>{outRows=[];oEdit=null;render();say('پاک شد');},6000);",
    "armButton($('oClear'),'پاک کردن لیست','⚠ دوباره بزنید',()=>{const k=outRows.filter(r=>!anReady(r)); outRows=k; oEdit=null; render(); say(k.length?'پاک شد؛ '+fa(k.length)+' ردیف منتظر سندپرداز ماند':'پاک شد');},6000);")
# شناسه ردیف‌ها (ادغام دو سیستم بدون تکرار) و خلاصه برای «امروز»
rep("function typOf(r){ return r.svc?'svc':(r.rep?'rep':'msr'); }",
r"""function typOf(r){ return r.svc?'svc':(r.rep?'rep':'msr'); }
/** ردیف آماده خروجی اکسل: شماره سند دارد، یا سرویس / نت تعمیرات است (سند لازم ندارد) */
function anReady(r){ return !!(r && (String(r.doc||'').trim() || r.svc || r.rep)); }
function anPend(r){ return !!r && !anReady(r); }
/** هر ردیف یک شناسه: از متن خودش (دو سیستم برای یک ردیف قدیمی یک شناسه می‌سازند)؛ ردیف تازه = تصادفی */
function anIds(){ const seen={}; outRows.forEach(r=>{ if(!r || r.id) return; const b=JSON.stringify(r); let h=0x811c9dc5; for(let k=0;k<b.length;k++){ h^=b.charCodeAt(k); h=Math.imul(h,16777619); }
  const x='a'+(h>>>0).toString(36)+b.length.toString(36); seen[x]=(seen[x]||0)+1; r.id=seen[x]>1?x+'-'+seen[x]:x; }); }""")
rep("  try{ localStorage.setItem('nt_anbar_sum_v1',JSON.stringify({noDoc:outRows.filter(missDoc).length, noCode:outRows.filter(missCode).length})); }catch(e){}",
    "  try{ anIds(); }catch(e){}\n  try{ const P=outRows.filter(anPend), T0=todayKey(); localStorage.setItem('nt_anbar_sum_v1',JSON.stringify({noDoc:outRows.filter(missDoc).length, noCode:outRows.filter(missCode).length, pend:P.filter(r=>!r.back).length, old:P.filter(r=>!r.back && String(r.date||'')<T0).length, back:P.filter(r=>r.back).length, first:(P.filter(r=>!r.back)[0]||{}).item||''})); }catch(e){}")

JS=r"""
/* ===== جریان مصرف: انباردار ← شما (add_an_flow.py) ===== */
(function(){
const P=()=>{ try{ return parent; }catch(e){ return null; } };
const S=()=>{ const p=P(); return p&&p.ntSync; };
const canW=()=>{ try{ return !S() || S().canWriteTab('انبار'); }catch(e){ return true; } };
const me=()=>{ try{ return (S()&&S().myName&&S().myName())||''; }catch(e){ return ''; } };
const sec=()=>{ try{ return (S()&&S().mySec&&S().mySec())||''; }catch(e){ return ''; } };
const keeper=()=>sec()==='anbar';
const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const nk=s=>norm(lat(s)).replace(/\s+/g,'');
const uid=()=>'q'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const hm=()=>{ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
const DEVS=()=>{ try{ const p=P(); return (p&&p.ntQr&&p.ntQr.DEVS)||[]; }catch(e){ return []; } };
const TRK=()=>{ try{ const p=P(); return (p&&p.ntStops&&p.ntStops.TRACKED)||[]; }catch(e){ return []; } };
const SHORT=n=>String(n).replace(/^(لودر|بیل مکانیکی|کامیون|دیزل ژنراتور|ژنراتور)\s+(کوماتسو\s+)?/,'').replace(/^مینی بوس\s+/,'').trim()||n;
/* ---- فهرست کالا: موجودی سندپرداز (nt_stock_v1) + کاتالوگ انبار ---- */
function stockObj(){ try{ const o=JSON.parse(localStorage.getItem('nt_stock_v1')||'null'); return o&&o.items&&typeof o.items==='object'?o:null; }catch(e){ return null; } }
let CAT=null, CATK='';
function cat(){ const so=stockObj(), k=(so&&so.at||'')+'|'+Object.keys((so&&so.items)||{}).length; if(CAT&&CATK===k) return CAT;
  const m=new Map(); if(so) Object.keys(so.items).forEach(c=>{ const x=so.items[c]; if(!x||!x.n) return; m.set(String(c),{n:String(x.n),c:String(c),u:x.u||'',q:+x.q||0,src:'sp'}); });
  const spN=new Set([...m.values()].map(x=>nk(x.n)));
  try{ DATA.items.forEach(o=>{ const c=o.c==null?'':String(o.c); if((c && m.has(c)) || spN.has(nk(o.d))) return; m.set(c||('n:'+norm(o.d)),{n:o.d,c,u:o.u||'',q:o.m==null?null:+o.m,src:'cat'}); }); }catch(e){}
  CAT=[...m.values()].map(x=>Object.assign(x,{k:nk(x.n+' '+x.c)})); CATK=k; return CAT; }
function search(q){ q=nk(q); if(!q) return []; const W=norm(lat($('qItem').value)).split(' ').filter(Boolean).map(nk);
  return cat().filter(x=>W.every(w=>x.k.indexOf(w)>-1)).sort((a,b)=>(b.src==='sp')-(a.src==='sp')||(a.n.length-b.n.length)).slice(0,8); }
/* ---- فرم ثبت مصرف ---- */
let qDev='', qPick=null, qTyp='msr', qEdit=null;
function devChips(){ const box=$('qDevs'); if(!box) return; const all=DEVS().map(d=>d.name), trk=TRK(), more=box.dataset.more==='1';
  const L=more?all:all.filter(n=>trk.indexOf(n)>-1);
  box.innerHTML=L.map(n=>`<button type="button" data-dv="${esc(n)}" aria-pressed="${nk(n)===nk(qDev)}">${esc(SHORT(n))}</button>`).join('')+(all.length>L.length||more?`<button type="button" data-more>${more?'کمتر':'+ بیشتر'}</button>`:''); }
function setDev(n){ qDev=n; $('qDev').value=n; devChips(); }
function pickItem(x){ qPick=x; $('qItem').value=x.n; $('qSug').innerHTML=''; $('qU').textContent=x.u?'('+x.u+')':'';
  $('qPk').textContent=(x.c&&x.c.indexOf('n:')!==0?'کد '+fa(x.c):'بدون کد')+(x.q!=null?' — موجودی '+fa(Math.round(x.q*100)/100)+(x.u?' '+x.u:''):''); }
function sugDraw(){ const L=search($('qItem').value); qPick=null; $('qPk').textContent=''; $('qU').textContent='';
  $('qSug').innerHTML=L.map((x,i)=>`<button type="button" role="option" data-i="${i}"><span>${esc(x.n)}<br><small>${x.c&&x.c.indexOf('n:')!==0?'کد '+esc(fa(x.c)):'بدون کد'}</small></span>${x.q!=null?`<span class="st${x.q<=0?' z':''}">${esc(fa(Math.round(x.q*100)/100))} ${esc(x.u||'')}</span>`:''}</button>`).join('');
  $('qSug')._L=L; }
function qMsg(t,c){ const m=$('qMsg'); m.textContent=t||''; m.className='qmsg'+(c?' '+c:''); }
function qReset(){ qPick=null; qEdit=null; $('qItem').value=''; $('qQty').value=''; $('qSug').innerHTML=''; $('qPk').textContent=''; $('qU').textContent=''; $('qCancel').hidden=true; $('qGo').textContent='ثبت مصرف'; $('qDate').value=todayKey(); }
function qSave(){ if(!canW()){ qMsg('اجازه ثبت در انبار را ندارید','bad'); return; }
  const dev=String($('qDev').value||'').trim(), name=String($('qItem').value||'').trim(), qty=parseFloat(lat($('qQty').value).replace(/[^\d.]/g,''));
  if(!dev){ qMsg('دستگاه یا محل مصرف را انتخاب کنید','bad'); return; }
  if(!name){ qMsg('کالا را بنویسید','bad'); $('qItem').focus(); return; }
  if(!(qty>0)){ qMsg('مقدار را بنویسید','bad'); $('qQty').focus(); return; }
  const dt=okDate(lat($('qDate').value).trim()); if(!dt){ qMsg('تاریخ درست نیست (مثل ۱۴۰۵/۰۸/۰۹)','bad'); return; }
  const x=qPick&&nk(qPick.n)===nk(name)?qPick:null;
  const r=qEdit?outRows.find(y=>y&&y.id===qEdit):null;
  const rec=r||{id:uid(),by:me(),at:hm(),src:'q'};
  Object.assign(rec,{date:dt.s,y:dt.y,m:dt.m,d:dt.d,dev,item:x?x.n:name,qty:Math.round(qty*1000)/1000,why:'مورد نیاز '+dev,cond:rec.cond||''});
  if(x&&x.c&&x.c.indexOf('n:')!==0) rec.code=x.c; if(x&&x.u) rec.u=x.u;
  setTyp(rec,qTyp); delete rec.back; if(r) rec.ed=hm();
  if(!r) outRows.push(rec);
  render(); qMsg((r?'اصلاح شد: ':'ثبت شد: ')+rec.item+' — '+fa(rec.qty)+(rec.u?' '+rec.u:'')+' — '+rec.dev,'ok'); qReset(); try{ $('qItem').focus(); }catch(e){} }
function qLoad(r){ qEdit=r.id; setDev(r.dev||''); $('qItem').value=r.item||''; const L=cat().filter(x=>nk(x.n)===nk(r.item)); qPick=L[0]||null; if(qPick) pickItem(qPick);
  $('qQty').value=r.qty||''; $('qDate').value=r.date||todayKey(); qTyp=typOf(r)==='svc'?'svc':'msr'; typSync(); $('qGo').textContent='ذخیره اصلاح'; $('qCancel').hidden=false; qMsg('');
  try{ $('qkCard').scrollIntoView({block:'start',behavior:'smooth'}); }catch(e){} }
function typSync(){ document.querySelectorAll('#qTyp button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===qTyp))); }
/* ---- منتظر سندپرداز ---- */
const uOf=r=>{ try{ return unitOf(r)||''; }catch(e){ return r.u||''; } };
const cOf=r=>{ try{ return codeOfItem(r.item)||rowCode(r)||''; }catch(e){ return r.code||''; } };
const line=r=>[r.item, r.dev, 'مقدار '+(r.qty||'')+(uOf(r)?' '+uOf(r):''), cOf(r)?'کد '+cOf(r):''].filter(Boolean).join(' — ');
let bkOpen='';
function pdDraw(){ const card=$('pdCard'); if(!card) return; const show=canW() && !keeper(); card.hidden=!show; if(!show) return;
  const T0=todayKey(), P=outRows.filter(r=>anPend(r)&&!r.back).sort((a,b)=>String(a.date).localeCompare(String(b.date))), B=outRows.filter(r=>anPend(r)&&r.back);
  const wf=wkFrom(), wk=outRows.filter(r=>r.doc&&r.docAt&&String(r.docAt)>=wf).length;
  const n=$('pdN'); n.textContent=P.length?fa(P.length):'✓'; n.className=P.length?'':'ok';
  const old=P.filter(r=>String(r.date||'')<T0).length;
  $('pdK').innerHTML=`<div class="r"><b>${fa(P.length)}</b>منتظر ثبت</div><div class="${old?'r':''}"><b>${fa(old)}</b>از روزهای قبل</div><div><b>${fa(wk)}</b>این هفته ثبت شد</div>`;
  const card1=r=>{ const o=String(r.date||'')<T0, ds=daysAgo(r.date);
    return `<div class="pd${o?' old':''}" data-id="${esc(r.id)}"><div class="h"><b>${esc(r.item||'')}<small>${esc(fa(r.date||''))}${r.by?' — '+esc(r.by):''}${r.at?'، '+esc(fa(r.at)):''}</small></b><span class="pill ${o?'r':''}">${o?esc(fa(ds))+' روز':'تازه'}</span></div>
      <div class="kv2">${cOf(r)?`<span>کد ${esc(fa(cOf(r)))}</span>`:'<span>بدون کد</span>'}<span>${esc(fa(r.qty||''))} ${esc(uOf(r))}</span><span>${esc(r.dev||'')}</span></div>
      <div class="pda"><button type="button" data-cp>کپی</button><input data-doc inputmode="numeric" autocomplete="off" placeholder="شماره سند" aria-label="شماره سند سندپرداز برای ${esc(r.item||'')}"><button type="button" class="go" data-ok>ثبت شد</button></div>
      <div class="pdb"><button type="button" data-bk>↩ برگرداندن به انباردار</button></div>
      <div class="pdbk" ${bkOpen===r.id?'':'hidden'}><input data-bkt maxlength="120" placeholder="چه چیزی را درست کند؟ (مثلاً کد را بنویس)" aria-label="توضیح برگرداندن"><button type="button" data-bks>برگرداندن</button></div></div>`; };
  $('pdList').innerHTML=(P.length?P.map(card1).join(''):'<p class="sub" style="margin:8px 0 0">همه مصرف‌ها شماره سند دارند ✓</p>')
    +(B.length?`<span class="lb">برگشت خورده — منتظر انباردار (${fa(B.length)})</span>`+B.map(r=>`<div class="pd" data-id="${esc(r.id)}"><div class="h"><b>${esc(r.item||'')}<small>${esc(r.dev||'')} — ${esc(fa(r.qty||''))} ${esc(uOf(r))}</small></b><span class="pill n">برگشت</span></div><div class="bknote">${esc(r.back.t||'')}</div><div class="pdb"><button type="button" data-unbk>پس گرفتن برگشت</button></div></div>`).join(''):'')
    +(P.length>1?`<button type="button" class="pdall" id="pdAll">کپی همه برای سندپرداز (${fa(P.length)} قلم)</button>`:''); }
function wkFrom(){ try{ const d=new Date(Date.now()-6*864e5), p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d), g=t=>p.find(x=>x.type===t).value; return g('year')+'/'+g('month')+'/'+g('day'); }catch(e){ return ''; } }
function daysAgo(s){ try{ const a=okDate(s); if(!a) return ''; const p=x=>(x.y-1)*365+Math.floor((x.y-1)*8/33)+(x.m<=6?(x.m-1)*31:186+(x.m-7)*30)+x.d; return Math.max(0,p(okDate(todayKey()))-p(a)); }catch(e){ return ''; } }
/* ---- ثبت‌های من ---- */
function mnDraw(){ const card=$('mnCard'); if(!card) return; const who=me(); const show=canW() && (keeper() || (who && outRows.some(r=>r.by===who && r.src==='q'))); card.hidden=!show; if(!show) return;
  const L=outRows.filter(r=>r.src==='q' && (!who || r.by===who)).slice().sort((a,b)=>(String(b.date)+(b.at||'')).localeCompare(String(a.date)+(a.at||''))).slice(0,20);
  $('mnList').innerHTML=L.length?L.map(r=>{ const st=r.back?`<span class="pill r">برگشت: ${esc(r.back.t||'')}</span>`:(String(r.doc||'').trim()?`<span class="pill g">سند ${esc(fa(r.doc))}</span>`:(r.svc?'<span class="pill n">سرویس</span>':(r.rep?'<span class="pill n">نت</span>':'<span class="pill">منتظر سندپرداز</span>')));
    const ed=!String(r.doc||'').trim(); return `<div class="mn" data-id="${esc(r.id)}"><div class="tx">${esc(r.item||'')} — ${esc(fa(r.qty||''))} ${esc(uOf(r))}<small>${esc(r.dev||'')}، ${esc(fa(r.date||''))}</small>${ed?`<div class="ac"><button type="button" data-ed>${r.back?'اصلاح و فرستادن دوباره':'اصلاح'}</button><button type="button" class="del" data-del>حذف</button></div>`:''}</div>${st}</div>`; }).join(''):'<p class="sub">هنوز مصرفی ثبت نکرده‌اید.</p>';
  $('mnList').querySelectorAll('[data-del]').forEach(b=>armButton(b,'حذف','دوباره بزنید',()=>{ const id=b.closest('[data-id]').dataset.id; const k=outRows.findIndex(r=>r.id===id); if(k>-1) outRows.splice(k,1); render(); say('حذف شد'); },5000)); }
function flowDraw(){ try{ devChips(); }catch(e){} try{ pdDraw(); }catch(e){} try{ mnDraw(); }catch(e){} try{ stAtDraw(); }catch(e){}
  const q=$('qkCard'); if(q) q.hidden=!canW(); }
window.anFlowDraw=flowDraw;
/* ---- رویدادها ---- */
$('qDate').value=todayKey(); $('qDate').addEventListener('input',()=>{ try{ maskDate($('qDate')); }catch(e){} });
$('qDevs').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; if(b.hasAttribute('data-more')){ $('qDevs').dataset.more=$('qDevs').dataset.more==='1'?'':'1'; devChips(); return; } setDev(b.dataset.dv); });
$('qDev').addEventListener('input',()=>{ qDev=$('qDev').value; devChips(); });
$('qItem').addEventListener('input',sugDraw);
$('qItem').addEventListener('keydown',e=>{ if(e.key==='Enter'){ const L=$('qSug')._L||[]; if(L.length){ e.preventDefault(); pickItem(L[0]); try{ $('qQty').focus(); }catch(x){} } } });
$('qSug').addEventListener('click',e=>{ const b=e.target.closest('button[data-i]'); if(!b) return; const L=$('qSug')._L||[]; const x=L[+b.dataset.i]; if(x){ pickItem(x); try{ $('qQty').focus(); }catch(z){} } });
$('qQty').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); qSave(); } });
$('qTyp').addEventListener('click',e=>{ const b=e.target.closest('button[data-t]'); if(!b) return; qTyp=b.dataset.t; typSync(); });
$('qGo').addEventListener('click',qSave);
$('qCancel').addEventListener('click',()=>{ qReset(); qMsg(''); });
$('mnList').addEventListener('click',e=>{ const b=e.target.closest('[data-ed]'); if(!b) return; const r=outRows.find(x=>x.id===b.closest('[data-id]').dataset.id); if(r) qLoad(r); });
$('pdList').addEventListener('click',async e=>{ const b=e.target.closest('button'); if(!b) return;
  if(b.id==='pdAll'){ const P=outRows.filter(r=>anPend(r)&&!r.back); const ok=await copyAll(P.map(line).join('\n')); say(ok?fa(P.length)+' قلم کپی شد — در سندپرداز ثبت کنید':'کپی نشد',!ok); return; }
  const c=b.closest('[data-id]'); if(!c) return; const r=outRows.find(x=>x.id===c.dataset.id); if(!r) return;
  if(b.hasAttribute('data-cp')){ const ok=await copyAll(line(r)); say(ok?'کپی شد — در سندپرداز بچسبانید':'کپی نشد',!ok); return; }
  if(b.hasAttribute('data-ok')){ const v=lat(c.querySelector('[data-doc]').value).replace(/[^\d]/g,''); if(!v){ say('شماره سند را بنویسید',true); c.querySelector('[data-doc]').focus(); return; }
    r.doc=v; r.docAt=todayKey(); const w=me(); if(w) r.docBy=w; render(); say('سند '+fa(v)+' ثبت شد: '+r.item); return; }
  if(b.hasAttribute('data-bk')){ bkOpen=bkOpen===r.id?'':r.id; pdDraw(); const i=document.querySelector(`.pd[data-id="${CSS.escape(r.id)}"] [data-bkt]`); if(i) try{ i.focus(); }catch(x){} return; }
  if(b.hasAttribute('data-bks')){ const tx=String(c.querySelector('[data-bkt]').value||'').trim().slice(0,120); if(!tx){ say('بنویسید چه چیزی را درست کند',true); return; } r.back={t:tx,d:todayKey(),by:me()}; bkOpen=''; render(); say('به انباردار برگشت'); return; }
  if(b.hasAttribute('data-unbk')){ delete r.back; render(); return; } });
$('pdList').addEventListener('keydown',e=>{ const i=e.target.closest('[data-doc]'); if(i && e.key==='Enter'){ e.preventDefault(); const ok=i.closest('.pd').querySelector('[data-ok]'); if(ok) ok.click(); } });
/* ---- بارگذاری فایل موجودی سندپرداز (همان قاعده برنامه هفتگی انبار) ---- */
const MOVED={'40240034':'966651','40370067':'967281'};
const cKey=c=>{ const k=lat(String(c||'')).replace(/\D/g,'').replace(/^0+/,''); return MOVED[k]||k; };
const hk=h=>norm(lat(h)).replace(/[\s‌()]/g,'');
function stAtDraw(){ const so=stockObj(), el=$('stAt'); if(!el) return; el.textContent=so?'موجودی سندپرداز: '+fa(so.at||'')+'، '+fa(Object.keys(so.items).length)+' کالا':'هنوز فایلی بارگذاری نشده'; $('stUp').hidden=!canW(); }
$('stUp').addEventListener('click',()=>$('stFile').click());
$('stFile').addEventListener('change',async()=>{ const f=$('stFile').files&&$('stFile').files[0]; $('stFile').value=''; if(!f||!canW()) return; say('در حال خواندن…');
  try{ const A=await parent.ntReport.readAoa(await f.arrayBuffer()); let hi=-1, ix={};
    for(let r=0;r<Math.min(A.length,20)&&hi<0;r++){ const H=(A[r]||[]).map(hk); const c=H.findIndex(h=>/کد?کالا/.test(h)&&/^کد/.test(h)), q=H.findIndex(h=>/موجودی/.test(h)&&/اصلی/.test(h)); if(c>-1&&q>-1){ hi=r; ix={c,q,n:H.findIndex(h=>/^نامکالا/.test(h)),u:H.findIndex(h=>/^واحداصلی/.test(h))}; } }
    if(hi<0) throw new Error('head');
    const items={}, cl=(v,n)=>String(v==null?'':v).replace(/[<>"]/g,'').replace(/\s+/g,' ').trim().slice(0,n);
    A.slice(hi+1).forEach(r=>{ if(!r) return; const c=cKey(r[ix.c]); if(!c) return; const q=parseFloat(lat(String(r[ix.q]==null?'0':r[ix.q])).replace(/[^\d.\-]/g,''))||0;
      const o=items[c]||{n:cl(ix.n>-1?r[ix.n]:'',80),q:0,u:cl(ix.u>-1?r[ix.u]:'',15)}; o.q=Math.round((o.q+q)*100)/100; items[c]=o; });
    if(!Object.keys(items).length) throw new Error('empty');
    localStorage.setItem('nt_stock_v1',JSON.stringify({at:todayKey(),items}));
    CAT=null; stAtDraw(); say(fa(Object.keys(items).length)+' کالا خوانده شد؛ فهرست کالای «ثبت مصرف» به‌روز شد'); }
  catch(e){ say(e&&e.message==='head'?'ستون «کد کالا» و «موجودی واحد اصلی» پیدا نشد؛ خروجی «موجودی کالا» سندپرداز را بدهید':'فایل خوانده نشد (برای بار اول اینترنت لازم است)',true); } });
window.addEventListener('storage',e=>{ if(e.key==='nt_stock_v1'){ CAT=null; stAtDraw(); } });
flowDraw();
})();
"""
k=t.rfind("</script></body></html>"); assert k>0
t=t[:k]+JS+t[k:]
# بعد از هر رسم لیست
rep("  stockRender();\n  save();\n}","  stockRender();\n  save();\n  try{ if(window.anFlowDraw) window.anFlowDraw(); }catch(e){}\n}")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')

# امروز: نیاز به توجه
d2=next(x for x in docs if x['name']=='امروز')
t2=base64.b64decode(d2['b64']).decode('utf-8')
a="  try{ svRows().forEach(r=>R.push(r)); }catch(e){}"
assert t2.count(a)==1
t2=t2.replace(a,a+r"""
  try{ const cs=n=>{ try{ return !parent.ntSync || parent.ntSync.canSee(n); }catch(e){ return true; } }; const A=LS('nt_anbar_sum_v1')||{};
    if(cs('انبار') && A.pend) R.push({c:A.old?'r':'w',t:fa(A.pend)+' مصرف انبار منتظر سندپرداز',s:(A.old?fa(A.old)+' مورد از روزهای قبل — ':'')+String(A.first||'').slice(0,40),go:'انبار'});
    if(cs('انبار') && A.back) R.push({c:'w',t:fa(A.back)+' مصرف برگشت‌خورده',s:'منتظر اصلاح انباردار',go:'انبار'}); }catch(e){}""")
d2['b64']=base64.b64encode(t2.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('anbar flow')
