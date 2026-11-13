# خدمات: خدمت انجام‌شده بدون شناسنامه → برچسب + دکمه «ساخت شناسنامه» + یادآور در «امروز»
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
def patch(n,fn):
    d=next(x for x in docs if x['name']==n); t=base64.b64decode(d['b64']).decode('utf-8'); t=fn(t); d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
def rep(t,a,b):
    assert t.count(a)==1,(a[:60],t.count(a)); return t.replace(a,b)
def kh(t):
    t=rep(t,"""${npr(r)?'<span class="tag np">چاپ نشده</span>':''}""","""${npr(r)?'<span class="tag np">چاپ نشده</span>':''}${nsh(r)?'<span class="tag np">شناسنامه ندارد</span>':''}""")
    t=rep(t,"""        <div class="ksum">${kSummary(r,i)}</div>""","""        <div class="ksum">${kSummary(r,i)}</div>
        ${nsh(r)?`<button type="button" class="shgo" data-g="${i}">ساخت شناسنامه</button>`:''}""")
    t=rep(t,"""  [...box.querySelectorAll('.tosh')].forEach(b=>""","""  [...box.querySelectorAll('.shgo')].forEach(b=>b.addEventListener('click',()=>toShenasname(+b.dataset.g)));
  [...box.querySelectorAll('.tosh')].forEach(b=>""")
    t=rep(t,"function npr(r){","""/* شناسنامه ندارد: خدمت انجام‌شده (تاریخ انجام دارد) در ۳۰ روز اخیر که شناسنامه‌اش ساخته نشده */
function nsh(r){ try{ if(!r||!r.done) return false; if(shMade().indexOf(shKey(r))>-1) return false; return dayGap(r.y+'/'+r.m+'/'+r.d,TODAY)<=30; }catch(e){ return false; } }
function npr(r){""")
    t=rep(t,"/* ثبت چاپ: هر ردیفی","/* وقتی زبانه دوباره باز شد، برچسب‌ها تازه شود (مثلاً شناسنامه ساخته شده) */\nwindow.addEventListener('message',e=>{ if(e&&e.data&&e.data.nt==='show'){ try{ render(); }catch(x){} } });\n/* ثبت چاپ: هر ردیفی")
    t=rep(t,".slip .tag.np{",""".slip .shgo{display:block;width:100%;min-height:44px;margin-top:8px;border-radius:10px;border:1px solid #E0A75E;background:#FFF1DB;color:#7A4300;font:inherit;font-weight:800;cursor:pointer}
.slip .tag.np{""")
    return t
NORM=r"""function shNorm(s){ return String(s??'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[ً-ْـ]/g,'').replace(/[​-‏]/g,' ').replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-0x06F0)).replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x0660)).replace(/[×xX*]/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim().toLowerCase(); }
"""
def td(t):
    return rep(t,"    if(np) out.push({lv:'hot', t:`${fa(np)} خدمت چاپ‌نشده`","""    let made=[]; try{ made=JSON.parse(localStorage.getItem('nt_sh_from_v1')||'[]'); }catch(e){} if(!Array.isArray(made)) made=[];
    """+NORM.replace('\n',' ')+"""
    const ns=dr.filter(r=>r&&r.done&&made.indexOf(shNorm(r.dev)+'|'+shNorm(r.act)+'|'+(r.y||'')+'/'+(r.m||'')+'/'+(r.d||''))<0&&Math.abs(tj-((+r.y)*372+((+r.m)-1)*31+(+r.d)))<=30).length;
    if(ns) out.push({lv:'hot', t:`${fa(ns)} خدمت انجام‌شده بدون شناسنامه`, s:'در «خدمات» دکمه «ساخت شناسنامه» را بزنید', go:'خدمات'});
    if(np) out.push({lv:'hot', t:`${fa(np)} خدمت چاپ‌نشده`""")
patch('خدمات',kh); patch('امروز',td)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh remind')
