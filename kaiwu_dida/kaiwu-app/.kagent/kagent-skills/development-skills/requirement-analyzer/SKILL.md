---
name: requirement-analyzer
name_chn: 需求分析器
description: Generates comprehensive requirement documents with 9 standard sections (business needs, scenarios, roles, data models, rules, UI design, interactions, mock data). Supports 4 input modes. Use when user needs detailed documentation, formal project specs, requirement reviews, or mentions "detailed requirements", "requirement document", "business analysis". Avoid for quick prototypes. Input from requirement-preprocessor or raw text.
license: MIT
allowed-tools:
  - Read
  - Write
  - Glob
  - Bash
---

# 需求分析器 (Requirement Analyzer)

## 概述

需求分析器通过 `kagent-analyzer` 命令生成结构化的需求定义文档（Markdown 格式），包含 7 个标准章节。

**核心能力**：
- 生成完整的需求定义文档（7个标准章节）
- 支持单个需求分析和批量处理
- 从 `inferred-requirements.json` 读取需求列表
- 自动按层次结构（domain/module/feature）组织输出

## 快速开始

```bash
# 文本输入
kagent-analyzer "用户管理模块需求" --project-dir "$PROJECT_DIR"

# 文件输入
kagent-analyzer --project-dir "$PROJECT_DIR" -f ./requirements.md -o my-feature

# 批量处理
kagent-analyzer batch ./analyzer-work/wms/inferred-requirements.json --project-dir "$PROJECT_DIR"

# 批量处理（带过滤）
kagent-analyzer batch ./analyzer-work/wms/inferred-requirements.json --project-dir "$PROJECT_DIR" --domain "仓库管理"
```

## 命令格式

```bash
# generate 模式（单个需求）- 为单个需求生成详细文档
kagent-analyzer [generate] [输入] --project-dir <路径> [选项]

# batch 模式（批量处理）- 基于 inferred-requirements.json 批量生成文档
kagent-analyzer batch <inferred-requirements.json路径> --project-dir <路径> [选项]
```

### 关键参数

#### generate 模式（单个需求）

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `--project-dir` | 项目根目录（必需） | 无 | `--project-dir "$PROJECT_DIR"` |
| `<需求文本>` | 直接输入需求描述 | - | `"用户管理模块"` |
| `-f, --file` | 需求文件路径 | - | `-f requirement.md` |
| `--file-section` | 指定文件中的特定章节 | - | `--file-section "用户管理"` |
| `-o, --output` | 输出子目录名称 | 自动生成 | `-o my-feature` |
| `-p, --prompt` | 附加的 prompt 指令 | 无 | `-p "重点关注安全性"` |
| `-v, --verbose` | 显示详细日志 | 简洁输出 | `-v` |

#### batch 模式（批量处理）

**输入文件来源**：`inferred-requirements.json` 通常由 `requirement-preprocessor` 技能生成，位于 `<project-dir>/analyzer-work/<output-dir>/inferred-requirements.json`

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `<json文件>` | inferred-requirements.json 路径（必需） | - | `./analyzer-work/wms/inferred-requirements.json` |
| `--project-dir` | 项目根目录（必需） | 无 | `--project-dir "$PROJECT_DIR"` |
| `--domain` | 按业务领域过滤 | 处理全部 | `--domain "仓库管理"` |
| `--module` | 按功能模块过滤 | 处理全部 | `--module "入库管理"` |
| `--range` | 按章节范围过滤 | 处理全部 | `--range "1.1.3-1.1.5"` |
| `-v, --verbose` | 显示详细日志 | 简洁输出 | `-v` |

**输出说明**：
- generate 模式输出：`<project-dir>/analyzer-work/<output-dir>/requirement.md`
- batch 模式输出：按层次结构组织，`<project-dir>/analyzer-work/<domain>/<module>/<feature>/requirement.md`

## 工作流程

### 在工作流中的位置

```
requirement-preprocessor
    ↓
    inferred-requirements.json
    ↓
requirement-analyzer ← 你在这里
    ↓
    详细需求文档（Markdown）
    ↓
lowcode-generator
```

### 使用时机

#### ✅ 适用场景

- **正式项目开发**: 需要完整的需求文档作为开发依据
- **团队协作**: 需要需求评审、多人协作的场景
- **文档存档**: 需要长期维护的项目，需要详细文档记录
- **复杂业务**: 业务规则复杂，需要详细说明的场景
- **客户交付**: 需要交付需求文档给客户的项目

#### ❌ 不适用场景

- **快速原型**: 需要快速验证想法，不需要详细文档
- **已有详细文档**: 已经有完善的需求文档，不需要重复生成
- **简单功能**: 功能非常简单，直接生成代码更高效
- **个人项目**: 个人开发，不需要正式文档的场景

## 技能执行流程

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: 识别输入模式和数据来源
- [ ] Step 2: 构建 kagent-analyzer 命令
- [ ] Step 3: 执行命令生成需求文档
- [ ] Step 4: 验证输出文件并列出生成的文档
- [ ] Step 5: 提供后续技能建议
```

### Step 1: 识别输入模式和数据来源

**判断输入来源**：

1. **来自 requirement-preprocessor 的输出（推荐）**：
   - 用户之前运行过 requirement-preprocessor
   - 存在 `inferred-requirements.json` 文件
   - **使用 batch 模式**

2. **用户直接提供的需求**：
   - 用户没有运行 preprocessor
   - 直接提供文本、文件或章节
   - **使用 generate 模式**

**识别具体模式**：

- **Batch 模式**：用户提到"批量处理"或提供 `inferred-requirements.json` 路径
  - 输入示例："分析 ./analyzer-work/wms/inferred-requirements.json"
  - 命令：`kagent-analyzer batch <json路径> --project-dir "$PROJECT_DIR"`

- **File + Section 模式**：用户提供文件路径和特定章节名
  - 输入示例："分析 requirements.md 中的用户管理部分"
  - 命令：`kagent-analyzer generate -f requirements.md --file-section "用户管理" --project-dir "$PROJECT_DIR"`

- **File 模式**：用户只提供文件路径
  - 输入示例："分析 requirements.md 文件"
  - 命令：`kagent-analyzer generate -f requirements.md --project-dir "$PROJECT_DIR"`

- **Text 模式**：用户直接描述需求
  - 输入示例："用户管理模块需求"
  - 命令：`kagent-analyzer generate "用户管理模块需求" --project-dir "$PROJECT_DIR"`

### Step 2: 构建命令

**Batch 模式命令模板**（推荐）：
```bash
kagent-analyzer batch <inferred-requirements.json路径> --project-dir "$PROJECT_DIR"

# 可选：添加过滤器
kagent-analyzer batch <json路径> --project-dir "$PROJECT_DIR" --domain "仓库管理"
kagent-analyzer batch <json路径> --project-dir "$PROJECT_DIR" --range "1.1.1-1.1.5"
```

**Generate 模式命令模板**：
```bash
# 文本输入
kagent-analyzer generate "<需求文本>" --project-dir "$PROJECT_DIR" -o <output-name>

# 文件输入
kagent-analyzer generate -f <文件路径> --project-dir "$PROJECT_DIR" -o <output-name>

# 文件+章节
kagent-analyzer generate -f <文件路径> --file-section "<章节名>" --project-dir "$PROJECT_DIR" -o <output-name>
```

### Step 3: 执行命令

使用 Bash 工具执行构建的命令。

**重要**：由于该命令可能需要较长时间运行（特别是 batch 模式），建议：
1. 使用 `run_in_background: true` 参数以后台方式运行命令
2. 在命令运行期间，每隔 30 秒使用 BashOutput 工具检查一次命令状态
3. 向用户报告当前进度（例如："正在处理第 X/Y 个需求..."）

**命令执行示例**：
```bash
# 使用 Bash 工具，设置 run_in_background: true
kagent-analyzer batch <json路径> --project-dir "$PROJECT_DIR" -v
```

**状态监控流程**：
1. 记录返回的 shell_id
2. 每隔 30 秒调用 BashOutput 工具检查进度
3. 将输出中的关键信息（如 "Processing X/Y"、"Generating..."）报告给用户
4. 直到命令完成（状态变为 completed）

**预期输出**：
- 命令会在控制台输出文档生成进度
- 每个需求都会生成一个 `requirement.md` 文件
- Batch 模式会显示批量处理进度（如 "Processing 1/10"）

### Step 4: 验证输出并列出生成的文档

**检查输出目录**：

- **Generate 模式**：
  ```bash
  <project-dir>/analyzer-work/<output-dir>/requirement.md
  ```

- **Batch 模式**：
  ```bash
  <project-dir>/analyzer-work/<domain>/<module>/<feature>/requirement.md
  ```

**列出生成的文档**：
使用 Glob 或 Bash 列出所有生成的 requirement.md 文件，向用户展示生成结果。

示例：
```bash
find ./analyzer-work -name "requirement.md" -type f
```

**记录输出目录**：如果用户后续需要基于这些文档生成代码，需要知道这些文档的位置。

### Step 5: 提供后续技能建议

**生成的需求文档可以传递给以下技能**：

1. **lowcode-generator（推荐）**：
   - 用途：基于需求文档生成完整的低代码页面
   - 命令：`kagent-generator generate -f <requirement.md路径> --project-dir "$PROJECT_DIR"`
   - 适用：需要快速看到可运行的页面效果

2. **schema-generator（可选）**：
   - 用途：仅生成数据模型，不生成 UI
   - 命令：`kagent-schema analyze <requirement.md路径> -p .`
   - 适用：需要先设计数据模型，再开发 UI

根据用户需求推荐：
- 如果用户想"生成页面"、"看到效果" → 使用 lowcode-generator
- 如果用户只需要"数据库设计"、"表结构" → 使用 schema-generator

## 输出文件

**generate 模式**:
- `<project-dir>/analyzer-work/<output-dir>/requirement.md`

**batch 模式**:
- `<project-dir>/analyzer-work/<domain>/<module>/<feature>/requirement.md`
- `<project-dir>/analyzer-work/batch-report-<timestamp>.json`

生成的需求文档包含 7 个标准章节：
1. 需求概述
2. 功能需求
3. 非功能需求
4. 用户界面要求
5. 数据要求
6. 约束条件
7. 验收标准

## 详细参考

- **输入模式详解**: See [reference/input-modes.md](reference/input-modes.md)
- **输出格式说明**: See [reference/output-format.md](reference/output-format.md)
- **过滤器使用**: See [reference/filters.md](reference/filters.md)
- **最佳实践**: See [reference/best-practices.md](reference/best-practices.md)
- **常见问题**: See [reference/faq.md](reference/faq.md)
- **kagent-analyzer 命令文档**: See [reference/kagent-analyzer.md](reference/kagent-analyzer.md)

## 后续技能

- `lowcode-generator/SKILL.md` - 生成低代码应用
- `schema-generator/SKILL.md` - 生成数据模型（可选）
