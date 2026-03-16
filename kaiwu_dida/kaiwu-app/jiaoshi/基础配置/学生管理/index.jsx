import React, { Component } from 'react';

class LowcodeComponent extends Component {
  constructor() {
    const { inject } = window.HaijuBasePack;
    inject(this, { withMethods: [] });
  }

  state = {
    isShowAddDrawer: false,
    drawerTitle: '新增学生',
    currentRow: {},
    tableList: [],
    searchForm: {},
    page: { size: 10, current: 1, total: 0 },
    loading: false,
    formId: 'EDU_StudentConfig', // 学生配置表单ID
  }

  componentDidMount() {
    this.init(() => {
        this.queryList()
    })
  }

  // 模拟数据 - 学生管理
  getMockData() {
    return [
      { id: '1', studentNo: 'S2026001', studentName: '张三', gender: 'male', gradeName: '2026级', className: '一班', phone: '13800138001', status: 'enable', remark: '优秀学生', updateTime: '2026-09-01 10:00:00', createBy: 'admin' },
      { id: '2', studentNo: 'S2026002', studentName: '李四', gender: 'female', gradeName: '2026级', className: '二班', phone: '13800138002', status: 'enable', remark: '', updateTime: '2026-09-01 10:00:00', createBy: 'admin' },
      { id: '3', studentNo: 'S2025001', studentName: '王五', gender: 'male', gradeName: '2025级', className: '一班', phone: '13800138003', status: 'disable', remark: '休学中', updateTime: '2025-09-01 10:00:00', createBy: 'admin' },
      { id: '4', studentNo: 'S2025002', studentName: '赵六', gender: 'female', gradeName: '2025级', className: '三班', phone: '13800138004', status: 'enable', remark: '', updateTime: '2025-09-01 10:00:00', createBy: 'admin' },
    ];
  }

  // 搜索处理
  onSearchlHandel(searchForm) {
    const { page } = this.state
    this.setState({
      page: { ...page, current: 1 },
      searchForm
    }, () => this.queryList())
  }

  // 重置搜索
  onSearchReset() {
    const { page } = this.state
    this.setState({
      page: { ...page, current: 1 },
      searchForm: {}
    }, () => this.queryList())
  }

  // 分页变化
  onCurrentOrSizeChange(current, size) {
    const { page } = this.state
    this.setState({
      page: { ...page, size, current }
    }, () => this.queryList())
  }

  onPageChange(current, size) {
    this.onCurrentOrSizeChange(current, size)
  }

  // 查询列表
  queryList() {
    const { page } = this.state
    this.setState({ loading: true })
    this.queryListCommon().then(result => {
      const { total, tableList } = result
      this.setState({
        tableList,
        page: { ...page, total },
        loading: false
      })
    }).catch(() => {
      this.setState({ loading: false })
    })
  }

  // 通用查询逻辑
  queryListCommon() {
    const { searchForm } = this.state
    const { studentName, studentNo, status } = searchForm
    
    // Mock logic for demonstration
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let mockData = this.getMockData();

            // Filter by Search Form
            if (studentName) {
                mockData = mockData.filter(item => item.studentName.includes(studentName));
            }
            if (studentNo) {
                mockData = mockData.filter(item => item.studentNo.includes(studentNo));
            }
            if (status) {
                mockData = mockData.filter(item => item.status === status);
            }

            resolve({ tableList: mockData, total: mockData.length });
        }, 300);
    })
  }

  // 打开新增抽屉
  openAddDrawer() {
    this.setState({
      isShowAddDrawer: true,
      drawerTitle: '新增学生',
      currentRow: {}
    }, () => {
      // 重置表单
      if (this.refs.createForm) {
        this.refs.createForm.resetFields()
        // 默认状态启用
        this.refs.createForm.setFieldsValue({ status: 'enable' })
      }
    })
  }

  // 打开编辑抽屉
  onEditClick(_, { rowRecord }) {
    this.setState({
      isShowAddDrawer: true,
      drawerTitle: '编辑学生',
      currentRow: rowRecord
    }, () => {
      // 回填表单
      if (this.refs.createForm) {
        this.refs.createForm.setFieldsValue({
          ...rowRecord
        })
      }
    })
  }

  // 关闭抽屉
  closeDrawer() {
    this.setState({ isShowAddDrawer: false })
  }

  // 提交表单
  submitDrawer() {
    const { formId, currentRow, drawerTitle } = this.state
    const { message } = window.antd || { message: { success: console.log, error: console.error } }
    
    if (!this.refs.createForm) return;

    this.refs.createForm.validateFields((err, values) => {
      if (err) return
      
      const formData = {
        ...values,
        formId
      }

      if (drawerTitle === '编辑学生') {
        // 更新
        formData.id = currentRow.id
        this.apiMethods(formData, 'updateFormData').then(() => {
          message.success('更新成功')
          this.closeDrawer()
          this.queryList()
        })
      } else {
        // 新增
        this.apiMethods(formData, 'addFormData').then(() => {
          message.success('新增成功')
          this.closeDrawer()
          this.queryList()
        })
      }
    })
  }

  // 删除
  onDeleteClick(_, { rowRecord }) {
    const { Modal, message } = window.antd
    Modal.confirm({
      title: '确认删除?',
      content: `您确定要删除学生 "${rowRecord.studentName}" 吗？`,
      onOk: () => {
        this.apiMethods({ ids: [rowRecord.id] }, 'deleteFormData').then(() => {
          message.success('删除成功')
          this.queryList()
        })
      }
    })
  }

  // 渲染状态列
  renderStatus(v) {
    const { Tag } = window.antd
    if (v === 'enable') {
        return <Tag color="green">启用</Tag>
    } else {
        return <Tag color="red">停用</Tag>
    }
  }

  // 渲染性别列
  renderGender(v) {
      const { Tag } = window.antd
      if (v === 'male') {
          return '男'
      } else if (v === 'female') {
          return '女'
      }
      return '未知'
  }

  // API 请求封装
  apiMethods(params, type = 'search', resultKey = "result") {
    const { Unit: { commonReauire, apiEnum } } = window
    return new Promise((resolve, reject) => {
      const apiType = (apiEnum && apiEnum(type)) || type
      commonReauire(this, apiType, params, resultKey).then(res => {
        resolve(res)
      }).catch(err => reject(err))
    })
  }
}
