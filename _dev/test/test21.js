// برون‌سپاری روی کامپیوتر: لیست + برگه کنار هم، انتخاب با کلید، کپی، ثبت مرحله
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:1280,height:800}}); await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:`http://localhost:${web.address().port}`}).catch(()=>{});
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    localStorage.setItem('nt_outsrc_v1',JSON.stringify([
      {id:'a',dev:'کامیون TRS02',ven:'تعمیرکار نمونه',desc:'تعمیر پمپ',ws:'1405/01/10',we:'1405/01/12',cause:'C1',act:'A1',svc:'N034',amt:'100',steps:{ann:'1405/01/10',chk:'1405/01/10',ord:'1405/01/11',snd:'1405/01/12'}},
      {id:'b',dev:'لودر ZL50',ven:'جوشکار نمونه',desc:'جوشکاری',ws:'1405/07/19',steps:{ann:'1405/07/19'}}])); show(9); });
  await sleep(1200);
  const q=(f,a)=>p.evaluate(([f,a])=>(new Function('d','a','return ('+f+')(d,a)'))(frames[9].contentDocument,a),[f,a]);
  ok(await q('d=>d.querySelectorAll(".rw").length')===2 && await q('d=>getComputedStyle(d.querySelector(".app")).display')==='grid','عرض کامپیوتر: لیست دو ردیفی و دو ستون');
  ok(await q('d=>d.querySelector(".pane h2").textContent')==='کامیون TRS02' || /TRS02/.test(await q('d=>d.querySelector(".pane h2").textContent')),'کار اول انتخاب شد و برگه‌اش کنار لیست است');
  ok(await q('d=>d.querySelectorAll(".rw")[0].querySelectorAll(".rb i.d").length')===4,'نوار پیشرفت: ۴ مرحله سبز');
  const tabsOneRow=await p.evaluate(()=>{ const t=[...document.querySelectorAll('.tabs .tab')].filter(x=>!x.hidden).map(x=>Math.round(x.getBoundingClientRect().top)); return new Set(t).size; });
  ok(tabsOneRow===1,'همه زبانه‌ها در یک ردیف');
  await q('d=>d.querySelectorAll(".rw")[1].click()'); await sleep(200);
  ok(/ZL50/.test(await q('d=>d.querySelector(".pane h2").textContent')),'کلیک روی ردیف، برگه همان کار را نشان می‌دهد');
  await q('d=>d.querySelector(".rw[aria-selected=true]").focus()'); await p.keyboard.press('ArrowUp'); await sleep(200);
  ok(/TRS02/.test(await q('d=>d.querySelector(".pane h2").textContent')),'کلید ↑ کار قبلی را انتخاب کرد');
  ok(await q('d=>[...d.querySelectorAll(".pane .fr")].some(b=>b.dataset.copy==="1405/01/12")'),'مرحله جاری: دکمه کپی تاریخ پایان با مقدار انگلیسی');
  await q('d=>d.querySelector(".pane .ts.cur .go").click()'); await sleep(250);
  const J=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_outsrc_v1')));
  ok(!!J[0].steps.rep,'«ثبت شد» مرحله جاری (گزارش) را ثبت کرد');
  await p.setViewportSize({width:390,height:844}); await sleep(500);
  ok(await q('d=>!d.querySelector(".app")') && await q('d=>d.querySelectorAll(".jb").length')===2,'برگشت به عرض گوشی: کارت‌ها');
  ok(errs.length===0,'بدون خطا'+errs.join('|').slice(0,150));
  await br.close(); web.close(); console.log(fails?'\n'+fails+' شکست':'\nهمه موفق'); process.exit(fails?1:0);
})();
