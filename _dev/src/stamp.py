# شماره نسخه (اثر انگشت محتوا) در <meta name="nt-build"> — pwa.js با آن نسخه تازه را تشخیص می‌دهد. آخرین قدم build.sh.
import hashlib,sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
assert '<meta name="nt-build" content="' not in s[:s.find('</head>')] and s.count('</head>')>=1
h=hashlib.sha256(s.encode('utf-8')).hexdigest()[:16]
import datetime
def _j(g):
  gy,gm,gd=g.year,g.month,g.day; g_d_m=[0,31,59,90,120,151,181,212,243,273,304,334]
  gy2=gy+1 if gm>2 else gy; days=355666+(365*gy)+((gy2+3)//4)-((gy2+99)//100)+((gy2+399)//400)+gd+g_d_m[gm-1]
  jy=-1595+(33*(days//12053)); days%=12053; jy+=4*(days//1461); days%=1461
  if days>365: jy+=(days-1)//365; days=(days-1)%365
  jm=1+days//31 if days<186 else 7+(days-186)//30; jd=1+(days%31 if days<186 else (days-186)%30)
  return '%d.%02d.%02d'%(jy,jm,jd)
ver=_j((datetime.datetime.utcnow()+datetime.timedelta(hours=3,minutes=30)).date())   # نسخه = تاریخ ساخت (شمسی)
s=s.replace('</head>','<meta name="nt-build" content="'+h+'">\n<meta name="nt-ver" content="'+ver+'">\n</head>',1)
open(p,'w',encoding='utf-8').write(s); print('build',h)
