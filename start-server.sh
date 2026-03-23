#!/bin/bash

# 教学实训平台原型系统 - 启动服务脚本
# 用法: ./start-server.sh [端口号]

# 设置默认端口
PORT=${1:-8080}

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 项目目录
PROJECT_DIR="$SCRIPT_DIR/kaiwu_dida/kaiwu-app/jiaoxue/kuangjjia/prototype"

# 检查目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "错误: 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

# 切换到项目目录
cd "$PROJECT_DIR"

echo "=========================================="
echo "  教学实训平台原型系统 - HTTP服务器"
echo "=========================================="
echo ""
echo "正在启动服务器..."
echo "服务目录: $PROJECT_DIR"
echo "访问地址: http://localhost:$PORT"
echo ""
echo "常用页面链接:"
echo "  • 登录页:    http://localhost:$PORT/教学实训平台_登录.html"
echo "  • 首页:      http://localhost:$PORT/index.html"
echo "  • 教务管理端: http://localhost:$PORT/教学实训平台_教务管理端.html"
echo "  • 教师端:    http://localhost:$PORT/教学实训平台_教师端.html"
echo "  • 学生端:    http://localhost:$PORT/教学实训平台_学生端.html"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "=========================================="
echo ""

# 启动 Python HTTP 服务器
python3 -m http.server $PORT
