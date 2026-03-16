import subprocess
import sys
import os

# 定义虚拟环境中的 python 路径
venv_python = os.path.join(os.getcwd(), ".venv", "bin", "python")

print(f"Testing MCP server launch with: {venv_python}")

try:
    # 尝试启动 MCP server
    # markitdown-mcp 通常通过 python -m markitdown_mcp 启动
    process = subprocess.Popen(
        [venv_python, "-m", "markitdown_mcp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    print("Successfully spawned process.")
    
    # 简单的握手或检查是否存活
    if process.poll() is None:
        print("Process is running.")
        process.terminate()
    else:
        print(f"Process exited immediately with code {process.returncode}")
        print("Stderr:", process.stderr.read())

except FileNotFoundError:
    print("Error: Python executable not found at expected path.")
except Exception as e:
    print(f"An error occurred: {e}")
