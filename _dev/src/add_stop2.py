# طرح تازه — مرحله ۳: «توقف شیفت»
# ۱) کارت خلاصه: دستگاه‌های متوقف، مجموع توقف (ساعت:دقیقه، با توقف‌های باز تا این لحظه)، و تعداد خراب / منتظر / سرویس.
# ۲) کارت هر توقف: آیکون رنگی (خراب، منتظر، سرویس، راه‌افتاده)، نام + وضعیت، علت · توضیح · ثبت‌کننده، ساعت توقف درشت کنار؛
#    توقف‌های باز اول؛ زمان توقف باز هر دقیقه تازه می‌شود.
# ۳) گوشی: عنوان تکراری صفحه پنهان؛ دکمه «ثبت توقف» پایین پنهان (همان دکمه «+» وسط)؛ «ارسال گزارش» تمام عرض.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='توقف شیفت')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:80],t.count(a)); t=t.replace(a,b)
a0=t.index("  $('sum').innerHTML = S.length"); a1=t.index("  document.querySelectorAll('[data-run]')",a0)
t=t[:a0]+r"""  const K2=s=>stCls(s), nowM=new Date(), openM=s=>{ const f=mins(s.from); if(f===null) return null; const d0=new Date(gDate); d0.setHours(Math.floor(f/60),f%60,0,0); const m=Math.round((nowM-d0)/60000); return m>=0?m:null; };
  const mOf=s=>s.to?dur(s.from,s.to):openM(s), tot2=S.reduce((a,s)=>a+(mOf(s)||0),0), open2=S.filter(s=>!s.to);
  const nb=open2.filter(s=>K2(s)==='bad').length, nw=open2.filter(s=>K2(s)==='wa').length, ns=open2.filter(s=>K2(s)==='svc').length;
  $('sum').innerHTML = (S.length||R.sent) ? `<div class="sc"><div class="sc1"><div><span>دستگاه‌های متوقف</span><b>${fa(open2.length)}</b></div><div><span>مجموع توقف</span><b class="num">${fa(durHM(tot2))}</b></div></div>
      <div class="sc2">${nb?`<span class="sp bad">${ST_I.bad} خراب ${fa(nb)}</span>`:''}${nw?`<span class="sp wa">${ST_I.wa} منتظر ${fa(nw)}</span>`:''}${ns?`<span class="sp svc">${ST_I.svc} سرویس ${fa(ns)}</span>`:''}${S.length-open2.length?`<span class="sp ok">${ST_I.ok} راه افتاد ${fa(S.length-open2.length)}</span>`:''}${R.sent?`<span class="sp sent">ارسال شد</span>`:''}</div></div>` : '';
  const L=S.slice().sort((a,b)=>(a.to?1:0)-(b.to?1:0) || ({bad:0,wa:1,svc:2}[K2(a)]-{bad:0,wa:1,svc:2}[K2(b)]) || String(a.from).localeCompare(String(b.from)));
  $('list').innerHTML = S.length ? L.map(s=>{
    const k=s.to?'ok':K2(s), m=mOf(s);
    return `<article class="st2 k-${k}${s.to?'':' open'}">
      <div class="r1"><span class="ic">${ST_I[k]}</span>
        <div class="tx"><h3><bdi>${esc(s.dev)}</bdi></h3><em class="w">${ST_W[k]}</em>
          <div class="why">${esc(s.cause)}${s.note?' · '+esc(s.note):''}${s.by?' · ثبت: '+esc(s.by):''}</div>
          <div class="tm num">${s.to?`${fa(s.from)} تا ${fa(s.to)}${mins(s.to)<mins(s.from)?' (روز بعد)':''}`:`از ساعت ${fa(s.from)} — هنوز متوقف`}</div></div>
        <div class="du num"><b>${m===null?'—':fa(durHM(m))}</b><span>ساعت</span></div></div>
      <div class="acts">
        ${s.to?'':`<button type="button" class="bt go" data-run="${s.id}">راه افتاد</button>`}
        <button type="button" class="bt" data-ed="${s.id}">ویرایش</button>
        <button type="button" class="bt del" data-del="${s.id}">حذف</button>
      </div></article>`; }).join('')
    : `<div class="empty"><b>هنوز توقفی ثبت نشده</b>اگر دستگاهی ایستاد، «+» پایین صفحه (یا «ثبت توقف») را بزنید.<br>اگر شیفت بدون توقف بود، «ارسال گزارش» را بزنید.</div>`;
"""+t[a1:]
JS=r"""
/* ===== طرح تازه توقف (add_stop2) ===== */
function stCls(s){ let c='idle'; try{ c=parent.ntStops.clsOf(s.cause); }catch(e){ c=/خرابی|زنجیر|پاکت/.test(s.cause||'')?'em':'idle'; } return c==='em'?'bad':(c==='pm'?'svc':'wa'); }
const ST_W={bad:'خراب',wa:'منتظر',svc:'در سرویس',ok:'راه افتاد'};
const ST_I={bad:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 7v6M12 16.5h.01" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
  wa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  svc:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="currentColor"/></svg>',
  ok:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
setInterval(()=>{ try{ if(document.visibilityState==='visible' && rec().stops.some(s=>!s.to) && !document.querySelector('.sheet.on,.sheet[open]')) render(); }catch(e){} },60000);
"""
k=t.index("<script>")+8; t=t[:k]+JS+"\n"+t[k:]   # پیش از اولین render
CSS="""
/* ===== طرح تازه توقف (add_stop2) ===== */
.sum:has(.sc){display:block!important}
.sc{background:#fff;border:1px solid #D5DCE3;border-radius:16px;padding:12px 14px;margin:6px 0 10px;box-shadow:0 1px 2px rgba(27,36,48,.05)}
.sc1{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sc1 span{display:block;font-size:.8rem;color:#51606E;font-weight:700}
.sc1 b{display:block;font-size:2rem;font-weight:900;line-height:1.2;color:#17212B}
.sc2{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.sp{display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:0 12px;border-radius:17px;font-size:.84rem;font-weight:800}
.sp svg{width:16px;height:16px}
.sp.bad svg path{stroke:#C62828}.sp.ok svg path{stroke:#E4F2EA}.sp.ok svg circle{fill:#17663F}
.sp.bad{background:#C62828;color:#fff}.sp.wa{background:#E6A52E;color:#1B2430}.sp.svc{background:#1F5F99;color:#fff}.sp.ok{background:#E4F2EA;color:#17663F}.sp.sent{background:#E4F2EA;color:#17663F}
.st2{background:#fff;border:1px solid #D5DCE3;border-radius:16px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 2px rgba(27,36,48,.05)}
.st2.open.k-bad{border-color:#E8A9A9}.st2.open.k-wa{border-color:#EBCB8B}
.st2 .r1{display:flex;gap:12px;align-items:flex-start}
.st2 .ic{flex:none;width:44px;height:44px;border-radius:12px;display:grid;place-items:center}
.st2 .ic svg{width:26px;height:26px}
.st2.k-bad .ic{background:#C62828;color:#fff}.st2.k-bad .ic svg circle{fill:#fff}.st2.k-bad .ic svg path{stroke:#C62828}
.st2.k-wa .ic{background:#E6A52E;color:#1B2430}
.st2.k-svc .ic{background:#1F5F99;color:#fff}
.st2.k-ok .ic{background:#E4F2EA;color:#17663F}
.st2 .tx{flex:1;min-width:0}
.st2 h3{display:inline;margin:0;font-size:1.02rem;font-weight:800}
.st2 em.w{font-style:normal;font-size:.8rem;font-weight:800;margin-inline-start:6px}
.st2.k-bad em.w{color:#C62828}.st2.k-wa em.w{color:#8A5A12}.st2.k-svc em.w{color:#1F5F99}.st2.k-ok em.w{color:#17663F}
.st2 .why{font-size:.86rem;color:#2B3846;margin-top:2px}
.st2 .tm{font-size:.78rem;color:#5B6874;margin-top:2px}
.st2 .du{flex:none;text-align:center;min-width:58px}
.st2 .du b{display:block;font-size:1.35rem;font-weight:900;line-height:1.2;color:#17212B}
.st2.k-bad.open .du b{color:#C62828}
.st2 .du span{font-size:.72rem;color:#5B6874}
.st2 .acts{display:flex;gap:8px;margin-top:10px}
.st2 .acts .bt{flex:1;min-height:44px}
.st2 .acts .bt.go{flex:1.6;background:#17663F;border-color:#17663F}
.st2.k-ok{opacity:.92}
@media (max-width:899px){
  body>header{display:none!important}
  .obar #bNew{display:none!important}
  .obar #bSend{flex:1}
}
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('stop2')
