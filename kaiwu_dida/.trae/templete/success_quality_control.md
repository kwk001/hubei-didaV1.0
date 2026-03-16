# 质量管控中心大屏制作成功经验总结

## 1. 项目背景与挑战
本项目最初基于“生产进度”大屏模板，后根据业务需求，需要快速转型为“质量管控中心”。面临的主要挑战包括：
*   **需求突变**：从关注“产量/进度”转变为关注“FPY/缺陷分布/IQC”。
*   **数据缺失**：开发环境缺乏真实的后端质检数据接口。
*   **演示压力**：需要在大屏上展示生动、实时跳动的数据效果，不能出现“暂无数据”的尴尬场面。

## 2. 核心成功经验

### 2.1 智能数据降级策略 (Data Fallback Strategy)
这是本次开发中最具价值的实践。我们设计了一套机制，优先请求真实 API，当 API 失败或返回空数据时，自动无缝切换到高质量的 Mock 数据。

**代码模式：**
```javascript
async initRealData() {
    // 1. 尝试获取真实数据
    const realData = await this.getRealDataFromAPI();
    
    // 2. 智能判断与降级
    if (!realData || realData.length === 0) {
        console.log("真实数据为空，启动演示模式...");
        this.loadMockData(); // 加载全真模拟数据
    } else {
        this.processRealData(realData); // 处理真实数据
    }
}
```
**价值**：
*   **开发提效**：前端不再依赖后端接口就绪，可并行开发。
*   **演示无忧**：无论环境如何，大屏始终有内容展示。

### 2.2 主题快速重构 (Theme Refactoring)
通过“组件复用 + 逻辑替换”实现了极速转型。

*   **指标替换**：
    *   `生产计划` -> `检验总数`
    *   `完成率` -> `综合合格率`
*   **图表复用**：
    *   **柱状图容器** (`planLineAmount`)：从展示“产线产量”改为展示“产线直通率 (FPY)”。保持了坐标轴、Grid 布局配置，仅修改了 Series 数据和颜色逻辑（低分标红）。
    *   **进度条容器** (`productAmount`)：从展示“产品完成度”改为展示“缺陷柏拉图”。利用 ECharts 的多 Y 轴功能（左轴数量、右轴百分比），实现了帕累托图效果。

### 2.3 高质量业务模拟 (High-Fidelity Mocking)
拒绝简单的 `Math.random()` 随机数，而是基于业务逻辑生成数据，使演示更具说服力。

*   **关联性模拟**：
    *   先生成 `totalInspect` (检验总数)，再根据 `98%` 的基准合格率计算 `totalOk` 和 `totalNg`，确保 `Ok + Ng = Total`。
*   **真实感构建**：
    *   **产品名**：使用真实的汽车零部件命名（如“U725-左侧围上横梁”）。
    *   **缺陷原因**：枚举真实的缺陷类型（“划痕”、“气孔”、“尺寸超差”）。
    *   **实时滚动**：利用 `setInterval` 每 30 秒生成一批带有当前时间戳（`HH:mm:ss`）的新记录，模拟流水线实时产出。

### 2.4 低代码平台适配
*   **React 类组件**：坚持使用 `class LowcodeComponent extends Component` 结构，确保在 Kaiwu 引擎中正确加载。
*   **ECharts 封装**：将图表初始化逻辑封装为 `initChartsTempl(id, option)`，并统一处理 `resize` 事件，保证了多图表场景下的性能和响应式体验。

## 3. 关键代码片段

### 产线 FPY 排名图表配置 (ECharts)
```javascript
// 亮点：使用回调函数根据数值动态设置颜色（<98% 标红）
itemStyle: {
  color: function(params) {
      return params.value < 98 ? '#ff3232' : new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#25ec25'}, {offset: 1, color: '#008000'}]);
  }
}
```

### 实时数据生成器
```javascript
// 模拟实时质检流水
for(let i=0; i<10; i++) {
    const isNg = Math.random() > 0.95; // 控制 5% 不良率
    newQualityList.push({
        snCode: `SN${moment().format('YYYYMMDD')}${randomId}`,
        result: isNg ? 'NG' : 'OK',
        defectReason: isNg ? getRandomDefect() : '-', // 只有 NG 才显示原因
        inspectTime: moment().subtract(i*10, 'seconds').format('HH:mm:ss') // 时间倒推
    });
}
```

## 4. 总结
本次“质量管控中心”的成功落地，证明了 **“架构先行、数据兜底、逻辑仿真”** 是大屏开发的高效路径。这套经验不仅适用于质量主题，也可快速复制到设备监控、能耗管理等其他领域。
