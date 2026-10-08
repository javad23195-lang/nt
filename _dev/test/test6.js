// پایداری: GitHub با نام برچسب نسخه قبلی را می‌دهد · درمان سیستمی که قبلاً عقب مانده · ارسال هنگام خروج از صفحه
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs');
const {make}=require('./fakegh.js');
const HTML=fs.readFileSync(require('path').join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const {S,srv}=make(); await new Promise(r=>srv.listen(0,r));
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const URL1=`http://localhost:${web.address().port}/nt/s.html`;
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,maxDefer:8000,refocus:0,retry:1000,squash:30,seen:60000,seenMin:300};
  async function ctx(seed,T,url){
    const c=await br.newContext({locale:'fa-IR'});
    await c.addInitScript(([api,T,seed])=>{ window.NTSYNC_TEST={api,raw:api,T};
      if(seed && !localStorage.getItem('__seed')){ localStorage.setItem('__seed','1'); Object.keys(seed).forEach(k=>localStorage.setItem(k,seed[k])); } },[`http://localhost:${srv.address().port}`,Object.assign({},TT,T||{}),seed||null]);
    const p=await c.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
    await p.goto(url||URL1); await p.waitForFunction(()=>window.ntSync); return p;
  }
  const settle=async p=>{ await sleep(1100); await p.waitForFunction(()=>window.ntSync && typeof ntBooted!=='undefined' && ntBooted,null,{timeout:15000}); await sleep(300); };
  const ls=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);
  const has=async(p,k,txt)=>((await ls(p,k))||'').includes(txt);
  const dlgText=p=>p.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); return d.hidden?'':d.innerText; });
  const waitFor=async(fn,ms=12000)=>{ const t=Date.now(); while(Date.now()-t<ms){ try{ if(await fn()) return true; }catch(e){} await sleep(100); } return false; };
  const tab=(p,name)=>p.evaluate(n=>{ show(DOCS.findIndex(d=>d.name===n)); },name);
  const fr=p=>p.frameLocator('iframe.on');
  async function addReading(p,dev,val){ await tab(p,'دفترچه قرائت'); const card=fr(p).locator('.dev',{hasText:dev}); await card.locator('input.rv').fill(String(val)); await card.locator('button.sv').click(); }
  async function addStop(p,i,note){ await tab(p,'توقف شیفت'); const f=fr(p); await f.locator('#bNew').click(); await f.locator('#fPick button').nth(i).click();
    await f.locator('#fFrom').fill('08:1'+i); await f.locator('#fWhy button').first().click(); if(note) await f.locator('#fNote').fill(note); await f.locator('#fSave').click(); }
  async function newUser(p,name){ if(await dlgText(p)==='') await p.click('#ntSyBtn'); if(await p.locator('#syUsers').count()) await p.click('#syUsers');
    await p.click('#syUNew'); await p.fill('#syUName',name); await p.click('#syUSave'); await p.waitForSelector('#syLink');
    const link=await p.inputValue('#syLink'), pin=(await p.locator('#syPinOut').innerText()).replace(/\D/g,''); await p.click('#syBack'); await p.click('#syBack'); await p.click('#syClose'); return {link,pin}; }
  const synced=async p=>{ const s=JSON.parse(await ls(p,'ntsync_state_v1')||'{}'); return s.sha===S.tags['nt-data'] && s.hash===await p.evaluate(()=>ntSync.hashOf(ntSync.outgoing(ntSync.collect(),ntSync.baseGet()||{}))); };

  const A=await ctx({nt_daftar_v1:JSON.stringify([{dev:'لودر ZL50',unit:'ساعت',val:15094,date:'1405/07/13'}])});
  await A.waitForFunction(()=>window.ntLocked===false); await A.click('#ntSyBtn'); await A.waitForSelector('#syTok'); await A.fill('#syTok',S.goodToken); await A.fill('#syP1','mine1405'); await A.fill('#syP2','mine1405'); await A.click('#syStartW'); await settle(A);
  await A.evaluate(()=>{ show(0); }); await fr(A).locator('#tIn').fill('یک'); await fr(A).locator('#tAdd').click(); await waitFor(()=>synced(A));
  S.staleTag=true;     // از اینجا: خواندن با نام برچسب همیشه نسخه قبلی را می‌دهد
  console.log('1) GitHub با نام برچسب نسخه قبلی را می‌دهد');
  const u=await newUser(A,'استخراج'); await waitFor(()=>synced(A));
  const X=await ctx(null,null,u.link);
  await waitFor(async()=>(await dlgText(X)).includes('رمز ۶ رقمی')); await X.fill('#syPin',u.pin); await X.click('#syJoin'); await settle(X);
  ok(await X.evaluate(()=>tabs.filter(t=>!t.hidden).length)===2,'کاربری که همین الان ساخته شد، فوراً وصل می‌شود');
  await addStop(X,0,'توقف اول');
  ok(await waitFor(()=>has(A,'nt_tavaqof_v1','توقف اول')),'نوشته کاربر به مدیر می‌رسد');
  await addReading(A,'لودر کوماتسو WA470',27200);
  ok(await waitFor(()=>has(X,'nt_daftar_v1','27200')),'نوشته مدیر به کاربر می‌رسد');
  await addReading(X,'بیل مکانیکی کوماتسو PC290',22700); await addReading(A,'لودر ZL50',15200);
  ok(await waitFor(async()=>await has(A,'nt_daftar_v1','22700') && await has(X,'nt_daftar_v1','15200') && await synced(A) && await synced(X)),'ثبت هم‌زمان: هر دو کامل و همگام');
  ok(JSON.parse(await ls(A,'nt_daftar_v1')).length===4,'هیچ ردیفی گم یا تکرار نشد (۴ قرائت)');

  console.log('2) ارسال هنگام خروج از صفحه (قفل شدن گوشی)');
  await X.evaluate(()=>{ ntSync.T.deb=1e9; ntSync.T.maxWait=1e9; });
  await addStop(X,1,'قبل از قفل گوشی'); await sleep(1500);
  ok(!(await has(A,'nt_tavaqof_v1','قبل از قفل گوشی')),'(بدون خروج، هنوز ارسال نشده است)');
  await X.evaluate(()=>{ Object.defineProperty(document,'hidden',{get:()=>true,configurable:true}); document.dispatchEvent(new Event('visibilitychange')); });
  ok(await waitFor(()=>has(A,'nt_tavaqof_v1','قبل از قفل گوشی')),'با خروج از صفحه، همان لحظه ارسال شد');

  console.log('3) درمان سیستمی که با نسخه قبلی سامانه عقب مانده است');
  S.staleTag=false; await waitFor(()=>synced(A)); await sleep(600);
  // شبیه‌سازی: سیستم مدیر شناسه نسخه تازه را دارد ولی محتوای قدیمی (بدون یک قرائت کاربر)
  await A.evaluate(()=>{ const cut=s=>JSON.stringify(JSON.parse(s).filter(x=>x.val!==22700));
    const b=JSON.parse(localStorage.getItem('ntsync_base_v1')); b.nt_daftar_v1=cut(b.nt_daftar_v1); localStorage.setItem('ntsync_base_v1',JSON.stringify(b));
    localStorage.setItem('nt_daftar_v1',cut(localStorage.getItem('nt_daftar_v1')));
    const st=JSON.parse(localStorage.getItem('ntsync_state_v1')); st.iv='OLD'; st.hash=ntSync.hashOf(ntSync.collect()); localStorage.setItem('ntsync_state_v1',JSON.stringify(st)); });
  ok(!(await has(A,'nt_daftar_v1','22700')),'(سیستم مدیر یک قرائت را ندارد و فکر می‌کند همگام است)');
  await A.reload(); await A.waitForFunction(()=>window.ntSync); await settle(A);
  ok(await waitFor(()=>has(A,'nt_daftar_v1','22700')),'با باز کردن دوباره سامانه، قرائت گم‌شده برگشت');
  ok(await waitFor(()=>synced(A)) && JSON.parse(await ls(A,'nt_daftar_v1')).length===4 && await has(X,'nt_daftar_v1','22700'),'و چیزی در اطلاعات مشترک خراب نشد');
  await A.click('#ntSyBtn'); const t=await dlgText(A);
  ok(t.includes('آخرین بررسی اطلاعات مشترک') && t.includes('نوشته ارسال‌نشده در این سیستم: ندارد'),'پنجره ابر وضعیت دقیق را نشان می‌دهد');
  await A.screenshot({path:require('path').join(require('os').tmpdir(),'status.png')});
  ok(A.errs.length===0 && X.errs.length===0,'بدون خطای اسکریپت '+A.errs.concat(X.errs).slice(0,2).join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); srv.close(); web.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
