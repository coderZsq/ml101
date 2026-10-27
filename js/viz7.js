import { setupCanvas, fmt } from "./util.js";
import { MNIST_SAMPLES } from "./mnist_samples.js";

function drawDigit(canvas, pixels, cell) {
  const n = 28;
  canvas.width = n * cell;
  canvas.height = n * cell;
  canvas.style.width = n * cell + "px";
  canvas.style.height = n * cell + "px";
  const ctx = canvas.getContext("2d");
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const v = pixels[r * n + c];
      const g = Math.round(255 - v * 255);
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }
  }
  return canvas.getContext("2d");
}

function panel(root, title, controlsHTML) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>${title}</div>
      <div class="viz-controls">${controlsHTML || ""}</div>
    </div>
  `;
  root.appendChild(el);
  return el;
}

// ================= 面板 A：像模型一样看数字 =================
function mountSeeLikeModel(root) {
  const el = panel(root, "像模型一样看数字 · 选一张真实 MNIST 手写图", "");
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="mnist-thumbs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;"></div>
    <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;">
      <div>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <button class="btn btn-ghost mode" data-m="img">看图片</button>
          <button class="btn btn-ghost mode" data-m="px">看 784 个数字</button>
        </div>
        <div class="digit-stage"></div>
      </div>
      <div class="flatten-info" style="flex:1;min-width:220px;font-size:13.5px;color:var(--ink-2);"></div>
    </div>`;
  el.appendChild(body);

  const thumbs = body.querySelector(".mnist-thumbs");
  const stage = body.querySelector(".digit-stage");
  const info = body.querySelector(".flatten-info");
  const modeBtns = body.querySelectorAll(".mode");
  let cur = 0, mode = "img";

  MNIST_SAMPLES.forEach((s, i) => {
    const c = document.createElement("canvas");
    c.style.cssText = "width:44px;height:44px;border-radius:6px;border:2px solid " +
      (s.label === s.pred ? "#2b352c" : "#b5524d") + ";cursor:pointer";
    c.width = 28; c.height = 28;
    drawDigit(c, s.pixels, 1);
    c.addEventListener("click", () => { cur = i; render(); });
    c.title = `真实数字 ${s.label}`;
    thumbs.appendChild(c);
  });

  function render() {
    thumbs.querySelectorAll("canvas").forEach((c, i) => {
      c.style.borderColor = i === cur ? "#7cb387" : (MNIST_SAMPLES[i].label === MNIST_SAMPLES[i].pred ? "#2b352c" : "#b5524d");
    });
    modeBtns.forEach((b) => (b.style.borderColor = b.dataset.m === mode ? "#7cb387" : ""));
    stage.innerHTML = "";
    const s = MNIST_SAMPLES[cur];
    const c = document.createElement("canvas");
    if (mode === "img") {
      drawDigit(c, s.pixels, 10);
      info.innerHTML = `这是 MNIST 测试集里的一张真实手写数字，答案：<b style="color:var(--ink)">${s.label}</b>。<br/><br/>点「看 784 个数字」，看看电脑眼中的它是什么样子——模型从来没有"图"的概念，它只认识数字。`;
    } else {
      const ctx = drawDigit(c, s.pixels, 20);
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      for (let r = 0; r < 28; r++)
        for (let col = 0; col < 28; col++) {
          const v = s.pixels[r * 28 + col];
          if (v < 0.05) continue;  // 背景太亮的地方数字看不清，跳过
          ctx.fillStyle = v > 0.5 ? "#111" : "#f2f5ec";
          ctx.fillText(v.toFixed(1), col * 20 + 10, r * 20 + 12);
        }
      const head = s.pixels.slice(0, 14).map((v) => v.toFixed(2)).join(", ");
      info.innerHTML = `每一个格子是一个 <b style="color:var(--ink)">0~1 的数</b>（越白越接近 1）。<br/><br/>28×28 = <b style="color:var(--ink)">784 个数</b>，从左到右、从上到下排成一排，就是模型的全部输入：<br/><code style="display:block;margin-top:8px;word-break:break-all">[${head}, … 共 784 个]</code><br/>这就是代码里 <code>nn.Flatten()</code> 干的事——把图片"拉平"成数字队列。`;
    }
  }
  modeBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; render(); }));
  render();
}

// ================= 面板 B：10 个得分怎么变成答案 =================
function mountScoring(root) {
  const el = panel(root, "模型怎么打分 · 10 个类别的概率", `
    <button class="btn btn-primary score-btn">让模型打分</button>
  `);
  const body = document.createElement("div");
  body.innerHTML = `
    <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;">
      <div class="score-digit"></div>
      <div style="flex:1;min-width:300px;"><canvas class="viz score-chart"></canvas></div>
    </div>
    <div class="viz-hint score-note">先选一张图，再点「让模型打分」。柱子 = 模型认为属于每个数字的概率，最高的那根就是答案。</div>`;
  el.appendChild(body);
  const thumbs = body.querySelector(".mnist-thumbs");
  const digitBox = body.querySelector(".score-digit");
  const canvas = body.querySelector(".score-chart");
  const note = body.querySelector(".score-note");
  const btn = el.querySelector(".score-btn");
  let cur = 0, shown = false;

  // 缩略图选择
  const pick = document.createElement("div");
  pick.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px";
  MNIST_SAMPLES.forEach((s, i) => {
    const c = document.createElement("canvas");
    c.style.cssText = "width:44px;height:44px;border-radius:6px;border:2px solid #2b352c;cursor:pointer";
    c.width = 28; c.height = 28;
    drawDigit(c, s.pixels, 1);
    c.addEventListener("click", () => { cur = i; shown = false; render(); });
    pick.appendChild(c);
  });
  body.insertBefore(pick, body.firstChild);

  function render() {
    pick.querySelectorAll("canvas").forEach((c, i) => (c.style.borderColor = i === cur ? "#7cb387" : "#2b352c"));
    const s = MNIST_SAMPLES[cur];
    digitBox.innerHTML = "";
    const c = document.createElement("canvas");
    drawDigit(c, s.pixels, 6);
    digitBox.appendChild(c);
    note.innerHTML = "先选一张图，再点「让模型打分」。";
    drawChart(null);
  }

  function drawChart(progress) {
    const { ctx, W, H } = setupCanvas(canvas, 260);
    const s = MNIST_SAMPLES[cur];
    const map = { x: (v) => 40 + (v / 9) * (W - 56), y: (v) => H - 30 - v * (H - 50) };
    ctx.strokeStyle = "#39453b";
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#8a968a";
    ctx.textAlign = "right";
    for (const t of [0, 0.5, 1]) {
      ctx.beginPath(); ctx.moveTo(40, map.y(t)); ctx.lineTo(W - 16, map.y(t)); ctx.stroke();
      ctx.fillText(String(t), 34, map.y(t) + 4);
    }
    const bw = (W - 56) / 9 * 0.62;
    for (let d = 0; d < 10; d++) {
      const p = s.scores[d];
      const shown_p = progress === null ? 0 : p * progress;
      const isMax = d === s.pred;
      const x = map.x(d);
      ctx.fillStyle = progress === null ? "#2b352c" : isMax ? (s.pred === s.label ? "#7cb387" : "#b5524d") : "#4a5a4e";
      const h = shown_p * (H - 50);
      ctx.fillRect(x - bw / 2, H - 30 - h, bw, h);
      ctx.fillStyle = "#8a968a";
      ctx.textAlign = "center";
      ctx.fillText(String(d), x, H - 14);
      if (progress === 1) {
        ctx.fillStyle = "#c2cec0";
        ctx.fillText(p.toFixed(2), x, H - 36 - h);
      }
    }
  }

  btn.addEventListener("click", () => {
    shown = true;
    const s = MNIST_SAMPLES[cur];
    const t0 = performance.now();
    (function anim(t) {
      const k = Math.min(1, (t - t0) / 700);
      drawChart(k);
      if (k < 1) requestAnimationFrame(anim);
      else {
        const ok = s.pred === s.label;
        note.innerHTML = ok
          ? `模型猜 <b style="color:#7cb387">${s.pred}</b>，实际就是 ${s.label} —— <b>得分最高的那一类获胜</b>（代码里的 <code>argmax</code>）。`
          : `这张图实际写的是 <b style="color:#b5524d">${s.label}</b>，但模型把它判成了 <b style="color:#b5524d">${s.pred}</b>——看 ${s.pred} 和 ${s.label} 两根柱子，概率非常接近。模型也会"看走眼"，这正是 97% 而不是 100% 的原因。`;
      }
    })(t0);
  });

  render();
}

// ================= 面板 C：batch 与 epoch 计算器 =================
function mountBatchCalc(root) {
  const el = panel(root, "batch 与 epoch · 步数计算器", `
    <label class="ctrl">batch size
      <input type="range" min="0" max="100" value="50" />
      <output>190</output></label>
    <label class="ctrl">epoch 轮数
      <input type="range" min="1" max="20" step="1" value="3" />
      <output>3</output></label>
  `);
  const out = document.createElement("div");
  out.className = "viz-stats";
  el.appendChild(out);
  const [batchR, epochR] = el.querySelectorAll('input[type="range"]');
  const [batchO, epochO] = el.querySelectorAll("output");
  // batch 用对数尺度：16 ~ 8192
  const batchOf = (v) => Math.round(Math.pow(2, 4 + (v / 100) * 9));

  function update() {
    const batch = batchOf(+batchR.value);
    const epochs = +epochR.value;
    batchO.textContent = String(batch);
    epochO.textContent = String(epochs);
    const steps = Math.ceil(60000 / batch);
    out.innerHTML = `
      <div class="stat">每 epoch 要走的步数<b>${steps}</b></div>
      <div class="stat">${epochs} 个 epoch 总步数<b class="accent">${steps * epochs}</b></div>
      <div class="stat">每步喂给模型的图片<b>${batch} 张</b></div>
      <div class="stat">模型看每张图的次数<b>${epochs} 次</b></div>`;
  }
  batchR.addEventListener("input", update);
  epochR.addEventListener("input", update);
  update();
  const hint = document.createElement("div");
  hint.className = "viz-hint";
  hint.textContent = "MNIST 有 6 万张训练图，模型一次只能消化一小批（batch），走完一遍全部数据叫一个 epoch。把 batch 调小，步数立刻暴涨——这就是 DataLoader 存在的意义：替你切好、洗牌、按批送菜。";
  el.appendChild(hint);
}

export function mountL7(root) {
  mountSeeLikeModel(root);
  mountScoring(root);
  mountBatchCalc(root);
}
