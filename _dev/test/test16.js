// نوار پایین و دکمه «+»: رفتن بین زبانه‌ها، دسترسی، قفل، راننده، صفحه بزرگ، صفحه‌کلید
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  async function page(w,h){ const c=await br.newContext({locale:'fa-IR',viewport:{width:w,height:h}}); const p=await c.newPage(); p.errs=[]; p.csp=[];
    p.on('pageerror',e=>p.errs.push(String(e))); p.on('console',m=>{ if(/Content Security Policy/i.test(m.text())) p.csp.push(m.text().slice(0,140)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,[id^=ntSyDlg],[id^=ntSyBd]{display:none!important}'});
    await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} document.querySelectorAll('[id^=ntSy]').forEach(x=>{ if(x.id!=='ntSyBtn'&&x.id!=='ntSyBar') x.hidden=true; }); }); await sleep(600); return p; }
  const vis=(p,s)=>p.evaluate(s=>{ const e=document.querySelector(s); return !!e && getComputedStyle(e).display!=='none' && e.getBoundingClientRect().height>0; },s);
  const act=p=>p.evaluate(()=>{ const i=tabs.findIndex(t=>t.classList.contains('on')); return i>-1?DOCS[i].name:''; });

  console.log('1) گوشی: نوار پایین و دکمه «+»');
  const P=await page(390,800);
  ok(await vis(P,'#ntNav'),'نوار پایین دیده می‌شود');
  ok(await vis(P,'#ntFab'),'دکمه + دیده می‌شود');
  ok(!(await vis(P,'#tabs')),'زبانه‌های بالا پنهان است');
  ok(await P.evaluate(()=>document.querySelectorAll('#ntNav .ntnb').length===4),'چهار دکمه: امروز، برنامه، انبار، بیشتر');
  await P.click('#ntNav [data-n="برنامه روزانه"]'); await sleep(500);
  ok(await act(P)==='برنامه روزانه','دکمه برنامه، زبانه برنامه روزانه را باز می‌کند');
  ok(await P.evaluate(()=>document.querySelector('#ntNav [data-n="برنامه روزانه"]').classList.contains('on')),'دکمه فعال نشان داده می‌شود');
  await P.click('#ntNav [data-more]'); await sleep(250);
  ok(await vis(P,'#ntNavSh.on'),'«بیشتر» باز می‌شود');
  ok(await P.evaluate(()=>[...document.querySelectorAll('#ntNavSh .ntmr')].map(b=>b.dataset.n).join('|'))==='دفترچه قرائت|ثبت مشکلات|شناسنامه|خدمات|درخواست خرید|توقف شیفت','شش زبانه دیگر در «بیشتر»');
  await P.keyboard.press('Escape'); await sleep(150);
  ok(!(await vis(P,'#ntNavSh.on')),'Escape منو را می‌بندد');
  await P.click('#ntNav [data-more]'); await P.click('#ntNavSh [data-n="خدمات"]'); await sleep(500);
  ok(await act(P)==='خدمات' && await P.evaluate(()=>document.querySelector('#ntNav [data-more]').classList.contains('on')),'رفتن به زبانه دیگر؛ «بیشتر» فعال می‌ماند');

  console.log('2) دکمه +');
  await P.click('#ntFab'); await sleep(250);
  ok(await P.evaluate(()=>document.querySelectorAll('#ntNavSh .ntac').length===4),'چهار کار: توقف، مشکل، انبار، قرائت');
  await P.click('#ntNavSh [data-n="توقف شیفت"]');
  ok(await P.waitForFunction(()=>{ const i=DOCS.findIndex(d=>d.name==='توقف شیفت'); try{ const d=frames[i].contentDocument; const t=d&&d.getElementById('fTitle'); return !!t && t.offsetParent!==null && /ثبت توقف/.test(t.textContent); }catch(e){ return false; } },null,{timeout:9000}).then(()=>true,()=>false),'«ثبت توقف» زبانه توقف را باز می‌کند و فرم ثبت باز می‌شود');
  ok(await act(P)==='توقف شیفت','زبانه فعال: توقف شیفت');
  await P.click('#ntFab'); await P.click('#ntNavSh [data-n="انبار"]');
  ok(await P.waitForFunction(()=>{ const i=DOCS.findIndex(d=>d.name==='انبار'); try{ const d=frames[i].contentDocument; const f=d.getElementById('oItem'); return !!f && f.offsetParent!==null; }catch(e){ return false; } },null,{timeout:9000}).then(()=>true,()=>false),'«خروج انبار» فرم خروج را باز می‌کند');

  console.log('3) دسترسی');
  await P.evaluate(()=>{ const i=DOCS.findIndex(d=>d.name==='انبار'); tabs[i].hidden=true; }); await sleep(300);
  ok(await P.evaluate(()=>!document.querySelector('#ntNav [data-n="انبار"]')),'زبانه پنهان‌شده (دسترسی) در نوار نیست');
  await P.click('#ntFab'); await sleep(200);
  ok(await P.evaluate(()=>!document.querySelector('#ntNavSh [data-n="انبار"]') && document.querySelectorAll('#ntNavSh .ntac').length===3),'کار انبار از منوی + حذف شد');
  await P.keyboard.press('Escape');
  await P.evaluate(()=>{ DOCS.forEach((d,i)=>{ if(['توقف شیفت','ثبت مشکلات','دفترچه قرائت'].indexOf(d.name)>-1) tabs[i].hidden=true; }); }); await sleep(300);
  ok(!(await vis(P,'#ntFab')),'اگر هیچ کار قابل نوشتنی نباشد، دکمه + نیست');
  console.log('4) قفل ورود و راننده');
  await P.evaluate(()=>{ DOCS.forEach((d,i)=>{ tabs[i].hidden=false; }); document.body.classList.add('ntlocked'); }); await sleep(300);
  ok(!(await vis(P,'#ntNav')) && !(await vis(P,'#ntFab')),'وقتی قفل است، نوار و + نیست');
  await P.evaluate(()=>{ document.body.classList.remove('ntlocked'); document.body.classList.add('ntdriver'); }); await sleep(300);
  ok(!(await vis(P,'#ntNav')) && !(await vis(P,'#ntFab')),'حالت راننده: نوار و + نیست');
  ok(P.errs.length===0,'بدون خطای جاوااسکریپت '+P.errs.slice(0,2).join(' | '));
  ok(P.csp.length===0,'بدون خطای CSP '+P.csp.slice(0,1).join(''));

  console.log('5) صفحه بزرگ');
  const D=await page(1200,800);
  ok(!(await vis(D,'#ntNav')) && !(await vis(D,'#ntFab')),'روی صفحه بزرگ، نوار پایین نیست');
  ok(await vis(D,'#tabs'),'زبانه‌های بالا مثل قبل');
  ok(D.errs.length===0,'بدون خطا');
  await br.close(); web.close();
  console.log(fails?`\n${fails} آزمایش ناموفق`:'\nهمه موفق'); process.exit(fails?1:0);
})();
