# شماره نسخه (اثر انگشت محتوا) در <meta name="nt-build"> — pwa.js با آن نسخه تازه را تشخیص می‌دهد. آخرین قدم build.sh.
import hashlib,sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
assert '<meta name="nt-build" content="' not in s[:s.find('</head>')] and s.count('</head>')>=1
h=hashlib.sha256(s.encode('utf-8')).hexdigest()[:16]
s=s.replace('</head>','<meta name="nt-build" content="'+h+'">\n</head>',1)
open(p,'w',encoding='utf-8').write(s); print('build',h)
