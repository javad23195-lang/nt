// «فاکتور خرید»: تایپ آزاد با فهرست کشویی، کالای با رسید از باکس سندپرداز (چند قلم)، «خریدم» خودکار در باکس،
// برگ حمل بدون شماره، فاکتور تحویلی با تحویل گیرنده، تحویل به مالی بعد از سندپرداز. همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const BOX=[{id:'b1',name:'کالای باکس یک',qty:'4',unit:'عدد',code:'7001',no:'301',seen:'1405/07/01'},{id:'b2',name:'کالای باکس دو',qty:'2',unit:'دست',code:'7002',no:'302',seen:'1405/07/01'},{id:'b3',name:'کالای باکس سه',qty:'1',unit:'عدد',seen:'1405/07/01'}];
  const run=async(cfg,extra)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.addInitScript(([cfg,extra])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntws_test','1');
      if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); Object.keys(extra||{}).forEach(k=>localStorage.setItem(k,JSON.stringify(extra[k]))); },[cfg,extra]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntWs,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
    await p.click('#ntWs [data-ws="kh"]'); await sleep(1200);
    return {c,p,errs}; };
  const frameOf=async(p,n)=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); return (await p.$$('iframe'))[i].contentFrame(); };
  const go=async(p,t)=>{ await p.evaluate(t=>window.postMessage({nt:'go',tab:t},'*'),t); await sleep(900); };
  const LSg=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
  const blur=f=>f.evaluate(()=>document.activeElement&&document.activeElement.blur());
  const cbt=f=>f.evaluate(()=>{ const l=document.querySelector('.cbl'); return l&&!l.hidden?[...l.querySelectorAll('button')].map(b=>b.innerText.replace(/\s+/g,' ')):[]; });

  let {c,p,errs}=await run({mode:'w'},{nt_kbox_v1:BOX,nt_factor_lex_v1:{sup:['فروشنده نمونه یک'],payer:['پرداخت‌کننده نمونه'],haml:['حمل نمونه']}});
  await go(p,'فاکتور خرید'); let f=await frameOf(p,'فاکتور خرید');
  await f.evaluate(()=>setPane('add')); await f.click('#fCat [data-c="kala"]'); await sleep(150);

  console.log('۱) کالا — با رسید انبار: شرح از باکس، چند قلم');
  ok(await f.evaluate(()=>document.getElementById('wTitle').hidden && !document.getElementById('wItems').hidden && document.querySelectorAll('#itList .itl').length===1),'شرح کالا: فهرست اقلام (یک خط)');
  await f.click('#itList [data-t]'); await sleep(150);
  let L=await cbt(f);
  ok(L.length===3 && L.some(x=>/کالای باکس یک.*کد ۷۰۰۱.*درخواست ۳۰۱/.test(x)),'فهرست کشویی: اقلام باز باکس با کد و شماره درخواست — '+L[0]);
  await f.fill('#itList [data-t]','دو'); await sleep(100);
  L=await cbt(f); ok(L.length===1 && /کالای باکس دو/.test(L[0]),'جستجو با تایپ: «دو» ← یک قلم');
  await f.click('.cbl button'); await sleep(150);
  ok(await f.evaluate(()=>{ const l=document.querySelector('#itList .itl'); return l.dataset.bx==='b2' && l.querySelector('[data-q]').value==='2' && l.querySelector('[data-u]').value==='دست' && !l.querySelector('.ok').hidden; }),'انتخاب: تعداد و واحد از باکس پر شد؛ «از باکس»');
  await f.click('#itAdd'); await sleep(100);
  await f.fill('#itList .itl:nth-child(2) [data-t]','کالای باکس یک'); await blur(f); await sleep(250);
  ok(await f.evaluate(()=>document.querySelector('#itList .itl:nth-child(2)').dataset.bx==='b1'),'نوشتن همان نام باکس (بی‌انتخاب): وصل شد');
  await f.click('#itAdd'); await sleep(100);
  await f.fill('#itList .itl:nth-child(3) [data-t]','کالای خارج از باکس'); await f.fill('#itList .itl:nth-child(3) [data-q]','3'); await f.fill('#itList .itl:nth-child(3) [data-u]','کارتن'); await blur(f); await sleep(250);
  ok(await f.evaluate(()=>!document.querySelector('#itList .itl:nth-child(3) .nb').hidden),'قلم خارج از باکس: هشدار قرمز');
  await f.fill('#fNo','701'); await f.fill('#fAmt','9000000'); await f.fill('#fSup','فروشنده تازه نمونه'); await blur(f); await sleep(250);
  await f.click('#bSave'); await sleep(500);
  let F=await LSg(p,'nt_factor_v1'); let r=F.find(x=>x.no==='701');
  ok(r && r.items.length===3 && r.items[0].bx==='b2' && r.items[0].code==='7002' && r.items[0].no==='302' && r.items[2].u==='کارتن' && !r.items[2].bx && r.title==='کالای باکس دو، کالای باکس یک، کالای خارج از باکس','ثبت: سه قلم با کد و شماره درخواست؛ شرح = نام‌ها پشت هم');
  ok(r.sup==='فروشنده تازه نمونه' && (await LSg(p,'nt_factor_lex_v1')).sup.includes('فروشنده تازه نمونه'),'تامین کننده تازه (تایپ آزاد) ثبت شد و به فهرست اضافه شد');
  let B=await LSg(p,'nt_kbox_v1');
  ok(B.find(x=>x.id==='b1').st==='me' && B.find(x=>x.id==='b2').fac.no==='701' && !B.find(x=>x.id==='b3').st,'باکس: دو قلم «خریدم» با شماره فاکتور');
  await f.click('#itList [data-t]'); await sleep(150);
  ok((await cbt(f)).length===1,'فاکتور بعدی: فقط قلم باز باکس (سه) در فهرست'); await blur(f);
  await go(p,'لیست خرید'); let k=await frameOf(p,'لیست خرید'); await k.click('#bF [data-f="done"]'); await sleep(200);
  ok(/خریدم( \(فاکتور خودم\))? — فاکتور ۷۰۱/.test(await k.evaluate(()=>document.getElementById('bList').innerText)),'باکس ← انجام‌شده: «خریدم — فاکتور ۷۰۱»');

  console.log('۲) اصلاح و حذف: قلم برداشته‌شده دوباره باز می‌شود');
  await go(p,'فاکتور خرید'); f=await frameOf(p,'فاکتور خرید');
  await f.evaluate(id=>startEdit(id),r.id); await sleep(400);
  ok(await f.evaluate(()=>document.querySelectorAll('#itList .itl').length===3),'اصلاح: سه خط قلم');
  await f.click('#itList .itl:nth-child(2) [data-lx]'); await sleep(100); await f.click('#bSave'); await sleep(500);
  B=await LSg(p,'nt_kbox_v1');
  ok(!B.find(x=>x.id==='b1').st && !B.find(x=>x.id==='b1').fac && B.find(x=>x.id==='b2').st==='me','قلم یک از فاکتور برداشته شد: در باکس دوباره باز');
  await f.evaluate(()=>setPane('book')); await sleep(200); await f.evaluate(()=>{ document.querySelectorAll('#bList [data-br]').forEach(b=>b.click()); }); await sleep(200);
  await f.click(`#bList [data-del="${r.id}"]`); await f.click(`#bList [data-del="${r.id}"]`); await sleep(400);
  B=await LSg(p,'nt_kbox_v1');
  ok(!(await LSg(p,'nt_factor_v1')).some(x=>x.id===r.id) && !B.find(x=>x.id==='b2').st,'حذف فاکتور: قلم‌های باکس دوباره باز');

  console.log('۳) برگ حمل بدون شماره؛ پرداخت کننده و مربوط به حمل تایپ آزاد');
  await f.evaluate(()=>setPane('add')); await f.click('#fCat [data-c="haml"]'); await sleep(150);
  ok(await f.evaluate(()=>document.getElementById('wNo').hidden),'برگ حمل: خانه شماره فاکتور نیست');
  await f.click('#fSup'); await sleep(100); ok((await cbt(f)).some(x=>/پرداخت‌کننده نمونه/.test(x)),'پرداخت کننده: فهرست کشویی');
  await f.fill('#fSup','پرداخت‌کننده تازه'); await f.fill('#fTitle','حمل تازه نمونه'); await f.fill('#fAmt','500000'); await blur(f); await sleep(250); await f.click('#bSave'); await sleep(400);
  F=await LSg(p,'nt_factor_v1'); r=F.find(x=>x.cat==='haml');
  ok(r && r.nono===1 && !r.no && r.sup==='پرداخت‌کننده تازه' && r.title==='حمل تازه نمونه','ثبت برگ حمل بی‌شماره با نام‌های تازه');

  console.log('۴) فاکتور تحویلی: تحویل گیرنده در فرم');
  await f.click('#fCat [data-c="mkh"]'); await sleep(150);
  ok(await f.evaluate(()=>{ const w=document.getElementById('wDlv'); return !w.hidden && !w.closest('details') && !document.getElementById('wRcv').hidden; }),'تحویل گیرنده و تاریخ تحویل در خود فرم (نه جزئیات)');
  await f.fill('#fNo','702'); await f.fill('#fAmt','3000000'); await f.fill('#fSup','تعمیرگاه نمونه'); await f.fill('#fTitle','تعمیر نمونه'); await f.fill('#fRcv','گیرنده نمونه الف'); await f.fill('#fDeliver','14050801'); await blur(f); await sleep(250);
  await f.click('#bSave'); await sleep(400);
  r=(await LSg(p,'nt_factor_v1')).find(x=>x.no==='702');
  ok(r && r.rcv==='گیرنده نمونه الف' && r.deliver==='1405/08/01' && (await LSg(p,'nt_factor_lex_v1')).rcv.includes('گیرنده نمونه الف'),'ثبت با تحویل گیرنده؛ نام در فهرست ماند');
  await f.click('#fRcv'); await sleep(100); ok((await cbt(f)).some(x=>/گیرنده نمونه الف/.test(x)),'بار بعد: تحویل گیرنده در فهرست کشویی'); await blur(f);

  console.log('۵) سندپرداز و تحویل به مالی');
  await f.click('#fCat [data-c="kala"]'); await sleep(100);
  await f.fill('#itList [data-t]','کالای باکس سه'); await f.fill('#fNo','703'); await f.fill('#fAmt','100000'); await f.fill('#fSup','فروشنده نمونه یک'); await blur(f); await sleep(250); await f.click('#bSave'); await sleep(400);
  await f.evaluate(()=>setPane('sp')); await sleep(200);
  await f.click('#spList [data-spd]'); await sleep(300);
  ok(await f.evaluate(()=>!!document.querySelector('#spDone [data-dlv]') && /تحویل مالی نشده/.test(document.getElementById('pSp').innerText)),'بعد از سندپرداز: «تحویل مالی نشده»');
  await f.fill('#spDone [data-rcv]','گیرنده مالی نمونه'); await blur(f); await sleep(250); await f.click('#spDone [data-dlv]'); await sleep(300);
  r=(await LSg(p,'nt_factor_v1')).find(x=>x.no==='703');
  ok(r.deliver && r.rcv==='گیرنده مالی نمونه' && /تحویل مالی به گیرنده مالی نمونه/.test(await f.evaluate(()=>document.getElementById('spDone').textContent)),'«تحویل مالی شد»: تاریخ و گیرنده ثبت شد');
  await go(p,'میز خرید'); const d=await frameOf(p,'میز خرید');
  ok(/تحویل مالی نشده/.test(await d.evaluate(()=>document.getElementById('dFac').innerText)),'میز خرید: کارت «تحویل مالی نشده»');

  console.log('۶) امنیت');
  await go(p,'فاکتور خرید'); f=await frameOf(p,'فاکتور خرید'); await f.evaluate(()=>setPane('add')); await f.click('#fCat [data-c="kala"]');
  await f.fill('#itList [data-t]','<img src=x onerror="window.__z=1">قلم'); await f.fill('#fNo','704'); await f.fill('#fAmt','1'); await f.fill('#fSup','<b>x</b>'); await blur(f); await sleep(250); await f.click('#bSave'); await sleep(400);
  r=(await LSg(p,'nt_factor_v1')).find(x=>x.no==='704');
  ok(r && !/[<>"]/.test(r.items.map(x=>x.t).join('')+r.sup+r.title) && await f.evaluate(()=>!window.__z),'متن خطرناک پاک شد');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300)); await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
