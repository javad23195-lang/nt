// واحدها (چند واحد)، نقش، مدیریت کل در فرم کاربر. همه نام‌ها ساختگی است.
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

  console.log('۱) دو واحد + نقش مدیر');
  await open(); await A.fill('#syUName','مدیر آزمایشی');
  await A.click('[data-sec="pm"]'); await A.click('[data-sec="kh_all"]'); await sleep(100);
  ok(await A.evaluate(()=>['pm','kh_all'].every(k=>document.querySelector(`[data-sec="${k}"]`).getAttribute('aria-pressed')==='true')),'دو واحد با هم روشن');
  ok(await seg('امروز')==='w' && await seg('باکس سندپرداز')==='w' && await seg('پیش‌فاکتور')==='w','دسترسی دو واحد با هم (بیشترین)');
  await A.click('[data-sec="kh_nb"]'); await sleep(80);
  ok(await A.evaluate(()=>document.querySelector('[data-sec="kh_all"]').getAttribute('aria-pressed')==='false' && document.querySelector('[data-sec="kh_nb"]').getAttribute('aria-pressed')==='true'),'از تدارکات فقط یکی');
  await A.click('[data-sec="kh_all"]');
  ok(!(await A.evaluate(()=>document.getElementById('syUAppr').checked)),'پیش از نقش: تأیید خاموش');
  await A.click('#syRoleCard [data-role="m"]'); await sleep(80);
  ok(await A.evaluate(()=>document.getElementById('syUAppr').checked),'نقش مدیر: تأیید پیش‌فاکتور خودکار روشن');
  ok(/نگهداری و تعمیرات \+ تدارکات — هر دو مأمور/.test(await A.evaluate(()=>document.getElementById('sySum').textContent)) && /مدیر/.test(await A.evaluate(()=>document.getElementById('sySum').textContent)),'خلاصه: '+await A.evaluate(()=>document.getElementById('sySum').textContent));
  await A.click('#syUSave'); await A.waitForSelector('#syLink'); await A.click('#syBack');
  let U=Object.values(await users(A)).find(u=>u.name==='مدیر آزمایشی');
  ok(U.sec==='pm' && U.secs.join()==='pm,kh_all' && U.role==='m' && U.appr===1 && U.dept==='نگهداری و تعمیرات' && !U.ag && !U.sees,'ذخیره: sec اول، secs، role، appr');
  ok(/نگهداری و تعمیرات \+ تدارکات — هر دو مأمور — مدیر/.test(await dlgText(A)),'فهرست کاربران: واحدها و نقش');

  console.log('۲) مدیریت کل: فقط دیدن، مبلغ‌ها');
  await A.click('#syUNew'); await A.fill('#syUName','مدیر کل آزمایشی'); await A.click('[data-sec="boss"]'); await A.click('#syRoleCard [data-role="m"]'); await sleep(80);
  ok(await seg('مدیریت')==='r' && await seg('پیش‌فاکتور')==='r' && await seg('فاکتور خرید')==='r' && await seg('امروز')==='h' && await seg('باکس سندپرداز')==='h' && await seg('شناسنامه')==='h','پیش‌فرض: مدیریت، پیش‌فاکتور و فاکتور فقط دیدن؛ بقیه پنهان');
  ok(!(await A.evaluate(()=>document.getElementById('syUAppr').checked)) && await A.evaluate(()=>document.getElementById('syDevCard').hidden),'مدیریت کل: بدون تأیید، بدون کارت دستگاه');
  await A.click('#syUSave'); await A.waitForSelector('#syLink'); await A.click('#syBack');
  U=Object.values(await users(A)).find(u=>u.name==='مدیر کل آزمایشی'); ok(U.sec==='boss' && !U.secs && !U.dept && !U.appr,'ذخیره مدیریت کل');

  console.log('۳) کارخانه + استخراج: دستگاه‌های هر دو');
  await A.click('#syUNew'); await A.fill('#syUName','سرپرست دو واحد'); await A.click('[data-sec="prod"]'); await A.click('[data-sec="mine"]'); await A.click('#syRoleCard [data-role="s"]'); await sleep(80);
  ok(await A.evaluate(()=>document.querySelectorAll('#syDevL [data-dv]').length===8),'کارت دستگاه‌ها: ۳ + ۵ دستگاه');
  await A.click('#syUSave'); await A.waitForSelector('#syLink'); await A.click('#syBack');
  U=Object.values(await users(A)).find(u=>u.name==='سرپرست دو واحد');
  ok(U.sec==='prod' && U.secs.join()==='prod,mine' && U.role==='s' && !U.dept && U.sees.length===8,'دو واحد دستگاه‌دار: بدون dept، sees = همه دستگاه‌های هر دو');
  await A.locator('.syuser',{hasText:'سرپرست دو واحد'}).locator('[data-act="edit"]').click();
  ok(await A.evaluate(()=>['prod','mine'].every(k=>document.querySelector(`[data-sec="${k}"]`).getAttribute('aria-pressed')==='true') && document.querySelector('#syRoleCard [data-role="s"]').getAttribute('aria-pressed')==='true'),'ویرایش: واحدها و نقش قبلی');
  await A.click('[data-sec="mine"]'); await A.click('#syUSave'); await sleep(300);
  U=Object.values(await users(A)).find(u=>u.name==='سرپرست دو واحد'); ok(U.sec==='prod' && !U.secs && U.dept==='تولید' && !U.sees,'یک واحد برداشته شد: فقط کارخانه');

  ok(A.errs.length===0,'بدون خطای اسکریپت '+A.errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
