/* =====================================================================
   3D 導覽島（three.js）— 純視覺；課程內容請改上方【課程資料區】
   - 園區位置：ZA（角度）；遊樂設施位置：WHEEL / COAST / TOWER
   ===================================================================== */
const MAP3D = {};
(function init3D(){
  const wrap = document.getElementById("mapWrap");
  let gl = false;
  try { const c = document.createElement("canvas"); gl = !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch(e){}
  if (!window.THREE || !THREE.OrbitControls || !gl){ document.body.classList.add("no3d"); return; }
  try { build(); } catch(err){ console.error(err); document.body.classList.add("no3d"); }

  function build(){
  const host = document.getElementById("scene3d"), tagLayer = document.getElementById("labels3d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .5, 400);
  const HOME_POS = new THREE.Vector3(0, 37, 56), HOME_T = new THREE.Vector3(0, 0, 6);
  // 直式手機畫面比較窄：把預設鏡頭往後拉，整座島才放得進畫面
  const ZOOM_OUT = Math.min(1.7, Math.max(1, 1.5 * host.clientHeight / Math.max(1, host.clientWidth)));
  HOME_POS.sub(HOME_T).multiplyScalar(ZOOM_OUT).add(HOME_T);
  if (ZOOM_OUT > 1){ const dz = -14 * (ZOOM_OUT - 1); HOME_T.z += dz; HOME_POS.z += dz; }  // 島往畫面下方移，上方留給按鈕
  camera.position.copy(HOME_POS);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME_T); controls.enableDamping = true; controls.dampingFactor = .08;
  controls.minDistance = 14; controls.maxDistance = 100 * ZOOM_OUT; controls.maxPolarAngle = 1.22; controls.minPolarAngle = .2;
  controls.screenSpacePanning = false; controls.autoRotateSpeed = .55;
  MAP3D.view = (p, t) => { camera.position.set(...p); controls.target.set(...t); };

  const hemi = new THREE.HemisphereLight(0xfff6ea, 0xbcd8d2, .95); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1de, 1.1); sun.position.set(-28, 46, 24); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 5, far: 130 });
  sun.shadow.bias = -.0006; scene.add(sun);
  const amb = new THREE.AmbientLight(0xffffff, .12); scene.add(amb);

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .82, metalness: 0, ...o });
  const mk = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; };
  const H = .7, D2R = Math.PI/180;
  const polar = (deg, R) => [R*Math.cos(deg*D2R), R*Math.sin(deg*D2R)];
  let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
  function rbox(w, h, d, r = .1){
    r = Math.min(r, w/3, d/3, h/3); const b = r*.6, W = w/2 - b, Dd = d/2 - b, s = new THREE.Shape();
    s.moveTo(-W + r, -Dd); s.lineTo(W - r, -Dd); s.quadraticCurveTo(W, -Dd, W, -Dd + r); s.lineTo(W, Dd - r); s.quadraticCurveTo(W, Dd, W - r, Dd);
    s.lineTo(-W + r, Dd); s.quadraticCurveTo(-W, Dd, -W, Dd - r); s.lineTo(-W, -Dd + r); s.quadraticCurveTo(-W, -Dd, -W + r, -Dd);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.01, h - 2*b), bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, curveSegments: 4 });
    g.rotateX(-Math.PI/2); g.translate(0, b, 0); return g; }
  function tex(w, h, draw){ const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); const redraw = () => { draw(c.getContext("2d"), w, h); t.needsUpdate = true; }; redraw(); if (document.fonts) document.fonts.ready.then(redraw); return t; }
  function stripes(cols, n){ const t = tex(512, 64, (x, w, h) => { for (let i = 0; i < n; i++){ x.fillStyle = cols[i % cols.length]; x.fillRect(i*w/n, 0, w/n + 1, h); } }); return t; }

  /* ---------- 底座圓盤與水面 ---------- */
  mk(new THREE.CylinderGeometry(31.4, 30.4, 2.4, 120), M(0xeeb68d), 0, -1.22, 0);
  const rim = mk(new THREE.TorusGeometry(30.9, .8, 18, 140), M(0xf4c8a3, { roughness: .7 }), 0, -.05, 0); rim.rotation.x = Math.PI/2;
  const waterMat = M(0x93d3d6, { roughness: .35, metalness: .05 });
  const water = mk(new THREE.CircleGeometry(30.4, 120), waterMat, 0, .02, 0); water.rotation.x = -Math.PI/2; water.castShadow = false;
  const ripples = [];
  for (let i = 0; i < 26; i++){ const [x, z] = polar(rnd()*360, 9 + rnd()*19);
    const m = new THREE.Mesh(new THREE.RingGeometry(.4, .48, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 }));
    m.rotation.x = -Math.PI/2; m.position.set(x, .05, z); scene.add(m); ripples.push({ m, p: rnd() }); }

  /* ---------- 配置 ---------- */
  const ZA = { acls: 170, mis: -145, us: -35, airway: 10, service: 50, sim: 130 };
  const ZCOL = { acls: 0xc96a4f, mis: 0x58a185, us: 0x4b8db0, airway: 0xd09a3c, sim: 0x7f71a8, service: 0x3a6286 };
  const ZR = 17.2, ZP = {}; for (const id in ZA) ZP[id] = polar(ZA[id], ZR);
  const ENT = polar(90, 17.8), WHEEL = polar(-90, 21.8), COAST = polar(-12, 24.6), TOWER = polar(150, 24.3);

  /* ---------- 六角地塊小島 ---------- */
  const HEXR = 2.05, HS = 2.1;
  const hexGeo = new THREE.CylinderGeometry(HEXR, HEXR*1.03, H, 6); hexGeo.translate(0, H/2, 0);
  const sideMat = M(0xe2d3ba), TOP = { cream: M(0xf7f0e3), sand: M(0xf1e4cb), grass: M(0xcfe6c4), grass2: M(0xbcdcb2) };
  const RING1 = [[0,0],[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
  const RING2 = [[2,0],[2,-1],[2,-2],[1,-2],[0,-2],[-1,-1],[-2,0],[-2,1],[-2,2],[-1,2],[0,2],[1,1]];
  const pickables = [], ZMAT = {}, GRASS = [];
  function hexIsland(cx, cz, cells, zone){
    const g = new THREE.Group(); g.position.set(cx, 0, cz); scene.add(g);
    cells.forEach(([q, r, kind]) => { const x = HS*Math.sqrt(3)*(q + r/2), z = HS*1.5*r;
      const top = kind === "tint" ? M(ZCOL[zone] ? new THREE.Color(ZCOL[zone]).lerp(new THREE.Color(0xffffff), .62) : 0xf3e7d2) : TOP[kind || "cream"];
      const m = new THREE.Mesh(hexGeo, [sideMat, top, sideMat]); m.position.set(x, 0, z); m.castShadow = true; m.receiveShadow = true; g.add(m);
      if (zone) { m.userData.zone = zone; pickables.push(m); }
      if (kind === "grass" || kind === "grass2") GRASS.push([cx + x, cz + z]); });
    return g; }
  function roundIsland(cx, cz, r, mat){ const m = mk(new THREE.CylinderGeometry(r, r*1.03, H, 40), [sideMat, mat, sideMat], cx, H/2, cz); return m; }
  const zoneKinds = ["cream","grass","sand","tint","grass2","sand","grass"];
  for (const id in ZP) hexIsland(ZP[id][0], ZP[id][1], RING1.map((c, i) => [c[0], c[1], zoneKinds[i]]), id);
  hexIsland(0, 0, RING1.map(c => [c[0], c[1], "cream"]).concat(RING2.map((c, i) => [c[0], c[1], i % 3 === 0 ? "grass" : i % 3 === 1 ? "sand" : "grass2"])));
  hexIsland(ENT[0], ENT[1], RING1.map((c, i) => [c[0], c[1], i === 0 ? "cream" : i % 2 ? "grass" : "sand"]));
  roundIsland(WHEEL[0], WHEEL[1], 3.5, TOP.sand); roundIsland(COAST[0], COAST[1], 3.7, TOP.grass); roundIsland(TOWER[0], TOWER[1], 2.7, TOP.sand);

  /* ---------- 木橋 ---------- */
  const woodMat = M(0xd8a876), railMat = M(0x9c6b43);
  const plankGeo = new THREE.BoxGeometry(1.2, .09, .25), postGeo = new THREE.CylinderGeometry(.04, .04, .5, 6);
  const BRIDGES = [], BRIDGE_ENDS = [], PLANKS = [], POSTS = [], _b = new THREE.Object3D();
  function bridge(a, ra, b, rb, ka, kb){ BRIDGE_ENDS.push({ a: ka, b: kb });
    const dir = new THREE.Vector3(b[0] - a[0], 0, b[1] - a[1]).normalize();
    const A = new THREE.Vector3(a[0] + dir.x*ra, H, a[1] + dir.z*ra), B = new THREE.Vector3(b[0] - dir.x*rb, H, b[1] - dir.z*rb);
    const L = A.distanceTo(B), mid = A.clone().lerp(B, .5); mid.y = H + Math.min(1.2, .25 + L*.14);
    const curve = new THREE.QuadraticBezierCurve3(A.clone().addScaledVector(dir, -.6), mid, B.clone().addScaledVector(dir, .6)); BRIDGES.push(curve);
    const n = Math.max(5, Math.round((L + 1.2)/.3)), ang = Math.atan2(dir.x, dir.z), side = new THREE.Vector3(dir.z, 0, -dir.x);
    for (let i = 0; i <= n; i++){ const t = i/n, p = curve.getPoint(t), tg = curve.getTangent(t);
      _b.position.set(p.x, p.y + .05, p.z); _b.rotation.order = "YXZ"; _b.rotation.set(-Math.atan2(tg.y, Math.hypot(tg.x, tg.z)), ang, 0); _b.scale.set(1, 1, 1); _b.updateMatrix(); PLANKS.push(_b.matrix.clone()); }
    [-.58, .58].forEach(s => { const pts = curve.getPoints(16).map(p => p.clone().addScaledVector(side, s).add(new THREE.Vector3(0, .5, 0)));
      mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .045, 6), railMat);
      for (let i = 0; i <= 4; i++){ const p = curve.getPoint(i/4).addScaledVector(side, s); _b.position.set(p.x, p.y + .27, p.z); _b.rotation.set(0, 0, 0); _b.updateMatrix(); POSTS.push(_b.matrix.clone()); } }); }
  const RC = 7.9, RZ = 5.0;
  for (const id in ZP) bridge([0,0], RC, ZP[id], RZ, "c", id);
  bridge([0,0], RC, ENT, RZ, "c", "ENT");
  const ringOrder = ["us","airway","service","ENT","sim","acls","mis"];
  const posOf = k => k === "ENT" ? ENT : ZP[k];
  for (let i = 0; i < ringOrder.length - 1; i++) bridge(posOf(ringOrder[i]), RZ, posOf(ringOrder[i + 1]), RZ, ringOrder[i], ringOrder[i + 1]);
  bridge(ZP.mis, RZ, WHEEL, 3.6, "mis", "WHEEL"); bridge(WHEEL, 3.6, ZP.us, RZ, "WHEEL", "us"); bridge(ZP.airway, RZ, COAST, 3.8, "airway", "COAST"); bridge(ZP.acls, RZ, TOWER, 2.8, "acls", "TOWER");
  [[plankGeo, woodMat, PLANKS], [postGeo, railMat, POSTS]].forEach(([g, m, arr]) => { const im = new THREE.InstancedMesh(g, m, arr.length); arr.forEach((mt, i) => im.setMatrixAt(i, mt)); im.castShadow = true; im.receiveShadow = true; scene.add(im); });

  /* ---------- 窗戶（統一用一組 InstancedMesh） ---------- */
  const winMat = M(0x5d8297, { roughness: .25, metalness: .1, emissive: 0xffd58a, emissiveIntensity: 0 });
  const WIN = [], _o = new THREE.Object3D();
  function addWindows(parent, w, h, d, y0, floors, ox = 0, oz = 0){
    parent.updateMatrixWorld(true);
    const fh = (h - .2)/floors;
    [[0, d/2 + .02, 0, w], [0, -d/2 - .02, Math.PI, w], [w/2 + .02, 0, Math.PI/2, d], [-w/2 - .02, 0, -Math.PI/2, d]].forEach(([fx, fz, ry, len]) => {
      const n = Math.max(1, Math.floor((len - .3)/.48));
      for (let i = 0; i < n; i++) for (let f = 0; f < floors; f++){
        const t = (i + .5)/n*(len - .4) - (len - .4)/2;
        _o.position.set(ox + (fz ? t : fx), y0 + .12 + fh*f + fh*.5, oz + (fz ? fz : t)); _o.rotation.set(0, ry, 0); _o.updateMatrix();
        WIN.push(new THREE.Matrix4().multiplyMatrices(parent.matrixWorld, _o.matrix)); } }); }

  /* ---------- 六個園區建築 ---------- */
  const WALL = 0xf6f1e8, lampMat = M(0xfff1c6, { emissive: 0xffd27a, emissiveIntensity: 0 });
  function zoneGroup(id){ const [x, z] = ZP[id]; const g = new THREE.Group(); g.position.set(x, H, z); scene.add(g); ZMAT[id] = [];
    const Mz = (c, o) => { const m = M(c, o); ZMAT[id].push(m); return m; };
    return { g, Mz }; }
  const reg = (g, id) => g.traverse(o => { if (o.isMesh){ o.userData.zone = id; pickables.push(o); } });
  const BUILD = {
    acls(){ const { g, Mz } = zoneGroup("acls"), c = ZCOL.acls;
      mk(rbox(3.4, 1.5, 2.4, .14), Mz(WALL), 0, 0, 0, g); mk(rbox(3.52, .18, 2.52, .06), Mz(c), 0, 1.22, 0, g);
      mk(rbox(2.2, .8, 1.6, .12), Mz(WALL), -.3, 1.5, -.1, g);
      mk(rbox(1.1, .12, .7, .05), Mz(c), .6, .74, 1.45, g); mk(new THREE.CylinderGeometry(.04, .04, .74, 6), Mz(0xdddddd), .2, .37, 1.7, g); mk(new THREE.CylinderGeometry(.04, .04, .74, 6), Mz(0xdddddd), 1, .37, 1.7, g);
      const sign = new THREE.Group(); sign.position.set(-.3, 2.3, .2); g.add(sign);
      [-.7, .7].forEach(x => mk(new THREE.CylinderGeometry(.03, .03, .5, 6), Mz(0x55606a), x, .25, 0, sign));
      const ecg = tex(256, 80, (x, w, h) => { x.fillStyle = "#1c2b3a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#ff9b7c"; x.lineWidth = 6; x.shadowColor = "#ff7a55"; x.shadowBlur = 12; x.lineJoin = "round";
        x.beginPath(); x.moveTo(10, 46); [[60,46],[72,36],[84,54],[100,12],[116,70],[128,46],[170,46],[184,38],[198,46],[246,46]].forEach(p => x.lineTo(...p)); x.stroke(); });
      mk(new THREE.BoxGeometry(1.8, .58, .08), [Mz(0x1c2b3a), Mz(0x1c2b3a), Mz(0x1c2b3a), Mz(0x1c2b3a), new THREE.MeshBasicMaterial({ map: ecg }), new THREE.MeshBasicMaterial({ map: ecg })], 0, .75, 0, sign);
      addWindows(g, 3.4, 1.2, 2.4, 0, 2); addWindows(g, 2.2, .8, 1.6, 1.5, 1, -.3, -.1);
      reg(g, "acls");
      // 救護車與停機坪
      const amb2 = new THREE.Group(); amb2.position.set(ZP.acls[0] + 2.8, H, ZP.acls[1] - 1.9); amb2.rotation.y = .5; scene.add(amb2);
      mk(rbox(1.1, .55, .5, .08), M(0xf7f5f0), 0, .12, 0, amb2); mk(rbox(1.12, .1, .52, .03), M(c), 0, .38, 0, amb2);
      mk(new THREE.BoxGeometry(.18, .06, .3), M(0x3b7bd8, { emissive: 0x3b7bd8, emissiveIntensity: .6 }), .25, .7, 0, amb2);
      mk(new THREE.BoxGeometry(.18, .06, .3), M(0xe0443a, { emissive: 0xe0443a, emissiveIntensity: .6 }), .05, .7, 0, amb2);
      [[-.35, .26], [.35, .26], [-.35, -.26], [.35, -.26]].forEach(([x, z]) => { const w2 = mk(new THREE.CylinderGeometry(.12, .12, .08, 12), M(0x2a2a2c), x, .12, z, amb2); w2.rotation.x = Math.PI/2; });
      const pad = tex(256, 256, (x, w) => { x.fillStyle = "#e9e3d6"; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.strokeStyle = "#c96a4f"; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 104, 0, 7); x.stroke();
        x.fillStyle = "#1b3550"; x.font = "bold 130px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("H", 128, 136); });
      const hp = polar(ZA.acls, ZR); const off = [HS*Math.sqrt(3)*(-1 + .5), HS*1.5*1];
      const padM = new THREE.Mesh(new THREE.CircleGeometry(1.4, 40), new THREE.MeshStandardMaterial({ map: pad, roughness: .9 })); padM.rotation.x = -Math.PI/2; padM.position.set(hp[0] + off[0], H + .02, hp[1] + off[1]); padM.receiveShadow = true; scene.add(padM); },
    mis(){ const { g, Mz } = zoneGroup("mis"), c = ZCOL.mis;
      mk(rbox(3.6, 1.0, 2.6, .12), Mz(WALL), 0, 0, 0, g); mk(rbox(3.7, .14, 2.7, .05), Mz(c), 0, .86, 0, g);
      const tw = 3.6/4, prof = new THREE.Shape(); prof.moveTo(0, 0); prof.lineTo(tw, 0); prof.lineTo(tw, .72); prof.lineTo(0, 0);
      const wedge = new THREE.ExtrudeGeometry(prof, { depth: 2.5, bevelEnabled: false }); wedge.translate(0, 0, -1.25);
      const glass = M(0x9fd8c4, { roughness: .2, metalness: .15, emissive: 0xbff0dc, emissiveIntensity: .1 });
      for (let i = 0; i < 4; i++){ mk(wedge, Mz(0xb8bec0), -1.8 + i*tw, 1.0, 0, g); mk(new THREE.BoxGeometry(.04, .66, 2.4), glass, -1.8 + (i + 1)*tw - .03, 1.34, 0, g); }
      mk(new THREE.BoxGeometry(1.2, .8, .05), Mz(0xb7b1a5), .7, .4, 1.31, g);
      addWindows(g, 3.6, .9, 2.6, 0, 1); reg(g, "mis"); },
    us(){ const { g, Mz } = zoneGroup("us"), c = ZCOL.us;
      mk(new THREE.CylinderGeometry(1.7, 1.75, .7, 40), Mz(WALL), 0, .35, 0, g);
      mk(new THREE.SphereGeometry(1.65, 40, 20, 0, Math.PI*2, 0, Math.PI/2), Mz(0x7fb6cf, { roughness: .25, metalness: .2 }), 0, .7, 0, g);
      for (let i = 0; i < 6; i++){ const r = mk(new THREE.TorusGeometry(1.66, .025, 6, 40, Math.PI), Mz(0xe8f2f6), 0, .7, 0, g); r.rotation.y = i/6*Math.PI; }
      mk(new THREE.CylinderGeometry(.25, .25, .2, 16), Mz(0xe8f2f6), 0, 2.33, 0, g);
      mk(rbox(1.0, .6, .8, .08), Mz(WALL), 0, 0, 1.75, g); mk(rbox(1.15, .1, .95, .04), Mz(c), 0, .6, 1.75, g);
      addWindows(g, 2.3, .55, 2.3, .05, 1); reg(g, "us"); },
    airway(){ const { g, Mz } = zoneGroup("airway"), c = ZCOL.airway;
      mk(rbox(3.2, .7, 2.6, .12), Mz(WALL), 0, 0, 0, g); mk(rbox(3.3, .12, 2.7, .04), Mz(c), 0, .6, 0, g);
      mk(rbox(1.5, 3.6, 1.5, .12), Mz(WALL), 0, .7, 0, g);
      mk(rbox(1.68, .38, 1.68, .08), Mz(c), 0, 4.25, 0, g); mk(rbox(1.0, .3, 1.0, .06), Mz(0xd9d2c4), 0, 4.63, 0, g);
      mk(new THREE.CylinderGeometry(.02, .02, .9, 6), Mz(0x55606a), 0, 5.35, 0, g);
      mk(new THREE.SphereGeometry(.07, 8, 6), M(0xff5a40, { emissive: 0xff5a40, emissiveIntensity: .9 }), 0, 5.82, 0, g);
      addWindows(g, 3.2, .6, 2.6, 0, 1); addWindows(g, 1.5, 3.5, 1.5, .7, 6); reg(g, "airway"); },
    sim(){ const { g, Mz } = zoneGroup("sim"), c = ZCOL.sim;
      mk(rbox(3.6, 1.1, 1.5, .12), Mz(WALL), 0, 0, -.6, g); mk(rbox(1.5, 1.1, 2.6, .12), Mz(WALL), -1.05, 0, .55, g);
      mk(rbox(3.7, .14, 1.6, .05), Mz(c), 0, .96, -.6, g); mk(rbox(1.6, .14, 2.7, .05), Mz(c), -1.05, .96, .55, g);
      [[.6, -.7], [1.3, -.4], [-1.1, .9]].forEach(([x, z]) => mk(rbox(.5, .25, .4, .05), Mz(0xc9c2b6), x, 1.1, z, g));
      mk(rbox(.9, .1, .5, .04), Mz(c), .2, .62, .3, g);
      addWindows(g, 3.6, 1.0, 1.5, 0, 2, 0, -.6); addWindows(g, 1.5, 1.0, 2.6, 0, 2, -1.05, .55); reg(g, "sim"); },
    service(){ const { g, Mz } = zoneGroup("service"), c = ZCOL.service;
      mk(rbox(2.1, .78, 1.6, .1), Mz(0xa8cfdc, { roughness: .2, metalness: .1, transparent: true, opacity: .85 }), 0, 0, 0, g);
      mk(rbox(2.7, .14, 2.2, .05), Mz(c), 0, .8, 0, g);
      [[-1.2, -.95], [1.2, -.95], [-1.2, .95], [1.2, .95]].forEach(([x, z]) => mk(new THREE.CylinderGeometry(.04, .04, .8, 6), Mz(0xdddddd), x, .4, z, g));
      const it = tex(128, 128, (x) => { x.fillStyle = "#3a6286"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = "#fff"; x.font = "bold 84px Georgia"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("i", 64, 70); });
      mk(new THREE.CylinderGeometry(.04, .04, 1.4, 6), Mz(0x55606a), 1.7, .7, 1.2, g);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(.32, 24), new THREE.MeshBasicMaterial({ map: it, side: THREE.DoubleSide })); disc.position.set(1.7, 1.55, 1.2); g.add(disc);
      reg(g, "service"); }
  };
  Object.values(BUILD).forEach(f => f());

  /* ---------- 入口大門與廣場 ---------- */
  const gate = new THREE.Group(); gate.position.set(ENT[0], H, ENT[1] + 3.1); scene.add(gate);
  [-2.2, 2.2].forEach((x, i) => { mk(rbox(.55, 2.5, .55, .1), M(0xf6f1e8), x, 0, 0, gate); mk(new THREE.ConeGeometry(.42, .7, 16), M(i ? 0x58a185 : 0xc96a4f), x, 2.85, 0, gate);
    mk(new THREE.CylinderGeometry(.02, .02, .6, 6), M(0x55606a), x, 3.4, 0, gate);
    const f = mk(new THREE.PlaneGeometry(.5, .3), M(i ? 0xc96a4f : 0x58a185, { side: THREE.DoubleSide }), x + .26, 3.55, 0, gate); f.userData.flag = true; });
  mk(rbox(5.2, .42, .5, .1), M(0x1b3550), 0, 2.15, 0, gate);
  const signTex = tex(1024, 256, (x, w, h) => { x.fillStyle = "#fbf8f1"; x.fillRect(0, 0, w, h); x.strokeStyle = "#1b3550"; x.lineWidth = 10; x.strokeRect(10, 10, w - 20, h - 20); x.lineWidth = 3; x.strokeRect(26, 26, w - 52, h - 52);
    x.fillStyle = "#1b3550"; x.textAlign = "center"; x.font = '900 112px "Noto Serif TC","Songti TC",serif'; x.fillText("奇美臨床技能樂園", w/2, 140);
    x.fillStyle = "#c96a4f"; x.font = '500 40px "Noto Sans TC","PingFang TC",sans-serif'; x.fillText("從 模 擬 練 習 ， 到 臨 床 應 用", w/2, 208); });
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: .8 });
  mk(new THREE.BoxGeometry(4.8, 1.2, .1), [M(0x1b3550), M(0x1b3550), M(0x1b3550), M(0x1b3550), signMat, signMat], 0, 3.0, 0, gate);
  const plazaTex = tex(256, 256, (x) => { x.fillStyle = "#f3e9d6"; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill(); x.strokeStyle = "#d9c7a6"; x.lineWidth = 3;
    [100, 70, 40].forEach(r => { x.beginPath(); x.arc(128, 128, r, 0, 7); x.stroke(); }); for (let i = 0; i < 16; i++){ const a = i/16*Math.PI*2; x.beginPath(); x.moveTo(128 + 40*Math.cos(a), 128 + 40*Math.sin(a)); x.lineTo(128 + 126*Math.cos(a), 128 + 126*Math.sin(a)); x.stroke(); } });
  [[ENT[0], ENT[1] - .4, 1.7], [0, 0, 3.2]].forEach(([x, z, r]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ map: plazaTex, roughness: .9 })); m.rotation.x = -Math.PI/2; m.position.set(x, H + .015, z); m.receiveShadow = true; scene.add(m); });

  /* ---------- 遊樂設施 ---------- */
  // 旋轉木馬（中央島）
  const carousel = new THREE.Group(); carousel.position.set(0, H, 0); scene.add(carousel);
  mk(new THREE.CylinderGeometry(1.7, 1.75, .25, 40), M(0xf3ebdc), 0, .12, 0, carousel);
  const horses = [];
  for (let i = 0; i < 10; i++){ const a = i/10*Math.PI*2; mk(new THREE.CylinderGeometry(.03, .03, 1.35, 6), M(0xd9b45a, { metalness: .4, roughness: .4 }), 1.35*Math.cos(a), .9, 1.35*Math.sin(a), carousel);
    const h = mk(rbox(.36, .2, .14, .05), M(i % 2 ? 0xf7f2ea : 0x9b7454), 1.35*Math.cos(a), .6, 1.35*Math.sin(a), carousel); h.rotation.y = -a; horses.push(h); }
  mk(new THREE.ConeGeometry(2.0, .95, 32, 1, false), M(0xffffff, { map: stripes(["#c96a4f", "#f6efe2"], 16), roughness: .7 }), 0, 2.05, 0, carousel);
  mk(new THREE.CylinderGeometry(2.0, 2.0, .18, 32, 1, true), M(0xffffff, { map: stripes(["#f6efe2", "#c96a4f"], 32), side: THREE.DoubleSide }), 0, 1.5, 0, carousel);
  mk(new THREE.SphereGeometry(.12, 12, 8), M(0xd9b45a, { metalness: .5, roughness: .3 }), 0, 2.62, 0, carousel);
  // 摩天輪
  const wheel = new THREE.Group(); wheel.position.set(WHEEL[0], H, WHEEL[1]); scene.add(wheel);
  const hubY = 4.0, WR = 3.2;
  [[-1.6, -.5], [1.6, -.5], [-1.6, .5], [1.6, .5]].forEach(([x, z]) => { const a = new THREE.Vector3(x, 0, z), b = new THREE.Vector3(0, hubY, z*.8);
    const len = a.distanceTo(b), m = mk(new THREE.CylinderGeometry(.08, .1, len, 8), M(0x6f7f8c), 0, 0, 0, wheel); m.position.copy(a.clone().lerp(b, .5)); m.lookAt(b.clone().add(wheel.position)); m.rotateX(Math.PI/2); });
  mk(rbox(4, .2, 1.6, .06), M(0xddd5c6), 0, 0, 0, wheel);
  const rotor = new THREE.Group(); rotor.position.set(0, hubY, 0); wheel.add(rotor);
  [-.38, .38].forEach(z => { mk(new THREE.TorusGeometry(WR, .06, 8, 64), M(0x4f8fb0, { metalness: .3, roughness: .4 }), 0, 0, z, rotor);
    for (let i = 0; i < 16; i++){ const s = mk(new THREE.CylinderGeometry(.02, .02, WR, 4), M(0xb9d3e0), 0, 0, z, rotor); const a = i/16*Math.PI*2; s.rotation.z = a; s.position.set(-Math.sin(a)*WR/2, Math.cos(a)*WR/2, z); } });
  mk(new THREE.CylinderGeometry(.22, .22, 1.0, 16), M(0xd09a3c), 0, hubY, 0, wheel).rotation.x = Math.PI/2;
  const gondCols = [0xc96a4f, 0xd09a3c, 0x58a185, 0x4b8db0, 0x7f71a8, 0xf0e8da];
  const gondolas = []; for (let i = 0; i < 16; i++){ const gg = new THREE.Group(); wheel.add(gg); mk(rbox(.5, .44, .44, .1), M(gondCols[i % 6]), 0, -.62, 0, gg); mk(new THREE.BoxGeometry(.4, .14, .46), M(0xeef4f6, { roughness: .2 }), 0, -.36, 0, gg); mk(new THREE.CylinderGeometry(.015, .015, .4, 4), M(0x55606a), 0, -.2, 0, gg); gondolas.push(gg); }
  // 心跳雲霄飛車（軌道高度依心電圖起伏）
  const ecgF = t => { if (t > .05 && t < .13) return .14*Math.sin(Math.PI*(t - .05)/.08); if (t > .18 && t < .2) return -.08*(t - .18)/.02;
    if (t >= .2 && t < .235) return -.08 + (t - .2)/.035*1.08; if (t >= .235 && t < .27) return 1 - (t - .235)/.035*1.16; if (t >= .27 && t < .3) return -.16 + (t - .27)/.03*.16;
    if (t > .38 && t < .52) return .3*Math.sin(Math.PI*(t - .38)/.14); return 0; };
  const CP = t => new THREE.Vector3(COAST[0] + 2.9*Math.cos(t*Math.PI*2), H + .7 + ecgF(t)*3.0, COAST[1] + 2.1*Math.sin(t*Math.PI*2));
  const cPts = []; for (let i = 0; i < 200; i++) cPts.push(CP(i/200));
  const cCurve = new THREE.CatmullRomCurve3(cPts, true);
  mk(new THREE.TubeGeometry(cCurve, 400, .075, 8, true), M(0xc9583f, { roughness: .5 }));
  for (let i = 0; i < 200; i += 5){ const p = cPts[i]; const h = p.y - H; mk(new THREE.CylinderGeometry(.03, .03, h, 5), M(0x8c99a3), p.x, H + h/2, p.z); }
  const cCars = [0, 1, 2].map(i => mk(rbox(.42, .22, .26, .06), M(i ? 0xe9b84f : 0xf2c766)));
  mk(rbox(1.2, .5, .6, .06), M(0xddd5c6), COAST[0], H, COAST[1] - 2.9).position.y = H;
  // 自由落體塔
  const tower = new THREE.Group(); tower.position.set(TOWER[0], H, TOWER[1]); scene.add(tower);
  mk(new THREE.CylinderGeometry(.85, .9, .2, 24), M(0xddd5c6), 0, .1, 0, tower);
  mk(new THREE.CylinderGeometry(.18, .2, 6.6, 16), M(0xf3efe8), 0, 3.4, 0, tower);
  for (let y = 1.2; y < 6.4; y += 1.0) mk(new THREE.CylinderGeometry(.19, .19, .1, 16), M(0xc96a4f), 0, y, 0, tower);
  mk(new THREE.CylinderGeometry(.34, .3, .3, 16), M(0x1b3550), 0, 6.85, 0, tower);
  mk(new THREE.SphereGeometry(.06, 8, 6), M(0xff5a40, { emissive: 0xff5a40, emissiveIntensity: .9 }), 0, 7.1, 0, tower);
  const towerCar = mk(new THREE.CylinderGeometry(.62, .62, .26, 24), M(0xd9a441), 0, 1, 0, tower);

  /* ---------- 樹、路燈、長椅、陽傘 ---------- */
  const TREES = [];
  GRASS.forEach(([x, z]) => { const n = 2 + Math.floor(rnd()*3); for (let k = 0; k < n; k++){ const a = rnd()*Math.PI*2, r = .3 + rnd()*1.2; TREES.push([x + r*Math.cos(a), H, z + r*Math.sin(a), .75 + rnd()*.5]); } });
  [ENT, WHEEL, COAST, TOWER].forEach(([cx, cz], k) => { const R = [3.6, 2.9, 3.1, 2.1][k]; for (let i = 0; i < 9; i++){ const a = rnd()*Math.PI*2; if (k === 0 && Math.sin(a) > .3) continue; TREES.push([cx + R*Math.cos(a), H, cz + R*Math.sin(a), .6 + rnd()*.4]); } });
  const trunkM = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .09, .55, 6), M(0x8a6446), TREES.length);
  const leafM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), M(0xffffff, { roughness: .9 }), TREES.length*3);
  const LEAF = ["#7fbf86","#93cc8f","#6aae7a","#a6d59a","#5f9f72","#b2d89a","#88c49a"], col = new THREE.Color();
  TREES.forEach(([x, y, z, s], i) => { _o.position.set(x, y + .27*s, z); _o.rotation.set(0, 0, 0); _o.scale.set(s, s, s); _o.updateMatrix(); trunkM.setMatrixAt(i, _o.matrix);
    const base = LEAF[Math.floor(rnd()*LEAF.length)];
    [[0, .85, 0, .5], [.2, 1.12, .1, .36], [-.18, 1.02, -.12, .32]].forEach(([dx, dy, dz, r], k) => { _o.position.set(x + dx*s, y + dy*s, z + dz*s); _o.scale.setScalar(r*s); _o.updateMatrix();
      leafM.setMatrixAt(i*3 + k, _o.matrix); leafM.setColorAt(i*3 + k, col.set(base).offsetHSL(0, 0, k*.04)); }); });
  [trunkM, leafM].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
  const BENCH = [], CAFE = [];
  for (let i = 0; i < 12; i++){ const a = i/12*Math.PI*2 + .26; const x = 5.6*Math.cos(a), z = 5.6*Math.sin(a);
    if (i % 2){ mk(new THREE.CylinderGeometry(.035, .035, 1.2, 6), M(0x3c4652), x, H + .6, z); mk(new THREE.SphereGeometry(.1, 10, 8), lampMat, x, H + 1.22, z); }
    else { const b = mk(rbox(.7, .22, .26, .04), M(0xa77a52), x*.92, H, z*.92); b.rotation.y = -a + Math.PI/2; BENCH.push([x*.92, z*.92, -a + Math.PI/2]); } }
  for (const id in ZP){ const [cx, cz] = ZP[id]; for (let k = 0; k < 2; k++){ const a = (ZA[id] + 180 + (k ? 35 : -35))*D2R; const x = cx + 3.1*Math.cos(a), z = cz + 3.1*Math.sin(a);
    mk(new THREE.CylinderGeometry(.03, .03, 1.1, 6), M(0x3c4652), x, H + .55, z); mk(new THREE.SphereGeometry(.09, 10, 8), lampMat, x, H + 1.12, z); } }
  [[-2.4, -4.6, 0xc96a4f], [2.6, -4.4, 0x58a185], [-4.8, 2.2, 0xd09a3c], [4.6, 2.6, 0x4b8db0]].forEach(([x, z, c]) => { CAFE.push([x, z]);
    mk(new THREE.CylinderGeometry(.03, .03, 1.2, 6), M(0x6b6258), x, H + .6, z); mk(new THREE.ConeGeometry(.85, .32, 18), M(c), x, H + 1.3, z);
    mk(new THREE.CylinderGeometry(.3, .3, .05, 16), M(0xf3ece0), x, H + .5, z); });

  /* ---------- 雲、熱氣球、救護直升機 ---------- */
  const cloudMat = M(0xffffff, { roughness: 1, emissive: 0xffffff, emissiveIntensity: .18 });
  MAP3D.shiftReady = true;
  const clouds = new THREE.Group(); scene.add(clouds);
  [[200, 36, 9], [-30, 38, 11], [120, 40, 13], [-120, 35, 8], [60, 33, 2.2], [150, 32, 1.5], [10, 37, 5], [-80, 40, 15], [95, 31, .8]].forEach(([deg, R, y]) => {
    const g = new THREE.Group(); const [x, z] = polar(deg, R); g.position.set(x, y, z); clouds.add(g);
    const n = 5 + Math.floor(rnd()*3); for (let i = 0; i < n; i++){ const s = .9 + rnd()*1.2; const m = new THREE.Mesh(new THREE.SphereGeometry(s, 18, 14), cloudMat); m.position.set((i - n/2)*1.1 + rnd()*.5, rnd()*.7, rnd()*1.2 - .6); m.scale.y = .78; g.add(m); } });
  const balloons = [];
  [[-40, 13, -8, ["#f6d36b", "#f2b3c3"]], [41, 10, -2, ["#9cc6dc", "#f6efe2"]], [6, 19, -42, ["#c96a4f", "#f6efe2"]]].forEach(([x, y, z, cs], i) => {
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const env = mk(new THREE.SphereGeometry(2, 32, 24), M(0xffffff, { map: stripes(cs, 12), roughness: .7 }), 0, 0, 0, g); env.scale.y = 1.15;
    mk(rbox(.7, .5, .7, .08), M(0x9b7454), 0, -3.3, 0, g);
    [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]].forEach(([dx, dz]) => { const r = mk(new THREE.CylinderGeometry(.015, .015, 1.4, 4), M(0x6b5a48), dx*1.6, -2.4, dz*1.6, g); r.rotation.z = dx*.5; r.rotation.x = -dz*.5; });
    balloons.push({ g, y, p: i*2 }); });
  const heli = new THREE.Group(); scene.add(heli);
  const hb = mk(new THREE.CapsuleGeometry(.42, 1.0, 6, 14), M(0xf7f5f0), 0, 0, 0, heli); hb.rotation.z = Math.PI/2;
  mk(new THREE.CylinderGeometry(.43, .43, .18, 16), M(0xc96a4f), .1, 0, 0, heli).rotation.z = Math.PI/2;
  mk(new THREE.SphereGeometry(.34, 14, 10), M(0x5d8297, { roughness: .2 }), .62, .08, 0, heli);
  const boom = mk(new THREE.CylinderGeometry(.06, .12, 1.6, 8), M(0xf7f5f0), -1.4, .12, 0, heli); boom.rotation.z = Math.PI/2;
  const tailR = mk(new THREE.BoxGeometry(.04, .5, .06), M(0x55606a), -2.15, .25, .08, heli);
  const mainR = new THREE.Group(); mainR.position.set(0, .58, 0); heli.add(mainR);
  [0, Math.PI/2].forEach(a => { const b = mk(new THREE.BoxGeometry(3.2, .03, .12), M(0x3c4652), 0, 0, 0, mainR); b.rotation.y = a; });
  [-.3, .3].forEach(z => mk(new THREE.BoxGeometry(1.2, .04, .05), M(0x55606a), 0, -.55, z, heli));
  const redCross = tex(64, 64, x => { x.fillStyle = "#fff"; x.fillRect(0, 0, 64, 64); x.fillStyle = "#d23b2f"; x.fillRect(24, 8, 16, 48); x.fillRect(8, 24, 48, 16); });
  [-1, 1].forEach(s => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.38, .38), new THREE.MeshBasicMaterial({ map: redCross })); p.position.set(-.2, 0, s*.43); if (s < 0) p.rotation.y = Math.PI; heli.add(p); });

  /* ---------- PGY 路線（開關：PGY 路線） ---------- */
  const routePts = [new THREE.Vector3(ENT[0], H + 1.6, ENT[1]), new THREE.Vector3(0, H + 2.4, 6), new THREE.Vector3(0, H + 2.6, 0),
    new THREE.Vector3(ZP.mis[0]*.5, H + 2.4, ZP.mis[1]*.5), new THREE.Vector3(ZP.mis[0], H + 2.2, ZP.mis[1]), new THREE.Vector3(ZP.mis[0]*.45, H + 2.6, ZP.mis[1]*.45 - 2),
    new THREE.Vector3(ZP.us[0]*.45, H + 2.6, ZP.us[1]*.45 - 2), new THREE.Vector3(ZP.us[0], H + 2.2, ZP.us[1])];
  const routeCurve = new THREE.CatmullRomCurve3(routePts);
  const routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(routeCurve.getPoints(300)), new THREE.LineDashedMaterial({ color: 0xe0563b, dashSize: .5, gapSize: .3 }));
  routeLine.computeLineDistances(); routeLine.visible = false; scene.add(routeLine);
  const routeDots = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff7a55 })); m.visible = false; scene.add(m); return m; });

  /* ---------- 窗戶實體化 ---------- */
  const winIM = new THREE.InstancedMesh(new THREE.BoxGeometry(.24, .3, .03), winMat, WIN.length); WIN.forEach((m, i) => winIM.setMatrixAt(i, m)); scene.add(winIM);

  /* ---------- 人物（InstancedMesh，約 330 人） ---------- */
  const SKIN = ["#f0cfb2","#e3b895","#d2a07a","#b9845e","#f5d8c0"], HAIR = ["#1f1a17","#2e2420","#3b2c22","#5a4232","#7a6a5c","#9b958d"];
  const OUT = [ { w: 3, top: "#f6f6f3", pants: "#2f3a48", coat: 1 }, { w: 2, top: "#4f9a9a", pants: "#4f9a9a", cap: 1 }, { w: 2, top: "#3b5a86", pants: "#3b5a86", cap: 1 },
    { w: 1, top: "#86abc9", pants: "#86abc9", cap: 1 }, { w: 1, top: "#8a4a5a", pants: "#8a4a5a" }, { w: 2, top: "#e6e1d6", pants: "#3c4b63" }, { w: 2, top: "#c96a4f", pants: "#2d3440" },
    { w: 1, top: "#e3c46a", pants: "#55606e" }, { w: 1, top: "#5f7f5a", pants: "#3c3a36" }, { w: 1, top: "#2f3e4c", pants: "#8c8478" }, { w: 1, top: "#b58fb0", pants: "#3a4250" } ];
  const OW = OUT.flatMap((o, i) => Array(o.w).fill(i));
  const PEOPLE = [];
  const circ = (c, r, sp, y = H) => ({ type: "c", c, r, sp, a: rnd()*Math.PI*2, y });
  const curv = (curve, sp, off) => ({ type: "b", curve, sp, t: rnd(), off });
  const addP = (path, pose = "walk", fixed) => PEOPLE.push({ path, pose, fixed, o: OUT[OW[Math.floor(rnd()*OW.length)]], skin: SKIN[Math.floor(rnd()*SKIN.length)], hair: HAIR[Math.floor(rnd()*HAIR.length)], s: .92 + rnd()*.16, ph: rnd()*6.28, capOn: rnd() < .55 });
  for (const id in ZP) for (let i = 0; i < 13; i++) addP(circ(ZP[id], 2.9 + rnd()*.9, (rnd() < .5 ? -1 : 1)*(.12 + rnd()*.1)));
  for (let i = 0; i < 46; i++) addP(circ([0, 0], 3.6 + rnd()*3.6, (rnd() < .5 ? -1 : 1)*(.06 + rnd()*.06)));
  for (let i = 0; i < 14; i++) addP(circ(ENT, 1.0 + rnd()*1.8, (rnd() < .5 ? -1 : 1)*(.2 + rnd()*.15)));
  [[WHEEL, 2.9], [COAST, 3.3], [TOWER, 2.2]].forEach(([c, r]) => { for (let i = 0; i < 6; i++) addP(circ(c, r - rnd()*.4, (rnd() < .5 ? -1 : 1)*(.12 + rnd()*.08))); });
  BRIDGES.forEach(cv => { for (let i = 0; i < 5; i++) addP(curv(cv, (rnd() < .5 ? -1 : 1)*(.05 + rnd()*.05), (rnd() - .5)*.6)); });
  const fixed = (x, z, ry, pose = "stand", y = H) => addP(null, pose, { x, z, ry, y });
  const group = (cx, cz, n) => { for (let k = 0; k < n; k++){ const a = k/n*Math.PI*2 + rnd(), r = .35 + rnd()*.2; fixed(cx + r*Math.cos(a), cz + r*Math.sin(a), Math.atan2(-Math.cos(a), -Math.sin(a))); } };
  for (const id in ZP){ const a = (ZA[id] + 180)*D2R; group(ZP[id][0] + 2.6*Math.cos(a + .5), ZP[id][1] + 2.6*Math.sin(a + .5), 3 + Math.floor(rnd()*2)); }
  group(ENT[0] - 1.6, ENT[1] - 1.2, 4); group(ENT[0] + 1.8, ENT[1] - .6, 3); group(2.2, 3.4, 3); group(-3, -2.4, 3);
  BENCH.forEach(([x, z, ry]) => { fixed(x - .15*Math.cos(ry), z + .15*Math.sin(ry), ry + Math.PI, "sit"); if (rnd() < .6) fixed(x + .18*Math.cos(ry), z - .18*Math.sin(ry), ry + Math.PI, "sit"); });
  CAFE.forEach(([x, z]) => { fixed(x - .5, z, Math.PI/2, "sit"); fixed(x + .5, z, -Math.PI/2, "sit"); });
  for (let k = 0; k < 8; k++) fixed(COAST[0] - .9 + k*.32, COAST[1] - 3.55, Math.PI/2);
  for (let k = 0; k < 7; k++) fixed(WHEEL[0] - .2 + (k % 2)*.1, WHEEL[1] + 1.1 + k*.32, Math.PI);
  for (let k = 0; k < 5; k++) fixed(TOWER[0] + 1.1 + k*.3, TOWER[1] + .4, -Math.PI/2);

  const N = PEOPLE.length, pm = M(0xffffff, { roughness: .7 });
  /* Q 版比例：大頭、蓬髮、小身體 */
  const PART = {
    legL: new THREE.CapsuleGeometry(.05, .07, 3, 8), legR: new THREE.CapsuleGeometry(.05, .07, 3, 8),
    torso: new THREE.CapsuleGeometry(.135, .1, 5, 12), coat: new THREE.CylinderGeometry(.15, .185, .17, 14, 1, true),
    armL: new THREE.CapsuleGeometry(.04, .09, 3, 8), armR: new THREE.CapsuleGeometry(.04, .09, 3, 8),
    head: new THREE.SphereGeometry(.21, 20, 16), hair: new THREE.SphereGeometry(.226, 20, 12, 0, Math.PI*2, 0, Math.PI*.6),
    hairBack: new THREE.SphereGeometry(.2, 16, 12), bun: new THREE.SphereGeometry(.085, 12, 10),
    eyeL: new THREE.SphereGeometry(.027, 8, 6), eyeR: new THREE.SphereGeometry(.027, 8, 6),
    blushL: new THREE.SphereGeometry(.03, 8, 6), blushR: new THREE.SphereGeometry(.03, 8, 6) };
  const IM = {}; for (const k in PART){ IM[k] = new THREE.InstancedMesh(PART[k], k === "coat" ? M(0xffffff, { roughness: .75, side: THREE.DoubleSide }) : pm, N);
    IM[k].castShadow = !/eye|blush/.test(k); IM[k].instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(IM[k]); }
  const root = new THREE.Object3D(), body = new THREE.Object3D(); root.add(body);
  const node = (parent, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const hipL = node(body, -.06, .16, 0), hipR = node(body, .06, .16, 0), shL = node(body, -.15, .38, 0), shR = node(body, .15, .38, 0), headN = node(body, 0, .64, 0);
  const NODES = { legL: node(hipL, 0, -.07, 0), legR: node(hipR, 0, -.07, 0), torso: node(body, 0, .3, 0), coat: node(body, 0, .22, 0),
    armL: node(shL, 0, -.08, 0), armR: node(shR, 0, -.08, 0), head: node(headN, 0, 0, 0), hair: node(headN, 0, .03, -.012), hairBack: node(headN, 0, -.04, -.06),
    bun: node(headN, 0, .2, -.12), eyeL: node(headN, -.075, -.005, .193), eyeR: node(headN, .075, -.005, .193), blushL: node(headN, -.12, -.055, .165), blushR: node(headN, .12, -.055, .165) };
  NODES.torso.scale.set(1, 1, .85); NODES.coat.scale.set(1, 1, .86); NODES.hair.rotation.x = -.38; NODES.hairBack.scale.set(1.06, 1, .92);
  NODES.eyeL.scale.set(1, 1.25, .6); NODES.eyeR.scale.set(1, 1.25, .6); NODES.blushL.scale.set(1.3, .7, .4); NODES.blushR.scale.set(1.3, .7, .4);
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  PEOPLE.forEach((p, i) => { const o = p.o; p.bun = !o.cap && rnd() < .35;
    IM.legL.setColorAt(i, col.set(o.pants)); IM.legR.setColorAt(i, col.set(o.pants)); IM.torso.setColorAt(i, col.set(o.top)); IM.coat.setColorAt(i, col.set(o.top));
    const sleeve = o.coat ? "#f2f2ef" : (rnd() < .5 ? o.top : p.skin); IM.armL.setColorAt(i, col.set(sleeve)); IM.armR.setColorAt(i, col.set(sleeve));
    IM.head.setColorAt(i, col.set(p.skin)); const hc = o.cap && p.capOn ? o.top : p.hair;
    IM.hair.setColorAt(i, col.set(hc)); IM.hairBack.setColorAt(i, col.set(o.cap && p.capOn ? p.hair : p.hair)); IM.bun.setColorAt(i, col.set(p.hair));
    IM.eyeL.setColorAt(i, col.set("#2a1f1c")); IM.eyeR.setColorAt(i, col.set("#2a1f1c")); IM.blushL.setColorAt(i, col.set("#f3a3a0")); IM.blushR.setColorAt(i, col.set("#f3a3a0")); });
  function poseWrite(i, p, x, y, z, ry, swing){
    root.position.set(x, y, z); root.rotation.y = ry; root.scale.setScalar(p.s*1.28);
    const sit = p.pose === "sit"; body.position.y = sit ? -.1 : Math.abs(Math.cos(p.ph))*.035;
    hipL.rotation.x = sit ? -1.4 : swing*.8; hipR.rotation.x = sit ? -1.4 : -swing*.8;
    shL.rotation.x = sit ? -.4 : -swing; shR.rotation.x = sit ? -.4 : swing; shL.rotation.z = -.25; shR.rotation.z = .25;
    headN.rotation.z = sit ? 0 : Math.sin(p.ph)*.05;
    root.updateMatrixWorld(true);
    for (const k in NODES){ if ((k === "coat" && !p.o.coat) || (k === "bun" && !p.bun)) IM[k].setMatrixAt(i, zero); else IM[k].setMatrixAt(i, NODES[k].matrixWorld); } }
  const tmpV = new THREE.Vector3();
  function updatePeople(dt){
    PEOPLE.forEach((p, i) => {
      if (p.fixed){ if (!p.done){ poseWrite(i, p, p.fixed.x, p.fixed.y, p.fixed.z, p.fixed.ry, 0); p.done = true; } return; }
      const P = p.path; let x, z, y = H;
      if (P.type === "c"){ P.a += P.sp*dt; x = P.c[0] + P.r*Math.cos(P.a); z = P.c[1] + P.r*Math.sin(P.a); }
      else { P.t += P.sp*dt; if (P.t > 1 || P.t < 0){ P.sp = -P.sp; P.t = Math.max(0, Math.min(1, P.t)); }
        const pt = P.curve.getPoint(P.t), tg = P.curve.getTangent(P.t); x = pt.x + tg.z*P.off; z = pt.z - tg.x*P.off; y = pt.y + .1; }
      const dx = x - (p.lx ?? x), dz = z - (p.lz ?? z), d = Math.hypot(dx, dz);
      if (d > 1e-5) p.ry = Math.atan2(dx, dz);
      p.ph += d*13; p.lx = x; p.lz = z;
      poseWrite(i, p, x, y, z, p.ry || 0, Math.sin(p.ph)*.55); });
    for (const k in IM) IM[k].instanceMatrix.needsUpdate = true; }
  for (const k in IM) if (IM[k].instanceColor) IM[k].instanceColor.needsUpdate = true;

  /* ---------- 長官小人（點選顯示名字與職稱） ---------- */
  const LEAD = [];
  function figure(ld){
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const outfit = ld.outfit || "coat", suit = outfit === "suit", blouse = outfit === "blouse", polo = outfit === "polo";
    const topC = ld.top ? new THREE.Color(ld.top).getHex() : suit ? 0x22324a : 0xf7f7f4, pantC = suit ? 0x22324a : (blouse || polo) ? 0x3b3f47 : 0x2f3a48;
    const mat = c => M(c, { roughness: .65 }), skin = mat(0xf2cfb2), hair = M(new THREE.Color(ld.hairColor || "#2b2220").getHex(), { roughness: .55, side: THREE.DoubleSide });
    const hip = x => { const h = new THREE.Group(); h.position.set(x, .16, 0); body.add(h); mk(new THREE.CapsuleGeometry(.05, .07, 3, 8), mat(pantC), 0, -.07, 0, h); mk(new THREE.SphereGeometry(.055, 10, 8), mat(0x1c1c1e), 0, -.14, .02, h).scale.set(1, .6, 1.3); return h; };
    const hipL = hip(-.06), hipR = hip(.06);
    const torso = mk(new THREE.CapsuleGeometry(.14, .1, 5, 14), mat(topC), 0, .3, 0, body); torso.scale.z = .86;
    if (outfit === "coat"){ const coat = mk(new THREE.CylinderGeometry(.155, .19, .17, 14, 1, true), M(0xf7f7f4, { side: THREE.DoubleSide }), 0, .22, 0, body); coat.scale.z = .86; }
    if (suit){ mk(new THREE.BoxGeometry(.09, .12, .02), mat(0xf4f4f0), 0, .36, .12, body); mk(new THREE.BoxGeometry(.03, .12, .015), mat(0xb8343d), 0, .34, .133, body); }
    if (blouse){ const c2 = mk(new THREE.TorusGeometry(.085, .02, 6, 18), mat(new THREE.Color(ld.top || "#b9a7d6").offsetHSL(0, 0, .1).getHex()), 0, .44, .01, body); c2.rotation.x = Math.PI/2; }
    if (polo){ const lc = new THREE.Color(topC).offsetHSL(0, 0, .08).getHex();
      [-1, 1].forEach(sd => { const c2 = mk(new THREE.BoxGeometry(.08, .022, .05), mat(lc), sd*.045, .44, .07, body); c2.rotation.z = -sd*.35; c2.rotation.x = .5; });
      mk(new THREE.BoxGeometry(.028, .09, .012), mat(lc), 0, .37, .125, body); }
    mk(new THREE.SphereGeometry(.03, 10, 8), M(0xf1c44a, { metalness: .5, roughness: .3 }), .075, .32, .12, body);
    const sh = x => { const h = new THREE.Group(); h.position.set(x, .38, 0); h.rotation.z = x < 0 ? -.25 : .25; body.add(h);
      const sleeve = polo ? skin : mat(outfit === "coat" ? 0xf7f7f4 : topC); mk(new THREE.CapsuleGeometry(.04, .09, 3, 8), sleeve, 0, -.08, 0, h);
      if (polo) mk(new THREE.CapsuleGeometry(.052, .02, 3, 8), mat(topC), 0, -.02, 0, h);
      mk(new THREE.SphereGeometry(.042, 8, 6), skin, 0, -.15, 0, h); return h; };
    const shL = sh(-.15), shR = sh(.15);
    const head = new THREE.Group(); head.position.y = .64; body.add(head);
    mk(new THREE.SphereGeometry(.21, 24, 18), skin, 0, 0, 0, head);
    [-1, 1].forEach(sd => { const e = mk(new THREE.SphereGeometry(.027, 10, 8), mat(0x2a1f1c), sd*.075, -.005, .193, head); e.scale.set(1, 1.25, .6);
      const b2 = mk(new THREE.SphereGeometry(.03, 10, 8), mat(0xf3a3a0), sd*.12, -.055, .165, head); b2.scale.set(1.3, .7, .4); });
    const cap = mk(new THREE.SphereGeometry(.228, 24, 14, 0, Math.PI*2, 0, Math.PI*.58), hair, 0, .03, -.012, head); cap.rotation.x = -.36;
    const back = mk(new THREE.SphereGeometry(.205, 18, 14), hair, 0, -.035, -.065, head); back.scale.set(1.06, 1, .9);
    if (ld.hair === "bob"){
      mk(new THREE.CylinderGeometry(.225, .24, .2, 24, 1, true, .95, Math.PI*2 - 1.9), hair, 0, -.08, -.005, head);
      const fr = mk(new THREE.SphereGeometry(.12, 14, 10), hair, .05, .13, .13, head); fr.scale.set(1.25, .45, .55); fr.rotation.z = -.35; }
    if (ld.hair === "shoulder"){
      const lb = mk(new THREE.CylinderGeometry(.226, .26, .36, 26, 3, true, .85, Math.PI*2 - 1.7), hair, 0, -.14, -.006, head);
      const pos = lb.geometry.attributes.position; for (let i = 0; i < pos.count; i++){ const y = pos.getY(i), a = Math.atan2(pos.getX(i), pos.getZ(i)); const k = 1 + .06*Math.sin(a*6 + y*25); pos.setX(i, pos.getX(i)*k); pos.setZ(i, pos.getZ(i)*k); } lb.geometry.computeVertexNormals();
      const fr = mk(new THREE.SphereGeometry(.13, 14, 10), hair, 0, .12, .14, head); fr.scale.set(1.35, .42, .5); }
    if (ld.hair === "short"){ const fr = mk(new THREE.SphereGeometry(.12, 14, 10), hair, -.04, .14, .13, head); fr.scale.set(1.3, .38, .5); fr.rotation.z = .3; }
    if (ld.glasses){ const gm = mat(0x3a2e2a);
      [-1, 1].forEach(sd => { mk(new THREE.TorusGeometry(.045, .008, 6, 20), gm, sd*.075, -.005, .2, head); const arm = mk(new THREE.BoxGeometry(.008, .008, .14), gm, sd*.155, 0, .12, head); arm.rotation.y = -sd*.35; });
      mk(new THREE.BoxGeometry(.06, .008, .008), gm, 0, .0, .208, head); }
    g.scale.setScalar(1.45); return { g, body, hipL, hipR, shL, shR, head };
  }
  /* 自由走動用的島嶼與木橋路網 */
  const ISL = { c: [[0, 0], 4.3] , ENT: [ENT, 2.4], WHEEL: [WHEEL, 2.6], COAST: [COAST, 3.0], TOWER: [TOWER, 2.0] };
  for (const id in ZP) ISL[id] = [ZP[id], 3.3];
  const islAng = (k, x, z) => Math.atan2(z - ISL[k][0][1], x - ISL[k][0][0]);
  const islPt = (k, a) => new THREE.Vector3(ISL[k][0][0] + ISL[k][1]*Math.cos(a), H, ISL[k][0][1] + ISL[k][1]*Math.sin(a));
  function planLeg(L){
    const k = L.isl, q = L.queue, arc = (a0, a1) => { let d = ((a1 - a0 + Math.PI*3) % (Math.PI*2)) - Math.PI; const n = Math.max(2, Math.ceil(Math.abs(d)/.25));
      for (let i = 1; i <= n; i++) q.push(islPt(k, a0 + d*i/n)); return a0 + d; };
    const links = BRIDGES.map((cv, i) => ({ cv, i, e: BRIDGE_ENDS[i] })).filter(o => o.e.a === k || o.e.b === k);
    if (rnd() < .5 || !links.length){ L.ang = arc(L.ang, L.ang + (rnd() < .5 ? -1 : 1)*(.8 + rnd()*2)); q.push({ pause: 1.2 + rnd()*2 }); return; }
    const o = links[Math.floor(rnd()*links.length)], fwd = o.e.a === k, other = fwd ? o.e.b : o.e.a;
    const p0 = o.cv.getPoint(fwd ? 0 : 1), p1 = o.cv.getPoint(fwd ? 1 : 0);
    arc(L.ang, islAng(k, p0.x, p0.z)); q.push(p0.clone());
    for (let i = 1; i <= 24; i++){ const t = fwd ? i/24 : 1 - i/24; const pp = o.cv.getPoint(t); pp.y += .1; q.push(pp); }
    L.isl = other; L.ang = islAng(other, p1.x, p1.z); q.push(islPt(other, L.ang)); q.push({ pause: .8 + rnd()*1.5 }); }
  (typeof LEADERS !== "undefined" ? LEADERS : []).forEach((ld, i) => {
    let base; if (ld.where === "gate") base = [ENT[0] - 1.2, ENT[1] + 1.2]; else if (ZP[ld.where]){ const d = Math.hypot(...ZP[ld.where]); base = [ZP[ld.where][0] - ZP[ld.where][0]/d*3.0, ZP[ld.where][1] - ZP[ld.where][1]/d*3.0]; }
    else base = [2.4 + (i % 3)*.9, 2.6 + Math.floor(i/3)*.9];
    const f = figure(ld); f.g.position.set(base[0], H, base[1]); scene.add(f.g);
    f.g.traverse(o => { if (o.isMesh){ o.userData.leader = i; pickables.push(o); } });
    const L = { ...f, ld, base, ph: i*1.7, free: ld.where === "free" };
    if (L.free){ L.isl = ["c", "ENT", "mis", "airway", "sim"][i % 5]; L.ang = rnd()*Math.PI*2; L.queue = []; L.pos = islPt(L.isl, L.ang); L.wait = 0; f.g.position.copy(L.pos); }
    LEAD.push(L); });
  function updateLeaders(T, dt){
    LEAD.forEach(L => {
      if (L.free){
        let moving = false;
        if (L.wait > 0){ L.wait -= dt; }
        else { if (!L.queue.length) planLeg(L);
          let step = .9*dt;
          while (step > 0 && L.queue.length){ const nx = L.queue[0];
            if (nx.pause !== undefined){ L.wait = nx.pause; L.queue.shift(); break; }
            const d = L.pos.distanceTo(nx);
            if (d <= step){ L.pos.copy(nx); L.queue.shift(); step -= d; }
            else { const dir = nx.clone().sub(L.pos).normalize(); L.pos.addScaledVector(dir, step); if (Math.hypot(dir.x, dir.z) > .05) L.g.rotation.y = Math.atan2(dir.x, dir.z); step = 0; moving = true; } } }
        L.g.position.copy(L.pos);
        const sw = moving ? Math.sin(T*6.5)*.5 : 0;
        L.hipL.rotation.x = sw; L.hipR.rotation.x = -sw; L.shL.rotation.x = -sw*.8;
        if (!moving && L.wait > 0 && L.wait < 1.2){ L.shR.rotation.x = 0; L.shR.rotation.z = 2.6 + Math.sin(T*9)*.3; } else { L.shR.rotation.z = .25; L.shR.rotation.x = sw*.8; }
        L.body.position.y = moving ? Math.abs(Math.cos(T*6.5))*.035 : 0;
        return; } const cyc = (T*.12 + L.ph) % 2, walking = cyc < 1, u = walking ? cyc : 2 - cyc;
      const k = (walking ? cyc : cyc - 1), x = L.base[0] + (walking ? k : 1 - k)*1.4 - .7;
      L.g.position.set(x, H, L.base[1]); L.g.rotation.y = walking ? Math.PI/2 : -Math.PI/2;
      const pause = (k > .85), sw = pause ? 0 : Math.sin(T*6)*.5;
      L.hipL.rotation.x = sw; L.hipR.rotation.x = -sw; L.shL.rotation.x = -sw*.8;
      if (pause){ L.g.rotation.y = 0; L.shR.rotation.x = 0; L.shR.rotation.z = 2.5 + Math.sin(T*9)*.3; } else { L.shR.rotation.z = .06; L.shR.rotation.x = sw*.8; }
      L.body.position.y = pause ? 0 : Math.abs(Math.cos(T*6))*.015; }); }

  /* ---------- 名牌（HTML 標籤） ---------- */
  const TAGS = [];
  const TOPY = { acls: 3.9, mis: 2.5, us: 3.0, airway: 6.6, sim: 2.0, service: 2.6 };
  ZONES.forEach(zd => { if (!ZP[zd.id]) return; const b = document.createElement("button"); b.type = "button"; b.className = "tag3d zone"; b.dataset.zone = zd.id;
    b.style.setProperty("--zc", "#" + ZCOL[zd.id].toString(16).padStart(6, "0"));
    b.innerHTML = `<span class="ico"><svg aria-hidden="true"><use href="#${zd.icon}"/></svg></span><b>${zd.name}</b>`; b.setAttribute("aria-label", `${zd.name}：${zd.tagline}`);
    tagLayer.appendChild(b); TAGS.push({ el: b, p: new THREE.Vector3(ZP[zd.id][0], H + TOPY[zd.id] + .5, ZP[zd.id][1]), zone: zd.id }); });
  [["心跳雲霄飛車", COAST, 4.6, "#c96a4f"], ["摩天輪", WHEEL, 8.0, "#4b8db0"], ["自由落體塔", TOWER, 7.6, "#d09a3c"], ["旋轉木馬", [0, 0], 3.2, "#c96a4f"], ["救護直升機停機坪", [ZP.acls[0] - 1.8, ZP.acls[1] + 3.2], 1.0, "#1b3550"]].forEach(([t, c, y, colr]) => {
    const s = document.createElement("span"); s.className = "tag3d ride"; s.innerHTML = `<i style="background:${colr}"></i>${t}`; tagLayer.appendChild(s); TAGS.push({ el: s, p: new THREE.Vector3(c[0], H + y, c[1]) }); });
  const LEADPIN = LEAD.map((L, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "tag3d leader"; b.innerHTML = "<span>★</span>";
    b.setAttribute("aria-label", `長官：${L.ld.name}，點選查看`); b.title = L.ld.name; b.addEventListener("click", e => { e.stopPropagation(); showLeader(i); }); tagLayer.appendChild(b); return b; });
  const card = document.createElement("div"); card.className = "leader-card"; card.hidden = true; card.setAttribute("role", "dialog"); wrap.appendChild(card);
  let cardFor = null;
  function showLeader(i){ const L = LEAD[i]; cardFor = i;
    card.innerHTML = `<span class="lc-badge">★</span><span><b>${esc(L.ld.name)}</b><small>${esc(L.ld.title || "")}</small></span><button type="button" class="lc-x" aria-label="關閉">×</button>`;
    card.hidden = false; card.querySelector(".lc-x").addEventListener("click", e => { e.stopPropagation(); card.hidden = true; cardFor = null; }); }
  MAP3D.showLeader = showLeader;
  const headP = new THREE.Vector3();
  const plaza = document.getElementById("plaza"); const plazaP = new THREE.Vector3(ENT[0], H + 6.4, ENT[1] + 3.1);
  const proj = new THREE.Vector3();
  function placeTags(){ const w = host.clientWidth, h = host.clientHeight;
    TAGS.forEach(t => { proj.copy(t.p).project(camera); const vis = proj.z < 1 && Math.abs(proj.x) < 1.15 && Math.abs(proj.y) < 1.15;
      t.el.style.visibility = vis ? "" : "hidden"; if (vis) t.el.style.transform = `translate(${((proj.x*.5 + .5)*w).toFixed(1)}px,${((-proj.y*.5 + .5)*h).toFixed(1)}px) translate(-50%,-100%)`; });
    LEAD.forEach((L, i) => { headP.copy(L.g.position); headP.y += 1.42; proj.copy(headP).project(camera);
      const x = (proj.x*.5 + .5)*w, y = (-proj.y*.5 + .5)*h, vis = proj.z < 1; LEADPIN[i].style.visibility = vis ? "" : "hidden";
      LEADPIN[i].style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%) rotate(-45deg)`;
      if (cardFor === i) card.style.transform = `translate(${x.toFixed(1)}px,${(y - 34).toFixed(1)}px) translate(-50%,-100%)`; });
    proj.copy(plazaP).project(camera); plaza.style.left = ((proj.x*.5 + .5)*w).toFixed(1) + "px"; plaza.style.top = ((-proj.y*.5 + .5)*h).toFixed(1) + "px";
    plaza.style.visibility = proj.z < 1 ? "" : "hidden"; }

  /* ---------- 互動 ---------- */
  let hotZone = null;
  function setHot(id){ if (hotZone === id) return; hotZone = id;
    for (const z in ZMAT) ZMAT[z].forEach(m => { m.emissive.set(z === id ? 0xffc46b : 0x000000); m.emissiveIntensity = z === id ? .28 : 0; });
    TAGS.forEach(t => t.zone && t.el.classList.toggle("hot", t.zone === id)); renderer.domElement.style.cursor = id ? "pointer" : "grab"; }
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  function pick(e){ const r = renderer.domElement.getBoundingClientRect(); ptr.set((e.clientX - r.left)/r.width*2 - 1, -(e.clientY - r.top)/r.height*2 + 1);
    ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(pickables, false)[0]; return h ? h.object.userData : null; }
  let down = null, tween = null;
  function flyTo(target, dist = 22){ const dir = camera.position.clone().sub(controls.target).normalize(); const pos = target.clone().addScaledVector(dir, dist); pos.y = Math.max(pos.y, target.y + 10);
    tween = { t: 0, fp: camera.position.clone(), ft: controls.target.clone(), tp: pos, tt: target.clone() }; if (still){ controls.target.copy(target); camera.position.copy(pos); tween = null; } }
  function enterZone(id){ setHot(id); flyTo(new THREE.Vector3(ZP[id][0], H + 1, ZP[id][1])); setTimeout(() => go(id), still ? 0 : 700); }
  renderer.domElement.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("pointerup", e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; down = null; const u = pick(e); if (!u) return; if (u.leader !== undefined) showLeader(u.leader); else if (u.zone) enterZone(u.zone); });
  renderer.domElement.addEventListener("pointermove", e => { if (e.buttons) return; const u = pick(e); setHot(u && u.zone ? u.zone : null); if (u && u.leader !== undefined) renderer.domElement.style.cursor = "pointer"; });
  renderer.domElement.addEventListener("pointerleave", () => setHot(null));
  TAGS.forEach(t => { if (!t.zone) return; t.el.addEventListener("click", () => enterZone(t.zone)); t.el.addEventListener("mouseenter", () => setHot(t.zone)); t.el.addEventListener("mouseleave", () => setHot(null));
    t.el.addEventListener("focus", () => setHot(t.zone)); t.el.addEventListener("blur", () => setHot(null)); });
  MAP3D.enter = enterZone;
  MAP3D.home = () => { flyTo(HOME_T, HOME_POS.distanceTo(HOME_T)); tween && (tween.tp = HOME_POS.clone()); };
  MAP3D.labels = on => wrap.classList.toggle("labels-off", !on);
  MAP3D.spin = on => { controls.autoRotate = on; };
  MAP3D.route = on => { routeLine.visible = on; routeDots.forEach(d => d.visible = on); };
  /* 時段：白班／小夜／大夜（光線、窗戶與路燈） */
  const SHIFT = {
    day:   { hemi: [0xfff6ea, 0x9fc2bb, .5], sun: [0xfff1de, .82], amb: .04, water: 0x93d3d6, win: 0, lamp: 0, cloud: .18 },
    eve:   { hemi: [0xffd6c2, 0x9c95b8, .42], sun: [0xffa772, .72], amb: .03, water: 0x86b9c4, win: .55, lamp: .9, cloud: .05 },
    night: { hemi: [0x8aa0d0, 0x22324a, .3], sun: [0xa9bbff, .3], amb: .03, water: 0x2d5568, win: 1.1, lamp: 1.4, cloud: 0 } };
  MAP3D.shift = name => { const s = SHIFT[name]; wrap.dataset.shift = name;
    hemi.color.set(s.hemi[0]); hemi.groundColor.set(s.hemi[1]); hemi.intensity = s.hemi[2]; sun.color.set(s.sun[0]); sun.intensity = s.sun[1]; amb.intensity = s.amb;
    waterMat.color.set(s.water); winMat.emissiveIntensity = s.win; lampMat.emissiveIntensity = s.lamp; cloudMat.emissiveIntensity = s.cloud;
    cloudMat.color.set(name === "night" ? 0x8fa0bf : 0xffffff); };

  MAP3D.shift("day");
  /* ---------- 尺寸與動畫迴圈 ---------- */
  function resize(){ const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  let T = 0, last = performance.now();
  updatePeople(0);
  function loop(now){
    requestAnimationFrame(loop);
    if (wrap.offsetParent === null){ last = now; return; }
    const dt = still ? 0 : Math.min(.05, (now - last)/1000); last = now; T += dt;
    rotor.rotation.z = T*.12; gondolas.forEach((g, i) => { const a = T*.12 + i/16*Math.PI*2; g.position.set(-Math.sin(a)*WR, hubY + Math.cos(a)*WR, 0); });
    carousel.rotation.y = T*.35; horses.forEach((h, i) => { h.position.y = .5 + .12*Math.sin(T*2.2 + i); });
    cCars.forEach((c, i) => { const t = ((T*.05) - i*.012 + 10) % 1; c.position.copy(cCurve.getPointAt(t)); c.position.y += .14; c.lookAt(cCurve.getPointAt((t + .003) % 1).add(new THREE.Vector3(0, .14, 0))); });
    const cyc = (T % 9)/9; towerCar.position.y = cyc < .6 ? .8 + cyc/.6*5.4 : cyc < .7 ? 6.2 : cyc < .76 ? 6.2 - ((cyc - .7)/.06)**2*5.4 : .8;
    const ha = T*.16; heli.position.set(26*Math.cos(ha), 10 + Math.sin(T*.7)*.4, 26*Math.sin(ha)); heli.rotation.y = -ha - Math.PI/2*0 + Math.PI; mainR.rotation.y = T*18; tailR.rotation.z = T*22;
    heli.rotation.y = Math.atan2(-Math.sin(ha), -Math.cos(ha)) + Math.PI/2;
    balloons.forEach(b => { b.g.position.y = b.y + Math.sin(T*.5 + b.p)*.6; b.g.rotation.y = T*.05; });
    clouds.rotation.y = T*.008;
    ripples.forEach(r => { const k = (T*.25 + r.p) % 1; r.m.scale.setScalar(.6 + k*2.2); r.m.material.opacity = .45*(1 - k); });
    gate.children.forEach(c => { if (c.userData.flag) c.rotation.y = Math.sin(T*3 + c.position.x)*.35; });
    if (routeLine.visible){ routeLine.material.dashOffset = -T*1.5; routeDots.forEach((d, i) => d.position.copy(routeCurve.getPointAt(((T*.06) + i/4) % 1))); }
    updatePeople(dt); updateLeaders(T, dt);
    if (tween){ tween.t = Math.min(1, tween.t + dt/1.0); const k = 1 - Math.pow(1 - tween.t, 3); camera.position.lerpVectors(tween.fp, tween.tp, k); controls.target.lerpVectors(tween.ft, tween.tt, k); if (tween.t >= 1) tween = null; }
    controls.update(); renderer.render(scene, camera); placeTags(); }
  requestAnimationFrame(loop);
  }
})();

/* ---------- 地圖上的介面：時段、開關、園區晶片、清單、搜尋 ---------- */
(function hud(){
  const chips = document.getElementById("chips3d");
  if (!chips) return;
  chips.innerHTML = ZONES.map(z => `<button type="button" class="chip3d" data-go="${z.id}" style="--zc:${z.color}"><span class="ico">${icon(z.icon)}</span><span><b>${esc(z.name)}</b><small>${esc(z.tagline)}</small></span></button>`).join("");
  const goZone = id => (MAP3D.enter ? MAP3D.enter(id) : go(id));
  chips.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) goZone(b.dataset.go); });
  document.querySelectorAll(".seg [data-shift]").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".seg [data-shift]").forEach(x => x.setAttribute("aria-pressed", x === b)); MAP3D.shift && MAP3D.shift(b.dataset.shift); }));
  const tg = (id, fn) => { const el = document.getElementById(id); el.addEventListener("change", () => fn && fn(el.checked)); };
  tg("tgLabels", on => MAP3D.labels && MAP3D.labels(on)); tg("tgRoute", on => MAP3D.route && MAP3D.route(on)); tg("tgSpin", on => MAP3D.spin && MAP3D.spin(on));
  document.getElementById("btnHome").addEventListener("click", () => MAP3D.home && MAP3D.home());
  const list = document.getElementById("listPanel"), btnList = document.getElementById("btnList");
  list.innerHTML = ZONES.map(z => `<button type="button" class="dd-item" data-go="${z.id}" style="--zc:${z.color}"><span class="ico">${icon(z.icon)}</span><span><b>${esc(z.name)}</b><small>${esc(z.tagline)}</small></span></button>`).join("");
  btnList.addEventListener("click", () => { const open = list.hidden; list.hidden = !open; btnList.setAttribute("aria-expanded", open); });
  list.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b){ list.hidden = true; btnList.setAttribute("aria-expanded", false); goZone(b.dataset.go); } });
  const q = document.getElementById("q3d"), res = document.getElementById("q3dResults");
  q.addEventListener("input", () => { const s = q.value.trim().toLowerCase(); if (!s){ res.hidden = true; return; }
    const hits = []; ZONES.forEach(z => { if (z.name.includes(s) || z.tagline.toLowerCase().includes(s)) hits.push({ z, i: null, label: z.name });
      z.courses.forEach((c, i) => { if (c.name.toLowerCase().includes(s) || c.summary.includes(s)) hits.push({ z, i, label: c.name }); });
      (z.services || []).forEach(sv => { if (sv.name.includes(s)) hits.push({ z, i: null, label: sv.name }); }); });
    res.innerHTML = hits.length ? hits.slice(0, 8).map(h => `<button type="button" class="dd-item" data-go="${h.z.id}" data-i="${h.i ?? ""}" style="--zc:${h.z.color}"><span class="ico">${icon(h.z.icon)}</span><span><b>${esc(h.label)}</b><small>${esc(h.z.name)}</small></span></button>`).join("") : `<p class="dd-empty">找不到符合的課程</p>`;
    res.hidden = false; });
  res.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (!b) return; if (b.dataset.i !== "") selected[b.dataset.go] = +b.dataset.i; res.hidden = true; q.value = ""; goZone(b.dataset.go); });
  document.addEventListener("click", e => { if (!e.target.closest(".hud-tr")){ list.hidden = true; res.hidden = true; btnList.setAttribute("aria-expanded", false); } });
})();

