// انبار: کد منتقل‌شده (40240034 → 966651) و «دلیل نیاز» دستگاه دیگر — داخل خود سامانه
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const {make}=require('./fakegh.js');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const G=make(); await new Promise(r=>G.srv.listen(0,r)); const GH='http://localhost:'+G.srv.address().port;
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({viewport:{width:430,height:860},locale:'fa-IR'});
  const row=(o)=>Object.assign({date:'1405/07/01',y:1405,m:7,d:1,qty:1,cond:''},o);
  const seed={
    nt_anbar_out_v1:JSON.stringify({row:720,rows:[
      row({dev:'لودر ZL50',item:'روغن دنده SAE 30W',qty:35,why:'مورد نیاز لودر کوماتسو WA470',svc:1,svcName:'روغن گیربکس'}),
      row({dev:'بیل مکانیکی کوماتسو PC400',item:'روغن هیدرولیک H 68',qty:20,why:'سرریز روغن هیدرولیک'}),
      row({dev:'خط',item:'گریس نسوز',why:'مورد نیاز خط خردایش'}),
      row({dev:'کامیون مایلر 2624',item:'گریس نسوز',why:'مورد نیاز کامیون مایلر ۲۶۲۴'}),
      row({dev:'واحد نگهداری و تعمیرات',item:'گریس نسوز',why:'مورد نیاز لودر ZL50'}),
      row({dev:'کامیون TRS02',item:'فیلتر X',why:'مورد نیاز لودرکوماتسو WA470'})]}),
    nt_anbar_in_v1:JSON.stringify({row:1394,rows:[row({item:'قفل آویز 75 برنجی',qty:2,type:'نو',cond:'خرید',src:''})]})};
  await c.addInitScript(([GH,seed])=>{ window.NTSYNC_TEST={api:GH,raw:GH};
    if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(seed).forEach(k=>localStorage.setItem(k,seed[k])); } },[GH,seed]);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync && ntBooted);
  await p.evaluate(()=>show(DOCS.findIndex(d=>d.name==='انبار'))); const f=p.frameLocator('iframe.on');
  await f.locator('#oAdd').waitFor({state:'attached'}); await sleep(400);
  const O=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('nt_anbar_out_v1')).rows);
  let R=await O();
  ok(R[0].why==='مورد نیاز لودر ZL50','دلیل «WA470» روی ردیف ZL50 درست شد → '+R[0].why);
  ok(R[1].item==='روغن هیدرولیک H68','ردیف قبلی روغن هیدرولیک به کالای کد جدید رفت → '+R[1].item);
  ok(R[2].why==='مورد نیاز خط خردایش','«خط خردایش» برای «خط» دست نخورد');
  ok(R[3].why==='مورد نیاز کامیون مایلر ۲۶۲۴','همان دستگاه با رقم فارسی دست نخورد');
  ok(R[4].why==='مورد نیاز لودر ZL50','واحد نت برای یک دستگاه دیگر دست نخورد');
  ok(R[5].why==='مورد نیاز کامیون TRS02','«لودرکوماتسو WA470» (بدون فاصله) روی TRS02 درست شد → '+R[5].why);
  const I=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_anbar_in_v1')).rows);
  ok(I[0].item==='قفل آويز 75 برنجي','ورود قفل آویز به کد جدید 967281 رفت → '+I[0].item);
  // تعویض روغن هیدرولیک ZL50 از کارت سرویس
  await f.locator('#oNew').click(); await sleep(300);
  await f.locator('#oDev').fill('لودر ZL50'); await f.locator('#oDev').dispatchEvent('input'); await sleep(200);
  const card=f.locator('.nsvc',{hasText:'روغن هیدرولیک'}).first();
  ok((await card.innerText()).includes('966651'),'کارت سرویس کد 966651 را نشان می‌دهد');
  await card.locator('.nadd').dispatchEvent('click'); await sleep(300);
  R=await O(); const last=R.find(r=>r.dev==='لودر ZL50' && r.svc && r.qty===140)||{};
  ok(last.item==='روغن هیدرولیک H68' && last.qty===140 && last.dev==='لودر ZL50','تعویض روغن هیدرولیک ZL50 با کالای جدید ثبت شد → '+last.item+' '+last.qty);
  // انتخاب کالای کد قدیمی در فرم
  if(!(await f.locator('#oItem').isVisible())){ await f.locator('#oNew').click(); await sleep(300); }
  await f.locator('#oItem').fill('40240034'); await sleep(150);
  await f.locator('#lOItem .o').first().dispatchEvent('mousedown'); await sleep(150);
  ok(await f.locator('#oItem').inputValue()==='روغن هیدرولیک H68','انتخاب کالای کد قدیمی → کالای جدید گذاشته شد');
  ok((await f.locator('#toast').innerText()).includes('966651'),'پیام «کد عوض شده» آمد');
  // گزارش: کد جدید
  ok(await p.evaluate(()=>{ const s=localStorage.getItem('nt_anbar_out_v1'); return !s.includes('H 68'); }),'دیگر هیچ ردیفی با نام قدیمی نیست');
  ok(errs.length===0,'بدون خطای اسکریپت '+errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); G.srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
