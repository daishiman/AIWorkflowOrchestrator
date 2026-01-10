# MCP Server Patterns 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: 初回使用時

---

## サーバー構造

### 3 層アーキテクチャ

| 層             | 役割                            |
| -------------- | ------------------------------- |
| Transport      | MCP プロトコル通信 (stdio/HTTP) |
| Tool           | ツール定義・公開                |
| Business Logic | 実際の機能実装                  |

```
┌─────────────────────────────┐
│   Transport (MCP Protocol)  │
├─────────────────────────────┤
│   Tool Definitions          │
├─────────────────────────────┤
│   Business Logic            │
└─────────────────────────────┘
```

---

## サーバー構造パターン

### Pattern 1: Simple Server (1-5 tools)

```
src/
├── index.ts
├── server.ts
└── tools/
    ├── tool1.ts
    └── tool2.ts
```

**特徴**: フラット構造、直接登録、最小抽象化

### Pattern 2: Modular Server (6-20 tools)

```
src/
├── index.ts
├── server.ts
├── tools/
│   ├── group-a/
│   │   └── tool1.ts
│   └── group-b/
│       └── tool2.ts
└── services/
    └── shared-logic.ts
```

**特徴**: 機能別グループ化、共有サービス抽出

### Pattern 3: Domain-Driven (20+ tools)

```
src/
├── index.ts
├── domains/
│   ├── domain-a/
│   │   ├── tools/
│   │   ├── services/
│   │   └── index.ts
│   └── domain-b/
│       └── ...
└── infrastructure/
    └── shared/
```

**特徴**: 明確なドメイン境界、最大保守性

---

## 基本ツール定義

```typescript
import { z } from "zod";

const MyToolInputSchema = z.object({
  param1: z.string().describe("Description of param1"),
  param2: z.number().optional().describe("Optional param2"),
});

export const myTool = {
  name: "my-tool",
  description: "Clear description of what this tool does",
  inputSchema: MyToolInputSchema,
  handler: async (args: z.infer<typeof MyToolInputSchema>) => {
    const validated = MyToolInputSchema.parse(args);

    try {
      const result = await doSomething(validated.param1);
      return {
        content: [{ type: "text", text: `Success: ${result}` }],
      };
    } catch (error) {
      throw new Error(`Failed to execute: ${error.message}`);
    }
  },
};
```

---

## 基本エラーハンドリング

```typescript
handler: async (args) => {
  try {
    const result = await operation(args);
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(`Invalid input: ${error.message}`);
    }
    if (error instanceof NotFoundError) {
      throw new Error(`Resource not found: ${error.message}`);
    }
    throw new Error(`Operation failed: ${error.message}`);
  }
};
```

---

## サーバー初期化

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "my-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 設計原則

### 関心の分離

```typescript
// Good: ビジネスロジック分離
const businessLogic = {
  async processData(input: string): Promise<string> {
    return input.toUpperCase();
  },
};

const tool = {
  handler: async (args) => {
    const result = await businessLogic.processData(args.input);
    return { content: [{ type: "text", text: result }] };
  },
};
```

### 単一責任

```typescript
// Good: 単一責任
export const readFileTool = {
  name: "read-file",
  description: "Read contents of a file",
  handler: async (args) => await fileService.read(args.path),
};

export const writeFileTool = {
  name: "write-file",
  description: "Write contents to a file",
  handler: async (args) => await fileService.write(args.path, args.content),
};
```

---

## 関連リソース

- **高度なパターン**: See [patterns.md](patterns.md)
