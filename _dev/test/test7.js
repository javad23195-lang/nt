const {chromium}=require('playwright'); const http=require('http'), fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'..','out.html')); const {make}=require('./fakegh.js');
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const G=make(); await new Promise(r=>G.srv.listen(0,r)); const GH='http://localhost:'+G.srv.address().port;
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({viewport:{width:600,height:900},locale:'fa-IR'});
  await c.addInitScript((GH)=>{ window.NTSYNC_TEST={api:GH,raw:GH}; },GH);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync && ntBooted);
  await p.evaluate(()=>show(DOCS.findIndex(d=>d.name==='توقف شیفت')));
  const f=p.frameLocator('iframe.on');
  const stops=async()=>{ const o=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_tavaqof_v1'))||'{}'); return Object.values(o).flatMap(r=>r.stops||[]); };
  await f.locator('#bNew').click();
  ok(await f.locator('#fOpen').isChecked() && await f.locator('#fTo').isEnabled() && await f.locator('[data-now="fTo"]').isEnabled(),'فرم تازه: «هنوز متوقف است» تیک دارد، ولی هر دو کادر ساعت و هر دو دکمه «الان» آزاد است');
  await f.locator('#fPick button').first().click(); await f.locator('#fFrom').fill('08:10'); await f.locator('#fWhy button').first().click();
  await f.locator('#fTo').fill('09:40');
  ok(!(await f.locator('#fOpen').isChecked()),'با نوشتن ساعت شروع دوباره، تیک خودش برداشته شد');
  ok((await f.locator('#fDur').innerText()).includes('۱ ساعت و ۳۰ دقیقه'),'مدت توقف نشان داده می‌شود: '+await f.locator('#fDur').innerText());
  await f.locator('#fOpen').check();
  ok(await f.locator('#fTo').inputValue()==='' && await f.locator('#fTo').isEnabled(),'با زدن تیک، ساعت شروع دوباره پاک می‌شود و کادر آزاد می‌ماند');
  await f.locator('[data-now="fTo"]').click();
  ok(/^\d\d:\d\d$/.test(await f.locator('#fTo').inputValue()) && !(await f.locator('#fOpen').isChecked()),'دکمه «الان» برای شروع دوباره کار می‌کند و تیک را برمی‌دارد');
  await f.locator('#fTo').fill('09:40'); await f.locator('#fSave').click(); await sleep(200);
  let s=await stops(); ok(s.length===1 && s[0].from==='08:10' && s[0].to==='09:40','توقف با هر دو ساعت ذخیره شد');
  // توقف باز
  await f.locator('#bNew').click(); await f.locator('#fPick button').nth(1).click(); await f.locator('#fFrom').fill('10:00'); await f.locator('#fWhy button').first().click(); await f.locator('#fSave').click(); await sleep(200);
  s=await stops(); ok(s.length===2 && s.some(x=>x.from==='10:00' && x.to===''),'توقف «هنوز متوقف» بدون ساعت پایان ذخیره شد');
  // بدون تیک و بدون ساعت پایان → خطا
  await f.locator('#bNew').click(); await f.locator('#fPick button').first().click(); await f.locator('#fFrom').fill('11:00'); await f.locator('#fWhy button').first().click(); await f.locator('#fOpen').uncheck(); await f.locator('#fSave').click();
  ok(await f.locator('#eTo').isVisible() && (await stops()).length===2,'بدون تیک و بدون ساعت پایان: پیام خطا، چیزی ذخیره نمی‌شود');
  await f.locator('#fClose').click();
  // ویرایش توقف باز: نوشتن ساعت پایان
  await f.locator('article.st.open [data-ed]').click();
  ok(await f.locator('#fOpen').isChecked() && await f.locator('#fTo').isEnabled(),'ویرایش توقف باز: کادر ساعت پایان آزاد است');
  await f.locator('#fTo').fill('10:45'); await f.locator('#fSave').click(); await sleep(200);
  s=await stops(); ok(s.find(x=>x.from==='10:00').to==='10:45','ساعت پایان در ویرایش ذخیره شد');
  await p.screenshot({path:require('path').join(require('os').tmpdir(),'tv-form.png')});
  ok(errs.length===0,'بدون خطای اسکریپت '+errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); G.srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
