// ثبت مشکلات: تابلوی خرابی‌ها (باز ← در حال اقدام ← منتظر قطعه ← بسته)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const R=(dev,desc,sev,state,extra)=>Object.assign({y:1405,m:7,d:10,mn:'مهر',dev,sys:'سیستم هیدرولیک',desc,sev,cur:'در حال کار',part:'خیر',state,fix:'',src:'دفترچه'},extra||{});
  const seed={nt_moshkel_v1:{row:5,rows:[R('لودر ZL50','نشت روغن جک','بالا','باز'),R('کامیون TRS02','ترمز ضعیف','بحرانی','باز',{cur:'خوابیده'}),R('بیل PC290','لرزش گردان','متوسط','در حال اقدام'),
    R('کاپرا','باد لاستیک','پایین','بسته',{fix:'1405/07/12'}),R('<img src=x onerror=window.__x=1>','<b>x</b>','متوسط','باز')]}};
  for(const [w,h] of [[1920,1080],[412,900]]){
    const c=await br.newContext({locale:'fa-IR',viewport:{width:w,height:h}});
    await c.addInitScript(s=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); Object.keys(s).forEach(k=>localStorage.setItem(k,JSON.stringify(s[k]))); } },seed);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
    await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
    const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='ثبت مشکلات')); await p.evaluate(i=>show(i),IDX); await sleep(1500);
    const fr=(await (await p.$$('iframe'))[IDX].contentFrame());
    console.log(w+'px');
    await fr.evaluate(()=>document.getElementById('vwBoard').click()); await sleep(300);
    const cols=()=>fr.evaluate(()=>[...document.querySelectorAll('#board .bcol')].map(c=>({h:c.querySelector('h3').innerText.replace(/\s+/g,' '),n:c.querySelectorAll('.bcard').length})));
    let C=await cols();
    ok(C.length===4 && /^باز ۳/.test(C[0].h) && /در حال اقدام ۱/.test(C[1].h) && /منتظر قطعه ۰/.test(C[2].h) && /بسته ۱/.test(C[3].h),'چهار ستون با شمارش درست — '+C.map(x=>x.h).join(' | '));
    ok(await fr.evaluate(()=>getComputedStyle(document.querySelector('.cols')).display==='none'),'در نمای تابلو، فرم و فهرست پنهان است');
    ok(await fr.evaluate(()=>document.querySelector('.b-open .bcard .bt b').textContent)==='کامیون TRS02','بحرانی اول ستون');
    ok(await fr.evaluate(()=>!window.__x && !document.querySelector('#board img,#board .bd b')),'متن خطرناک اجرا نشد');
    await p.screenshot({path:`/tmp/claude-0/b${w}.png`});
    if(w===1920){
      const card=dev=>fr.evaluate(d=>[...document.querySelectorAll('.bcard')].find(c=>c.querySelector('.bt b').textContent===d).dataset.i,dev);
      const click=async(dev,sel)=>{ await fr.evaluate(([d,s])=>[...document.querySelectorAll('.bcard')].find(c=>c.querySelector('.bt b').textContent===d).querySelector(s).click(),[dev,sel]); await sleep(200); };
      const row=dev=>p.evaluate(d=>JSON.parse(localStorage.nt_moshkel_v1).rows.find(r=>r.dev===d),dev);
      await click('لودر ZL50','.bnext'); ok((await row('لودر ZL50')).state==='در حال اقدام','باز ← در حال اقدام');
      await click('لودر ZL50','.bnext'); let r=await row('لودر ZL50'); ok(r.state==='منتظر قطعه' && r.part==='بله','← منتظر قطعه (نیاز به قطعه = بله)');
      const tsv=await fr.evaluate(()=>document.getElementById('outBox').value.split('\n').find(l=>l.includes('لودر ZL50')).split('\t'));
      ok(tsv[15]==='در حال اقدام' && tsv[11]==='بله','اکسل: «در حال اقدام» و «بله» (فهرست اکسل عوض نمی‌شود)');
      await click('لودر ZL50','.bnext'); r=await row('لودر ZL50'); const T=await fr.evaluate(()=>TODAY); ok(r.state==='بسته' && r.fix===T,'← بسته (تاریخ رفع = امروز)');
      await click('لودر ZL50','.bprev'); r=await row('لودر ZL50'); ok(r.state==='منتظر قطعه' && !r.fix,'برگرداندن از بسته: تاریخ رفع پاک شد');
      C=await cols(); ok(/منتظر قطعه ۱/.test(C[2].h),'ستون «منتظر قطعه»: ۱');
      await click('بیل PC290','.bed'); ok(await fr.evaluate(()=>!document.body.classList.contains('bview') && document.getElementById('bAdd').textContent.includes('ذخیره')),'✎: به فرم ویرایش رفت');
      await fr.evaluate(()=>document.getElementById('vwBoard').click()); await fr.evaluate(()=>document.getElementById('xNew').click()); await sleep(200);
      ok(await fr.evaluate(()=>!document.body.classList.contains('bview') && getComputedStyle(document.querySelector('.cols')).display!=='none'),'«مشکل تازه» در نمای تابلو: فرم باز شد');
      await fr.evaluate(()=>document.getElementById('vwBoard').click()); await p.reload(); await p.waitForFunction(()=>window.ntSync&&window.ntNav); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} });
      await p.evaluate(i=>show(i),IDX); await sleep(1500); const f2=(await (await p.$$('iframe'))[IDX].contentFrame());
      ok(await f2.evaluate(()=>document.body.classList.contains('bview')),'نمای تابلو به یاد ماند');
    }else{
      const sc=await fr.evaluate(()=>{ const b=document.getElementById('board'); return {sw:b.scrollWidth,cw:b.clientWidth,colw:Math.round(document.querySelector('.bcol').getBoundingClientRect().width)}; });
      ok(sc.sw>sc.cw && sc.colw>300,'گوشی: ستون‌ها افقی ورق می‌خورند ('+JSON.stringify(sc)+')');
    }
    ok(errs.length===0,'بدون خطا '+errs.join('|')); await c.close();
  }
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
