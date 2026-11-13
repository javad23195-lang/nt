// درخواست خرید: فیلتر «بدون سند مصرف/خرید»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844},deviceScaleFactor:1.5}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const R=(date,item,d1,d2,over)=>({date,unit:'PC290',item,u:'عدد',qty:1,bought:'',desc:'',d1,d2,pri:'',buy:'',req:'',apr:'',over:over||'',note:''});
    localStorage.setItem('nt_kharid9_v1',JSON.stringify({row:5,rows:[
      R('1405/07/02','پین ته استیک','1596','643'),R('1405/07/02','جک 2 تن','',''),R('1405/07/05','لاستیک برف پاک کن','1700',''),
      R('1405/07/09','فیلتر روغن','','900'),R('1405/07/09','<img src=x onerror=window.__x=1>','',''),R('1405/07/10','لغو شده','','','لغو شد')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='درخواست خرید'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const F=fn=>p.evaluate(([fn,i])=>(new Function('d','w','return ('+fn+')(d,w)'))(frames[i].contentDocument,frames[i].contentWindow),[fn,IDX]);
  const names=()=>F('(d)=>[...d.querySelectorAll("#slips .slip .nm")].map(x=>x.textContent.trim())');
  const flag=k=>F(`(d)=>d.querySelector('.kflags [data-f="${k}"]').click()`);
  ok(/۳ بدون سند خرید/.test(await F('(d)=>d.querySelector(".kflags").innerText')),'شمارش درست: ۳ بدون سند خرید (لغو‌شده حساب نمی‌شود)');
  await flag('d2'); await sleep(300); await p.screenshot({path:'/tmp/claude-0/kfilter.png'});
  let n=await names();
  ok(n.length===3 && !n.includes('پین ته استیک') && n.includes('لاستیک برف پاک کن') && !n.includes('لغو شده'),'فقط «بدون سند خرید»، از همه روزها: '+n.join('، '));
  ok(/فقط «بدون سند خرید»: ۳ ردیف/.test(await F('(d)=>d.querySelector(".kfbar").innerText')),'نوار فیلتر روشن است');
  ok(await F('(d)=>d.querySelector(".kflags [data-f=d2]").getAttribute("aria-pressed")==="true"'),'دکمه فیلتر فشرده است');
  await flag('d1'); await sleep(300); n=await names();
  ok(n.length===3 && n.includes('فیلتر روغن') && !n.includes('لاستیک برف پاک کن') && !n.includes('پین ته استیک'),'فقط «بدون سند مصرف»: '+n.join('، '));
  await F('(d)=>d.getElementById("kfOff").click()'); await sleep(300);
  ok(!(await F('(d)=>!!d.querySelector(".kfbar")')),'«نمایش همه»: فیلتر برداشته شد');
  await flag('d2'); await flag('d2'); await sleep(300);
  ok(!(await F('(d)=>!!d.querySelector(".kfbar")')),'ضربه دوم روی همان دکمه فیلتر را برمی‌دارد');
  ok(await F('(d,w)=>!w.__x && !d.querySelector("#slips img[src=x]")'),'متن خطرناک اجرا نشد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
