// سند خرید: خرید ناقص (بقیه در سند می‌ماند) و «عدم تایید»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const R=(item,qty,d2,x)=>Object.assign({date:'1405/07/20',unit:'بیل مکانیکی کوماتسو PC290',item,u:'عدد',qty,bought:'',desc:'',d1:'10',d2,pri:'مهم',buy:'',req:'',apr:'',over:'',note:''},x||{});
    localStorage.setItem('nt_kharid9_v1',JSON.stringify({row:5,rows:[
      R('گردگیر پین',4,'702',{apr:'تایید شده',over:'در انتظار خرید'}),R('سینی آب',1,'702',{apr:'تایید شده',over:'در انتظار خرید'}),
      R('فیلتر هوا',2,'703'),R('<img src=x onerror=window.__x=1>',1,'703')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='درخواست خرید'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const fr=await (await p.$$('iframe'))[IDX].contentFrame();
  await fr.evaluate(()=>{ try{ kPaneSet('flow'); }catch(e){} try{ flowRender(); }catch(e){} });
  const card=k=>`#flowList .fdoc[data-k="${k}"]`;
  // ۱) خرید ناقص: ۲ از ۴
  await fr.evaluate(c=>{ const d=document.querySelector(c); const rows=[...d.querySelectorAll('.fr')]; const r=rows.find(x=>/گردگیر/.test(x.textContent));
    const cb=r.querySelector('.fck'); cb.checked=true; cb.dispatchEvent(new Event('change')); const q=r.querySelector('.fqr'); q.value='2'; q.dispatchEvent(new Event('input')); },card('702'));
  await fr.click(card('702')+' .fnext'); await sleep(400);
  let L=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_kharid9_v1'))).rows;
  const g=L.filter(r=>r.item==='گردگیر پین');
  ok(g.length===2,'گردگیر: دو ردیف (خریده + مانده)');
  ok(g.some(r=>r.qty===2&&+r.bought===2) && g.some(r=>r.qty===2&&!r.bought&&r.over==='در انتظار خرید'),'۲ خریده شد، ۲ در انتظار خرید ماند');
  ok(g[0].spl && g[0].spl===g[1].spl,'دو تکه به هم وصل‌اند (spl)');
  const inn=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_anbar_in_v1'))||'{}').rows||[];
  ok(inn.length===1 && inn[0].qty===2,'ورود انبار: فقط ۲ عدد');
  const pend=await fr.evaluate(c=>[...document.querySelectorAll(c+' .fr:not(.done) .nm')].map(x=>x.textContent),card('702'));
  ok(pend.some(t=>/گردگیر/.test(t)) && pend.some(t=>/سینی/.test(t)),'سند ۷۰۲ هنوز باز است: گردگیر (مانده) و سینی — '+pend.join('، '));
  ok(await fr.evaluate(()=>{ const b=document.getElementById('kDupBar'); return !b||b.hidden; }),'نوار «ردیف تکراری» تکه‌ها را تکراری نمی‌شمارد');
  // ۲) عدم تایید سند ۷۰۳
  ok(await fr.evaluate(c=>!!document.querySelector(c+' .frej'),card('703')),'سند در مرحله منصوری: دکمه «عدم تایید»');
  ok(await fr.evaluate(c=>!document.querySelector(c+' .frej'),card('702')),'سند در مرحله خرید: «عدم تایید» نیست');
  await fr.click(card('703')+' .frej'); await sleep(150);
  L=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_kharid9_v1'))).rows;
  ok(!L.some(r=>r.rej),'ضربه اول فقط آماده می‌کند');
  await fr.click(card('703')+' .frej'); await sleep(400);
  L=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_kharid9_v1'))).rows;
  const r3=L.filter(r=>r.d2==='703');
  ok(r3.length===2 && r3.every(r=>r.rej==='منصوری' && r.over==='لغو شد'),'سند ۷۰۳: عدم تایید مهندس منصوری (لغو شد)');
  ok(await fr.evaluate(c=>!document.querySelector(c),card('703')),'سند ردشده از سندهای باز رفت');
  await fr.click('#flowDoneBtn'); await sleep(300);
  ok(/عدم تایید — مهندس منصوری/.test(await fr.evaluate(c=>document.querySelector(c).innerText,card('703'))),'در «سند بسته»: «عدم تایید — مهندس منصوری»');
  await fr.click(card('703')+' .funrej'); await sleep(400);
  L=JSON.parse(await p.evaluate(()=>localStorage.getItem('nt_kharid9_v1'))).rows;
  ok(L.filter(r=>r.d2==='703').every(r=>!r.rej && r.over==='' && !r.apr),'برگرداندن: دوباره در انتظار تایید منصوری');
  ok(await fr.evaluate(c=>!!document.querySelector(c+' .frej'),card('703')),'سند دوباره باز است');
  ok(await fr.evaluate((w)=>!window.__x && !document.querySelector('#flowList img[src=x]')),'متن خطرناک اجرا نشد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
