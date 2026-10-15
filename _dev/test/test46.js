// کنترل قرائت + «مثل دفعه قبل» (توقف شیفت، ثبت مشکلات)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const R=(dev,sys,desc,sev,state,d)=>({y:1405,m:7,d:d||10,mn:'مهر',dev,sys,desc,sev,cur:'در حال کار',part:'خیر',state,fix:'',src:'دفترچه'});
  const seed={
    nt_daftar_v1:[{dev:'لودر ZL50',unit:'ساعت',val:16000,date:'1405/07/10'},{dev:'لودر ZL50',unit:'ساعت',val:16200,date:'1405/07/20'},{dev:'کامیون TRS01',unit:'کیلومتر',val:54080,date:'1405/07/10'}],
    nt_moshkel_v1:{row:5,rows:[R('لودر ZL50','سیستم هیدرولیک','نشت روغن جک','بالا','بسته',5),R('لودر ZL50','سیستم برقی','استارت نمی‌زند','بحرانی','باز',9),
      R('کامیون TRS02','<img src=x onerror=window.__x=1>','<b>ترمز</b>','متوسط','بسته')]},
    nt_tavaqof_v1:{'1405/07/01|صبح':{stops:[{id:'a',dev:'بیل مکانیکی کوماتسو PC290',from:'08:00',to:'10:30',cause:'خرابی هیدرولیک',note:'شیلنگ جک بوم'}]},
      '1405/07/05|عصر':{stops:[{id:'b',dev:'بیل مکانیکی کوماتسو PC290',from:'15:00',to:'16:00',cause:'نبود سوخت',note:'<img src=x onerror=window.__y=1>'}]}}};
  const c=await br.newContext({locale:'fa-IR',viewport:{width:412,height:900}});
  await c.addInitScript(s=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(s).forEach(k=>localStorage.setItem(k,JSON.stringify(s[k]))); } },seed);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
  const open=async name=>{ const IDX=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),name); await p.evaluate(i=>show(i),IDX); await sleep(1500); return (await (await p.$$('iframe'))[IDX].contentFrame()); };

  console.log('— کنترل قرائت');
  let fr=await open('دفترچه قرائت');
  await fr.evaluate(()=>{ const f=document.getElementById('fDate'); f.value='1405/07/12'; f.dispatchEvent(new Event('input')); f.dispatchEvent(new Event('change')); });
  await sleep(300);
  const typ=async(dev,v)=>{ await fr.evaluate(([d,v])=>{ const el=[...document.querySelectorAll('#list input.rv')].find(x=>x.dataset.dev===d); el.value=v; el.dispatchEvent(new Event('input')); },[dev,v]); await sleep(150); };
  const warn=dev=>fr.evaluate(d=>{ const el=[...document.querySelectorAll('#list input.rv')].find(x=>x.dataset.dev===d); const w=el.closest('.dev').querySelector('.rchk'); return w?w.innerText:''; },dev);
  const sv=dev=>fr.evaluate(d=>[...document.querySelectorAll('#list .sv')].find(x=>x.dataset.dev===d).click(),dev);
  const stored=dev=>p.evaluate(d=>JSON.parse(localStorage.nt_daftar_v1).filter(x=>x.dev===d&&x.date==='1405/07/12').map(x=>x.val),dev);
  await typ('لودر ZL50','15000'); ok(/کمتر از قرائت قبلی/.test(await warn('لودر ZL50')),'کمتر از قبلی: هشدار');
  await typ('لودر ZL50','16030'); ok(await warn('لودر ZL50')==='','۳۰ ساعت در ۲ روز: بدون هشدار');
  await typ('لودر ZL50','16300'); ok(/بیشتر از قرائت بعدی/.test(await warn('لودر ZL50')),'بیشتر از قرائت تاریخ بعد: هشدار');
  await typ('لودر ZL50','16100'); ok(/۱۰۰ ساعت در ۲ روز/.test(await warn('لودر ZL50')),'۱۰۰ ساعت در ۲ روز: هشدار — '+await warn('لودر ZL50'));
  await sv('لودر ZL50'); await sleep(200);
  ok((await stored('لودر ZL50')).length===0,'ضربه اول روی «ذخیره»: ذخیره نشد');
  await sv('لودر ZL50'); await sleep(300);
  ok((await stored('لودر ZL50'))[0]===16100,'ضربه دوم: ذخیره شد (مثلاً کنتور عوض شده)');
  await typ('کامیون TRS01','55500'); ok(await warn('کامیون TRS01')==='','کیلومتر: ۱۴۲۰ در ۲ روز بدون هشدار');
  await sv('کامیون TRS01'); await sleep(300); ok((await stored('کامیون TRS01'))[0]===55500,'قرائت درست با یک ضربه ذخیره شد');
  await typ('کامیون TRS01','5550'); ok(/کمتر/.test(await warn('کامیون TRS01')),'رقم جاافتاده: هشدار');
  await typ('لودر ZL50','15000'); try{ await (await fr.$('.dev.rbad')).screenshot({path:'/tmp/claude-0/rchk.png'}); }catch(e){}
  await typ('کامیون TRS01',''); await typ('لودر ZL50','16100');

  console.log('— توقف شیفت');
  fr=await open('توقف شیفت');
  await fr.evaluate(()=>document.getElementById('bNew').click()); await sleep(300);
  await fr.evaluate(()=>[...document.querySelectorAll('#fPick button')].find(b=>b.dataset.d==='بیل مکانیکی کوماتسو PC290').click()); await sleep(200);
  let t=await fr.evaluate(()=>document.getElementById('fLast').innerText);
  ok(/مثل دفعه قبل/.test(t) && /نبود سوخت/.test(t),'آخرین توقف همین دستگاه پیشنهاد شد: '+t.replace(/\s+/g,' '));
  ok(await fr.evaluate(()=>!window.__y && !document.querySelector('#fLast img')),'توضیح خطرناک اجرا نشد');
  try{ await (await fr.$('#fLast')).screenshot({path:'/tmp/claude-0/flast.png'}); }catch(e){ console.log('ss',e.message); }
  await fr.evaluate(()=>document.getElementById('fLastGo').click()); await sleep(200);
  ok(await fr.evaluate(()=>fCause==='نبود سوخت' && document.getElementById('fNote').value.includes('<img')),'علت و توضیح در فرم گذاشته شد');
  await fr.evaluate(()=>document.getElementById('fChange').click()); await sleep(100);
  await fr.evaluate(()=>[...document.querySelectorAll('#fPick button')].find(b=>b.dataset.d==='لودر ZL50').click()); await sleep(200);
  ok(await fr.evaluate(()=>document.getElementById('fLast').innerHTML==='') ,'دستگاه بدون سابقه: چیزی نشان داده نمی‌شود');
  await fr.evaluate(()=>document.getElementById('fClose').click());

  console.log('— ثبت مشکلات');
  fr=await open('ثبت مشکلات');
  const pickDev=async v=>{ await fr.evaluate(v=>{ const f=document.getElementById('fDev'); f.focus(); f.value=v; f.dispatchEvent(new Event('input')); },v); await sleep(200);
    await fr.evaluate(()=>{ const o=document.querySelector('#lDev .opt, #lDev [data-i], #lDev div'); if(o){ o.dispatchEvent(new MouseEvent('mousedown',{bubbles:true})); o.click(); } }); await sleep(400); };
  await pickDev('ZL50');
  ok(await fr.evaluate(()=>cDev.value()==='لودر ZL50'),'دستگاه انتخاب شد');
  t=await fr.evaluate(()=>document.getElementById('mkLast').innerText);
  ok(/۱ خرابی باز/.test(t) && /استارت نمی‌زند/.test(t),'هشدار خرابی باز: '+t.replace(/\s+/g,' ').slice(0,90));
  ok(/مثل دفعه قبل/.test(t),'دکمه «مثل دفعه قبل» هست');
  try{ await fr.evaluate(()=>{ const b=document.getElementById('bNew')||document.querySelector('.btn-new'); }); await (await fr.$('#mkLast')).evaluate(e=>e.closest('.field').scrollIntoView()); await (await fr.$('#mkLast')).evaluate(e=>e.closest('.field').parentElement.style.background='#fff'); await (await fr.$('#mkLast')).screenshot({path:'/tmp/claude-0/mklast.png'}); }catch(e){ console.log('ss',e.message); }
  await fr.evaluate(()=>document.getElementById('mkLastGo').click()); await sleep(200);
  ok(await fr.evaluate(()=>document.getElementById('fSys').value==='سیستم برقی' && document.getElementById('fDesc').value==='استارت نمی‌زند' && document.getElementById('fSev').value==='بحرانی'),'سیستم، شرح و شدت پر شد');
  await fr.evaluate(()=>document.getElementById('mkOpenEd').click()); await sleep(300);
  ok(await fr.evaluate(()=>editIdx!==null && document.getElementById('mkLast').innerHTML===''),'«ویرایش همان خرابی» فرم ویرایش را باز کرد');
  await fr.evaluate(()=>{ try{ stopEdit(); clearForm(); }catch(e){} });
  await pickDev('TRS02'); await sleep(200);
  ok(await fr.evaluate(()=>!window.__x && !document.querySelector('#mkLast img') && !/باز/.test(document.getElementById('mkLast').querySelector('.openw')?'باز':'')),'متن خطرناک اجرا نشد و خرابی بسته هشدار ندارد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
