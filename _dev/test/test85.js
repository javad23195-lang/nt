// پیش‌فاکتور: جدول اقلام با تعداد و قیمت کل، مبلغ مثل بانک (جداکننده و حروف)، قیمت واحد خودکار، سربرگ ستون‌ها
// همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const run=async(cfg,extra)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:`http://localhost:${web.address().port}`});
    await c.addInitScript(([cfg,extra])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntws_test','1');
      if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); Object.keys(extra||{}).forEach(k=>localStorage.setItem(k,JSON.stringify(extra[k]))); },[cfg,extra]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntWs,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
    return {c,p,errs}; };
  const frameOf=async(p,n)=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); return (await p.$$('iframe'))[i].contentFrame(); };
  const go=async(p,t)=>{ await p.evaluate(t=>window.postMessage({nt:'go',tab:t},'*'),t); await sleep(900); };
  const visTabs=p=>p.evaluate(()=>DOCS.filter((d,i)=>!tabs[i].hidden).map(d=>d.name));
  const LSg=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);

  console.log('۱) استعلام تازه: ردیف‌ها با تعداد و قیمت کل');
  let {c,p,errs}=await run({mode:'w'});
  await p.click('#ntWs [data-ws="kh"]'); await sleep(1500);
  await go(p,'پیش‌فاکتور'); let f=await frameOf(p,'پیش‌فاکتور');
  await f.click('#seg [data-p="new"]'); await sleep(200);
  ok(await f.evaluate(()=>{ const t=document.querySelector('.nrs .th').innerText; return /عنوان کالا/.test(t)&&/تعداد/.test(t)&&/واحد/.test(t) && document.querySelectorAll('#nRows .nr').length===3; }),'سربرگ ستون‌ها و سه ردیف خالی');
  const R=await f.$$('#nRows .nr');
  await f.fill('#nT','استعلام آزمایشی');
  await R[0].$('[data-n=t]').then(e=>e.fill('کالای نمونه یک')); await R[0].$('[data-n=q]').then(e=>e.fill('۴')); await R[0].$('[data-n=u]').then(e=>e.fill('عدد'));
  const P0=await R[0].$('[data-n=p]'); await P0.click(); await p.keyboard.type('1200000');
  ok(await P0.inputValue()==='۱,۲۰۰,۰۰۰','جداکننده هنگام نوشتن: '+await P0.inputValue());
  const mw=await R[0].$eval('.mw',e=>e.innerText);
  ok(/یک میلیون و دویست هزار ریال/.test(mw) && /قیمت واحد: ۳۰۰,۰۰۰/.test(mw),'به حروف و قیمت واحد زیر کادر: '+mw.replace(/\n/g,' / '));
  await R[1].$('[data-n=t]').then(e=>e.fill('کالای نمونه دو')); await R[1].$('[data-n=q]').then(e=>e.fill('2'));
  await f.click('#nSave'); await sleep(300);
  ok(/نام فروشنده/.test(await f.evaluate(()=>document.getElementById('nMsg').textContent)) && !(await LSg(p,'nt_kpre_v1')||[]).length,'قیمت بدون فروشنده: پیام، ذخیره نشد');
  await f.fill('#nSup','فروشنده نمونه'); await f.click('#nSave'); await sleep(400);
  let A=await LSg(p,'nt_kpre_v1');
  ok(A.length===1 && A[0].items.length===2 && A[0].items[0].q===4 && A[0].items[0].u==='عدد' && A[0].items[1].q===2 && !('p' in A[0].items[0]) && !('_p' in A[0].items[0]),'دو قلم با تعداد و واحد');
  const Q=A[0].quotes[0];
  ok(A[0].quotes.length===1 && Q.sup==='فروشنده نمونه' && Q.lt[A[0].items[0].id]===1200000 && Q.prices[A[0].items[0].id]===300000 && !(A[0].items[1].id in Q.lt),'پیش‌فاکتور اول خودکار: قیمت کل ذخیره، قیمت واحد حساب شد');
  ok(await f.evaluate(()=>[...document.querySelectorAll('#nRows .nr input')].every(i=>!i.value) && !document.getElementById('nSup').value),'فرم پاک شد');

  console.log('۲) مقایسه: عدد کامل به ریال، سربرگ فروشنده');
  let T=await f.evaluate(()=>document.querySelector('.iq .bd').innerText);
  ok(/۱,۲۰۰,۰۰۰/.test(T) && /واحد ۳۰۰,۰۰۰/.test(T) && !/ م\b|\d م/.test(T.replace(/[^\S\n]+/g,' ')) && /قیمت کل هر قلم به ریال/.test(T),'خانه: قیمت کل کامل و قیمت واحد؛ بی «م»');
  ok(await f.evaluate(()=>document.querySelector('.iq .sups').innerText.trim()==='فروشنده نمونه' && !document.querySelector('.iq .ch')),'سربرگ ستون: نام فروشنده (یک بار)');
  ok(/جمع هر فروشنده \(ریال\)/.test(T),'سربرگ جمع');

  console.log('۳) فرم پیش‌فاکتور فروشنده دوم: قیمت کل');
  await f.evaluate(()=>document.querySelectorAll('details.ed').forEach(d=>d.open=true));
  ok(await f.evaluate(()=>{ const t=document.querySelector('.qt .th').innerText; return /عنوان کالا/.test(t)&&/تعداد/.test(t)&&/قیمت کل \(ریال\)/.test(t); }),'سربرگ فرم: عنوان کالا، تعداد، قیمت کل (ریال)');
  await f.fill('.qt [data-k=sup]','فروشنده نمونه دو'); const ins=await f.$$('.qt [data-it]');
  await ins[0].click(); await p.keyboard.type('1000000'); await ins[1].click(); await p.keyboard.type('۵۰۰۰۰۰');
  ok(await ins[1].inputValue()==='۵۰۰,۰۰۰' && /قیمت واحد: ۲۵۰,۰۰۰/.test(await f.evaluate(()=>document.querySelectorAll('.qt .mw')[1].innerText)),'رقم فارسی هم جدا می‌شود؛ قیمت واحد ۲۵۰٬۰۰۰');
  await f.click('.qt [data-addq]'); await sleep(500);
  A=await LSg(p,'nt_kpre_v1'); const Q2=A[0].quotes[1];
  ok(Q2.lt[A[0].items[0].id]===1000000 && Q2.prices[A[0].items[0].id]===250000 && Q2.lt[A[0].items[1].id]===500000,'دوم: قیمت کل ذخیره، واحد = کل ÷ تعداد');
  T=await f.evaluate(()=>document.querySelector('.iq .bd .lg').innerText);
  ok(/۱,۵۰۰,۰۰۰/.test(T),'ارزان‌ترین ترکیب: '+T);

  console.log('۳-ب) ویرایش پیش‌فاکتور');
  await f.click('[data-qe="'+Q.id+'"]'); await sleep(300);
  const ed=await f.evaluate(()=>{ const q=document.querySelector('[data-qf]'); return {e:q.classList.contains('edit'),h:q.querySelector('[data-qh]').textContent,s:q.querySelector('[data-k=sup]').value,v:[...q.querySelectorAll('[data-it]')].map(i=>i.value),b:q.querySelector('[data-addq]').textContent}; });
  ok(ed.e && /ویرایش پیش‌فاکتور فروشنده نمونه/.test(ed.h) && ed.s==='فروشنده نمونه' && ed.v[0]==='۱,۲۰۰,۰۰۰' && ed.v[1]==='' && ed.b==='ذخیره تغییر','ویرایش: فرم با مبلغ‌های قبلی پر شد');
  await f.fill('.qt [data-it="'+A[0].items[0].id+'"]','900000'); await f.dispatchEvent('.qt [data-it="'+A[0].items[0].id+'"]','input');
  await f.fill('.qt [data-it="'+A[0].items[1].id+'"]','400000'); await f.dispatchEvent('.qt [data-it="'+A[0].items[1].id+'"]','input');
  await f.click('.qt [data-addq]'); await sleep(500);
  A=await LSg(p,'nt_kpre_v1'); const Qe=A[0].quotes.find(x=>x.id===Q.id);
  ok(A[0].quotes.length===2 && A[0].quotes[0].id===Q.id && Qe.lt[A[0].items[0].id]===900000 && Qe.prices[A[0].items[0].id]===225000 && Qe.lt[A[0].items[1].id]===400000 && Qe.sup==='فروشنده نمونه' && Qe.ed,'ذخیره تغییر: همان پیش‌فاکتور عوض شد (تازه اضافه نشد)');
  ok(await f.evaluate(()=>{ const q=document.querySelector('[data-qf]'); return !q.classList.contains('edit') && q.querySelector('[data-addq]').textContent==='افزودن پیش‌فاکتور'; }),'بعد از ذخیره: فرم به حالت افزودن برگشت');
  ok(/۱,۳۰۰,۰۰۰/.test(await f.evaluate(()=>document.querySelector('.iq .bd .lg').innerText)),'ترکیب تازه: ۱٬۳۰۰٬۰۰۰');
  await f.click('[data-qe="'+Q.id+'"]'); await sleep(200); await f.click('.qt [data-qx]'); await sleep(200);
  ok(await f.evaluate(()=>!document.querySelector('[data-qf].edit')),'لغو ویرایش');
  await f.click('[data-send]'); await sleep(300);

  console.log('۴) میز خرید: جمع با قیمت کل');
  await go(p,'میز خرید'); f=await frameOf(p,'میز خرید'); await sleep(300);
  ok(/۱,۳۰۰,۰۰۰|۱٫۳|۱\.۳/.test(await f.evaluate(()=>document.body.innerText)),'میز خرید جمع درست را نشان می‌دهد');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300)); await c.close();
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
