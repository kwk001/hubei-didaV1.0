---
name: schema-generator
name_chn: Schema 生成器
description: Generates database schema definitions (tables, fields, types, validations) only, without UI or interaction logic. Use when user explicitly asks for "data model", "database schema", "table structure", "API data structure", or needs complex multi-table relationships. Avoid when user wants complete pages (use lowcode-generator instead). Optional skill lowcode-generator already handles schemas for most cases.
license: MIT
allowed-tools:
  - Read
  - Write
  - Glob
  - Bash
---

# Schema 生成器 (Schema Generator)

## 概述

Schema 生成器通过 `kagent-schema` 命令生成数据库 Schema，使用 AI 识别实体、字段、关系。

**核心能力**：
- 自动识别实体、字段、关系
- 生成数据模型和 ER 图
- 支持 MySQL、PostgreSQL、MongoDB
- 输出 DDL 语句或 ORM Schema

**重要提示**: 这是**可选技能**，大多数情况下 `lowcode-generator` 已包含 schema 生成。只在需要**仅生成数据模型**或**复杂数据关系设计**时使用。

## 快速开始

```bash
# MySQL (默认)
kagent-schema analyze "创建订单管理系统，包含客户、订单、订单明细"

# PostgreSQL
kagent-schema analyze ./requirements.md -d postgresql

# MongoDB
kagent-schema analyze ./requirements.md -d mongodb -o "产品管理"

# Quick 模式（控制台输出）
kagent-schema quick "产品管理：产品名称、价格、库存"
```

## 命令格式

```bash
# analyze 模式（完整分析）- 生成完整的数据模型文件
kagent-schema analyze <input> [选项]

# quick 模式（快速输出）- 在控制台直接输出，不保存文件
kagent-schema quick <requirement> [选项]
```

### 关键参数

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `<input>` | 需求文本或文件路径（必需） | 无 | `"订单管理"` 或 `./requirements.md` |
| `-p, --project-dir` | 项目根目录 | `.` | `-p "$PROJECT_DIR"` |
| `-o, --output-dir` | 输出子目录名称 | 自动生成 | `-o "订单管理/数据模型"` |
| `-d, --database` | 数据库类型 | mysql | `-d mysql` / `postgresql` / `mongodb` |
| `-m, --model` | AI 模型 | 默认模型 | `-m qwen3-coder-plus` |
| `--prompt` | 附加 prompt 指令 | 无 | `--prompt "使用软删除"` |
| `--verbose` | 显示详细日志 | 简洁输出 | `--verbose` |

**输出说明**：
- analyze 模式输出：`<project-dir>/schema-work/<output-dir>/`，包含 data-model.json、schema.sql 等
- quick 模式输出：控制台直接显示，不保存文件

## 使用时机

### ✅ 适用场景

- **仅需数据模型**: 只需要数据库表结构，不需要 UI
- **复杂数据关系**: 多表关联、复杂的数据模型设计
- **API 设计**: 需要定义数据结构用于 API 接口
- **数据设计优先**: 先设计数据模型，再设计 UI

### ❌ 不适用场景（使用 lowcode-generator）

- **直接生成完整页面**: 需要 UI + 数据 + 交互
- **标准 CRUD**: 简单增删改查，不需要单独设计数据模型
- **快速原型**: lowcode-generator 已内置数据模型生成
- **已有数据模型**: 不需要重新生成

## 技能执行流程

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: 验证用户是否只需数据模型
- [ ] Step 2: 识别数据库类型和输入来源
- [ ] Step 3: 构建 kagent-schema 命令
- [ ] Step 4: 执行命令生成数据模型
- [ ] Step 5: 验证输出文件并展示结构
- [ ] Step 6: 提供后续技能建议
```

### Step 1: 验证用户是否只需数据模型

**关键判断**：确认用户只需要数据模型，不需要完整页面。

**询问用户（如果不确定）**：
- "您需要完整的可运行页面，还是只需要数据库表结构？"
- 如果用户需要完整页面 → **建议使用 lowcode-generator**
- 如果用户只需要数据模型 → 继续使用本技能

**明确适用场景**：
- ✅ "只需要数据库设计"、"只要表结构"
- ✅ "设计复杂的数据关系"、"多表关联"
- ❌ "生成页面"、"完整应用"（应使用 lowcode-generator）

### Step 2: 识别数据库类型和输入来源

**数据库类型识别**：

- **MySQL（默认）**：用户没有指定数据库类型
  - 命令：`kagent-schema analyze <input> -p "$PROJECT_DIR"`

- **PostgreSQL**：用户明确提到 PostgreSQL
  - 命令：`kagent-schema analyze <input> -p "$PROJECT_DIR" -d postgresql`

- **MongoDB**：用户明确提到 MongoDB 或文档数据库
  - 命令：`kagent-schema analyze <input> -p "$PROJECT_DIR" -d mongodb`

**输入来源识别**：

1. **来自 requirement-analyzer 的输出**：
   - 用户之前运行过 requirement-analyzer
   - 存在 `requirement.md` 文件
   - 路径示例：`./analyzer-work/my-feature/requirement.md`
   - 命令：`kagent-schema analyze ./analyzer-work/my-feature/requirement.md -p "$PROJECT_DIR"`

2. **用户直接提供文件**：
   - 用户提供需求文件路径
   - 命令：`kagent-schema analyze <file路径> -p "$PROJECT_DIR"`

3. **用户直接描述需求**：
   - 用户直接说明需要哪些数据表和字段
   - 命令：`kagent-schema analyze "<需求描述>" -p "$PROJECT_DIR"`

### Step 3: 构建命令

**Analyze 模式命令模板**（推荐）：
```bash
# 基本用法（MySQL）
kagent-schema analyze "<需求描述>" -p "$PROJECT_DIR" -o "<输出目录>"

# 文件输入
kagent-schema analyze ./analyzer-work/my-feature/requirement.md -p "$PROJECT_DIR"

# PostgreSQL
kagent-schema analyze "<需求描述>" -p "$PROJECT_DIR" -d postgresql

# MongoDB
kagent-schema analyze "<需求描述>" -p "$PROJECT_DIR" -d mongodb

# 添加特殊要求
kagent-schema analyze "<需求描述>" -p "$PROJECT_DIR" --prompt "使用软删除"
```

**Quick 模式命令模板**（快速预览）：
```bash
# 快速查看数据模型（不保存文件）
kagent-schema quick "产品管理：产品名称、价格、库存"
```

**选择模式**：
- 如果用户只是想"快速看一下数据结构" → 使用 quick 模式
- 如果用户需要保存数据模型文件 → 使用 analyze 模式

### Step 4: 执行命令

使用 Bash 工具执行构建的命令。

**重要**：由于该命令可能需要较长时间运行（特别是 analyze 模式处理复杂需求时），建议：
1. 使用 `run_in_background: true` 参数以后台方式运行命令
2. 在命令运行期间，每隔 30 秒使用 BashOutput 工具检查一次命令状态
3. 向用户报告当前进度（例如："正在识别实体..."、"生成数据模型..."）

**命令执行示例**：
```bash
# 使用 Bash 工具，设置 run_in_background: true
kagent-schema analyze <input> -p "$PROJECT_DIR" -o "<输出目录>" --verbose
```

**状态监控流程**：
1. 记录返回的 shell_id
2. 每隔 30 秒调用 BashOutput 工具检查进度
3. 将输出中的关键信息（如 "Recognizing entities...", "Analyzing relationships...", "Generating..."）报告给用户
4. 直到命令完成（状态变为 completed）

**预期输出**：
- Analyze 模式：会显示数据模型生成进度，最终输出文件路径
- Quick 模式：直接在控制台显示 DDL 语句和数据模型 JSON

### Step 5: 验证输出并展示结构

**Analyze 模式 - 检查输出目录**：
```
<project-dir>/schema-work/<output-dir>/
├── data-model.json      # 数据模型 JSON（通用格式）
├── schema.sql           # DDL 语句（MySQL/PostgreSQL）
└── schema.js            # Schema 定义（MongoDB）
```

**列出生成的文件**：
```bash
# 查看生成的文件
ls -la ./schema-work/<output-dir>/

# 查看 data-model.json 内容（可选）
cat ./schema-work/<output-dir>/data-model.json
```

**Quick 模式 - 直接展示输出**：
将控制台输出的 DDL 语句展示给用户。

**记录输出路径**：如果生成了文件，记录路径以便后续使用。

### Step 6: 提供后续技能建议

**生成的数据模型可以传递给以下技能**：

1. **lowcode-generator（推荐）**：
   - 用途：基于数据模型生成完整的 CRUD 页面
   - 命令：`kagent-generator generate -f ./schema-work/<output-dir>/data-model.json --project-dir "$PROJECT_DIR"`
   - 适用：需要快速生成可运行的页面

2. **手动实现**：
   - 用途：开发者根据 schema.sql 或 schema.js 手动创建数据库表
   - 步骤：
     1. 复制 schema.sql 内容
     2. 在数据库管理工具中执行 SQL
     3. 手动编写前端 UI 代码

**使用建议**：
- 如果用户说"接下来生成页面" → 使用 lowcode-generator
- 如果用户说"我自己实现" → 提供 schema 文件路径即可

**注意事项**：
- lowcode-generator 已内置数据模型生成功能
- 大多数情况下不需要单独使用 schema-generator
- 只在需要"仅生成数据模型"或"复杂数据关系设计"时使用

## 输出文件

**analyze 模式**:
- `<project-dir>/schema-work/<output-dir>/data-model.json`
- `<project-dir>/schema-work/<output-dir>/schema.sql` (MySQL/PostgreSQL)
- `<project-dir>/schema-work/<output-dir>/schema.js` (MongoDB)

**quick 模式**:
- 控制台直接输出，不保存文件

## 详细参考

- **数据库类型说明**: See [reference/database-types.md](reference/database-types.md)
- **输出格式说明**: See [reference/output-format.md](reference/output-format.md)
- **使用场景指南**: See [reference/use-cases.md](reference/use-cases.md)
- **常见问题**: See [reference/faq.md](reference/faq.md)
- **kagent-schema 命令文档**: See [reference/kagent-schema.md](reference/kagent-schema.md)

## 后续技能

- `lowcode-generator/SKILL.md` - 使用生成的 schema 创建完整应用
