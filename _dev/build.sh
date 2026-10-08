#!/bin/sh
# ساخت سامانه-نت.html از روی کدها. خروجی: _dev/out.html
set -e
cd "$(dirname "$0")/src"
T=$(mktemp -d)
python3 patch_daftar.py base-user-1047.html "$T/b2.html"
python3 add_tavaqof.py "$T/b2.html" "$T/b3.html"
python3 add_report.py "$T/b3.html" "$T/b4.html"
python3 build.py "$T/b4.html" ../out.html
echo "ساخته شد: _dev/out.html — بعد از آزمایش، به جای ../سامانه-نت.html بگذارید"
