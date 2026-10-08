// راننده: کاربر یک دستگاه — ساخت در مدیریت کاربران، صفحه راننده، محدودیت دستگاه، ارسال، تغییر به کاربر عادی
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const {make}=require('./fakegh.js');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const {S,srv}=make(); await new Promise(r=>srv.listen(0,r));
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const URL1=`http://localhost:${web.address().port}/nt/s.html`;
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,maxDefer:8000,refocus:0,retry:1000,squash:30,seen:60000,seenMin:300};
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  async function ctx(url){ const c=await br.newContext({locale:'fa-IR',viewport:{width:400,height:820}});
    await c.addInitScript(([api,T])=>{ window.NTSYNC_TEST={api,raw:api,T}; },[`http://localhost:${srv.address().port}`,TT]);
    const p=await c.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e))); await p.goto(url||URL1); await p.waitForFunction(()=>window.ntSync); return p; }
  const waitFor=async(fn,ms=15000)=>{ const t=Date.now(); while(Date.now()-t<ms){ try{ if(await fn()) return true; }catch(e){} await sleep(150); } return false; };
  const ls=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);
  const synced=async p=>{ const s=JSON.parse(await ls(p,'ntsync_state_v1')||'{}'); return s.sha===S.tags['nt-data'] && s.hash===await p.evaluate(()=>ntSync.hashOf(ntSync.outgoing(ntSync.collect(),ntSync.baseGet()||{}))); };
  const settle=async p=>{ await sleep(1000); await p.waitForFunction(()=>typeof ntBooted!=='undefined' && ntBooted,null,{timeout:20000}); await sleep(300); };
  const qrText=p=>p.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); return d && !d.hidden?d.innerText:''; });
  const dlgText=p=>p.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); return d.hidden?'':d.innerText; });

  console.log('1) مدیر راننده ZL50 را می‌سازد');
  const A=await ctx();
  await A.waitForFunction(()=>window.ntLocked===false); await A.click('#ntSyBtn'); if(await A.locator('#syOther').count()) await A.click('#syOther');
  await A.waitForSelector('#syTok'); await A.fill('#syTok',S.goodToken); await A.fill('#syP1','mine1405'); await A.fill('#syP2','mine1405'); await A.click('#syStartW');
  await waitFor(()=>!!S.tags['nt-data']); await settle(A);
  if(await dlgText(A)==='') await A.click('#ntSyBtn'); await A.click('#syUsers'); await A.click('#syUNew');
  ok(await A.locator('#syUDev option').count()===18,'فهرست دستگاه‌ها در فرم کاربر (۱۷ + کاربر عادی)');
  await A.fill('#syUName','راننده ZL50'); await A.selectOption('#syUDev','لودر ZL50');
  ok(await A.locator('#syAccCard').isHidden(),'با انتخاب دستگاه، جدول دسترسی پنهان می‌شود');
  await A.click('#syUSave'); await A.waitForSelector('#syLink');
  const link=await A.inputValue('#syLink'), pin=(await A.locator('#syPinOut').innerText()).replace(/\D/g,'');
  await A.click('#syBack');
  ok((await dlgText(A)).includes('راننده — فقط لودر ZL50'),'در لیست کاربران: «راننده — فقط لودر ZL50»');
  const U=JSON.parse(await ls(A,'nt_users_v1')).users, me=Object.values(U).find(u=>u.name==='راننده ZL50');
  ok(JSON.stringify(me.dev)==='["لودر ZL50"]' && me.acl['توقف شیفت']==='w' && me.acl['ثبت مشکلات']==='w' && me.acl['انبار']===undefined,'کاربر: dev و دسترسی راننده');
  await A.click('#syBack'); await A.click('#syClose'); await waitFor(()=>synced(A));

  console.log('2) گوشی راننده');
  const D=await ctx(link);
  await waitFor(async()=>(await dlgText(D)).includes('رمز ۶ رقمی')); await D.fill('#syPin',pin); await D.click('#syJoin');
  await waitFor(()=>D.evaluate(()=>!!(window.ntSync.myDevs && ntSync.myDevs())),20000); await settle(D);
  ok(await waitFor(async()=>(await qrText(D)).includes('لودر ZL50')),'بعد از اتصال، صفحه لودر ZL50 خودکار باز شد');
  ok(await D.evaluate(()=>[...document.querySelectorAll('.tab')].every(t=>t.hidden || getComputedStyle(t).visibility==='hidden')),'هیچ زبانه‌ای دیده نمی‌شود');
  ok(await D.locator('#qrRead').count()===1 && await D.locator('#qrStop').count()===1 && await D.locator('#qrProb').count()===1,'دکمه‌ها: قرائت، توقف، مشکل');
  await D.click('#qrStop'); await D.click('#ntQrBody [data-c="خرابی هیدرولیک"]'); await D.click('#qrSave'); await sleep(300);
  await D.click('#qrClose');
  await D.screenshot({path:'/tmp/driver.png'});
  ok(await D.locator('#ntDrv [data-drv="ZL50"]').isVisible(),'صفحه اصلی راننده: دکمه لودر ZL50');
  await D.evaluate(()=>{ location.hash='#m=WA470'; }); await sleep(600);
  ok(!(await qrText(D)) && (await D.locator('#ntSyToast').innerText()).includes('نه دستگاه شما'),'برچسب دستگاه دیگر → «نه دستگاه شما»');
  await D.evaluate(()=>{ try{ show(2); }catch(e){} }); ok(await D.evaluate(()=>!document.querySelector('iframe.on')),'زبانه‌ها با کد هم باز نمی‌شود');
  ok(await waitFor(()=>synced(D)),'توقف راننده فرستاده شد');
  await A.evaluate(()=>ntSync.sync({manual:true}));
  ok(await waitFor(async()=>((await ls(A,'nt_tavaqof_v1'))||'').includes('خرابی هیدرولیک')),'توقف راننده به مدیر رسید');

  console.log('3) مدیر راننده را کاربر عادی (استخراج) می‌کند');
  await A.click('#ntSyBtn'); await A.click('#syUsers'); await A.locator('.syuser',{hasText:'راننده ZL50'}).locator('[data-act="edit"]').click();
  await A.selectOption('#syUDev',''); await A.click('#syUSave'); await waitFor(()=>synced(A));
  await waitFor(async()=>{ try{ await D.evaluate(()=>ntSync.sync({manual:true})); }catch(e){} return D.evaluate(()=>!ntSync.myDevs()); },25000); await settle(D);
  ok(await D.evaluate(()=>!document.body.classList.contains('ntdriver') && [...document.querySelectorAll('.tab')].some(t=>!t.hidden)),'حالا زبانه‌های مجاز دیده می‌شود (کاربر عادی)');
  for(const p of [A,D]) ok(p.errs.length===0,'بدون خطای اسکریپت '+p.errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
