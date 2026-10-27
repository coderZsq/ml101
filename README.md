# ML101 · 交互式机器学习入门课

从零基础到"能读论文、自己做模型"的交互式学习项目。

网页里边看边玩边学（每个概念都有可拖动的可视化面板），配合本地可复现的 PyTorch 训练脚本，外加三份学习导航文档。全程不需要任何编程和数学基础。

## 快速开始

```bash
npm install
npm run dev        # Vite 开发服务器，按终端提示打开浏览器
```

课程进度自动保存在浏览器本地。

## 课程目录

| 课 | 主题 | 你将亲手玩到什么 |
|---|---|---|
| 0 | 开刊词 · 怎么学 | 模型训练的全局地图 |
| 1 | 什么是模型 | 拖滑块拧 w/b 旋钮拟合房价 |
| 2 | 损失函数 | 看 MSE"碗"的全貌，亲手走到碗底 |
| 3 | 梯度下降 | 黑点自动滑向碗底；学习率拉爆现场 |
| 4 | 过拟合 | 多项式复杂度滑块，见证 U 形测试误差曲线 |
| 5 | 神经网络 | 在浏览器里实时训练 2→8→1 网络分割双月牙 |
| 6 | PyTorch 代码篇 | 逐行执行器：5 行训练循环 × 6 个新名词 |
| 7 | MNIST 实战 | 真实模型给手写数字打分；CNN 对比 MLP |
| 8 | 毕业设计 · 数据增强 | 旋转/平移增强试验台，97% → 99.14% 的配方 |
| 9 | 优化器竞技场 | SGD / Momentum / Adam 窄谷赛跑，学习率拉到爆炸 |
| 10 | 初始化与归一化 | 10 层网络信号探测器：梯度消失/爆炸的活体解剖 |

每课结尾有 3 道小测，答对才算过关，总进度显示在侧栏。

## 配套训练脚本（`practice/`）

网页里跑的是同款逻辑的浏览器版，这里是可以复现的真代码：

| 脚本 | 内容 |
|---|---|
| `lesson_api.py` | 30 行手写梯度下降，看清 backward/step 的本质 |
| `train_moons.py` | 双月牙分类（第 5 课同款） |
| `train_mnist.py` | MNIST 全连接网络，3 秒 97.03% |
| `train_mnist_cnn.py` | 卷积版，98.09% |
| `train_mnist_augmented.py` | 数据增强 + BatchNorm + Dropout + 学习率衰减，99.14% |
| `export_mnist_samples.py` | 导出网页课程用的真实样本与模型打分 |

运行方式：

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install torch torchvision matplotlib numpy
cd practice && python train_mnist.py
```

## 学习导航文档

- [ROADMAP.md](ROADMAP.md) — 从入门到能读论文/做模型的五阶段地图，每个阶段有明确的验收 gate
- [BRIDGE.md](BRIDGE.md) — 零基础者的台阶清单：Python → 张量 → 微积分/线代最小集 → 手写反向传播
- [PRINCIPLES.md](PRINCIPLES.md) — 原理与概念总纲（约 45 个），每个概念给出本质、验收标准和"指挥 AI 复现时的验证提问"

## 项目结构

```
ml101/
├── index.html            # 单页课程入口
├── css/style.css         # 全部样式
├── js/
│   ├── lessons.js        # 课程文本 + 测验（唯一的内容源）
│   ├── main.js           # 路由 / 进度 / 测验逻辑
│   ├── viz*.js           # 每课的交互可视化面板（原生 Canvas）
│   └── mnist_samples.js  # 真实 MNIST 样本 + 模型打分（自动生成）
├── practice/             # PyTorch 训练脚本与结果图
└── ROADMAP / BRIDGE / PRINCIPLES.md
```

## 技术说明

- **网页零依赖框架**：原生 ES Modules + Canvas 2D，构建工具只有 Vite（仅用于本地开发服务器）
- **可复现**：所有随机数据用固定种子的伪随机数生成，每次刷新图形一致
- **训练脚本**：PyTorch + torchvision，CPU 即可跑通全部实验（秒级）
