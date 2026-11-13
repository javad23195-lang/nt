# دفترچه قرائت: کنترل قرائت. هشدار زنده زیر هر دستگاه اگر:
#   - عدد از قرائت قبلی کمتر باشد، یا از قرائت بعدی (تاریخ جلوتر) بیشتر باشد،
#   - افزایش در روز بیشتر از حد باشد (ساعت: ۲۴ در روز، کیلومتر: ۱۰۰۰ در روز).
# ذخیره قرائت مشکوک: بار اول «مطمئنید؟ دوباره بزنید»، بار دوم ذخیره (مثلاً کنتور عوض شده).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d['b64']).decode('utf-8')
JS=r"""
/* ---------- کنترل قرائت ---------- */
const RCHK_MAX={'ساعت':24,'کیلومتر':1000};
/** پیام هشدار برای یک قرائت، یا '' */
function rCheck(dev,val){
  if(val===''||val===undefined||val===null||isNaN(+val)) return '';
  const v=+val, dt=normDate($('fDate').value); if(!dt) return '';
  const m=DATA.d.find(x=>x.dev===dev); if(!m) return '';
  const prev=lastOf(dev,dt), base=prev?prev.val:(m.cur===''?null:Number(m.cur)), bDate=prev?prev.date:m.date;
  const nxt=forDev(dev).find(x=>x.date>dt);
  if(base!==null && v<base) return `کمتر از قرائت قبلی است (${faN(base)} در ${fa(bDate||'—')}). اشتباه تایپی است؟`;
  if(nxt && v>nxt.val) return `بیشتر از قرائت بعدی است (${faN(nxt.val)} در ${fa(nxt.date)}).`;
  const mx=RCHK_MAX[m.unit];
  if(mx && base!==null){
    let days=1; try{ const a=ntSvc.dn(dt), b=ntSvc.dn(bDate); if(a!==null&&b!==null) days=Math.max(1,a-b); }catch(e){}
    const inc=v-base;
    if(inc>mx*days) return `+${faN(inc)} ${m.unit} در ${fa(days)} روز — بیشتر از ${faN(mx)} ${m.unit} در روز. اشتباه تایپی است؟`;
  }
  return '';
}
function rShow(card,dev,val){
  if(!card) return '';
  const msg=rCheck(dev,val); let w=card.querySelector('.rchk');
  if(!msg){ if(w) w.remove(); card.classList.remove('rbad'); return ''; }
  if(!w){ w=document.createElement('div'); w.className='rchk'; w.setAttribute('role','alert'); const l=card.querySelector('.last'); (l||card).insertAdjacentElement('afterend',w); }
  w.textContent='⚠ '+msg; card.classList.add('rbad'); return msg;
}
function rAll(){ document.querySelectorAll('#list input.rv').forEach(el=>{ const dev=el.dataset.dev; if(draft[dev]!==undefined) rShow(el.closest('.dev'),dev,el.value); }); }
{ const _rf=refresh; refresh=function(el){ _rf.apply(this,arguments); try{ rShow(el.closest('.dev'),el.dataset.dev,el.value); }catch(e){} }; }
let rArm=null, rArmT=0;
function rGuard(key,btn,msgs,e){
  if(!msgs.length){ rArm=null; return; }
  if(rArm===key && Date.now()<rArmT) { rArm=null; return; }
  e.preventDefault(); e.stopImmediatePropagation();
  rArm=key; rArmT=Date.now()+6000;
  say(msgs.length>1?`${fa(msgs.length)} قرائت مشکوک است. اگر درست است، دوباره «ذخیره» را بزنید`:'قرائت مشکوک است. اگر درست است، دوباره «ذخیره» را بزنید',true);
  const card=btn.closest('.dev'); const w=card&&card.querySelector('.rchk'); if(w){ w.classList.add('pulse'); setTimeout(()=>w.classList.remove('pulse'),900); }
  else { const f=document.querySelector('#list .dev.rbad'); if(f) f.scrollIntoView({block:'center',behavior:'smooth'}); }
}
{ const _bd=bind; bind=function(){ _bd.apply(this,arguments);
  document.querySelectorAll('#list .sv').forEach(b=>b.addEventListener('click',e=>{
    const dev=b.dataset.dev, v=draft[dev]; const msg=v===undefined?'':rShow(b.closest('.dev'),dev,v);
    rGuard('one:'+dev+':'+v,b,msg?[msg]:[],e); },true));
  try{ rAll(); }catch(e){} }; }
$('bSave').addEventListener('click',e=>{
  const msgs=[]; for(const dev in draft){ const card=[...document.querySelectorAll('#list input.rv')].find(x=>x.dataset.dev===dev);
    const msg=card?rShow(card.closest('.dev'),dev,draft[dev]):rCheck(dev,draft[dev]); if(msg) msgs.push(msg); }
  rGuard('all:'+JSON.stringify(draft),$('bSave'),msgs,e); },true);
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""
.rchk{margin-top:8px;padding:8px 10px;border-radius:10px;background:#FFF1D6;border:1px solid #E0A75E;color:#5C3300;font-size:.84rem;font-weight:700;line-height:1.6}
.rchk.pulse{background:#FBE5E2;border-color:#B3261E;color:#7A1A12}
.dev.rbad .rv{border-color:#B98700!important;background:#FFFBF0}
body.fast .dev .rchk{grid-column:1/-1;margin:4px 0 2px;font-size:.78rem;padding:5px 8px}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('df check')
