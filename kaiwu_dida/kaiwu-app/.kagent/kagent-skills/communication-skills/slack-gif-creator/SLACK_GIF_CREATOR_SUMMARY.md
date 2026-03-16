# Slack GIF 创建器技能 - 使用摘要

## 概述
Slack GIF 创建器是一个灵活的工具包,用于创建针对 Slack 优化的动画 GIF,特别处理标准消息 GIF 和受限的表情符号 GIF。

## 主要功能

### 动画原语
- 13 个可组合的构建块: Shake(震动)、Bounce(弹跳)、Spin(旋转)、Pulse(脉冲)、Fade(淡入淡出)、Zoom(缩放)、Explode(爆炸)、Wiggle(摆动)、Slide(滑动)、Flip(翻转)、Morph(变形)、Move(移动)、Kaleidoscope(万花筒)
- 每个原语都可以使用参数自定义以获得独特效果

### 优化工具
- 用于帧组装和压缩的 GIFBuilder
- 用于检查 Slack 大小/尺寸要求的验证器
- 自动颜色量化和重复帧移除

### 辅助工具
- 带轮廓的文本渲染以提高可读性
- 调色板管理
- 视觉效果(粒子、闪光、冲击波)
- 平滑运动的缓动函数

## Slack 要求

**消息 GIF:**
- 大小: 最大 ~2MB
- 尺寸: 最佳 480x480
- FPS: 15-20
- 颜色: 128-256

**表情符号 GIF:**
- 大小: 严格限制 64KB
- 尺寸: 最佳 128x128
- FPS: 10-12
- 颜色: 32-48

## 基本使用模式

1. 选择适当的动画原语
2. 配置所需效果的参数
3. 生成动画帧
4. 使用 GIFBuilder 组装
5. 使用优化保存
6. 根据 Slack 要求验证

## 示例实现

```python
from core.gif_builder import GIFBuilder
from templates.pulse import create_pulse_animation

# 创建帧
frames = create_pulse_animation(
    object_data={'emoji': '👍', 'size': 80},
    pulse_type='smooth',
    scale_range=(0.8, 1.2)
)

# 构建并保存
builder = GIFBuilder(128, 128, 10)
for frame in frames:
    builder.add_frame(frame)

builder.save('reaction.gif', num_colors=40, optimize_for_emoji=True)
```

该工具包在确保与 Slack 平台限制的技术兼容性的同时,实现创作自由。
