
/* ساعت: «:» خودکار هنگام تایپ (1400 → 14:00، 830 → 8:30). رقم فارسی هم. پاک کردن آزاد است. */
(function(){ if(window.__ntHM) return; window.__ntHM=1;
  /* فقط کادر ساعت: QR، یا placeholder فقط به شکل ساعت (مثل 0:30) — نه «مثلاً: …» */
  const isHM=el=>el && el.matches && el.tagName==='INPUT' && (el.matches('#qrFrom,#qrTo') || (el.getAttribute('inputmode')==='numeric' && /^\s*[0-9۰-۹]{1,3}:[0-9۰-۹]{2}\s*$/.test(el.placeholder||'')));
  document.addEventListener('input',e=>{ const el=e.target; if(!isHM(el)) return;
    if(e.inputType && /^delete/.test(e.inputType)) return;
    const g=String(el.value).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g,'').slice(0,5);
    const v=g.length>=3?g.slice(0,-2)+':'+g.slice(-2):g;
    if(v!==el.value){ el.value=v; try{ el.setSelectionRange(v.length,v.length); }catch(x){} }
  },true);
})();
