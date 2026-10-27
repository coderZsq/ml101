# -*- coding: utf-8 -*-
"""
CNN 挑战：给模型装上「眼睛」
MLP 把图片当 784 个孤立的数字，CNN 则知道"像素旁边还有像素"。
卷积层 = 用一个 3x3 的小模板在图上滑动找局部特征（笔画、拐角、圆圈）
运行：  ../.venv/bin/python train_mnist_cnn.py
"""
import time

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

datasets.MNIST.mirrors = ["https://storage.googleapis.com/cvdf-datasets/mnist/"] + datasets.MNIST.mirrors
torch.manual_seed(42)

transform = transforms.ToTensor()
train_data = datasets.MNIST(root="../data", train=True, download=True, transform=transform)
test_data = datasets.MNIST(root="../data", train=False, download=True, transform=transform)
train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
test_loader = DataLoader(test_data, batch_size=1000)

# ----------------------------------------------------------------------
# 新结构：卷积 → 池化 → 卷积 → 池化 → 拉平 → 全连接
# Conv2d(1, 8, 3)：8 个 3x3 的小模板，在 28x28 的图上滑动扫描
# MaxPool2d(2)：每 2x2 格子取最大值，把图缩小一半（保留主要特征，省算力）
# ----------------------------------------------------------------------
model = nn.Sequential(
    nn.Conv2d(1, 8, kernel_size=3, padding=1),  # 1 通道 -> 8 通道，图还是 28x28
    nn.ReLU(),
    nn.MaxPool2d(2),                            # 28x28 -> 14x14
    nn.Conv2d(8, 16, kernel_size=3, padding=1), # 8 通道 -> 16 通道
    nn.ReLU(),
    nn.MaxPool2d(2),                            # 14x14 -> 7x7
    nn.Flatten(),                               # 16x7x7 = 784 个数
    nn.Linear(784, 64),
    nn.ReLU(),
    nn.Linear(64, 10),
)

loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

EPOCHS = 2
step = 0
t0 = time.time()
for epoch in range(EPOCHS):
    for images, labels in train_loader:  # images 形状: (64, 1, 28, 28) —— 多了"通道"维度
        loss = loss_fn(model(images), labels)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        step += 1
        if step % 200 == 0:
            print(f"epoch {epoch + 1} | 第 {step} 步 | 损失 {loss.item():.4f}")

print(f"\n训练完成，共 {step} 步，耗时 {time.time() - t0:.0f} 秒")

correct = total = 0
with torch.no_grad():
    for images, labels in test_loader:
        correct += (model(images).argmax(dim=1) == labels).sum().item()
        total += labels.numel()
print(f"CNN 测试集准确率：{correct / total * 100:.2f}%  （对比：MLP 是 97.03%）")
