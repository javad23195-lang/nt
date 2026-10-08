import sys
src, out = sys.argv[1], sys.argv[2]
s=open(src,encoding='utf-8').read()
css=open('sync.css',encoding='utf-8').read()
js=open('sync.js',encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (a[:60], s.count(a))
    s=s.replace(a,b)
# 1) css
rep("</style>\n</head>", css+"</style>\n</head>")
# 2) دکمه و نوار وضعیت
rep('  <div class="tabs" id="tabs"></div>\n',
    '  <div class="tabrow"><div class="tabs" id="tabs"></div><button type="button" class="sybtn" id="ntSyBtn"><span class="d"></span><span class="tx">اطلاعات مشترک</span></button></div>\n'
    '  <div class="sybar" id="ntSyBar" hidden><span id="ntSyBarT"></span><button type="button" id="ntSyBarB" hidden></button></div>\n')
rep('<div class="stage" id="stage">',
    '<div class="sydlg" id="ntSyDlg" role="dialog" aria-modal="true" aria-labelledby="ntSyH" hidden><div class="sybox"><h2 id="ntSyH"></h2><div id="ntSyBody"></div></div></div>\n'
    '<div class="sytoast" id="ntSyToast" role="status" aria-live="polite" hidden></div>\n'
    '<div class="stage" id="stage">')
# 3) شروع: در حالت مشاهده، اول اطلاعات مشترک گرفته می‌شود
rep("show(start);\nbadges();\nsetTimeout(()=>{ try{ if(!frames[0].dataset.loaded){",
    "let ntBooted=false;\n"
    "function ntBoot(){ if(ntBooted || window.ntLocked) return; ntBooted=true; if(active<0) show(start); badges(); }\n"
    "setTimeout(ntBoot,6000);   // اگر بخش اطلاعات مشترک پاسخ نداد، سامانه باز هم باز شود\n"
    "setTimeout(function f(){ if(!ntBooted){ setTimeout(f,800); return; } try{ if(!frames[0].dataset.loaded){")
rep("frames[0].dataset.loaded='1'; } }catch(e){} },1500);\nsetInterval(badges,3000);",
    "frames[0].dataset.loaded='1'; } }catch(e){} },1500);\nsetInterval(()=>{ if(ntBooted) badges(); },3000);")
# 4) یادآورها در حالت مشاهده نشان داده نمی‌شود
rep("function alCheck(){\n", "function alCheck(){\n  if(window.ntViewer || window.ntLocked){ alHide(); return; }\n")
# 4b) نشان روی زبانه «توقف شیفت»: دستگاه‌هایی که امروز هنوز متوقف‌اند
rep("    const key=KEYMAP[name]; if(!key) return 0;",
    "    if(name==='توقف شیفت'){ const o=JSON.parse(localStorage.getItem('nt_tavaqof_v1')||'{}'), K=todayKey(); let n=0;\n"
    "      Object.keys(o||{}).forEach(k=>{ if(k.indexOf(K+'|')===0) ((o[k]&&o[k].stops)||[]).forEach(x=>{ if(!x.to) n++; }); }); return n; }\n"
    "    const key=KEYMAP[name]; if(!key) return 0;")
# 4c) زبانه «امروز» اگر پنهان است، پشت صحنه باز نشود
rep("setTimeout(function f(){ if(!ntBooted){ setTimeout(f,800); return; } try{ if(!frames[0].dataset.loaded){",
    "setTimeout(function f(){ if(!ntBooted){ setTimeout(f,800); return; } try{ if(!frames[0].dataset.loaded && !tabs[0].hidden){")

# 5) بخش همگام‌سازی
rpt=open('report.js',encoding='utf-8').read()
rep("\n</script>\n</body>\n</html>", "\n</script>\n<script>\n"+js+"</script>\n<script>\n"+rpt+"</script>\n</body>\n</html>")
open(out,'w',encoding='utf-8').write(s)
print('built',len(s))
