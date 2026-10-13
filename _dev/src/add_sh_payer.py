# شناسنامه: (۱) فهرست کشویی فاکتورها نام‌های تازه را به یاد دارد (تعمیرکار، تامین‌کننده، شرح، قطعه)
# (۲) فاکتور نقدی: «پرداخت‌کننده» (خالی = شرکت؛ اگر از کارت شخصی، فقط نام شخص). شماره کارت ذخیره نمی‌شود.
# نام پرداخت‌کننده در ستون تازه AL اکسل می‌رود (ستون X/Y همان «نقدی» می‌ماند).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='شناسنامه')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)

# --- فهرست‌ها: داده پایه + افزوده‌های من + نام‌های ردیف‌های ثبت‌شده (از سیستم‌های دیگر هم) ---
rep("combo('xi'+k+'d','xl'+k+'d',src(DATA.desc),","combo('xi'+k+'d','xl'+k+'d',src(xNames('desc')),")
rep("combo('xi'+k+'w','xl'+k+'w',src(DATA.rep),","combo('xi'+k+'w','xl'+k+'w',src(xNames('rep')),")
rep("combo('xi'+k+'d','xl'+k+'d',src(DATA.part),","combo('xi'+k+'d','xl'+k+'d',src(xNames('part')),")
rep("combo('xi'+k+'w','xl'+k+'w',src(DATA.sup),","combo('xi'+k+'w','xl'+k+'w',src(xNames('sup')),")
# کادر پرداخت‌کننده
rep("""autocomplete="off"></div>
    </div></div>`).join('')""","""autocomplete="off"></div>
    </div>
    <div class="field xby"${x.pay==='نقدی'?'':' hidden'}><label for="xi${k}b">پرداخت‌کننده</label><div class="combo"><input id="xi${k}b" data-f="by" value="${esc(x.by||'')}" autocomplete="off" placeholder="خالی = شرکت · کارت شخصی: نام شخص"><div class="combo-list" id="xl${k}b"></div></div><div class="fhint">فقط نام. شماره کارت ذخیره نمی‌شود.</div></div>
    </div>`).join('')""")
rep("  }catch(e){} });\n}\n/* مقدارها از خود کادرها","    combo('xi'+k+'b','xl'+k+'b',src(payNames()),true,null,{list:myPayers,save:()=>savePayers()});\n  }catch(e){} });\n}\n/* مقدارها از خود کادرها")
rep("if(f==='t'){ xSync(); xRender(); } });","if(f==='t'){ xSync(); xRender(); }\n  if(f==='pay'){ const b=c.querySelector('.xby'); if(b){ b.hidden=e.target.value!=='نقدی'; if(!b.hidden){ const q=b.querySelector('input'); if(q) q.focus(); } } } });")
# فاکتورهای دیگر
rep("payK:A?'':x.pay, docK:A?'':String(x.doc).trim(),","payK:A?'':x.pay, docK:A?'':String(x.doc).trim(),\n      byA:(A&&x.pay==='نقدی')?String(x.by||'').trim():'', byK:(!A&&x.pay==='نقدی')?String(x.by||'').trim():'',")
# ردیف اول
rep("payK:hasK?$('fPayK').value:'', docK:hasK?$('fDocK').value.trim():''};",
    "payK:hasK?$('fPayK').value:'', docK:hasK?$('fDocK').value.trim():'',\n    byA:(hasA&&$('fPayA').value==='نقدی')?$('fByA').value.trim():'', byK:(hasK&&$('fPayK').value==='نقدی')?$('fByK').value.trim():''};\n  try{ payRemember(rec.byA); payRemember(rec.byK); }catch(e){}")
rep("$('fPayA').value=A.pay||''; $('fDocA').value=String(A.doc||'').trim(); }","$('fPayA').value=A.pay||''; $('fDocA').value=String(A.doc||'').trim(); $('fByA').value=String(A.by||'').trim(); }")
rep("$('fPayK').value=K.pay||''; $('fDocK').value=String(K.doc||'').trim(); }","$('fPayK').value=K.pay||''; $('fDocK').value=String(K.doc||'').trim(); $('fByK').value=String(K.by||'').trim(); }")
rep("xSync(); xinv.forEach(x=>{ delete x.__main; });","xSync(); xinv.forEach(x=>{ delete x.__main; }); $('fByA').value=''; $('fByK').value='';")
rep("pay:$('fPayA').value,doc:$('fDocA').value});","pay:$('fPayA').value,doc:$('fDocA').value,by:$('fByA').value});")
rep("pay:$('fPayK').value,doc:$('fDocK').value}); }","pay:$('fPayK').value,doc:$('fDocK').value,by:$('fByK').value}); }")
rep("$('fPayK').value=r.payK; $('fDocK').value=r.docK;","$('fPayK').value=r.payK; $('fDocK').value=r.docK;\n  $('fByA').value=r.byA||''; $('fByK').value=r.byK||'';")
rep("  $('fDocA').value=''; $('fDocK').value='';","  $('fDocA').value=''; $('fDocK').value=''; $('fByA').value=''; $('fByK').value='';")
rep('<input id="fDocK" class="mono" autocomplete="off" placeholder="سند خرید">','<input id="fDocK" class="mono" autocomplete="off" placeholder="سند خرید"><input type="hidden" id="fByA"><input type="hidden" id="fByK">')
# فهرست ردیف‌ها
rep("${r.rep?' · '+esc(r.rep):''}</span>`:''}","${r.rep?' · '+esc(r.rep):''}${r.byA?' · کارت شخصی: '+esc(r.byA):''}</span>`:''}")
rep("${r.sup?' · '+esc(r.sup):''}</span>`:''}","${r.sup?' · '+esc(r.sup):''}${r.byK?' · کارت شخصی: '+esc(r.byK):''}</span>`:''}")
# اکسل: ستون AL
rep("/* ---------- خروجی: ۳۷ ستون A تا AK ---------- */","/* ---------- خروجی: ۳۸ ستون A تا AL (AL = پرداخت‌کننده شخصی) ---------- */")
rep("    r.costA, r.costK, F.AJ, fx(F.AK,R)           // AH AI AJ AK\n  ].join('\\t');",
    "    r.costA, r.costK, F.AJ, fx(F.AK,R),          // AH AI AJ AK\n    payBy(r)                                     // AL\n  ].join('\\t');")

JS=r"""
/* ---------- نام‌ها برای فهرست کشویی فاکتورها ---------- */
function xNames(f){
  const base={rep:DATA.rep,sup:DATA.sup,desc:DATA.desc,part:DATA.part}[f]||[];
  const mine={rep:myReps,sup:mySups,desc:myDesc2,part:myPart2}[f]||[];
  let fromRows=[]; try{ fromRows=rows.map(r=>r[f]).filter(v=>v&&String(v).trim()&&v!=='**'); }catch(e){}
  return base.concat(mine,fromRows);
}
/* ---------- پرداخت‌کننده (کارت شخصی) — فقط نام ---------- */
const PKEY='nt_sh_payers_v1'; let myPayers=[];
try{ const a=localStorage.getItem(PKEY); if(a) (JSON.parse(a)||[]).forEach(x=>{ if(typeof x==='string') myPayers.push(x); }); }catch(e){}
function savePayers(){ try{ localStorage.setItem(PKEY,JSON.stringify(myPayers)); }catch(e){} }
function payNames(){ let r=[]; try{ rows.forEach(x=>{ if(x.byA) r.push(x.byA); if(x.byK) r.push(x.byK); }); }catch(e){} return myPayers.concat(r); }
function payRemember(n){ n=String(n||'').trim(); if(!n||myPayers.some(x=>norm(x)===norm(n))) return; myPayers.push(n); savePayers(); }
function payBy(r){ const a=String(r.byA||'').trim(), k=String(r.byK||'').trim();
  if(a&&k&&norm(a)!==norm(k)) return 'اجرت: '+a+' / خرید: '+k; return a||k||''; }
"""
rep("/* ---------- فاکتورهای دیگرِ همین تعمیر ---------- */",JS+"/* ---------- فاکتورهای دیگرِ همین تعمیر ---------- */")
# فاکتورهای دیگر هم نام را به یاد بسپارند
rep("    try{ if(A) remember(r.rep,myReps,cRep); else remember(r.sup,mySups,cSup); }catch(e){} });",
    "    try{ if(A) remember(r.rep,myReps,cRep); else remember(r.sup,mySups,cSup); }catch(e){}\n    try{ payRemember(r.byA||r.byK); if(A) rememberIn(r.desc,myDesc2,cDesc); else rememberIn(r.part,myPart2,cPart); }catch(e){} });")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('sh payer')
