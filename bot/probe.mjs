// آزمایش اتصال: تلگرام و بله. هیچ توکنی در لاگ چاپ نمی‌شود.
const TT=process.env.TELEGRAM_TOKEN, TC=process.env.TELEGRAM_CHAT, BT=process.env.BALE_TOKEN;
const miss=['TELEGRAM_TOKEN','TELEGRAM_CHAT','BALE_TOKEN'].filter(k=>!process.env[k]);
if(miss.length){ console.log('Secret کم است:',miss.join(', ')); process.exit(1); }
async function call(base,token,method,body){
  const r=await fetch(`${base}/bot${token}/${method}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{}),signal:AbortSignal.timeout(20000)});
  const t=await r.text(); let j=null; try{ j=JSON.parse(t); }catch(e){}
  return {status:r.status,json:j};
}
const tg=(m,b)=>call('https://api.telegram.org',TT,m,b);
const bale=(m,b)=>call('https://tapi.bale.ai',BT,m,b);
const out=[];
try{
  const s=await tg('sendMessage',{chat_id:TC,text:'آزمایش ربات: تلگرام درست کار می‌کند ✅'});
  console.log('تلگرام:',s.status, s.json&&s.json.ok); out.push(s.json&&s.json.ok?'تلگرام: درست ✅':'تلگرام: خطا '+s.status);
}catch(e){ console.log('تلگرام: خطای اتصال',e.message); process.exit(1); }
let baleId=null;
try{
  const u=await bale('getUpdates',{});
  console.log('بله getUpdates:',u.status, u.json&&u.json.ok);
  if(u.json&&u.json.ok){
    const m=(u.json.result||[]).map(x=>x.message).filter(x=>x&&x.chat&&x.chat.type==='private').pop();
    if(m){ baleId=m.chat.id; out.push('بله: دسترسی درست ✅\nشناسه شما در بله: '+baleId); }
    else out.push('بله: دسترسی درست است ولی پیامی نیست. به ربات بله «سلام» بدهید و دوباره اجرا کنید.');
  } else out.push('بله: خطا '+u.status);
}catch(e){ console.log('بله: خطای اتصال',e.message); out.push('بله: GitHub به بله وصل نشد ('+e.message+')'); }
// شناسه فقط در پیام تلگرام می‌آید، نه در لاگ عمومی
await tg('sendMessage',{chat_id:TC,text:out.join('\n')});
