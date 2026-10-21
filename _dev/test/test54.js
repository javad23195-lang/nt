// دکمه «خروج»: سامانه بسته شود (window.close)؛ اگر بسته نشد، صفحه «بسته شد» با راهنما؛ «باز کردن دوباره»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
  await c.addInitScript(()=>{ window.close=()=>{ window.__closed=(window.__closed||0)+1; }; });
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntQr&&window.ntExit,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(800);
  await p.click('#ntHam'); await sleep(500);
  ok(/بستن سامانه/.test(await p.evaluate(()=>document.querySelector('#ntDrw [data-a="ntExitBtn"]').innerText)),'منوی ☰: «خروج (بستن سامانه)»');
  await p.click('#ntDrw [data-a="ntExitBtn"]'); await sleep(1500);
  ok(await p.evaluate(()=>window.__closed===1),'خروج: دستور بستن برنامه داده شد');
  ok(await p.evaluate(()=>{ const s=document.getElementById('ntShut'); return !!s && getComputedStyle(s).display!=='none' && document.body.classList.contains('ntpin'); }),'اگر بسته نشد: صفحه «سامانه بسته شد» روی همه چیز');
  ok(/فهرست برنامه‌های باز/.test(await p.evaluate(()=>document.getElementById('ntShutH').textContent)),'راهنمای بستن از فهرست برنامه‌های باز');
  ok(await p.evaluate(()=>Object.keys(localStorage).length>0),'اطلاعات پاک نشد');
  await p.click('#ntShutGo'); await p.waitForFunction(()=>window.ntExit,null,{timeout:15000}); await sleep(300);
  ok(await p.evaluate(()=>!document.getElementById('ntShut')),'«باز کردن دوباره» سامانه را باز کرد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
