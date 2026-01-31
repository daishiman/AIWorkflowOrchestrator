# ストア依存関係マップ

## 分析日: 2026-01-30

## SkillSlice 状態（ChatPanel 関連）

| フィールド名           | 型                               | 用途                                            |
| ---------------------- | -------------------------------- | ----------------------------------------------- |
| `selectedSkillName`    | `string \| null`                 | 選択中スキル名表示、SkillStreamingView 表示条件 |
| `streamingMessages`    | `SkillStreamMessage[]`           | ストリーミング表示のメッセージ一覧              |
| `isExecuting`          | `boolean`                        | SkillStreamingView 表示条件                     |
| `skillExecutionStatus` | `SkillExecutionStatus \| null`   | StatusBadge 表示                                |
| `pendingPermission`    | `SkillPermissionRequest \| null` | PermissionDialog 表示判定                       |

## SkillSlice アクション（ChatPanel 関連）

| アクション名     | 型                    | 用途                                     |
| ---------------- | --------------------- | ---------------------------------------- |
| `fetchSkills`    | `() => Promise<void>` | ChatPanel マウント時のスキル一覧初期取得 |
| `abortExecution` | `() => void`          | SkillStreamingView 中止ボタン            |

## 共有型定義（packages/shared/src/types/skill.ts）

### SkillStreamMessage（Discriminated Union）

- `type: "assistant"` → `content: { text: string; isPartial?: boolean }`
- `type: "tool_use"` → `content: { toolName: string; args: Record<string, unknown>; toolUseId: string }`
- `type: "tool_result"` → `content: { toolUseId: string; success: boolean; result?: unknown; error?: string }`
- `type: "status"` → `content: { status: string; detail?: string }`
- `type: "error"` → `content: { code: string; message: string; retryable: boolean }`

### SkillExecutionStatus

`"idle" | "running" | "permission_pending" | "completed" | "cancelled" | "error"`

### SkillMetadata（SkillImportDialog 用）

`name`, `description`, `allowedTools`, `path`, `updatedAt`, `agents`, `references`, `scripts`, `assets`, `schemas`, `indexes`, `otherFiles`

## useAppStore vs useSkillStore

| skillSlice (raw)           | useSkillStore (remapped) |
| -------------------------- | ------------------------ |
| `availableSkillsMetadata`  | `availableSkills`        |
| `skillExecutionStatus`     | `executionStatus`        |
| `respondToSkillPermission` | `respondToPermission`    |

ChatPanel は `useAppStore()` を直接使用し、raw フィールド名でアクセスする。
