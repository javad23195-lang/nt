/* برنامه سرویس (تعویض روغن و فیلتر): هر مورد = دستگاه + نام + فاصله (ساعت یا کیلومتر) + آخرین سرویس (قرائت و تاریخ) + سقف ماه.
   سرویس بعدی = هر کدام زودتر: قرائت (آخرین + فاصله) یا زمان (تاریخ آخرین + سقف ماه). در دفترچه قرائت و «امروز» استفاده می‌شود. */
(function(root){
  const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  function dn(s){ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/.exec(lat(s).trim()); if(!m) return null;
    const y=+m[1], mo=+m[2], d=+m[3]; return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; }
  function today(){ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; }catch(e){ return ''; } }
  const num=v=>{ const n=+lat(v).replace(/[,\s٬]/g,''); return (v!==''&&v!=null&&isFinite(n))?n:null; };
  /** آخرین قرائت هر دستگاه از دفترچه: {dev:{val,date}} */
  function latest(log){ const o={}; (Array.isArray(log)?log:[]).forEach(x=>{ if(!x||!x.dev) return; const v=num(x.val); if(v===null) return;
    const c=o[x.dev]; if(!c || String(x.date)>=String(c.date)) o[x.dev]={val:v,date:String(x.date||'')}; }); return o; }
  /** وضعیت یک مورد. cur = آخرین قرائت دستگاه. st: r گذشته، o نزدیک، g وقت هست، n فاصله ندارد */
  function state(it,cur,todayKey){
    const every=num(it.every), last=num(it.last), months=num(it.months)||12;
    const out={every,last,next:null,rem:null,days:null,st:'n',by:''};
    const t=dn(todayKey||today()), ld=dn(it.ld);
    if(ld!==null && t!==null){ out.days=Math.round(ld+months*30.4-t); }
    if(every && last!==null){ out.next=last+every; if(cur!==null && cur!==undefined) out.rem=out.next-cur; }
    let st='n';
    if(out.rem!==null){ st = out.rem<0?'r':(out.rem<=Math.max(1,every*0.1)?'o':'g'); out.by='use'; }
    if(out.days!==null){ const ts = out.days<0?'r':(out.days<=15?'o':'g');
      const rank={r:3,o:2,g:1,n:0}; if(rank[ts]>rank[st]){ st=ts; out.by='time'; } else if(st==='n'){ st=ts; out.by='time'; } }
    out.st=st; return out;
  }
  /** همه موردها با وضعیت، به ترتیب فوریت */
  function all(items,log,todayKey){
    const L=latest(log), rank={r:0,o:1,g:2,n:3};
    return (Array.isArray(items)?items:[]).filter(x=>x&&x.dev&&x.name).map(it=>{ const c=L[it.dev]; return Object.assign({it,cur:c?c.val:null,curDate:c?c.date:''},state(it,c?c.val:null,todayKey)); })
      .sort((a,b)=>rank[a.st]-rank[b.st] || (a.rem===null?1e12:a.rem/(a.every||1))-(b.rem===null?1e12:b.rem/(b.every||1)));
  }
  /** متن TSV چسبانده‌شده: دستگاه، نام، آخرین سرویس، تاریخ، فاصله، [ماه] */
  function parse(text){
    const ok=[], bad=[];
    String(text||'').split(/\r?\n/).forEach((ln,i)=>{ if(!ln.trim()) return; const c=ln.split('\t').map(s=>s.trim());
      if(c.length<5 || !c[0] || !c[1]){ bad.push(i+1); return; }
      const last=num(c[2]), every=num(c[4]);
      if(c[2]!=='' && last===null){ bad.push(i+1); return; }
      ok.push({dev:c[0].slice(0,80),name:c[1].slice(0,80),last:last===null?'':last,ld:dn(c[3])!==null?lat(c[3]).trim().slice(0,10):'',every:every===null?'':every,months:num(c[5])||12}); });
    return {ok,bad};
  }
  root.ntSvc={state,all,latest,parse,dn,today,num};
})(typeof window!=='undefined'?window:globalThis);
