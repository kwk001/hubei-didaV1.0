import React, { Component } from 'react';

class LowcodeComponent extends Component {
  constructor() {
    // 模拟依赖注入，防止报错
    if (window.HaijuBasePack) {
        const { inject } = window.HaijuBasePack;
        inject(this, {
            withMethods: [],
        });
    }

    this.state = {
      loading: false,
      currentUser: {},
      // 统计指标
      metrics: {
        totalOrders: 0,
        completedOrders: 0,
        defectRate: 0,
      },
      // 图表数据
      chartData: [],
      // 列表数据
      listData: [],
      // 刷新定时器
      refreshInterval: null
    }
  }

  async componentDidMount() {
    this.init(async () => {
      // 1. 获取当前用户
      await this.getCurrentUser();
      
      // 2. 初始加载数据
      this.refreshData();

      // 3. 设置定时刷新 (例如每60秒刷新一次)
      this.state.refreshInterval = setInterval(() => {
        this.refreshData();
      }, 60000);
    });
  }

  componentWillUnmount() {
    // 清除定时器
    if (this.state.refreshInterval) {
      clearInterval(this.state.refreshInterval);
    }
  }

  // 统一刷新数据方法
  refreshData() {
    this.fetchMetrics();
    this.fetchChartData();
    this.fetchListData();
  }

  // 获取当前用户
  async getCurrentUser() {
    if (this.dataSourceMap && this.dataSourceMap['getCurrentUser']) {
      const res = await this.dataSourceMap['getCurrentUser'].load();
      if (res && res.result) {
        this.setState({ currentUser: res.result });
      }
    }
  }

  // 获取统计指标
  async fetchMetrics() {
    try {
      // 模拟调用接口
      // const res = await this.dataSourceMap['getMetrics'].load();
      // const data = res.data;
      
      // 模拟数据
      const mockData = {
        totalOrders: Math.floor(Math.random() * 1000),
        completedOrders: Math.floor(Math.random() * 800),
        defectRate: (Math.random() * 0.1).toFixed(2),
      };

      this.setState({
        metrics: { ...this.state.metrics, ...mockData }
      });
    } catch (error) {
      console.error('获取指标失败', error);
    }
  }

  // 获取图表数据
  async fetchChartData() {
    try {
      // 模拟调用接口
      // const res = await this.dataSourceMap['getChartData'].load();
      
      this.setState({
        chartData: [] // 更新图表数据
      });
    } catch (error) {
      console.error('获取图表数据失败', error);
    }
  }

  // 获取列表数据
  async fetchListData() {
    try {
      // 模拟调用接口
      // const res = await this.dataSourceMap['getListData'].load();
      
      this.setState({
        listData: [] // 更新列表数据
      });
    } catch (error) {
      console.error('获取列表数据失败', error);
    }
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  init(callback) {
    if (callback) callback();
  }
}
