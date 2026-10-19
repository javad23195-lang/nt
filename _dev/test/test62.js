// بخش کاربر: سیستمی که مدیر برایش بخش «استخراج» گذاشته، در امروز/مدیریت فقط دستگاه‌های همان بخش را می‌بیند
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=ago=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()-ago*864e5)); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const seed={nt_tavaqof_v1:{[J(1)+'|صبح']:{stops:[{id:'a',dev:'بیل مکانیکی کوماتسو PC290',from:'08:00',to:'',cause:'خرابی هیدرولیک'},{id:'b',dev:'لودر ZL50',from:'08:00',to:'',cause:'خرابی موتور'}]}},
    nt_moshkel_v1:{row:5,rows:[{dev:'لودر ZL50',desc:'a',state:'باز'},{dev:'کامیون TRS01',desc:'b',state:'باز'}]}};
  const run=async(cfg)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:1100,height:900}});
    await c.addInitScript(([s,cfg])=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(s).forEach(k=>localStorage.setItem(k,JSON.stringify(s[k]))); if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); } },[seed,cfg]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntNav&&window.ntDept,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1200);
    await p.evaluate(()=>window.postMessage({nt:'go',tab:'مدیریت'},'*')); await sleep(1800);
    const i=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='مدیریت')); const fr=await (await p.$$('iframe'))[i].contentFrame();
    const r=await fr.evaluate(()=>({fl:[...document.querySelectorAll('#flGrid .fld')].map(b=>b.dataset.dev),tl:[...document.querySelectorAll('#tlRows .tlr .tt b')].map(b=>b.textContent),at:document.getElementById('atList').innerText,kp:[...document.querySelectorAll('#kpis .kp')].map(b=>b.innerText.replace(/\s+/g,' ')),dpt:(document.querySelector('header .dpt')||{}).textContent||''}));
    await p.evaluate(()=>window.postMessage({nt:'go',tab:'دفترچه قرائت'},'*')); await sleep(1500);
    const i2=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='دفترچه قرائت')); const f2=await (await p.$$('iframe'))[i2].contentFrame();
    r.df=await f2.evaluate(()=>({devs:[...document.querySelectorAll('#list input.rv')].map(e=>e.dataset.dev),dpt:(document.querySelector('.nh2 .dpt')||{}).textContent||''}));
    await c.close(); return {r,errs}; };
  let {r,errs}=await run({uid:'u1',mode:'w',dept:'استخراج',acl:{'امروز':'r','مدیریت':'r','توقف شیفت':'r','ثبت مشکلات':'r','دفترچه قرائت':'w'}});
  ok(r.fl.length===5 && r.fl.every(n=>/PC290|PC400|TRS0[123]/.test(n)),'ناوگان: فقط ۵ دستگاه استخراج — '+r.fl.join('، '));
  ok(r.tl.length===5 && !r.tl.some(n=>/ZL50|WA470|2624/.test(n)),'خط زمان: فقط استخراج ('+r.tl.length+')');
  ok(/PC290/.test(r.at) && !/ZL50/.test(r.at),'نیاز به توجه: خرابی PC290 هست، ZL50 نیست');
  const fx=r.kp.find(x=>/خرابی باز/.test(x)); ok(fx && /خرابی باز ۱/.test(fx),'کارت «خرابی باز»: فقط مشکل همان بخش ('+fx+')');
  ok(r.dpt==='بخش استخراج','بالای صفحه: «بخش استخراج»');
  ok(r.df.devs.length===5 && r.df.devs.every(n=>/PC290|PC400|TRS0[123]/.test(n)) && r.df.dpt==='بخش استخراج','دفترچه قرائت: فقط ۵ دستگاه استخراج — '+JSON.stringify(r.df));
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  ({r,errs}=await run({uid:'u2',mode:'w',dept:'نگهداری و تعمیرات',acl:{'امروز':'r','مدیریت':'r','توقف شیفت':'r','ثبت مشکلات':'r','دفترچه قرائت':'w'}}));
  ok(r.fl.length===8 && r.df.devs.length===17,'نگهداری و تعمیرات: همه دستگاه‌ها (ناوگان '+r.fl.length+'، دفترچه '+r.df.devs.length+')');
  ok(r.dpt==='بخش نگهداری و تعمیرات' && r.df.dpt==='بخش نگهداری و تعمیرات','برچسب «بخش نگهداری و تعمیرات»');
  ({r,errs}=await run(null));
  ok(r.df.devs.length===17,'مدیر (بدون بخش): دفترچه همه ۱۷ دستگاه');
  ok(r.fl.length===8 && r.dpt==='','مدیر (بدون بخش): همه ۸ دستگاه');
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
