import { makeMoons, setupCanvas, fmt } from "./util.js";

const DATA = makeMoons(160, 11, 0.16);
const X_MIN = -1.6, X_MAX = 2.6, Y_MIN = -0.9, Y_MAX = 1.5;
const HIDDEN = 8;

function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

// 初始化网络：W1[HIDDEN][2], b1[HIDDEN], w2[HIDDEN], b2
function initNet(rng) {
  const W1 = [], b1 = [], w2 = [];
  for (let i = 0; i < HIDDEN; i++) {
    W1.push([(rng() - 0.5) * 2, (rng() - 0.5) * 2]);
    b1.push((rng() - 0.5) * 0.5);
    w2.push((rng() - 0.5) * 2);
  }
  return { W1, b1, w2, b2: (rng() - 0.5) * 0.5 };
}

function forward(net, x, y) {
  const a1 = [];
  for (let i = 0; i < HIDDEN; i++) a1.push(Math.tanh(net.W1[i][0] * x + net.W1[i][1] * y + net.b1[i]));
  let z2 = net.b2;
  for (let i = 0; i < HIDDEN; i++) z2 += net.w2[i] * a1[i];
  return { a1, out: sigmoid(z2) };
}

function trainEpoch(net, lr) {
  const n = DATA.length;
  const gW1 = Array.from({ length: HIDDEN }, () => [0, 0]);
  const gb1 = new Array(HIDDEN).fill(0);
  const gw2 = new Array(HIDDEN).fill(0);
  let gb2 = 0, loss = 0;

  for (const [x, y, t] of DATA) {
    const { a1, out } = forward(net, x, y);
    // 二元交叉熵 + sigmoid 的梯度简化：(out - t)
    const dz2 = (out - t) / n;
    loss += -(t * Math.log(out + 1e-9) + (1 - t) * Math.log(1 - out + 1e-9)) / n;
    for (let i = 0; i < HIDDEN; i++) {
      gw2[i] += dz2 * a1[i];
      const dz1 = dz2 * net.w2[i] * (1 - a1[i] * a1[i]);
      gW1[i][0] += dz1 * x;
      gW1[i][1] += dz1 * y;
      gb1[i] += dz1;
    }
    gb2 += dz2;
  }

  for (let i = 0; i < HIDDEN; i++) {
    net.W1[i][0] -= lr * gW1[i][0];
    net.W1[i][1] -= lr * gW1[i][1];
    net.b1[i] -= lr * gb1[i];
    net.w2[i] -= lr * gw2[i];
  }
  net.b2 -= lr * gb2;
  return loss;
}

function accuracy(net) {
  let ok = 0;
  for (const [x, y, t] of DATA) if ((forward(net, x, y).out > 0.5 ? 1 : 0) === t) ok++;
  return ok / DATA.length;
}

export function mountL5(root) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>神经网络训练场 · 2 → 8 → 1</div>
      <div class="viz-controls">
        <label class="ctrl">学习率
          <input id="lr" type="range" min="0" max="60" value="34" />
          <output id="lr-o">1.00</output></label>
        <button class="btn btn-primary" id="play">开始训练</button>
        <button class="btn btn-ghost" id="reset">重置（换随机起点）</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:14px;" class="l5-grid">
      <div><canvas class="viz" id="c-bound"></canvas><div class="viz-hint" style="text-align:center">左：决策边界的形成（颜色 = 判为蓝色的概率）</div></div>
      <div><canvas class="viz" id="c-loss"></canvas><div class="viz-hint" style="text-align:center">右：损失下降曲线</div></div>
    </div>
    <div class="viz-stats"></div>
  `;
  root.appendChild(el);

  const lrInput = el.querySelector("#lr");
  const lrOut = el.querySelector("#lr-o");
  const playBtn = el.querySelector("#play");
  const stats = el.querySelector(".viz-stats");
  const cBound = el.querySelector("#c-bound");
  const cLoss = el.querySelector("#c-loss");

  const lrOf = (v) => Math.pow(10, -1 + (v / 60) * 2.5); // 0.1 ~ ~5.6

  let net, lossHist, running = false, raf = null, epoch = 0;

  function reset() {
    stop();
    net = initNet(Math.random);
    lossHist = [];
    epoch = 0;
    render();
  }

  function drawBoundary() {
    const { ctx, W, H } = setupCanvas(cBound, 340);
    const px = (v) => ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 16) + 8;
    const py = (v) => H - 8 - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 16);
    const GX = 90, GY = 60, cw = (W - 16) / GX, ch = (H - 16) / GY;
    for (let i = 0; i < GX; i++) {
      for (let j = 0; j < GY; j++) {
        const x = X_MIN + (i + 0.5) * (X_MAX - X_MIN) / GX;
        const y = Y_MIN + (j + 0.5) * (Y_MAX - Y_MIN) / GY;
        const p = forward(net, x, y).out;
        // p→钢蓝（判蓝），1-p→暖炭灰（判红），适配深色底
        const r = Math.round(46 + 20 * p);
        const g = Math.round(42 + 48 * p);
        const b = Math.round(38 + 82 * p);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(px(X_MIN) + i * cw - 0.5, py(Y_MAX) + j * ch - 0.5, cw + 1, ch + 1);
      }
    }
    // 0.5 等高线（决策边界）
    ctx.strokeStyle = "rgba(230,238,225,0.55)"; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < GX; i++) {
      for (let j = 0; j < GY - 1; j++) {
        const x = X_MIN + (i + 0.5) * (X_MAX - X_MIN) / GX;
        const y1 = Y_MIN + (j + 0.5) * (Y_MAX - Y_MIN) / GY;
        const y2 = Y_MIN + (j + 1.5) * (Y_MAX - Y_MIN) / GY;
        const p1 = forward(net, x, y1).out, p2 = forward(net, x, y2).out;
        if ((p1 - 0.5) * (p2 - 0.5) < 0) {
          const t = (0.5 - p1) / (p2 - p1);
          const yb = y1 + t * (y2 - y1);
          ctx.moveTo(px(x) - cw, py(yb)); ctx.lineTo(px(x) + cw, py(yb));
        }
      }
    }
    ctx.stroke();
    // 数据点
    for (const [x, y, t] of DATA) {
      ctx.fillStyle = t === 1 ? "#6f9ecf" : "#d08078";
      ctx.strokeStyle = "#151b16"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(px(x), py(y), 3.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  }

  function drawLoss() {
    const { ctx, W, H } = setupCanvas(cLoss, 340);
    const pad = { top: 18, bottom: 34, left: 44, right: 12 };
    ctx.fillStyle = "#8a968a"; ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("epoch（训练轮数）", (pad.left + W - pad.right) / 2, H - 10);
    ctx.save(); ctx.translate(13, H / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("损失", 0, 0); ctx.restore();

    if (lossHist.length < 2) {
      ctx.fillText("开始训练后，这里会画出损失曲线", W / 2, H / 2);
      return;
    }
    const maxE = Math.max(50, lossHist.length);
    const maxL = Math.max(0.7, ...lossHist) * 1.1;
    const m = {
      x: (v) => pad.left + (v / maxE) * (W - pad.left - pad.right),
      y: (v) => H - pad.bottom - (v / maxL) * (H - pad.top - pad.bottom),
    };
    ctx.strokeStyle = "#39453b";
    ctx.textAlign = "right";
    for (let l = 0; l <= maxL; l += maxL / 4) {
      ctx.beginPath(); ctx.moveTo(pad.left, m.y(l)); ctx.lineTo(W - pad.right, m.y(l)); ctx.stroke();
      ctx.fillText(l.toFixed(2), pad.left - 5, m.y(l) + 4);
    }
    ctx.strokeStyle = "#7cb387"; ctx.lineWidth = 2; ctx.beginPath();
    lossHist.forEach((l, i) => { const x = m.x(i), y = m.y(l); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    // 当前点
    ctx.fillStyle = "#7cb387";
    ctx.beginPath(); ctx.arc(m.x(lossHist.length - 1), m.y(lossHist[lossHist.length - 1]), 4, 0, Math.PI * 2); ctx.fill();
  }

  function render() {
    drawBoundary();
    drawLoss();
    const lastLoss = lossHist.length ? lossHist[lossHist.length - 1] : null;
    stats.innerHTML = `
      <div class="stat">已训练 epoch<b>${epoch}</b></div>
      <div class="stat">当前损失<b class="${lastLoss !== null && lastLoss < 0.15 ? "accent" : ""}">${lastLoss === null ? "—" : fmt(lastLoss, 3)}</b></div>
      <div class="stat">分类准确率<b class="accent">${fmt(accuracy(net) * 100, 1)}%</b></div>
      <div class="stat">参数量<b>${HIDDEN * 2 + HIDDEN + HIDDEN + 1} 个</b></div>`;
  }

  function tick() {
    if (!running) return;
    const lr = lrOf(+lrInput.value);
    for (let k = 0; k < 2; k++) {
      const l = trainEpoch(net, lr);
      lossHist.push(l);
      epoch++;
    }
    if (lossHist.length > 600) lossHist.shift();
    lrOut.textContent = fmt(lr);
    render();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    playBtn.textContent = "开始训练";
    if (raf) cancelAnimationFrame(raf);
  }

  playBtn.addEventListener("click", () => {
    running = !running;
    playBtn.textContent = running ? "暂停" : "继续训练";
    if (running) tick();
  });
  el.querySelector("#reset").addEventListener("click", reset);
  lrInput.addEventListener("input", () => { lrOut.textContent = fmt(lrOf(+lrInput.value)); });

  reset();
}
