// تسمه‌ها: خواندن فایل، وصل به دستگاه‌ها، موجودی انبار، صفحه دستگاه، چک روزانه، «امروز». همه کدها و نام‌ها ساختگی است.
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
  await c.addInitScript(()=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({mode:'w'}));
    localStorage.setItem('nt_stock_v1',JSON.stringify({at:'1405/08/01',items:{'900101':{n:'تسمه پروانه لودر ZT99 - نمونه',q:2,u:'حلقه'},'900102':{n:'تسمه کولر QX11 نمونه',q:0,u:'حلقه'},'900103':{n:'روغن نمونه QX11',q:5,u:'لیتر'}}}));
     } });
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntQr,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd,#ntPin,#ntSp{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(800);
  if(await p.locator('#ntWs [data-ws="nt"]').count()){ try{ await p.click('#ntWs [data-ws="nt"]',{timeout:3000}); }catch(e){} await sleep(800); }
  const go=async t=>{ await p.evaluate(t=>show(DOCS.findIndex(d=>d.name===t)),t); await sleep(1500); return await (await p.$$('iframe'))[await p.evaluate(t=>DOCS.findIndex(d=>d.name===t),t)].contentFrame(); };

  const HEAD=[['جدول نمونه'],[],['ردیف','نام دستگاه','تسمه دینام','تعداد','تسمه کولر','تعداد','تسمه پروانه','تعداد','تسمه واترپمپ','تعداد']];
  const AOA=HEAD.concat([[1,'لودر ZL50','-','-','QX11',1,'ZT99',2,'-','-'],[2,'لودرکوماتسو 6-470','QX22',1,'-','-','-','-','-','-'],[3,'کامیون بنز  LK1924 WH','QX33',1,null,null,null,null,null,null],
    [4,'کمپرسور نمونه','QX44',1,'-','-','-','-','-','-'],[5,'بیل نمونه PC400-8','QX55',1,null,1,'QX66',1,null,null],['نکته: نمونه',null,null]]);
  console.log('۱) خواندن فایل');
  const R=await p.evaluate(a=>ntBelt.parse(a),AOA);
  ok(R.length===5,'۵ ردیف (یادداشت پایین جدول نه)');
  ok(R[0].devs[0]==='لودر ZL50' && R[0].b.fan.code==='ZT99' && R[0].b.fan.n===2 && R[0].b.cooler.code==='QX11' && !R[0].b.dinam,'ZL50: پروانه ۲ عدد، کولر؛ «-» خالی');
  ok(R[1].devs[0]==='لودر کوماتسو WA470' && R[2].devs.length===3 && R[2].devs.includes('کامیون TRS02') && !R[3].devs.length,'نام‌ها: WA470، بنز = سه کامیون TRS، کمپرسور = بدون دستگاه');
  ok(R[4].devs[0]==='بیل مکانیکی کوماتسو PC400' && R[4].b.dinam.code==='QX55' && R[4].b.fan.code==='QX66' && !R[4].b.cooler,'ردیف جابه‌جا (PC400): تعداد بدون کد نادیده');

  console.log('۲) بارگذاری در انبار و اصلاح');
  await p.evaluate(()=>show(DOCS.findIndex(d=>d.name==='انبار'))); await sleep(1500);
  const f=await (await p.$$('iframe'))[await p.evaluate(()=>DOCS.findIndex(d=>d.name==='انبار'))].contentFrame();
  await f.evaluate(()=>{ document.querySelector('.tab[data-p="stock"]').click(); document.getElementById('bltW').open=true; });
  await p.evaluate(a=>{ ntReport.readAoa=async()=>a; },AOA);
  await f.setInputFiles('#bltFile',{name:'b.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('x')}); await sleep(400);
  ok(/۵ ردیف خوانده شد؛ ۴ ردیف/.test(await f.evaluate(()=>document.getElementById('bltMsg').textContent)),'پیام: ۵ ردیف، ۴ وصل');
  const inp=`.bltr[data-id="b2"] input[data-k="fan"][data-f="code"]`; await f.fill(inp,'<b>QX77'); await f.dispatchEvent(inp,'change'); await sleep(200);
  const B=await p.evaluate(()=>JSON.parse(localStorage.nt_belts_v1));
  ok(B.rows.find(r=>r.id==='b2').b.fan.code==='bQX77' && B.rows.find(r=>r.id==='b2').b.fan.n===1,'اصلاح دستی ردیف (بدون < >)');

  console.log('۳) موجودی و صفحه دستگاه');
  const L=await p.evaluate(()=>ntBelt.of('لودر ZL50'));
  ok(L.length===2 && L.find(x=>x.k==='fan').stock.q===2 && L.find(x=>x.k==='cooler').stock.q===0,'موجودی از نام کالای «تسمه»: پروانه ۲، کولر ۰ (روغن هم‌کد حساب نشد)');
  await p.evaluate(()=>{ ntQr.home('ZL50'); }); await sleep(300);
  const T=await p.evaluate(()=>document.getElementById('ntQrBody').innerText);
  ok(/تسمه‌ها/.test(T) && /پروانه: ZT99 × ۲/.test(T) && /انبار: ۲/.test(T) && /کولر: QX11/.test(T) && /در انبار نیست/.test(T),'صفحه دستگاه: تسمه‌ها با موجودی');

  console.log('۴) چک روزانه: تسمه مشکل دارد');
  await p.click('#qrChk'); await sleep(200); await p.click('#qrAllOk'); await p.click('.cki[data-k="belt"] [data-v="bad"]'); await p.fill('.cki[data-k="belt"] input','ترک خورده'); await p.click('#qrSave'); await sleep(300);
  const M=await p.evaluate(()=>JSON.parse(localStorage.nt_moshkel_v1).rows);
  ok(M.length===1 && /تسمه لازم:/.test(M[0].desc) && /پروانه ZT99 × 2 \(انبار: 2\)/.test(M[0].desc) && /کولر QX11 \(در انبار نیست\)/.test(M[0].desc),'ثبت مشکلات: '+(M[0]&&M[0].desc));
  await p.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); if(d) d.hidden=true; });

  console.log('۵) «امروز»');
  await p.evaluate(()=>show(DOCS.findIndex(d=>d.name==='امروز'))); await sleep(1200);
  const t2=await (await p.$$('iframe'))[await p.evaluate(()=>DOCS.findIndex(d=>d.name==='امروز'))].contentFrame(); await t2.evaluate(()=>{ try{ atRender(); }catch(e){} }); await sleep(200);
  ok(/دستگاه اصلی تسمه یدکی در انبار ندارد/.test(await t2.evaluate(()=>document.getElementById('atList').innerText)),'نیاز به توجه: تسمه یدکی');
  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300));
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
