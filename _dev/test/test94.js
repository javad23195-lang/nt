// باکس: قلم «ثبت» که شماره گزارش گرفته به «گزارش مأمور» می‌رود (همان قلم، با توضیح و ضروری) و «رفته از باکس» نمی‌شود. همه نام‌ها ساختگی است.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','out.html'));
let fails=0; const ok=(c,m)=>{ console.log((c?'  ok  ':'  FAIL ')+m); if(!c) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HEAD=['انتخاب','سال مالي','شماره','نوع مبنا','سال مبنا پدر','ش.مبنا پدر','تكميل','رديف','کد کالا','شرح کالا','مقدار','واحد','تاريخ نياز','دليل نياز','ملاحظات','تاريخ','کد نوع فعاليت','نوع فعاليت','توضيحات','درخواست کننده','کد بخش','بخش','کد مامور خريد','مامور خريد','کد نوع خريد','نوع خريد','کاربر ثبت کننده'];
const row=(no,r,code,name,q,u,why,REQ)=>[null,'1405',no,'','','','',r,code,name,q,u,'1405/07/01',why,'','1405/06/28','','','',REQ,'','','','','','',''];
const AOA1=[HEAD,row('101','1','1001','کالای نمونه الف','2','عدد','خرابی'),row('101','2','1002','کالای نمونه ب','5','متر','تعمیر'),row('102','1','1003','کالای نمونه ج','1','دست','ذخیره')];
const M1=[HEAD,row('201','1','2001','قطعه نمونه یک','2','عدد','خرابی','درخواست‌کننده الف'),row('201','2','2002','قطعه نمونه دو','1','عدد','تعمیر','درخواست کننده ب'),row('202','1','2003','قطعه نمونه سه','4','عدد','ذخیره','درخواست‌کننده الف')];
const S1=[HEAD,row('301','1','3001','کالای ثبت یک','1','عدد','نو','درخواست کننده ج')];
(async()=>{
  const web=http.createServer((q,r)=>{ r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); r.end(HTML); }); await new Promise(r=>web.listen(0,r));
  const br=await chromium.launch({executablePath:process.env.CHROMIUM||undefined});
  const c=await br.newContext({locale:'fa-IR',viewport:{width:390,height:844}});
  await c.addInitScript(()=>{ if(localStorage.getItem('__s')) return; localStorage.setItem('__s','1'); localStorage.setItem('ntws_test','1'); localStorage.setItem('ntsync_cfg_v1',JSON.stringify({mode:'w'})); localStorage.setItem('ntk_bf','open'); });
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/Unexpected token '<'/.test(String(e))) errs.push(String(e)); });
  await p.goto(`http://localhost:${web.address().port}/nt/s.html`); await p.waitForFunction(()=>window.ntSync&&window.ntNav&&window.ntWs,null,{timeout:15000});
  await p.addStyleTag({content:'.sydlg,.sybd,#ntPin{display:none!important}'}); await p.evaluate(()=>{ window.ntLocked=false; document.body.classList.remove('ntlocked','ntpin'); try{ ntBoot(); }catch(e){} }); await sleep(1500);
  await p.click('#ntWs [data-ws="kh"]'); await sleep(1200);
  await p.evaluate(()=>{ localStorage.setItem('ntk_pane','box'); window.postMessage({nt:'go',tab:'لیست خرید'},'*'); }); await sleep(1200);
  const i=await p.evaluate(()=>DOCS.findIndex(d=>d.name==='لیست خرید')); const f=await (await p.$$('iframe'))[i].contentFrame();
  const LSg=k=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
  const imp=async aoa=>{ await p.evaluate(a=>{ window.ntReport.readAoa=async()=>a; },aoa); await f.setInputFiles('#bFile',{name:'box.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('x')}); await sleep(600); };
  const cards=()=>f.evaluate(()=>[...document.querySelectorAll('#bList .bx .bn')].map(e=>e.textContent));

  const rowP=(no,r,code,name,py,pno)=>{ const x=row(no,r,code,name,'1','عدد','نیاز','درخواست کننده آزمایشی'); x[4]=py; x[5]=pno; return x; };
  const goneN=()=>f.evaluate(()=>{ const m=/رفته از باکس\s*\(([۰-۹0-9]+)\)/.exec(document.getElementById('bF').innerText); return m?m[1]:'۰'; });
  const msg=()=>f.evaluate(()=>document.getElementById('bMsg').innerText);
  const setLS=(k,v)=>p.evaluate(([k,v])=>localStorage.setItem(k,JSON.stringify(v)),[k,v]);

  console.log('۱) اول «ثبت»، بعد «گزارش مأمور»');
  await f.click('#bSrc [data-src="sabt"]'); await sleep(150);
  await imp([HEAD,row('501','1','5001','قطعه آزمایشی یک','1','عدد','نیاز'),row('501','2','5002','قطعه آزمایشی دو','1','عدد','نیاز')]);
  let B=await LSg('nt_kbox_v1'); const s1=B.find(x=>x.code==='5001'); ok(B.length===2 && s1.src==='sabt','دو قلم در «ثبت»');
  s1.imp=1; s1.nt=[{id:'m1',t:'اصل باشد',by:'',r:'واحد نگهداری و تعمیرات',k:'u',at:'',ts:1}]; await setLS('nt_kbox_v1',B);
  await f.click('#bSrc [data-src="mamur"]'); await sleep(150);
  await imp([HEAD,rowP('601','1','5001','قطعه آزمایشی یک','1405','501'),rowP('601','2','5002','قطعه آزمایشی دو','1405','501')]);
  B=await LSg('nt_kbox_v1'); const a1=B.find(x=>x.code==='5001');
  ok(B.length===2 && a1.id===s1.id && !a1.src && a1.no==='601' && a1.qno==='501' && a1.rid && a1.imp && a1.nt.length===1,'همان قلم به «گزارش مأمور» رفت (شناسه، ضروری و توضیح ماند)');
  ok(/۲ قلم از «ثبت» با شماره گزارش آمد/.test(await msg()) && !/دیگر در باکس نیست/.test(await msg()),'پیام: «۲ قلم از ثبت با شماره گزارش آمد»');
  ok(await f.evaluate(()=>/از ثبت آمد/.test(document.getElementById('bList').innerText) && /درخواست ۵۰۱/.test(document.getElementById('bList').innerText)),'برچسب «از ثبت آمد» و «درخواست ۵۰۱»');
  await f.click('#bSrc [data-src="sabt"]'); await sleep(150);
  await imp([HEAD,row('509','1','5009','قطعه دیگر','1','عدد','نیاز')]);
  B=await LSg('nt_kbox_v1'); ok(!B.some(x=>x.code!=='5009'&&x.gone) && await goneN()==='۰','«ثبت» تازه بدون آن‌ها: رفته از باکس نشدند');
  await f.click('#bSrc [data-src="mamur"]'); await sleep(150);
  await imp([HEAD,rowP('601','1','5001','قطعه آزمایشی یک','1405','501'),rowP('601','2','5002','قطعه آزمایشی دو','1405','501')]);
  B=await LSg('nt_kbox_v1'); ok(B.filter(x=>x.code==='5001').length===1 && B.length===3,'بار دوم «گزارش مأمور»: قلم تکراری ساخته نشد');
  await imp([HEAD,rowP('601','2','5002','قطعه آزمایشی دو','1405','501')]);
  B=await LSg('nt_kbox_v1'); ok(B.find(x=>x.code==='5001').gone && !B.find(x=>x.code==='5002').gone,'وقتی از «گزارش مأمور» هم رفت: درست «رفته» شد');

  console.log('۲) اول «ثبت» رفته شد، بعد «گزارش مأمور» آمد');
  await f.click('#bSrc [data-src="sabt"]'); await sleep(150);
  await imp([HEAD,row('502','1','5003','قطعه آزمایشی سه','1','عدد','نیاز'),row('509','1','5009','قطعه دیگر','1','عدد','نیاز')]);
  await imp([HEAD,row('509','1','5009','قطعه دیگر','1','عدد','نیاز')]);
  B=await LSg('nt_kbox_v1'); ok(B.find(x=>x.code==='5003').gone,'«ثبت» بدون آن، پیش از گزارش: موقتاً رفته');
  await f.click('#bSrc [data-src="mamur"]'); await sleep(150);
  await imp([HEAD,rowP('601','2','5002','قطعه آزمایشی دو','1405','501'),rowP('602','1','5003','قطعه آزمایشی سه','1405','502')]);
  B=await LSg('nt_kbox_v1'); const a3=B.find(x=>x.code==='5003');
  ok(!a3.gone && !a3.src && a3.no==='602' && B.filter(x=>x.code==='5003').length===1 && !/برگشت/.test(await msg()),'با گزارش آمد: از «رفته» بیرون آمد، قلم تکراری نیست');

  console.log('۲ب) رنگ هر درخواست (ش.مبنا پدر)');
  await imp([HEAD,rowP('701','1','7001','قطعه رنگ یک','1405','801'),rowP('701','2','7002','قطعه رنگ دو','1405','801'),rowP('702','1','7003','قطعه رنگ سه','1405','802'),rowP('702','2','7004','قطعه رنگ چهار','1405','802'),rowP('703','1','7005','قطعه تنها','1405','803')]);
  await f.evaluate(()=>{ const b=document.querySelector('#bF [data-f="open"]'); if(b) b.click(); }); await sleep(200);
  const C=await f.evaluate(()=>{ const g=n=>{ const e=[...document.querySelectorAll('#bList .bx')].find(b=>b.querySelector('.bn').textContent===n); return e?{c:e.style.getPropertyValue('--rq'),rq:e.classList.contains('rq'),chip:(e.querySelector('.rqc')||{}).textContent||''}:null; };
    return {a:g('قطعه رنگ یک'),b:g('قطعه رنگ دو'),c:g('قطعه رنگ سه'),d:g('قطعه رنگ چهار'),e:g('قطعه تنها'),bw:getComputedStyle(document.querySelector('#bList .bx.rq')).borderInlineStartWidth}; });
  ok(C.a.rq && C.a.c && C.a.c===C.b.c && C.c.c===C.d.c && C.a.c!==C.c.c,'یک درخواست = یک رنگ؛ دو درخواست = دو رنگ');
  ok(!C.e.rq && /درخواست ۸۰۳/.test(C.e.chip) && /درخواست ۸۰۱/.test(C.a.chip) && C.bw==='6px','قلم تنها: بدون رنگ، فقط برچسب «درخواست ۸۰۳»؛ نوار رنگی ۶ پیکسل');
  ok(await f.evaluate(()=>{ const n=[...document.querySelectorAll('#bList .bx .bn')].map(e=>e.textContent); const i=n.indexOf('قطعه رنگ یک'), j=n.indexOf('قطعه رنگ دو'); return Math.abs(i-j)===1; }),'اقلام یک درخواست کنار هم');
  await f.fill('#bQ','802'); await sleep(250);
  ok(await f.evaluate(()=>[...document.querySelectorAll('#bList .bx .bn')].map(e=>e.textContent).sort().join()==='قطعه رنگ سه,قطعه رنگ چهار'),'جستجوی شماره درخواست'); await f.fill('#bQ',''); await sleep(150);
  await (await f.$('#bList')).screenshot({path:process.env.SHOT||'/dev/null'}).catch(()=>{});

  console.log('۳) اطلاعات قدیمی: قلم جدا در هر دو باکس');
  await setLS('nt_kbox_v1',[{id:'sb-1405-503-1-5004',src:'sabt',no:'503',code:'5004',name:'قطعه آزمایشی چهار',gone:'1405/08/01',imp:1,nt:[{id:'q1',t:'یادداشت قدیمی',r:'واحد نگهداری و تعمیرات',k:'u',ts:2}]},{id:'sp-1405-603-1-5004',no:'603',code:'5004',name:'قطعه آزمایشی چهار',add:'1405/08/02'}]);
  await f.evaluate(()=>drawBox());
  await imp([HEAD,rowP('603','1','5004','قطعه آزمایشی چهار','1405','503')]);
  B=await LSg('nt_kbox_v1'); const m4=B.find(x=>x.id==='sp-1405-603-1-5004'), s4=B.find(x=>x.id==='sb-1405-503-1-5004');
  ok(m4.imp && m4.nt.length===1 && s4.dup===m4.id && !s4.imp,'ضروری و توضیح به قلم گزارش رفت');
  await f.click('#bSrc [data-src="sabt"]'); await sleep(150);
  ok(await goneN()==='۰' && await f.evaluate(()=>!/قطعه آزمایشی چهار/.test(document.getElementById('bList').innerText)),'قلم قدیمی «ثبت» دیگر در «رفته از باکس» نیست');

  ok(!errs.length,'بدون خطای صفحه '+errs.join(' | ').slice(0,300));
  await br.close(); web.close(); console.log(fails?`\n${fails} FAIL`:'\nALL OK'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
