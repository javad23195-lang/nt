# سازنده uicons.js (آیکون‌های رابط: سرمه‌ای = currentColor، کهربایی، جزئیات سفید). در زنجیره ساخت نیست؛
# بعد از تغییر این فایل یک بار اجرا شود: python3 mk_uicons.py  → uicons.js
import json,math
A='#E6A52E'
F="fill='currentColor' stroke='none'"
AF=f"fill='{A}' stroke='none'"
AS=f"stroke='{A}'"
W="fill='#fff' stroke='none'"
def gear(cx,cy,r1,r2,n=8,tw=.42):
    p=[]
    for k in range(n):
        a0=2*math.pi*k/n
        for (a,r) in ((a0-tw*math.pi/n*1.25,r1),(a0-tw*math.pi/n,r2),(a0+tw*math.pi/n,r2),(a0+tw*math.pi/n*1.25,r1)):
            p.append(f"{cx+r*math.cos(a):.2f} {cy+r*math.sin(a):.2f}")
    return 'M'+'L'.join(p)+'Z'
I={
# ---- ناوبری ----
'today':f"<rect x='3' y='5' width='18' height='16' rx='3' stroke-width='2.2'/><path d='M3.2 9.5h17.6' stroke-width='2.2'/><rect x='7' y='2.6' width='2.2' height='4.6' rx='1.1' {AF}/><rect x='14.8' y='2.6' width='2.2' height='4.6' rx='1.1' {AF}/><g {F}><rect x='6.2' y='12' width='2.4' height='2.2' rx='.5'/><rect x='10' y='12' width='2.4' height='2.2' rx='.5'/><rect x='6.2' y='15.8' width='2.4' height='2.2' rx='.5'/></g><circle cx='17' cy='17' r='4.8' {AF}/><path d='M15 17l1.4 1.4 2.6-2.6' stroke='#fff' stroke-width='1.8'/>",
'plan':f"<rect x='4.5' y='4' width='15' height='18' rx='2.5' stroke-width='2.2'/><rect x='8.5' y='2.4' width='7' height='3.8' rx='1.2' {F}/><path d='M7.5 11l1.2 1.2 2-2M7.5 16l1.2 1.2 2-2' {AS} stroke-width='1.9'/><path d='M13 11.2h3.5M13 16.2h3.5' stroke-width='2'/>",
'box':f"<path d='M2.5 9.5L12 4l9.5 5.5M4.5 9v12M19.5 9v12' stroke-width='2.3'/><rect x='10.2' y='10' width='3.6' height='3.6' rx='.4' {AF}/><rect x='7.8' y='14.4' width='3.8' height='3.8' rx='.4' {AF}/><rect x='12.4' y='14.4' width='3.8' height='3.8' rx='.4' {AF}/><path d='M6 21h12' stroke-width='2'/>",
'read':f"<circle cx='12' cy='12' r='9.2' stroke-width='2.3'/><path d='M12 5.3v1.3M7.2 7.3l.9.9M5.4 12h1.3M18.6 12h-1.3' stroke-width='1.8'/><path d='M12 12l4-4' {AS} stroke-width='2.2'/><circle cx='12' cy='12' r='1.8' {AF}/><rect x='8.6' y='15.2' width='6.8' height='2.6' rx='.8' {AF}/>",
'warn':f"<path d='M12 3.2l9.4 16.6H2.6z' {AS} stroke-width='2.4'/><path d='M12 9.5v4.6' stroke-width='2.6'/><circle cx='12' cy='17' r='1.4' {F}/>",
'id':f"<rect x='2.5' y='5' width='19' height='14' rx='2.6' stroke-width='2.2'/><circle cx='8.3' cy='10.2' r='2.1' {F}/><path d='M5 16.3c.4-2 1.7-2.9 3.3-2.9s2.9.9 3.3 2.9z' {F}/><path d='M14 10h4.5M14 13h4.5M14 16h3' {AS} stroke-width='1.9'/>",
'wr':f"<path d='M16.2 2.8a5 5 0 0 0-4.8 6.6L3.6 17.2a2.2 2.2 0 0 0 3.1 3.1l7.8-7.8a5 5 0 0 0 6.6-4.8l-3.1 3.1-2.8-.5-.5-2.8z' {F}/><path d='M5.6 17.9l4.8-4.8' {AS} stroke-width='1.8'/>",
'cart':f"<path d='M2.5 4h2.4l2.6 11.5h10.4L20.5 7H6' stroke-width='2.2'/><path d='M9.5 9.8h7M10 12.6h5.5' {AS} stroke-width='1.9'/><circle cx='9' cy='19.5' r='1.9' {F}/><circle cx='17' cy='19.5' r='1.9' {F}/>",
'stop':f"<path d='M8 2.5h8l5.5 5.5v8L16 21.5H8L2.5 16V8z' {AS} stroke-width='1.6'/><path d='M8.8 5h6.4L19 8.8v6.4L15.2 19H8.8L5 15.2V8.8z' {F}/><rect x='9' y='8.5' width='2.2' height='7' rx='.6' {W}/><rect x='12.8' y='8.5' width='2.2' height='7' rx='.6' {W}/>",
'out':f"<path d='M1 12h8.2v5.4H1z' {F}/><path d='M9.2 13.4h2.4l1.6 2v2H9.2z' {F}/><circle cx='3.6' cy='18.3' r='1.6' fill='currentColor' stroke='#fff' stroke-width='.9'/><circle cx='10.4' cy='18.3' r='1.6' fill='currentColor' stroke='#fff' stroke-width='.9'/><path d='M3 8.5h8.5m0 0l-2-2m2 2l-2 2' {AS} stroke-width='2'/><path d='M14.5 21v-8.5l4.25-3.5 4.25 3.5V21z' stroke-width='1.8'/><rect x='17' y='15' width='3.5' height='6' rx='.4' {AF}/>",
'photo':f"<path d='M3.5 7.5h3.4l1.7-2.5h6.8l1.7 2.5h3.4a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5V9a1.5 1.5 0 0 1 1.5-1.5z' {F}/><circle cx='12' cy='13.3' r='3.9' fill='#fff' {AS} stroke-width='2.2'/><circle cx='18.2' cy='10' r='1' {AF}/>",
'more':f"<circle cx='5' cy='12' r='2.4' {AF}/><circle cx='12' cy='12' r='2.4' {AF}/><circle cx='19' cy='12' r='2.4' {AF}/>",
'doc':f"<path d='M6 2.8h8.5l4 4V21.2H6z' stroke-width='2.2'/><path d='M14 3v4.5h4.5' stroke-width='1.8'/><path d='M9 12h6.5M9 15.5h6.5M9 19h4' {AS} stroke-width='1.9'/>",
'plus':f"<circle cx='12' cy='12' r='10' {F}/><path d='M12 7.3v9.4M7.3 12h9.4' stroke='#fff' stroke-width='2.4'/>",
# ---- کارها و سربرگ ----
'run':f"<circle cx='12' cy='12' r='10' {F}/><path d='M10 7.6l6.4 4.4-6.4 4.4z' fill='{A}' {AS} stroke-width='1.4'/>",
'halt':f"<rect x='2.8' y='2.8' width='18.4' height='18.4' rx='4.5' {AS} stroke-width='2.4'/><rect x='7.3' y='7.3' width='9.4' height='9.4' rx='1.8' {F}/>",
'fuel':f"<path d='M3.5 21V5.5A2.5 2.5 0 0 1 6 3h5.5A2.5 2.5 0 0 1 14 5.5V21z' {F}/><path d='M2 21h13.5' stroke-width='2'/><path d='M14 8.5h1.8a1.7 1.7 0 0 1 1.7 1.7v5.6a1.4 1.4 0 0 0 2.8 0V8.4l-2.8-2.9' stroke-width='1.9'/><path d='M8.75 7.2c-1.9 2.4-2.9 3.9-2.9 5.2a2.9 2.9 0 0 0 5.8 0c0-1.3-1-2.8-2.9-5.2z' {AF}/>",
'prob':f"<path d='M12 3.2L21.6 20H2.4z' fill='currentColor' stroke='currentColor' stroke-width='1.8'/><path d='M12 9.2v5' {AS} stroke-width='2.6'/><circle cx='12' cy='17.1' r='1.45' {AF}/>",
'clock':f"<circle cx='11' cy='12.5' r='8.6' stroke-width='2.3'/><path d='M11 7.8v4.9l3 1.8' stroke-width='2.1'/><circle cx='18.4' cy='5.6' r='4.6' {AF}/><path d='M18.4 3.4v4.4M16.2 5.6h4.4' stroke='#fff' stroke-width='1.7'/>",
'sync':f"<path d='M6.6 19.5a4.6 4.6 0 0 1-.7-9.15A6.3 6.3 0 0 1 18.1 9.9a4.8 4.8 0 0 1-.4 9.6z' {F}/><path d='M9.2 14.6a2.9 2.9 0 0 1 5.1-1.9' {AS} stroke-width='1.7'/><path d='M14.6 11.2v1.9h-1.9' {AS} stroke-width='1.6'/><path d='M14.8 15.2a2.9 2.9 0 0 1-5.1 1.9' {AS} stroke-width='1.7'/><path d='M9.4 18.6v-1.9h1.9' {AS} stroke-width='1.6'/>",
'scan':f"<path d='M3 8.5V5a2 2 0 0 1 2-2h3.5M15.5 3H19a2 2 0 0 1 2 2v3.5M21 15.5V19a2 2 0 0 1-2 2h-3.5M8.5 21H5a2 2 0 0 1-2-2v-3.5' stroke-width='2.4'/><path d='M2.5 12h19' {AS} stroke-width='2.4'/><g {F}><rect x='7' y='6.5' width='3.2' height='3.2' rx='.5'/><rect x='13.8' y='6.5' width='3.2' height='3.2' rx='.5'/><rect x='7' y='14.3' width='3.2' height='3.2' rx='.5'/><rect x='13.8' y='14.3' width='3.2' height='3.2' rx='.5'/></g>",
'files':f"<path d='M2.5 6.2A1.7 1.7 0 0 1 4.2 4.5h5l2 2.2h8.6a1.7 1.7 0 0 1 1.7 1.7v9.9a1.7 1.7 0 0 1-1.7 1.7H4.2a1.7 1.7 0 0 1-1.7-1.7z' {F}/><path d='{gear(15.6,14.4,3.6,4.9)}' {AF}/><circle cx='15.6' cy='14.4' r='1.5' fill='currentColor' stroke='none'/>",
'theme':f"<path d='M12 4.5a7.5 7.5 0 0 0 0 15z' {AF}/><path d='M12 4.5a7.5 7.5 0 0 1 0 15c2.2-1.6 3.4-4.4 3.4-7.5S14.2 6.1 12 4.5z' {F}/><path d='M12 4.5a7.5 7.5 0 0 1 0 15' stroke-width='1.6'/><path d='M12 1.2v1.6M4.4 4.4l1.1 1.1M1.2 12h1.6M4.4 19.6l1.1-1.1M12 21.2v1.6' {AS} stroke-width='2'/>",
'exit':f"<path d='M10.5 2.8h7.7a1.8 1.8 0 0 1 1.8 1.8v14.8a1.8 1.8 0 0 1-1.8 1.8h-7.7z' {F}/><circle cx='12.9' cy='12' r='1' fill='#fff' stroke='none'/><path d='M14.6 12H3.2m3.4-3.6L3 12l3.6 3.6' {AS} stroke-width='2.5'/>",
'lock':f"<path d='M7.3 10.5V7.6a4.7 4.7 0 0 1 9.4 0v2.9' stroke-width='2.4'/><rect x='4' y='10' width='16' height='11.5' rx='2.6' {F}/><circle cx='12' cy='14.6' r='1.9' {AF}/><path d='M12 15.5v2.8' {AS} stroke-width='2.2'/>",
# ---- درون صفحه‌ها (جای شکلک) ----
'bolt':f"<path d='M13.6 2L4.8 13.4h6l-1.4 8.6 8.8-11.6h-6z' fill='{A}' stroke='#B97E10' stroke-width='1.1'/>",
'mic':f"<rect x='8.7' y='2.5' width='6.6' height='11.6' rx='3.3' {F}/><path d='M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.8 21h6.4' stroke-width='2'/><path d='M2.5 8.5v3.5M21.5 8.5v3.5' {AS} stroke-width='1.9'/>",
'cam':f"<path d='M3.5 7.5h3.4l1.7-2.5h6.8l1.7 2.5h3.4a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5V9a1.5 1.5 0 0 1 1.5-1.5z' {F}/><circle cx='12' cy='13.3' r='3.9' {AF}/><circle cx='12' cy='13.3' r='1.7' {F}/><path d='M19.6 1.6l-2.1 3h1.8l-1.3 2.6' {AS} stroke-width='1.5'/>",
'print':f"<path d='M7 8V3h10v5' stroke-width='2'/><rect x='2.5' y='8' width='19' height='9.5' rx='2.2' {F}/><rect x='6.8' y='13.2' width='10.4' height='8.3' rx='.8' fill='{A}' stroke='#fff' stroke-width='1.2'/><path d='M9 16.5h6M9 19h4' stroke='#fff' stroke-width='1.3'/><circle cx='18.2' cy='10.8' r='1' fill='#fff' stroke='none'/>",
'copy':f"<rect x='3' y='2.5' width='12' height='15' rx='2' stroke-width='2'/><rect x='8.5' y='6.5' width='12.5' height='15' rx='2' {F}/><path d='M11.5 11h6.5M11.5 14h6.5M11.5 17h4.5' {AS} stroke-width='1.8'/>",
'star':f"<path d='M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z' fill='{A}' {AS} stroke-width='1.2'/>",
'edit':f"<path d='M15.4 3.6a2.3 2.3 0 0 1 3.2 0l1.8 1.8a2.3 2.3 0 0 1 0 3.2L9.2 19.8l-5.4.4.4-5.4z' {F}/><path d='M4.2 14.8l5 5-5.4.4z' {AF}/>",
'del':f"<path d='M3.5 6.3h17' {AS} stroke-width='2.4'/><path d='M9.2 5.8V3.6h5.6v2.2' {AS} stroke-width='2'/><path d='M5.4 8.4h13.2l-1 11.3a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8z' {F}/><path d='M10 11.6v5.6M14 11.6v5.6' {AS} stroke-width='1.6'/>",
'done':f"<circle cx='12' cy='12' r='10' {F}/><path d='M7.2 12.4l3.2 3.2 6.4-6.6' {AS} stroke-width='2.6'/>",
}
I['menu']=f"<path d='M3.5 6h17M3.5 12h17' stroke='currentColor' stroke-width='2.4'/><path d='M3.5 18h10' {AS} stroke-width='2.4'/>"
I['close']=f"<path d='M6 6l12 12M18 6L6 18' stroke='currentColor' stroke-width='2.4'/>"
I['mgmt']=f"<rect x='3' y='3' width='18' height='18' rx='3.2' stroke-width='2.2'/><path d='M7.5 17.2v-3.4M12 17.2v-5.6M16.5 17.2v-7.6' stroke-width='2.4'/><path d='M6.6 10.4l3.6-3.1 2.9 2 4.3-3.9' {AS} stroke-width='2'/><circle cx='17.4' cy='5.4' r='1.4' {AF}/>"
I['pump']=I['fuel']
js="""/* آیکون‌های رابط سامانه (ساخته‌شده از mk_uicons.py — دستی ویرایش نشود).
   سبک: سرمه‌ای = currentColor (رنگ متن)، کهربایی #E6A52E، جزئیات سفید. هر آیکون رنگ خودش را دارد، پس در قاب‌ها هم درست است.
   NTI.svg('read',24) → <svg …>  */
const NTI_P="""+json.dumps(I,ensure_ascii=False,indent=0)+""";
window.NTI={P:NTI_P,svg(k,s,cls){ const p=NTI_P[k]; if(!p) return ''; return '<svg class="nti'+(cls?' '+cls:'')+'" viewBox="0 0 24 24"'+(s?' width="'+s+'" height="'+s+'"':'')+' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+p+'</svg>'; }};
"""
open('uicons.js','w',encoding='utf-8').write(js); print('uicons.js',len(I))
