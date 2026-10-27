# -*- coding: utf-8 -*-
"""
MNIST 挑战：手写数字识别（深度学习的「成人礼」）
骨架和第 5 课的月牙分类完全一样：预测 → 打分 → 清零 → 分锅 → 更新
新东西：真实数据集、多分类交叉熵、分批训练（batch）、测试集验货
运行：  ../.venv/bin/python train_mnist.py
"""
import time

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

# 中文字体（和月牙实验一致）
plt.rcParams["font.sans-serif"] = [
    "PingFang SC", "Hiragino Sans GB", "Arial Unicode MS", "DejaVu Sans",
]
plt.rcParams["axes.unicode_minus"] = False

torch.manual_seed(42)

# ----------------------------------------------------------------------
# 步骤 1：加载数据 —— 6 万张训练图片 + 1 万张测试图片（第一次会自动下载）
# 每张图是 28x28 的灰度图，transform 把它变成 0~1 之间的浮点数张量
# ----------------------------------------------------------------------
# 官方镜像近年经常失效，优先使用 CVDF 公益镜像（内容完全相同）
datasets.MNIST.mirrors = ["https://storage.googleapis.com/cvdf-datasets/mnist/"] + datasets.MNIST.mirrors

transform = transforms.ToTensor()
train_data = datasets.MNIST(root="../data", train=True, download=True, transform=transform)
test_data = datasets.MNIST(root="../data", train=False, download=True, transform=transform)

BATCH = 64  # 每次喂 64 张图（课程里说的 batch！数据太多，一次全喂不下）
# DataLoader = 分菜窗口：把 6 万张图切成一批批，训练时按顺序取
train_loader = DataLoader(train_data, batch_size=BATCH, shuffle=True)
test_loader = DataLoader(test_data, batch_size=1000)

# ----------------------------------------------------------------------
# 步骤 2：搭建模型 —— 把 784 个像素当成 784 个输入的数字
# 784 → 128（ReLU 激活，和 tanh 同类，也负责"拐弯"）→ 10（10 个数字的得分）
# ----------------------------------------------------------------------
model = nn.Sequential(
    nn.Flatten(),            # 把 28x28 的图拉平成 784 个数的一排
    nn.Linear(784, 128),
    nn.ReLU(),
    nn.Linear(128, 10),      # 输出 10 个得分：分别代表"是 0~9 的把握"
)

# ----------------------------------------------------------------------
# 步骤 3：损失与优化
# CrossEntropyLoss = 多分类版的打分器（月牙那里是 2 分类，所以用 BCE）
# Adam = SGD 的升级版：给每个参数自动调学习率，新手友好（老手进阶再细究）
# ----------------------------------------------------------------------
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# ----------------------------------------------------------------------
# 步骤 4：训练循环 —— 和第 5 课一模一样的 5 行骨架，只是循环里多包一层 batch
# ----------------------------------------------------------------------
EPOCHS = 3
step = 0
t0 = time.time()

for epoch in range(EPOCHS):
    for images, labels in train_loader:      # ← 一轮 epoch = 把 6 万张图全部看一遍
        logits = model(images)               # ① 前向预测：输出 (64, 10) 的得分
        loss = loss_fn(logits, labels)       # ② 打分：得分和真答案的差距
        optimizer.zero_grad()                # ③ 清零
        loss.backward()                      # ④ 分锅
        optimizer.step()                     # ⑤ 更新
        step += 1
        if step % 200 == 0:
            print(f"epoch {epoch + 1} | 第 {step} 步 | 损失 {loss.item():.4f}")

print(f"\n训练完成，共 {step} 步，耗时 {time.time() - t0:.0f} 秒")

# ----------------------------------------------------------------------
# 步骤 5：期末考 —— 在没见过的 1 万张测试图上验货（第 4 课：泛化！）
# ----------------------------------------------------------------------
correct = 0
total = 0
with torch.no_grad():
    for images, labels in test_loader:
        pred = model(images).argmax(dim=1)   # 得分最高的那一类，就是预测结果
        correct += (pred == labels).sum().item()
        total += labels.numel()
print(f"测试集准确率：{correct / total * 100:.2f}%  （瞎猜是 10%）")

# ----------------------------------------------------------------------
# 步骤 6：看看模型认错的图长什么样 —— 这是最好的学习方式
# ----------------------------------------------------------------------
model.eval()
fig, axes = plt.subplots(4, 8, figsize=(10, 5.5), dpi=150)
fig.patch.set_facecolor("#151b16")
shown, errors = 0, 0
with torch.no_grad():
    for images, labels in test_loader:
        pred = model(images).argmax(dim=1)
        for img, p, t in zip(images, pred, labels):
            ax = axes.flat[shown]
            ax.imshow(img.squeeze(), cmap="gray")
            ok = (p == t).item()
            if not ok:
                errors += 1
            ax.set_title(f"猜{p.item()} 实{t.item()}", fontsize=9,
                         color="#8ecf9a" if ok else "#d08078")
            ax.axis("off")
            shown += 1
            if shown >= 32:
                break
        if shown >= 32:
            break
plt.tight_layout()
plt.savefig("fig_mnist.png", facecolor="#151b16")
print(f"已保存 fig_mnist.png（红字 = 模型认错的样本，本页共 {errors} 个）")
