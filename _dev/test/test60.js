// درخواست خرید، «کد تازه»: کد سندپرداز تکراری (مال کالای دیگر در کاتالوگ انبار) قبول نمی‌شود
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
  await p.evaluate(()=>window.postMessage({nt:'go',tab:'درخواست خرید'},'*')); await sleep(1500);
  let f=null; for(const x of p.frames()){ if(x===p.mainFrame()) continue; try{ if(await x.evaluate(()=>typeof codeDup==='function')) { f=x; break; } }catch(e){} }
  ok(!!f,'درخواست خرید باز شد');
  const add=(n,cd)=>f.evaluate(([n,cd])=>{ document.getElementById('cName').value=n; document.getElementById('cCode').value=cd; document.getElementById('cUnit').value='عدد'; document.getElementById('bCatAdd').click(); return myCat.length; },[n,cd]);
  const n0=await f.evaluate(()=>myCat.length);
  await add('قطعه آزمایشی یک','990001'); ok(await f.evaluate(()=>myCat.some(x=>x.c==='990001')),'کد تازه 990001 ثبت شد');
  const n1=await add('قطعه آزمایشی دو','۹۹۰۰۰۱');
  ok(n1===n0+1 && !(await f.evaluate(()=>myCat.some(x=>/دو$/.test(x.d)))),'همان کد (با رقم فارسی) برای کالای دیگر قبول نشد');
  ok(/مال «قطعه آزمایشی یک»/.test(await f.evaluate(()=>document.body.innerText)),'پیام: این کد مال کدام کالاست');
  const anyCat=await f.evaluate(()=>{ const o=ITEMS.find(x=>x.c && !myCat.includes(x)); return o?String(o.c):''; });
  if(anyCat){ const n2=await add('قطعه آزمایشی سه',anyCat); ok(n2===n0+1,'کد کالای کاتالوگ اصلی انبار ('+anyCat+') هم تکراری شناخته شد'); }
  await add('قطعه آزمایشی چهار','990004');
  // اصلاح ردیف کاتالوگ به کد تکراری
  const ok4=await f.evaluate(()=>{ const i=myCat.findIndex(x=>x.c==='990004'); catEdit=i; catRender(); const row=document.querySelector('#catList .ci[data-i="'+i+'"]'); row.querySelector('.ec').value='990001'; row.querySelector('.sv2').click(); return myCat[i].c; });
  ok(ok4==='990004','اصلاح: کد تکراری قبول نشد (کد قبلی ماند)');
  ok(await f.evaluate(()=>codeDup('990004','قطعه آزمایشی چهار')===null),'کد خود همان کالا تکراری حساب نمی‌شود');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
