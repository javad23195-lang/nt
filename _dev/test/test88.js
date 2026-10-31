// کاربر جدید (طرح تازه): نوع، بخش الزامی (تدارکات: مأمور نهبندان / تهران / هر دو)، دستگاه‌هایی که می‌بیند، دسترسی سه‌تایی. همه نام‌ها ساختگی است.
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
  const dlgText=p=>p.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); return d.hidden?'':d.innerText; });
  const users=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('nt_users_v1')).users);
  const A=await ctx();
  await A.waitForFunction(()=>window.ntLocked===false); await A.click('#ntSyBtn'); if(await A.locator('#syOther').count()) await A.click('#syOther');
  await A.waitForSelector('#syTok'); await A.fill('#syTok',S.goodToken); await A.fill('#syP1','mine1405'); await A.fill('#syP2','mine1405'); await A.click('#syStartW');
  await waitFor(()=>!!S.tags['nt-data']); await settle(A);
  const open=async()=>{ if(await dlgText(A)==='') await A.click('#ntSyBtn'); if(await A.locator('#syUsers').count()) await A.click('#syUsers'); await A.click('#syUNew'); };
  const seg=(n)=>A.evaluate(n=>{ const r=document.querySelector(`#syAclList .syacr[data-n="${n}"] button[aria-pressed="true"]`); return r?r.dataset.v:''; },n);

  console.log('۱) فرم: بخش الزامی');
  await open();
  ok(await A.evaluate(()=>document.querySelectorAll('.sysec').length===7 && document.querySelectorAll('.sykhg .sysec').length===3),'۷ گزینه بخش؛ تدارکات با سه گزینه (نهبندان، تهران، هر دو)');
  ok(/تولید/.test(await dlgText(A)) && /۳ دستگاه/.test(await dlgText(A)) && /۵ دستگاه/.test(await dlgText(A)) && /همه دستگاه‌ها/.test(await dlgText(A)),'تعداد دستگاه هر بخش از سامانه: تولید ۳، استخراج ۵، نگهداری همه');
  await A.fill('#syUName','مأمور آزمایشی تهران'); await A.click('#syUSave'); await sleep(200);
  ok(/بخش کاربر را انتخاب کنید/.test(await dlgText(A)),'بدون بخش: پیام');

  console.log('۲) تدارکات — مأمور تهران');
  await A.click('[data-sec="kh_th"]'); await sleep(100);
  ok(await seg('باکس سندپرداز')==='w' && await seg('پیش‌فاکتور')==='w' && await seg('خرید هفتگی')==='h' && await seg('آب شیرین')==='h' && await seg('درخواست خرید')==='r' && await seg('امروز')==='h','پیش‌فرض مأمور تهران: فرم‌های خودش ثبت، هفتگی و آب پنهان، درخواست خرید دیدن');
  ok(await A.evaluate(()=>document.getElementById('syDevCard').hidden),'تدارکات: کارت دستگاه‌ها نیست');
  ok(/تدارکات — مأمور تهران/.test(await A.evaluate(()=>document.getElementById('sySum').textContent)) && /۵ ثبت، ۱ دیدن/.test(await A.evaluate(()=>document.getElementById('sySum').textContent)),'خلاصه پایین: '+await A.evaluate(()=>document.getElementById('sySum').textContent));
  await A.click('#syAclList .syacr[data-n="میز خرید"] [data-v="r"]');
  await A.click('#syUSave'); await A.waitForSelector('#syLink');
  let U=Object.values(await users(A)).find(u=>u.name==='مأمور آزمایشی تهران');
  ok(U.sec==='kh_th' && U.ag==='th' && !U.dept && U.acl['میز خرید']==='r' && U.acl['باکس سندپرداز']==='w' && U.acl['آب شیرین']==='h' && U.acl['لیست خرید']==='w','ذخیره: sec، ag=th، تغییر دستی یک ردیف');
  await A.click('#syBack');
  ok(/تدارکات — مأمور تهران/.test(await dlgText(A)),'فهرست کاربران: نام بخش');

  console.log('۳) استخراج با دو دستگاه');
  await A.click('#syUNew'); await A.fill('#syUName','سرپرست آزمایشی'); await A.click('[data-sec="mine"]');
  ok(await A.evaluate(()=>!document.getElementById('syDevCard').hidden && document.querySelectorAll('#syDevL [data-dv]').length===5),'کارت دستگاه‌ها: ۵ دستگاه استخراج');
  ok(await seg('توقف شیفت')==='w' && await seg('امروز')==='r' && await seg('انبار')==='h','پیش‌فرض استخراج');
  await A.check('#syDevL [data-dv="بیل مکانیکی کوماتسو PC400"]'); await A.check('#syDevL [data-dv="کامیون TRS01"]');
  ok(await A.evaluate(()=>!document.querySelector('#syDevL [data-all]').checked),'«همه دستگاه‌ها» خودکار برداشته شد');
  await A.click('#syUSave'); await A.waitForSelector('#syLink'); await A.click('#syBack');
  U=Object.values(await users(A)).find(u=>u.name==='سرپرست آزمایشی');
  ok(U.sec==='mine' && U.dept==='استخراج' && U.sees.length===2 && U.sees.includes('کامیون TRS01'),'ذخیره: dept=استخراج، sees دو دستگاه');

  console.log('۴) ویرایش: راننده و برگشت');
  await A.locator('.syuser',{hasText:'سرپرست آزمایشی'}).locator('[data-act="edit"]').click();
  ok(await A.evaluate(()=>document.querySelector('[data-sec="mine"]').getAttribute('aria-pressed')==='true' && document.querySelectorAll('#syDevL [data-dv]:checked').length===2),'ویرایش: بخش و دستگاه‌های قبلی');
  await A.click('#syTDrv'); ok(await A.evaluate(()=>document.getElementById('sySecCard').hidden && document.getElementById('syAccCard').hidden && !document.getElementById('syDrvCard').hidden),'راننده: فقط دستگاه');
  await A.click('#syUSave'); await sleep(150); ok(/دستگاه راننده را انتخاب کنید/.test(await dlgText(A)),'راننده بدون دستگاه: پیام');
  await A.click('#syTPer'); await A.click('[data-sec="kh_all"]'); await A.click('#syUSave'); await sleep(300);
  U=Object.values(await users(A)).find(u=>u.name==='سرپرست آزمایشی');
  ok(U.sec==='kh_all' && !U.ag && !U.sees && !U.dept,'تغییر بخش به «هر دو مأمور»: دستگاه‌ها و dept پاک شد');

  console.log('۵) فیلتر دستگاه‌ها (sees)');
  ok(await A.evaluate(()=>{ ntSync.mySees=()=>['کامیون TRS01']; return ntDept.mine('کامیون TRS01') && !ntDept.mine('لودر ZL50'); }),'ntDept.mine: فقط دستگاه‌های انتخاب‌شده');
  ok(A.errs.length===0,'بدون خطای اسکریپت '+A.errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
