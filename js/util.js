// ---------- 通用工具：数据集、数学、画布 ----------

// 可复现的伪随机数（保证每次刷新图形一致，方便教学）
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const HOUSE_DATA = [
  [40, 62], [55, 88], [60, 95], [70, 110], [75, 118],
  [80, 122], [85, 135], [90, 140], [95, 150], [100, 158],
  [110, 172], [120, 185], [130, 196], [60, 90], [105, 166],
];

// 房价例子的真实关系（带噪声）：price = 1.5 * size + 5 + noise
export function housePrice(size, rng) {
  return 1.5 * size + 5 + (rng() - 0.5) * 16;
}

export function makeHouses(seed = 7) {
  const rng = mulberry32(seed);
  const out = [];
  for (let s = 40; s <= 130; s += 9) out.push([s, housePrice(s, rng)]);
  return out;
}

// 正弦 + 噪声数据集（第 4 课：过拟合）
export function makeSine(n, seed = 3, noise = 0.25) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = rng() * Math.PI * 2 - Math.PI;
    pts.push([x, Math.sin(x) + (rng() - 0.5) * 2 * noise]);
  }
  return pts;
}

// 多项式最小二乘拟合：返回系数 [c0, c1, c2, ...]
export function polyFit(points, degree) {
  const n = degree + 1;
  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  const b = new Array(n).fill(0);
  for (const [x, y] of points) {
    const powers = [];
    for (let k = 0; k <= 2 * degree; k++) powers.push(Math.pow(x, k));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) A[i][j] += powers[i + j];
      b[i] += y * powers[i];
    }
  }
  return solveLinear(A, b);
}

export function polyEval(coef, x) {
  let y = 0;
  for (let i = coef.length - 1; i >= 0; i--) y = y * x + coef[i];
  return y;
}

// 高斯消元解线性方程组
function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const d = M[col][col] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / d;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}

// 双月牙数据集（第 5 课：神经网络分类）
export function makeMoons(n, seed = 11, noise = 0.18) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = rng() * Math.PI;
    if (i % 2 === 0) {
      pts.push([Math.cos(t) + (rng() - 0.5) * noise * 2, Math.sin(t) + (rng() - 0.5) * noise * 2, 1]);
    } else {
      pts.push([1 - Math.cos(t) + (rng() - 0.5) * noise * 2, 1 - Math.sin(t) - 0.5 + (rng() - 0.5) * noise * 2, 0]);
    }
  }
  return pts;
}

// ---------- 画布辅助 ----------

// 让 canvas 适配高分屏
export function setupCanvas(canvas, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth - 2;
  const h = cssHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.height = h + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W: w, H: h };
}

// 简易坐标系：把 (x, y) 数据映射到画布区域
// pad 可以是数字（四边同宽）或 {top, bottom, left, right}
export function makeMapper(W, H, xMin, xMax, yMin, yMax, pad = 34) {
  const p = typeof pad === "number" ? { top: pad, bottom: pad, left: pad, right: pad } : pad;
  const sx = (W - p.left - p.right) / (xMax - xMin);
  const sy = (H - p.top - p.bottom) / (yMax - yMin);
  return {
    x: (v) => p.left + (v - xMin) * sx,
    y: (v) => H - p.bottom - (v - yMin) * sy,
    // 保持物理比例一致（用于数据单位等距的图）
  };
}

export function drawAxes(ctx, map, { xTicks = [], yTicks = [], xLabel = "", yLabel = "" }) {
  ctx.strokeStyle = "#39453b";
  ctx.fillStyle = "#8a968a";
  ctx.lineWidth = 1;
  ctx.font = "11px -apple-system, sans-serif";
  ctx.textAlign = "center";
  for (const t of xTicks) {
    ctx.beginPath(); ctx.moveTo(map.x(t), map.y.__ymin); ctx.lineTo(map.x(t), map.y.__ymax); ctx.stroke();
    ctx.fillText(String(t), map.x(t), map.y.__ymax + 16);
  }
  ctx.textAlign = "right";
  for (const t of yTicks) {
    ctx.beginPath(); ctx.moveTo(map.__xmin, map.y(t)); ctx.lineTo(map.__xmax, map.y(t)); ctx.stroke();
    ctx.fillText(String(t), map.__xmin - 6, map.y(t) + 4);
  }
  ctx.textAlign = "center";
  if (xLabel) ctx.fillText(xLabel, (map.__xmin + map.__xmax) / 2, map.__ymax + 30);
  if (yLabel) { ctx.save(); ctx.translate(12, (map.__ymin + map.__ymax) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(yLabel, 0, 0); ctx.restore(); }
}

// 带边界的 mapper（记录边界以便 drawAxes 画网格）
export function boundedMapper(W, H, xMin, xMax, yMin, yMax, pad = 34) {
  const p = typeof pad === "number" ? { top: pad, bottom: pad, left: pad, right: pad } : pad;
  const m = makeMapper(W, H, xMin, xMax, yMin, yMax, pad);
  m.__xmin = p.left; m.__xmax = W - p.right; m.__ymin = p.top; m.__ymax = H - p.bottom;
  m.y.__ymin = p.top; m.y.__ymax = H - p.bottom;
  return m;
}

export function mse(points, f) {
  let s = 0;
  for (const [x, y] of points) { const e = f(x) - y; s += e * e; }
  return s / points.length;
}

export const fmt = (v, d = 2) => (Math.abs(v) < 1e-10 ? "0" : v.toFixed(d));
