// «خلاصه برای Claude»: فقط مدیر؛ ماه جاری، هزینه، سابقه دستگاه؛ بدون مبلغ و نام
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
  const J=ago=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()-ago*864e5)); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
  const seed={nt_sh8_v1:JSON.stringify({rows:[{dev:'لودر ZL50',type:'شیلنگ باد',st:J(0),reg:J(0),desc:'تعویض شیلنگ',rep:'تعمیرکار نمونه',sup:'فروشنده نمونه',costA:'5000000',costK:'3000000',hasA:true,hasK:true}]}),
    nt_moshkel_v1:JSON.stringify({row:5,rows:[{y:1405,m:7,d:10,dev:'لودر ZL50',sys:'سیستم هیدرولیک',desc:'نشت جک',sev:'بالا',state:'منتظر قطعه'}]}),
    nt_daftar_v1:JSON.stringify([{dev:'لودر ZL50',unit:'ساعت',val:15200,date:J(1)}]),
    nt_svc_v1:JSON.stringify([{id:'s1',dev:'لودر ZL50',name:'روغن موتور',every:115,last:15000,ld:J(10),months:12}])};
  console.log('1) مدیر');
  const A=await ctx(seed); await A.context().grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(URL1).origin}).catch(()=>{});
  await adminSetup(A,'pass-123456'); await settle(A); await A.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); if(d) d.hidden=true; });
  await A.click('#ntSyBtn'); ok(await A.locator('#syAi').count()===1,'مدیر: دکمه «خلاصه برای Claude» هست');
  await A.click('#syAi'); await A.waitForSelector('#ntAi');
  let T=await A.inputValue('#aiTxt');
  ok(/خلاصه ماه/.test(T) && /خرابی‌های باز \(۱\)|خرابی‌های باز \(1\)/.test(T) && /منتظر قطعه/.test(T),'ماه جاری: خرابی باز با وضعیت');
  ok(/روغن موتور: گذشته/.test(T),'سرویس گذشته در خلاصه');
  ok(/8,000,000 ریال/.test(T),'هزینه با مبلغ');
  await A.check('#aiAnon'); T=await A.inputValue('#aiTxt');
  ok(!/ریال/.test(T) && !/تعمیرکار نمونه|فروشنده نمونه/.test(T) && /فاکتور/.test(T),'بدون مبلغ و نام: مبلغ و نام حذف شد، تعداد فاکتور ماند');
  await A.check('input[name=aiK][value=dev]'); await A.selectOption('#aiDev','لودر ZL50'); T=await A.inputValue('#aiTxt');
  ok(/سابقه دستگاه «لودر ZL50»/.test(T) && /15200/.test(T) && /تعویض شیلنگ/.test(T) && !/تعمیرکار نمونه/.test(T),'سابقه دستگاه (بدون نام)');
  await A.uncheck('#aiAnon'); T=await A.inputValue('#aiTxt'); ok(/تعمیرکار: تعمیرکار نمونه/.test(T),'با نام: تعمیرکار در سابقه');
  await A.click('#aiCopy'); await sleep(300);
  ok(/کپی شد/.test(await A.locator('#aiMsg').innerText()),'«کپی شد»');
  const clip=await A.evaluate(()=>navigator.clipboard.readText().catch(()=>''));
  ok(!clip || clip===T,'متن کپی‌شده همان پیش‌نمایش است');
  await A.click('#aiClose'); ok(await A.locator('#ntAi').count()===0,'بسته شد');
  console.log('2) کاربر غیرمدیر');
  const u=await newUser(A,'کاربر عادی');
  const B=await ctx(null,null,null,u.link); await B.waitForSelector('#syPin'); await B.fill('#syPin',u.pin); await B.click('#syJoin'); await settle(B);
  await B.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); if(d) d.hidden=true; }); await B.click('#ntSyBtn'); await sleep(300);
  ok(await B.locator('#syAi').count()===0,'کاربر عادی دکمه را نمی‌بیند');
  ok(![A,B].some(p=>p.errs.length),'بدون خطا '+[A,B].map(p=>p.errs.join('|')).join(''));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); srv.close(); web.close(); raw.close(); process.exit(fails?1:0);
})();
