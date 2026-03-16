# kagent-req-infer

需求推断工具 - 自动推断需求的层次结构（业务领域/功能模块/功能特性）

## 概述

`kagent-req-infer` 用于分析需求文档，自动推断其业务层次结构，并生成结构化的 JSON 输出。支持文本、单文件和批量目录扫描三种输入方式。

## 使用方式

### 基本语法

```bash
kagent-req-infer [文本] [选项]
```

### 输入方式

#### 方式一：文本输入

直接在命令行输入需求文本，适合快速测试。

```bash
kagent-req-infer "库位管理功能，支持增删改查" -p . -o output
```

#### 方式二：文件输入

从单个 Markdown 文件读取需求。

```bash
kagent-req-infer -f requirements.md -p . -o output
```

#### 方式三：目录智能处理（使用 LLM）

批量扫描目录下所有 .md 文件，使用 LLM 智能推断层次结构。

```bash
kagent-req-infer -d ./requirements/ -p . -o output
```

- **准确度**：高 (~95%)
- **速度**：较慢（每个需求调用 LLM）
- **适用场景**：需要高准确度的场景

#### 方式四：目录快速处理（规则推断）

批量扫描目录，仅使用规则和目录结构推断，不调用 LLM。

```bash
kagent-req-infer -d ./requirements/ -p . -o output --no-llm
```

- **准确度**：中等 (~70%)
- **速度**：快（不调用 LLM）
- **适用场景**：标准化的目录结构，快速批处理

## 参数说明

### 必需参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `-p, --project-dir <path>` | 项目根目录 | `-p .` 或 `--project-dir /path/to/project` |

### 输入参数（三选一）

| 参数 | 说明 | 适用场景 |
|------|------|----------|
| `[text]` | 直接输入需求文本 | 快速测试单个需求 |
| `-f, --file <path>` | 需求文件路径（.md） | 解析单个需求文档 |
| `-d, --dir <path>` | 需求目录路径 | 批量处理目录下所有 .md 文件 |

### 可选参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-o, --output-dir <dir>` | 输出子目录名称（相对于 INFERRER_WORK_DIR） | 自动生成 |
| `--no-llm` | 禁用 LLM（**仅在 `-d` 模式下有效**） | false（使用 LLM） |
| `--model <model>` | AI 模型名称 | `gpt-4` |
| `--temperature <temp>` | 生成温度 (0-1) | `0.3` |
| `--auto-number` | 自动分配 x.y.z 编号 | false |
| `-i, --interactive` | 交互模式（确认结果） | false |
| `--verbose` | 显示详细日志 | false |
| `--format <format>` | 输出格式: json\|gui\|template | `json` |
| `--prompt <text>` | 附加的 prompt 指令 | - |
| `-h, --help` | 显示帮助信息 | - |

### 重要说明

- `--no-llm` 参数**仅在目录模式（`-d`）下有效**
- 文本模式和文件模式**总是使用 LLM**，因为需要理解需求语义
- 如果在文本/文件模式下使用 `--no-llm`，会显示警告并忽略该选项

## 输入文件格式

### 需求文档格式（Markdown）

需求文档应遵循以下格式：

```markdown
#### 1.1.1 库位管理
##### 功能分解
增/删/改/查
##### 详细描述
用于登记仓库内各库位的信息，如托盘、货架位等，包含库位区域、库位编码等。

#### 1.1.2 物料信息管理
##### 功能分解
增/删/改/查
##### 详细描述
用于登记物料的基本信息，包括物料编码、物料名称、物料分类等。
```

**关键要素：**
- 标题以 `####` 开头，包含章节号（如 `1.1.1`）和需求名称
- 可选的子章节：`##### 功能分解`、`##### 详细描述` 等
- 每个需求之间用空行分隔

### 目录结构（simple-dir 模式）

对于 `--no-llm` 模式，工具会根据目录结构推断层次：

```
requirements/
├── 仓库管理/           # → domain (业务领域)
│   ├── 基础管理/       # → module (功能模块)
│   │   └── 库位管理.md # → feature (功能特性)
│   └── 入库管理/
│       └── 采购入库.md
```

**推断规则：**
- **第1层目录** → domain (业务领域)
- **第2层目录** → module (功能模块)
- **第3层目录或 .md 文件** → feature (功能特性)

## 输出文件

### 输出路径

输出路径 = `<project-dir>` + `<INFERRER_WORK_DIR>` + `<output-dir>`

**示例：**
```bash
kagent-req-infer -f requirements.md -p . -o aps-analysis
# 输出到: ./analyzer-work/aps-analysis/
```

**说明：**
- `--output-dir` 参数只提供子目录名称，不是完整路径
- 实际路径由系统自动拼接
- 默认 `INFERRER_WORK_DIR` 为 `analyzer-work`（可通过环境变量修改）

### 主输出文件

**文件名：** `inferred-requirements.json`（固定文件名，便于后续工具引用）

**位置：** `<project-dir>/<INFERRER_WORK_DIR>/<output-dir>/inferred-requirements.json`

**结构：**

```json
{
  "taskId": "infer-1762088172998",
  "timestamp": "2025-11-02T12:57:52.xxx",
  "requirements": [
    {
      "requirement": {
        "id": "file-...",
        "title": "1.1.1 库位管理",
        "content": "##### 功能分解\n增/删/改/查\n##### 详细描述\n...",
        "sourceFile": "requirements.md",
        "location": {
          "startLine": 7,
          "endLine": 11,
          "section": "1.1.1"
        }
      },
      "hierarchy": {
        "domain": "仓库管理",
        "module": "库位管理",
        "feature": "库位维护",
        "numbering": {
          "domainNum": 1,
          "moduleNum": 1,
          "featureNum": 1,
          "full": "1.1.1"
        }
      },
      "confidence": 0.95,
      "reasoning": "LLM 推理过程说明...",
      "alternatives": [
        {
          "hierarchy": { ... },
          "confidence": 0.85,
          "reason": "备选方案说明"
        }
      ]
    }
  ],
  "statistics": {
    "totalRequirements": 10,
    "successfulInferences": 10,
    "failedInferences": 0,
    "uniqueDomains": ["仓库管理", "生产管理"],
    "uniqueModules": ["仓库管理/库位管理", "仓库管理/库存管理"],
    "averageConfidence": 0.92
  }
}
```

### 字段说明

#### requirement 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 需求唯一标识 |
| `title` | string | 需求标题（包含章节号） |
| `content` | string | 完整的需求内容（自包含，包含所有子章节） |
| `sourceFile` | string | 来源文件路径（相对路径，仅用于追溯） |
| `location` | object | 在文件中的位置信息 |

#### hierarchy 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `domain` | string | 业务领域（第一层） |
| `module` | string | 功能模块（第二层） |
| `feature` | string | 功能特性（第三层） |
| `numbering` | object | 章节编号信息 |

#### 其他字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `confidence` | number | 置信度（0-1）<br>• 规则推断：~0.7-0.85<br>• LLM 推断：~0.9-1.0 |
| `reasoning` | string | 推理过程说明（仅 LLM 模式） |
| `alternatives` | array | 备选方案（仅 LLM 模式） |

## 使用示例

### 示例 1：单个需求快速推断

```bash
kagent-req-infer "库位管理，用于管理仓库库位信息" -p . -o test-output
```

### 示例 2：从文件推断

```bash
kagent-req-infer -f ./requirements/wms.md -p . -o wms-requirements
```

### 示例 3：批量处理（智能模式）

```bash
# 使用 LLM 智能推断，准确度高
kagent-req-infer -d ./requirements/ -p . -o wms-analysis

# 输出文件位置
ls ./analyzer-work/wms-analysis/inferred-requirements.json
```

### 示例 4：批量处理（快速模式）

```bash
# 仅使用规则推断，速度快
kagent-req-infer -d ./requirements/ -p . -o wms-analysis --no-llm
```

### 示例 5：完整工作流程

```bash
# 步骤 1: 推断需求层次结构
kagent-req-infer -f ./requirements/wms.md -p . -o wms-analysis

# 步骤 2: 使用推断结果批量生成代码
kagent-generator batch ./analyzer-work/wms-analysis/inferred-requirements.json \
  --project-dir . --output batch-v1 --domain 仓库管理
```

## 工作原理

### smart-dir 模式（LLM 推断）

1. **文件扫描**：扫描目录，识别所有 Markdown 文件
2. **需求提取**：解析每个文件，提取需求段落
3. **LLM 分析**：使用大语言模型推断层次结构
4. **结果验证**：验证推断结果的合理性
5. **生成输出**：生成 JSON 文件

**优势：** 准确度高，能理解需求语义
**劣势：** 速度较慢，依赖 LLM API

### simple-dir 模式（规则推断）

1. **文件扫描**：扫描目录，识别所有 Markdown 文件
2. **需求提取**：解析每个文件，提取需求段落
3. **规则匹配**：基于目录结构和关键词推断层次
4. **生成输出**：生成 JSON 文件

**优势：** 速度快，不依赖 LLM
**劣势：** 准确度较低，依赖目录结构规范

## 工作模式对比

| 模式 | 触发方式 | 使用 LLM | 准确度 | 速度 | 适用场景 |
|------|---------|---------|--------|------|----------|
| text | `[text]` | ✅ | 95% | 慢 | 快速测试单个需求 |
| file | `-f` | ✅ | 95% | 慢 | 解析单个结构化文档 |
| smart-dir | `-d` | ✅ | 95% | 慢 | 批量处理，要求高准确度 |
| simple-dir | `-d --no-llm` | ❌ | 70% | 快 | 快速批量处理标准化文档 |

## 注意事项

### JSON 自包含性

- `inferred-requirements.json` 包含完整的需求内容
- `sourceFile` 字段仅用于追溯，不影响后续处理
- 后续工具（generator）无需访问原始需求文档

### 置信度参考

| 置信度范围 | 推断方式 | 说明 |
|-----------|---------|------|
| 0.9 - 1.0 | LLM 推断 | 高置信度，推理过程详细 |
| 0.7 - 0.85 | 规则推断 | 中等置信度，基于目录结构和关键词 |
| < 0.7 | 推断失败 | 建议人工审核 |

### 性能考虑

- **LLM 模式**：准确但较慢，适合首次分析
- **规则模式**：快速但可能不准确，适合标准化文档
- **文件数量**：建议目录模式下文件数 < 100，否则考虑分批处理

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `INFERRER_WORK_DIR` | 推断工作基础目录 | `analyzer-work` |
| `INFERRER_MODEL` | AI 模型 | `gpt-4` |
| `INFERRER_TEMPERATURE` | 生成温度 | `0.3` |
| `INFERRER_AUTO_NUMBER` | 自动分配编号 | `false` |
| `OPENAI_API_KEY` | OpenAI API 密钥 | 必需（LLM 模式） |
| `OPENAI_BASE_URL` | OpenAI API 基础 URL | 可选 |

## 常见问题

### Q: 为什么输出文件名是固定的？

A: 使用固定文件名 `inferred-requirements.json` 便于后续工具（generator）引用，无需每次指定文件名。taskId 保留在 JSON 内部用于追溯。

### Q: 什么时候使用 --no-llm？

A: 当需求文档目录结构非常标准化，或者需要快速处理大量文档时，可以使用 `--no-llm`。注意：此选项仅在 `-d` 目录模式下有效。

### Q: 如何提高推断准确度？

A:
1. 使用 LLM 模式（不加 `--no-llm`）
2. 确保需求文档格式规范
3. 在需求标题中包含明确的章节号（如 1.1.1）
4. 提供详细的需求描述
5. 对于目录模式，保持清晰的目录结构

### Q: 文本模式和文件模式能用 --no-llm 吗？

A: 不能。文本模式和文件模式需要理解需求语义，必须使用 LLM。如果添加 `--no-llm`，工具会显示警告并忽略该选项。

### Q: 输出路径如何确定？

A: 输出路径 = `<project-dir>` + `<INFERRER_WORK_DIR>` + `<output-dir>`

例如：
- 命令：`kagent-req-infer -f req.md -p . -o aps-analysis`
- 输出：`./analyzer-work/aps-analysis/inferred-requirements.json`

可以通过环境变量 `INFERRER_WORK_DIR` 修改基础目录。

## 相关命令

- **kagent-generator**：使用 inferred-requirements.json 批量生成代码
- **kagent-analyzer**：需求分析和提取工具
- **kagent-refactor**：代码重构工具

## 版本历史

- **v1.0.0**：初始版本，支持文本、文件、目录输入
- **v1.1.0**：添加 batch 命令，使用固定输出文件名
- **v1.2.0**：优化 LLM 推断逻辑，提升准确度
- **v2.0.0**：重构参数设计，删除 `infer` 子命令和 `batch` 命令，简化 CLI 结构
