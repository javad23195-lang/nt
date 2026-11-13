// خدمات: برچسب «چاپ نشده» و خط «امروز»
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
    const k=todayKey().split('/').map(Number);
    const mk=(act,y,m,d,pr)=>({dev:'کامیون TRS02',act,part:'',kind:'خارجی',meter:'',msrc:'',munit:'',open:'',done:'',y,m,d,mn:'',cdate:'',reason:'',...(pr?{pr}:{})});
    localStorage.setItem('nt_khadamat_v1',JSON.stringify({t:Date.now(),rows:[mk('تعمیر موتور',k[0],k[1],k[2]),mk('قدیمی',k[0]-1,1,1),mk('چاپ‌شده',k[0],k[1],k[2],'1405/07/19')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='خدمات'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const f=(fn)=>p.evaluate(fn=>(new Function('d','return ('+fn+')(d)'))(frames[+window.__i].contentDocument),fn);
  await p.evaluate(i=>{ window.__i=i; },IDX);
  console.log('1) برچسب');
  ok(await f('d=>d.querySelectorAll(".slip .tag.np").length')===1,'فقط یک خدمت تازه و چاپ‌نشده برچسب دارد');
  await p.evaluate(()=>show(0)); await sleep(1500);
  const tx=await p.evaluate(()=>frames[0].contentDocument.getElementById('atCard').innerText.replace(/\s+/g,' '));
  ok(/۱ خدمت چاپ‌نشده/.test(tx),'«امروز»: ۱ خدمت چاپ‌نشده — '+tx.slice(0,80));
  console.log('2) چاپ');
  await p.evaluate(i=>show(i),IDX); await sleep(800);
  await p.evaluate(()=>{ frames[+window.__i].contentWindow.open=()=>null; frames[+window.__i].contentWindow.print=()=>{}; });
  await f('d=>{ d.querySelector(".slip:has(.tag.np) .prn").click(); }'); await sleep(800);
  ok(await f('d=>d.querySelectorAll(".slip .tag.np").length')===0,'بعد از چاپ برچسب رفت');
  const n=await p.evaluate(()=>JSON.parse(localStorage.nt_khadamat_v1).rows.filter(r=>r.pr).length);
  ok(n===2,'تاریخ چاپ ذخیره شد');
  await p.evaluate(()=>show(0)); await sleep(1500);
  ok(!/چاپ‌نشده/.test(await p.evaluate(()=>frames[0].contentDocument.getElementById('atCard').innerText)),'خط «امروز» رفت');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
