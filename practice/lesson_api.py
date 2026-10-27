# -*- coding: utf-8 -*-
"""
第 0 节：PyTorch 是什么
把 nn.Linear / backward / optimizer 剥开，看清它们只是熟悉概念的封装。
运行：  ../.venv/bin/python lesson_api.py
"""
import torch

print("=" * 58)
print("① 张量 Tensor：就是一个多维数组（你可以当成 numpy 数组）")
print("=" * 58)
x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
print("一个 2x2 的张量：\n", x)
print("形状 shape：", x.shape)

print()
print("=" * 58)
print("② 张量运算：和数字运算一样，只是批量化地算了一堆数字")
print("=" * 58)
w = torch.tensor([[1.0], [2.0]])
y = x @ w  # @ = 矩阵乘法，就是课程里的 w1·x + w2·y，一次算两行
print("x @ w（矩阵乘法）=\n", y)

print()
print("=" * 58)
print("③ 自动求导 autograd：PyTorch 的「分锅机器」（课程第 5 课的概念！）")
print("=" * 58)
a = torch.tensor(3.0, requires_grad=True)  # 声明：请追踪这个数的梯度
b = a * a + 2 * a                          # b = a² + 2a
b.backward()                               # 一键求导，自动完成链式法则
print("b = a² + 2a，a = 3 时，db/da =", a.grad.item(), "（口算验证：2a + 2 = 8）")

print()
print("=" * 58)
print("④ 手动实现一次梯度下降 —— optimizer.step() 的全部秘密就 3 行")
print("=" * 58)
w = torch.tensor(0.0, requires_grad=True)
target = 150.0
for step in range(20):
    loss = (w - target) ** 2   # 损失 = (w - 目标)²，就是课程里那个「碗」
    loss.backward()            # 分锅：自动算出 dloss/dw
    with torch.no_grad():      # 更新参数时不需要追踪梯度
        w -= 0.1 * w.grad      # 梯度下降！新 w = 旧 w − 学习率 × 梯度
    w.grad.zero_()             # 梯度清零，准备下一轮（optimizer.zero_grad() 干的事）
    if (step + 1) % 5 == 0:
        print(f"  第 {step + 1:>2} 步：w = {w.item():7.2f}，损失 = {loss.item():10.1f}")

print()
print("=" * 58)
print("⑤ nn.Linear / SGD 只是「便利贴」：替你保管参数、替你写那 3 行")
print("=" * 58)
layer = torch.nn.Linear(2, 1)
print("nn.Linear(2, 1) 替你创建并保管的参数：")
for p in layer.parameters():
    print("  形状", tuple(p.shape), "的", "权重 w" if p.shape == (1, 2) else "偏置 b")
print("它的输出 = x @ w.T + b —— 和你刚才手写的矩阵乘法一模一样")
