#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新教师端页面导航菜单
"""

import os
import re
import glob

# 新的导航菜单HTML（标准格式）
NEW_NAV_HTML = '''    <!-- 侧边栏 -->
    <div class="sidebar">
        <div class="logo"><i class="iconfont icon-gongzuotai"></i> 教学实训平台</div>

        <div class="menu-group">
            <div class="menu-title" onclick="toggleMenu(this)"><i class="iconfont icon-shouye"></i>工作台</div>
            <div class="menu-items">
                <div class="menu-item" onclick="window.location.href='./教学实训平台_教师端.html'">
                    <span><i class="iconfont icon-shouye"></i></span><span>首页概览</span>
                </div>
            </div>
        </div>

        <div class="menu-group">
            <div class="menu-title" onclick="toggleMenu(this)"><i class="iconfont icon-kechengguanli"></i>我的教学</div>
            <div class="menu-items">
                <div class="menu-item" onclick="window.location.href='./教师端_我的课程.html'">
                    <span><i class="iconfont icon-kechengguanli"></i></span><span>我的课程</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_专业教学课程.html'">
                    <span><i class="iconfont icon-zhuanyeguanli"></i></span><span>专业教学课程</span>
                </div>
            </div>
        </div>

        <div class="menu-group">
            <div class="menu-title" onclick="toggleMenu(this)"><i class="iconfont icon-shijuan"></i>考试管理</div>
            <div class="menu-items">
                <div class="menu-item" onclick="window.location.href='./教师端_试卷管理.html'">
                    <span><i class="iconfont icon-shijuan"></i></span><span>试卷管理</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_实训试卷库.html'">
                    <span><i class="iconfont icon-shixun"></i></span><span>实训试卷</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_试卷批阅.html'">
                    <span><i class="iconfont icon-shijuan"></i></span><span>试卷批阅</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_实训批阅.html'">
                    <span><i class="iconfont icon-shixun"></i></span><span>实训批阅</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_错题集库.html'">
                    <span><i class="iconfont icon-cuowu"></i></span><span>错题集</span>
                </div>
            </div>
        </div>

        <div class="menu-group">
            <div class="menu-title" onclick="toggleMenu(this)"><i class="iconfont icon-p008zhishiku"></i>知识库</div>
            <div class="menu-items">
                <div class="menu-item" onclick="window.location.href='./教师端_视频教材.html'">
                    <span><i class="iconfont icon-shipin"></i></span><span>视频教材</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_辅导教材.html'">
                    <span><i class="iconfont icon-jiaocai"></i></span><span>辅导教材</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_题库.html'">
                    <span><i class="iconfont icon-tiku"></i></span><span>普通题库</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_实训题库.html'">
                    <span><i class="iconfont icon-shixun"></i></span><span>实训题库</span>
                </div>
            </div>
        </div>

        <div class="menu-group">
            <div class="menu-title" onclick="toggleMenu(this)"><i class="iconfont icon-baobiao"></i>报表</div>
            <div class="menu-items">
                <div class="menu-item" onclick="window.location.href='./教师端_实训任务管理.html'">
                    <span><i class="iconfont icon-shixun"></i></span><span>实训任务管理</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./图表_成绩分析.html'">
                    <span><i class="iconfont icon-baobiao"></i></span><span>成绩分析</span>
                </div>
                <div class="menu-item" onclick="window.location.href='./教师端_学生任务总览.html'">
                    <span><i class="iconfont icon-renwu"></i></span><span>学生任务总览</span>
                </div>
            </div>
        </div>
    </div>'''

def update_navigation(file_path):
    """更新单个文件的导航菜单"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否包含教师端导航菜单特征
        if '教师端' not in file_path and '教学实训平台_教师端' not in file_path:
            return False, "不是教师端页面"

        # 匹配导航菜单部分（从 <!-- 侧边栏 --> 到 </div> 主内容区之前）
        pattern = r'(<!-- 侧边栏 -->\s*<div class="sidebar">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>)'

        # 使用更精确的模式来匹配整个sidebar
        sidebar_pattern = r'<div class="sidebar">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>'

        # 尝试匹配不同的sidebar结构
        patterns = [
            r'<!-- 侧边栏 -->\s*<div class="sidebar">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>',
            r'<div class="sidebar">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>',
            r'<div class="sidebar">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>',
        ]

        updated = False
        for pattern in patterns:
            match = re.search(pattern, content, re.DOTALL)
            if match:
                old_sidebar = match.group(0)
                # 替换为新的导航菜单
                new_sidebar = NEW_NAV_HTML
                content = content.replace(old_sidebar, new_sidebar)
                updated = True
                break

        if not updated:
            return False, "未找到导航菜单"

        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True, "更新成功"

    except Exception as e:
        return False, f"错误: {str(e)}"

def main():
    # 获取所有教师端HTML文件
    base_path = '/Users/apple/Desktop/文件/kaiwu_dida/kaiwu-app/教学管理/框架/prototype'
    teacher_files = glob.glob(os.path.join(base_path, '教师端_*.html'))
    teacher_files.append(os.path.join(base_path, '教学实训平台_教师端.html'))

    # 排除已经更新的文件
    exclude_files = [
        '教学实训平台_教师端.html',
        '教师端_我的课程.html',
        '教师端_专业教学课程.html'
    ]

    print(f"找到 {len(teacher_files)} 个教师端页面")
    print("开始批量更新...\n")

    success_count = 0
    fail_count = 0

    for file_path in sorted(teacher_files):
        file_name = os.path.basename(file_path)

        # 跳过已更新的文件
        if file_name in exclude_files:
            print(f"⏭️  跳过: {file_name} (已更新)")
            continue

        success, message = update_navigation(file_path)

        if success:
            print(f"✅ 成功: {file_name}")
            success_count += 1
        else:
            print(f"❌ 失败: {file_name} - {message}")
            fail_count += 1

    print(f"\n{'='*50}")
    print(f"更新完成: 成功 {success_count} 个, 失败 {fail_count} 个")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
