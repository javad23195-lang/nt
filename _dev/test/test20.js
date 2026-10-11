// لیست برون‌سپاری: ثبت، مراحل، پیش‌نیاز، دیرکرد، برگه سندپرداز، کارت «امروز»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>{ errs.push('dialog'); d.dismiss(); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='برون‌سپاری'));
  ok(IDX===9,'زبانه «برون‌سپاری» هست (شماره '+IDX+')');
  const inn=(fn,a)=>p.evaluate(([f,a])=>{ const d=frames[f[0]].contentDocument, w=frames[f[0]].contentWindow; return (new Function('d','w','a','return ('+f[1]+')(d,w,a)'))(d,w,a); },[[IDX,fn],a]);
  await p.evaluate(i=>show(i),IDX);
  await p.waitForFunction(i=>{ try{ return frames[i].contentDocument.getElementById('oNew'); }catch(e){ return false; } },IDX,{timeout:15000}); await sleep(300);
  const click=async(id)=>{ await inn('(d,w,a)=>d.getElementById(a).click()',id); await sleep(250); };
  const val=async(id,v)=>{ await inn('(d,w,a)=>{ const e=d.getElementById(a[0]); e.value=a[1]; e.dispatchEvent(new Event("input",{bubbles:true})); }',[id,v]); };
  const jobs=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('nt_outsrc_v1')||'[]'));
  const body=()=>inn('(d)=>d.getElementById("list").innerText.replace(/\\s+/g," ")');

  console.log('1) خالی و فرم');
  ok(/کار باز نیست/.test(await body()),'لیست خالی پیام دارد');
  await click('oNew'); await click('fSave');
  ok(/دستگاه را بنویسید/.test(await inn('(d)=>d.getElementById("fErr").textContent')) && (await jobs()).length===0,'فرم خالی رد شد');
  // توقف خرابی نمونه برای دستگاه
  await p.evaluate(()=>{ const k=todayKey(); const o={}; o[k+'|صبح']={stops:[{id:'s1',dev:'کامیون TRS01',from:'08:10',to:'09:40',cause:'خرابی موتور',note:'',by:''}]}; localStorage.setItem('nt_tavaqof_v1',JSON.stringify(o)); });
  await val('fDev','کامیون TRS01');
  ok(/آخرین خرابی ثبت‌شده/.test(await inn('(d)=>d.getElementById("hStop").textContent')) && await inn('(d)=>d.getElementById("fBt").value')==='08:10','ساعت خرابی از «توقف شیفت» پیشنهاد شد');
  await val('fVen','تعمیرکار نمونه'); await val('fDesc','تعمیر پمپ هیدرولیک'); await val('fWs','۱۴۰۵/۱۳/۴۰'); await click('fSave');
  ok(/تاریخ را مثل/.test(await inn('(d)=>d.getElementById("fErr").textContent')),'تاریخ نادرست رد شد');
  await val('fWs','۱۴۰۵/۰۱/۱۰'); await click('fSave');
  let J=await jobs(); ok(J.length===1 && J[0].dev==='کامیون TRS01' && J[0].ven==='تعمیرکار نمونه' && J[0].ws==='1405/01/10' && J[0].id,'کار ذخیره شد، تاریخ فارسی به انگلیسی درست شد');
  ok(/تعمیرکار نمونه/.test(await body()) && /۰ از ۶ مرحله/.test(await body()),'کارت دیده می‌شود: ۰ از ۶');

  console.log('2) مرحله‌ها و پیش‌نیاز');
  const st=k=>click_st(k);
  async function click_st(k){ await inn('(d,w,a)=>d.querySelector(\'[data-st="\'+a+\'"]\').click()',k); await sleep(250); }
  const dis=k=>inn('(d,w,a)=>d.querySelector(\'[data-st="\'+a+\'"]\').disabled',k);
  ok(await dis('chk') && await dis('fin'),'مرحله‌های بعدی تا ثبت مرحله قبل بسته است');
  await st('ann'); J=await jobs(); ok(/^\d{4}\/\d{2}\/\d{2}$/.test((J[0].steps||{}).ann||''),'«اعلام خرابی» با تاریخ امروز ثبت شد');
  await st('chk'); J=await jobs();
  ok(!(J[0].steps||{}).chk && await inn('(d)=>d.getElementById("dlg").classList.contains("on")'),'«بررسی» بدون کد علت و فعالیت ثبت نشد و فرم باز شد');
  await val('fCause','C12'); await val('fAct','A07'); await click('fSave'); await st('chk');
  J=await jobs(); ok(!!(J[0].steps||{}).chk,'با کد علت و فعالیت، «بررسی» ثبت شد');
  await st('ord'); J=await jobs(); ok(!(J[0].steps||{}).ord,'«دستور تعمیر» بدون کد خدمات ثبت نشد');
  await val('fSvc','N034'); await click('fSave'); await st('ord'); await st('snd');
  J=await jobs(); ok(!!J[0].steps.ord && !!J[0].steps.snd,'کد خدمات → دستور و ارسال ثبت شد');
  await st('ann'); J=await jobs(); ok(!!J[0].steps.ann,'برداشتن مرحله وسط وقتی بعدی‌ها ثبت است، رد شد');

  console.log('3) دیرکرد و کارت «امروز»');
  ok(/روز دیرکرد/.test(await body()) && await inn('(d)=>!!d.querySelector(".jb.od")'),'شروع کار قدیمی → «دیرکرد» قرمز');
  await p.evaluate(()=>show(0)); await sleep(1500);
  const tc=await p.evaluate(()=>{ const d=frames[0].contentDocument, b=d.getElementById('osCard'); return b&&!b.hidden?b.innerText.replace(/\s+/g,' '):''; });
  ok(/فاکتور برون‌سپاری/.test(tc) && /کامیون TRS01/.test(tc) && /دیرکرد/.test(tc) && /قدم بعد: گزارش/.test(tc),'کارت «امروز»: '+tc.slice(0,120));
  ok(await p.evaluate(()=>{ const e=document.getElementById('badge'+DOCS.findIndex(d=>d.name==='برون‌سپاری')); return !e || e.textContent.replace(/[^\d۰-۹]/g,'').length>0; }),'نشان تعداد روی زبانه');
  await p.evaluate(i=>show(i),IDX); await sleep(500);

  console.log('4) برگه سندپرداز و پایان');
  await inn('(d)=>d.querySelector(\'[data-a="sheet"]\').click()'); await sleep(250);
  const sh=await inn('(d)=>d.querySelector(".sheet").innerText.replace(/\\s+/g," ")');
  ok(/N034/.test(sh) && /C12/.test(sh) && /A07/.test(sh) && /تعمیرکار نمونه/.test(sh) && /ننوشته‌اید/.test(sh),'برگه: کدها هست، فیلد خالی «ننوشته‌اید»');
  ok(await inn('(d)=>[...d.querySelectorAll("[data-copy]")].some(b=>b.dataset.copy==="N034")'),'دکمه کپی مقدار انگلیسی دارد');
  await inn('(d)=>d.querySelector(\'[data-a="edit"]\').click()'); await sleep(200);
  await val('fWe','1405/01/12'); await val('fAmt','12,500,000'); await val('fInv','F-1'); await click('fSave');
  await st('rep'); await st('fin'); J=await jobs();
  ok(J[0].amt==='12500000' && !!J[0].steps.rep && !!J[0].steps.fin,'پایان کار، مبلغ و فاکتور ثبت شد (مبلغ بدون ویرگول)');
  ok(/کار باز نیست/.test(await body()),'کار تمام‌شده از «باز» رفت');
  await inn('(d)=>d.querySelectorAll("#seg button")[1].click()'); await sleep(200);
  ok(/۶ از ۶ مرحله/.test(await body()) && !/روز دیرکرد/.test(await body()),'در «همه» می‌ماند، بدون دیرکرد');
  await p.evaluate(()=>show(0)); await sleep(1300);
  ok(await p.evaluate(()=>{ const b=frames[0].contentDocument.getElementById('osCard'); return !b || b.hidden; }),'کارت «امروز» وقتی کار بازی نیست پنهان شد');

  console.log('5) امنیت: متن خطرناک و حذف');
  await p.evaluate(i=>show(i),IDX); await sleep(300);
  await click('oNew'); await val('fDev','<img src=x onerror=window.__x=1>'); await val('fVen','"><b>پ</b>'); await val('fDesc','<script>window.__y=1</script>'); await click('fSave');
  ok(await inn('(w)=>!w.__x && !w.__y && !document.querySelector("#list img,#list script")')===true || await inn('(d,w)=>!w.__x && !w.__y && !d.querySelector("#list img,#list script,#list b")'),'متن خطرناک در صفحه اجرا نشد');
  await inn('(d)=>d.querySelectorAll("#seg button")[0].click()');
  const before=(await jobs()).length;
  await inn('(d)=>d.querySelector(\'[data-a="del"]\').click()'); await sleep(200);
  ok((await jobs()).length===before,'حذف با یک ضربه انجام نمی‌شود');
  await inn('(d)=>d.querySelector(\'[data-a="del"]\').click()'); await sleep(200);
  ok((await jobs()).length===before-1,'ضربه دوم حذف می‌کند');

  console.log('6) دسترسی');
  const acl=await p.evaluate(()=>{ try{ return {k:Object.keys(ntSync).join(),see:ntSync.canSee('برون‌سپاری')}; }catch(e){ return String(e); } });
  ok(acl && acl.see===true,'مدیر زبانه را می‌بیند');
  ok(errs.length===0,'بدون خطا'+(errs.length?': '+errs.join(' | ').slice(0,200):''));
  await br.close(); web.close(); console.log(fails?'\n'+fails+' شکست':'\nهمه موفق'); process.exit(fails?1:0);
})();
