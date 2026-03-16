# 生产进度可视化看板 - 开发复盘与经验总结

## 1. 项目背景
本任务旨在构建智慧工厂管控平台的“生产进度”可视化看板。作为生产驾驶舱的核心组成部分，该页面需要实时、直观地展示产线完成情况、工单执行进度、设备运行状态及异常预警，为管理层提供即时的决策支持数据。

## 2. 核心成果
- **多维度数据可视化**：成功集成了 ECharts，实现了产线完成量（动态背景柱状图）、今日产量进度（Top 3 高亮条形图）、设备统计（堆叠柱状图）及设备预警（饼图）等多种图表。
- **智能数据高亮（Top 3）**：在“产线今日产量”模块中，实现了数据的自动降序排列，并通过红（Top 1）、橙（Top 2）、黄（Top 3）渐变色及专属排名徽章，突出显示产能最高的产线。
- **实时动态监控**：利用 `setInterval` 实现秒级时间更新与数据刷新模拟，配合 ECharts 的动画效果，营造出真实的生产监控氛围。
- **精细化交互体验**：定制了 ECharts 的 Tooltip（富文本格式）和 AxisLabel（富文本样式），支持图表随窗口大小自适应缩放（Resize）。
- **低代码平台深度适配**：通过 Schema 绑定与全局对象注入，在无构建环境的低代码平台中完美运行了复杂的 React 类组件。

## 3. 关键问题与解决方案（避坑指南）

### 3.1 低代码平台的组件绑定与渲染
**问题现象**：低代码平台通常通过 JSON Schema 描述页面，如何将复杂的 React 类组件逻辑挂载到 Schema 中是一个难点。
**解决方案**：
- **Schema 显式绑定**：在 `schema.json` 中，通过 `KaiwuJsx` 组件的 `content` 属性，使用 `JSFunction` 类型显式调用组件内部的 `renderScreen` 方法。
  ```json
  "content": {
    "type": "JSFunction",
    "value": "function(){ return this.renderScreen.apply(this,Array.prototype.slice.call(arguments).concat([])) }"
  }
  ```
- **自定义渲染入口**：在 `index.jsx` 中不使用标准的 `render()`，而是定义 `renderScreen()` 作为主入口，从而绕过低代码引擎的某些默认限制，完全接管 DOM 渲染。

### 3.2 模块依赖与全局变量
**问题现象**：低代码运行沙箱中不支持标准的 `import` / `require` 语法，导致无法引入 AntD、ECharts 等库。
**解决方案**：
- **全局对象访问**：所有第三方库均通过 `window` 对象访问，例如 `window.echarts`、`window.antd`、`window.moment`。
- **样式隔离**：CSS 样式尽量使用具体的类名嵌套（如 `.container .content .left`），避免污染全局样式。

### 3.3 Top 3 数据排序与高亮显示
**问题现象**：原始的“产线今日产量”图表数据顺序固定，无法直观反映谁是产能冠军；且所有柱体颜色单一，缺乏视觉重心。
**解决方案**：
1. **数据预处理**：在 `initFulfillment` 方法中，使用 `sort((a, b) => b.value - a.value)` 对数据源进行降序排列，确保榜首始终在最上方。
2. **动态样式注入**：
   - **柱体颜色**：在 `series` 的 `data` 映射中，根据索引 `i` 动态分配渐变色方案（Top 1 红、Top 2 橙、Top 3 黄，其余蓝）。
   - **排名徽章**：在 `yAxis.axisLabel.formatter` 中，通过 `index < 3 ? 'b' + index : 'b'` 逻辑，为前三名匹配对应的富文本样式（`rich` 属性），实现差异化的排名图标。

### 3.4 复杂图表的富文本定制
**问题现象**：ECharts 默认的 Tooltip 和 Label 样式单一，无法满足“数据+单位+趋势”的复合展示需求。
**解决方案**：
- **HTML Formatter**：在 Tooltip 中使用 HTML 字符串拼接（如 `<div class="echarts-tip-div">...</div>`），实现自定义布局。
- **Rich Text**：在 AxisLabel 中定义 `rich` 对象，设置不同类名的样式（颜色、背景、圆角），然后在 `formatter` 中通过 `{styleName|text}` 语法引用，实现精美的排名徽章效果。

### 3.5 内存泄漏与性能优化
**问题现象**：页面频繁切换或长时间运行后，可能出现浏览器卡顿。
**解决方案**：
- **生命周期管理**：在 `componentDidMount` 中启动定时器和初始化图表，在 `componentWillUnmount` 中严格执行 `clearInterval` 和图表实例销毁（虽然示例代码主要处理了定时器，但这是最佳实践）。
- **按需渲染**：仅在数据变化或窗口 Resize 时触发重绘，避免不必要的计算。

## 4. 技术沉淀
1. **架构适配模式**：确立了“Schema 定义入口 -> Class Component 实现逻辑 -> Window 访问依赖”的低代码开发标准范式。
2. **ECharts 深度定制**：掌握了 `graphic.LinearGradient`（线性渐变）、`pictorialBar`（象形柱图）、`rich`（富文本标签）等高级特性，能应对复杂的 UI 设计还原。
3. **大屏布局技巧**：使用 `100vw/100vh` 强制占满屏幕，配合 `Flex` 布局（Left: 4, Center: 7, Right: 4）和 CSS 变量主题，实现了适应性强、视觉统一的大屏展示。

---
**生成时间**：2026-02-02
**版本**：v1.2 (补充低代码适配架构解析)