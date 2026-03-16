# MCP Server 评估指南

## 概述

本文档提供了为 MCP server 创建全面评估的指导。评估测试 LLM 是否能够有效地使用您的 MCP server，仅通过提供的工具来回答现实的、复杂的问题。

---

## 快速参考

### 评估要求
- 创建 10 个人类可读的问题
- 问题必须是只读的、独立的、非破坏性的
- 每个问题需要多次工具调用（可能数十次）
- 答案必须是单一的、可验证的值
- 答案必须是稳定的（不会随时间变化）

### 输出格式
```xml
<evaluation>
   <qa_pair>
      <question>您的问题</question>
      <answer>单一可验证答案</answer>
   </qa_pair>
</evaluation>
```

---

## 评估的目的

MCP server 质量的衡量标准不是 server 实现工具的好坏或全面性，而是这些实现（输入/输出模式、文档字符串/描述、功能）能够多好地使 LLM 在没有其他上下文且仅访问 MCP server 的情况下回答现实的和困难的问题。

## 评估概述

创建 10 个人类可读的问题，仅需要只读的、独立的、非破坏性的和幂等的操作来回答。每个问题应该是：
- 现实的
- 清晰简洁的
- 明确的
- 复杂的，可能需要数十次工具调用或步骤
- 可以用单一的、可验证的值回答，您需要提前确定该值

## 问题指南

### 核心要求

1. **问题必须是独立的**
   - 每个问题不应依赖于任何其他问题的答案
   - 不应假设来自处理另一个问题的先前写入操作

2. **问题必须仅要求非破坏性和幂等的工具使用**
   - 不应指示或要求修改状态以得出正确答案

3. **问题必须是现实的、清晰的、简洁的和复杂的**
   - 必须要求另一个 LLM 使用多个（可能数十个）工具或步骤来回答

### 复杂性和深度

4. **问题必须需要深入探索**
   - 考虑需要多个子问题和顺序工具调用的多跳问题
   - 每个步骤都应受益于在先前问题中找到的信息

5. **问题可能需要广泛的分页**
   - 可能需要翻阅多页结果
   - 可能需要查询旧数据（1-2 年过时）以找到小众信息
   - 问题必须是困难的

6. **问题必须需要深入理解**
   - 而不是表面层次的知识
   - 可以将复杂的想法作为真/假问题提出，需要证据
   - 可以使用多选格式，LLM 必须搜索不同的假设

7. **问题不得通过直接的关键字搜索解决**
   - 不要包含目标内容中的特定关键字
   - 使用同义词、相关概念或改述
   - 需要多次搜索、分析多个相关项目、提取上下文，然后得出答案

### 工具测试

8. **问题应该压力测试工具返回值**
   - 可能引发返回大型 JSON 对象或列表的工具，使 LLM 不堪重负
   - 应该需要理解多种数据模式：
     - ID 和名称
     - 时间戳和日期时间（月、日、年、秒）
     - 文件 ID、名称、扩展名和 MIME 类型
     - URL、GID 等
   - 应该探查工具返回所有有用数据形式的能力

9. **问题应该大多反映真实的人类用例**
   - 人类在 LLM 协助下会关心的那种信息检索任务

10. **问题可能需要数十次工具调用**
    - 这对上下文有限的 LLM 构成挑战
    - 鼓励 MCP server 工具减少返回的信息

11. **包含模糊的问题**
    - 可能是模糊的或需要对调用哪些工具做出困难的决定
    - 迫使 LLM 可能犯错误或误解
    - 确保尽管有模糊性，仍然有单一的可验证答案

### 稳定性

12. **问题必须设计成答案不会改变**
    - 不要问依赖于动态"当前状态"的问题
    - 例如，不要计数：
      - 帖子的反应数
      - 主题的回复数
      - 频道的成员数

13. **不要让 MCP server 限制您创建的问题类型**
    - 创建具有挑战性和复杂的问题
    - 有些可能无法用可用的 MCP server 工具解决
    - 问题可能需要特定的输出格式（日期时间 vs. epoch 时间，JSON vs. MARKDOWN）
    - 问题可能需要数十次工具调用才能完成

## 答案指南

### 验证

1. **答案必须可通过直接字符串比较验证**
   - 如果答案可以用多种格式重写，请在问题中明确指定输出格式
   - 示例："使用 YYYY/MM/DD。"、"回答真或假。"、"回答 A、B、C 或 D，不要其他。"
   - 答案应该是单一的可验证值，例如：
     - 用户 ID、用户名、显示名称、名字、姓氏
     - 频道 ID、频道名称
     - 消息 ID、字符串
     - URL、标题
     - 数量
     - 时间戳、日期时间
     - 布尔值（对于真/假问题）
     - 电子邮件地址、电话号码
     - 文件 ID、文件名、文件扩展名
     - 多选答案
   - 答案不得需要特殊格式或复杂的结构化输出
   - 答案将使用直接字符串比较进行验证

### 可读性

2. **答案通常应该倾向于人类可读格式**
   - 示例：名称、名字、姓氏、日期时间、文件名、消息字符串、URL、是/否、真/假、a/b/c/d
   - 而不是不透明的 ID（尽管 ID 是可以接受的）
   - 绝大多数答案应该是人类可读的

### 稳定性

3. **答案必须是稳定的/静止的**
   - 查看旧内容（例如，已结束的对话、已启动的项目、已回答的问题）
   - 基于"封闭"概念创建问题，这些概念将始终返回相同的答案
   - 问题可能要求考虑固定的时间窗口以与非静止答案隔离
   - 依赖不太可能改变的上下文
   - 示例：如果查找论文名称，要足够具体，以免答案与以后发表的论文混淆

4. **答案必须是清晰和明确的**
   - 问题必须设计成只有一个清晰的答案
   - 答案可以通过使用 MCP server 工具得出

### 多样性

5. **答案必须是多样的**
   - 答案应该是多种模式和格式的单一可验证值
   - 用户概念：用户 ID、用户名、显示名称、名字、姓氏、电子邮件地址、电话号码
   - 频道概念：频道 ID、频道名称、频道主题
   - 消息概念：消息 ID、消息字符串、时间戳、月、日、年

6. **答案不得是复杂的结构**
   - 不是值列表
   - 不是复杂对象
   - 不是 ID 或字符串列表
   - 不是自然语言文本
   - 除非答案可以使用直接字符串比较直接验证
   - 并且可以现实地重现
   - LLM 不太可能以任何其他顺序或格式返回相同的列表

## 评估流程

### 步骤 1：文档检查

阅读目标 API 的文档以了解：
- 可用的端点和功能
- 如果存在歧义，从网络获取其他信息
- 尽可能并行化此步骤
- 确保每个子代理仅检查文件系统或网络上的文档

### 步骤 2：工具检查

列出 MCP server 中可用的工具：
- 直接检查 MCP server
- 了解输入/输出模式、文档字符串和描述
- 在此阶段不调用工具本身

### 步骤 3：发展理解

重复步骤 1 和 2，直到您有良好的理解：
- 多次迭代
- 思考您想要创建的任务类型
- 完善您的理解
- 在任何阶段都不应阅读 MCP server 实现本身的代码
- 使用您的直觉和理解来创建合理的、现实的但非常具有挑战性的任务

### 步骤 4：只读内容检查

在了解 API 和工具后，使用 MCP server 工具：
- 仅使用只读和非破坏性操作检查内容
- 目标：识别用于创建现实问题的特定内容（例如，用户、频道、消息、项目、任务）
- 不应调用任何修改状态的工具
- 不会阅读 MCP server 实现本身的代码
- 通过单独的子代理进行独立探索来并行化此步骤
- 确保每个子代理仅执行只读、非破坏性和幂等操作
- 小心：某些工具可能返回大量数据，这会导致您耗尽上下文
- 进行增量的、小的和有针对性的工具调用进行探索
- 在所有工具调用请求中，使用 `limit` 参数限制结果（<10）
- 使用分页

### 步骤 5：任务生成

检查内容后，创建 10 个人类可读的问题：
- LLM 应该能够使用 MCP server 回答这些问题
- 遵循上述所有问题和答案指南

## 输出格式

每个 QA 对由一个问题和一个答案组成。输出应该是具有此结构的 XML 文件：

```xml
<evaluation>
   <qa_pair>
      <question>找到在 2024 年第二季度创建的完成任务数最多的项目。项目名称是什么？</question>
      <answer>Website Redesign</answer>
   </qa_pair>
   <qa_pair>
      <question>搜索标记为"bug"并在 2024 年 3 月关闭的问题。哪个用户关闭的问题最多？提供他们的用户名。</question>
      <answer>sarah_dev</answer>
   </qa_pair>
   <qa_pair>
      <question>查找修改了 /api 目录中文件并在 2024 年 1 月 1 日至 1 月 31 日之间合并的拉取请求。有多少不同的贡献者参与了这些 PR？</question>
      <answer>7</answer>
   </qa_pair>
   <qa_pair>
      <question>找到在 2023 年之前创建的星标最多的仓库。仓库名称是什么？</question>
      <answer>data-pipeline</answer>
   </qa_pair>
</evaluation>
```

## 评估示例

### 好的问题

**示例 1：需要深入探索的多跳问题（GitHub MCP）**
```xml
<qa_pair>
   <question>找到在 2023 年第三季度归档并且之前是组织中 fork 最多的项目的仓库。该仓库使用的主要编程语言是什么？</question>
   <answer>Python</answer>
</qa_pair>
```

这个问题很好，因为：
- 需要多次搜索才能找到归档的仓库
- 需要确定哪个在归档之前 fork 最多
- 需要检查仓库详细信息以查找语言
- 答案是一个简单的、可验证的值
- 基于不会改变的历史（封闭）数据

**示例 2：需要理解上下文而无需关键字匹配（项目管理 MCP）**
```xml
<qa_pair>
   <question>找到专注于改善客户入职并在 2023 年底完成的计划。项目负责人在完成后创建了回顾文档。负责人当时的角色职位是什么？</question>
   <answer>Product Manager</answer>
</qa_pair>
```

这个问题很好，因为：
- 不使用特定的项目名称（"专注于改善客户入职的计划"）
- 需要从特定时间范围找到已完成的项目
- 需要识别项目负责人及其角色
- 需要从回顾文档中理解上下文
- 答案是人类可读且稳定的
- 基于已完成的工作（不会改变）

**示例 3：需要多个步骤的复杂聚合（问题跟踪器 MCP）**
```xml
<qa_pair>
   <question>在 2024 年 1 月报告的所有标记为关键优先级的 bug 中，哪个受让人在 48 小时内解决了其分配的 bug 的百分比最高？提供受让人的用户名。</question>
   <answer>alex_eng</answer>
</qa_pair>
```

这个问题很好，因为：
- 需要按日期、优先级和状态过滤 bug
- 需要按受让人分组并计算解决率
- 需要理解时间戳以确定 48 小时窗口
- 测试分页（可能有许多 bug 需要处理）
- 答案是单个用户名
- 基于特定时间段的历史数据

**示例 4：需要跨多种数据类型综合（CRM MCP）**
```xml
<qa_pair>
   <question>找到在 2023 年第四季度从 Starter 升级到 Enterprise 计划并且年度合同价值最高的帐户。该帐户在哪个行业运营？</question>
   <answer>Healthcare</answer>
</qa_pair>
```

这个问题很好，因为：
- 需要理解订阅层级变化
- 需要在特定时间范围内识别升级事件
- 需要比较合同价值
- 必须访问帐户行业信息
- 答案简单且可验证
- 基于已完成的历史交易

### 不好的问题

**示例 1：答案随时间变化**
```xml
<qa_pair>
   <question>当前分配给工程团队的开放问题有多少？</question>
   <answer>47</answer>
</qa_pair>
```

这个问题不好，因为：
- 随着问题的创建、关闭或重新分配，答案会改变
- 不基于稳定/静止的数据
- 依赖于动态的"当前状态"

**示例 2：关键字搜索太容易**
```xml
<qa_pair>
   <question>找到标题为"添加身份验证功能"的拉取请求，并告诉我谁创建了它。</question>
   <answer>developer123</answer>
</qa_pair>
```

这个问题不好，因为：
- 可以通过直接搜索确切标题的关键字搜索解决
- 不需要深入探索或理解
- 不需要综合或分析

**示例 3：答案格式模糊**
```xml
<qa_pair>
   <question>列出所有以 Python 作为主要语言的仓库。</question>
   <answer>repo1, repo2, repo3, data-pipeline, ml-tools</answer>
</qa_pair>
```

这个问题不好，因为：
- 答案是可以以任何顺序返回的列表
- 难以通过直接字符串比较验证
- LLM 可能会以不同的格式返回（JSON 数组、逗号分隔、换行分隔）
- 最好询问特定的聚合（计数）或最高级（星标最多）

## 验证流程

创建评估后：

1. **检查 XML 文件**以了解架构
2. **加载每个任务指令**，并使用 MCP server 和工具并行尝试自己解决任务以识别正确答案
3. **标记任何需要写入或破坏性操作的操作**
4. **累积所有正确答案**并替换文档中任何不正确的答案
5. **删除任何需要写入或破坏性操作的 `<qa_pair>`**

记住并行化解决任务以避免耗尽上下文，然后累积所有答案并在最后对文件进行更改。

## 创建高质量评估的提示

1. **提前认真思考和计划**再生成任务
2. **在机会出现时并行化**以加快流程并管理上下文
3. **专注于现实用例**，即人类实际想要完成的任务
4. **创建具有挑战性的问题**，测试 MCP server 功能的极限
5. **确保稳定性**，使用历史数据和封闭概念
6. **验证答案**，使用 MCP server 工具自己解决问题
7. **迭代和改进**，基于您在过程中学到的内容

---

# 运行评估

创建评估文件后，您可以使用提供的评估工具来测试您的 MCP server。

## 设置

1. **安装依赖项**

   ```bash
   pip install -r scripts/requirements.txt
   ```

   或手动安装：
   ```bash
   pip install anthropic mcp
   ```

2. **设置 API 密钥**

   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

## 评估文件格式

评估文件使用带有 `<qa_pair>` 元素的 XML 格式：

```xml
<evaluation>
   <qa_pair>
      <question>找到在 2024 年第二季度创建的完成任务数最多的项目。项目名称是什么？</question>
      <answer>Website Redesign</answer>
   </qa_pair>
   <qa_pair>
      <question>搜索标记为"bug"并在 2024 年 3 月关闭的问题。哪个用户关闭的问题最多？提供他们的用户名。</question>
      <answer>sarah_dev</answer>
   </qa_pair>
</evaluation>
```

## 运行评估

评估脚本（`scripts/evaluation.py`）支持三种传输类型：

**重要：**
- **stdio transport**：评估脚本会自动为您启动和管理 MCP server 进程。不要手动运行 server。
- **sse/http transports**：您必须在运行评估之前单独启动 MCP server。脚本连接到指定 URL 处已运行的 server。

### 1. 本地 STDIO Server

对于本地运行的 MCP server（脚本自动启动 server）：

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  evaluation.xml
```

使用环境变量：
```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  -e API_KEY=abc123 \
  -e DEBUG=true \
  evaluation.xml
```

### 2. Server-Sent Events (SSE)

对于基于 SSE 的 MCP server（您必须先启动 server）：

```bash
python scripts/evaluation.py \
  -t sse \
  -u https://example.com/mcp \
  -H "Authorization: Bearer token123" \
  -H "X-Custom-Header: value" \
  evaluation.xml
```

### 3. HTTP (Streamable HTTP)

对于基于 HTTP 的 MCP server（您必须先启动 server）：

```bash
python scripts/evaluation.py \
  -t http \
  -u https://example.com/mcp \
  -H "Authorization: Bearer token123" \
  evaluation.xml
```

## 命令行选项

```
usage: evaluation.py [-h] [-t {stdio,sse,http}] [-m MODEL] [-c COMMAND]
                     [-a ARGS [ARGS ...]] [-e ENV [ENV ...]] [-u URL]
                     [-H HEADERS [HEADERS ...]] [-o OUTPUT]
                     eval_file

positional arguments:
  eval_file             评估 XML 文件的路径

optional arguments:
  -h, --help            显示帮助信息
  -t, --transport       传输类型：stdio、sse 或 http（默认：stdio）
  -m, --model           要使用的 Claude 模型（默认：claude-3-7-sonnet-20250219）
  -o, --output          报告的输出文件（默认：打印到 stdout）

stdio options:
  -c, --command         运行 MCP server 的命令（例如，python、node）
  -a, --args            命令的参数（例如，server.py）
  -e, --env             KEY=VALUE 格式的环境变量

sse/http options:
  -u, --url             MCP server URL
  -H, --header          'Key: Value' 格式的 HTTP 标头
```

## 输出

评估脚本生成详细报告，包括：

- **摘要统计信息**：
  - 准确性（正确/总计）
  - 平均任务持续时间
  - 每个任务的平均工具调用次数
  - 总工具调用次数

- **每个任务的结果**：
  - 提示和预期响应
  - 代理的实际响应
  - 答案是否正确（✅/❌）
  - 持续时间和工具调用详细信息
  - 代理对其方法的总结
  - 代理对工具的反馈

### 将报告保存到文件

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_server.py \
  -o evaluation_report.md \
  evaluation.xml
```

## 完整示例工作流程

以下是创建和运行评估的完整示例：

1. **创建评估文件**（`my_evaluation.xml`）：

```xml
<evaluation>
   <qa_pair>
      <question>找到在 2024 年 1 月创建问题最多的用户。他们的用户名是什么？</question>
      <answer>alice_developer</answer>
   </qa_pair>
   <qa_pair>
      <question>在 2024 年第一季度合并的所有拉取请求中，哪个仓库的数量最多？提供仓库名称。</question>
      <answer>backend-api</answer>
   </qa_pair>
   <qa_pair>
      <question>找到在 2023 年 12 月完成并且从开始到结束持续时间最长的项目。花了多少天？</question>
      <answer>127</answer>
   </qa_pair>
</evaluation>
```

2. **安装依赖项**：

```bash
pip install -r scripts/requirements.txt
export ANTHROPIC_API_KEY=your_api_key
```

3. **运行评估**：

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a github_mcp_server.py \
  -e GITHUB_TOKEN=ghp_xxx \
  -o github_eval_report.md \
  my_evaluation.xml
```

4. **查看报告**在 `github_eval_report.md` 中：
   - 查看哪些问题通过/失败
   - 阅读代理对您的工具的反馈
   - 确定需要改进的领域
   - 迭代您的 MCP server 设计

## 故障排除

### 连接错误

如果遇到连接错误：
- **STDIO**：验证命令和参数是否正确
- **SSE/HTTP**：检查 URL 是否可访问且标头是否正确
- 确保在环境变量或标头中设置了所需的 API 密钥

### 低准确性

如果许多评估失败：
- 查看代理对每个任务的反馈
- 检查工具描述是否清晰全面
- 验证输入参数是否有良好的文档
- 考虑工具是否返回太多或太少数据
- 确保错误消息是可操作的

### 超时问题

如果任务超时：
- 使用更强大的模型（例如，`claude-3-7-sonnet-20250219`）
- 检查工具是否返回太多数据
- 验证分页是否正常工作
- 考虑简化复杂问题
