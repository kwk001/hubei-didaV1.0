# 输出文件格式说明

## Contents

- inferred-requirements.json 结构
- 字段说明
- JSON 自包含性
- 置信度参考

---

## inferred-requirements.json

**固定文件名，便于后续工具引用**

**文件位置**: `<project-dir>/analyzer-work/<output-dir>/inferred-requirements.json`

### JSON 结构

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
      "reasoning": "LLM 推理过程说明..."
    }
  ],
  "statistics": {
    "totalRequirements": 10,
    "uniqueDomains": ["仓库管理", "生产管理"],
    "uniqueModules": ["仓库管理/库位管理", "仓库管理/库存管理"],
    "averageConfidence": 0.92
  }
}
```

---

## 字段说明

### requirement 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 需求唯一标识 |
| `title` | string | 需求标题（包含章节号） |
| `content` | string | 完整的需求内容（自包含） |
| `sourceFile` | string | 来源文件（仅用于追溯） |
| `location` | object | 在文件中的位置信息 |

### hierarchy 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `domain` | string | 业务领域（第一层） |
| `module` | string | 功能模块（第二层） |
| `feature` | string | 功能特性（第三层） |
| `numbering` | object | 章节编号信息 |

### 其他字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `confidence` | number | 置信度（0-1）<br>• 规则推断：~0.6<br>• LLM 推断：~0.9-1.0 |
| `reasoning` | string | 推理过程说明（仅 LLM 模式） |

---

## JSON 自包含性

**重要特性**:
- `content` 字段包含完整需求内容，后续工具无需访问原始文档
- `sourceFile` 仅用于追溯，不影响后续处理
- 后续工具（analyzer/generator）无需访问原始需求文档

这种设计确保了 inferred-requirements.json 是完全自包含的，可以独立传递和使用。

---

## 置信度参考

| 置信度范围 | 推断方式 | 说明 |
|-----------|---------|------|
| 0.9 - 1.0 | LLM 推断 | 高置信度，推理过程详细 |
| 0.6 - 0.8 | 规则推断 | 中等置信度，基于关键词匹配 |
| < 0.6 | 推断失败 | 建议人工审核 |

---

## 输出文件位置

```
<项目路径>/analyzer-work/<输出目录>/
├── inferred-requirements.json  # 主输出文件（自包含）
└── analysis.md                  # 人类可读的分析报告
```

---

## 文件名固定原因

使用固定文件名 `inferred-requirements.json` 便于后续工具引用，无需每次指定文件名。taskId 保留在 JSON 内部用于追溯。

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `INFERRER_WORK_DIR` | 推断工作目录名称 | `analyzer-work` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `LOG_FILE` | 日志文件路径 | 可选 |
