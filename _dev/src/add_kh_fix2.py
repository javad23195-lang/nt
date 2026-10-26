# خدمات (۱۴۰۵/۰۸/۰۴):
# ۱) خدمت «داخلی» شناسنامه لازم ندارد: برچسب «شناسنامه ندارد»، دکمه «ساخت شناسنامه» و دکمه ▩ فقط برای «خارجی».
# ۲) «ویرایش خدمت»: کادر ساعت کارکرد/کیلومتر عدد همان خدمت را نشان می‌دهد (قبلاً آخرین عدد تایپ‌شده می‌ماند و
#    اگر ذخیره می‌شد، روی خدمت دیگر و دفترچه قرائت می‌نشست). بعد از افزودن هم کادر خالی می‌شود.
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
    t=rep(t,"function nsh(r){ try{ if(!r||!r.done) return false;","function nsh(r){ try{ if(!r||!r.done||r.kind==='داخلی') return false;")
    t=rep(t,"""        <button class="tosh" data-h="${i}" title="ساخت شناسنامه از این خدمت">▩</button>""",
            """        ${r.kind!=='داخلی'?`<button class="tosh" data-h="${i}" title="ساخت شناسنامه از این خدمت">▩</button>`:''}""")
    t=rep(t,"""  $('fDone').value = r.done;
  $('editNo').textContent = fa(i+1);""","""  $('fDone').value = r.done;
  $('fMeter').value = r.msrc==='ثبت شد' ? String(r.meter||'') : '';
  try{ meterHint(); }catch(e){}
  $('editNo').textContent = fa(i+1);""")
    t=rep(t,"""  const _meter = _mv !== '' ? _mv : (_last ? String(_last.val) : '');
  const _msrc  = _mv !== '' ? 'ثبت شد' : (_last ? (_gap<=7?'از دفترچه':'از دفترچه (قدیمی)') : '');""",
            """  const _orig = editIdx!==null ? rows[editIdx] : null, _keep = _mv==='' && _orig && _orig.msrc && _orig.msrc!=='ثبت شد' && norm(_orig.dev)===norm(dev);
  const _meter = _mv !== '' ? _mv : (_keep ? String(_orig.meter||'') : (_last ? String(_last.val) : ''));
  const _msrc  = _mv !== '' ? 'ثبت شد' : (_keep ? _orig.msrc : (_last ? (_gap<=7?'از دفترچه':'از دفترچه (قدیمی)') : ''));""")
    t=rep(t,"    cAct.reset(); cPart.reset(); $('fOpen').value='';\n","    cAct.reset(); cPart.reset(); $('fOpen').value=''; $('fMeter').value=''; try{ meterHint(); }catch(e){}\n")
    t=rep(t,"""    cAct.reset(); cPart.reset();
    $('fOpen').value=''; $('fDone').value=TODAY;""","""    cAct.reset(); cPart.reset();
    $('fOpen').value=''; $('fDone').value=TODAY; $('fMeter').value='';""")
    return t
patch('خدمات',kh)
def td(t):
    return rep(t,"const ns=dr.filter(r=>r&&r.done&&made","const ns=dr.filter(r=>r&&r.done&&r.kind!=='داخلی'&&made")
patch('امروز',td)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s)
