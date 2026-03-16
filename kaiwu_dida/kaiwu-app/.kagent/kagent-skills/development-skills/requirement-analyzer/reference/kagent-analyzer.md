# kagent-analyzer

需求分析工具 - 分析需求并生成结构化需求文档

## 概述

`kagent-analyzer` 用于分析需求内容，生成结构化的需求定义文档（Markdown 格式）。支持单个需求分析和批量处理。

## 命令模式

### 1. generate 模式（默认）

单个需求分析，生成一份需求文档。

#### 使用方式

```bash
kagent-analyzer [generate] [输入] [选项]
```

### 2. batch 模式

批量需求分析，从 `inferred-requirements.json` 读取需求列表，批量生成需求文档。

#### 使用方式

```bash
kagent-analyzer batch <json文件> [选项]
```

## 参数说明

### generate 模式参数

#### 必需参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--project-dir <path>` | 项目目录路径 | `--project-dir .` |

#### 输入方式（至少选择一种）

| 参数 | 说明 | 适用场景 |
|------|------|----------|
| `<需求文本>` | 直接输入需求描述 | 简短需求（建议 < 500 字符） |
| `-f, --file <path>` | 需求文件路径 | 详细需求文档 |

#### 可选参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--file-section <name>` | 指定文件中的特定章节（需与 `-f` 配合） | - |
| `-o, --output <path>` | 输出路径（目录或文件） | 自动生成 |
| `-p, --prompt <text>` | 附加的 prompt 指令 | - |
| `-v, --verbose` | 显示详细日志 | false |
| `--debug` | 显示调试日志 | false |
| `-h, --help` | 显示帮助信息 | - |

### batch 模式参数

#### 必需参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `<json文件>` | inferred-requirements.json 文件路径 | `./analyzer-work/wms/inferred-requirements.json` |
| `--project-dir <path>` | 项目目录路径 | `--project-dir .` |

#### 可选参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-o, --output <path>` | 输出目录前缀 | - |
| `-v, --verbose` | 显示详细日志 | false |
| `--debug` | 显示调试日志 | false |

#### 过滤选项

| 参数 | 说明 | 示例 |
|------|------|------|
| `--domain <name>` | 按业务领域过滤 | `--domain "仓库管理"` |
| `--module <name>` | 按功能模块过滤 | `--module "入库管理"` |
| `--range <ranges>` | 按章节范围过滤 | `--range "1.1.3-1.1.5,1.1.8"` |

## 输入文件格式

### generate 模式输入

#### 文本输入

```bash
kagent-analyzer "用户管理模块，包含用户增删改查功能" --project-dir .
```

#### 文件输入（Markdown）

```markdown
# 用户管理模块

## 功能概述
提供用户的基本管理功能

## 功能列表
1. 用户注册
2. 用户登录
3. 用户信息修改
4. 用户删除

## 详细需求
...
```

### batch 模式输入

**文件：** `inferred-requirements.json`（由 kagent-req-infer 生成）

**格式：** 参见 [kagent-req-infer 文档](./kagent-req-infer.md#输出文件)

## 输出文件

### generate 模式输出

**文件位置：**
```
<project-dir>/analyzer-work/<output-dir>/requirement.md
```

**文件名规则：**
- 自动根据需求标题生成（如 `用户管理_需求文档.md`）
- 如文件已存在，自动添加数字后缀（`_1`, `_2`, ...）

### batch 模式输出

**文件位置：**
```
<project-dir>/analyzer-work/<domain>/<module>/<feature>/requirement.md
```

**示例：**
```
analyzer-work/
├── 仓库管理/
│   ├── 库位管理/
│   │   └── 库位维护/
│   │       └── 库位管理_需求文档.md
│   └── 库存管理/
│       └── 库存查询/
│           └── 库存查询_需求文档.md
└── batch-report-2025-11-02T22-00-00.json
```

**批处理报告：**
```
<project-dir>/analyzer-work/batch-report-<timestamp>.json
```

### 输出文档格式

生成的需求文档包含以下章节：

```markdown
# [需求标题] 需求定义文档

## 1. 需求概述

## 2. 功能需求

## 3. 非功能需求

## 4. 用户界面要求

## 5. 数据要求

## 6. 约束条件

## 7. 验收标准
```

### 批处理报告格式

```json
{
  "timestamp": "2025-11-02T22:00:00.000Z",
  "duration": 45000,
  "input": "./analyzer-work/wms/inferred-requirements.json",
  "filters": {
    "domain": "仓库管理",
    "module": null,
    "range": "1.1.1-1.1.5"
  },
  "summary": {
    "total": 20,
    "processed": 5,
    "successful": 4,
    "failed": 1,
    "skipped": 15
  },
  "items": [
    {
      "requirement": { ... },
      "hierarchy": { ... },
      "outputDir": "...",
      "outputFile": "...",
      "success": true,
      "duration": 8500
    }
  ]
}
```

## 使用示例

### 示例 1：单个需求分析（直接输入）

```bash
kagent-analyzer "用户管理模块需求" --project-dir .
```

### 示例 2：单个需求分析（从文件读取）

```bash
kagent-analyzer --project-dir . -f ./requirements.md -o my-feature
```

### 示例 3：分析文件的特定章节

```bash
kagent-analyzer --project-dir . \
  -f ./requirements.md \
  --file-section "用户管理模块"
```

### 示例 4：指定完整输出路径

```bash
kagent-analyzer --project-dir . \
  -f ./requirements.md \
  --file-section "入库单" \
  -o "仓库管理/入库管理/入库单.md"
```

### 示例 5：批量分析（完整流程）

```bash
# 步骤 1: 使用 req-infer 推断需求层次结构
kagent-req-infer -d ./requirements/ -p . -o wms-analysis

# 步骤 2: 使用 analyzer batch 批量分析需求
kagent-analyzer batch ./analyzer-work/wms-analysis/inferred-requirements.json \
  --project-dir .
```

### 示例 6：批量分析（带过滤）

```bash
# 按业务领域过滤
kagent-analyzer batch ./inferred-requirements.json \
  --project-dir . \
  --domain "仓库管理"

# 按章节范围过滤
kagent-analyzer batch ./inferred-requirements.json \
  --project-dir . \
  --range "1.1.1-1.1.5"

# 组合过滤
kagent-analyzer batch ./inferred-requirements.json \
  --project-dir . \
  -o batch-v1 \
  --domain "仓库管理" \
  --range "1.1.1-1.1.5"
```

## 工作原理

### generate 模式

1. **读取需求**：从文本、文件或文件章节读取需求内容
2. **LLM 分析**：使用大语言模型分析需求，生成结构化文档
3. **生成文档**：按标准模板生成 Markdown 格式的需求文档
4. **保存文件**：保存到指定位置

### batch 模式

1. **读取 JSON**：读取 `inferred-requirements.json`
2. **应用过滤器**：根据 domain/module/range 过滤需求
3. **批量处理**：
   - 逐个分析需求
   - 按层次结构组织输出目录
   - 错误时继续处理（不中断）
4. **生成报告**：生成批处理报告

## 注意事项

### 输入限制

- **文本输入**：建议少于 500 字符，超过建议使用文件输入
- **文件格式**：支持 Markdown、纯文本
- **章节提取**：需要明确的章节标题（如 `## 用户管理模块`）

### 输出路径

**目录模式：**
```bash
-o "my-feature"
# 输出到: analyzer-work/my-feature/requirement.md
```

**文件模式：**
```bash
-o "仓库管理/入库管理/入库单.md"
# 输出到: analyzer-work/仓库管理/入库管理/入库单.md
```

### batch 模式特性

- **自包含性**：JSON 文件包含完整需求内容，无需原始文档
- **错误恢复**：单个需求失败不影响后续处理
- **层次化输出**：自动按 domain/module/feature 组织目录
- **详细报告**：生成 JSON 格式的批处理报告

### 性能考虑

- **LLM 调用**：每个需求需要调用 LLM，耗时较长
- **批量处理**：建议使用过滤器减少处理数量
- **并发限制**：当前为串行处理，未来可能支持并发

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ANALYZER_WORK_DIR` | 分析工作目录名称 | `analyzer-work` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `LOG_FILE` | 日志文件路径 | 可选 |

## 常见问题

### Q: 为什么 batch 模式需要 inferred-requirements.json？

A: batch 模式设计用于处理经过层次结构推断的需求。`inferred-requirements.json` 包含：
- 完整的需求内容
- 业务层次结构（domain/module/feature）
- 置信度评分
这些信息用于自动组织输出目录和过滤需求。

### Q: generate 模式和 batch 模式的区别？

A:
- **generate**：处理单个需求，输出单个文件，适合快速分析
- **batch**：处理多个需求，自动组织输出，适合批量处理

### Q: 如何自定义需求文档模板？

A: 当前版本使用固定模板。未来版本计划支持自定义模板。

### Q: 批处理失败时会中断吗？

A: 不会。batch 模式设计为容错处理，单个需求失败时会记录错误并继续处理下一个需求。所有错误信息都会记录在批处理报告中。

## 相关命令

- **kagent-req-infer**：推断需求层次结构，生成 inferred-requirements.json
- **kagent-generator**：使用需求文档生成代码
- **kagent-refiner**：精炼和优化生成的代码

## 完整工作流

```bash
# 1. 推断需求层次结构
kagent-req-infer -d ./requirements/ -p . -o wms

# 2. 批量生成需求文档
kagent-analyzer batch ./analyzer-work/wms/inferred-requirements.json -p .

# 3. 批量生成代码
kagent-generator batch ./analyzer-work/wms/inferred-requirements.json -p .

# 4. 精炼代码（可选）
kagent-refiner batch ./generator-work/... -p .
```

## 版本历史

- **v1.0.0**：初始版本，支持单个需求分析
- **v1.1.0**：添加 batch 模式，支持批量处理
- **v1.2.0**：优化帮助文档，改进输出格式
