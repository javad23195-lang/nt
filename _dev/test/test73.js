// طرح تازه «مدیریت»: کارت‌های خلاصه جدا، ناوگان با انتخاب بخش، «آماده به کار ٪»، فهرست دستگاه با جزئیات، ترتیب گوشی
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=ago=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()-ago*864e5)); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const seed={nt_tavaqof_v1:{[J(0)+'|صبح']:{stops:[{id:'a',dev:'بیل مکانیکی کوماتسو PC290',from:'06:30',to:'',cause:'خرابی هیدرولیک'},{id:'b',dev:'لودر ZL50',from:'08:00',to:'',cause:'نبود راننده'},{id:'c',dev:'کامیون TRS03',from:'07:10',to:'',cause:'خرابی لاستیک'}]}},
    nt_svc_v1:[{id:'s1',dev:'کامیون TRS01',name:'روغن موتور',last:'',ld:'1404/01/01',every:250,months:1},{id:'s2',dev:'کامیون TRS01',name:'فیلتر',last:'',ld:'1404/01/01',every:250,months:1},{id:'s3',dev:'لودر کوماتسو WA470',name:'روغن هیدرولیک',last:'',ld:'1404/03/01',every:2000,months:12}],
    nt_moshkel_v1:{row:5,rows:[{dev:'لودر ZL50',desc:'a',state:'باز'},{dev:'کامیون TRS03',desc:'b',state:'منتظر قطعه'}]},
    nt_daftar_v1:[{dev:'لودر کوماتسو WA470',unit:'ساعت',val:12486,date:J(1)}],
    nt_sh8_v1:{rows:[{dev:'لودر ZL50',st:J(0),costA:'12000000',costK:'45000000'}]}};
  const run=async(vp,cfg)=>{ const c=await br.newContext({locale:'fa-IR',viewport:vp});
    await c.addInitScript(([s,cfg])=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); /* ساعت توقف‌های باز نسبت به همین لحظه (وگرنه صبح زود پیش از ۰۶:۳۰ آزمایش شکست می‌خورد) */
      const n=new Date(), nm=n.getHours()*60+n.getMinutes(), hm=m=>{ m=Math.max(1,m); return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
      const MAP={'06:30':hm(nm-90),'07:10':hm(nm-60),'08:00':hm(nm-30)};
      const t=JSON.parse(JSON.stringify(s)); Object.values(t.nt_tavaqof_v1||{}).forEach(r=>(r.stops||[]).forEach(x=>{ if(MAP[x.from]) x.from=MAP[x.from]; }));
      Object.keys(t).forEach(k=>localStorage.setItem(k,JSON.stringify(t[k]))); if(cfg) localStorage.setItem('ntsync_cfg_v1',JSON.stringify(cfg)); } },[seed,cfg]);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntNav&&window.ntDept,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1200);
    await p.evaluate(()=>window.postMessage({nt:'go',tab:'مدیریت'},'*')); await sleep(1800);
    const i=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='مدیریت')); const fr=await (await p.$$('iframe'))[i].contentFrame();
    return {c,p,fr,errs}; };

  console.log('۱) گوشی، مدیر (بدون بخش)');
  let {c,fr,errs}=await run({width:390,height:844});
  const kp=await fr.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#kpis .kp')].map(b=>[b.classList[1],b.innerText.replace(/\s+/g,' ')])));
  ok(/۲ دستگاه/.test(kp.oil) && /TRS01/.test(kp.oil) && /WA470/.test(kp.oil),'سرویس گذشته: «۲ دستگاه» + نام‌ها (TRS01 با دو سرویس یک بار) — '+kp.oil);
  ok(/۲ مورد/.test(kp.fix) && /۲ دستگاه خراب در توقف/.test(kp.fix) && /۱ منتظر قطعه/.test(kp.fix),'خرابی باز: «۲ مورد»، «۲ دستگاه خراب در توقف» — '+kp.fix);
  const sep=await fr.evaluate(()=>{ const a=[...document.querySelectorAll('#kpis .kp')].map(b=>b.getBoundingClientRect()); return a.length===4 && Math.abs(a[0].top-a[1].top)<2 && a[2].top>a[0].bottom+4 && getComputedStyle(document.querySelector('#kpis .kp')).borderRadius==='16px'; });
  ok(sep,'کارت‌های خلاصه: ۴ کارت جدا، ۲×۲ '+JSON.stringify(await fr.evaluate(()=>[...document.querySelectorAll('#kpis .kp')].map(b=>{const r=b.getBoundingClientRect(); return [r.top|0,r.bottom|0,getComputedStyle(b).borderRadius]; }))));
  ok(await fr.evaluate(()=>[...document.querySelectorAll('.kpsp')].every(e=>!e.getClientRects().length)),'گوشی: نمودار کوچک پنهان');
  const order=await fr.evaluate(()=>['kpis','flCard','tlCard'].map(id=>document.getElementById(id).getBoundingClientRect().top));
  ok(order[0]<order[1] && order[1]<order[2] && await fr.evaluate(()=>getComputedStyle(document.getElementById('atCard')).display==='none'),'ترتیب گوشی: خلاصه، ناوگان، خط زمان (بدون «نیاز به توجه»)');
  const seg=await fr.evaluate(()=>[...document.querySelectorAll('#fl2 .fsg button')].map(b=>b.textContent+(b.getAttribute('aria-pressed')==='true'?'*':'')));
  ok(seg.length===3 && /^همه \(۸\)\*$/.test(seg[0]) && seg.some(s=>/تولید \(۳\)/.test(s)) && seg.some(s=>/استخراج \(۵\)/.test(s)),'انتخاب بخش: همه ۸، تولید ۳، استخراج ۵ — '+seg.join('|'));
  const rd=()=>fr.evaluate(()=>({p:document.querySelector('#fl2 .frh b').textContent,l:document.querySelector('#fl2 .frl').innerText.replace(/\s+/g,' '),n:document.querySelectorAll('#fl2 .frb i').length,rows:[...document.querySelectorAll('#fl2 .fr2')].map(r=>r.className.match(/fl-(\w+)/)[1]+'|'+r.querySelector('.frw').innerText.replace(/\s+/g,' '))}));
  let R=await rd();
  ok(R.p==='۶۳٪' && /خراب \/ تعمیر ۲/.test(R.l) && /منتظر \/ سرویس ۱/.test(R.l) && R.n>=3,'آماده به کار ۶۳٪ (۵ از ۸) و راهنما — '+R.p+' '+R.l);
  ok(R.rows.length===8 && /^bad/.test(R.rows[0]) && /^bad/.test(R.rows[1]) && /^wa/.test(R.rows[2]),'فهرست: ۸ دستگاه، خراب‌ها اول');
  ok(R.rows.some(r=>/WA470/.test(r) && /کارکرد ۱۲٬۴۸۶ ساعت/.test(r)),'کارکرد از دفترچه: ۱۲٬۴۸۶ ساعت');
  ok(R.rows.some(r=>/PC290/.test(r) && /توقف ماه/.test(r) && /استخراج/.test(r)),'توقف ماه (توقف باز هم) و نام بخش');
  await fr.evaluate(()=>document.querySelector('#fl2 .fsg [data-seg="تولید"]').click()); await sleep(200); R=await rd();
  ok(R.rows.length===3 && R.p==='۶۷٪' && !R.rows.some(r=>/استخراج/.test(r)),'تولید: ۳ دستگاه، ۶۷٪ — '+R.p);
  ok(await fr.evaluate(()=>{ try{ return localStorage.getItem('nt_flseg')==='تولید'; }catch(e){ return false; } }),'انتخاب بخش به یاد می‌ماند');
  await fr.evaluate(()=>document.querySelector('#fl2 .fsg [data-seg="*"]').click()); await sleep(200);
  await fr.evaluate(()=>document.querySelector('#fl2 .fr2 .frw').click()); await sleep(200);
  const x=await fr.evaluate(()=>{ const r=document.querySelector('#fl2 .fr2'); const e=r.querySelector('.frx'); return {on:r.classList.contains('on'),ar:r.querySelector('.frw').getAttribute('aria-expanded'),vis:e.getClientRects().length>0,t:e.innerText.replace(/\s+/g,' ')}; });
  ok(x.on && x.ar==='true' && x.vis && /خرابی/.test(x.t) && /پرونده دستگاه/.test(x.t) && /توقف شیفت/.test(x.t),'ضربه روی دستگاه: علت، مدت، «پرونده دستگاه» و «توقف شیفت» — '+x.t);
  const h=await fr.evaluate(()=>[...document.querySelectorAll('#fl2 button')].filter(b=>b.getClientRects().length).every(b=>b.getBoundingClientRect().height>=44));
  ok(h,'همه دکمه‌های ناوگان دست‌کم ۴۴ پیکسل');
  ok(await fr.evaluate(()=>{ flRender(); return document.querySelector('#fl2 .fr2').classList.contains('on'); }),'باز بودن ردیف بعد از تازه‌سازی می‌ماند');
  ok(/اجرت و قطعه،|از (فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/.test(kp.cost||''),'هزینه: «اجرت و قطعه · ماه» یا مقایسه با نام ماه قبل — '+kp.cost);
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  await c.close();

  console.log('۲) کاربر بخش «تولید»');
  ({c,fr,errs}=await run({width:390,height:844},{uid:'u1',mode:'w',dept:'تولید',acl:{'امروز':'r','مدیریت':'r','توقف شیفت':'r','ثبت مشکلات':'r','دفترچه قرائت':'w'}}));
  R=await rd();
  ok(!(await fr.evaluate(()=>!!document.querySelector('#fl2 .fsg'))) && R.rows.length===3 && R.rows.every(r=>/WA470|ZL50|2624/.test(r)),'فقط دستگاه‌های تولید، بدون انتخاب بخش');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  await c.close();

  console.log('۳) رایانه');
  ({c,fr,errs}=await run({width:1200,height:900}));
  ok(await fr.evaluate(()=>{ const a=[...document.querySelectorAll('#kpis .kp')].map(b=>b.getBoundingClientRect().top); return a.length===4 && a.every(t=>Math.abs(t-a[0])<2); }),'کارت‌های خلاصه در یک ردیف');
  ok(await fr.evaluate(()=>getComputedStyle(document.querySelector('#fl2 .frs')).gridTemplateColumns.split(' ').length===2),'فهرست دستگاه‌ها دو ستون');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  await c.close();
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
