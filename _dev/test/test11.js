// نمودارها: داخل خود سامانه — داده، بازه، دسترسی، ذخیره عکس، نمودار کوچک صفحه دستگاه
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path'), os=require('os');
const {make}=require('./fakegh.js');
const ROOT=path.join(__dirname,'..','..'); const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const G=make(); await new Promise(r=>G.srv.listen(0,r)); const GH='http://localhost:'+G.srv.address().port;
  const libHits=[];
  const web=http.createServer((q,r)=>{ const m=/\/lib\/([\w.\-]+)$/.exec(q.url.split('?')[0]); if(m){ libHits.push(m[1]); try{ r.writeHead(200,{'Content-Type':'text/javascript'}); r.end(fs.readFileSync(path.join(ROOT,'lib',m[1]))); }catch(e){ r.writeHead(404); r.end(); } return; }
    r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({viewport:{width:400,height:860},locale:'fa-IR',acceptDownloads:true,deviceScaleFactor:2});
  await c.addInitScript(GH=>{ window.NTSYNC_TEST={api:GH,raw:GH}; if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1');
    const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit'}).formatToParts(new Date());
    let y=+p.find(x=>x.type==='year').value, m=+p.find(x=>x.type==='month').value;
    const M=k=>{ let a=y,b=m+k; while(b<1){b+=12;a--;} return [a,b]; }, D=(k,d)=>{ const [a,b]=M(k); return `${a}/${String(b).padStart(2,'0')}/${String(d).padStart(2,'0')}`; };
    window.__D=D;
    const tv={}; tv[D(0,1)+'|صبح']={stops:[{id:'a',dev:'بیل مکانیکی کوماتسو PC290',from:'08:00',to:'10:30',cause:'خرابی هیدرولیک'},{id:'b',dev:'بیل مکانیکی کوماتسو PC400',from:'09:00',to:'10:00',cause:'نبود راننده'}]};
    tv[D(0,2)+'|شب']={stops:[{id:'c',dev:'بیل مکانیکی کوماتسو PC290',from:'23:00',to:'01:00',cause:'نبود سوخت'},{id:'d',dev:'بیل مکانیکی کوماتسو PC400',from:'02:00',to:'',cause:'خرابی برق'}]};
    tv[D(-1,5)+'|صبح']={stops:[{id:'e',dev:'بیل مکانیکی کوماتسو PC400',from:'08:00',to:'14:00',cause:'خرابی موتور'}]};
    localStorage.setItem('nt_tavaqof_v1',JSON.stringify(tv));
    const T=(o)=>Object.assign({id:'t'+Math.random(),prog:'کار',done:true,stop:'',sdur:'',kind:'',act:'',fault:''},o), pg={};
    pg[D(0,3)]={sup:'',tasks:[T({dev:'بیل مکانیکی کوماتسو PC290',kind:'EM',act:'سیستم هیدرولیک',sdur:'2:30',halt:'بله'}),T({dev:'بیل مکانیکی کوماتسو PC290',kind:'PM',act:'سرویس و نگهداری',sdur:'1:00'}),
      T({dev:'لودر ZL50',kind:'EM',act:'موتور و قطعات',stop:'۲ ساعت و ۳۰ دقیقه'}),T({dev:'لودر ZL50',kind:'PM',act:'بازدید',sdur:'',halt:'خیر'})]};
    pg[D(-1,7)]={sup:'',tasks:[T({dev:'بیل مکانیکی کوماتسو PC400',kind:'EM',act:'سیستم برقی',sdur:'6:00'})]};
    localStorage.setItem('nt_prog_v1',JSON.stringify(pg));
    const daf=[]; [[-6,15000],[-5,15200],[-4,15350],[-3,15600],[-2,15700],[-1,15900],[0,16000]].forEach(([k,v])=>daf.push({dev:'لودر ZL50',unit:'ساعت',val:v,date:D(k,25)}));
    daf.push({dev:'کامیون TRS01',unit:'کیلومتر',val:54000,date:D(-1,3)},{dev:'کامیون TRS01',unit:'کیلومتر',val:55500,date:D(0,3)});
    localStorage.setItem('nt_daftar_v1',JSON.stringify(daf));
    const R=(k,d,o)=>{ const [a,b]=M(k); return Object.assign({date:D(k,d),y:a,m:b,d,cond:''},o); };
    localStorage.setItem('nt_anbar_out_v1',JSON.stringify({row:720,rows:[
      R(0,2,{dev:'لودر ZL50',item:'روغن دیزل اتوماتیک 50-20',qty:28,svc:1,svcName:'روغن موتور'}),
      R(0,2,{dev:'لودر ZL50',item:'روغن هیدرولیک H68',qty:140,svc:1,svcName:'روغن هیدرولیک'}),
      R(-2,9,{dev:'کامیون TRS01',item:'روغن دیزل اتوماتیک 50-20',qty:24,svc:1,svcName:'روغن موتور'}),
      R(0,3,{dev:'لودر ZL50',item:'فیلتر روغن',qty:1,svc:1,svcName:'روغن موتور'}),
      R(0,4,{dev:'لودر ZL50',item:'روغن دیزل اتوماتیک 50-20',qty:5,why:'سرریز'})]}));
  },GH);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>typeof ntBooted!=='undefined'&&ntBooted,null,{timeout:20000});
  await p.evaluate(()=>show(0)); const f=p.frameLocator('iframe.on');
  ok(libHits.length===0,'کتابخانه نمودار هنوز بارگذاری نشده');
  await f.locator('#chOpen').click(); await p.waitForSelector('#ntChDlg:not([hidden])'); await p.waitForFunction(()=>document.querySelectorAll('#ntChBody canvas').length>=4,null,{timeout:10000}).catch(()=>{});
  ok(libHits.includes('chart.umd.js'),'کتابخانه از همان سایت بارگذاری شد');
  ok(await p.locator('#ntChBody canvas').count()===4,'۴ نمودار ساخته شد');
  const sd=await p.evaluate(()=>{ const D=window.__D; return ntCharts.stopData(D(0,1),D(0,31)); });
  ok(sd.per['بیل مکانیکی کوماتسو PC290'].em===150 && sd.per['بیل مکانیکی کوماتسو PC290'].pm===60 && sd.per['بیل مکانیکی کوماتسو PC290'].idle===120 && sd.per['لودر ZL50'].em===150 && sd.per['بیل مکانیکی کوماتسو PC400'].idle===60,'توقف این ماه: تعمیر/سرویس از برنامه روزانه، «سالم ولی کار نکرد» از توقف شیفت '+JSON.stringify(sd.per));
  ok(!sd.cause['خرابی هیدرولیک'] && sd.cause['سیستم هیدرولیک'].em===150,'خرابی‌های توقف شیفت دوباره شمرده نمی‌شود');
  ok(await p.evaluate(()=>[ntCharts.toMin('2:30'),ntCharts.toMin('۲'),ntCharts.toMin('۲ ساعت و ۳۰ دقیقه'),ntCharts.toMin('45 دقیقه'),ntCharts.toMin('مورد مشاهده نشد')].join())==='150,120,150,45,','خواندن مدت توقف: 2:30، ۲، «۲ ساعت و ۳۰ دقیقه»، «۴۵ دقیقه»');
  const ch1=await p.evaluate(()=>{ const c=Chart.getChart(document.querySelector('#ch1 canvas')); return {l:c.data.labels,d:c.data.datasets.map(d=>[d.label,d.data])}; });
  ok(JSON.stringify(ch1.d)===JSON.stringify([['تعمیر (EM)',[2.5,2.5,0]],['سرویس و نگهداری (PM)',[1,0,0]],['سالم ولی کار نکرد',[2,0,1]]]) && ch1.l[0].includes('PC290'),'نمودار ۱: '+JSON.stringify(ch1));
  ok((await p.locator('#ch1 .sub').innerText()).includes('برنامه روزانه'),'منبع در زیرنویس گفته شد');
  await p.selectOption('#chDev','لودر ZL50'); await sleep(150);
  const ch3=await p.evaluate(()=>{ const c=Chart.getChart(document.querySelector('#ch3 canvas')); return {d:c.data.datasets[0].data,dev:document.getElementById('chDev').value}; });
  ok(ch3.dev==='لودر ZL50' && JSON.stringify(ch3.d)==='[200,150,250,100,200,100]','کارکرد ماهانه ZL50: '+JSON.stringify(ch3.d));
  await p.selectOption('#chDev','کامیون TRS01'); await sleep(150);
  const ch3b=await p.evaluate(()=>Chart.getChart(document.querySelector('#ch3 canvas')).data.datasets[0]);
  ok(ch3b.data[5]===1500 && ch3b.data[4]===null && ch3b.label==='کیلومتر','تعویض دستگاه: TRS01 ۱۵۰۰ کیلومتر');
  const ch4=await p.evaluate(()=>Chart.getChart(document.querySelector('#ch4 canvas')).data.datasets.map(d=>[d.label,d.data[5],d.data[3]]));
  ok(ch4.length===2 && ch4.find(x=>x[0]==='روغن هیدرولیک H68')[1]===140 && ch4.find(x=>x[0]==='روغن دیزل اتوماتیک 50-20')[1]===28 && ch4.find(x=>x[0]==='روغن دیزل اتوماتیک 50-20')[2]===24,'مصرف روغن: فقط تعویض روغن، بدون فیلتر و سرریز '+JSON.stringify(ch4));
  await p.screenshot({path:path.join(os.tmpdir(),'charts.png'),fullPage:false});
  await p.locator('#ch1').screenshot({path:path.join(os.tmpdir(),'chart1.png')});
  const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#ch1 button.png')]);
  ok(/^NT-chart-ch1-\d{4}-\d{2}-\d{2}\.png$/.test(dl.suggestedFilename()),'ذخیره عکس: '+dl.suggestedFilename());
  await p.click('#ntChBody [data-r="m1"]'); await sleep(200);
  const pm=await p.evaluate(()=>Chart.getChart(document.querySelector('#ch1 canvas')).data);
  ok(pm.labels.length===1 && pm.datasets.length===1 && pm.datasets[0].data[0]===6,'ماه قبل: PC400 ۶ ساعت تعمیر (برنامه روزانه) '+JSON.stringify(pm.datasets.map(d=>d.data)));
  await p.click('#ntChBody [data-r="m6"]'); await sleep(200);
  ok(await p.locator('#ntChBody canvas').count()===4,'۶ ماه اخیر: ۴ نمودار');
  await p.click('#chClose');
  // کاربر بدون انبار و بدون توقف
  await p.evaluate(()=>{ ntSync.canSee=n=>n==='دفترچه قرائت'; }); await p.evaluate(()=>ntCharts.open()); await p.waitForFunction(()=>document.querySelectorAll('#ntChBody canvas').length>=1);
  ok(await p.locator('#ch1').count()===0 && await p.locator('#ch4').count()===0 && await p.locator('#ch3 canvas').count()===1,'کاربر محدود فقط نمودار کارکرد را می‌بیند');
  await p.evaluate(()=>{ ntCharts.close(); ntSync.canSee=()=>true; });
  // صفحه دستگاه
  await p.evaluate(()=>ntQr.home('ZL50')); await p.waitForFunction(()=>{ const c=document.querySelector('#ntQrBody .chmini canvas'); return c && window.Chart && Chart.getChart(c); },null,{timeout:5000}).catch(()=>{});
  const mini=await p.evaluate(()=>{ const c=document.querySelector('#ntQrBody .chmini canvas'); return c && Chart.getChart(c) ? Chart.getChart(c).data.datasets[0].data : null; });
  ok(mini && JSON.stringify(mini)==='[200,150,250,100,200,100]','صفحه دستگاه: نمودار کوچک کارکرد ۶ ماه '+JSON.stringify(mini));
  await p.screenshot({path:path.join(os.tmpdir(),'devmini.png')});
  await p.evaluate(()=>ntQr.home('KIPOR'));
  ok(await p.locator('#ntQrBody .chmini').count()===0,'دستگاه بی‌قرائت: بدون نمودار کوچک');
  ok(errs.length===0,'بدون خطای اسکریپت '+errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); G.srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
