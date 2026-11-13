# انبار، خروج: کالای بدون کد کاتالوگ — کنار «کد کالا» کادر «واحد». واحد مثل کد در nt_anbar_codes_v1 (u) می‌ماند و همگام می‌شود؛
# در نمایش تعداد و در ستون I اکسل (به جای فرمول کاتالوگ که برای کد تازه خالی است) می‌آید.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='انبار')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:70],t.count(a)); t=t.replace(a,b)
rep("""  if(v){ m[k]={c:v, d:String(name).trim()}; memSuggest(m[k]); }
  else{ delete m[k];""","""  const u0=m[k]&&m[k].u;
  if(v){ m[k]={c:v, d:String(name).trim()}; if(u0) m[k].u=u0; memSuggest(m[k]); }
  else{ if(u0) m[k]={d:String(name).trim(),u:u0}; else delete m[k];""")
rep("try{ Object.keys(memLoad()).forEach(k=>memSuggest(memLoad()[k])); }catch(e){}","try{ Object.keys(memLoad()).forEach(k=>{ if(memLoad()[k].c) memSuggest(memLoad()[k]); }); }catch(e){}")
rep("function oQty(r){ const it=itemBy(r.item), u=it&&it.u?String(it.u).trim():'';","function oQty(r){ const it=itemBy(r.item), u=it&&it.u?String(it.u).trim():unitOf(r);")
rep("""      <span class="wm">این کالا در کاتالوگ کد ندارد</span></div>`:''}""","""      <span class="wm">این کالا در کاتالوگ کد ندارد</span></div>
      <div class="docin"><label for="uno${i}">واحد</label>
      <input id="uno${i}" class="uno${unitOf(r)?'':' miss'}" data-i="${i}" value="${esc(unitOf(r))}" placeholder="مثلاً: عدد، لیتر، کیلوگرم" list="ntUnits" autocomplete="off"></div>`:''}""")
rep("window.__oTSV=(r)=>[A,r.date,C,r.dev,E,(codeOfItem(r.item)?FF:(rowCode(r)||FF)),r.item,r.qty,I,","window.__oTSV=(r)=>[A,r.date,C,r.dev,E,(codeOfItem(r.item)?FF:(rowCode(r)||FF)),r.item,r.qty,(!codeOfItem(r.item)&&unitOf(r))?unitOf(r):I,")
rep("""    box.querySelectorAll('.slip .dno').forEach(inp=>{""","""    box.querySelectorAll('.slip .uno').forEach(inp=>{
      inp.addEventListener('input',()=>{
        const r=outRows[+inp.dataset.i]; if(!r) return;
        const v=String(inp.value).replace(/[<>"]/g,'').trim().slice(0,20), k=norm(r.item);
        outRows.forEach(x=>{ if(norm(x.item)===k) x.u=v; });
        memUnitSet(r.item,v); inp.classList.toggle('miss',!v);
        $('oBox').value=outTSV(); save();
      });
    });
    box.querySelectorAll('.slip .dno').forEach(inp=>{""")
JS=r"""
/* ===== واحد کالای بدون کد (add_out_unit) ===== */
function memUnit(name){ const e=memLoad()[norm(name)]; return e && e.u ? String(e.u) : ''; }
function unitOf(r){ return String((r&&r.u)||memUnit(r&&r.item)||'').trim(); }
function memUnitSet(name,u){
  const m=memLoad(), k=norm(name); if(!k) return;
  if(u){ m[k]=Object.assign(m[k]||{d:String(name).trim()},{u}); }
  else if(m[k]){ delete m[k].u; if(!m[k].c) delete m[k]; }
  try{ localStorage.setItem(CODEKEY,JSON.stringify(m)); }catch(e){}
}
document.addEventListener('DOMContentLoaded',()=>{ if(document.getElementById('ntUnits')) return; const dl=document.createElement('datalist'); dl.id='ntUnits';
  ['عدد','دست','جفت','سری','لیتر','گالن','بشکه','کیلوگرم','گرم','متر','شاخه','حلقه','رول','بسته','کارتن','برگ','قوطی'].forEach(u=>{ const o=document.createElement('option'); o.value=u; dl.appendChild(o); });
  document.body.appendChild(dl); });
"""
k=t.index("function oQty(r){"); t=t[:k]+JS+"\n"+t[k:]   # همان اسکریپتی که oQty و render در آن است (پیش از اولین رسم)
k=t.rfind("</style>"); t=t[:k]+"\n.docin .uno{width:100%;min-height:48px;font:inherit;font-size:1rem;padding:0 10px;border:1px solid #C3CDD5;border-radius:10px;background:#fff;text-align:start}\n.docin .uno.miss{border:2px solid #C77A1A;background:#FFF8EC}\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('out unit')
