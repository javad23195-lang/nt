# طرح نو (مرحله ۱): خاکستری‌های سرد قدیمی → خاکستری گرم (هم‌رنگ بخش تدارکات)، و رنگ اصلی دکمه‌ها → سرمه‌ای تیره.
# بعد از build.py و no_dot روی کل خروجی (پوسته و همه فرم‌ها). رنگ‌های وضعیت (قرمز، نارنجی، سبز، آبی اطلاع) دست نمی‌خورد.
import json,base64,sys,re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
MAP={
 # زمینه‌ها
 'EEF1F4':'F4F3F0','EDF1F3':'F4F3F0','F2F5F7':'F4F3F0','F1F4F7':'F4F3F0','F6F8FA':'F7F6F3','F6F8F9':'F7F6F3','F7F9FA':'F7F6F3',
 # خط‌ها و حاشیه‌ها (کم‌رنگ‌تر و گرم)
 'D5DCE3':'E6E3DD','DDE3E9':'E8E5DF','DDE4E9':'E8E5DF','E3E8ED':'ECE9E3','E3E8EC':'ECE9E3','D6DFE5':'E3DFD8','C7D2DC':'D9D4CB',
 'C3CDD5':'D6D1C8','C9D2DA':'D6D1C8','B2BCC4':'C4BEB4','9FB4C3':'C4BEB4','9AA8B5':'B9B3A9','9AA6AF':'B9B3A9',
 'EEF2F5':'F4F3F0','EEF3F6':'F4F3F0','EDF1F4':'F4F3F0','E8EDF2':'ECE9E3','E4EAEE':'E8E5DF','E8ECEF':'ECE9E3','E9EDF1':'ECE9E3','E7EBEF':'ECE9E3','E8EDF0':'ECE9E3',
 'E6EBEF':'ECE9E3','E9EDF2':'ECE9E3','E8ECF0':'ECE9E3','E1E7EC':'E8E5DF','E4E9EE':'E8E5DF','D5DCE2':'E6E3DD','DCE2E8':'E3DFD8',
 'B5C0CA':'C4BEB4','C9D0D9':'D6D1C8','C9D1D9':'D6D1C8','C3CBD3':'D6D1C8','CBD3DB':'D6D1C8','C7D0D9':'D6D1C8','AEB8C2':'C4BEB4','AEB8C1':'C4BEB4','9AA5AE':'B9B3A9','9AA7B1':'B9B3A9',
 # متن کم‌رنگ
 '51606E':'5E6670','4E5864':'545C66','8A959E':'8C9198','8A97A3':'8C9198','8C99A5':'8C9198','68757F':'6A7078','5A6772':'5E6670','5B6874':'5E6670',
 # رنگ اصلی دکمه‌ها
 '0B5C7A':'15212C','08465D':'0A141C',
}
RX=re.compile(r'#('+'|'.join(MAP)+r')(?![0-9A-Fa-f])',re.I)
def fix(t): return RX.sub(lambda m:'#'+MAP[m.group(1).upper()],t)
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j]); n=0
for d in docs:
    t=base64.b64decode(d['b64']).decode('utf-8'); t2=fix(t)
    if t2!=t: n+=len(RX.findall(t)); d['b64']=base64.b64encode(t2.encode('utf-8')).decode('ascii')
a,b=s[:i],s[j:]; n+=len(RX.findall(a))+len(RX.findall(b))
s=fix(a)+json.dumps(docs,ensure_ascii=False)+fix(b)
open(p,'w',encoding='utf-8').write(s); print('warm',n)
