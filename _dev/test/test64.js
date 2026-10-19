// کاربر محدود (بدون امروز و برنامه): نوار پایین فقط دکمه وسط؛ همه زبانه‌ها یک بار در برگه آن. دفترچه (زبانه اول) از همان ابتدا فقط دستگاه‌های بخش
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  /* مثل گوشی کند: زبانه اول پیش از آخرین اسکریپت پوسته باز می‌شود (آن اسکریپت ۲ ثانیه بعد می‌رسد) */
  const cut=HTML.lastIndexOf(Buffer.from('<script>\n','utf8'));   /* آخرین اسکریپت پوسته (icons، dept قدیمی، …) دیرتر می‌رسد */
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.write(HTML.subarray(0,cut)); setTimeout(()=>r.end(HTML.subarray(cut)),2000); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const run=async(acl)=>{ const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
    await c.addInitScript(a=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({uid:'u1',mode:'w',dept:'استخراج',acl:a})); } },acl);
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
    const bar=await p.evaluate(()=>[...document.querySelectorAll('.ntnb')].map(b=>b.dataset.n||'more'));
    const di=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='دفترچه قرائت')), act=await p.evaluate(()=>DOCS[[...document.querySelectorAll('.tabs .tab,#tabs .tab')].findIndex(t=>t.classList.contains('on'))]?.name);
    let df=null; try{ const fr=await (await p.$$('iframe'))[di].contentFrame(); df=await fr.evaluate(()=>[...document.querySelectorAll('#list input.rv')].map(e=>e.dataset.dev)); }catch(e){ df=String(e).slice(0,80); }
    await p.evaluate(()=>document.getElementById('ntFab').click()); await sleep(400);
    const more={acts:await p.evaluate(()=>[...document.querySelectorAll('#ntNavSh .ntac')].map(b=>b.dataset.n)),rows:await p.evaluate(()=>[...document.querySelectorAll('#ntNavSh .ntmr')].map(b=>b.dataset.n||b.id))};
    await c.close(); return {bar,more,errs,df,act}; };  let r=await run({'دفترچه قرائت':'w','توقف شیفت':'w','مدیریت':'r'});
  ok(r.bar.length===0,'نوار پایین: هیچ دکمه زبانه‌ای نیست (فقط دکمه وسط)');
  ok(r.more.acts.join('|')==='توقف شیفت|دفترچه قرائت','برگه دکمه وسط: «ثبت توقف» و «قرائت دفترچه» — '+r.more.acts.join('، '));
  ok(r.more.rows.filter(x=>!/^nt/.test(x)).join('|')==='مدیریت' && r.more.rows.includes('ntThRow') && r.more.rows.includes('ntExitRow'),'بخش‌های دیگر: فقط مدیریت (+ ظاهر و خروج) — '+r.more.rows.join('، '));
  const all=[...r.more.acts,...r.more.rows]; ok(new Set(all).size===all.length,'هیچ زبانه‌ای دو بار نیست');
  ok(r.act==='دفترچه قرائت' && Array.isArray(r.df) && r.df.length===5 && r.df.every(n=>/PC290|PC400|TRS0[123]/.test(n)),'دفترچه (زبانه اول): از ابتدا فقط ۵ دستگاه استخراج — '+JSON.stringify(r.df)+' '+r.act);
  ok(r.errs.length===0,'بدون خطا '+r.errs.join('|'));
  r=await run({'امروز':'r','دفترچه قرائت':'w','توقف شیفت':'w','ثبت مشکلات':'r','خدمات':'r','شناسنامه':'r','مدیریت':'r'});
  ok(r.bar.length>=3 && r.bar.includes('امروز'),'کاربر با «امروز»: نوار پایین مثل قبل — '+r.bar.join('، '));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
