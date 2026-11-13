// طرح تازه «توقف شیفت»: کارت خلاصه، کارت هر توقف (وضعیت، ساعت)، توقف باز اول، «ثبت توقف» تکراری در گوشی پنهان
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=()=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  for(const [w,tag] of [[390,'گوشی: '],[1200,'رایانه: ']]){
    const c=await br.newContext({locale:'fa-IR',viewport:{width:w,height:900}}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
    const h=new Date().getHours(), sh=h>=6&&h<14?'صبح':(h>=14&&h<22?'عصر':'شب');
    await c.addInitScript(([k])=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1');
      localStorage.setItem('nt_tavaqof_v1',JSON.stringify({[k]:{stops:[{id:'x',dev:'لودر ZL50',from:'00:05',to:'00:35',cause:'نبود راننده'},{id:'a',dev:'بیل مکانیکی کوماتسو PC290',from:'00:10',to:'',cause:'خرابی هیدرولیک'},{id:'b',dev:'<img src=x onerror=window.__x=1>',from:'00:20',to:'',cause:'نبود راننده'}]}})); },[J()+'|'+sh]);
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} });
    const i=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='توقف شیفت')); await p.evaluate(i=>show(i),i); await sleep(1500);
    const fr=await (await p.$$('iframe'))[i].contentFrame();
    const sc=await fr.evaluate(()=>document.querySelector('.sc')?document.querySelector('.sc').innerText.replace(/\s+/g,' '):'');
    ok(/دستگاه‌های متوقف ۲/.test(sc) && /خراب ۱/.test(sc) && /منتظر ۱/.test(sc) && /راه افتاد ۱/.test(sc),tag+'کارت خلاصه: ۲ متوقف، خراب ۱، منتظر ۱، راه افتاد ۱ — '+sc);
    const cards=await fr.evaluate(()=>[...document.querySelectorAll('#list .st2')].map(a=>a.className));
    ok(cards.length===3 && /k-bad/.test(cards[0]) && /k-wa/.test(cards[1]) && /k-ok/.test(cards[2]),tag+'ترتیب: خراب، منتظر، راه‌افتاده');
    ok(await fr.evaluate(()=>document.querySelector('#list .st2.k-ok .du b').textContent==='۰:۳۰'),tag+'توقف بسته: مدت ۰:۳۰');
    const bn=await fr.evaluate(()=>getComputedStyle(document.getElementById('bNew')).display);
    ok(w<900?bn==='none':bn!=='none',tag+(w<900?'«ثبت توقف» تکراری پنهان (همان +)':'«ثبت توقف» هست'));
    await fr.click('#list .st2.k-bad [data-run]'); await sleep(300);
    ok(await fr.evaluate(()=>/دستگاه‌های متوقف ۱ /.test(document.querySelector('.sc').innerText.replace(/\s+/g,' '))),tag+'«راه افتاد»: خلاصه تازه شد');
    ok(await fr.evaluate(()=>!window.__x && !document.querySelector('#list img[src=x]')),tag+'متن خطرناک اجرا نشد');
    ok(errs.length===0,tag+'بدون خطا '+errs.join('|'));
    await c.close();
  }
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
