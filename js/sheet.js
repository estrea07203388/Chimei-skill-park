/* =====================================================================
   【Google 試算表自動匯入】課程的對象、日期、地點、課前準備、報名連結
   - 試算表網址設定在 js/data.js 的 SHEET_CSV_URL（Google 試算表「發布到網路」的 CSV 網址）
   - 網站打開時讀取試算表，有填的欄位會蓋過 data.js 的內容；空白的欄位維持原樣
   - 讀不到試算表（沒網路、網址錯誤）時，網站照常使用 data.js 的資料
   - 欄位以第一列的「標題文字」對應，欄位順序可以調整，但標題請不要改
   ===================================================================== */
(function sheetImport(){
  if (typeof SHEET_CSV_URL !== "string" || !SHEET_CSV_URL) return;

  // 試算表標題 → 課程欄位
  const COLS = { "課程代碼": "id", "課程名稱": "name", "課程簡介": "summary", "適合對象": "audience",
                 "日期": "date", "地點": "location", "課前準備": "prep", "報名連結": "signup" };

  // 簡易 CSV 解析（支援雙引號、欄位內換行與逗號）
  function parseCSV(text){
    const rows = []; let row = [], cell = "", q = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++){
      const ch = text[i];
      if (q){
        if (ch === '"'){ if (text[i+1] === '"'){ cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ","){ row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r"){ if (ch === "\r" && text[i+1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell !== "" || row.length){ row.push(cell); rows.push(row); }
    return rows;
  }

  const courses = {};
  ZONES.forEach(z => (z.courses || []).forEach(c => { courses[c.id] = c; }));

  fetch(SHEET_CSV_URL, { cache: "no-store" })
    .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(text => {
      const rows = parseCSV(text); if (rows.length < 2) return;
      const head = rows[0].map(h => COLS[h.trim().replace(/（.*）$/, "")] || null);
      let n = 0;
      rows.slice(1).forEach(r => {
        const rec = {}; head.forEach((k, i) => { if (k) rec[k] = (r[i] || "").trim(); });
        const c = courses[rec.id]; if (!c) return;
        for (const k of ["name", "summary", "audience", "date", "location", "signup"]) if (rec[k]) c[k] = rec[k];
        if (rec.prep) c.prep = rec.prep.split(/[；;\n]/).map(s => s.trim()).filter(Boolean);
        n++;
      });
      if (n){ window.SHEET_LOADED = n; route(); }   // 重新畫目前頁面
    })
    .catch(err => console.warn("Google 試算表讀取失敗，改用 data.js 的資料：", err));
})();
