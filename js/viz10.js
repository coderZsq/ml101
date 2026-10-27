// 第 10 课 · 信号的一生：深度网络前向/反向信号传播模拟器
import { setupCanvas, mulberry32 } from "./util.js";

const BATCH = 64, DIN = 16, WIDTH = 32, LAYERS = 10;
const FWD_OK = [0.1, 3], BWD_OK = [0.05, 5]; // 健康区间

function gauss(rng) {
  let u = 0;
  for (let i = 0; i < 4; i++) u += rng();
  return (u - 2) * 1.732; // 近似 N(0,1)
}
function matmul(A, B) {
  const n = A.length, m = B[0].length, k = B.length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      let s = 0;
      for (let p = 0; p < k; p++) s += A[i][p] * B[p][j];
      C[i][j] = s;
    }
  return C;
}
const transpose = (A) => A[0].map((_, j) => A.map((r) => r[j]));
function std(v) {
  const m = v.reduce((s, x) => s + x, 0) / v.length;
  return Math.sqrt(v.reduce((s, x) => s + (x - m) * (x - m), 0) / v.length);
}
const flat = (M) => M.reduce((a, r) => a.concat(r), []);
const ACT = {
  sigmoid: { f: (z) => 1 / (1 + Math.exp(-z)), d: (z, a) => a * (1 - a), name: "sigmoid" },
  tanh: { f: Math.tanh, d: (z, a) => 1 - a * a, name: "tanh" },
  relu: { f: (z) => Math.max(0, z), d: (z) => (z > 0 ? 1 : 0), name: "ReLU" },
};
const INITS = {
  zeros: { name: "全零（w = 0）", scale: () => 0 },
  xavier: { name: "Xavier（为 tanh 时代设计）", scale: (fin) => Math.sqrt(2 / (fin + WIDTH)) },
  he: { name: "He（为 ReLU 补 ×2）", scale: (fin) => Math.sqrt(2 / fin) },
  big: { name: "He ×3（手滑调大了）", scale: (fin) => 3 * Math.sqrt(2 / fin) },
};

// 前向 + 反向各记录每层的信号强度
function propagate(actName, initName) {
  const rng = mulberry32(7);
  const act = ACT[actName], init = INITS[initName];
  const Ws = [];
  for (let l = 0; l < LAYERS; l++) {
    const fin = l === 0 ? DIN : WIDTH;
    const s = init.scale(fin);
    Ws.push(Array.from({ length: fin }, () => Array.from({ length: WIDTH }, () => gauss(rng) * s)));
  }
  let h = Array.from({ length: BATCH }, () => Array.from({ length: DIN }, () => gauss(rng)));
  const zs = [], hs = [h], fwd = [];
  for (let l = 0; l < LAYERS; l++) {
    const z = matmul(h, Ws[l]);
    zs.push(z);
    h = z.map((row) => row.map((v) => act.f(v)));
    hs.push(h);
    fwd.push(std(flat(h)));
  }
  // 输出端给一个固定的随机梯度（种子固定 → 每次图形可复现）
  const rng2 = mulberry32(99);
  let dz = Array.from({ length: BATCH }, () => Array.from({ length: WIDTH }, () => gauss(rng2)));
  const bwd = [];
  for (let l = LAYERS - 1; l >= 0; l--) {
    dz = dz.map((row, i) => row.map((g, j) => g * ACT[actName].d(zs[l][i][j], hs[l + 1][i][j])));
    bwd.unshift(std(flat(dz)));
    if (l > 0) dz = matmul(dz, transpose(Ws[l]));
  }
  return { fwd, bwd };
}

function health(v, [lo, hi]) {
  if (v < lo) return { c: "#ef4444", tag: "消失" };
  if (v > hi) return { c: "#ef4444", tag: "爆炸" };
  return { c: "#10b981", tag: "健康" };
}

export function mountL10(root) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>信号探测器 · ${LAYERS} 层网络（宽 ${WIDTH}，一批 ${BATCH} 个样本）</div>
      <div class="viz-controls">
        <label class="ctrl">激活函数
          <select id="s-act" class="btn btn-ghost" style="padding:4px 8px;">
            <option value="sigmoid">sigmoid</option>
            <option value="tanh">tanh</option>
            <option value="relu" selected>ReLU</option>
          </select></label>
        <label class="ctrl">权重初始化
          <select id="s-init" class="btn btn-ghost" style="padding:4px 8px;">
            <option value="zeros">全零</option>
            <option value="xavier">Xavier</option>
            <option value="he" selected>He</option>
            <option value="big">He ×3</option>
          </select></label>
        <button class="btn btn-primary" id="s-run">▶ 发射信号</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;" class="sig-grid">
      <div>
        <div style="font-size:13px;color:#64748b;margin:2px 0 4px;">前向：每层激活的标准差（越稳定越好）</div>
        <canvas id="s-fwd" style="width:100%;display:block;"></canvas>
      </div>
      <div>
        <div style="font-size:13px;color:#64748b;margin:2px 0 4px;">反向：每层梯度的强度（从输出层往输入层走）</div>
        <canvas id="s-bwd" style="width:100%;display:block;"></canvas>
      </div>
    </div>
    <div id="s-verdict" class="viz-hint" style="margin-top:10px;font-size:13px;">点击「发射信号」，看一批数据穿过 10 层网络后，信号是活着、消失了、还是爆炸了。</div>
    <style>
      .sig-grid{}
      @media (max-width:900px){.sig-grid{grid-template-columns:1fr !important;}}
    </style>
  `;
  root.appendChild(el);

  const fwdCv = el.querySelector("#s-fwd");
  const bwdCv = el.querySelector("#s-bwd");
  const verdict = el.querySelector("#s-verdict");
  const actSel = el.querySelector("#s-act");
  const initSel = el.querySelector("#s-init");

  let fwd = null, bwd = null;

  function drawChart(cv, values, okRange, unitLabel) {
    const { ctx, W, H } = setupCanvas(cv, 230);
    ctx.clearRect(0, 0, W, H);
    const padL = 46, padR = 8, padT = 10, padB = 24;
    const LOG_MIN = -7, LOG_MAX = 5; // 1e-7 ~ 1e5
    const yPix = (v) => {
      const lv = Math.max(LOG_MIN, Math.min(LOG_MAX, Math.log10(Math.max(v, 1e-12))));
      return padT + ((LOG_MAX - lv) / (LOG_MAX - LOG_MIN)) * (H - padT - padB);
    };
    ctx.font = "10px -apple-system, sans-serif";
    for (let lv = LOG_MIN + 1; lv <= LOG_MAX; lv += 2) {
      const yy = yPix(Math.pow(10, lv));
      ctx.strokeStyle = "#eef2f7";
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
      ctx.fillStyle = "#94a3b8"; ctx.textAlign = "right";
      ctx.fillText("1e" + lv, padL - 4, yy + 3);
    }
    // 健康区间带
    const yHi = yPix(okRange[1]), yLo = yPix(okRange[0]);
    ctx.fillStyle = "rgba(16,185,129,0.07)";
    ctx.fillRect(padL, yHi, W - padL - padR, yLo - yHi);
    const bw = (W - padL - padR) / LAYERS;
    values.forEach((v, i) => {
      const h = health(v, okRange);
      const x = padL + i * bw + bw * 0.18;
      const y = yPix(Math.max(v, Math.pow(10, LOG_MIN)));
      const base = yPix(Math.pow(10, LOG_MIN));
      ctx.fillStyle = h.c;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x, y, bw * 0.64, base - y);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#64748b"; ctx.textAlign = "center";
      if (i % 2 === 0) ctx.fillText(String(i + 1), x + bw * 0.32, H - 8);
    });
    ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center";
    ctx.fillText("层号（1 = 最靠近输入）→", (padL + W - padR) / 2, H + 0);
    ctx.textAlign = "left";
    ctx.fillText(unitLabel, padL, 10);
  }

  function summarize(values, okRange, label) {
    const bad = values.map((v, i) => ({ v, i, h: health(v, okRange) })).filter((x) => x.h.tag !== "健康");
    if (!bad.length) return { text: `${label}：全部 ${LAYERS} 层健康 ✅`, ok: true };
    const first = bad[0];
    const dir = first.h.tag === "消失" ? "越来越小（指数级萎缩）" : "越来越大（指数级放大）";
    return { text: `${label}：从第 ${first.i + 1} 层起${first.h.tag}——信号${dir} ❌`, ok: false };
  }

  function run() {
    const r = propagate(actSel.value, initSel.value);
    fwd = r.fwd; bwd = r.bwd;
    drawChart(fwdCv, fwd, FWD_OK, "激活 std");
    drawChart(bwdCv, bwd, BWD_OK, "梯度 rms");
    const f = summarize(fwd, FWD_OK, "前向");
    const b = summarize(bwd, BWD_OK, "反向");
    let extra = "";
    if (initSel.value === "zeros")
      extra = "<br/>💡 全零初始化：所有神经元的输出和梯度完全相同——它们终身「同进退」，10 个神经元只相当于 1 个。这就是对称性陷阱。";
    if (actSel.value === "sigmoid" && !b.ok && bwd[0] < BWD_OK[0])
      extra = "<br/>💡 sigmoid 饱和区导数趋近 0：反向传播每过一层都要乘一次这个接近 0 的因子，10 层相乘 ≈ 0。";
    if (!f.ok && fwd[LAYERS - 1] > FWD_OK[1])
      extra = "<br/>💡 前向爆炸会送进饱和区/产生天文数字，反向跟着爆炸——训练第一步就会出现 loss = NaN。";
    verdict.innerHTML = f.text + "<br/>" + b.text + extra;
  }

  el.querySelector("#s-run").addEventListener("click", run);
  actSel.addEventListener("change", () => { if (fwd) run(); });
  initSel.addEventListener("change", () => { if (fwd) run(); });

  run();
}
