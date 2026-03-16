# 开物MES 低代码页面模板

本文档整理了 `kaiwu-app` 中常见的低代码页面开发模式，提供了两种标准模板供研发工程师参考。

## 目录

1. [CRUD 列表页模板 (CRUD_List_Template)](#1-crud-列表页模板-crud_list_template)
2. [可视化看板模板 (Dashboard_Template)](#2-可视化看板模板-dashboard_template)

---

## 1. CRUD 列表页模板 (CRUD_List_Template)

适用于标准的增删改查管理页面。

### 适用场景
- 基础资料维护（如：BOM管理、物料管理）
- 业务单据管理（如：生产工单、到货计划）
- 简单的数据报表查询

### 核心特性
- **列表展示**: 使用 `KaiwuFlexTable2` 组件。
- **分页处理**: 内置 `page` 状态管理 (`current`, `size`, `total`)。
- **筛选查询**: 内置 `searchForm` 状态及 `onSearchHandel` 处理函数。
- **弹窗编辑**: 使用 `KaiwuFlexDialog2` 进行新增/编辑操作。
- **数据源**: 预设了查询、保存、删除等标准 `dataSource` 配置。

### 目录结构
- `index.jsx`: 业务逻辑代码，包含状态管理、事件处理、生命周期。
- `schema.json`: 页面结构定义，包含组件树、属性配置、数据源配置。
- `index.css`: 页面样式文件，包含基础布局、标题样式、表单样式微调。
- `assets.json`: 资源配置文件，定义了页面依赖的低代码组件库和第三方库。

### 使用方法
1. 复制 `CRUD_List_Template` 文件夹到目标模块目录。
2. 修改 `schema.json` 中的 `dataSource` API 地址。
3. 在 `index.jsx` 中根据实际业务调整 `searchForm` 字段和 `tableList` 字段映射。

---

## 2. 可视化看板模板 (Dashboard_Template)

适用于大屏展示、实时监控、生产看板等页面。

### 适用场景
- 生产执行看板
- 设备状态监控
- 质量数据看板

### 核心特性
- **实时刷新**: `componentDidMount` 中内置 `setInterval` 定时器，自动刷新数据。
- **指标管理**: `metrics` 状态对象，集中管理关键指标数据。
- **布局灵活**: 使用 `KaiwuFlexLayout` 和 Grid 布局实现卡片式展示。
- **图表预留**: 预留了图表区域和数据获取逻辑 (`fetchChartData`)。

### 目录结构
- `index.jsx`: 包含定时刷新逻辑、多维度数据获取逻辑。
- `schema.json`: 定义了看板的 Grid 布局、指标卡片组件。
- `index.css`: 看板专用样式，包含深色主题、自定义滚动条、Header 样式。
- `assets.json`: 资源配置文件，定义了页面依赖的低代码组件库和第三方库。

### 使用方法
1. 复制 `Dashboard_Template` 文件夹到目标模块目录。
2. 在 `index.jsx` 中配置具体的指标获取接口 (`fetchMetrics`, `fetchChartData`)。
3. 在 `schema.json` 中调整布局样式和卡片内容。
4. 在 `index.css` 中配置看板背景图和主题色。

---

## 常见问题

**Q: 如何修改 API 接口地址？**
A: 打开 `schema.json`，找到 `dataSource.list` 数组，修改对应 ID 的 `options.uri` 字段。

**Q: 如何添加新的状态变量？**
A: 在 `index.jsx` 的 `state` 对象中添加新的属性，并在需要的地方使用 `this.setState` 更新。

**Q: 如何引入第三方组件库？**
A: `index.jsx` 中可以直接 import 支持的组件库（如 `@alifd/next`），或者在 `schema.json` 的 `componentsMap` 中注册低代码组件，并在 `assets.json` 中添加相应的 CDN 链接。
