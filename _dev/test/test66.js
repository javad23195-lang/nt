// «:» خودکار در کادر ساعت (فرم QR پوسته، برنامه روزانه)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.evaluate(()=>{ const i=document.createElement('input'); i.id='qrTo'; i.setAttribute('inputmode','numeric'); document.body.appendChild(i); });
  const typ=async(sel,txt,fr)=>{ const t=fr||p; await t.fill(sel,''); await t.focus(sel); await p.keyboard.type(txt); return t.inputValue(sel); };
  ok(await typ('#qrTo','1400')==='14:00','1400 → 14:00');
  ok(await typ('#qrTo','830')==='8:30','830 → 8:30');
  ok(await typ('#qrTo','۰۷۱۵')==='07:15','رقم فارسی ۰۷۱۵ → 07:15');
  ok(await typ('#qrTo','14:00')==='14:00','با «:» دستی هم درست');
  await p.focus('#qrTo'); await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace');
  ok(await p.inputValue('#qrTo')==='14:','پاک کردن آزاد است');
  // برنامه روزانه: مدت
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='برنامه روزانه'));
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
  await p.evaluate(i=>show(i),IDX); await sleep(1500);
  const fr=await (await p.$$('iframe'))[IDX].contentFrame();
  await fr.evaluate(()=>{ const i=document.createElement('input'); i.id='zz'; i.setAttribute('inputmode','numeric'); i.placeholder='0:30'; document.body.appendChild(i); });
  ok(await typ('#zz','130',fr)==='1:30','برنامه روزانه (مدت): 130 → 1:30');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
