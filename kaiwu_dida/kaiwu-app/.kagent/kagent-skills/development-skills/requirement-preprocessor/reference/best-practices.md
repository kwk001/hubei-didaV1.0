# 最佳实践

## Contents

- 需求文档格式
- 模式选择指南
- 错误处理
- 版本管理
- 典型工作流

---

## 需求文档格式

推荐使用标准化的 Markdown 格式：

```markdown
#### 1.1.1 功能名称
##### 功能分解
功能点列表
##### 详细描述
详细的功能描述
```

**关键要素**:
- 标题以 `####` 开头，包含章节号（如 `1.1.1`）
- 可选的子章节：`##### 功能分解`、`##### 详细描述` 等
- 每个需求之间用空行分隔

---

## 模式选择指南

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| 首次分析需求文档 | LLM 模式（默认） | 准确度高，建立基准 |
| 标准化需求文档 | 规则模式（`--no-llm`） | 速度快，成本低 |
| 快速原型验证 | 文本输入模式 | 最快，直接输入 |
| 大批量需求处理 | 规则模式 + `-y` | 自动化程度高 |

---

## 错误处理

### 命令执行检查

```bash
# 检查输出文件
ls -la <项目路径>/analyzer-work/<输出目录>/inferred-requirements.json

# 查看文件内容（可选）
cat <项目路径>/analyzer-work/<输出目录>/inferred-requirements.json | head -50
```

### 置信度验证

- 如果置信度低于 0.6，建议人工审核
- 检查命令执行结果和输出日志
- 验证 `inferred-requirements.json` 文件存在且格式正确

---

## 版本管理

### 保留历史版本

使用不同的 `-o` 参数保留历史版本：

```bash
# 版本 1
kagent-req-infer -d ./requirements/ -p "$PROJECT_DIR" -o wms-v1

# 版本 2
kagent-req-infer -d ./requirements/ -p "$PROJECT_DIR" -o wms-v2
```

### 版本控制建议

- 提交 `inferred-requirements.json` 到版本控制
- 记录分析时间戳和置信度信息
- 使用有意义的输出目录名称

---

## 典型工作流

### 快速原型流程

```
requirement-preprocessor → lowcode-generator
```

### 正式项目流程

```
requirement-preprocessor → requirement-analyzer → lowcode-generator
```

### 复杂项目流程

```
requirement-preprocessor → requirement-analyzer → schema-generator → lowcode-generator
```

---

## 性能考虑

- **LLM 模式**: 准确但较慢，适合首次分析
- **规则模式**: 快速但可能不准确，适合标准化文档
- **批量处理**: 建议使用 `-y` 跳过确认，提高自动化程度

---

## 与其他技能的协作

### 后续技能

- **lowcode-generator**: 直接使用 inferred-requirements.json 批量生成代码（推荐）
- **requirement-analyzer**: 使用 inferred-requirements.json 批量生成需求文档（正式项目）
- **schema-generator**: 从需求中提取数据模型（可选）

---

## 提高推断准确度

1. 使用 LLM 模式（不加 `--no-llm`）
2. 确保需求文档格式规范
3. 在需求标题中包含明确的章节号（如 1.1.1）
4. 提供详细的需求描述
