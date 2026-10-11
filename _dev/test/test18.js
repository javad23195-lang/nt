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
    rows:[...d.querySelectorAll('.tlr')].map(b=>({n:b.dataset.dev,t:b.innerText.replace(/\s+/g,' '),seg:[...b.querySelectorAll('.sg')].map(s=>({c:s.className.replace('sg ',''),r:parseFloat(s.style.right),w:parseFloat(s.style.width)}))}))}; });
  const rw=(r,n)=>r.rows.find(x=>x.n.indexOf(n)>-1);
  console.log('1) نمایش پایه');
  const P=await boot((jk,nm)=>({nt_tavaqof_v1:{}}));
  let r=await TL(P);
  ok(!r.hidden && r.rows.length===8,'کارت با ۸ ردیف دیده می‌شود');
  ok(/شیفت (صبح|عصر|شب)/.test(r.sub),'عنوان شیفت: '+r.sub);
  ok(/توقفی ثبت نشده/.test(r.sum),'بدون توقف: پیام درست');
  ok(await P.evaluate(()=>frames[0].contentDocument.querySelectorAll('#tlSh button').length===3 && frames[0].contentDocument.querySelectorAll('#tlSh button[aria-pressed="true"]').length===1),'۳ دکمه شیفت، یکی انتخاب‌شده');

  console.log('2) منطق با زمان ثابت (شیفت شب دیشب)');
  // «اکنون» = ۱۹ مهر ۱۴۰۵ (۱۱ اکتبر ۲۰۲۶) ساعت ۱۰:۰۰ → شیفت شب = ۱۸ مهر ۲۲:۰۰ تا ۱۹ مهر ۰۶:۰۰
  const res=await P.evaluate(()=>{ const f=frames[0].contentWindow;
    localStorage.setItem('nt_tavaqof_v1',JSON.stringify({
      '1405/07/18|شب':{stops:[{id:'a',dev:'لودر کوماتسو WA470',from:'23:00',to:'01:00',cause:'خرابی هیدرولیک'},{id:'b',dev:'کامیون TRS02',from:'22:00',to:'22:30',cause:'نبود راننده'}]},
      '1405/07/19|شب':{stops:[{id:'c',dev:'لودر کوماتسو WA470',from:'02:00',to:'03:00',cause:'خرابی هیدرولیک'},{id:'d',dev:'بیل مکانیکی کوماتسو PC400',from:'04:00',to:'',cause:'سرویس دوره‌ای'}]},
      '1405/07/10|صبح':{stops:[{id:'e',dev:'کامیون TRS03',from:'08:00',to:'',cause:'خرابی موتور'}]}}));
    const D=f.tlBuild('شب',new Date(2026,9,11,10,0)); const g=n=>D.rows.find(x=>x.n.indexOf(n)>-1);
    return {wa:g('WA470').min,waSeg:g('WA470').seg.length,t2:g('TRS02').min,pc:g('PC400').min,t3:g('TRS03').min,start:new Date(D.W.a).toString().slice(0,24)}; });
  ok(res.wa===180,'WA470: ۲ ساعت (از ۲۳ تا ۰۱ بعد از نیمه‌شب) + ۱ ساعت = ۱۸۰ دقیقه — '+res.wa);
  ok(res.waSeg===2,'WA470: دو بخش');
  ok(res.t2===30,'TRS02: ۳۰ دقیقه');
  ok(res.pc===120,'PC400: باز از ۰۴:۰۰ تا پایان شیفت ۰۶:۰۰ = ۱۲۰ دقیقه — '+res.pc);
  ok(res.t3===480,'TRS03: توقف باز از ۹ روز پیش کل شیفت را می‌گیرد — '+res.t3);
  const res2=await P.evaluate(()=>{ const f=frames[0].contentWindow; const D=f.tlBuild('صبح',new Date(2026,9,11,10,0)); return D.rows.find(x=>x.n.indexOf('WA470')>-1).min; });
  ok(res2===0,'شیفت صبح امروز: WA470 توقفی ندارد');
  const res3=await P.evaluate(()=>{ const f=frames[0].contentWindow; const D=f.tlBuild('صبح',new Date(2026,9,11,8,0)); return D.rows.find(x=>x.n.indexOf('TRS03')>-1).min; });
  ok(res3===120,'شیفت جاری: فقط تا «اکنون» شمرده می‌شود (۶ تا ۸ = ۱۲۰) — '+res3);

  console.log('3) نمایش روی صفحه');
  await P.evaluate(()=>{ const f=frames[0].contentWindow; const n=new Date(); const cur=f.tlCur(n); f.tlSet(['صبح','عصر','شب'].find(x=>x!==cur)); });
  r=await TL(P); ok(/توقف/.test(r.sum)||/توقفی ثبت نشده/.test(r.sum),'شیفت دیگر انتخاب شد: '+r.sub);
  await P.evaluate(()=>{ frames[0].contentWindow.tlSet(null); });
  r=await TL(P);
  ok(rw(r,'TRS03').seg.length===1 && rw(r,'TRS03').seg[0].c==='em' && /توقف/.test(rw(r,'TRS03').t),'توقف باز قدیمی در شیفت جاری قرمز نشان داده می‌شود: '+rw(r,'TRS03').t);
  ok(rw(r,'TRS03').seg[0].r<0.01,'بخش از ابتدای شیفت شروع می‌شود (راست)');
  await P.evaluate(()=>{ frames[0].contentDocument.querySelector('#tlSh button:not([aria-pressed="true"])').click(); });
  ok(await P.evaluate(()=>frames[0].contentDocument.querySelectorAll('#tlSh button[aria-pressed="true"]')[0].textContent.indexOf('اکنون')<0),'کلیک روی شیفت دیگر آن را انتخاب می‌کند');
  await P.evaluate(()=>{ frames[0].contentDocument.querySelector('.tlr[data-dev*="WA470"]').click(); }); await sleep(900);
  ok(await P.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); return !!d && !d.hidden && /WA470/.test(d.innerText); }),'کلیک روی ردیف، صفحه دستگاه را باز می‌کند');
  ok(await P.evaluate(()=>{ localStorage.setItem('nt_tavaqof_v1',JSON.stringify({[frames[0].contentWindow.todayKey()+'|'+frames[0].contentWindow.tlCur(new Date())]:{stops:[{id:'z',dev:'کامیون TRS01',from:'00:00',to:'23:59',cause:'نبود راننده'}]}})); const f=frames[0].contentWindow; f.tlSet(null); const s=frames[0].contentDocument.querySelector('.tlr[data-dev*="TRS01"] .sg'); return !!s && s.className.indexOf('idle')>-1 && getComputedStyle(s).backgroundImage!=='none'; }),'بخش «سالم ولی کار نکرد» رنگ و الگو دارد (دیده می‌شود)');
  ok(P.errs.length===0,'بدون خطا '+P.errs.slice(0,2).join('|'));

  console.log('4) دسترسی و امنیت');
  await P.evaluate(()=>{ const i=DOCS.findIndex(d=>d.name==='توقف شیفت'); tabs[i].hidden=true; window.ntSync.canSee=n=>n!=='توقف شیفت'; frames[0].contentWindow.postMessage({nt:'show'},'*'); }); await sleep(700);
  r=await TL(P); ok(r.hidden,'بدون دسترسی به «توقف شیفت»، خط زمان پنهان است');
  const X=await boot((jk,nm)=>({nt_tavaqof_v1:{[jk+'|صبح']:{stops:[{id:'a',dev:'لودر ZL50',from:'06:30',to:'',cause:'<img src=x onerror=top.__xss=true>'}]}}}));
  await X.evaluate(()=>{ const f=frames[0].contentWindow; f.tlSet('صبح'); }); await sleep(300);
  ok(!(await X.evaluate(()=>!!window.__xss)) && !(await X.evaluate(()=>!!frames[0].contentDocument.querySelector('#tlCard img'))),'متن علت امن است (کد اجرا نشد)');
  ok(X.errs.length===0,'بدون خطا');
  await br.close(); web.close();
  console.log(fails?`\n${fails} آزمایش ناموفق`:'\nهمه موفق'); process.exit(fails?1:0);
})();
