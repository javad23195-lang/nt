# شناسنامه: «هزینه ماهانه دستگاه‌ها» — جمع اجرت و خرید هر دستگاه در یک ماه (ماه = تاریخ ارسال). قاعده در cost.js (مشترک با ربات).
import json,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='شناسنامه')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
CJ=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'cost.js'),encoding='utf-8').read()
assert '</script' not in CJ
rep('    <div class="slips" id="slips"></div>','''    <button type="button" class="btn btn-ghost" id="cmBtn" aria-expanded="false" style="width:100%;min-height:44px;margin-bottom:10px">هزینه ماهانه دستگاه‌ها</button>
    <div id="cmBox" hidden>
      <div class="cmhd"><button type="button" id="cmPrev" aria-label="ماه قبل">›</button><b id="cmTitle"></b><button type="button" id="cmNext" aria-label="ماه بعد">‹</button></div>
      <div id="cmSum" class="cmsum"></div><div id="cmList"></div>
      <div class="fhint">ماه هر تعمیر از «تاریخ ارسال» حساب می‌شود. فقط ردیف‌هایی که در این لیست هستند شمرده می‌شوند.</div>
    </div>
    <div class="slips" id="slips"></div>''')
JS=CJ+r"""
/* ---------- هزینه ماهانه دستگاه‌ها ---------- */
let cmY=0, cmM=0;
(function(){ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric'}).formatToParts(new Date());
  cmY=+p.find(x=>x.type==='year').value; cmM=+p.find(x=>x.type==='month').value; }catch(e){ cmY=1405; cmM=1; } })();
function cmRender(){
  if($('cmBox').hidden) return;
  const R=ntCost.month(rows,cmY,cmM);
  $('cmTitle').textContent=(DATA.months[cmM-1]||'')+' '+fa(cmY);
  $('cmSum').innerHTML=R.sum?`جمع <b class="mono">${faNum(R.sum)}</b> ریال — اجرت ${faNum(R.a)}، خرید ${faNum(R.k)} · ${fa(R.n)} فاکتور`:'در این ماه هزینه‌ای ثبت نشده است.';
  $('cmList').innerHTML=R.devs.map((x,k)=>`<div class="cmr"><span class="cmn">${fa(k+1)}.</span><span class="cmd">${esc(x.dev)}</span><span class="mono cmv">${faNum(x.sum)}</span><span class="cmf">${fa(x.n)} فاکتور</span>
    <span class="cmb"><i style="width:${R.devs[0].sum?Math.max(2,Math.round(x.sum/R.devs[0].sum*100)):0}%"></i></span></div>`).join('');
}
$('cmBtn').addEventListener('click',()=>{ const b=$('cmBox'); b.hidden=!b.hidden; $('cmBtn').setAttribute('aria-expanded',String(!b.hidden)); cmRender(); });
$('cmPrev').addEventListener('click',()=>{ cmM--; if(cmM<1){ cmM=12; cmY--; } cmRender(); });
$('cmNext').addEventListener('click',()=>{ cmM++; if(cmM>12){ cmM=1; cmY++; } cmRender(); });
{ const _rc=render; render=function(){ _rc.apply(this,arguments); try{ cmRender(); }catch(e){} }; }
"""
rep("armButton($('bClear'),",JS+"\narmButton($('bClear'),")
CSS="""#cmBox{border:1px solid var(--rule);border-radius:10px;background:#fff;padding:10px 12px;margin-bottom:12px}
.cmhd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.cmhd b{font-size:1rem}
.cmhd button{min-width:44px;min-height:44px;border:1px solid #C3CDD5;border-radius:8px;background:#fff;font-size:1.2rem;cursor:pointer}
.cmsum{font-size:.85rem;color:#3D4852;margin-bottom:8px}
.cmr{display:grid;grid-template-columns:auto 1fr auto;gap:2px 8px;align-items:center;padding:6px 0;border-top:1px solid #EEF1F4;font-size:.85rem}
.cmr .cmn{color:#5A6772}.cmr .cmv{font-weight:700}
.cmr .cmf{grid-column:2;color:#5A6772;font-size:.78rem}
.cmr .cmb{grid-column:2/-1;height:6px;background:#EEF1F4;border-radius:3px;overflow:hidden}
.cmr .cmb i{display:block;height:100%;background:#8A6100}
"""
k0=t.find("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh cost')
