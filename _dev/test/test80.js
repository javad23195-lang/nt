// خدمات: داخلی بدون شناسنامه؛ «ویرایش خدمت» کیلومتر همان خدمت را نشان می‌دهد (نه آخرین عدد تایپ‌شده).
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const k=todayKey().split('/').map(Number);
    const mk=(dev,act,kind,meter,msrc)=>({dev,act,part:'',kind,meter,msrc,munit:'کیلومتر',open:'',done:todayKey(),y:k[0],m:k[1],d:k[2],mn:'',cdate:'',reason:'',pr:todayKey()});
    localStorage.setItem('nt_khadamat_v1',JSON.stringify({t:Date.now(),rows:[mk('کامیون TRS02','کار بیرونی نمونه','خارجی','10196','ثبت شد'),mk('نیسان زامیاد','کار داخلی نمونه','داخلی','5500','ثبت شد'),mk('کامیون TRS01','کار بی‌کیلومتر','داخلی','','')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='خدمات'));
  await p.evaluate(()=>show(0)); await sleep(1500);
  ok(/۱ خدمت انجام‌شده بدون شناسنامه/.test(await p.evaluate(()=>frames[0].contentDocument.getElementById('atCard').innerText)),'«امروز»: فقط خدمت خارجی بی‌شناسنامه شمرده می‌شود');
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const f=await (await p.$$('iframe'))[IDX].contentFrame();
  ok(await f.evaluate(()=>document.querySelectorAll('.shgo').length===1 && document.querySelectorAll('.slip .tosh').length===1),'داخلی: بدون «ساخت شناسنامه» و ▩');
  const ed=async act=>{ await f.evaluate(a=>{ const i=rows.findIndex(r=>r.act===a); startEdit(i); },act); await sleep(200); return f.evaluate(()=>document.getElementById('fMeter').value); };
  ok(await ed('کار بیرونی نمونه')==='10196','ویرایش TRS02: کیلومتر ۱۰۱۹۶');
  ok(await ed('کار داخلی نمونه')==='5500','ویرایش نیسان: کیلومتر خودش ۵۵۰۰ (نه ۱۰۱۹۶)');
  ok(await ed('کار بی‌کیلومتر')==='','خدمت بی‌کیلومتر: کادر خالی');
  await f.evaluate(()=>document.getElementById('bAdd').click()); await sleep(300);
  const R=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_khadamat_v1')).rows);
  ok(R.find(r=>r.act==='کار بی‌کیلومتر').meter!=='10196' && R.find(r=>r.act==='کار داخلی نمونه').meter==='5500','ذخیره ویرایش: کیلومتر خدمت‌های دیگر دست نخورد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
