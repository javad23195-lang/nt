// انبار، خروج: کالای بدون کد — کادر «واحد» (ماندگار، در اکسل ستون I، کنار تعداد)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const P=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()), g=t=>P.find(x=>x.type===t).value;
    const d=g('year')+'/'+g('month')+'/'+g('day');
    localStorage.setItem('nt_anbar_out_v1',JSON.stringify({row:720,rows:[
      {date:d,y:+g('year'),m:+g('month'),d:+g('day'),dev:'لودر کوماتسو WA470',item:'الکترود آزمایشی ۷۰۱۸ قطر ۴',qty:5,why:'مورد نیاز WA470',cond:''},
      {date:d,y:+g('year'),m:+g('month'),d:+g('day'),dev:'لودر ZL50',item:'الکترود آزمایشی ۷۰۱۸ قطر ۴',qty:2,why:'مورد نیاز ZL50',cond:''}]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='انبار'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const fr=await (await p.$$('iframe'))[IDX].contentFrame();
  await fr.click('[data-open="0"]'); await sleep(300);
  ok(await fr.locator('.uno').count()===1,'کالای بدون کد: کادر «واحد» کنار «کد کالا»');
  await fr.fill('.uno','کیلوگرم'); await sleep(300);
  const st=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_anbar_out_v1'))).rows;
  ok(st.every(r=>r.u==='کیلوگرم'),'واحد روی همه ردیف‌های همین کالا ذخیره شد');
  const mem=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_anbar_codes_v1'))||'{}');
  ok(Object.values(mem).some(e=>e.u==='کیلوگرم'),'واحد در حافظه کدها می‌ماند (همگام می‌شود)');
  const tsv=await fr.evaluate(()=>outTSV().split('\n')[0].split('\t'));
  ok(tsv[8]==='کیلوگرم','اکسل: ستون I = کیلوگرم');
  await fr.fill('.cno','920603'); await sleep(300);
  const mem2=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_anbar_codes_v1'))||'{}');
  ok(Object.values(mem2).some(e=>e.c==='920603' && e.u==='کیلوگرم'),'زدن کد، واحد را پاک نمی‌کند');
  await fr.evaluate(()=>render()); await sleep(300);
  ok(/۵ کیلوگرم/.test(await fr.evaluate(()=>document.querySelector('.ohead .q').textContent)),'کنار تعداد: «۵ کیلوگرم»');
  await fr.fill('.uno','<b>x'); await sleep(200);
  ok(JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_anbar_out_v1'))).rows[0].u==='bx','< > از واحد پاک می‌شود');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
