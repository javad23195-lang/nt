// امروز: «خرابی تکراری» (یک دستگاه، همان نوع فعالیت، ۲ بار در ۳۰ روز) در «نیاز به توجه»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=ago=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()-ago*864e5)); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:420,height:900}});
  const rows=[
    {dev:'کامیون TRS02',type:'شیلنگ باد',st:J(18),reg:J(18),rep:'تعمیرکار الف'},
    {dev:'کامیون TRS02',type:'شیلنگ باد',st:J(2),reg:J(1),rep:'تعمیرکار الف'},
    {dev:'کامیون TRS02',type:'شیلنگ باد',st:J(2),reg:J(1),sup:'فروشنده',xof:1},
    {dev:'لودر ZL50',type:'ترمز',st:J(50),reg:J(50)},{dev:'لودر ZL50',type:'ترمز',st:J(3),reg:J(3)},
    {dev:'نیسان',type:'کلاچ',st:J(28),reg:J(28)},{dev:'نیسان',type:'کلاچ',st:J(20),reg:J(12)},
    {dev:'<img src=x onerror=window.__x=1>',type:'<b>x</b>',st:J(5),reg:J(5)},{dev:'<img src=x onerror=window.__x=1>',type:'<b>x</b>',st:J(4),reg:J(4)}];
  await c.addInitScript(r=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('nt_sh8_v1',JSON.stringify({rows:r})); } },rows);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
  await p.evaluate(()=>show(0)); await sleep(1500);
  const fr=(await (await p.$$('iframe'))[0].contentFrame());
  const T=await fr.evaluate(()=>{ try{ atRender(); }catch(e){} return document.getElementById('atList').innerText; });
  ok(/خرابی تکراری: کامیون TRS02 — شیلنگ باد/.test(T),'TRS02 شیلنگ باد نمایش داده شد');
  ok(/۲ بار در ۱۶ روز/.test(T),'«۲ بار در ۱۶ روز» (فاکتور دیگر و همان روز شمرده نشد)');
  ok(!/ZL50/.test(T),'ترمز ZL50 (۴۷ روز فاصله): نیست');
  ok(!/نیسان/.test(T),'کلاچ نیسان (ثبت ۱۲ روز پیش): نیست');
  ok(await fr.evaluate(()=>!window.__x && !document.querySelector('#atList img,#atList b b')),'متن خطرناک اجرا نشد');
  await fr.evaluate(()=>{ [...document.querySelectorAll('#atList .ar')].find(b=>/TRS02/.test(b.innerText)).scrollIntoView(); }); await p.screenshot({path:'/tmp/claude-0/rp.png'});
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
