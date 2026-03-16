# Node/TypeScript MCP Server 实现指南

## 概述

本文档提供了使用 MCP TypeScript SDK 实现 MCP server 的 Node/TypeScript 特定最佳实践和示例。它涵盖了项目结构、server 设置、工具注册模式、使用 Zod 的输入验证、错误处理和完整的工作示例。

---

## 快速参考

### 关键导入
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
```

### Server 初始化
```typescript
const server = new McpServer({
  name: "service-mcp-server",
  version: "1.0.0"
});
```

### 工具注册模式
```typescript
server.registerTool("tool_name", {...config}, async (params) => {
  // 实现
});
```

---

## MCP TypeScript SDK

官方 MCP TypeScript SDK 提供：
- 用于 server 初始化的 `McpServer` 类
- 用于工具注册的 `registerTool` 方法
- Zod schema 集成以进行运行时输入验证
- 类型安全的工具处理程序实现

有关完整详细信息，请参阅参考资料中的 MCP SDK 文档。

## Server 命名约定

Node/TypeScript MCP server 必须遵循此命名模式：
- **格式**：`{service}-mcp-server`（小写带连字符）
- **示例**：`github-mcp-server`、`jira-mcp-server`、`stripe-mcp-server`

名称应该：
- 通用（不与特定功能绑定）
- 描述正在集成的服务/API
- 易于从任务描述推断
- 没有版本号或日期

## 项目结构

为 Node/TypeScript MCP server 创建以下结构：

```
{service}-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # 带有 McpServer 初始化的主入口点
│   ├── types.ts          # TypeScript 类型定义和接口
│   ├── tools/            # 工具实现（每个域一个文件）
│   ├── services/         # API 客户端和共享实用程序
│   ├── schemas/          # Zod 验证 schema
│   └── constants.ts      # 共享常量（API_URL、CHARACTER_LIMIT 等）
└── dist/                 # 构建的 JavaScript 文件（入口点：dist/index.js）
```

## 工具实现

### 工具命名

为工具名称使用 snake_case（例如，"search_users"、"create_project"、"get_channel_info"），使用清晰的、以动作为导向的名称。

**避免命名冲突**：包含服务上下文以防止重叠：
- 使用 "slack_send_message" 而不是只是 "send_message"
- 使用 "github_create_issue" 而不是只是 "create_issue"
- 使用 "asana_list_tasks" 而不是只是 "list_tasks"

### 工具结构

工具使用 `registerTool` 方法注册，具有以下要求：
- 使用 Zod schema 进行运行时输入验证和类型安全
- `description` 字段必须显式提供 - JSDoc 注释不会自动提取
- 显式提供 `title`、`description`、`inputSchema` 和 `annotations`
- `inputSchema` 必须是 Zod schema 对象（不是 JSON schema）
- 显式类型化所有参数和返回值

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "example-mcp",
  version: "1.0.0"
});

// 用于输入验证的 Zod schema
const UserSearchInputSchema = z.object({
  query: z.string()
    .min(2, "查询必须至少 2 个字符")
    .max(200, "查询不得超过 200 个字符")
    .describe("要与名称/电子邮件匹配的搜索字符串"),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("要返回的最大结果数"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("用于分页要跳过的结果数"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("输出格式：'markdown' 用于人类可读或 'json' 用于机器可读")
}).strict();

// 从 Zod schema 的类型定义
type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

server.registerTool(
  "example_search_users",
  {
    title: "Search Example Users",
    description: `按名称、电子邮件或团队在 Example 系统中搜索用户。

此工具在 Example 平台中搜索所有用户配置文件，支持部分匹配和各种搜索过滤器。它不会创建或修改用户，只搜索现有用户。

Args:
  - query (string): 要与名称/电子邮件匹配的搜索字符串
  - limit (number): 要返回的最大结果数，介于 1-100 之间（默认：20）
  - offset (number): 用于分页要跳过的结果数（默认：0）
  - response_format ('markdown' | 'json'): 输出格式（默认：'markdown'）

Returns:
  对于 JSON 格式：具有 schema 的结构化数据：
  {
    "total": number,           // 找到的匹配总数
    "count": number,           // 此响应中的结果数
    "offset": number,          // 当前分页偏移量
    "users": [
      {
        "id": string,          // 用户 ID（例如，"U123456789"）
        "name": string,        // 全名（例如，"John Doe"）
        "email": string,       // 电子邮件地址
        "team": string,        // 团队名称（可选）
        "active": boolean      // 用户是否活跃
      }
    ],
    "has_more": boolean,       // 是否有更多结果可用
    "next_offset": number      // 下一页的偏移量（如果 has_more 为 true）
  }

Examples:
  - 使用场景："查找所有营销团队成员" -> 使用 query="team:marketing" 的参数
  - 使用场景："搜索 John 的帐户" -> 使用 query="john" 的参数
  - 不使用场景：您需要创建用户（请改用 example_create_user）

Error Handling:
  - 如果请求过多（429 状态），返回 "Error: Rate limit exceeded"
  - 如果搜索返回空，返回 "No users found matching '<query>'"`,
    inputSchema: UserSearchInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: UserSearchInput) => {
    try {
      // 输入验证由 Zod schema 处理
      // 使用验证的参数进行 API 请求
      const data = await makeApiRequest<any>(
        "users/search",
        "GET",
        undefined,
        {
          q: params.query,
          limit: params.limit,
          offset: params.offset
        }
      );

      const users = data.users || [];
      const total = data.total || 0;

      if (!users.length) {
        return {
          content: [{
            type: "text",
            text: `No users found matching '${params.query}'`
          }]
        };
      }

      // 根据请求的格式格式化响应
      let result: string;

      if (params.response_format === ResponseFormat.MARKDOWN) {
        // 人类可读的 markdown 格式
        const lines: string[] = [`# User Search Results: '${params.query}'`, ""];
        lines.push(`Found ${total} users (showing ${users.length})`);
        lines.push("");

        for (const user of users) {
          lines.push(`## ${user.name} (${user.id})`);
          lines.push(`- **Email**: ${user.email}`);
          if (user.team) {
            lines.push(`- **Team**: ${user.team}`);
          }
          lines.push("");
        }

        result = lines.join("\n");

      } else {
        // 机器可读的 JSON 格式
        const response: any = {
          total,
          count: users.length,
          offset: params.offset,
          users: users.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            ...(user.team ? { team: user.team } : {}),
            active: user.active ?? true
          }))
        };

        // 如果有更多结果，添加分页信息
        if (total > params.offset + users.length) {
          response.has_more = true;
          response.next_offset = params.offset + users.length;
        }

        result = JSON.stringify(response, null, 2);
      }

      return {
        content: [{
          type: "text",
          text: result
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleApiError(error)
        }]
      };
    }
  }
);
```

## 用于输入验证的 Zod Schema

Zod 提供运行时类型验证：

```typescript
import { z } from "zod";

// 带验证的基本 schema
const CreateUserSchema = z.object({
  name: z.string()
    .min(1, "名称是必需的")
    .max(100, "名称不得超过 100 个字符"),
  email: z.string()
    .email("无效的电子邮件格式"),
  age: z.number()
    .int("年龄必须是整数")
    .min(0, "年龄不能为负")
    .max(150, "年龄不能大于 150")
}).strict();  // 使用 .strict() 禁止额外字段

// 枚举
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const SearchSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("输出格式")
});

// 带默认值的可选字段
const PaginationSchema = z.object({
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("要返回的最大结果数"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("要跳过的结果数")
});
```

## 响应格式选项

支持多种输出格式以实现灵活性：

```typescript
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const inputSchema = z.object({
  query: z.string(),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("输出格式：'markdown' 用于人类可读或 'json' 用于机器可读")
});
```

**Markdown 格式**：
- 使用标题、列表和格式以提高清晰度
- 将时间戳转换为人类可读格式
- 显示名称并在括号中显示 ID
- 省略冗长的元数据
- 逻辑地分组相关信息

**JSON 格式**：
- 返回适合程序化处理的完整结构化数据
- 包含所有可用字段和元数据
- 使用一致的字段名称和类型

## 分页实现

对于列出资源的工具：

```typescript
const ListSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

async function listItems(params: z.infer<typeof ListSchema>) {
  const data = await apiRequest(params.limit, params.offset);

  const response = {
    total: data.total,
    count: data.items.length,
    offset: params.offset,
    items: data.items,
    has_more: data.total > params.offset + data.items.length,
    next_offset: data.total > params.offset + data.items.length
      ? params.offset + data.items.length
      : undefined
  };

  return JSON.stringify(response, null, 2);
}
```

## 字符限制和截断

添加 CHARACTER_LIMIT 常量以防止响应过载：

```typescript
// 在 constants.ts 的模块级别
export const CHARACTER_LIMIT = 25000;  // 字符中的最大响应大小

async function searchTool(params: SearchInput) {
  let result = generateResponse(data);

  // 检查字符限制并根据需要截断
  if (result.length > CHARACTER_LIMIT) {
    const truncatedData = data.slice(0, Math.max(1, data.length / 2));
    response.data = truncatedData;
    response.truncated = true;
    response.truncation_message =
      `响应从 ${data.length} 项截断为 ${truncatedData.length} 项。` +
      `使用 'offset' 参数或添加过滤器以查看更多结果。`;
    result = JSON.stringify(response, null, 2);
  }

  return result;
}
```

## 错误处理

提供清晰的、可操作的错误消息：

```typescript
import axios, { AxiosError } from "axios";

function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return "错误：找不到资源。请检查 ID 是否正确。";
        case 403:
          return "错误：权限被拒绝。您无权访问此资源。";
        case 429:
          return "错误：超出速率限制。请在发出更多请求之前等待。";
        default:
          return `错误：API 请求失败，状态 ${error.response.status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "错误：请求超时。请重试。";
    }
  }
  return `错误：发生意外错误：${error instanceof Error ? error.message : String(error)}`;
}
```

## 共享实用程序

将常用功能提取到可重用函数中：

```typescript
// 共享 API 请求函数
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      data,
      params,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

## Async/Await 最佳实践

始终对网络请求和 I/O 操作使用 async/await：

```typescript
// 好：异步网络请求
async function fetchData(resourceId: string): Promise<ResourceData> {
  const response = await axios.get(`${API_URL}/resource/${resourceId}`);
  return response.data;
}

// 坏：Promise 链
function fetchData(resourceId: string): Promise<ResourceData> {
  return axios.get(`${API_URL}/resource/${resourceId}`)
    .then(response => response.data);  // 更难阅读和维护
}
```

## TypeScript 最佳实践

1. **使用严格的 TypeScript**：在 tsconfig.json 中启用严格模式
2. **定义接口**：为所有数据结构创建清晰的接口定义
3. **避免 `any`**：使用适当的类型或 `unknown` 而不是 `any`
4. **运行时验证的 Zod**：使用 Zod schema 验证外部数据
5. **类型保护**：为复杂的类型检查创建类型保护函数
6. **错误处理**：始终使用带有适当错误类型检查的 try-catch
7. **空安全**：使用可选链（`?.`）和空值合并（`??`）

```typescript
// 好：使用 Zod 和接口的类型安全
interface UserResponse {
  id: string;
  name: string;
  email: string;
  team?: string;
  active: boolean;
}

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  team: z.string().optional(),
  active: z.boolean()
});

type User = z.infer<typeof UserSchema>;

async function getUser(id: string): Promise<User> {
  const data = await apiCall(`/users/${id}`);
  return UserSchema.parse(data);  // 运行时验证
}

// 坏：使用 any
async function getUser(id: string): Promise<any> {
  return await apiCall(`/users/${id}`);  // 没有类型安全
}
```

## 包配置

### package.json

```json
{
  "name": "{service}-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for {Service} API integration",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.6.1",
    "axios": "^1.7.9",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 完整示例

```typescript
#!/usr/bin/env node
/**
 * MCP Server for Example Service.
 *
 * This server provides tools to interact with Example API, including user search,
 * project management, and data export capabilities.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";

// 常量
const API_BASE_URL = "https://api.example.com/v1";
const CHARACTER_LIMIT = 25000;

// 枚举
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// Zod schema
const UserSearchInputSchema = z.object({
  query: z.string()
    .min(2, "查询必须至少 2 个字符")
    .max(200, "查询不得超过 200 个字符")
    .describe("要与名称/电子邮件匹配的搜索字符串"),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("要返回的最大结果数"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("用于分页要跳过的结果数"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("输出格式：'markdown' 用于人类可读或 'json' 用于机器可读")
}).strict();

type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

// 共享实用程序函数
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      data,
      params,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return "错误：找不到资源。请检查 ID 是否正确。";
        case 403:
          return "错误：权限被拒绝。您无权访问此资源。";
        case 429:
          return "错误：超出速率限制。请在发出更多请求之前等待。";
        default:
          return `错误：API 请求失败，状态 ${error.response.status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "错误：请求超时。请重试。";
    }
  }
  return `错误：发生意外错误：${error instanceof Error ? error.message : String(error)}`;
}

// 创建 MCP server 实例
const server = new McpServer({
  name: "example-mcp",
  version: "1.0.0"
});

// 注册工具
server.registerTool(
  "example_search_users",
  {
    title: "Search Example Users",
    description: `[如上所示的完整描述]`,
    inputSchema: UserSearchInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: UserSearchInput) => {
    // 如上所示的实现
  }
);

// 主函数
async function main() {
  // 如果需要，验证环境变量
  if (!process.env.EXAMPLE_API_KEY) {
    console.error("ERROR: EXAMPLE_API_KEY environment variable is required");
    process.exit(1);
  }

  // 创建传输
  const transport = new StdioServerTransport();

  // 将 server 连接到传输
  await server.connect(transport);

  console.error("Example MCP server running via stdio");
}

// 运行 server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

---

## 高级 MCP 功能

### 资源注册

将数据作为资源公开以实现高效的、基于 URI 的访问：

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";

// 使用 URI 模板注册资源
server.registerResource(
  {
    uri: "file://documents/{name}",
    name: "Document Resource",
    description: "按名称访问文档",
    mimeType: "text/plain"
  },
  async (uri: string) => {
    // 从 URI 提取参数
    const match = uri.match(/^file:\/\/documents\/(.+)$/);
    if (!match) {
      throw new Error("Invalid URI format");
    }

    const documentName = match[1];
    const content = await loadDocument(documentName);

    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: content
      }]
    };
  }
);

// 动态列出可用资源
server.registerResourceList(async () => {
  const documents = await getAvailableDocuments();
  return {
    resources: documents.map(doc => ({
      uri: `file://documents/${doc.name}`,
      name: doc.name,
      mimeType: "text/plain",
      description: doc.description
    }))
  };
});
```

**何时使用资源 vs 工具：**
- **资源**：用于具有简单基于 URI 的参数的数据访问
- **工具**：用于需要验证和业务逻辑的复杂操作
- **资源**：当数据相对静态或基于模板时
- **工具**：当操作有副作用或复杂工作流时

### 多种传输选项

TypeScript SDK 支持不同的传输机制：

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Stdio transport（默认 - 用于 CLI 工具）
const stdioTransport = new StdioServerTransport();
await server.connect(stdioTransport);

// SSE transport（用于实时 Web 更新）
const sseTransport = new SSEServerTransport("/message", response);
await server.connect(sseTransport);

// HTTP transport（用于 Web 服务）
// 根据您的 HTTP 框架集成进行配置
```

**传输选择指南：**
- **Stdio**：命令行工具、子进程集成、本地开发
- **HTTP**：Web 服务、远程访问、多个同时客户端
- **SSE**：实时更新、服务器推送通知、Web 仪表板

### 通知支持

在 server 状态更改时通知客户端：

```typescript
// 当工具列表更改时通知
server.notification({
  method: "notifications/tools/list_changed"
});

// 当资源更改时通知
server.notification({
  method: "notifications/resources/list_changed"
});
```

谨慎使用通知 - 仅在 server 功能真正更改时使用。

---

## 代码最佳实践

### 代码可组合性和可重用性

您的实现必须优先考虑可组合性和代码重用：

1. **提取常用功能**：
   - 为跨多个工具使用的操作创建可重用的辅助函数
   - 为 HTTP 请求构建共享 API 客户端，而不是复制代码
   - 在实用程序函数中集中错误处理逻辑
   - 将业务逻辑提取到可以组合的专用函数中
   - 提取共享的 markdown 或 JSON 字段选择和格式化功能

2. **避免重复**：
   - 永远不要在工具之间复制粘贴相似的代码
   - 如果您发现自己两次编写相似的逻辑，请将其提取到函数中
   - 分页、过滤、字段选择和格式化等常见操作应该是共享的
   - 身份验证/授权逻辑应该集中

## 构建和运行

在运行之前始终构建您的 TypeScript 代码：

```bash
# 构建项目
npm run build

# 运行 server
npm start

# 带自动重载的开发
npm run dev
```

在认为实现完成之前，始终确保 `npm run build` 成功完成。

## 质量检查清单

在最终确定 Node/TypeScript MCP server 实现之前，请确保：

### 战略设计
- [ ] 工具启用完整的工作流程，而不仅仅是 API 端点包装器
- [ ] 工具名称反映自然任务细分
- [ ] 响应格式优化代理上下文效率
- [ ] 在适当的地方使用人类可读的标识符
- [ ] 错误消息引导代理正确使用

### 实现质量
- [ ] 专注实现：实现了最重要和最有价值的工具
- [ ] 所有工具使用 `registerTool` 注册，具有完整配置
- [ ] 所有工具包括 `title`、`description`、`inputSchema` 和 `annotations`
- [ ] 注释正确设置（readOnlyHint、destructiveHint、idempotentHint、openWorldHint）
- [ ] 所有工具使用 Zod schema 进行运行时输入验证，并强制执行 `.strict()`
- [ ] 所有 Zod schema 具有适当的约束和描述性错误消息
- [ ] 所有工具都有具有显式输入/输出类型的全面描述
- [ ] 描述包括返回值示例和完整的 schema 文档
- [ ] 错误消息清晰、可操作且具有教育意义

### TypeScript 质量
- [ ] 为所有数据结构定义了 TypeScript 接口
- [ ] 在 tsconfig.json 中启用了严格的 TypeScript
- [ ] 不使用 `any` 类型 - 使用 `unknown` 或适当的类型
- [ ] 所有异步函数都有显式的 Promise<T> 返回类型
- [ ] 错误处理使用适当的类型保护（例如，`axios.isAxiosError`、`z.ZodError`）

### 高级功能（如果适用）
- [ ] 为适当的数据端点注册了资源
- [ ] 配置了适当的传输（stdio、HTTP、SSE）
- [ ] 为动态 server 功能实现了通知
- [ ] 使用 SDK 接口的类型安全

### 项目配置
- [ ] Package.json 包含所有必要的依赖项
- [ ] 构建脚本在 dist/ 目录中生成工作的 JavaScript
- [ ] 主入口点正确配置为 dist/index.js
- [ ] Server 名称遵循格式：`{service}-mcp-server`
- [ ] tsconfig.json 使用严格模式正确配置

### 代码质量
- [ ] 在适用的地方正确实现了分页
- [ ] 大型响应检查 CHARACTER_LIMIT 常量并使用清晰的消息截断
- [ ] 为可能很大的结果集提供了过滤选项
- [ ] 所有网络操作都优雅地处理超时和连接错误
- [ ] 常用功能提取到可重用函数中
- [ ] 返回类型在类似操作中保持一致

### 测试和构建
- [ ] `npm run build` 成功完成，没有错误
- [ ] 创建了 dist/index.js 并可执行
- [ ] Server 运行：`node dist/index.js --help`
- [ ] 所有导入正确解析
- [ ] 示例工具调用按预期工作
