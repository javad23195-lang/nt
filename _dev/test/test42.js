// امروز: کارت‌های عددی (توقف ماه، سرویس گذشته، هزینه ماه، خرابی باز)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=ago=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()-ago*864e5)); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; };
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const seed={
    nt_tavaqof_v1:{[J(0)+'|صبح']:{stops:[{id:'a',dev:'لودر ZL50',from:'08:00',to:'09:00',cause:'خرابی موتور'}]},[J(31)+'|صبح']:{stops:[{id:'b',dev:'لودر ZL50',from:'08:00',to:'10:00',cause:'خرابی موتور'}]}},
    nt_svc_v1:[{id:'s1',dev:'لودر ZL50',name:'روغن موتور',every:115,last:14000,ld:J(5),months:12},{id:'s2',dev:'لودر ZL50',name:'فیلتر آب',every:500,last:14100,ld:J(5),months:12}],
    nt_daftar_v1:[{dev:'لودر ZL50',unit:'ساعت',val:14560,date:J(1)}],
    nt_sh8_v1:{rows:[{dev:'کاپرا',st:J(0),costA:'10000000',hasA:true},{dev:'کاپرا',st:J(31),costA:'20000000',hasA:true}]},
    nt_moshkel_v1:{row:5,rows:[{dev:'لودر ZL50',desc:'a',state:'باز'},{dev:'کاپرا',desc:'b',state:'در حال اقدام'},{dev:'<img src=x onerror=window.__x=1>',desc:'c',state:'بسته'}]}};
  for(const [w,h] of [[1920,1080],[412,900]]){
    const c=await br.newContext({locale:'fa-IR',viewport:{width:w,height:h}});
    await c.addInitScript(s=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(s).forEach(k=>localStorage.setItem(k,JSON.stringify(s[k]))); } },seed);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
    await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(2500);
    await p.evaluate(()=>window.postMessage({nt:'go',tab:'مدیریت'},'*')); await sleep(1500);
    const MI=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='مدیریت'));
    const fr=(await (await p.$$('iframe'))[MI].contentFrame());
    const K=await fr.evaluate(()=>{ try{ atRender(); }catch(e){} return [...document.querySelectorAll('#kpis .kp')].map(b=>({t:b.innerText.replace(/\s+/g,' '),r:b.getBoundingClientRect().top})); });
    console.log(w+'px');
    ok(K.length===4,'چهار کارت');
    if(K.length===4){
      ok(/توقف این ماه ۱ ساعت ▼[۰-۹]+٪/.test(K[0].t),'توقف: ۱ ساعت، کمتر از ماه قبل (استراحت کم شده) — '+K[0].t);
      ok(/سرویس گذشته ۱ دستگاه ZL50، ۱ سرویس نزدیک/.test(K[1].t),'سرویس: ۱ گذشته، ۱ نزدیک — '+K[1].t);
      ok(/هزینه تعمیر این ماه ۱۰ میلیون ▼۵۰٪/.test(K[2].t),'هزینه: ۱۰ میلیون، ▼۵۰٪ — '+K[2].t);
      ok(/خرابی باز ۲ مورد ۱ در حال اقدام/.test(K[3].t),'خرابی باز: ۲، ۱ در حال اقدام — '+K[3].t);
      ok(new Set(K.map(x=>Math.round(x.r))).size===(w>=700?1:2),w>=700?'چهار کارت در یک ردیف':'دو کارت در هر ردیف');
    }
    if(w===1920){ ok(await fr.evaluate(()=>getComputedStyle(document.getElementById('atCard')).display==='none'),'مدیریت: «نیاز به توجه» نیست'); }
    ok(await fr.evaluate(()=>!window.__x && !document.querySelector('#kpis img')),'متن خطرناک اجرا نشد');
    await p.screenshot({path:`/tmp/claude-0/k${w}.png`});
    await fr.evaluate(()=>[...document.querySelectorAll('#kpis .kp')].find(b=>b.dataset.go==='ثبت مشکلات').click()); await sleep(800);
    ok(await p.evaluate(()=>DOCS[tabs.findIndex(t=>t.classList.contains('on'))].name)==='ثبت مشکلات','زدن کارت «خرابی باز» زبانه «ثبت مشکلات» را باز کرد');
    ok(errs.length===0,'بدون خطا '+errs.join('|')); await c.close();
  }
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
