# تصویرهای ساده دستگاه‌ها (src/icons/*.svg، کشیده‌شده از روی عکس، بدون آرم و نوشته) → icons.js
# اجرا در build.sh. خروجی را دستی ویرایش نکنید.
import os,re,json
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'icons')
out={}
for f in sorted(os.listdir(D)):
    if not f.endswith('.svg'): continue
    s=open(os.path.join(D,f),encoding='utf-8').read()
    s=re.sub(r'<!--.*?-->','',s,flags=re.S); s=re.sub(r'\s*\n\s*',' ',s).strip(); s=re.sub(r'>\s+<','><',s)
    assert '<script' not in s.lower() and 'href' not in s.lower() and ' on' not in s.lower().replace(' opacity',''), f
    s=s.replace('<svg ','<svg class="ntico" aria-hidden="true" focusable="false" ',1)
    out[f[:-4]]=s
js=open(os.path.join(os.path.dirname(D),'icons.tpl.js'),encoding='utf-8').read().replace('/*SVG*/{}',json.dumps(out,ensure_ascii=False))
open(os.path.join(os.path.dirname(D),'icons.js'),'w',encoding='utf-8').write(js)
print('icons',len(out),sum(len(v) for v in out.values()))
