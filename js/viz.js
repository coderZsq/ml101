import { makeHouses, setupCanvas, boundedMapper, drawAxes, mse, fmt } from "./util.js";

const HOUSES = makeHouses();
const SIZE_MIN = 40, SIZE_MAX = 130, PRICE_MIN = 40, PRICE_MAX = 210;

function panelShell(root, title, controlsHTML) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>${title}</div>
      <div class="viz-controls">${controlsHTML}</div>
    </div>
    <canvas class="viz"></canvas>
    <div class="viz-stats"></div>
  `;
  root.appendChild(el);
  return el;
}

function slider(label, min, max, step, value) {
  return `<label class="ctrl">${label}
    <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
    <output>${value}</output></label>`;
}

function drawHousePlot(canvas, w, b, { showErrors = false } = {}) {
  const { ctx, W, H } = setupCanvas(canvas, 360);
  const map = boundedMapper(W, H, SIZE_MIN, SIZE_MAX, PRICE_MIN, PRICE_MAX);
  drawAxes(ctx, map, {
    xTicks: [50, 70, 90, 110, 130], yTicks: [50, 100, 150, 200],
    xLabel: "面积（平米）", yLabel: "价格（万）",
  });

  // 真实"规律"参考线（上帝视角，淡虚线）
  ctx.strokeStyle = "rgba(124,179,135,0.25)";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(map.x(SIZE_MIN), map.y(1.5 * SIZE_MIN + 5));
  ctx.lineTo(map.x(SIZE_MAX), map.y(1.5 * SIZE_MAX + 5));
  ctx.stroke();
  ctx.setLineDash([]);

  // 误差竖线
  if (showErrors) {
    ctx.strokeStyle = "rgba(208,128,120,0.55)";
    ctx.lineWidth = 2;
    for (const [x, y] of HOUSES) {
      const p = w * x + b;
      ctx.beginPath();
      ctx.moveTo(map.x(x), map.y(y));
      ctx.lineTo(map.x(x), map.y(p));
      ctx.stroke();
    }
  }

  // 模型预测线
  ctx.strokeStyle = "#7cb387";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(map.x(SIZE_MIN), map.y(w * SIZE_MIN + b));
  ctx.lineTo(map.x(SIZE_MAX), map.y(w * SIZE_MAX + b));
  ctx.stroke();

  // 数据点
  ctx.fillStyle = "#e6ebdc";
  for (const [x, y] of HOUSES) {
    ctx.beginPath();
    ctx.arc(map.x(x), map.y(y), 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ================= 第 1 课 =================
export function mountL1(root) {
  const el = panelShell(root, "房价预测器 · 拖动旋钮", `
    ${slider("w 权重", 0, 3, 0.05, 1)}
    ${slider("b 偏置", 0, 60, 1, 20)}
  `);
  const canvas = el.querySelector("canvas");
  const [wR, bR] = el.querySelectorAll('input[type="range"]');
  const [wO, bO] = el.querySelectorAll("output");
  const stats = el.querySelector(".viz-stats");

  function update() {
    const w = +wR.value, b = +bR.value;
    wO.textContent = fmt(w); bO.textContent = fmt(b, 0);
    drawHousePlot(canvas, w, b);
    const loss = mse(HOUSES, (x) => w * x + b);
    stats.innerHTML = `
      <div class="stat">当前算式<b>价格 = ${fmt(w)} × 面积 + ${fmt(b, 0)}</b></div>
      <div class="stat">均方误差 MSE<b class="${loss < 30 ? "accent" : "bad"}">${fmt(loss, 1)}</b></div>
      <div class="stat">90 平的预测<b>${fmt(w * 90 + b, 0)} 万</b></div>`;
  }
  wR.addEventListener("input", update);
  bR.addEventListener("input", update);
  update();
  const hint = document.createElement("div");
  hint.className = "viz-hint";
  hint.textContent = "提示：试着先找到「线的角度对不对」（调 w），再调「线的高度对不对」（调 b）。虚线是理论上完美的线，看看你能不能逼近它。";
  el.appendChild(hint);
}

// ================= 第 2 课 =================
export function mountL2(root) {
  const B_FIXED = 5;
  const el = panelShell(root, "损失打分器 · 只调 w", `
    ${slider("w 权重", 0, 3, 0.01, 2.5)}
  `);
  const canvas = el.querySelector("canvas");
  const wR = el.querySelector('input[type="range"]');
  const wO = el.querySelector("output");
  const stats = el.querySelector(".viz-stats");

  // 预计算 MSE(w) 曲线
  const W_SAMPLES = [];
  for (let w = 0; w <= 3.0001; w += 0.02) W_SAMPLES.push([w, mse(HOUSES, (x) => w * x + B_FIXED)]);
  const LOSS_MAX = Math.max(...W_SAMPLES.map(([, l]) => l));

  function update() {
    const w = +wR.value;
    wO.textContent = fmt(w);
    const { ctx, W, H } = setupCanvas(canvas, 430);

    // 上半：拟合情况 + 误差条
    const H1 = 250;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H1); ctx.clip();
    const map = boundedMapper(W, H1, SIZE_MIN, SIZE_MAX, PRICE_MIN, PRICE_MAX, { top: 14, bottom: 30, left: 34, right: 14 });
    // drawAxes 依赖 __ 边界字段
    map.__xmin = 34; map.__xmax = W - 14; map.__ymin = 14; map.__ymax = H1 - 30;
    map.y.__ymin = 14; map.y.__ymax = H1 - 30;
    drawAxes(ctx, map, { xTicks: [], yTicks: [50, 100, 150, 200], xLabel: "", yLabel: "价格" });

    // 误差竖条（长度 = |误差|，高度在拟合图内）
    for (const [x, y] of HOUSES) {
      const p = w * x + B_FIXED;
      ctx.strokeStyle = "rgba(208,128,120,0.6)";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(map.x(x), map.y(y)); ctx.lineTo(map.x(x), map.y(p)); ctx.stroke();
    }
    ctx.strokeStyle = "#7cb387"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(map.x(SIZE_MIN), map.y(w * SIZE_MIN + B_FIXED));
    ctx.lineTo(map.x(SIZE_MAX), map.y(w * SIZE_MAX + B_FIXED));
    ctx.stroke();
    ctx.fillStyle = "#e6ebdc";
    for (const [x, y] of HOUSES) {
      ctx.beginPath(); ctx.arc(map.x(x), map.y(y), 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#8a968a"; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("红线 = 每个样本的误差", 40, 26);
    ctx.restore();

    // 分隔
    ctx.strokeStyle = "#39453b";
    ctx.beginPath(); ctx.moveTo(0, H1); ctx.lineTo(W, H1); ctx.stroke();

    // 下半：MSE(w) 曲线
    const H2top = H1 + 26, H2bot = 26;
    const m2 = {
      x: (v) => 34 + (v / 3) * (W - 48),
      y: (v) => H - H2bot - (v / LOSS_MAX) * (H - H2top - H2bot),
    };
    m2.__xmin = 34; m2.__xmax = W - 14; m2.__ymin = H2top; m2.__ymax = H - H2bot;
    m2.y.__ymin = H2top; m2.y.__ymax = H - H2bot;
    drawAxes(ctx, m2, { xTicks: [0, 1, 2, 3], yTicks: [], xLabel: "w 权重", yLabel: "MSE" });

    ctx.strokeStyle = "#7aa8cc"; ctx.lineWidth = 2;
    ctx.beginPath();
    W_SAMPLES.forEach(([sw, l], i) => {
      const px = m2.x(sw), py = m2.y(l);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();

    // 当前位置黑点
    const cur = mse(HOUSES, (x) => w * x + B_FIXED);
    ctx.fillStyle = "#f2f5ec";
    ctx.beginPath(); ctx.arc(m2.x(w), m2.y(cur), 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#151b16"; ctx.lineWidth = 2; ctx.stroke();

    const optimalW = 1.5;
    stats.innerHTML = `
      <div class="stat">当前损失 MSE<b class="${cur < 30 ? "accent" : "bad"}">${fmt(cur, 1)}</b></div>
      <div class="stat">黑点位置<b>w = ${fmt(w)}</b></div>
      <div class="stat">碗底（最佳 w）<b class="accent">w ≈ ${fmt(optimalW)}</b></div>`;
  }

  wR.addEventListener("input", update);
  update();
  const hint = document.createElement("div");
  hint.className = "viz-hint";
  hint.textContent = "把黑点拖进「碗底」（MSE 最小的位置）。注意：你只能看到脚下的坡，看不到整张图——这正是第 3 课要解决的困境。";
  el.appendChild(hint);
}
