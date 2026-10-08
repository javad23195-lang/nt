// به‌روزرسانی از نسخه قبلی سامانه (که کاربر الان دارد) به نسخه جدید
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs');
const {make}=require('./fakegh.js');
const OLD=fs.readFileSync(process.env.NT_OLD||require('path').join(__dirname,'..','..','سامانه-نت.html')), NEW=fs.readFileSync(require('path').join(__dirname,'..','out.html'));
let cur=OLD, fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const {S,srv}=make(); await new Promise(r=>srv.listen(0,r));
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(cur); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,auto:1200,refocus:0,retry:1000,seen:4000,seenMin:300};
  const mk=async seed=>{ const c=await br.newContext({locale:'fa-IR'});
    await c.addInitScript(([api,T,seed])=>{ window.NTSYNC_TEST={api,raw:api,T}; if(seed&&!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(seed).forEach(k=>localStorage.setItem(k,seed[k])); } },[`http://localhost:${srv.address().port}`,TT,seed||null]);
    const p=await c.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e))); await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync); return p; };
  const ls=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);
  const waitFor=async(fn,ms=9000)=>{ const t=Date.now(); while(Date.now()-t<ms){ try{ if(await fn()) return true; }catch(e){} await sleep(100); } return false; };
  const seed={nt_anbar_out_v1:JSON.stringify({row:720,rows:[{date:'1405/07/15',dev:'WA470',item:'روغن',qty:20}]}),nt_daftar_v1:JSON.stringify([{dev:'لودر ZL50',unit:'ساعت',val:15094,date:'1405/07/13'}])};
  // نسخه قبلی: سیستم اصلی و یک مشاهده‌کننده
  const A=await mk(seed); await A.click('#ntSyBtn'); await A.click('#syOther'); await A.fill('#syTok',S.goodToken); await A.fill('#syP1','mine1405'); await A.fill('#syP2','mine1405'); await A.click('#syStartW');
  ok(await waitFor(()=>!!S.tags['nt-data']),'نسخه قبلی: ارسال شد');
  const B=await mk(null); await waitFor(async()=>!(await B.evaluate(()=>document.getElementById('ntSyDlg').hidden)));
  await B.click('#syOther'); await B.fill('#syPv','mine1405'); await B.click('#syStartV');
  ok(await waitFor(async()=>((await ls(B,'nt_daftar_v1'))||'').includes('15094')),'نسخه قبلی: مشاهده‌کننده اطلاعات را گرفت');
  await sleep(1500); await A.waitForFunction(()=>window.ntSync && ntBooted);
  await A.click('#ntSyBtn'); await A.click('#syUsers'); await A.click('#syUNew'); await A.fill('#syUName','استخراج'); await A.click('#syUSave'); await A.waitForSelector('#syLink');
  const link=await A.inputValue('#syLink'), pin=(await A.locator('#syPinOut').innerText()).replace(/\D/g,''); await A.click('#syBack'); await A.click('#syBack'); await A.click('#syClose');
  await sleep(2500);
  const X=await mk(null); await X.goto(link); await X.reload(); await X.waitForFunction(()=>window.ntSync);
  await waitFor(async()=>!(await X.evaluate(()=>document.getElementById('ntSyDlg').hidden))); await X.fill('#syPin',pin); await X.click('#syJoin');
  ok(await waitFor(async()=>((await ls(X,'ntsync_cfg_v1'))||'').includes('"uid"')),'نسخه قبلی: کاربر با لینک وصل شد');
  await sleep(1800);
  // تغییری که قبل از به‌روزرسانی ثبت شده ولی هنوز ارسال نشده است
  await A.evaluate(()=>{ ntSync.T.gap=1e9; }); 
  await A.evaluate(()=>{ show(0); }); await A.frameLocator('iframe.on').locator('#tIn').fill('قبل از به‌روزرسانی'); await A.frameLocator('iframe.on').locator('#tAdd').click();
  const shaOld=S.tags['nt-data'];
  // به‌روزرسانی فایل روی GitHub
  cur=NEW;
  await A.reload(); await A.waitForFunction(()=>window.ntSync && ntBooted); await sleep(1500);
  ok(await A.evaluate(()=>document.getElementById('ntSyDlg').hidden),'سیستم اصلی بعد از به‌روزرسانی: بدون پرسش');
  ok(await A.evaluate(()=>DOCS.length===9),'۹ زبانه');
  ok(await waitFor(async()=>S.tags['nt-data']!==shaOld && JSON.parse(S.file()).v===2),'تغییر عقب‌مانده با نسخه جدید ارسال شد');
  ok(await waitFor(()=>A.evaluate(()=>!!ntSync.baseGet() && ntSync.hashOf(ntSync.collect())===ntSync.st().hash)),'سیستم اصلی همگام است');
  ok(((await ls(A,'nt_anbar_out_v1'))||'').includes('WA470') && ((await ls(A,'nt_today_todo_v1'))||'').includes('قبل از به‌روزرسانی'),'اطلاعات سیستم اصلی کامل است');
  // مشاهده‌کننده هنوز نسخه قبلی صفحه را باز دارد → پرونده نسخه جدید را هم می‌خواند
  ok(await waitFor(async()=>((await ls(B,'nt_today_todo_v1'))||'').includes('قبل از به‌روزرسانی'),12000),'مشاهده‌کننده با صفحه قدیمی، اطلاعات جدید را می‌خواند');
  await B.reload(); await B.waitForFunction(()=>window.ntSync && ntBooted); await sleep(1500);
  ok(await B.evaluate(()=>window.ntViewer===true && document.getElementById('ntSyDlg').hidden) && ((await ls(B,'nt_anbar_out_v1'))||'').includes('WA470'),'مشاهده‌کننده بعد از به‌روزرسانی: بدون پرسش، اطلاعات کامل');
  await X.reload(); await X.waitForFunction(()=>window.ntSync && ntBooted); await sleep(1500);
  ok(await X.evaluate(()=>tabs.filter(t=>!t.hidden).length===2 && document.getElementById('ntSyDlg').hidden),'کاربر بعد از به‌روزرسانی: بدون پرسش، همان دو زبانه');
  await X.evaluate(()=>show(DOCS.findIndex(d=>d.name==='دفترچه قرائت'))); { const card=X.frameLocator('iframe.on').locator('.dev',{hasText:'گریدر GD705R-2'}); await card.locator('input.rv').fill('2050'); await card.locator('button.sv').click(); }
  ok(await waitFor(async()=>((await ls(A,'nt_daftar_v1'))||'').includes('2050'),15000),'نوشته کاربر بعد از به‌روزرسانی به مدیر می‌رسد');
  await A.click('#ntSyBtn'); ok((await A.evaluate(()=>document.getElementById('ntSyDlg').innerText)).includes('کاربران (۱)'),'لیست کاربران مدیر سر جایش است'); 
  ok(A.errs.length===0 && B.errs.length===0 && X.errs.length===0,'بدون خطای اسکریپت '+A.errs.concat(B.errs).slice(0,2).join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); srv.close(); web.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
