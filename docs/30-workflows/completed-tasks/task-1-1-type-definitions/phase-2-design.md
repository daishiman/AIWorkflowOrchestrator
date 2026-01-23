# Phase 2: 設計

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| フェーズ     | 2                           |
| フェーズ名   | 設計                        |
| 目的         | アーキテクチャ・詳細設計    |
| 前提フェーズ | Phase 1: 要件定義           |
| 次フェーズ   | Phase 3: 設計レビューゲート |
| 想定成果物   | 型設計書                    |

---

## 1. 目的

specification.md §5.1 の型定義を既存の skill.ts に統合するための詳細設計を行う。

---

## 2. 実行タスク

### Task 2-1: 型定義構造設計

**目的**: 型定義のファイル構造と依存関係を設計する

**成果物**: 型定義構造図

```typescript
// packages/shared/src/types/skill.ts 構造

// ========================================
// Section 1: 既存型（維持）
// ========================================
// - Anchor
// - SkillEnvironmentType
// - EnvironmentConfig
// - SkillCategory
// - SKILL_CATEGORIES
// - Skill
// - SkillDetail
// - SkillImportConfig
// - OperationResult
// - SkillScanError
// - SkillScanResult
// - ImportResult
// - RemoveResult
// - SkillRunResult

// ========================================
// Section 2: スキルメタデータ（§5.1）
// ========================================
// - SkillMetadata
// - SkillSubResource
// - SkillOtherFile
// - ImportedSkill

// ========================================
// Section 3: 実行関連（§5.1）
// ========================================
// - SkillExecutionRequest
// - SkillExecutionResponse
// - SkillExecutionStatus

// ========================================
// Section 4: ストリーミングメッセージ（§5.1）
// ========================================
// - SkillStreamMessageType
// - AssistantMessageContent
// - ToolUseMessageContent
// - ToolResultMessageContent
// - StatusMessageContent
// - ErrorMessageContent
// - SkillStreamMessage (Discriminated Union)

// ========================================
// Section 5: 権限確認（§5.1）
// ========================================
// - PermissionRequest
// - PermissionResponse
```

### Task 2-2: 各型の詳細設計

**目的**: 各型定義の詳細なプロパティと型を設計する

#### 2-2-1: SkillMetadata

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

  /** schemas/ 配下のファイル一覧 */
  schemas: SkillSubResource[];

  /** indexes/ 配下のファイル一覧 */
  indexes: SkillSubResource[];

  /** その他のファイル一覧 */
  otherFiles: SkillOtherFile[];
}
```

#### 2-2-2: SkillSubResource

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

#### 2-2-3: SkillOtherFile

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

#### 2-2-4: ImportedSkill

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

#### 2-2-5: SkillExecutionRequest/Response

```typescript
/**
 * スキル実行リクエスト（Renderer → Main）
 */
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: string;

  /** ユーザープロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;
}

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

#### 2-2-6: SkillExecutionStatus

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

#### 2-2-7: ストリーミングメッセージ

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

/**
 * ストリーミングメッセージ（Discriminated Union）
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

#### 2-2-8: 権限確認

```typescript
/**
 * 権限確認リクエスト（Main → Renderer）
 */
export interface PermissionRequest {
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

/**
 * 権限確認レスポンス（Renderer → Main）
 */
export interface PermissionResponse {
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

### Task 2-3: エクスポート設計

**目的**: index.ts への追加エクスポートを設計する

```typescript
// packages/shared/src/index.ts への追加

// 既存のスキル管理型定義エクスポートは維持
export * from "./types/skill";

// 追加エクスポートは不要（export * で全てエクスポートされる）
```

---

## 3. 設計判断

### 3.1 既存型との共存

| 判断事項                      | 決定                          | 理由                         |
| ----------------------------- | ----------------------------- | ---------------------------- |
| 既存 Skill 型と SkillMetadata | 両方維持                      | 後方互換性、段階的移行が可能 |
| 既存 OperationResult 型       | 維持                          | 汎用的に使用可能             |
| ファイル分割                  | 分割しない（skill.ts に統合） | 関連型を1ファイルで管理      |

### 3.2 型設計の原則

| 原則                | 適用                                            |
| ------------------- | ----------------------------------------------- |
| Discriminated Union | SkillStreamMessage で type プロパティを判別子に |
| Optional プロパティ | 省略可能なフィールドのみ optional に            |
| readonly            | 今回は適用しない（将来の検討事項）              |
| Brand 型            | 今回は適用しない（型定義の複雑化を避ける）      |

---

## 4. 参照資料

| 資料名     | パス                                                           |
| ---------- | -------------------------------------------------------------- |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md` |
| 既存型定義 | `packages/shared/src/types/skill.ts`                           |

---

## 5. 完了条件

- [ ] Task 2-1 完了: 型定義構造設計
- [ ] Task 2-2 完了: 各型の詳細設計
- [ ] Task 2-3 完了: エクスポート設計
- [ ] 設計判断が文書化されている

---

## 6. 統合テスト連携【必須】

> **N/A**: 本タスクは型定義のみのため、統合テスト連携は対象外です。
>
> 設計フェーズでは統合ポイント/契約（API・スキーマ）は適用されません：
>
> - フロント→API: 該当なし（型定義のみ）
> - API→DB: 該当なし（型定義のみ）
> - 外部サービス: 該当なし（型定義のみ）

---

## 7. 成果物

| 成果物   | パス                                  | 状態 |
| -------- | ------------------------------------- | ---- |
| 型設計書 | このドキュメント（phase-2-design.md） | 完了 |

---

## 8. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 9. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 2-1: 型定義構造設計
3. Task 2-2: 各型の詳細設計
4. Task 2-3: エクスポート設計
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-23 | 初版作成 |
