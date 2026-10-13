# دفترچه قرائت، تاریخچه دستگاه: تاریخ کامل دیده شود (کادر پهن‌تر با قلم ۱۶)؛ «ذخیره» فقط هنگام اصلاح همان ردیف.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d['b64']).decode('utf-8')
CSS=""".hrow{gap:6px;padding-inline:10px}
.hrow input.hdate{width:118px!important;padding:6px 4px!important;letter-spacing:0;font-variant-numeric:tabular-nums;direction:ltr}
.hrow input.hval{min-width:64px;font-variant-numeric:tabular-nums}
.hrow .hg{flex:none;min-width:2.6em;text-align:center}
.hrow:not(.editing) .hsave{display:none}
"""
k0=t.rfind("</style>"); assert k0>0; t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('df hist')
