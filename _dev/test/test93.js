// واحدها در اجرا: مدیریت کل (مدیریت + مبلغ‌ها، فقط دیدن) و مدیر کارخانه (بدون مبلغ). همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const run=async(cfg,extra)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:`http://localhost:${web.address().port}`});
    await c.addInitScript(([cfg,extra])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntws_test','1');
      if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); Object.keys(extra||{}).forEach(k=>localStorage.setItem(k,JSON.stringify(extra[k]))); },[cfg,extra]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntWs,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
    return {c,p,errs}; };
  const frameOf=async(p,n)=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); return (await p.$$('iframe'))[i].contentFrame(); };
  const go=async(p,t)=>{ await p.evaluate(t=>window.postMessage({nt:'go',tab:t},'*'),t); await sleep(900); };
  const visTabs=p=>p.evaluate(()=>DOCS.filter((d,i)=>!tabs[i].hidden).map(d=>d.name));
  const LSg=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
  const J=ago=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()-ago*864e5)); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
  const kpis=async p=>{ const f=await frameOf(p,'مدیریت'); return f.evaluate(()=>{ try{ atRender(); }catch(e){} return [...document.querySelectorAll('#kpis .kp')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' | '); }); };
  const seedCost=p=>p.evaluate(()=>{ const D=(window.ntQr&&ntQr.DEVS||[]).map(d=>d.name).filter(n=>window.ntDept&&ntDept.of(n)==='تولید'); return D[0]; });
  const putCost=(p,dev,st)=>p.evaluate(([dev,st])=>localStorage.setItem('nt_sh8_v1',JSON.stringify({rows:[{dev,st,costA:'10000000',hasA:true}]})),[dev,st]);
  const ACL_B={'مدیریت':'r','پیش‌فاکتور':'r','فاکتور خرید':'r'};
  const ACL_P={'امروز':'r','مدیریت':'r','توقف شیفت':'w','دفترچه قرائت':'w','ثبت مشکلات':'w'};

  console.log('۱) مدیریت کل');
  let {c,p,errs}=await run({mode:'w',uid:'ub1',uname:'مدیر کل آزمایشی',acl:ACL_B,sec:'boss',role:'m'},{});
  ok(await p.evaluate(()=>{ const el=document.getElementById('ntWs'); return !!el && !el.hidden; }),'دو بخش: صفحه انتخاب باز است');
  const W=await p.evaluate(()=>document.getElementById('ntWs').innerText);
  ok(/مدیریت/.test(W) && /خلاصه همه واحدها/.test(W) && /مبلغ‌ها/.test(W) && /فقط دیدن/.test(W) && !/واحد تدارکات/.test(W),'کارت‌ها: «مدیریت» و «مبلغ‌ها»، فقط دیدن');
  await p.click('#ntWs [data-ws="nt"]'); await sleep(500);
  ok((await visTabs(p)).join()==='مدیریت','بخش مدیریت: فقط زبانه «مدیریت»');
  ok(await p.evaluate(()=>[...document.querySelectorAll('.topbar .brand .un')].some(e=>e.textContent==='مدیریت')),'نام واحد در سربرگ: مدیریت');
  const dv=await seedCost(p); await putCost(p,dv,J(0));
  ok(/هزینه تعمیر این ماه/.test(await kpis(p)),'مدیریت کل هزینه را می‌بیند');
  await p.evaluate(()=>ntWs.set('kh')); await sleep(700);
  const vt=await visTabs(p);
  ok(vt.includes('پیش‌فاکتور') && vt.includes('فاکتور خرید') && !vt.includes('لیست خرید') && !vt.includes('میز خرید'),'بخش مبلغ‌ها: پیش‌فاکتور و فاکتور ('+vt.join('، ')+')');
  ok(await p.evaluate(()=>[...document.querySelectorAll('.topbar .brand .un')].some(e=>e.textContent==='مبلغ‌ها') && ntSync.canMoney() && !ntSync.canWriteTab('پیش‌فاکتور') && !ntSync.canWriteTab('فاکتور خرید') && ntAg.allowed().length===2 && !ntSync.canApprove()),'سربرگ «مبلغ‌ها»؛ بدون ثبت و تأیید؛ هر دو مأمور');
  ok(!errs.length,'بدون خطا '+errs.join(' | ').slice(0,200)); await c.close();

  console.log('۲) مدیر کارخانه');
  ({c,p,errs}=await run({mode:'w',uid:'up1',uname:'مدیر کارخانه آزمایشی',acl:ACL_P,sec:'prod',dept:'تولید',role:'m'},{}));
  ok(await p.evaluate(()=>{ const el=document.getElementById('ntWs'); return !el || el.hidden; }),'یک بخش: صفحه انتخاب نمی‌آید');
  ok(await p.evaluate(()=>[...document.querySelectorAll('.topbar .brand .un')].some(e=>e.textContent==='کارخانه') && !ntSync.canMoney()),'سربرگ «کارخانه»؛ مبلغ نمی‌بیند');
  const dv2=await seedCost(p); await putCost(p,dv2,J(0)); await go(p,'مدیریت');
  const K=await kpis(p); ok(K.length>0 && !/هزینه تعمیر/.test(K),'مدیریت: کارت هزینه نیست ('+K.slice(0,120)+')');
  ok(!errs.length,'بدون خطا '+errs.join(' | ').slice(0,200)); await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
