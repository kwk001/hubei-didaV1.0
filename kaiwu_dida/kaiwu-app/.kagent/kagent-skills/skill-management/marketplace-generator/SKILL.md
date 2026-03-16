---
name: marketplace-generator
name_chn: 技能市场生成器
description: AI 驱动的技能市场配置生成器，支持智能分类和增量更新
license: MIT
metadata:
  version: 1.0.0
  tags: skill-management, ai, automation, marketplace
  author: KaiWu
  category: skill-management
---

# Marketplace 生成器

## 功能概述

这是一个智能技能管理工具，能够自动扫描技能目录并使用 AI 生成优化的 `marketplace.json` 配置文件。

### 核心能力

- **智能分类**：使用 AI 理解技能的语义和功能，自动归类到合适的插件分类中
- **增量更新**：检测新增/修改/删除的技能，只更新变化部分，保留人工编辑的内容
- **零配置**：新技能自动发现和分类，无需手动维护配置文件
- **多种模式**：支持全新创建、智能更新和预览三种工作模式

## 工作模式

### 1. create（全新创建）

完整扫描技能目录，使用 AI 进行全量分类，生成全新的 marketplace.json 文件。

**适用场景**：
- 首次初始化技能市场
- 需要完全重构分类体系
- marketplace.json 文件丢失或损坏

**特点**：
- 扫描所有技能的 SKILL.md 文件
- 提取元数据（name, description, tags, content）
- 使用 AI 进行语义分析和智能分组
- 生成结构化的插件分类

### 2. update（增量更新）⭐ 推荐

智能检测技能变化，只对新增技能进行 AI 分类，保留现有的分类结构和人工优化的描述。

**适用场景**：
- 添加了新的技能
- 删除了某些技能
- 技能内容有更新
- 日常维护和更新

**工作流程**：
1. 读取现有的 marketplace.json
2. 扫描当前技能目录，获取最新技能列表
3. 对比差异，识别新增/删除/修改的技能
4. 对于新增技能：
   - 使用 AI 分析技能内容
   - 匹配最合适的现有分类
   - 如果没有合适分类，建议创建新分类
5. 更新 marketplace.json：
   - 在对应分类中添加新技能路径
   - 移除已删除技能的引用
   - **保持原有分类名称和描述不变**
6. 生成详细的变更报告

**保护机制**：
- ✅ 不会修改现有分类的名称
- ✅ 不会修改现有分类的描述
- ✅ 不会重新排列现有技能的顺序
- ✅ 只添加新技能和移除已删除的技能

### 3. preview（预览模式）

仅生成预览结果，不写入文件，用于检查分类效果。

**适用场景**：
- 想要查看 AI 的分类建议
- 评估新技能应该归入哪个分类
- 验证配置正确性

## 使用方法

### 输入参数

```json
{
  "skillsDirectory": "/path/to/skills",  // 技能目录路径（必填）
  "mode": "update",                       // 工作模式：create | update | preview（默认：update）
  "outputPath": "/path/to/marketplace.json", // 自定义输出路径（可选）
  "autoMerge": true                       // 是否自动合并新技能（默认：true）
}
```

### 参数说明

- **skillsDirectory**：要扫描的技能目录路径
  - 示例：`/path/to/project/.kagent/skills/system`
  - 必填参数

- **mode**：工作模式
  - `create`：全新创建（会覆盖现有文件）
  - `update`：增量更新（推荐，保留现有结构）
  - `preview`：仅预览，不写入文件
  - 默认值：`update`

- **outputPath**：marketplace.json 的输出路径
  - 可选参数
  - 如果不指定，默认输出到 `<skillsDirectory>/.kagent-plugin/marketplace.json`

- **autoMerge**：是否自动合并新技能到现有分类
  - `true`：自动将新技能归入最合适的分类
  - `false`：将所有新技能归入 "uncategorized" 分类，等待人工审核
  - 默认值：`true`

### 调用示例

#### 示例 1：增量更新（推荐）

```json
{
  "skillsDirectory": "/Users/project/.kagent/skills/system",
  "mode": "update"
}
```

#### 示例 2：全新创建

```json
{
  "skillsDirectory": "/Users/project/.kagent/skills/system",
  "mode": "create",
  "outputPath": "/custom/path/marketplace.json"
}
```

#### 示例 3：预览模式

```json
{
  "skillsDirectory": "/Users/project/.kagent/skills/system",
  "mode": "preview"
}
```

## 输出格式

### 成功响应

```json
{
  "success": true,
  "mode": "update",
  "outputPath": "/path/to/marketplace.json",
  "statistics": {
    "totalSkills": 20,
    "totalCategories": 7,
    "changes": {
      "added": 2,      // 新增技能数量
      "removed": 1,    // 删除技能数量
      "modified": 0    // 修改技能数量
    }
  },
  "changeReport": {
    "added": [
      {
        "skill": "./new-skill/awesome-feature",
        "category": "development-skills",
        "reason": "AI analysis: This skill provides code generation capabilities"
      }
    ],
    "removed": [
      {
        "skill": "./old-skill/deprecated-feature",
        "category": "development-skills"
      }
    ],
    "newCategories": []  // 如果创建了新分类
  },
  "preview": null  // 仅在 preview 模式下有内容
}
```

### Preview 模式响应

```json
{
  "success": true,
  "mode": "preview",
  "preview": {
    "name": "kagent-skills",
    "owner": { /* ... */ },
    "metadata": { /* ... */ },
    "plugins": [ /* 预览的分类结构 */ ]
  },
  "statistics": { /* ... */ }
}
```

## AI 分类策略

### 全量生成模式（create）

AI 会分析所有技能并进行智能分组：

1. **理解技能内容**
   - 阅读技能名称、描述、标签和正文内容
   - 识别核心功能和应用场景
   - 提取关键能力和依赖关系

2. **创建合理分类**
   - 将相关技能归类到同一插件
   - 每个分类代表一个连贯的功能域
   - 目标分类数量：5-10 个（不过多也不过少）
   - 使用清晰、专业的分类名称（如 `document-skills`、`lowcode-design-dev`）

3. **生成丰富描述**
   - 为每个分类创建详细的描述文本
   - 描述该分类提供的能力和价值
   - 帮助 LLM 快速判断是否包含所需技能

### 增量更新模式（update）

AI 只分析新增技能并匹配现有分类：

1. **分析新技能**
   - 理解新技能的功能和用途
   - 提取关键特征

2. **匹配现有分类**
   - 对比新技能与现有各分类的相似度
   - 选择最合适的分类
   - 相似度评分阈值：> 0.7

3. **创建新分类（可选）**
   - 如果新技能与所有现有分类相似度都 < 0.5
   - 建议创建新分类
   - 需要管理员确认（autoMerge=false 时）

## 技术实现

### 技能扫描

- 递归扫描指定目录
- 查找所有 `SKILL.md` 文件
- 支持嵌套目录结构（如 `document-skills/xlsx/SKILL.md`）
- 排除隐藏文件和 `node_modules`

### 元数据提取

从 SKILL.md 提取：
- **Frontmatter**：name, description, version, tags, author
- **正文内容**：功能描述、使用场景、示例（前 500 字符）

### 变更检测算法

```
1. 加载现有 marketplace.json
2. 获取现有技能列表：existingSkills = []
3. 扫描目录获取当前技能列表：currentSkills = []
4. 计算差异：
   - addedSkills = currentSkills - existingSkills
   - removedSkills = existingSkills - currentSkills
   - modifiedSkills = 检查 SKILL.md 修改时间
5. 返回变更集合
```

### AI 提示词结构

详见 `prompt.md` 文件，包含：
- **角色定义**：技能分类专家
- **任务说明**：分析和分类技能
- **输入格式**：技能元数据 JSON
- **输出要求**：分类结果 JSON
- **示例参考**：优秀的分类案例

## 集成到系统

### 自动初始化

在 `SkillManager.setupMarketplace()` 中集成：

```typescript
if (!marketplaceExists) {
  // 使用 create 模式创建新 marketplace
  await executeMarketplaceGenerator({ mode: 'create' });
} else {
  // 使用 update 模式增量更新
  await executeMarketplaceGenerator({ mode: 'update' });
}
```

### API 端点

```
POST /api/kagent/marketplace/generate
```

### 手动触发

通过前端界面或 CLI 命令手动触发生成。

## 最佳实践

### 1. 日常使用建议

- ✅ **优先使用 update 模式**：保留人工优化的分类和描述
- ✅ **定期预览**：使用 preview 模式检查新技能的分类建议
- ✅ **人工审核**：对于重要技能，建议人工审核分类结果
- ⚠️ **谨慎使用 create 模式**：会覆盖现有配置，仅在必要时使用

### 2. 分类命名规范

- 使用小写字母和连字符：`document-skills`、`lowcode-design-dev`
- 名称应具体而不是泛泛：避免 `utilities`、`tools` 这类通用名称
- 体现功能域：如 `visual-design-skills`、`communication-skills`

### 3. 描述编写建议

- 详细描述分类的能力和价值
- 列举主要包含的技能类型
- 帮助 LLM 快速判断相关性
- 示例：
  - ✅ "Collection of document processing suite including Excel, Word, PowerPoint, and PDF capabilities"
  - ❌ "Document tools"

### 4. 维护策略

- **小规模更新**：直接使用 update 模式
- **大规模重构**：先 preview 预览，确认后再 create
- **版本控制**：对 marketplace.json 进行 git 版本管理
- **备份重要配置**：在 create 模式前备份现有文件

## 故障排除

### 问题 1：AI 分类不准确

**解决方案**：
- 检查 SKILL.md 的描述是否清晰
- 添加更多相关的 tags
- 使用 preview 模式查看 AI 的分析逻辑
- 手动调整后使用 update 模式保留修改

### 问题 2：新技能总是归入错误分类

**解决方案**：
- 设置 `autoMerge: false`，让新技能进入 uncategorized
- 人工审核后手动分配
- 考虑创建新的更具体的分类

### 问题 3：生成的 JSON 格式错误

**解决方案**：
- 检查 AI 响应格式
- 验证 JSON schema
- 查看错误日志
- 降级使用静态分类方法

## 依赖和要求

- **SkillExecutor**：用于调用 AI 能力
- **fs-extra**：文件系统操作
- **AI 模型**：支持结构化输出的 LLM
- **技能格式**：符合 SKILL.md frontmatter 规范

## 扩展性

### 未来增强方向

- [ ] 支持自定义分类规则
- [ ] 多语言描述生成
- [ ] 分类相似度可视化
- [ ] 批量技能迁移工具
- [ ] 自动标签建议
- [ ] 技能依赖关系分析

## 版本历史

- **v1.0.0** (2025-01)
  - 初始版本
  - 支持 create/update/preview 三种模式
  - 实现增量更新机制
  - AI 驱动的智能分类
