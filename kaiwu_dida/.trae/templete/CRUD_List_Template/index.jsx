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
      isShowDialog: false,
      page: { size: 20, current: 1, total: 0 }, // 分页
      searchForm: {}, // 筛选条件
      currentUser: {}, // 当前用户
      currentRow: {},
      tableList: [], // 表格数据
      loading: false, // 表格loading
      isHasMore: false, // 是否有更多
    }
  }

  componentDidMount() {
    this.init(async () => {
      // 初始化数据加载
      this.queryTableList();
      // 获取当前用户
      this.getCurrentUser();
    });
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

  // 筛选条件发生变化
  onSearchHandel(searchForm) {
    const { page } = this.state;
    this.setState({
      searchForm,
      page: { ...page, current: 1 }
    }, () => this.queryTableList());
  }

  // 筛选条件重置
  onSearchFormReset() {
    const { page } = this.state;
    this.setState({
      searchForm: {},
      page: { ...page, current: 1 }
    }, () => this.queryTableList());
  }

  // 分页发生变化
  currentOrSizeChange(current, size) {
    const { page } = this.state;
    this.setState({
      page: { ...page, current, size }
    }, () => this.queryTableList());
  }

  // 查询表格数据
  async queryTableList() {
    const { page, searchForm } = this.state;
    await this.setStateAsync({ loading: true });

    try {
      // 构建查询参数
      const params = {
        pageIndex: page.current,
        pageSize: page.size,
        ...searchForm
      };

      // 调用数据源
      let res = { total: 0, data: [] };
      if (this.dataSourceMap && this.dataSourceMap['queryFormData']) {
        res = await this.dataSourceMap['queryFormData'].load(params);
      }

      const { data: tableList, total } = res || { data: [], total: 0 };
      let isHasMore = page.size * page.current < total;
      
      this.setState({ 
        tableList: tableList || [], 
        page: { ...page, total: total || 0 }, 
        loading: false, 
        isHasMore 
      });
    } catch (error) {
      console.error('查询列表失败', error);
      this.setState({ loading: false });
    }
  }

  // 新增/编辑弹窗
  showDialog(row = {}) {
    this.setState({
      isShowDialog: true,
      currentRow: row
    });
  }

  // 关闭弹窗
  closeDialog() {
    this.setState({
      isShowDialog: false,
      currentRow: {}
    });
  }

  // 保存数据
  async onSave(values) {
    const { Message } = window.Next || { Message: { success: console.log, error: console.error } };
    try {
      // 调用保存接口
      // await this.dataSourceMap['saveFormData'].load(values);
      Message.success('保存成功');
      this.closeDialog();
      this.queryTableList();
    } catch (error) {
      Message.error('保存失败');
    }
  }

  // 删除数据
  async onDelete(row) {
    const { Message } = window.Next || { Message: { success: console.log, error: console.error } };
    try {
      // 调用删除接口
      // await this.dataSourceMap['deleteFormData'].load({ id: row.id });
      Message.success('删除成功');
      this.queryTableList();
    } catch (error) {
      Message.error('删除失败');
    }
  }

  // setState Async Helper
  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  init(callback) {
    if (callback) callback();
  }
}
