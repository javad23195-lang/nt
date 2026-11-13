// خدمات: «ارسال برگه (عکس)»
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
    const k=todayKey().split('/').map(Number);
    const mk=(act,kind)=>({dev:'کامیون TRS02',act,part:'موتور',kind,meter:'',msrc:'',munit:'',open:'',done:'',y:k[0],m:k[1],d:k[2],mn:'',cdate:'',reason:''});
    localStorage.setItem('nt_khadamat_v1',JSON.stringify({t:Date.now(),rows:[mk('تعمیر موتور','خارجی'),mk('سرویس','داخلی')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='خدمات'));
  await p.evaluate(i=>show(i),IDX); await sleep(1500); await p.evaluate(()=>show(0)); await sleep(800); await p.evaluate(i=>show(i),IDX); await sleep(1500);
  // برگه را در صفحه تازه بگیر
  for(const kind of ['خارجی','داخلی']){
    const html=await p.evaluate(async([i,kind])=>{
      const w=frames[i].contentWindow; let got=''; w.open=()=>({document:{open(){},write(h){ got=h; },close(){}}});
      const sl=[...frames[i].contentDocument.querySelectorAll('.slip')].find(x=>!!x.querySelector('.tag.in')===(kind==='داخلی'));
      sl.querySelector('.prn').click(); await new Promise(r=>setTimeout(r,300)); return got; },[IDX,kind]);
    ok(/ntShare/.test(html)&&/ارسال برگه/.test(html),kind+': دکمه «ارسال برگه» در برگه هست');
    const q=await c.newPage(); await q.setContent(html);
    await q.evaluate(()=>{ window.__sent=null; Object.defineProperty(navigator,'canShare',{value:()=>true,configurable:true}); Object.defineProperty(navigator,'share',{value:async d=>{ window.__sent=d.files.map(f=>({n:f.name,t:f.type,s:f.size})); },configurable:true}); });
    await q.click('#shBtn'); await q.waitForFunction(()=>window.__sent,null,{timeout:10000}).catch(()=>{});
    const sent=await q.evaluate(()=>window.__sent);
    ok(sent&&sent.length>=1&&sent[0].t==='image/png'&&sent[0].s>5000,kind+': عکس ساخته و به اشتراک داده شد '+JSON.stringify(sent));
    if(kind==='خارجی'){ const b64=await q.evaluate(async()=>{ const f=window.__shFiles[0]; const r=new FileReader(); return await new Promise(res=>{ r.onload=()=>res(r.result); r.readAsDataURL(f); }); }); fs.writeFileSync('/tmp/claude-0/sheet_out.png',Buffer.from(b64.split(',')[1],'base64')); }
    await q.close();
  }
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
