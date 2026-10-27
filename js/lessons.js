import { mountL1, mountL2 } from "./viz.js";
import { mountL3 } from "./viz3.js";
import { mountL4 } from "./viz4.js";
import { mountL5 } from "./viz5.js";
import { mountL6 } from "./viz6.js";
import { mountL7 } from "./viz7.js";
import { mountL8 } from "./viz8.js";
import { mountL9 } from "./viz9.js";
import { mountL10 } from "./viz10.js";

export const LESSONS = [
  {
    id: "intro",
    nav: "开刊词 · 怎么学",
    kicker: "LESSON 0",
    title: "开刊词：模型训练到底在练什么？",
    lead: "先建立全局地图，再逐课深入。全程不需要任何编程和数学基础。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">🧭</span>一张地图看懂"模型训练"</h2>
      <p class="body-text">你可能听过很多词：人工智能、机器学习、深度学习、大模型……它们的关系可以用一句话串起来：</p>
      <div class="formula"><span class="hl">机器学习</span> = 让电脑从<span class="hl2">数据</span>中自己找出规律，而不是由人逐条写规则</div>
      <p class="body-text">而<strong>模型训练</strong>，就是让电脑"找规律"的那个过程。整个过程只有四件事，后面每一课都会展开讲：</p>
      <ul class="tight">
        <li><strong>① 准备一个函数（模型）</strong>——它有一些可以调节的"旋钮"，叫<strong>参数</strong>（第 1 课）</li>
        <li><strong>② 给错误打分（损失函数）</strong>——用一个数字衡量"猜得有多离谱"（第 2 课）</li>
        <li><strong>③ 自动调旋钮（梯度下降）</strong>——电脑沿着让分数变好的方向，一遍一遍地调参数（第 3 课）</li>
        <li><strong>④ 别死记硬背（过拟合）</strong>——目标是会"举一反三"，不是背答案（第 4 课）</li>
      </ul>
      <div class="callout"><b>一个生活化的比喻</b>模型训练就像教小孩子认猫：给他看很多猫的照片（数据），他猜错了你就说"不对"（损失），他慢慢调整脑子里对"猫"的印象（参数），直到越猜越准。从来没人逐条告诉他"猫有两只耳朵、四条腿"——他是自己总结的。</div>
      <h2 class="block-title"><span class="step-badge">🎓</span>这门课怎么学</h2>
      <p class="body-text">每课的结构都一样，按这个节奏走效果最好：</p>
      <ul class="tight">
        <li><strong>读</strong>：每段文字只讲一个概念，不懂就重读一遍，不赶进度；</li>
        <li><strong>玩</strong>：每个互动面板都要亲手拖一拖滑块、按一按按钮，视觉记忆比文字记忆牢得多；</li>
        <li><strong>测</strong>：课尾 3 道小题，做错了会立刻告诉你为什么；</li>
        <li><strong>想</strong>：学完花一分钟自问——"这个概念能解释我生活中的什么现象？"</li>
      </ul>
      <p class="body-text">入门篇（第 1–7 课）大约需要 40–60 分钟；进阶篇（第 8–9 课及以后）概念更密，随时回来复习。左侧可以随时切换课程，进度会自动保存在你的浏览器里。</p>
      <div class="callout good"><b>你只需要带三样东西</b>好奇心、耐心，和一双愿意拖滑块的手。</div>
    `,
    mount: null,
    quiz: [],
  },
  {
    id: "l1",
    nav: "第 1 课 · 什么是模型",
    kicker: "LESSON 1",
    title: "模型是什么？—— 从「猜房价」开始",
    lead: "模型不神秘：它就是一个带「旋钮」的函数。这一课你亲手拧旋钮。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>中介的直觉</h2>
      <p class="body-text">假设你是一位房产中介。看得多了，你自然形成了一种直觉：<strong>房子越大，卖得越贵</strong>。有位客户问你："90 平米的房子大概什么价位？"你心里有杆秤，脱口而出一个数。</p>
      <p class="body-text">现在，我们想把这个"心里的秤"教给电脑。问题是：电脑不懂"直觉"，它只认识<strong>数字和运算</strong>。所以我们要把直觉翻译成一个算式：</p>
      <div class="formula">预测价格 = <span class="hl">w</span> × 面积 + <span class="hl2">b</span></div>
      <p class="body-text">这个算式就是一个<strong>模型</strong>。其中 <span class="hl">w</span> 和 <span class="hl2">b</span> 是这个模型的<strong>参数</strong>（parameter）——你可以把它们理解成两个<strong>旋钮</strong>：</p>
      <ul class="tight">
        <li><strong>w（权重，weight）</strong>：面积每大 1 平米，价格涨多少。w = 1.5 表示"每平米约 1.5 万"；</li>
        <li><strong>b（偏置，bias）</strong>：一个兜底的基础价。比如"毛坯底线价 5 万"。</li>
      </ul>
      <div class="callout"><b>关键认知</b>模型训练，说到底就是在调这两个旋钮（以及更复杂模型里更多的旋钮），直到算出来的价格最接近真实成交价格。</div>
      <h2 class="block-title"><span class="step-badge">2</span>亲手拧一拧旋钮</h2>
      <p class="body-text">下面是一个真实的例子：每个点是一套房子的<strong>面积—成交价</strong>记录。蓝线是模型的预测线。拖动两个滑块，观察两件事：</p>
      <ul class="tight">
        <li><strong>w 控制倾斜程度</strong>——房价对面积"敏不敏感"；</li>
        <li><strong>b 控制整体高低</strong>——预测线整体上移还是下移。</li>
      </ul>
    `,
    mount: mountL1,
    quiz: [
      {
        q: "模型本质上是什么？",
        opts: ["一个有很多参数的函数（算式）", "一个装满数据的仓库", "一段写死的 if-else 规则", "一种特殊的电脑硬件"],
        answer: 0,
        fb: "对！模型就是一个函数：输入数字，经过参数运算，输出预测结果。if-else 是人写死的规则，恰恰是机器学习要摆脱的东西。",
      },
      {
        q: "在「预测价格 = w × 面积 + b」里，w = 2 表示什么？",
        opts: ["房价的基础价是 2 万", "面积每增加 1 平米，预测价格增加 2 万", "房子最多只能卖 2 万", "模型训练 2 次就结束"],
        answer: 1,
        fb: "没错。w 是「敏感度旋钮」：面积每变 1，预测价格就按 w 的比例变化。",
      },
      {
        q: "为什么电脑不能直接「写出」正确的 w 和 b，非要「训练」？",
        opts: ["因为电脑算数太慢", "因为真实数据有噪声和例外，规律只能「逼近」，没法一眼看穿", "因为 w 和 b 只能随机生成", "因为模型不允许用准确的数字"],
        answer: 1,
        fb: "真实世界的数据总是参差不齐的：同样 90 平的房子成交价也不同。我们能做的只是找到「总体上最合身」的那条线——这正是训练要干的事。",
      },
    ],
  },
  {
    id: "l2",
    nav: "第 2 课 · 损失函数",
    kicker: "LESSON 2",
    title: "损失函数 —— 给「猜得准不准」打一个分",
    lead: "光有旋钮不够，我们还需要一个「评分器」，用数字告诉电脑：现在的参数有多差。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>误差：预测与现实的距离</h2>
      <p class="body-text">回到房价例子。当你的预测线画在某个位置时，每个真实数据点都"离"这条线有一段距离——这段距离就叫<strong>误差</strong>（error），也称<strong>残差</strong>（residual）：</p>
      <div class="formula">误差 = 预测价格 − 真实价格</div>
      <p class="body-text">有的点误差是正的（线估高了），有的是负的（线估低了）。如果把它们直接加起来，正负会互相抵消——明明拟合得很差，总分却是 0。这就像"考了 +20 分和 −20 分，平均分 0 分"一样具有欺骗性。</p>
      <h2 class="block-title"><span class="step-badge">2</span>平方一下，再取平均：MSE</h2>
      <p class="body-text">解决办法很朴素：把每个误差<strong>平方</strong>。平方有三个好处：</p>
      <ul class="tight">
        <li>负数变正数，不会再互相抵消；</li>
        <li>大误差会被<strong>放大</strong>惩罚（差 2 的平方是 4，差 4 的平方是 16）——我们特别不能容忍"错得离谱"；</li>
        <li>方便后面第 3 课的数学运算（平滑、可求导）。</li>
      </ul>
      <p class="body-text">把全部点的"平方误差"加起来再平均，就得到一个总分，叫<strong>均方误差</strong>（Mean Squared Error, MSE）：</p>
      <div class="formula">MSE = <span style="font-size:13px">（所有点的 误差² 加在一起）</span> ÷ 点的数量</div>
      <div class="callout"><b>这个总分有个专门的名字：损失（loss）</b>衡量"模型有多差"的函数，就叫损失函数。训练的目标，一言以蔽之：<strong>把损失降到最低</strong>。</div>
      <h2 class="block-title"><span class="step-badge">3</span>亲手给模型打分</h2>
      <p class="body-text">下面的面板里，我们把 b 固定在合适的位置，只让你调 w。注意看两件事：</p>
      <ul class="tight">
        <li>每个点上的<strong>红色竖条</strong>是它的平方误差（为了画得下，做了开方压缩）；</li>
        <li>下方曲线是 <strong>MSE 随 w 变化</strong>的全貌——一条漂亮的"碗"。碗底，就是损失最小的地方。</li>
      </ul>
      <p class="body-text">试着把黑点（当前 w）拖到碗底。你会发现：手动调参全靠感觉，而碗的形状给了我们重要启发——<strong>如果我们能沿着"下坡"走，就能自动走到碗底</strong>。这就是第 3 课的主角。</p>
    `,
    mount: mountL2,
    quiz: [
      {
        q: "为什么不能把误差直接相加作为总分？",
        opts: ["因为加法太慢了", "正负误差会互相抵消，差模型也可能得 0 分", "因为误差都是小数"],
        answer: 1,
        fb: "正确。+3 和 −3 加起来是 0，但模型明明两次都没猜对。平方（或取绝对值）就是为了消除正负号的欺骗性。",
      },
      {
        q: "MSE 里的「平方」带来哪个额外的好处？",
        opts: ["让数字更小", "放大大的误差，让模型特别害怕「错得离谱」", "让计算更简单"],
        answer: 1,
        fb: "平方是「加重处罚」：差 4 分不是差 2 分的两倍，而是四倍。这让模型优先消除大错误。",
      },
      {
        q: "损失函数的值越小，说明什么？",
        opts: ["模型越差", "模型的预测总体越接近真实数据", "数据点越少"],
        answer: 1,
        fb: "损失就是「错误总分」。训练的全部目标，就是找到让损失最小的那组参数。",
      },
    ],
  },
  {
    id: "l3",
    nav: "第 3 课 · 梯度下降",
    kicker: "LESSON 3",
    title: "梯度下降 —— 让模型自己走到碗底",
    lead: "这一课是整门课的心脏：电脑不靠猜，而是沿着坡一步步挪到损失最小的位置。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>把损失想象成一座山</h2>
      <p class="body-text">上一课我们看到了 MSE 随 w 变化的曲线——一个"碗"。现在换个视角：把损失值当成<strong>海拔高度</strong>，你就是一个站在山坡上的登山者，目标是走到<strong>海拔最低的山谷</strong>。</p>
      <p class="body-text">问题是：你在山上，<strong>看不到全貌</strong>（碗的形状只有站在上帝视角的我们才能看到）。你只能感觉到脚下的坡度。幸好，这足够了：</p>
      <div class="callout"><b>核心直觉</b>往哪个方向走能让海拔下降最快？——<strong>坡的反方向</strong>。数学上，"坡的方向"叫<strong>梯度</strong>（gradient），所以我们每次朝着梯度的反方向迈一步。这就是"梯度下降"这个名字的由来。</div>
      <h2 class="block-title"><span class="step-badge">2</span>更新的公式</h2>
      <p class="body-text">每一步，电脑做一件极其简单的事：</p>
      <div class="formula">新 w = 旧 w − 学习率 × 梯度<br/><span style="font-size:13px;color:#94a3b8">（梯度为正 = 在碗的右坡上，往左走；梯度为负 = 在左坡上，往右走）</span></div>
      <p class="body-text">其中<strong>学习率</strong>（learning rate）是每一步迈多大：太大可能一步跨过碗底来回震荡甚至直接"飞下山"，太小则要挪几千步才到谷底。它是训练模型时最重要、最常被调的那个旋钮之一。</p>
      <p class="body-text">重复这个"看坡度 → 迈一步"的循环，就是<strong>训练</strong>。每完整走一遍全部数据，叫一个 <strong>epoch</strong>（世代）。</p>
      <h2 class="block-title"><span class="step-badge">3</span>亲眼看着模型"学习"</h2>
      <p class="body-text">下面把整套机制跑起来。点<strong>「开始训练」</strong>，看黑点自己沿坡滑向碗底，右图是损失随训练步数下降的过程。然后：</p>
      <ul class="tight">
        <li>把<strong>学习率调小</strong>（如 0.02），感受"小碎步"；</li>
        <li>把<strong>学习率调大</strong>（如 2.5），观察震荡甚至发散——这是初学者最常遇到的坑；</li>
        <li>用<strong>「单步」</strong>按钮，一格一格体会梯度的正负如何决定走的方向。</li>
      </ul>
      <div class="callout"><b>小揭秘：为什么右图的 w 在 150 左右，不是 1.5？</b>这里把面积先除以 100 再喂给模型（这叫「特征缩放」）。原始数值太大时梯度会大得离谱——连学习率 0.01 都会一步飞出碗外。真实项目里，数据预处理是训练前必不可少的一步；在这个面板里，你可以把学习率拉到最大，亲手复现一次"梯度爆炸"。</div>
    `,
    mount: mountL3,
    quiz: [
      {
        q: "梯度下降每一步朝哪个方向走？",
        opts: ["随机方向，碰碰运气", "损失下降最快的方向（坡的反方向）", "损失上升最快的方向", "永远朝数值更大的 w 走"],
        answer: 1,
        fb: "对。梯度指向「上升最快」的方向，而我们要下山，所以走它的反方向——这正是公式里那个减号的意义。",
      },
      {
        q: "学习率设得过大，最可能发生什么？",
        opts: ["训练速度一定变快，没有任何副作用", "步子太大跨过碗底，来回震荡甚至越来越糟（发散）", "电脑会死机", "损失瞬间变成 0"],
        answer: 1,
        fb: "正是如此——贪心迈大步反而可能「飞出山谷」。学习率太大是训练失败的头号原因。",
      },
      {
        q: "一个 epoch 指的是什么？",
        opts: ["模型参数的个数", "模型把全部训练数据完整看了一遍", "损失降到 0 的那一刻", "训练用的电脑数量"],
        answer: 1,
        fb: "正确。数据很多时分批看，每批叫一个 batch（批）；全部批看完一轮，就是一个 epoch。",
      },
    ],
  },
  {
    id: "l4",
    nav: "第 4 课 · 过拟合",
    kicker: "LESSON 4",
    title: "过拟合 —— 会背书 ≠ 会理解",
    lead: "损失降到很低就万事大吉了吗？这一课你会亲眼看到一个反直觉的现象：太「努力」的模型反而更差。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>考卷外的世界</h2>
      <p class="body-text">想象一个学生准备数学考试，把课本例题<strong>全部背了下来</strong>，连老师板书的笔误都一字不差。模考（题目全见过）满分——但在期末考（题目没见过）上一塌糊涂。</p>
      <p class="body-text">机器学习会犯一模一样的病，名字叫<strong>过拟合</strong>（overfitting）：模型把训练数据背下来了，包括里面的噪声和巧合，却失去了"举一反三"的能力。</p>
      <div class="callout"><b>两个必须分清的概念</b><strong>训练集</strong>：模型"学习"时看的例题；<strong>测试集</strong>：藏起来、学完后才拿出来的「期末考」。<strong>模型的真实水平，永远用测试集衡量。</strong></div>
      <h2 class="block-title"><span class="step-badge">2</span>见证过拟合的发生</h2>
      <p class="body-text">下面的数据来自一条正弦曲线（加上了一点噪声）。我们用不同复杂度的多项式去拟合它——<strong>多项式的"度数"</strong>越高，曲线能弯得越妖娆：</p>
      <ul class="tight">
        <li><strong>度数 = 1</strong>（直线）：太简单，弯不下腰——这叫<strong>欠拟合</strong>；</li>
        <li><strong>度数 = 3 左右</strong>：刚好捕捉到正弦的形状——理想；</li>
        <li><strong>度数 = 9</strong>（高次多项式）：为了穿过每一个点，曲线疯狂扭动，把噪声都学进去了——典型过拟合。</li>
      </ul>
      <p class="body-text">拖动"模型复杂度"滑块，<strong>重点看右边两条误差曲线</strong>：随着复杂度上升，训练误差（蓝）一路下降——模型确实把例题背得越来越好；但测试误差（橙）先降后升，形成一个 U 形——过了某个点后，背书越多，期末考越差。</p>
      <h2 class="block-title"><span class="step-badge">3</span>怎么办</h2>
      <p class="body-text">理解了病因，药方就顺理成章：</p>
      <ul class="tight">
        <li><strong>选合适的复杂度</strong>：用测试误差（而非训练误差）来挑模型；</li>
        <li><strong>更多数据</strong>：见过的题型足够多，背书就背不过来了，只能学规律；</li>
        <li><strong>正则化（regularization）</strong>：给损失函数加一个「复杂度罚金」，让曲线不敢乱扭。细节留给进阶课，知道名字即可。</li>
      </ul>
      <div class="callout good"><b>这一课的一句话总结</b>训练的目标从来不是"把训练集的损失降到 0"，而是<strong>在没见过的数据上表现好</strong>——这叫<strong>泛化</strong>（generalization）。</div>
    `,
    mount: mountL4,
    quiz: [
      {
        q: "什么是过拟合？",
        opts: ["模型在训练数据上表现差", "模型把训练数据连同噪声都背了下来，在新数据上反而变差", "电脑过热导致训练中断", "数据量太多装不下"],
        answer: 1,
        fb: "正确。过拟合的迷惑性在于：训练损失很低、看似学得很好，实则丧失了举一反三的能力。",
      },
      {
        q: "判断一个模型好不好，应该看哪个指标？",
        opts: ["训练集上的损失", "测试集上的损失", "训练速度", "参数的个数"],
        answer: 1,
        fb: "测试集是「期末考」——模型没见过的数据。它的表现才是模型真实水平的度量。",
      },
      {
        q: "右边那条 U 形曲线（测试误差）告诉我们什么？",
        opts: ["模型越复杂越好", "复杂度要适中：太简单而欠拟合，太复杂而过拟合", "测试集的数据有错误"],
        answer: 1,
        fb: "没错。U 形谷底附近就是「刚刚好」的复杂度。这也是现实中调模型的核心指导思想。",
      },
    ],
  },
  {
    id: "l5",
    nav: "第 5 课 · 神经网络",
    kicker: "LESSON 5",
    title: "第一个神经网络 —— 让直线学会拐弯",
    lead: "最后一课：真正的「深度学习」。你将亲手训练一个神经网络完成分类，看着它在几十秒内「学会」一条弯曲的边界。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>直线解决不了的问题</h2>
      <p class="body-text">看下面的数据：红点和蓝点组成两轮弯月，<strong>互相嵌套</strong>。想用一条直线把它们分开？不可能。而现实世界里的大量问题（图像、语音、翻译）本质上都是这种"弯弯绕绕"的划分。</p>
      <p class="body-text">问题出在哪？到目前为止我们的模型都是<strong>线性的</strong>（w×x+b），再复杂的线性组合也还是直线。我们需要给模型一个能力：<strong>拐弯</strong>。</p>
      <h2 class="block-title"><span class="step-badge">2</span>神经元：先弯一下，再组合</h2>
      <p class="body-text">神经网络的构建思路出人意料地朴素：<strong>每个神经元还是 w×x+b，但在输出之前先过一个"非线性激活函数"弯折一下</strong>（比如 tanh：把任意数字压进 −1 到 1，并且呈现 S 形弯曲）。</p>
      <div class="formula">神经元输出 = tanh( w₁x₁ + w₂x₂ + b )</div>
      <p class="body-text">然后把很多这样的神经元<strong>层叠</strong>起来：这一层的输出是下一层的输入。单个弯折不厉害，但几十上百个弯折灵活组合，就能逼近任意复杂的形状。我们这一课的网络长这样：</p>
      <div class="formula">2（坐标）→ <span class="hl">8 个神经元</span>（隐藏层，各带 tanh）→ 1（输出：属于蓝点的概率）</div>
      <ul class="tight">
        <li><strong>输入层</strong>：一个点的 (x, y) 坐标；</li>
        <li><strong>隐藏层</strong>：8 个神经元，每个都在空间里画一条"弯折的线"，8 条组合出基础形状；</li>
        <li><strong>输出层</strong>：一个 0~1 之间的数，表示"这个点是蓝色"的概率（sigmoid 函数压到 0–1）。</li>
      </ul>
      <h2 class="block-title"><span class="step-badge">3</span>反向传播：误差的"分锅大会"</h2>
      <p class="body-text">训练用的仍然是第 3 课的梯度下降，但参数多了（这个网络有 8×2 + 8 + 8 + 1 = 33 个参数）。每个点预测错了，误差该怪谁？<strong>反向传播</strong>（backpropagation）就是一套"分锅"算法：用微积分链式法则，把总误差精确分摊到每个参数头上，算出每个参数的梯度，然后照常"新值 = 旧值 − 学习率 × 梯度"。</p>
      <div class="callout"><b>至此，你已经掌握了深度学习的全部骨架</b>前向传播（做出预测）→ 算损失（打比分）→ 反向传播（分锅算梯度）→ 梯度下降（调参数）。GPT 这类大模型，骨架完全一样，只是层数、参数多得多（千亿量级）。</div>
      <h2 class="block-title"><span class="step-badge">4</span>动手：训练开始</h2>
      <p class="body-text">点<strong>「开始训练」</strong>。左图每个像素的颜色是网络对那个位置的"蓝色概率"——你会看着一条弯曲的<strong>决策边界</strong>逐渐成形；右图是损失下降曲线。试试：</p>
      <ul class="tight">
        <li>学习率调大调小，观察训练是变快、震荡还是发散；</li>
        <li>点「重置」换个随机起点再训一次——每次起点不同，但都能找到类似的边界（这就是"不同的初始印象，殊途同归"）。</li>
      </ul>
    `,
    mount: mountL5,
    quiz: [
      {
        q: "神经网络为什么要「激活函数」（如 tanh）？",
        opts: ["让数字变大", "引入非线性，让模型能拟合弯曲的边界", "让训练速度变慢以省电", "为了让公式看起来更复杂"],
        answer: 1,
        fb: "没有激活函数，多层网络叠来叠去还是等效于一条直线；有了非线性弯折，才能逼近任意复杂的形状。",
      },
      {
        q: "反向传播在训练中的作用是什么？",
        opts: ["把数据从硬盘传到内存", "把总误差分摊给每个参数，算出每个参数该怎么调", "把训练好的模型保存到磁盘"],
        answer: 1,
        fb: "正确。有了每个参数的梯度，梯度下降才能更新它们。前向预测 → 算损失 → 反向传播 → 更新参数，这个循环就是训练。",
      },
      {
        q: "图中的「决策边界」是指什么？",
        opts: ["数据集的边缘点", "模型判断「蓝/红」的分界线：线的一侧判蓝，另一侧判红", "损失函数的最低点"],
        answer: 1,
        fb: "边界就是概率 0.5 的等高线。训练的本质，就是让这条边界移动到把两类点分得最开的位置。",
      },
    ],
  },
  {
    id: "l6",
    nav: "第 6 课 · 代码篇",
    kicker: "LESSON 6",
    title: "从网页走向代码 —— PyTorch 的 6 个新名词",
    lead: "网页里你学会了概念；这一课把概念和真实代码逐行对上号，从此看代码不再吃力。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>先吃定心丸：只有 6 个新名词</h2>
      <p class="body-text">看训练代码吃力，不是因为代码难，而是 PyTorch 的名词你没见过。它们每一个都只是课程概念的"代码版"：</p>
      <div class="noun-grid">
        <div class="noun-card"><b>Tensor（张量）</b><p>就是一个多维数组，装输入数据，也装参数 w、b。和 numpy 数组几乎一样。</p></div>
        <div class="noun-card"><b>x @ w</b><p>矩阵乘法。课程里的 w₁·x + w₂·y，只是批量算完了所有样本，不用写循环。</p></div>
        <div class="noun-card"><b>requires_grad</b><p>给参数挂一个名牌："训练时要算我的梯度"。挂了名牌的量才会被分锅。</p></div>
        <div class="noun-card"><b>loss.backward()</b><p><strong>分锅机器</strong>（反向传播）。一键算出每个参数的梯度，手写要推半天，它一秒出结果。</p></div>
        <div class="noun-card"><b>optimizer.step()</b><p>梯度下降那 3 行代码：w = w − 学习率 × 梯度。只是帮你批量对所有参数执行。</p></div>
        <div class="noun-card"><b>nn.Linear(2, 8)</b><p>替你创建并保管 w 和 b 的容器。前向就是一次矩阵乘法，没有任何魔法。</p></div>
      </div>
      <h2 class="block-title"><span class="step-badge">2</span>训练循环，其实只有 5 行</h2>
      <p class="body-text">所有神经网络训练，不管多复杂，骨架都是同一个循环。下面这个<strong>逐行执行器</strong>会把这 5 行一行一行跑给你看——右边仍是那个你熟悉的双月牙训练，只是这次注意看左下角<strong>哪一行代码正在被执行</strong>：</p>
      <ul class="tight">
        <li>点<strong>「单步」</strong>：体会一行代码执行时，右边的图发生了什么变化；</li>
        <li>点<strong>「执行」</strong>：让循环自动跑起来，观察"分锅"那一行执行时梯度范数的变化；</li>
        <li>特别留意 <strong>zero_grad()</strong> 那一行：它做的事看起来"什么都没发生"，但少了它梯度会错误累积——这正是初学者最容易踩的坑之一。</li>
      </ul>
      <h2 class="block-title"><span class="step-badge">3</span>和真代码对答案</h2>
      <p class="body-text">你的电脑上已经有两个现成的脚本（在课程目录的 <code>practice/</code> 文件夹里），它们就是上面概念的完整展开：</p>
      <ul class="tight">
        <li><code>lesson_api.py</code>：30 行，纯 Python 手写梯度下降，看清 <code>backward()</code> 和 <code>step()</code> 的本质；</li>
        <li><code>train_moons.py</code>：训练双月牙分类的完整版（就是第 5 课网页演示的同款）。</li>
      </ul>
      <p class="body-text">在终端里依次运行（环境已经为你装好）：</p>
      <div class="formula" style="text-align:left">cd /Users/pubingjing/Shuangquan/ml101/practice<br/>../.venv/bin/python lesson_api.py&nbsp;&nbsp;&nbsp;# 预备课：手写梯度下降<br/>../.venv/bin/python train_moons.py&nbsp;&nbsp;# 正式训练： loss 0.69 → 0.01</div>
      <p class="body-text">运行后会得到两张图：<code>fig_boundary.png</code>（决策边界）和 <code>fig_loss.png</code>（损失曲线）——和网页里你亲手玩出来的一模一样，但这一次，是<strong>你的代码</strong>跑出来的。</p>
      <div class="callout good"><b>到这一步，你已经完成了"网页学概念 → 代码见真身"的闭环。</b>以后看任何 PyTorch 教程，你只需要在脑子里套这 5 行骨架：预测 → 打分 → 清零 → 分锅 → 更新。其余全是细节。</div>
    `,
    mount: mountL6,
    quiz: [
      {
        q: "loss.backward() 在训练中做了什么？",
        opts: ["把模型保存到硬盘", "反向传播：算出每个参数的梯度", "把损失打印到屏幕上", "随机初始化参数"],
        answer: 1,
        fb: "对。backward 就是课程里的「分锅」：用链式法则算出每个参数对损失负多少责任，结果存在每个参数的 .grad 里。",
      },
      {
        q: "optimizer.step() 的本质是什么？",
        opts: ["把梯度清零", "每个参数执行 w = w − 学习率 × 梯度", "重新生成训练数据", "画出决策边界"],
        answer: 1,
        fb: "正确。它就是梯度下降公式的那 3 行代码，帮你对所有参数批量执行了一遍。",
      },
      {
        q: "为什么每一轮训练前都要 optimizer.zero_grad()？",
        opts: ["为了释放内存", "PyTorch 会把新梯度累加到旧梯度上，不清理就加了旧账", "为了让训练变慢方便观察", "这是固定写法，没有实际作用"],
        answer: 1,
        fb: "没错——这是初学者最常踩的坑。梯度默认是累加的，不清零等于每一步都背着之前所有的旧梯度下山。",
      },
    ],
  },
  {
    id: "l7",
    nav: "第 7 课 · MNIST 实战",
    kicker: "LESSON 7",
    title: "MNIST 实战 —— 认出你写的数字",
    lead: "网页里的样本、打分、训练都来自你电脑上跑通的真实模型（97.03%）。这一课把 MNIST 的每个环节拆开给你看。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>先复盘：三个新名词</h2>
      <p class="body-text">MNIST 脚本和第 5 课的月牙训练是<strong>同一副骨架</strong>（预测 → 打分 → 清零 → 分锅 → 更新），只换了三样零件：</p>
      <ul class="tight">
        <li><strong>DataLoader（分批上菜）</strong>：6 万张图一次喂不下，切成 64 张一批，<code>shuffle=True</code> 表示每轮都洗牌——就像每轮考试都换座位，防止模型记"座位"不记"内容"；</li>
        <li><strong>CrossEntropyLoss（通用打分器）</strong>：月牙是"蓝/红"二分类，用 BCE；数字有 10 类，换成交叉熵——原理相同，都是"猜得越离谱扣分越狠"；</li>
        <li><strong>argmax（举手表决）</strong>：模型输出 10 个得分，最高的那一类就是答案。</li>
      </ul>
      <h2 class="block-title"><span class="step-badge">2</span>模型"看"不到图，只看到数字</h2>
      <p class="body-text">这是初学者最大的认知跳跃：<strong>模型从不"看"图片，它只看一串数字</strong>。下面 8 张图全部来自真实 MNIST 测试集（红框那张是模型唯一认错的）。点缩略图换图，再点「看 784 个数字」：</p>
      <h2 class="block-title"><span class="step-badge">3</span>10 个得分，怎么变成答案</h2>
      <p class="body-text">选一张图，点「让模型打分」。注意两点：柱子是模型输出的<strong>概率</strong>（代码里 <code>softmax</code> 把得分变成概率）；答案永远是<strong>最高的柱子</strong>——即使它只比第二名高一点点。红框那张错图里，5 和 6 的柱子几乎一样高：模型也会犹豫，这就是 97% 而不是 100% 的原因。</p>
      <h2 class="block-title"><span class="step-badge">4</span>batch 与 epoch：训练的量词</h2>
      <p class="body-text">"训练了 3 个 epoch、batch size 64"——这两个量是描述一切训练的通用语言。用计算器感受它们的关系：</p>
      <h2 class="block-title"><span class="step-badge">5</span>和真代码对答案</h2>
      <p class="body-text">你电脑上的 <code>practice/train_mnist.py</code> 已经跑通：<strong>3 秒，2814 步，测试准确率 97.03%</strong>。任何时候都可以在终端里重跑：</p>
      <div class="formula" style="text-align:left">cd /Users/pubingjing/Shuangquan/ml101/practice<br/>../.venv/bin/python train_mnist.py</div>
      <p class="body-text">推荐实验：<strong>EPOCHS 改成 1</strong>（准确率骤降，体会"见过几遍"的重要）；<strong>隐藏层 128 改成 32</strong>（参数变少的代价）；<strong>改成 10 个 epoch</strong>（训练集近满分，测试集却不再涨——过拟合的苗头，第 4 课的概念回来了）。</p>
      <h2 class="block-title"><span class="step-badge">6</span>进阶：给模型装上「眼睛」</h2>
      <p class="body-text">MLP 把 784 个像素当成互不相干的数字，它不知道"这个像素旁边还有像素"。<strong>卷积神经网络（CNN）</strong>补上这个常识：</p>
      <ul class="tight">
        <li><strong>卷积层（Conv2d）</strong>：拿一个 3×3 的小模板在图上滑动，专门找局部特征——一小段横线、一个拐角、半个圆圈。8 个模板就找 8 种特征，16 个就找 16 种；</li>
        <li><strong>池化层（MaxPool2d）</strong>：每 2×2 格子只留最强的那个信号，图缩小一半——既省算力，又让小偏差不影响判断（字写得歪一点没关系）。</li>
      </ul>
      <p class="body-text">换成 CNN 后（<code>practice/train_mnist_cnn.py</code>，同样 2~3 秒训练）：</p>
      <div class="formula" style="text-align:left">MLP（没有眼睛）：  测试准确率 97.03%<br/>CNN（装上眼睛）：  测试准确率 <span class="hl">98.09%</span> —— 只多了一层"看结构"的能力</div>
      <p class="body-text">别小看这 1%：MLP 的上限大约在 97~98%，而 CNN 稍加训练就能到 99%+。更重要的是思路——<strong>让结构匹配数据的特点</strong>（图像是二维的，就让模型按二维方式去看），这是从"会训练"走向"会设计"的第一步。</p>
      <div class="callout good"><b>至此，你的入门旅程已经抵达"能看懂、能运行、能做实验"的站点。</b>网页 7 课 + 4 个脚本（lesson_api / train_moons / train_mnist / train_mnist_cnn），就是你自己的入门教材。下次看到任何 AI 新闻，你都能在心里把它还原成那副骨架。</div>
    `,
    mount: mountL7,
    quiz: [
      {
        q: "nn.Flatten() 在 MNIST 模型里做了什么？",
        opts: ["把图片旋转 90 度", "把 28x28 的图拉平成 784 个数的一排", "把彩色图变成黑白", "删除空白像素"],
        answer: 1,
        fb: "对。模型不认识「图」，只认识数字序列。拉平后的 784 个数就是模型真正「看到」的全部。",
      },
      {
        q: "模型输出 10 个得分后，怎么得到最终答案？",
        opts: ["把 10 个得分加起来取平均", "选得分最高的那一类（argmax）", "随机选一个", "选得分最低的那一类"],
        answer: 1,
        fb: "正确。argmax 就是「举手表决，票数最高者胜」。网页打分面板里的最高柱子，就是它在表决。",
      },
      {
        q: "CNN 比 MLP 强在哪里？",
        opts: ["参数量更多", "它能利用像素之间的位置关系，识别局部特征（笔画、拐角）", "它不需要损失函数", "它训练时不用数据"],
        answer: 1,
        fb: "没错。MLP 把像素当孤立的数字；卷积模板在图上滑动找局部结构——这就是「给模型装上眼睛」的含义。",
      },
    ],
  },
  {
    id: "l8",
    nav: "第 8 课 · 毕业设计",
    kicker: "LESSON 8",
    title: "毕业设计 —— 数据增强与正则化，冲向 99%",
    lead: "用第 4 课的两味药方（更多数据 + 正则化），把 CNN 的 98.09% 推到 99.14%。全部概念你都学过，这一课看它们联合作战。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>毕业设计题目</h2>
      <p class="body-text">CNN 把准确率从 97.03% 提到 98.09%，但它同样在偷偷背书：6 万张图它"见过"太多遍。回到第 4 课的药方——<strong>更多数据</strong>和<strong>正则化</strong>。可数据就这么多，怎么办？</p>
      <p class="body-text">答案是<strong>数据增强（data augmentation）</strong>：对每张训练图做轻微的旋转、平移。你一眼还认得出是同一个数字，模型却等于每个 epoch 都在做新题。6 万张固定图片，变成了无穷多的练习题——背答案 impossible，只能学规律。</p>
      <h2 class="block-title"><span class="step-badge">2</span>亲手做一次增强</h2>
      <p class="body-text">下面就是训练脚本里 <code>transforms.RandomRotation(10)</code> 做的事。拖滑块变形，点「连续采样」感受模型每个 epoch 看到的不同版本，最后点「增强过头会怎样？」看看作死的代价：</p>
      <h2 class="block-title"><span class="step-badge">3</span>三位新队友（一句话版）</h2>
      <ul class="tight">
        <li><strong>BatchNorm（批归一化）</strong>：给每层的输出做"标准化"，训练更稳、更快——相当于给每段坡面铺平防滑垫；</li>
        <li><strong>Dropout（随机休眠）</strong>：训练时随机"关掉"一部分神经元，防止它们<strong>串通起来背答案</strong>——这就是第 4 课「复杂度罚金」思想的直接实现；</li>
        <li><strong>学习率衰减</strong>：前 3 个 epoch 大步走，之后学习率除以 10 改迈小步——第 3 课"快到碗底时步子要小"的自动化。</li>
      </ul>
      <h2 class="block-title"><span class="step-badge">4</span>毕业成绩</h2>
      <div class="formula" style="text-align:left">MLP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;97.03%<br/>CNN（装上眼睛）&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;98.09%<br/>CNN + 数据增强 + 三位队友&nbsp;&nbsp;<span class="hl">99.14%</span></div>
      <p class="body-text">每一级台阶都对应一个你学过的概念：<strong>结构匹配数据</strong>（卷积）、<strong>更多数据</strong>（增强）、<strong>复杂度罚金</strong>（Dropout）、<strong>学习率的艺术</strong>（衰减）。99.14% 意味着 1 万张测试图只错 86 张——剩下的错误连人类有时都会犯。</p>
      <p class="body-text">完整脚本在 <code>practice/train_mnist_augmented.py</code>，随时可重跑（约 4 分钟）：</p>
      <div class="formula" style="text-align:left">cd /Users/pubingjing/Shuangquan/ml101/practice<br/>../.venv/bin/python train_mnist_augmented.py</div>
      <div class="callout good"><b>🎓 毕业致辞</b>从一个"没有任何基础"的下午开始，你完成了：8 课交互课程、4 个可运行的训练脚本、一次 97% → 99.14% 的完整优化。你脑子里的那副骨架——模型 → 损失 → 梯度下降 → 泛化 → 神经网络——和世界上最好的研究员脑子里的，形状相同。剩下的只是经验和细节。</div>
    `,
    mount: mountL8,
    quiz: [
      {
        q: "数据增强为什么能提升模型的泛化能力？",
        opts: ["变形后的图更容易计算", "轻微变形让模型看到更多样的样本，背不下答案只能学规律", "变形可以减少训练时间", "增强能提高图片清晰度"],
        answer: 1,
        fb: "对。增强 = 用变形「免费扩充」数据集。模型无法把无穷多变形的图背下来，只能抓住「旋转平移后还是同一个数字」这个真正的规律。",
      },
      {
        q: "为什么数据增强只应用在训练集，测试集保持原样？",
        opts: ["测试集增强会浪费硬盘", "测试集是「期末考」，必须保持真实难度；给考题做变形等于泄题加改分", "测试集图太少，增强不了"],
        answer: 1,
        fb: "正确。训练时变形是为了「教」，考试时变形等于「改卷子」——测试集要反映模型在真实手写数字上的表现。",
      },
      {
        q: "Dropout 为什么能防止过拟合？",
        opts: ["它删除了坏数据", "训练时随机休眠一部分神经元，防止它们「串通一气」地背书", "它让模型变得更大", "它减少训练数据量"],
        answer: 1,
        fb: "没错。每次训练随机「换人值班」，任何神经元都不能依赖特定的搭档，只能学真正通用的特征——这是第 4 课「复杂度罚金」思想的直接实现。",
      },
    ],
  },
  {
    id: "l9",
    nav: "第 9 课 · 动量与 Adam",
    kicker: "LESSON 9 · 进阶篇 I",
    title: "优化器竞技场 —— 为什么 Adam 几乎成了默认答案",
    lead: "第 3 课的碗是圆的；真实训练的「碗」大多是窄谷。让三种优化器同场竞技，亲眼看清现代深度学习的两大发明。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>从圆碗到窄谷：一个学习率满足不了两个方向</h2>
      <p class="body-text">第 3 课的碗横竖一样陡。但真实的损失地形常常是这样的<strong>窄谷</strong>：</p>
      <div class="formula">f(w₁, w₂) = ½w₁² + <span class="hl">10</span>w₂² <span style="font-size:13px">（w₂ 方向的坡度是 w₁ 方向的 20 倍）</span></div>
      <p class="body-text">这带来一个两难的窘境：w₂ 方向太陡，步长稍大就会在山谷两壁间<strong>来回弹跳</strong>；w₁ 方向太缓，步长不够大又要在谷底<strong>慢慢蹭</strong>。只有一个学习率旋钮，却有两个方向要伺候——裸梯度下降（SGD）就在这里露出了短板。</p>
      <div class="callout"><b>看轨迹的三个要点</b>① 锯齿：在山谷两壁间来回穿越；② 沿谷底前进慢：因为大部分步幅被"爬坡"浪费掉了；③ 谁先到达谷底（损失 f 最先小于 0.001）。</div>
      <h2 class="block-title"><span class="step-badge">2</span>Momentum：给滚球装上惯性</h2>
      <p class="body-text">把参数想成一个在山坡上滚动的小球：它不只听当前坡度的命令，还带着<strong>速度</strong>（velocity）。每一步先让速度按惯性延续、再叠加当前梯度：</p>
      <div class="formula">v = 0.5·v − 学习率 × 梯度 &nbsp;&nbsp;→&nbsp;&nbsp; 参数 = 参数 + v<br/><span style="font-size:13px;color:#94a3b8">（本课取 0.5 让惯性效果看得更清楚；工业界常用 0.9，惯性更强）</span></div>
      <p class="body-text">妙处在于：来回震荡的方向上，梯度忽左忽右，<strong>速度相互抵消</strong>，锯齿被抚平；而一致向好的方向上，速度<strong>层层累积</strong>，像滚雪球一样冲出去。同一个学习率，动能的利用效率完全不同。</p>
      <h2 class="block-title"><span class="step-badge">3</span>Adam：给每个参数单独配步长</h2>
      <p class="body-text">Adam 的做法更彻底：<strong>每个参数的历史梯度幅度分别记账</strong>。梯度一直很大的方向（w₂，坡陡）自动小步走，梯度一直很小的方向（w₁，坡缓）自动大步走——一个学习率旋钮的僵局，被"逐参数自适应"直接解开。</p>
      <div class="formula">步长 ≈ 学习率 × <span class="hl">该方向的平均梯度</span> ÷ <span class="hl2">该方向的梯度幅值</span> &nbsp;&nbsp;（结果：单位量级，每步最多走约一个学习率）</div>
      <div class="callout"><b>代价与盲区</b>Adam 并不追求最快——下面的竞技里你会看到它步数最多，但曲线最平滑、几乎不用调参；真正让它成为默认答案的是另一项本事：<strong>学习率过大时它是唯一的幸存者</strong>（待会儿亲手验证）。看任何新优化器的论文（Lion、Muon……），都问同一组问题：它如何估计方向？如何缩放步长？在什么样的地形上比 Adam 强？</div>
      <h2 class="block-title"><span class="step-badge">4</span>开跑：优化器竞技场</h2>
      <p class="body-text">三种优化器从<strong>同一出发点</strong>出发，在完全相同的窄谷里赛跑。左图是等高线地形与轨迹，右图是损失曲线（对数刻度，越往下越好）和实时成绩表。建议按这个顺序玩：</p>
      <ul class="tight">
        <li><strong>第 1 轮</strong>：学习率 0.09，点「同时开跑」——SGD 的轨迹几乎每一步都在山谷两壁间反弹（锯齿最狠）；Momentum 最快冲向谷底；Adam 步数最多，但曲线如滑梯般平滑、一次震荡都没有。记下三者成绩表里的"收敛步数"；</li>
        <li><strong>第 2 轮</strong>：点「重置」，改用「单步 ×5」一格一格走，观察 SGD 前 30 步的路径形态——每一拐都是山谷壁的一次反弹，而它的平均前进慢得可怜；</li>
        <li><strong>第 3 轮</strong>：把学习率拉到 0.3 以上再跑——SGD 和 Momentum 第一步就飞出山谷（看轨迹瞬间冲出画布），而 Adam 依然稳步收敛。这就是"Adam 是默认答案"的真正原因：<strong>不是最快，是怎么折腾都不出事</strong>。</li>
      </ul>
    `,
    mount: mountL9,
    quiz: [
      {
        q: "Momentum（动量）为什么能消除 SGD 的锯齿震荡？",
        opts: ["它把学习率调小了", "震荡方向的梯度来回变、速度相互抵消；一致方向的梯度让速度累积放大", "它使用了损失函数的二阶导数", "它每隔几步随机换一次方向"],
        answer: 1,
        fb: "对。惯性是方向的记忆：反复横跳的方向上速度互相抵消，持续下坡的方向上速度滚雪球——锯齿被抚平，坦途被加速。",
      },
      {
        q: "Adam 与裸 SGD 的本质区别是什么？",
        opts: ["Adam 的学习率可以随便设，永远安全", "Adam 为每个参数按历史梯度幅度单独缩放步长", "Adam 不需要计算梯度", "Adam 只适用于图像任务"],
        answer: 1,
        fb: "正确。SGD 全体参数共用一步长；Adam 给每个参数单独记账——坡陡的自动小步、坡缓的自动大步，这就是自适应的含义。",
      },
      {
        q: "把学习率拉到 0.3 再跑，预期会发生什么？",
        opts: ["三者都毫无影响", "SGD（和 Momentum）会飞出山谷发散；Adam 因步长被归一化而幸存，但会在谷底附近震荡、难以收敛", "Adam 一定最先精确收敛到谷底"],
        answer: 1,
        fb: "没错。学习率过大谁都不好受：SGD 和 Momentum 当场飞出山谷发散；Adam 因为每步步长被归一化、最多走约一个学习率，依然能稳步收敛——它未必最快，但最不容易死。这就是它成为默认答案的原因。",
      },
    ],
  },
  {
    id: "l10",
    nav: "第 10 课 · 初始化与归一化",
    kicker: "LESSON 10 · 进阶篇 II",
    title: "信号的一生 —— 深度网络为什么不会炸",
    lead: "第 5 课的网络只有 2 层；真实网络动辄几十上百层。信号每过一层就被缩放一次，几十次相乘会发生什么？这一课把「信号」放进 10 层网络里全程追踪。",
    blocks: `
      <h2 class="block-title"><span class="step-badge">1</span>深度 = 指数：第 5 课没有告诉你的事</h2>
      <p class="body-text">每层网络对信号做的事，本质都是一次矩阵乘法：把每个数乘上权重再求和。这个操作会改变信号的<strong>方差</strong>——而且每层改变的倍数大致相同。10 层网络就是把这个倍数<strong>连乘 10 次</strong>：</p>
      <div class="formula">每层 ×0.5 → 10 层后 ×0.001（信号消失）<br/>每层 ×2 &nbsp;→ 10 层后 ×1000（信号爆炸）<br/>每层 ×1 &nbsp;→ 10 层后 ×1（<span class="hl">刚刚好</span>）</div>
      <p class="body-text">训练深度网络的第一要务，就是让"每层倍数"保持在 1 附近。这个旋钮不在训练循环里，而在<strong>训练开始前</strong>——权重初始化。</p>
      <h2 class="block-title"><span class="step-badge">2</span>初始化：开局定生死</h2>
      <p class="body-text">两套经典方案，记住配对规则即可：</p>
      <ul class="tight">
        <li><strong>Xavier</strong>：按"前一层 + 后一层"的宽度折中定权重方差——为 tanh 时代设计；</li>
        <li><strong>He</strong>：额外乘 2 补偿 ReLU 的"砍半"（ReLU 把负数全归零，信号平均损失一半）——<strong>ReLU 网络的标配</strong>；</li>
        <li><strong>全零</strong>：看似安全，实则是陷阱——所有神经元输出完全相同、梯度完全相同，终身"同进退"，10 个神经元只相当于 1 个（这叫<strong>对称性不被打破</strong>）。</li>
      </ul>
      <h2 class="block-title"><span class="step-badge">3</span>激活函数的暗面：饱和 = 梯度黑洞</h2>
      <p class="body-text">sigmoid 有个致命特性：输入一旦偏大或偏小，输出就贴近 0 或 1（饱和），此处的导数趋近 <strong>0</strong>。反向传播每过一层都要乘一次激活的导数——10 层 sigmoid 连乘，梯度从输出端的 0.2 衰减到 10⁻⁷ 量级：<strong>输入层的权重几乎收不到任何训练信号</strong>，网络前半截等于白训。</p>
      <h2 class="block-title"><span class="step-badge">4</span>归一化层：每段坡面装稳压器</h2>
      <p class="body-text">如果信号已经歪了怎么办？<strong>BatchNorm / LayerNorm</strong> 的思路是在每层出口装一个"稳压器"：把这一层的输出重新拉回均值 0、方差 1 的标准分布。两者分工：</p>
      <ul class="tight">
        <li><strong>BatchNorm</strong>：用<strong>整个 batch</strong> 的统计量做归一化（CV 常用）。训练/推理行为不同——推理时用的是训练期攒下的<strong>移动平均</strong>，复现代码时这是必查项；</li>
        <li><strong>LayerNorm</strong>：用<strong>单个样本自己</strong>的统计量，不依赖 batch——所以 Transformer 和 RNN 用它（一句话的长度、一个 batch 的大小都不影响）。</li>
      </ul>
      <h2 class="block-title"><span class="step-badge">5</span>信号探测器：四个剧本</h2>
      <p class="body-text">下方是真实的 10 层网络前向/反向传播模拟（固定随机种子，每次结果一致）。左图：每层激活的标准差；右图：每层梯度的强度（从输出层往输入层看）。绿色 = 健康，红色 = 出事。按顺序跑这四个剧本：</p>
      <ul class="tight">
        <li><strong>剧本 ①</strong>：sigmoid + Xavier（上方两个下拉框选好，点「发射信号」）——看反向红柱子如何逐层萎缩到 10⁻⁷：梯度消失的完整解剖；</li>
        <li><strong>剧本 ②</strong>：换 ReLU + He——全绿。这就是现代网络的标准开局；</li>
        <li><strong>剧本 ③</strong>：初始化选「He ×3」——前向信号一路爆炸到 10⁴，反向跟着爆。真实训练中这表现为第一步就 loss = NaN；</li>
        <li><strong>剧本 ④</strong>：初始化选「全零」——前向全灭。读一读自动诊断里的"对称性陷阱"。</li>
      </ul>
      <div class="callout"><b>把这一课变成你的验证武器</b>指挥 AI 复现论文时，问出这两个问题就能筛掉一大半错误实现：<br/>① "各层激活的方差随深度怎么变化？测给我看。"（初始化不对，立刻现形）<br/>② "推理时 BatchNorm 用的是哪组统计量？"（答不上来，eval 准确率必崩）</div>
    `,
    mount: mountL10,
    quiz: [
      {
        q: "为什么「全零初始化」是个陷阱？",
        opts: ["内存占用太大", "所有神经元的输出和梯度完全相同，对称性不被打破，10 个神经元只相当于 1 个", "计算机无法表示零", "会导致学习率变成 0"],
        answer: 1,
        fb: "对。训练的本质是让不同神经元学不同的特征；全零让它们永远同进退，网络容量直接归零。所以权重必须随机初始化——但随机的大小（方差）就是 Xavier/He 要解决的问题。",
      },
      {
        q: "Xavier 和 He 初始化的共同目标是什么？",
        opts: ["让第一层收敛更快", "让信号方差逐层大致保持稳定（每层倍数 ≈ 1），既不指数消失也不指数爆炸", "让参数量最少", "让学习率可以设得更大"],
        answer: 1,
        fb: "正确。两者都是按「每层方差 ×1」反推出的权重方差公式；He 只是额外乘 2 补偿 ReLU 砍掉的另一半信号。配对规则：tanh 系用 Xavier，ReLU 系用 He。",
      },
      {
        q: "为什么深层网络里 sigmoid 容易造成梯度消失？",
        opts: ["sigmoid 计算太慢", "饱和区导数趋近 0，反向传播每过一层乘一次小因子，10 层连乘后梯度指数级衰减", "sigmoid 会让学习率自动变大", "sigmoid 只适用于分类任务"],
        answer: 1,
        fb: "没错。前向信号一旦进入饱和区，反向的局部导数 ≈ 0，梯度在传回输入层的路上被一层层「抽税」，到最前面所剩无几——网络前半截根本训不动。这就是 ReLU 家族取代 sigmoid 的核心原因。",
      },
    ],
  },
];
