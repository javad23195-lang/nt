// انبار: ثبت مصرف سریع (انباردار)، منتظر سندپرداز (شماره سند، برگرداندن)، ثبت‌های من، خروجی اکسل، بارگذاری موجودی، «امروز». همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=dt=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(dt); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
const ago=n=>J(new Date(Date.now()-n*864e5));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:412,height:900}});
  await c.addInitScript(()=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({mode:'w'}));
    localStorage.setItem('nt_stock_v1',JSON.stringify({at:'1405/08/01',items:{'112045':{n:'روغن هیدرولیک 68',q:400,u:'لیتر'},'115002':{n:'گریس نسوز',q:30,u:'کیلوگرم'}}}));
    localStorage.setItem('nt_anbar_out_v1',JSON.stringify({row:720,rows:[{date:'1405/08/01',y:1405,m:8,d:1,dev:'لودر ZL50',item:'کالای قدیمی',qty:1,why:'مورد نیاز لودر ZL50',cond:'',doc:'1900'}]})); } });
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntQr,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd,#ntPin,#ntSp{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(800);
  if(await p.locator('#ntWs [data-ws="nt"]').count()){ try{ await p.click('#ntWs [data-ws="nt"]',{timeout:3000}); }catch(e){} await sleep(800); }
  const go=async t=>{ await p.evaluate(t=>show(DOCS.findIndex(d=>d.name===t)),t); await sleep(1500); return await (await p.$$('iframe'))[await p.evaluate(t=>DOCS.findIndex(d=>d.name===t),t)].contentFrame(); };
  const OUT=()=>p.evaluate(()=>JSON.parse(localStorage.nt_anbar_out_v1).rows);
  let f=await go('انبار');

  console.log('۱) ثبت مصرف سریع');
  ok(await f.evaluate(()=>!document.getElementById('qkCard').hidden && !document.getElementById('pdCard').hidden && document.getElementById('mnCard').hidden),'کارت ثبت مصرف و منتظر سندپرداز (سیستم مدیر)');
  let R=await OUT(); ok(R.length===1 && /^a/.test(R[0].id||''),'ردیف قدیمی شناسه گرفت (از متن خودش)');
  await f.click('#qDevs [data-dv="بیل مکانیکی کوماتسو PC290"]');
  await f.fill('#qItem','هیدرولیک ۶۸'); await sleep(100);
  ok(/کد ۱۱۲۰۴۵/.test(await f.evaluate(()=>document.getElementById('qSug').innerText)) && /۴۰۰ لیتر/.test(await f.evaluate(()=>document.getElementById('qSug').innerText)),'پیشنهاد از موجودی سندپرداز: کد و موجودی');
  await f.click('#qSug button[data-i="0"]'); await f.fill('#qQty','20');
  await f.click('#qGo'); await sleep(300);
  R=await OUT(); let q=R.find(r=>r.src==='q');
  ok(q && q.item==='روغن هیدرولیک 68' && q.code==='112045' && q.qty===20 && q.dev==='بیل مکانیکی کوماتسو PC290' && q.u==='لیتر' && q.id && !q.svc && !q.doc,'ردیف ثبت شد (کالا، کد، مقدار، دستگاه، شناسه)');
  ok(/ثبت شد/.test(await f.evaluate(()=>document.getElementById('qMsg').textContent)) && await f.evaluate(()=>document.getElementById('qItem').value===''),'پیام و پاک شدن فرم برای قلم بعدی');
  await f.fill('#qDev','خط والس'); await f.fill('#qItem','گریس'); await f.press('#qItem','Enter'); await f.fill('#qQty','15'); await f.press('#qQty','Enter'); await sleep(300);
  await f.click('#qGo'); await sleep(200);
  ok(/دستگاه یا محل مصرف|کالا را بنویسید|مقدار را بنویسید/.test(await f.evaluate(()=>document.getElementById('qMsg').textContent)),'فرم خالی: پیام');
  R=await OUT(); ok(R.filter(r=>r.src==='q').length===2 && R.some(r=>r.item==='گریس نسوز' && r.dev==='خط والس' && r.code==='115002'),'Enter: انتخاب اولین پیشنهاد و ثبت (محل بدون دستگاه)');

  console.log('۲) منتظر سندپرداز');
  let T=await f.evaluate(()=>document.getElementById('pdCard').innerText);
  ok(/روغن هیدرولیک 68/.test(T) && /گریس نسوز/.test(T) && !/کالای قدیمی/.test(T) && /کپی همه برای سندپرداز \(۲ قلم\)/.test(T),'دو کارت منتظر؛ ردیف دارای سند نیست');
  q=(await OUT()).find(r=>r.item==='روغن هیدرولیک 68');
  await f.fill(`.pd[data-id="${q.id}"] [data-doc]`,'۱۹۷۷'); await f.click(`.pd[data-id="${q.id}"] [data-ok]`); await sleep(300);
  q=(await OUT()).find(r=>r.item==='روغن هیدرولیک 68');
  ok(q.doc==='1977' && q.docAt,'شماره سند ثبت شد (رقم فارسی هم)');
  const g=(await OUT()).find(r=>r.item==='گریس نسوز');
  await f.click(`.pd[data-id="${g.id}"] [data-bk]`); await f.fill(`.pd[data-id="${g.id}"] [data-bkt]`,'<img src=x onerror=window.__z=1>کد درست را بنویس'); await f.click(`.pd[data-id="${g.id}"] [data-bks]`); await sleep(300);
  ok(/کد درست را بنویس/.test((await OUT()).find(r=>r.id===g.id).back.t) && /برگشت خورده/.test(await f.evaluate(()=>document.getElementById('pdCard').innerText)) && !(await f.evaluate(()=>window.__z||!!document.querySelector('#pdCard img'))),'برگرداندن با توضیح (متن خطرناک بی‌اثر)');
  const sum=await p.evaluate(()=>JSON.parse(localStorage.nt_anbar_sum_v1));
  ok(sum.pend===0 && sum.back===1,'خلاصه برای «امروز»: ۰ منتظر، ۱ برگشت');

  console.log('۳) خروجی اکسل و پاک کردن');
  ok(await f.evaluate(()=>{ const v=document.getElementById('oBox').value; return /1977/.test(v) && /1900/.test(v) && !/گریس نسوز/.test(v); }),'خروجی اکسل: فقط ردیف‌های دارای سند');
  await f.evaluate(()=>{ document.getElementById('xlFold').open=true; }); await f.click('#oClear'); await f.click('#oClear'); await sleep(300);
  R=await OUT(); ok(R.length===1 && R[0].item==='گریس نسوز','پاک کردن لیست: ردیف منتظر (برگشتی) ماند');

  console.log('۴) انباردار: ثبت‌های من و اصلاح');
  await p.evaluate(()=>{ ntSync.mySec=()=>'anbar'; ntSync.myName=()=>'انباردار آزمایشی'; }); await f.evaluate(()=>anFlowDraw()); await sleep(100);
  ok(await f.evaluate(()=>document.getElementById('pdCard').hidden && !document.getElementById('mnCard').hidden),'انباردار: «ثبت‌های من»، بدون «منتظر سندپرداز»');
  await f.click('#qDevs [data-dv="کامیون TRS02"]'); await f.fill('#qItem','تسمه A57'); await f.fill('#qQty','1'); await f.click('#qGo'); await sleep(300);
  R=await OUT(); const ts=R.find(r=>r.item==='تسمه A57');
  ok(ts && ts.by==='انباردار آزمایشی' && !ts.code,'کالای بدون کد هم ثبت می‌شود؛ نام انباردار');
  T=await f.evaluate(()=>document.getElementById('mnList').innerText);
  ok(/تسمه A57/.test(T) && /منتظر سندپرداز/.test(T),'ثبت‌های من: وضعیت «منتظر سندپرداز»');
  await p.evaluate(()=>{ ntSync.myName=()=>''; }); await f.evaluate(()=>anFlowDraw());
  T=await f.evaluate(()=>document.getElementById('mnList').innerText);
  ok(/برگشت: .*کد درست را بنویس/.test(T),'برگشتی با توضیح دیده می‌شود');
  await f.click(`.mn[data-id="${g.id}"] [data-ed]`); await sleep(100);
  ok(await f.evaluate(()=>document.getElementById('qItem').value==='گریس نسوز' && document.getElementById('qGo').textContent==='ذخیره اصلاح'),'«اصلاح»: فرم پر شد');
  await f.fill('#qQty','12'); await f.click('#qGo'); await sleep(300);
  const g2=(await OUT()).find(r=>r.id===g.id); ok(g2.qty===12 && !g2.back && (await OUT()).length===2,'اصلاح: همان ردیف، برگشت برداشته شد');

  console.log('۵) بارگذاری موجودی سندپرداز');
  await f.evaluate(()=>document.querySelector('.tab[data-p="stock"]').click());
  await p.evaluate(()=>{ ntReport.readAoa=async()=>[['کد کالا','نام کالا','واحد اصلی','موجودی واحد اصلی'],['900001','کالای آزمایشی تازه','عدد','7']]; });
  await f.setInputFiles('#stFile',{name:'s.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('x')}); await sleep(400);
  const so=await p.evaluate(()=>JSON.parse(localStorage.nt_stock_v1));
  ok(so.items['900001'] && so.items['900001'].q===7 && /۱ کالا/.test(await f.evaluate(()=>document.getElementById('stAt').textContent)),'فایل موجودی از زبانه انبار خوانده شد');

  console.log('۶) «امروز»');
  await p.evaluate(()=>{ ntSync.mySec=()=>''; }); await f.evaluate(()=>anFlowDraw());
  const t2=await go('امروز'); await t2.evaluate(()=>{ try{ atRender(); }catch(e){} }); await sleep(200);
  ok(/۲ مصرف انبار منتظر سندپرداز/.test(await t2.evaluate(()=>document.getElementById('atList').innerText)),'نیاز به توجه: «۲ مصرف انبار منتظر سندپرداز»');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300));
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
