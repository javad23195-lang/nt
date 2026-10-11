// کد QR دستگاه‌ها: صفحه دستگاه، ثبت قرائت/توقف/مشکل، دسترسی، همگام‌سازی، چاپ برچسب و اسکن با دوربین — داخل خود سامانه
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path'), os=require('os');
const {execFileSync}=require('child_process'); const jsQR=require('jsqr'); const {PNG}=require('pngjs');
const {make}=require('./fakegh.js');
const ROOT=path.join(__dirname,'..','..');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const JT=(()=>{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; })();
(async()=>{
  const {S,srv}=make(); await new Promise(r=>srv.listen(0,r));
  const libHits=[];
  const web=http.createServer((q,r)=>{ const u=decodeURIComponent(q.url.split('?')[0]);
    const m=/\/lib\/([\w.\-]+)$/.exec(u); if(m){ libHits.push(m[1]); try{ const b=fs.readFileSync(path.join(ROOT,'lib',m[1])); r.writeHead(200,{'Content-Type':'text/javascript'}); r.end(b); }catch(e){ r.writeHead(404); r.end(); } return; }
    r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const BASE=`http://localhost:${web.address().port}/nt/s.html`;
  const TT={deb:300,gap:500,maxWait:2000,tick:200,poll:1500,pollW:800,busy:1500,maxDefer:8000,refocus:0,retry:1000,squash:30,seen:60000,seenMin:300};
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  async function ctx(seed,url,opt){
    const c=await (opt&&opt.browser||br).newContext(Object.assign({locale:'fa-IR',viewport:{width:400,height:820}},opt&&opt.ctx||{}));
    await c.addInitScript(([api,T,seed])=>{ window.NTSYNC_TEST={api,raw:api,T};
      if(seed && !localStorage.getItem('__seed')){ localStorage.setItem('__seed','1'); Object.keys(seed).forEach(k=>localStorage.setItem(k,seed[k])); } },[`http://localhost:${srv.address().port}`,TT,seed||null]);
    const p=await c.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
    await p.goto(url||BASE); await p.waitForFunction(()=>window.ntSync); return p;
  }
  const settle=async p=>{ await sleep(1100); await p.waitForFunction(()=>typeof ntBooted!=='undefined' && ntBooted,null,{timeout:15000}); await sleep(300); };
  const ls=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);
  const J=async(p,k)=>JSON.parse(await ls(p,k)||'null');
  const dlgText=p=>p.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); return d.hidden?'':d.innerText; });
  const qrText=p=>p.evaluate(()=>{ const d=document.getElementById('ntQrDlg'); return d && !d.hidden?d.innerText:''; });
  const waitFor=async(fn,ms=12000)=>{ const t=Date.now(); while(Date.now()-t<ms){ try{ if(await fn()) return true; }catch(e){} await sleep(100); } return false; };
  const synced=async p=>{ const s=JSON.parse(await ls(p,'ntsync_state_v1')||'{}'); return s.sha===S.tags['nt-data'] && s.hash===await p.evaluate(()=>ntSync.hashOf(ntSync.outgoing(ntSync.collect(),ntSync.baseGet()||{}))); };

  console.log('1) مدیر: برگه برچسب‌ها');
  const A=await ctx({nt_daftar_v1:JSON.stringify([{dev:'لودر ZL50',unit:'ساعت',val:15094,date:'1405/07/01'}])});
  await A.waitForFunction(()=>window.ntLocked===false); await A.click('#ntSyBtn'); if(await A.locator('#syOther').count()) await A.click('#syOther');
  await A.waitForSelector('#syTok'); await A.fill('#syTok',S.goodToken); await A.fill('#syP1','mine1405'); await A.fill('#syP2','mine1405'); await A.click('#syStartW');
  await waitFor(()=>!!S.tags['nt-data']); await settle(A); await A.evaluate(()=>{ const d=document.getElementById('ntSyDlg'); if(!d.hidden){ const b=document.getElementById('syClose'); if(b) b.click(); } });
  ok(await A.locator('#ntQrScan').isVisible(),'دکمه «اسکن» کنار «اطلاعات مشترک» هست');
  await A.evaluate(()=>show(0)); await A.frameLocator('iframe.on').locator('#qrLabels').click();
  await waitFor(async()=>(await qrText(A)).includes('چاپ برچسب'));
  ok((await A.locator('#ntQrBody input[data-id]').count())===17,'۱۷ دستگاه (بدون ژنراتور کامینز 17KVA)');
  ok(!(await qrText(A)).includes('17KVA'),'ژنراتور کامینز 17 کاوا در فهرست نیست');
  ok(libHits.length===0,'هنوز هیچ کتابخانه‌ای بارگذاری نشده');
  await A.evaluate(()=>{ window.print=()=>{}; }); await A.uncheck('#qrAll'); await A.check('#ntQrBody input[data-id="ZL50"]'); await A.check('#ntQrBody input[data-id="PC290"]');
  await A.click('#qrPrint'); await waitFor(()=>A.evaluate(()=>!!window.__ntQrLast));
  ok(libHits.includes('qrcode.js'),'کتابخانه QR از همان سایت بارگذاری شد');
  const sheetHtml=await A.evaluate(()=>window.__ntQrLast);
  ok((sheetHtml.match(/<svg/g)||[]).length===2 && sheetHtml.includes('لودر ZL50') && sheetHtml.includes('size:A4'),'برگه A4 با ۲ برچسب انتخاب‌شده');
  ok(!/github_pat|mine1405|GOOD/.test(sheetHtml),'هیچ رمز یا کلیدی در برگه برچسب نیست');
  // خواندن کد چاپ‌شده با یک کدخوان جدا
  const P=await (await br.newContext({viewport:{width:800,height:1100}})).newPage(); await P.setContent(sheetHtml); await sleep(200);
  const png=PNG.sync.read(await P.locator('.q').first().screenshot());
  const pad=new PNG({width:png.width+80,height:png.height+80}); pad.data.fill(255); PNG.bitblt(png,pad,0,0,png.width,png.height,40,40);
  const dec=jsQR(new Uint8ClampedArray(pad.data),pad.width,pad.height);
  const qtext=dec&&dec.data||'';
  ok(/#m=ZL50$/.test(qtext),'کد QR چاپ‌شده خوانده شد: '+qtext);
  fs.writeFileSync(path.join(os.tmpdir(),'qr-sheet.html'),sheetHtml);
  await P.screenshot({path:path.join(os.tmpdir(),'qr-sheet.png')});
  await A.click('#qrClose');
  // کارت کاغذی توقف
  await A.evaluate(()=>{ window.__ntQrLast=''; }); await A.frameLocator('iframe.on').locator('#qrCardsT').click();
  await waitFor(async()=>(await qrText(A)).includes('کارت کاغذی توقف'));
  ok(await A.locator('#ntQrBody input[data-id]').count()===8,'کارت توقف: فقط ۸ دستگاه تولید');
  await A.evaluate(()=>{ document.querySelectorAll('#ntQrBody input[data-id]').forEach(b=>b.checked=b.dataset.id==='TRS01'); });
  await A.click('#qrCards'); await waitFor(()=>A.evaluate(()=>!!window.__ntQrLast));
  const cardHtml=await A.evaluate(()=>window.__ntQrLast);
  ok((cardHtml.match(/class="cd"/g)||[]).length===2 && cardHtml.includes('کارت توقف — کامیون TRS01') && cardHtml.includes('<i>۵</i> خرابی لاستیک') && cardHtml.includes('<i>۱۳</i> انتظار بارگیری'),'برگه A4 با ۲ کارت TRS01 و علت‌های شماره‌دار');
  ok((cardHtml.match(/class="qq"/g)||[]).length===2 && cardHtml.includes('اضافه‌کار') && (cardHtml.match(/class="d"/g)||[]).length===6,'کارت: کد QR در هر کارت و بخش اضافه‌کار با ۳ ردیف');
  { const P2=await (await br.newContext({viewport:{width:800,height:1130}})).newPage(); await P2.setContent(cardHtml); await P2.pdf({path:path.join(os.tmpdir(),'stop-card.pdf'),format:'A4'});
    ok((await P2.pdf({format:'A4'})).toString('latin1').match(/\/Type\s*\/Page[^s]/g).length===1,'دو کارت دقیقاً در یک صفحه A4 جا می‌شود'); await P2.screenshot({path:path.join(os.tmpdir(),'stop-card.png'),fullPage:true}); }
  await A.click('#qrClose');

  console.log('2) باز شدن با لینک برچسب');
  const B=A; await B.goto(BASE+'#m=ZL50'); await settle(B);
  ok(await waitFor(async()=>(await qrText(B)).includes('لودر ZL50')),'صفحه دستگاه ZL50 باز شد');
  ok(!(await B.evaluate(()=>location.hash)),'#m از نوار آدرس پاک شد');
  let t=await qrText(B);
  ok(t.includes('۱۵,۰۹۴') && t.includes('کار می‌کند') && t.includes('مشکل باز'),'خلاصه: آخرین قرائت، وضعیت، مشکل باز');
  ok(['qrRead','qrStop','qrProb','qrHist'].every(()=>true) && await B.locator('#qrRead').count()===1 && await B.locator('#qrStop').count()===1 && await B.locator('#qrProb').count()===1,'مدیر هر چهار دکمه را دارد');

  console.log('3) ثبت قرائت');
  await B.click('#qrRead'); await B.fill('#qrVal','15000'); await B.click('#qrSave');
  ok((await B.locator('#qrMsg').innerText()).includes('کمتر است'),'عدد کمتر از قرائت قبلی → هشدار');
  await B.fill('#qrVal','۱۵۱۲۰'); await B.click('#qrSave'); await sleep(200);
  let D=await J(B,'nt_daftar_v1'); ok(D.some(x=>x.dev==='لودر ZL50' && x.val===15120 && x.date===JT && x.unit==='ساعت'),'قرائت با رقم فارسی ثبت شد (امروز، ساعت)');
  ok((await qrText(B)).includes('۱۵,۱۲۰'),'صفحه دستگاه قرائت تازه را نشان می‌دهد');
  await B.click('#qrRead'); await B.fill('#qrVal','15130'); await B.click('#qrSave'); await sleep(200);
  D=await J(B,'nt_daftar_v1'); ok(D.filter(x=>x.dev==='لودر ZL50' && x.date===JT).length===1 && D.find(x=>x.dev==='لودر ZL50'&&x.date===JT).val===15130,'قرائت دوم همان روز جای قبلی نشست');
  ok(await waitFor(()=>synced(B)),'قرائت به اطلاعات مشترک فرستاده شد');

  console.log('4) توقف');
  await B.click('#qrStop'); await B.fill('#qrFrom','9:05'); await B.click('#qrSave');
  ok((await B.locator('#qrMsg').innerText()).includes('علت'),'بدون علت ثبت نمی‌شود');
  await B.click('#ntQrBody [data-c="خرابی هیدرولیک"]'); await B.fill('#qrWho','رضا'); await B.click('#qrSave'); await sleep(200);
  let TV=await J(B,'nt_tavaqof_v1'); const ks=Object.keys(TV); const st=TV[ks[0]].stops[0];
  ok(ks.length===1 && ks[0].startsWith(JT+'|') && st.dev==='لودر ZL50' && st.from==='09:05' && st.to==='' && st.cause==='خرابی هیدرولیک' && st.by==='رضا','توقف باز ثبت شد: '+ks[0]);
  t=await qrText(B); ok(t.includes('متوقف از') && await B.locator('#qrRun').count()===1,'وضعیت «متوقف» و دکمه «پایان توقف»');
  await B.evaluate(()=>show(DOCS.findIndex(d=>d.name==='توقف شیفت'))); await sleep(600);
  ok(await waitFor(async()=>(await B.frameLocator('iframe.on').locator('#list').innerText()).includes('لودر ZL50')),'توقف در زبانه «توقف شیفت» دیده می‌شود');
  await B.evaluate(()=>ntQr.home('ZL50')); await B.click('#qrRun'); await B.fill('#qrTo','11:35'); await B.click('#qrSave'); await sleep(200);
  TV=await J(B,'nt_tavaqof_v1'); ok(TV[ks[0]].stops[0].to==='11:35' && (await qrText(B)).includes('کار می‌کند'),'پایان توقف ثبت شد');

  console.log('5) مشکل و سوابق');
  await B.click('#qrProb'); await B.selectOption('#qrSys','سیستم هیدرولیک'); await B.fill('#qrDesc','نشتی جک بازو'); await B.click('#qrSave'); await sleep(200);
  const M=await J(B,'nt_moshkel_v1'); const mr=M.rows[M.rows.length-1];
  ok(mr.dev==='لودر ZL50' && mr.sys==='سیستم هیدرولیک' && mr.state==='باز' && mr.mn && mr.y,'مشکل ثبت شد');
  ok((await qrText(B)).includes('نشتی جک بازو'),'مشکل باز در خلاصه');
  await B.evaluate(()=>show(DOCS.findIndex(d=>d.name==='ثبت مشکلات'))); await sleep(800);
  ok((await B.frameLocator('iframe.on').locator('body').innerText()).includes('نشتی جک بازو'),'مشکل در زبانه «ثبت مشکلات» دیده می‌شود');
  await B.evaluate(()=>ntQr.home('ZL50')); await B.click('#qrHist'); t=await qrText(B);
  ok(t.includes('۱۵,۱۳۰') && t.includes('خرابی هیدرولیک') && t.includes('نشتی جک بازو'),'سوابق: قرائت، توقف، مشکل');
  ok(await waitFor(()=>synced(B)),'همه ثبت‌ها فرستاده شد');

  await B.evaluate(()=>ntQr.home('KIPOR')); ok(await B.locator('#qrStop').count()===0 && await B.locator('#qrRead').count()===1,'ژنراتور (دستگاه غیر تولید): بدون دکمه توقف');
  console.log('6) کاربر محدود (استخراج: فقط توقف و قرائت)');
  await B.evaluate(()=>{ document.getElementById('ntQrDlg').hidden=true; }); await B.click('#ntSyBtn'); await B.click('#syUsers');
  await B.click('#syUNew'); await B.fill('#syUName','استخراج'); await B.click('#syUSave'); await B.waitForSelector('#syLink');
  const link=await B.inputValue('#syLink'), pin=(await B.locator('#syPinOut').innerText()).replace(/\D/g,'');
  await B.click('#syBack'); await B.click('#syBack'); await B.click('#syClose'); await waitFor(()=>synced(B));
  const X=await ctx(null,link);
  await waitFor(async()=>(await dlgText(X)).includes('رمز ۶ رقمی')); await X.fill('#syPin',pin); await X.click('#syJoin'); await settle(X);
  await X.evaluate(()=>{ location.hash='#m=zl50'; }); 
  ok(await waitFor(async()=>(await qrText(X)).includes('لودر ZL50')),'کاربر محدود: صفحه دستگاه باز شد');
  t=await qrText(X);
  ok(await X.locator('#qrRead').count()===1 && await X.locator('#qrRun,#qrStop').count()===1 && await X.locator('#qrProb').count()===0,'فقط قرائت و توقف (بدون ثبت مشکل)');
  ok(!t.includes('مشکل باز') && !t.includes('نشتی'),'مشکلات (زبانه پنهان) نشان داده نمی‌شود');
  await X.click('#qrRead'); await X.fill('#qrVal','15140'); await X.click('#qrSave'); await sleep(200);
  ok(await waitFor(()=>synced(X)),'قرائت کاربر محدود فرستاده شد');
  await B.evaluate(()=>ntSync.sync({manual:true})); 
  ok(await waitFor(async()=>((await ls(B,'nt_daftar_v1'))||'').includes('15140')),'قرائت کاربر محدود به سیستم مدیر رسید');
  await X.evaluate(()=>ntQr.home('ZL50')); await X.click('#qrHist'); t=await qrText(X);
  ok(!t.includes('خروج انبار') && !t.includes('مشکلات باز'),'سوابق کاربر محدود فقط بخش‌های مجاز');

  console.log('7) سیستم وصل‌نشده');
  const Y=await ctx(null,BASE+'#m=ZL50'); await sleep(2500);
  ok(await Y.evaluate(()=>window.ntLocked===true) && (await qrText(Y))==='','بدون اتصال: صفحه دستگاه باز نمی‌شود (قفل ورود)');

  console.log('8) اسکن با دوربین داخل سامانه');
  const pngPath=path.join(os.tmpdir(),'qr-cam.png'), y4m=path.join(os.tmpdir(),'qr-cam.y4m');
  await P.setContent(`<body style="margin:0;background:#fff;display:flex;align-items:center;justify-content:center;width:640px;height:480px"><div style="width:300px;height:300px;padding:20px;background:#fff">${sheetHtml.match(/<svg[\s\S]*?<\/svg>/)[0].replace('<svg','<svg width="300" height="300"')}</div></body>`);
  await P.setViewportSize({width:640,height:480}); await P.screenshot({path:pngPath});
  execFileSync('ffmpeg',['-y','-loglevel','error','-loop','1','-i',pngPath,'-t','3','-pix_fmt','yuv420p','-r','10',y4m]);
  const br2=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-file-for-fake-video-capture='+y4m]});
  const Z=await ctx(null,link,{browser:br2,ctx:{permissions:['camera']}});
  await waitFor(async()=>(await dlgText(Z)).includes('رمز ۶ رقمی')); await Z.fill('#syPin',pin); await Z.click('#syJoin'); await settle(Z);
  await Z.click('#ntQrScan');
  ok(await waitFor(async()=>(await qrText(Z)).includes('ثبت قرائت'),20000),'اسکن با دوربین → صفحه لودر ZL50 باز شد');
  ok(libHits.includes('html5-qrcode.min.js'),'کتابخانه اسکن از همان سایت بارگذاری شد');
  await br2.close();

  for(const p of [A,X,Y]) ok(p.errs.length===0,'بدون خطای اسکریپت '+p.errs.join(' / '));
  console.log(fails?`\n${fails} مورد ناموفق`:'\nهمه موارد موفق');
  await br.close(); web.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
