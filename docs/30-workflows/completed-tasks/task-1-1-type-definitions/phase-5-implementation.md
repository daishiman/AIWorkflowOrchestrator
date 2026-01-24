# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| フェーズ     | 5                              |
| フェーズ名   | 実装                           |
| 目的         | TDD: Green（テストを通す実装） |
| 前提フェーズ | Phase 4: テスト作成            |
| 次フェーズ   | Phase 6: テスト拡充            |
| 想定成果物   | 型定義ファイル                 |

---

## 1. 目的

Phase 4 で作成したテストをパスさせる型定義を実装する。specification.md §5.1 の仕様に基づき、既存の skill.ts を拡張する。

---

## 2. 実行タスク

### Task 5-1: SkillMetadata 系型の実装

**目的**: スキルメタデータ関連の型を追加

**ファイル**: `packages/shared/src/types/skill.ts`

**追加内容**:

```typescript
// ========================================
// Section: スキルメタデータ（§5.1）
// ========================================

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

### Task 5-2: 実行関連型の実装

**目的**: スキル実行関連の型を追加

**追加内容**:

```typescript
// ========================================
// Section: 実行関連（§5.1）
// ========================================

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

### Task 5-3: ストリーミングメッセージ型の実装

**目的**: ストリーミングメッセージ関連の型を追加

**追加内容**:

```typescript
// ========================================
// Section: ストリーミングメッセージ（§5.1）
// ========================================

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
 * ストリーミングメッセージ（型安全版 - Discriminated Union）
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

### Task 5-4: 権限確認型の実装

**目的**: 権限確認関連の型を追加

**追加内容**:

```typescript
// ========================================
// Section: 権限確認（§5.1）
// ========================================

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

### Task 5-5: エクスポート確認

**目的**: index.ts のエクスポートが正しく設定されていることを確認

**ファイル**: `packages/shared/src/index.ts`

**確認内容**:

- `export * from "./types/skill";` が存在すること
- 新しい型が正しくエクスポートされること

---

## 3. 実装手順

### 3.1 ファイル編集手順

1. `packages/shared/src/types/skill.ts` を開く
2. 既存の型定義の後に新しいセクションを追加
3. Task 5-1 〜 5-4 の型定義を順番に追加
4. ファイルを保存

### 3.2 検証手順

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# ビルド
pnpm --filter @repo/shared build

# テスト実行
pnpm --filter @repo/shared test -- --run
```

---

## 4. 注意事項

### 4.1 既存型との共存

- 既存の `Skill`, `SkillDetail` 型は**削除しない**
- 新しい `SkillMetadata` 型は別の用途として追加
- 将来的な統合は後続タスクで検討

### 4.2 JSDoc コメント

- 全ての public 型に JSDoc コメントを付与
- プロパティには `/** 説明 */` 形式でコメントを追加
- `@deprecated` タグは既存型に既に適用済み

### 4.3 型の配置順序

```
1. 既存型（維持）
2. スキルメタデータ系（新規）
3. 実行関連（新規）
4. ストリーミングメッセージ（新規）
5. 権限確認（新規）
```

---

## 5. 参照資料

| 資料名     | パス                                                           |
| ---------- | -------------------------------------------------------------- |
| 設計書     | `./phase-2-design.md`                                          |
| テスト仕様 | `./phase-4-test-creation.md`                                   |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md` |

---

## 6. 完了条件

- [ ] Task 5-1 完了: SkillMetadata 系型の実装
- [ ] Task 5-2 完了: 実行関連型の実装
- [ ] Task 5-3 完了: ストリーミングメッセージ型の実装
- [ ] Task 5-4 完了: 権限確認型の実装
- [ ] Task 5-5 完了: エクスポート確認
- [ ] `pnpm --filter @repo/shared typecheck` が成功
- [ ] `pnpm --filter @repo/shared build` が成功
- [ ] Phase 4 のテストが全てパス

---

## 7. 統合テスト連携【必須】

> **N/A**: 本タスクは型定義のみのため、統合テスト連携は対象外です。
>
> 型定義の実装は静的コードであり、以下の実装項目は適用されません：
>
> - API 接続実装: 該当なし
> - エラーハンドリング実装: 該当なし
> - 状態同期実装: 該当なし

---

## 8. 成果物

| 成果物         | パス                                 | 状態     |
| -------------- | ------------------------------------ | -------- |
| 型定義ファイル | `packages/shared/src/types/skill.ts` | 更新待ち |

---

## 9. TDD 検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## 10. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 11. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 5-1: SkillMetadata 系型の実装
3. Task 5-2: 実行関連型の実装
4. Task 5-3: ストリーミングメッセージ型の実装
5. Task 5-4: 権限確認型の実装
6. Task 5-5: エクスポート確認
7. TDD 検証（Green 状態確認）
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-23 | 初版作成 |
