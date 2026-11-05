/* =====================================================================
   【課程資料區】日後更新課程、日期、地點與連結，只需要修改這一段。
   - 尚未提供的欄位請保留 null，畫面會自動顯示「待公告」或「連結待補」。
   - 日期建議寫成文字，例如 "2027/03/14（六）09:00–17:00"。
   - signup：報名網址；resources[].url：課前資料網址。
   - pgy: true 代表這門課會出現在「PGY 導覽票」。
   ===================================================================== */

/* 【替換連結】既有系統的網址集中在這裡 */
const LINKS = {
  aclsDashboard: "https://estrea07203388.github.io/acls-dashboard"  // 既有 ACLS／ALS 儀表板；換網址請改這一行
};
/* 【Google 試算表】各課程的梯次（日期、時間、地點、名額、報名連結）在試算表維護：一門課一個分頁。
   課程用 tab: "分頁名稱" 對應到試算表的分頁。試算表需設定「知道連結的任何人都可以檢視」；說明見 js/sheet.js */
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1i6fG0ICT6flZ6sz7do873MAb2Jgf2hyNRTUA37yHVic/edit";

/* 講師演講資料 PDF 所在的網站（acls-dashboard 的 GitHub Pages） */
const LECTURE_BASE = "https://estrea07203388.github.io/acls-dashboard/";

const ZONES = [
  {
    id: "acls", name: "急救任務站", color: "var(--c-acls)", icon: "ic-acls",
    tagline: "ACLS・ALS・年度課表",
    intro: "以高級心臟救命術為核心的急救訓練據點，整合課程、年度課表、報名資訊與課前資料。",
    courses: [
      { id: "acls", name: "高級心臟救命術（ACLS）",
        summary: "練習成人心跳停止、致命性心律不整與復甦後照護的團隊處置流程，著重高品質 CPR 與節律判讀。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "als", name: "高級救命術（ALS）",
        summary: "以急救團隊情境演練為主，練習團隊領導、角色分工與閉環式溝通。",
        audience: null, date: null, location: null, prep: [], signup: null }
    ],
    /* 【年度課表】公告後依格式新增，例如：
       { course: "ACLS", batch: "第 1 梯", date: "2027/03/14（六）", seats: "24 人" } */
    schedule: [],
    /* 【課前資料】把 url 換成講義或測驗網址 */
    resources: [
      { name: "課前資料（講義）", url: null },
      { name: "課前測驗", url: null }
    ],
    /* 【講師演講資料】檔案放在 acls-dashboard repo；新增時照格式加一行：
       { speaker: "講師姓名", topic: "主題", file: "資料夾/檔名.pdf" }
       file 是 acls-dashboard 裡的路徑，網址會自動組成 */
    lectures: [
      { group: "講師演講資料 1", items: [
        { speaker: "許志新 醫師", topic: "2025 Post-Arrest Care（復甦後照護）", file: "講師演講資料1/許志新醫師_2025 Post-Arrest_Care 許志新 (1).pdf" },
        { speaker: "趙從賢 醫師", topic: "AHA 2025 ACLS Update Course", file: "講師演講資料1/趙從賢醫師=AHA_2025_ACLS_Update Course_趙從賢 (1).pdf" },
        { speaker: "陳春廷 醫師", topic: "2025 ACLS Update：Tachy／Brady（心搏過速／過緩）", file: "講師演講資料1/陳春廷醫師-2025 ACLS update_Tachy_Brady_陳春廷 (1).pdf" },
        { speaker: "黃明堃 醫師", topic: "ACLS Update：成人及小兒基本救命術（2026）", file: "講師演講資料1/黃明堃醫師-ACLS Update_成人及小兒基本救命術_2026.pdf" }
      ]},
      { group: "講師演講資料 2", items: [
        { speaker: "朱昌宏 醫師", topic: "再認證投影片講稿（0314 更新）", file: "講師演講資料2/朱昌宏醫師(更新)-(0314改)0314再認證投影片講稿.pdf" },
        { speaker: "李宜恭 醫師", topic: "ACLS + PALS", file: "講師演講資料2/李宜恭醫師_ACLS + PALS.pdf" },
        { speaker: "王晨旭 醫師", topic: "2025 ACLS Update Course：ACLS／PALS（2026/03/21）", file: "講師演講資料2/王晨旭醫師-2025ACLSupdateCourse-ACLS_PALS-20260321 (1).pdf" }
      ]},
      { group: "講師演講資料 3", items: [
        { speaker: "張櫻馨 醫師", topic: "ACLS Update", file: "講師演講資料3/張櫻馨醫師-update-張櫻馨 (1).pdf" },
        { speaker: "柯穎志 醫師", topic: "2025 ACLS Update Course 重點", file: "講師演講資料3/柯穎志醫師-2025 ACLS Update Course 重點 (2).pdf" },
        { speaker: "莊佳璋 醫師", topic: "ACLS Update（成大場）：成人及小兒 BLS", file: "講師演講資料3/莊佳璋醫師-ACLS_update_成大場_[Adult___Ped_BLS_莊][2] (1).pdf" }
      ]}
    ],
    dashboard: true
  },
  {
    id: "mis", name: "微創工坊", color: "var(--c-mis)", icon: "ic-mis",
    tagline: "腹腔鏡・血管縫合・消化鏡",
    intro: "微創與精細手技的練習場，從模擬箱的基本器械操作，到血管吻合與內視鏡操作。",
    courses: [
      { id: "lap", name: "腹腔鏡模擬箱訓練", pgy: true, tab: "腹腔鏡模擬箱訓練",
        summary: "在腹腔鏡模擬訓練箱內練習器械操作、手眼協調與深度感知，建立微創手術基本功。",
        audience: null, date: null, location: null, prep: [], signup: null,
        /* 【學員回饋】課後問卷（表單匯出的 Excel），10 分制；只放統計與匿名回饋（已排除 3 份測試／亂填）。scale 依序為 10、9、8 分人數 */
        feedback: {
          source: "課後回饋問卷（10 分制）",
          sessions: ["2026/07/10（1 份）", "2026/07/15（3 份）", "2026/07/16（3 份）", "2026/07/21（1 份）", "2026/08/19（4 份）", "2026/09/07（3 份）", "2026/09/15（3 份）"],
          total: 18,
          respondents: "PGY1 15 位、UGY 3 位",
          instructors: "高佑銘 醫師、林才揚 醫師、溫仁育 醫師",
          levels: ["10 分", "9 分", "8 分"],
          values: [10, 9, 8],
          items: [
            { q: "課程時數安排適當", scale: [17, 0, 1] },
            { q: "教材內容準備充分", scale: [17, 0, 1] },
            { q: "課程／測驗對臨床工作有幫助", scale: [17, 0, 1] },
            { q: "上課／測驗場所環境佈置具臨場感", scale: [17, 0, 1] },
            { q: "課程／測驗所提供之硬體設備充足", scale: [17, 0, 1] },
            { q: "課程／測驗活動安排適當", scale: [17, 0, 1] },
            { q: "課程／測驗使用模擬教具有真實感", scale: [17, 0, 1] },
            { q: "教師具教學熱忱", scale: [16, 1, 1] },
            { q: "教師具備豐富知識", scale: [17, 0, 1] },
            { q: "教師教學清晰有條理，能掌握重點", scale: [16, 1, 1] },
            { q: "教師回饋方式及內容充實", scale: [16, 1, 1] }
          ],
          counts: [
            { title: "是否知道其他醫院有類似的技能訓練課程", rows: [["不知道／否", 13], ["知道", 5]] }
          ],
          highlights: [
            "整體平均 9.9 分（滿分 10），18 位中有 16 位全部題目都給滿分",
            "教學熱忱、教學清晰有條理、教師回饋 3 題為 9.8 分，其餘 8 題為 9.9 分",
            "學員回饋：老師耐心、由淺入深，實作中學到拿器械的方式，對外科有興趣的同學很受用",
            "待改善：部分教材的魔鬼氈脫落，建議檢查與更換",
            "知道其他醫院有類似課程的學員提到：亞東醫院、雙和醫院、花蓮慈濟"
          ],
          comments: [
            { title: "對臨床技能中心課程／測驗的意見與建議", items: ["好", "有些教材魔鬼粘掉了", "非常棒 非常感謝學長耐心指導！", "都很好！很有趣～", "好玩", "超喜歡！", "謝謝醫師用心的教學，可以在實作中學習", "非常喜歡 尤其對外科有興趣的同學很受用；林才揚醫師授課也很有耐心！", "老師教學認真，由淺入深，獲益良多。", "受益良多，學習到拿器械的方式，謝謝老師"] }
          ]
        } },
      { id: "yvessel", name: "3D 列印 Y 型血管縫合", pgy: true, tab: "3D列印Y型血管縫合",
        summary: "使用 3D 列印的 Y 型血管模型，練習血管吻合的縫合技巧、針距與張力控制。",
        audience: null, date: null, location: null, prep: [], signup: null,
        /* 【學員回饋】課後問卷（表單匯出的 Excel），10 分制；只放統計與匿名回饋（已排除 2 份測試填答）。scale 依序為 10、9、8 分人數 */
        feedback: {
          source: "課後回饋問卷（10 分制）",
          sessions: ["2026/07/10（1 份）", "2026/07/24（2 份）", "2026/07/30（4 份）", "2026/08/20（1 份）", "2026/09/17（4 份）", "2026/10/15（3 份）"],
          total: 15,
          respondents: "PGY1 15 位",
          levels: ["10 分", "9 分", "8 分"],
          values: [10, 9, 8],
          items: [
            { q: "課程時數安排適當", scale: [13, 0, 2] },
            { q: "教材內容充分", scale: [13, 0, 2] },
            { q: "課程對臨床有幫助", scale: [13, 0, 2] },
            { q: "環境佈置具臨場感", scale: [12, 1, 2] },
            { q: "硬體設備充足", scale: [12, 1, 2] },
            { q: "活動安排適當", scale: [12, 1, 2] },
            { q: "教具具有真實感", scale: [13, 0, 2] },
            { q: "教師具教學熱誠", scale: [13, 0, 2] },
            { q: "教師具備豐富知識", scale: [12, 1, 2] },
            { q: "教學能掌握重點", scale: [12, 1, 2] },
            { q: "教師回饋及內容充實", scale: [12, 1, 2] }
          ],
          highlights: [
            "整體平均 9.7 分（滿分 10），11 題平均都是 9.7 分，最低分為 8 分",
            "每一題都有 12–13 位（8 成以上）給滿分 10 分",
            "文字回饋都是正面評價：有趣、實用、老師用心"
          ],
          comments: [
            { title: "對臨床技能中心課程／測驗的意見與建議", items: ["很有趣", "老師用心", "非常有趣；很有用的教學內容", "非常特別的課程！；很喜歡～～；謝謝老師跟學姐！", "很好的練習！", "好玩充實", "非常好的教學課程", "實用的課程！", "老師教的很好～"] }
          ]
        } },
      { id: "endo", name: "模擬消化鏡訓練", tab: "模擬消化鏡訓練",
        summary: "透過消化內視鏡模擬器，練習進鏡、角度控制與黏膜觀察技巧。",
        audience: null, date: null, location: null, prep: [], signup: null }
    ],
    stations: true
  },
  {
    id: "us", name: "超音波探索館", color: "var(--c-us)", icon: "ic-us",
    tagline: "CVC 定位・心臟・腹部超音波",
    intro: "用超音波看見身體裡的結構，練習引導下的定位，以及心臟、腹部超音波的掃描與判讀。",
    courses: [
      { id: "cvc", name: "中央靜脈導管超音波定位", pgy: true,
        summary: "在超音波引導下辨識目標靜脈與周邊構造，練習置放中央靜脈導管前的定位與穿刺路徑規劃。",
        audience: null, date: null, location: null, prep: [], signup: null },
      /* tab：Google 試算表裡這門課的分頁名稱（梯次會自動從分頁讀取） */
      { id: "echo", name: "心臟超音波", tab: "心臟超音波",
        summary: "練習心臟超音波的基本切面掃描與影像判讀。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "abdus", name: "腹部超音波", tab: "腹部超音波",
        summary: "練習腹部超音波的基本掃描與腹腔器官影像判讀。",
        audience: null, date: null, location: null, prep: [], signup: null }
    ]
  },
  {
    id: "airway", name: "呼吸道應變站", color: "var(--c-airway)", icon: "ic-airway",
    tagline: "困難呼吸道・環狀軟骨切開",
    intro: "面對困難呼吸道時的評估、器材選擇與團隊應變。",
    courses: [
      { id: "da", name: "困難呼吸道工作坊",
        summary: "演練困難呼吸道的評估、輔助器材使用與團隊應變流程。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "cric", name: "環狀軟骨切開術訓練",
        summary: "針對無法插管、無法給氧的情境，練習緊急建立頸前呼吸道的步驟。",
        audience: null, date: null, location: null, prep: [], signup: null,
        /* 【學員回饋】由課後問卷（表單匯出的 Excel）統計而來；只放統計，不放姓名、人事號等個資。
           scale 依序為：非常同意、同意、普通（人數） */
        feedback: {
          source: "課後回饋問卷",
          sessions: ["2026/07/04（13 份）", "2026/09/19（11 份）"],
          total: 24,
          respondents: "麻醉部 主治醫師 12 位、住院醫師／研究員 12 位",
          items: [
            { q: "課前，我對環狀軟骨切開術的適應症有清楚認識", scale: [14, 3, 7] },
            { q: "課後，我對環狀軟骨切開術的適應症有更清楚的認識", scale: [20, 4, 0] },
            { q: "課後，我能正確描述解剖標誌與切開位置", scale: [19, 5, 0] },
            { q: "操作練習後，我對自己獨立執行此術式有信心", scale: [10, 9, 5] },
            { q: "遇到 CICO 情境時，我能說出正確的處置流程", scale: [13, 11, 0] },
            { q: "講師的講解清晰易懂，能有效傳達重點知識", scale: [22, 2, 0] },
            { q: "模擬教具（模型／模擬器）能有效輔助技術練習", scale: [20, 4, 0] },
            { q: "情境模擬案例設計貼近臨床實務情境", scale: [18, 6, 0] },
            { q: "知識講授與實作練習的時間比例適當", scale: [19, 5, 0] },
            { q: "整體而言，本次課程達到我預期的學習目標", scale: [18, 6, 0] }
          ],
          highlights: [
            "最有幫助：模型／教具實際操作（18 位提到），可降低第一次切開的心理障礙",
            "最有幫助：流程與院內制度討論、環切示範（8 位提到）",
            "最大困難：下刀的勇氣與信心（5 位提到）、隔著皮肉辨認氣管位置與深度",
            "建議加強：用豬隻組織練習以貼近真實手感（4 位提到）、模型皮膚再厚一點、加入超音波定位氣管"
          ],
          /* 學員文字回饋（匿名，已略過「無」「沒有」等空白回答） */
          comments: [
            { title: "對學習最有幫助的環節", items: [
              "Canva各組討論",
              "Hands on",
              "實際操作；平常機會不多",
              "氣切教學",
              "模型操作",
              "實作",
              "教具操作",
              "教具十分用心",
              "模型實作。",
              "實作與交流",
              "1. 制度設計；2. 氣切模具模擬",
              "實際用模具操作可以降低第一次切開的心理障礙。；有機會和大家一起討論目前院內流程的漏洞並想出可行解決方案",
              "以模型實作氣切",
              "環甲膜切開術的流程和過程中會遇到的困難",
              "真實操作分享經驗及流程討論",
              "實作",
              "實際操作",
              "氣切包的使用",
              "了解困難插管的流程及實務上可能遇到的問題",
              "實際教具操作與擺位",
              "實際練習",
              "流程討論與環切示範",
              "教具模擬（且有刻意模擬皮厚的病人），且共同討論目前醫院的困境與待改進之處",
              "實際操作"
            ]},
            { title: "可以改善或加強的地方", items: [
              "很棒了",
              "希望能有豬隻氣管操作",
              "非常好",
              "可以針對困難個案近一步討論",
              "可以買豬脖子實作",
              "謝謝學長一起討論",
              "可惜今天沒有豬隻可以模擬真實組織的手感",
              "希望請病房幫忙的部分可以不要在work shop討論，改成以正式會議的形式。因爲今天花時間討論的部分儘管條列出來，也是需要正式會議才能成案。",
              "都很棒，讚",
              "已經很棒了",
              "無，超棒！謝謝三位學長的指導",
              "完美"
            ]},
            { title: "實際操作時遇到的最大困難", items: [
              "勇氣",
              "跟真實狀況有差距",
              "沒有真實操作豬隻",
              "信心",
              "實際氣切經驗不足",
              "怕做完後會讓trachea亂七八糟 讓後面的人難接手 就像我們接手困難插管一樣",
              "模型與真人的感覺有差別。",
              "熟悉氣切模具；切下去的勇氣",
              "病人躁動時擔心針扎或造成病人trauma",
              "沒辦法隔著皮與肉辨認氣管的正確位置與深度，很擔心刀片刺穿trachea posterior wall",
              "Bougie角度",
              "切開的過程",
              "實際操作機會低",
              "熟練度會影響操作速度",
              "假人模擬比較不像ACLS那麼習慣",
              "克服不想拿刀的恐懼",
              "站在病人右邊操作，置入bougie不順手",
              "解剖構造的不熟悉"
            ]},
            { title: "其他建議或回饋", items: [
              "謝謝急診熱心分享 願意教學",
              "希望可以練習豬隻",
              "想問那什麼時候適合找急診人員，是外科通知無法道場的時候嗎",
              "感謝",
              "可以和教學中心借一個氣切模具嗎",
              "希望之後有機會在動物中心用豬隻模擬",
              "皮可以更厚一點，不然太容易辨認。可以再加上超音波掃模擬氣管。",
              "很實用",
              "完美"
            ]}
          ]
        } }
    ]
  },
  {
    id: "sim", name: "情境模擬館", color: "var(--c-sim)", icon: "ic-sim",
    tagline: "TRM・SimMan・VR 沉浸式模擬",
    intro: "在模擬病房裡重現臨床情境，練習團隊合作、溝通與危機處理。",
    courses: [
      { id: "trm", name: "醫療團隊資源管理（TRM）",
        summary: "以團隊合作、溝通與領導為主軸，透過案例討論與模擬演練提升團隊效能。",
        audience: null, date: null, location: null, prep: [], signup: null,
        /* 【學員回饋】TRM 課後問卷（表單匯出的 Excel）；只放統計與匿名回饋。scale 依序為 5→1 分人數 */
        feedback: {
          source: "課後回饋問卷",
          sessions: ["2026/10/28"],
          total: 6,
          respondents: "護理人員 4 位、住院醫師 2 位｜臨床年資 1–3 年 4 位、10 年以上 2 位｜曾受過 TRM／CRM 訓練 2 位",
          levels: ["5 非常同意", "4 同意", "3 普通", "2 不同意", "1 非常不同意"],
          items: [
            { q: "課程目標清楚明確", scale: [4, 2, 0, 0, 0] },
            { q: "課程內容與臨床工作相關", scale: [4, 2, 0, 0, 0] },
            { q: "課程時間與內容量安排適當", scale: [3, 2, 1, 0, 0] },
            { q: "講師能以臨床案例清楚說明 TRM 概念", scale: [4, 2, 0, 0, 0] },
            { q: "講師營造開放、安全的討論氣氛", scale: [4, 2, 0, 0, 0] },
            { q: "整體而言，我對本課程感到滿意", scale: [4, 2, 0, 0, 0] },
            { q: "我願意推薦同事參加本課程", scale: [4, 2, 0, 0, 0] },
            { q: "模擬情境貼近臨床的真實狀況", scale: [4, 2, 0, 0, 0] },
            { q: "演練讓我有足夠機會練習 TRM 技巧", scale: [3, 3, 0, 0, 0] },
            { q: "演練過程中，我感到心理安全，敢於表達意見", scale: [3, 3, 0, 0, 0] },
            { q: "事後檢討（Debriefing）幫助我發現團隊合作的盲點", scale: [3, 3, 0, 0, 0] }
          ],
          compare: {
            title: "團隊技能自評：課前 → 課後",
            note: "同一組 TRM 技能，學員在課程前後各自評一次（5 分＝非常能做到）。「主動求援」只有課後自評。",
            levels: ["5 非常能做到", "4 大致能做到", "3 普通", "2 不太能做到", "1 完全不能做到"],
            before: "課前", after: "課後",
            items: [
            { q: "我能在團隊中清楚分工，並明確指派任務", before: [1, 2, 1, 2, 0], after: [2, 4, 0, 0, 0] },
            { q: "我能持續監測病人與環境狀況，並及時與團隊分享", before: [2, 1, 2, 1, 0], after: [3, 3, 0, 0, 0] },
            { q: "我能在發現他人可能出錯時，適當地表達質疑", before: [2, 1, 2, 1, 0], after: [3, 3, 0, 0, 0] },
            { q: "我能在壓力下與團隊共同做出決策", before: [2, 1, 2, 1, 0], after: [3, 3, 0, 0, 0] },
            { q: "我能在需要時主動求援，並善用團隊資源", after: [3, 3, 0, 0, 0] }
            ]
          },
          counts: [
            { title: "預期在單位推動 TRM 的最大障礙（可複選）", rows: [["同仁未受訓", 3], ["人力不足", 2], ["時間壓力", 2], ["工具不熟悉", 1]] }
          ],
          highlights: [
            "課程滿意度高：11 題中有 10 題「同意以上」達 100%；「課程時間與內容量安排」為 83%（1 位選普通）",
            "團隊技能自評明顯進步：課前「能做到以上」約 50%，課後提升到 100%",
            "最有幫助：實際演練、團隊合作演練，且有主治醫師（VS）在場指導",
            "推動障礙：同仁未受訓最多（3 位），其次是人力不足、時間壓力"
          ],
          comments: [
            { title: "本課程對您最有幫助的部分", items: ["實際演練", "實戰演練，而且有VS在，學到相當多！", "複習ACLS", "有臨床演練的經驗助於在真正遇到狀況時更能迎刃而解", "演練團隊合作"] },
            { title: "需要改進的部分", items: ["自己的knowledge"] }
          ]
        } },
      { id: "simman", name: "SimMan 高擬真情境模擬",
        summary: "使用高擬真模擬人重現急重症情境，演練後進行引導式回饋。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "vr", name: "VR沉浸式模擬訓練", tab: "VR沉浸式模擬訓練",
        summary: "戴上 VR 裝置進入虛擬臨床情境，以沉浸式體驗練習評估、處置與團隊溝通。",
        audience: null, date: null, location: null, prep: [], signup: null }
    ]
  },
  {
    id: "service", name: "服務中心", color: "var(--c-service)", icon: "ic-service",
    tagline: "教室・教具・設備",
    intro: "教室、教具與設備的借用和使用說明入口。",
    /* 【服務項目】url 換成借用表單或說明文件網址 */
    services: [
      { name: "教室借用", summary: "查詢技能中心教室空檔並提出借用申請。", url: null },
      { name: "教具借用", summary: "模擬器、訓練箱與教具的借用申請。", url: null },
      { name: "設備使用說明", summary: "各項模擬設備的操作說明與注意事項。", url: null }
    ],
    courses: []
  }
];
/* 【長官小人】在 3D 地圖上出現的長官，點選後會顯示名字與職稱
   - where：位置，"free"（在各島之間自由走動）、"center"（中央島）、"gate"（入口），或園區代號 acls / mis / us / airway / sim / service
   - outfit："coat"（白袍）、"suit"（西裝）、"blouse"（便服上衣）、"polo"（POLO 衫）；上衣顏色用 top 指定
   - 外型（可省略）：top 上衣顏色、hair 髮型（"short" 短髮／"bob" 及下巴鮑伯頭／"shoulder" 及肩髮）、hairColor 髮色、glasses 是否戴眼鏡
   - 要新增長官，照下面格式多加一行即可，例如：
     { name: "姓名", title: "職稱", where: "acls", outfit: "suit" }, */
const LEADERS = [
  { name: "蘇慧真", title: "教學部 部長", where: "free", outfit: "blouse", top: "#b9a7d6", hair: "bob", hairColor: "#2a201c", glasses: true },
  { name: "劉雯", title: "教學部 副部長", where: "free", outfit: "blouse", top: "#3a3440", hair: "shoulder", hairColor: "#3a2a22", glasses: true },
  { name: "蔡長志", title: "主任", where: "free", outfit: "polo", top: "#2f4f7a", hair: "short", hairColor: "#141414", glasses: true }
];
/* ======================= 課程資料區結束 ======================= */

