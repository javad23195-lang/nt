// پرونده دستگاه: بخش «پرونده» در صفحه دستگاه، فهرست «دستگاه‌ها»، دکمه «پرونده» در دفترچه قرائت و تابلوی خرابی‌ها
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pp=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const g=t=>pp.find(x=>x.type===t).value, Y=+g('year'), M=+g('month'), DD=+g('day'), p2=n=>String(n).padStart(2,'0');
const D=d=>`${Y}/${p2(M)}/${p2(Math.min(d,DD))}`, d1=D(1), d2=D(2);
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const seed={
    nt_daftar_v1:[{dev:'لودر ZL50',unit:'ساعت',val:16000,date:d1},{dev:'لودر ZL50',unit:'ساعت',val:16300,date:d2}],
    nt_svc_v1:[{id:'s1',dev:'لودر ZL50',name:'تعویض روغن موتور',every:250,last:16000,ld:d1,months:6},{id:'s2',dev:'لودر ZL50',name:'فیلتر هوا',every:1000,last:16000,ld:d1,months:12}],
    nt_svc_log_v1:[{id:'l1',item:'s1',dev:'لودر ZL50',name:'تعویض روغن موتور',at:16000,d:d1}],
    nt_moshkel_v1:{row:5,rows:[{y:Y,m:M,d:1,mn:'',dev:'لودر ZL50',sys:'سیستم برقی',desc:'استارت <img src=x onerror=window.__x=1>',sev:'بالا',cur:'در حال کار',part:'خیر',state:'باز',fix:'',src:'دفترچه'}]},
    nt_tavaqof_v1:{[d1+'|صبح']:{stops:[{id:'a',dev:'لودر ZL50',from:'08:00',to:'10:30',cause:'خرابی برق',note:''}]}},
    nt_sh8_v1:{rows:[{dev:'لودر ZL-50',st:d1,type:'سیستم برقی',desc:'تعویض استارت',costA:5000000,costK:2500000},{dev:'لودر ZL-50',st:d2,type:'سیستم برقی',desc:'سیم‌کشی'}]},
    nt_kharid9_v1:{row:5,rows:[{date:d1,unit:'لودر ZL50',item:'<img src=x onerror=window.__y=1>',qty:2,bought:''},{date:d1,unit:'لودر ZL50',item:'فیلتر روغن',qty:1,bought:1},{date:d1,unit:'لودر ZL50',item:'لغوی',qty:1,bought:'',over:'لغو شد'}]}};
  const c=await br.newContext({locale:'fa-IR',viewport:{width:412,height:900}});
  await c.addInitScript(s=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(s).forEach(k=>localStorage.setItem(k,JSON.stringify(s[k]))); } },seed);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntDev,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg:not(#ntQrDlg):not(#ntDevDlg),.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(800);

  ok(await p.evaluate(()=>!!document.getElementById('ntDevBtn')),'دکمه «دستگاه‌ها» بالای صفحه هست');
  await p.click('#ntDevBtn'); await sleep(300);
  const L=await p.evaluate(()=>[...document.querySelectorAll('#ntDevL button')].map(b=>b.innerText.replace(/\s+/g,' ')));
  ok(L.length===17,'فهرست ۱۷ دستگاه: '+L.length);
  const z=L.find(x=>/ZL50/.test(x))||'';
  ok(/۱ خرابی باز/.test(z) && /سرویس گذشته/.test(z),'خط وضعیت ZL50: '+z);
  await p.fill('#ntDevQ','pc400'); await sleep(150);
  ok(await p.evaluate(()=>document.querySelectorAll('#ntDevL button').length===1),'جستجو در فهرست');
  await p.fill('#ntDevQ','zl50'); await sleep(150);
  await p.click('#ntDevL button'); await sleep(600);
  const vis=await p.evaluate(()=>!document.getElementById('ntQrDlg').hidden && document.getElementById('ntDevDlg').hidden);
  ok(vis,'صفحه دستگاه باز شد');
  const T=await p.evaluate(()=>{ const f=document.querySelector('#ntQrBody .pf'); return f?f.innerText.replace(/\s+/g,' '):''; });
  ok(/پرونده/.test(T),'بخش «پرونده» هست');
  ok(/گذشته تعویض روغن موتور ۵۰ ساعت گذشته/.test(T),'سرویس گذشته با مقدار: '+(T.match(/سرویس‌ها.{0,90}/)||[''])[0]);
  ok(/وقت هست فیلتر هوا/.test(T),'سرویس دوم');
  ok(/توقف این ماه ۲٫۳ ساعت/.test(T),'توقف این ماه');
  ok(/هزینه تعمیر این ماه ۷٫۵ میلیون/.test(T),'هزینه این ماه (نام دیگر «ZL-50» هم شمرده شد)');
  ok(/خرید باز ۱ قلم/.test(T),'خرید باز: فقط قلم باز (خریده و لغوشده نه)');
  ok(/خرابی تکراری/.test(T),'هشدار خرابی تکراری');
  const ev=await p.evaluate(()=>[...document.querySelectorAll('#ntQrBody .pfev li')].map(l=>l.className));
  ok(['k-stop','k-fault','k-rep','k-svc','k-buy'].every(k=>ev.includes(k)),'رویدادها از همه بخش‌ها: '+ev.join(','));
  ok(await p.evaluate(()=>!window.__x && !window.__y && !document.querySelector('#ntQrBody img[src=x]')),'متن خطرناک اجرا نشد');
  await p.evaluate(()=>{ const b=document.getElementById('ntQrBody'); b.closest('.sydlg').scrollTop=0; });
  await p.screenshot({path:'/tmp/claude-0/devfile1.png'});
  await p.evaluate(()=>document.querySelector('#ntQrBody .pf').scrollIntoView()); await sleep(100);
  await p.screenshot({path:'/tmp/claude-0/devfile2.png'});
  // دسترسی
  const can=await p.evaluate(()=>{ try{ const o=ntSync.canSee; ntSync.canSee=n=>n!=='شناسنامه'&&n!=='درخواست خرید'; window.__o=o; return ntSync.canSee('شناسنامه')===false; }catch(e){ return false; } });
  if(can){ await p.evaluate(()=>ntDev.open('لودر ZL50')); await sleep(300);
    const T2=await p.evaluate(()=>document.querySelector('#ntQrBody .pf').innerText);
    ok(!/هزینه/.test(T2) && !/خرید باز/.test(T2) && !/تعمیر:/.test(T2) && /خرابی:/.test(T2),'بدون دسترسی شناسنامه/خرید: هزینه، خرید و تعمیر نشان داده نمی‌شود');
    await p.evaluate(()=>{ ntSync.canSee=window.__o; }); }
  else console.log('  (canSee قابل تغییر نیست — بخش دسترسی رد شد)');
  await p.keyboard.press('Escape'); await sleep(200);
  // دفترچه قرائت → «پرونده»
  let IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='دفترچه قرائت')); await p.evaluate(i=>show(i),IDX); await sleep(1500);
  let fr=(await (await p.$$('iframe'))[IDX].contentFrame());
  await fr.evaluate(()=>[...document.querySelectorAll('[data-pf]')].find(b=>b.dataset.pf==='گریدر GD705R-2').click()); await sleep(500);
  ok(await p.evaluate(()=>!document.getElementById('ntQrDlg').hidden && /GD705/.test(document.getElementById('ntQrH').textContent)),'«پرونده» در دفترچه قرائت صفحه همان دستگاه را باز کرد');
  await p.keyboard.press('Escape'); await sleep(200);
  IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='ثبت مشکلات')); await p.evaluate(i=>show(i),IDX); await sleep(1500);
  fr=(await (await p.$$('iframe'))[IDX].contentFrame());
  await fr.evaluate(()=>document.getElementById('vwBoard').click()); await sleep(300);
  await fr.evaluate(()=>document.querySelector('#board .bcard [data-pf]').click()); await sleep(500);
  ok(await p.evaluate(()=>!document.getElementById('ntQrDlg').hidden && /ZL50/.test(document.getElementById('ntQrH').textContent)),'«پرونده» روی کارت تابلوی خرابی‌ها');
  await p.keyboard.press('Escape'); await sleep(200);
  // قفل
  await p.evaluate(()=>{ window.ntLocked=true; document.body.classList.add('ntlocked'); });
  ok(await p.evaluate(()=>{ ntDev.open('لودر ZL50'); return document.getElementById('ntQrDlg').hidden && getComputedStyle(document.getElementById('ntDevBtn')).display==='none'; }),'سامانه قفل: پرونده باز نمی‌شود و دکمه پنهان است');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
