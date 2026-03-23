/**
 * 教务管理系统 - 可复用组件JS
 * 包含：树状图、筛选条件、表格等组件
 */

// ==================== 树状图组件 (TreeSidebar) ====================
const TreeSidebar = {
    /**
     * 渲染树状图
     * @param {Array} data - 树状图数据
     * @param {Object} options - 配置选项
     * @param {string} options.containerId - 容器ID
     * @param {string} options.title - 标题
     * @param {Function} options.onSelect - 选中节点回调
     * @param {Function} options.onSearch - 搜索回调
     */
    render(data, options = {}) {
        const {
            containerId = 'treeContent',
            title = '分类目录',
            onSelect = () => {},
            onSearch = () => {}
        } = options;

        this.data = data;
        this.containerId = containerId;
        this.onSelect = onSelect;
        this.onSearch = onSearch;

        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.renderTree(data);
        this.bindEvents();
    },

    /**
     * 递归渲染树节点
     */
    renderTree(nodes, level = 0) {
        return nodes.map(node => `
            <div class="tree-node tree-level-${level}" data-id="${node.id}">
                <div class="tree-node-content ${node.expanded ? 'active' : ''}" 
                     onclick="TreeSidebar.handleNodeClick(this, '${node.id}', ${!!node.children})">
                    ${node.children ? `
                        <span class="tree-toggle ${node.expanded ? 'expanded' : ''}" data-toggle="${node.id}">▶</span>
                    ` : '<span style="width: 20px;"></span>'}
                    <span class="tree-icon">${node.icon || '📁'}</span>
                    <span class="tree-label">${node.label}</span>
                    ${node.count !== undefined ? `<span class="tree-count">${node.count}</span>` : ''}
                </div>
                ${node.children ? `
                    <div class="tree-children ${node.expanded ? 'expanded' : ''}" id="children-${node.id}">
                        ${this.renderTree(node.children, level + 1)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    /**
     * 处理节点点击
     */
    handleNodeClick(element, nodeId, hasChildren) {
        if (hasChildren) {
            this.toggleNode(nodeId);
        }
        this.selectNode(element, nodeId);
    },

    /**
     * 展开/收起节点
     */
    toggleNode(nodeId) {
        const children = document.getElementById(`children-${nodeId}`);
        const toggle = document.querySelector(`[data-toggle="${nodeId}"]`);
        
        if (children) {
            children.classList.toggle('expanded');
            if (toggle) toggle.classList.toggle('expanded');
        }
    },

    /**
     * 选中节点
     */
    selectNode(element, nodeId) {
        // 移除其他节点的选中状态
        document.querySelectorAll('.tree-node-content').forEach(node => {
            node.classList.remove('active');
        });
        
        // 添加当前节点选中状态
        element.classList.add('active');
        
        // 获取节点数据
        const nodeData = this.findNode(this.data, nodeId);
        
        // 触发回调
        if (this.onSelect) {
            this.onSelect(nodeData, element);
        }
    },

    /**
     * 查找节点
     */
    findNode(nodes, nodeId) {
        for (const node of nodes) {
            if (node.id === nodeId) return node;
            if (node.children) {
                const found = this.findNode(node.children, nodeId);
                if (found) return found;
            }
        }
        return null;
    },

    /**
     * 展开所有节点
     */
    expandAll() {
        document.querySelectorAll('.tree-children').forEach(el => {
            el.classList.add('expanded');
        });
        document.querySelectorAll('.tree-toggle').forEach(el => {
            el.classList.add('expanded');
        });
    },

    /**
     * 收起所有节点
     */
    collapseAll() {
        document.querySelectorAll('.tree-children').forEach(el => {
            el.classList.remove('expanded');
        });
        document.querySelectorAll('.tree-toggle').forEach(el => {
            el.classList.remove('expanded');
        });
    },

    /**
     * 搜索过滤
     */
    filter(keyword) {
        if (!keyword) {
            document.querySelectorAll('.tree-node').forEach(node => {
                node.style.display = '';
            });
            return;
        }

        const lowerKeyword = keyword.toLowerCase();
        document.querySelectorAll('.tree-node').forEach(node => {
            const label = node.querySelector('.tree-label')?.textContent || '';
            if (label.toLowerCase().includes(lowerKeyword)) {
                node.style.display = '';
                // 显示父节点
                let parent = node.parentElement;
                while (parent) {
                    if (parent.classList.contains('tree-children')) {
                        parent.classList.add('expanded');
                        const parentNode = parent.previousElementSibling;
                        if (parentNode) {
                            parentNode.style.display = '';
                            const toggle = parentNode.querySelector('.tree-toggle');
                            if (toggle) toggle.classList.add('expanded');
                        }
                    }
                    parent = parent.parentElement;
                }
            } else {
                node.style.display = 'none';
            }
        });
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索框事件在HTML中通过oninput绑定
    }
};

// ==================== 筛选条件组件 (FilterSection) ====================
const FilterSection = {
    /**
     * 初始化筛选组件
     * @param {Object} options - 配置选项
     * @param {string} options.containerId - 容器ID
     * @param {Array} options.fields - 筛选字段配置
     * @param {Function} options.onSearch - 查询回调
     * @param {Function} options.onReset - 重置回调
     */
    init(options = {}) {
        const {
            containerId = 'filterRow',
            fields = [],
            onSearch = () => {},
            onReset = () => {}
        } = options;

        this.containerId = containerId;
        this.fields = fields;
        this.onSearch = onSearch;
        this.onReset = onReset;

        this.renderFields();
    },

    /**
     * 渲染筛选字段
     */
    renderFields() {
        const container = document.getElementById(this.containerId);
        if (!container || this.fields.length === 0) return;

        const fieldsHtml = this.fields.map(field => this.renderField(field)).join('');
        
        const actionsHtml = `
            <div class="filter-actions">
                <button class="btn-reset" onclick="FilterSection.reset()">重置</button>
                <button class="btn-search" onclick="FilterSection.search()">查询</button>
            </div>
        `;

        container.innerHTML = fieldsHtml + actionsHtml;
    },

    /**
     * 渲染单个字段
     */
    renderField(field) {
        const { type, label, name, placeholder, options = [] } = field;

        let inputHtml = '';
        
        switch (type) {
            case 'select':
                inputHtml = `
                    <select id="filter-${name}" name="${name}">
                        ${options.map(opt => `
                            <option value="${opt.value}">${opt.label}</option>
                        `).join('')}
                    </select>
                `;
                break;
            case 'date':
                inputHtml = `<input type="date" id="filter-${name}" name="${name}" placeholder="${placeholder || ''}">`;
                break;
            default:
                inputHtml = `<input type="text" id="filter-${name}" name="${name}" placeholder="${placeholder || ''}">`;
        }

        return `
            <div class="filter-item">
                <label>${label}</label>
                ${inputHtml}
            </div>
        `;
    },

    /**
     * 展开/收起筛选区域
     */
    toggle(button) {
        const filterRow = document.getElementById('filterRow');
        const toggleText = button.querySelector('.toggle-text');
        const toggleIcon = button.querySelector('.toggle-icon');

        if (filterRow) {
            const isExpanded = filterRow.classList.contains('expanded');

            if (isExpanded) {
                // 收起
                filterRow.classList.remove('expanded');
                button.classList.remove('expanded');
                if (toggleText) toggleText.textContent = '展开';
                if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                // 展开
                filterRow.classList.add('expanded');
                button.classList.add('expanded');
                if (toggleText) toggleText.textContent = '收起';
                if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
            }
        }
    },

    /**
     * 获取筛选值
     */
    getValues() {
        const values = {};
        this.fields.forEach(field => {
            const element = document.getElementById(`filter-${field.name}`);
            if (element) {
                values[field.name] = element.value;
            }
        });
        return values;
    },

    /**
     * 设置筛选值
     */
    setValues(values) {
        Object.keys(values).forEach(key => {
            const element = document.getElementById(`filter-${key}`);
            if (element) {
                element.value = values[key];
            }
        });
    },

    /**
     * 查询
     */
    search() {
        const values = this.getValues();
        if (this.onSearch) {
            this.onSearch(values);
        }
    },

    /**
     * 重置
     */
    reset() {
        this.fields.forEach(field => {
            const element = document.getElementById(`filter-${field.name}`);
            if (element) {
                element.value = '';
            }
        });
        
        if (this.onReset) {
            this.onReset();
        }
    }
};

// ==================== 表格组件 (DataTable) ====================
const DataTable = {
    /**
     * 初始化表格
     * @param {Object} options - 配置选项
     * @param {string} options.containerId - 容器ID
     * @param {Array} options.columns - 列配置
     * @param {Array} options.data - 表格数据
     * @param {Function} options.onRowClick - 行点击回调
     * @param {boolean} options.fixedFirstColumn - 是否固定第一列
     * @param {boolean} options.fixedLastColumn - 是否固定最后一列
     */
    init(options = {}) {
        const {
            containerId = 'dataTable',
            columns = [],
            data = [],
            onRowClick = null,
            fixedFirstColumn = true,
            fixedLastColumn = true
        } = options;

        this.containerId = containerId;
        this.columns = columns;
        this.data = data;
        this.onRowClick = onRowClick;
        this.fixedFirstColumn = fixedFirstColumn;
        this.fixedLastColumn = fixedLastColumn;

        this.render();
    },

    /**
     * 渲染表格
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (this.data.length === 0) {
            this.showEmptyState();
            return;
        }

        const tableHtml = `
            <table>
                <thead>
                    <tr>
                        ${this.columns.map(col => `<th>${col.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.data.map((row, index) => this.renderRow(row, index)).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHtml;
        this.bindEvents();
    },

    /**
     * 渲染行
     */
    renderRow(row, index) {
        const cellsHtml = this.columns.map(col => {
            const value = row[col.dataIndex];
            const cellContent = col.render ? col.render(value, row, index) : value;
            return `<td>${cellContent}</td>`;
        }).join('');

        const dataAttrs = Object.keys(row)
            .filter(key => key.startsWith('data-'))
            .map(key => `data-${key.replace('data-', '')}="${row[key]}"`)
            .join(' ');

        return `<tr ${dataAttrs} data-index="${index}">${cellsHtml}</tr>`;
    },

    /**
     * 显示空状态
     */
    showEmptyState() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const emptyStateHtml = `
            <div class="empty-state">
                <div class="empty-state-illustration">
                    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="40" y="20" width="120" height="140" rx="8" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
                        <rect x="55" y="40" width="90" height="8" rx="4" fill="#E2E8F0"/>
                        <rect x="55" y="60" width="70" height="6" rx="3" fill="#E2E8F0"/>
                        <rect x="55" y="75" width="80" height="6" rx="3" fill="#E2E8F0"/>
                        <rect x="55" y="90" width="60" height="6" rx="3" fill="#E2E8F0"/>
                        <rect x="55" y="110" width="40" height="30" rx="4" fill="#E2E8F0"/>
                        <circle cx="140" cy="125" r="15" fill="#6366F1" opacity="0.1"/>
                        <path d="M135 125L138 128L145 121" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="empty-state-title">暂无数据</div>
                <div class="empty-state-desc">当前条件下暂无数据</div>
            </div>
        `;

        container.innerHTML = emptyStateHtml;
    },

    /**
     * 更新数据
     */
    setData(data) {
        this.data = data;
        this.render();
    },

    /**
     * 获取数据
     */
    getData() {
        return this.data;
    },

    /**
     * 筛选数据
     */
    filter(filterFn) {
        if (!filterFn) {
            this.render();
            return;
        }

        const filteredData = this.data.filter(filterFn);
        const originalData = this.data;
        this.data = filteredData;
        this.render();
        this.data = originalData;
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.onRowClick) return;

        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('click', () => {
                const index = parseInt(row.dataset.index);
                this.onRowClick(this.data[index], row);
            });
        });
    }
};

// ==================== 分页组件 (Pagination) ====================
const Pagination = {
    /**
     * 初始化分页
     * @param {Object} options - 配置选项
     * @param {string} options.containerId - 容器ID
     * @param {number} options.total - 总条数
     * @param {number} options.pageSize - 每页条数
     * @param {number} options.current - 当前页
     * @param {Function} options.onChange - 页码变化回调
     */
    init(options = {}) {
        const {
            containerId = 'pagination',
            total = 0,
            pageSize = 10,
            current = 1,
            onChange = () => {}
        } = options;

        this.containerId = containerId;
        this.total = total;
        this.pageSize = pageSize;
        this.current = current;
        this.onChange = onChange;

        this.render();
    },

    /**
     * 渲染分页
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const totalPages = Math.ceil(this.total / this.pageSize);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let pagesHtml = '';
        
        // 上一页
        pagesHtml += `
            <button ${this.current === 1 ? 'disabled' : ''} onclick="Pagination.prev()">上一页</button>
        `;

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.current - 2 && i <= this.current + 2)) {
                pagesHtml += `
                    <button class="${i === this.current ? 'active' : ''}" onclick="Pagination.go(${i})">${i}</button>
                `;
            } else if (i === this.current - 3 || i === this.current + 3) {
                pagesHtml += `<span>...</span>`;
            }
        }

        // 下一页
        pagesHtml += `
            <button ${this.current === totalPages ? 'disabled' : ''} onclick="Pagination.next()">下一页</button>
        `;

        container.innerHTML = pagesHtml;
    },

    /**
     * 上一页
     */
    prev() {
        if (this.current > 1) {
            this.go(this.current - 1);
        }
    },

    /**
     * 下一页
     */
    next() {
        const totalPages = Math.ceil(this.total / this.pageSize);
        if (this.current < totalPages) {
            this.go(this.current + 1);
        }
    },

    /**
     * 跳转到指定页
     */
    go(page) {
        this.current = page;
        this.render();
        
        if (this.onChange) {
            this.onChange(page, this.pageSize);
        }
    },

    /**
     * 更新配置
     */
    update(options) {
        Object.assign(this, options);
        this.render();
    }
};

// ==================== 工具函数 ====================
const Utils = {
    /**
     * 防抖函数
     */
    debounce(fn, delay = 300) {
        let timer = null;
        return function(...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    },

    /**
     * 节流函数
     */
    throttle(fn, interval = 300) {
        let last = 0;
        return function(...args) {
            const now = Date.now();
            if (now - last >= interval) {
                last = now;
                fn.apply(this, args);
            }
        };
    },

    /**
     * 格式化日期
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },

    /**
     * 文件大小格式化
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// ==================== 用户下拉菜单组件 (UserDropdown) ====================
const UserDropdown = {
    hideTimeout: null,

    /**
     * 初始化用户下拉菜单
     */
    init() {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');
        
        if (!userMenu || !dropdown) return;

        // 鼠标进入用户菜单区域时显示下拉框
        userMenu.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
            dropdown.classList.add('active');
        });

        // 鼠标离开用户菜单区域时延迟关闭下拉框
        userMenu.addEventListener('mouseleave', () => {
            this.hideTimeout = setTimeout(() => {
                dropdown.classList.remove('active');
            }, 200);
        });

        // 鼠标进入下拉框时保持显示
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
        });

        // 鼠标离开下拉框时关闭
        dropdown.addEventListener('mouseleave', () => {
            dropdown.classList.remove('active');
        });
    },

    /**
     * 显示下拉菜单
     */
    show() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.add('active');
        }
    },

    /**
     * 关闭下拉菜单
     */
    close() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    },

    /**
     * 切换风格 - 打开主题面板
     */
    switchTheme() {
        this.close();
        ThemePanel.open();
    },

    /**
     * 退出登录
     */
    logout() {
        if (confirm('确定要退出登录吗？')) {
            // 这里可以实现退出登录逻辑
            alert('已退出登录');
            // 可以跳转到登录页面
            // window.location.href = 'login.html';
        }
        this.close();
    }
};

// ==================== 主题切换面板组件 ====================
const ThemePanel = {
    currentTheme: 'default',
    
    themes: [
        { id: 'default', name: '默认主题', desc: '经典紫色调', color: '#6366f1' },
        { id: 'dark', name: '深色模式', desc: '护眼暗色系', color: '#1e293b' },
        { id: 'fresh', name: '清新主题', desc: '青绿自然风', color: '#14b8a6' },
        { id: 'warm', name: '暖色主题', desc: '橙红活力风', color: '#f97316' }
    ],
    
    init() {
        // 从 localStorage 读取保存的主题
        const savedTheme = localStorage.getItem('app-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        }
        
        // 创建主题面板 DOM
        this.createPanel();
        
        // 绑定事件
        this.bindEvents();
    },
    
    createPanel() {
        // 检查面板是否已存在
        if (document.getElementById('themePanelOverlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'themePanelOverlay';
        overlay.className = 'theme-panel-overlay';
        
        const themeCards = this.themes.map(theme => `
            <div class="theme-card ${theme.id === this.currentTheme ? 'active' : ''}" 
                 data-theme="${theme.id}" 
                 onclick="ThemePanel.selectTheme('${theme.id}')">
                <div class="theme-card-preview"></div>
                <div class="theme-card-name">${theme.name}</div>
                <div class="theme-card-desc">${theme.desc}</div>
            </div>
        `).join('');
        
        overlay.innerHTML = `
            <div class="theme-panel">
                <div class="theme-panel-header">
                    <h3 class="theme-panel-title">选择主题风格</h3>
                    <button class="theme-panel-close" onclick="ThemePanel.close()">×</button>
                </div>
                <div class="theme-grid">
                    ${themeCards}
                </div>
                <div class="theme-panel-footer">
                    <button class="theme-btn theme-btn-secondary" onclick="ThemePanel.close()">取消</button>
                    <button class="theme-btn theme-btn-primary" onclick="ThemePanel.confirmTheme()">确认切换</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },
    
    bindEvents() {
        // 点击遮罩层关闭面板
        const overlay = document.getElementById('themePanelOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
        
        // ESC 键关闭面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    },
    
    open() {
        this.createPanel();
        const overlay = document.getElementById('themePanelOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    close() {
        const overlay = document.getElementById('themePanelOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // 恢复当前主题选中状态
        setTimeout(() => {
            this.updateActiveCard(this.currentTheme);
        }, 300);
    },
    
    selectTheme(themeId) {
        // 更新选中状态
        this.updateActiveCard(themeId);
        
        // 实时预览主题
        this.applyTheme(themeId);
    },
    
    updateActiveCard(themeId) {
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.theme === themeId) {
                card.classList.add('active');
            }
        });
    },
    
    applyTheme(themeId) {
        const html = document.documentElement;
        
        // 移除所有主题属性
        html.removeAttribute('data-theme');
        
        // 应用新主题（默认主题不需要 data-theme）
        if (themeId !== 'default') {
            html.setAttribute('data-theme', themeId);
        }
        
        // 保存到 localStorage
        localStorage.setItem('app-theme', themeId);
        this.currentTheme = themeId;
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: themeId } 
        }));
    },
    
    confirmTheme() {
        // 获取当前选中的主题
        const activeCard = document.querySelector('.theme-card.active');
        if (activeCard) {
            const themeId = activeCard.dataset.theme;
            this.applyTheme(themeId);
        }
        this.close();
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    UserDropdown.init();
    ThemePanel.init();
});

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TreeSidebar, FilterSection, DataTable, Pagination, Utils, UserDropdown, ThemePanel };
}
