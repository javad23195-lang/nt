// برون‌سپاری: «یک فاکتور دیگر مانده»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  for(const [W,H,nm] of [[390,844,'گوشی'],[1280,800,'کامپیوتر']]){
  console.log('== '+nm);
  const c=await br.newContext({locale:'fa-IR',viewport:{width:W,height:H}}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    localStorage.setItem('nt_outsrc_v1',JSON.stringify([{id:'o1',dev:'کامیون TRS02',ven:'',desc:'تعمیر موتور',ws:'1405/07/01',steps:{rcv:'1405/07/10',fin:'1405/07/11'},by:'',ts:1}])); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='برون‌سپاری'));
  const badge=()=>p.evaluate(i=>{ const e=document.getElementById('badge'+i); return e&&e.classList.contains('show')?e.textContent:''; },IDX);
  await p.evaluate(i=>show(i),IDX); await sleep(1600);
  const F=fn=>p.evaluate(([fn,i])=>(new Function('d','w','return ('+fn+')(d,w)'))(frames[i].contentDocument,frames[i].contentWindow),[fn,IDX]);
  ok(/کار باز نیست/.test(await F('(d)=>d.getElementById("list").innerText')),'کار تمام‌شده در «باز» نیست');
  await F('(d)=>d.querySelector("#seg [data-f=all]").click()'); await sleep(200);
  ok(await F('(d)=>d.querySelectorAll("[data-xadd]").length')===1,'دکمه «+ یک فاکتور دیگر مانده» هست');
  await F('(d)=>d.querySelector("[data-xadd]").click()'); await sleep(300);
  let J=await p.evaluate(()=>JSON.parse(localStorage.nt_outsrc_v1)[0]);
  ok(Array.isArray(J.more)&&J.more.length===1&&/^\d{4}\/\d{2}\/\d{2}$/.test(J.more[0].d),'فاکتور دیگر با تاریخ امروز اضافه شد');
  await F('(d,w)=>{ const n=d.querySelector(".xn"); n.value="جوشکاری"; n.dispatchEvent(new w.Event("change",{bubbles:true})); }');
  J=await p.evaluate(()=>JSON.parse(localStorage.nt_outsrc_v1)[0]); ok(J.more[0].note==='جوشکاری','نام «از کی» ذخیره شد');
  await F('(d)=>d.querySelector("#seg [data-f=open]").click()'); await sleep(200);
  ok(/TRS02/.test(await F('(d)=>d.getElementById("list").innerText')),'کار دوباره «باز» شد');
  ok(/گرفتن فاکتور دیگر \(جوشکاری\)/.test(await F('(d)=>d.getElementById("list").innerText')),'قدم بعد: گرفتن فاکتور دیگر (جوشکاری)');
  await sleep(3200); ok(await badge()!=='','عدد زبانه دوباره روشن شد');
  // دیرکرد: ۵ روز پیش اضافه شده
  await p.evaluate(()=>{ const a=JSON.parse(localStorage.nt_outsrc_v1); a[0].more[0].d='1405/07/10'; localStorage.nt_outsrc_v1=JSON.stringify(a); });
  await p.evaluate(()=>show(0)); await sleep(1500);
  const td=await p.evaluate(()=>frames[0].contentDocument.getElementById('atCard').innerText.replace(/\s+/g,' '));
  ok(/گرفتن فاکتور دیگر \(جوشکاری\)/.test(td)&&/روز دیرکرد/.test(td),'«امروز»: یادآور فاکتور دیگر — '+td.slice(0,90));
  await p.evaluate(i=>show(i),IDX); await sleep(800);
  ok(await F('(d)=>d.querySelector("[data-xst=fin]").disabled'),'«ثبت در سندپرداز» تا رسیدن فاکتور بسته است');
  await F('(d)=>d.querySelector("[data-xst=rcv]").click()'); await sleep(200);
  await F('(d)=>d.querySelector("[data-xst=fin]").click()'); await sleep(200);
  J=await p.evaluate(()=>JSON.parse(localStorage.nt_outsrc_v1)[0]);
  ok(J.more[0].steps.rcv&&J.more[0].steps.fin,'فاکتور دیگر: رسید و ثبت شد');
  ok(/کار باز نیست/.test(await F('(d)=>d.getElementById("list").innerText')),'همه فاکتورها ثبت شد → کار تمام شد');
  await F('(d)=>d.querySelector("#seg [data-f=all]").click()'); await sleep(200);
  await F('(d)=>d.querySelector("[data-xdel]").click()'); J=await p.evaluate(()=>JSON.parse(localStorage.nt_outsrc_v1)[0]); ok(J.more.length===1,'ضربه اول حذف نمی‌کند');
  await F('(d)=>d.querySelector("[data-xdel]").click()'); J=await p.evaluate(()=>JSON.parse(localStorage.nt_outsrc_v1)[0]); ok(J.more.length===0,'ضربه دوم حذف کرد');
  await F('(d)=>{ d.querySelector("[data-xadd]").click(); }'); await F('(d,w)=>{ const n=d.querySelector(".xn"); n.value="<img src=x onerror=window.__x=1>"; n.dispatchEvent(new w.Event("change",{bubbles:true})); }');
  await F('(d)=>d.querySelector("#seg [data-f=open]").click()'); await sleep(200);
  ok(await F('(d,w)=>!w.__x && !d.querySelector("#list img")'),'متن خطرناک اجرا نشد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  await c.close(); }
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
