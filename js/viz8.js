// 第 8 课 · 毕业设计：数据增强试验台（与 train_mnist_augmented.py 的 transforms 对应）
import { setupCanvas, mulberry32 } from "./util.js";
import { MNIST_SAMPLES } from "./mnist_samples.js";

const IMG = 28; // MNIST 原始尺寸

// 把 784 个像素画进一个小 canvas（黑底白字，和 MNIST 一致）
function pixelsToCanvas(sample) {
  const c = document.createElement("canvas");
  c.width = IMG; c.height = IMG;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(IMG, IMG);
  for (let i = 0; i < IMG * IMG; i++) {
    const v = Math.round(sample.pixels[i] * 255);
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// 在显示画布上画出"增强后"的图：黑底 + 旋转/平移
function drawAugmented(ctx, src, W, H, rotDeg, dx, dy, cell) {
  const size = cell || Math.min(W, H) - 16;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2 + dx, H / 2 + dy);
  ctx.rotate((rotDeg * Math.PI) / 180);
  // 28×28 → size，留一点边距防止旋转后顶到角
  const s = (size / IMG) * 0.82;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(src, (-IMG * s) / 2, (-IMG * s) / 2, IMG * s, IMG * s);
  ctx.restore();
}

export function mountL8(root) {
  const el = document.createElement("div");
  el.className = "viz-panel";
  el.innerHTML = `
    <div class="viz-head">
      <div class="viz-title"><span class="dot"></span>数据增强试验台 · 每个 epoch 都是新题</div>
      <div class="viz-controls">
        <button class="btn btn-primary" id="a-shuffle">连续采样（模拟训练）</button>
        <button class="btn btn-ghost" id="a-over">增强过头会怎样？</button>
        <button class="btn btn-ghost" id="a-next">换一张图</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:14px;" class="aug-grid">
      <div>
        <canvas id="a-main" style="width:100%;display:block;border-radius:8px;"></canvas>
        <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;">
          <label class="ctrl">旋转
            <input id="a-rot" type="range" min="-45" max="45" value="0" step="1" />
            <output id="a-rot-o">0°</output></label>
          <label class="ctrl">水平平移
            <input id="a-dx" type="range" min="-8" max="8" value="0" step="1" />
            <output id="a-dx-o">0</output></label>
          <label class="ctrl">垂直平移
            <input id="a-dy" type="range" min="-8" max="8" value="0" step="1" />
            <output id="a-dy-o">0</output></label>
        </div>
        <div class="viz-hint" id="a-note">标签：<b id="a-label">–</b>。轻微变形后你还是一眼认得它——这就是增强能"免费造数据"的原因。</div>
      </div>
      <div>
        <div style="font-size:13px;color:#64748b;margin:2px 0 6px;">模型一个 epoch 里实际看到的 6 个版本（RandomRotation(10°) 内随机）</div>
        <div id="a-strip" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;"></div>
        <div class="viz-hint">6 万张固定图片 → 每轮都变成新题：背答案 impossible，只能学规律。</div>
      </div>
    </div>
    <style>
      .aug-grid{}
      @media (max-width:900px){.aug-grid{grid-template-columns:1fr !important;}}
      #a-strip canvas{width:100%;border-radius:6px;display:block;}
    </style>
  `;
  root.appendChild(el);

  let sampleIdx = 0;
  let src = pixelsToCanvas(MNIST_SAMPLES[0]);
  let timer = null;
  const rng = mulberry32(20261027);

  const main = setupCanvas(el.querySelector("#a-main"), 300);
  const rot = el.querySelector("#a-rot"), dx = el.querySelector("#a-dx"), dy = el.querySelector("#a-dy");
  const rotO = el.querySelector("#a-rot-o"), dxO = el.querySelector("#a-dx-o"), dyO = el.querySelector("#a-dy-o");
  const strip = el.querySelector("#a-strip");
  const note = el.querySelector("#a-note");

  const state = { rot: 0, dx: 0, dy: 0 };

  function syncSliders() {
    rot.value = state.rot; dx.value = state.dx; dy.value = state.dy;
    rotO.textContent = state.rot + "°";
    dxO.textContent = state.dx;
    dyO.textContent = state.dy;
  }

  function draw() {
    drawAugmented(main.ctx, src, main.W, main.H, state.rot, state.dx, state.dy);
    el.querySelector("#a-label").textContent = MNIST_SAMPLES[sampleIdx].label;
  }

  function drawStrip() {
    strip.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const c = document.createElement("canvas");
      c.width = 120; c.height = 120;
      const r = (rng() - 0.5) * 20; // ±10°，与 transforms.RandomRotation(10) 一致
      const ox = Math.round((rng() - 0.5) * 6);
      const oy = Math.round((rng() - 0.5) * 6);
      drawAugmented(c.getContext("2d"), src, 120, 120, r, ox, oy, 116);
      strip.appendChild(c);
    }
  }

  function stopShuffle() {
    if (timer) { clearInterval(timer); timer = null; }
    el.querySelector("#a-shuffle").textContent = "连续采样（模拟训练）";
  }

  rot.addEventListener("input", () => { stopShuffle(); state.rot = Number(rot.value); syncSliders(); draw(); });
  dx.addEventListener("input", () => { stopShuffle(); state.dx = Number(dx.value); syncSliders(); draw(); });
  dy.addEventListener("input", () => { stopShuffle(); state.dy = Number(dy.value); syncSliders(); draw(); });

  el.querySelector("#a-next").addEventListener("click", () => {
    stopShuffle();
    sampleIdx = (sampleIdx + 1) % MNIST_SAMPLES.length;
    src = pixelsToCanvas(MNIST_SAMPLES[sampleIdx]);
    note.innerHTML = '标签：<b id="a-label">–</b>。轻微变形后你还是一眼认得它——这就是增强能"免费造数据"的原因。';
    draw(); drawStrip();
  });

  el.querySelector("#a-shuffle").addEventListener("click", () => {
    if (timer) { stopShuffle(); return; }
    el.querySelector("#a-shuffle").textContent = "⏸ 暂停采样";
    const step = () => {
      state.rot = Math.round((rng() - 0.5) * 20);
      state.dx = Math.round((rng() - 0.5) * 6);
      state.dy = Math.round((rng() - 0.5) * 6);
      syncSliders(); draw(); drawStrip();
    };
    step();
    timer = setInterval(step, 800);
  });

  el.querySelector("#a-over").addEventListener("click", () => {
    stopShuffle();
    state.rot = 45; state.dx = 8; state.dy = 8;
    syncSliders(); draw();
    note.innerHTML = "⚠️ <b>增强过头</b>：45° 旋转 + 大幅平移后，这还像原来的数字吗？如果增强破坏了标签语义（连人都认不出），模型学到的是错误标签——增强越狠不一定越好，<b>以「人还能认」为边界</b>。";
  });

  syncSliders(); draw(); drawStrip();
}
