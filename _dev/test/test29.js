// انتقال اطلاعات به مخزن خصوصی
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
  const seedA={nt_anbar_out_v1:JSON.stringify({row:720,rows:[{date:JT.s,y:JT.y,m:JT.m,d:JT.d,dev:'WA470',item:'روغن دیزل اتوماتیک 50-20',qty:20,why:'مورد نیاز WA470',cond:''}]}),
               nt_daftar_v1:JSON.stringify([{dev:'لودر ZL50',unit:'ساعت',val:15094,date:'1405/07/13'}])};


  console.log('1) مدیر روی مخزن عمومی');
  let A=await ctx(seedA); await sleep(1500);
  await adminSetup(A,'mine1405'); await settle(A);
  await addNote(A,'یادداشت پیش از انتقال');
  ok(await waitFor(()=>synced(A),12000),'مدیر در مخزن سامانه همگام شد');
  console.log('2) خطاها، بدون تغییر');
  await A.click('#ntSyBtn'); await A.click('#syMvBox summary');
  await A.fill('#syMvRepo','javad23195-lang/nt'); await A.fill('#syMvTok',S.dataToken); await A.click('#syMv'); await A.click('#syMv');
  ok(await waitFor(async()=>/جدا از مخزن سامانه/.test(await smsg(A))),'مخزن سامانه را نمی‌پذیرد');
  await A.fill('#syMvRepo','javad23195-lang/nt-data'); await A.fill('#syMvTok','github_pat_WRONG'); await A.click('#syMv'); await A.click('#syMv');
  ok(await waitFor(async()=>{ const m=await smsg(A); return m && !/در حال/.test(m); },15000),'کلید نادرست: پیام خطا — '+(await smsg(A)));
  ok(!JSON.parse(await ls(A,'ntsync_cfg_v1')).d && !S.tags2['nt-data'],'بعد از خطا، تنظیم قبلی ماند و چیزی در مخزن خصوصی نوشته نشد');
  console.log('3) انتقال');
  await A.fill('#syMvTok',S.dataToken); await A.click('#syMv'); await A.click('#syMv');
  ok(await waitFor(async()=>/انتقال انجام شد/.test(await smsg(A)),20000),'پیام: '+(await smsg(A)).slice(0,120));
  ok(!!S.tags2['nt-data'],'اطلاعات در مخزن خصوصی نوشته شد');
  ok(!S.tags['nt-data'],'نسخه قدیمی از مخزن عمومی پاک شد');
  const cfgA=JSON.parse(await ls(A,'ntsync_cfg_v1'));
  ok(cfgA.d==='javad23195-lang/nt-data' && cfgA.token===S.dataToken,'مدیر حالا با کلید تازه از مخزن خصوصی کار می‌کند');
  const before=S.file2(); await A.click('#syClose').catch(()=>{});
  await addNote(A,'یادداشت بعد از انتقال');
  ok(await waitFor(()=>S.file2()!==before,12000),'نوشته تازه مدیر به مخزن خصوصی رفت');
  ok(!S.tags['nt-data'],'مخزن عمومی خالی ماند');
  console.log('4) کاربر تازه با کد اتصال');
  const u=await newUser(A,'کاربر آزمایشی');
  let X=await ctx({__private:'1'}); await sleep(1500);
  ok(await X.evaluate(()=>window.ntLocked===true),'سیستم وصل‌نشده قفل است');
  await waitFor(async()=>(await dlgText(X)).includes('رمز ۶ رقمی'));
  await X.fill('#syCode',u.code); await X.fill('#syPin',u.pin); await X.click('#syJoin'); await settle(X);
  ok(await waitFor(()=>has(X,'nt_today_todo_v1','یادداشت بعد از انتقال'),12000),'کاربر تازه اطلاعات را از مخزن خصوصی گرفت');
  ok(JSON.parse(await ls(X,'ntsync_cfg_v1')).d==='javad23195-lang/nt-data','کد اتصال نام مخزن خصوصی را دارد');
  console.log('5) سیستم بدون کد');
  let V=await ctx({__private:'1'}); await sleep(1500);
  ok(await V.evaluate(()=>window.ntLocked===true),'قفل است');
  await V.click('#syOther').catch(()=>{}); await sleep(300);
  const vt=await dlgText(V);
  ok(!/مشاهده با رمز اطلاعات/.test(vt) && /از سیستم مدیر کد اتصال بگیرید/.test(vt),'«مشاهده با رمز» نیست؛ فقط کد اتصال');
  ok(![A,X,V].some(p=>p.errs.length),'بدون خطا '+[A,X,V].map(p=>p.errs.join('|')).join(''));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); srv.close(); web.close(); raw.close(); process.exit(fails?1:0);
})();
