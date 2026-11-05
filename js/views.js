const TBD = "待公告", LINK_TBD = "連結待補";
const byId = Object.fromEntries(ZONES.map(z => [z.id, z]));
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const val = v => v ? esc(v) : `<span class="tbd">${TBD}</span>`;
const icon = (id, cls="") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const linkBtn = (url, label, cls="solid") => url
  ? `<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label} ↗</a>`
  : `<span class="btn ${cls}" aria-disabled="true" title="${LINK_TBD}">${label}（${LINK_TBD}）</span>`;
const store = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)) } catch(e){ return null } },
  set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)) } catch(e){} }
};

/* ---------- 手機版園區清單 ---------- */
document.getElementById("zoneList").innerHTML = ZONES.map(z => `
  <li><button class="zone-card" type="button" data-go="${z.id}" style="--zc:${z.color}">
    <span class="badge">${icon(z.icon)}</span>
    <b>${esc(z.name)}</b>
    <span class="chev" aria-hidden="true">›</span>
    <small>${esc(z.tagline)}</small>
  </button></li>`).join("");

/* ---------- 園區面板 ---------- */
const selected = {};   // 每個園區目前選到第幾門課
/* 學員回饋：問卷統計（非常同意／同意／普通） */
function feedbackHTML(f){
  const pct = (n, t) => Math.round(n / t * 100);
  const rows = f.items.map(it => { const t = it.scale.reduce((a,b)=>a+b,0), [sa, a, n] = it.scale;
    return `<li><p class="fb-q">${esc(it.q)}</p>
      <div class="fb-bar" role="img" aria-label="非常同意 ${sa} 人、同意 ${a} 人、普通 ${n} 人">
        <span class="sa" style="width:${pct(sa,t)}%"></span><span class="a" style="width:${pct(a,t)}%"></span><span class="n" style="width:${pct(n,t)}%"></span></div>
      <p class="fb-n">同意以上 <b>${pct(sa+a,t)}%</b>（非常同意 ${sa}・同意 ${a}${n?`・普通 ${n}`:""}）</p></li>`; }).join("");
  return `<section class="feedback"><h3 class="sec">學員回饋</h3>
    <p class="fb-meta">${esc(f.source)}・共 ${f.total} 份・${f.sessions.map(esc).join("、")}<br>${esc(f.respondents)}</p>
    <p class="fb-legend" aria-hidden="true"><span class="sa"></span>非常同意<span class="a"></span>同意<span class="n"></span>普通</p>
    <ul class="fb-list">${rows}</ul>
    <h3 class="sec">回饋重點</h3><ul class="prep">${f.highlights.map(h=>`<li>${esc(h)}</li>`).join("")}</ul>
    ${(f.comments||[]).length ? `<h3 class="sec">學員回饋原文（匿名）</h3>${f.comments.map((g,k)=>`
      <details class="fb-comments"${k===0?" open":""}><summary>${esc(g.title)}<small>${g.items.length} 則</small></summary>
        <ul>${g.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>`).join("")}` : ""}</section>`;
}
function courseHTML(z, c){
  const prep = c.prep && c.prep.length ? `<ul class="prep">${c.prep.map(p=>`<li>${esc(p)}</li>`).join("")}</ul>` : val(null);
  return `<article class="course" aria-live="polite">
    <div class="course-head"><h4>${esc(c.name)}</h4>${c.pgy ? `<span class="pgy-tag">${icon("ic-ticket")} PGY 導覽票</span>`.replace('<svg class=""','<svg style="width:16px;height:16px"') : ""}</div>
    <p class="summary">${esc(c.summary)}</p>
    <dl class="facts">
      <div><dt>適合對象</dt><dd>${val(c.audience)}</dd></div>
      <div><dt>日期</dt><dd>${val(c.date)}</dd></div>
      <div><dt>地點</dt><dd>${val(c.location)}</dd></div>
    </dl>
    <div><h3 class="sec">課前準備</h3>${prep}</div>
    ${c.feedback ? feedbackHTML(c.feedback) : ""}
    <div class="actions">
      ${linkBtn(c.signup, "前往報名")}
      <button class="btn line" type="button" data-copy="${z.id}">複製課程資訊</button>
      <span class="hint" id="copyMsg" role="status"></span>
    </div>
  </article>`;
}
function extrasHTML(z){
  let out = "";
  if (z.id === "acls"){
    const rows = z.schedule.length
      ? z.schedule.map(s=>`<tr><td>${esc(s.course)}</td><td>${esc(s.batch)}</td><td>${val(s.date)}</td><td>${val(s.seats)}</td></tr>`).join("")
      : `<tr><td>ACLS／ALS</td><td>${val(null)}</td><td>${val(null)}</td><td>${val(null)}</td></tr>`;
    out += `<div class="extras">
      <section class="box"><h4>年度課表</h4><div class="scroll"><table><thead><tr><th>課程</th><th>梯次</th><th>日期</th><th>名額</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <section class="box"><h4>課前資料</h4><ul class="res">${z.resources.map(r=>`<li><span>${esc(r.name)}</span>${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener">開啟 ↗</a>`:`<span class="tbd">${LINK_TBD}</span>`}</li>`).join("")}</ul></section>
      ${(z.lectures||[]).length ? `<section class="box lectures"><h4>講師演講資料</h4>${z.lectures.map(g=>`
        <h5>${esc(g.group)}</h5><ul class="res">${g.items.map(l=>`<li><span><b>${esc(l.speaker)}</b><small>${esc(l.topic)}</small></span><a href="${esc(LECTURE_BASE + encodeURI(l.file))}" target="_blank" rel="noopener" aria-label="開啟 ${esc(l.speaker)} 的講義（PDF，另開分頁）">PDF ↗</a></li>`).join("")}</ul>`).join("")}</section>` : ""}
      <section class="box"><h4>ACLS／ALS 管理儀表板</h4><p class="hint" style="margin:0">梯次、學員與講師資料請到既有儀表板查看。</p>${linkBtn(LINKS.aclsDashboard,"開啟儀表板")}</section>
    </div>`;
  }
  if (z.id === "mis"){
    out += `<section class="box"><h4>練習站一覽</h4><div class="stations">${z.courses.map((c,i)=>`
      <button class="station" type="button" data-pick="${i}" aria-current="${(selected[z.id]||0)===i}"><b>${esc(c.name)}</b><small>${c.pgy?"PGY 導覽票":"點選查看"}</small></button>`).join("")}</div></section>`;
  }
  return out;
}
function renderZone(id){
  const z = byId[id], view = document.getElementById("view-zone");
  const others = ZONES.filter(o=>o.id!==id).map(o=>`<a href="#${o.id}" style="--zc:${o.color}"><span class="dot"></span>${esc(o.name)}</a>`).join("");
  let main;
  if (z.services){
    main = `<div class="svc-grid">${z.services.map(s=>`<section class="box"><h4>${esc(s.name)}</h4><p style="margin:0">${esc(s.summary)}</p>${linkBtn(s.url,"前往")}</section>`).join("")}</div>`;
  } else {
    const i = selected[id] || 0;
    main = `<div><h3 class="sec">課程</h3><div class="tabs" role="tablist" aria-label="${esc(z.name)}課程">${z.courses.map((c,k)=>`
        <button class="tab" role="tab" type="button" aria-selected="${k===i}" data-pick="${k}">${esc(c.name)}</button>`).join("")}</div></div>
      <div id="courseSlot">${courseHTML(z, z.courses[i])}</div>${extrasHTML(z)}`;
  }
  view.innerHTML = `<div class="panel" style="--zc:${z.color}">
    <div class="zone-hero"><span class="badge">${icon(z.icon)}</span>
      <div class="hero-text"><div class="eyebrow">${esc(z.tagline)}</div><h2 tabindex="-1" id="zone-title">${esc(z.name)}</h2><p>${esc(z.intro)}</p></div></div>
    <div class="panel-body">
      <a class="back" href="#map">← 返回地圖</a>
      ${main}
      <div><h3 class="sec">其他園區</h3><nav class="other" aria-label="其他園區">${others}</nav></div>
    </div></div>`;
}
document.getElementById("view-zone").addEventListener("click", e => {
  const id = location.hash.slice(1), z = byId[id];
  const pick = e.target.closest("[data-pick]");
  if (pick && z){ selected[id] = +pick.dataset.pick; renderZone(id);
    const t = document.querySelector(`.tab[data-pick="${selected[id]}"]`); t && t.focus(); return; }
  const cp = e.target.closest("[data-copy]");
  if (cp && z){
    const c = z.courses[selected[id]||0];
    const text = `【${z.name}】${c.name}\n${c.summary}\n適合對象：${c.audience||TBD}\n日期：${c.date||TBD}\n地點：${c.location||TBD}\n報名：${c.signup||LINK_TBD}`;
    const msg = document.getElementById("copyMsg");
    const done = () => msg.textContent = "已複製，可貼到 LINE 或 Email。";
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(done).catch(() => {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch(err){ msg.textContent = "無法自動複製，請手動選取文字。"; }
      ta.remove();
    });
  }
});
/* 分頁可用左右鍵切換 */
document.getElementById("view-zone").addEventListener("keydown", e => {
  if (!e.target.classList.contains("tab") || !["ArrowLeft","ArrowRight"].includes(e.key)) return;
  const id = location.hash.slice(1), n = byId[id].courses.length;
  selected[id] = ((selected[id]||0) + (e.key==="ArrowRight"?1:-1) + n) % n; renderZone(id);
  document.querySelector(`.tab[data-pick="${selected[id]}"]`).focus();
});

/* ---------- 近期課程 ---------- */
let filter = "all";
const allCourses = ZONES.flatMap(z => z.courses.map((c,i) => ({z, c, i})));
document.getElementById("filters").innerHTML =
  `<button class="chip" type="button" aria-pressed="true" data-f="all">全部</button>` +
  ZONES.filter(z=>z.courses.length).map(z=>`<button class="chip" type="button" aria-pressed="false" data-f="${z.id}" style="--zc:${z.color}"><span class="dot"></span>${esc(z.name)}</button>`).join("");
function renderUpcoming(){
  const q = document.getElementById("q").value.trim();
  const list = allCourses.filter(({z,c}) => (filter==="all"||z.id===filter) && (!q || c.name.includes(q) || z.name.includes(q)));
  document.getElementById("upcomingRows").innerHTML = list.length ? list.map(({z,c,i}) => `
    <tr class="row-link" data-zone="${z.id}" data-i="${i}" style="--zc:${z.color}">
      <td data-k="zone"><span class="dot"></span>${esc(z.name)}</td>
      <td data-k="course"><a href="#${z.id}" data-zone="${z.id}" data-i="${i}">${esc(c.name)}</a>${c.pgy?' <span class="pgy-tag">PGY</span>':""}</td>
      <td data-k="date">${val(c.date)}</td>
      <td data-k="loc">${val(c.location)}</td>
      <td data-k="signup">${c.signup?`<a href="${esc(c.signup)}" target="_blank" rel="noopener">報名 ↗</a>`:`<span class="tbd">${LINK_TBD}</span>`}</td>
    </tr>`).join("") : `<tr><td colspan="5" class="empty">找不到符合的課程。</td></tr>`;
}
document.getElementById("filters").addEventListener("click", e => {
  const b = e.target.closest("[data-f]"); if (!b) return;
  filter = b.dataset.f;
  document.querySelectorAll("#filters .chip").forEach(x => x.setAttribute("aria-pressed", x===b));
  renderUpcoming();
});
document.getElementById("q").addEventListener("input", renderUpcoming);
document.getElementById("upcomingRows").addEventListener("click", e => {
  const r = e.target.closest("[data-zone]"); if (!r || e.target.closest('a[target]')) return;
  e.preventDefault(); selected[r.dataset.zone] = +r.dataset.i; go(r.dataset.zone);
});

/* ---------- PGY 導覽票 ---------- */
const pgyList = allCourses.filter(x => x.c.pgy);
document.getElementById("pgyCount").textContent = pgyList.length;
function renderPGY(){
  const done = store.get("pgy-stamps") || {};
  document.getElementById("pgyStops").innerHTML = pgyList.map(({z,c,i},n) => `
    <li class="stop" style="--zc:${z.color}">
      <span class="num">${n+1}</span>
      <b>${esc(c.name)}</b>
      <span class="go">
        <button class="btn line" type="button" data-zone="${z.id}" data-i="${i}">前往園區 →</button>
        <label class="stamp ${done[c.id]?"done":""}"><input type="checkbox" data-stamp="${c.id}" ${done[c.id]?"checked":""}><span>${done[c.id]?"已打卡":"打卡"}</span></label>
      </span>
      <span class="where"><span class="dot"></span>位於${esc(z.name)}・日期 ${c.date?esc(c.date):TBD}</span>
    </li>`).join("");
}
document.getElementById("pgyStops").addEventListener("click", e => {
  const b = e.target.closest("button[data-zone]"); if (!b) return;
  selected[b.dataset.zone] = +b.dataset.i; go(b.dataset.zone);
});
document.getElementById("pgyStops").addEventListener("change", e => {
  const id = e.target.dataset.stamp; if (!id) return;
  const done = store.get("pgy-stamps") || {}; done[id] = e.target.checked; store.set("pgy-stamps", done); renderPGY();
});

