// مبلغ‌ها: کسی که پیش‌فاکتور/فاکتور را نمی‌بیند (canMoney=false) در «شناسنامه» و «برون‌سپاری» مبلغ نمی‌بیند؛ ویرایش او مبلغ قبلی را پاک نمی‌کند. همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const lists=require('./lists.fixture.js');
  async function open(cfg,seed){ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.addInitScript(([cfg,seed,L])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntws_test','1'); localStorage.setItem('nt_lists_v1',L);
      if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); Object.keys(seed||{}).forEach(k=>localStorage.setItem(k,seed[k])); },[cfg,seed,lists]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin,#ntWs{display:none!important}'});
    await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(600);
    const fr=async n=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); await p.evaluate(i=>show(i),i); await sleep(1600); return (await p.$$('iframe'))[i].contentFrame(); };
    return {c,p,errs,fr}; }
  const SH=JSON.stringify({rows:[{id:'r1',reg:'1405/07/21',st:'1405/07/21',dev:'لودر ZL50',act:'تعمیر',kind:'EM',dur:'2:00:00',desc:'تعمیر نمونه',hasA:true,rep:'تعمیرکار آزمایشی',costA:'5000000',payA:'نقدی',docA:'A1',hasK:true,part:'قطعه نمونه',sup:'فروشگاه آزمایشی',costK:'3000000',payK:'اعتباری',docK:'K1'}]});
  const OS=JSON.stringify([{id:'j1',dev:'لودر ZL50',ven:'تعمیرگاه آزمایشی',desc:'تراش نمونه',ws:'1405/07/01',amt:'7000000',steps:{}}]);
  const MONEY=/ریال|۵,۰۰۰,۰۰۰|5,000,000|۳,۰۰۰,۰۰۰|۸,۰۰۰,۰۰۰|7,000,000|۷,۰۰۰,۰۰۰|اکسل برای مالی|هزینه ماهانه/;

  console.log('۱) سیستم مدیر: مبلغ دیده می‌شود');
  let {c,p,errs,fr}=await open({mode:'w'},{nt_sh8_v1:SH,nt_outsrc_v1:OS});
  let f=await fr('شناسنامه'); let T=await f.evaluate(()=>document.body.innerText);
  ok(!(await f.evaluate(()=>document.documentElement.classList.contains('nomoney'))) && MONEY.test(T),'مدیر: مبلغ و «اکسل برای مالی» دیده می‌شود');
  f=await fr('برون‌سپاری'); const TB=await f.evaluate(()=>document.body.innerText); ok(/ریال/.test(TB),'مدیر: مبلغ برون‌سپاری دیده می‌شود '+(await f.evaluate(()=>(document.getElementById('list')||{}).innerText||'')).slice(0,200).replace(/\s+/g,' '));
  await c.close();

  console.log('۲) سرپرست نگهداری (بدون پیش‌فاکتور و فاکتور)');
  ({c,p,errs,fr}=await open({mode:'w',uid:'u1',uname:'سرپرست آزمایشی',acl:{'شناسنامه':'w','برون‌سپاری':'w','امروز':'r'},sec:'pm',role:'s'},{nt_sh8_v1:SH,nt_outsrc_v1:OS}));
  ok(await p.evaluate(()=>!ntSync.canMoney()),'canMoney = false');
  f=await fr('شناسنامه'); T=await f.evaluate(()=>document.body.innerText);
  ok(await f.evaluate(()=>document.documentElement.classList.contains('nomoney')) && !MONEY.test(T),'شناسنامه: هیچ مبلغ، جمع، هزینه ماهانه یا اکسل مالی دیده نمی‌شود '+(T.match(MONEY)||[''])[0]);
  ok(/تعمیرکار آزمایشی/.test(T) && /فروشگاه آزمایشی/.test(T),'نام تعمیرکار و فروشنده هنوز دیده می‌شود');
  await f.evaluate(()=>{ document.querySelector('#slips .slip .edit').click(); }); await sleep(500);
  ok(await f.evaluate(()=>document.getElementById('fCostA').value==='5000000' && document.getElementById('fCostA').offsetParent===null) && !MONEY.test(await f.evaluate(()=>document.body.innerText)),'ویرایش: کادر مبلغ پنهان ولی مقدار سر جایش');
  await f.evaluate(()=>{ const e=document.getElementById('fDesc')||document.querySelector('[data-f=desc]'); }); await f.evaluate(()=>document.getElementById('bAdd').click()); await sleep(600);
  const R=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_sh8_v1')).rows);
  ok(R.length>=1 && R.every(r=>!r.hasA||r.costA==='5000000') && R.some(r=>r.costA==='5000000') && R.some(r=>r.costK==='3000000'),'بعد از ذخیره: مبلغ‌های قبلی پاک نشد');
  f=await fr('برون‌سپاری'); T=await f.evaluate(()=>document.body.innerText);
  ok(!/ریال/.test(T) && !/7,000,000|۷,۰۰۰,۰۰۰/.test(T) && /تعمیرگاه آزمایشی|تراش نمونه|لودر/.test(T),'برون‌سپاری: مبلغ دیده نمی‌شود، کار دیده می‌شود');
  ok(!errs.length,'بدون خطا '+errs.join(' | ').slice(0,200)); await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
