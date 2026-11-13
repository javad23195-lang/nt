# آیکون‌های تازه (سرمه‌ای + کهربایی، از uicons.js) به جای شکلک‌ها در صفحه‌ها:
# ⚡ قرائت سریع، ⛽ سوخت، 🎤 میکروفن، 📷 عکس/دوربین، 🖨 چاپ، 📋 کپی، ★ ستاره، ✎ ویرایش، ✕ حذف، ✓ ذخیره.
# فقط جاهایی که HTML است (نه textContent یا پیام). آیکون‌ها رنگ خودشان را دارند (currentColor = رنگ متن دکمه).
import json,base64,sys,re
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
u=open('uicons.js',encoding='utf-8').read()
P=json.loads(u[u.index('const NTI_P=')+12:u.index('};\nwindow.NTI')+1])
def I(k):
    return ('<svg class="nti" viewBox="0 0 24 24" width="1.2em" height="1.2em" style="vertical-align:-.24em;flex:none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+P[k]+'</svg>').replace("'",'"')
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
D={d['name']:d for d in docs}
def doc(n,pairs):
    d=D[n]; t=base64.b64decode(d['b64']).decode('utf-8')
    for a,b,c in pairs:
        if hasattr(a,'pattern'):
            k=len(a.findall(t)); assert k==c,(n,a.pattern,k,c); t=a.sub(b,t)
        else:
            assert t.count(a)==c,(n,a[:70],t.count(a),c); t=t.replace(a,b)
    d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
MIC=[("btn.textContent='🎤';","btn.innerHTML='"+I('mic')+"';",3)]
STAR=[('<span class="star">★</span>','<span class="star">'+I('star')+'</span>',1)]
ED=re.compile(r'(<button[^>]*>)✎(</button>)'); EDS=lambda m:m.group(1)+I('edit')+m.group(2)
DL=re.compile(r'(<button(?=[^>]*(?:class="[^"]*\b(?:del|drop|fdl|fld|xdel|dvdel|gdel)\b|(?:title|aria-label)="حذف))[^>]*>)✕(</button>)'); DLS=lambda m:m.group(1)+I('del')+m.group(2)
ARM=("b.textContent='✕';},4000);","b.innerHTML='"+I('del')+"';},4000);",1)
SV=re.compile(r'(<button[^>]*title="ذخیره"[^>]*>)✓(</button>)'); SVS=lambda m:m.group(1)+I('done')+m.group(2)
doc('دفترچه قرائت',[
 ('aria-pressed="false">⚡ قرائت سریع</button>','aria-pressed="false">'+I('bolt')+' قرائت سریع</button>',1),
 ("$('fastBtn').textContent=on?'⚡ قرائت سریع (روشن)':'⚡ قرائت سریع';","$('fastBtn').innerHTML=on?'"+I('bolt')+" قرائت سریع (روشن)':'"+I('bolt')+" قرائت سریع';",1),
 ('">⛽ سوخت / روغن','">'+I('fuel')+' سوخت / روغن',1),
 (ED,EDS,1),(DL,DLS,2)])
doc('برنامه روزانه',MIC+[(ED,EDS,1),(DL,DLS,1)])
doc('ثبت مشکلات',MIC+STAR+[('data-c="${i}">📷 عکس</button>','data-c="${i}">'+I('cam')+' عکس</button>',1),(ED,EDS,3),(DL,DLS,2),ARM])
doc('شناسنامه',STAR+[('با ★','با '+I('star'),4),(ED,EDS,3),(DL,DLS,6),ARM])
doc('خدمات',STAR+[('>🖨</button>','>'+I('print')+'</button>',1),(ED,EDS,2),(DL,DLS,2),ARM])
doc('درخواست خرید',STAR+[('title="کپی برای مسنجر انبار">📋</button>','title="کپی برای مسنجر انبار">'+I('copy')+'</button>',1),(ED,EDS,2),(DL,DLS,1),ARM,(SV,SVS,1)])
doc('انبار',[(ED,EDS,1),(DL,DLS,1)])
doc('امروز',[(ED,EDS,1),(SV,SVS,1)])
doc('عکس‌ها',[('id="pCam">📷 دوربین</button>','id="pCam">'+I('cam')+' دوربین</button>',1)])
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('uicons docs')
