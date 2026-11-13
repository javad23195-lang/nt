# افزودن «ورود لیست قرائت» به دفترچه قرائت
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
h=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:50],h.count(a)); h=h.replace(a,b)
CSS="""
/* ---------- ورود لیست قرائت ---------- */
.imp{display:none;margin-top:10px;border:1px solid var(--line2);border-radius:12px;padding:12px;background:#F7F9FA}
.imp.show{display:block}
.imp label{display:block;font-size:.85rem;font-weight:700;margin-bottom:6px;color:var(--ink)}
.imp textarea{display:block;width:100%;min-height:130px;font:inherit;font-size:.82rem;line-height:1.7;padding:8px 10px;border:1px solid var(--line2);
  border-radius:8px;background:#fff;color:var(--ink);resize:vertical;white-space:pre;overflow:auto}
.imp textarea:focus{outline:none;border-color:var(--info);box-shadow:0 0 0 3px rgba(27,108,168,.16)}
.impinfo{font-size:.85rem;line-height:1.9;margin:8px 0;color:var(--ink)}
.impinfo:empty{display:none}
.impinfo b{font-weight:800}
.impinfo .bad{color:var(--alert);font-weight:700}
.impinfo ul{margin:4px 0 0;padding-inline-start:18px;font-size:.8rem;color:var(--dim)}
.imp .btn{margin-top:8px}
.imp .btn:disabled{opacity:.45;cursor:not-allowed}
"""
rep("</style>",CSS+"</style>")
rep('  <button class="btn btn-ghost" id="bWipe">پاک کردن کل دفترچه</button>\n',
    '  <button class="btn btn-ghost" id="bImp">ورود لیست قرائت (چسباندن)</button>\n'
    '  <div class="imp" id="imp">\n'
    '    <label for="impTxt">لیست قرائت را اینجا بچسبانید — هر خط: دستگاه، واحد، عدد، تاریخ (همان قالب «کپی کل دفترچه»)</label>\n'
    '    <textarea id="impTxt" dir="rtl" spellcheck="false" placeholder="لودر کوماتسو WA470&#9;ساعت&#9;27150&#9;1405/07/13"></textarea>\n'
    '    <div class="impinfo" id="impInfo" aria-live="polite"></div>\n'
    '    <button class="btn btn-save" id="impGo" type="button" disabled>افزودن به دفترچه</button>\n'
    '  </div>\n'
    '  <button class="btn btn-ghost" id="bWipe">پاک کردن کل دفترچه</button>\n')
JS=r"""
/* ---------- ورود لیست قرائت (چسباندن) ---------- */
let impRows=[];
const latin=t=>String(t??'').replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
/** یک خط را به دستگاه، عدد و تاریخ تبدیل می‌کند — جداکننده: تب، یا چند فاصله، یا فاصله ساده */
function impLine(line){
  const l=latin(line).replace(/[‌‎‏]/g,' ').trim();
  if(!l) return null;
  let p=l.split('\t').map(x=>x.trim()).filter(x=>x!=='');
  if(p.length<3) p=l.split(/\s{2,}|[|]/).map(x=>x.trim()).filter(x=>x!=='');
  let dev,val,date;
  if(p.length>=3){ date=p[p.length-1]; val=p[p.length-2]; dev=p.length>=4?p.slice(0,p.length-3).join(' '):p[0]; }
  else{
    const m=/^(.*?)\s+(?:(ساعت|کیلومتر)\s+)?([\d.,]+)\s+(1[34]\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2})$/.exec(l);
    if(!m) return {bad:line.trim(),why:'قالب خط خوانده نشد'};
    dev=m[1]; val=m[3]; date=m[4];
  }
  const nd=normDate(date), nv=String(val).replace(/,/g,'');
  if(nv===''||isNaN(+nv)){ return /دستگاه/.test(l)&&/تاریخ/.test(l) ? null : {bad:line.trim(),why:'عدد معتبر نیست'}; }   // خط عنوان نادیده گرفته می‌شود
  if(!nd) return {bad:line.trim(),why:'تاریخ معتبر نیست'};
  const m=DATA.d.find(x=>norm(x.dev)===norm(dev));
  if(!m) return {bad:line.trim(),why:'نام دستگاه در دفترچه نیست'};
  return {dev:m.dev,unit:m.unit,val:+nv,date:nd};
}
function impRead(){
  const seen={}, bad=[]; let nNew=0,nSame=0,nDiff=0;
  impRows=[];
  $('impTxt').value.split(/\r?\n/).forEach(line=>{
    const r=impLine(line); if(!r) return;
    if(r.bad){ bad.push(r); return; }
    const k=r.dev+'|'+r.date;
    if(seen[k]!==undefined){ impRows[seen[k]]=r; return; }        // تکرار در خود لیست: آخری می‌ماند
    seen[k]=impRows.length; impRows.push(r);
  });
  impRows.forEach(r=>{
    const cur=log.find(x=>x.dev===r.dev && x.date===r.date);
    r.kind = !cur ? 'new' : (Number(cur.val)===r.val ? 'same' : 'diff');
    if(r.kind==='new') nNew++; else if(r.kind==='same') nSame++; else nDiff++;
  });
  const box=$('impInfo'), go=$('impGo');
  if(!impRows.length && !bad.length){ box.innerHTML=''; go.disabled=true; go.textContent='افزودن به دفترچه'; return; }
  box.innerHTML=`<b>${fa(impRows.length)}</b> قرائت خوانده شد: <b>${fa(nNew)}</b> جدید`
    +(nDiff?` · <b>${fa(nDiff)}</b> با عدد متفاوت (عدد قبلی جایگزین می‌شود)`:'')
    +(nSame?` · ${fa(nSame)} تکراری (از قبل در دفترچه هست)`:'')
    +(bad.length?`<div class="bad">${fa(bad.length)} خط خوانده نشد و اضافه نمی‌شود:</div><ul>${bad.slice(0,8).map(b=>`<li>${esc(b.bad)} — ${esc(b.why)}</li>`).join('')}${bad.length>8?`<li>و ${fa(bad.length-8)} خط دیگر</li>`:''}</ul>`:'');
  const n=nNew+nDiff;
  go.disabled=!n; go.textContent=n?`افزودن ${fa(n)} قرائت به دفترچه`:'چیزی برای افزودن نیست';
}
$('bImp').addEventListener('click',()=>{ const b=$('imp'); b.classList.toggle('show'); if(b.classList.contains('show')){ try{ $('impTxt').focus(); }catch(e){} } });
$('impTxt').addEventListener('input',impRead);
$('impGo').addEventListener('click',()=>{
  impRead();
  let n=0;
  impRows.forEach(r=>{
    if(r.kind==='same') return;
    const rec={dev:r.dev,unit:r.unit,val:r.val,date:r.date};
    const i=log.findIndex(x=>x.dev===r.dev && x.date===r.date);
    if(i>-1) log[i]=rec; else log.push(rec);
    n++;
  });
  if(!n){ say('چیزی برای افزودن نبود',true); return; }
  save(); render();
  $('impTxt').value=''; impRead(); $('imp').classList.remove('show');
  say(fa(n)+' قرائت به دفترچه اضافه شد');
});
"""
rep("\nload(); render(); updateSaveBtn();\n", JS+"\nload(); render(); updateSaveBtn();\n")
d['b64']=base64.b64encode(h.encode('utf-8')).decode('ascii')
import os
if os.environ.get('NT_DOCS'): open(os.path.join(os.environ['NT_DOCS'],'doc_دفترچه قرائت.new.html'),'w',encoding='utf-8').write(h)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('patched',len(s))
