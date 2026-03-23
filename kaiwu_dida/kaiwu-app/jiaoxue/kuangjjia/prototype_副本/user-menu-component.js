/**
 * 用户菜单组件加载器
 * User Menu Component Loader
 * 
 * 使用方法：
 * 1. 在页面中引入此脚本：<script src="./user-menu-component.js"></script>
 * 2. 在需要显示用户菜单的位置添加：<div id="user-menu-container"></div>
 * 3. 可选：设置自定义用户名 data-username="自定义名称"
 */

(function() {
    'use strict';

    // 组件配置
    const config = {
        cssPath: './user-menu-component.css',
        defaultUsername: '教务管理员'
    };

    // 加载 CSS 样式
    function loadStyles() {
        if (document.querySelector('link[href*="user-menu-component.css"]')) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = config.cssPath;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    // 获取用户名
    function getUsername() {
        // 从 localStorage 获取
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                if (user.name || user.username) {
                    return user.name || user.username;
                }
            } catch (e) {
                console.warn('解析用户信息失败:', e);
            }
        }

        // 从容器 data 属性获取
        const container = document.getElementById('user-menu-container');
        if (container && container.dataset.username) {
            return container.dataset.username;
        }

        return config.defaultUsername;
    }

    // 渲染组件
    function renderComponent() {
        const container = document.getElementById('user-menu-container');
        if (!container) {
            console.warn('未找到用户菜单容器 #user-menu-container');
            return;
        }

        const username = getUsername();

        container.innerHTML = `
            <div class="user-menu-component">
                <div class="user-menu-trigger">
                    <div class="user-avatar">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="4"></circle>
                            <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                        </svg>
                    </div>
                    <span class="user-greeting">欢迎您，<span>${username}</span></span>
                    <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="user-dropdown">
                    <button class="dropdown-item" onclick="UserMenuComponent.changePassword()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        修改密码
                    </button>
                    <button class="dropdown-item" onclick="UserMenuComponent.toggleTheme()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                        </svg>
                        主题风格设置
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" onclick="UserMenuComponent.logout()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        退出登录
                    </button>
                </div>
            </div>
        `;
    }

    // 组件公共方法
    window.UserMenuComponent = {
        // 修改密码
        changePassword: function() {
            // 检查页面是否已有 changePassword 函数
            if (typeof window.changePassword === 'function') {
                window.changePassword();
            } else {
                alert('修改密码功能开发中...');
            }
        },

        // 切换主题
        toggleTheme: function() {
            // 检查页面是否已有 toggleTheme 函数
            if (typeof window.toggleTheme === 'function') {
                window.toggleTheme();
            } else {
                alert('主题切换功能开发中...');
            }
        },

        // 退出登录
        logout: function() {
            if (confirm('确定要退出登录吗？')) {
                // 清除登录状态
                localStorage.removeItem('userToken');
                localStorage.removeItem('userInfo');
                sessionStorage.clear();
                
                // 跳转到登录页
                window.location.href = './教学实训平台_登录.html';
            }
        },

        // 更新用户名
        updateUsername: function(name) {
            const container = document.getElementById('user-menu-container');
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
        loadStyles()
            .then(() => {
                renderComponent();
                console.log('用户菜单组件加载成功');
            })
            .catch(err => {
                console.error('用户菜单组件加载失败:', err);
                // 即使样式加载失败，也尝试渲染
                renderComponent();
            });
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
