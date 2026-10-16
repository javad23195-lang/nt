// نسخه تازه: اگر صفحه ذخیره‌شده قدیمی باز شد، نسخه تازه پیدا و جایگزین شود (بی‌صدا قبل از لمس؛ بعد از لمس با نوار)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'),'utf8');
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let ver='A'; const mk=v=>v==='A'?HTML:HTML.replace(/<meta name="nt-build" content="[0-9a-f]+">/,'<meta name="nt-build" content="ffff000011112222">');
  ok(/<meta name="nt-build" content="[0-9a-f]{16}">/.test(HTML),'شماره نسخه در صفحه هست');
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(mk(ver)); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  const url=`http://localhost:${web.address().port}/nt/s.html`;
  await p.goto(url); await p.waitForFunction(()=>window.ntPwa,null,{timeout:15000});
  ok(await p.evaluate(()=>ntPwa.build.length===16),'نسخه خودش را می‌شناسد');
  await p.evaluate(()=>ntPwa.checkNew(1)); await sleep(500);
  ok(await p.evaluate(()=>!document.getElementById('ntUpBar')),'نسخه یکسان: کاری نمی‌کند');
  ver='B'; await p.evaluate(()=>{ window.__mark=1; }); await p.evaluate(()=>{ try{ ntPwa.checkNew(1); }catch(e){} }); await sleep(1500);
  ok(await p.evaluate(()=>!window.__mark && document.querySelector('meta[name="nt-build"]').content==='ffff000011112222'),'لمس نشده: بی‌صدا نسخه تازه بارگذاری شد');
  ver='A'; await p.waitForFunction(()=>window.ntPwa,null,{timeout:15000}); await p.mouse.click(5,300); await sleep(100);
  await p.evaluate(()=>{ window.__mark=1; ntPwa.checkNew(1); }); await sleep(800);
  ok(await p.evaluate(()=>window.__mark===1 && !!document.getElementById('ntUpBar')),'بعد از لمس: بارگذاری نمی‌شود، نوار «به‌روزرسانی» می‌آید');
  await p.evaluate(()=>document.getElementById('ntUpGo').click()); await p.waitForFunction(()=>window.ntPwa && !window.__mark,null,{timeout:15000}).catch(()=>{});
  ok(await p.evaluate(()=>!window.__mark),'«به‌روزرسانی» صفحه را تازه می‌کند');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
