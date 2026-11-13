# امروز: یادداشت لغوشده. ✕ → «لغو شد» (کم‌رنگ و خط‌خورده می‌ماند) / «به فردا» / «حذف کامل» (دو بار) / «بازگشت».
# لغوشده = done:true + cx:1 → در معوق‌ها، یادآورها و شمارش‌ها نمی‌آید.
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

rep("let tEdit=null;","""let tEdit=null, tAct=null;
/** کلید روز بعد */
function nextKey(k){ let {y,m,d}=parseKey(k); d++; if(d>MLEN(m)){ d=1; m++; if(m>12){ m=1; y++; } } return mkKey(y,m,d); }""")
rep("""    let meta;
    if(x.done){""","""    if(tAct===i){
      return `<div class="td act" data-i="${i}"><span class="tx">${esc(x.t)}</span>
        <div class="tact">
          ${x.cx?'':`<button type="button" class="ta-c" data-i="${i}">لغو شد</button>`}
          ${(!x.done && (!x.date || x.date<=K))?`<button type="button" class="ta-t" data-i="${i}">به فردا</button>`:''}
          <button type="button" class="ta-d" data-i="${i}">حذف کامل</button>
          <button type="button" class="ta-b">بازگشت</button></div></div>`;
    }
    let meta;
    if(x.done){""")
rep("""    } else if(late){
      meta = `معوق""","""      if(x.cx) meta = 'لغو شد'+(da?' '+esc(da):'');
    } else if(late){
      meta = `معوق""")
rep("""return `<div class="td${x.done?' done':''}${late?' late':''}">""","""return `<div class="td${x.done?' done':''}${x.cx?' cxl':''}${late?' late':''}">""")
rep("if(cb.checked){ if(!t.doneAt) t.doneAt=K; } else t.doneAt='';","if(cb.checked){ if(!t.doneAt) t.doneAt=K; } else { t.doneAt=''; delete t.cx; }")
rep("""  document.querySelectorAll('#tList .x').forEach(b=>armButton(b,'✕','حذف؟',()=>{
    const i=+b.dataset.x;
    todo.splice(i,1);
    if(tEdit===i) tEdit=null; else if(tEdit!==null && tEdit>i) tEdit--;
    tSave(); calRender(); tRender(); head(); say('حذف شد'); },5000));""","""  document.querySelectorAll('#tList .x').forEach(b=>b.addEventListener('click',()=>{ tAct=+b.dataset.x; tEdit=null; tRender();
    const f=document.querySelector('#tList .tact button'); if(f) f.focus(); }));
  const tFin=m=>{ tAct=null; tSave(); calRender(); tRender(); head(); try{ alRender(); }catch(e){} say(m); };
  document.querySelectorAll('#tList .ta-c').forEach(b=>b.addEventListener('click',()=>{ const x=todo[+b.dataset.i]; if(!x) return;
    x.done=true; x.cx=1; x.doneAt=K; tFin('لغو شد. کم‌رنگ می‌ماند تا بدانید چه شد'); }));
  document.querySelectorAll('#tList .ta-t').forEach(b=>b.addEventListener('click',()=>{ const x=todo[+b.dataset.i]; if(!x) return;
    x.date=nextKey(K); delete x.rd; tFin('به فردا رفت'); }));
  document.querySelectorAll('#tList .ta-b').forEach(b=>b.addEventListener('click',()=>{ tAct=null; tRender(); }));
  document.querySelectorAll('#tList .ta-d').forEach(b=>armButton(b,'حذف کامل','دوباره بزنید تا پاک شود',()=>{
    const i=+b.dataset.i; todo.splice(i,1);
    if(tEdit===i) tEdit=null; else if(tEdit!==null && tEdit>i) tEdit--;
    tFin('حذف شد'); },5000));""")
CSS=""".td.cxl .tx{text-decoration:line-through;color:#6B7680}
.td.cxl .dt2,.td.cxl .dt2.ok2{color:#6B7680;font-weight:700}
.td.act{flex-wrap:wrap;background:#F4F6F8}
.td.act .tx{flex:1 0 100%}
.td .tact{display:flex;flex-wrap:wrap;gap:6px;width:100%}
.td .tact button{flex:1 1 auto;min-height:44px;border-radius:8px;border:1px solid #C3CDD5;background:#fff;color:#17212B;font:inherit;font-size:.9rem;font-weight:700;cursor:pointer;padding:0 12px}
.td .tact .ta-c{border-color:#8A959E}
.td .tact .ta-t{border-color:#1F5F99;color:#1F5F99}
.td .tact .ta-d{border-color:#E0A39C;color:#A32018}
.td .tact .ta-d.armed{background:#A32018;color:#fff;border-color:#A32018}
"""
k0=t.find("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('td cancel')
