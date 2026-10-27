import { makeSine, polyFit, polyEval, mse, setupCanvas, boundedMapper, drawAxes, fmt } from "./util.js";

const TRAIN = makeSine(20, 3, 0.25);    // 训练集
const TEST = makeSine(60, 99, 0.25);    // 测试集（不同样本）
const X_MIN = -Math.PI, X_MAX = Math.PI, Y_MIN = -2, Y_MAX = 2;

// 预计算每个度数在训练/测试集上的误差
const DEGREES = [];
for (let d = 1; d <= 9; d++) {
  const coef = polyFit(TRAIN, d);
  DEGREES.push({
    d,
    trainErr: mse(TRAIN, (x) => polyEval(coef, x)),
    testErr: mse(TEST, (x) => polyEval(coef, x)),
    coef,
  });
}
const ERR_MAX = Math.max(...DEGREES.map((r) => Math.max(r.trainErr, r.testErr))) * 1.15;

export function mountL4(root) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>过拟合实验台 · 拖动模型复杂度</div>
      <div class="viz-controls">
        <label class="ctrl">模型复杂度（多项式度数）
          <input id="deg" type="range" min="1" max="9" step="1" value="1" />
          <output id="deg-o">1</output></label>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;" class="l4-grid">
      <div><canvas class="viz" id="c-fit"></canvas><div class="viz-hint" style="text-align:center">左：拟合曲线（空心点 = 没见过的测试集）</div></div>
      <div><canvas class="viz" id="c-err"></canvas><div class="viz-hint" style="text-align:center">右：训练误差 vs 测试误差</div></div>
    </div>
    <div class="viz-stats"></div>
  `;
  root.appendChild(el);

  const degInput = el.querySelector("#deg");
  const degOut = el.querySelector("#deg-o");
  const stats = el.querySelector(".viz-stats");

  function drawFit(deg) {
    const canvas = el.querySelector("#c-fit");
    const { ctx, W, H } = setupCanvas(canvas, 320);
    const map = boundedMapper(W, H, X_MIN, X_MAX, Y_MIN, Y_MAX);
    drawAxes(ctx, map, {
      xTicks: [-3, -1.5, 0, 1.5, 3], yTicks: [-1.5, 0, 1.5],
      xLabel: "x", yLabel: "y",
    });

    // 真实规律（上帝视角）
    ctx.strokeStyle = "rgba(111,191,127,0.6)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = X_MIN; x <= X_MAX; x += 0.05) {
      const px = map.x(x), py = map.y(Math.sin(x));
      x === X_MIN ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(111,191,127,0.9)"; ctx.font = "11px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("— 真实规律 sin(x)", 40, 24);

    // 拟合曲线
    const coef = DEGREES[deg - 1].coef;
    ctx.strokeStyle = "#7cb387"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let x = X_MIN; x <= X_MAX; x += 0.02) {
      const y = polyEval(coef, x);
      if (y < Y_MIN - 1 || y > Y_MAX + 1) { started = false; continue; }
      const px = map.x(x), py = map.y(y);
      started ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      started = true;
    }
    ctx.stroke();

    // 训练集（实心）与测试集（空心）
    for (const [x, y] of TEST) {
      ctx.beginPath(); ctx.arc(map.x(x), map.y(y), 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = "#7d8a7b"; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.fillStyle = "#e6ebdc";
    for (const [x, y] of TRAIN) {
      ctx.beginPath(); ctx.arc(map.x(x), map.y(y), 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawErrChart(deg) {
    const canvas = el.querySelector("#c-err");
    const { ctx, W, H } = setupCanvas(canvas, 320);
    const pad = { top: 24, bottom: 40, left: 44, right: 14 };
    const m = {
      x: (v) => pad.left + ((v - 1) / 8) * (W - pad.left - pad.right),
      y: (v) => H - pad.bottom - (v / ERR_MAX) * (H - pad.top - pad.bottom),
    };
    // 网格与刻度
    ctx.strokeStyle = "#39453b"; ctx.fillStyle = "#8a968a"; ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const e = (ERR_MAX * i) / 4;
      ctx.beginPath(); ctx.moveTo(pad.left, m.y(e)); ctx.lineTo(W - pad.right, m.y(e)); ctx.stroke();
      ctx.fillText(e.toFixed(1), pad.left - 6, m.y(e) + 4);
    }
    ctx.textAlign = "center";
    for (let d = 1; d <= 9; d++) ctx.fillText(String(d), m.x(d), H - pad.bottom + 16);
    ctx.fillText("模型复杂度（度数）", (pad.left + W - pad.right) / 2, H - 8);
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("误差", 0, 0); ctx.restore();

    // 两条误差曲线
    const line = (key, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath();
      DEGREES.forEach((r, i) => { const px = m.x(r.d), py = m.y(r[key]); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
      ctx.stroke();
    };
    line("trainErr", "#7aa8cc");
    line("testErr", "#d9a44a");

    // 当前度数对应的两点
    const cur = DEGREES[deg - 1];
    ctx.fillStyle = "#7aa8cc";
    ctx.beginPath(); ctx.arc(m.x(cur.d), m.y(cur.trainErr), 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d9a44a";
    ctx.beginPath(); ctx.arc(m.x(cur.d), m.y(cur.testErr), 6, 0, Math.PI * 2); ctx.fill();

    // 图例
    ctx.font = "12px sans-serif"; ctx.textAlign = "left";
    ctx.fillStyle = "#7aa8cc"; ctx.fillText("● 训练误差（例题）", pad.left + 6, pad.top - 6);
    ctx.fillStyle = "#d9a44a"; ctx.fillText("● 测试误差（期末考）", pad.left + 130, pad.top - 6);
  }

  function update() {
    const deg = +degInput.value;
    degOut.textContent = String(deg);
    drawFit(deg);
    drawErrChart(deg);
    const cur = DEGREES[deg - 1];
    const verdict =
      deg <= 2 ? "太简单：弯不下去，属于欠拟合" :
      deg <= 5 ? "刚刚好：抓住了规律，泛化良好" :
      "过度复杂：开始背诵噪声，过拟合！";
    stats.innerHTML = `
      <div class="stat">训练误差<b class="accent">${fmt(cur.trainErr, 3)}</b></div>
      <div class="stat">测试误差<b class="${cur.testErr < 0.2 ? "accent" : "bad"}">${fmt(cur.testErr, 3)}</b></div>
      <div class="stat">诊断<b>${verdict}</b></div>`;
  }

  degInput.addEventListener("input", update);
  update();
}
