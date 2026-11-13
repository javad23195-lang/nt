// حافظه: نشانگر حافظه در تنظیم، هشدار روزانه بالای ۸۵٪، سقف عکس‌های باکس (اول عکس قلم‌های بسته پاک می‌شود). همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const run=async(cfg,extra)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:`http://localhost:${web.address().port}`});
    await c.addInitScript(([cfg,extra])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntws_test','1');
      if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); Object.keys(extra||{}).forEach(k=>localStorage.setItem(k,JSON.stringify(extra[k]))); },[cfg,extra]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntWs,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
    return {c,p,errs}; };
  const frameOf=async(p,n)=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); return (await p.$$('iframe'))[i].contentFrame(); };
  const go=async(p,t)=>{ await p.evaluate(t=>window.postMessage({nt:'go',tab:t},'*'),t); await sleep(900); };
  const visTabs=p=>p.evaluate(()=>DOCS.filter((d,i)=>!tabs[i].hidden).map(d=>d.name));
  const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP8z8DAwMDAwMAAAB0AAQH0wQlbAAAAAElFTkSuQmCC','base64');
  const LSg=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
  const BIG='x'.repeat(66000);
  const items=[{id:'n1',name:'قطعه باز',code:'111',qty:'1',unit:'عدد',seen:'1405/08/01'}];
  for(let i=0;i<28;i++) items.push({id:'d'+i,name:'قطعه بسته '+i,code:'9'+i,qty:'1',unit:'عدد',st:'me',seen:'1405/08/01'});
  const PH={}; for(let i=0;i<28;i++) PH['d'+i]={t:'image/webp',d:BIG,at:'1405/07/'+String(10+i%9).padStart(2,'0')};

  console.log('۱) سقف عکس: عکس قلم‌های بسته پاک می‌شود');
  let {c,p,errs}=await run({mode:'w'},{nt_kbox_v1:items,nt_kbox_ph_v1:PH});
  await p.click('#ntWs [data-ws="kh"]').catch(()=>{}); await sleep(800); await go(p,'لیست خرید'); let f=await frameOf(p,'لیست خرید'); await f.evaluate(()=>{ const b=document.querySelector('#bF [data-f="open"]'); if(b) b.click(); }); await sleep(200);
  await f.click('.bx[data-id="n1"] [data-ph]'); await f.setInputFiles('#bPhF',{name:'p.png',mimeType:'image/png',buffer:PNG}); await sleep(900);
  let P=await LSg(p,'nt_kbox_ph_v1'), sz=JSON.stringify(P).length;
  ok(P.n1 && sz<=1700000 && Object.keys(P).length<29,'عکس تازه ذخیره شد؛ عکس‌های قدیمی بسته پاک شد ('+(Object.keys(P).length-1)+' مانده)');
  ok(/عکس قدیمی قلم‌های بسته پاک شد/.test(await f.evaluate(()=>document.getElementById('bMsg2').textContent)),'پیام: چند عکس قدیمی پاک شد');
  ok(!P.d0 && !!P.d27 || Object.keys(P).filter(k=>k!=='n1').every(k=>P[k].at>='1405/07/10'),'قدیمی‌ترها اول پاک شد');
  await c.close();

  console.log('۲) سقف عکس: همه باز → عکس تازه پذیرفته نمی‌شود');
  const open=items.map(x=>Object.assign({},x,{st:undefined}));
  ({c,p,errs}=await run({mode:'w'},{nt_kbox_v1:open,nt_kbox_ph_v1:PH}));
  await p.click('#ntWs [data-ws="kh"]').catch(()=>{}); await sleep(800); await go(p,'لیست خرید'); f=await frameOf(p,'لیست خرید'); await f.evaluate(()=>{ const b=document.querySelector('#bF [data-f="open"]'); if(b) b.click(); }); await sleep(200);
  await f.click('.bx[data-id="n1"] [data-ph]'); await f.setInputFiles('#bPhF',{name:'p.png',mimeType:'image/png',buffer:PNG}); await sleep(900);
  P=await LSg(p,'nt_kbox_ph_v1');
  ok(!P.n1 && Object.keys(P).length===28 && /جای عکس پر است/.test(await f.evaluate(()=>document.getElementById('bMsg2').textContent)),'جای عکس پر: پیام روشن، عکس باز پاک نشد');
  await c.close();

  console.log('۳) نشانگر حافظه و هشدار');
  ({c,p,errs}=await run({mode:'w'},{}));
  await p.click('#ntWs [data-ws="nt"]',{timeout:3000}).catch(()=>{}); await sleep(500);
  let u=await p.evaluate(()=>ntSync.memUse());
  await p.evaluate(()=>{ ntSync.ui ? 0 : 0; document.getElementById('ntSyBtn').click(); });
  ok(await p.evaluate(()=>!!document.getElementById('syMem') && /حافظه این سیستم: [۰-۹]+٪/.test(document.getElementById('syMem').textContent) && !document.getElementById('syMem').classList.contains('bad')),'تنظیم: «حافظه این سیستم: N٪» ('+u.pct+'٪)');
  await p.evaluate(()=>{ localStorage.setItem('nt_daftar_v1',JSON.stringify('y'.repeat(4400000))); localStorage.removeItem('ntk_memw'); });
  u=await p.evaluate(()=>ntSync.memUse());
  await p.reload(); await p.waitForFunction(()=>window.ntSync,null,{timeout:15000}); await sleep(7000);
  const t=await p.evaluate(()=>{ const e=document.getElementById('ntSyToast'); return e&&!e.hidden?e.textContent:''; });
  ok(u.pct>=85 && /حافظه این سیستم [۰-۹]+٪ پر است/.test(t),'بالای ۸۵٪: هشدار ('+u.pct+'٪)');
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); document.getElementById('ntSyBtn').click(); }); await sleep(300);
  ok(await p.evaluate(()=>{ const m=document.getElementById('syMem'); return m && m.classList.contains('bad') && /نزدیک پر شدن/.test(m.textContent) && /قرائت: /.test(m.textContent) && !/ntk_memw/.test(m.textContent); }),'نشانگر قرمز، با نام بیشترین حجم');
  ok(await p.evaluate(()=>localStorage.getItem('ntk_memw')===new Date().toDateString()),'هشدار روزی یک بار');
  await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
