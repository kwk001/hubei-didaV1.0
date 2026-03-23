/**
 * 教师端/学生端用户菜单组件
 * 适用于教师端和学生端页面
 */
(function() {
    'use strict';

    // 组件样式
    const styles = `
        /* 教师端/学生端用户菜单样式 */
        .user-menu-teacher-component {
            position: relative;
            display: inline-block;
        }

        .user-menu-teacher-trigger {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            color: #333;
        }

        .user-menu-teacher-trigger:hover {
            background: #f5f5f5;
            border-color: #1890ff;
        }

        .user-menu-teacher-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 12px;
        }

        .user-menu-teacher-name {
            font-weight: 500;
            white-space: nowrap;
        }

        .user-menu-teacher-arrow {
            font-size: 12px;
            color: #999;
            transition: transform 0.3s ease;
        }

        .user-menu-teacher-component.active .user-menu-teacher-arrow {
            transform: rotate(180deg);
        }

        .user-menu-teacher-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 160px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
            border: 1px solid #e8e8e8;
        }

        .user-menu-teacher-component.active .user-menu-teacher-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .user-menu-teacher-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            color: #333;
        }

        .user-menu-teacher-item:hover {
            background: #f5f5f5;
            color: #1890ff;
        }

        .user-menu-teacher-item:first-child {
            border-radius: 8px 8px 0 0;
        }

        .user-menu-teacher-item:last-child {
            border-radius: 0 0 8px 8px;
        }

        .user-menu-teacher-divider {
            height: 1px;
            background: #e8e8e8;
            margin: 0;
        }

        .user-menu-teacher-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
        }

        /* 深色主题适配 */
        body[data-theme="dark"] .user-menu-teacher-trigger {
            background: #1f1f1f;
            border-color: #434343;
            color: #fff;
        }

        body[data-theme="dark"] .user-menu-teacher-trigger:hover {
            background: #2a2a2a;
            border-color: #1890ff;
        }

        body[data-theme="dark"] .user-menu-teacher-dropdown {
            background: #1f1f1f;
            border-color: #434343;
        }

        body[data-theme="dark"] .user-menu-teacher-item {
            color: #fff;
        }

        body[data-theme="dark"] .user-menu-teacher-item:hover {
            background: #2a2a2a;
        }

        body[data-theme="dark"] .user-menu-teacher-divider {
            background: #434343;
        }
    `;

    // 添加样式到页面
    function addStyles() {
        if (!document.getElementById('user-menu-teacher-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'user-menu-teacher-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }

    // 获取用户信息
    function getUserInfo() {
        const container = document.getElementById('user-menu-teacher-container');
        const dataRole = container ? container.dataset.role : null;
        
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsed = JSON.parse(userInfo);
                return {
                    name: parsed.name || parsed.username || '用户',
                    role: dataRole || parsed.role || 'teacher'
                };
            } catch (e) {
                console.error('解析用户信息失败:', e);
            }
        }
        // 根据data-role属性或默认返回
        const defaultRole = dataRole || 'teacher';
        const defaultName = defaultRole === 'student' ? '李明' : '张老师';
        return { name: defaultName, role: defaultRole };
    }

    // 渲染组件
    function renderComponent() {
        const container = document.getElementById('user-menu-teacher-container');
        if (!container) return;

        const userInfo = getUserInfo();
        const roleIcon = userInfo.role === 'student' ? '👨‍🎓' : '👨‍🏫';

        container.innerHTML = `
            <div class="user-menu-teacher-component" id="userMenuTeacherComponent">
                <div class="user-menu-teacher-trigger" onclick="UserMenuTeacherComponent.toggle()">
                    <div class="user-menu-teacher-avatar">${roleIcon}</div>
                    <span class="user-menu-teacher-name">${userInfo.name}</span>
                    <span class="user-menu-teacher-arrow">▼</span>
                </div>
                <div class="user-menu-teacher-dropdown">
                    <div class="user-menu-teacher-item" onclick="UserMenuTeacherComponent.changePassword()">
                        <span class="user-menu-teacher-icon">🔐</span>
                        <span>修改密码</span>
                    </div>
                    <div class="user-menu-teacher-item" onclick="UserMenuTeacherComponent.switchTheme()">
                        <span class="user-menu-teacher-icon">🎨</span>
                        <span>切换主题</span>
                    </div>
                    <div class="user-menu-teacher-divider"></div>
                    <div class="user-menu-teacher-item" onclick="UserMenuTeacherComponent.logout()">
                        <span class="user-menu-teacher-icon">🚪</span>
                        <span>退出登录</span>
                    </div>
                </div>
            </div>
        `;

        // 添加点击外部关闭事件
        document.addEventListener('click', function(e) {
            const component = document.getElementById('userMenuTeacherComponent');
            if (component && !component.contains(e.target)) {
                component.classList.remove('active');
            }
        });
    }

    // 组件公共方法
    window.UserMenuTeacherComponent = {
        // 切换下拉菜单
        toggle: function() {
            const component = document.getElementById('userMenuTeacherComponent');
            if (component) {
                component.classList.toggle('active');
            }
        },

        // 修改密码
        changePassword: function() {
            this.closeDropdown();
            if (typeof window.changePassword === 'function') {
                window.changePassword();
            } else {
                alert('修改密码功能开发中...');
            }
        },

        // 切换主题
        switchTheme: function() {
            this.closeDropdown();
            if (typeof window.toggleTheme === 'function') {
                window.toggleTheme();
            } else if (typeof window.switchTheme === 'function') {
                window.switchTheme();
            } else {
                // 默认主题切换逻辑
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                alert('已切换到' + (newTheme === 'dark' ? '深色' : '浅色') + '主题');
            }
        },

        // 退出登录
        logout: function() {
            this.closeDropdown();
            if (confirm('确定要退出登录吗？')) {
                // 清除登录状态
                localStorage.removeItem('userToken');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('iBodaoUser');
                sessionStorage.clear();

                // 跳转到登录页
                window.location.href = './教学实训平台_登录.html';
            }
        },

        // 关闭下拉菜单
        closeDropdown: function() {
            const component = document.getElementById('userMenuTeacherComponent');
            if (component) {
                component.classList.remove('active');
            }
        },

        // 更新用户名
        updateUsername: function(name) {
            const container = document.getElementById('user-menu-teacher-container');
            if (container) {
                container.dataset.username = name;
                renderComponent();
            }
        },

        // 重新渲染
        refresh: function() {
            renderComponent();
        }
    };

    // 初始化
    function init() {
        addStyles();
        renderComponent();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
