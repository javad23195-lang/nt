// آزمایش ربات گزارش: داده نمونه را مثل سامانه رمز می‌کند و گزارش را می‌سازد. رمز فقط آزمایشی است.
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import zlib from 'node:zlib';
import { webcrypto as crypto, randomBytes } from 'node:crypto'; import { spawnSync } from 'node:child_process';
const PASS='test-only-pass', dir=fs.mkdtempSync(path.join(os.tmpdir(),'bot-'));
const salt=randomBytes(16), iv=randomBytes(12);
const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(PASS),'PBKDF2',false,['deriveBits']);
const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},km,256);
const key=await crypto.subtle.importKey('raw',bits,'AES-GCM',false,['encrypt']);
const keys={
  nt_tavaqof_v1:JSON.stringify({'1405/07/17|صبح':{stops:[
    {id:'a',dev:'لودر کوماتسو WA470',from:'08:00',to:'11:00',cause:'خرابی هیدرولیک'},
    {id:'b',dev:'کامیون TRS01',from:'09:00',to:'09:30',cause:'نبود راننده'},
    {id:'c',dev:'کامیون TRS02',from:'10:00',to:'',cause:'خرابی موتور'}]}}),
  nt_prog_v1:JSON.stringify({'۱۴۰۵/۰۷/۱۸':{tasks:[{dev:'بیل مکانیکی کوماتسو PC400',prog:'تعویض فیلتر هوا',done:false},{dev:'نیسان',prog:'سرویس',done:false}],faults:[{dev:'لودر ZL50',fdesc:'نشت روغن',pri:'2'}]},
    '1405/07/17':{tasks:[{dev:'ژنراتور 1',prog:'بازدید',done:true,sdur:'1:30'},{dev:'لودر ZL50',prog:'تعویض روغن',done:false}]}})
};
const ct=Buffer.from(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,zlib.gzipSync(Buffer.from(JSON.stringify({keys,at:'x'})))));
const file=path.join(dir,'nt-data.json');
fs.writeFileSync(file,JSON.stringify({app:'nt-sync',v:2,at:'x',n:1,salt:salt.toString('base64'),iv:iv.toString('base64'),gz:1,data:ct.toString('base64')}));
const run=pass=>spawnSync('node',['../bot/report.mjs'],{encoding:'utf8',env:{...process.env,DRY:'1',NT_SOURCE_FILE:file,NT_PASS:pass,NT_NOW:'2026-10-10T03:00:00Z'}});
let ok=true; const t=(n,c)=>{ console.log((c?'✓ ':'✗ ')+n); if(!c) ok=false; };
const r=run(PASS); console.log(r.stdout); 
t('خروج موفق',r.status===0);
t('تاریخ امروز ۱۸ مهر',/۱۸ مهر/.test(r.stdout));
t('۴ توقف دیروز (۳ از فرم توقف + ژنراتور از برنامه)',/توقف: ۴ مورد/.test(r.stdout));
t('جمع ۵ ساعت (۳ + ۰٫۵ + ۱٫۵؛ توقف باز شمرده نمی‌شود)',/توقف: ۴ مورد، ۵ ساعت/.test(r.stdout));
t('بیشترین توقف WA470',/بیشترین توقف: لودر کوماتسو WA470/.test(r.stdout));
t('توقف باز TRS02',/هنوز متوقف: کامیون TRS02/.test(r.stdout));
t('برنامه امروز (کلید فارسی)',/۲ کار برنامه‌ریزی شده/.test(r.stdout));
t('کار انجام‌نشده دیروز',/۱ کار دیروز انجام نشده/.test(r.stdout));
t('خرابی ثبت‌شده',/لودر ZL50: نشت روغن/.test(r.stdout));
t('رمز نادرست = خطا و بدون متن گزارش',run('wrong').status!==0 && !/گزارش نت/.test(run('wrong').stdout));
fs.rmSync(dir,{recursive:true,force:true}); process.exit(ok?0:1);
