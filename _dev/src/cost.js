/* هزینه ماهانه تعمیرات از شناسنامه. ماه هر ردیف = ماه «تاریخ ارسال» (st). در شناسنامه و ربات گزارش استفاده می‌شود. */
(function(root){
  const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  function ym(r){ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})/.exec(lat(r&&r.st).trim()); if(m) return {y:+m[1],m:+m[2]};
    const y=+lat(r&&r.y), mo=+lat(r&&r.m); return (y&&mo)?{y,m:mo}:null; }
  const num=v=>{ const n=+lat(v).replace(/[,\s٬]/g,''); return isFinite(n)&&n>0?n:0; };
  /** {y,m,a,k,sum,n,devs:[{dev,a,k,sum,n}]} — n = تعداد فاکتور */
  function month(rows,y,m){
    const D={}; let A=0,K=0,N=0;
    (Array.isArray(rows)?rows:[]).forEach(r=>{
      if(!r||!r.dev) return; const t=ym(r); if(!t||t.y!==y||t.m!==m) return;
      const a=num(r.costA), k=num(r.costK); if(!a&&!k) return;
      const x=D[r.dev]=D[r.dev]||{dev:String(r.dev),a:0,k:0,n:0};
      x.a+=a; x.k+=k; x.n+=(a?1:0)+(k?1:0); A+=a; K+=k; N+=(a?1:0)+(k?1:0);
    });
    const devs=Object.values(D).map(x=>Object.assign(x,{sum:x.a+x.k})).sort((p,q)=>q.sum-p.sum);
    return {y,m,a:A,k:K,sum:A+K,n:N,devs};
  }
  root.ntCost={month,ym};
})(typeof window!=='undefined'?window:globalThis);
