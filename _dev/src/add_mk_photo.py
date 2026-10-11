# «ثبت مشکلات»: دکمه عکس روی هر مشکل (عکس در همان حافظه زبانه «عکس‌ها»، فقط روی همین گوشی)
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='ثبت مشکلات')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
rep("""          ${r.state==='بسته'?`<span class="fixed">بسته — رفع ${esc(r.fix)}</span>`:`<span>${esc(r.state)}</span>`}
        </div>
      </div>`).join('');""","""          ${r.state==='بسته'?`<span class="fixed">بسته — رفع ${esc(r.fix)}</span>`:`<span>${esc(r.state)}</span>`}
        </div>
        <div class="phr"><button type="button" class="mkcam" data-c="${i}">📷 عکس</button>${phN(r)?`<button type="button" class="mkview" data-v="${i}">دیدن ${fa(phN(r))} عکس</button>`:''}</div>
      </div>`).join('');
    [...box.querySelectorAll('.mkcam')].forEach(b=>b.addEventListener('click',()=>{ phRow=rows[+b.dataset.c]; $('mkCam').value=''; $('mkCam').click(); }));
    [...box.querySelectorAll('.mkview')].forEach(b=>b.addEventListener('click',()=>{ const r=rows[+b.dataset.v]; try{ parent.ntPhotoDraft={dev:r.dev}; parent.postMessage({nt:'go',tab:'عکس‌ها'},'*'); }catch(e){} }));""")
rep("</style>",""".phr{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
.phr button{min-height:40px;padding:0 14px;border-radius:10px;border:1px solid #9AA8B5;background:#fff;font:inherit;font-size:.88rem;font-weight:700;color:#17212B;cursor:pointer}
.phr .mkview{color:#0B5C7A;border-color:#0B5C7A}
</style>""")
rep("const SKEY='nt_moshkel_v1';",r"""const SKEY='nt_moshkel_v1';
/* ---------- عکس هر مشکل: خود عکس در IndexedDB «ntphotos» همین گوشی، اطلاعاتش در nt_photos_v1 (همگام نمی‌شود) ---------- */
let phRow=null;
(function(){ const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.setAttribute('capture','environment'); i.id='mkCam'; i.hidden=true; document.body.appendChild(i); })();
function phList(){ try{ const a=JSON.parse(localStorage.getItem('nt_photos_v1')||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function phN(r){ return r&&r.pid?phList().filter(p=>p&&p.mk===r.pid).length:0; }
function phDb(){ return new Promise((res,rej)=>{ try{ const q=indexedDB.open('ntphotos',1); q.onupgradeneeded=()=>{ const d=q.result; d.createObjectStore('full'); d.createObjectStore('thumb'); }; q.onsuccess=()=>res(q.result); q.onerror=()=>rej(q.error); }catch(e){ rej(e); } }); }
function phPut(db,st,id,b){ return new Promise((res,rej)=>{ const tx=db.transaction(st,'readwrite'); tx.objectStore(st).put(b,id); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }
function phShrink(file,max,q){ return new Promise((res,rej)=>{
  const done=src=>{ const w0=src.width||src.naturalWidth, h0=src.height||src.naturalHeight, k=Math.min(1,max/Math.max(w0,h0)), w=Math.round(w0*k), h=Math.round(h0*k);
    const c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(src,0,0,w,h); c.toBlob(b=>b?res({blob:b,w,h}):rej(new Error('blob')),'image/jpeg',q); };
  const viaImg=()=>{ const u=URL.createObjectURL(file), im=new Image(); im.onload=()=>{ done(im); URL.revokeObjectURL(u); }; im.onerror=()=>rej(new Error('img')); im.src=u; };
  if(window.createImageBitmap) createImageBitmap(file,{imageOrientation:'from-image'}).then(done,viaImg); else viaImg(); }); }
function phToday(){ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const g=t=>p.find(x=>x.type===t).value; return `${g('year')}/${g('month')}/${g('day')}`; }catch(e){ return ''; } }
document.addEventListener('change',async e=>{
  if(!e.target||e.target.id!=='mkCam') return; const f=e.target.files&&e.target.files[0], r=phRow; phRow=null; if(!f||!r) return;
  try{
    if(!r.pid) r.pid='m'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const a=await phShrink(f,1280,.8), th=await phShrink(f,256,.7), db=await phDb(), id='f'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    await phPut(db,'full',id,a.blob); await phPut(db,'thumb',id,th.blob);
    const L=phList(); let by=''; try{ by=(parent.ntSync&&parent.ntSync.myName&&parent.ntSync.myName())||''; }catch(x){}
    L.push({id,dev:r.dev,sec:r.sys||'سایر',part:String(r.desc||'').slice(0,40),note:'مشکل ثبت‌شده',date:phToday(),by,ts:Date.now(),w:a.w,h:a.h,mk:r.pid});
    localStorage.setItem('nt_photos_v1',JSON.stringify(L)); render(); say('عکس ثبت شد');
  }catch(x){ say('عکس ثبت نشد',true); }
});""")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('mk photo')
