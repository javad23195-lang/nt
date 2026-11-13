// برون‌سپاری: دکمه از صفحه دستگاه، پیمانکار اختیاری
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
    const k=todayKey(); const o={}; o[k+'|صبح']={stops:[{id:'s1',dev:'کامیون TRS02',from:'08:10',to:'',cause:'خرابی موتور',note:'',by:''}]}; localStorage.setItem('nt_tavaqof_v1',JSON.stringify(o)); });
  await sleep(1000);
  const id=await p.evaluate(()=>ntQr.DEVS.find(d=>/TRS02/.test(d.name)).id);
  console.log('1) از صفحه دستگاه');
  await p.evaluate(i=>{ window.postMessage({nt:'qrdev',id:i},'*'); },id); await sleep(800);
  ok(await p.evaluate(()=>!!document.getElementById('qrOut')),'دکمه «نیاز به تعمیر بیرونی» هست');
  await p.evaluate(()=>document.getElementById('qrOut').click());
  await p.waitForFunction(()=>{ try{ const d=frames[9].contentDocument; return d.getElementById('dlg').classList.contains('on'); }catch(e){ return false; } },null,{timeout:8000}).catch(()=>{});
  const q=(f,a)=>p.evaluate(([f,a])=>(new Function('d','a','return ('+f+')(d,a)'))(frames[9].contentDocument,a),[f,a]);
  ok(await q('d=>d.getElementById("dlg").classList.contains("on")'),'زبانه برون‌سپاری باز شد و فرم باز است');
  ok(await q('d=>d.getElementById("fDev").value')==='کامیون TRS02' && await q('d=>d.getElementById("fBt").value')==='08:10','دستگاه و ساعت خرابی پر شد');
  await q('(d,a)=>{ d.getElementById("fDesc").value="تعمیر موتور"; d.getElementById("fSave").click(); }');
  await sleep(300);
  let J=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_outsrc_v1')||'[]'));
  ok(J.length===1 && J[0].dev==='کامیون TRS02' && J[0].ven==='','ذخیره شد، بدون پیمانکار');
  ok(/پیمانکار نامعلوم/.test(await q('d=>d.getElementById("list").innerText')),'کارت: «پیمانکار نامعلوم»');
  ok(errs.length===0,'بدون خطا'+errs.join('|').slice(0,160));
  await br.close(); web.close(); console.log(fails?'\n'+fails+' شکست':'\nهمه موفق'); process.exit(fails?1:0);
})();
