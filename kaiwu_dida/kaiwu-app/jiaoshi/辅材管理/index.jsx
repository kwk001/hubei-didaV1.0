import React, { Component } from 'react';

class LowcodeComponent extends Component {
  constructor() {
    const { inject } = window.HaijuBasePack;
    inject(this, { withMethods: [] });
  }

  state = {
    currentUser: {},
    isShowAddDrawer: false,
    drawerTitle: '新增辅材',
    currentRow: {},
    tableList: [],
    searchForm: {},
    page: { size: 10, current: 1, total: 0 },
    loading: false,
    previewImg: {
      name: '',
      url: '',
      type: '' // 'image' or 'video'
    },
    previewImgShow: false,
    formId: 'EDU_AuxiliaryMaterial', // 辅材教材表单ID
    activeTab: 'my' // 当前激活的 Tab：'my', 'public'
  }

  componentDidMount() {
    this.init(() => {
        // 获取当前用户信息，用于区分我的教材
        this.apiMethods({}, 'getCurrentUser').then(user => {
            const validUser = user && user.id ? user : { id: 'user_001', name: '测试教师' };
            this.setState({ currentUser: validUser }, () => {
                this.queryList()
            })
        }).catch(() => {
            this.setState({ currentUser: { id: 'user_001', name: '测试教师' } }, () => {
                this.queryList()
            })
        })
    })
  }

  // 模拟数据 - 高职院校信息技术专业场景 (辅材)
  getMockData() {
    const { currentUser } = this.state;
    const currentUserId = currentUser?.id || 'user_001';
    return [
      { id: '1', grade: '2025级', materialName: 'Java实验手册：环境搭建指南.pdf', attachment: ['https://example.com/java_manual.pdf'], remark: '包含JDK下载地址与配置步骤', updateTime: '2023-10-01 10:00:00', createBy: currentUserId, isRecommend: false },
      { id: '2', grade: '2025级', materialName: '计算机网络：Wireshark抓包教程.docx', attachment: ['https://example.com/wireshark_guide.docx'], remark: '实验三必备参考资料', updateTime: '2023-10-02 11:30:00', createBy: currentUserId, isRecommend: false },
      { id: '3', grade: '2024级', materialName: 'Web前端开发：CSS Flexbox速查表.jpg', attachment: ['https://gw.alicdn.com/tfs/TB1.Z.Jb.T1gK0jSZFhXXaAtVXa-400-400.jpg'], remark: '打印出来贴在实验室墙上', updateTime: '2023-10-03 09:15:00', createBy: 'other_user', isRecommend: true },
      { id: '4', grade: '2024级', materialName: '数据库原理：SQL语法规范V1.0.pdf', attachment: ['https://example.com/sql_standard.pdf'], remark: '企业开发规范', updateTime: '2023-10-04 14:20:00', createBy: currentUserId, isRecommend: true },
      { id: '5', grade: '2023级', materialName: 'Python数据分析：Titanic数据集.csv', attachment: ['https://example.com/titanic.csv'], remark: '用于Pandas练习', updateTime: '2023-10-05 16:00:00', createBy: 'other_user', isRecommend: false },
      { id: '6', grade: '2023级', materialName: '云计算技术：AWS认证考试大纲.pdf', attachment: ['https://example.com/aws_exam.pdf'], remark: '期末考试参考', updateTime: '2023-10-06 08:45:00', createBy: currentUserId, isRecommend: false },
      { id: '7', grade: '2025级', materialName: 'Linux操作系统：Vim快捷键图解.png', attachment: ['https://gw.alicdn.com/tfs/TB1.Z.Jb.T1gK0jSZFhXXaAtVXa-400-400.jpg'], remark: '新手必备', updateTime: '2023-10-07 13:10:00', createBy: 'other_user', isRecommend: true },
      { id: '8', grade: '2024级', materialName: '软件工程：需求规格说明书模板.docx', attachment: ['https://example.com/srs_template.docx'], remark: '大作业使用此模板', updateTime: '2023-10-08 15:30:00', createBy: currentUserId, isRecommend: false },
      { id: '9', grade: '2023级', materialName: '人工智能导论：TensorFlow安装包.zip', attachment: ['https://example.com/tf_setup.zip'], remark: '内网下载加速', updateTime: '2023-10-09 10:50:00', createBy: 'other_user', isRecommend: true },
    ];
  }

  // Tab 切换
  onTabChange(activeTab) {
    this.setState({
      activeTab,
      page: { ...this.state.page, current: 1 },
      searchForm: {} // 切换 Tab 时重置搜索条件
    }, () => {
        this.queryList()
    })
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
    const { searchForm, activeTab, currentUser } = this.state
    const { grade, materialName } = searchForm
    
    // Mock logic for demonstration
    return new Promise((resolve) => {
        setTimeout(() => {
            let mockData = this.getMockData();
            const currentUserId = currentUser?.id || 'user_001';

            // Filter by Tab
            if (activeTab === 'my') {
                mockData = mockData.filter(item => item.createBy === currentUserId);
            } 
            // 'public' tab shows all data

            // Filter by Search Form
            if (grade) {
                mockData = mockData.filter(item => item.grade === grade);
            }
            if (materialName) {
                 mockData = mockData.filter(item => item.materialName.includes(materialName));
            }

            resolve({ tableList: mockData, total: mockData.length });
        }, 500);
    })
  }

  // 打开新增抽屉
  addInStockOrder() {
    this.setState({
      isShowAddDrawer: true,
      drawerTitle: '新增辅材',
      currentRow: {}
    }, () => {
      // 重置表单
      if (this.refs.createForm) {
        this.refs.createForm.resetFields()
      }
    })
  }

  // 打开编辑抽屉
  onEditClick(_, { rowRecord }) {
    this.setState({
      isShowAddDrawer: true,
      drawerTitle: '编辑辅材',
      currentRow: rowRecord
    }, () => {
      // 回填表单
      if (this.refs.createForm) {
        // 处理附件回填
        let attachment = rowRecord.attachment
        if (attachment && typeof attachment === 'string') {
            try {
                attachment = JSON.parse(attachment)
            } catch(e) {
                attachment = attachment.split(',').map(url => ({ 
                    uid: url, 
                    name: url.split('/').pop(), 
                    status: 'done', 
                    url: url 
                }))
            }
        }
        
        this.refs.createForm.setFieldsValue({
          ...rowRecord,
          attachment: attachment
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
    const { message } = window.antd
    
    this.refs.createForm.validateFields((err, values) => {
      if (err) return
      
      let attachment = values.attachment
      
      const formData = {
        ...values,
        formId,
        attachment
      }

      if (drawerTitle === '编辑辅材') {
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
      content: `您确定要删除辅材 "${rowRecord.materialName}" 吗？`,
      onOk: () => {
        this.apiMethods({ ids: [rowRecord.id] }, 'deleteFormData').then(() => {
          message.success('删除成功')
          this.queryList()
        })
      }
    })
  }

  // 渲染附件列
  renderAttachment(v, row) {
    if (!v || (Array.isArray(v) && v.length === 0)) {
        return <span>无附件</span>
    }
    
    let files = []
    if (Array.isArray(v)) {
        files = v
    } else if (typeof v === 'string') {
        files = [v]
    }

    return (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {files.map((file, index) => {
            const fileName = typeof file === 'object' ? file.name : file.split('/').pop()
            const fileUrl = typeof file === 'object' ? file.url : file
            return (
                <a key={index} href="javascript:;" onClick={() => this.previewFile(fileName, fileUrl)}>
                   <span style={{ marginRight: 4 }}>查看附件</span>
                </a>
            )
        })}
      </div>
    )
  }

  // 预览文件
  async previewFile(name, url) {
    if (!url) {
        let picUrlList = await this.dataSourceMap['getFileUrls'].load({ names: [name] });
        url = picUrlList.result ? picUrlList.result[name] : null;
    }

    if (!url) {
        window.antd.message.error('无法获取文件地址')
        return
    }

    const fileExtension = name.split('.').pop().toLowerCase()
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov']
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']

    if (videoExtensions.includes(fileExtension)) {
        this.setState({
            previewImg: { name, url, type: 'video' },
            previewImgShow: true
        })
    } else if (imageExtensions.includes(fileExtension)) {
        this.setState({
            previewImg: { name, url, type: 'image' },
            previewImgShow: true
        })
    } else {
        // 其他文件直接打开
        window.open(url, '_blank')
    }
  }

  // 渲染预览弹窗 (主要用于图片和视频，其他文件通过新窗口打开)
  renderPreview() {
    const { previewImg, previewImgShow } = this.state;
    
    if (!previewImgShow) return null;

    return (
      <div className="preview" style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', flexDirection: 'column' 
      }}>
        <div style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer', color: '#fff', fontSize: 24 }}>
             <span onClick={() => this.setState({ previewImgShow: false })}>X</span>
        </div>
        
        {previewImg.type === 'video' ? (
            <video controls autoPlay style={{ maxWidth: '90%', maxHeight: '80%' }}>
                <source src={previewImg.url} type={`video/${previewImg.name.split('.').pop()}`} />
                您的浏览器不支持视频播放。
            </video>
        ) : (
            <img src={previewImg.url} alt={previewImg.name} style={{ maxWidth: '90%', maxHeight: '80%' }} />
        )}
        
        <div style={{ marginTop: 20, color: '#fff' }}>
            {previewImg.name}
        </div>
      </div>
    )
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

export default LowcodeComponent;
