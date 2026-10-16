// خرید خودکار از انبار (زیر حداقل) + مصرف سوخت و روغن
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=dt=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(dt); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
const ago=n=>J(new Date(Date.now()-n*864e5));
const daf=[], flu=[]; let h=15000;
for(let n=150;n>=0;n-=10){ daf.push({dev:'لودر ZL50',unit:'ساعت',val:h,date:ago(n)}); if(n<150) flu.push({id:'f'+n,dev:'لودر ZL50',k:'fuel',l:n<30?80*20:80*15,d:ago(n),at:h}); h+=80; }
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:412,height:900}});
  await c.addInitScript(([daf,flu])=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('nt_daftar_v1',JSON.stringify(daf)); localStorage.setItem('nt_fluid_v1',JSON.stringify(flu)); } },[daf,flu]);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntDev,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(1200);
  const open=async n=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); await p.evaluate(i=>show(i),i); await sleep(2000); return (await (await p.$$('iframe'))[i].contentFrame()); };

  console.log('— زیر حداقل انبار');
  let fr=await open('درخواست خرید');
  const n0=await fr.evaluate(()=>kLowList().length);
  ok(n0>0 && await fr.evaluate(()=>!document.getElementById('kLow').hidden),'نوار «به حداقل رسیده» هست: '+n0+' قلم');
  const L=await fr.evaluate(()=>kLowList().slice(0,3).map(x=>({d:x.o.d,q:x.q,live:x.live,min:x.min})));
  ok(L.every(x=>x.live<=x.min && x.q>=1),'همه زیر حداقل و تعداد پیشنهادی ≥ ۱');
  await fr.evaluate(()=>document.getElementById('kLowGo').click()); await sleep(200);
  try{ await (await fr.$('#kLow')).screenshot({path:'/tmp/claude-0/klow.png'}); }catch(e){}
  await fr.evaluate(()=>{ document.querySelectorAll('#kLow .klc input').forEach((cb,i)=>{ cb.checked=i<2; }); const q=document.querySelector('#kLow .klq[data-n="0"]'); q.value='7'; });
  await fr.evaluate(()=>document.getElementById('kLowAdd').click()); await sleep(300);
  const R=await fr.evaluate(()=>rows.map(r=>({item:r.item,qty:r.qty,unit:r.unit,note:r.note})));
  ok(R.length===2 && R[0].item===L[0].d && R[0].qty===7 && R[1].item===L[1].d && R.every(r=>r.unit==='انبار'&&/حداقل/.test(r.note)),'دو درخواست ساخته شد (تعداد اصلاح‌شده ۷)');
  ok(await fr.evaluate(n0=>kLowList().length===n0-2,n0),'قلم‌هایی که درخواست باز دارند دیگر پیشنهاد نمی‌شوند');
  await fr.evaluate(()=>document.getElementById('kLowGo').click()); await sleep(150);
  await fr.evaluate(()=>document.querySelector('#kLow .kls').click()); await sleep(200);
  ok(await fr.evaluate(n0=>kLowList().length===n0-3 && !Object.keys(localStorage).some(k=>/^nt_/.test(k)&&/skip/.test(k)),n0),'«نادیده»: ۳۰ روز پیشنهاد نمی‌شود (فقط همین گوشی)');
  const it=L[2].d;
  await p.evaluate(it=>localStorage.setItem('nt_anbar_in_v1',JSON.stringify({rows:[{item:it,qty:999}]})),it);
  ok(await fr.evaluate(it=>!kLowList().some(x=>x.o.d===it),it),'ورود انبار ثبت شد: دیگر زیر حداقل نیست');

  console.log('— سوخت و روغن');
  fr=await open('دفترچه قرائت');
  const card=()=>fr.evaluate(()=>{ const el=[...document.querySelectorAll('#list input.rv')].find(x=>x.dataset.dev==='لودر ZL50'); return el.closest('.dev').querySelector('.flw').innerText.replace(/\s+/g,' '); });
  let tx=await card();
  ok(/سوخت 20 لیتر در ساعت|سوخت ۲۰ لیتر در ساعت/.test(tx) && /معمول ۱۵/.test(tx) && /▲ ۳۳٪/.test(tx),'نرخ ۳۰ روز ۲۰، معمول ۱۵ → هشدار ۳۳٪: '+tx);
  await fr.evaluate(()=>[...document.querySelectorAll('#list [data-flo]')].find(b=>b.dataset.flo==='لودر ZL50').click()); await sleep(200);
  await fr.evaluate(()=>{ document.querySelector('#list [data-flk="oil"]').click(); document.querySelector('#list .fll').value='۲٫۵'; document.querySelector('#list [data-fls]').click(); }); await sleep(300);
  const E=await p.evaluate(()=>JSON.parse(localStorage.nt_fluid_v1));
  const e=E[E.length-1]; ok(e.dev==='لودر ZL50' && e.k==='oil' && e.l===2.5 && typeof e.id==='string','روغن موتور ۲٫۵ لیتر ثبت شد (رقم فارسی و ٫)');
  tx=await card(); ok(/روغن موتور/.test(tx),'ردیف روغن موتور اضافه شد');
  try{ const el=await fr.evaluateHandle(()=>[...document.querySelectorAll('#list input.rv')].find(x=>x.dataset.dev==='لودر ZL50').closest('.dev')); await el.screenshot({path:'/tmp/claude-0/fluid.png'}); }catch(e){}
  await fr.evaluate(()=>{ document.querySelector('#list .fll').value='abc'; document.querySelector('#list [data-fls]').click(); }); await sleep(200);
  ok((await p.evaluate(()=>JSON.parse(localStorage.nt_fluid_v1).length))===E.length,'لیتر نادرست ثبت نشد');
  ok(await p.evaluate(()=>ntSync&&true),'');
  await fr.evaluate(()=>{ const b=[...document.querySelectorAll('#list [data-flo]')].find(b=>b.dataset.flo==='لودر ZL50'); if(b) b.click(); }); await sleep(200);
  ok(await fr.evaluate(()=>/روغن گیربکس/.test(document.querySelector('#list .flk').innerText) && /دیفرانسیل عقب/.test(document.querySelector('#list .flk').innerText)),'دفترچه: گزینه‌های روغن مخصوص لودر');
  await fr.evaluate(()=>document.querySelector('#list [data-fleo]').click()); await sleep(200);
  await fr.evaluate(()=>{ document.querySelector('#list .flet').value='روغن موتور\nگیربکس\nترمز'; document.querySelector('#list [data-fles]').click(); }); await sleep(250);
  ok(await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.nt_fluid_cfg_v1)['لودر ZL50'])==='["موتور","گیربکس","ترمز"]'),'ویرایش فهرست روغن‌های دستگاه ذخیره شد');
  ok(await fr.evaluate(()=>/روغن ترمز/.test(document.querySelector('#list .flk').innerText) && !/دیفرانسیل/.test(document.querySelector('#list .flk').innerText)),'گزینه‌ها از فهرست تازه');
  fr=await open('امروز'); await sleep(500);
  ok(/مصرف بالاتر از معمول/.test(await fr.evaluate(()=>document.body.innerText)),'«امروز»: مصرف بالاتر از معمول');
  await p.evaluate(()=>ntDev.open('لودر ZL50')); await sleep(400);
  ok(/مصرف سوخت و روغن/.test(await p.evaluate(()=>document.getElementById('ntQrBody').innerText)),'پرونده دستگاه: بخش مصرف');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
