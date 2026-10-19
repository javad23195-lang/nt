# درخواست خرید: ردیف تکراری بعد از هم‌زمانی.
# علت: ردیف‌ها شناسه نداشتند؛ اگر دو سیستم همان ردیف را جدا اصلاح کنند، ادغام هر دو نسخه را نگه می‌داشت.
# ۱) هر ردیف شناسه (id) می‌گیرد: ردیف تازه = اثر متن خودش؛ ردیف قدیمی وقتی اصلاح شود = اثر متن پیش از اصلاح
#    (همان شناسه‌ای که sync.js برای ردیف بدون شناسه حساب می‌کند: ntRowHash). پس ادغام، اصلاح‌ها را روی یک ردیف می‌گذارد.
#    علت دوم: sortByDate شماره ترتیب (__i) را در خود ردیف می‌نوشت و ذخیره/هم‌زمان می‌شد؛ با هر ردیف تازه یا حذف،
#    __i همه ردیف‌های بعدی عوض می‌شد و ادغام آن‌ها را «اصلاح هم‌زمان» می‌دید ← نسخه تکراری. حالا __i نوشته نمی‌شود.
# ۲) نوار «ردیف تکراری» با دکمه «یکی کردن» برای تکراری‌های موجود (همان روز، دستگاه، کالا و تعداد).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='درخواست خرید')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:70],t.count(a)); t=t.replace(a,b)
rep("""  arr.forEach((r,i)=>{ if(r.__i===undefined) r.__i=i; });
  arr.sort((a,b)=> dkey(a)-dkey(b) || a.__i-b.__i );
  arr.forEach((r,i)=>{ r.__i=i; });""","""  arr.sort((a,b)=> dkey(a)-dkey(b));   /* مرتب‌سازی پایدار؛ بدون __i در ردیف */""")
rep("rows[editIdx]=Object.assign({},rows[editIdx],rec);",
    "rows[editIdx]=Object.assign({},rows[editIdx],{id:kIdOf(rows[editIdx])},rec);")
JS=r"""
/* ===== شناسه ردیف و ردیف‌های تکراری (fix_kh_dup) ===== */
function kHash(s){ let h=0x811c9dc5; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return 'h'+(h>>>0).toString(36)+s.length.toString(36); }
const kOrig=new WeakMap();
function kIdOf(r){ return (r&&typeof r.id==='string'&&r.id)||kOrig.get(r)||kHash(JSON.stringify(r)); }
/* اثر هر ردیف همان‌طور که از حافظه خوانده شد (ردیف یکسان: #۲، #۳ … مثل sync.js) */
function kMark(){ const seen={}; rows.forEach(r=>{ if(!r||typeof r!=='object'||r.id) return; let h=kHash(JSON.stringify(r)); seen[h]=(seen[h]||0)+1; if(seen[h]>1) h+='#'+seen[h]; kOrig.set(r,h); }); }
/* پیش از ذخیره: ردیف تازه شناسه می‌گیرد؛ ردیف قدیمیِ اصلاح‌شده شناسه پیش از اصلاح را */
function kIds(){ const used=new Set(rows.map(r=>r&&r.id).filter(Boolean));
  rows.forEach(r=>{ if(!r||typeof r!=='object'||r.id) return; const o=kOrig.get(r);
    if(o){ if(kHash(JSON.stringify(r))!==o.replace(/#\d+$/,'') && !used.has(o)){ r.id=o; used.add(o); } return; }
    let h=kHash(JSON.stringify(r)), n=1, x=h; while(used.has(x)) x=h+'#'+(++n); r.id=x; used.add(x); }); }
kMark(); rows.forEach(r=>{ if(r&&typeof r==='object') delete r.__i; });
{ const _s=save; save=function(){ try{ kIds(); }catch(e){} return _s.apply(this,arguments); }; }

const kDupKey=r=>[String(r.date||''),sq(r.unit),sq(r.item),String(r.qty??'')].join('|');
function kDupGroups(){ const g={}; rows.forEach(r=>{ if(r&&typeof r==='object'){ const k=kDupKey(r); (g[k]=g[k]||[]).push(r); } }); return Object.values(g).filter(a=>a.length>1); }
const kFill=r=>Object.keys(r).filter(k=>k!=='id'&&r[k]!==''&&r[k]!==null&&r[k]!==undefined&&r[k]!==false).length;
/* یکی کردن: ردیفی که بیشتر پر شده می‌ماند؛ خانه‌های خالی آن از نسخه‌های دیگر پر می‌شود */
function kDupMerge(){ let n=0;
  kDupGroups().forEach(a=>{ const keep=a.slice().sort((x,y)=>kFill(y)-kFill(x))[0];
    a.forEach(r=>{ if(r===keep) return; Object.keys(r).forEach(k=>{ const v=keep[k]; if(k!=='id' && (v===''||v===null||v===undefined) && r[k]!==''&&r[k]!==null&&r[k]!==undefined) keep[k]=r[k]; });
      const i=rows.indexOf(r); if(i>-1){ rows.splice(i,1); n++; } }); });
  return n; }
function kDupShow(){ try{
  let bar=$('kDupBar'); const G=kDupGroups(), extra=G.reduce((s,a)=>s+a.length-1,0);
  if(!G.length || !kCanW()){ if(bar) bar.hidden=true; return; }
  if(!bar){ bar=document.createElement('div'); bar.id='kDupBar'; bar.className='kfbar kdup'; bar.setAttribute('role','status');
    const sl=$('slips'); sl.parentNode.insertBefore(bar,sl); }
  bar.hidden=false;
  const names=[...new Set(G.map(a=>a[0].item))].slice(0,3).map(esc).join('، ');
  bar.innerHTML='<span><b>'+fa(extra)+' ردیف تکراری</b> — '+names+(G.length>3?' و …':'')+'</span><button type="button" id="kDupGo">یکی کردن</button>';
  armButton($('kDupGo'),'یکی کردن','تأیید یکی کردن',()=>{ const n=kDupMerge(); render(); say(fa(n)+' ردیف تکراری حذف شد'); });
}catch(e){} }
{ const _r=render; render=function(){ const x=_r.apply(this,arguments); kDupShow(); return x; }; }
kDupShow();
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
k=t.rfind("</style>"); t=t[:k]+"\n.kfbar.kdup{background:#FDECEC;border-color:#D98C8C;color:#6B1A1A}\n.kfbar.kdup button{border-color:#8E2B2B;color:#6B1A1A}\n.kfbar.kdup button.armed{background:#8E2B2B;color:#fff}\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('kh dup')
