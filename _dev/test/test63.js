// درخواست خرید: نوار «ردیف تکراری» و «یکی کردن»؛ شناسه ردیف هنگام اصلاح
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const R=(item,x)=>Object.assign({date:'1405/07/20',unit:'لودر کوماتسو WA470',item,u:'عدد',qty:1,bought:'',desc:'',d1:'',d2:'',pri:'ضروری',buy:'',req:'',apr:'',over:'',note:''},x||{});
    localStorage.setItem('nt_kharid9_v1',JSON.stringify({row:5,rows:[R('ترموستات'),R('ترموستات',{d1:'1596'}),R('ترموستات',{note:'<img src=x onerror=window.__x=1>'}),R('واترپمپ',{qty:2}),R('واترپمپ',{qty:2,buy:'خریده شد'}),R('فیلتر',{__i:5})]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='درخواست خرید'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const F=fn=>p.evaluate(([fn,i])=>(new Function('d','w','return ('+fn+')(d,w)'))(frames[i].contentDocument,frames[i].contentWindow),[fn,IDX]);
  const bar=await F('(d)=>{ const b=d.getElementById("kDupBar"); return b&&!b.hidden?b.innerText:""; }');
  ok(/۳ ردیف تکراری/.test(bar),'نوار: «۳ ردیف تکراری» — '+bar.replace(/\s+/g,' '));
  await F('(d)=>d.getElementById("kDupGo").click()'); await sleep(200);
  let L=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_kharid9_v1'))).rows;
  ok(L.length===6,'ضربه اول فقط آماده می‌کند');
  await F('(d)=>d.getElementById("kDupGo").click()'); await sleep(400);
  L=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_kharid9_v1'))).rows;
  const t=L.filter(r=>r.item==='ترموستات'), w=L.filter(r=>r.item==='واترپمپ');
  ok(L.length===3 && t.length===1 && w.length===1,'بعد از تأیید: ۳ ردیف ('+L.map(r=>r.item).join('، ')+')');
  ok(t[0] && t[0].d1==='1596' && /img/.test(t[0].note) && w[0].buy==='خریده شد','اطلاعات نسخه‌ها روی یک ردیف جمع شد');
  ok(await F('(d)=>{ const b=d.getElementById("kDupBar"); return !b||b.hidden; }'),'نوار پنهان شد');
  ok(t[0].id && L.find(r=>r.item==='فیلتر').id && !w[0].id,'شناسه: ردیف اصلاح‌شده (و ردیف با __i) دارد؛ ردیف دست‌نخورده لازم ندارد');
  ok(L.every(r=>!('__i' in r)),'شماره ترتیب (__i) دیگر در ردیف ذخیره نمی‌شود');
  ok(new Set(L.map(r=>r.id).filter(Boolean)).size===L.filter(r=>r.id).length,'شناسه‌ها یکتا');
  ok(await F('(d,w)=>!w.__x && !d.querySelector("img[src=x]")'),'متن خطرناک اجرا نشد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
