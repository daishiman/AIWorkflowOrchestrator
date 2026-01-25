# SkillExecutor IPC Handler Integration - Implementation Guide

**Task**: TASK-3-2 SkillExecutor IPC Integration
**Version**: 1.0.0
**Last Updated**: 2026-01-25

---

## Part 1: Overview (For Beginners and Non-Technical Readers)

### What Does This Feature Do?

This feature provides a real-time display mechanism for skill execution results from the SkillExecutor in the user interface.

When a user executes a skill (like "analyze this code" or "summarize this document"), the system:

1. **Starts the execution** and shows a "Running" status
2. **Streams messages** in real-time as the skill processes
3. **Shows completion** when the skill finishes
4. **Allows cancellation** if the user wants to stop the execution

### Why Is This Feature Necessary?

Skill execution can take time - sometimes seconds, sometimes minutes. Without this feature:

- Users would see a blank screen while waiting
- Users couldn't know if the system is working
- Users couldn't stop a long-running task

With this feature:

- Users see real-time progress
- Users can monitor what the AI is doing
- Users can abort if needed

### Main Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Electron Desktop App                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    IPC      ┌──────────────┐                  │
│  │ Main Process │─────────────│   Preload    │                  │
│  │              │   Channel   │              │                  │
│  │ SkillExecutor│  skill:*    │  skillAPI    │                  │
│  └──────────────┘             └──────────────┘                  │
│                                      │                           │
│                              contextBridge                       │
│                                      │                           │
│                               ┌──────────────┐                  │
│                               │   Renderer   │                  │
│                               │              │                  │
│                               │ useSkillExec │                  │
│                               │ SkillStream  │                  │
│                               │    Display   │                  │
│                               └──────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

1. **skillAPI (Preload)**: The bridge that safely passes messages between the main process and the UI
2. **useSkillExecution (Hook)**: Manages the state (messages, status, errors)
3. **SkillStreamDisplay (Component)**: Shows the UI with status, messages, and control buttons

---

## Part 2: Technical Details (For Developers)

### Architecture

#### Data Flow

```
Main Process                Preload                 Renderer
     │                         │                        │
     │  skill:stream message   │                        │
     │────────────────────────>│                        │
     │                         │  onStream callback     │
     │                         │───────────────────────>│
     │                         │                        │ setMessages()
     │                         │                        │ setStatus()
     │                         │                        │
     │    skill:abort          │                        │
     │<────────────────────────│  skillAPI.abort()     │
     │                         │<───────────────────────│
     │                         │                        │
```

#### IPC Channels

| Channel          | Direction       | Purpose                |
| ---------------- | --------------- | ---------------------- |
| skill:execute    | Renderer → Main | Start skill execution  |
| skill:stream     | Main → Renderer | Stream messages        |
| skill:abort      | Renderer → Main | Abort execution        |
| skill:get-status | Renderer → Main | Query execution status |

### API Reference

#### skillAPI.execute

```typescript
execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>
```

**Parameters:**

```typescript
interface SkillExecutionRequest {
  skillId: string;
  prompt: string;
}
```

**Returns:**

```typescript
interface SkillExecutionResponse {
  success: boolean;
  executionId: string;
  error?: SkillExecutionError;
}
```

**Example:**

```typescript
const response = await window.skillAPI.execute({
  skillId: "code-analyzer",
  prompt: "Analyze this function for bugs",
});

if (response.success) {
  console.log("Started execution:", response.executionId);
}
```

#### skillAPI.onStream

```typescript
onStream(callback: (message: SkillStreamMessage) => void): () => void
```

**Parameters:**

- `callback`: Function called for each message

**Returns:**

- Unsubscribe function

**Message Types:**

```typescript
interface SkillStreamMessage {
  id: string;
  executionId: string;
  type: "text" | "tool_use" | "error" | "complete";
  content: string;
  timestamp: number;
}
```

**Example:**

```typescript
const unsubscribe = window.skillAPI.onStream((message) => {
  if (message.type === "text") {
    console.log("Received:", message.content);
  } else if (message.type === "complete") {
    console.log("Execution completed");
  }
});

// Later: cleanup
unsubscribe();
```

#### skillAPI.abort

```typescript
abort(executionId: string): Promise<boolean>
```

**Parameters:**

- `executionId`: The ID of the execution to abort

**Returns:**

- `true` if abort was successful

**Example:**

```typescript
const success = await window.skillAPI.abort(executionId);
if (success) {
  console.log("Execution aborted");
}
```

#### skillAPI.getExecutionStatus

```typescript
getExecutionStatus(executionId: string): Promise<ExecutionInfo | null>
```

**Parameters:**

- `executionId`: The ID of the execution to query

**Returns:**

- `ExecutionInfo` if found, `null` otherwise

### useSkillExecution Hook

```typescript
function useSkillExecution(skillId: string): UseSkillExecutionReturn;

interface UseSkillExecutionReturn {
  messages: SkillStreamMessage[];
  status: ExecutionStatus;
  executionId: string | null;
  error: SkillExecutionError | null;
  isAborting: boolean;
  execute: (prompt: string) => Promise<SkillExecutionResponse | null>;
  abort: () => Promise<void>;
  reset: () => void;
}

type ExecutionStatus = "idle" | "running" | "completed" | "error" | "aborted";
```

**Example:**

```typescript
function MyComponent() {
  const { messages, status, execute, abort, reset } =
    useSkillExecution("my-skill");

  const handleExecute = async () => {
    await execute("Please analyze this code");
  };

  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={handleExecute} disabled={status === "running"}>
        Execute
      </button>
      <button onClick={abort} disabled={status !== "running"}>
        Abort
      </button>
      <button onClick={reset}>Reset</button>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>{m.content}</li>
        ))}
      </ul>
    </div>
  );
}
```

### SkillStreamDisplay Component

```typescript
interface SkillStreamDisplayProps {
  skillId: string;
  initialPrompt?: string;
  autoExecute?: boolean;
  onComplete?: () => void;
  onError?: (error: SkillExecutionError) => void;
  onStatusChange?: (status: string) => void;
  height?: string | number;
  className?: string;
}
```

**Example:**

```tsx
<SkillStreamDisplay
  skillId="code-analyzer"
  initialPrompt="Analyze this code"
  autoExecute={true}
  onComplete={() => console.log("Done!")}
  onError={(err) => console.error(err)}
  height={400}
  className="my-custom-class"
/>
```

### Troubleshooting

#### Messages Not Appearing

1. **Check executionId match**: Messages are filtered by executionId. Ensure the Main Process sends messages with the correct executionId.

2. **Check channel registration**: Ensure `skill:stream` is in `ALLOWED_ON_CHANNELS`.

3. **Check for errors**: Add console.log in the onStream callback to verify messages are being received.

#### Abort Not Working

1. **Check status**: Abort only works when status is "running".

2. **Check executionId**: Ensure executionId is set before calling abort.

3. **Check Main Process handler**: Ensure the Main Process handles the abort request.

#### Memory Leaks

1. **Cleanup on unmount**: The hook automatically unsubscribes on unmount.

2. **Message limit**: Messages are limited to 1000 by default (MAX_MESSAGES).

### Security Considerations

1. **Channel Whitelist**: Only whitelisted channels can be used (ALLOWED_INVOKE_CHANNELS, ALLOWED_ON_CHANNELS).

2. **contextBridge**: All APIs are exposed through Electron's contextBridge for security.

3. **No nodeIntegration**: The renderer process does not have direct access to Node.js APIs.

4. **Input Validation**: TypeScript types ensure correct data structures.

---

## File Reference

| Component          | Path                                                                    | Lines |
| ------------------ | ----------------------------------------------------------------------- | ----- |
| skillAPI           | `apps/desktop/src/preload/skill-api.ts`                                 | 101   |
| useSkillExecution  | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  | 198   |
| SkillStreamDisplay | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 223   |

## Test Coverage

| File               | Line   | Branch | Function |
| ------------------ | ------ | ------ | -------- |
| skill-api.ts       | 95%+   | 88%+   | 100%     |
| useSkillExecution  | 95.09% | 88.46% | 100%     |
| SkillStreamDisplay | 95%+   | 88%+   | 100%     |

**Total Tests**: 138 (all passing)
