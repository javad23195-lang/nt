// دفترچه قرائت: «سقف ماه پیشنهادی معدن» — روغن موتور و فیلتر موتور ۶ ماه، بقیه ۱۲؛ ساعت و آخرین سرویس دست نمی‌خورد؛ دو ضربه؛ فقط‌دیدن بدون دکمه.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const N='دفترچه قرائت';
const SV=[{id:'a',dev:'لودر ZL50',name:'روغن موتور',every:250,last:1000,ld:'1405/07/01',months:12},{id:'b',dev:'لودر ZL50',name:'فیلتر روغن موتور',every:250,last:1000,ld:'1405/07/01',months:12},
  {id:'c',dev:'لودر ZL50',name:'روغن هیدرولیک',every:2000,last:900,ld:'1405/07/01',months:12},{id:'d',dev:'کامیون TRS02',name:'روغن دیفرانسیل',every:20000,last:5,ld:'1405/07/01',months:3},
  {id:'e',dev:'کامیون TRS02',name:'فیلتر سوخت',every:10000,last:5,ld:'1405/07/01',months:12},{id:'f',dev:'لودر ZL50',name:'فیلتر هیدرولیک',every:1000,last:5,ld:'1405/07/01',months:12}];
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const run=async cfg=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.addInitScript(([cfg,SV])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); localStorage.setItem('nt_svc_v1',JSON.stringify(SV)); },[cfg,SV]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntWs,null,{timeout:15000});
    await p.addStyleTag({content:'.sybd,#ntPin,#ntSyDlg{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1200);
    await p.evaluate(n=>window.postMessage({nt:'go',tab:n},'*'),N); await sleep(1500);
    const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),N); const f=await (await p.$$('iframe'))[i].contentFrame(); return {c,p,f,errs}; };
  let {c,p,f,errs}=await run({mode:'w'});
  await f.evaluate(()=>{ document.getElementById('bSvcImp').closest('details').open=true; }); await f.click('#bSvcImp'); await sleep(200);
  await f.click('#svcMo'); await sleep(150);
  ok((await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_svc_v1')).every(x=>x.id!=='a'||x.months===12))),'ضربه اول: هنوز عوض نشده');
  await f.click('#svcMo'); await sleep(300);
  const M=Object.fromEntries((await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_svc_v1')))).map(x=>[x.id,x.months]));
  ok(M.a===6&&M.b===6&&M.e===6&&M.c===12&&M.d===12&&M.f===12,'موتور، فیلتر موتور، فیلتر سوخت ۶؛ هیدرولیک، دیفرانسیل، فیلتر هیدرولیک ۱۲ — '+JSON.stringify(M));
  const S=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_svc_v1')));
  ok(S.find(x=>x.id==='a').every===250 && S.find(x=>x.id==='c').last===900,'ساعت و آخرین سرویس دست نخورد');
  // بازرسی شد: قلم فقط‌زمانی (۱۲ ماه از ۱۴۰۵/۰۷/۰۱ نگذشته؛ با سقف ۱ ماه برای آزمایش)
  await p.evaluate(()=>{ const L=JSON.parse(localStorage.getItem('nt_svc_v1')); L.find(x=>x.id==='c').months=1; L.find(x=>x.id==='c').ld='1404/01/01'; localStorage.setItem('nt_svc_v1',JSON.stringify(L)); localStorage.setItem('nt_daftar_v1',JSON.stringify([{dev:'لودر ZL50',val:1100,date:'1405/08/01'}])); });
  await p.reload(); await p.waitForFunction(()=>window.ntSync&&window.ntWs,null,{timeout:15000}); await p.addStyleTag({content:'.sybd,#ntPin,#ntSyDlg{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1200);
  await p.evaluate(n=>window.postMessage({nt:'go',tab:n},'*'),N); await sleep(1500);
  f=await (await p.$$('iframe'))[await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),N)].contentFrame();
  ok(await f.evaluate(()=>{ const r=document.querySelector('.sr[data-id="c"]'); return !!r && /بازرسی کنید/.test(r.innerText); }),'هیدرولیک: «بازرسی کنید» (فقط زمان گذشته)');
  await f.click('.sins[data-id="c"]'); await sleep(200); await f.click('.sisave'); await sleep(200);
  ok(/نتیجه بازرسی را بنویسید/.test(await f.evaluate(()=>document.body.innerText)),'بدون نتیجه ثبت نمی‌شود');
  await f.fill('.sinf [data-f=note]','سالم <b>بدون آب</b>'); await f.click('.sisave'); await sleep(300);
  const X=(await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_svc_v1')))).find(x=>x.id==='c'), G=await p.evaluate(()=>JSON.parse(localStorage.getItem('nt_svc_log_v1')||'[]'));
  ok(X.ti && X.insp && !/[<>]/.test(X.insp.note) && X.last===900 && X.ld==='1404/01/01','بازرسی: ti و نتیجه ذخیره شد؛ آخرین تعویض دست نخورد');
  ok(G.some(g=>g.kind==='insp'&&g.item==='c'),'سابقه بازرسی ثبت شد');
  ok(await f.evaluate(()=>{ const r=document.querySelector('.sr[data-id="c"]'); return !!r && !/بازرسی کنید/.test(r.textContent) && /بازرسی [۰-۹\/]+: سالم/.test(r.textContent); }),'بعد از بازرسی: دیگر «بازرسی کنید» نیست؛ «بازرسی …: سالم» دیده می‌شود');
  ok(!errs.length,'بدون خطا '+errs.join('|').slice(0,200)); await c.close();
  ({c,p,f,errs}=await run({uid:'u2',mode:'w',acl:{[N]:'r'}}));
  ok(await f.evaluate(()=>document.getElementById('svcMo').hidden),'فقط‌دیدن: دکمه نیست'); await c.close();
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
