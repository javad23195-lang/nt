// شناسنامه: «هزینه ماهانه دستگاه‌ها» (ماه = تاریخ ارسال)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const P=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit'}).formatToParts(new Date());
const Y=+P.find(x=>x.type==='year').value, M=+P.find(x=>x.type==='month').value, p2=n=>String(n).padStart(2,'0');
const PM=M===1?12:M-1, PY=M===1?Y-1:Y;
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:420,height:900}});
  const cur=`${Y}/${p2(M)}/02`, prev=`${PY}/${p2(PM)}/28`;
  const rows=[
    {dev:'کاپرا',desc:'الف',st:prev,reg:cur,costA:'5000000',costK:'8650000',hasA:true,hasK:true,y:Y,m:M,d:2},
    {dev:'کاپرا',desc:'ب',st:prev,reg:cur,costA:'2000000',hasA:true,xof:1,y:Y,m:M,d:2},
    {dev:'لودر WA470',desc:'ج',st:cur,reg:cur,costK:'62000000',hasK:true,y:Y,m:M,d:2},
    {dev:'<img src=x onerror=window.__x=1>',desc:'د',st:cur,reg:cur,costA:'1000',hasA:true,y:Y,m:M,d:2}];
  await c.addInitScript(r=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('nt_sh8_v1',JSON.stringify({rows:r})); } },rows);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='شناسنامه'));
  await p.evaluate(i=>show(i),IDX); await sleep(1500);
  const fr=(await (await p.$$('iframe'))[IDX].contentFrame());
  ok(await fr.evaluate(()=>document.getElementById('cmBox').hidden),'اول بسته است');
  await fr.evaluate(()=>document.getElementById('cmBtn').click()); await sleep(200);
  let T=await fr.evaluate(()=>document.getElementById('cmBox').innerText);
  ok(/جمع ۶۲,۰۰۰,۰۰۰/.test(T.replace(/۱,۰۰۰/,'')) || /۶۲,۰۰۱,۰۰۰/.test(T),'ماه جاری: WA470 (+ ردیف آزمایش) — '+T.split('\n')[1]);
  ok(!/کاپرا/.test(T),'کاپرا (ارسال ماه قبل) در ماه جاری نیست');
  await fr.evaluate(()=>document.getElementById('cmPrev').click()); await sleep(200);
  T=await fr.evaluate(()=>document.getElementById('cmBox').innerText);
  ok(/جمع ۱۵,۶۵۰,۰۰۰/.test(T) && /کاپرا/.test(T) && /۳ فاکتور/.test(T),'ماه قبل: کاپرا ۱۵٬۶۵۰٬۰۰۰، ۳ فاکتور');
  await fr.evaluate(()=>document.getElementById('cmNext').click()); await sleep(200);
  ok(await fr.evaluate(()=>!window.__x && !document.querySelector('#cmBox img')),'متن خطرناک اجرا نشد');
  await fr.evaluate(()=>document.getElementById('cmBox').scrollIntoView()); await p.screenshot({path:'/tmp/claude-0/cm.png'});
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
