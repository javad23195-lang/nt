/* پیگیری فاکتور خودکار: خدمت «خارجی» که «تاریخ انجام» گرفت → کار تازه در «برون‌سپاری» (nt_outsrc_v1).
   مرحله‌ها: «فاکتور رسید» → «ثبت در شناسنامه». وقتی از «خدمات» شناسنامه همان خدمت ساخته شد (nt_sh_from_v1)، خودکار تمام می‌شود.
   شناسه کار از کلید خدمت ساخته می‌شود (یکسان روی همه سیستم‌ها، پس در همگام‌سازی تکراری نمی‌شود).
   فقط خدمت‌های ۳۰ روز اخیر؛ کار حذف‌شده با del=1 می‌ماند تا دوباره ساخته نشود. */
(function(){
const OK='nt_outsrc_v1', KK='nt_khadamat_v1', MK='nt_sh_from_v1', DAYS=30;
function norm(s){
  return String(s??'')
    .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
    .replace(/[أإآ]/g,'ا').replace(/ة/g,'ه')
    .replace(/[ً-ْـ]/g,'').replace(/[​-‏]/g,' ')
    .replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-0x06F0))
    .replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x0660))
    .replace(/[×xX*]/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim().toLowerCase();
}
const shKey=r=>norm(r.dev)+'|'+norm(r.act)+'|'+(r.y||'')+'/'+(r.m||'')+'/'+(r.d||'');
const hid=k=>{ let h=5381; for(let i=0;i<k.length;i++) h=((h<<5)+h+k.charCodeAt(i))>>>0; return 'k'+h.toString(36); };
const LS=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
const clip=(s,n)=>String(s??'').replace(/[<>"]/g,'').trim().slice(0,n);
function sync(){ try{
  if(!window.ntSvc) return 0;
  const kd=LS(KK,null), rows=kd&&Array.isArray(kd.rows)?kd.rows:[]; if(!rows.length) return 0;
  const made=LS(MK,[]), M=new Set(Array.isArray(made)?made:[]);
  let jobs=LS(OK,[]); if(!Array.isArray(jobs)) jobs=[];
  const T=ntSvc.today(), tn=ntSvc.dn(T); let ch=0;
  rows.forEach(r=>{
    if(!r || r.kind!=='خارجی' || !r.done || !r.dev) return;
    const dd=ntSvc.dn(r.done); if(dd===null || tn===null) return;
    const key=shKey(r), id=hid(key); let j=jobs.find(x=>x&&(x.key===key||x.id===id));
    if(!j){ if(tn-dd>DAYS || M.has(key)) return;
      j={id,key,src:'kh',dev:clip(r.dev,80),ven:'',desc:clip([r.act,r.part].filter(Boolean).join(' — '),160),ws:clip(r.done,10),steps:{},ts:Date.now()};
      jobs.push(j); ch++; }
    if(M.has(key) && !(j.steps&&j.steps.fin)){ j.steps=j.steps||{}; if(!j.steps.rcv) j.steps.rcv=T; j.steps.fin=T; j.auto=1; ch++; }
  });
  if(!ch) return 0;
  localStorage.setItem(OK,JSON.stringify(jobs));
  try{ if(window.ntSync && ntSync.touch) ntSync.touch([OK]); }catch(e){}
  return ch;
}catch(e){ return 0; } }
window.ntInvoice={sync,shKey,hid};
let tm=null; const later=()=>{ clearTimeout(tm); tm=setTimeout(sync,400); };
window.addEventListener('storage',e=>{ if(!e || e.key===KK || e.key===MK) later(); });
setTimeout(sync,1500); setTimeout(sync,9000); setInterval(sync,60000);
})();
