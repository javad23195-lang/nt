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
      {id:'a',dev:'کامیون TRS02',ven:'تعمیرکار نمونه',desc:'تعمیر پمپ',ws:'1405/01/10',amt:'100',inv:'F9',steps:{rcv:'1405/01/12'}},
      {id:'b',dev:'لودر ZL50',ven:'جوشکار نمونه',desc:'جوشکاری',ws:'1405/07/19',steps:{}}])); show(9); });
  await sleep(1200);
  const q=(f,a)=>p.evaluate(([f,a])=>(new Function('d','a','return ('+f+')(d,a)'))(frames[9].contentDocument,a),[f,a]);
  ok(await q('d=>d.querySelectorAll(".rw").length')===2 && await q('d=>getComputedStyle(d.querySelector(".app")).display')==='grid','عرض کامپیوتر: لیست دو ردیفی و دو ستون');
  ok(await q('d=>d.querySelector(".pane h2").textContent')==='کامیون TRS02' || /TRS02/.test(await q('d=>d.querySelector(".pane h2").textContent')),'کار اول انتخاب شد و برگه‌اش کنار لیست است');
  ok(await q('d=>d.querySelectorAll(".rw")[0].querySelectorAll(".rb i.d").length')===1,'نوار پیشرفت: یک مرحله سبز (فاکتور رسید)');
  const side=await p.evaluate(()=>{ const t=[...document.querySelectorAll('.tabs .tab')].filter(x=>!x.hidden).map(x=>x.getBoundingClientRect()); const tb=document.querySelector('.topbar').getBoundingClientRect();
    return {col:new Set(t.map(r=>Math.round(r.right))).size, w:Math.round(tb.width), right:Math.round(tb.right), vw:innerWidth, stage:Math.round(document.getElementById('stage').getBoundingClientRect().width)}; });
  ok(side.col===1 && side.w<260 && side.right===side.vw && side.stage>=side.vw-side.w-2,'کامپیوتر: همه زبانه‌ها در منوی کناری سمت راست ('+JSON.stringify(side)+')');
  await q('d=>d.querySelectorAll(".rw")[1].click()'); await sleep(200);
  ok(/ZL50/.test(await q('d=>d.querySelector(".pane h2").textContent')),'کلیک روی ردیف، برگه همان کار را نشان می‌دهد');
  await q('d=>d.querySelector(".rw[aria-selected=true]").focus()'); await p.keyboard.press('ArrowUp'); await sleep(200);
  ok(/TRS02/.test(await q('d=>d.querySelector(".pane h2").textContent')),'کلید ↑ کار قبلی را انتخاب کرد');
  ok(await q('d=>[...d.querySelectorAll(".pane .fr")].some(b=>b.dataset.copy==="F9")'),'مرحله جاری: دکمه کپی شماره فاکتور');
  await q('d=>d.querySelector(".pane .ts.cur .go").click()'); await sleep(250);
  const J=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_outsrc_v1')));
  ok(!!J[0].steps.fin,'«ثبت شد» مرحله جاری را ثبت کرد');
  await p.setViewportSize({width:390,height:844}); await sleep(500);
  ok(await q('d=>!d.querySelector(".app")') && await q('d=>d.querySelectorAll(".jb").length')===1,'برگشت به عرض گوشی: کارت‌ها');
  ok(errs.length===0,'بدون خطا'+errs.join('|').slice(0,150));
  await br.close(); web.close(); console.log(fails?'\n'+fails+' شکست':'\nهمه موفق'); process.exit(fails?1:0);
})();
