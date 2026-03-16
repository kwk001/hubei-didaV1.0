# PC 端设计规范

## 核心原则
统一、清晰、高效、可访问，覆盖布局、排版、色彩、组件、交互、响应式与无障碍等维度

---

## 布局规范

### 设计原则
- 内容优先、结构清晰、模块化、视觉平衡、留白合理
- 遵循 **8px 基准网格系统**（所有间距、尺寸用 8 的倍数：8/16/24/32/48px）
- 常用 **12 列响应式网格**，容器最大宽 1200px，左右留白

### 页面结构
| 区域 | 规格 |
|------|------|
| 顶部导航栏 | 高度 48–64px，固定/悬浮，含 logo、主导航、搜索、用户入口 |
| 侧边栏 | 宽度 200–280px，折叠/展开，二级导航、工具入口 |
| 主内容区 | 居中，最大宽度 1000–1200px，内边距 16–24px |
| 页脚 | 高度 60–120px，版权、链接、备案、联系方式 |

### 窗口与层级
- 窗口最小尺寸：1024×768px（兼容主流）
- 弹窗层级：模态框 > 抽屉 > 气泡 > 提示
- 模态框宽度：480/600/800px，居中，遮罩层透明度 0.5–0.7

---

## 排版规范

### 字体
- **中文**：微软雅黑、思源黑体、苹方（无衬线）
- **英文**：Segoe UI、Roboto、Arial
- **禁止**：宋体（正文）、艺术字体、多字体混用

### 字号层级
| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| H1 | 32px | Bold | 页面主标题 |
| H2 | 24px | Bold | 模块标题 |
| H3 | 20px | Bold | 卡片/区块标题 |
| 正文 | 16px | Regular | 主要内容 |
| 小字 | 14px | Regular | 辅助说明、列表提示 |
| 备注 | 12px | Regular | 备注、版权、提示 |

### 行高与间距
- 行高：1.5–1.8 倍字号（正文 16px → 行高 24–28px）
- 字间距：默认；标题可微调至 0.5–1px
- 段落间距：24–32px
- 对齐：正文左对齐；表单标签冒号右对齐；数值右对齐

---

## 色彩规范

### 配色原则
- 主色：1–2 种（品牌色），用于按钮、链接、强调
- 辅助色：3–4 种（成功、警告、错误、信息）
- 中性色：白、浅灰、中灰、深灰、黑（文本、背景、边框）

### 标准色值
| 类型 | 色值 |
|------|------|
| **主色** | **#6366f1**（靛蓝） |
| 成功 | #00B42A |
| 警告 | #FF7D00 |
| 错误 | #F53F3F |
| 信息 | #86909C |
| 背景 | #F5F7FA、#FFFFFF |
| 边框 | #E5E6EB |
| 正文文本 | #1D2129 |
| 次要文本 | #4E5969 |
| 提示文本 | #86909C |

### 对比度要求
- 正文文本与背景：≥4.5:1（WCAG 2.1 AA）
- 大文本（≥18pt 粗 / ≥24pt 常规）：≥3:1

---

## 组件规范

### 按钮
- 尺寸：大（40px）、中（32px）、小（24px）
- 内边距：12px 24px（中号）
- 圆角：4px（默认）、8px（卡片）
- 状态：默认、悬停、点击、禁用、加载
- 优先级：主按钮（填充）> 次按钮（描边）> 文字按钮

### 表单
- 标签：左对齐/顶部对齐，宽度固定
- 输入框：高度 32px，内边距 8px 12px，边框 1px #E5E6EB
- 校验：错误提示红色，位置在输入框下方
- 单选/复选：图标 + 文字，间距 8px

### 表格
- 表头：背景浅灰，文字加粗，居中/左对齐
- 行高：40–48px，斑马纹（隔行浅灰）
- 列宽：固定/自适应，关键列固定
- 操作列：居左，按钮/图标，hover 显示

### 卡片
- 内边距：24px
- 圆角：8px
- 阴影：默认无，hover 轻微阴影（0 2px 8px rgba(0,0,0,0.08)）
- 边框：1px #E5E6EB

### 图标
- 统一库：Ant Design Icons、Material Icons、Font Awesome
- 尺寸：16/20/24px（常用）
- 颜色：跟随文本/主题色，禁用态置灰
- 风格：线性/面性统一

---

## 交互规范

### 状态反馈
- 点击：状态变化（颜色/阴影/位移）
- 加载：全局/局部加载动画，禁止重复提交
- 成功/错误：Toast/Alert，3 秒自动消失
- 表单提交：实时校验，提交中禁用按钮

### 导航
- 顶部导航：一级最多 7 项，二级下拉/悬浮
- 侧边导航：折叠/展开，当前页高亮
- 面包屑：层级≤4，最后一级不可点击
- 快捷键：常用操作支持（Ctrl+S、Ctrl+F 等）

### 滚动
- 长列表：虚拟滚动/分页，每页 20–50 条
- 滚动条：自定义样式，hover 显示
- 回到顶部：滚动≥500px 显示

### 输入设备
- 鼠标：hover 状态清晰，指针样式正确（pointer/default/text）
- 键盘：Tab 聚焦顺序合理，Enter 提交，Esc 关闭弹窗

---

## 响应式规范

### 断点设置
| 断点 | 范围 | 设备 |
|------|------|------|
| 大屏 | ≥1440px | 4K |
| 桌面 | 1200–1439px | 主流 |
| 小屏笔记本 | 992–1199px | - |
| 平板横屏 | 768–991px | - |
| 移动端 | <768px | 切换布局/折叠导航 |

### 适配原则
- 流式布局 + 弹性盒（Flex/Grid）
- 图片：max-width:100%，高清适配（2x/3x）
- 字体：相对单位（rem/em），禁止固定 px

---

## 无障碍规范

- 语义化 HTML：header/nav/main/section/footer
- alt 文本：所有图片必填
- 键盘可访问：所有交互元素可 Tab 聚焦
- 颜色不唯一传达信息：搭配图标/文字
- 朗读支持：屏幕阅读器可识别

---

## 设计原则总结

| 原则 | 说明 |
|------|------|
| 一致性 | 全局样式、交互、文案统一 |
| 清晰性 | 信息层级分明，重点突出 |
| 高效性 | 操作路径短，高频功能易触达 |
| 容错性 | 操作可撤销，错误可恢复 |
| 可访问性 | 覆盖不同设备、人群、场景 |

---

## CSS 变量实现

```css
:root {
  /* 主色 - 靛蓝 */
  --primary-color: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  
  /* 辅助色 */
  --success-color: #00B42A;
  --warning-color: #FF7D00;
  --error-color: #F53F3F;
  --info-color: #86909C;
  
  /* 中性色 */
  --text-primary: #1D2129;
  --text-secondary: #4E5969;
  --text-tertiary: #86909C;
  --border-color: #E5E6EB;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F7FA;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* 阴影 */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.12);
}
```

---

## 组件代码示例

### 主按钮
```css
.btn-primary {
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: var(--primary-light);
}

.btn-primary:active {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  background: #c9cdd4;
  cursor: not-allowed;
}
```

### 次按钮
```css
.btn-secondary {
  background: #fff;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}
```

### 输入框
```css
.input {
  height: 32px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.3s;
}

.input:hover {
  border-color: var(--primary-light);
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  outline: none;
}
```

---

**文档版本**: V1.0  
**创建日期**: 2025-03-09  
**主色**: #6366f1（靛蓝）
