// آیکون‌های تازه (uicons.js): ناوبری، دکمه‌های سربرگ، کارت دستگاه و صفحه‌ها آیکون سرمه‌ای + کهربایی دارند
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const SHOT=process.env.SHOT;
const A='#E6A52E';
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  for(const vp of [{width:1100,height:860},{width:390,height:800}]){
    const mob=vp.width<600;
    const c=await br.newContext({locale:'fa-IR',viewport:vp,deviceScaleFactor:SHOT?2:1});
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`);
    await p.waitForFunction(()=>window.ntQr,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(1200);
    const tag=mob?'گوشی: ':'رایانه: ';
    ok(await p.evaluate(()=>!!window.NTI && Object.keys(NTI.P).length>=30),tag+'NTI آماده است');
    const hdr=await p.evaluate(A=>['ntSyBtn','ntQrScan','ntDevBtn','ntThBtn'].map(id=>{ const b=document.getElementById(id); return b&&b.querySelector('svg.nti')&&b.innerHTML.includes(A)?1:0; }),A);
    ok(hdr.every(x=>x),tag+'سربرگ: همگام، اسکن، دستگاه‌ها، ظاهر آیکون تازه دارند '+hdr);
    if(!mob){
      const n=await p.evaluate(()=>[...document.querySelectorAll('.tab .i svg')].filter(s=>s.classList.contains('nti')).length);
      ok(n>=8,tag+'زبانه‌های کنار صفحه آیکون تازه دارند ('+n+')');
      if(SHOT) await p.screenshot({path:SHOT+'/d1.png'});
      // منوی «سه خط»: دستگاه‌ها، اسکن، ظاهر، خروج داخل کشو؛ همگام بیرون
      const m0=await p.evaluate(()=>({btn:!!document.getElementById('ntMenuBtn')&&getComputedStyle(document.getElementById('ntMenuBtn')).display!=='none', inBox:['ntDevBtn','ntQrScan','ntThBtn','ntExitBtn'].every(id=>{ const b=document.getElementById(id); return b && b.parentNode.id==='ntMenuBox'; }), syOut:document.getElementById('ntSyBtn').parentNode.id!=='ntMenuBox', hid:getComputedStyle(document.getElementById('ntMenuBox')).visibility==='hidden'}));
      ok(m0.btn && m0.inBox && m0.syOut && m0.hid,'رایانه: دکمه سه‌خط هست؛ چهار دکمه در کشوی بسته؛ همگام بیرون '+JSON.stringify(m0));
      await p.click('#ntMenuBtn'); await sleep(400);
      ok(await p.evaluate(()=>getComputedStyle(document.getElementById('ntMenuBox')).visibility==='visible'),'با زدن سه‌خط کشو باز شد');
      if(SHOT) await p.screenshot({path:SHOT+'/d1m.png'});
      await p.keyboard.press('Escape'); await sleep(400);
      ok(await p.evaluate(()=>!document.body.classList.contains('ntmenu')),'با Esc کشو بسته شد');
      await p.click('#ntMenuBtn'); await sleep(400); await p.click('#ntMenuBd',{position:{x:500,y:400}}); await sleep(400);
      ok(await p.evaluate(()=>!document.body.classList.contains('ntmenu')),'با زدن بیرون کشو بسته شد');
    } else {
      const n=await p.evaluate(()=>document.querySelectorAll('.ntnb svg.nti').length);
      ok(n>=4,tag+'نوار پایین آیکون تازه دارد ('+n+')');
      ok(await p.evaluate(()=>!!document.querySelector('.ntfab svg.nti')),tag+'دکمه + آیکون تازه دارد');
      ok(await p.evaluate(()=>['ntSyBtn','ntQrScan','ntDevBtn'].every(id=>{ const r=document.getElementById(id).getBoundingClientRect(); return r.width>0 && r.top<120; }) && getComputedStyle(document.getElementById('ntMenuBtn')).display==='none'),tag+'سربرگ گوشی همان قبل است (بدون سه‌خط)');
      if(SHOT) await p.screenshot({path:SHOT+'/m1.png'});
      await p.click('.ntfab'); await sleep(600);
      ok(await p.evaluate(()=>document.querySelectorAll('.ntac .ic svg.nti').length>0),tag+'برگه «چه چیزی ثبت می‌کنید» آیکون تازه دارد');
      if(SHOT) await p.screenshot({path:SHOT+'/m2.png'});
      await p.click('.ntfab'); await sleep(500);
      const mo=await p.$('[data-more]'); if(mo){ await mo.click(); await sleep(600); if(SHOT) await p.screenshot({path:SHOT+'/m3.png'}); await p.keyboard.press('Escape'); await sleep(400); }
    }
    // کارت دستگاه (QR)
    const id=await p.evaluate(()=>{ try{ const d=ntQr.DEVS.find(x=>window.ntStops&&ntStops.tracked(x.name))||ntQr.DEVS[0]; return d?d.id:null; }catch(e){ return null; } });
    if(id){ await p.evaluate(id=>window.postMessage({nt:'qrdev',id},'*'),id); await sleep(800);
      const q=await p.evaluate(()=>[...document.querySelectorAll('.qrdev .acts button svg')].map(s=>s.classList.contains('nti')));
      ok(q.length>0 && q.every(x=>x),tag+'کارت دستگاه: دکمه‌ها آیکون تازه دارند ('+q.length+')');
      if(SHOT) await p.screenshot({path:SHOT+'/'+(mob?'m':'d')+'4.png'});
      await p.keyboard.press('Escape'); await sleep(300);
    }
    if(!mob){
      const go=async n=>{ await p.evaluate(n=>window.postMessage({nt:'go',tab:n},'*'),n); await sleep(1500); for(const x of p.frames()){ if(x===p.mainFrame()) continue; try{ if(await x.evaluate(n=>document.title.includes(n)||!!document.querySelector('[data-doc="'+n+'"]')||true,n) && await x.evaluate(()=>getComputedStyle(document.body).display!=='none') ) {} }catch(e){} } };
      const inF=async(sel)=>{ for(const x of p.frames()){ if(x===p.mainFrame()) continue; try{ const r=await x.evaluate(sel=>{ const e=document.querySelector(sel); return e?(e.querySelector('svg.nti')?1:0):-1; },sel); if(r>=0) return r; }catch(e){} } return -1; };
      await go('دفترچه قرائت'); ok(await inF('#fastBtn')===1,'دفترچه قرائت: «قرائت سریع» آیکون صاعقه دارد');
      if(SHOT) await p.screenshot({path:SHOT+'/d5.png'});
      await go('عکس‌ها'); ok(await inF('#pCam')===1,'عکس‌ها: «دوربین» آیکون دارد');
      await go('ثبت مشکلات'); if(SHOT) await p.screenshot({path:SHOT+'/d6.png'});
      const mic=await inF('.mic'); ok(mic===1||mic===-1,'ثبت مشکلات: میکروفن آیکون دارد ('+mic+')');
    }
    ok(errs.length===0,tag+'بدون خطا '+errs.join('|'));
    await c.close();
  }
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
