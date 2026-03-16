---
name: lowcode-generator
name_chn: 低代码生成器
description: Generates complete runnable lowcode pages (UI + data + interactions) using kagent-generator tool. Accepts any requirement format (text, JSON, documents). Use for quick prototyping, standard CRUD, complete applications, or when unsure which skill to use (default choice). User triggers "generate page", "create app", "lowcode", "快速生成", "页面开发". Final workflow step. Can work with or without preprocessor/analyzer outputs.
license: MIT
allowed-tools:
  - Read
  - Write
  - Glob
  - Bash
---

# 低代码生成器 (Lowcode Generator)

## 概述

低代码生成器通过 `kagent-generator` 命令自动生成完整的低代码应用，包括 React 组件、KaiwuFlex 配置、数据模型、Mock 数据和业务逻辑代码。

**核心能力**：
- 生成完整的可运行低代码应用（UI + 数据 + 交互）
- 支持单个需求生成和批量处理
- 从 `inferred-requirements.json` 读取需求列表
- 自动按层次结构（domain/module/feature）组织输出
- 内置数据模型生成功能

**重要提示**: 这是工作流的**最终步骤**，也是**默认选择**。如果不确定使用哪个技能，就使用本技能。

## 命令工具

本技能基于 **`kagent-generator`** 命令，详细文档参见 `kagent.ref/cli/docs/kagent-generator.md`。

### 命令格式

```bash
# generate 模式（单个需求）- 为单个需求生成完整页面
kagent-generator [generate] <需求> --project-dir "$PROJECT_DIR" --skip-confirm [选项]

# batch 模式（批量处理）- 基于 inferred-requirements.json 批量生成页面
kagent-generator batch <inferred-requirements.json路径> --project-dir "$PROJECT_DIR" --skip-confirm [选项]

# analyze 模式（分析设计图）- 从 UI 设计图生成页面
kagent-generator analyze <图片文件> --skip-confirm [选项]

# resume 模式（恢复任务）- 继续之前中断的任务
kagent-generator resume <threadId> --project-dir "$PROJECT_DIR" --skip-confirm [选项]
```

### 关键参数

#### generate 模式（单个需求生成）

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `<需求>` | 需求描述或文件路径（必需） | 无 | `"用户管理"` 或 `./requirement.md` |
| `--project-dir` | 项目根目录（必需） | 无 | `--project-dir "$PROJECT_DIR"` |
| `--skip-confirm` | 跳过交互式确认提示 | 需要确认 | `--skip-confirm` |
| `-f, --file` | 需求文件路径 | - | `-f requirement.md` |
| `-i, --image` | UI 设计图路径 | - | `-i design.png` |
| `-o, --output` | 输出子目录名称 | 自动生成 | `-o my-feature` |
| `--model` | AI 模型 | sonnet | `--model sonnet` |
| `--skip-design` | 跳过 UI 和架构设计阶段 | 不跳过 | `--skip-design` |
| `--no-mock` | 不生成 Mock 数据 | 生成 | `--no-mock` |
| `-p, --prompt` | 附加的 prompt 指令 | 无 | `-p "使用 Ant Design"` |
| `-v, --verbose` | 显示详细日志 | 简洁输出 | `-v` |

#### batch 模式（批量处理）

**输入文件来源**：
- `inferred-requirements.json` 通常由 `requirement-preprocessor` 技能生成
- 文件位置：`<project-dir>/inference-work/<output-dir>/inferred-requirements.json`
- **重要**：此文件是自包含的，包含所有需求的完整内容，无需访问原始需求文件

**如果没有 inferred-requirements.json**：
- 如果用户直接提供需求，不需要使用 batch 模式
- 应使用 generate 模式单个处理，或先运行 requirement-preprocessor

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `<json文件>` | inferred-requirements.json 路径（必需） | 无 | `./inference-work/wms/inferred-requirements.json` |
| `--project-dir` | 项目根目录（必需） | 无 | `--project-dir "$PROJECT_DIR"` |
| `--skip-confirm` | 跳过交互式确认提示 | 需要确认 | `--skip-confirm` |
| `-o, --output` | 输出目录前缀 | 自动生成 | `-o batch-v1` |
| `--skip-design` | 跳过 UI 和架构设计阶段 | 不跳过 | `--skip-design` |
| `--domain` | 按业务领域过滤 | 处理全部 | `--domain "仓库管理"` |
| `--module` | 按功能模块过滤 | 处理全部 | `--module "入库管理"` |
| `--range` | 按章节范围过滤 | 处理全部 | `--range "1.1.3-1.1.5,1.1.8"` |
| `-v, --verbose` | 显示详细日志 | 简洁输出 | `-v` |

**输出说明**：
- generate 模式输出：`<project-dir>/generator-work/<output-dir>/`，包含完整的组件、数据模型、服务等
- batch 模式输出：按层次结构组织，`<project-dir>/generator-work/<domain>/<module>/<feature>/`

## 工作流程

### 在工作流中的位置

```
用户需求
    ↓
requirement-preprocessor (可选)
    ↓
requirement-analyzer (可选)
    ↓
schema-generator (可选)
    ↓
lowcode-generator ← 你在这里（最终步骤）
```

### 使用时机

#### ✅ 适用场景（默认选择）

- **快速原型**: 快速验证想法，立即看到效果
- **标准 CRUD**: 简单的增删改查功能
- **完整应用**: 需要完整的可运行页面
- **不确定选择**: 不知道用哪个技能时的默认选择
- **任何需求格式**: 接受文本、文件、JSON 等任何格式

#### ❌ 不适用场景（极少）

- **仅需数据模型**: 只需要数据库 Schema，不需要 UI（使用 schema-generator）
- **仅需需求文档**: 只需要需求文档，不需要代码（使用 requirement-analyzer）

## 技能执行流程

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: 识别输入模式和数据来源
- [ ] Step 2: 构建 kagent-generator 命令
- [ ] Step 3: 添加可选参数优化生成
- [ ] Step 4: 执行命令生成低代码页面
- [ ] Step 5: 验证输出文件并展示结构
- [ ] Step 6: 提供使用指导
```

### Step 1: 识别输入模式和数据来源

**判断输入来源**：

1. **来自 requirement-preprocessor 的输出（批量处理）**：
   - 用户之前运行过 requirement-preprocessor
   - 存在 `inferred-requirements.json` 文件
   - 路径示例：`./inference-work/wms-analysis/inferred-requirements.json`
   - **使用 batch 模式**

2. **来自 requirement-analyzer 的输出（单个或批量）**：
   - 用户之前运行过 requirement-analyzer
   - 存在 `requirement.md` 文件
   - 路径示例：`./analyzer-work/my-feature/requirement.md`
   - **使用 generate 模式（-f 参数）**

3. **用户直接提供（最常见）**：
   - 用户直接描述需求，没有预处理
   - **使用 generate 模式**

**识别具体模式**：

- **Batch 模式**：用户提供 `inferred-requirements.json` 路径或要求批量处理
  - 输入示例："基于 ./inference-work/wms/inferred-requirements.json 生成页面"
  - 命令：`kagent-generator batch <json路径> --project-dir "$PROJECT_DIR" --skip-confirm`

- **File 模式**：用户提供需求文件路径（通常是 requirement.md）
  - 输入示例："基于 ./analyzer-work/user-mgmt/requirement.md 生成页面"
  - 命令：`kagent-generator generate -f <file路径> --project-dir "$PROJECT_DIR" --skip-confirm`

- **Image 模式**：用户提供 UI 设计图
  - 输入示例:"根据 design.png 生成页面"
  - 命令：`kagent-generator generate -i design.png --project-dir "$PROJECT_DIR" --skip-confirm`

- **Text 模式**：用户直接描述需求（最常见）
  - 输入示例："生成一个用户管理页面"
  - 命令：`kagent-generator generate "用户管理页面" --project-dir "$PROJECT_DIR" --skip-confirm`

### Step 2: 构建命令

**Batch 模式命令模板**（批量处理）：
```bash
# 基本用法
kagent-generator batch <inferred-requirements.json路径> --project-dir "$PROJECT_DIR" --skip-confirm

# 带过滤器（只处理特定域或模块）
kagent-generator batch <json路径> --project-dir "$PROJECT_DIR" --skip-confirm --domain "仓库管理"
kagent-generator batch <json路径> --project-dir "$PROJECT_DIR" --skip-confirm --range "1.1.1-1.1.5"
```

**Generate 模式命令模板**（单个需求）：
```bash
# 文本输入（最常见）
kagent-generator generate "用户管理页面" --project-dir "$PROJECT_DIR" --skip-confirm -o user-mgmt

# 文件输入（来自 requirement-analyzer）
kagent-generator generate -f ./analyzer-work/my-feature/requirement.md --project-dir "$PROJECT_DIR" --skip-confirm

# 图片输入（UI 设计图）
kagent-generator generate -i design.png --project-dir "$PROJECT_DIR" --skip-confirm -o my-ui
```

**默认目录说明**：
- 如果用户当前在项目根目录，使用 `--project-dir "$PROJECT_DIR"`
- 如果用户在子目录，需要指向项目根目录，如 `--project-dir "$PROJECT_DIR"./..`

### Step 3: 添加可选参数优化生成

根据用户需求，考虑添加以下参数：

**性能优化**：
- `--skip-design`：跳过 UI 设计和架构设计阶段，直接生成代码（更快）
  - 适用：用户已经有明确的 UI 设计或需要快速验证

**数据生成控制**：
- `--no-mock`：不生成 Mock 数据
  - 适用：用户已有真实数据源或不需要测试数据

**过滤器（仅 batch 模式）**：
- `--domain "业务领域名"`：只处理特定业务领域
- `--module "模块名"`：只处理特定功能模块
- `--range "1.1.1-1.1.5"`：只处理特定章节范围

**自定义指令**：
- `-p "附加指令"`：添加特定的生成要求
  - 示例：`-p "使用 Ant Design 组件库"`
  - 示例：`-p "表格需要支持导出 Excel"`

### Step 4: 执行命令

使用 Bash 工具执行构建的命令。

**重要**：由于该命令可能需要较长时间运行（特别是 batch 模式或复杂需求），建议：
1. 使用 `run_in_background: true` 参数以后台方式运行命令
2. 在命令运行期间，每隔 30 秒使用 BashOutput 工具检查一次命令状态
3. 向用户报告当前进度（例如："正在生成组件..."、"处理第 X/Y 个需求..."）

**命令执行示例**：
```bash
# 使用 Bash 工具，设置 run_in_background: true
kagent-generator batch <json路径> --project-dir "$PROJECT_DIR" --skip-confirm -v
```

**状态监控流程**：
1. 记录返回的 shell_id
2. 每隔 30 秒调用 BashOutput 工具检查进度
3. 将输出中的关键信息（如 "Generating...", "Processing X/Y", "Creating..."）报告给用户
4. 直到命令完成（状态变为 completed）

**预期输出**：
- 命令会输出生成进度（如 "Generating components..."）
- Batch 模式会显示批量处理进度（如 "Processing 1/10"）
- 最终会显示生成成功的消息和输出目录路径

### Step 5: 验证输出并展示结构

**检查输出目录**：

- **Generate 模式**：
  ```
  <project-dir>/generator-work/<output-dir>/
  ├── components/        # React 组件
  ├── schemas/           # KaiwuFlex 配置
  ├── models/            # 数据模型
  ├── services/          # API 服务
  ├── mock/              # Mock 数据
  └── utils/             # 工具函数
  ```

- **Batch 模式**：
  ```
  <project-dir>/generator-work/
  ├── <domain>/
  │   ├── <module>/
  │   │   ├── <feature>/
  │   │   │   ├── components/
  │   │   │   ├── schemas/
  │   │   │   └── ...
  ```

**列出生成的文件**：
使用 Glob 或 Bash 列出主要生成文件，向用户展示：
```bash
# 列出所有生成的 schema 文件
find ./generator-work -name "*.schema.json" -type f

# 列出所有生成的组件
find ./generator-work -name "*.tsx" -type f
```

**记录输出路径**：告诉用户生成文件的位置，便于后续使用。

### Step 6: 提供使用指导

**导入到低代码引擎**：
1. 在低代码引擎中打开"本地页面"面板
2. 选择生成的 schema 文件（*.schema.json）
3. 点击"导入"即可在设计器中查看和编辑

**测试生成的页面**：
1. 查看 mock/ 目录下的测试数据
2. 在设计器预览模式下测试交互功能
3. 检查组件的属性和事件绑定

**自定义和扩展**：
- Components：可以修改 React 组件代码
- Schemas：可以在设计器中调整布局和样式
- Services：可以替换 mock 服务为真实 API
- Models：可以扩展数据模型字段

**常见后续操作**：
- 如果需要调整样式 → 在设计器中修改 schema
- 如果需要调整逻辑 → 修改 services/ 和 utils/ 中的代码
- 如果需要连接真实 API → 替换 mock 数据为真实接口

## 详细参考

- **kagent-generator 命令文档**: See [reference/kagent-generator.md](reference/kagent-generator.md)

## 前置技能

- `requirement-preprocessor/SKILL.md` - 需求预处理
- `requirement-analyzer/SKILL.md` - 需求分析
- `schema-generator/SKILL.md` - 数据模型设计（可选）
