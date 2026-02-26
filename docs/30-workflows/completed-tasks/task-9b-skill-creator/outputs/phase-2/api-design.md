# Phase 2 成果物: API設計

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-9B    |
| Phase      | 2          |
| 成果物     | API設計    |
| 作成日     | 2026-02-26 |
| ステータス | 完了       |

## IPC チャンネル定義

| チャンネル名        | 方向          | 対応FR | 定数名            |
| ------------------- | ------------- | ------ | ----------------- |
| `skill:create:chat` | Renderer→Main | FR-1   | SKILL_CREATE_CHAT |
| `skill:create:api`  | Renderer→Main | FR-2   | SKILL_CREATE_API  |
| `skill:improve`     | Renderer→Main | FR-3   | SKILL_IMPROVE     |
| `skill:execute`     | Renderer→Main | FR-4   | SKILL_EXECUTE     |
| `skill:use`         | Renderer→Main | FR-5   | SKILL_USE         |
| `skill:chain`       | Renderer→Main | FR-6   | SKILL_CHAIN       |
| `skill:fork`        | Renderer→Main | FR-7   | SKILL_FORK        |
| `skill:share`       | Renderer→Main | FR-8   | SKILL_SHARE       |
| `skill:schedule`    | Renderer→Main | FR-9   | SKILL_SCHEDULE    |
| `skill:debug`       | Renderer→Main | FR-10  | SKILL_DEBUG       |
| `skill:docs`        | Renderer→Main | FR-11  | SKILL_DOCS        |
| `skill:stats`       | Renderer→Main | FR-12  | SKILL_STATS       |

## IPC チャンネル定数定義

```typescript
const SKILL_CREATOR_CHANNELS = {
  SKILL_CREATE_CHAT: "skill:create:chat",
  SKILL_CREATE_API: "skill:create:api",
  SKILL_IMPROVE: "skill:improve",
  SKILL_EXECUTE: "skill:execute",
  SKILL_USE: "skill:use",
  SKILL_CHAIN: "skill:chain",
  SKILL_FORK: "skill:fork",
  SKILL_SHARE: "skill:share",
  SKILL_SCHEDULE: "skill:schedule",
  SKILL_DEBUG: "skill:debug",
  SKILL_DOCS: "skill:docs",
  SKILL_STATS: "skill:stats",
} as const;
```

## リクエスト/レスポンス型定義

### skill:create:chat（FR-1）

| 項目   | 型                                |
| ------ | --------------------------------- |
| 引数1  | `skillName: string`               |
| 引数2  | `description: string`             |
| 戻り値 | `IpcResult<{ skillDir: string }>` |

### skill:create:api（FR-2）

| 項目   | 型                                |
| ------ | --------------------------------- |
| 引数1  | `skillName: string`               |
| 引数2  | `apiSpec: string` (JSON文字列)    |
| 戻り値 | `IpcResult<{ skillDir: string }>` |

### skill:improve（FR-3）

| 項目   | 型                                                    |
| ------ | ----------------------------------------------------- |
| 引数1  | `skillName: string`                                   |
| 引数2  | `autoApply: boolean`                                  |
| 戻り値 | `IpcResult<{ suggestions: ImprovementSuggestion[] }>` |

### skill:execute（FR-4）

| 項目   | 型                                                                   |
| ------ | -------------------------------------------------------------------- |
| 引数1  | `tasksDir: string`                                                   |
| 引数2  | `options: string` (JSON: `{ parallel?: boolean, dryRun?: boolean }`) |
| 戻り値 | `IpcResult<ExecutionReport>`                                         |

### skill:use（FR-5）

| 項目   | 型                  |
| ------ | ------------------- |
| 引数1  | `skillName: string` |
| 戻り値 | `IpcResult<void>`   |

### skill:chain（FR-6）

| 項目   | 型                                 |
| ------ | ---------------------------------- |
| 引数1  | `chainDescription: string`         |
| 戻り値 | `IpcResult<{ chainPath: string }>` |

### skill:fork（FR-7）

| 項目   | 型                                      |
| ------ | --------------------------------------- |
| 引数1  | `sourceSkillName: string`               |
| 引数2  | `newSkillName: string`                  |
| 引数3  | `options: string` (JSON: `ForkOptions`) |
| 戻り値 | `IpcResult<{ skillDir: string }>`       |

### skill:share（FR-8）

| 項目   | 型                                               |
| ------ | ------------------------------------------------ |
| 引数1  | `action: "export" \| "import"`                   |
| 引数2  | `target: string`                                 |
| 引数3  | `source: string`                                 |
| 戻り値 | `IpcResult<{ url?: string; skillDir?: string }>` |

### skill:schedule（FR-9）

| 項目   | 型                                                     |
| ------ | ------------------------------------------------------ |
| 引数1  | `skillName: string`                                    |
| 引数2  | `scheduleConfig: string` (JSON: `SkillScheduleConfig`) |
| 戻り値 | `IpcResult<void>`                                      |

### skill:debug（FR-10）

| 項目   | 型                                                                               |
| ------ | -------------------------------------------------------------------------------- |
| 引数1  | `skillName: string`                                                              |
| 引数2  | `breakpointConfig: string` (JSON: `{ breakpoint?: string, condition?: string }`) |
| 戻り値 | `IpcResult<DebugResult>`                                                         |

### skill:docs（FR-11）

| 項目   | 型                                      |
| ------ | --------------------------------------- |
| 引数1  | `skillName: string`                     |
| 引数2  | `format: "markdown" \| "html" \| "pdf"` |
| 引数3  | `sections: string` (JSON: `string[]`)   |
| 戻り値 | `IpcResult<{ outputPath: string }>`     |

### skill:stats（FR-12）

| 項目   | 型                                                |
| ------ | ------------------------------------------------- |
| 引数1  | `skillName: string` (空文字列の場合は全スキル)    |
| 引数2  | `period: string`                                  |
| 戻り値 | `IpcResult<SkillUsageStats \| SkillUsageStats[]>` |

## バリデーション設計

### 共通バリデーション（P42準拠3段バリデーション）

```typescript
function validateStringArg(value: unknown, argName: string): string {
  // 段1: 型チェック
  if (typeof value !== "string") {
    throw { code: "VALIDATION_ERROR", message: `${argName} must be a string` };
  }
  // 段2: 空文字列チェック
  if (value === "") {
    throw { code: "VALIDATION_ERROR", message: `${argName} must not be empty` };
  }
  // 段3: トリム空文字列チェック
  if (value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must not be whitespace only`,
    };
  }
  return value.trim();
}
```

### パストラバーサル検証（NFR-1-3）

```typescript
function validatePath(value: string, argName: string): string {
  if (value.includes("..") || value.includes("~")) {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} contains invalid path characters`,
    };
  }
  return value;
}
```

### 全ハンドラー先頭チェック

1. `validateIpcSender(event, { ... })` — NFR-1-1
2. `validateStringArg(引数)` — NFR-1-2 (P42)
3. `validatePath(パス引数)` — NFR-1-3（パス引数がある場合のみ）

## Preload API インターフェース

```typescript
interface SkillCreatorAPI {
  createChat: (
    skillName: string,
    description: string,
  ) => Promise<{ skillDir: string }>;
  createApi: (
    skillName: string,
    apiSpec: string,
  ) => Promise<{ skillDir: string }>;
  improve: (skillName: string, autoApply: boolean) => Promise<ImproveResult>;
  execute: (
    tasksDir: string,
    options: { parallel?: boolean; dryRun?: boolean },
  ) => Promise<ExecutionReport>;
  use: (skillName: string) => Promise<void>;
  chain: (chainDescription: string) => Promise<{ chainPath: string }>;
  fork: (
    sourceSkillName: string,
    newSkillName: string,
    options: ForkOptions,
  ) => Promise<{ skillDir: string }>;
  share: (
    action: "export" | "import",
    target: string,
    source: string,
  ) => Promise<{ url?: string; skillDir?: string }>;
  schedule: (skillName: string, config: SkillScheduleConfig) => Promise<void>;
  debug: (skillName: string, config: DebugOptions) => Promise<DebugResult>;
  docs: (
    skillName: string,
    format: string,
    sections: string[],
  ) => Promise<{ outputPath: string }>;
  stats: (
    skillName: string,
    period: string,
  ) => Promise<SkillUsageStats | SkillUsageStats[]>;
}
```

## Claude Agent SDK 統合設計

### query() API 使用パターン

| 使用場面       | permissionMode    | maxTurns | 理由                       |
| -------------- | ----------------- | -------- | -------------------------- |
| スキル生成     | bypassPermissions | 30       | ファイル作成が主体         |
| タスク実行     | default           | 50       | 既存コード修正の可能性あり |
| デバッグ実行   | plan              | 20       | ステップバイステップ確認   |
| スキル改善auto | acceptEdits       | 30       | ファイル編集を自動許可     |

### Hooks 設計

- **preToolUse**: 許可ツール確認、危険コマンド検出、パス検証
- **postToolUse**: 成果物記録、エラー検出
