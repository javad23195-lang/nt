// نوار پایین گوشی: کاربری که «امروز/مدیریت/برنامه» ندارد، زبانه‌های خودش در نوار است و در «بیشتر» تکرار نمی‌شود
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const run=async(acl)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.addInitScript(a=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({uid:'u1',mode:'w',dept:'استخراج',acl:a})); } },acl);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
    const bar=await p.evaluate(()=>[...document.querySelectorAll('.ntnb')].map(b=>b.dataset.n||'more'));
    let more=[]; if(bar.includes('more')){ await p.evaluate(()=>document.querySelector('.ntnb[data-more]').click()); await sleep(300); more=await p.evaluate(()=>[...document.querySelectorAll('.ntmr')].map(b=>b.dataset.n).filter(Boolean)); }
    await c.close(); return {bar,more,errs}; };
  let r=await run({'دفترچه قرائت':'w','توقف شیفت':'w'});
  ok(r.bar.join('|')==='دفترچه قرائت|توقف شیفت','دو زبانه: هر دو در نوار، بدون «بیشتر» — '+r.bar.join('، '));
  r=await run({'دفترچه قرائت':'w','توقف شیفت':'w','ثبت مشکلات':'r','خدمات':'r','شناسنامه':'r','مدیریت':'r'});
  ok(r.bar.length===4 && r.bar[0]==='مدیریت' && r.bar.includes('more'),'شش زبانه: مدیریت + دو زبانه + «بیشتر» — '+r.bar.join('، '));
  ok(r.more.length===3 && r.more.every(n=>!r.bar.includes(n)),'«بیشتر» فقط بقیه، بدون تکرار — '+r.more.join('، '));
  ok(r.errs.length===0,'بدون خطا '+r.errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
