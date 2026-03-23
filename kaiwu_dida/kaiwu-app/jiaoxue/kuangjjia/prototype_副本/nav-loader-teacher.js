/**
 * 教师端导航组件加载器
 * 自动加载并初始化教师端导航菜单
 */

(function() {
  'use strict';

  // 配置
  const config = {
    navComponentUrl: './nav-component-teacher.html',
    navStylesUrl: './nav-styles.css',
    bodyClass: 'has-nav-sidebar'
  };

  // 初始化导航
  function initNavigation() {
    // 检查是否已加载
    if (document.getElementById('nav-container')) {
      return;
    }

    // 创建导航容器
    const navContainer = document.createElement('div');
    navContainer.id = 'nav-container';
    document.body.insertBefore(navContainer, document.body.firstChild);

    // 加载导航组件
    loadNavComponent();

    // 添加 body 类
    document.body.classList.add(config.bodyClass);
  }

  // 加载导航组件
  function loadNavComponent() {
    fetch(config.navComponentUrl + '?v=1')
      .then(response => {
        if (!response.ok) {
          throw new Error('导航组件加载失败');
        }
        return response.text();
      })
      .then(html => {
        const navContainer = document.getElementById('nav-container');
        if (navContainer) {
          navContainer.innerHTML = html;
          initNavBehavior();
          highlightCurrentPage();
        }
      })
      .catch(error => {
        console.error('导航组件加载错误:', error);
      });
  }

  // 初始化导航行为
  function initNavBehavior() {
    // 折叠/展开功能
    const sectionHeaders = document.querySelectorAll('.nav-section-header');
    sectionHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);

        const content = document.getElementById(this.getAttribute('aria-controls'));
        if (content) {
          content.style.display = isExpanded ? 'none' : 'block';
        }

        // 旋转箭头
        const arrow = this.querySelector('.section-arrow');
        if (arrow) {
          arrow.style.transform = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
        }
      });
    });

    // 搜索功能
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
          const text = item.textContent.toLowerCase();
          const section = item.closest('.nav-section');

          if (text.includes(query)) {
            item.style.display = 'flex';
            if (section) {
              section.style.display = 'block';
            }
          } else {
            item.style.display = 'none';
          }
        });
      });

      // 键盘快捷键
      document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }
  }

  // 高亮当前页面
  function highlightCurrentPage() {
    const currentPage = decodeURIComponent(window.location.pathname.split('/').pop());
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href) {
        const pageName = decodeURIComponent(href.split('/').pop());
        if (pageName === currentPage) {
          item.classList.add('active');
          // 展开父级菜单
          const section = item.closest('.nav-section-content');
          if (section) {
            section.style.display = 'block';
            const header = document.querySelector(`[aria-controls="${section.id}"]`);
            if (header) {
              header.setAttribute('aria-expanded', 'true');
            }
          }
        }
      }
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
