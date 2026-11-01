// باکس: گفتگوی هر قلم (مدیر واحد ↔ مأمور)، «توضیح تازه»، عکس قطعه، رفتن به باکس تهران با گفتگو و عکس. همه نام‌ها ساختگی است.
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
  const LSg=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
  const BX=(id,name)=>({id,name,code:'1'+id.length,qty:'2',unit:'عدد',imp:1,seen:'1405/08/01',need:'1405/08/01'});
  const seed={nt_kbox_v1:[{id:'n1',name:'قطعه نمونه یک',code:'111',qty:'2',unit:'عدد',seen:'1405/08/01',need:'1405/08/01'},{id:'n2',name:'قطعه نمونه دو',code:'222',qty:'1',unit:'عدد',seen:'1405/08/01',memo:'توضیح قدیمی'}]};
  const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP8z8DAwMDAwMAAAB0AAQH0wQlbAAAAAElFTkSuQmCC','base64');
  let {c,p,errs}=await run({mode:'w'},seed);
  await p.click('#ntWs [data-ws="kh"]'); await sleep(1500);
  // «دیده شد» در هر گوشی جداست؛ با پاک کردن آن، گوشی دیگر شبیه‌سازی می‌شود
  const role=(sec,name)=>p.evaluate(([s,n])=>{ ntSync.mySec=()=>s; ntSync.myName=()=>n; localStorage.removeItem('ntk_nt_seen'); },[sec,name]);
  const reopen=async()=>{ const f=await frameOf(p,'لیست خرید'); await f.evaluate(()=>{ drawBox(); }); return f; };
  await role('pm','مدیر آزمایشی');
  await go(p,'لیست خرید'); let f=await frameOf(p,'لیست خرید'); await f.evaluate(()=>{ const b=document.querySelector('#bF [data-f="open"]'); if(b) b.click(); }); await sleep(200);

  console.log('۱) مدیر واحد: توضیح و ضروری');
  ok(await f.evaluate(()=>!!document.querySelector('.bx[data-id="n1"] [data-nti]')),'هر قلم کادر توضیح دارد');
  await f.fill('.bx[data-id="n1"] [data-nti]','<img src=x onerror=window.__z=1>اصل باشد، طرح چینی نخرید'); await f.press('.bx[data-id="n1"] [data-nti]','Enter'); await sleep(200);
  await f.click('.bx[data-id="n1"] [data-imp]'); await sleep(200);
  let B=await LSg(p,'nt_kbox_v1'), x=B.find(y=>y.id==='n1');
  ok(x.imp && x.nt.length===1 && x.nt[0].r==='واحد نگهداری و تعمیرات' && x.nt[0].by==='مدیر آزمایشی' && x.nt[0].k==='u' && /طرح چینی/.test(x.nt[0].t) && !/[<>]/.test(x.nt[0].t),'پیام مدیر واحد ذخیره شد (نقش، نام، بدون < >)');

  console.log('۲) مأمور: در ضروری می‌بیند و جواب می‌دهد');
  await role('kh_nb','مأمور آزمایشی'); f=await reopen();
  ok(await f.evaluate(()=>/توضیح تازه \(۱\)/.test(document.getElementById('bF').innerText)),'فیلتر «توضیح تازه (۱)»');
  await f.evaluate(()=>document.querySelector('#bF [data-f="imp"]').click()); await sleep(200);
  let T=await f.evaluate(()=>document.querySelector('.bx[data-id="n1"] .thr').innerText);
  ok(/واحد نگهداری و تعمیرات — مدیر آزمایشی/.test(T) && /طرح چینی نخرید/.test(T) && await f.evaluate(()=>!!document.querySelector('.bx[data-id="n1"] .msgx.nw')) && /جواب به مدیر واحد/.test(await f.evaluate(()=>document.querySelector('.bx[data-id="n1"] [data-nti]').placeholder)),'مأمور در «ضروری» پیام تازه را می‌بیند');
  await f.fill('.bx[data-id="n1"] [data-nti]','اصل سه روز دیگر می‌رسد'); await f.click('.bx[data-id="n1"] [data-ntgo]'); await sleep(200);
  x=(await LSg(p,'nt_kbox_v1')).find(y=>y.id==='n1');
  ok(x.nt.length===2 && x.nt[1].k==='kh' && x.nt[1].r==='مأمور نهبندان','جواب مأمور (نقش مأمور نهبندان)');
  ok(await f.evaluate(()=>!document.querySelector('.bx[data-id="n1"] .msgx.nw') && !/توضیح تازه/.test(document.getElementById('bF').innerText)),'بعد از جواب: خوانده‌شده');
  await role('pm','مدیر آزمایشی'); f=await reopen();
  ok(await f.evaluate(()=>/توضیح تازه \(۱\)/.test(document.getElementById('bF').innerText)),'مدیر: جواب مأمور «توضیح تازه»');

  console.log('۳) توضیح مهم قدیمی اولین پیام می‌شود');
  await f.evaluate(()=>document.querySelector('#bF [data-f="open"]').click()); await sleep(150);
  await f.fill('.bx[data-id="n2"] [data-nti]','باشه'); await f.press('.bx[data-id="n2"] [data-nti]','Enter'); await sleep(200);
  x=(await LSg(p,'nt_kbox_v1')).find(y=>y.id==='n2'); ok(x.nt.length===2 && x.nt[0].t==='توضیح قدیمی' && x.nt[0].r==='توضیح مهم','«توضیح مهم» قبلی در گفتگو ماند');

  console.log('۴) عکس قطعه');
  await f.click('.bx[data-id="n1"] [data-ph]'); await f.setInputFiles('#bPhF',{name:'p.png',mimeType:'image/png',buffer:PNG}); await sleep(800);
  const P=await LSg(p,'nt_kbox_ph_v1');
  ok(P && P.n1 && P.n1.d && /^image\//.test(P.n1.t),'عکس فشرده ذخیره شد');
  ok(await f.evaluate(()=>!!document.querySelector('.bx[data-id="n1"] .phx img')),'عکس کوچک روی کارت');
  await f.click('.bx[data-id="n1"] .phx'); await sleep(100);
  ok(await f.evaluate(()=>!document.getElementById('bPhV').hidden),'زدن عکس: بزرگ باز می‌شود'); await f.click('#bPhV .x');

  console.log('۵) مأمور تهران: گفتگو و عکس همراه قلم');
  await f.click('.bx[data-id="n1"] [data-st="teh"]'); await sleep(300);
  const TB=await LSg(p,'nt_kbox_th_v1'), tc=TB.find(y=>y.id==='tn-n1');
  ok(tc && tc.nt.length===2 && tc.ph==='n1','نسخه تهران: گفتگو و عکس');
  ok(!(await f.evaluate(()=>window.__z||!!document.querySelector('.thr img'))),'متن خطرناک بی‌اثر');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300)); await c.close();
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
