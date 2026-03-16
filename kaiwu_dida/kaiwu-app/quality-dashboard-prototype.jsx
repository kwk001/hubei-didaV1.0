import React, { Component } from 'react';

// 模拟 ECharts
const getECharts = () => window.echarts;

export default class QualityCommandCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeStr: '',
    };
    this.charts = {};
  }

  componentDidMount() {
    this.startClock();
    this.initCharts();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('resize', this.handleResize);
    Object.values(this.charts).forEach(chart => chart && chart.dispose());
  }

  handleResize = () => {
    Object.values(this.charts).forEach(chart => chart && chart.resize());
  };

  startClock = () => {
    const updateTime = () => {
      const now = new Date();
      this.setState({ timeStr: now.toLocaleString('zh-CN', { hour12: false }) });
    };
    updateTime();
    this.timer = setInterval(updateTime, 1000);
  };

  initCharts = async () => {
    // 轮询检测 echarts 资源是否加载完成 (最多等待 10秒)
    const waitForGlobal = async (key, maxRetries = 20, interval = 500) => {
      for (let i = 0; i < maxRetries; i++) {
        if (window[key]) return window[key];
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      return null;
    };

    const echarts = await waitForGlobal('echarts');
    
    if (!echarts) {
      console.error('ECharts resource failed to load within 10 seconds.');
      return;
    }

    // 1. 原材料 - 供应商排名
      this.initChart(echarts, 'chart-iqc-rank', {
        title: { text: '供应商质量红黑榜', textStyle: { color: '#fff' } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'value', axisLabel: { color: '#fff' } },
        yAxis: { type: 'category', data: ['供应商A', '供应商B', '供应商C'], axisLabel: { color: '#fff' } },
        series: [{ type: 'bar', data: [98, 95, 92], itemStyle: { color: '#1890ff' } }]
      });

      // 2. 原材料 - 合格率趋势
      this.initChart(echarts, 'chart-iqc-trend', {
        title: { text: '来料合格率趋势', textStyle: { color: '#fff' } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'], axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', min: 90, axisLabel: { color: '#fff' } },
        series: [{ type: 'line', data: [98, 97, 99, 96, 98], itemStyle: { color: '#52c41a' } }]
      });

      // 3. 入库 - 缺陷分布
      this.initChart(echarts, 'chart-fqc-defect', {
        title: { text: '生产缺陷分布', textStyle: { color: '#fff' } },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie', radius: '50%',
          data: [
            { value: 40, name: '划痕' },
            { value: 30, name: '尺寸' },
            { value: 20, name: '色差' },
            { value: 10, name: '其他' }
          ],
          label: { color: '#fff' }
        }]
      });

      // 4. 售后 - 故障分析
      this.initChart(echarts, 'chart-rma-analysis', {
        title: { text: '售后故障归因', textStyle: { color: '#fff' } },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie', radius: ['40%', '70%'],
          data: [
            { value: 45, name: '设计缺陷' },
            { value: 25, name: '制造不良' },
            { value: 20, name: '用户操作' },
            { value: 10, name: '物流损坏' }
          ],
          label: { color: '#fff' }
        }]
      });

  };

  initChart = (echarts, id, option) => {
    const el = document.getElementById(id);
    if (el) {
      const chart = echarts.init(el);
      chart.setOption(option);
      this.charts[id] = chart;
    }
  };

  render() {
    const { timeStr } = this.state;
    // 模拟 KaiwuFlexLayout 布局
    return (
      <div style={{ background: '#001529', color: '#fff', minHeight: '100vh', padding: 20 }}>
        {/* 顶部标题 */}
        <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '1px solid #1890ff' }}>
          <h1>全链路质量指挥中心</h1>
          <p>{timeStr}</p>
        </div>

        {/* 核心 KPI 指标 */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
          <div style={{ background: 'rgba(24,144,255,0.2)', padding: 20, borderRadius: 8, textAlign: 'center', width: '20%' }}>
            <h3>今日待检</h3>
            <div style={{ fontSize: 32, color: '#1890ff' }}>1,250</div>
          </div>
          <div style={{ background: 'rgba(82,196,26,0.2)', padding: 20, borderRadius: 8, textAlign: 'center', width: '20%' }}>
            <h3>IQC合格率</h3>
            <div style={{ fontSize: 32, color: '#52c41a' }}>98.5%</div>
          </div>
          <div style={{ background: 'rgba(250,173,20,0.2)', padding: 20, borderRadius: 8, textAlign: 'center', width: '20%' }}>
            <h3>FQC直通率</h3>
            <div style={{ fontSize: 32, color: '#faad14' }}>99.1%</div>
          </div>
          <div style={{ background: 'rgba(245,34,45,0.2)', padding: 20, borderRadius: 8, textAlign: 'center', width: '20%' }}>
            <h3>客诉数</h3>
            <div style={{ fontSize: 32, color: '#f5222d' }}>3</div>
          </div>
        </div>

        {/* 主体三栏布局 */}
        <div style={{ display: 'flex', gap: 20, height: 600 }}>
          {/* 左侧：原材料 IQC */}
          <div style={{ flex: 1, border: '1px solid #303640', padding: 10, borderRadius: 8 }}>
            <h2 style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10 }}>原材料质检 (IQC)</h2>
            <div id="chart-iqc-rank" style={{ height: 250, marginTop: 20 }}></div>
            <div id="chart-iqc-trend" style={{ height: 250, marginTop: 20 }}></div>
          </div>

          {/* 中间：入库质检 FQC */}
          <div style={{ flex: 1, border: '1px solid #303640', padding: 10, borderRadius: 8 }}>
            <h2 style={{ borderLeft: '4px solid #faad14', paddingLeft: 10 }}>入库质检 (FQC)</h2>
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', marginTop: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <h3>关键预警</h3>
                <p style={{ color: '#f5222d' }}>⚠ 批次 A20231001 尺寸超差</p>
                <p style={{ color: '#faad14' }}>⚠ 供应商X 连续3次来料异常</p>
              </div>
            </div>
            <div id="chart-fqc-defect" style={{ height: 250, marginTop: 20 }}></div>
          </div>

          {/* 右侧：售后检 RMA */}
          <div style={{ flex: 1, border: '1px solid #303640', padding: 10, borderRadius: 8 }}>
            <h2 style={{ borderLeft: '4px solid #f5222d', paddingLeft: 10 }}>售后质检 (RMA)</h2>
            <div id="chart-rma-analysis" style={{ height: 250, marginTop: 20 }}></div>
            <div style={{ marginTop: 20 }}>
              <h3>最新客诉列表</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
                  <span style={{ color: '#f5222d' }}>[严重]</span> 屏幕显示异常 - 2023-10-01
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
                  <span style={{ color: '#faad14' }}>[一般]</span> 外壳划痕 - 2023-10-02
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
                  <span style={{ color: '#52c41a' }}>[轻微]</span> 包装破损 - 2023-10-03
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
