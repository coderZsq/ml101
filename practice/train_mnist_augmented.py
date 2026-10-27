# -*- coding: utf-8 -*-
"""
毕业设计：CNN + 数据增强，把手写识别推向 99%+
思路来自第 4 课：过拟合的药方之一是"更多数据"。
数据增强 = 对训练图做轻微旋转/平移——人眼还认得出是同一个数字，
模型却等于每个 epoch 都在看新样本。
注意：只增强训练集，测试集保持原样（期末考不能泄题）。
运行：  ../.venv/bin/python train_mnist_augmented.py
"""
import time

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

datasets.MNIST.mirrors = ["https://storage.googleapis.com/cvdf-datasets/mnist/"] + datasets.MNIST.mirrors
torch.manual_seed(42)

# ----------------------------------------------------------------------
# 关键新代码：训练集的"变形流水线"
# RandomRotation(10)：随机旋转 ±10 度
# RandomAffine(translate)：随机平移最多 10%
# 每张图被读取时都被随机变形一次 —— 6 万张图等于变成了"无限多张"
# ----------------------------------------------------------------------
train_transform = transforms.Compose([
    transforms.RandomRotation(10),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ToTensor(),
])
test_transform = transforms.ToTensor()  # 测试集不增强

train_data = datasets.MNIST(root="../data", train=True, download=True, transform=train_transform)
test_data = datasets.MNIST(root="../data", train=False, download=True, transform=test_transform)
train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
test_loader = DataLoader(test_data, batch_size=1000)

# 毕业版 CNN：更大的容量 + 两位正则化新成员
# BatchNorm：给每层输出做"标准化"，训练更稳更快
# Dropout：训练时随机"关掉"一部分神经元，防止它们串通起来背答案（第 4 课的「复杂度罚金」）
model = nn.Sequential(
    nn.Conv2d(1, 32, kernel_size=3, padding=1),
    nn.BatchNorm2d(32),
    nn.ReLU(),
    nn.MaxPool2d(2),                            # 28 -> 14
    nn.Conv2d(32, 64, kernel_size=3, padding=1),
    nn.BatchNorm2d(64),
    nn.ReLU(),
    nn.MaxPool2d(2),                            # 14 -> 7
    nn.Flatten(),                               # 64x7x7 = 3136
    nn.Linear(3136, 128),
    nn.ReLU(),
    nn.Dropout(0.2),                            # 30% 的神经元随机休眠
    nn.Linear(128, 10),
)

loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
# 学习率衰减：每过一个 epoch，学习率乘 0.7 —— 快到碗底时自动改迈小步（第 3 课概念的进阶）
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)  # 前 3 个 epoch 大步走，之后迈小步精修

EPOCHS = 10
step = 0
t0 = time.time()
for epoch in range(EPOCHS):
    for images, labels in train_loader:
        loss = loss_fn(model(images), labels)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        step += 1
        if step % 300 == 0:
            print(f"epoch {epoch + 1} | 第 {step} 步 | 损失 {loss.item():.4f}")
    scheduler.step()

print(f"\n训练完成，共 {step} 步，耗时 {time.time() - t0:.0f} 秒")

correct = total = 0
with torch.no_grad():
    for images, labels in test_loader:
        correct += (model(images).argmax(dim=1) == labels).sum().item()
        total += labels.numel()
print(f"CNN+数据增强 测试集准确率：{correct / total * 100:.2f}%")
print("（对比：MLP 97.03% | CNN 98.09%）")
