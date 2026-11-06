/* =====================================================================
   【海浪聲】用 Web Audio 即時合成的海浪聲（不需要音檔，離線也能用）
   - 右下角「🌊 海浪聲」按鈕開關；選擇會記在瀏覽器裡
   - 瀏覽器規定要使用者點過畫面才能出聲：開過的話，下次點畫面任一處就會接著播
   - 音量：調整 VOLUME（0～1）
   ===================================================================== */
(function waves(){
  const VOLUME = 0.35;
  const AC = window.AudioContext || window.webkitAudioContext;
  const btn = document.getElementById("btnWaves");
  if (!btn) return;
  if (!AC){ btn.hidden = true; return; }

  const KEY = "skillpark-waves";
  const load = () => { try { return localStorage.getItem(KEY) === "on"; } catch(e){ return false; } };
  const save = on => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch(e){} };

  let ctx = null, master = null, on = false;

  // 粉紅雜訊（比白雜訊低沉，像遠處的浪）
  function noiseBuffer(c, seconds){
    const len = c.sampleRate * seconds, buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++){
      const d = buf.getChannelData(ch); let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < len; i++){
        const w = Math.random()*2-1;
        b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759; b2=.969*b2+w*.153852;
        b3=.8665*b3+w*.3104856; b4=.55*b4+w*.5329522; b5=-.7616*b5-w*.016898;
        d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.3; b6=w*.115926;
      }
    }
    return buf;
  }

  function build(){
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const limiter = ctx.createDynamicsCompressor();   // 避免浪頭太大聲時爆音
    limiter.threshold.value = -10; limiter.knee.value = 6; limiter.ratio.value = 12;
    master.connect(limiter).connect(ctx.destination);
    const buf = noiseBuffer(ctx, 6);
    // 兩層浪：低沉的浪身＋高頻的浪花，各自用不同週期起伏
    [[650, 7.5, 1.0, 0], [2600, 9.7, .35, 3.1]].forEach(([freq, period, level, offset]) => {
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = Math.random();
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = freq; lp.Q.value = .4;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(lp).connect(g).connect(master);
      src.start(0, offset);
      // 每一道浪：慢慢湧上、碎開、退去，週期稍微隨機
      let t = ctx.currentTime + offset * .3;
      (function schedule(){
        while (t < ctx.currentTime + 30){
          const p = period * (.8 + Math.random() * .4), peak = level * (.55 + Math.random() * .45);
          g.gain.setValueAtTime(.05 * level, t);
          g.gain.linearRampToValueAtTime(peak, t + p * .42);
          g.gain.exponentialRampToValueAtTime(.05 * level, t + p);
          lp.frequency.setValueAtTime(freq * .6, t);
          lp.frequency.linearRampToValueAtTime(freq * 1.25, t + p * .45);
          lp.frequency.linearRampToValueAtTime(freq * .6, t + p);
          t += p;
        }
        setTimeout(schedule, 10000);
      })();
    });
  }

  function set(next){
    on = next; save(on);
    btn.setAttribute("aria-pressed", on);
    btn.querySelector("span").textContent = on ? "海浪聲 開" : "海浪聲";
    if (on){
      if (!ctx) build();
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 1.2);    // 淡入
    } else if (ctx){
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, .4);          // 淡出
      setTimeout(() => { if (!on) ctx.suspend(); }, 2000);
    }
  }

  btn.addEventListener("click", () => set(!on));
  // 之前開過：等使用者第一次點畫面時自動接著播
  if (load()){
    btn.setAttribute("aria-pressed", "true"); btn.querySelector("span").textContent = "海浪聲 開";
    const resume = e => { if (e.target.closest && e.target.closest("#btnWaves")) return; set(true); };
    document.addEventListener("pointerdown", resume, { once: true, capture: true });
    document.addEventListener("keydown", resume, { once: true, capture: true });
  }
  // 切到別的分頁時暫停，回來再繼續
  document.addEventListener("visibilitychange", () => { if (!ctx || !on) return; document.hidden ? ctx.suspend() : ctx.resume(); });
})();
