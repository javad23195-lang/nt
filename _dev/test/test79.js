// باکس سندپرداز: دو باکس جدا («گزارش مأمور» و «ثبت»)، واحد درخواست‌کننده (فیلتر و چسباندن فهرست)، رسید انبار بعد از «خریدم».
// همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HEAD=['انتخاب','سال مالي','شماره','نوع مبنا','سال مبنا پدر','ش.مبنا پدر','تكميل','رديف','کد کالا','شرح کالا','مقدار','واحد','تاريخ نياز','دليل نياز','ملاحظات','تاريخ','کد نوع فعاليت','نوع فعاليت','توضيحات','درخواست کننده','کد بخش','بخش','کد مامور خريد','مامور خريد','کد نوع خريد','نوع خريد','کاربر ثبت کننده'];
const row=(no,r,code,name,q,u,why,REQ)=>[null,'1405',no,'','','','',r,code,name,q,u,'1405/07/01',why,'','1405/06/28','','','',REQ,'','','','','','',''];
const AOA1=[HEAD,row('101','1','1001','کالای نمونه الف','2','عدد','خرابی'),row('101','2','1002','کالای نمونه ب','5','متر','تعمیر'),row('102','1','1003','کالای نمونه ج','1','دست','ذخیره')];
const AOA2=[HEAD,row('101','1','1001','کالای نمونه الف','2','عدد','خرابی'),row('102','1','1003','کالای نمونه ج','1','دست','ذخیره'),row('103','1','1004','کالای نمونه د','3','عدد','نو')];

const M1=[HEAD,row('201','1','2001','قطعه نمونه یک','2','عدد','خرابی','درخواست‌کننده الف'),row('201','2','2002','قطعه نمونه دو','1','عدد','تعمیر','درخواست کننده ب'),row('202','1','2003','قطعه نمونه سه','4','عدد','ذخیره','درخواست‌کننده الف')];
const S1=[HEAD,row('301','1','3001','کالای ثبت یک','1','عدد','نو','درخواست کننده ج')];
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
  await c.addInitScript(()=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntws_test','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({mode:'w'})); localStorage.setItem('ntk_bf','open'); });
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntWs,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
  await p.click('#ntWs [data-ws="kh"]'); await sleep(1200);
  await p.evaluate(()=>{ localStorage.setItem('ntk_pane','box'); window.postMessage({nt:'go',tab:'لیست خرید'},'*'); }); await sleep(1200);
  const i=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='لیست خرید')); const f=await (await p.$$('iframe'))[i].contentFrame();
  const LSg=k=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
  const imp=async aoa=>{ await p.evaluate(a=>{ window.ntReport.readAoa=async()=>a; },aoa); await f.setInputFiles('#bFile',{name:'box.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('x')}); await sleep(600); };
  const cards=()=>f.evaluate(()=>[...document.querySelectorAll('#bList .bx .bn')].map(e=>e.textContent));

  console.log('۱) دو باکس جدا');
  ok(await f.evaluate(()=>/گزارش مأمور/.test(document.getElementById('bSrc').innerText) && /ثبت/.test(document.getElementById('bSrc').innerText) && document.querySelector('#bSrc [aria-pressed="true"]').dataset.src==='mamur'),'دو دکمه «گزارش مأمور» و «ثبت»؛ پیش‌فرض گزارش مأمور');
  await imp(M1);
  await f.click('#bSrc [data-src="sabt"]'); await sleep(200);
  ok((await cards()).length===0 && /ثبت/.test(await f.evaluate(()=>document.getElementById('bUpT').textContent)),'باکس «ثبت» خالی است');
  await imp(S1);
  let B=await LSg('nt_kbox_v1');
  ok(B.length===4 && B.filter(x=>x.src==='sabt').length===1 && !B.some(x=>x.gone),'فایل «ثبت» جدا: اقلام گزارش مأمور «رفته» نشدند');
  ok(JSON.stringify(await cards())==='["کالای ثبت یک"]','در «ثبت» فقط قلم خودش');
  await f.click('#bSrc [data-src="mamur"]'); await sleep(200);
  ok((await cards()).length===3,'در «گزارش مأمور» سه قلم خودش');
  await imp([HEAD,row('201','1','2001','قطعه نمونه یک','2','عدد','خرابی','درخواست‌کننده الف')]);
  B=await LSg('nt_kbox_v1');
  ok(B.filter(x=>x.gone).length===2 && !B.find(x=>x.src==='sabt').gone,'فایل تازه گزارش مأمور: فقط اقلام خودش «رفته از باکس»');
  await imp(M1); await sleep(100);

  console.log('۲) واحد درخواست‌کننده');
  ok(await f.evaluate(()=>document.getElementById('bU').hidden),'بدون واحد: ردیف فیلتر واحد نیست');
  await f.evaluate(()=>{ document.getElementById('bUnitsW').open=true; }); await sleep(200);
  ok((await f.evaluate(()=>document.querySelectorAll('#bUnits .urow').length))===3,'فهرست درخواست‌کننده‌ها: سه نفر (از هر دو باکس)');
  await f.fill('#bUnitsP','درخواست کننده الف واحد نمونه یک\nدرخواست‌کننده ب: نمونه دو\n<b>x</b>');
  await f.click('#bUnitsGo'); await sleep(300);
  const U=await LSg('nt_kunits_v1');
  ok(Object.values(U).includes('نمونه یک') && Object.values(U).includes('نمونه دو') && Object.keys(U).length===2,'چسباندن: «نام واحد ...» و «نام: واحد» ذخیره شد — '+JSON.stringify(Object.values(U)));
  ok(/خوانده نشد/.test(await f.evaluate(()=>document.getElementById('bUnitsM').textContent)),'خط نامعلوم: پیام');
  const chips=await f.evaluate(()=>[...document.querySelectorAll('#bU [data-u]')].map(b=>b.textContent));
  ok(!(await f.evaluate(()=>document.getElementById('bU').hidden)) && chips.some(t=>/نمونه یک \(۲\)/.test(t)) && chips.some(t=>/نمونه دو \(۱\)/.test(t)),'فیلتر واحد با شمار — '+chips.join('|'));
  await f.click('#bU [data-u="نمونه یک"]'); await sleep(200);
  ok((await cards()).length===2 && await f.evaluate(()=>[...document.querySelectorAll('#bList .bx .un')].every(e=>e.textContent==='واحد نمونه یک')),'فیلتر «نمونه یک»: دو قلم با برچسب واحد');
  await f.fill('#bUnits [data-uk]:not([value="نمونه یک"]):not([value="نمونه دو"])','واحد نمونه سه'); await f.evaluate(()=>document.activeElement.blur()); await sleep(300);
  ok(Object.values(await LSg('nt_kunits_v1')).includes('نمونه سه'),'نوشتن واحد در فهرست (بدون «واحد» تکراری)');
  await f.click('#bU [data-u=""]'); await sleep(200);

  console.log('۳) رسید انبار');
  await f.click('#bList .bx [data-st="me"]'); await sleep(200);
  ok((await f.evaluate(()=>document.querySelector('#bF [data-f="rcv"]').textContent)).includes('(۱)'),'بعد از «خریدم»: «منتظر رسید انبار (۱)»');
  await f.click('#bF [data-f="rcv"]'); await sleep(200);
  ok((await cards()).length===1 && await f.evaluate(()=>!!document.querySelector('#bList .rcv') && !document.querySelector('#bList .bx.dn')),'کارت منتظر رسید: کادر رسید انبار، کم‌رنگ نیست');
  await f.fill('#bList [data-rd]','1405/13/40'); await f.click('#bList [data-rcv]'); await sleep(150);
  ok(/تاریخ درست نیست/.test(await f.evaluate(()=>document.querySelector('#bList [data-rm]').textContent)),'تاریخ نادرست: پیام');
  await f.fill('#bList [data-rn]','۴۵۱۲'); await f.fill('#bList [data-rd]','۱۴۰۵/۰۸/۰۵'); await f.click('#bList [data-rcv]'); await sleep(250);
  B=await LSg('nt_kbox_v1'); const x=B.find(y=>y.rs);
  ok(x && x.rs.n==='4512' && x.rs.d==='1405/08/05' && x.st==='me','رسید ذخیره شد: شماره ۴۵۱۲، تاریخ ۱۴۰۵/۰۸/۰۵');
  await f.click('#bF [data-f="done"]'); await sleep(200);
  ok(/رسید انبار ۴۵۱۲ — ۱۴۰۵\/۰۸\/۰۵/.test(await f.evaluate(()=>document.getElementById('bList').innerText)),'«انجام‌شده»: برچسب رسید انبار');
  await f.click('#bList [data-rsx]'); await sleep(200);
  ok(!(await LSg('nt_kbox_v1')).some(y=>y.rs),'«برگرداندن رسید»');
  ok(await f.evaluate(()=>!document.querySelector('#bList b x, #bUnits b')),'متن خطرناک اجرا نشد');
  console.log('۴) واحد از «دلیل نیاز» و انتخاب دستی برای کل درخواست');
  await f.click('#bSrc [data-src="sabt"]'); await sleep(150);
  await imp([HEAD,row('401','1','4001','قطعه کامیون','1','عدد','مورد نياز کاميون TRs02','ثبت‌کننده انبار نمونه'),row('402','1','4002','پیچ نمونه','1','عدد','شارژ انبار // بخش فني','ثبت‌کننده انبار نمونه'),
    row('403','1','4003','آب نمونه','1','لیتر','مورد نياز استخر خط فراوري تر','ثبت‌کننده انبار نمونه'),row('404','1','4004','ابزار نمونه','1','عدد','مورد نياز درخواست کننده الف','ثبت‌کننده انبار نمونه'),
    row('405','1','4005','کالای بی‌نشان یک','1','عدد','نامعلوم','ثبت‌کننده انبار نمونه'),row('405','2','4006','کالای بی‌نشان دو','1','عدد','نامعلوم','ثبت‌کننده انبار نمونه')]);
  await f.click('#bF [data-f="open"]'); await sleep(200);
  const un=()=>f.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#bList .bx')].map(c=>[c.querySelector('.bn').textContent,(c.querySelector('[data-un]')||{}).textContent||''])));
  let M=await un();
  ok(M['قطعه کامیون']==='واحد نگهداری و تعمیرات' && M['پیچ نمونه']==='واحد انبار' && M['آب نمونه']==='واحد تولید' && M['ابزار نمونه']==='واحد نمونه یک' && M['کالای بی‌نشان یک']==='+ واحد','حدس واحد: دستگاه، شارژ انبار، خط فراوری، نام فرد پشت «مورد نیاز» — '+JSON.stringify(M));
  await f.click('#bList .bx:has-text("کالای بی‌نشان یک") [data-un]'); await sleep(150);
  ok(await f.evaluate(()=>!!document.querySelector('#bList .uch [data-setu="برق"]')),'ضربه روی برچسب: فهرست واحدها');
  await f.click('#bList .uch [data-setu="برق"]'); await sleep(200);
  M=await un();
  ok(M['کالای بی‌نشان یک']==='واحد برق' && M['کالای بی‌نشان دو']==='واحد برق','انتخاب دستی برای همه اقلام همان شماره درخواست');
  await imp([HEAD,row('405','1','4005','کالای بی‌نشان یک','1','عدد','نامعلوم','ثبت‌کننده انبار نمونه')]);
  await f.click('#bF [data-f="open"]'); await sleep(150);
  ok((await un())['کالای بی‌نشان یک']==='واحد برق','فایل تازه: انتخاب دستی می‌ماند');
  await f.click('#bList .bx:has-text("کالای بی‌نشان یک") [data-un]'); await sleep(150); await f.click('#bList .uch [data-setu=""]'); await sleep(150);
  ok((await un())['کالای بی‌نشان یک']==='+ واحد','«خودکار»: برگشت به حدس');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200));
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
