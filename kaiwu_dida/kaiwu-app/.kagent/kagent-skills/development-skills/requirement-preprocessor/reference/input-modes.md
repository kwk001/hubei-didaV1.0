# 输入模式详解

## Contents

- 模式 1: 文本输入
- 模式 2: 单文件输入
- 模式 3: 目录批量输入
- 识别规则和命令模板

---

## 模式 1: 文本输入

**适用场景**: 简短需求、快速测试

**用户输入示例**:
```
"创建一个库位管理功能"
"需要出库管理和入库管理模块"
```

**执行命令**:
```bash
kagent-req-infer "库位管理，用于管理仓库库位信息" \
  -p "$PROJECT_DIR" \
  -o test-output
```

**输出**:
- `./analyzer-work/test-output/inferred-requirements.json`
- `./analyzer-work/test-output/analysis.md`

---

## 模式 2: 单文件输入

**适用场景**: 单个需求文档

**用户输入示例**:
```
"使用 ./requirements/wms-requirements.md 生成需求"
"基于 ../WMS/仓库管理/库位管理.md"
```

**执行命令**:
```bash
kagent-req-infer \
  -f ./requirements/wms-requirements.md \
  -p "$PROJECT_DIR" \
  -o wms-requirements
```

**支持的文档格式**:
```markdown
#### 1.1.1 库位管理
##### 功能分解
增/删/改/查
##### 详细描述
用于登记仓库内各库位的信息，如托盘、货架位等。

#### 1.1.2 物料信息管理
##### 功能分解
增/删/改/查
##### 详细描述
用于登记物料的基本信息，包括物料编码、物料名称等。
```

---

## 模式 3: 目录批量输入

**适用场景**: 批量处理多个需求文档

**用户输入示例**:
```
"处理 ./requirements/ 目录下的所有需求"
"批量分析 ../WMS/ 下的需求文档"
```

### 3a. LLM 智能模式（默认）

```bash
kagent-req-infer -d ./requirements/ \
  -p "$PROJECT_DIR" \
  -o wms-analysis
```

**特点**: 使用 LLM 智能推断，准确度高（置信度 0.9-1.0），适合首次分析。

### 3b. 规则模式（快速）

```bash
kagent-req-infer -d ./requirements/ \
  -p "$PROJECT_DIR" \
  -o wms-analysis \
  --no-llm \
  -y
```

**特点**: 仅使用规则推断，速度快（置信度 0.6-0.8），适合标准化程度高的需求文档。

---

## 识别规则

| 输入特征 | 模式 | 命令参数 |
|---------|------|---------|
| 不包含文件路径 | 文本输入 | `infer "<文本>"` |
| 包含单个文件路径 | 文件输入 | `infer -f <文件>` |
| 包含目录路径 | 批量输入 | `batch <目录>` |

## 命令模板

### 文本输入命令模板

```bash
kagent-req-infer "<需求文本>" \
  -p <项目路径> \
  -o <输出目录名>
```

### 文件输入命令模板

```bash
kagent-req-infer \
  -f <文件路径> \
  -p <项目路径> \
  -o <输出目录名>
```

### 批量输入命令模板（LLM）

```bash
kagent-req-infer -d <目录路径> \
  -p <项目路径> \
  -o <输出目录名>
```

### 批量输入命令模板（规则）

```bash
kagent-req-infer -d <目录路径> \
  -p <项目路径> \
  -o <输出目录名> \
  --no-llm \
  -y
```

---

## 完整工作流程示例

**用户输入**:
```
"分析 requirements/ 目录，然后生成代码"
```

**步骤 1 - 推断需求层次结构**:
```bash
kagent-req-infer -d ./requirements/ \
  -p "$PROJECT_DIR" \
  -o wms-analysis
```

**步骤 2 - 使用推断结果生成代码**:
```
告知用户使用 lowcode-generator 技能，传入：
./analyzer-work/wms-analysis/inferred-requirements.json
```

---

## 工作原理

### smart-dir 模式（LLM 推断）

1. 文件扫描: 扫描目录，识别所有 Markdown 文件
2. 需求提取: 解析每个文件，提取需求段落
3. LLM 分析: 使用大语言模型推断层次结构
4. 结果验证: 验证推断结果的合理性
5. 生成输出: 生成 JSON 和 Markdown 报告

**优势**: 准确度高，置信度 0.9-1.0
**劣势**: 较慢，依赖 LLM API

### simple-dir 模式（规则推断）

1. 文件扫描: 扫描目录，识别所有 Markdown 文件
2. 需求提取: 解析每个文件，提取需求段落
3. 规则匹配: 基于关键词和模式匹配推断层次
4. 生成输出: 生成 JSON 和 Markdown 报告

**优势**: 速度快，不依赖 LLM
**劣势**: 准确度较低（置信度 0.6-0.8），适合标准化程度高的需求文档
