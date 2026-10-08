// بدون اینترنت: نصب Service Worker، باز شدن سامانه بدون اینترنت، ثبت، و ارسال خودکار وقتی اینترنت برگشت
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const {make}=require('./fakegh.js');
const ROOT=path.join(__dirname,'..','..');
let HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const {S,srv}=make(); await new Promise(r=>srv.listen(0,r));
  const hits=[];
  const web=http.createServer((q,r)=>{ const u=decodeURIComponent(q.url.split('?')[0]); hits.push(u);
    const send=(b,t)=>{ r.writeHead(200,{'Content-Type':t,'Cache-Control':'max-age=600'}); r.end(b); };
    if(u==='/nt/سامانه-نت.html') return send(HTML,'text/html; charset=utf-8');
    if(u==='/nt/sw.js') return send(fs.readFileSync(path.join(ROOT,'sw.js')),'text/javascript');
    if(u==='/nt/manifest.webmanifest') return send(fs.readFileSync(path.join(ROOT,'manifest.webmanifest')),'application/manifest+json');
    const m=/^\/nt\/lib\/([\w.\-]+)$/.exec(u); if(m){ try{ return send(fs.readFileSync(path.join(ROOT,'lib',m[1])),m[1].endsWith('.png')?'image/png':'text/javascript'); }catch(e){} }
    r.writeHead(404); r.end('nf'); }); await new Promise(r=>web.listen(0,r));
  const URL1=`http://localhost:${web.address().port}/nt/${encodeURIComponent('سامانه-نت.html')}`;
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,maxDefer:8000,refocus:0,retry:1000,squash:30,seen:60000,seenMin:300};
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:400,height:820},serviceWorkers:'allow'});
  await c.addInitScript(([api,T])=>{ window.NTSYNC_TEST={api,raw:api,T}; },[`http://localhost:${srv.address().port}`,TT]);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  const waitFor=async(fn,ms=15000)=>{ const t=Date.now(); while(Date.now()-t<ms){ try{ if(await fn()) return true; }catch(e){} await sleep(150); } return false; };
  const ls=(k)=>p.evaluate(k=>localStorage.getItem(k),k);
  const synced=async()=>{ const s=JSON.parse(await ls('ntsync_state_v1')||'{}'); return s.sha===S.tags['nt-data'] && s.hash===await p.evaluate(()=>ntSync.hashOf(ntSync.outgoing(ntSync.collect(),ntSync.baseGet()||{}))); };
  const booted=()=>p.waitForFunction(()=>typeof ntBooted!=='undefined' && ntBooted,null,{timeout:20000});

  console.log('1) با اینترنت: تنظیم مدیر و نصب کار بدون اینترنت');
  await p.goto(URL1); await p.waitForFunction(()=>window.ntSync);
  ok(await p.evaluate(()=>!!document.querySelector('link[rel="manifest"]')),'صفحه manifest دارد');
  const man=JSON.parse(fs.readFileSync(path.join(ROOT,'manifest.webmanifest'),'utf8'));
  ok(man.start_url==='سامانه-نت.html' && man.display==='standalone' && man.icons.length===2,'manifest: نام، شروع، آیکن');
  await p.waitForFunction(()=>window.ntLocked===false); await p.click('#ntSyBtn'); if(await p.locator('#syOther').count()) await p.click('#syOther');
  await p.waitForSelector('#syTok'); await p.fill('#syTok',S.goodToken); await p.fill('#syP1','mine1405'); await p.fill('#syP2','mine1405'); await p.click('#syStartW');
  await waitFor(()=>!!S.tags['nt-data']); await booted(); await sleep(800);
  await p.evaluate(()=>{ const b=document.getElementById('syClose'); if(b && !document.getElementById('ntSyDlg').hidden) b.click(); });
  ok(await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true)),'Service Worker فعال شد');
  ok(await waitFor(()=>p.evaluate(async()=>{ const ks=await caches.keys(); if(!ks.length) return false; const c=await caches.open(ks[0]); const r=await c.keys(); return r.length>=7; })),'صفحه و کتابخانه‌ها نگه داشته شد');
  ok(await waitFor(()=>synced()),'همگام');

  console.log('2) بدون اینترنت');
  await c.setOffline(true);
  const n0=hits.length;
  await p.goto(URL1+'#m=ZL50'); await booted();
  ok(hits.length===n0,'صفحه بدون رفتن به سرور باز شد');
  ok(await p.evaluate(()=>!window.ntLocked && !!document.querySelector('iframe.on')),'سامانه بدون اینترنت باز شد (قفل ورود نیست)');
  ok(await waitFor(async()=>(await p.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); return d && !d.hidden ? d.innerText:''; })).includes('لودر ZL50')),'لینک برچسب QR بدون اینترنت → صفحه دستگاه');
  await p.click('#qrRead'); await p.fill('#qrVal','16020'); await p.click('#qrSave'); await sleep(300);
  ok(((await ls('nt_daftar_v1'))||'').includes('16020'),'قرائت روی گوشی ثبت شد');
  await p.click('#qrRead'); await p.click('#qrBack'); await p.click('#qrStop'); await p.click('#ntQrBody [data-c="خرابی لاستیک"]'); await p.click('#qrSave'); await sleep(300);
  ok(((await ls('nt_tavaqof_v1'))||'').includes('خرابی لاستیک'),'توقف روی گوشی ثبت شد (ساعت همان لحظه)');
  await p.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); d.hidden=true; });
  ok(await waitFor(async()=>(await p.locator('#ntSyBtn').textContent()).includes('بدون اینترنت')),'دکمه: «بدون اینترنت»');
  ok(await waitFor(async()=>{ const t=await p.locator('#ntSyBar').innerText(); return t.includes('اینترنت نیست') && t.includes('ارسال‌نشده'); }),'نوار: ثبت‌ها روی گوشی می‌ماند و بعداً فرستاده می‌شود');
  ok(!(await p.locator('#ntSyBar').getAttribute('class')).includes('err'),'نوار قرمز (خطا) نیست');
  const tagOff=S.tags['nt-data'];

  console.log('3) اینترنت برگشت');
  await c.setOffline(false); await p.evaluate(()=>window.dispatchEvent(new Event('online')));
  ok(await waitFor(()=>synced(),20000) && S.tags['nt-data']!==tagOff,'ثبت‌های بدون اینترنت خودکار فرستاده شد');
  ok(await waitFor(async()=>(await p.locator('#ntSyBtn').textContent()).includes('همگام')),'دکمه دوباره «همگام»');

  console.log('4) نسخه تازه سامانه با اینترنت');
  { const h=String(HTML), i=h.lastIndexOf('</body>'); HTML=Buffer.from(h.slice(0,i)+'<div id="newVer"></div>'+h.slice(i)); }
  const n1=hits.length; await p.goto(URL1); await booted();
  ok(await p.evaluate(()=>!!document.getElementById('newVer')),'با اینترنت، نسخه تازه سامانه باز شد (نه نسخه ذخیره‌شده)');
  await c.setOffline(true); await p.goto(URL1); await booted();
  ok(await p.evaluate(()=>!!document.getElementById('newVer')),'نسخه تازه برای بدون اینترنت هم ذخیره شد');
  await c.setOffline(false);
  ok(errs.length===0,'بدون خطای اسکریپت '+errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
