// «برنامه هفتگی انبار»: سرویس‌های پیش رو، لیتر از جدول روغن، کسری با موجودی سندپرداز (کد یا نام)، «آماده شد»، دسترسی فقط‌دیدن، بارگذاری فایل‌ها.
// همه نام‌های روغن و کدها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=n=>{ const d=new Date(Date.now()+n*864e5); const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d), g=t=>p.find(x=>x.type===t).value; return g('year')+'/'+g('month')+'/'+g('day'); };
const N='برنامه هفتگی انبار';
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const DATA={
    nt_svc_v1:[{id:'s1',dev:'لودر ZL50',name:'روغن موتور',every:250,last:1000,ld:J(-30),months:12},     // ۳۰ روز ۲۱۰ ساعت → ۷/روز؛ ۴۰ ساعت مانده → ~۶ روز
               {id:'s2',dev:'کامیون TRS02',name:'روغن موتور',every:5000,last:20000,ld:J(-40),months:12},  // گذشته (۲۵۲۰۰)
               {id:'s3',dev:'بیل مکانیکی کوماتسو PC290',name:'روغن هیدرولیک',every:2000,last:1000,ld:J(-10),months:12},
               {id:'s4',dev:'بیل مکانیکی کوماتسو PC290',name:'روغن گردان',every:1000,last:900,ld:J(-400),months:12}], // فقط زمان گذشته → بازرسی // خیلی دور
    nt_daftar_v1:[{dev:'لودر ZL50',val:1000,date:J(-30)},{dev:'لودر ZL50',val:1210,date:J(0)},{dev:'کامیون TRS02',val:20000,date:J(-40)},{dev:'کامیون TRS02',val:25200,date:J(0)},{dev:'بیل مکانیکی کوماتسو PC290',val:1000,date:J(-10)},{dev:'بیل مکانیکی کوماتسو PC290',val:1050,date:J(0)}],
    nt_oil_v1:{rows:[{dev:'بیل مکانیکی کوماتسو PC290',part:'روغن گردان',oil:'روغن نمونه 20W-50',code:'111111',l:8},{dev:'لودر ZL50',part:'روغن موتور',oil:'روغن نمونه 20W-50',code:'111111',l:28},{dev:'کامیون TRS02',part:'روغن موتور',oil:'روغن نمونه 20W-50',code:'111111',l:24}]},
    nt_stock_v1:{at:J(0),items:{'111112':{n:'روغن نمونه 50-20',q:30,u:'لیتر'}}}};
  const run=async cfg=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.addInitScript(([cfg,D])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); Object.keys(D).forEach(k=>localStorage.setItem(k,JSON.stringify(D[k]))); },[cfg,DATA]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntWs,null,{timeout:15000});
    await p.addStyleTag({content:'.sybd,#ntPin,#ntSyDlg{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1200);
    await p.evaluate(n=>window.postMessage({nt:'go',tab:n},'*'),N); await sleep(1500);
    const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),N); const f=await (await p.$$('iframe'))[i].contentFrame();
    return {c,p,f,errs}; };

  console.log('۱) مهندس (ثبت)');
  let {c,p,f,errs}=await run({mode:'w'});
  let T=await f.evaluate(()=>document.body.innerText);
  ok(/سررسید گذشته/.test(T) && /کامیون TRS02/.test(T) && /لودر ZL50/.test(T) && !/روغن هیدرولیک/.test(T),'کامیون گذشته، لودر این هفته، هیدرولیک بیل دور (نیست)');
  ok(await f.evaluate(()=>[...document.querySelectorAll('.kp3 .k b')].map(b=>b.textContent).join(','))==='۱,۱,۰,۱','خلاصه: ۱ گذشته، ۱ این هفته، ۰ هفته بعد، ۱ بازرسی');
  ok(await f.evaluate(()=>{ const g=[...document.querySelectorAll('.grp')].find(x=>/بازرسی کنید/.test(x.querySelector('h2').textContent)); return !!g && /روغن گردان/.test(g.innerText) && !g.querySelector('.rdy'); }),'گردان بیل (فقط زمان): گروه «بازرسی کنید»، بدون «آماده شد»');
  ok(/حدود ۶ روز دیگر/.test(T) && /۴۰ ساعت مانده/.test(T),'روز مانده از کارکرد واقعی (۷ ساعت در روز)');
  ok(/۵,?۲۰۰ کیلومتر گذشته|۲۰۰ کیلومتر گذشته/.test(T),'کامیون: کیلومتر گذشته — '+(T.match(/[\d۰-۹,]+ کیلومتر گذشته/)||[''])[0]);
  const ND=await f.evaluate(()=>document.getElementById('need').innerText.replace(/\s+/g,' '));
  ok(/روغن نمونه 20W-50/.test(ND) && /۵۲/.test(ND) && /۳۰/.test(ND) && /۲۲/.test(ND) && /با نام/.test(ND),'نیاز ۵۲، موجودی ۳۰ (با نام، کد فرق داشت)، کسری ۲۲ — '+ND);
  await f.click('.rdy'); await sleep(200);
  ok(Object.keys((await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_wplan_v1')))).ready).length===1 && /آماده شد/.test(await f.evaluate(()=>document.querySelector('.rdy').textContent)),'«آماده شد» ذخیره شد');
  await f.click('#rng [data-r="30"]'); await sleep(200);
  ok(!/روغن هیدرولیک/.test(await f.evaluate(()=>document.body.innerText)),'۳۰ روز: هیدرولیک بیل هنوز دور است');
  // بارگذاری موجودی
  await p.evaluate(()=>{ window.ntReport.readAoa=async()=>[['کد تفصيل','نام تفصيل','كد كالا','نام کالا','مقدار وارده','مقدار صادره','موجودي_x000D_\nواحد اصلي','واحد اصلي'],[1,'مشترک','111111','روغن نمونه 20W-50',100,40,60,'ليتر'],[1,'مشترک','222222','<b>x</b>',5,0,5,'عدد']]; });
  await f.evaluate(()=>document.getElementById('stW').open=true);
  await f.setInputFiles('#stFile',{name:'s.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('x')}); await sleep(500);
  const SK=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_stock_v1')));
  ok(SK.items['111111'].q===60 && !/[<>]/.test(SK.items['222222'].n),'فایل موجودی: کد ۱۱۱۱۱۱ = ۶۰؛ < > پاک شد');
  ok(/✓/.test(await f.evaluate(()=>document.getElementById('need').innerText)),'با موجودی تازه کسری نیست');
  // جدول روغن از فایل چندبرگه‌ای
  await p.evaluate(()=>{ window.ntReport.readAoa=async(b,o)=>{ const A=[['x'],[null,'دستگاه','بخش','نوع روغن','کد کالا','لیتر'],[null,'بیل مکانیکی کوماتسو PC290','روغن هیدرولیک','روغن نمونه H','333333','150']]; return o&&o.find&&o.find(A)?A:null; }; });
  await f.evaluate(()=>document.getElementById('olW').open=true);
  await f.setInputFiles('#olFile',{name:'o.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('x')}); await sleep(500);
  ok((await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_oil_v1')).rows.length))===4,'جدول روغن از اکسل: ردیف تازه اضافه شد');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200)); await c.close();

  console.log('۲) انبار: فقط همین زبانه');
  ({c,p,f,errs}=await run({uid:'u9',mode:'w',acl:{[N]:'w'}}));
  ok(await p.evaluate(()=>DOCS.filter((d,i)=>!tabs[i].hidden).map(d=>d.name).join('،'))===N,'انبار فقط «برنامه هفتگی انبار» را می‌بیند');
  ok(await f.evaluate(()=>!document.querySelector('.rdy').disabled && document.getElementById('olEd').hidden && !document.getElementById('stPick').closest('[hidden]')),'انبار: «آماده شد» و فایل موجودی دارد؛ جدول روغن را عوض نمی‌کند');
  await c.close();
  ({c,p,f,errs}=await run({uid:'u8',mode:'w',acl:{[N]:'r'}}));
  ok(await f.evaluate(()=>document.querySelector('.rdy').disabled && !!document.getElementById('stPick').closest('[hidden]')),'فقط‌دیدن: بدون دکمه');
  await c.close();
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
