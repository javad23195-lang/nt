/* خرابی تکراری: یک دستگاه، همان «نوع فعالیت» شناسنامه، دو تعمیر یا بیشتر در ۳۰ روز.
   «فاکتور دیگرِ همان تعمیر» (xof) و ردیف‌های همان روز یک تعمیر شمرده می‌شوند. در «امروز» و ربات گزارش استفاده می‌شود. */
(function(root){
  const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  /** تاریخ شمسی → شماره روز */
  function dn(s){ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/.exec(lat(s).trim()); if(!m) return null;
    const y=+m[1], mo=+m[2], d=+m[3]; if(mo<1||mo>12||d<1||d>31) return null;
    return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; }
  const nk=s=>lat(s).replace(/[\s‌]+/g,' ').replace(/ي/g,'ی').replace(/ك/g,'ک').trim().toLowerCase();
  const p2=n=>String(n).padStart(2,'0');
  /** rows: ردیف‌های شناسنامه. خروجی: برای هر دستگاه و نوع، آخرین تکرار {dev,type,n,gap,last,reg,list:[{date,rep,desc}]} */
  function find(rows,opt){
    opt=opt||{}; const W=opt.days||30, G={};
    (Array.isArray(rows)?rows:[]).forEach(r=>{
      if(!r || r.xof || !r.dev) return; const ty=nk(r.type); if(!ty || ty==='**') return;
      const date=r.st || r.reg || (r.y?`${r.y}/${p2(r.m)}/${p2(r.d)}`:''), d=dn(date); if(d===null) return;
      const k=nk(r.dev)+'|'+ty, g=(G[k]=G[k]||{});
      if(!g[d]) g[d]={d,date:String(date).slice(0,10),reg:dn(r.reg)||d,r};
      else g[d].reg=Math.max(g[d].reg,dn(r.reg)||d);
    });
    const out=[];
    Object.keys(G).forEach(k=>{
      const L=Object.values(G[k]).sort((a,b)=>a.d-b.d), last=L[L.length-1];
      const win=L.filter(x=>last.d-x.d<=W);
      if(win.length<2) return;
      out.push({dev:last.r.dev,type:last.r.type,n:win.length,gap:last.d-win[0].d,last:last.d,reg:Math.max.apply(null,win.slice(1).map(x=>x.reg)),
        list:win.map(x=>({date:x.date,rep:String(x.r.rep||x.r.sup||''),desc:String(x.r.desc||'')}))});
    });
    return out.sort((a,b)=>b.reg-a.reg);
  }
  root.ntRepeat={find,dn};
})(typeof window!=='undefined'?window:globalThis);
