# 如何使用 Slack GIF 创建器技能

Slack GIF 创建器是一个综合性工具包,用于创建针对 Slack 优化的动画 GIF。它提供了模块化组件,可用于创建标准消息 GIF 和受限的表情符号 GIF。

## 了解 Slack 的要求

在创建 GIF 之前,了解 Slack 的限制很重要:

**消息 GIF:**
- 最大大小: ~2MB
- 最佳尺寸: 480x480 像素
- 推荐 FPS: 15-20 帧每秒
- 颜色限制: 128-256 色
- 时长: 2-5 秒

**表情符号 GIF(更具挑战性):**
- 最大大小: 64KB(严格限制)
- 最佳尺寸: 128x128 像素
- 推荐 FPS: 10-12 帧每秒
- 颜色限制: 32-48 色
- 时长: 1-2 秒

## 核心工具包组件

### 1. 动画原语
工具包提供了可组合的运动构建块:

- **Shake(震动)**: 添加颤抖或振动运动
- **Bounce(弹跳)**: 创建带有物理效果的弹跳效果
- **Spin(旋转)**: 顺时针、逆时针或摇摆旋转对象
- **Pulse(脉冲)**: 缩放对象以强调
- **Fade(淡入淡出)**: 创建淡入/淡出过渡
- **Zoom(缩放)**: 戏剧性的缩放变化
- **Explode(爆炸)**: 粒子爆发和破碎效果
- **Wiggle(摆动)**: 果冻般的变形
- **Slide(滑动)**: 带缓动的对象移动
- **Flip(翻转)**: 水平/垂直翻转过渡
- **Morph(变形)**: 将一个对象转换为另一个
- **Move(移动)**: 复杂的运动路径(线性、弧形、圆形、波浪)
- **Kaleidoscope(万花筒)**: 对称图案

### 2. GIF 构建器和优化
核心 `GIFBuilder` 类处理帧装配和优化:

```python
from core.gif_builder import GIFBuilder

# 使用所需的尺寸和帧率初始化
builder = GIFBuilder(width=128, height=128, fps=10)

# 添加帧(使用动画原语创建)
for frame in my_animation_frames:
    builder.add_frame(frame)

# 使用 Slack 优化保存
info = builder.save('my_gif.gif',
                   num_colors=48,           # 颜色限制
                   optimize_for_emoji=True) # 激进优化
```

### 3. 验证工具
确保您的 GIF 满足 Slack 的要求:

```python
from core.validators import check_slack_size, is_slack_ready

# 详细验证
passes, info = check_slack_size('my_gif.gif', is_emoji=True)

# 快速检查
if is_slack_ready('my_gif.gif', is_emoji=True):
    print("Ready for Slack!")
```

## 基本使用工作流程

1. **规划您的动画** - 决定您想要的视觉效果
2. **选择原语** - 选择适当的动画构建块
3. **创建帧** - 使用模板生成动画帧
4. **组装 GIF** - 使用 GIFBuilder 组合帧
5. **优化** - 应用适当的压缩设置
6. **验证** - 检查结果是否满足 Slack 的要求

## 示例:创建一个简单的反应 GIF

```python
# 导入所需组件
from core.gif_builder import GIFBuilder
from templates.pulse import create_pulse_animation

# 创建脉冲动画帧
frames = create_pulse_animation(
    object_data={'emoji': '👍', 'size': 80},
    pulse_type='smooth',
    scale_range=(0.8, 1.2),
    num_frames=12
)

# 构建并保存 GIF
builder = GIFBuilder(width=128, height=128, fps=10)
for frame in frames:
    builder.add_frame(frame)

# 使用表情符号优化保存
info = builder.save('reaction.gif', num_colors=40, optimize_for_emoji=True)
print(f"Created {info['frame_count']}-frame GIF ({info['size_kb']:.1f} KB)")
```

## 高级组合

组合多个原语以实现复杂动画:

```python
# 创建一个组合不同效果的序列
from templates.bounce import create_bounce_animation
from templates.shake import create_shake_animation

# 阶段 1: 弹跳球
bounce_frames = create_bounce_animation(
    object_data={'emoji': '⚽', 'size': 60},
    num_frames=20,
    bounce_height=100
)

# 阶段 2: 撞击时震动
shake_frames = create_shake_animation(
    object_data={'emoji': '💥', 'size': 80},
    num_frames=10,
    shake_intensity=15
)

# 组合帧
all_frames = bounce_frames + shake_frames

# 构建最终 GIF
builder = GIFBuilder(128, 128, 15)
for frame in all_frames:
    builder.add_frame(frame)

builder.save('bounce_and_shake.gif', num_colors=48, optimize_for_emoji=True)
```

## 优化策略

### 对于表情符号 GIF(64KB 限制):
1. 限制总帧数为 10-15 帧
2. 使用最多 32-48 色
3. 保持设计简单
4. 避免渐变
5. 使用 `optimize_for_emoji=True`

### 对于消息 GIF(2MB 限制):
1. 减少帧数或降低 FPS
2. 减少颜色数量
3. 如需要,减小尺寸
4. 启用重复帧移除

## 创意提示

1. **讲述故事** - 将动画分为阶段(预期、动作、反应)
2. **使用缓动** - 使用 `ease_in`、`ease_out`、`bounce_out` 实现平滑运动
3. **增加冲击感** - 使用闪光效果或粒子系统来强调
4. **组合效果** - 叠加动画以获得复杂结果
5. **频繁测试** - 在开发过程中验证文件大小

Slack GIF 创建器工具包在确保您的动画符合 Slack 技术限制的同时,提供最大的创作自由度。
