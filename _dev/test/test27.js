// خدمات: «شناسنامه ندارد» + دکمه «ساخت شناسنامه» + یادآور «امروز»
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
    const mk=(act,done,pr)=>({dev:'کامیون TRS02',act,part:'',kind:'خارجی',meter:'',msrc:'',munit:'',open:'',done,y:k[0],m:k[1],d:k[2],mn:'',cdate:'',reason:'',pr:'1405/07/19'});
    localStorage.setItem('nt_khadamat_v1',JSON.stringify({t:Date.now(),rows:[mk('تعمیر موتور','1405/07/19'),mk('سرویس','')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='خدمات'));
  await p.evaluate(()=>show(0)); await sleep(1500);
  ok(/۱ خدمت انجام‌شده بدون شناسنامه/.test(await p.evaluate(()=>frames[0].contentDocument.getElementById('atCard').innerText)),'«امروز»: ۱ خدمت انجام‌شده بدون شناسنامه');
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const F=fn=>p.evaluate(([fn,i])=>(new Function('d','return ('+fn+')(d)'))(frames[i].contentDocument),[fn,IDX]);
  ok(await F('(d)=>d.querySelectorAll(".shgo").length')===1,'فقط خدمت انجام‌شده دکمه «ساخت شناسنامه» دارد');
  ok(/شناسنامه ندارد/.test(await F('(d)=>d.getElementById("slips").innerText')),'برچسب «شناسنامه ندارد»');
  await F('(d)=>d.querySelector(".shgo").click()'); await sleep(1500);
  ok(await p.evaluate(()=>DOCS[active].name)==='شناسنامه','به زبانه «شناسنامه» رفت');
  const SI=await p.evaluate(()=>active);
  ok(/کامیون TRS02/.test(await p.evaluate(i=>frames[i].contentDocument.getElementById('fromLn').innerText,SI)),'اطلاعات خدمت در شناسنامه آمد');
  // وقتی شناسنامه ساخته شد (همان کلید که زبانه شناسنامه ذخیره می‌کند)
  await p.evaluate(()=>{ localStorage.setItem('nt_sh_from_v1',JSON.stringify([ 'کامیون trs02|تعمیر موتور|'+todayKey().split('/').map(Number).join('/') ])); });
  await p.evaluate(i=>show(i),IDX); await sleep(300); await p.evaluate(()=>show(0)); await sleep(300); await p.evaluate(i=>show(i),IDX); await sleep(1500);
  const left=await F('(d)=>d.querySelectorAll(".shgo").length');
  await p.evaluate(()=>show(0)); await sleep(1500);
  const td=await p.evaluate(()=>frames[0].contentDocument.getElementById('atCard').innerText);
  ok(!/بدون شناسنامه/.test(td),'بعد از ساخت شناسنامه، یادآور «امروز» رفت');
  ok(left===0,'در «خدمات» هم دکمه و برچسب رفت');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
