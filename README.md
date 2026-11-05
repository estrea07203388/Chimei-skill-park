# 奇美臨床技能樂園（Chimei Skills Park）

奇美醫院臨床技能中心的課程導覽網站。以 3D 遊樂園島嶼地圖呈現各訓練園區（急救、微創、超音波、呼吸道、情境模擬、服務中心），可查看課程、近期課程列表與 PGY 導覽票。

- 線上網址：<https://estrea07203388.github.io/Chimei-skill-park/>
- 純靜態網站：不需要建置（build）、不需要伺服器，直接雙擊 `index.html` 也能離線開啟。

## 檔案結構

```
Chimei-skill-park/
├── index.html                 # 首頁：只放頁面骨架（HTML 結構、SVG 圖示庫）與載入檔案
├── css/
│   └── style.css              # 全站樣式
├── js/
│   ├── data.js                # ★ 課程資料區：園區、課程、日期、地點、報名連結、長官小人
│   ├── views.js               # 畫面渲染：園區頁、近期課程（篩選/搜尋）、PGY 導覽票
│   ├── map3d.js               # 3D 導覽島（three.js）與地圖上的 HUD 介面
│   ├── router.js              # 頁面切換（以網址 # 記錄目前頁面）
│   └── vendor/
│       ├── three.min.js       # three.js r147（MIT）
│       └── OrbitControls.js   # three.js 的地圖操作控制器
├── .github/workflows/pages.yml  # 自動佈署到 GitHub Pages
└── .nojekyll
```

### 載入順序（請勿調換）

`index.html` 底部依序載入：

1. `vendor/three.min.js` → 2. `vendor/OrbitControls.js` → 3. `data.js` → 4. `views.js` → 5. `map3d.js` → 6. `router.js`

這些都是一般 `<script>`（非 ES module），彼此透過全域變數共用（例如 `ZONES`、`go()`、`route()`），因此後面的檔案依賴前面的檔案；也因為不是 module，用 `file://` 直接開啟仍可正常運作。

## 常見修改

| 想做的事 | 修改的檔案 |
| --- | --- |
| 新增／修改課程、日期、地點、報名連結 | `js/data.js` 的 `ZONES` |
| 讓課程出現在 PGY 導覽票 | 該課程設 `pgy: true` |
| 修改 ACLS 儀表板網址 | `js/data.js` 的 `LINKS.aclsDashboard` |
| 修改地圖上的長官小人 | `js/data.js` 的 `LEADERS` |
| 新增／修改急救任務站的講師演講資料（PDF） | `js/data.js` 的 `lectures`（PDF 放在 acls-dashboard repo，`file` 填檔案路徑） |
| 調整顏色、字型、版面 | `css/style.css` |
| 調整 3D 地圖的園區位置、遊樂設施 | `js/map3d.js`（`ZA`、`WHEEL`、`COAST`、`TOWER`） |
| 調整手機版 3D 地圖（高度、按鈕、鏡頭遠近） | `css/style.css` 的 `@media (max-width:760px)`、`js/map3d.js` 的 `ZOOM_OUT` |
| 修改頁首、導覽列、頁面區塊文字 | `index.html` |
| 修改「返回 OSCE 學習島」按鈕的連結／樣式 | `index.html`（連結，在 `</header>` 下方）、`css/style.css` 最下方（樣式；按鈕固定在畫面左下角） |

資料欄位說明：

- 尚未提供的欄位請保留 `null`，畫面會自動顯示「待公告」或「連結待補」。
- 日期建議寫成文字，例如 `"2027/03/14（六）09:00–17:00"`。
- `signup`：報名網址；`resources[].url`：課前資料網址。

## 製作過程

本專案原本是放在 [acls-dashboard](https://github.com/estrea07203388/acls-dashboard) repo 中的單一檔案 `chimei-skills-park .html`（約 750 KB、2,450 行，three.js、CSS、所有程式全部內嵌）。為了方便維護，搬移到本 repo 並依功能拆分：

1. **CSS**：原 `<style>` 區塊 → `css/style.css`
2. **第三方函式庫**：內嵌的 three.js r147 與 OrbitControls → `js/vendor/`（約 630 KB 的程式碼從首頁移出）
3. **網站程式**：原本一大段 `<script>` 依註解分區拆成 `data.js`、`views.js`、`map3d.js`、`router.js`，程式內容與執行順序完全不變
4. **首頁**：`index.html` 從 2,450 行縮減為約 170 行，只保留頁面結構

拆分後以無頭瀏覽器（Playwright + Chromium）比對原檔與新版：3D 地圖、6 個園區、近期課程 12 筆皆正常顯示，且沒有任何 JavaScript 錯誤。

## 本機預覽

直接用瀏覽器開啟 `index.html` 即可。若想用本機伺服器：

```bash
python3 -m http.server 8000
```

然後開啟 <http://localhost:8000>。

## 佈署

推送到 `main`（或 `claude/pensive-wright-d7nfy8`）分支時，GitHub Actions（`.github/workflows/pages.yml`）會自動將網站佈署到 GitHub Pages。

若第一次佈署失敗，請到 repo 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**，再到 Actions 頁面重新執行工作流程。

## 授權

- three.js：MIT License © 2010-2022 Three.js Authors
- 課程資訊以奇美醫院院方正式公告為準。
