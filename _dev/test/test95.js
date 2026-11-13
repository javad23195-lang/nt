// فهرست‌های پایه: در کد عمومی نیست؛ فقط مدیر فایل را بارگذاری می‌کند؛ متن‌ها پاک‌سازی می‌شود؛ فرم‌ها از nt_lists_v1 پر می‌شوند. همه نام‌ها ساختگی است.
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
  console.log('۱) کد عمومی: فهرست‌ها خالی');
  { const s=HTML.toString('utf8'), i=s.indexOf('const DOCS = ')+13, j=s.indexOf('];\nconst $',i)+1, D=JSON.parse(s.slice(i,j));
    const MOVE={'برنامه روزانه':['act','sup','desc','gsup'],'ثبت مشکلات':['desc'],'شناسنامه':['desc','part','rep','sup'],'انبار':['items'],'درخواست خرید':['items','buy','req','apr','aprn','aprs']};
    let bad=[], hyd=0;
    D.forEach(d=>{ const t=Buffer.from(d.b64,'base64').toString('utf8'), k=t.indexOf('const DATA = {'); if(k<0) return;
      let o; try{ let dep=0,e=k+13,inS=false; for(;e<t.length;e++){ const ch=t[e]; if(inS){ if(ch==='\\') e++; else if(ch==='"') inS=false; } else if(ch==='"') inS=true; else if(ch==='{') dep++; else if(ch==='}'){ dep--; if(!dep) break; } } o=JSON.parse(t.slice(k+13,e+1)); }catch(e){ return; }
      if(/nt_lists_v1/.test(t)) hyd++;
      (MOVE[d.name]||[]).forEach(key=>{ if(!Array.isArray(o[key]) || o[key].length) bad.push(d.name+'.'+key); });
      if(d.name==='دفترچه قرائت' && o.d.some(x=>x.cur!==0 || x.date!=='')) bad.push('دفترچه.d'); });
    ok(!bad.length,'فهرست‌های پایه در کد خالی است '+bad.join('، ')); ok(hyd>=6,'فرم‌ها از فهرست رمزدار پر می‌شوند ('+hyd+' فرم)');
    ok(/مدیر کارخانه/.test(Buffer.from(D.find(d=>d.name==='درخواست خرید').b64,'base64').toString('utf8')),'مرحله تأیید در کد = سمت، نه نام'); }

  const FILE={app:'nt-lists',v:1,docs:{'درخواست خرید':{req:['درخواست‌کننده آزمایشی','<img src=x onerror=window.__z=1>بد'],buy:['مأمور آزمایشی'],apr:['مهندس الف','مهندس ب'],aprn:['مهندس الف','مهندس ب'],aprs:['الف','ب'],items:[{d:'کالای ساختگی "یک"',c:990001,u:'عدد',g:'قطعه',stk:1,min:2}],hack:'x',nokey:[1]},
    'انبار':{items:[{d:'کالای ساختگی یک',c:990001,u:'عدد',m:1,min:2}]},'دفترچه قرائت':{d:[{dev:'لودر ZL50',unit:'ساعت',cur:15000,date:'1405/06/01',cells:[]}]}}};
  const up=async(p,obj)=>{ await p.evaluate(()=>document.getElementById('ntSyBtn').click()); await sleep(300); await p.setInputFiles('#syLsFile',{name:'nt-lists.json',mimeType:'application/json',buffer:Buffer.from(typeof obj==='string'?obj:JSON.stringify(obj))}); await sleep(500); return p.evaluate(()=>document.getElementById('syMsg').textContent); };

  console.log('۲) سیستم مدیر: بارگذاری فایل');
  let {c,p,errs}=await run({mode:'w'},{});
  ok(await p.evaluate(()=>{ document.getElementById('ntSyBtn').click(); return !!document.getElementById('syLsBox') && /هنوز بارگذاری نشده/.test(document.getElementById('syLsInfo').textContent); }),'«فهرست‌های پایه» در تنظیم مدیر؛ هنوز خالی');
  ok(/فهرست‌های سامانه نیست/.test(await up(p,{app:'other',docs:{}})) && !(await LSg(p,'nt_lists_v1')),'فایل اشتباه: پذیرفته نشد');
  ok(/فهرست‌های سامانه نیست/.test(await up(p,'not json')),'فایل خراب: پذیرفته نشد');
  const m=await up(p,FILE); const L=await LSg(p,'nt_lists_v1');
  ok(/فهرست ذخیره شد/.test(m) && L && L.app==='nt-lists' && L.docs['درخواست خرید'].req.length===2,'فایل درست ذخیره شد: '+m);
  ok(!/[<>"]/.test(JSON.stringify(L.docs).replace(/"(?=[:,\]\}\[])|(?<=[:,\[\{])"/g,'')) && L.docs['درخواست خرید'].req[1]==='img src=x onerror=window.__z=1بد' && L.docs['درخواست خرید'].items[0].d==='کالای ساختگی یک' && !('hack' in L.docs['درخواست خرید']),'متن‌ها از < > " پاک شد؛ کلید غیر فهرست حذف شد');
  await go(p,'درخواست خرید'); let f=await frameOf(p,'درخواست خرید');
  const R=await f.evaluate(()=>({req:DATA.req,buy:DATA.buy,n:DATA.items.length,apn:APN(0),aps:APS(1),nokey:'nokey' in DATA,opts:[...document.querySelectorAll('#fReq option')].map(o=>o.textContent)}));
  ok(R.req[0]==='درخواست‌کننده آزمایشی' && R.buy[0]==='مأمور آزمایشی' && R.n===1 && R.apn==='مهندس الف' && R.aps==='ب' && !R.nokey && R.opts.includes('درخواست‌کننده آزمایشی'),'فرم «درخواست خرید» از فهرست پر شد (نام تأییدکننده هم)');
  ok(!(await p.evaluate(()=>window.__z)) && !(await f.evaluate(()=>window.__z)),'متن خطرناک اجرا نشد');
  await go(p,'انبار'); f=await frameOf(p,'انبار'); ok(await f.evaluate(()=>DATA.items.length===1 && DATA.items[0].d==='کالای ساختگی یک'),'کاتالوگ «انبار» از فهرست');
  ok(await p.evaluate(()=>{ document.getElementById('ntSyBtn').click(); return /فهرست، آخرین بارگذاری/.test(document.getElementById('syLsInfo').textContent); }),'تنظیم: تعداد و زمان بارگذاری');
  ok(!errs.length,'بدون خطا '+errs.join(' | ').slice(0,200)); await c.close();

  console.log('۳) بدون فهرست و کاربر عادی');
  ({c,p,errs}=await run({mode:'w',uid:'u1',uname:'کاربر آزمایشی',acl:{'درخواست خرید':'w','انبار':'w'},sec:'pm'},{}));
  await go(p,'درخواست خرید'); f=await frameOf(p,'درخواست خرید');
  ok(await f.evaluate(()=>DATA.req.length===0 && DATA.items.length===0 && APN(0)==='مدیر کارخانه' && APN(1)==='مدیر کل'),'بدون فهرست: خالی، مرحله تأیید با سمت');
  ok(await p.evaluate(()=>{ document.getElementById('ntSyBtn').click(); let t=false; try{ ntSync.listsPut({app:'nt-lists',docs:{'انبار':{items:[]}}}); }catch(e){ t=true; } return t && !document.getElementById('syLsBox') && !localStorage.getItem('nt_lists_v1'); }),'کاربر عادی: دکمه ندارد و نمی‌تواند فهرست بنویسد');
  ok(!errs.length,'بدون خطا '+errs.join(' | ').slice(0,200)); await c.close();

  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
