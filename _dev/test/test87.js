// چک روزانه راننده: شیفت صبح/شب، فرم، ثبت مشکل خودکار، کارت «امروز»، امنیت. همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=dt=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(dt); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
const ago=n=>J(new Date(Date.now()-n*864e5));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:412,height:900}});
  await c.addInitScript(()=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({mode:'w'})); } });
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntQr&&window.ntDChk,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd,#ntPin,#ntSp{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(800);

  console.log('۱) شیفت و موردها');
  const sh=await p.evaluate(()=>{ const u=(h,m)=>new Date(Date.UTC(2026,9,29,h,m)); return [ntDChk.now(u(6,30)),ntDChk.now(u(12,30)),ntDChk.now(u(22,30))]; });
  ok(sh[0].sh==='صبح' && sh[1].sh==='شب' && sh[0].d===sh[1].d,'ساعت ۱۰ صبح = صبح، ساعت ۱۶ = شب همان روز');
  ok(sh[2].sh==='شب' && sh[2].d===sh[0].d,'ساعت ۲ بامداد روز بعد = شب همان روز قبل');
  const it=await p.evaluate(()=>[ntDChk.items('لودر کوماتسو WA470').map(x=>x.k).join(),ntDChk.items('کامیون TRS01').map(x=>x.k).join(),ntDChk.items('ژنراتور کامینز 700KVA').map(x=>x.k).join(),ntDChk.items('بیل مکانیکی کوماتسو PC400').map(x=>x.k).join()]);
  ok(/teeth/.test(it[0]) && /grease/.test(it[0]) && /airtank/.test(it[1]) && !/tires/.test(it[2]) && /track/.test(it[3]) && !/tires/.test(it[3]),'موردهای هر نوع: لودر، کامیون، ژنراتور، بیل');

  console.log('۲) صفحه دستگاه و فرم');
  await p.evaluate(()=>ntQr.home('WA470')); await sleep(300);
  let B=await p.evaluate(()=>document.getElementById('ntQrBody').innerText);
  ok(/چک روزانه شیفت .* انجام نشده/.test(B) && !!(await p.$('#qrChk')),'یادآور بالای صفحه و دکمه «شروع چک»');
  await p.click('#qrChk'); await sleep(200);
  ok(await p.evaluate(()=>document.querySelectorAll('#ntQrBody .cki').length===10),'۱۰ مورد برای لودر');
  await p.click('#qrSave'); await sleep(100);
  ok(/۱۰ مورد هنوز انتخاب نشده/.test(await p.evaluate(()=>document.getElementById('qrMsg').textContent)),'بدون انتخاب: پیام');
  await p.click('#qrAllOk');
  await p.click('.cki[data-k="hyd"] [data-v="bad"]'); await p.fill('.cki[data-k="hyd"] input','<img src=x onerror=window.__z=1>حدود ۱۰ لیتر کم');
  await p.click('.cki[data-k="grease"] [data-v="no"]');
  await p.click('#qrSave'); await sleep(300);
  let D=await p.evaluate(()=>JSON.parse(localStorage.nt_dchk_v1)), M=await p.evaluate(()=>JSON.parse(localStorage.nt_moshkel_v1));
  ok(D.length===1 && D[0].dev==='لودر کوماتسو WA470' && D[0].r.hyd==='bad' && D[0].r.grease==='no' && D[0].r.oil==='ok' && /۱۰ لیتر/.test(D[0].n.hyd),'چک ذخیره شد (سالم، مشکل، نشد، توضیح)');
  ok(M.rows.length===1 && M.rows[0].sys==='سیستم هیدرولیک' && M.rows[0].src==='چک روزانه' && /روغن هیدرولیک/.test(M.rows[0].desc) && M.rows[0].state==='باز','«مشکل دارد» → ثبت مشکلات (فقط مشکل، نه «نشد»)');
  B=await p.evaluate(()=>document.getElementById('ntQrBody').innerText);
  ok(/انجام شد/.test(B) && /۱ مشکل/.test(B) && await p.evaluate(()=>!!document.querySelector('#ntQrBody .dck.ok')),'صفحه دستگاه: «انجام شد — ۱ مشکل»');
  await p.click('#qrChk'); await sleep(200);
  ok(await p.evaluate(()=>document.querySelector('.cki[data-k="hyd"] [data-v="bad"]').getAttribute('aria-pressed')==='true' && document.getElementById('qrSave').textContent==='ذخیره تغییر'),'باز کردن دوباره: انتخاب‌های قبلی');
  await p.click('#qrSave'); await sleep(300);
  ok((await p.evaluate(()=>JSON.parse(localStorage.nt_moshkel_v1))).rows.length===1 && (await p.evaluate(()=>JSON.parse(localStorage.nt_dchk_v1))).length===1,'ذخیره دوباره: مشکل و چک تکراری نشد');
  await p.click('#qrHist'); await sleep(200);
  ok(/چک روزانه/.test(await p.evaluate(()=>document.getElementById('ntQrBody').innerText)),'سوابق: بخش چک روزانه');
  await p.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); if(d) d.hidden=true; });

  console.log('۳) کارت «امروز»');
  await p.evaluate(()=>window.postMessage({nt:'go',tab:'امروز'},'*')); await sleep(900);
  const f=await (await p.$$('iframe'))[await p.evaluate(()=>DOCS.findIndex(d=>d.name==='امروز'))].contentFrame();
  await f.evaluate(()=>dcRender()); await sleep(200);
  const T=await f.evaluate(()=>{ const b=document.getElementById('dcCard'); return b.hidden?'':b.innerText; });
  ok(/چک روزانه دستگاه‌ها/.test(T) && /۷ دستگاه مانده/.test(T) && /لودر کوماتسو WA470/.test(T) && /۱ مشکل: روغن هیدرولیک/.test(T),'کارت: ۷ مانده، WA470 با ۱ مشکل');
  ok(/این ماه: ۱ چک، ۱ مشکل/.test(T),'خلاصه ماه');
  ok(!(await p.evaluate(()=>window.__z)) && !(await f.evaluate(()=>window.__z||!!document.querySelector('#dcCard img'))),'متن خطرناک بی‌اثر');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300));
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
