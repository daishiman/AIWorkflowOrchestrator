# Level 2: Intermediate MCP Server Patterns

## Tool Organization Strategies

### Domain-Based Organization

Group tools by business capability rather than technical function:

```
src/domains/
├── file-operations/
│   ├── tools/
│   │   ├── read-file.ts
│   │   ├── write-file.ts
│   │   └── list-files.ts
│   ├── services/
│   │   └── file-service.ts
│   └── index.ts
├── data-processing/
│   ├── tools/
│   │   ├── transform-data.ts
│   │   └── validate-data.ts
│   ├── services/
│   │   └── processor-service.ts
│   └── index.ts
└── external-api/
    ├── tools/
    │   ├── fetch-data.ts
    │   └── send-request.ts
    ├── services/
    │   └── api-client.ts
    └── index.ts
```

**Benefits**:

- Clear boundaries between domains
- Tools grouped by business purpose
- Easier to understand and maintain
- Supports team ownership

### Service Layer Pattern

Extract shared logic into services:

```typescript
// services/file-service.ts
export class FileService {
  constructor(private readonly basePath: string) {}

  async read(path: string): Promise<string> {
    const fullPath = this.resolvePath(path);
    this.validatePath(fullPath);
    return await fs.readFile(fullPath, "utf-8");
  }

  async write(path: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    this.validatePath(fullPath);
    await fs.writeFile(fullPath, content, "utf-8");
  }

  private resolvePath(path: string): string {
    return join(this.basePath, path);
  }

  private validatePath(path: string): void {
    if (!path.startsWith(this.basePath)) {
      throw new Error("Path outside allowed directory");
    }
  }
}

// tools/read-file.ts
export const readFileTool = {
  name: "read-file",
  description: "Read file contents",
  inputSchema: z.object({
    path: z.string().describe("File path"),
  }),
  handler: async (args, { fileService }: Dependencies) => {
    const content = await fileService.read(args.path);
    return {
      content: [{ type: "text", text: content }],
    };
  },
};
```

## Dependency Injection

### Constructor Injection Pattern

```typescript
// infrastructure/dependency-container.ts
export class DependencyContainer {
  private readonly fileService: FileService;
  private readonly apiClient: ApiClient;

  constructor(config: ServerConfig) {
    this.fileService = new FileService(config.basePath);
    this.apiClient = new ApiClient(config.apiUrl, config.apiKey);
  }

  getFileService(): FileService {
    return this.fileService;
  }

  getApiClient(): ApiClient {
    return this.apiClient;
  }
}

// server.ts
export function createServer(config: ServerConfig) {
  const container = new DependencyContainer(config);
  const server = new Server(/* ... */);

  // Register tools with dependencies
  registerFileTools(server, container.getFileService());
  registerApiTools(server, container.getApiClient());

  return server;
}
```

### Factory Pattern for Tools

```typescript
// tools/tool-factory.ts
export function createReadFileTool(fileService: FileService) {
  return {
    name: "read-file",
    description: "Read file contents",
    inputSchema: ReadFileSchema,
    handler: async (args: ReadFileArgs) => {
      const content = await fileService.read(args.path);
      return { content: [{ type: "text", text: content }] };
    },
  };
}

// domain registration
export function registerFileTools(server: Server, fileService: FileService) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      createReadFileTool(fileService),
      createWriteFileTool(fileService),
      createListFilesTool(fileService),
    ],
  }));
}
```

## Input Validation Patterns

### Comprehensive Schema Validation

```typescript
import { z } from "zod";

// Define detailed schemas with validations
const ReadFileSchema = z.object({
  path: z
    .string()
    .min(1, "Path cannot be empty")
    .regex(/^[a-zA-Z0-9\/_.-]+$/, "Invalid characters in path")
    .describe("Relative file path"),
  encoding: z
    .enum(["utf-8", "ascii", "base64"])
    .default("utf-8")
    .describe("File encoding"),
});

// Custom validators
const CreateFileSchema = z.object({
  path: z
    .string()
    .refine(
      (path) => !path.includes(".."),
      "Path cannot contain parent directory references",
    ),
  content: z.string().max(1024 * 1024, "Content too large (max 1MB)"),
  overwrite: z.boolean().default(false),
});

// Conditional validation
const QueryDataSchema = z
  .object({
    source: z.enum(["database", "api", "file"]),
    query: z.string(),
  })
  .refine((data) => {
    if (data.source === "database") {
      return /^SELECT/i.test(data.query);
    }
    return true;
  }, "Database queries must start with SELECT");
```

### Input Sanitization

```typescript
handler: async (args) => {
  // Parse and validate
  const validated = Schema.parse(args);

  // Sanitize inputs
  const sanitized = {
    path: sanitizePath(validated.path),
    content: escapeHtml(validated.content),
  };

  // Process with sanitized inputs
  return await processFile(sanitized);
};

function sanitizePath(path: string): string {
  return path
    .replace(/\\/g, "/") // Normalize separators
    .replace(/\/+/g, "/") // Remove duplicate slashes
    .replace(/^\//, "") // Remove leading slash
    .replace(/\.\./g, ""); // Remove parent references
}
```

## Error Handling Patterns

### Error Classification

```typescript
// domain/errors.ts
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";
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

export class PermissionError extends DomainError {
  constructor(operation: string) {
    super(`Permission denied: ${operation}`, "PERMISSION_DENIED");
  }
}
```

### Centralized Error Handler

```typescript
// infrastructure/error-handler.ts
export function handleToolError(error: unknown) {
  if (error instanceof ValidationError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Validation failed: ${error.message}`,
        },
      ],
    };
  }

  if (error instanceof NotFoundError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error.message,
        },
      ],
    };
  }

  if (error instanceof PermissionError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Access denied: ${error.message}`,
        },
      ],
    };
  }

  // Unknown error
  console.error("Unexpected error:", error);
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: "An unexpected error occurred",
      },
    ],
  };
}

// Tool usage
handler: async (args, deps) => {
  try {
    const result = await deps.service.execute(args);
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    return handleToolError(error);
  }
};
```

## Configuration Management

### Layered Configuration

```typescript
// config/config.ts
import { z } from "zod";

const ConfigSchema = z.object({
  server: z.object({
    name: z.string(),
    version: z.string(),
  }),
  paths: z.object({
    basePath: z.string(),
    allowedDirs: z.array(z.string()),
  }),
  api: z.object({
    baseUrl: z.string().url(),
    timeout: z.number().positive(),
    retries: z.number().int().min(0).max(5),
  }),
  features: z.object({
    enableCaching: z.boolean(),
    enableRateLimiting: z.boolean(),
  }),
});

export type ServerConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(): ServerConfig {
  const config = {
    server: {
      name: process.env.SERVER_NAME || "my-mcp-server",
      version: process.env.SERVER_VERSION || "1.0.0",
    },
    paths: {
      basePath: process.env.BASE_PATH || process.cwd(),
      allowedDirs: (process.env.ALLOWED_DIRS || "").split(","),
    },
    api: {
      baseUrl: process.env.API_URL || "http://localhost:3000",
      timeout: parseInt(process.env.API_TIMEOUT || "5000"),
      retries: parseInt(process.env.API_RETRIES || "3"),
    },
    features: {
      enableCaching: process.env.ENABLE_CACHING === "true",
      enableRateLimiting: process.env.ENABLE_RATE_LIMITING === "true",
    },
  };

  return ConfigSchema.parse(config);
}
```

## Testing Patterns

### Unit Testing Tools

```typescript
// tools/read-file.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createReadFileTool } from "./read-file";

describe("ReadFileTool", () => {
  let mockFileService: FileService;
  let tool: Tool;

  beforeEach(() => {
    mockFileService = {
      read: vi.fn(),
    };
    tool = createReadFileTool(mockFileService);
  });

  it("should read file successfully", async () => {
    mockFileService.read.mockResolvedValue("file content");

    const result = await tool.handler({ path: "test.txt" });

    expect(result.content[0].text).toBe("file content");
    expect(mockFileService.read).toHaveBeenCalledWith("test.txt");
  });

  it("should handle file not found", async () => {
    mockFileService.read.mockRejectedValue(new NotFoundError("test.txt"));

    const result = await tool.handler({ path: "test.txt" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("not found");
  });
});
```

### Integration Testing

```typescript
// server.integration.test.ts
import { describe, it, expect } from "vitest";
import { createServer } from "./server";
import { createTestTransport } from "@modelcontextprotocol/sdk/test";

describe("Server Integration", () => {
  it("should handle complete request lifecycle", async () => {
    const config = createTestConfig();
    const server = createServer(config);
    const transport = createTestTransport();

    await server.connect(transport);

    // Send tool list request
    const toolsResponse = await transport.request({
      method: "tools/list",
    });

    expect(toolsResponse.tools).toHaveLength(3);

    // Call a tool
    const callResponse = await transport.request({
      method: "tools/call",
      params: {
        name: "read-file",
        arguments: { path: "test.txt" },
      },
    });

    expect(callResponse.content[0].text).toBeDefined();
  });
});
```

## Next Steps

- For advanced architecture patterns → `Level3_advanced.md`
- For production-ready patterns → `Level4_expert.md`
- For detailed error strategies → `error-patterns.md`
- For state management → `state-management.md`
