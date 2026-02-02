# TASK-8B テストデータ仕様

## ファクトリ関数一覧

### createMockSkillMetadata

```typescript
interface SkillMetadata {
  name: string; // デフォルト: "test-skill"
  description: string; // デフォルト: "Test skill description"
  allowedTools?: string[]; // デフォルト: ["Bash", "Read", "Write"]
  path: string; // デフォルト: "/test/path"
  updatedAt: Date; // デフォルト: new Date("2026-01-01")
  agents: SkillSubResource[]; // デフォルト: 1件
  references: SkillSubResource[]; // デフォルト: 1件
  scripts: SkillSubResource[]; // デフォルト: []
  assets: SkillSubResource[]; // デフォルト: []
  schemas: SkillSubResource[]; // デフォルト: []
  indexes: SkillSubResource[]; // デフォルト: []
  otherFiles: SkillOtherFile[]; // デフォルト: []
}
```

### createMockImportedSkill

```typescript
interface ImportedSkill extends SkillMetadata {
  importedAt: Date; // デフォルト: new Date("2026-01-01")
  status: "active" | "disabled"; // デフォルト: "active"
}
```

### createMockPermissionRequest

```typescript
interface SkillPermissionRequest {
  executionId: string; // デフォルト: "exec-1"
  requestId: string; // デフォルト: "req-1"
  toolName: string; // デフォルト: "Bash"
  args: Record<string, unknown>; // デフォルト: { command: "ls -la" }
  reason?: string; // デフォルト: "List files"
}
```

### createMockStreamMessage

```typescript
// assistant
{ executionId: "exec-1", type: "assistant", content: { text: "Hello", isPartial: false }, timestamp: Date }

// tool_use
{ executionId: "exec-1", type: "tool_use", content: { toolName: "Bash", toolUseId: "tu-1", input: {} }, timestamp: Date }

// tool_result
{ executionId: "exec-1", type: "tool_result", content: { toolUseId: "tu-1", success: true, output: "ok" }, timestamp: Date }

// error
{ executionId: "exec-1", type: "error", content: { message: "Error occurred", code: "ERR_001" }, timestamp: Date }

// status
{ executionId: "exec-1", type: "status", content: { status: "running" }, timestamp: Date }
```

### createDefaultSkillStoreState

```typescript
interface SkillStoreState {
  availableSkills: SkillMetadata[];     // デフォルト: [1件]
  importedSkills: ImportedSkill[];      // デフォルト: [1件]
  selectedSkillName: string | null;     // デフォルト: null
  isExecuting: boolean;                 // デフォルト: false
  executionStatus: SkillExecutionStatus; // デフォルト: "idle"
  streamingMessages: SkillStreamMessage[]; // デフォルト: []
  pendingPermission: SkillPermissionRequest | null; // デフォルト: null
  isLoadingSkills: boolean;             // デフォルト: false
  isScanning: boolean;                  // デフォルト: false
  isImporting: boolean;                 // デフォルト: false
  importingSkillName: string | null;    // デフォルト: null
  // Actions
  selectSkillByName: vi.fn();
  rescanSkills: vi.fn();
  importSkill: vi.fn();
  abortExecution: vi.fn();
  respondToSkillPermission: vi.fn();
}
```

## テストデータバリエーション

### 境界値データ

| バリエーション     | 値                | 用途               |
| ------------------ | ----------------- | ------------------ |
| 空スキルリスト     | `[]`              | SkillSelector      |
| 長いスキル名       | `"a".repeat(100)` | SkillSelector      |
| 空説明文           | `""`              | SkillImportDialog  |
| 空allowedTools     | `[]`              | SkillImportDialog  |
| 全サブリソース空   | 各配列`[]`        | SkillImportDialog  |
| 空args             | `{}`              | PermissionDialog   |
| reason未定義       | `undefined`       | PermissionDialog   |
| 空メッセージリスト | `[]`              | SkillStreamingView |
| 大量メッセージ     | 100件以上         | SkillStreamingView |

### ツール別テストデータ（PermissionDialog）

| toolName  | args                                    | formatArgs結果              |
| --------- | --------------------------------------- | --------------------------- |
| Bash      | `{ command: "ls -la /home" }`           | `ls -la /home`              |
| Read      | `{ path: "/path/to/file.txt" }`         | `/path/to/file.txt`         |
| WebSearch | `{ query: "test query" }`               | `{ "query": "test query" }` |
| Write     | `{ path: "/file.txt", content: "..." }` | `{ "path": "...", ... }`    |
