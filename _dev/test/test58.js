// دفترچه قرائت: قرائت تکراری (همان دستگاه، همان روز) یکی می‌شود؛ «خدمات» قرائت تکراری نمی‌سازد
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:1100,height:860}});
  const D='لودر ZL50';
  await c.addInitScript(D=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('nt_daftar_v1',JSON.stringify([
    {dev:D,unit:'ساعت',val:4083,date:'1405/07/23'},{dev:D,unit:'ساعت',val:4104,date:'1405/07/25'},{dev:D,unit:'ساعت',val:4104,date:'1405/07/25',src:'خدمات'},
    {dev:'لودر  ZL50',unit:'ساعت',val:4104,date:'1405/7/25',src:'خدمات'},{dev:'بیل PC290',unit:'ساعت',val:100,date:'1405/07/25'}])); } },D);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntQr&&window.ntDaftarDedup,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(800);
  const LS=()=>p.evaluate(()=>JSON.parse(localStorage.nt_daftar_v1||'[]'));
  let L=await LS(); const z=L.filter(x=>/ZL50/.test(x.dev));
  ok(z.length===2 && z.filter(x=>/25$/.test(x.date)).length===1,'باز شدن سامانه: ۳ قرائت تکراری ZL50 در ۲۵ مهر یکی شد ('+z.length+')');
  ok(L.some(x=>/PC290/.test(x.dev)),'قرائت دستگاه دیگر ماند');
  await p.evaluate(()=>window.postMessage({nt:'go',tab:'خدمات'},'*')); await sleep(1500);
  let f=null; for(const x of p.frames()){ if(x===p.mainFrame()) continue; try{ if(await x.evaluate(()=>typeof reqSheet==='function')) { f=x; break; } }catch(e){} }
  ok(!!f,'بخش خدمات باز شد');
  const add=act=>f.evaluate(([D,act])=>{ setCombo(cDev,'fDev',D); setCombo(cAct,'fAct',act); document.getElementById('fReg').value='1405/07/26'; document.getElementById('fMeter').value='4120'; document.getElementById('bAdd').click(); },[D,act]);
  await add('تعویض فیلتر'); await sleep(300); await add('تعویض روغن'); await sleep(300);
  L=await LS(); const d26=L.filter(x=>/ZL50/.test(x.dev) && x.date==='1405/07/26');
  ok(d26.length===1 && d26[0].val===4120,'خدمات: دو ردیف با کنتور در یک روز → فقط یک قرائت ('+d26.length+')');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
