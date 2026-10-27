/* اکسل مرتب (با رنگ، کادر، عرض ستون، راست‌به‌چپ، سرستون ثابت) بدون کتابخانه: فایل xlsx = zip ساده (بدون فشرده‌سازی) چند فایل XML.
   window.ntXl.table({title, sub, head:[...], rows:[[...]], widths:[...], num:[ستون‌های عددی], fill:[ستون‌های خالی برای پر کردن], total:{label, col, of}, foot, name, share, sheet})
   خروجی: 'share' | 'cancel' | نام فایل (دانلود). */
(function(){
  const enc=new TextEncoder();
  let CRC=null; const crcT=()=>{ if(CRC) return CRC; CRC=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; CRC[n]=c>>>0; } return CRC; };
  const crc32=b=>{ const T=crcT(); let c=0xFFFFFFFF; for(let i=0;i<b.length;i++) c=T[(c^b[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
  /* zip بدون فشرده‌سازی (روش ۰) */
  function zip(files){ const parts=[], cen=[]; let off=0;
    files.forEach(f=>{ const nm=enc.encode(f.name), d=typeof f.data==='string'?enc.encode(f.data):f.data, c=crc32(d);
      const h=new DataView(new ArrayBuffer(30)); h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true); h.setUint16(8,0,true); h.setUint16(10,0,true); h.setUint16(12,0x21,true);
      h.setUint32(14,c,true); h.setUint32(18,d.length,true); h.setUint32(22,d.length,true); h.setUint16(26,nm.length,true); h.setUint16(28,0,true);
      parts.push(new Uint8Array(h.buffer),nm,d);
      const e=new DataView(new ArrayBuffer(46)); e.setUint32(0,0x02014b50,true); e.setUint16(4,20,true); e.setUint16(6,20,true); e.setUint16(8,0x0800,true); e.setUint16(10,0,true); e.setUint16(12,0,true); e.setUint16(14,0x21,true);
      e.setUint32(16,c,true); e.setUint32(20,d.length,true); e.setUint32(24,d.length,true); e.setUint16(28,nm.length,true); e.setUint32(42,off,true);
      cen.push(new Uint8Array(e.buffer),nm); off+=30+nm.length+d.length; });
    const cs=cen.reduce((a,b)=>a+b.length,0), end=new DataView(new ArrayBuffer(22)); end.setUint32(0,0x06054b50,true); end.setUint16(8,files.length,true); end.setUint16(10,files.length,true); end.setUint32(12,cs,true); end.setUint32(16,off,true);
    const all=parts.concat(cen,[new Uint8Array(end.buffer)]), out=new Uint8Array(all.reduce((a,b)=>a+b.length,0)); let p=0; all.forEach(b=>{ out.set(b,p); p+=b.length; }); return out; }
  const x=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
  const col=i=>{ let s=''; i++; while(i){ const m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=Math.floor((i-1)/26); } return s; };
  /* سبک‌ها (cellXfs): 0 عادی، 1 عنوان، 2 زیرعنوان، 3 سرستون، 4 متن، 5 متن راه‌راه، 6 عدد، 7 عدد راه‌راه، 8 خانه پرکردنی، 9 جمع ردیف (فرمول)، 10 جمع کل برچسب، 11 جمع کل عدد، 12 پانویس، 13 ردیف (وسط)، 14 ردیف راه‌راه */
  const STY=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.##"/></numFmts>
<fonts count="6"><font><sz val="11"/><name val="Tahoma"/></font><font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Tahoma"/></font><font><sz val="10"/><color rgb="FF51606E"/><name val="Tahoma"/></font><font><b/><sz val="11"/><color rgb="FF1B2430"/><name val="Tahoma"/></font><font><b/><sz val="11"/><name val="Tahoma"/></font><font><i/><sz val="10"/><color rgb="FF51606E"/><name val="Tahoma"/></font></fonts>
<fills count="7"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1B2430"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE6A52E"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7F5F0"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF8E1"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEDEAE3"/></patternFill></fill></fills>
<borders count="3"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFC9C3B8"/></left><right style="thin"><color rgb="FFC9C3B8"/></right><top style="thin"><color rgb="FFC9C3B8"/></top><bottom style="thin"><color rgb="FFC9C3B8"/></bottom><diagonal/></border><border><left style="thin"><color rgb="FF1B2430"/></left><right style="thin"><color rgb="FF1B2430"/></right><top style="medium"><color rgb="FF1B2430"/></top><bottom style="medium"><color rgb="FF1B2430"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="15">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" readingOrder="2"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center" readingOrder="2"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1" readingOrder="2"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center" wrapText="1" indent="1" readingOrder="2"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center" wrapText="1" indent="1" readingOrder="2"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="164" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="3" fontId="0" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="3" fontId="4" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="6" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" readingOrder="2"/></xf>
<xf numFmtId="3" fontId="4" fillId="6" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right" vertical="center" wrapText="1" readingOrder="2"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  function sheetXml(o){
    const H=o.head||[], n=H.length, last=col(n-1), R=[], rows=o.rows||[], num=new Set(o.num||[]), fill=new Set(o.fill||[]);
    const c=(ref,s,v)=>{ if(v==null||v==='') return `<c r="${ref}" s="${s}"/>`;
      if(typeof v==='number'&&isFinite(v)) return `<c r="${ref}" s="${s}"><v>${v}</v></c>`;
      if(typeof v==='object'&&v.f) return `<c r="${ref}" s="${s}"><f>${x(v.f)}</f></c>`;
      return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${x(v)}</t></is></c>`; };
    const row=(r,ht,cells)=>`<row r="${r}"${ht?` ht="${ht}" customHeight="1"`:''}>${cells.join('')}</row>`;
    R.push(row(1,34,[c('A1',1,o.title||'')].concat(H.slice(1).map((_,i)=>c(col(i+1)+'1',1,'')))));
    R.push(row(2,22,[c('A2',2,o.sub||'')]));
    R.push(row(4,30,H.map((h,i)=>c(col(i)+'4',3,h))));
    const r0=5;
    rows.forEach((rw,k)=>{ const r=r0+k, z=k%2===1;
      R.push(row(r,26,rw.map((v,i)=>{ const ref=col(i)+r; if(o.total&&i===o.total.col) return c(ref,9,{f:o.total.f(r)}); if(fill.has(i)) return c(ref,8,v); if(i===0) return c(ref,z?14:13,v); if(num.has(i)) return c(ref,z?7:6,v); return c(ref,z?5:4,v); }))); });
    let rl=r0+rows.length; const merges=[`A1:${last}1`,`A2:${last}2`];
    if(o.total&&rows.length){ const tc=col(o.total.col); R.push(row(rl,24,H.map((_,i)=>{ const ref=col(i)+rl; if(i===o.total.col) return c(ref,11,{f:`SUM(${tc}${r0}:${tc}${rl-1})`}); if(i===0) return c(ref,10,o.total.label||'جمع کل'); return c(ref,10,''); })));
      merges.push(`A${rl}:${col(o.total.col-1)}${rl}`); rl++; }
    if(o.foot){ rl++; R.push(row(rl,22,[c('A'+rl,12,o.foot)])); merges.push(`A${rl}:${last}${rl}`); }
    const W=(o.widths||[]).map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${last}${rl}"/>
<sheetViews><sheetView rightToLeft="1" workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="22"/>${W?`<cols>${W}</cols>`:''}<sheetData>${R.join('')}</sheetData>
<mergeCells count="${merges.length}">${merges.map(m=>`<mergeCell ref="${m}"/>`).join('')}</mergeCells>
<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="portrait" fitToWidth="1" fitToHeight="0"/></worksheet>`; }
  function build(o){ const sn=x(String(o.sheet||'Sheet1').replace(/[\\\/?*\[\]:]/g,' ').slice(0,31));
    return zip([
      {name:'[Content_Types].xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`},
      {name:'_rels/.rels',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`},
      {name:'xl/workbook.xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="${sn}" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm.Print_Titles" localSheetId="0">'${sn.replace(/'/g,"''")}'!$4:$4</definedName></definedNames></workbook>`},
      {name:'xl/_rels/workbook.xml.rels',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`},
      {name:'xl/styles.xml',data:STY},
      {name:'xl/worksheets/sheet1.xml',data:sheetXml(o)}]); }
  async function table(o){ const buf=build(o), type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fname=String(o.name||'NT.xlsx').replace(/[^\w.\-]/g,'_');
    if(o.share){ try{ const f=new File([buf],fname,{type}); if(navigator.canShare && navigator.canShare({files:[f]})){ await navigator.share({files:[f],title:o.title||fname}); return 'share'; } }catch(e){ if(e && e.name==='AbortError') return 'cancel'; } }
    const url=URL.createObjectURL(new Blob([buf],{type})), a=document.createElement('a'); a.href=url; a.download=fname; a.rel='noopener'; a.style.display='none';
    document.body.appendChild(a); a.click(); setTimeout(()=>{ try{ a.remove(); URL.revokeObjectURL(url); }catch(e){} },8000); return fname; }
  window.ntXl={table,build};
})();
