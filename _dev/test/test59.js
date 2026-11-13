// پیگیری فاکتور خودکار: خدمت خارجی بسته‌شده → کار در «برون‌سپاری»؛ شناسنامه ساخته شد → تمام؛ حذف → دوباره ساخته نمی‌شود
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=ago=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()-ago*864e5)); const g=t=>p.find(x=>x.type===t).value; return [g('year'),g('month'),g('day')]; };
const S=a=>a.join('/');
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:412,height:900}});
  const a=J(6), b=J(5), o=J(90);
  const rows=[
    {dev:'کامیون TRS02',act:'تعمیر گیربکس',part:'گیربکس',kind:'خارجی',y:+a[0],m:+a[1],d:+a[2],open:'',done:S(b)},
    {dev:'لودر ZL50',act:'جوشکاری باکت',kind:'خارجی',y:+a[0],m:+a[1],d:+a[2],open:'',done:''},
    {dev:'بیل مکانیکی کوماتسو PC290',act:'تعویض شیلنگ',kind:'داخلی',y:+a[0],m:+a[1],d:+a[2],open:'',done:S(b)},
    {dev:'گریدر GD705R-2',act:'تعمیر قدیمی',kind:'خارجی',y:+o[0],m:+o[1],d:+o[2],open:'',done:S(o)}];
  await c.addInitScript(R=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('nt_khadamat_v1',JSON.stringify({rows:R})); } },rows);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntInvoice&&window.ntSvc,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(2200);
  const OS=()=>p.evaluate(()=>JSON.parse(localStorage.nt_outsrc_v1||'[]'));
  let L=await OS();
  ok(L.length===1 && L[0].src==='kh' && /TRS02/.test(L[0].dev) && L[0].ws===S(b),'فقط خدمت خارجیِ بسته‌شده (اخیر) کار پیگیری فاکتور ساخت ('+L.length+')');
  ok(await p.evaluate(()=>window.ntInvoice.sync()===0 && JSON.parse(localStorage.nt_outsrc_v1).length===1),'دوباره اجرا: تکراری ساخته نشد');
  await p.evaluate(()=>window.postMessage({nt:'go',tab:'برون‌سپاری'},'*')); await sleep(1500);
  const findF=async()=>{ for(const x of p.frames()){ if(x===p.mainFrame()) continue; try{ if(await x.evaluate(()=>typeof xAdd==='function')) return x; }catch(e){} } return null; };
  let f=await findF();
  ok(!!f,'برون‌سپاری باز شد');
  const txt=await f.evaluate(()=>document.getElementById('list').innerText);
  if(process.env.SHOT) await p.screenshot({path:process.env.SHOT+'/inv.png'});
  ok(/TRS02/.test(txt) && /از خدمات/.test(txt) && /ثبت در شناسنامه/.test(txt) && !/سندپرداز/.test(txt),'کارت: «از خدمات» و مرحله «ثبت در شناسنامه» (بدون سندپرداز)');
  // شناسنامه از خدمات ساخته شد
  await p.evaluate(()=>{ const r=JSON.parse(localStorage.nt_khadamat_v1).rows[0]; localStorage.setItem('nt_sh_from_v1',JSON.stringify([ntInvoice.shKey(r)])); ntInvoice.sync(); });
  L=await OS(); ok(L[0].steps && L[0].steps.fin && L[0].steps.rcv,'شناسنامه ساخته شد → خودکار تمام شد');
  // حذف کار خودکار: دوباره ساخته نشود
  await p.evaluate(()=>{ localStorage.setItem('nt_outsrc_v1','[]'); localStorage.setItem('nt_sh_from_v1','[]'); ntInvoice.sync(); }); await sleep(200);
  await sleep(1200); f=await findF();
  await f.evaluate(()=>{ reload(); filter='all'; render(); }); await sleep(200);
  await f.evaluate(()=>{ const b=document.querySelector('[data-a="del"]'); b.click(); }); await sleep(150);
  await f.evaluate(()=>{ const b=document.querySelector('[data-a="del"]'); b.click(); }); await sleep(250);
  L=await OS(); ok(L.length===1 && L[0].del===1,'حذف کار خودکار: علامت del (نه پاک شدن)');
  ok(await p.evaluate(()=>{ ntInvoice.sync(); const a=JSON.parse(localStorage.nt_outsrc_v1); return a.length===1 && a[0].del===1; }),'بعد از حذف دوباره ساخته نشد');
  ok(await f.evaluate(()=>{ render(); return !/TRS02/.test(document.getElementById('list').innerText); }),'کار حذف‌شده دیده نمی‌شود');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
