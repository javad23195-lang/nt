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
  /* روغن‌های هر نوع دستگاه (پیش‌فرض، از مشخصات کارخانه). روغن ترمز فقط خودروهای سبک (لودر و بیل و کامیون‌ها مخزن ترمز جدا ندارند).
     مدیر برای هر دستگاه در nt_fluid_cfg_v1 = {نام دستگاه: [نام‌ها]} تغییر می‌دهد. «موتور» = oil، «هیدرولیک» = hyd، بقیه = c:نام */
  const DEF=[
    [/wa470|zl50|لودر/,['موتور','گیربکس','دیفرانسیل جلو','دیفرانسیل عقب','هیدرولیک']],
    [/pc290|pc400|بیل/,['موتور','هیدرولیک','گردان (Swing)','فاینال درایو','دمپر']],
    [/gd705|گریدر/,['موتور','گیربکس','تاندم','دیفرانسیل','هیدرولیک','گردان تیغه']],
    [/لیفتراک/,['موتور','گیربکس','دیفرانسیل','هیدرولیک']],
    [/ژنراتور|kva|کیپور/,['موتور']],
    [/زامیاد|کاپرا|نیسان/,['موتور','گیربکس','دیفرانسیل','ترمز']],
    [/سیترا|مینیبوس/,['موتور','گیربکس','دیفرانسیل']],
    [/کامیون|trs|مایلر|2624/,['موتور','گیربکس','دیفرانسیل','هیدرولیک کمپرسی']]];
  const kOf=n=>{ n=String(n||'').replace(/^روغن\s*/,'').trim(); return n==='موتور'?'oil':n==='هیدرولیک'?'hyd':'c:'+n; };
  /** نام نمایشی یک نوع */
  function nameOf(k){ if(KINDS[k]) return KINDS[k]; const n=String(k||'').replace(/^c:/,''); return n?'روغن '+n:''; }
  /** فهرست روغن‌های دستگاه (بدون سوخت): از تنظیم مدیر، یا پیش‌فرض نوع دستگاه + نام‌های «روغن …» برنامه سرویس */
  function parts(dev,cfg,svcItems){
    if(cfg && Array.isArray(cfg[dev])) return cfg[dev].map(String).filter(Boolean);
    const d=nk(dev), hit=DEF.find(x=>x[0].test(d)), L=hit?hit[1].slice():['موتور','هیدرولیک'];
    (Array.isArray(svcItems)?svcItems:[]).forEach(it=>{ if(!it||nk(it.dev)!==d) return; const m=/^\s*روغن\s+(.+)$/.exec(String(it.name||'')); if(!m) return;
      const n=m[1].trim(); if(n && !L.some(x=>kOf(x)===kOf(n))) L.push(n); });
    return L; }
  /** گزینه‌های فرم: [{k,name}] — اول سوخت */
  function kinds(dev,cfg,svcItems){ return [{k:'fuel',name:'سوخت'}].concat(parts(dev,cfg,svcItems).map(n=>({k:kOf(n),name:nameOf(kOf(n))}))); }
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
    const F=(Array.isArray(entries)?entries:[]).filter(x=>x&&nk(x.dev)===K&&(KINDS[x.k]||/^c:./.test(x.k))).map(x=>({k:x.k,l:+lat(x.l)||0,t:dn(x.d)})).filter(x=>x.t!==null&&x.l>0).sort((a,b)=>a.t-b.t);
    const R=(Array.isArray(log)?log:[]).filter(x=>x&&nk(x.dev)===K).map(x=>({v:+lat(x.val),t:dn(x.date)})).filter(x=>x.t!==null&&isFinite(x.v)).sort((a,b)=>a.t-b.t);
    return {F,R};
  }
  /** وضعیت یک دستگاه: برای هر نوع {k,name,now,base,ratio,warn,unit} */
  function state(entries,log,dev,todayKey,km){
    const {F,R}=prep(entries,log,dev), t=dn(todayKey); if(t===null) return [];
    const out=[];
    [...new Set(F.map(x=>x.k))].sort((a,b)=>(a==='fuel'?-1:b==='fuel'?1:0)).forEach(k=>{
      const now=rate(F,R,k,t-30,t), base=rate(F,R,k,t-120,t-30), u=unitOf(k,km);
      const ratio=(now&&base&&base.per>0)?now.per/base.per:null;
      const last=F.filter(x=>x.k===k).pop();
      out.push({k,name:nameOf(k),now:now&&now.per*u[0],base:base&&base.per*u[0],ratio,warn:ratio!==null&&ratio>=1.3,unit:u[1],last:last?last.t:null,lit30:now?now.lit:F.filter(x=>x.k===k&&x.t>t-30).reduce((s,x)=>s+x.l,0)}); });
    return out;
  }
  /** همه هشدارها: [{dev,k,name,ratio,now,base,unit}] */
  function warnings(entries,log,todayKey,unitOf){
    const devs=[...new Set((Array.isArray(entries)?entries:[]).map(x=>x&&x.dev).filter(Boolean))], out=[];
    devs.forEach(dv=>{ const km=unitOf?unitOf(dv)==='کیلومتر':false; state(entries,log,dv,todayKey,km).forEach(s=>{ if(s.warn) out.push(Object.assign({dev:dv},s)); }); });
    return out.sort((a,b)=>b.ratio-a.ratio);
  }
  /** آخرین «سوخت زده شد» دستگاه (لیتر اختیاری): {d,t,l,by,days} یا null. days = چند روز پیش نسبت به todayKey */
  function lastFuel(entries,dev,todayKey){
    const K=nk(dev); let best=null;
    (Array.isArray(entries)?entries:[]).forEach(x=>{ if(!x||x.k!=='fuel'||nk(x.dev)!==K) return; const t=dn(x.d); if(t===null) return;
      const key=t*1440+(/^\d{1,2}:\d{2}$/.test(String(x.t||''))?(+x.t.split(':')[0])*60+(+x.t.split(':')[1]):0);
      if(!best||key>=best.key) best={key,t0:t,d:x.d,t:x.t||'',l:+lat(x.l)||0,by:x.by||''}; });
    if(!best) return null; const td=dn(todayKey); return {d:best.d,t:best.t,l:best.l,by:best.by,days:td===null?null:td-best.t0};
  }
  root.ntFluid={KINDS,state,warnings,dn,parts,kinds,kOf,nameOf,lastFuel};
})(typeof window!=='undefined'?window:globalThis);
