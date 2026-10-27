# -*- coding: utf-8 -*-
"""
把真实 MNIST 样本导出到网页：像素 + 模型的 10 个得分
生成 js/mnist_samples.js，供第 7 课交互面板使用。
运行：  ../.venv/bin/python export_mnist_samples.py
"""
import json

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

# 和 train_mnist.py 完全相同的模型与训练
model = nn.Sequential(nn.Flatten(), nn.Linear(784, 128), nn.ReLU(), nn.Linear(128, 10))
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
for epoch in range(3):
    for images, labels in train_loader:
        loss = loss_fn(model(images), labels)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

# 在测试集上挑样本：7 个认对的（尽量覆盖不同数字）+ 第一个认错的
loader = DataLoader(test_data, batch_size=1000)
picked, error = [], None
want_digits = set(range(10))
with torch.no_grad():
    for images, labels in loader:
        logits = model(images)
        probs = torch.softmax(logits, dim=1)
        pred = logits.argmax(dim=1)
        for i in range(len(labels)):
            t, p = labels[i].item(), pred[i].item()
            if p != t and error is None:
                error = (images[i], t, p, probs[i])
            elif p == t and t in want_digits and len(picked) < 7:
                picked.append((images[i], t, p, probs[i]))
                want_digits.discard(t)
        if error and not want_digits and len(picked) >= 7:
            break

samples = []
for img, t, p, prob in picked + [error]:
    pixels = [round(v, 2) for v in img.view(-1).tolist()]
    samples.append({
        "pixels": pixels,                       # 784 个 0~1 的像素值
        "label": t,                             # 真实数字
        "pred": p,                              # 模型猜测
        "scores": [round(v, 4) for v in prob.tolist()],  # 10 个类别的概率
    })

js = "// 由 export_mnist_samples.py 自动生成：真实 MNIST 样本 + 模型打分\n"
js += "export const MNIST_SAMPLES = " + json.dumps(samples, separators=(",", ":")) + ";\n"
with open("../js/mnist_samples.js", "w", encoding="utf-8") as f:
    f.write(js)

print(f"已导出 {len(samples)} 个样本到 js/mnist_samples.js")
for s in samples:
    print(f"  真实 {s['label']} → 模型猜 {s['pred']}", "❌" if s["label"] != s["pred"] else "✓")
