# MCP Server Patterns 設計パターン

> **相対パス**: `references/patterns.md`
> **読込条件**: 設計時

---

## 依存性注入

### コンストラクタ注入

```typescript
export class DependencyContainer {
  private readonly fileService: FileService;
  private readonly apiClient: ApiClient;

  constructor(config: ServerConfig) {
    this.fileService = new FileService(config.basePath);
    this.apiClient = new ApiClient(config.apiUrl, config.apiKey);
  }
}

export function createServer(config: ServerConfig) {
  const container = new DependencyContainer(config);
  const server = new Server(/* ... */);

  registerFileTools(server, container.getFileService());
  return server;
}
```

### ファクトリパターン

```typescript
export function createReadFileTool(fileService: FileService) {
  return {
    name: "read-file",
    inputSchema: ReadFileSchema,
    handler: async (args: ReadFileArgs) => {
      const content = await fileService.read(args.path);
      return { content: [{ type: "text", text: content }] };
    },
  };
}
```

---

## エラー分類

```typescript
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND");
  }
}
```

### 中央集権エラーハンドラ

```typescript
export function handleToolError(error: unknown) {
  if (error instanceof ValidationError) {
    return {
      isError: true,
      content: [{ type: "text", text: `Validation failed: ${error.message}` }],
    };
  }
  if (error instanceof NotFoundError) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }],
    };
  }
  console.error("Unexpected error:", error);
  return {
    isError: true,
    content: [{ type: "text", text: "An unexpected error occurred" }],
  };
}
```

---

## 状態管理

### Stateful Server Pattern

```typescript
export class ServerState {
  private sessions: Map<string, SessionData> = new Map();
  private cache: Map<string, CacheEntry> = new Map();

  createSession(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, {
      ...data,
      createdAt: new Date(),
      lastAccessed: new Date(),
    });
  }

  setCache(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiresAt: new Date(Date.now() + ttl),
    });
  }

  cleanup(): void {
    const now = new Date();
    // Session/Cache cleanup logic
  }
}
```

---

## 回復性パターン

### Retry with Exponential Backoff

```typescript
export async function withRetry<T>(
  operation: () => Promise<T>,
  policy: { maxRetries: number; initialDelay: number; maxDelay: number },
  isRetryable: (error: any) => boolean = () => true,
): Promise<T> {
  let delay = policy.initialDelay;

  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === policy.maxRetries || !isRetryable(error)) throw error;
      await sleep(delay);
      delay = Math.min(delay * 2, policy.maxDelay);
    }
  }
  throw new Error("Retry exhausted");
}
```

### Circuit Breaker

```typescript
export class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.shouldAttemptReset()) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

---

## ヘキサゴナルアーキテクチャ

```
src/
├── domain/              # コアビジネスロジック
│   ├── models/
│   ├── services/
│   └── ports/           # 外部依存のインターフェース
├── application/         # ユースケース・オーケストレーション
│   ├── use-cases/
│   └── tools/           # MCP ツール定義
└── infrastructure/      # アダプター（外部実装）
    ├── mcp/
    ├── file-system/
    └── http/
```

---

## テストパターン

### Unit Test

```typescript
describe("ReadFileTool", () => {
  let mockFileService: FileService;
  let tool: Tool;

  beforeEach(() => {
    mockFileService = { read: vi.fn() };
    tool = createReadFileTool(mockFileService);
  });

  it("should read file successfully", async () => {
    mockFileService.read.mockResolvedValue("file content");
    const result = await tool.handler({ path: "test.txt" });
    expect(result.content[0].text).toBe("file content");
  });
});
```

### Integration Test

```typescript
describe("Server Integration", () => {
  it("should handle complete request lifecycle", async () => {
    const server = createServer(config);
    const transport = createTestTransport();
    await server.connect(transport);

    const response = await transport.request({
      method: "tools/call",
      params: { name: "read-file", arguments: { path: "test.txt" } },
    });

    expect(response.content[0].text).toBeDefined();
  });
});
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
