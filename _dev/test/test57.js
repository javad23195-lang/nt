// خدمات: برگه درخواست خدمات با تاریخ ثبت ردیف چاپ می‌شود، نه تاریخ امروز
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:1100,height:860}});
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntQr,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(800);
  await p.evaluate(()=>window.postMessage({nt:'go',tab:'خدمات'},'*')); await sleep(1500);
  let f=null; for(const x of p.frames()){ if(x===p.mainFrame()) continue; try{ if(await x.evaluate(()=>typeof reqSheet==='function')) { f=x; break; } }catch(e){} }
  ok(!!f,'بخش خدمات باز شد');
  const r=await f.evaluate(()=>({h:reqSheet({y:1405,m:7,d:25,act:'بازکردن و تعمیر گیربکس',dev:'کامیون TRS01',kind:'خارجی'}), today:TODAY,
    h2:reqSheet({act:'x',dev:'y',open:'1405/06/10'})}));
  ok(r.h.includes('1405/07/25'),'تاریخ برگه = تاریخ ثبت ردیف (1405/07/25)');
  ok(r.today==='1405/07/25' || !r.h.includes(r.today),'تاریخ امروز ('+r.today+') در برگه نیامد');
  ok(r.h2.includes('1405/06/10'),'ردیف قدیمی بدون y/m/d: «تاریخ باز» به کار می‌رود');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
