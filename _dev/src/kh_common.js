/* ابزار مشترک زبانه‌های بخش خرید (لیست خرید، پیش‌فاکتور، میز خرید). همه متن‌ها با esc() در HTML؛ داده ورودی با clean(). */
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const clean=(s,n)=>String(s??'').replace(/[<>"]/g,'').replace(/[\t\r\n]+/g,' ').replace(/\s+/g,' ').trim().slice(0,n||120);
const lat=s=>String(s??'').replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));
const norm=s=>lat(s).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[آأإٱ]/g,'ا').replace(/ؤ/g,'و').replace(/ئ/g,'ی').replace(/[ةۀ]/g,'ه').replace(/[‌ً-ٟـء]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().toLowerCase();
const nkey=s=>norm(s).replace(/\s+/g,'');
function LS(k,d){ try{ const v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } }
function put(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function lsl(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:v; }catch(e){ return d; } }
function lss(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
const canWT=t=>{ try{ return !parent.ntSync || parent.ntSync.canWriteTab(t); }catch(e){ return true; } };
const canSeeT=t=>{ try{ return !parent.ntSync || parent.ntSync.canSee(t); }catch(e){ return true; } };
const canAppr=()=>{ try{ return !parent.ntSync || !parent.ntSync.canApprove || parent.ntSync.canApprove(); }catch(e){ return true; } };
const myName=()=>{ try{ return clean(parent.ntSync&&parent.ntSync.myName?parent.ntSync.myName():'',40); }catch(e){ return ''; } };
const uid=p=>(p||'k')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function todayJ(){ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()), g=t=>p.find(x=>x.type===t).value; return g('year')+'/'+g('month')+'/'+g('day'); }catch(e){ return ''; } }
const TODAY=todayJ();
const MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function normDate(s){ s=lat(s).trim().replace(/[-.]/g,'/'); let m=/^(1[34]\d{2})\/(\d{1,2})\/(\d{1,2})$/.exec(s);
  if(!m){ const g=s.replace(/\D/g,''); if(g.length===8) m=[0,g.slice(0,4),g.slice(4,6),g.slice(6,8)]; }
  if(!m) return ''; const mo=+m[2], dy=+m[3]; if(mo<1||mo>12||dy<1||dy>31||(mo>6&&dy>30)) return '';
  return m[1]+'/'+String(mo).padStart(2,'0')+'/'+String(dy).padStart(2,'0'); }
function maskDate(el){ const at=el.selectionStart===el.value.length; let g=lat(el.value).replace(/\D/g,'').slice(0,8), o=g.slice(0,4); if(g.length>4) o+='/'+g.slice(4,6); if(g.length>6) o+='/'+g.slice(6,8); if(o!==el.value){ el.value=o; if(at) try{ el.setSelectionRange(o.length,o.length); }catch(e){} } }
/** شماره روز شمسی (برای فاصله دو تاریخ) */
function dn(s){ const m=/^(1[34]\d{2})\/(\d{1,2})\/(\d{1,2})/.exec(lat(s||'').trim()); if(!m) return null; const y=+m[1], mo=+m[2], d=+m[3]; return (y-1)*365+Math.floor((y-1)*8/33)+(mo<=6?(mo-1)*31:186+(mo-7)*30)+d; }
const daysSince=s=>{ const a=dn(s), b=dn(TODAY); return (a===null||b===null)?null:b-a; };
function parseAmt(raw){ const s=lat(raw).replace(/[,،٬\s_]/g,''); if(s===''||!/^\d+(\.\d+)?$/.test(s)) return null; const n=Number(s); return Number.isFinite(n)&&n>=0?n:null; }
const g3=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const faN=n=>fa(g3(Math.round(n))).replace(/,/g,'٬');
function say(id,t,c){ const e=$(id); if(!e) return; e.textContent=t||''; e.className='msg'+(c?' '+c:''); }
function armButton(btn,action,b,ms){ let on=false,tm=null; const a=btn.textContent; const off=()=>{ on=false; btn.classList.remove('armed'); btn.textContent=a; clearTimeout(tm); };
  btn.addEventListener('click',()=>{ if(!on){ on=true; btn.classList.add('armed'); btn.textContent=b||'مطمئنید؟ دوباره بزنید'; tm=setTimeout(off,ms||5000); return; } off(); action(); }); }
async function copyText(t){
  try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(t); return true; } }catch(e){}
  try{ const ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;opacity:0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,t.length); const ok=document.execCommand('copy'); ta.remove(); return ok; }catch(e){ return false; } }
/** رفتن به زبانه دیگر (و قسمت آن: کلید ntf_pane/ntk_pane/ntp_pane همان گوشی) */
function goTab(tab,paneKey,pane){ if(paneKey) lss(paneKey,pane); try{ parent.postMessage({nt:'go',tab},'*'); }catch(e){} }
function segInit(id,key,panes,onSet){ const seg=$(id); let cur=lsl(key,panes[0]); if(!panes.includes(cur)) cur=panes[0];
  const set=p=>{ cur=p; seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.p===p))); panes.forEach(x=>{ const e=$('p_'+x); if(e) e.hidden=x!==p; }); lss(key,p); onSet(p); };
  seg.addEventListener('click',e=>{ const b=e.target.closest('[data-p]'); if(b){ set(b.dataset.p); scrollTo(0,0); } });
  /* پیام show (رفتن به همین زبانه از جای دیگر): قسمت خواسته‌شده */
  window.addEventListener('message',e=>{ if(e.source===parent && e.data && e.data.nt==='show'){ const p=lsl(key,cur); if(panes.includes(p)&&p!==cur) set(p); } });
  set(cur); return {set,get cur(){ return cur; }}; }
