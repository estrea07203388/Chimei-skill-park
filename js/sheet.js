/* =====================================================================
   【Google 試算表自動匯入】各課程的梯次
   - 試算表網址設定在 js/data.js 的 SHEET_URL（共用連結，需「知道連結的任何人都可以檢視」）
   - 一門課一個分頁；在 js/data.js 的課程加上 tab: "分頁名稱" 就會讀那個分頁
   - 分頁第一列是標題：梯次、日期、時間、地點、名額、報名連結、備註（有的欄位才需要，順序可調）
   - 一梯一列。網站依日期排序、已過的梯次標示「已結束」，卡片與近期課程顯示「下一梯」
   - 讀不到試算表時，網站照常使用 data.js 的資料
   - 檢查模式：網址加上 ?sheetcheck 會在畫面上顯示讀取結果
   ===================================================================== */
(function sheetImport(){
  /* 檢查模式：網址加上 ?sheetcheck 會在畫面上顯示讀取結果，方便找問題 */
  const CHECK = /[?&]sheetcheck/.test(location.search), logs = [];
  const log = (ok, msg) => { logs.push([ok, msg]); if (ok === false) console.warn("[試算表]", msg); if (CHECK) showLog(); };
  function showLog(){
    let box = document.getElementById("sheetCheck");
    if (!box){ box = document.createElement("div"); box.id = "sheetCheck";
      box.style.cssText = "position:fixed;top:12px;right:12px;z-index:2000;max-width:min(560px,calc(100vw - 24px));max-height:80vh;overflow:auto;background:#fff;color:#123;border:2px solid #12355b;border-radius:12px;padding:12px 16px;font:13px/1.6 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3)";
      document.body.appendChild(box); }
    box.innerHTML = "<b>Google 試算表檢查</b><br>" + logs.map(([ok, m]) => `${ok === true ? "✅" : ok === false ? "❌" : "ℹ️"} ${esc(m)}`).join("<br>");
  }
  if (typeof SHEET_URL !== "string" || !SHEET_URL){ log(false, "js/data.js 的 SHEET_URL 沒有設定"); return; }
  const m = SHEET_URL.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/) || SHEET_URL.match(/^([a-zA-Z0-9_-]{20,})$/);
  if (!m || m[1] === "e"){ log(false, "SHEET_URL 需要是試算表的共用連結（…/spreadsheets/d/〈ID〉/edit…）"); return; }
  log(null, "試算表 ID：" + m[1]);
  const tabURL = name => `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(name)}`;
  
  // 簡易 CSV 解析（支援雙引號、欄位內換行與逗號）
  function parseCSV(text){
    const rows = []; let row = [], cell = "", q = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++){
      const ch = text[i];
      if (q){ if (ch === '"'){ if (text[i+1] === '"'){ cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === ","){ row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r"){ if (ch === "\r" && text[i+1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell !== "" || row.length){ row.push(cell); rows.push(row); }
    return rows;
  }
  // 讀一個分頁 → 物件陣列（key 為標題，去掉括號說明）
  const readTab = name => fetch(tabURL(name), { cache: "no-store" })
    .catch(() => { throw new Error(`讀不到分頁「${name}」：連線被擋下。最常見原因是試算表的共用沒有設成「知道連結的任何人」`); })
    .then(r => { if (!r.ok) throw new Error(`讀不到分頁「${name}」：HTTP ${r.status}`); return r.text(); })
    .then(t => { if (/^\s*</.test(t)) throw new Error(`分頁「${name}」讀到的是網頁而不是表格，請確認共用設定`);
      const rows = parseCSV(t); log(true, `分頁「${name}」讀到 ${Math.max(0, rows.length - 1)} 列；標題：${(rows[0]||[]).join("｜")}`); if (!rows.length) return [];
      const head = rows[0].map(h => h.trim().replace(/（.*）$/, ""));
      return rows.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])))
                 .filter(o => Object.values(o).some(Boolean)); });

  // 從日期文字取出 年/月/日（支援 2026/12/10、2026-12-10、12/10/2026）
  function dayOf(s){
    let x = s.match(/(\d{4})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/); if (x) return new Date(+x[1], x[2]-1, +x[3]);
    x = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (x) return new Date(+x[3], x[1]-1, +x[2]);
    return null;
  }

  const courses = {};
  ZONES.forEach(z => (z.courses || []).forEach(c => { courses[c.id] = c; }));
  const today = new Date(); today.setHours(0,0,0,0);

  const list = Object.values(courses).filter(c => c.tab);
  if (!list.length){ log(false, "js/data.js 裡沒有任何課程設定 tab（分頁名稱）"); return; }
  const seen = new Map();
  Promise.all(list.map(c => {
    const tab = c.tab;
    return readTab(tab).then(rows => {
      const ss = rows.map(r => ({ batch: r["梯次"], date: r["日期"], time: r["時間"], location: r["地點"],
                                  seats: r["名額"], signup: r["報名連結"], note: r["備註"], day: dayOf(r["日期"] || "") }))
                     .filter(s => s.date || s.batch);
      log(ss.length ? true : null, `${c.name}：分頁「${tab}」有 ${ss.length} 梯` + (ss.length ? `（${ss.map(s => (s.batch||"") + " " + (s.date||"") + (s.day ? "" : "⚠️日期格式看不懂")).join("、")}）` : "（沒有填梯次）"));
      // Google 遇到不存在的分頁名稱時會回傳第一個分頁；內容和別的課程一模一樣時視為讀錯分頁
      const sig = JSON.stringify(rows); if (seen.has(sig)) throw new Error(`分頁「${tab}」的內容和「${seen.get(sig)}」完全相同，可能是分頁名稱打錯（Google 會改回傳第一個分頁）`); seen.set(sig, tab);
      ss.sort((a, b) => (a.day ? a.day.getTime() : Infinity) - (b.day ? b.day.getTime() : Infinity));
      ss.forEach(s => { s.past = !!(s.day && s.day < today); });
      if (!ss.length) return c;
      c.sessions = ss;
      const next = ss.find(s => !s.past);
      if (next){   // 卡片、近期課程顯示「下一梯」
        c.date = [next.date, next.time].filter(Boolean).join(" ") + (ss.filter(s=>!s.past).length > 1 ? `（共 ${ss.filter(s=>!s.past).length} 梯）` : "");
        if (next.location) c.location = next.location;
        if (next.signup) c.signup = next.signup;
      } else c.date = "本期梯次已結束";
      return c;
    }).catch(err => { log(false, err.message); return c; });
  })).then(done => { const n = done.filter(c => c.sessions).length; log(n ? true : null, `完成：${n} 門課有梯次資料`); if (n){ window.SHEET_LOADED = n; route(); } })
    .catch(err => log(false, err.message + "（網站改用 data.js 的資料）"));
})();
