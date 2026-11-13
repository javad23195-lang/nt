// صفحه آغاز (طرح 2s/2t): هنگام همگام‌سازی، بدون اینترنت، «ادامه»، «تلاش دوباره»؛ قفل ورود: صفحه آغاز نمی‌آید. لوگوی تازه.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const run=async(net,cfg)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    let hold=[]; await c.route(/api\.github\.com|raw\.githubusercontent/,r=>{ if(net==='off') r.abort(); else hold.push(r); });
    await c.addInitScript(cfg=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntsp_test','1'); if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); },cfg);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSplash&&window.ntSync,null,{timeout:15000});
    return {c,p,errs,hold}; };
  const unlock=p=>p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); const x=document.getElementById('ntPin'); if(x) x.remove(); ntSplash.start(); });

  console.log('۱) در حال همگام‌سازی');
  let {c,p,errs}=await run('hang',{mode:'w',uid:'u1'}); await unlock(p); await sleep(1500);
  let T=await p.evaluate(()=>document.getElementById('ntSp')&&document.getElementById('ntSp').innerText||'');
  ok(await p.evaluate(()=>ntSplash.open) && /سامانه نت معدن/.test(T) && /دریافت اطلاعات، ۱ از ۳/.test(T) && /٪/.test(T) && /نسخه/.test(T),'صفحه آغاز: لوگو، مرحله، درصد، نسخه — '+T.replace(/\s+/g,' ').slice(0,120));
  ok(await p.evaluate(()=>{ const i=document.querySelector('#ntSp .lgw img'); return !!i && /^data:image\/png/.test(i.src) && document.body.classList.contains('ntsplash'); }),'لوگوی بزرگ (داخل فایل)');
  ok(await p.evaluate(()=>{ const i=document.querySelector('.brand .lg'); return !!i && /^data:image\/png/.test(i.src); }),'لوگوی منو عوض شد');
  await p.click('#ntSp [data-sp="go"]'); await sleep(500);
  ok(await p.evaluate(()=>!ntSplash.open && !document.body.classList.contains('ntsplash')),'«ادامه با داده‌های ذخیره‌شده»: بسته شد');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200)); await c.close();

  console.log('۲) بدون اینترنت');
  ({c,p,errs}=await run('off',{mode:'w',uid:'u1'})); await unlock(p);
  await p.waitForFunction(()=>/اینترنت در دسترس نیست/.test((document.getElementById('ntSp')||{}).innerText||''),null,{timeout:15000}).catch(()=>{});
  T=await p.evaluate(()=>document.getElementById('ntSp').innerText);
  ok(/اینترنت در دسترس نیست/.test(T) && /تلاش دوباره/.test(T) && /ذخیره می‌شوند/.test(T),'کارت «اینترنت در دسترس نیست»');
  await p.click('#ntSp [data-sp="retry"]'); await sleep(200);
  ok(await p.evaluate(()=>ntSplash.open),'«تلاش دوباره»: صفحه می‌ماند و دوباره امتحان می‌کند');
  await p.waitForFunction(()=>/اینترنت در دسترس نیست/.test(document.getElementById('ntSp').innerText),null,{timeout:15000}).catch(()=>{});
  await p.click('#ntSp [data-sp="go"]'); await sleep(500);
  ok(await p.evaluate(()=>!ntSplash.open),'«ادامه»: ورود بدون اینترنت');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200)); await c.close();

  console.log('۳) سیستم وصل‌نشده: فقط پنجره ورود');
  ({c,p,errs}=await run('hang',null)); await sleep(1200);
  ok(await p.evaluate(()=>!ntSplash.open && !document.getElementById('ntSp')),'صفحه آغاز نمی‌آید');
  await p.evaluate(()=>ntSplash.start()); await sleep(300);
  ok(await p.evaluate(()=>!ntSplash.open),'حتی با start(): قفل ورود می‌ماند');
  await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
