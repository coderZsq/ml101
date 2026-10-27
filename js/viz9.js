// 第 8 课 · （保留）
import { setupCanvas, boundedMapper, drawAxes } from "./util.js";

// 窄谷地形：y 方向的坡度是 x 方向的 20 倍 → 一个学习率满足不了两个方向
const F = (x, y) => 0.5 * x * x + 10 * y * y;
const GRAD = (x, y) => [x, 20 * y];
const START = [2.0, 1.5];
const XMIN = -2.4, XMAX = 2.4, YMIN = -2.1, YMAX = 2.1;
const MAX_STEPS = 400;
const PAD = { top: 14, bottom: 32, left: 44, right: 14 };
const MU = 0.5, B1 = 0.9, B2 = 0.999, EPS = 1e-8;

const OPTS = [
  { key: "sgd", name: "SGD（裸梯度下降）", color: "#3b82f6" },
  { key: "mom", name: "Momentum（动量）", color: "#f59e0b" },
  { key: "adam", name: "Adam（自适应步长）", color: "#10b981" },
];

function freshStates() {
  return OPTS.map((o) => ({
    ...o,
    x: START[0], y: START[1],
    vx: 0, vy: 0, mx: 0, my: 0, vx2: 0, vy2: 0, t: 0,
    pts: [[START[0], START[1]]],
    fvals: [F(START[0], START[1])],
    status: "跑",
  }));
}

function stepOne(s, lr) {
  if (s.status !== "跑") return;
  const [gx, gy] = GRAD(s.x, s.y);
  if (s.key === "sgd") {
    s.x -= lr * gx; s.y -= lr * gy;
  } else if (s.key === "mom") {
    s.vx = MU * s.vx - lr * gx;
    s.vy = MU * s.vy - lr * gy;
    s.x += s.vx; s.y += s.vy;
  } else {
    s.t++;
    const c1 = 1 - Math.pow(B1, s.t), c2 = 1 - Math.pow(B2, s.t);
    s.mx = B1 * s.mx + (1 - B1) * gx;
    s.my = B1 * s.my + (1 - B1) * gy;
    s.vx2 = B2 * s.vx2 + (1 - B2) * gx * gx;
    s.vy2 = B2 * s.vy2 + (1 - B2) * gy * gy;
    s.x -= (lr * (s.mx / c1)) / (Math.sqrt(s.vx2 / c2) + EPS);
    s.y -= (lr * (s.my / c1)) / (Math.sqrt(s.vy2 / c2) + EPS);
  }
  const f = F(s.x, s.y);
  s.pts.push([s.x, s.y]);
  s.fvals.push(f);
  if (f < 1e-3) s.status = "✅ 收敛";
  else if (f > 80 || Math.abs(s.x) > 3.6 || Math.abs(s.y) > 3.6) s.status = "💥 发散";
  else if (s.pts.length > MAX_STEPS) s.status = "⏹ 步数用完";
}

export function mountL9(root) {
  const style = document.createElement("style");
  style.textContent = `
    .l8-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:14px;}
    @media (max-width:900px){.l8-grid{grid-template-columns:1fr;}}
    .o-table{width:100%;border-collapse:collapse;font-size:13px;margin-top:10px;}
    .o-table td{padding:6px 8px;border-top:1px solid #e2e8f0;color:#334155;white-space:nowrap;}
    .o-table .odot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle;}
    .o-num{font-variant-numeric:tabular-nums;font-weight:600;color:#0f172a;}
  `;
  document.head.appendChild(style);

  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>优化器竞技场 · 窄谷 f(w₁, w₂) = ½w₁² + 10w₂²</div>
      <div class="viz-controls">
        <label class="ctrl">学习率
          <input id="o-lr" type="range" min="1" max="50" value="9" />
          <output id="o-lr-o">0.09</output></label>
        <button class="btn btn-primary" id="o-play">▶ 同时开跑</button>
        <button class="btn btn-ghost" id="o-step">单步 ×5</button>
        <button class="btn btn-ghost" id="o-reset">重置</button>
      </div>
    </div>
    <div class="l8-grid">
      <div>
        <canvas id="o-field" style="width:100%;display:block"></canvas>
        <div class="viz-hint">同一出发点、同一个小山谷，三种优化器各跑各的。轨迹颜色与右侧成绩表一致。</div>
      </div>
      <div>
        <div style="font-size:13px;color:#64748b;margin:2px 0 4px">损失 f 随步数变化（纵轴为对数刻度）</div>
        <canvas id="o-loss" style="width:100%;display:block"></canvas>
        <table class="o-table"><tbody id="o-tbody"></tbody></table>
      </div>
    </div>
  `;
  root.appendChild(el);

  const lr = () => Number(el.querySelector("#o-lr").value) / 100;
  const lrOut = el.querySelector("#o-lr-o");
  el.querySelector("#o-lr").addEventListener("input", () => {
    lrOut.textContent = lr().toFixed(2);
  });

  const map = boundedMapper(0, 0, XMIN, XMAX, YMIN, YMAX, PAD); // 仅借用常量，实际在 setup 后重建
  const fieldCv = el.querySelector("#o-field");
  const lossCv = el.querySelector("#o-loss");
  const tbody = el.querySelector("#o-tbody");

  let states = freshStates();
  let field = null, chart = null, bg = null, dpr = 1;

  function setup() {
    field = setupCanvas(fieldCv, 400);
    chart = setupCanvas(lossCv, 170);
    dpr = window.devicePixelRatio || 1;
    const m = boundedMapper(field.W, field.H, XMIN, XMAX, YMIN, YMAX, PAD);
    Object.assign(map, m);
    bg = buildBackground(field.W, field.H, dpr, m);
  }

  // 等高线背景（静态，离屏渲染一次）：谷底亮、谷壁暗，等高线清晰可见
  function buildBackground(W, H, dpr, m) {
    const off = document.createElement("canvas");
    off.width = Math.round(W * dpr); off.height = Math.round(H * dpr);
    const octx = off.getContext("2d");
    const img = octx.createImageData(off.width, off.height);
    const d = img.data;
    const bw = off.width, bh = off.height;
    const bands = new Int16Array(bw * bh).fill(-1);
    const sx = (W - PAD.left - PAD.right) / (XMAX - XMIN);
    const sy = (H - PAD.top - PAD.bottom) / (YMAX - YMIN);
    for (let py = 0; py < bh; py++) {
      const cy = py / dpr;
      for (let px = 0; px < bw; px++) {
        const cx = px / dpr;
        let band = -1;
        if (cx >= PAD.left && cx <= W - PAD.right && cy >= PAD.top && cy <= H - PAD.bottom) {
          const x = XMIN + (cx - PAD.left) / sx;
          const y = YMAX - (cy - PAD.top) / sy;
          band = Math.floor(Math.sqrt(2 * F(x, y)) / 0.35);
        }
        bands[py * bw + px] = band;
        const i4 = (py * bw + px) * 4;
        if (band < 0) { d[i4] = 255; d[i4 + 1] = 255; d[i4 + 2] = 255; d[i4 + 3] = 255; continue; }
        const sh = Math.max(176, 250 - Math.min(band, 18) * 3.2);
        d[i4] = sh - 6; d[i4 + 1] = sh - 2; d[i4 + 2] = Math.min(255, sh + 8); d[i4 + 3] = 255;
      }
    }
    // 等高线：相邻像素色带不同 → 描边
    for (let py = 1; py < bh; py++) {
      for (let px = 1; px < bw; px++) {
        const b = bands[py * bw + px];
        if (b < 0) continue;
        if (b !== bands[py * bw + px - 1] || b !== bands[(py - 1) * bw + px]) {
          const i4 = (py * bw + px) * 4;
          d[i4] *= 0.82; d[i4 + 1] *= 0.82; d[i4 + 2] *= 0.84;
        }
      }
    }
    octx.putImageData(img, 0, 0);
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawAxes(octx, m, { xTicks: [-2, -1, 0, 1, 2], yTicks: [-2, -1, 0, 1, 2], xLabel: "w₁", yLabel: "w₂" });
    // 谷底（最优解）标记
    octx.fillStyle = "#0f172a";
    octx.beginPath(); octx.arc(m.x(0), m.y(0), 3.5, 0, Math.PI * 2); octx.fill();
    octx.font = "11px -apple-system, sans-serif";
    octx.fillText("谷底=最优解", m.x(0) + 8, m.y(0) + 12);
    return off;
  }

  function drawField() {
    const { ctx, W, H } = field;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bg, 0, 0, W, H);
    // 出发点
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(map.x(START[0]), map.y(START[1]), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = "11px -apple-system, sans-serif";
    ctx.fillText("起点", map.x(START[0]) + 8, map.y(START[1]) - 6);
    for (const s of states) {
      if (s.pts.length > 1) {
        ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(map.x(s.pts[0][0]), map.y(s.pts[0][1]));
        for (const [px, py] of s.pts) ctx.lineTo(map.x(px), map.y(py));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const [hx, hy] = s.pts[s.pts.length - 1];
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(map.x(hx), map.y(hy), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      if (s.status === "✅ 收敛") {
        ctx.fillStyle = s.color; ctx.font = "13px sans-serif";
        ctx.fillText("✓", map.x(hx) + 7, map.y(hy) + 4);
      } else if (s.status === "💥 发散") {
        ctx.fillStyle = "#ef4444"; ctx.font = "13px sans-serif";
        ctx.fillText("✗ 飞出山谷", map.x(hx) + 7, map.y(hy) + 4);
      }
    }
  }

  function drawChart() {
    const { ctx, W, H } = chart;
    ctx.clearRect(0, 0, W, H);
    const padL = 36, padR = 8, padT = 8, padB = 20;
    const yPix = (f) => {
      const v = Math.max(-7, Math.min(3, Math.log10(Math.max(f, 1e-7))));
      return padT + ((3 - v) / 10) * (H - padT - padB);
    };
    ctx.font = "10px -apple-system, sans-serif";
    for (const lv of [2, 0, -2, -4, -6]) {
      const yy = yPix(Math.pow(10, lv));
      ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
      ctx.fillStyle = "#94a3b8"; ctx.textAlign = "right";
      ctx.fillText(lv === 0 ? "1" : "1e" + lv, padL - 4, yy + 3);
    }
    ctx.textAlign = "center"; ctx.fillStyle = "#94a3b8";
    ctx.fillText("步数 →", (padL + W - padR) / 2, H - 6);
    for (const s of states) {
      if (s.fvals.length < 2) continue;
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (let i = 0; i < s.fvals.length; i++) {
        const px = padL + (i / MAX_STEPS) * (W - padL - padR);
        const py = yPix(s.fvals[i]);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
  }

  function drawTable() {
    tbody.innerHTML = states
      .map((s) => {
        const f = s.fvals[s.fvals.length - 1];
        const fStr = f < 0.01 ? f.toExponential(1) : f.toFixed(3);
        return `<tr>
          <td><span class="odot" style="background:${s.color}"></span>${s.name}</td>
          <td class="o-num">${s.pts.length - 1}</td>
          <td class="o-num">${fStr}</td>
          <td>${s.status}</td>
        </tr>`;
      })
      .join("");
  }

  function drawAll() { drawField(); drawChart(); drawTable(); }

  let raf = null;
  const playBtn = el.querySelector("#o-play");
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; playBtn.textContent = "▶ 同时开跑"; }
  function tick() {
    for (let k = 0; k < 4; k++) states.forEach((s) => stepOne(s, lr()));
    drawAll();
    if (states.every((s) => s.status !== "跑")) { stop(); return; }
    raf = requestAnimationFrame(tick);
  }
  playBtn.addEventListener("click", () => {
    if (raf) { stop(); return; }
    if (states.every((s) => s.status !== "跑")) states = freshStates();
    playBtn.textContent = "⏸ 暂停";
    tick();
  });
  el.querySelector("#o-step").addEventListener("click", () => {
    stop();
    for (let k = 0; k < 5; k++) states.forEach((s) => stepOne(s, lr()));
    drawAll();
  });
  el.querySelector("#o-reset").addEventListener("click", () => {
    stop(); states = freshStates(); drawAll();
  });

  setup();
  drawAll();
}
