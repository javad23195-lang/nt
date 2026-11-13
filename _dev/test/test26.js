// ثبت مشکلات: عکس روی هر مشکل
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const mk=(dev,sys,desc)=>({y:1405,m:7,d:19,mn:'مهر',dev,sys,desc,sev:'بالا',cur:'فعال',part:'خیر',state:'باز',fix:''});
    localStorage.setItem('nt_moshkel_v1',JSON.stringify({t:Date.now(),rows:[mk('کامیون TRS02','سیستم بادی','نشتی پمپ باد'),mk('لودر ZL50','سیستم برقی','<img src=x onerror=window.__x=1>')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='ثبت مشکلات')), PI=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='عکس‌ها'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const F=(fn)=>p.evaluate(([fn,i])=>(new Function('d','w','return ('+fn+')(d,w)'))(frames[i].contentDocument,frames[i].contentWindow),[fn,IDX]);
  ok(await F('(d)=>d.querySelectorAll(".mkcam").length')===2,'هر مشکل دکمه «📷 عکس» دارد');
  ok(await F('(d)=>d.getElementById("mkCam").getAttribute("capture")==="environment"'),'دکمه مستقیم دوربین را باز می‌کند');
  const row=await F('(d)=>[...d.querySelectorAll(".slip")].findIndex(s=>/TRS02/.test(s.innerText))');
  await p.evaluate(async([i,row])=>{ const w=frames[i].contentWindow,d=frames[i].contentDocument; d.querySelectorAll('.mkcam')[row].click();
    const b=await new Promise(r=>{ const c=d.createElement('canvas'); c.width=1200;c.height=900; c.getContext('2d').fillRect(0,0,50,50); c.toBlob(r,'image/jpeg'); });
    const dt=new w.DataTransfer(); dt.items.add(new w.File([b],'c.jpg',{type:'image/jpeg'})); const inp=d.getElementById('mkCam'); inp.files=dt.files; inp.dispatchEvent(new w.Event('change',{bubbles:true})); },[IDX,row]);
  await sleep(1500);
  const ph=await p.evaluate(()=>JSON.parse(localStorage.nt_photos_v1||'[]'));
  ok(ph.length===1 && ph[0].dev==='کامیون TRS02' && ph[0].sec==='سیستم بادی' && /نشتی پمپ باد/.test(ph[0].part) && ph[0].mk,'عکس با دستگاه، سیستم و شرح مشکل ثبت شد');
  const mk=await p.evaluate(()=>JSON.parse(localStorage.nt_moshkel_v1).rows.find(r=>/TRS02/.test(r.dev)));
  ok(mk && mk.pid===ph[0].mk,'مشکل به عکس وصل شد');
  ok(/دیدن ۱ عکس/.test(await F('(d)=>d.getElementById("slips").innerText')),'روی مشکل: «دیدن ۱ عکس»');
  await F('(d)=>d.querySelector(".mkview").click()'); await sleep(1800);
  ok(await p.evaluate(()=>DOCS[active]&&DOCS[active].name)==='عکس‌ها','به زبانه «عکس‌ها» رفت');
  ok(await p.evaluate(i=>{ const d=frames[i].contentDocument; return !!d.getElementById('back') && d.querySelectorAll('.grid .th').length===1; },PI),'صفحه همان دستگاه با عکس باز شد');
  ok(await F('(d,w)=>!w.__x && !d.querySelector("#slips img[src=x]")'),'متن خطرناک اجرا نشد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
