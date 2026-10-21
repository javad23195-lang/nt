# «درخواست خرید» ← «فاکتور خرید»: وقتی واحد خرید فاکتوری را به یک ردیف «در انتظار خرید» وصل کرده است،
# در مرحله خرید همان ردیف برچسب «فاکتور رسید» می‌گیرد و از قبل تیک‌خورده است (تعداد = تعداد فاکتور).
# ثبت خرید و ورود انبار مثل قبل با همان دکمه «ثبت خرید و ورود به انبار» در همین زبانه انجام می‌شود (منطق انبار یک جا می‌ماند).
# اتصال با شناسه ردیف است (id یا اثر متن، مثل kIdOf)، نه با نام؛ نام فاکتور و نام انبار لازم نیست یکی باشد.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='درخواست خرید')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:80],t.count(a)); t=t.replace(a,b)
rep("""    x++;
    const v=r._bq!=null ? r._bq : r.qty;
    pend.push(`<div class="fr${r._bk?' on':''}"><label class="pk">
        <input type="checkbox" class="fck" data-x="${x}"${r._bk?' checked':''} aria-label="انتخاب ${esc(r.item)}">
        <span class="nm">${nm}</span></label>""",
"""    x++;
    const fx=fxOf(r), pre=!!fx && !fxOff.has(r), fq=fx&&fx.qty?Math.min(+fx.qty||0,+spNum(r.qty)||0)||r.qty:r.qty;
    const v=r._bq!=null ? r._bq : (pre?fq:r.qty), on=r._bk||pre;
    pend.push(`<div class="fr${on?' on':''}${fx?' fx':''}"><label class="pk">
        <input type="checkbox" class="fck" data-x="${x}"${on?' checked':''} aria-label="انتخاب ${esc(r.item)}">
        <span class="nm">${nm}${fx?`<span class="fxl">فاکتور رسید: ${esc(fx.title||'')}${fx.qty?'، '+fa(fx.qty)+' '+esc(fx.unit||''):''}${fx.sup?'، '+esc(fx.sup):''}${fx.date?'، '+fa(fx.date):''}</span>`:''}</span></label>""")
rep("        if(cb.checked){ r._bk=1; n++; } else delete r._bk;",
    "        if(cb.checked){ r._bk=1; n++; fxOff.delete(r); } else { delete r._bk; fxOff.add(r); }")
JS=r"""
/* ===== اتصال به «فاکتور خرید» (add_factor_link) ===== */
const fxOff=new WeakSet();                      /* ردیف‌هایی که کاربر تیک پیشنهادی‌شان را برداشته (فقط در همین صفحه) */
const fxN=s=>String(s==null?'':s).replace(/[<>"]/g,'').replace(/[\t\r\n]+/g,' ').replace(/\s+/g,' ').trim();
function fxList(){ try{ const a=JSON.parse(localStorage.getItem('nt_factor_v1')||'[]'); return Array.isArray(a)?a.filter(f=>f&&f.req&&typeof f.req==='object'):[]; }catch(e){ return []; } }
/** فاکتوری که به این ردیف وصل شده (با شناسه ردیف؛ اگر شناسه عوض شده: نام + دستگاه + تاریخ درخواست) */
function fxOf(r){ const L=fxList(); if(!L.length) return null; let id=''; try{ if(typeof kIdOf==='function') id=kIdOf(r); }catch(e){}
  return L.find(f=>(id && f.req.rid===id) || (f.req.item===fxN(r.item) && f.req.dev===fxN(r.unit) && f.req.date===fxN(r.date)))||null; }
"""
k=t.index("<script>")+8; t=t[:k]+JS+"\n"+t[k:]
CSS="""
/* ===== اتصال به «فاکتور خرید» (add_factor_link) ===== */
.fdoc .fr .fxl{display:block;margin-top:2px;font-size:.74rem;font-weight:700;color:#1E6B3A}
.fdoc .fr.fx{box-shadow:inset 3px 0 0 #1E8E5A}
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('factor_link')
