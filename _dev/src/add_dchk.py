# امروز و مدیریت: کارت «چک روزانه دستگاه‌ها» (شیفت جاری؛ دستگاه‌های اصلی ntStops.TRACKED). قاعده و داده در dchk.js، فرم در qr.js.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
CSS=r"""
#dcCard{order:2}
#dcCard h2{display:flex;align-items:center;gap:8px}
#dcCard h2 em{font-style:normal;margin-inline-start:auto;font-size:.76rem;font-weight:900;padding:2px 10px;border-radius:10px;background:#FFF1CF;color:#7A4D00}
#dcCard h2 em.ok{background:#E6F4EA;color:#1E5E3A}
.dcbar{display:flex;gap:4px;margin:4px 0 8px}.dcbar i{flex:1;height:8px;border-radius:3px;background:#D5DCE3}.dcbar i.ok{background:#1E7F4F}.dcbar i.bad{background:#B3261E}
.dcr{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;padding:6px 2px;border:0;border-top:1px solid #EEF1F4;background:none;font:inherit;font-size:.86rem;color:#1B2430;text-align:start;cursor:pointer}
.dcr:first-of-type{border-top:0}.dcr span{flex:1;min-width:0}
.dcr b{flex:none;font-size:.74rem;font-weight:900;padding:2px 10px;border-radius:9px;background:#FFF1CF;color:#7A4D00;max-width:62%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dcr b.bad{background:#FBE3DF;color:#A32018}.dcr b.ok{background:#E6F4EA;color:#1E5E3A}
.dcm{font-size:.76rem;color:#51606E;margin-top:6px}
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]
rep('<div class="kpis" id="kpis" aria-label="خلاصه ماه"></div>','<div class="kpis" id="kpis" aria-label="خلاصه ماه"></div>\n  <div class="card" id="dcCard" hidden><h2 style="color:#1B2430">چک روزانه دستگاه‌ها <em id="dcN"></em></h2><div class="dcbar" id="dcBar"></div><div id="dcList"></div><div class="dcm" id="dcM"></div></div>')
JS=r"""
/* ===== چک روزانه دستگاه‌ها (dchk.js در پوسته) ===== */
function dcRender(){ const box=document.getElementById('dcCard'); if(!box) return;
  const P=parent, DC=P.ntDChk, S=P.ntStops; let see=true; try{ see=!P.ntSync || P.ntSync.canSee('دفترچه قرائت'); }catch(e){}
  if(!DC || !S || !S.TRACKED || !see){ box.hidden=true; return; }
  const raw=LS('nt_dchk_v1')||[], T=DC.now(), devs=S.TRACKED.slice();
  const rows=devs.map(dv=>{ const r=DC.get(raw,dv,T.d,T.sh), B=DC.bads(r), I={}; DC.items(dv).forEach(it=>{ I[it.k]=it.t; }); return {dv,r,B,I}; });
  const done=rows.filter(x=>x.r).length, left=devs.length-done;
  const n=document.getElementById('dcN'); n.textContent=left?fa(left)+' دستگاه مانده':'همه انجام شد'; n.className=left?'':'ok';
  document.getElementById('dcBar').innerHTML=rows.map(x=>`<i class="${x.r?(x.B.length?'bad':'ok'):''}"></i>`).join('');
  const ord=x=>x.B.length?0:(!x.r?1:2);
  document.getElementById('dcList').innerHTML=rows.slice().sort((a,b)=>ord(a)-ord(b)).map(x=>`<button type="button" class="dcr" data-dev="${esc(x.dv)}"><span>${esc(x.dv)}</span>${x.r?(x.B.length?`<b class="bad">${fa(x.B.length)} مشکل: ${esc(x.B.map(k=>x.I[k]||k).join('، '))}</b>`:`<b class="ok">سالم${x.r.at?' — '+fa(x.r.at):''}</b>`):'<b>انجام نشده</b>'}</button>`).join('');
  const m=String(T.d).slice(0,7), M=DC.list(raw).filter(x=>String(x.d).slice(0,7)===m), mb=M.reduce((a,x)=>a+DC.bads(x).length,0);
  document.getElementById('dcM').textContent=`شیفت ${T.sh}، ${fa(T.d)} — این ماه: ${fa(M.length)} چک، ${fa(mb)} مشکل پیدا شد`;
  box.hidden=false;
  box.querySelectorAll('.dcr').forEach(b=>b.addEventListener('click',()=>{ try{ const dv=(P.ntQr&&P.ntQr.DEVS||[]).find(d=>DC.nk(d.name)===DC.nk(b.dataset.dev)); if(dv) P.postMessage({nt:'qrdev',id:dv.id},'*'); }catch(e){} })); }
setTimeout(()=>{ try{ dcRender(); }catch(e){} },300);
addEventListener('storage',()=>{ try{ dcRender(); }catch(e){} });
"""
rep("function refreshLive(){ try{ head(); }catch(e){}","function refreshLive(){ try{ head(); }catch(e){} try{ dcRender(); }catch(e){}")
rep("function refreshLive(){",JS+"function refreshLive(){")
rep("html.mgmt .wrap>*:not(header):not(#kpis):not(#atCard)","html.mgmt .wrap>*:not(header):not(#kpis):not(#dcCard):not(#atCard)")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('dchk today')
