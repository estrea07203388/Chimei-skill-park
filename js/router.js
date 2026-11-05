/* ---------- 手機版清單點選 ---------- */
document.getElementById("zoneList").addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });

/* ---------- 頁面切換（以網址 # 記錄目前頁面，可用瀏覽器上一頁返回） ---------- */
let lastZone = null;
function go(id){ if (location.hash === "#"+id) route(); else location.hash = id; }
function route(){
  const h = location.hash.slice(1) || "map";
  const views = { map:"view-map", upcoming:"view-upcoming", pgy:"view-pgy" };
  const zoneId = byId[h] ? h : null;
  for (const v of ["view-map","view-zone","view-upcoming","view-pgy"]) document.getElementById(v).hidden = true;
  let focusEl;
  if (zoneId){ renderZone(zoneId); document.getElementById("view-zone").hidden = false; focusEl = document.getElementById("zone-title"); lastZone = zoneId; }
  else if (views[h] && h!=="map"){ document.getElementById(views[h]).hidden = false;
    if (h==="upcoming"){ renderUpcoming(); focusEl = document.getElementById("upcoming-title"); }
    if (h==="pgy"){ renderPGY(); focusEl = document.getElementById("pgy-title"); } }
  else { document.getElementById("view-map").hidden = false; }
  document.querySelectorAll(".nav a").forEach(a => a.setAttribute("aria-current", a.dataset.nav === (zoneId ? "" : h) ? "page" : "false"));
  window.scrollTo(0, 0);
  if (focusEl) focusEl.focus({ preventScroll: true });
  else if (h==="map" && lastZone){ const g = document.querySelector(`.tag3d[data-zone="${lastZone}"]`); if (g && getComputedStyle(document.querySelector(".map-wrap")).display!=="none") g.focus({preventScroll:true}); }
}
addEventListener("hashchange", route);
route();
