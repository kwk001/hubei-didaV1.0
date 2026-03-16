# 如何使用 Slack GIF 创建器技能

Slack GIF 创建器是一个灵活的工具包,用于创建针对 Slack 优化的动画 GIF。它提供了构建块,可用于创建消息 GIF(最大 ~2MB)和表情符号 GIF(严格的 64KB 限制)。

## 了解 Slack 要求

**消息 GIF:**
- 最大大小: ~2MB
- 最佳尺寸: 480x480
- 典型 FPS: 15-20
- 颜色限制: 128-256
- 时长: 2-5秒

**表情符号 GIF:**
- 最大大小: 64KB(严格限制)
- 最佳尺寸: 128x128
- 典型 FPS: 10-12
- 颜色限制: 32-48
- 时长: 1-2秒

## 核心组件

### 1. 动画原语
这些是可组合的运动构建块:
- Shake(震动)、Bounce(弹跳)、Spin(旋转)、Pulse(脉冲)、Fade(淡入淡出)、Zoom(缩放)、Explode(爆炸)、Wiggle(摆动)、Slide(滑动)、Flip(翻转)、Morph(变形)、Move(移动)、Kaleidoscope(万花筒)

### 2. GIF 构建器
用于组装和优化 GIF 的核心工具:
```python
from core.gif_builder import GIFBuilder

builder = GIFBuilder(width=128, height=128, fps=10)
# 向构建器添加帧
builder.add_frame(frame)
# 使用优化保存
builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
```

### 3. 验证器
检查您的 GIF 是否满足 Slack 的要求:
```python
from core.validators import check_slack_size, is_slack_ready

# 检查大小
passes, info = check_slack_size('my_gif.gif', is_emoji=True)

# 快速检查
if is_slack_ready('my_gif.gif', is_emoji=True):
    print("Ready for Slack!")
```

## 基本使用模式

1. **选择动画原语**,匹配您的创意愿景
2. **使用模板创建帧**
3. **使用 GIFBuilder 组装**
4. **使用适当的优化保存**
5. **验证**结果是否满足 Slack 要求

## 简单示例

```python
from core.gif_builder import GIFBuilder
from templates.pulse import create_pulse_animation

# 创建动画帧
frames = create_pulse_animation(
    object_data={'emoji': '👍', 'size': 80},
    pulse_type='smooth',
    scale_range=(0.8, 1.2),
    num_frames=12
)

# 构建 GIF
builder = GIFBuilder(width=128, height=128, fps=10)
for frame in frames:
    builder.add_frame(frame)

# 使用表情符号优化保存
builder.save('reaction.gif', num_colors=40, optimize_for_emoji=True)
```

## 优化技巧

**对于表情符号 GIF(64KB 限制):**
1. 限制为 10-12 帧
2. 使用最多 32-40 色
3. 避免渐变
4. 简化设计
5. 使用 `optimize_for_emoji=True`

**对于消息 GIF(2MB 限制):**
1. 减少帧数或 FPS
2. 减少颜色数量
3. 如需要,减小尺寸
4. 启用重复帧移除

## 组合动画

您可以组合多个动画原语:

```python
# 创建弹跳动画
bounce_frames = create_bounce_animation(
    object_data={'emoji': '⚽', 'size': 60},
    num_frames=20,
    bounce_height=100
)

# 在撞击时添加震动效果
for i, frame in enumerate(bounce_frames):
    # 当球撞击底部时添加震动效果
    if i > 15:  # 最后几帧
        # 使用震动效果修改帧
        pass

# 构建最终 GIF
builder = GIFBuilder(128, 128, 15)
for frame in bounce_frames:
    builder.add_frame(frame)

builder.save('bounce_shake.gif', num_colors=48, optimize_for_emoji=True)
```

该工具包旨在 Slack 技术限制范围内提供创作自由。从简单的动画开始,逐步组合原语以创建更复杂的效果。
