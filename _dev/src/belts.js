/* ============ تسمه‌های دستگاه‌ها (مشخصات از فایل اکسل کاربر) ============
   داده: nt_belts_v1 = {at, rows:[{id, name (نام در فایل), devs:[نام دستگاه در سامانه], b:{dinam|cooler|fan|water:{code,n}}}]}
   در TABKEYS «دفترچه قرائت» و «انبار» (رمزدار؛ هیچ عددی از اکسل در کد نیست).
   موجودی هر تسمه: از nt_stock_v1 (فایل موجودی سندپرداز) — کالایی که «تسمه» دارد و کد تسمه در نامش هست. */
(function(root){
'use strict';
const KINDS=[['dinam','تسمه دینام'],['cooler','تسمه کولر'],['fan','تسمه پروانه'],['water','تسمه واترپمپ']];
const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const nk=s=>lat(s).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\s‌\-_]+/g,'').toLowerCase();
const cl=(v,n)=>String(v==null?'':v).replace(/[<>"]/g,'').replace(/\s+/g,' ').trim().slice(0,n||60);
const LS=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
const DEVS=()=>{ try{ return (root.ntQr&&root.ntQr.DEVS)||[]; }catch(e){ return []; } };
/* نام دستگاه در فایل → دستگاه‌های سامانه (تکه‌ای از نام). «کامیون بنز» = هر سه کامیون TRS */
const MAP=[[/zl50|زدال/,['ZL50']],[/470/,['WA470']],[/pc290|290/,['PC290']],[/pc400|400/,['PC400']],[/لیفتراک/,['LIFT6']],[/gd705|گریدر/,['GD705']],
  [/زامیاد|نیسان/,['ZAMYAD']],[/کاپرا/,['CAPRA']],[/سیترا|مینیبوس/,['CITRA']],[/1030/,['G1030']],[/700kva|کامینز700/,['G700']],[/کوماتسو220|ژنراتورکوماتسو/,['G220']],[/کیپور/,['KIPOR']],
  [/بنز|lk1924|trs/,['TRS01','TRS02','TRS03']],[/مایلر|2624/,['MYLER']]];
function devsOf(name){ const k=nk(name); if(/17kva/.test(k)) return []; const hit=MAP.find(x=>x[0].test(k)); if(!hit) return [];
  const D=DEVS(); return hit[1].map(id=>(D.find(d=>d.id===id)||{}).name).filter(Boolean); }
const isQty=v=>{ const s=lat(v).trim(); return /^\d{1,2}$/.test(s); };
const isCode=v=>{ const s=cl(v,60); return !!s && s!=='-' && !/^\d{1,2}$/.test(lat(s)); };
/** فایل اکسل (آرایه سطرها) → ردیف‌ها. سربرگ: «نام دستگاه» و «تسمه دینام/کولر/پروانه/واترپمپ» هر کدام با ستون «تعداد» بعدش */
function parse(A){ let hi=-1, ix={};
  for(let r=0;r<Math.min((A||[]).length,15)&&hi<0;r++){ const H=(A[r]||[]).map(h=>nk(h)); const n=H.findIndex(h=>/نامدستگاه/.test(h)); if(n<0) continue;
    const f=re=>H.findIndex(h=>re.test(h)); ix={n,dinam:f(/دینام/),cooler:f(/کولر/),fan:f(/پروانه/),water:f(/واترپمپ/)}; if(ix.dinam>-1||ix.fan>-1) hi=r; }
  if(hi<0) return null;
  const rows=[];
  A.slice(hi+1).forEach((r,i)=>{ if(!r) return; const name=cl(r[ix.n],60); if(!name || /^نکته/.test(name)) return; const b={};
    KINDS.forEach(([k])=>{ const c=ix[k]; if(c==null||c<0) return; const code=r[c], q=r[c+1]; if(!isCode(code)) return; b[k]={code:cl(code,60),n:isQty(q)?+lat(q):1}; });
    rows.push({id:'b'+(i+1),name,devs:devsOf(name),b}); });
  return rows; }
/** کالاهای انبار که این تسمه‌اند: نام «تسمه» دارد و کد تسمه (بدون فاصله و خط تیره) در نامش هست */
function tokens(code){ return lat(code).toUpperCase().split(/\s+(?:OR|یا)\s+|\n|\/|,|،/).map(s=>s.replace(/[^A-Z0-9*.]/g,'')).filter(s=>s.length>=3); }
function stockOf(code,so){ so=so||LS('nt_stock_v1'); const it=so&&so.items||{}; const T=tokens(code); if(!T.length) return null; let q=0, hit=[];
  Object.keys(it).forEach(c=>{ const x=it[c]; if(!x||!x.n) return; const n=lat(x.n).toUpperCase().replace(/[^A-Z0-9*.؀-ۿ]/g,''); if(n.indexOf('تسمه')<0) return;
    if(T.some(t=>n.indexOf(t)>-1)){ q+=(+x.q||0); hit.push({c,n:x.n,q:+x.q||0,u:x.u||''}); } });
  return {q:Math.round(q*100)/100,hit,at:so&&so.at||''}; }
function data(){ const o=LS('nt_belts_v1'); return o&&Array.isArray(o.rows)?o:null; }
/** تسمه‌های یک دستگاه سامانه: [{k,t,code,n,stock}] */
function of(dev){ const o=data(); if(!o) return []; const k=nk(dev), so=LS('nt_stock_v1');
  const r=o.rows.find(x=>Array.isArray(x.devs)&&x.devs.some(d=>nk(d)===k)); if(!r) return [];
  return KINDS.filter(([kk])=>r.b&&r.b[kk]&&r.b[kk].code).map(([kk,t])=>({k:kk,t,code:r.b[kk].code,n:r.b[kk].n||1,stock:so?stockOf(r.b[kk].code,so):null})); }
/** دستگاه‌های اصلی که برای دست‌کم یک تسمه، یدکی در انبار ندارند (فقط اگر فایل موجودی هست) */
function missing(devs){ if(!LS('nt_stock_v1')||!data()) return []; return (devs||[]).map(d=>({dev:d,L:of(d).filter(x=>x.stock&&x.stock.q<x.n)})).filter(x=>x.L.length); }
const text=L=>L.map(x=>x.t.replace(/^تسمه\s*/,'')+': '+x.code+(x.n>1?' × '+x.n:'')).join('، ');
root.ntBelt={KINDS,parse,devsOf,stockOf,data,of,missing,text,nk};
})(typeof window!=='undefined'?window:globalThis);
