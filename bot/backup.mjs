// پشتیبان شبانه: برچسب bk-YYYY-MM-DD روی نسخه فعلی اطلاعات (مخزن خصوصی). اطلاعات قفل‌شده می‌ماند؛ ربات آن را باز نمی‌کند.
// اگر نسخه فعلی با آخرین پشتیبان یکی است، چیزی ساخته نمی‌شود. فقط KEEP نسخه آخر می‌ماند.
const E=process.env, OWNER='javad23195-lang', TAG='nt-data';
const KEEP=Math.max(5,+E.NT_BK_KEEP||30), API=E.NT_API||'https://api.github.com';
const REPO=E.NT_DATA_REPO||OWNER+'/nt-data';
const RE=/^bk-\d{4}-\d{2}-\d{2}(-\d{4})?(-(pre|man))?$/;
export async function backup(log=console.log){
  if(!E.NT_DATA_TOKEN){ log('NT_DATA_TOKEN نیست؛ پشتیبان گرفته نشد'); return {skip:true}; }
  const gh=(p,o={})=>fetch(`${API}/repos/${REPO}${p}`,{method:o.method||'GET',body:o.body?JSON.stringify(o.body):undefined,
    headers:Object.assign({Accept:'application/vnd.github+json',Authorization:'Bearer '+E.NT_DATA_TOKEN},o.body?{'Content-Type':'application/json'}:{}),signal:AbortSignal.timeout(30000)});
  let r=await gh('/git/ref/tags/'+TAG); if(!r.ok) throw new Error('نسخه اطلاعات خوانده نشد ('+r.status+')');
  const sha=(await r.json()).object.sha;
  r=await gh('/git/matching-refs/tags/bk-'); if(!r.ok) throw new Error('فهرست پشتیبان‌ها خوانده نشد ('+r.status+')');
  let L=(await r.json()).map(x=>({n:x.ref.replace('refs/tags/',''),sha:x.object.sha})).filter(x=>RE.test(x.n)).sort((a,b)=>a.n<b.n?1:-1);
  const name='bk-'+new Date().toISOString().slice(0,10);
  let made=false;
  if(L.length && L[0].sha===sha) log('اطلاعات از آخرین پشتیبان ('+L[0].n+') تغییر نکرده است');
  else if(L.some(x=>x.n===name)) log(name+' از قبل هست');
  else{ r=await gh('/git/refs',{method:'POST',body:{ref:'refs/tags/'+name,sha}}); if(!r.ok) throw new Error('پشتیبان ساخته نشد ('+r.status+')');
        made=true; L.unshift({n:name,sha}); log('پشتیبان ساخته شد: '+name); }
  L.sort((a,b)=>a.n<b.n?1:-1);
  let gone=0; for(const x of L.slice(KEEP)){ r=await gh('/git/refs/tags/'+x.n,{method:'DELETE'}); if(r.ok) gone++; }
  if(gone) log(gone+' پشتیبان قدیمی پاک شد');
  return {made,gone,count:Math.min(L.length,KEEP)};
}
if(import.meta.url===`file://${process.argv[1]}`) backup().catch(e=>{ console.error(e.message); process.exit(1); });
