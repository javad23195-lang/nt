// درخواست خرید: جستجو + کالای تکراری با فاصله متفاوت + پیشنهاد کالای شبیه
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844},deviceScaleFactor:1.5}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const R=(date,item,d1,d2,over)=>({date,unit:'PC290',item,u:'عدد',qty:1,bought:'',desc:'',d1,d2,pri:'',buy:'',req:'',apr:'',over:over||'',note:''});
    localStorage.setItem('nt_kharid9_v1',JSON.stringify({row:5,rows:[
      R('1405/07/02','پین ته استیک','1596','643'),R('1405/07/02','جک 2 تن','',''),R('1405/07/05','لاستیک برف پاک کن','1700',''),
      R('1405/07/09','فیلتر روغن','','900'),R('1405/07/09','<img src=x onerror=window.__x=1>','',''),R('1405/07/10','پمپ گازوئیل لودر','','')]}));
    localStorage.setItem('nt_kharid_cat_v1',JSON.stringify([{d:'کلید سه حالته بیل مکانیکی کوماتسو PC400',c:'TST-1',u:'عدد',stk:2,min:0},{d:'<b>سنسور</b> آزمایشی <img src=x onerror=window.__y=1>',c:'TST-2',u:'عدد'}])); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='درخواست خرید'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const F=fn=>p.evaluate(([fn,i])=>(new Function('d','w','return ('+fn+')(d,w)'))(frames[i].contentDocument,frames[i].contentWindow),[fn,IDX]);
  const names=()=>F('(d)=>[...d.querySelectorAll("#slips .slip .nm")].map(x=>x.textContent.trim())');
  const fr=p.frames().find(f=>f!==p.mainFrame() && f.url()===p.mainFrame().url()) || p.frames()[1];
  const typeQ=async v=>{ await F(`(d,w)=>{ const q=d.getElementById('kQ'); q.value=${JSON.stringify(v)}; q.dispatchEvent(new w.Event('input')); }`); await sleep(500); };
  // ۱) جستجو
  ok(await F('(d)=>!!d.getElementById("kQ")'),'جعبه جستجو هست');
  await typeQ('روغن'); let n=await names();
  ok(n.length===1 && n[0]==='فیلتر روغن','جستجوی «روغن» از همه روزها: '+n.join('، '));
  ok(/جستجوی «روغن»: ۱ ردیف/.test(await F('(d)=>d.querySelector(".kfbar").innerText')),'نوار نتیجه جستجو');
  await typeQ('pc290 پین'); n=await names();
  ok(n.length===1 && n[0]==='پین ته استیک','چند کلمه (دستگاه + کالا): '+n.join('، '));
  await typeQ('۱۵۹۶'); n=await names();
  ok(n.length===1 && n[0]==='پین ته استیک','جستجوی شماره سند با رقم فارسی');
  await typeQ('گازوییل'); n=await names();
  ok(n.length===1,'ی عربی/فارسی فرق نمی‌کند (گازوئیل)');
  await typeQ('<img src=x onerror=window.__z=1>'); await sleep(200);
  ok(await F('(d,w)=>!w.__z && !w.__x && !d.querySelector(".kfbar img")'),'متن جستجوی خطرناک اجرا نشد');
  await F('(d)=>d.getElementById("kfOff").click()'); await sleep(300);
  ok(!(await F('(d)=>!!d.querySelector(".kfbar")')) && await F('(d)=>d.getElementById("kQ").value===""'),'«نمایش همه» جستجو را پاک می‌کند');
  // ۲) کالای تکراری با فاصله متفاوت
  await F('(d)=>d.getElementById("kNew").click()'); await sleep(500);
  const typeI=async v=>{ await F(`(d,w)=>{ const q=d.getElementById('fItem'); q.value=${JSON.stringify(v)}; q.dispatchEvent(new w.Event('input')); q.dispatchEvent(new w.Event('change')); }`); await sleep(600); };
  await typeI('کلید سه حالته بیل مکانیکی کوماتسوPC400');
  let inf=await F('(d,w)=>w.itemInfo()');
  ok(inf && !inf.isNew && inf.d==='کلید سه حالته بیل مکانیکی کوماتسو PC400','بدون فاصله = همان کالای کاتالوگ (کالای تازه نیست)');
  await typeI('كليد سه‌حالته  بيل مكانيكي كوماتسو pc-400');
  inf=await F('(d,w)=>w.itemInfo()');
  ok(inf && !inf.isNew,'ک/ی عربی، نیم‌فاصله، خط تیره و حروف کوچک هم همان کالاست');
  // ۳) پیشنهاد شبیه
  await typeI('کلید سه حالته بیل کوماتسو PC400');
  ok(await F('(d,w)=>w.itemInfo().isNew'),'نام کوتاه‌تر: کالای تازه حساب می‌شود');
  ok(await F('(d)=>d.getElementById("vSim").classList.contains("show")'),'«شبیه این است؟» نشان داده شد');
  ok(/کوماتسو PC400/.test(await F('(d)=>d.getElementById("vSim").innerText')),'کالای کاتالوگ پیشنهاد شد');
  await p.screenshot({path:'/tmp/claude-0/ksim.png'});
  await F('(d)=>d.querySelector("#vSim button").click()'); await sleep(400);
  inf=await F('(d,w)=>w.itemInfo()');
  ok(inf && !inf.isNew && inf.c==='TST-1','زدن پیشنهاد: کالای کاتالوگ انتخاب شد');
  ok(!(await F('(d)=>d.getElementById("vSim").classList.contains("show")')),'بعد از انتخاب، پیشنهاد بسته شد');
  await typeI('فیلتر روغنن');
  ok(/فیلتر روغن/.test(await F('(d)=>d.getElementById("vSim").innerText')) && /قبلاً درخواست شده/.test(await F('(d)=>d.getElementById("vSim").innerText')),'درخواست قبلی (کالای غیرکاتالوگ) هم پیشنهاد می‌شود');
  await typeI('فیلترروغن');
  ok(/همین حالا/.test(await F('(d)=>d.getElementById("vDup").innerText')),'«فیلترروغن» بدون فاصله: هشدار تکراری در لیست');
  await typeI('سنسور آزمایشی');
  ok(await F('(d,w)=>!w.__y && !d.querySelector("#vSim img, #vSim b b")'),'نام خطرناک در پیشنهاد اجرا نشد');
  await typeI('چراغ');
  ok(!(await F('(d)=>d.getElementById("vSim").classList.contains("show")')),'نام بی‌شباهت: پیشنهادی نیست');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
