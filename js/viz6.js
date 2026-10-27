import { makeMoons, setupCanvas, fmt } from "./util.js";

const DATA = makeMoons(160, 11, 0.16);
const X_MIN = -1.6, X_MAX = 2.6, Y_MIN = -0.9, Y_MAX = 1.5;
const HIDDEN = 8;

function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

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

// 前向 + 反向，返回 { loss, gradNorm }，并直接更新参数（等价于 backward() + step()）
function trainOneEpoch(net, lr) {
  const n = DATA.length;
  const gW1 = Array.from({ length: HIDDEN }, () => [0, 0]);
  const gb1 = new Array(HIDDEN).fill(0);
  const gw2 = new Array(HIDDEN).fill(0);
  let gb2 = 0, loss = 0;

  for (const [x, y, t] of DATA) {
    const { a1, out } = forward(net, x, y);
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

  const gradNorm = Math.sqrt(
    gW1.flat().reduce((s, g) => s + g * g, 0) +
    gb1.reduce((s, g) => s + g * g, 0) +
    gw2.reduce((s, g) => s + g * g, 0) + gb2 * gb2
  );

  for (let i = 0; i < HIDDEN; i++) {
    net.W1[i][0] -= lr * gW1[i][0];
    net.W1[i][1] -= lr * gW1[i][1];
    net.b1[i] -= lr * gb1[i];
    net.w2[i] -= lr * gw2[i];
  }
  net.b2 -= lr * gb2;
  return { loss, gradNorm };
}

const CODE_LINES = [
  { code: "for epoch in range(2000):", note: "训练循环：把整个数据集看 2000 遍" },
  { code: "    logits = model(X)", note: "① 前向传播：输入 160 个坐标，输出形状 (160, 1) 的预测" },
  { code: "    loss = loss_fn(logits, y)", note: "② 打分：预测和真实标签的差距，一个数字" },
  { code: "    optimizer.zero_grad()", note: "③ 清零：PyTorch 的梯度会累积，不清理就会加上旧账" },
  { code: "    loss.backward()", note: "④ 分锅：反向传播，给每个参数算出梯度（就是它该背多少锅）" },
  { code: "    optimizer.step()", note: "⑤ 更新：每个参数执行 w = w − 学习率 × 自己的梯度" },
];

export function mountL6(root) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>训练循环 · 逐行执行器</div>
      <div class="viz-controls">
        <label class="ctrl">学习率
          <input id="lr" type="range" min="0" max="60" value="34" />
          <output id="lr-o">1.00</output></label>
        <button class="btn btn-primary" id="play">▶ 执行</button>
        <button class="btn btn-ghost" id="step">单步</button>
        <button class="btn btn-ghost" id="reset">重置</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:14px;" class="l6-grid">
      <div>
        <div class="code-box"></div>
        <div class="line-note"></div>
      </div>
      <div>
        <canvas class="viz" id="c6"></canvas>
        <div class="viz-stats"></div>
      </div>
    </div>
  `;
  root.appendChild(el);

  const lrOf = (v) => Math.pow(10, -1 + (v / 60) * 2.5);
  const lrInput = el.querySelector("#lr");
  const lrOut = el.querySelector("#lr-o");
  const playBtn = el.querySelector("#play");
  const stats = el.querySelector(".viz-stats");
  const noteEl = el.querySelector(".line-note");
  const codeBox = el.querySelector(".code-box");
  const canvas = el.querySelector("#c6");

  codeBox.innerHTML = CODE_LINES.map((l, i) =>
    `<div class="code-line" data-i="${i}"><span class="ln">${i === 0 ? " " : i}</span><span class="lc">${l.code}</span></div>`
  ).join("");

  let net, lossHist, epoch, phase, timer;

  function reset() {
    stop();
    net = initNet(Math.random);
    lossHist = [];
    epoch = 0; phase = 0;
    highlight(0);
    draw(); renderStats(null);
  }

  function highlight(i) {
    codeBox.querySelectorAll(".code-line").forEach((d) => d.classList.toggle("active", +d.dataset.i === i));
    noteEl.innerHTML = `<b>${["循环", "① 前向", "② 打分", "③ 清零", "④ 分锅", "⑤ 更新"][i]}</b>｜${CODE_LINES[i].note}`;
  }

  function draw() {
    const { ctx, W, H } = setupCanvas(canvas, 300);
    const px = (v) => ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 16) + 8;
    const py = (v) => H - 8 - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 16);
    const GX = 80, GY = 52, cw = (W - 16) / GX, ch = (H - 16) / GY;
    for (let i = 0; i < GX; i++) {
      for (let j = 0; j < GY; j++) {
        const x = X_MIN + (i + 0.5) * (X_MAX - X_MIN) / GX;
        const y = Y_MIN + (j + 0.5) * (Y_MAX - Y_MIN) / GY;
        const p = forward(net, x, y).out;
        const r = Math.round(46 + 20 * p), g = Math.round(42 + 48 * p), b = Math.round(38 + 82 * p);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(px(X_MIN) + i * cw - 0.5, py(Y_MAX) + j * ch - 0.5, cw + 1, ch + 1);
      }
    }
    ctx.strokeStyle = "rgba(230,238,225,0.55)"; ctx.lineWidth = 1.5; ctx.beginPath();
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
    for (const [x, y, t] of DATA) {
      ctx.fillStyle = t === 1 ? "#6f9ecf" : "#d08078";
      ctx.strokeStyle = "#151b16"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(px(x), py(y), 3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  }

  function renderStats(info) {
    const last = lossHist.length ? lossHist[lossHist.length - 1] : null;
    stats.innerHTML = `
      <div class="stat">epoch<b>${epoch}</b></div>
      <div class="stat">loss<b class="${last !== null && last < 0.15 ? "accent" : ""}">${last === null ? "—" : fmt(last, 3)}</b></div>
      <div class="stat">梯度范数<b>${info ? fmt(info.gradNorm, 3) : "—"}</b></div>
      <div class="stat">logits 形状<b>(160, 1)</b></div>`;
  }

  function doPhase() {
    highlight(phase);
    if (phase === 5) {
      const info = trainOneEpoch(net, lrOf(+lrInput.value));
      lossHist.push(info.loss);
      epoch++;
      draw();
      renderStats(info);
      if (lossHist.length > 500) lossHist.shift();
    }
    phase = (phase + 1) % 6;
  }

  function play() {
    if (timer) return;
    playBtn.textContent = "⏸ 暂停";
    timer = setInterval(doPhase, 320);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    playBtn.textContent = "▶ 执行";
  }

  playBtn.addEventListener("click", () => (timer ? stop() : play()));
  el.querySelector("#step").addEventListener("click", () => { stop(); doPhase(); });
  el.querySelector("#reset").addEventListener("click", reset);
  lrInput.addEventListener("input", () => { lrOut.textContent = fmt(lrOf(+lrInput.value)); });

  lrOut.textContent = fmt(lrOf(+lrInput.value));
  reset();
}
