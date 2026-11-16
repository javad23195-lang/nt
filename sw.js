/* سامانه نت — کار بدون اینترنت (Service Worker)
   - صفحه سامانه: اول از اینترنت (برای نسخه تازه)؛ اگر اینترنت نبود یا رسیدن کل صفحه بیش از ۳ ثانیه طول کشید، از نسخه ذخیره‌شده
     (نسخه تازه پشت صحنه ذخیره می‌شود و pwa.js checkNew آن را نشان می‌دهد).
   - کتابخانه‌ها و آیکن‌ها: از نسخه ذخیره‌شده، و پشت صحنه تازه می‌شوند.
   - درخواست‌های GitHub (اطلاعات مشترک) و سایت‌های دیگر دست نمی‌خورند.
   منبع: همین فایل در ریشه مخزن (_dev/NOTES.md را ببینید). */
const V='nt-v3';
const PAGE='سامانه-نت.html';
const CORE=[PAGE,'manifest.webmanifest','lib/icon-192.png','lib/icon-512.png','lib/icon-mask-192.png','lib/icon-mask-512.png','lib/icon-180.png',
  'lib/qrcode.js','lib/html5-qrcode.min.js','lib/chart.umd.js','lib/xlsx.mini.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
const pageKey=()=>new URL(PAGE,self.registration.scope).href;
function isPage(req,url){ try{ return decodeURIComponent(url.pathname).endsWith('/'+PAGE); }catch(e){ return false; } }
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url); if(url.origin!==self.location.origin) return;
  if(isPage(req,url)){
    e.respondWith((async()=>{
      const c=await caches.open(V);
      /* کل صفحه (نه فقط شروع پاسخ) باید برسد؛ وگرنه با اینترنت کند صفحه ۳ مگابایتی آهسته می‌آمد و «در حال آماده‌سازی» می‌ماند */
      const net=fetch(req.url,{cache:'no-store',credentials:'same-origin'}).then(async r=>{
        if(!r || !r.ok) return r;
        const full=new Response(await r.blob(),{status:r.status,statusText:r.statusText,headers:r.headers});
        await c.put(pageKey(),full.clone()); return full; });
      const old=await c.match(pageKey());
      if(!old) return net;
      const late=new Promise(res=>setTimeout(()=>res(null),3000));
      try{ const r=await Promise.race([net,late]); if(r && r.ok) return r; }catch(err){}
      net.catch(()=>{});
      return old;
    })());
    return;
  }
  if(req.mode==='navigate') return;     // صفحه‌های دیگر مخزن (مثل README) دست نمی‌خورند
  e.respondWith((async()=>{
    const c=await caches.open(V), hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{ if(r && r.ok) c.put(req,r.clone()); return r; });
    if(hit){ net.catch(()=>{}); return hit; }
    return net;
  })());
});
