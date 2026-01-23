# Phase 1: 要件定義レポート

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-1-1   |
| フェーズ   | 1          |
| 実行日時   | 2026-01-23 |
| ステータス | 完了       |

---

## 1. Task 1-1: 仕様書確認結果

### 1.1 specification.md §5.1 で定義されている型一覧

| カテゴリ               | 型名                       | 説明                                      |
| ---------------------- | -------------------------- | ----------------------------------------- |
| **スキルメタデータ系** | `SkillMetadata`            | スキル基本情報（SKILL.md frontmatter）    |
|                        | `SkillSubResource`         | スキル配下のサブリソース                  |
|                        | `SkillOtherFile`           | その他ファイル（EVALS.json, LOGS.md等）   |
|                        | `ImportedSkill`            | インポート済みスキル（SkillMetadata拡張） |
| **実行関連**           | `SkillExecutionRequest`    | 実行リクエスト（Renderer→Main）           |
|                        | `SkillExecutionResponse`   | 実行レスポンス（Main→Renderer）           |
|                        | `SkillExecutionStatus`     | 実行ステータス列挙型                      |
| **ストリーミング**     | `SkillStreamMessageType`   | メッセージ種別                            |
|                        | `AssistantMessageContent`  | アシスタントメッセージ内容                |
|                        | `ToolUseMessageContent`    | ツール使用メッセージ内容                  |
|                        | `ToolResultMessageContent` | ツール結果メッセージ内容                  |
|                        | `StatusMessageContent`     | ステータスメッセージ内容                  |
|                        | `ErrorMessageContent`      | エラーメッセージ内容                      |
|                        | `SkillStreamMessage`       | Discriminated Union型                     |
| **権限確認**           | `PermissionRequest`        | 権限確認リクエスト（Main→Renderer）       |
|                        | `PermissionResponse`       | 権限確認レスポンス（Renderer→Main）       |

### 1.2 各型の詳細プロパティ（§5.1より抜粋）

#### SkillMetadata

- `name: string` - スキル識別子
- `description: string` - スキル説明
- `allowedTools?: string[]` - 許可ツール
- `path: string` - スキルディレクトリパス
- `updatedAt: Date` - 最終更新日時
- `agents: SkillSubResource[]` - agents/配下
- `references: SkillSubResource[]` - references/配下
- `scripts: SkillSubResource[]` - scripts/配下
- `assets: SkillSubResource[]` - assets/配下
- `schemas: SkillSubResource[]` - schemas/配下
- `indexes: SkillSubResource[]` - indexes/配下
- `otherFiles: SkillOtherFile[]` - その他ファイル

#### SkillSubResource

- `filename: string` - ファイル名
- `relativePath: string` - 相対パス
- `description?: string` - 説明
- `size: number` - ファイルサイズ

#### SkillOtherFile

- `filename: string` - ファイル名
- `type: "evals" | "logs" | "package" | "other"` - ファイルタイプ
- `size: number` - ファイルサイズ

#### ImportedSkill (extends SkillMetadata)

- `importedAt: Date` - インポート日時
- `status: "active" | "disabled"` - ステータス
- `content?: string` - SKILL.md本文キャッシュ

#### SkillExecutionRequest

- `skillName: string` - スキル名
- `prompt: string` - ユーザープロンプト
- `workingDirectory?: string` - 作業ディレクトリ

#### SkillExecutionResponse

- `executionId: string` - 実行ID（UUID）
- `success: boolean` - 成功フラグ
- `error?: string` - エラーメッセージ

#### SkillExecutionStatus

- `"idle" | "running" | "permission_pending" | "completed" | "cancelled" | "error"`

#### SkillStreamMessage (Discriminated Union)

- 共通: `executionId: string`, `timestamp: number`
- type別に `content` が異なる

#### PermissionRequest

- `executionId: string` - 実行ID
- `requestId: string` - リクエストID
- `toolName: string` - ツール名
- `args: Record<string, unknown>` - 引数
- `reason?: string` - 理由

#### PermissionResponse

- `requestId: string` - リクエストID
- `approved: boolean` - 承認フラグ
- `rememberChoice?: boolean` - 記憶フラグ
- `rejectReason?: string` - 拒否理由

---

## 2. Task 1-2: 既存型確認結果

### 2.1 既存の skill.ts に定義されている型

| 型名                   | 用途           | 維持 |
| ---------------------- | -------------- | ---- |
| `Anchor`               | 参照文献情報   | ✓    |
| `SkillEnvironmentType` | 環境タイプ     | ✓    |
| `EnvironmentConfig`    | 環境設定       | ✓    |
| `SkillCategory`        | スキルカテゴリ | ✓    |
| `SKILL_CATEGORIES`     | カテゴリ定数   | ✓    |
| `Skill`                | スキル基本情報 | ✓    |
| `SkillDetail`          | スキル詳細情報 | ✓    |
| `SkillImportConfig`    | インポート設定 | ✓    |
| `OperationResult`      | 操作結果       | ✓    |
| `SkillScanError`       | スキャンエラー | ✓    |
| `SkillScanResult`      | スキャン結果   | ✓    |
| `ImportResult`         | インポート結果 | ✓    |
| `RemoveResult`         | 削除結果       | ✓    |
| `SkillRunResult`       | 実行結果       | ✓    |

### 2.2 既存の agent.ts に定義されている型（参考）

| 型名                   | 用途                 | 備考                               |
| ---------------------- | -------------------- | ---------------------------------- |
| `PermissionRequest`    | 権限確認リクエスト   | §5.1版とは別（rejectReasonがない） |
| `PermissionResponse`   | 権限確認レスポンス   | §5.1版とは別（rejectReasonがない） |
| `AgentExecutionStatus` | エージェント実行状態 | SkillExecutionStatusとは別         |

### 2.3 差分分析

| 追加が必要な型             | 理由                       |
| -------------------------- | -------------------------- |
| `SkillMetadata`            | §5.1で新規定義             |
| `SkillSubResource`         | §5.1で新規定義             |
| `SkillOtherFile`           | §5.1で新規定義             |
| `ImportedSkill`            | §5.1で新規定義             |
| `SkillExecutionRequest`    | §5.1で新規定義             |
| `SkillExecutionResponse`   | §5.1で新規定義             |
| `SkillExecutionStatus`     | §5.1で新規定義             |
| `SkillStreamMessageType`   | §5.1で新規定義             |
| `AssistantMessageContent`  | §5.1で新規定義             |
| `ToolUseMessageContent`    | §5.1で新規定義             |
| `ToolResultMessageContent` | §5.1で新規定義             |
| `StatusMessageContent`     | §5.1で新規定義             |
| `ErrorMessageContent`      | §5.1で新規定義             |
| `SkillStreamMessage`       | §5.1で新規定義             |
| `SkillPermissionRequest`   | §5.1版（agent.tsとは別名） |
| `SkillPermissionResponse`  | §5.1版（agent.tsとは別名） |

**注意**: agent.ts の `PermissionRequest`/`PermissionResponse` と §5.1 の型は構造が異なる。

- §5.1版には `rejectReason` プロパティがある
- 名前衝突を避けるため、`SkillPermissionRequest`/`SkillPermissionResponse` として追加する

---

## 3. Task 1-3: システム仕様確認結果

### 3.1 Agent SDK インターフェース仕様との整合性

| 確認項目                 | 状態 | 備考                                         |
| ------------------------ | ---- | -------------------------------------------- |
| packages/shared への配置 | ✓    | 既存パターンに従い src/types/skill.ts に追加 |
| 型エクスポートパターン   | ✓    | index.ts から明示的エクスポート              |
| IPC通信型の設計          | ✓    | Renderer⇔Main間の型として使用可能            |
| Zodスキーマとの整合性    | N/A  | 型定義のみ（Zodは後続タスク）                |

### 3.2 エラーハンドリング仕様との整合性

| 確認項目                 | 状態 | 備考                                                |
| ------------------------ | ---- | --------------------------------------------------- |
| ErrorMessageContent.code | ✓    | スキル実行固有のエラーコードを使用                  |
| エラーコード定義         | ✓    | sdk_error/permission_denied/timeout/network/unknown |
| リトライ可否フラグ       | ✓    | retryable プロパティを含む                          |

### 3.3 既存型との後方互換性

| 型名               | 互換性 | 対策               |
| ------------------ | ------ | ------------------ |
| Skill              | ✓      | 維持（削除しない） |
| SkillDetail        | ✓      | 維持（削除しない） |
| OperationResult    | ✓      | 維持・再利用可能   |
| PermissionRequest  | ✓      | agent.ts版を維持   |
| PermissionResponse | ✓      | agent.ts版を維持   |

---

## 4. 受け入れ基準チェックリスト

### 4.1 機能要件

| ID    | 要件                                                             | 状態 |
| ----- | ---------------------------------------------------------------- | ---- |
| FR-01 | specification.md §5.1 の全型定義が実装されている                 | 待機 |
| FR-02 | 既存の型定義との後方互換性が維持されている                       | 待機 |
| FR-03 | 型エクスポートが `packages/shared/src/index.ts` に追加されている | 待機 |
| FR-04 | Discriminated Union 型が型ガード可能な構造になっている           | 待機 |
| FR-05 | 全ての public 型に JSDoc コメントが付与されている                | 待機 |

### 4.2 非機能要件

| ID     | 要件                                             | 状態 |
| ------ | ------------------------------------------------ | ---- |
| NFR-01 | TypeScript strict モードでコンパイルエラーがない | 待機 |
| NFR-02 | `pnpm --filter @repo/shared build` が成功する    | 待機 |
| NFR-03 | 他パッケージ（desktop/web）からインポート可能    | 待機 |
| NFR-04 | 型定義のみで実行時コードを含まない（定数を除く） | 待機 |

---

## 5. 制約事項

| ID   | 制約                                                  | 対応方針             |
| ---- | ----------------------------------------------------- | -------------------- |
| C-01 | 既存の Skill/SkillDetail 型は削除しない（後方互換性） | 既存型はそのまま維持 |
| C-02 | 既存のエクスポートは維持する                          | 追加のみ、削除しない |
| C-03 | 循環参照を避ける                                      | skill.ts内で完結     |
| C-04 | 実行時コードは最小限（型ガード関数のみ許可）          | 型定義のみ実装       |

---

## 6. 実装方針

### 6.1 ファイル構成

```
packages/shared/src/types/skill.ts  # 追記（既存ファイル）
packages/shared/index.ts            # エクスポート追加
```

### 6.2 名前衝突の回避

| §5.1 の型名        | 実装時の型名            | 理由                   |
| ------------------ | ----------------------- | ---------------------- |
| PermissionRequest  | SkillPermissionRequest  | agent.tsの同名型と区別 |
| PermissionResponse | SkillPermissionResponse | agent.tsの同名型と区別 |

### 6.3 追加する型の順序

1. SkillOtherFile（依存なし）
2. SkillSubResource（依存なし）
3. SkillMetadata（SkillOtherFile, SkillSubResourceを使用）
4. ImportedSkill（SkillMetadataを拡張）
5. SkillExecutionRequest（依存なし）
6. SkillExecutionResponse（依存なし）
7. SkillExecutionStatus（依存なし）
8. SkillStreamMessageType（依存なし）
9. AssistantMessageContent（依存なし）
10. ToolUseMessageContent（依存なし）
11. ToolResultMessageContent（依存なし）
12. StatusMessageContent（依存なし）
13. ErrorMessageContent（依存なし）
14. SkillStreamMessage（上記Content型を使用）
15. SkillPermissionRequest（依存なし）
16. SkillPermissionResponse（依存なし）

---

## 7. 完了条件検証

| 条件                                      | 状態 |
| ----------------------------------------- | ---- |
| Task 1-1 完了: 仕様書の型定義を全て確認   | ✓    |
| Task 1-2 完了: 既存型との差分を特定       | ✓    |
| Task 1-3 完了: システム仕様との整合性確認 | ✓    |
| 受け入れ基準が明確に定義されている        | ✓    |
| 制約事項が明確に定義されている            | ✓    |

---

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2026-01-23 | Phase 1 完了 |
