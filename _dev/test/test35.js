// پشتیبان‌ها: ربات شبانه (bot/backup.mjs)، فهرست، برگرداندن، پشتیبان دستی، پاک کردن قدیمی‌ها
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs');
const {make}=require('./fakegh.js');
const HTML=fs.readFileSync(require('path').join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* تاریخ امروز (شمسی) — فرم انبار ردیف‌های همان روز را نشان می‌دهد */
const JT=(()=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const g=t=>p.find(x=>x.type===t).value; return {s:`${g('year')}/${g('month')}/${g('day')}`,y:+g('year'),m:+g('month'),d:+g('day')}; })();
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
      window.NTSYNC_TEST={api,raw:rawu,T,private:!!(seed&&seed.__private)};
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
  async function addNote(p,text){ await p.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); if(d) d.hidden=true; }); await tab(p,'امروز'); await fr(p).locator('#tIn').fill(text); await fr(p).locator('#tAdd').click(); }
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
  const setAcc=(tabName,v)=>async p=>{ await p.selectOption(`#syAclList select[data-n="${tabName}"]`,v); };
  const runBot=async()=>{ process.env.NT_API=`http://localhost:${P2}`; process.env.NT_DATA_REPO='javad23195-lang/nt'; process.env.NT_DATA_TOKEN=S.goodToken;
    const m=await import(require('path').join(__dirname,'..','..','bot','backup.mjs')+'?t='+Date.now()); const log=[]; const r=await m.backup(x=>log.push(x)); return Object.assign(r,{log}); };
  const bks=()=>Object.keys(S.tags).filter(n=>n.startsWith('bk-')).sort();
  console.log('1) مدیر + یادداشت ۱');
  const A=await ctx(null); await adminSetup(A,'pass-123456'); await settle(A);
  await addNote(A,'یادداشت یک'); ok(await waitFor(()=>synced(A),12000),'ارسال شد');
  console.log('2) ربات');
  let R=await runBot(); ok(R.made && bks().length===1 && S.tags[bks()[0]]===S.tags['nt-data'],'پشتیبان ساخته شد: '+bks().join(','));
  R=await runBot(); ok(!R.made && bks().length===1,'بدون تغییر: پشتیبان تازه ساخته نشد');
  const bk1=S.tags[bks()[0]];
  console.log('3) یادداشت ۲ و برگرداندن');
  await addNote(A,'یادداشت دو'); ok(await waitFor(()=>synced(A),12000),'یادداشت دو ارسال شد');
  const users0=await ls(A,'nt_users_v1');
  await A.click('#ntSyBtn'); await A.locator('#syBkBox summary').click();
  ok(await waitFor(async()=>(await A.locator('#syBkList [data-bk]').count())===1),'فهرست: ۱ پشتیبان');
  const lbl=await A.locator('#syBkList .sybk span').first().innerText(); ok(/۱۴۰[۰-۹]/.test(lbl),'تاریخ شمسی: '+lbl);
  await A.locator('#syBkList [data-bk]').first().click(); await sleep(200);
  ok(await has(A,'nt_today_todo_v1','یادداشت دو'),'یک بار زدن: برنگشت');
  await A.locator('#syBkList [data-bk]').first().click();
  ok(await waitFor(async()=>/برگردانده شد/.test(await smsg(A)),12000),'پیام «برگردانده شد»: '+await smsg(A));
  ok(!(await has(A,'nt_today_todo_v1','یادداشت دو')) && await has(A,'nt_today_todo_v1','یادداشت یک'),'یادداشت دو رفت، یادداشت یک ماند');
  ok(S.tags['nt-data']!==bk1 && !(S.file()||'').includes('یادداشت دو'),'اطلاعات مشترک هم برگشت');
  ok(bks().some(n=>/-pre$/.test(n)),'نسخه «پیش از برگرداندن» ساخته شد');
  ok(await ls(A,'nt_users_v1')===users0,'لیست کاربران عوض نشد');
  console.log('4) سیستم دوم نسخه برگشته را می‌گیرد');
  const u=await newUser(A,'سیستم ب');
  const B=await ctx(null,null,null,u.link); await B.waitForSelector('#syPin'); await B.fill('#syPin',u.pin); await B.click('#syJoin'); await settle(B);
  ok(await waitFor(async()=>await has(B,'nt_today_todo_v1','یادداشت یک') && !(await has(B,'nt_today_todo_v1','یادداشت دو')),12000),'سیستم ب: فقط یادداشت یک');
  console.log('5) پشتیبان دستی');
  await A.evaluate(()=>{ document.getElementById('ntSyDlg').hidden=true; }); await A.click('#ntSyBtn'); await A.locator('#syBkBox summary').click();
  const n0=bks().length; await A.click('#syBkNow');
  ok(await waitFor(()=>bks().length===n0+1 && bks().some(n=>/-man$/.test(n))),'پشتیبان دستی ساخته شد');
  console.log('6) فقط ۳۰ نسخه آخر');
  for(let k=1;k<=35;k++) S.tags['bk-2020-01-'+String(k).padStart(2,'0')]=bk1;
  await addNote(A,'یادداشت سه'); await waitFor(()=>synced(A),12000);
  delete S.tags['bk-'+new Date().toISOString().slice(0,10)];
  R=await runBot(); ok(R.made && bks().length===30 && !bks().includes('bk-2020-01-01') && bks().some(n=>n.startsWith('bk-20'+new Date().toISOString().slice(2,4))),'۳۰ نسخه ماند، قدیمی‌ها پاک شد ('+bks().length+')');
  ok(!!S.tags['nt-data'],'برچسب اصلی دست‌نخورده');
  console.log('7) کاربر غیرمدیر بخش پشتیبان را نمی‌بیند');
  await B.click('#ntSyBtn').catch(()=>{}); await sleep(300); ok(await B.locator('#syBkBox').count()===0,'سیستم ب: بخش پشتیبان نیست');
  ok(A.errs.length===0 && B.errs.length===0,'بدون خطا '+A.errs.concat(B.errs).join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); srv.close(); web.close(); raw.close(); process.exit(fails?1:0);
})();
