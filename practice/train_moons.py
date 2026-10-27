# -*- coding: utf-8 -*-
"""
第一课动手实验：亲手训练一个神经网络（对应 ML101 第 5 课）
网络结构：2 → 8 → 1，激活函数 tanh，任务：双月牙分类
运行方法：  ../.venv/bin/python train_moons.py
"""

import numpy as np
import torch
import torch.nn as nn
import matplotlib

matplotlib.use("Agg")  # 不在屏幕上弹窗，直接把图存成文件
import matplotlib.pyplot as plt

# 让每次运行的结果可以复现（课程里"重置换随机起点"的固定版）
torch.manual_seed(42)
np.random.seed(42)

# ----------------------------------------------------------------------
# 步骤 1：准备数据 —— 对应课程里的"双月牙数据集"
# 每个样本 = (x 坐标, y 坐标, 标签)，标签 1 = 蓝点，0 = 红点
# ----------------------------------------------------------------------
N = 160


def make_moons(n, noise=0.16):
    t = np.random.rand(n) * np.pi
    # 蓝月：上半弧
    x1 = np.stack([np.cos(t), np.sin(t)], axis=1) + np.random.randn(n, 2) * noise
    # 红月：下半弧（平移 + 翻转）
    x0 = np.stack([1 - np.cos(t), 1 - np.sin(t) - 0.5], axis=1) + np.random.randn(n, 2) * noise
    X = np.vstack([x1, x0]).astype(np.float32)
    y = np.concatenate([np.ones(n), np.zeros(n)]).astype(np.float32)
    return X, y


X_np, y_np = make_moons(N // 2)
# torch.Tensor 是电脑（尤其显卡）看得懂的数字容器 —— 模型只认它
X = torch.from_numpy(X_np)
y = torch.from_numpy(y_np).unsqueeze(1)  # 形状从 (80,) 变成 (80, 1)，方便和模型输出对齐

# ----------------------------------------------------------------------
# 步骤 2：搭建模型 —— 这就是课程里的 "2 → 8 → 1"
# Linear(2, 8)：8 个神经元，每个都是 w1·x + w2·y + b（33 个参数）
# Tanh：      激活函数，给模型"拐弯"的能力（没有它，多层也只是一条直线）
# ----------------------------------------------------------------------
model = nn.Sequential(
    nn.Linear(2, 8),
    nn.Tanh(),
    nn.Linear(8, 1),  # 输出一个数：判断"是蓝点"的把握程度
)

# ----------------------------------------------------------------------
# 步骤 3：损失函数 —— 课程里的"打分器"
# BCEWithLogitsLoss = 交叉熵，专门给 0/1 分类打分的损失函数
# （它内部会顺手做 sigmoid，把输出压到 0~1 的概率）
# ----------------------------------------------------------------------
loss_fn = nn.BCEWithLogitsLoss()

# ----------------------------------------------------------------------
# 步骤 4：优化器 —— 课程里的"梯度下降"
# SGD = Stochastic Gradient Descent 随机梯度下降
# lr = 学习率：每一步迈多大（课程里你拖过的那个滑块！）
# 我们像课程面板一样，把 80 个样本一次性全部喂进去（全批量）
# ----------------------------------------------------------------------
optimizer = torch.optim.SGD(model.parameters(), lr=0.5)

# ----------------------------------------------------------------------
# 步骤 5：训练循环 —— 课程里点「开始训练」后发生的事
# 每一轮 epoch 做四件事：前向预测 → 算损失 → 反向传播 → 更新参数
# ----------------------------------------------------------------------
EPOCHS = 2000
loss_history = []

for epoch in range(EPOCHS):
    # ① 前向传播：把坐标丢进模型，得到预测
    logits = model(X)

    # ② 算损失：预测和真实标签差多远
    loss = loss_fn(logits, y)

    # ③ 反向传播：把误差"分锅"给每个参数，算出每个参数的梯度
    optimizer.zero_grad()  # 先把上一轮的梯度清零（很重要！）
    loss.backward()

    # ④ 梯度下降：每个参数朝着让自己"罪责减轻"的方向挪一步
    optimizer.step()

    loss_history.append(loss.item())
    if (epoch + 1) % 200 == 0:
        with torch.no_grad():  # 预测时不需要算梯度
            prob = torch.sigmoid(logits)
            acc = ((prob > 0.5).float() == y).float().mean()
        print(f"epoch {epoch + 1:>4} | 损失 {loss.item():.4f} | 准确率 {acc * 100:.1f}%")

# ----------------------------------------------------------------------
# 步骤 6：可视化 —— 画出课程里的"决策边界"和"损失曲线"
# ----------------------------------------------------------------------
BG = "#151b16"  # 和课程网页同款深夜绿
plt.rcParams.update({
    "figure.facecolor": BG, "axes.facecolor": BG,
    "text.color": "#c2cec0", "axes.edgecolor": "#39453b",
    "xtick.color": "#8a968a", "ytick.color": "#8a968a",
})
# 中文字体：优先用 Mac 系统自带的苹方，找不到就依次尝试
plt.rcParams["font.sans-serif"] = [
    "PingFang SC", "Hiragino Sans GB", "Arial Unicode MS", "DejaVu Sans",
]
plt.rcParams["axes.unicode_minus"] = False  # 负号正常显示

# --- 图 1：决策边界 ---
gx, gy = np.meshgrid(
    np.linspace(-1.6, 2.6, 300), np.linspace(-0.9, 1.5, 300)
)
grid = torch.from_numpy(np.stack([gx.ravel(), gy.ravel()], axis=1).astype(np.float32))
with torch.no_grad():
    prob_grid = torch.sigmoid(model(grid)).numpy().reshape(gx.shape)

fig, ax = plt.subplots(figsize=(7, 5), dpi=150)
ax.contourf(gx, gy, prob_grid, levels=20, cmap="RdBu", alpha=0.55, vmin=0, vmax=1)
ax.contour(gx, gy, prob_grid, levels=[0.5], colors="#e6ebdc", linewidths=1.5)  # 0.5 等高线 = 决策边界
blue = y_np == 1
ax.scatter(X_np[blue, 0], X_np[blue, 1], c="#6f9ecf", s=18, label="蓝点 (1)")
ax.scatter(X_np[~blue, 0], X_np[~blue, 1], c="#d08078", s=18, label="红点 (0)")
ax.set_title("训练完成！决策边界（白线）", fontsize=13)
ax.legend(loc="upper right", facecolor="#1b211c", labelcolor="#c2cec0")
fig.tight_layout()
fig.savefig("fig_boundary.png")
print("已保存 fig_boundary.png")

# --- 图 2：损失曲线 ---
fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
ax.plot(loss_history, color="#7cb387", linewidth=1.5)
ax.set_xlabel("epoch（训练轮数）")
ax.set_ylabel("损失")
ax.set_title("损失下降曲线 —— 和课程面板里的一样", fontsize=13)
ax.grid(color="#39453b", alpha=0.4)
fig.tight_layout()
fig.savefig("fig_loss.png")
print("已保存 fig_loss.png")

print("\n🎉 训练结束。你已经亲手完成了课程第 5 课演示的同款训练！")
