import { LESSONS } from "./lessons.js";

const STORE_KEY = "ml101-restart-progress-v1";

// ---------- 进度 ----------
function loadProgress() {
  try { return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]")); }
  catch { return new Set(); }
}
function saveProgress(done) {
  localStorage.setItem(STORE_KEY, JSON.stringify([...done]));
}

const done = loadProgress();

// ---------- 路由 ----------
function currentIndex() {
  const hash = location.hash.replace("#", "");
  const i = LESSONS.findIndex((l) => l.id === hash);
  return i === -1 ? 0 : i;
}

function go(i) {
  const idx = Math.max(0, Math.min(LESSONS.length - 1, i));
  location.hash = LESSONS[idx].id;
}

// ---------- 导航 ----------
function renderNav(activeIdx) {
  const nav = document.getElementById("lesson-nav");
  nav.innerHTML = "";
  LESSONS.forEach((l, i) => {
    const item = document.createElement("div");
    item.className = "nav-item" + (i === activeIdx ? " active" : "") + (done.has(l.id) ? " done" : "");
    item.innerHTML = `<span>${l.nav}</span><span class="nav-check">✓</span>`;
    item.addEventListener("click", () => go(i));
    nav.appendChild(item);
  });
  const pct = Math.round((done.size / LESSONS.length) * 100);
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
}

// ---------- 渲染课程 ----------
function renderLesson(idx) {
  const lesson = LESSONS[idx];
  const root = document.getElementById("lesson-root");
  root.innerHTML = `
    <div class="lesson-kicker">${lesson.kicker}</div>
    <h1 class="lesson-title">${lesson.title}</h1>
    <div class="lesson-lead">${lesson.lead}</div>
    <div class="lesson-blocks">${lesson.blocks}</div>
    <div class="lesson-viz"></div>
  `;
  if (lesson.mount) lesson.mount(root.querySelector(".lesson-viz"));
  if (lesson.quiz.length) mountQuiz(root, lesson, idx);
  else {
    // 开刊词：进入即算完成
    done.add(lesson.id); saveProgress(done);
  }
  document.getElementById("pager-prev").disabled = idx === 0;
  document.getElementById("pager-next").textContent =
    idx === LESSONS.length - 1 ? "回到第一课" : "下一课 →";
  renderNav(idx);
  window.scrollTo({ top: 0 });
}

// ---------- 测验 ----------
function mountQuiz(root, lesson, idx) {
  const wrap = document.createElement("div");
  wrap.className = "quiz";
  wrap.innerHTML = `<h2 class="block-title"><span class="step-badge">✍️</span>课后小测（答对才算过关）</h2>`;
  root.appendChild(wrap);

  const solved = new Array(lesson.quiz.length).fill(false);

  lesson.quiz.forEach((q, qi) => {
    const qEl = document.createElement("div");
    qEl.className = "quiz-q";
    qEl.innerHTML = `<div class="q-text"><span class="q-num">Q${qi + 1}.</span>${q.q}</div>`;
    const opts = document.createElement("div");
    opts.className = "quiz-opts";
    const fb = document.createElement("div");
    fb.className = "quiz-fb";

    q.opts.forEach((opt, oi) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if (solved[qi]) return;
        if (oi === q.answer) {
          btn.classList.add("correct");
          solved[qi] = true;
          fb.className = "quiz-fb show ok";
          fb.textContent = "✓ " + q.fb;
          opts.querySelectorAll("button").forEach((b) => (b.disabled = true));
          checkAll();
        } else {
          btn.classList.add("wrong");
          btn.disabled = true;
          fb.className = "quiz-fb show no";
          fb.textContent = "不对，再想想——错误选项已经被划掉一个。";
        }
      });
      opts.appendChild(btn);
    });

    qEl.appendChild(opts);
    qEl.appendChild(fb);
    wrap.appendChild(qEl);
  });

  const summary = document.createElement("div");
  summary.className = "quiz-summary";
  wrap.appendChild(summary);

  function checkAll() {
    if (!solved.every(Boolean)) return;
    done.add(lesson.id);
    saveProgress(done);
    renderNav(idx);
    const isLast = idx === LESSONS.length - 1;
    summary.classList.add("show");
    summary.innerHTML = isLast
      ? `<div class="big">🎉 完成当前阶段</div><p>你已经从数和图像走到模型预测、误差与损失。后续课程尚在建设中，可以回到前面的实验继续观察。</p>`
      : `<div class="big">🎉 本课通过！</div><p>继续下一小步。</p><button class="btn btn-primary" style="margin-top:12px">进入下一课 →</button>`;
    if (!isLast) {
      summary.querySelector("button").addEventListener("click", () => go(idx + 1));
    }
    summary.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ---------- 事件 ----------
document.getElementById("pager-prev").addEventListener("click", () => go(currentIndex() - 1));
document.getElementById("pager-next").addEventListener("click", () => {
  const i = currentIndex();
  go(i === LESSONS.length - 1 ? 0 : i + 1);
});
window.addEventListener("hashchange", () => renderLesson(currentIndex()));

renderLesson(currentIndex());
