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
    dashboard: true
  },
  {
    id: "mis", name: "微創工坊", color: "var(--c-mis)", icon: "ic-mis",
    tagline: "腹腔鏡・血管縫合・消化鏡",
    intro: "微創與精細手技的練習場，從模擬箱的基本器械操作，到血管吻合與內視鏡操作。",
    courses: [
      { id: "lap", name: "腹腔鏡模擬箱訓練", pgy: true,
        summary: "在腹腔鏡模擬訓練箱內練習器械操作、手眼協調與深度感知，建立微創手術基本功。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "yvessel", name: "3D 列印 Y 型血管縫合", pgy: true,
        summary: "使用 3D 列印的 Y 型血管模型，練習血管吻合的縫合技巧、針距與張力控制。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "endo", name: "模擬消化鏡訓練",
        summary: "透過消化內視鏡模擬器，練習進鏡、角度控制與黏膜觀察技巧。",
        audience: null, date: null, location: null, prep: [], signup: null }
    ],
    stations: true
  },
  {
    id: "us", name: "超音波探索館", color: "var(--c-us)", icon: "ic-us",
    tagline: "CVC 定位・進階模擬",
    intro: "用超音波看見身體裡的結構，練習引導下的定位與進階掃描判讀。",
    courses: [
      { id: "cvc", name: "中央靜脈導管超音波定位", pgy: true,
        summary: "在超音波引導下辨識目標靜脈與周邊構造，練習置放中央靜脈導管前的定位與穿刺路徑規劃。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "usadv", name: "進階超音波模擬",
        summary: "使用超音波模擬器練習進階掃描切面與影像判讀。",
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
        audience: null, date: null, location: null, prep: [], signup: null }
    ]
  },
  {
    id: "sim", name: "情境模擬館", color: "var(--c-sim)", icon: "ic-sim",
    tagline: "TRM・SimMan・團隊演練",
    intro: "在模擬病房裡重現臨床情境，練習團隊合作、溝通與危機處理。",
    courses: [
      { id: "trm", name: "醫療團隊資源管理（TRM）",
        summary: "以團隊合作、溝通與領導為主軸，透過案例討論與模擬演練提升團隊效能。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "simman", name: "SimMan 高擬真情境模擬",
        summary: "使用高擬真模擬人重現急重症情境，演練後進行引導式回饋。",
        audience: null, date: null, location: null, prep: [], signup: null },
      { id: "team", name: "跨職類團隊演練",
        summary: "醫師、護理師與其他職類依情境分工，演練團隊協作。",
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

