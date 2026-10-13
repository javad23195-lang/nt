// دفترچه قرائت: در تاریخچه دستگاه، تاریخ کامل در عرض گوشی دیده می‌شود؛ «ذخیره» فقط هنگام اصلاح
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  for(const w of [360,412]){
    const c=await br.newContext({locale:'fa-IR',viewport:{width:w,height:900},deviceScaleFactor:2});
    const rows=[]; for(let k=0;k<6;k++) rows.push({dev:'لودر کوماتسو WA470',unit:'ساعت',val:27100+k*10,date:'1405/07/'+String(13+k)});
    await c.addInitScript(r=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('nt_daftar_v1',JSON.stringify(r)); } },rows);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
    await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
    const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='دفترچه قرائت')); await p.evaluate(i=>show(i),IDX); await sleep(1500);
    const fr=(await (await p.$$('iframe'))[IDX].contentFrame());
    await fr.evaluate(()=>{ const d=[...document.querySelectorAll('details')].find(x=>/تاریخچه این دستگاه/.test(x.innerText)); d.open=true; d.scrollIntoView(); }); await sleep(300);
    const R=await fr.evaluate(()=>[...document.querySelectorAll('.hrow .hdate')].map(e=>({sw:e.scrollWidth,cw:e.clientWidth,v:e.value})));
    ok(R.length>=5 && R.every(x=>x.sw<=x.cw+1),w+'px: همه تاریخ‌ها کامل دیده می‌شوند ('+R.map(x=>x.cw+'/'+x.sw).slice(0,2).join(' ')+')');
    ok(await fr.evaluate(()=>[...document.querySelectorAll('.hrow')].every(r=>r.scrollWidth<=r.clientWidth+1)),w+'px: ردیف بیرون نمی‌زند');
    ok(await fr.evaluate(()=>[...document.querySelectorAll('.hrow .hsave')].every(b=>getComputedStyle(b).display==='none')),w+'px: «ذخیره» پنهان تا اصلاح');
    await fr.evaluate(()=>{ const e=document.querySelector('.hrow .hval'); e.focus(); e.value='27999'; e.dispatchEvent(new Event('input',{bubbles:true})); }); await sleep(150);
    ok(await fr.evaluate(()=>getComputedStyle(document.querySelector('.hrow.editing .hsave')).display!=='none'),w+'px: هنگام اصلاح «ذخیره» دیده می‌شود');
    if(w===412) await p.screenshot({path:'/tmp/claude-0/df.png'});
    ok(errs.length===0,'بدون خطا '+errs.join('|')); await c.close();
  }
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
