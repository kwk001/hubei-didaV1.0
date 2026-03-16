---
name: requirement-preprocessor
name_chn: 需求预处理器
description: Converts raw requirements (text, files, directories) into structured JSON with inferred business hierarchy (domain→module→feature). Generates execution plans for downstream processing. Use when user provides initial requirements, unstructured descriptions, or asks to "analyze requirements", "structure requirements", "prepare requirements". Output inferred-requirements.json feeds into lowcode-generator or requirement-analyzer.
license: MIT
allowed-tools:
  - Read
  - Write
  - Glob
  - Bash
---

# 需求预处理器 (Requirement Preprocessor)

## 概述

需求预处理器通过 `kagent-req-infer` 命令将各种输入转换为结构化的需求层次信息。

**核心能力**：
- 智能识别多种输入类型（文本、文件、目录）
- 自动推断业务层次结构（业务领域 → 功能模块 → 功能特性）
- 生成标准化的 `inferred-requirements.json` 输出
- 支持 LLM 智能推断和规则推断两种模式

## 快速开始

```bash
# 文本输入
kagent-req-infer "库位管理，用于管理仓库库位信息" -p "$PROJECT_DIR" -o test-output

# 文件输入
kagent-req-infer -f ./requirements.md -p "$PROJECT_DIR" -o wms-requirements

# 批量处理（LLM 智能模式，高准确度）
kagent-req-infer -d ./requirements/ -p "$PROJECT_DIR" -o wms-analysis

# 批量处理（规则模式，速度快）
kagent-req-infer -d ./requirements/ -p "$PROJECT_DIR" -o wms-analysis --no-llm

# 使用附加 prompt 指令（强调特定分析重点）
kagent-req-infer -f ./requirements.md -p "$PROJECT_DIR" -o wms --prompt "重点分析数据关系和业务流程"
```

## 命令格式

```bash
# 基本格式 - 支持文本、文件、目录三种输入方式
kagent-req-infer [文本] -p <项目路径> -o <输出目录> [选项]
kagent-req-infer -f <文件路径> -p <项目路径> -o <输出目录> [选项]
kagent-req-infer -d <目录路径> -p <项目路径> -o <输出目录> [选项]
```

### 关键参数

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `-p, --project-dir` | 项目根目录（必需） | 无 | `-p "$PROJECT_DIR"` |
| `<文本>` | 直接输入需求文本 | - | `"库位管理模块"` |
| `-f, --file` | 需求文件路径 | - | `-f requirements.md` |
| `-d, --dir` | 需求目录路径 | - | `-d ./requirements/` |
| `-o, --output` | 输出子目录名称 | 自动生成 | `-o wms-analysis` |
| `--no-llm` | 禁用 LLM 推断，仅使用规则 | 使用 LLM | `--no-llm` |
| `--prompt` | 附加的 prompt 指令 | 无 | `--prompt "重点分析数据关系"` |
| `-v, --verbose` | 显示详细日志 | 简洁输出 | `-v` |

**输出说明**：
- 所有输出都保存在 `<project-dir>/analyzer-work/<output-dir>/` 目录下
- 主要输出文件：`inferred-requirements.json`（自包含，包含完整需求内容）
- 辅助输出文件：`analysis.md`（人类可读的分析报告）

## 工作流程

### 在工作流中的位置

```
用户输入 → requirement-preprocessor → inferred-requirements.json
                                              ↓
                                    ┌─────────┴─────────┐
                                    ↓                   ↓
                         requirement-analyzer    lowcode-generator
                         （详细需求分析）           （直接生成代码）
```

### 后续技能选择

- **lowcode-generator**: 直接生成代码（推荐，快速原型）
- **requirement-analyzer**: 生成详细需求文档（正式项目）
- **schema-generator**: 仅需数据模型设计（可选）

## 技能执行流程

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: 识别输入模式（文本/文件/目录）
- [ ] Step 2: 构建 kagent-req-infer 命令
- [ ] Step 3: 执行命令生成 inferred-requirements.json
- [ ] Step 4: 验证输出文件并读取路径
- [ ] Step 5: 提供后续技能建议
```

### Step 1: 识别输入模式

**输入来源**：用户直接提供的需求内容

根据用户请求识别输入类型：
- **文本输入**：用户直接描述需求，没有提到文件路径
  - 示例：用户说"分析库位管理需求"
  - 命令：`kagent-req-infer "库位管理需求" -p "$PROJECT_DIR" -o <output-dir>`

- **文件输入**：用户提供单个需求文件路径
  - 示例：用户说"分析 requirements.md 文件"
  - 命令：`kagent-req-infer -f requirements.md -p "$PROJECT_DIR" -o <output-dir>`

- **目录输入（批量）**：用户提供需求文件目录
  - 示例：用户说"批量分析 ./requirements/ 目录"
  - 命令：`kagent-req-infer -d ./requirements/ -p "$PROJECT_DIR" -o <output-dir>`
  - 加速：添加 `--no-llm` 使用规则推断（适用于标准化目录结构）

### Step 2: 构建命令

**可选：使用 --prompt 参数**（当需要强调特定分析重点时）：
- 用于添加额外的分析要求或约束
- 示例场景：
  - "重点分析数据关系"
  - "强调业务流程的顺序性"
  - "注意权限和安全相关需求"

基本命令模板：
```bash
# 文本模式
kagent-req-infer "<需求文本>" -p "$PROJECT_DIR" -o <output-name>

# 文件模式
kagent-req-infer -f <文件路径> -p "$PROJECT_DIR" -o <output-name>

# 目录模式（LLM 智能推断，高准确度）
kagent-req-infer -d <目录路径> -p "$PROJECT_DIR" -o <output-name>

# 目录模式（规则推断，速度快，适用于标准化目录结构）
kagent-req-infer -d <目录路径> -p "$PROJECT_DIR" -o <output-name> --no-llm

# 使用附加 prompt 指令（添加特定分析要求）
kagent-req-infer -f <文件路径> -p "$PROJECT_DIR" -o <output-name> --prompt "重点分析数据关系和业务流程"
```

**输出目录命名建议**：
- 使用业务领域名称，如 `wms-analysis`, `order-system` 等
- 如果未指定 `-o`，系统会自动生成目录名

### Step 3: 执行命令

使用 Bash 工具执行构建的命令。

**重要**：由于该命令可能需要较长时间运行（特别是目录批量模式或使用 LLM 时），建议：
1. 使用 `run_in_background: true` 参数以后台方式运行命令
2. 在命令运行期间，每隔 30 秒使用 BashOutput 工具检查一次命令状态
3. 向用户报告当前进度（例如："正在推断层次结构..."、"已处理 X 个文件..."）

**命令执行示例**：
```bash
# 使用 Bash 工具，设置 run_in_background: true
kagent-req-infer -d <目录路径> -p "$PROJECT_DIR" -o <output-name> -v
```

**状态监控流程**：
1. 记录返回的 shell_id
2. 每隔 30 秒调用 BashOutput 工具检查进度
3. 将输出中的关键信息（如 "Inferring...", "Processing...", "Analyzing..."）报告给用户
4. 直到命令完成（状态变为 completed）

**预期输出**：
- 命令会在控制台输出推断进度
- 最终生成 `inferred-requirements.json` 文件

### Step 4: 验证输出并记录路径

**检查文件是否生成**：
```bash
<project-dir>/analyzer-work/<output-dir>/inferred-requirements.json
```

**记录完整路径**：将此路径记录下来，后续技能需要使用这个文件作为输入。

**示例路径**：
- `./analyzer-work/wms-analysis/inferred-requirements.json`
- `./analyzer-work/order-system/inferred-requirements.json`

**输出内容说明**：
- `inferred-requirements.json` 是**自包含**的，包含所有需求的完整内容
- 后续技能（requirement-analyzer, lowcode-generator）可直接使用此文件
- 无需再访问原始需求文件

### Step 5: 提供后续技能建议

**生成的 `inferred-requirements.json` 可以传递给以下技能**：

1. **lowcode-generator（推荐）**：
   - 用途：直接生成可运行的低代码页面
   - 命令：`kagent-generator batch <inferred-requirements.json路径> --project-dir "$PROJECT_DIR"`
   - 适用：快速原型、标准 CRUD、完整应用开发

2. **requirement-analyzer**：
   - 用途：生成详细的需求文档（7个标准章节）
   - 命令：`kagent-analyzer batch <inferred-requirements.json路径> --project-dir "$PROJECT_DIR"`
   - 适用：正式项目、团队协作、文档存档

根据用户需求推荐：
- 如果用户想"快速看到效果"、"生成页面" → 使用 lowcode-generator
- 如果用户需要"详细文档"、"需求评审" → 使用 requirement-analyzer

## 输出文件

- **inferred-requirements.json**: 结构化需求数据（自包含，完整内容）
- **analysis.md**: 人类可读的分析报告

输出位置: `<project-dir>/analyzer-work/<output-dir>/`

**重要**: `inferred-requirements.json` 包含完整需求内容，后续工具无需访问原始文档。

## 详细参考

- **输入模式详解**: See [reference/input-modes.md](reference/input-modes.md)
- **输出格式说明**: See [reference/output-format.md](reference/output-format.md)
- **最佳实践**: See [reference/best-practices.md](reference/best-practices.md)
- **常见问题**: See [reference/faq.md](reference/faq.md)
- **kagent-req-infer 命令文档**: See [reference/kagent-req-infer.md](reference/kagent-req-infer.md)

## 后续技能

- `requirement-analyzer/SKILL.md` - 生成详细需求文档
- `lowcode-generator/SKILL.md` - 直接生成代码
- `schema-generator/SKILL.md` - 生成数据模型
