// رمز ورود هر سیستم: ساختن، پرسیدن بعد از بی‌کاری، اشتباه‌ها، بدون رمز برای کاربر مشترک، تغییر رمز
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
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,maxDefer:8000,refocus:0,retry:1000,squash:30,seen:4000,seenMin:300,pinIdle:4000};
  async function ctx(seed,vp,T,url){
    const c=await br.newContext({viewport:vp||{width:1100,height:800},locale:'fa-IR'});
    await c.grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
    await c.addInitScript(([api,rawu,T,seed])=>{
      window.NTSYNC_TEST={api,raw:rawu,T,private:!!(seed&&seed.__private),pin:true};
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
    await p.click('#syUNew'); await p.fill('#syUName',name); await p.click('[data-sec="pm"]'); await p.evaluate(()=>document.querySelectorAll('#syAclList .syacr').forEach(r=>{ const v={'توقف شیفت':'w','دفترچه قرائت':'w'}[r.dataset.n]||'h'; r.querySelector('[data-v="'+v+'"]').click(); })); if(accFn) await accFn(p); await p.click('#syUSave');
    await p.waitForSelector('#syLink');
    const link=await p.inputValue('#syLink'), pin=(await p.locator('#syPinOut').innerText()).replace(/\D/g,'');
    return {link,pin,code:link.split('#join=')[1]};
  }
  const setAcc=(tabName,v)=>async p=>{ await p.click(`#syAclList .syacr[data-n="${tabName}"] [data-v="${v}"]`); };
  const pinVis=p=>p.evaluate(()=>{ const e=document.getElementById('ntPin'); return !!(e && !e.hidden); });
  const pinType=async(p,v0,v1,v2)=>{ for(const [id,v] of [['#pin0',v0],['#pin1',v1],['#pin2',v2]]) if(v!==undefined && await p.locator(id).count()) await p.fill(id,v); await p.click('#pinGo'); await sleep(400); };
  const unlock=async(p,v)=>{ if(await pinVis(p)) await pinType(p,v); };
  const pmsg=p=>p.locator('#pinMsg').innerText().catch(()=>'');
  console.log('1) سیستم مدیر: ساخت رمز');
  const A=await ctx(null); await adminSetup(A,'pass-123456'); await A.waitForNavigation({timeout:15000}).catch(()=>{}); await settle(A);
  ok(await waitFor(()=>pinVis(A)),'بعد از اتصال، «رمز ورود بسازید» نمایش داده شد');
  ok(await A.evaluate(()=>document.body.classList.contains('ntpin')),'محتوای سامانه پنهان است');
  await pinType(A,undefined,'1234','1234'); ok(/ساده نباشد/.test(await pmsg(A)),'«۱۲۳۴» قبول نشد');
  await pinType(A,undefined,'2580','2581'); ok(/یکی نیست/.test(await pmsg(A)),'تکرار متفاوت قبول نشد');
  await pinType(A,undefined,'۲۵۸۰','2580'); ok(!(await pinVis(A)),'رمز ساخته شد (رقم فارسی هم قبول است)');
  const P=JSON.parse(await ls(A,'ntsync_pin_v1')); ok(P.h && P.s && !JSON.stringify(P).includes('2580'),'رمز به صورت هش ذخیره شد، نه خود رمز');
  ok(!(S.file()||'').includes(P.h),'هش رمز به GitHub نرفت');
  console.log('1b) دکمه «خروج»');
  ok(await A.evaluate(()=>{ const b=document.getElementById('ntExitBtn'); return !!b && b.parentNode.id==='ntMenuBox' && getComputedStyle(document.getElementById('ntMenuBtn')).display!=='none'; }),'کامپیوتر: دکمه «خروج» در منوی سه‌خط');
  const keys0=await A.evaluate(()=>Object.keys(localStorage).filter(k=>/^nt_/.test(k)).length);
  await A.evaluate(()=>window.ntMenu&&ntMenu.open()); await sleep(350); await A.click('#ntExitBtn'); await sleep(300);
  ok(await pinVis(A) && /رمز ورود/.test(await A.locator('#ntPin').innerText()),'«خروج»: سامانه قفل شد و رمز می‌خواهد');
  ok(await A.evaluate(()=>document.body.classList.contains('ntpin')),'«خروج»: محتوای سامانه پنهان است');
  await unlock(A,'2580'); ok(!(await pinVis(A)),'با رمز درست باز شد');
  ok(await A.evaluate(()=>Object.keys(localStorage).filter(k=>/^nt_/.test(k)).length)===keys0,'«خروج» اطلاعات را پاک نکرد');
  console.log('2) باز کردن دوباره');
  await A.reload(); await settle(A); ok(!(await pinVis(A)),'بارگذاری دوباره در کمتر از زمان بی‌کاری: رمز نخواست');
  const A2=await A.context().newPage(); A2.errs=[]; A2.on('pageerror',e=>A2.errs.push(String(e))); await A2.goto(URL1); await settle(A2);
  ok(await waitFor(()=>pinVis(A2)),'صفحه تازه (باز کردن سامانه): رمز خواست');
  await sleep(1300); await A2.screenshot({path:'/tmp/claude-0/pin1.png'});
  ok(await A2.evaluate(()=>{ const i=document.getElementById('pin0'), e=i&&i.nextElementSibling; if(!e||!e.classList.contains('eye')) return false; e.click(); const on=i.classList.contains('show'); e.click(); return on && !i.classList.contains('show') && !!document.querySelector('#ntPin .pinbg'); }),'صفحه رمز: دکمه چشم رمز را نشان می‌دهد و دوباره پنهان می‌کند؛ پس‌زمینه دستگاه‌ها هست');
  ok(await A2.evaluate(()=>!document.querySelector('input[type=password]') && document.getElementById('pin0').classList.contains('ntsec') && getComputedStyle(document.getElementById('pin0')).webkitTextSecurity==='disc'),'کادر رمز ورود: مدیر گذرواژه آن را نمی‌شناسد (نقطه‌گذاری با CSS)');
  ok(await A2.evaluate(()=>!!document.querySelector('#ntPin .pinlk') && document.getElementById('ntPin').classList.contains('in')),'قفل متحرک (svg) با حرکت ورود');
  await A2.fill('#pin0','1111'); await A2.click('#pinGo'); await sleep(120); await A2.screenshot({path:'/tmp/claude-0/pin2.png'});
  ok(await A2.evaluate(()=>document.querySelector('#ntPin .pinbox').classList.contains('bad')),'رمز اشتباه: کارت می‌لرزد'); await sleep(300);
  ok(/درست نیست/.test(await pmsg(A2)),'رمز اشتباه: پیام');
  await A2.fill('#pin0','2580'); await A2.click('#pinGo'); await sleep(350); await A2.screenshot({path:'/tmp/claude-0/pin3.png'});
  ok(!(await pinVis(A2)),'رمز درست: باز شد');
  ok(await A2.evaluate(()=>{ const f=document.getElementById('ntPinFx'); return !!f && !f.querySelector('input:not([disabled])') && getComputedStyle(f).pointerEvents==='none'; }),'حرکت باز شدن قفل: کپی بی‌اثر روی صفحه، کلیک را نمی‌گیرد');
  await sleep(1000); ok(await A2.evaluate(()=>!document.getElementById('ntPinFx')),'حرکت باز شدن تمام شد و حذف شد');
  ok(JSON.parse(await ls(A2,'ntsync_pin_v1')).f===0,'شمارش اشتباه صفر شد');
  console.log('3) بی‌کاری');
  await sleep(5500); ok(await pinVis(A2),'بعد از زمان بی‌کاری: رمز خواست');
  await pinType(A2,'2580'); ok(!(await pinVis(A2)),'باز شد');
  console.log('4) تغییر رمز');
  await A2.click('#ntSyBtn'); await A2.click('#syPinCh'); await sleep(200);
  await pinType(A2,'0000','3691','3691'); ok(/درست نیست/.test(await pmsg(A2)),'رمز فعلی اشتباه: رد شد');
  await pinType(A2,'2580','3691','3691'); ok(!(await pinVis(A2)),'رمز عوض شد');
  console.log('5) کاربر مشترک بدون رمز، و کاربر عادی');
  await A2.close();
  await unlock(A,'3691');
  const uN=await newUser(A,'سیستم مشترک',async p=>{ await p.check('#syUNoPin'); });
  { const U=JSON.parse(await ls(A,'nt_users_v1')||'{}'); const u=Object.values(U.users||{}).find(x=>x.name==='سیستم مشترک'); ok(u && u.nopin===1,'گزینه «بدون رمز ورود» ذخیره شد'); }
  await A.evaluate(()=>{ document.getElementById('ntSyDlg').hidden=true; });
  await unlock(A,'3691');
  const uR=await newUser(A,'گوشی');
  ok(await waitFor(()=>synced(A),12000),'لیست کاربران ارسال شد');
  const N=await ctx(null,null,null,uN.link); await N.waitForSelector('#syPin'); await N.fill('#syPin',uN.pin); await N.click('#syJoin'); await N.waitForNavigation({timeout:15000}).catch(()=>{}); await settle(N); await sleep(800);
  ok(!(await pinVis(N)),'سیستم مشترک: رمز نخواست');
  const R=await ctx(null,null,null,uR.link); await R.waitForSelector('#syPin'); await R.fill('#syPin',uR.pin); await R.click('#syJoin'); await R.waitForNavigation({timeout:15000}).catch(()=>{}); await settle(R);
  ok(await waitFor(()=>pinVis(R)),'کاربر عادی: «رمز ورود بسازید»');
  await pinType(R,undefined,'4826','4826'); ok(!(await pinVis(R)),'کاربر عادی رمز ساخت');
  console.log('6) ۵ و ۱۰ اشتباه');
  await R.reload(); await R.evaluate(()=>sessionStorage.clear()); await R.reload(); await settle(R);
  ok(await waitFor(()=>pinVis(R)),'رمز خواست');
  for(let k=0;k<5;k++) await pinType(R,'1357');
  ok(/یک دقیقه صبر/.test(await pmsg(R)),'۵ اشتباه: یک دقیقه صبر');
  await pinType(R,'4826'); ok(/ثانیه صبر کنید/.test(await pmsg(R)) && await pinVis(R),'در زمان صبر، حتی رمز درست قبول نمی‌شود');
  await R.evaluate(()=>{ const o=JSON.parse(localStorage.ntsync_pin_v1); o.u=1; localStorage.ntsync_pin_v1=JSON.stringify(o); });
  for(let k=0;k<4;k++) await pinType(R,'1357');
  await R.evaluate(()=>{ const o=JSON.parse(localStorage.ntsync_pin_v1); o.u=1; localStorage.ntsync_pin_v1=JSON.stringify(o); });
  await Promise.all([R.waitForNavigation({timeout:8000}).catch(()=>{}),pinType(R,'1357')]); await sleep(1500);
  const cfgR=JSON.parse(await ls(R,'ntsync_cfg_v1')||'{}');
  ok(cfgR.revoked && !cfgR.key && !(await ls(R,'nt_users_v1')) && !(await ls(R,'ntsync_pin_v1')),'۱۰ اشتباه: اتصال و اطلاعات این سیستم پاک شد');
  ok(await R.evaluate(()=>window.ntLocked===true),'سیستم قفل است و کد اتصال می‌خواهد');
  console.log('7) فراموشی رمز');
  const A3=await A.context().newPage(); A3.errs=[]; A3.on('pageerror',e=>A3.errs.push(String(e))); await A3.goto(URL1); await settle(A3);
  ok(await waitFor(()=>pinVis(A3)),'رمز خواست'); await A3.click('#pinForgot');
  ok(/بازیابی سیستم مدیر/.test(await A3.locator('#pinFg').innerText()),'راهنمای مدیر: «بازیابی سیستم مدیر»');
  ok(![A,N,R].some(p=>p.errs.length) && !A3.errs.length,'بدون خطا '+[A,N,R,A3].map(p=>p.errs.join('|')).join(''));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); srv.close(); web.close(); raw.close(); process.exit(fails?1:0);
})();
