# kagent-generator

低代码应用生成工具 - 基于需求生成可运行的低代码应用

## 概述

`kagent-generator` 用于根据需求描述生成完整的低代码应用，包括：
- React 组件代码
- KaiwuFlex 配置
- 数据模型定义
- Mock 数据
- 业务逻辑代码

支持单个需求生成和批量处理。

## 命令模式

### 1. generate 模式（默认）

单个需求生成，创建一个完整的低代码应用。

#### 使用方式

```bash
kagent-generator [generate] <需求> [选项]
```

### 2. batch 模式

批量代码生成，从 `inferred-requirements.json` 读取需求列表，批量生成代码。

#### 使用方式

```bash
kagent-generator batch <json文件> [选项]
```

### 3. analyze 模式

分析 UI 设计图，提取设计元素和布局信息。

#### 使用方式

```bash
kagent-generator analyze <图片文件> [选项]
```

### 4. resume 模式

恢复之前的生成任务，继续处理。

#### 使用方式

```bash
kagent-generator resume <threadId> [选项]
```

## 参数说明

### generate 模式参数

#### 必需参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `<需求>` | 需求描述或需求文件路径 | `"用户管理"` 或 `./requirement.md` |
| `--project-dir <path>` | 项目目录路径 | `--project-dir .` |

#### 可选参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-i, --image <path>` | UI 设计图路径 | - |
| `-o, --output <dir>` | 输出目录名称 | 根据需求自动生成 |
| `--model <model>` | AI 模型 | `sonnet` |
| `--temperature <n>` | 生成温度 (0-1) | `0.7` |
| `--cache` | 启用缓存（可恢复） | false |
| `--skip-confirm` | 跳过确认步骤 | false |
| `--allow-edit` | 允许编辑配置 | false |
| `--no-mock` | 不生成 Mock 数据 | false（生成 Mock） |
| `--mode <mode>` | 生成模式 | `auto` |
| `--skip-design` | 跳过 UI 和架构设计阶段 | false |
| `--analysis-mode <mode>` | 需求分析模式 | `auto` |
| `--analysis-threshold <n>` | 需求质量评估阈值 (0-100) | `70` |
| `--auto-fix-threshold <n>` | 自动修复绑定错误的阈值 | `5` |
| `-p, --prompt <text>` | 附加的 prompt 指令 | - |
| `-v, --verbose` | 显示详细日志 | false |
| `-h, --help` | 显示帮助信息 | - |

#### 模式说明

**生成模式（--mode）：**
- `full`：完整分析，包含需求分析、设计、代码生成
- `direct`：直接生成，跳过设计阶段（等同于 `--skip-design`）
- `auto`：自动选择，根据需求复杂度决定

**需求分析模式（--analysis-mode）：**
- `auto`：自动判断是否需要分析（基于需求质量评估）
- `skip`：跳过分析，直接使用输入的需求
- `analysis`：强制分析，即使需求已经很详细

### batch 模式参数

#### 必需参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `<json文件>` | inferred-requirements.json 文件路径 | `./inference-work/wms/inferred-requirements.json` |
| `--project-dir <path>` | 项目目录路径 | `--project-dir .` |

#### 可选参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-o, --output <path>` | 输出目录前缀 | - |
| `--skip-design` | 跳过 UI 和架构设计阶段 | false |
| `--model <model>` | AI 模型 | `sonnet` |
| `--temperature <n>` | 生成温度 (0-1) | `0.7` |
| `--no-mock` | 不生成 Mock 数据 | false |
| `-p, --prompt <text>` | 附加的 prompt 指令 | - |
| `-v, --verbose` | 显示详细日志 | false |

#### 过滤选项

| 参数 | 说明 | 示例 |
|------|------|------|
| `--domain <name>` | 按业务领域过滤 | `--domain "仓库管理"` |
| `--module <name>` | 按功能模块过滤 | `--module "入库管理"` |
| `--range <ranges>` | 按章节范围过滤 | `--range "1.1.3-1.1.5,1.1.8"` |

## 输入文件格式

### generate 模式输入

#### 需求描述

**简短需求（直接输入）：**
```bash
kagent-generator "用户管理模块" --project-dir .
```

**层次化需求（路径格式）：**
```bash
kagent-generator "仓库管理/入库管理" --project-dir .
```

#### 需求文件（Markdown）

```markdown
# 用户管理模块

## 功能概述
提供用户的基本管理功能，包括用户注册、登录、信息修改等。

## 功能列表
1. 用户注册
2. 用户登录
3. 用户信息修改
4. 用户列表查询
5. 用户删除

## 详细需求

### 用户注册
- 表单ID: UserRegister
- 字段：username, email, password
- 验证：邮箱格式校验、密码强度校验

### 用户登录
- 表单ID: UserLogin
- 字段：username, password
- 返回：用户信息、token

...
```

#### UI 设计图

支持格式：png, jpg, jpeg

```bash
kagent-generator "根据设计图创建入库管理" \
  -i design.png \
  --project-dir .
```

### batch 模式输入

**文件：** `inferred-requirements.json`（由 kagent-req-infer 生成）

**格式：** 参见 [kagent-req-infer 文档](./kagent-req-infer.md#输出文件)

## 输出文件

### generate 模式输出

**目录结构：**
```
<project-dir>/generator-work/<output-dir>/
├── components/
│   └── UserManagement.jsx         # React 组件
├── configs/
│   └── UserManagement.json        # KaiwuFlex 配置
├── models/
│   └── UserManagementModel.js     # 数据模型
├── mocks/
│   └── UserManagementMock.json    # Mock 数据
├── services/
│   └── UserManagementService.js   # API 服务
├── utils/
│   └── UserManagementUtils.js     # 工具函数
└── README.md                       # 应用说明文档
```

### batch 模式输出

**目录结构：**
```
<project-dir>/generator-work/<domain>/<module>/<feature>/
├── components/
├── configs/
├── models/
├── mocks/
├── services/
├── utils/
└── README.md
```

**示例：**
```
generator-work/
├── 仓库管理/
│   ├── 库位管理/
│   │   └── 库位维护/
│   │       ├── components/
│   │       ├── configs/
│   │       └── ...
│   └── 入库管理/
│       └── 采购入库/
│           ├── components/
│           ├── configs/
│           └── ...
└── batch-report-2025-11-02T22-00-00.json
```

**批处理报告：**
```
<project-dir>/generator-work/batch-report-<timestamp>.json
```

### 输出文件说明

#### React 组件（components/*.jsx）

```jsx
import React from 'react';
import { KaiwuFlex } from '@kaiwu/lowcode-engine';

class UserManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 状态定义
    };
  }

  // 生命周期和方法
  componentDidMount() {
    // 初始化逻辑
  }

  render() {
    return (
      <KaiwuFlex config={this.props.config}>
        {/* 组件内容 */}
      </KaiwuFlex>
    );
  }
}

export default UserManagement;
```

#### KaiwuFlex 配置（configs/*.json）

```json
{
  "formId": "UserManagement",
  "title": "用户管理",
  "layout": {
    "type": "grid",
    "columns": 2
  },
  "fields": [
    {
      "id": "username",
      "label": "用户名",
      "type": "input",
      "required": true
    },
    {
      "id": "email",
      "label": "邮箱",
      "type": "input",
      "inputType": "email",
      "required": true
    }
  ],
  "actions": [
    {
      "id": "submit",
      "label": "提交",
      "type": "primary",
      "action": "submit"
    }
  ]
}
```

#### 数据模型（models/*.js）

```javascript
export const UserModel = {
  fields: {
    id: { type: 'string', primary: true },
    username: { type: 'string', required: true },
    email: { type: 'string', required: true },
    createdAt: { type: 'datetime' }
  },

  validations: {
    username: (value) => value && value.length >= 3,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
};
```

#### Mock 数据（mocks/*.json）

```json
{
  "users": [
    {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "username": "user1",
      "email": "user1@example.com",
      "createdAt": "2025-01-02T00:00:00Z"
    }
  ]
}
```

### 批处理报告格式

```json
{
  "timestamp": "2025-11-02T22:00:00.000Z",
  "duration": 120000,
  "input": "./inference-work/wms/inferred-requirements.json",
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
      "success": true,
      "files": ["components/...", "configs/..."],
      "duration": 25000
    }
  ]
}
```

## 使用示例

### 示例 1：简单需求生成

```bash
kagent-generator "创建产品管理页面" --project-dir .
```

### 示例 2：层次化需求生成

```bash
kagent-generator "仓库管理/杂项入库" --project-dir .
```

### 示例 3：基于设计图生成

```bash
kagent-generator "根据设计图创建入库管理" \
  -i design.png \
  --project-dir .
```

### 示例 4：使用需求文件

```bash
kagent-generator ./requirements.md --project-dir .
```

### 示例 5：跳过设计阶段（快速生成）

```bash
kagent-generator "质量管理/质检报告" \
  --skip-design \
  --project-dir .
```

### 示例 6：批量生成（完整流程）

```bash
# 步骤 1: 使用 req-infer 推断需求层次结构
kagent-req-infer batch ./requirements/ -p . -o wms-analysis

# 步骤 2: 使用 generator batch 批量生成代码
kagent-generator batch ./inference-work/wms-analysis/inferred-requirements.json \
  --project-dir .
```

### 示例 7：批量生成（带过滤）

```bash
# 按业务领域过滤
kagent-generator batch ./inferred-requirements.json \
  --project-dir . \
  --domain "仓库管理"

# 按章节范围过滤
kagent-generator batch ./inferred-requirements.json \
  --project-dir . \
  --range "1.1.1-1.1.5"

# 组合过滤 + 跳过设计
kagent-generator batch ./inferred-requirements.json \
  --project-dir . \
  -o batch-v1 \
  --domain "仓库管理" \
  --range "1.1.1-1.1.5" \
  --skip-design
```

### 示例 8：恢复之前的生成任务

```bash
kagent-generator resume gen-1234567890 --project-dir .
```

## 工作原理

### LangGraph 工作流

generator 使用 LangGraph 编排 11 个工作流节点：

1. **需求分析节点**：分析和结构化需求
2. **UI 设计节点**：设计用户界面
3. **架构设计节点**：设计应用架构
4. **组件生成节点**：生成 React 组件
5. **配置生成节点**：生成 KaiwuFlex 配置
6. **模型生成节点**：生成数据模型
7. **服务生成节点**：生成 API 服务
8. **Mock 生成节点**：生成 Mock 数据
9. **绑定检查节点**：检查组件与配置的绑定关系
10. **自动修复节点**：修复发现的绑定错误
11. **输出节点**：保存生成的文件

### 生成流程

```
需求输入
  ↓
需求分析 (可选，基于 analysis-mode)
  ↓
UI 设计 (可选，基于 --skip-design)
  ↓
架构设计
  ↓
并行生成：
  - React 组件
  - KaiwuFlex 配置
  - 数据模型
  - API 服务
  - Mock 数据
  ↓
绑定检查
  ↓
自动修复 (如果错误 <= auto-fix-threshold)
  ↓
保存文件
```

## 注意事项

### 需求描述建议

- **明确性**：需求越详细，生成效果越好
- **具体性**：可以指定表单 ID、字段名等
- **层次性**：使用 `领域/模块/特性` 格式帮助组织输出

### 设计图要求

- **格式**：支持 png, jpg, jpeg
- **清晰度**：图片应清晰可辨，分辨率建议 >= 1024x768
- **内容**：包含完整的 UI 布局和元素

### 性能考虑

- **LLM 调用**：每个节点可能需要调用 LLM，耗时较长
- **批量处理**：使用过滤器减少处理数量
- **跳过设计**：使用 `--skip-design` 可大幅提升速度（减少 2-3 个节点）
- **缓存**：使用 `--cache` 启用缓存，失败时可恢复

### 自动修复

当绑定错误数量 <= `auto-fix-threshold` 时，系统会自动尝试修复。

```bash
# 设置自动修复阈值为 10
kagent-generator "用户管理" --project-dir . --auto-fix-threshold 10

# 禁用自动修复
kagent-generator "用户管理" --project-dir . --auto-fix-threshold 0
```

也可以通过环境变量设置：
```bash
export GENERATOR_AUTO_FIX_THRESHOLD=10
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `GENERATOR_WORK_DIR` | 生成工作目录名称 | `generator-work` |
| `GENERATOR_AUTO_FIX_THRESHOLD` | 自动修复绑定错误的阈值 | `5` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `LOG_FILE` | 日志文件路径 | 可选 |

## 常见问题

### Q: 为什么要使用 inferred-requirements.json？

A: batch 模式专为批量处理设计，`inferred-requirements.json` 包含：
- 完整的需求内容（无需原始文档）
- 业务层次结构（用于组织输出）
- 置信度评分（用于质量控制）

### Q: generate 和 batch 模式如何选择？

A:
- **generate**：单个需求，快速开发和测试
- **batch**：多个需求，批量生产和部署

### Q: 如何提高生成质量？

A:
1. 提供详细的需求描述
2. 指定具体的表单 ID 和字段名
3. 提供 UI 设计图（如有）
4. 使用 `--prompt` 添加额外要求

### Q: 生成失败时如何恢复？

A:
1. 使用 `--cache` 启用缓存
2. 记录 threadId
3. 使用 `resume` 命令恢复：
```bash
kagent-generator resume <threadId> --project-dir .
```

### Q: 如何跳过不需要的节点？

A:
- `--skip-design`：跳过 UI 和架构设计
- `--no-mock`：不生成 Mock 数据
- `--analysis-mode skip`：跳过需求分析

## 相关命令

- **kagent-req-infer**：推断需求层次结构
- **kagent-analyzer**：生成需求文档
- **kagent-refiner**：精炼和优化生成的代码

## 完整工作流

```bash
# 1. 推断需求层次结构
kagent-req-infer batch ./requirements/ -p . -o wms

# 2. 批量生成需求文档（可选）
kagent-analyzer batch ./inference-work/wms/inferred-requirements.json -p .

# 3. 批量生成代码
kagent-generator batch ./inference-work/wms/inferred-requirements.json -p . \
  --skip-design

# 4. 精炼代码（可选）
kagent-refiner batch ./generator-work/... -p .
```

## 版本历史

- **v1.0.0**：初始版本，支持单个需求生成
- **v1.1.0**：添加 batch 模式，支持批量生成
- **v1.2.0**：添加自动修复功能
- **v1.3.0**：优化帮助文档，改进过滤器
