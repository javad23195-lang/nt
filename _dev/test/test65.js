// شناسنامه: «فایل اکسل برای مالی» — ۲۰ ستون، عددها عدد، فیلتر ماه
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path'); const XLSX=require('xlsx');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html')); const LIB=path.join(__dirname,'..','..','lib','xlsx.mini.min.js');
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const web=http.createServer((q,r)=>{ if(/xlsx\.mini/.test(q.url)){ r.writeHead(200,{'Content-Type':'text/javascript'}); r.end(fs.readFileSync(LIB)); return; } r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:1100,height:900},acceptDownloads:true}); const p=await c.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd{display:none!important}'});
  await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked'); try{ ntBoot(); }catch(e){}
    const R=(m,d,dev,x)=>Object.assign({y:'1405',m:String(m),d:String(d),mn:['','فروردین','اردیبهشت'][m],dev,desc:'شرح آزمایشی',part:'**',act:'موتور و قطعات',st:'1405/0'+m+'/0'+d,en:'1405/0'+m+'/0'+d,meter:'۲۶۶۶۴',rep:'تعمیرگاه الف',sup:'',payA:'اعتباری',payK:'',docA:'36',docK:'',costA:'1,500,000',costK:''},x||{});
    localStorage.setItem('nt_sh8_v1',JSON.stringify({row:5,rows:[R(1,8,'لودر کوماتسو WA470'),R(2,3,'کامیون TRS01',{costK:'200000',docK:'12',sup:'فروشگاه ب',payK:'نقدی'}),R(1,9,'<img src=x onerror=window.__x=1>')]})); });
  const IDX=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='شناسنامه'));
  await p.evaluate(i=>show(i),IDX); await sleep(1800);
  const fr=await (await p.$$('iframe'))[IDX].contentFrame();
  await fr.click('#fnBtn'); await sleep(200);
  const opts=await fr.evaluate(()=>[...document.querySelectorAll('#fnSel option')].map(o=>o.value+':'+o.textContent));
  ok(opts.length===3 && /همه/.test(opts[0]) && /^140502:اردیبهشت/.test(opts[1]),'انتخاب: همه + هر ماه — '+opts.join(' | '));
  await fr.selectOption('#fnSel','140501');
  const [dl]=await Promise.all([p.waitForEvent('download',{timeout:15000}),fr.click('#fnGo')]);
  const f='/tmp/claude-0/fn-test.xlsx'; await dl.saveAs(f);
  ok(dl.suggestedFilename()==='NT-shenasnameh-1405-01.xlsx','نام فایل: '+dl.suggestedFilename());
  const wb=XLSX.readFile(f,{cellNF:true}), ws=wb.Sheets[wb.SheetNames[0]], A=XLSX.utils.sheet_to_json(ws,{header:1});
  ok(wb.SheetNames[0]==='SHENASNAMEH','نام برگه SHENASNAMEH');
  ok(A[0].length===20 && A[0][0]==='ردیف' && A[0][18]==='هزینه اجرت' && A[0][19]==='هزینه خرید قطعه','۲۰ سرستون مثل فایل مالی');
  ok(A.length===3,'فقط فروردین: ۲ ردیف');
  ok(A[1][0]===1 && A[1][1]===1405 && A[1][3]===8 && A[1][5]==='لودر کوماتسو WA470' && A[1][11]===26664 && A[1][16]===36 && A[1][18]===1500000,'عددها عدد هستند (کارکرد فارسی، مبلغ با جداکننده)');
  ok(ws['S2'] && ws['S2'].z==='#,##0','قالب مبلغ با جداکننده');
  ok(String(A[2][5]).includes('<img'),'متن خطرناک فقط متن است');
  ok(await fr.evaluate(()=>/۲ ردیف/.test(document.getElementById('fnMsg').textContent)),'پیام: ساخته شد با ۲ ردیف');
  ok(await p.evaluate(()=>!window.__x) && await fr.evaluate(()=>!window.__x),'متن خطرناک اجرا نشد');
  ok(errs.length===0,'بدون خطا '+errs.join('|'));
  console.log(fails?fails+' شکست':'همه موفق'); await br.close(); web.close(); process.exit(fails?1:0);
})();
