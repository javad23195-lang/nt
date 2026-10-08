// گزارش اکسل: ساخت فایل از داخل سامانه و بررسی برگه‌ها
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path'), os=require('os');
const XLSX=require('xlsx'); const {make}=require('./fakegh.js');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
const LIB=fs.readFileSync(path.join(__dirname,'..','..','lib','xlsx.mini.min.js'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const G=make(); await new Promise(r=>G.srv.listen(0,r)); const GH='http://localhost:'+G.srv.address().port;
  let libHits=0;
  const web=http.createServer((q,r)=>{ if(q.url.includes('lib/xlsx.mini.min.js')){ libHits++; r.writeHead(200,{'Content-Type':'text/javascript'}); r.end(LIB); return; }
    r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({viewport:{width:430,height:860},locale:'fa-IR',acceptDownloads:true});
  // داده نمونه: مهر ۱۴۰۵ (بازه) و شهریور (بیرون بازه)
  const seed={
    nt_tavaqof_v1:JSON.stringify({
      '1405/07/05|صبح':{stops:[{id:'a',dev:'بیل مکانیکی کوماتسو PC290',from:'08:00',to:'10:30',cause:'خرابی موتور',note:'شیلنگ',by:'رضا'},
                               {id:'b',dev:'بیل مکانیکی کوماتسو PC400',from:'09:00',to:'09:45',cause:'نبود راننده',note:'',by:'رضا'}],sent:false},
      '1405/07/06|شب':{stops:[{id:'c',dev:'بیل مکانیکی کوماتسو PC290',from:'23:00',to:'01:30',cause:'خرابی هیدرولیک',note:'',by:'علی'}],sent:false},
      '1405/07/10|عصر':{stops:[{id:'d',dev:'بیل مکانیکی کوماتسو PC400',from:'15:00',to:'',cause:'خرابی برق',note:'',by:'علی'}],sent:false},
      '1405/06/30|صبح':{stops:[{id:'e',dev:'بیل مکانیکی کوماتسو PC290',from:'08:00',to:'12:00',cause:'خرابی موتور',note:'',by:'رضا'}],sent:false}}),
    nt_daftar_v1:JSON.stringify([
      {dev:'لودر کوماتسو WA470',unit:'ساعت',val:26900,date:'1405/06/28'},{dev:'لودر کوماتسو WA470',unit:'ساعت',val:27000,date:'1405/07/03'},
      {dev:'لودر کوماتسو WA470',unit:'ساعت',val:27150,date:'1405/07/13'},{dev:'لودر ZL50',unit:'ساعت',val:15000,date:'1405/06/20'},
      {dev:'بیل مکانیکی کوماتسو PC290',unit:'ساعت',val:22600,date:'1405/07/04'}]),
    nt_anbar_out_v1:JSON.stringify({row:720,rows:[
      {date:'1405/07/02',y:1405,m:7,d:2,dev:'WA470',item:'روغن دیزل اتوماتیک 50-20',qty:20,why:'تعویض روغن WA470',cond:'',svc:1,svcName:'تعویض روغن موتور',doc:'2345'},
      {date:'1405/07/03',y:1405,m:7,d:3,dev:'ZL50',item:'واسکازين ۱۴۰',qty:1,why:'مورد نیاز ZL50',cond:''}]}),
    nt_anbar_in_v1:JSON.stringify({row:1394,rows:[{date:'1405/07/08',y:1405,m:7,d:8,item:'فیلتر هوا',qty:'۴',type:'نو',cond:'خرید',src:''}]}),
    nt_anbar_codes_v1:JSON.stringify({'فیلتر هوا':{c:'555',d:'فیلتر هوا'}}),
    nt_kharid9_v1:JSON.stringify({row:5,rows:[{date:'1405/07/09',unit:'PC290',item:'شیلنگ هیدرولیک',u:'عدد',qty:2,bought:'',desc:'سایز 1/2',d1:'2400',d2:'',pri:'ضروری',buy:'',req:'',apr:'تایید شده',over:'',note:''}]}),
    nt_khadamat_v1:JSON.stringify({row:54,rows:[{dev:'PC290',act:'تعمیر پمپ',part:'پمپ',kind:'خارجی',meter:'22610',munit:'ساعت',open:'1405/07/06',done:'',y:1405,m:7,d:6,cdate:'',reason:''}]}),
    nt_moshkel_v1:JSON.stringify({row:5,rows:[{y:1405,m:7,d:7,dev:'WA470',sys:'هیدرولیک',desc:'نشتی',sev:'بالا',cur:'در حال کار',part:'بله',state:'باز',fix:'',src:'دفترچه'}]})};
  await c.addInitScript(([GH,seed])=>{ window.NTSYNC_TEST={api:GH,raw:GH};
    if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(seed).forEach(k=>localStorage.setItem(k,seed[k])); } },[GH,seed]);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync && ntBooted);
  const T=await p.evaluate(()=>{ const x=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit'}).formatToParts(new Date()); return x.find(a=>a.type==='year').value+'/'+x.find(a=>a.type==='month').value; });
  await p.evaluate(()=>show(0)); const f=p.frameLocator('iframe.on');
  await f.locator('#rpOpen').click(); await p.waitForSelector('#ntRpDlg:not([hidden])',{timeout:5000}).catch(()=>{});
  ok(await p.locator('#ntRpDlg').isVisible(),'دکمه «ساخت گزارش اکسل» در زبانه امروز پنجره گزارش را باز کرد');
  ok(libHits===0,'کتابخانه اکسل هنوز بارگذاری نشده (فقط هنگام ساخت)');
  await p.check('input[name="rpR"][value="own"]'); await p.fill('#rpFrom','14050701'); await p.fill('#rpTo','۱۴۰۵/۰۷/۳۱');
  await sleep(200);
  ok(await p.inputValue('#rpFrom')==='1405/07/01','تاریخ خودکار خط‌دار شد');
  ok((await p.locator('#rpN_stops').innerText()).includes('۴') && (await p.locator('#rpN_read').innerText()).includes('۳') && (await p.locator('#rpN_out').innerText()).includes('۲'),'تعداد ردیف هر بخش در بازه نشان داده می‌شود');
  await p.screenshot({path:path.join(os.tmpdir(),'rp-dlg.png')});
  const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#rpGo')]);
  ok(dl.suggestedFilename()==='NT-report-1405-07-01_1405-07-31.xlsx','نام فایل: '+dl.suggestedFilename());
  const file=path.join(os.tmpdir(),'rp.xlsx'); await dl.saveAs(file);
  ok(libHits===1,'کتابخانه از همان سایت بارگذاری شد');
  const wb=XLSX.readFile(file);
  ok(wb.SheetNames.join(',')==='خلاصه توقف,توقف‌ها,کارکرد دستگاه‌ها,قرائت,خروج انبار,ورود انبار,درخواست خرید,خدمات,مشکلات','۹ برگه: '+wb.SheetNames.join('، '));
  const A=n=>XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:''});
  const sum=A('خلاصه توقف');
  const r290=sum.find(r=>r[0]==='بیل مکانیکی کوماتسو PC290'), r400=sum.find(r=>r[0]==='بیل مکانیکی کوماتسو PC400'), tot=sum.find(r=>r[0]==='جمع');
  ok(r290 && r290[1]===2 && r290[2]===5 && r290[3]==='5:00' && r290[4]===5 && r290[5]===0,'PC290: ۲ توقف، ۵ ساعت (با توقف شب که از نیمه‌شب گذشت)، همه خرابی — '+JSON.stringify(r290));
  ok(r400 && r400[1]===2 && r400[2]===0.75 && r400[5]===0.75 && r400[6]===1,'PC400: ۲ توقف، ۰٫۷۵ ساعت سالم ولی کار نکرد، ۱ هنوز متوقف — '+JSON.stringify(r400));
  ok(tot && tot[1]===4 && tot[2]===5.75,'ردیف جمع درست است');
  ok(sum.some(r=>r[0]==='خرابی موتور' && r[1]==='خرابی' && r[2]===1 && r[3]===2.5) && sum.some(r=>r[0]==='نبود راننده' && r[1]==='سالم ولی کار نکرد'),'جدول علت‌ها درست است');
  const L=A('توقف‌ها');
  ok(L.length===5 && L[1][0]==='1405/07/05' && L[3][1]==='شب' && L[3][5]===150 && L[4][4]==='هنوز متوقف' && L[1][10]==='رضا','لیست توقف‌ها: فقط مهر، مرتب، مدت و ثبت‌کننده');
  const K=A('کارکرد دستگاه‌ها');
  const wa=K.find(r=>r[0]==='لودر کوماتسو WA470'), pc=K.find(r=>r[0]==='بیل مکانیکی کوماتسو PC290');
  ok(wa && wa[2]==='1405/06/28' && wa[3]===26900 && wa[5]===27150 && wa[6]===250,'کارکرد WA470 = ۲۵۰ ساعت (از آخرین قرائت قبل از بازه) — '+JSON.stringify(wa));
  ok(pc && pc[6]===0 && !K.some(r=>r[0]==='لودر ZL50'),'دستگاه بدون قرائت در بازه نمی‌آید');
  ok(A('قرائت').length===4,'برگه قرائت: ۳ قرائت مهر');
  const O=A('خروج انبار'); ok(O.length===3 && O[1][4]===20 && typeof O[1][4]==='number' && O[1][7]==='تعویض روغن موتور' && O[1][8]==='2345','خروج انبار: فقط مهر، مقدار عددی، نوع و شماره درخواست');
  ok(O[1][2]===921013,'کد کالا از کاتالوگ انبار آمد (ردیف بدون کد) — '+O[1][2]);
  ok(O[2][2]===963171,'کد کالا با رقم فارسی و «ي» عربی هم پیدا شد — '+O[2][2]);
  ok(A('ورود انبار')[1][1]===555,'کد دستی کالای بیرون از کاتالوگ آمد — '+A('ورود انبار')[1][1]);
  ok(A('ورود انبار')[1][3]===4,'مقدار با رقم فارسی به عدد تبدیل شد');
  ok(A('درخواست خرید')[1][7]==='2400' && A('خدمات')[1][3]==='تعمیر پمپ' && A('مشکلات')[1][3]==='نشتی','خرید، خدمات و مشکلات درست آمد');
  const z=require('child_process').execSync(`python3 -c "import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(sum(1 for n in z.namelist() if n.startswith('xl/worksheets/') and b'rightToLeft=\\"1\\"' in z.read(n)))" ${file}`).toString().trim();
  ok(z==='9','همه ۹ برگه راست‌به‌چپ هستند');
  ok(!!wb.Sheets['خروج انبار']['!autofilter'],'سطر عنوان فیلتر دارد');
  // کاربری که «انبار» برایش پنهان است
  await p.click('#rpClose'); await p.evaluate(()=>{ ntSync.canSee=n=>n!=='انبار'; }); await f.locator('#rpOpen').click(); await p.waitForSelector('#ntRpDlg:not([hidden])');
  ok(await p.locator('input[data-k="out"]').count()===0 && await p.locator('input[data-k="stops"]').count()===1,'بخش زبانه‌های پنهان در گزارش نیست');
  ok(errs.length===0,'بدون خطای اسکریپت '+errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); G.srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
