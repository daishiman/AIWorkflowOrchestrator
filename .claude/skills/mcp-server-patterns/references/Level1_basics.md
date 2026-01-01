# Level 1: MCP Server Patterns Basics

## Fundamental Server Structure

### Basic MCP Server Anatomy

An MCP server consists of three primary layers:

1. **Transport Layer**: Handles MCP protocol communication (stdio/HTTP)
2. **Tool Layer**: Defines and exposes tools to clients
3. **Business Logic Layer**: Implements actual tool functionality

```
┌─────────────────────────────┐
│   Transport (MCP Protocol)  │
├─────────────────────────────┤
│   Tool Definitions          │
├─────────────────────────────┤
│   Business Logic            │
└─────────────────────────────┘
```

### Minimal Server Structure

```
my-mcp-server/
├── src/
│   ├── index.ts          # Server entry point
│   ├── server.ts         # MCP server setup
│   └── tools/            # Tool definitions
│       └── my-tool.ts
├── package.json
└── tsconfig.json
```

## Three Core Patterns

### Pattern 1: Simple Server (1-5 tools)

**When to use**: Small utility servers, single-purpose tools

**Structure**:

```
src/
├── index.ts
├── server.ts
└── tools/
    ├── tool1.ts
    ├── tool2.ts
    └── tool3.ts
```

**Characteristics**:

- Flat file structure
- Direct tool registration
- Minimal abstraction
- Quick to implement

### Pattern 2: Modular Server (6-20 tools)

**When to use**: Medium-sized servers, multiple related capabilities

**Structure**:

```
src/
├── index.ts
├── server.ts
├── tools/
│   ├── group-a/
│   │   ├── tool1.ts
│   │   └── tool2.ts
│   └── group-b/
│       ├── tool3.ts
│       └── tool4.ts
└── services/
    └── shared-logic.ts
```

**Characteristics**:

- Tools grouped by feature
- Shared services extracted
- Better organization
- Easier testing

### Pattern 3: Domain-Driven Server (20+ tools)

**When to use**: Large servers, complex business domains

**Structure**:

```
src/
├── index.ts
├── server.ts
├── domains/
│   ├── domain-a/
│   │   ├── tools/
│   │   ├── services/
│   │   └── index.ts
│   └── domain-b/
│       ├── tools/
│       ├── services/
│       └── index.ts
└── infrastructure/
    ├── mcp/
    └── shared/
```

**Characteristics**:

- Clear domain boundaries
- Full separation of concerns
- Maximum maintainability
- Scales to any size

## Basic Tool Definition Pattern

```typescript
import { z } from "zod";

// Input schema
const MyToolInputSchema = z.object({
  param1: z.string().describe("Description of param1"),
  param2: z.number().optional().describe("Optional param2"),
});

// Tool definition
export const myTool = {
  name: "my-tool",
  description: "Clear description of what this tool does",
  inputSchema: MyToolInputSchema,
  handler: async (args: z.infer<typeof MyToolInputSchema>) => {
    // Validate input
    const validated = MyToolInputSchema.parse(args);

    try {
      // Business logic here
      const result = await doSomething(validated.param1);

      return {
        content: [
          {
            type: "text",
            text: `Success: ${result}`,
          },
        ],
      };
    } catch (error) {
      // Error handling
      throw new Error(`Failed to execute: ${error.message}`);
    }
  },
};
```

## Essential Error Handling

### Basic Error Pattern

```typescript
handler: async (args) => {
  try {
    // Business logic
    const result = await operation(args);
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(`Invalid input: ${error.message}`);
    }
    if (error instanceof NotFoundError) {
      throw new Error(`Resource not found: ${error.message}`);
    }
    // Generic error
    throw new Error(`Operation failed: ${error.message}`);
  }
};
```

### Error Response Structure

MCP servers should return errors in this format:

```typescript
{
  error: {
    code: number,      // MCP error code
    message: string,   // Human-readable message
    data?: any        // Optional additional context
  }
}
```

## Initialization Pattern

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./server.js";

const server = new Server(
  {
    name: "my-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Register all tools
registerTools(server);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Key Principles

### Separation of Concerns

**Do**: Separate protocol handling from business logic

```typescript
// Good: Business logic separated
const businessLogic = {
  async processData(input: string): Promise<string> {
    // Pure business logic
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

**Don't**: Mix protocol and business logic

```typescript
// Bad: Mixed concerns
const tool = {
  handler: async (args) => {
    // MCP-specific formatting mixed with business logic
    const result = args.input.toUpperCase();
    return {
      content: [
        {
          type: "text",
          text: `Result: ${result}`,
          metadata: { mcp_version: "1.0" },
        },
      ],
    };
  },
};
```

### Single Responsibility

Each tool should do one thing well:

```typescript
// Good: Single responsibility
export const readFileTool = {
  name: "read-file",
  description: "Read contents of a file",
  handler: async (args) => {
    return await fileService.read(args.path);
  },
};

export const writeFileTool = {
  name: "write-file",
  description: "Write contents to a file",
  handler: async (args) => {
    return await fileService.write(args.path, args.content);
  },
};
```

```typescript
// Bad: Multiple responsibilities
export const fileManagerTool = {
  name: "file-manager",
  description: "Manage files",
  handler: async (args) => {
    // Too many responsibilities
    if (args.operation === "read") {
      /* ... */
    } else if (args.operation === "write") {
      /* ... */
    } else if (args.operation === "delete") {
      /* ... */
    } else if (args.operation === "list") {
      /* ... */
    }
  },
};
```

## Testing Basics

### Test Business Logic Independently

```typescript
// business-logic.test.ts
describe("Business Logic", () => {
  it("should process data correctly", async () => {
    const result = await businessLogic.processData("test");
    expect(result).toBe("TEST");
  });
});

// tool.test.ts
describe("Tool Handler", () => {
  it("should format response correctly", async () => {
    const response = await tool.handler({ input: "test" });
    expect(response.content[0].text).toBe("TEST");
  });
});
```

## Next Steps

- For tool organization strategies → `Level2_intermediate.md`
- For advanced patterns → `Level3_advanced.md`
- For complex scenarios → `Level4_expert.md`
- For error handling details → `error-patterns.md`
