# ドメインモデル: Permission要求履歴トラッキングUI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | task-imp-permission-history-001 |
| Phase    | 2                               |
| 作成日   | 2026-01-31                      |

## 型定義

### PermissionDecision

```typescript
export type PermissionDecision = "approved" | "denied" | "approved_once";
```

PermissionDialogの3ボタンに対応:

- `'approved'` = 「許可」（remember=true）
- `'denied'` = 「拒否」（approved=false）
- `'approved_once'` = 「1回許可」（approved=true, remember=false）

### PermissionHistoryEntry

```typescript
export interface PermissionHistoryEntry {
  id: string; // crypto.randomUUID()で生成
  timestamp: string; // new Date().toISOString() ISO8601形式
  toolName: string; // Bash, Read, Write, Edit, Glob, Grep等
  argsSnapshot: string; // safeArgsSnapshot()で安全化・200文字制限
  decision: PermissionDecision;
  sessionId?: string; // 実行セッション識別用（任意）
}
```

### PermissionHistoryFilter

```typescript
export interface PermissionHistoryFilter {
  toolName?: string; // undefined = 全ツール
  decision?: PermissionDecision; // undefined = 全判断結果
}
```

### 定数

```typescript
export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;
export const ARGS_SNAPSHOT_MAX_LENGTH = 200;
```

## ユーティリティ関数

### safeArgsSnapshot

```typescript
export function safeArgsSnapshot(args: Record<string, unknown>): string {
  // 1. JSON.stringifyで文字列化
  // 2. HTMLタグを除去（XSS防止）
  // 3. 200文字に切り詰め（末尾に「...」追加）
  // 4. 制御文字を除去
}
```

### createHistoryEntry

```typescript
export function createHistoryEntry(params: {
  toolName: string;
  args: Record<string, unknown>;
  decision: PermissionDecision;
  sessionId?: string;
}): PermissionHistoryEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    toolName: params.toolName,
    argsSnapshot: safeArgsSnapshot(params.args),
    decision: params.decision,
    sessionId: params.sessionId,
  };
}
```

## Store設計

### PermissionHistorySlice

```typescript
export interface PermissionHistorySlice {
  permissionHistory: PermissionHistoryEntry[];
  historyFilter: PermissionHistoryFilter;
  addHistoryEntry: (
    entry: Omit<PermissionHistoryEntry, "id" | "timestamp">,
  ) => void;
  clearHistory: () => void;
  setHistoryFilter: (filter: PermissionHistoryFilter) => void;
}
```

### 状態遷移

- `addHistoryEntry`: 先頭挿入 → 1000件超チェック → 超過分末尾削除
- `clearHistory`: `permissionHistory = []`
- `setHistoryFilter`: フィルタ状態更新（UI側useMemoで反映）

## エンティティ関係

```
PermissionHistoryEntry (値オブジェクト)
├── id: UUID (一意識別子)
├── timestamp: ISO8601 (記録時刻)
├── toolName: string (ツール識別)
├── argsSnapshot: string (安全化済み引数要約)
├── decision: PermissionDecision (判断結果)
└── sessionId?: string (セッション関連付け)

PermissionHistoryFilter (値オブジェクト)
├── toolName?: string
└── decision?: PermissionDecision

PermissionHistorySlice (集約ルート)
├── permissionHistory: PermissionHistoryEntry[] (最大1000件)
├── historyFilter: PermissionHistoryFilter
└── Actions: addHistoryEntry, clearHistory, setHistoryFilter
```
