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
const faN=n=>fa(g3(Math.round(n)));
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
/* آیکن‌های خطی بخش خرید (طرح تازه) */
const ICO={star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  upload:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M12 18v-6M9 14l3-3 3 3"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',okc:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  tools:'<path d="M14 7a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 00-2-2z"/><path d="M4 4l4 4M3 7l4-4"/>',bag:'<path d="M6 7h12l1 14H5zM9 7a3 3 0 016 0"/>',
  hand:'<path d="M8 13V5a1.5 1.5 0 013 0v6M11 11V4a1.5 1.5 0 013 0v7M14 11V5.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-1a6 6 0 01-5-3l-2.5-4a1.5 1.5 0 012.5-1.5L8 15"/>',
  toolbox:'<path d="M3 9h18v10H3zM8 9V6h8v3M3 13h18M10 13v2h4v-2"/>',chev:'<path d="M15 6l-6 6 6 6"/>',arrow:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  clip:'<path d="M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L15 7"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 012-2h10"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.5"/>',
  store:'<path d="M3 10l2-6h14l2 6M4 10h16M5 10v10h14V10M10 20v-5h4v5"/>',archive:'<path d="M3 4h18v5H3zM5 9v11h14V9M10 13h4"/>',
  docm:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M12 11v7M14 12.5c-.5-.7-1.2-1-2-1-1.1 0-2 .6-2 1.5s.9 1.3 2 1.5 2 .6 2 1.5-.9 1.5-2 1.5c-.8 0-1.5-.3-2-1"/>',
  clipck:'<path d="M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M9 14l2 2 4-4"/>',rcpt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',list:'<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'};
const ico=(k,s)=>`<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"${s?` style="width:${s}px;height:${s}px"`:''}>${ICO[k]||''}</svg></span>`;
/** تاریخ شمسی ← میلادی (برای نام روز هفته) */
function j2g(jy,jm,jd){ jy+=1595; let days=-355668+(365*jy)+(~~(jy/33)*8)+~~(((jy%33)+3)/4)+jd+((jm<7)?(jm-1)*31:((jm-7)*30)+186);
  let gy=400*~~(days/146097); days%=146097; if(days>36524){ gy+=100*~~(--days/36524); days%=36524; if(days>=365) days++; }
  gy+=4*~~(days/1461); days%=1461; if(days>365){ gy+=~~((days-1)/365); days=(days-1)%365; }
  let gd=days+1; const sal=[0,31,((gy%4===0&&gy%100!==0)||(gy%400===0))?29:28,31,30,31,30,31,31,30,31,30,31]; let gm=0; for(gm=0;gm<13&&gd>sal[gm];gm++) gd-=sal[gm]; return [gy,gm,gd]; }
const WDAY=['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
/** «شنبه ۲۴ مهر» */
function dayName(s){ const m=/^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(lat(s||'')); if(!m) return fa(s||''); try{ const g=j2g(+m[1],+m[2],+m[3]); const w=new Date(Date.UTC(g[0],g[1]-1,g[2])).getUTCDay(); return WDAY[w]+' '+fa(+m[3])+' '+MONTHS[+m[2]-1]; }catch(e){ return fa(s); } }
/** حالت خالی: آیکن، عنوان، توضیح، دکمه */
const emptyState=(ic,t,p,btn)=>`<div class="est"><div class="eic">${ico(ic,40)}</div><b>${esc(t)}</b>${p?`<p>${esc(p)}</p>`:''}${btn||''}</div>`;
/* ===== طرح v2: زیرعنوان سربرگ، قرص همگام (رایانه)، اندازه متن ===== */
/** مبلغ به میلیون: ۴۸٫۵ میلیون → «۴۸.۵ م» */
const faM=v=>{ const m=Math.round((+v||0)/1e5)/10; return fa(String(m))+' م'; };
/** زیرعنوان سربرگ سامانه (گوشی) و سربرگ همین بخش (رایانه) */
function khSub(t){ t=String(t||''); const s=document.querySelector('header .sub'); if(s && s.textContent!==t) s.textContent=t;
  try{ parent.postMessage({nt:'sub',t},'*'); }catch(e){} }
function khSyncPill(){ const h=document.querySelector('header'); if(!h) return; let el=document.getElementById('khsy');
  if(!el){ el=document.createElement('span'); el.id='khsy'; el.className='khsy'; el.innerHTML='<i></i><span></span>'; el.setAttribute('role','button'); el.tabIndex=0; el.title='همگام‌سازی الان'; el.style.cursor='pointer'; const go=()=>{ try{ const b=parent.document.getElementById('ntSyBtn'); if(b) b.click(); }catch(e){} }; el.onclick=go; el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } }; h.appendChild(el); }
  try{ const b=parent.document.getElementById('ntSyBtn'), l=b&&b.querySelector('.l'); const lab=(l&&l.textContent.trim())||'';
    const t=lab?(/همگام/.test(lab)?lab:'همگام '+lab):''; el.hidden=!t; el.lastChild.textContent=t; el.classList.toggle('bad',!!(b&&b.classList.contains('err'))||/نشد|نیست/.test(lab)); }catch(e){ el.hidden=true; } }
function khFs(){ const v=+lsl('ntui_fs','1')||1; document.documentElement.style.setProperty('--fs',String(Math.min(1.3,Math.max(1,v)))); }
khFs(); window.addEventListener('storage',e=>{ if(!e.key||e.key==='ntui_fs') khFs(); });
try{ document.body.classList.add('kh'); }catch(e){}
setTimeout(khSyncPill,300); setInterval(khSyncPill,5000);
/* تیک (بازبینی): دکمه شبیه چک‌باکس */
const CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
Object.assign(ICO,{filechk:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 14l2 2 4-4"/>',cart:'<path d="M3 4h2l2.4 11h10.2L20 7H6.2M9 20h.01M17 20h.01M12 7v5M9.5 9.5h5"/>',
  truck:'<path d="M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18a2 2 0 100-4 2 2 0 000 4zM17 18a2 2 0 100-4 2 2 0 000 4z"/>',ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  box0:'<rect x="5" y="5" width="14" height="14" rx="2"/>',boxck:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',chevd:'<path d="M6 9l6 6 6-6"/>',chevu:'<path d="M6 15l6-6 6 6"/>',
  excl:'<path d="M12 4v10M12 19v.5"/>',back:'<path d="M5 12h14M13 6l6 6-6 6"/>',moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',sync:'<path d="M4 12a8 8 0 0113.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 01-13.7 5.6L4 15M4 20v-5h5"/>',
  bell:'<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0"/>',swap:'<path d="M4 8h14l-4-4M20 16H6l4 4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>'});
