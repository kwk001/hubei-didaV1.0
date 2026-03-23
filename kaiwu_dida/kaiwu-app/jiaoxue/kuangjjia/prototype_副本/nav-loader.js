/**
 * 统一导航加载器
 * 动态加载 nav-component.html 到页面中
 */
(function() {
    'use strict';

    // 获取当前脚本的路径，用于确定 nav-component.html 的位置
    const scriptElement = document.currentScript;
    const scriptPath = scriptElement ? scriptElement.src : '';
    const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1) || './';
    
    // 导航组件的URL (添加时间戳防止缓存)
    const cacheBuster = '?v=' + new Date().getTime();
    const navComponentUrl = basePath + 'nav-component.html' + cacheBuster;

    /**
     * 加载导航组件
     */
    function loadNavigation() {
        // 查找导航容器
        const navContainer = document.getElementById('nav-container');
        
        if (!navContainer) {
            console.warn('nav-loader: 未找到 #nav-container 元素，请确保在页面中添加 <div id="nav-container"></div>');
            return;
        }

        // 使用 fetch 加载导航组件
        fetch(navComponentUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('加载导航组件失败: ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                // 将导航HTML插入容器
                navContainer.innerHTML = html;
                
                // 执行导航组件中的脚本
                executeScripts(navContainer);
                
                // 触发导航加载完成事件
                document.dispatchEvent(new CustomEvent('navigationLoaded'));
            })
            .catch(error => {
                console.error('nav-loader: 加载导航组件出错:', error);
                navContainer.innerHTML = '<div style="padding: 20px; color: #ef4444;">导航加载失败，请刷新页面重试</div>';
            });
    }

    /**
     * 执行导航组件中的脚本
     * @param {HTMLElement} container - 包含脚本的容器元素
     */
    function executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            
            // 复制所有属性
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // 复制脚本内容
            newScript.textContent = oldScript.textContent;
            
            // 替换旧脚本
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    // 页面加载完成后加载导航
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNavigation);
    } else {
        // DOM已加载，立即执行
        loadNavigation();
    }
})();
