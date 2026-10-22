// بخش «خرید» — زبانه‌های «میز خرید»، «لیست خرید» (باکس سندپرداز، هفتگی، آب شیرین، خدمات)، «پیش‌فاکتور» (مقایسه، تایید مدیر، پیوست)
// همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HEAD=['انتخاب','سال مالي','شماره','نوع مبنا','سال مبنا پدر','ش.مبنا پدر','تكميل','رديف','کد کالا','شرح کالا','مقدار','واحد','تاريخ نياز','دليل نياز','ملاحظات','تاريخ','کد نوع فعاليت','نوع فعاليت','توضيحات','درخواست کننده','کد بخش','بخش','کد مامور خريد','مامور خريد','کد نوع خريد','نوع خريد','کاربر ثبت کننده'];
const row=(no,r,code,name,q,u,why)=>[null,'1405',no,'','','','',r,code,name,q,u,'1405/07/01',why,'','1405/06/28','','','','کاربر نمونه','','','','','','',''];
const AOA1=[HEAD,row('101','1','1001','کالای نمونه الف','2','عدد','خرابی'),row('101','2','1002','کالای نمونه ب','5','متر','تعمیر'),row('102','1','1003','کالای نمونه ج','1','دست','ذخیره')];
const AOA2=[HEAD,row('101','1','1001','کالای نمونه الف','2','عدد','خرابی'),row('102','1','1003','کالای نمونه ج','1','دست','ذخیره'),row('103','1','1004','کالای نمونه د','3','عدد','نو')];
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

  console.log('۱) بخش خرید: چهار زبانه و نوار پایین');
  let {c,p,errs}=await run({mode:'w'});
  await p.click('#ntWs [data-ws="kh"]'); await sleep(1500);
  let V=await visTabs(p);
  ok(['میز خرید','لیست خرید','پیش‌فاکتور','فاکتور خرید'].every(t=>V.includes(t)) && V.length===4,'بخش خرید: چهار زبانه — '+V.join('، '));
  ok(await p.evaluate(()=>getComputedStyle(document.getElementById('ntNav')).display!=='none' && /میز/.test(document.getElementById('ntNav').innerText) && /پیش‌فاکتور/.test(document.getElementById('ntNav').innerText)),'نوار پایین بخش خرید: میز، لیست، پیش‌فاکتور، فاکتور');

  console.log('۲) باکس سندپرداز');
  await go(p,'لیست خرید'); let f=await frameOf(p,'لیست خرید');
  const imp=async aoa=>{ await p.evaluate(a=>{ window.ntReport.readAoa=async()=>a; },aoa); await f.setInputFiles('#bFile',{name:'box.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from('x')}); await sleep(600); };
  await imp(AOA1);
  let B=await LSg(p,'nt_kbox_v1');
  ok(B.length===3 && B.every(x=>x.seen) && B.find(x=>x.code==='1002').name==='کالای نمونه ب' && B.find(x=>x.code==='1002').why==='تعمیر','بارگذاری: ۳ قلم با ستون‌ها از روی نام ستون (ي/ك عربی)');
  ok(/۳ قلم در فایل: ۳ تازه/.test(await f.evaluate(()=>document.getElementById('bMsg').textContent)),'پیام بارگذاری');
  await f.click('.bx[data-id*="-1001"] [data-imp]'); await sleep(200);
  await f.fill('.bx[data-id*="-1001"] [data-memo]','فوری'); await f.dispatchEvent('.bx[data-id*="-1001"] [data-memo]','change'); await sleep(200);
  await f.click('.bx[data-id*="-1002"] [data-st="teh"]'); await sleep(200);
  B=await LSg(p,'nt_kbox_v1');
  ok(B.find(x=>x.code==='1001').imp && B.find(x=>x.code==='1001').memo==='فوری' && B.find(x=>x.code==='1002').st==='teh','ستاره ضروری، توضیح و «مأمور تهران» ذخیره شد');
  await imp(AOA2);
  B=await LSg(p,'nt_kbox_v1');
  ok(B.length===4 && B.find(x=>x.code==='1001').memo==='فوری' && !B.find(x=>x.code==='1002').gone && B.find(x=>x.code==='1004') && !B.find(x=>x.code==='1003').gone,'بارگذاری دوباره: علامت‌ها ماند، قلم تازه آمد، قلم «مأمور تهران» رفته‌شده نمی‌شود');
  await p.evaluate(()=>{ const A=JSON.parse(localStorage.getItem('nt_kbox_v1')); A.find(x=>x.code==='1003').st=''; localStorage.setItem('nt_kbox_v1',JSON.stringify(A)); });
  await imp([HEAD,row('101','1','1001','کالای نمونه الف','2','عدد','خرابی')]);
  B=await LSg(p,'nt_kbox_v1');
  ok(B.find(x=>x.code==='1004').gone && !B.find(x=>x.code==='1001').gone,'قلمی که در فایل تازه نیست: «رفته از باکس»');
  await f.click('#bF [data-f="imp"]'); await sleep(200);
  ok(await f.evaluate(()=>document.querySelectorAll('#bList .bx').length===1),'فیلتر ضروری: ۱ قلم');
  await f.click('#bCopy'); await sleep(300);
  const clip=await p.evaluate(()=>navigator.clipboard.readText());
  ok(/کالای نمونه الف — 2 عدد \(فوری\)/.test(clip),'کپی لیست ضروری‌ها با توضیح');

  console.log('۳) هفتگی، آب، خدمات');
  await f.click('#seg [data-p="week"]'); await f.fill('#wAdd','قلم یک\nقلم دو\n\nقلم سه'); await f.click('#wAddB'); await sleep(300);
  await f.click('#wList .wk:first-child input'); await sleep(200);
  let W=await LSg(p,'nt_kweek_v1');
  ok(W.length===1 && W[0].items.length===3 && W[0].items[0].done,'هفتگی: ۳ قلم، یکی خریده شد');
  await f.click('#wNew'); await sleep(300);
  W=await LSg(p,'nt_kweek_v1');
  ok(W.length===2 && W.filter(w=>w.arch).length===1 && W.find(w=>!w.arch).items.length===2,'لیست تازه هفته: دو قلم نخریده منتقل شد');
  await f.click('#seg [data-p="water"]'); await sleep(200);
  ok(await f.evaluate(()=>document.getElementById('aState').classList.contains('due')),'آب: هنوز ثبت نشده = نوبت است');
  await f.click('#aAdd'); await sleep(200);
  ok(await f.evaluate(()=>document.getElementById('aState').classList.contains('ok')) && (await LSg(p,'nt_kwater_v1')).trips.length===1,'آب: ثبت امروز، حالت سبز');
  await f.click('#aAdd'); await sleep(200);
  ok(/قبلاً/.test(await f.evaluate(()=>document.getElementById('aMsg').textContent)),'آب: دوبار در یک روز ثبت نمی‌شود');
  await f.click('#seg [data-p="svc"]'); await f.fill('#sUnit','واحد نمونه'); await f.fill('#sTitle','کار نمونه'); await f.click('#sAdd'); await sleep(200);
  ok(/شماره خدمات ندارد/.test(await f.evaluate(()=>document.getElementById('sMsg').textContent)) && await f.evaluate(()=>document.querySelectorAll('#sOpen .svc.nr').length===1),'خدمات بدون شماره: هشدار و قرمز');
  await f.fill('#sOpen [data-no]','5501'); await f.dispatchEvent('#sOpen [data-no]','change'); await sleep(200);
  ok((await LSg(p,'nt_ksvc_v1'))[0].no==='5501' && await f.evaluate(()=>!document.querySelector('#sOpen .svc.nr')),'شماره خدمات بعداً اضافه شد');

  console.log('۴) پیش‌فاکتور: استعلام، دو فروشنده، مقایسه');
  await go(p,'پیش‌فاکتور'); f=await frameOf(p,'پیش‌فاکتور');
  await f.click('#seg [data-p="new"]'); await f.fill('#nT','استعلام نمونه'); await f.fill('#nI','قلم الف ۱۰ کیسه\nقلم ب ۲ عدد'); await f.click('#nSave'); await sleep(400);
  let P=await LSg(p,'nt_kpre_v1');
  ok(P.length===1 && P[0].items.length===2 && P[0].items[0].t==='قلم الف' && P[0].items[0].q===10 && P[0].items[0].u==='کیسه','اقلام از متن: نام، تعداد، واحد');
  const addQ=async(sup,a,b,file)=>{ const q='.qt'; await f.fill(q+' [data-k=sup]',sup); const ins=await f.$$(q+' [data-it]'); await ins[0].fill(a); await ins[1].fill(b);
    if(file) await f.setInputFiles(q+' [data-k=file]',file); await f.click(q+' [data-addq]'); await sleep(700); };
  const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
  await addQ('فروشنده نمونه یک','100000','50000',{name:'q.png',mimeType:'image/png',buffer:PNG});
  await addQ('فروشنده نمونه دو','90000','70000');
  P=await LSg(p,'nt_kpre_v1'); const FL=await LSg(p,'nt_kpre_files_v1');
  ok(P[0].quotes.length===2 && P[0].quotes[0].fid && FL[P[0].quotes[0].fid] && /^image\//.test(FL[P[0].quotes[0].fid].t),'دو پیش‌فاکتور؛ عکس فشرده در اطلاعات همگام');
  const best=await f.evaluate(()=>[...document.querySelectorAll('.cmp td.best')].map(t=>t.innerText.split('\n')[0]));
  ok(best.length===3 && /۹۰۰٬۰۰۰/.test(best[0]) && /۱۰۰٬۰۰۰/.test(best[1]),'مقایسه: ارزان‌ترین هر قلم و جمع سبز — '+best.join(' | '));
  ok(/ترکیب بهترین/.test(await f.evaluate(()=>document.querySelector('.iq .bd').innerText)) && /۱٬۰۰۰٬۰۰۰/.test(await f.evaluate(()=>document.querySelector('.iq .bd .hint').innerText)),'ترکیب بهترین: ۱٬۰۰۰٬۰۰۰');
  await f.click('[data-fv]'); await sleep(300);
  ok(await f.evaluate(()=>!document.getElementById('fv').hidden),'دیدن پیوست عکس'); await f.click('#fvX');
  await f.click('[data-send]'); await sleep(300);
  ok((await LSg(p,'nt_kpre_v1'))[0].st==='wait','فرستاده شد برای تایید');

  console.log('۵) میز خرید');
  await go(p,'میز خرید'); f=await frameOf(p,'میز خرید'); await sleep(300);
  let D=await f.evaluate(()=>document.body.innerText);
  ok(/پیش‌فاکتور منتظر تایید شماست/.test(D),'مدیر: هشدار «منتظر تایید شما»');
  ok(!/نوبت آوردن آب/.test(D) && !/بدون شماره ثبت/.test(D),'آب امروز آمده و خدمات شماره دارد: بی‌هشدار');
  await f.click('.dc:has-text("ضروری‌های باز")'); await sleep(900);
  ok(await p.evaluate(()=>DOCS[tabs.findIndex(t=>t.classList.contains('on'))].name==='لیست خرید'),'کارت ضروری‌ها: رفتن به لیست خرید');
  f=await frameOf(p,'لیست خرید');
  ok(await f.evaluate(()=>!document.getElementById('p_box').hidden && document.querySelector('#bF [aria-pressed="true"]').dataset.f==='imp'),'قسمت باکس با فیلتر ضروری');

  console.log('۶) تایید مدیر و افزودن به لیست هفتگی');
  await go(p,'پیش‌فاکتور'); f=await frameOf(p,'پیش‌فاکتور');
  if(!(await f.$('.iq .bd'))){ await f.click('.iq > button.h'); await sleep(200); }
  await f.click('[data-apok]'); await sleep(200);
  ok(/اول یک فروشنده/.test(await f.evaluate(()=>document.querySelector('[data-am]').textContent)),'تایید بدون انتخاب: پیام');
  await f.click('[data-apmix]'); await sleep(100);
  ok(await f.evaluate(()=>document.querySelectorAll('.cmp td.pick').length===2),'«هر قلم ارزان‌ترین»: دو خانه انتخاب شد');
  await f.click('[data-apok]'); await sleep(400);
  P=await LSg(p,'nt_kpre_v1');
  ok(P[0].st==='ok' && P[0].dec.mode==='item' && Object.keys(P[0].dec.per).length===2 && P[0].quotes.find(q=>q.id===P[0].dec.per[P[0].items[0].id]).sup==='فروشنده نمونه دو','تایید: هر قلم از فروشنده ارزان‌تر');
  await f.click('[data-tolist]'); await sleep(400);
  W=(await LSg(p,'nt_kweek_v1')).find(w=>!w.arch);
  ok(W.items.some(i=>/قلم الف 10 کیسه — از فروشنده نمونه دو/.test(i.t)) && (await LSg(p,'nt_kpre_v1'))[0].inList,'افزودن اقلام تایید‌شده به لیست هفتگی');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300)); await c.close();

  console.log('۷) دسترسی: کاربر بدون حق تایید و فقط‌خواندنی');
  const P0=[{id:'p1',title:'استعلام آزمایشی',date:'1405/07/01',by:'',items:[{id:'i1',t:'قلم',q:1,u:''}],quotes:[{id:'q1',sup:'فروشنده آزمایشی',date:'1405/07/01',prices:{i1:5}}],st:'wait'}];
  const cfgU=(acl,appr)=>({uid:'u1',mode:'w',acl,appr:!!appr});
  ({c,p,errs}=await run(cfgU({'میز خرید':'w','لیست خرید':'w','پیش‌فاکتور':'w','فاکتور خرید':'w'}),{nt_kpre_v1:P0}));
  if(await p.evaluate(()=>{ const e=document.getElementById('ntWs'); return e&&!e.hidden; })){ await p.click('#ntWs [data-ws="kh"]'); await sleep(1200); }
  await go(p,'پیش‌فاکتور'); f=await frameOf(p,'پیش‌فاکتور'); await f.click('.iq > button.h'); await sleep(200);
  ok(await f.evaluate(()=>!document.querySelector('[data-apok]') && /منتظر تایید مدیر/.test(document.body.innerText)),'مأمور خرید (بی‌حق تایید): دکمه تایید ندارد');
  await go(p,'میز خرید'); f=await frameOf(p,'میز خرید');
  ok(!/منتظر تایید شماست/.test(await f.evaluate(()=>document.body.innerText)),'میز: هشدار تایید برای مأمور خرید نیست');
  await c.close();
  ({c,p,errs}=await run(cfgU({'میز خرید':'w','لیست خرید':'r','پیش‌فاکتور':'w'},true),{nt_kpre_v1:P0}));
  if(await p.evaluate(()=>{ const e=document.getElementById('ntWs'); return e&&!e.hidden; })){ await p.click('#ntWs [data-ws="kh"]'); await sleep(1200); }
  await go(p,'پیش‌فاکتور'); f=await frameOf(p,'پیش‌فاکتور'); await f.click('.iq > button.h'); await sleep(200);
  ok(await f.evaluate(()=>!!document.querySelector('[data-apok]')),'کاربر با «تایید پیش‌فاکتور»: دکمه تایید دارد');
  await go(p,'لیست خرید'); f=await frameOf(p,'لیست خرید');
  ok(await f.evaluate(()=>document.body.classList.contains('ro') && getComputedStyle(document.querySelector('#p_water .w-only')||document.querySelector('.w-only')).display==='none'),'لیست خرید فقط‌خواندنی: فرم‌ها پنهان');
  await go(p,'میز خرید'); f=await frameOf(p,'میز خرید');
  ok(await f.evaluate(()=>document.getElementById('dFac').hidden),'میز: بخش فاکتور برای کسی که «فاکتور خرید» را نمی‌بیند پنهان است');
  await c.close();

  console.log('۸) امنیت: متن خطرناک در فایل باکس و نام فروشنده');
  ({c,p,errs}=await run({mode:'w'}));
  await p.click('#ntWs [data-ws="kh"]'); await sleep(1200);
  await go(p,'لیست خرید'); f=await frameOf(p,'لیست خرید');
  await p.evaluate(a=>{ window.ntReport.readAoa=async()=>a; },[HEAD,row('9','1','9','<img src=x onerror="window.__x=1">کالا','1','عدد','<b>x</b>')]);
  await f.setInputFiles('#bFile',{name:'b.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('x')}); await sleep(500); await f.click('#bF [data-f="open"]'); await sleep(200);
  ok(await f.evaluate(()=>!window.__x && !document.querySelector('#bList img') && !document.querySelector('#bList .why b')),'متن فایل باکس پاک‌سازی و بی‌خطر نمایش داده شد');
  await go(p,'پیش‌فاکتور'); f=await frameOf(p,'پیش‌فاکتور');
  await f.click('#seg [data-p="new"]'); await f.fill('#nI','<svg onload=window.__y=1>'); await f.click('#nSave'); await sleep(300);
  await f.fill('.qt [data-k=sup]','<img src=x onerror=window.__y=1>'); await f.fill('.qt [data-it]','1'); await f.click('.qt [data-addq]'); await sleep(400);
  ok(await f.evaluate(()=>!window.__y && !document.querySelector('.cmp img, .cmp svg')),'نام قلم و فروشنده بی‌خطر');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300)); await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
