// زبانه «تردد و اضافه‌کار»: افراد، ثبت اضافه‌کار/مأموریت، بررسی فایل تردد (داده ساختگی)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path'); const XLSX=require('xlsx');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html')); const LIB=path.join(__dirname,'..','..','lib','xlsx.mini.min.js');
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// فایل ساختگی به شکل «گزارش جدول» ets — ماه ۱۴۰۴/۰۷ (همه گذشته)
const R=(w,d,a,b,c,e,ev)=>[w,'1404/07/'+d,a||null,b||null,c||null,e||null,ev||null,null];
const A=[['گزارش جدول'],[],['روز','تاریخ','تردد 1','تردد 2','تردد 3','تردد 4','رویدادها','عملیات'],
  R('شنبه','05','06:58','16:02'),            // مدیر: درست
  R('یکشنبه','06','07:40','15:57'),          // تأخیر ۴۰
  R('دوشنبه','07'),                          // غیبت
  R('سه شنبه','08','06:59'),                 // تردد ناقص
  R('چهارشنبه','09','06:57','14:58'),        // درست (چهارشنبه تا ۱۵)
  R('پنجشنبه','10','06:59','15:01'),         // شیفت پنجشنبه (خودکار)
  R('جمعه','11'),
  R('شنبه','12','06:58','17:22'),            // اضافه ۱:۲۲؛ ثبت‌شده ۱:۰۰
  R('یکشنبه','13','06:58','17:33'),          // اضافه ثبت نشده
  R('دوشنبه','14','06:58','15:44'),          // تعجیل ۱۶
  R('سه شنبه','15','07:03','16:05'),         // در حد مجاز
  R('چهارشنبه','16',null,null,null,null,'مرخصی روزانه'), // رویداد
  R('پنجشنبه','17','08:00','12:00'),         // پنجشنبه دوم: اضافه‌کار
  R('شنبه','19','06:55','16:00')];           // نهاری ثبت‌شده
const ws=XLSX.utils.aoa_to_sheet(A), wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'sheet'); const F='/tmp/claude-0/tarad-test.xlsx'; XLSX.writeFile(wb,F);
(async()=>{
  const web=http.createServer((q,r)=>{ if(/xlsx\.mini/.test(q.url)){ r.writeHead(200,{'Content-Type':'text/javascript'}); r.end(fs.readFileSync(LIB)); return; } r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:1000,height:900}}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='تردد و اضافه‌کار'));
  ok(IDX>-1,'زبانه «تردد و اضافه‌کار» هست');
  await p.evaluate(i=>show(i),IDX); await sleep(1500);
  const fr=await (await p.$$('iframe'))[IDX].contentFrame();
  fr.on&&0;
  ok(await fr.evaluate(()=>!document.getElementById('pPpl').hidden),'بدون فرد: بخش «افراد» باز می‌شود');
  await fr.fill('#pName','مدیر آزمایشی'); await fr.click('#pG [data-g="m"]'); await fr.click('#pAddB');
  await fr.fill('#pName','<b>کارمند الف (۴۰۱۲۳۴)\nمدیر آزمایشی'); await fr.click('#pG [data-g="s"]'); await fr.click('#pAddB'); await sleep(200);
  ok(/۱ نام اضافه شد \(۱ نام تکراری بود\)/.test(await fr.evaluate(()=>document.getElementById('pMsg').textContent)),'چند نام یک‌جا؛ نام تکراری اضافه نمی‌شود');
  const S=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_staff_v1')));
  ok(S.length===2 && S.some(x=>x.name==='مدیر آزمایشی'&&x.g==='m') && S.some(x=>x.name==='bکارمند الف'),'افراد ذخیره شد (< > و کد پرسنلی پاک)');
  const mid=S.find(x=>x.g==='m').id, sid=S.find(x=>x.g==='s').id;
  // نهاری ندارد: مدیر آزمایشی
  await fr.click(`#pList .px[data-id="${mid}"][data-x="nh"]`); await sleep(150);
  ok(JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_staff_v1'))).find(x=>x.id===mid).nh===0,'افراد: «نهاری ✗» ذخیره شد');
  await fr.click('.seg [data-p="add"]'); await fr.click('#fK [data-k="nh"]');
  ok(!(await fr.evaluate(id=>[...document.querySelectorAll('#fP option')].some(o=>o.value===id),mid)),'نهاری: کسی که نهاری ندارد در فهرست نیست');
  await fr.click('#fK [data-k="az"]');
  ok(await fr.evaluate(id=>[...document.querySelectorAll('#fP option')].some(o=>o.value===id),mid),'بعدازظهر: در فهرست هست');
  await fr.click('.seg [data-p="ppl"]'); await fr.click(`#pList .px[data-id="${mid}"][data-x="nh"]`); await sleep(150);
  // ثبت‌ها
  await fr.click('.seg [data-p="add"]');
  const add=async(d,pid,k,dur,desc,pl)=>{ await fr.fill('#fDate',d); await fr.selectOption('#fP',pid); await fr.click(`#fK [data-k="${k}"]`); if(dur) await fr.fill('#fDur',dur); if(pl) await fr.fill('#fPl',pl); await fr.fill('#fDesc',desc||''); await fr.click('#fSave'); await sleep(100); };
  await add('1404/07/12',mid,'az','100','بازدید معدن');
  await add('1404/07/19',mid,'nh','','تعمیر لودر ZL50');
  await add('1404/07/12',sid,'mm','','','بیرجند');
  const E=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_ezafe_v1')));
  ok(E.length===3 && E.find(e=>e.k==='nh').m===30 && E.find(e=>e.k==='az').m===60 && E.find(e=>e.k==='mm').pl==='بیرجند','ثبت: نهاری ۰:۳۰ خودکار، بعدازظهر ۱:۰۰، مأموریت بیرجند');
  await fr.click('#mPrev'); // ماه نمایش را به ۱۴۰۴/۰۷ ببر
  await fr.evaluate(()=>{ vy=1404; vm=7; drawList(); });
  ok(/بازدید معدن/.test(await fr.evaluate(()=>document.getElementById('mList').innerText)),'فهرست ماه ثبت‌ها را نشان می‌دهد');
  // بررسی
  await fr.click('.seg [data-p="chk"]'); await fr.selectOption('#cP',mid);
  await fr.setInputFiles('#cFile',F); await sleep(1500);
  ok(await fr.evaluate(()=>![...document.querySelectorAll('#cRows tr')].some(r=>r.className==='ok')),'پیش‌فرض: فقط روزهای دارای درخواست');
  await fr.click('#cOnly'); await sleep(200);
  const T=await fr.evaluate(()=>[...document.querySelectorAll('#cRows tr')].map(r=>({c:r.className,t:r.innerText.replace(/\s+/g,' ')})));
  const row=d=>T.find(r=>r.t.startsWith(d))||{c:'',t:''};
  ok(row('۰۷/۰۵').c==='ok','۰۷/۰۵ درست');
  ok(row('۰۷/۰۶').c==='bad' && /۰:۴۰ تأخیر/.test(row('۰۷/۰۶').t) && /مرخصی ساعتی ۰:۴۰/.test(row('۰۷/۰۶').t),'تأخیر ۴۰ → مرخصی ساعتی');
  ok(row('۰۷/۰۷').c==='bad' && /هیچ ترددی/.test(row('۰۷/۰۷').t),'غیبت');
  ok(row('۰۷/۰۸').c==='bad' && /ورود و خروج/.test(row('۰۷/۰۸').t),'تردد ناقص → ورود و خروج');
  ok(row('۰۷/۰۹').c==='ok','چهارشنبه مدیر تا ۱۵:۰۰ درست');
  ok(row('۰۷/۱۰').c==='ok','پنجشنبه اول با تردد = شیفت، درست');
  ok(/اضافه‌کار ۱:۰۰ — بازدید معدن/.test(row('۰۷/۱۲').t) && /بیشتر از ثبت/.test(row('۰۷/۱۲').t),'اضافه ۱:۲۲، ثبت ۱:۰۰ → هشدار');
  ok(row('۰۷/۱۳').c==='bad' && /شرح ثبت نشده/.test(row('۰۷/۱۳').t),'اضافه ثبت‌نشده');
  ok(row('۰۷/۱۴').c==='bad' && /تعجیل/.test(row('۰۷/۱۴').t),'تعجیل ۱۶');
  ok(row('۰۷/۱۵').c==='ok','تأخیر ۳ و اضافه ۵ دقیقه: مجاز');
  ok(row('۰۷/۱۶').c==='ok','مرخصی روزانه در رویدادها: پوشش داده شده');
  ok(/اضافه‌کار ۴:۰۰/.test(row('۰۷/۱۷').t),'پنجشنبه دوم مدیر: کل حضور اضافه‌کار');
  ok(/اضافه‌کار نهاری ۰:۳۰ — تعمیر لودر ZL50/.test(row('۰۷/۱۹').t),'نهاری ثبت‌شده در فهرست درخواست');
  // کارمند ۸ ساعته: همان فایل
  await fr.selectOption('#cP',sid); await sleep(300);
  const T2=await fr.evaluate(()=>[...document.querySelectorAll('#cRows tr')].map(r=>({c:r.className,t:r.innerText.replace(/\s+/g,' ')})));
  const r2=d=>T2.find(r=>r.t.startsWith(d))||{c:'',t:''};
  ok(/اضافه‌کار ۱:۰۲/.test(r2('۰۷/۰۵').t),'۸ ساعته: خروج ۱۶:۰۲ → اضافه ۱:۰۲');
  ok(r2('۰۷/۱۰').c==='ok','۸ ساعته: پنجشنبه روز کاری عادی');
  ok(/مأموریت روزانه — بیرجند/.test(r2('۰۷/۱۲').t) && !/اضافه‌کار/.test(r2('۰۷/۱۲').t),'روز مأموریت: درخواست مأموریت بیرجند، بدون اضافه‌کار');
  // تعطیل بود
  await fr.selectOption('#cP',mid); await sleep(300);
  await fr.click('#cRows button.hb[data-h="1404/07/07"]'); await sleep(200);
  ok(await fr.evaluate(()=>[...document.querySelectorAll('#cRows tr')].find(r=>r.innerText.startsWith('۰۷/۰۷')).className)==='off','«تعطیل بود» → روز کاری نیست');
  ok(await p.evaluate(()=>!Object.keys(localStorage).some(k=>/tarad|grid/.test(k))) && !(await p.evaluate(()=>JSON.stringify(localStorage))).includes('15:44'),'فایل تردد ذخیره نشد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
