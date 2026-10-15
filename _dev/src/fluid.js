/* مصرف سوخت و روغن: هر بار سوخت یا روغن اضافه می‌شود، لیتر آن در nt_fluid_v1 ثبت می‌شود: [{id,dev,k,l,d,at}]
   k: fuel سوخت، oil روغن موتور، hyd روغن هیدرولیک. d تاریخ شمسی، at قرائت در آن روز (اختیاری).
   نرخ = لیتر در بازه ÷ کارکرد در بازه (از دفترچه قرائت). سوخت: لیتر در ساعت (یا در ۱۰۰ کیلومتر)، روغن: لیتر در ۱۰۰ ساعت (یا ۱۰۰۰ کیلومتر).
   هشدار: نرخ ۳۰ روز اخیر ≥ ۱٫۳ برابر نرخ ۹۰ روز قبل از آن (با حداقل اطلاعات). در دفترچه قرائت، «امروز» و پرونده دستگاه. */
(function(root){
  const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  function dn(s){ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/.exec(lat(s).trim()); if(!m) return null;
    const y=+m[1], mo=+m[2], d=+m[3]; if(mo<1||mo>12||d<1||d>31) return null; return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; }
  const nk=s=>lat(s).replace(/[\s‌\-_]+/g,'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').toLowerCase();
  const KINDS={fuel:'سوخت',oil:'روغن موتور',hyd:'روغن هیدرولیک'};
  /** واحد نرخ: [ضریب، متن] */
  function unitOf(k,km){ if(k==='fuel') return km?[100,'لیتر در ۱۰۰ کیلومتر']:[1,'لیتر در ساعت']; return km?[1000,'لیتر در ۱۰۰۰ کیلومتر']:[100,'لیتر در ۱۰۰ ساعت']; }
  /** قرائت دستگاه در روز t (آخرین قرائت تا آن روز) */
  function readAt(R,t){ let v=null; for(const x of R){ if(x.t<=t) v=x.v; else break; } return v; }
  /** نرخ یک نوع در بازه [a,b] (شماره روز). null اگر اطلاعات کم است */
  function rate(F,R,k,a,b){
    const L=F.filter(x=>x.k===k && x.t>a && x.t<=b); if(!L.length) return null;
    const lit=L.reduce((s,x)=>s+x.l,0);
    const r0=readAt(R,a)!==null?readAt(R,a):(R.find(x=>x.t>a&&x.t<=b)||{}).v, r1=readAt(R,b);
    if(r0==null||r1==null) return null; const run=r1-r0; if(!(run>=20)) return null;
    return {lit,run,n:L.length,per:lit/run};
  }
  function prep(entries,log,dev){
    const K=nk(dev);
    const F=(Array.isArray(entries)?entries:[]).filter(x=>x&&nk(x.dev)===K&&KINDS[x.k]).map(x=>({k:x.k,l:+lat(x.l)||0,t:dn(x.d)})).filter(x=>x.t!==null&&x.l>0).sort((a,b)=>a.t-b.t);
    const R=(Array.isArray(log)?log:[]).filter(x=>x&&nk(x.dev)===K).map(x=>({v:+lat(x.val),t:dn(x.date)})).filter(x=>x.t!==null&&isFinite(x.v)).sort((a,b)=>a.t-b.t);
    return {F,R};
  }
  /** وضعیت یک دستگاه: برای هر نوع {k,name,now,base,ratio,warn,unit} */
  function state(entries,log,dev,todayKey,km){
    const {F,R}=prep(entries,log,dev), t=dn(todayKey); if(t===null) return [];
    const out=[];
    Object.keys(KINDS).forEach(k=>{ if(!F.some(x=>x.k===k)) return;
      const now=rate(F,R,k,t-30,t), base=rate(F,R,k,t-120,t-30), u=unitOf(k,km);
      const ratio=(now&&base&&base.per>0)?now.per/base.per:null;
      const last=F.filter(x=>x.k===k).pop();
      out.push({k,name:KINDS[k],now:now&&now.per*u[0],base:base&&base.per*u[0],ratio,warn:ratio!==null&&ratio>=1.3,unit:u[1],last:last?last.t:null,lit30:now?now.lit:F.filter(x=>x.k===k&&x.t>t-30).reduce((s,x)=>s+x.l,0)}); });
    return out;
  }
  /** همه هشدارها: [{dev,k,name,ratio,now,base,unit}] */
  function warnings(entries,log,todayKey,unitOf){
    const devs=[...new Set((Array.isArray(entries)?entries:[]).map(x=>x&&x.dev).filter(Boolean))], out=[];
    devs.forEach(dv=>{ const km=unitOf?unitOf(dv)==='کیلومتر':false; state(entries,log,dv,todayKey,km).forEach(s=>{ if(s.warn) out.push(Object.assign({dev:dv},s)); }); });
    return out.sort((a,b)=>b.ratio-a.ratio);
  }
  root.ntFluid={KINDS,state,warnings,dn};
})(typeof window!=='undefined'?window:globalThis);
