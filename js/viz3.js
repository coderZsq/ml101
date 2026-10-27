import { makeHouses, setupCanvas, boundedMapper, drawAxes, mse, fmt } from "./util.js";

const HOUSES = makeHouses();
const B = 5;          // 固定 b，专注一个参数
const U = (x) => x / 100; // 特征缩放：面积以"100 平米"为单位，避免梯度爆炸
// 最小二乘最优 w（由数据本身算出，而非拍脑袋的 150）
const W_OPT =
  HOUSES.reduce((s, [x, y]) => s + U(x) * (y - B), 0) /
  HOUSES.reduce((s, [x, y]) => s + U(x) * U(x), 0);
const SIZE_MIN = 40, SIZE_MAX = 130, PRICE_MIN = 40, PRICE_MAX = 210;
const W_MIN = -50, W_MAX = 350; // 损失曲线横轴范围

// MSE(w) 的解析梯度（对 w 求导）
function gradW(w) {
  let s = 0;
  for (const [x, y] of HOUSES) s += (w * U(x) + B - y) * U(x);
  return (2 / HOUSES.length) * s;
}

const lossOf = (w) => mse(HOUSES, (x) => w * U(x) + B);

function lossCurveSamples() {
  const pts = [];
  for (let w = W_MIN; w <= W_MAX + 0.01; w += 2) pts.push([w, lossOf(w)]);
  return pts;
}
const CURVE = lossCurveSamples();
const LOSS_MAX = Math.max(...CURVE.map(([, l]) => l));

export function mountL3(root) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>梯度下降 · 看黑点自己滑向碗底</div>
      <div class="viz-controls">
        <label class="ctrl">学习率
          <input id="lr" type="range" min="0" max="60" value="10" />
          <output id="lr-o">0.01</output></label>
        <button class="btn btn-primary" id="play">开始训练</button>
        <button class="btn btn-ghost" id="step">单步</button>
        <button class="btn btn-ghost" id="reset">重置</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;" class="l3-grid">
      <div><canvas class="viz"></canvas><div class="viz-hint" style="text-align:center">左：模型拟合情况（绿线）</div></div>
      <div><canvas class="viz"></canvas><div class="viz-hint" style="text-align:center">右：损失曲线与下降足迹（横轴 w：每 100 平米的价格）</div></div>
    </div>
    <div class="viz-stats"></div>
  `;
  root.appendChild(el);

  const [cFit, cLoss] = el.querySelectorAll("canvas");
  const lrInput = el.querySelector("#lr");
  const lrOut = el.querySelector("#lr-o");
  const playBtn = el.querySelector("#play");
  const stats = el.querySelector(".viz-stats");

  // 学习率滑块是非线性的：小值更精细
  const lrOf = (v) => Math.pow(10, -2 + (v / 60) * Math.log10(250)); // 0.01 ~ 2.5
  let w = 20;
  let history = [lossOf(w)];
  let running = false;
  let raf = null;
  let diverged = false;

  function drawFit() {
    const { ctx, W, H } = setupCanvas(cFit, 300);
    const map = boundedMapper(W, H, SIZE_MIN, SIZE_MAX, PRICE_MIN, PRICE_MAX);
    drawAxes(ctx, map, {
      xTicks: [50, 70, 90, 110, 130], yTicks: [50, 100, 150, 200],
      xLabel: "面积", yLabel: "价格",
    });
    // 目标线（虚线）
    ctx.strokeStyle = "rgba(124,179,135,0.25)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(map.x(SIZE_MIN), map.y(1.5 * SIZE_MIN + 5));
    ctx.lineTo(map.x(SIZE_MAX), map.y(1.5 * SIZE_MAX + 5));
    ctx.stroke(); ctx.setLineDash([]);
    // 误差线
    ctx.strokeStyle = "rgba(208,128,120,0.35)"; ctx.lineWidth = 2;
    for (const [x, y] of HOUSES) {
      ctx.beginPath(); ctx.moveTo(map.x(x), map.y(y)); ctx.lineTo(map.x(x), map.y(w * U(x) + B)); ctx.stroke();
    }
    // 模型线
    ctx.strokeStyle = "#7cb387"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(map.x(SIZE_MIN), map.y(w * U(SIZE_MIN) + B));
    ctx.lineTo(map.x(SIZE_MAX), map.y(w * U(SIZE_MAX) + B));
    ctx.stroke();
    ctx.fillStyle = "#e6ebdc";
    for (const [x, y] of HOUSES) { ctx.beginPath(); ctx.arc(map.x(x), map.y(y), 3.5, 0, Math.PI * 2); ctx.fill(); }
  }

  function drawLoss() {
    const { ctx, W, H } = setupCanvas(cLoss, 300);
    const m2 = {
      x: (v) => 34 + ((v - W_MIN) / (W_MAX - W_MIN)) * (W - 48),
      y: (v) => H - 28 - (v / LOSS_MAX) * (H - 56),
    };
    m2.__xmin = 34; m2.__xmax = W - 14; m2.__ymin = 20; m2.__ymax = H - 28;
    m2.y.__ymin = 20; m2.y.__ymax = H - 28;
    drawAxes(ctx, m2, { xTicks: [0, 150, 300], yTicks: [], xLabel: "w", yLabel: "损失" });

    // 碗
    ctx.strokeStyle = "#7aa8cc"; ctx.lineWidth = 2; ctx.beginPath();
    CURVE.forEach(([sw, l], i) => { const px = m2.x(sw), py = m2.y(l); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();

    // 下降足迹（沿碗面，越深越红）
    for (let i = 0; i < history.length; i++) {
      const l = history[i];
      ctx.fillStyle = i === history.length - 1 ? "#f2f5ec" : `rgba(208,128,120,${0.15 + 0.5 * (i / history.length)})`;
      ctx.beginPath(); ctx.arc(m2.x(wHist[i]), m2.y(l), i === history.length - 1 ? 7 : 3, 0, Math.PI * 2); ctx.fill();
    }

    // 当前点
    ctx.fillStyle = "#f2f5ec";
    ctx.beginPath(); ctx.arc(m2.x(w), m2.y(history[history.length - 1]), 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#151b16"; ctx.lineWidth = 2; ctx.stroke();
  }

  // 与 loss 历史同步的 w 历史
  let wHist = [w];

  function render() {
    drawFit();
    drawLoss();
    const loss = history[history.length - 1];
    const g = gradW(w);
    stats.innerHTML = `
      <div class="stat">训练步数<b>${history.length - 1}</b></div>
      <div class="stat">当前 w<b class="accent">${fmt(w, 1)}</b></div>
      <div class="stat">当前梯度<b class="${g > 0 ? "bad" : ""}">${fmt(g, 1)}</b></div>
      <div class="stat">当前损失<b class="${loss < 30 ? "accent" : "bad"}">${fmt(loss, 1)}</b></div>
      <div class="stat">离碗底还差<b>${fmt(Math.abs(w - W_OPT), 1)}</b></div>`;
  }

  function oneStep() {
    const lr = lrOf(+lrInput.value);
    const g = gradW(w);
    w = w - lr * g;
    const l = lossOf(w);
    history.push(l); wHist.push(w);
    if (history.length > 400) { history.shift(); wHist.shift(); }
    if (!isFinite(l) || l > 1e6) {
      diverged = true;
      stop();
    }
  }

  function tick() {
    if (!running) return;
    for (let i = 0; i < 3; i++) { if (!diverged) oneStep(); }
    lrOut.textContent = fmt(lrOf(+lrInput.value));
    render();
    if (diverged) {
      stats.insertAdjacentHTML("beforeend", `<div class="stat"><b class="bad">💥 发散了！损失爆炸。把学习率调小再试。</b></div>`);
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    playBtn.textContent = "开始训练";
    if (raf) cancelAnimationFrame(raf);
  }

  playBtn.addEventListener("click", () => {
    if (diverged) { resetState(); }
    running = !running;
    playBtn.textContent = running ? "暂停" : "继续训练";
    if (running) tick();
  });
  el.querySelector("#step").addEventListener("click", () => { stop(); oneStep(); render(); });
  el.querySelector("#reset").addEventListener("click", resetState);
  lrInput.addEventListener("input", () => { lrOut.textContent = fmt(lrOf(+lrInput.value)); });

  function resetState() {
    stop();
    diverged = false;
    w = 20;
    history = [lossOf(w)];
    wHist = [w];
    render();
  }

  lrOut.textContent = fmt(lrOf(+lrInput.value));
  resetState();
}
