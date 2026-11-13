// بخش خرید: دسترسی جدا برای هر فرم (باکس، هفتگی، آب، خدمات، پیش‌فاکتور، فاکتور)، کاربر یک‌فرمی (بدون میز و نوار پایین)،
// کاربر قدیمی («لیست خرید» = همه چهار فرم)، فرم کاربر، صفحه انتخاب و منوی + طرح تازه. همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const DATA={nt_kbox_v1:[{id:'b1',name:'کالای نمونه',qty:'1',unit:'عدد',imp:1,seen:'1405/07/01'}],nt_ksvc_v1:[{id:'s1',title:'کار نمونه',unit:'واحد نمونه',date:'1405/07/01'}],
    nt_kwater_v1:{trips:[{id:'a1',d:'1405/07/24',n:'20'}]},nt_kpre_v1:[{id:'p1',title:'استعلام نمونه',date:'1405/07/01',items:[{id:'i1',t:'قلم',q:1}],quotes:[],st:'wait'}]};
  const run=async(cfg,extra,chooser)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.addInitScript(([cfg,extra,ch])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); if(ch) localStorage.setItem('ntws_test','1');
      if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); Object.keys(extra||{}).forEach(k=>localStorage.setItem(k,JSON.stringify(extra[k]))); },[cfg,Object.assign({},DATA,extra||{}),!!chooser]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntWs,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1600);
    return {c,p,errs}; };
  const frameOf=async(p,n)=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); return (await p.$$('iframe'))[i].contentFrame(); };
  const visTabs=p=>p.evaluate(()=>DOCS.filter((d,i)=>!tabs[i].hidden).map(d=>d.name));
  const shown=(f,sel)=>f.evaluate(s=>{ const e=document.querySelector(s); return !!e && !e.hidden && getComputedStyle(e).display!=='none' && !e.closest('[hidden]'); },sel);

  console.log('۱) کاربر فقط «خدمات»: یک فرم، بدون میز و نوار پایین');
  let {c,p,errs}=await run({uid:'u1',mode:'w',acl:{'خدمات تدارکات':'w','لیست خرید':'w'}});
  let V=await visTabs(p);
  ok(V.length===1 && V[0]==='لیست خرید' && await p.evaluate(()=>ntWs.cur==='kh'),'فقط زبانه «لیست خرید» — '+V.join('،'));
  ok(await p.evaluate(()=>document.body.classList.contains('ntkh1') && getComputedStyle(document.getElementById('ntNav')).display==='none' && getComputedStyle(document.getElementById('ntFab')).display==='none'),'نوار پایین و دکمه + نیست');
  ok(await p.evaluate(()=>JSON.stringify(ntSync.khForms())==='["خدمات تدارکات"]' && ntSync.canWriteTab('خدمات تدارکات') && !ntSync.canSee('آب شیرین') && !ntSync.canSee('باکس سندپرداز')),'دسترسی: فقط خدمات');
  let f=await frameOf(p,'لیست خرید');
  ok(await f.evaluate(()=>document.getElementById('seg').hidden && !document.getElementById('p_svc').hidden && document.getElementById('p_box').hidden && document.getElementById('p_water').hidden),'لیست خرید: فقط قسمت خدمات، بدون دکمه‌های بخش');
  await f.evaluate(()=>document.getElementById('sNewW').open=true); await f.fill('#sUnit','واحد نمونه ب'); await f.fill('#sTitle','کار تازه'); await f.fill('#sNo','77'); await f.click('#sAdd'); await sleep(200);
  ok((await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_ksvc_v1')))).some(x=>x.title==='کار تازه' && x.no==='77'),'ثبت خدمات تازه');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200)); await c.close();

  console.log('۲) کاربر آب (ثبت) و باکس (فقط دیدن) با میز');
  ({c,p,errs}=await run({uid:'u2',mode:'w',acl:{'آب شیرین':'w','باکس سندپرداز':'r','لیست خرید':'w','میز خرید':'w'}}));
  V=await visTabs(p);
  ok(V.includes('میز خرید') && V.includes('لیست خرید') && !V.includes('پیش‌فاکتور') && !V.includes('فاکتور خرید') && await p.evaluate(()=>!document.body.classList.contains('ntkh1')),'دو فرم: میز و لیست خرید با نوار پایین — '+V.join('،'));
  await p.evaluate(()=>window.postMessage({nt:'go',tab:'میز خرید'},'*')); await sleep(900);
  let d=await frameOf(p,'میز خرید'); let T=await d.evaluate(()=>document.body.innerText);
  ok(/آب شیرین/.test(T) && /ضروری‌های باز/.test(T) && !/خدمات باز/.test(T) && !/خرید هفتگی/.test(T) && await d.evaluate(()=>document.getElementById('dPre').hidden && document.getElementById('dFac').hidden),'میز: فقط کارت‌های آب و باکس');
  ok(!/پیش‌فاکتور منتظر تایید/.test(T),'میز: هشدار پیش‌فاکتور نیست');
  await p.click('#ntFab'); await sleep(300);
  const acts=await p.evaluate(()=>[...document.querySelectorAll('#ntNavSh .ntkr')].map(b=>b.innerText.trim()));
  ok(acts.length===1 && /آب شیرین/.test(acts[0]),'منوی +: فقط «آب شیرین» (باکس فقط دیدن) — '+acts.join('|'));
  await p.click('#ntNavSh .ntkr'); await sleep(1200);
  f=await frameOf(p,'لیست خرید');
  ok(await f.evaluate(()=>!document.getElementById('p_water').hidden && [...document.querySelectorAll('#seg button')].filter(b=>!b.hidden).map(b=>b.dataset.p).join(',')==='box,water'),'لیست خرید: فقط باکس و آب؛ آب باز شد');
  ok(await f.evaluate(()=>document.getElementById('p_box').classList.contains('ro') && !document.getElementById('p_water').classList.contains('ro')),'باکس فقط دیدن، آب ثبت');
  await f.click('#aAdd'); await sleep(200);
  ok((await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_kwater_v1')))).trips.length===2,'ثبت آب');
  await f.click('#seg [data-p="box"]'); await sleep(200); await f.click('#bF [data-f="open"]'); await sleep(200);
  ok(await f.evaluate(()=>!document.querySelector('#bList [data-imp]') && !document.querySelector('#bList [data-st]') && getComputedStyle(document.querySelector('#p_box .w-only')).display==='none'),'باکس: بدون ستاره، دکمه‌ها و بارگذاری');
  ok(await p.evaluate(()=>!ntSync.canWriteTab('باکس سندپرداز') && ntSync.canSee('باکس سندپرداز') && ntSync.canWriteTab('آب شیرین') && ntSync.canSee('لیست خرید')),'ntSync: باکس دیدن، آب ثبت');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200)); await c.close();

  console.log('۳) کاربر قدیمی: «لیست خرید» = همه چهار فرم');
  ({c,p,errs}=await run({uid:'u3',mode:'w',acl:{'لیست خرید':'w','میز خرید':'w'}}));
  ok(await p.evaluate(()=>['باکس سندپرداز','خرید هفتگی','آب شیرین','خدمات تدارکات'].every(n=>ntSync.canWriteTab(n)) && !ntSync.canSee('پیش‌فاکتور')),'چهار فرم = ثبت');
  await p.evaluate(()=>window.postMessage({nt:'go',tab:'لیست خرید'},'*')); await sleep(1000);
  f=await frameOf(p,'لیست خرید');
  ok(await f.evaluate(()=>[...document.querySelectorAll('#seg button')].filter(b=>!b.hidden).length===4 && !document.getElementById('seg').hidden),'چهار قسمت '+await f.evaluate(()=>[...document.querySelectorAll('#seg button')].map(b=>b.dataset.p+(b.hidden?'-h':'')).join(',')));
  await c.close();

  console.log('۴) صفحه انتخاب و منوی کناری (طرح تازه)');
  ({c,p,errs}=await run({mode:'w'},{},true));
  T=await p.evaluate(()=>document.getElementById('ntWs').innerText);
  ok(/کدام واحد را باز کنیم؟/.test(T) && /واحد تدارکات/.test(T) && /لیست خرید، پیش‌فاکتور و فاکتور خرید/.test(T) && /سلام/.test(T),'صفحه انتخاب طرح تازه: سلام و دو کارت');
  ok(/ورود به واحد تدارکات/.test(T) && /نوبت آوردن آب شیرین است/.test(T) && /پیش‌فاکتور منتظر تایید شما/.test(T) && /کار فوری/.test(T),'کارت تدارکات: کارهای فوری و دکمه ورود');
  await p.click('#ntWs .wr[data-w="kh"]:has-text("آب شیرین")'); await sleep(1500);
  ok(await p.evaluate(()=>document.getElementById('ntWs').hidden && ntWs.cur==='kh' && DOCS[tabs.findIndex(t=>t.classList.contains('on'))].name==='لیست خرید'),'ضربه روی ردیف آب: رفتن به لیست خرید');
  f=await frameOf(p,'لیست خرید'); ok(await f.evaluate(()=>!document.getElementById('p_water').hidden),'قسمت آب باز شد');
  ok(await p.evaluate(()=>[...document.querySelectorAll('.topbar .brand .un')].every(e=>e.textContent==='واحد تدارکات')),'نام واحد در سربرگ: واحد تدارکات');
  await p.click('#ntFab'); await sleep(300);
  ok((await p.evaluate(()=>document.querySelectorAll('#ntNavSh .ntkr').length))===4,'منوی +: چهار کار با آیکن و فلش');
  await p.keyboard.press('Escape');
  await p.click('#ntGrid'); await sleep(300); await p.click('#ntDrw [data-a="ws"]'); await sleep(1000);
  ok(await p.evaluate(()=>[...document.querySelectorAll('.topbar .brand .un')].every(e=>e.textContent!=='واحد تدارکات')),'برگشت به نت: نام واحد اصلی');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200)); await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
