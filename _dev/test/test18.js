// خط زمان شیفت در «امروز»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const pad=n=>String(n).padStart(2,'0');
const hm=m=>{ m=((m%1440)+1440)%1440; return pad(Math.floor(m/60))+':'+pad(m%60); };
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  async function boot(seed){ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); p.errs=[];
    p.on('pageerror',e=>p.errs.push(String(e))); p.on('dialog',d=>{ p.dlg=(p.dlg||0)+1; d.dismiss(); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
    const jk=await p.evaluate(()=>todayKey()); const n=new Date(), nm=n.getHours()*60+n.getMinutes();
    await p.evaluate(([seed])=>{ Object.keys(seed).forEach(k=>localStorage.setItem(k,JSON.stringify(seed[k]))); window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} },[seed(jk,nm)]);
    await p.waitForFunction(()=>{ try{ return !!frames[0].contentDocument.getElementById('flGrid'); }catch(e){ return false; } },null,{timeout:15000});
    await sleep(700); return p; }

  const TL=p=>p.evaluate(()=>{ const d=frames[0].contentDocument; const c=d.getElementById('tlCard'); return {hidden:c.hidden,sub:d.getElementById('tlSub').textContent,sum:d.getElementById('tlSum').textContent,
    rows:[...d.querySelectorAll('.tlr')].map(b=>({n:b.dataset.dev,t:b.innerText.replace(/\s+/g,' '),br:b.querySelectorAll('.br').length,ok:b.querySelectorAll('.tlok').length,wk:b.querySelectorAll('.wk').length,seg:[...b.querySelectorAll('.sg')].map(s=>s.className.replace('sg ',''))}))}; });
  const rw=(r,n)=>r.rows.find(x=>x.n.indexOf(n)>-1);
  console.log('1) نمایش پایه');
  const P=await boot((jk,nm)=>({nt_tavaqof_v1:{}}));
  let r=await TL(P);
  ok(!r.hidden && r.rows.length===8,'کارت با ۸ ردیف دیده می‌شود');
  ok(/(روز کاری|اضافه‌کار) · /.test(r.sub),'عنوان بازه: '+r.sub);
  ok(await P.evaluate(()=>frames[0].contentDocument.querySelectorAll('#tlSh button').length===2 && frames[0].contentDocument.querySelectorAll('#tlSh button[aria-pressed="true"]').length===1),'۲ دکمه (روز کاری، اضافه‌کار)، یکی انتخاب‌شده');

  console.log('2) منطق با زمان ثابت');
  await P.evaluate(()=>{ localStorage.setItem('nt_tavaqof_v1',JSON.stringify({
    '1405/07/19|صبح':{stops:[
      {id:'a',dev:'لودر کوماتسو WA470',from:'08:10',to:'',cause:'خرابی هیدرولیک'},
      {id:'b',dev:'کامیون TRS02',from:'09:20',to:'10:05',cause:'نبود راننده'},
      {id:'b2',dev:'کامیون TRS02',from:'06:00',to:'07:40',cause:'نبود راننده'},
      {id:'c',dev:'بیل مکانیکی کوماتسو PC400',from:'08:50',to:'09:20',cause:'سرویس دوره‌ای'},
      {id:'d',dev:'کامیون TRS01',from:'12:00',to:'12:45',cause:'نبود راننده'}]},
    '1405/07/19|اضافه':{stops:[],work:[
      {id:'w1',dev:'لودر کوماتسو WA470',from:'15:20',to:'17:00'},
      {id:'w2',dev:'کامیون TRS01',from:'16:00',to:''},
      {id:'w3',dev:'کامیون TRS02',from:'22:00',to:'00:30'}]},
    '1405/07/10|صبح':{stops:[{id:'e',dev:'کامیون TRS03',from:'08:00',to:'',cause:'خرابی موتور'}]}})); });
  const m=(k,h,mi)=>P.evaluate(([k,h,mi])=>{ const f=frames[0].contentWindow; const D=f.tlBuild(k,new Date(2026,9,11,h,mi)); const o={}; D.rows.forEach(x=>{ o[x.n.split(' ').pop()]=[x.min,x.wmin,x.seg.length,x.wk.length]; }); o.brs=D.brs.length; o.a=new Date(D.W.a).getHours(); o.d=new Date(D.W.a).getDate(); return o; },[k,h,mi]);
  let D1=await m('day',11,30);
  ok(D1.WA470[0]===185,'WA470: باز از ۰۸:۱۰ تا ۱۱:۳۰ = ۲۰۰ دقیقه، منهای ۱۵ دقیقه صبحانه = ۱۸۵ — '+D1.WA470[0]);
  ok(D1.TRS02[0]===85,'TRS02: ۴۵ + ۴۰ (بخش پیش از ۰۷:۰۰ بریده شد) = ۸۵ — '+D1.TRS02[0]);
  ok(D1.PC400[0]===15,'PC400: ۳۰ دقیقه منهای ۱۵ دقیقه صبحانه = ۱۵ — '+D1.PC400[0]);
  ok(D1.TRS01[0]===0,'TRS01: توقف ۱۲:۰۰ هنوز نرسیده (بعد از «اکنون»)');
  ok(D1.TRS03[0]===255,'TRS03: توقف باز از ۹ روز پیش کل روز را می‌گیرد (۷:۰۰ تا ۱۱:۳۰ = ۲۷۰، منهای ۱۵ دقیقه صبحانه = ۲۵۵) — '+D1.TRS03[0]);
  ok(D1.brs===2 && D1.a===7,'روز کاری از ۰۷:۰۰، دو استراحت');
  let D2=await m('day',14,0);
  ok(D2.TRS01[0]===0,'TRS01: توقف ۱۲:۰۰ تا ۱۲:۴۵ همه‌اش نهار است، توقف حساب نمی‌شود — '+D2.TRS01[0]);
  let D3=await m('ot',23,30);
  ok(D3.WA470[1]===100,'اضافه‌کار WA470: ۱۵:۲۰ تا ۱۷:۰۰ = ۱۰۰ دقیقه — '+D3.WA470[1]);
  ok(D3.TRS01[1]===420,'اضافه‌کار باز TRS01 از ۱۶:۰۰ تا پایان بازه ۲۳:۰۰ = ۴۲۰ — '+D3.TRS01[1]);
  ok(D3.TRS02[1]===60,'اضافه‌کار TRS02 از ۲۲:۰۰ تا ۰۰:۳۰ (از نیمه‌شب رد می‌شود)، بازه تا ۲۳:۰۰ = ۶۰ — '+D3.TRS02[1]);
  ok(D3.PC290[1]===0 && D3.brs===0 && D3.a===15,'بازه اضافه‌کار از ۱۵:۰۰ و بدون استراحت');
  let D4=await m('day',5,0);
  ok(D4.d===10,'پیش از ۰۷:۰۰ بازه روز قبل نشان داده می‌شود');

  console.log('3) نمایش روی صفحه');
  await P.evaluate(()=>{ frames[0].contentWindow.tlSet('day'); }); r=await TL(P);
  ok(r.rows.every(x=>x.br===2 && x.ok===1 && x.wk===0),'روز کاری: ۲ نوار استراحت و زمینه سبز در هر ردیف');
  ok(/استراحت/.test(await P.evaluate(()=>frames[0].contentDocument.querySelector('.tlg').innerText)),'راهنما «استراحت» دارد');
  ok(rw(r,'TRS03').seg.indexOf('em')>-1 && /توقف/.test(rw(r,'TRS03').t),'توقف باز قدیمی قرمز نشان داده می‌شود: '+rw(r,'TRS03').t);
  await P.evaluate(()=>{ frames[0].contentWindow.tlSet('ot'); }); r=await TL(P);
  ok(r.rows.every(x=>x.br===0 && x.ok===0),'اضافه‌کار: بدون استراحت و بدون زمینه سبز');
  ok(/کار نکرده/.test(rw(r,'PC290').t),'دستگاه بدون ثبت: «کار نکرده» (خرابی نیست) — '+rw(r,'PC290').t);
  await P.evaluate(()=>{ frames[0].contentWindow.tlSet(null); frames[0].contentDocument.querySelector('#tlSh button:not([aria-pressed="true"])').click(); });
  ok(await P.evaluate(()=>frames[0].contentDocument.querySelectorAll('#tlSh button[aria-pressed="true"]')[0].textContent.indexOf('اکنون')<0),'کلیک روی بازه دیگر آن را انتخاب می‌کند');
  await P.evaluate(()=>{ frames[0].contentDocument.querySelector('.tlr[data-dev*="WA470"]').click(); }); await sleep(900);
  ok(await P.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); return !!d && !d.hidden && /WA470/.test(d.innerText); }),'کلیک روی ردیف، صفحه دستگاه را باز می‌کند');
  ok(await P.evaluate(()=>{ localStorage.setItem('nt_tavaqof_v1',JSON.stringify({[frames[0].contentWindow.todayKey()+'|صبح']:{stops:[{id:'z',dev:'کامیون TRS01',from:'00:00',to:'23:59',cause:'نبود راننده'}]}})); const f=frames[0].contentWindow; f.tlSet('day'); const s=frames[0].contentDocument.querySelector('.tlr[data-dev*="TRS01"] .sg'); return !!s && s.className.indexOf('idle')>-1 && getComputedStyle(s).backgroundImage!=='none'; }),'بخش «سالم ولی کار نکرد» رنگ و الگو دارد');
  ok(P.errs.length===0,'بدون خطا '+P.errs.slice(0,2).join('|'));

  console.log('4) کارت ناوگان: خارج از ساعت کاری');
  const Q=await boot((jk,nm)=>({nt_tavaqof_v1:{}}));
  await Q.evaluate(()=>{ ntStops.HOURS={from:0,to:1}; const jk=frames[0].contentWindow.todayKey(); localStorage.setItem('nt_tavaqof_v1',JSON.stringify({
    [jk+'|اضافه']:{stops:[],work:[{id:'w',dev:'کامیون TRS01',from:'16:00',to:''}]},
    [jk+'|صبح']:{stops:[{id:'a',dev:'لودر ZL50',from:'05:00',to:'',cause:'خرابی برق'}]}})); frames[0].contentWindow.postMessage({nt:'show'},'*'); }); await sleep(700);
  const FF=await Q.evaluate(()=>{ const d=frames[0].contentDocument; return {c:[...d.querySelectorAll('.fld')].map(b=>({n:b.dataset.dev,c:b.className,t:b.innerText.replace(/\s+/g,' ')})),sum:[...d.querySelectorAll('#flSum .k')].map(k=>k.innerText.replace(/\s+/g,' ')).join('|')}; });
  const fb=n=>FF.c.find(x=>x.n.indexOf(n)>-1);
  ok(fb('PC290').c.includes('fl-off') && /پایان کار/.test(fb('PC290').t) && /خارج از ساعت کاری/.test(fb('PC290').t),'خارج از ساعت کاری: «پایان کار» (نه «در کار»)');
  ok(fb('TRS01').c.includes('fl-ok') && /اضافه‌کار از ۱۶:۰۰/.test(fb('TRS01').t),'اضافه‌کار باز: «در کار» با ساعت شروع — '+fb('TRS01').t);
  ok(fb('ZL50').c.includes('fl-bad'),'توقف باز خارج از ساعت هم خراب می‌ماند');
  ok(/پایان کار/.test(FF.sum),'شمارنده «پایان کار» دیده می‌شود: '+FF.sum);
  ok(Q.errs.length===0,'بدون خطا');

  console.log('5) دسترسی و امنیت');
  await P.evaluate(()=>{ const i=DOCS.findIndex(d=>d.name==='توقف شیفت'); tabs[i].hidden=true; window.ntSync.canSee=n=>n!=='توقف شیفت'; frames[0].contentWindow.postMessage({nt:'show'},'*'); }); await sleep(700);
  r=await TL(P); ok(r.hidden,'بدون دسترسی به «توقف شیفت»، خط زمان پنهان است');
  const X=await boot((jk,nm)=>({nt_tavaqof_v1:{[jk+'|صبح']:{stops:[{id:'a',dev:'لودر ZL50',from:'07:30',to:'',cause:'<img src=x onerror=top.__xss=true>'}]}}}));
  await X.evaluate(()=>{ frames[0].contentWindow.tlSet('day'); }); await sleep(300);
  ok(!(await X.evaluate(()=>!!window.__xss)) && !(await X.evaluate(()=>!!frames[0].contentDocument.querySelector('#tlCard img'))),'متن علت امن است (کد اجرا نشد)');
  ok(X.errs.length===0,'بدون خطا');
  await br.close(); web.close();
  console.log(fails?`\n${fails} آزمایش ناموفق`:'\nهمه موفق'); process.exit(fails?1:0);
})();
