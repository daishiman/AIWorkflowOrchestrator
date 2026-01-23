# Phase 2: 設計レポート

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-1-1   |
| フェーズ   | 2          |
| 実行日時   | 2026-01-23 |
| ステータス | 完了       |

---

## 1. Task 2-1: 型定義構造設計

### 1.1 ファイル構造

```
packages/shared/src/types/skill.ts
├── Section 1: 既存型（維持）
│   ├── Anchor
│   ├── SkillEnvironmentType
│   ├── EnvironmentConfig
│   ├── SkillCategory
│   ├── SKILL_CATEGORIES
│   ├── Skill
│   ├── SkillDetail
│   ├── SkillImportConfig
│   ├── OperationResult
│   ├── SkillScanError
│   ├── SkillScanResult
│   ├── ImportResult
│   ├── RemoveResult
│   └── SkillRunResult
│
├── Section 2: スキルメタデータ（§5.1 新規追加）
│   ├── SkillOtherFile
│   ├── SkillSubResource
│   ├── SkillMetadata
│   └── ImportedSkill
│
├── Section 3: 実行関連（§5.1 新規追加）
│   ├── SkillExecutionRequest
│   ├── SkillExecutionResponse
│   └── SkillExecutionStatus
│
├── Section 4: ストリーミングメッセージ（§5.1 新規追加）
│   ├── SkillStreamMessageType
│   ├── AssistantMessageContent
│   ├── ToolUseMessageContent
│   ├── ToolResultMessageContent
│   ├── StatusMessageContent
│   ├── ErrorMessageContent
│   └── SkillStreamMessage
│
└── Section 5: 権限確認（§5.1 新規追加）
    ├── SkillPermissionRequest
    └── SkillPermissionResponse
```

### 1.2 依存関係図

```
SkillOtherFile ─────────────────────┐
                                    │
SkillSubResource ───────────────────┼──▶ SkillMetadata ──▶ ImportedSkill
                                    │
SkillExecutionRequest ──────────────┤
SkillExecutionResponse ─────────────┤
SkillExecutionStatus ───────────────┤   （依存なし）
                                    │
AssistantMessageContent ────────────┤
ToolUseMessageContent ──────────────┤
ToolResultMessageContent ───────────┼──▶ SkillStreamMessage
StatusMessageContent ───────────────┤     (Discriminated Union)
ErrorMessageContent ────────────────┘

SkillPermissionRequest ─────────────┤   （依存なし）
SkillPermissionResponse ────────────┘   （依存なし）
```

---

## 2. Task 2-2: 各型の詳細設計

### 2.1 スキルメタデータ系

#### SkillOtherFile

```typescript
/**
 * スキルディレクトリ直下のその他のファイル
 */
export interface SkillOtherFile {
  /** ファイル名 */
  filename: string;
  /** ファイルタイプ */
  type: "evals" | "logs" | "package" | "other";
  /** ファイルサイズ（バイト） */
  size: number;
}
```

#### SkillSubResource

```typescript
/**
 * スキル配下のサブリソース
 */
export interface SkillSubResource {
  /** ファイル名 */
  filename: string;
  /** 相対パス */
  relativePath: string;
  /** 説明（ファイルから抽出、なければファイル名） */
  description?: string;
  /** ファイルサイズ（バイト） */
  size: number;
}
```

#### SkillMetadata

```typescript
/**
 * スキルメタデータ（SKILL.md frontmatter）
 * 配下の全情報を含む
 */
export interface SkillMetadata {
  /** スキル識別子（ディレクトリ名と一致） */
  name: string;
  /** スキル説明（トリガー条件含む） */
  description: string;
  /** 許可ツール */
  allowedTools?: string[];
  /** スキルディレクトリパス */
  path: string;
  /** 最終更新日時 */
  updatedAt: Date;
  /** agents/ 配下のファイル一覧 */
  agents: SkillSubResource[];
  /** references/ 配下のファイル一覧 */
  references: SkillSubResource[];
  /** scripts/ 配下のファイル一覧 */
  scripts: SkillSubResource[];
  /** assets/ 配下のファイル一覧 */
  assets: SkillSubResource[];
  /** schemas/ 配下のファイル一覧（JSONスキーマ定義） */
  schemas: SkillSubResource[];
  /** indexes/ 配下のファイル一覧（キーワードインデックス） */
  indexes: SkillSubResource[];
  /** その他のファイル一覧（EVALS.json, LOGS.md, package.json等） */
  otherFiles: SkillOtherFile[];
}
```

#### ImportedSkill

```typescript
/**
 * インポート済みスキル
 */
export interface ImportedSkill extends SkillMetadata {
  /** インポート日時 */
  importedAt: Date;
  /** インポートステータス */
  status: "active" | "disabled";
  /** SKILL.md 本文（キャッシュ） */
  content?: string;
}
```

### 2.2 実行関連

#### SkillExecutionRequest

```typescript
/**
 * スキル実行リクエスト（Renderer → Main）
 * ※ executionIdはMain側で生成
 */
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: string;
  /** ユーザープロンプト */
  prompt: string;
  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;
}
```

#### SkillExecutionResponse

```typescript
/**
 * スキル実行レスポンス（Main → Renderer）
 */
export interface SkillExecutionResponse {
  /** 実行ID（UUID、Main側で生成） */
  executionId: string;
  /** 開始成功かどうか */
  success: boolean;
  /** エラーメッセージ（失敗時） */
  error?: string;
}
```

#### SkillExecutionStatus

```typescript
/**
 * スキル実行ステータス
 */
export type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";
```

### 2.3 ストリーミングメッセージ

#### SkillStreamMessageType

```typescript
/**
 * ストリーミングメッセージ種別
 */
export type SkillStreamMessageType =
  | "assistant"
  | "tool_use"
  | "tool_result"
  | "status"
  | "error";
```

#### Content Types

```typescript
/**
 * アシスタントメッセージ内容
 */
export interface AssistantMessageContent {
  /** テキスト内容 */
  text: string;
  /** 部分メッセージかどうか */
  isPartial?: boolean;
}

/**
 * ツール使用メッセージ内容
 */
export interface ToolUseMessageContent {
  /** ツール名 */
  toolName: string;
  /** ツール引数 */
  args: Record<string, unknown>;
  /** ツール使用ID */
  toolUseId: string;
}

/**
 * ツール結果メッセージ内容
 */
export interface ToolResultMessageContent {
  /** ツール使用ID */
  toolUseId: string;
  /** 成功したかどうか */
  success: boolean;
  /** 結果内容 */
  result?: unknown;
  /** エラーメッセージ */
  error?: string;
}

/**
 * ステータスメッセージ内容
 */
export interface StatusMessageContent {
  /** ステータス種別 */
  status: "started" | "tool_executing" | "tool_completed" | "completed";
  /** 追加情報 */
  detail?: string;
}

/**
 * エラーメッセージ内容
 */
export interface ErrorMessageContent {
  /** エラーコード */
  code: "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown";
  /** エラーメッセージ */
  message: string;
  /** リトライ可能かどうか */
  retryable: boolean;
}
```

#### SkillStreamMessage (Discriminated Union)

```typescript
/**
 * ストリーミングメッセージ（型安全版）
 */
export type SkillStreamMessage =
  | {
      executionId: string;
      type: "assistant";
      content: AssistantMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_use";
      content: ToolUseMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_result";
      content: ToolResultMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "status";
      content: StatusMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "error";
      content: ErrorMessageContent;
      timestamp: number;
    };
```

### 2.4 権限確認

**注意**: 既存の `agent.ts` に `PermissionRequest`/`PermissionResponse` が存在するため、スキル実行用には `Skill` プレフィックスを付けて区別する。

#### SkillPermissionRequest

```typescript
/**
 * スキル実行時の権限確認リクエスト（Main → Renderer）
 */
export interface SkillPermissionRequest {
  /** 実行ID */
  executionId: string;
  /** リクエストID（応答のマッチング用） */
  requestId: string;
  /** ツール名 */
  toolName: string;
  /** ツール引数 */
  args: Record<string, unknown>;
  /** 確認を求める理由（オプション） */
  reason?: string;
}
```

#### SkillPermissionResponse

```typescript
/**
 * スキル実行時の権限確認レスポンス（Renderer → Main）
 */
export interface SkillPermissionResponse {
  /** リクエストID（リクエストとのマッチング用） */
  requestId: string;
  /** 承認されたかどうか */
  approved: boolean;
  /** この選択を記憶するか（オプション） */
  rememberChoice?: boolean;
  /** 拒否理由（オプション） */
  rejectReason?: string;
}
```

---

## 3. Task 2-3: エクスポート設計

### 3.1 packages/shared/index.ts への追加

```typescript
// 既存のエクスポート（維持）
export type {
  Anchor,
  SkillEnvironmentType,
  EnvironmentConfig,
  SkillCategory,
  Skill,
  SkillDetail,
  SkillImportConfig,
  OperationResult,
  SkillScanError,
  SkillScanResult,
  ImportResult,
  RemoveResult,
  SkillRunResult,
} from "./src/types/skill";

export { SKILL_CATEGORIES } from "./src/types/skill";

// 新規追加（§5.1）
export type {
  // スキルメタデータ
  SkillOtherFile,
  SkillSubResource,
  SkillMetadata,
  ImportedSkill,
  // 実行関連
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillExecutionStatus,
  // ストリーミングメッセージ
  SkillStreamMessageType,
  AssistantMessageContent,
  ToolUseMessageContent,
  ToolResultMessageContent,
  StatusMessageContent,
  ErrorMessageContent,
  SkillStreamMessage,
  // 権限確認
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "./src/types/skill";
```

---

## 4. 設計判断

| 判断事項                      | 決定                              | 理由                                  |
| ----------------------------- | --------------------------------- | ------------------------------------- |
| 既存 Skill 型と SkillMetadata | 両方維持                          | 後方互換性、段階的移行が可能          |
| 権限確認型の命名              | Skill プレフィックス付与          | agent.ts の同名型との衝突回避         |
| ファイル分割                  | 分割しない（skill.ts に統合）     | 関連型を1ファイルで管理               |
| Discriminated Union           | type プロパティを判別子に使用     | TypeScript の型ガードで安全に判別可能 |
| Date vs number (timestamp)    | 仕様書に準拠（updatedAt: Date等） | 仕様書との一貫性を優先                |

---

## 5. 完了条件検証

| 条件                            | 状態 |
| ------------------------------- | ---- |
| Task 2-1 完了: 型定義構造設計   | ✓    |
| Task 2-2 完了: 各型の詳細設計   | ✓    |
| Task 2-3 完了: エクスポート設計 | ✓    |
| 設計判断が文書化されている      | ✓    |

---

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2026-01-23 | Phase 2 完了 |
