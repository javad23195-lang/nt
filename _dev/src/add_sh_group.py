# شناسنامه: هر تعمیر یک کارت؛ همه فاکتورهای آن (ردیف اصلی + ردیف‌های «فاکتور دیگر») داخل همان کارت.
# اکسل تغییر نمی‌کند. ویرایش: همه فاکتورها در فرم باز می‌شوند و هنگام ذخیره ردیف‌های قبلی جایگزین می‌شوند.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='شناسنامه')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)

# ویرایش: فاکتورهای دیگرِ زیر ردیف هم در فرم
rep("  xinv=L; xRender();\n}","""  try{ if(editIdx!==null){ const r0=rows[editIdx];
    for(let q=editIdx+1;q<rows.length&&rows[q].xof&&rows[q].dev===r0.dev&&rows[q].reg===r0.reg;q++){ const r=rows[q];
      if(r.hasA) L.push({t:'A',desc:r.desc||'',who:r.rep||'',cost:r.costA||'',pay:r.payA||'',doc:r.docA||'',by:r.byA||''});
      else if(r.hasK) L.push({t:'K',desc:r.part==='**'?'':(r.part||''),who:r.sup||'',cost:r.costK||'',pay:r.payK||'',doc:r.docK||'',by:r.byK||''}); } } }catch(e){}
  xinv=L; xRender();
}""")
# شماره‌گذاری: دیگر لازم نیست فاکتورهای قبلی جدا شمرده شوند
rep("return main.length+(typeof xAfter==='function'?xAfter():0)+e+1; }","return main.length+e+1; }")
rep("function xBase(){ let b=0; try{ b=($('onAjr').checked?1:0)+($('onKhr').checked?1:0)+xAfter(); }catch(e){} return b; }",
    "function xBase(){ let b=0; try{ b=($('onAjr').checked?1:0)+($('onKhr').checked?1:0); }catch(e){} return b; }")
# ذخیره ویرایش: ردیف‌های قبلی «فاکتور دیگر» حذف و از فرم دوباره ساخته می‌شوند
rep("if(editIdx!==null){ const n=editIdx+1; rows[editIdx]=rec; const _xe=xPush(rec,editIdx+1+xAfter()); stopEdit(); clearForm(); render(); if(_xe) setTimeout(()=>say(fa(_xe)+' فاکتور دیگر زیر همین ردیف اضافه شد'),300);",
    "if(editIdx!==null){ const n=editIdx+1; const _na=xAfter(); rows.splice(editIdx+1,_na); rows[editIdx]=rec; const _xe=xPush(rec,editIdx+1); rows.forEach((r,k)=>{ r.__i=k; }); stopEdit(); clearForm(); render();")

JS=r"""
/* ---------- نمایش: هر تعمیر یک کارت ---------- */
function shGroups(){
  const G=[]; let k=0;
  while(k<rows.length){ const r0=rows[k]; let n=1;
    if(!r0.xof) while(k+n<rows.length&&rows[k+n].xof&&rows[k+n].dev===r0.dev&&rows[k+n].reg===r0.reg) n++;
    G.push({i:k,n}); k+=n; }
  return G;
}
function shLines(g){
  const L=[];
  for(let q=g.i;q<g.i+g.n;q++){ const r=rows[q], m=rows[g.i];
    if(r.hasA){ let x=r.rep||''; if(r.xof&&r.desc&&r.desc!==m.desc) x+=(x?' — ':'')+r.desc; L.push({j:q,t:'A',c:+r.costA||0,x,by:r.byA,del:!!r.xof&&q>g.i}); }
    if(r.hasK){ let x=r.sup||''; if(r.part&&r.part!=='**') x+=(x?' — ':'')+r.part; L.push({j:q,t:'K',c:+r.costK||0,x,by:r.byK,del:!!r.xof&&q>g.i&&!r.hasA}); }
  }
  return L;
}
function shDraw(){
  const box=$('slips'); if(!box||!rows.length) return;
  const G=shGroups();
  box.innerHTML=G.map(g=>{
    const m=rows[g.i], L=shLines(g), tot=L.reduce((a,l)=>a+l.c,0);
    const ed=editIdx!==null&&editIdx>=g.i&&editIdx<g.i+g.n;
    return `<div class="slip grp${ed?' editing':''}">
      <button class="drop" data-g="${g.i}" data-n="${g.n}" title="حذف کل تعمیر">✕</button>
      <button class="edit" data-e="${g.i}" title="ویرایش">✎</button>
      <div class="top"><span class="name">${esc(m.desc)}</span>${tot?`<span class="cost">${faNum(tot)}</span>`:''}</div>
      <div class="meta">
        <span>${esc(m.dev)}</span>
        <span class="mono">ارسال ${esc(m.st)}</span>
        ${m.en&&m.en!==m.st?`<span class="mono">برگشت ${esc(m.en)}</span>`:''}
        <span class="${m.kind==='EM'?'em':'pm'}">${esc(m.kind)}</span>
        ${m.xof?'<span>فاکتور دیگرِ یک تعمیر</span>':''}
      </div>
      ${L.length?`<div class="ginv">${L.map((l,k)=>`<div class="gl">
        <span class="gn">${fa(k+1)}.</span>
        <span class="${l.t==='A'?'aj':'kh'}">${l.t==='A'?'اجرت':'خرید'}</span>
        <span class="mono gc">${faNum(l.c)}</span>
        <span class="gw">${esc(l.x)}${l.by?' · کارت شخصی: '+esc(l.by):''}</span>
        ${l.del?`<button type="button" class="gdel" data-j="${l.j}" aria-label="حذف فاکتور ${fa(k+1)}">✕</button>`:''}
      </div>`).join('')}</div>`:''}
      ${L.length>1?`<div class="gsum">${fa(L.length)} فاکتور · جمع <b class="mono">${faNum(tot)}</b> ریال</div>`:''}
    </div>`;
  }).join('');
  const fix=(at,cnt)=>{ if(editIdx===null) return;
    if(editIdx>=at&&editIdx<at+cnt){ stopEdit(); clearForm(); }
    else if(editIdx>at){ editIdx-=cnt; $('editNo').textContent=fa(editIdx+1); } };
  [...box.querySelectorAll('.drop')].forEach(b=>armButton(b,'✕','حذف کل تعمیر؟',()=>{
    const at=+b.dataset.g, cnt=+b.dataset.n; fix(at,cnt); rows.splice(at,cnt); rows.forEach((r,k)=>{ r.__i=k; }); render(); say(cnt>1?fa(cnt)+' ردیف حذف شد':'حذف شد'); },4000));
  [...box.querySelectorAll('.gdel')].forEach(b=>armButton(b,'✕','حذف؟',()=>{
    const at=+b.dataset.j; fix(at,1); rows.splice(at,1); rows.forEach((r,k)=>{ r.__i=k; }); render(); say('فاکتور حذف شد'); },4000));
  [...box.querySelectorAll('.edit')].forEach(b=>b.addEventListener('click',()=>beginEdit(+b.dataset.e)));
}
{ const _rd=render; render=function(){ _rd.apply(this,arguments); try{ shDraw(); }catch(e){ console.error(e); } }; }
"""
rep("armButton($('bClear'),",JS+"\narmButton($('bClear'),")
CSS=""".slip.grp .ginv{margin-top:8px;border-top:1px dashed var(--rule);padding-top:6px;display:flex;flex-direction:column;gap:2px}
.slip.grp .gl{display:flex;align-items:center;gap:8px;font-size:.8rem;min-height:30px;flex-wrap:wrap}
.slip.grp .gn{color:#5A6772;min-width:1.2em}
.slip.grp .gc{font-weight:700}
.slip.grp .gw{flex:1 1 140px;color:#3D4852}
.slip.grp .gdel{background:none;border:1px solid #D5DCE2;border-radius:8px;color:#A32018;min-width:44px;min-height:36px;cursor:pointer;font:inherit}
.slip.grp .gdel.armed{background:#C0392B;color:#fff;border-color:#C0392B;font-weight:800}
.slip.grp .gsum{margin-top:6px;font-size:.8rem;color:#3D4852;text-align:left}
"""
k0=t.find("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh group')
