---
name: docx
name_chn: DOCX 文档处理
description: "全面的文档创建、编辑和分析,支持跟踪更改、注释、格式保留和文本提取。当 Claude 需要处理专业文档(.docx 文件)时使用,包括:(1)从 Markdown 创建文档(支持 Mermaid 流程图),(2)创建新文档,(3)修改或编辑内容,(4)处理跟踪更改,(5)添加注释,或任何其他文档任务"
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX 创建、编辑和分析

## 概述

用户可能会要求您创建、编辑或分析 .docx 文件的内容。.docx 文件本质上是一个包含 XML 文件和其他资源的 ZIP 归档,您可以读取或编辑这些内容。您可以使用不同的工具和工作流程来完成不同的任务。

对于从 Markdown 文件创建 Word 文档,使用 pandoc 进行转换,支持 Mermaid 流程图自动渲染为图片并适应页面宽度。

## 工作流程决策树

### 从 Markdown 创建文档

使用"从 Markdown 创建 Word 文档"工作流程

### 读取/分析内容

使用下面的"文本提取"或"原始 XML 访问"部分

### 创建新文档

使用"创建新 Word 文档"工作流程

### 编辑现有文档

- **您自己的文档 + 简单更改**
  使用"基本 OOXML 编辑"工作流程

- **他人的文档**
  使用**"红线工作流程"**(推荐默认)

- **法律、学术、商业或政府文档**
  使用**"红线工作流程"**(必需)

## 读取和分析内容

### 文本提取

如果您只需要读取文档的文本内容,应该使用 pandoc 将文档转换为 markdown。Pandoc 为保留文档结构提供了出色的支持,并可以显示跟踪的更改:

```bash
# 将文档转换为包含跟踪更改的 markdown
pandoc --track-changes=all path-to-file.docx -o output.md
# 选项: --track-changes=accept/reject/all
```

### 原始 XML 访问

以下情况需要原始 XML 访问: 注释、复杂格式、文档结构、嵌入媒体和元数据。对于这些功能,您需要解包文档并读取其原始 XML 内容。

#### 解包文件

`python ooxml/scripts/unpack.py <office_file> <output_directory>`

#### 关键文件结构

- `word/document.xml` - 主文档内容

- `word/comments.xml` - 在 document.xml 中引用的注释
- `word/media/` - 嵌入的图像和媒体文件
- 跟踪的更改使用 `<w:ins>`(插入)和 `<w:del>`(删除)标签

## 从 Markdown 创建 Word 文档

从 Markdown 文件生成 Word 文档时,使用 pandoc。对于包含 Mermaid 流程图的文档,使用 mermaid-filter 将图表自动渲染为图片并适应页面宽度。

### 工作流程

**🚨 关键要求 - 必须使用绝对路径 + 设置临时目录 + 控制图像高度 🚨**

在执行 pandoc 命令时,**必须**遵循以下三点:

1. **使用绝对路径**（否则会遇到"Permission denied"或文件找不到错误）:
   - ✅ 正确: `/Users/username/project/input.md`
   - ❌ 错误: `./input.md` 或 `input.md` 或相对路径

2. **设置 TMPDIR 为工作目录下的 tmp 文件夹**（否则 mermaid-filter 可能无法创建临时文件）:
   - ✅ 正确: `TMPDIR={workspace}/tmp`
   - ❌ 错误: 使用系统默认临时目录或相对路径

3. **设置图像宽度和高度**（确保图像适合页面，避免高图表被截断）:
   - ✅ 正确: `MERMAID_FILTER_WIDTH=1600 MERMAID_FILTER_HEIGHT=1940`
   - ❌ 错误: 仅设置宽度，导致高大的流程图超出页面

**重要**:
- "Permission denied" 错误通常**不是权限问题**,而是因为:
  1. 使用了相对路径导致文件找不到
  2. mermaid-filter 无法访问系统临时目录
- 使用绝对路径 + 自定义 TMPDIR 可以解决 100% 的此类错误
- 设置高度限制可确保所有图表（包括高大的流程图）都能在一个页面中完整展示

**原因**:
- pandoc 在执行 mermaid-filter 时会切换工作目录,导致相对路径失效
- mermaid-filter 需要创建临时文件,但可能无法访问某些系统临时目录

**检查清单**:

- ✅ 输入文件使用绝对路径
- ✅ 输出文件使用绝对路径
- ✅ 设置 TMPDIR={workspace}/tmp
- ✅ 设置 MERMAID_FILTER_WIDTH=1600
- ✅ 设置 MERMAID_FILTER_HEIGHT=1940

---

1. **基础转换**:

   ```bash
   pandoc "{workspace}/input.md" -o "{workspace}/output.docx"
   ```

2. **带 Mermaid 图表的转换**(推荐):

   ```bash
   # 步骤 1: 使用 pandoc 转换
   mkdir -p {workspace}/tmp
   TMPDIR="{workspace}/tmp" MERMAID_FILTER_WIDTH=1600 MERMAID_FILTER_HEIGHT=1940 pandoc "{workspace}/input.md" --filter mermaid-filter --dpi=200 -o "{workspace}/output.docx"

   # 步骤 2: 调整图像尺寸（必须执行）
   python {skill_dir}/scripts/resize-images.py "{workspace}/output.docx"
   ```

3. **使用自定义模板**:

   ```bash
   # 步骤 1: 使用 pandoc 转换
   mkdir -p {workspace}/tmp
   TMPDIR="{workspace}/tmp" MERMAID_FILTER_WIDTH=1600 MERMAID_FILTER_HEIGHT=1940 pandoc "{workspace}/input.md" --filter mermaid-filter --reference-doc="{workspace}/template.docx" --dpi=200 -o "{workspace}/output.docx"

   # 步骤 2: 调整图像尺寸（必须执行）
   python {skill_dir}/scripts/resize-images.py "{workspace}/output.docx"
   ```

   **说明**:
   - resize-images.py 确保所有图像适合页面尺寸
   - 自动缩小超出页面的图像，保持宽高比
   - 适合的图像不会被修改

### 环境变量

- `MERMAID_FILTER_WIDTH`: 图表宽度(推荐 1600)
- `MERMAID_FILTER_HEIGHT`: 图表最大高度(推荐 1940 for A4)
- `MERMAID_FILTER_SCALE`: 缩放比例(默认 1，可设置 0.8 缩小)
- `--dpi`: 图像 DPI(推荐 200)
- `--reference-doc`: 自定义模板文件

### Mermaid 语法

在 Markdown 文件中使用标准 Mermaid 代码块:

` ` `mermaid
graph LR
    A[开始] --> B[处理]
    B --> C[结束]
` ` `

### 处理特别高的图表

如果图表超出页面，使用 `MERMAID_FILTER_SCALE` 缩小:

```bash
TMPDIR="{workspace}/tmp" MERMAID_FILTER_WIDTH=1600 MERMAID_FILTER_HEIGHT=1940 MERMAID_FILTER_SCALE=0.8 pandoc "{workspace}/input.md" --filter mermaid-filter --dpi=200 -o "{workspace}/output.docx"
```

或为单个图表设置尺寸:

```markdown
` ` `{.mermaid width=1200 height=1500}
graph TD
    A --> B
` ` `
```

### 📐 常用页面尺寸配置

| 页面类型 | DPI | WIDTH | HEIGHT |
|---------|-----|-------|--------|
| A4 | 200 | 1600 | 1940 |
| Letter | 200 | 1650 | 1800 |
| A4 高清 | 300 | 2400 | 2910 |

### 🔧 故障排除

**"Permission denied" 错误原因**:

1. 使用了相对路径 → 使用绝对路径替换 `{workspace}`
2. mermaid-filter 无法访问系统临时目录 → 设置 `TMPDIR={workspace}/tmp`

**修复命令**:

```bash
mkdir -p {workspace}/tmp
TMPDIR="{workspace}/tmp" MERMAID_FILTER_WIDTH=1600 MERMAID_FILTER_HEIGHT=1940 pandoc "{workspace}/input.md" --filter mermaid-filter --dpi=200 -o "{workspace}/output.docx"
```

## 创建新 Word 文档

从头开始创建新 Word 文档时,使用 **docx-js**,它允许您使用 JavaScript/TypeScript 创建 Word 文档。

### 工作流程

1. **必需 - 完整阅读文件**: 从头到尾完整阅读 [`docx-js.md`](docx-js.md)(约500行)。**读取此文件时永远不要设置任何范围限制。**在继续创建文档之前,阅读完整文件内容以了解详细语法、关键格式规则和最佳实践。
2. 使用 Document、Paragraph、TextRun 组件创建 JavaScript/TypeScript 文件(您可以假设所有依赖项都已安装,但如果没有,请参阅下面的依赖项部分)
3. 使用 Packer.toBuffer() 导出为 .docx

## 编辑现有 Word 文档

编辑现有 Word 文档时,使用 **Document 库**(用于 OOXML 操作的 Python 库)。该库自动处理基础设施设置并提供文档操作方法。对于复杂场景,您可以通过库直接访问底层 DOM。

### 工作流程

1. **必需 - 完整阅读文件**: 从头到尾完整阅读 [`ooxml.md`](ooxml.md)(约600行)。**读取此文件时永远不要设置任何范围限制。**阅读完整文件内容以了解 Document 库 API 和用于直接编辑文档文件的 XML 模式。
2. 解包文档: `python ooxml/scripts/unpack.py <office_file> <output_directory>`
3. 使用 Document 库创建并运行 Python 脚本(参见 ooxml.md 中的"Document Library"部分)
4. 打包最终文档: `python ooxml/scripts/pack.py <input_directory> <office_file>`

Document 库为常见操作提供高级方法,为复杂场景提供直接 DOM 访问。

## 文档审查的红线工作流程

此工作流程允许您在 OOXML 中实现之前使用 markdown 计划全面的跟踪更改。**关键**: 对于完整的跟踪更改,您必须系统地实现所有更改。

**批处理策略**: 将相关更改分组为 3-10 个更改的批次。这使调试易于管理,同时保持效率。在继续下一批之前测试每一批。

**原则: 最小、精确的编辑**
实现跟踪更改时,仅标记实际更改的文本。重复未更改的文本会使编辑更难审查并显得不专业。将替换分解为: [未更改的文本] + [删除] + [插入] + [未更改的文本]。通过从原始中提取 `<w:r>` 元素并重用它来保留未更改文本的原始运行的 RSID。

示例 - 将句子中的"30 days"更改为"60 days":

```python
# 错误 - 替换整个句子
'<w:del><w:r><w:delText>The term is 30 days.</w:delText></w:r></w:del><w:ins><w:r><w:t>The term is 60 days.</w:t></w:r></w:ins>'

# 正确 - 仅标记更改的内容,为未更改的文本保留原始 <w:r>
'<w:r w:rsidR="00AB12CD"><w:t>The term is </w:t></w:r><w:del><w:r><w:delText>30</w:delText></w:r></w:del><w:ins><w:r><w:t>60</w:t></w:r></w:ins><w:r w:rsidR="00AB12CD"><w:t> days.</w:t></w:r>'
```

### 跟踪更改工作流程

1. **获取 markdown 表示**: 将文档转换为保留跟踪更改的 markdown:

   ```bash
   pandoc --track-changes=all path-to-file.docx -o current.md
   ```

2. **识别和分组更改**: 审查文档并识别所需的所有更改,将它们组织成逻辑批次:

   **定位方法**(用于在 XML 中查找更改):
   - 节/标题编号(例如,"Section 3.2","Article IV")
   - 段落标识符(如果编号)
   - 具有唯一周围文本的 Grep 模式
   - 文档结构(例如,"first paragraph","signature block")
   - **不要使用 markdown 行号** - 它们不映射到 XML 结构

   **批次组织**(每批分组 3-10 个相关更改):
   - 按节: "Batch 1: Section 2 amendments","Batch 2: Section 5 updates"
   - 按类型: "Batch 1: Date corrections","Batch 2: Party name changes"
   - 按复杂性: 从简单的文本替换开始,然后处理复杂的结构更改
   - 顺序: "Batch 1: Pages 1-3","Batch 2: Pages 4-6"

3. **阅读文档并解包**:
   - **必需 - 完整阅读文件**: 从头到尾完整阅读 [`ooxml.md`](ooxml.md)(约600行)。**读取此文件时永远不要设置任何范围限制。**特别注意"Document Library"和"Tracked Change Patterns"部分。
   - **解包文档**: `python ooxml/scripts/unpack.py <file.docx> <dir>`
   - **记下建议的 RSID**: 解包脚本将建议用于跟踪更改的 RSID。复制此 RSID 以在步骤 4b 中使用。

4. **分批实现更改**: 逻辑分组更改(按节、按类型或按接近度)并在单个脚本中一起实现它们。这种方法:
   - 使调试更容易(较小的批次 = 更容易隔离错误)
   - 允许增量进度
   - 保持效率(3-10 个更改的批次大小效果很好)

   **建议的批次分组:**
   - 按文档节(例如,"Section 3 changes","Definitions","Termination clause")
   - 按更改类型(例如,"Date changes","Party name updates","Legal term replacements")
   - 按接近度(例如,"Changes on pages 1-3","Changes in first half of document")

   对于每批相关更改:

   **a. 将文本映射到 XML**: 在 `word/document.xml` 中 Grep 文本以验证文本如何在 `<w:r>` 元素之间分割。

   **b. 创建并运行脚本**: 使用 `get_node` 查找节点,实现更改,然后 `doc.save()`。有关模式,请参见 ooxml.md 中的**"Document Library"**部分。

   **注意**: 在编写脚本之前始终立即 grep `word/document.xml` 以获取当前行号并验证文本内容。每次脚本运行后行号都会更改。

5. **打包文档**: 所有批次完成后,将解包的目录转换回 .docx:

   ```bash
   python ooxml/scripts/pack.py unpacked reviewed-document.docx
   ```

6. **最终验证**: 对完整文档进行全面检查:
   - 将最终文档转换为 markdown:

     ```bash
     pandoc --track-changes=all reviewed-document.docx -o verification.md
     ```

   - 验证所有更改是否正确应用:

     ```bash
     grep "original phrase" verification.md  # 不应该找到
     grep "replacement phrase" verification.md  # 应该找到
     ```

   - 检查是否引入了意外更改

## 将文档转换为图像

要可视化分析 Word 文档,使用两步过程将它们转换为图像:

1. **将 DOCX 转换为 PDF**:

   ```bash
   soffice --headless --convert-to pdf document.docx
   ```

2. **将 PDF 页面转换为 JPEG 图像**:

   ```bash
   pdftoppm -jpeg -r 150 document.pdf page
   ```

   这将创建 `page-1.jpg`、`page-2.jpg` 等文件。

选项:

- `-r 150`: 将分辨率设置为 150 DPI(调整质量/大小平衡)
- `-jpeg`: 输出 JPEG 格式(如果首选 PNG,请使用 `-png`)
- `-f N`: 要转换的第一页(例如,`-f 2` 从第 2 页开始)
- `-l N`: 要转换的最后一页(例如,`-l 5` 在第 5 页停止)
- `page`: 输出文件的前缀

特定范围的示例:

```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 document.pdf page  # 仅转换第 2-5 页
```

## 代码样式指南

**重要**: 为 DOCX 操作生成代码时:

- 编写简洁的代码
- 避免冗长的变量名和冗余操作
- 避免不必要的打印语句

## 依赖项

所需依赖项(如果不可用则安装):

- **pandoc**: `sudo apt-get install pandoc`(用于文本提取和 Markdown 转换)
- **mermaid-cli**: `npm install -g @mermaid-js/mermaid-cli`(用于渲染 Mermaid 图表)
- **mermaid-filter**: `pip install mermaid-filter`(Pandoc 的 Mermaid 过滤器)
- **docx**: `npm install -g docx`(用于创建新文档)
- **LibreOffice**: `sudo apt-get install libreoffice`(用于 PDF 转换)
- **Poppler**: `sudo apt-get install poppler-utils`(用于 pdftoppm 将 PDF 转换为图像)
- **defusedxml**: `pip install defusedxml`(用于安全 XML 解析)
