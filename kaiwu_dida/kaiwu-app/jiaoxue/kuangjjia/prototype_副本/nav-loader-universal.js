/**
 * 通用导航组件加载器
 * 支持动态配置加载不同的导航组件
 * 使用方式：
 *   1. 在 script 标签上添加 data-nav-type 属性指定导航类型
 *   2. 可选值：'admin'(教务端), 'teacher'(教师端), 'student'(学生端)
 *   3. 默认值：'admin'
 * 
 * 教师端和学生端将使用教务端的组件结构，但加载对应角色的菜单内容
 */
(function() {
  'use strict';

  // 获取当前脚本的路径和配置
  const scriptElement = document.currentScript;
  const scriptPath = scriptElement ? scriptElement.src : '';
  const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1) || './';
  
  // 从 data 属性获取导航类型
  const navType = scriptElement ? (scriptElement.dataset.navType || 'admin') : 'admin';
  
  // 导航组件配置 - 教师端和学生端也使用教务端组件结构
  const navConfigs = {
    admin: {
      component: 'nav-component-new.html',
      title: '教务管理系统',
      subtitle: '教务管理系统',
      homeLink: './教学实训平台_教务管理端.html'
    },
    teacher: {
      component: 'nav-component-new.html', // 使用教务端组件
      title: '教师端',
      subtitle: '教师端',
      homeLink: './教学实训平台_教师端.html',
      useTeacherMenu: true // 标记需要替换为教师菜单
    },
    student: {
      component: 'nav-component-new.html', // 使用教务端组件
      title: '学生端',
      subtitle: '学生端',
      homeLink: './教学实训平台_学生端.html',
      useStudentMenu: true // 标记需要替换为学生菜单
    }
  };
  
  const config = navConfigs[navType] || navConfigs.admin;
  
  // 组件 URL (添加时间戳防止缓存)
  const cacheBuster = '?v=' + new Date().getTime();
  const navComponentUrl = basePath + config.component + cacheBuster;
  const navStylesUrl = basePath + 'nav-styles.css' + cacheBuster;

  // 教师端菜单内容
  const teacherMenuHTML = `
    <!-- 工作台 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-workbench" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </span>
        <span class="section-title">工作台</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-workbench" role="menu">
        <a href="./教学实训平台_教师端.html" class="nav-item" data-page="teacher-home" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
          <span class="item-text">首页概览</span>
        </a>
      </div>
    </div>

    <!-- 我的教学 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-teaching" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </span>
        <span class="section-title">我的教学</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-teaching" role="menu">
        <a href="./教师端_我的课程.html" class="nav-item" data-page="teacher-courses" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </span>
          <span class="item-text">我的课程</span>
        </a>

      </div>
    </div>

    <!-- 考试管理 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-exam" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </span>
        <span class="section-title">考试管理</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-exam" role="menu">
        <a href="./教师端_试卷管理.html" class="nav-item" data-page="teacher-paper" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </span>
          <span class="item-text">普通任务</span>
        </a>
        <a href="./教师端_实训试卷库.html" class="nav-item" data-page="teacher-practice-paper" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </span>
          <span class="item-text">实训任务</span>
        </a>
        <a href="./教师端_综合试卷管理.html" class="nav-item" data-page="teacher-comprehensive-paper" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </span>
          <span class="item-text">综合试卷管理</span>
        </a>
        <a href="./教师端_试卷批阅.html" class="nav-item" data-page="teacher-grade" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </span>
          <span class="item-text">普通任务批阅</span>
        </a>
        <a href="./教师端_实训批阅.html" class="nav-item" data-page="teacher-practice-grade" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </span>
          <span class="item-text">实训任务批阅</span>
        </a>
        <a href="./教师端_试卷批阅_综合.html" class="nav-item" data-page="teacher-exam-review" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </span>
          <span class="item-text">试卷批阅</span>
        </a>
        <a href="./教师端_错题集库.html" class="nav-item" data-page="teacher-wrong" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            </svg>
          </span>
          <span class="item-text">错题集</span>
        </a>
      </div>
    </div>

    <!-- 知识库 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-knowledge" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </span>
        <span class="section-title">知识库</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-knowledge" role="menu">
        <a href="./教师端_视频教材.html" class="nav-item" data-page="teacher-video" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </span>
          <span class="item-text">视频教材</span>
        </a>
        <a href="./教师端_辅导教材.html" class="nav-item" data-page="teacher-material" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </span>
          <span class="item-text">辅导教材</span>
        </a>
        <a href="./教师端_题库.html" class="nav-item" data-page="teacher-question" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            </svg>
          </span>
          <span class="item-text">普通题目</span>
        </a>
        <a href="./教师端_实训题库.html" class="nav-item" data-page="teacher-practice-question" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </span>
          <span class="item-text">实训题库</span>
        </a>
      </div>
    </div>

    <!-- 生产管理 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-production" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </span>
        <span class="section-title">生产管理</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-production" role="menu">
        <a href="./教师端_生产工单管理_V2.html" class="nav-item" data-page="teacher-workorder" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
            </svg>
          </span>
          <span class="item-text">生产工单</span>
        </a>
        <a href="./教师端_排产策略管理.html" class="nav-item" data-page="teacher-scheduling" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span class="item-text">排产策略</span>
        </a>
        <a href="./教师端_项目模板管理.html" class="nav-item" data-page="teacher-project-template" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
          </span>
          <span class="item-text">项目模版</span>
        </a>
        <a href="./教师端_项目甘特图.html" class="nav-item" data-page="teacher-gantt" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </span>
          <span class="item-text">项目甘特图</span>
        </a>
        <a href="./教师端_项目看板.html" class="nav-item" data-page="teacher-kanban" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span class="item-text">项目看板</span>
        </a>
      </div>
    </div>

    <!-- 刀具管理 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-tool" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </span>
        <span class="section-title">刀具管理</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-tool" role="menu">
        <a href="./教师端_刀具类型管理.html" class="nav-item" data-page="teacher-tool-type" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </span>
          <span class="item-text">刀具类型</span>
        </a>
        <a href="./教师端_刀具档案管理.html" class="nav-item" data-page="teacher-tool-file" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
          </span>
          <span class="item-text">刀具档案</span>
        </a>
        <a href="./教师端_刀具BOM管理.html" class="nav-item" data-page="teacher-tool-bom" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </span>
          <span class="item-text">刀具BOM</span>
        </a>
        <a href="./教师端_刀具需求计划_教师.html" class="nav-item" data-page="teacher-tool-plan" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
            </svg>
          </span>
          <span class="item-text">刀具需求计划-教师</span>
        </a>
        <a href="./教师端_刀具需求计划_学生.html" class="nav-item" data-page="teacher-tool-plan-student" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          </span>
          <span class="item-text">刀具需求计划-学生</span>
        </a>
        <a href="./教师端_备刀任务单.html" class="nav-item" data-page="teacher-tool-task" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </span>
          <span class="item-text">备刀任务单</span>
        </a>
        <a href="./教师端_备刀任务单_刀具签还.html" class="nav-item" data-page="teacher-tool-return" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </span>
          <span class="item-text">刀具签还</span>
        </a>
        <a href="./教师端_刀具报废与申领.html" class="nav-item" data-page="teacher-tool-scrap" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            </svg>
          </span>
          <span class="item-text">刀具报废与申领</span>
        </a>
        <a href="./教师端_刀具更换.html" class="nav-item" data-page="teacher-tool-replace" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </span>
          <span class="item-text">刀具更换</span>
        </a>
        <a href="./教师端_刀具保养管理.html" class="nav-item" data-page="teacher-tool-maintain" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </span>
          <span class="item-text">刀具保养管理</span>
        </a>
        <a href="./教师端_刀具库存管理.html" class="nav-item" data-page="teacher-tool-stock" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </span>
          <span class="item-text">刀具库存</span>
        </a>
        <a href="./教师端_设备刀具库.html" class="nav-item" data-page="teacher-device-tool" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </span>
          <span class="item-text">设备刀具库</span>
        </a>
        <a href="./教师端_刀具实时定位.html" class="nav-item" data-page="teacher-tool-location" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
          <span class="item-text">刀具实时定位</span>
        </a>
        <a href="./教师端_刀具报废记录.html" class="nav-item" data-page="teacher-tool-scrap-record" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
          </span>
          <span class="item-text">刀具报废记录</span>
        </a>
        <a href="./教师端_刀具统计分析.html" class="nav-item" data-page="teacher-tool-analysis" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </span>
          <span class="item-text">刀具统计分析</span>
        </a>
      </div>
    </div>

    <!-- 报表 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-report" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </span>
        <span class="section-title">报表</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-report" role="menu">
        <a href="./教师端_报工数据校验.html" class="nav-item" data-page="teacher-report-check" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </span>
          <span class="item-text">报工数据校验</span>
        </a>
        <a href="./教师端_报警分类表.html" class="nav-item" data-page="teacher-alarm-category" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            </svg>
          </span>
          <span class="item-text">报警分类表</span>
        </a>
        <a href="./教师端_设备报警分析.html" class="nav-item" data-page="teacher-device-alarm" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </span>
          <span class="item-text">设备报警分析</span>
        </a>
        <a href="./教师端_设备稼动率监控.html" class="nav-item" data-page="teacher-device-oee" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span class="item-text">设备稼动率监控</span>
        </a>
        <a href="./教师端_设备数据采集看板.html" class="nav-item" data-page="teacher-device-data" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
          </span>
          <span class="item-text">设备数据采集看板</span>
        </a>
        <a href="./教师端_设备状态分析.html" class="nav-item" data-page="teacher-device-status" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </span>
          <span class="item-text">设备状态分析</span>
        </a>
        <a href="./教师端_设备OEE大屏.html" class="nav-item" data-page="teacher-device-oee-screen" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </span>
          <span class="item-text">设备OEE大屏</span>
        </a>
        <a href="./教师端_在途生产设备.html" class="nav-item" data-page="teacher-device-transit" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </span>
          <span class="item-text">在途生产设备</span>
        </a>
        <a href="./教师端_综合报表.html" class="nav-item" data-page="teacher-comprehensive-report" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </span>
          <span class="item-text">综合报表</span>
        </a>
      </div>
    </div>
  `;

  /**
   * 加载 CSS 样式
   */
  function loadStyles() {
    if (document.querySelector('link[href*="nav-styles.css"]')) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = navStylesUrl;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  /**
   * 替换品牌区域
   */
  function updateBrandArea(nav) {
    const brandLink = nav.querySelector('.brand-link');
    const brandSubtitle = nav.querySelector('.brand-subtitle');
    
    if (brandLink) {
      brandLink.setAttribute('href', config.homeLink);
      brandLink.setAttribute('aria-label', '返回' + config.title + '首页');
    }
    
    if (brandSubtitle) {
      brandSubtitle.textContent = config.subtitle;
    }
  }

  // 学生端菜单HTML
  const studentMenuHTML = `
    <!-- 工作台 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-workbench" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </span>
        <span class="section-title">工作台</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-workbench" role="menu">
        <a href="./学生端_我的课程.html" class="nav-item" data-page="student-courses" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
          <span class="item-text">我的课程</span>
        </a>
        <a href="./学生端_我的实训.html" class="nav-item" data-page="student-practice" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </span>
          <span class="item-text">我的实训任务</span>
        </a>
        <a href="./学生端_我的考试.html" class="nav-item" data-page="student-normal-task" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </span>
          <span class="item-text">我的普通任务</span>
        </a>
        <a href="./学生端_我的综合考试.html" class="nav-item" data-page="student-exam" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </span>
          <span class="item-text">我的考试</span>
        </a>
      </div>
    </div>

    <!-- 知识库 -->
    <div class="nav-section">
      <button class="nav-section-header" aria-expanded="true" aria-controls="menu-knowledge" type="button">
        <span class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </span>
        <span class="section-title">知识库</span>
        <svg class="section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="nav-section-content" id="menu-knowledge" role="menu">
        <a href="./学生端_工艺管理.html" class="nav-item" data-page="student-process" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </span>
          <span class="item-text">工艺管理</span>
        </a>
        <a href="./学生端_错题集.html" class="nav-item" data-page="student-wrong" role="menuitem">
          <span class="item-indicator"></span>
          <span class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </span>
          <span class="item-text">错题集</span>
        </a>
      </div>
    </div>
  `;

  /**
   * 替换菜单内容
   */
  function updateMenuContent(nav) {
    const navMenu = nav.querySelector('.nav-menu');
    if (!navMenu) return;

    if (config.useTeacherMenu) {
      // 替换为教师端菜单
      navMenu.innerHTML = teacherMenuHTML;
    } else if (config.useStudentMenu) {
      // 替换为学生端菜单
      navMenu.innerHTML = studentMenuHTML;
    }
  }

  /**
   * 展开所有设置了 aria-expanded="true" 的菜单项
   */
  function expandAllSections(nav) {
    const headers = nav.querySelectorAll('.nav-section-header[aria-expanded="true"]');
    headers.forEach(header => {
      const content = header.nextElementSibling;
      if (content && content.classList.contains('nav-section-content')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
      }
    });
  }

  /**
   * 更新底部信息
   */
  function updateFooter(nav) {
    const navFooter = nav.querySelector('.nav-footer');
    if (!navFooter) return;

    if (config.useTeacherMenu || config.useStudentMenu) {
      // 教师端和学生端显示用户信息而不是版本号
      navFooter.innerHTML = `
        <div class="nav-user">
          <div class="user-avatar">
            <span>${config.useTeacherMenu ? '教' : '学'}</span>
          </div>
          <div class="user-info">
            <span class="user-name">${config.useTeacherMenu ? '教师用户' : '学生用户'}</span>
            <span class="user-role">${config.subtitle}</span>
          </div>
        </div>
      `;
    }
  }

  /**
   * 加载导航组件
   */
  function loadNavigation() {
    // 查找或创建导航容器
    let navContainer = document.getElementById('nav-container');
    
    if (!navContainer) {
      // 如果页面没有 nav-container，创建一个
      navContainer = document.createElement('div');
      navContainer.id = 'nav-container';
      
      // 查找合适的插入位置（通常是 body 的第一个子元素）
      const body = document.body;
      if (body.firstChild) {
        body.insertBefore(navContainer, body.firstChild);
      } else {
        body.appendChild(navContainer);
      }
    }

    // 先加载样式
    loadStyles()
      .then(() => {
        // 然后加载 HTML 组件
        return fetch(navComponentUrl);
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('加载导航组件失败: ' + response.status);
        }
        return response.text();
      })
      .then(html => {
        // 提取 nav 元素和脚本
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const nav = doc.querySelector('.nav-sidebar');
        const scripts = doc.querySelectorAll('script');

        if (nav) {
          // 更新品牌区域
          updateBrandArea(nav);
          
          // 更新菜单内容（如果是教师端或学生端）
          updateMenuContent(nav);
          
          // 更新底部信息
          updateFooter(nav);
          
          // 展开所有设置了 aria-expanded="true" 的菜单项
          expandAllSections(nav);
          
          navContainer.innerHTML = '';
          navContainer.appendChild(nav.cloneNode(true));
        }

        // 执行组件中的脚本
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          document.body.appendChild(newScript);
        });

        // 触发加载完成事件
        document.dispatchEvent(new CustomEvent('navigationLoaded', { 
          detail: { navType: navType, title: config.title } 
        }));
        console.log('✓ 导航组件加载成功 [' + navType + ']');
      })
      .catch(error => {
        console.error('nav-loader: 加载导航组件出错:', error);
        navContainer.innerHTML = `
          <div style="
            padding: 20px;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            margin: 20px;
          ">
            <strong>导航加载失败</strong><br>
            请刷新页面重试，或联系管理员
          </div>
        `;
      });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavigation);
  } else {
    loadNavigation();
  }
})();
