import csv
import os

# 确保目录存在
output_dir = "docs/教师端/基础配置/年级管理"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 定义数据
data = [
    ["一级目录", "二级目录", "页面名称", "功能点", "功能描述"],
    ["教师端", "基础配置", "年级管理", "查询列表", "支持按年级名称（模糊）、状态进行筛选查询；展示年级名称、状态、备注、创建时间等信息；支持分页展示。"],
    ["教师端", "基础配置", "年级管理", "新增年级", "点击新增按钮弹出抽屉；填写年级名称（必填）、状态（默认启用）、备注；支持表单校验。"],
    ["教师端", "基础配置", "年级管理", "编辑年级", "点击编辑按钮弹出抽屉；回显当前年级信息；支持修改年级名称、状态和备注。"],
    ["教师端", "基础配置", "年级管理", "删除年级", "点击删除按钮弹出二次确认框；确认后删除该年级数据。"],
    ["教师端", "基础配置", "年级管理", "状态管理", "列表展示年级状态（启用/停用），启用状态显示绿色Tag，停用状态显示红色Tag。"]
]

# 保存为 CSV (使用 UTF-8-SIG 编码以便 Excel 正确显示中文)
file_path = os.path.join(output_dir, "功能清单_年级管理.csv")
with open(file_path, mode='w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(data)

print(f"CSV file created at: {file_path}")
