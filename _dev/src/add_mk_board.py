# ثبت مشکلات: «تابلوی خرابی‌ها» (Kanban) — ستون‌های باز ← در حال اقدام ← منتظر قطعه ← بسته.
# وضعیت تازه «منتظر قطعه»: در اکسل «در حال اقدام» و «نیاز به قطعه = بله» نوشته می‌شود (فهرست اکسل عوض نمی‌شود).
# انتقال به «بسته» تاریخ رفع = امروز. نما (فهرست/تابلو) در ntmk_view (همگام نمی‌شود).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='ثبت مشکلات')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
rep('<option value="بسته">بسته</option>','<option value="منتظر قطعه">منتظر قطعه</option>\n          <option value="بسته">بسته</option>')
rep('<div class="cols">','''<div class="mkvw" role="group" aria-label="نما"><button type="button" id="vwList" aria-pressed="true">فهرست و فرم</button><button type="button" id="vwBoard" aria-pressed="false">تابلوی خرابی‌ها</button></div>
<div class="board" id="board" hidden></div>
<div class="cols">''')
# اکسل: منتظر قطعه → در حال اقدام + نیاز به قطعه
rep("    r.dev, r.sys, r.desc, r.sev, r.cur, r.part,\n    r.fix, F.N, F.O, r.state, r.src].join('\\t');",
    "    r.dev, r.sys, r.desc, r.sev, r.cur, (r.state==='منتظر قطعه'?'بله':r.part),\n    r.fix, F.N, F.O, (r.state==='منتظر قطعه'?'در حال اقدام':r.state), r.src].join('\\t');")
JS=r"""
/* ---------- تابلوی خرابی‌ها ---------- */
const BCOL=[['باز','b-open'],['در حال اقدام','b-act'],['منتظر قطعه','b-part'],['بسته','b-done']];
const BK='ntmk_view'; let bView='list'; try{ bView=localStorage.getItem(BK)||'list'; }catch(e){}
function bDays(r){ try{ const a=normDate(`${r.y}/${r.m}/${r.d}`), b=normDate(TODAY); if(!a||!b) return null;
  const n=x=>(x.y-1)*365+Math.floor((x.y-1)*8/33)+(x.m<=6?(x.m-1)*31:186+(x.m-7)*30)+x.d; return Math.max(0,n(b)-n(a)); }catch(e){ return null; } }
function bState(r){ const s=String(r.state||'باز').trim(); return BCOL.some(c=>c[0]===s)?s:'باز'; }
function bSet(v){ bView=v; try{ localStorage.setItem(BK,v); }catch(e){}
  document.body.classList.toggle('bview',v==='board'); $('vwList').setAttribute('aria-pressed',String(v!=='board')); $('vwBoard').setAttribute('aria-pressed',String(v==='board'));
  $('board').hidden=v!=='board'; if(v==='board') bRender(); }
function bRender(){
  const box=$('board'); if(!box || bView!=='board') return;
  const ix=rows.map((r,i)=>({r,i}));
  box.innerHTML=BCOL.map(([st,cls],ci)=>{
    let L=ix.filter(x=>bState(x.r)===st);
    const all=L.length; if(st==='بسته') L=L.slice(-12).reverse(); else L.sort((a,b)=>(SEVRANK[a.r.sev]??9)-(SEVRANK[b.r.sev]??9)||a.i-b.i);
    return `<section class="bcol ${cls}" aria-label="${esc(st)}"><h3>${esc(st)} <span class="bn">${fa(all)}</span></h3>
      ${L.length?L.map(({r,i})=>{ const dd=bDays(r);
        return `<article class="bcard" data-i="${i}">
          <div class="bt"><b>${esc(r.dev)}</b><span class="sev s${SEVRANK[r.sev]}">${esc(r.sev)}</span></div>
          <div class="bd">${esc(r.desc)}</div>
          <div class="bm"><span>${esc(r.sys)}</span>${r.cur==='خوابیده'?'<span class="down">خوابیده</span>':''}${st==='بسته'?`<span>رفع ${esc(r.fix||'')}</span>`:(dd!==null?`<span class="${dd>7?'late':''}">${dd?fa(dd)+' روز':'امروز'}</span>`:'')}</div>
          <div class="bb">${ci>0?`<button type="button" class="bprev" data-i="${i}" aria-label="برگرداندن به «${esc(BCOL[ci-1][0])}»">›</button>`:''}
            ${ci<BCOL.length-1?`<button type="button" class="bnext" data-i="${i}">${ci===BCOL.length-2?'بسته شد ✓':esc(BCOL[ci+1][0])+' ‹'}</button>`:''}
            <button type="button" class="bed" data-i="${i}" aria-label="ویرایش">✎</button></div>
        </article>`; }).join(''):'<div class="bempty">—</div>'}
      ${st==='بسته'&&all>12?`<div class="bempty">${fa(all-12)} مورد قدیمی‌تر در «فهرست»</div>`:''}
    </section>`; }).join('');
  const move=(i,dir)=>{ const r=rows[i]; if(!r) return; const ci=BCOL.findIndex(c=>c[0]===bState(r)), ni=ci+dir; if(ni<0||ni>=BCOL.length) return;
    r.state=BCOL[ni][0]; if(r.state==='منتظر قطعه') r.part='بله'; if(r.state==='بسته'){ if(!r.fix) r.fix=TODAY; } else r.fix='';
    render(); say(`«${r.dev}» → ${r.state}`); };
  box.querySelectorAll('.bnext').forEach(b=>b.addEventListener('click',()=>move(+b.dataset.i,1)));
  box.querySelectorAll('.bprev').forEach(b=>b.addEventListener('click',()=>move(+b.dataset.i,-1)));
  box.querySelectorAll('.bed').forEach(b=>b.addEventListener('click',()=>{ bSet('list'); beginEdit(+b.dataset.i); }));
}
{ const _rb=render; render=function(){ _rb.apply(this,arguments); try{ bRender(); }catch(e){ console.error(e); } }; }
$('vwList').addEventListener('click',()=>bSet('list'));
$('vwBoard').addEventListener('click',()=>bSet('board'));
{ const xn=$('xNew'); if(xn) xn.addEventListener('click',()=>{ if(bView==='board') bSet('list'); },true); }
setTimeout(()=>bSet(bView),0);
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""
.mkvw{display:flex;gap:4px;margin:14px 0 0;padding:3px;background:#DDE3E9;border-radius:12px;width:max-content;max-width:100%}
.mkvw button{min-height:44px;border:0;border-radius:9px;background:transparent;font:inherit;font-weight:700;color:#3D4852;padding:0 16px;cursor:pointer}
.mkvw button[aria-pressed=true]{background:#fff;color:#17212B;box-shadow:0 1px 3px rgba(0,0,0,.08)}
body.bview .cols{display:none!important}
body.bview .wrap{max-width:1500px!important}
.bcard .sev{flex:none;font-size:.72rem;font-weight:800;border-radius:10px;padding:2px 9px;background:#EEF1F4;color:#3D4852}
.bcard .sev.s0{background:#FBE5E2;color:#A32018}.bcard .sev.s1{background:#FFF1D6;color:#7A4300}
.bcard .bb .bnext{white-space:nowrap}
.board{display:grid;grid-template-columns:repeat(4,minmax(240px,1fr));gap:12px;margin-top:14px;overflow-x:auto;padding-bottom:6px}
.board[hidden]{display:none}
.bcol{background:#EEF1F4;border-radius:14px;padding:10px;min-height:120px;border-top:4px solid #9AA6AF}
.bcol.b-open{border-top-color:#B3261E}.bcol.b-act{border-top-color:#1F5F99}.bcol.b-part{border-top-color:#C98A1B}.bcol.b-done{border-top-color:#1E7F4F}
.bcol h3{margin:2px 4px 10px;font-size:.95rem;display:flex;align-items:center;gap:8px;color:#17212B}
.bcol .bn{min-width:24px;height:24px;border-radius:12px;background:#fff;display:inline-grid;place-items:center;font-size:.78rem;padding:0 7px;color:#3D4852}
.bcard{background:#fff;border:1px solid #DDE3E9;border-radius:12px;padding:10px 12px;margin-bottom:8px;box-shadow:0 1px 2px rgba(27,36,48,.05)}
.bcard .bt{display:flex;justify-content:space-between;align-items:center;gap:8px}
.bcard .bt b{font-size:.92rem;color:#17212B}
.bcard .bd{font-size:.86rem;color:#3D4852;margin:6px 0;line-height:1.6;overflow-wrap:anywhere}
.bcard .bm{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:.76rem;color:#51606E}
.bcard .bm .late{color:#A32018;font-weight:700}.bcard .bm .down{color:#A32018;font-weight:700}
.bcard .bb{display:flex;gap:6px;margin-top:8px}
.bcard .bb button{min-height:40px;border-radius:8px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-size:.82rem;font-weight:700;cursor:pointer;color:#17212B;padding:0 10px}
.bcard .bb .bnext{flex:1;border-color:#0B5C7A;color:#0B5C7A}
.b-part .bcard .bb .bnext{border-color:#1E7F4F;color:#1E7F4F}
.bcard .bb .bprev,.bcard .bb .bed{min-width:44px}
.bempty{color:#8A959E;text-align:center;font-size:.85rem;padding:10px 0}
@media (max-width:700px){ .board{grid-template-columns:repeat(4,86%);scroll-snap-type:x mandatory} .bcol{scroll-snap-align:start} }
@media (prefers-reduced-motion:no-preference){ .bcard{animation:bIn .2s ease-out} @keyframes bIn{from{opacity:.4;transform:scale(.98)}to{opacity:1;transform:none}} }
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('mk board')
