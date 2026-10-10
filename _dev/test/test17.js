// کارت ناوگان در «امروز»: وضعیت دستگاه‌ها از فرم توقف و برنامه روزانه، دسترسی، امنیت
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const pad=n=>String(n).padStart(2,'0');
const hm=m=>{ m=((m%1440)+1440)%1440; return pad(Math.floor(m/60))+':'+pad(m%60); };
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  async function boot(seed){ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); p.errs=[];
    p.on('pageerror',e=>p.errs.push(String(e))); p.on('dialog',d=>{ p.dlg=(p.dlg||0)+1; d.dismiss(); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
    const jk=await p.evaluate(()=>todayKey()); const n=new Date(), nm=n.getHours()*60+n.getMinutes();
    await p.evaluate(([seed])=>{ Object.keys(seed).forEach(k=>localStorage.setItem(k,JSON.stringify(seed[k]))); window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} },[seed(jk,nm)]);
    await p.waitForFunction(()=>{ try{ return !!frames[0].contentDocument.getElementById('flGrid'); }catch(e){ return false; } },null,{timeout:15000});
    await sleep(700); return p; }
  const F=p=>p.evaluate(()=>{ const d=frames[0].contentDocument; const c=d.getElementById('flCard'); return {hidden:c.hidden,
    cards:[...d.querySelectorAll('.fld')].map(b=>({n:b.dataset.dev,cls:b.className.replace('fld ',''),t:b.innerText.replace(/\s+/g,' ')})),
    sum:[...d.querySelectorAll('#flSum .k b')].map(b=>b.textContent).join('|')}; });
  const by=(r,n)=>r.cards.find(c=>c.n.indexOf(n)>-1);
  const yk=async p=>p.evaluate(()=>{ const d=new Date(Date.now()-864e5); const q=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d); const g=t=>q.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; });

  console.log('1) وضعیت دستگاه‌ها');
  const P=await boot((jk,nm)=>({
    nt_tavaqof_v1:{[jk+'|عصر']:{stops:[
      {id:'a',dev:'لودر کوماتسو WA470',from:hm(nm-160),to:'',cause:'خرابی هیدرولیک'},
      {id:'b',dev:'کامیون TRS02',from:hm(nm-70),to:'',cause:'نبود راننده'},
      {id:'c',dev:'بیل مکانیکی کوماتسو PC400',from:hm(nm-45),to:'',cause:'سرویس دوره‌ای'},
      {id:'d',dev:'کامیون TRS01',from:hm(nm-300),to:hm(nm-270),cause:'نبود راننده'},
      {id:'e',dev:'ژنراتور 1',from:hm(nm-100),to:'',cause:'خرابی موتور'}]}},
    nt_prog_v1:{[jk]:{tasks:[{id:'1',dev:'لودر کوماتسو WA470',prog:'تعویض روغن',done:false},{id:'2',dev:'لودر کوماتسو WA470',prog:'گریس',done:true},{id:'3',dev:'نیسان',prog:'سرویس',done:false}]}}}));
  let r=await F(P);
  ok(!r.hidden && r.cards.length===8,'کارت ناوگان با ۸ دستگاه دیده می‌شود');
  ok(by(r,'WA470').cls.includes('fl-bad') && /خراب/.test(by(r,'WA470').t),'WA470: خراب');
  ok(/۲:۴۰ ساعت/.test(by(r,'WA470').t) && /خرابی هیدرولیک/.test(by(r,'WA470').t),'WA470: علت و مدت ۲:۴۰');
  ok(/۱ کار مانده/.test(by(r,'WA470').t),'WA470: یک کار مانده (کار انجام‌شده شمرده نشد)');
  ok(by(r,'TRS02').cls.includes('fl-wa') && /منتظر/.test(by(r,'TRS02').t),'TRS02: منتظر (نبود راننده)');
  ok(by(r,'PC400').cls.includes('fl-svc') && /در سرویس/.test(by(r,'PC400').t),'PC400: در سرویس (سرویس دوره‌ای)');
  ok(by(r,'TRS01').cls.includes('fl-ok') && /توقف امروز: ۰:۳۰/.test(by(r,'TRS01').t),'TRS01: در کار، توقف بسته‌شده ۰:۳۰');
  ok(by(r,'PC290').cls.includes('fl-ok') && /بدون توقف/.test(by(r,'PC290').t),'PC290: در کار، بدون توقف');
  ok(!r.cards.some(c=>/ژنراتور/.test(c.n)),'ژنراتور (غیر اصلی) در ناوگان نیست');
  ok(r.sum==='۱|۲|۵','شمارنده‌ها: ۱ خراب، ۲ منتظر/سرویس، ۵ در کار — '+r.sum);
  ok(r.cards[0].n.indexOf('WA470')>-1,'خراب‌ها اول می‌آیند');
  console.log('2) کلیک روی کارت');
  await P.evaluate(()=>{ frames[0].contentDocument.querySelector('.fld[data-dev*="WA470"]').click(); }); await sleep(900);
  ok(await P.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); return !!d && !d.hidden && /WA470/.test(d.innerText); }),'صفحه دستگاه WA470 باز می‌شود');
  ok(P.errs.length===0,'بدون خطا '+P.errs.slice(0,2).join('|'));

  console.log('3) توقف باز دیشب و روز بعد');
  const Q=await boot((jk,nm)=>({nt_tavaqof_v1:{}}));
  const yk0=await yk(Q);
  await Q.evaluate(([y,nm])=>{ localStorage.setItem('nt_tavaqof_v1',JSON.stringify({[y+'|شب']:{stops:[{id:'a',dev:'کامیون TRS03',from:'23:00',to:'',cause:'خرابی موتور'}]}})); frames[0].contentWindow.postMessage({nt:'show'},'*'); },[yk0,0]); await sleep(600);
  r=await F(Q); ok(by(r,'TRS03').cls.includes('fl-bad'),'توقف باز دیشب هنوز خراب حساب می‌شود');
  // توقف باز چند روز پیش (مثل TRS02 که از ۱۶ مهر بسته نشده بود) باید خراب بماند
  const old3=await Q.evaluate(()=>{ const d=new Date(Date.now()-3*864e5); const q=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d); const g=t=>q.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; });
  await Q.evaluate(d=>{ localStorage.setItem('nt_tavaqof_v1',JSON.stringify({[d+'|صبح']:{stops:[{id:'a',dev:'کامیون TRS02',from:'11:45',to:'',cause:'خرابی موتور'}]}})); frames[0].contentWindow.postMessage({nt:'show'},'*'); },old3); await sleep(600);
  r=await F(Q); ok(by(r,'TRS02').cls.includes('fl-bad'),'توقف باز ۳ روز پیش هنوز خراب است (تا بسته نشود)');
  ok(/۲ روز|۳ روز/.test(by(r,'TRS02').t) && /پایان را ثبت کنید/.test(by(r,'TRS02').t),'مدت به روز نوشته می‌شود و یادآوری ثبت پایان می‌آید — '+by(r,'TRS02').t);
  ok(await Q.evaluate(()=>{ const f=frames[0].contentWindow; const g=f.flJ2G(f.todayKey()); const n=new Date(); return g[0]===n.getFullYear() && g[1]===n.getMonth()+1 && g[2]===n.getDate(); }),'تبدیل تاریخ شمسی به میلادی درست است');
  ok(await Q.evaluate(()=>{ const f=frames[0].contentWindow; const g=f.flJ2G('1405/07/16'); return g[0]===2026 && g[1]===10 && g[2]===8; }),'۱۶ مهر ۱۴۰۵ = ۸ اکتبر ۲۰۲۶');
  console.log('4) دسترسی و امنیت');
  await Q.evaluate(()=>{ const i=DOCS.findIndex(d=>d.name==='توقف شیفت'); tabs[i].hidden=true; window.ntSync.canSee=n=>n!=='توقف شیفت'; frames[0].contentWindow.postMessage({nt:'show'},'*'); }); await sleep(700);
  r=await F(Q); ok(r.hidden,'بدون دسترسی به «توقف شیفت»، ناوگان نشان داده نمی‌شود (وضعیت اشتباه «در کار» نمی‌دهد)');
  const X=await boot((jk,nm)=>({nt_tavaqof_v1:{[jk+'|صبح']:{stops:[{id:'a',dev:'لودر ZL50',from:'08:00',to:'',cause:'<img src=x onerror=top.__xss=true>'}]}}}));
  r=await F(X); ok(!(await X.evaluate(()=>!!window.__xss)) && !(await X.evaluate(()=>!!frames[0].contentDocument.querySelector('.fld img'))),'متن علت امن است (کد اجرا نشد)');
  ok(X.errs.length===0,'بدون خطا');
  await br.close(); web.close();
  console.log(fails?`\n${fails} آزمایش ناموفق`:'\nهمه موفق'); process.exit(fails?1:0);
})();
