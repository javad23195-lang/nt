const {chromium}=require('playwright'); const http=require('http'), fs=require('fs');
const {make}=require('./fakegh.js');
const HTML=fs.readFileSync(require('path').join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const {S,srv}=make(); await new Promise(r=>srv.listen(0,r)); const P2=srv.address().port;
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r)); const P1=web.address().port;
  const raw=http.createServer((q,r)=>{ const f=S.file(); if(!f){ r.writeHead(404,{'Access-Control-Allow-Origin':'*'}); r.end(); return; }
    r.writeHead(200,{'Access-Control-Allow-Origin':'*','Content-Type':'text/plain; charset=utf-8'}); r.end(f); }); await new Promise(r=>raw.listen(0,r)); const P3=raw.address().port;
  const URL1=`http://localhost:${P1}/nt/s.html`;
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,maxDefer:8000,refocus:0,retry:1000,squash:30,seen:4000,seenMin:300};
  async function ctx(seed,vp,T,url){
    const c=await br.newContext({viewport:vp||{width:1100,height:800},locale:'fa-IR'});
    await c.grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
    await c.addInitScript(([api,rawu,T,seed])=>{
      window.NTSYNC_TEST={api,raw:rawu,T};
      if(seed && !localStorage.getItem('__seed')){ localStorage.setItem('__seed','1'); Object.keys(seed).forEach(k=>localStorage.setItem(k,seed[k])); }
    },[`http://localhost:${P2}`,`http://localhost:${P3}`,Object.assign({},TT,T||{}),seed||null]);
    const p=await c.newPage();
    p.dialogs=[]; p.on('dialog',d=>{ p.dialogs.push(d.type()+':'+d.message()); d.accept().catch(()=>{}); });
    p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
    await p.goto(url||URL1); await p.waitForFunction(()=>window.ntSync);
    return p;
  }
  const settle=async p=>{ await sleep(1100); await p.waitForFunction(()=>window.ntSync && typeof ntBooted!=='undefined' && ntBooted,null,{timeout:15000}); await sleep(300); };
  const ls=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);
  const btn=p=>p.locator('#ntSyBtn').innerText();
  const bar=p=>p.evaluate(()=>{ const b=document.getElementById('ntSyBar'); return b.hidden?'':b.innerText; });
  const dlgText=p=>p.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); return d.hidden?'':d.innerText; });
  const smsg=p=>p.locator('#syMsg').innerText().catch(()=>'');
  const waitFor=async(fn,ms=9000)=>{ const t=Date.now(); while(Date.now()-t<ms){ try{ if(await fn()) return true; }catch(e){} await sleep(100); } return false; };
  const tab=(p,name)=>p.evaluate(n=>{ show(DOCS.findIndex(d=>d.name===n)); },name);
  const visTabs=p=>p.evaluate(()=>tabs.map((t,i)=>t.hidden?null:DOCS[i].name).filter(Boolean).join(','));
  const fr=p=>p.frameLocator('iframe.on');
  async function addNote(p,text){ await tab(p,'امروز'); await fr(p).locator('#tIn').fill(text); await fr(p).locator('#tAdd').click(); }
  async function addReading(p,dev,val){ await tab(p,'دفترچه قرائت'); const card=fr(p).locator('.dev',{hasText:dev}); await card.locator('input.rv').fill(String(val)); await card.locator('button.sv').click(); }
  async function addStop(p,i,note){ await tab(p,'توقف شیفت'); const f=fr(p); await f.locator('#bNew').click(); await f.locator('#fPick button').nth(i).click();
    await f.locator('#fFrom').fill('08:1'+i); await f.locator('#fWhy button').first().click(); if(note) await f.locator('#fNote').fill(note); await f.locator('#fSave').click(); }
  const synced=async p=>{ const s=JSON.parse(await ls(p,'ntsync_state_v1')||'{}'); return s.sha===S.tags['nt-data'] && s.hash===await p.evaluate(()=>ntSync.hashOf(ntSync.outgoing(ntSync.collect(),ntSync.baseGet()||{}))); };
  const has=async(p,k,txt)=>((await ls(p,k))||'').includes(txt);
  const openSetup=async p=>{ await p.waitForFunction(()=>window.ntSync && (window.ntLocked===false || !document.getElementById('ntSyDlg').hidden),null,{timeout:15000});
    if(await p.evaluate(()=>document.getElementById('ntSyDlg').hidden)) await p.click('#ntSyBtn'); if(await p.locator('#syOther').count()) await p.click('#syOther'); await p.waitForSelector('#syTok'); };
  const adminSetup=async(p,pass)=>{ await openSetup(p); await p.fill('#syTok',S.goodToken); await p.fill('#syP1',pass); await p.fill('#syP2',pass); await p.click('#syStartW'); };
  /** مدیر یک کاربر می‌سازد؛ لینک و رمز ۶ رقمی را برمی‌گرداند */
  async function newUser(p,name,accFn){
    if(await dlgText(p)==='') await p.click('#ntSyBtn');
    if(await p.locator('#syUsers').count()) await p.click('#syUsers');
    await p.click('#syUNew'); await p.fill('#syUName',name); if(accFn) await accFn(p); await p.click('#syUSave');
    await p.waitForSelector('#syLink');
    const link=await p.inputValue('#syLink'), pin=(await p.locator('#syPinOut').innerText()).replace(/\D/g,'');
    return {link,pin,code:link.split('#join=')[1]};
  }
  const setAcc=(tabName,v)=>async p=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),tabName); await p.selectOption(`#syAclList select[data-tab="${i}"]`,v); };
  const seedA={nt_anbar_out_v1:JSON.stringify({row:720,rows:[{date:'1405/07/15',y:1405,m:7,d:15,dev:'WA470',item:'روغن دیزل اتوماتیک 50-20',qty:20,why:'مورد نیاز WA470',cond:''}]}),
               nt_daftar_v1:JSON.stringify([{dev:'لودر ZL50',unit:'ساعت',val:15094,date:'1405/07/13'}])};

  console.log('1) سیستم مدیر: تنظیم اول');
  let A=await ctx(seedA);
  await sleep(2200);
  ok(await dlgText(A)==='','بدون اطلاعات مشترک، پنجره‌ای خودکار باز نمی‌شود');
  ok(await A.evaluate(()=>window.ntLocked===false && ntBooted && frames.some(f=>f.dataset.loaded)),'وقتی هنوز اطلاعات مشترکی ساخته نشده، سامانه باز است (تنظیم اول مدیر)');
  await openSetup(A);
  await A.fill('#syTok','wrong_token'); await A.fill('#syP1','mine1405'); await A.fill('#syP2','mine1405'); await A.click('#syStartW');
  ok(await waitFor(async()=>(await smsg(A)).includes('کلید دسترسی اشتباه')),'کلید اشتباه → پیام درست');
  await A.fill('#syTok',S.goodToken); await A.click('#syStartW');
  ok(await waitFor(()=>!!S.tags['nt-data']),'اطلاعات به مخزن ارسال شد');
  await settle(A);
  const f1=S.file();
  ok(JSON.parse(f1).app==='nt-sync' && !f1.includes('WA470') && !f1.includes('nt_anbar') && !f1.includes(S.goodToken),'پرونده قفل است؛ متن اطلاعات و کلید در آن نیست');
  ok((await btn(A)).includes('همگام') && await synced(A),'سیستم مدیر همگام است: '+await btn(A));

  console.log('2) مدیر کاربر می‌سازد');
  const uX=await newUser(A,'استخراج — شیفت صبح');
  ok(/^NT1\.[\w-]+\.[\w-]+\.[\w-]+$/.test(uX.code) && /^\d{6}$/.test(uX.pin),'لینک اتصال و رمز ۶ رقمی ساخته شد (طول کد: '+uX.code.length+')');
  ok(!uX.link.includes(S.goodToken) && !uX.code.includes('github_pat'),'کلید GitHub در لینک دیده نمی‌شود (قفل است)');
  await A.screenshot({path:require('path').join(require('os').tmpdir(),'u-code.png')});
  await A.click('#syCopyL'); ok(await waitFor(async()=>(await smsg(A)).includes('کپی شد')),'دکمه کپی لینک کار می‌کند');
  await A.click('#syBack');
  ok((await dlgText(A)).includes('استخراج — شیفت صبح') && (await dlgText(A)).includes('هنوز وصل نشده') && (await dlgText(A)).includes('ثبت: دفترچه قرائت، توقف شیفت'),'لیست کاربران: نام، دسترسی، «هنوز وصل نشده»');
  await A.click('#syBack'); await A.click('#syClose');
  ok(await waitFor(()=>synced(A)),'لیست کاربران ارسال شد');

  console.log('3) همکار با لینک وصل می‌شود');
  let X=await ctx(null,{width:420,height:800},null,uX.link);
  ok(await waitFor(async()=>(await dlgText(X)).includes('کد اتصال از لینک خوانده شد')),'لینک باز شد و فقط رمز ۶ رقمی را می‌پرسد');
  ok(!(await X.evaluate(()=>location.href)).includes('join='),'کد از نوار آدرس پاک شد');
  await X.screenshot({path:require('path').join(require('os').tmpdir(),'u-join.png')});
  await X.fill('#syPin','000000'); await X.click('#syJoin');
  ok(await waitFor(async()=>(await smsg(X)).includes('درست نیست')),'رمز ۶ رقمی اشتباه → پیام درست');
  ok(await ls(X,'nt_anbar_out_v1')===null,'با رمز اشتباه چیزی دریافت نشد');
  await X.fill('#syPin',uX.pin.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])); await X.click('#syJoin');   // رقم فارسی
  await settle(X);
  ok(await visTabs(X)==='دفترچه قرائت,توقف شیفت','فقط دو زبانه دیده می‌شود: '+await visTabs(X));
  ok(await X.evaluate(()=>DOCS[active].name)==='دفترچه قرائت' ,'زبانه شروع: اولین زبانه مجاز');
  await X.evaluate(()=>window.postMessage({nt:'go',tab:'انبار'},'*')); await sleep(300);
  ok(await X.evaluate(()=>DOCS[active].name)!=='انبار','زبانه پنهان باز نمی‌شود');
  ok(await has(X,'nt_daftar_v1','15094'),'قرائت‌های قبلی دیده می‌شود');
  await X.click('#ntSyBtn');
  { const t=await dlgText(X); ok(t.includes('کاربر: استخراج — شیفت صبح') && !t.includes('کاربران') && !t.includes('کلید دسترسی'),'پنجره کاربر: بدون مدیریت کاربران و بدون کلید'); }
  await X.click('#syClose');
  await A.click('#ntSyBtn'); await A.click('#syURef').catch(async()=>{ await A.click('#syUsers'); });
  ok(await waitFor(async()=>{ if(!(await dlgText(A)).includes('آخرین اتصال')) await A.click('#syUsers').catch(()=>{}); const t=await dlgText(A); return t.includes('آخرین اتصال: امروز') ; },12000),'مدیر «آخرین اتصال: امروز …» را می‌بیند');
  await A.screenshot({path:require('path').join(require('os').tmpdir(),'u-list.png')});
  await A.click('#syBack'); await A.click('#syClose');

  console.log('4) ثبت هم‌زمان → ادغام خودکار');
  await tab(X,'توقف شیفت'); await fr(X).locator('#who').fill('رضا احمدی');
  await addStop(X,0,'شیلنگ هیدرولیک');
  await addReading(X,'بیل مکانیکی کوماتسو PC290',22700);
  await addReading(A,'لودر کوماتسو WA470',27200);
  await addNote(A,'سفارش فیلتر');
  ok(await waitFor(async()=>await has(A,'nt_tavaqof_v1','شیلنگ هیدرولیک') && await has(A,'nt_daftar_v1','22700'),15000),'توقف و قرائت همکار به مدیر رسید');
  ok(await has(A,'nt_daftar_v1','27200') && await has(A,'nt_today_todo_v1','سفارش فیلتر') && await has(A,'nt_daftar_v1','15094'),'نوشته‌های مدیر سر جایش است');
  ok(await waitFor(async()=>await has(X,'nt_daftar_v1','27200'),15000),'قرائت مدیر به همکار رسید');
  ok(await waitFor(async()=>await synced(A) && await synced(X),15000) && await dlgText(A)==='' && await dlgText(X)==='','هر دو همگام، بدون پرسش');
  await tab(A,'توقف شیفت');
  ok(await waitFor(async()=>(await fr(A).locator('body').innerText()).includes('ثبت: رضا احمدی')),'توقف با نام ثبت‌کننده در سیستم مدیر دیده می‌شود');
  await A.evaluate(()=>{ ntSync.T.gap=1e9; }); await X.evaluate(()=>{ ntSync.T.gap=1e9; });
  await addNote(A,'هم‌زمان A'); await addReading(X,'بیل مکانیکی کوماتسو PC400',7600);
  await Promise.all([A.evaluate(()=>ntSync.sync({force:true})),X.evaluate(()=>ntSync.sync({force:true}))]);
  await A.evaluate(()=>{ ntSync.T.gap=300; }); await X.evaluate(()=>{ ntSync.T.gap=300; });
  ok(await waitFor(async()=>await has(A,'nt_daftar_v1','7600') && await has(A,'nt_today_todo_v1','هم‌زمان A') && await synced(A) && await synced(X),15000),'ارسال دقیقاً هم‌زمان: چیزی گم نشد');

  console.log('5) کاربر نمی‌تواند بخش‌های دیگر یا لیست کاربران را تغییر دهد');
  await X.evaluate(()=>{ localStorage.setItem('nt_anbar_out_v1','{"row":720,"rows":[]}');
    const u=JSON.parse(localStorage.getItem('nt_users_v1')); Object.values(u.users).forEach(x=>{ delete x.acl; }); u.users.hack={id:'hack',name:'نفوذ'}; localStorage.setItem('nt_users_v1',JSON.stringify(u)); });
  await addReading(X,'گریدر GD705R-2',2041);
  ok(await waitFor(()=>has(A,'nt_daftar_v1','2041'),15000),'قرائت تازه همکار رسید');
  await sleep(1200);
  ok(await has(A,'nt_anbar_out_v1','WA470') && !(await has(A,'nt_users_v1','نفوذ')) && await has(A,'nt_users_v1','"acl"'),'انبار و لیست کاربران مدیر دست نخورد');
  await addNote(A,'بعد از دستکاری');
  ok(await waitFor(async()=>await has(X,'nt_anbar_out_v1','WA470') && !(await has(X,'nt_users_v1','نفوذ')),15000) && await visTabs(X)==='دفترچه قرائت,توقف شیفت','در سیستم کاربر هم همه چیز به حالت درست برگشت');

  console.log('6) وقتی کاربر مشغول نوشتن است، صفحه‌اش عوض نمی‌شود');
  await tab(A,'دفترچه قرائت'); await sleep(400);
  const inp=fr(A).locator('.dev',{hasText:'نیسان زامیاد'}).locator('input.rv');
  await inp.click(); await inp.type('3002');
  await addReading(X,'لیفتراک کوماتسو 6تنی',12980);
  ok(await waitFor(async()=>(await bar(A)).includes('اطلاعات جدید رسید'),10000) && await inp.inputValue()==='3002','نوار «اطلاعات جدید رسید» آمد و عدد نیمه‌کاره ماند');
  await inp.type('50'); await fr(A).locator('.dev',{hasText:'نیسان زامیاد'}).locator('button.sv').click();
  ok(await waitFor(async()=>await has(A,'nt_daftar_v1','12980') && await has(A,'nt_daftar_v1','300250') && await has(X,'nt_daftar_v1','300250'),15000),'بعد از ذخیره، هر دو طرف کامل شد');

  console.log('7) مدیر از سیستم خودش دسترسی را تغییر می‌دهد');
  await A.click('#ntSyBtn'); await A.click('#syUsers');
  await A.locator('.syuser',{hasText:'استخراج — شیفت صبح'}).locator('[data-act="edit"]').click();
  await setAcc('انبار','r')(A); await A.click('#syUSave'); await A.click('#syBack'); await A.click('#syClose');
  ok(await waitFor(async()=>await visTabs(X)==='دفترچه قرائت,انبار,توقف شیفت',15000),'سیستم همکار خودکار ۳ زبانه شد (انبار: فقط مشاهده)');
  await settle(X);
  await tab(X,'انبار');
  ok(await waitFor(async()=>(await fr(X).locator('body').innerText()).includes('روغن دیزل اتوماتیک 50-20')),'همکار انبار را می‌بیند');
  await X.evaluate(()=>{ localStorage.setItem('nt_anbar_out_v1','{"row":720,"rows":[]}'); }); await addReading(X,'لودر ZL50',15200);
  ok(await waitFor(()=>has(A,'nt_daftar_v1','15200'),15000) && await has(A,'nt_anbar_out_v1','WA470'),'… ولی نمی‌تواند آن را تغییر دهد');

  console.log('8) قطع دسترسی از سیستم مدیر');
  await addStop(X,1,'ثبت قبل از قطع'); await waitFor(()=>has(A,'nt_tavaqof_v1','ثبت قبل از قطع'),15000);
  await A.click('#ntSyBtn'); await A.click('#syUsers');
  await A.locator('.syuser',{hasText:'استخراج — شیفت صبح'}).locator('[data-act="off"]').click();
  ok((await dlgText(A)).includes('قطع شده'),'در لیست: «قطع شده»');
  await A.click('#syBack'); await A.click('#syClose');
  ok(await waitFor(async()=>(await dlgText(X)).includes('دسترسی این سیستم قطع شده است'),15000),'سیستم همکار: پیام «دسترسی قطع شده است»');
  ok(await ls(X,'nt_anbar_out_v1')===null && await ls(X,'nt_daftar_v1')===null && !JSON.parse(await ls(X,'ntsync_cfg_v1')).token,'اطلاعات و کلید از سیستم همکار پاک شد');
  ok(await X.evaluate(()=>window.ntLocked===true && frames.every(f=>!f.dataset.loaded)) && await X.locator('#syClose').count()===0,'سیستم قطع‌شده قفل است و هیچ زبانه‌ای نشان نمی‌دهد');
  await X.fill('#syCode',uX.code); await X.fill('#syPin',uX.pin); await X.click('#syJoin');
  ok(await waitFor(async()=>(await smsg(X)).includes('دیگر معتبر نیست')),'کد قبلی دیگر کار نمی‌کند');
  ok(await has(A,'nt_tavaqof_v1','ثبت قبل از قطع'),'نوشته‌های قبلی همکار نزد مدیر مانده است');
  // وصل دوباره با کد تازه (چسباندن کد با فاصله و خط جدید)
  await A.click('#ntSyBtn'); await A.click('#syUsers');
  await A.locator('.syuser',{hasText:'استخراج — شیفت صبح'}).locator('[data-act="off"]').click();
  await A.locator('.syuser',{hasText:'استخراج — شیفت صبح'}).locator('[data-act="code"]').click(); await A.waitForSelector('#syLink');
  const c2=(await A.inputValue('#syLink')).split('#join=')[1], p2=(await A.locator('#syPinOut').innerText()).replace(/\D/g,'');
  await A.click('#syBack'); await A.click('#syBack'); await A.click('#syClose'); await waitFor(()=>synced(A));
  await X.fill('#syCode','سلام این کد:\n'+c2.slice(0,40)+' \n'+c2.slice(40)+'\n'); await X.fill('#syPin',p2); await X.click('#syJoin');
  await settle(X);
  ok(await visTabs(X)==='دفترچه قرائت,انبار,توقف شیفت' && await has(X,'nt_daftar_v1','15200'),'با کد تازه دوباره وصل شد');

  console.log('9) کاربر با دسترسی کامل، و حذف کاربر');
  const uZ=await newUser(A,'مهندس دوم',async p=>{ await p.check('input[name="syAcc"][value="full"]'); });
  await A.click('#syBack'); await A.click('#syBack'); await A.click('#syClose'); await waitFor(()=>synced(A));
  let Z=await ctx(null,null,null,uZ.link);
  await waitFor(async()=>(await dlgText(Z)).includes('رمز ۶ رقمی')); await Z.fill('#syPin',uZ.pin); await Z.click('#syJoin'); await settle(Z);
  ok((await visTabs(Z)).split(',').length===9 && await has(Z,'nt_anbar_out_v1','WA470'),'کاربر کامل: ۹ زبانه و همه اطلاعات');
  await addNote(Z,'یادداشت مهندس دوم');
  ok(await waitFor(()=>has(A,'nt_today_todo_v1','یادداشت مهندس دوم'),15000),'نوشته کاربر کامل به مدیر رسید');
  await Z.click('#ntSyBtn'); ok(!(await dlgText(Z)).includes('کاربران'),'کاربر کامل هم مدیریت کاربران ندارد'); await Z.click('#syClose');
  await sleep(1500); ok(await Z.evaluate(()=>document.getElementById('ntAl').hidden),'یادآور شخصی مدیر برای کاربران باز نمی‌شود');
  await A.click('#ntSyBtn'); await A.click('#syUsers');
  const del=A.locator('.syuser',{hasText:'مهندس دوم'}).locator('[data-act="del"]'); await del.click();
  ok((await dlgText(A)).includes('مهندس دوم'),'حذف با یک بار زدن انجام نمی‌شود'); await del.click();
  ok(!(await dlgText(A)).includes('مهندس دوم'),'کاربر حذف شد'); await A.click('#syBack'); await A.click('#syClose');
  ok(await waitFor(async()=>(await dlgText(Z)).includes('دسترسی این سیستم قطع شده است') && await ls(Z,'nt_anbar_out_v1')===null,15000),'سیستم کاربر حذف‌شده قطع و پاک شد');

  console.log('10) قفل ورود، مشاهده با رمز اطلاعات، و سیستم دوم مدیر');
  let B=await ctx({nt_today_todo_v1:JSON.stringify([{t:'یادداشت محلی',date:'1400/01/01',done:false,time:'00:01'}])});
  ok(await waitFor(async()=>(await dlgText(B)).includes('کد اتصال')),'سیستم تازه: پنجره ورود خودکار باز شد');
  await sleep(2500);
  { const t=await dlgText(B);
    ok(!t.includes('بعداً') && !t.includes('نمی‌خواهد') && !t.includes('بستن') && await B.locator('#syClose').count()===0,'پنجره ورود دکمه بستن یا «بعداً» ندارد');
    ok(await B.evaluate(()=>window.ntLocked===true && !ntBooted && active===-1 && frames.every(f=>!f.dataset.loaded)),'هیچ زبانه‌ای باز نشده است');
    ok(await B.evaluate(()=>getComputedStyle(document.getElementById('tabs')).visibility==='hidden'),'نوار زبانه‌ها دیده نمی‌شود');
    await B.evaluate(()=>{ show(3); document.querySelectorAll('.tab')[2].click(); window.postMessage({nt:'go',tab:'انبار'},'*'); }); await sleep(7000);
    ok(await B.evaluate(()=>active===-1 && frames.every(f=>!f.dataset.loaded) && !ntBooted),'با هیچ راهی (کلیک، پیام، گذشت زمان) زبانه‌ای باز نمی‌شود');
    ok(await B.evaluate(()=>document.getElementById('ntAl').hidden),'یادآورهای محلی هم نشان داده نمی‌شود');
    await B.keyboard.press('Escape'); ok((await dlgText(B)).includes('کد اتصال'),'کلید Escape پنجره ورود را نمی‌بندد');
    await B.screenshot({path:require('path').join(require('os').tmpdir(),'lock.png')}); }
  await B.click('#syOther'); await B.fill('#syPv','wrongpass'); await B.click('#syStartV');
  ok(await waitFor(async()=>(await smsg(B)).includes('رمز اطلاعات درست نیست')),'رمز اطلاعات اشتباه → پیام درست');
  await B.fill('#syPv','mine1405'); await B.click('#syStartV'); await settle(B);
  ok((await bar(B)).includes('حالت مشاهده') && await has(B,'nt_anbar_out_v1','WA470'),'مشاهده با رمز اطلاعات کار می‌کند');
  let C=await ctx({nt_moshkel_v1:JSON.stringify({row:9,rows:[{a:'مشکل C'}]})});
  await waitFor(async()=>(await dlgText(C))!==''); await adminSetup(C,'mine1405');
  ok(await waitFor(async()=>(await dlgText(C)).includes('با اطلاعات این سیستم چه کنم')),'سیستم دوم مدیر با اطلاعات خودش: پرسید');
  await C.click('#syMerge'); await settle(C);
  ok(await has(C,'nt_moshkel_v1','مشکل C') && await has(C,'nt_anbar_out_v1','WA470') && await waitFor(()=>has(A,'nt_moshkel_v1','مشکل C'),15000),'ادغام: هر دو طرف کامل');
  await C.click('#ntSyBtn'); ok((await dlgText(C)).includes('کاربران (۱)'),'سیستم دوم مدیر هم کاربران را می‌بیند'); await C.click('#syClose');

  console.log('11) خطا و ادامه خودکار');
  const good=S.goodToken; S.goodToken='github_pat_TEMP';
  await addNote(A,'بعد از باطل شدن کلید');
  ok(await waitFor(async()=>(await bar(A)).includes('کلید دسترسی اشتباه')),'نوار خطا در سیستم مدیر');
  ok(await waitFor(async()=>(await bar(X)).includes('کد اتصال جدید'),15000),'سیستم کاربر: «از مدیر کد اتصال جدید بگیرید»');
  S.goodToken=good;
  ok(await waitFor(async()=>await bar(A)==='' && await synced(A) && await bar(X)==='',15000),'بعد از درست شدن، هر دو خودکار ادامه دادند');
  await A.evaluate(()=>localStorage.removeItem('ntsync_base_v1')); await A.reload(); await A.waitForFunction(()=>window.ntSync); await settle(A);
  ok(await waitFor(()=>A.evaluate(()=>!!ntSync.baseGet())) && await dlgText(A)==='' && await has(A,'nt_daftar_v1','300250') && await waitFor(()=>synced(A)),'سیستمی که از نسخه قبلی آمده: بدون پرسش و بدون گم شدن');

  console.log('12) قطع قطعی: تعویض کلید و رمز');
  await A.click('#ntSyBtn'); await A.locator('details.sycard summary').click();
  await A.fill('#syRTok','github_pat_NEW2'); await A.fill('#syRP1','newpass99'); await A.fill('#syRP2','newpass99');
  S.readOnlyToken='github_pat_NEW2';     // کلید تازه هنوز اجازه نوشتن ندارد
  await A.click('#syRot'); await A.click('#syRot');
  ok(await waitFor(async()=>(await smsg(A)).includes('اجازه نوشتن')),'کلید تازه بدون اجازه نوشتن → چیزی عوض نمی‌شود');
  ok(JSON.parse(await ls(A,'ntsync_cfg_v1')).token===good && await waitFor(()=>synced(A)),'تنظیم قبلی سر جایش ماند');
  S.readOnlyToken='github_pat_RO'; const old=S.goodToken; S.goodToken='github_pat_NEW2'; S.readOnlyToken=old;   // کلید قدیمی هنوز پاک نشده (فقط خواندن برای شبیه‌سازی)
  S.goodToken2=old; 
  await A.click('#syRot'); await A.click('#syRot');
  ok(await waitFor(async()=>(await smsg(A)).includes('انجام شد')),'تعویض انجام شد: '+(await smsg(A)).slice(0,60));
  ok(JSON.parse(S.file()).salt===JSON.parse(await ls(A,'ntsync_cfg_v1')).salt && await has(A,'nt_daftar_v1','300250'),'اطلاعات مشترک با قفل تازه نوشته شد؛ اطلاعات کامل است');
  S.readOnlyToken='github_pat_RO';       // مدیر کلید قدیمی را در GitHub پاک کرد
  await A.click('#syClose');
  ok(await waitFor(async()=>(await bar(X)).includes('کد اتصال جدید'),15000),'کاربر قدیمی دیگر نمی‌تواند بخواند یا بنویسد');
  ok(await waitFor(async()=>(await dlgText(B)).includes('رمز اطلاعات مشترک عوض شده است') || (await bar(B)).includes('دریافت نشد'),15000),'مشاهده‌کننده با رمز قدیمی هم قطع شد');
  await X.locator('#ntSyBarB').click(); ok(await waitFor(async()=>(await dlgText(X)).includes('کد اتصال جدید')),'دکمه «وارد کردن کد» پنجره اتصال را باز می‌کند');
  await X.fill('#syCode',c2); await X.fill('#syPin',p2); await X.click('#syJoin');
  ok(await waitFor(async()=>(await smsg(X)).includes('کد جدید بگیرید') || (await smsg(X)).includes('قدیمی است')),'کد قدیمی بعد از تعویض کار نمی‌کند');
  await A.click('#ntSyBtn'); await A.click('#syUsers'); await A.locator('.syuser',{hasText:'استخراج — شیفت صبح'}).locator('[data-act="code"]').click(); await A.waitForSelector('#syLink');
  const c3=(await A.inputValue('#syLink')).split('#join=')[1], p3=(await A.locator('#syPinOut').innerText()).replace(/\D/g,'');
  await A.click('#syBack'); await A.click('#syBack'); await A.click('#syClose');
  await X.fill('#syCode',c3); await X.fill('#syPin',p3); await X.click('#syJoin'); await settle(X);
  ok(await bar(X)==='' && await has(X,'nt_daftar_v1','300250') && await waitFor(()=>synced(X)),'با کد تازه، کاربر دوباره وصل شد');
  await addReading(X,'کامیون TRS01',3900);
  ok(await waitFor(()=>has(A,'nt_daftar_v1','3900'),15000),'و نوشته‌اش به مدیر می‌رسد');

  console.log('12b) قطع اتصال از خود سیستم');
  await X.click('#ntSyBtn'); await X.click('#syOff'); await X.click('#syOff'); await sleep(1500); await X.waitForFunction(()=>window.ntSync);
  ok(await waitFor(async()=>(await dlgText(X)).includes('کد اتصال')) && await X.evaluate(()=>window.ntLocked===true && frames.every(f=>!f.dataset.loaded)),'بعد از «قطع اتصال این سیستم» هم سامانه قفل است');
  console.log('13) بررسی‌های کلی');
  ok(!S.log.some(x=>x.startsWith('PREFLIGHT-REJECT')),'همه درخواست‌ها با قانون CORS گیت‌هاب سازگار بود');
  for(const [n,p] of [['A',A],['B',B],['X',X],['C',C],['Z',Z]]){ ok(p.errs.length===0,`بدون خطای اسکریپت در ${n} `+p.errs.slice(0,2).join(' / ')); ok(p.dialogs.length===0,`بدون پنجره مرورگر در ${n} `+p.dialogs.join(' / ')); }
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); srv.close(); web.close(); raw.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
