# دفترچه قرائت ← برنامه سرویس: دکمه یک‌باره «سقف ماه پیشنهادی معدن» (۱۴۰۵/۰۸/۰۴):
# روغن موتور و فیلترهای همراهش (موتور، سوخت، هوا) ۶ ماه؛ هیدرولیک، گیربکس، دیفرانسیل، اکسل، گردان، اسپراکت، توپی و بقیه ۱۲ ماه.
# فقط سقف ماه عوض می‌شود؛ فاصله ساعت/کیلومتر و آخرین سرویس دست نمی‌خورد. دو ضربه (برگشت‌پذیر با اصلاح هر مورد).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
def rep(t,a,b):
    assert t.count(a)==1,(a[:60],t.count(a)); return t.replace(a,b)
def df(t):
    t=rep(t,'    <button class="btn btn-save" id="svcGo" type="button" disabled>افزودن به برنامه سرویس</button>\n',
      '    <button class="btn btn-save" id="svcGo" type="button" disabled>افزودن به برنامه سرویس</button>\n'
      '    <div class="impinfo" style="margin-top:14px">سقف زمانی پیشنهادی برای شرایط معدن: روغن موتور و فیلترهای موتور ۶ ماه؛ هیدرولیک، گیربکس، دیفرانسیل، اکسل، گردان و بقیه ۱۲ ماه. ساعت و کیلومترها عوض نمی‌شوند.</div>\n'
      '    <button class="btn btn-ghost" id="svcMo" type="button">گذاشتن سقف ماه پیشنهادی برای همه دستگاه‌ها</button>\n')
    t=rep(t,"$('svcGo').addEventListener('click',()=>{",r"""/* سقف ماه پیشنهادی معدن: روغن موتور (و فیلتر موتور/سوخت/هوا) ۶، بقیه ۱۲ */
function svMoOf(name){ const n=norm(name);
  if(/هیدرولیک|گیربکس|ترانسمیشن|دنده|دیفرانسیل|اکسل|فاینال|گردان|اسپراکت|توپی|ترمز|کمپرسور/.test(n)) return 12;
  if(/موتور/.test(n) || (/فیلتر/.test(n) && /روغن|سوخت|هوا|گازوئیل/.test(n))) return 6;
  return 12; }
(function(){ const b=$('svcMo'); if(!b) return; if(!svW){ b.hidden=true; return; } let arm=null; const t0=b.textContent;
  b.addEventListener('click',()=>{ if(!arm){ b.textContent='دوباره بزنید تا سقف ماه همه موردها عوض شود'; arm=setTimeout(()=>{ arm=null; b.textContent=t0; },5000); return; }
    clearTimeout(arm); arm=null; b.textContent=t0;
    const L=svGet(SVK); let n6=0,n12=0; L.forEach(x=>{ if(!x||!x.name) return; const m=svMoOf(x.name); if(+x.months!==m){ x.months=m; } if(m===6) n6++; else n12++; });
    if(svSet(SVK,L)){ $('svcImp').classList.remove('show'); render(); say(`سقف ماه گذاشته شد: ${fa(n6)} مورد ۶ ماه، ${fa(n12)} مورد ۱۲ ماه`); } }); })();
$('svcGo').addEventListener('click',()=>{""")
    return t
d=next(x for x in docs if x['name']=='دفترچه قرائت'); t=base64.b64decode(d['b64']).decode('utf-8'); d['b64']=base64.b64encode(df(t).encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('svc months')
