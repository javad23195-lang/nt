// زبانه «مدیریت»: کارت‌های خلاصه، نیاز به توجه، ناوگان، خط زمان؛ «امروز» بدون آن‌ها (جز نیاز به توجه)؛ نوار پایین؛ دسترسی مثل «امروز»
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const SHOT=process.env.SHOT;
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  for(const vp of [{width:390,height:844},{width:1100,height:860}]){
    const mob=vp.width<600, tag=mob?'گوشی: ':'رایانه: ';
    const c=await br.newContext({locale:'fa-IR',viewport:vp,deviceScaleFactor:SHOT?2:1});
    await c.addInitScript(()=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('nt_lasttab','3'); } });
    const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
    await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntQr&&window.ntNav,null,{timeout:15000});
    await p.addStyleTag({content:'.sydlg:not(#ntQrDlg),.sybd{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){} }); await sleep(1000);
    ok(await p.evaluate(()=>DOCS[DOCS.length-2].name==='مدیریت' && DOCS[DOCS.length-1].name==='تردد و اضافه‌کار' && DOCS[3].name!=='مدیریت' && localStorage.nt_lasttab==='3'),tag+'«مدیریت» و «تردد» آخر DOCS هستند؛ شماره زبانه‌های قبلی عوض نشد');
    if(mob){
      const nb=await p.evaluate(()=>[...document.querySelectorAll('#ntNav .ntnb')].map(b=>b.dataset.n||'بیشتر'));
      ok(JSON.stringify(nb)===JSON.stringify(['امروز','توقف شیفت','دفترچه قرائت','مدیریت']),tag+'نوار پایین: امروز، توقف، قرائت، مدیریت — '+nb.join('،'));
      await p.click('#ntHam'); await sleep(500);
      ok(await p.evaluate(()=>[...document.querySelectorAll('#ntDrw .di[data-t]')].some(b=>b.textContent.includes('انبار'))),tag+'«انبار» در منوی ☰ است');
      await p.keyboard.press('Escape'); await sleep(300);
    } else {
      const ord=await p.evaluate(()=>{ const t=[...document.querySelectorAll('.tab')]; return t.map(x=>({n:x.textContent.trim(),y:x.getBoundingClientRect().top})).sort((a,b)=>a.y-b.y).slice(0,3).map(x=>x.n); });
      ok(/امروز/.test(ord[0]) && /مدیریت/.test(ord[1]),tag+'کنار صفحه: «مدیریت» زیر «امروز» — '+ord.join(' | '));
    }
    const go=async n=>{ await p.evaluate(n=>window.postMessage({nt:'go',tab:n},'*'),n); await sleep(1600); };
    const vis=async(n,ids)=>{ const i=await p.evaluate(n=>DOCS.findIndex(d=>d.name===n),n); const fr=await (await p.$$('iframe'))[i].contentFrame();
      return fr.evaluate(ids=>ids.map(id=>{ const e=document.getElementById(id); return !!e && e.getClientRects().length>0; }),ids); };
    await go('مدیریت');
    let v=await vis('مدیریت',['kpis','flCard','tlCard','tList','cGrid','bkCard','chCard','rpCard']);
    ok(v[0] && v[1] && v[2] && !v[3] && !v[4] && !v[5] && v[6] && v[7],tag+'مدیریت: خلاصه، ناوگان، خط زمان، نمودار و گزارش دیده می‌شود؛ یادداشت، تقویم و پشتیبان نه '+v);
    if(SHOT) await p.screenshot({path:SHOT+'/mg_'+(mob?'m':'d')+'.png'});
    { const i=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='مدیریت')); const fr=await (await p.$$('iframe'))[i].contentFrame();
      const G=[]; for(const g of ['تولید','استخراج']){ await fr.evaluate(g=>document.querySelector(`#fl2 .fsg [data-seg="${g}"]`).click(),g); await sleep(200);
        G.push(g+':'+await fr.evaluate(()=>[...document.querySelectorAll('#fl2 .fr2 [data-dev]')].map(b=>b.dataset.dev.split(' ').pop()).sort().join(','))); }
      await fr.evaluate(()=>document.querySelector('#fl2 .fsg [data-seg="*"]').click());
      ok(G.length>=2 && /^تولید:.*WA470.*ZL50/.test(G[0]) && /2624/.test(G[0]) && /^استخراج:.*PC290.*PC400.*TRS01.*TRS02.*TRS03/.test(G[1]),tag+'ناوگان بر اساس بخش: '+G.join(' | ')); }
    await go('امروز');
    v=await vis('امروز',['kpis','flCard','tlCard','tList','cGrid','chCard','rpCard']);
    ok(!v[0] && !v[1] && !v[2] && v[3] && v[4] && !v[5] && !v[6],tag+'امروز: خلاصه، ناوگان، خط زمان، نمودار و گزارش پنهان؛ یادداشت و تقویم هست '+v);
    ok(errs.length===0,tag+'بدون خطا '+errs.join('|'));
    await c.close();
  }
  // دسترسی: کاربر محدودی که «امروز» را می‌بیند، «مدیریت» را هم می‌بیند
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
  await c.addInitScript(()=>{ if(!localStorage.getItem('__s')){ localStorage.setItem('__s','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({acl:{'امروز':'r','انبار':'w'}})); } });
  const p=await c.newPage(); await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync,null,{timeout:15000}); await sleep(500);
  ok(await p.evaluate(()=>ntSync.canSee('مدیریت') && !ntSync.canSee('خدمات')),'دسترسی: «مدیریت» همان دسترسی «امروز» را دارد');
  await c.close();
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
