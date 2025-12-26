# システムプロンプトのデータベース永続化 - タスク実行仕様書

## ユーザーからの元の指示

```
システムプロンプトのテンプレートを、現在のelectron-storeではなく、
Tursoデータベースに永続化し、デスクトップとWebで共有できるようにする。
```

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | TASK-CHAT-SYSPROMPT-DB-001             |
| Worktreeパス | `.worktrees/task-{{timestamp}}`        |
| ブランチ名   | `task-{{timestamp}}`                   |
| タスク名     | システムプロンプトのデータベース永続化 |
| 分類         | 機能拡張                               |
| 対象機能     | チャット - システムプロンプト設定      |
| 優先度       | 高                                     |
| 見積もり規模 | 中規模                                 |
| ステータス   | 未実施                                 |
| 作成日       | 2025-12-26                             |

---

## タスク概要

### 目的

システムプロンプトのテンプレートをTursoデータベースに保存し、デスクトップアプリとWebアプリ間でテンプレートを共有できるようにする。

### 背景

**現在の実装**:

- テンプレートは `electron-store` でローカル保存（`~/.config/AIWorkflowOrchestrator/config.json`）
- デスクトップアプリ専用、Webアプリとの共有不可
- Embedded Replicas によるオフライン対応なし

**問題点**:

- デバイス間でテンプレートを共有できない
- Webアプリで同じテンプレート機能を利用できない
- バックアップ・復元が困難
- ユーザー認証との連動がない（すべてのユーザーで共通）

### 最終ゴール

- システムプロンプトテンプレートがTursoデータベースに保存される
- ユーザー認証と連動し、ユーザーごとにテンプレートが管理される
- デスクトップアプリは Embedded Replicas を使用してオフライン対応
- Webアプリでも同じテンプレート機能が利用可能
- 既存のプリセットテンプレートは引き続き利用可能
- 既存のelectron-store実装とのマイグレーション機能

### 成果物一覧

| 種別         | 成果物                   | 配置先                                                      |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| 環境         | Git Worktree環境         | `.worktrees/task-{{timestamp}}`                             |
| データベース | テーブルスキーマ定義     | `packages/shared/src/db/schema/systemPrompt.ts`             |
| データベース | マイグレーションファイル | `packages/shared/src/db/migrations/YYYY_MM_DD_*.sql`        |
| 実装         | Repository実装           | `packages/shared/src/repositories/systemPrompt.ts`          |
| 実装         | Slice更新（DB連携）      | `apps/desktop/src/renderer/store/slices/*.ts`               |
| 実装         | マイグレーション関数     | `apps/desktop/src/main/migration/electronStoreMigration.ts` |
| テスト       | Repository単体テスト     | `packages/shared/src/repositories/*.test.ts`                |
| テスト       | Slice統合テスト          | `apps/desktop/src/renderer/store/slices/*.test.ts`          |
| ドキュメント | 要件ドキュメント         | `docs/30-workflows/system-prompt-db/`                       |
| ドキュメント | 設計ドキュメント         | `docs/30-workflows/system-prompt-db/`                       |
| ドキュメント | マイグレーションガイド   | `docs/30-workflows/system-prompt-db/`                       |
| PR           | GitHub Pull Request      | GitHub UI                                                   |

---

## 参照ファイル

本仕様書のコマンド選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `docs/00-requirements/15-database-design.md` - データベース設計
- `docs/00-requirements/05-architecture.md` - アーキテクチャ設計
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                 | 責務                                   | 依存     |
| ------ | -------- | ---------------------------- | -------------------------------------- | -------- |
| T--1-1 | Phase -1 | Git Worktree環境作成・初期化 | Git Worktree環境の作成と初期化         | なし     |
| T-00-1 | Phase 0  | 機能要件定義                 | DB永続化機能の要件を明文化             | T--1-1   |
| T-01-1 | Phase 1  | データベーススキーマ設計     | テーブル構造、インデックス、制約の設計 | T-00-1   |
| T-01-2 | Phase 1  | Repository層設計             | CRUD操作、ユーザー認証連動の設計       | T-00-1   |
| T-01-3 | Phase 1  | マイグレーション設計         | electron-storeからの移行方法設計       | T-00-1   |
| T-02-1 | Phase 2  | 設計レビュー                 | 要件・設計の妥当性検証                 | T-01-1~3 |
| T-03-1 | Phase 3  | Repositoryテスト作成         | CRUD操作のテスト作成                   | T-02-1   |
| T-03-2 | Phase 3  | Sliceテスト作成              | 状態管理のテスト作成                   | T-02-1   |
| T-03-3 | Phase 3  | マイグレーションテスト作成   | データ移行のテスト作成                 | T-02-1   |
| T-04-1 | Phase 4  | データベーススキーマ実装     | Drizzle ORMによるスキーマ定義          | T-03-1   |
| T-04-2 | Phase 4  | Repository実装               | CRUD操作の実装                         | T-03-1   |
| T-04-3 | Phase 4  | Slice更新（DB連携）          | electron-store → Repository切り替え    | T-03-2   |
| T-04-4 | Phase 4  | マイグレーション実装         | electron-store → Turso移行処理         | T-03-3   |
| T-05-1 | Phase 5  | コードリファクタリング       | コード品質の改善                       | T-04-1~4 |
| T-06-1 | Phase 6  | 品質保証                     | テスト実行・品質チェック               | T-05-1   |
| T-07-1 | Phase 7  | 最終レビュー                 | 全体的な品質・整合性検証               | T-06-1   |
| T-08-1 | Phase 8  | 手動テスト検証               | マイグレーション、CRUD操作の手動確認   | T-07-1   |
| T-09-1 | Phase 9  | ドキュメント更新             | データベース設計書等の更新             | T-08-1   |
| T-10-1 | Phase 10 | コミット作成                 | 差分確認・コミット作成                 | T-09-1   |
| T-10-2 | Phase 10 | PR作成                       | PR作成・CI確認                         | T-10-1   |

**総サブタスク数**: 19個

---

## 設計概要

### データベーススキーマ

```typescript
// packages/shared/src/db/schema/systemPrompt.ts
export const systemPromptTemplates = sqliteTable(
  "system_prompt_templates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: text("content").notNull(),
    isPreset: integer("is_preset", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("system_prompt_templates_user_id_idx").on(table.userId),
    nameIdx: index("system_prompt_templates_name_idx").on(table.name),
    uniqueUserName: unique("unique_user_name").on(table.userId, table.name),
  }),
);
```

### Repository層インターフェース

```typescript
export interface ISystemPromptRepository {
  // CRUD操作
  findAllByUserId(userId: string): Promise<PromptTemplate[]>;
  findById(id: string): Promise<PromptTemplate | null>;
  create(
    userId: string,
    data: CreatePromptTemplateInput,
  ): Promise<PromptTemplate>;
  update(id: string, data: UpdatePromptTemplateInput): Promise<PromptTemplate>;
  delete(id: string): Promise<void>;

  // プリセット保護
  isPreset(id: string): Promise<boolean>;
}
```

### マイグレーション戦略

**ステップ1**: アプリ起動時に自動実行

- electron-storeから既存テンプレートを読み込み
- 現在のユーザーIDを取得
- Tursoデータベースに挿入（重複チェックあり）

**ステップ2**: electron-storeのクリーンアップ

- 移行成功後、electron-storeの`systemPromptTemplates`キーを削除
- バックアップ用に `.bak` ファイルを作成

**ステップ3**: フォールバック

- マイグレーション失敗時はelectron-storeに戻す
- エラーログを記録し、ユーザーに通知

---

## 技術スタック

| カテゴリ       | 技術                              |
| -------------- | --------------------------------- |
| データベース   | Turso + libSQL                    |
| ORM            | Drizzle ORM                       |
| オフライン対応 | Turso Embedded Replicas (Desktop) |
| テスト         | Vitest                            |
| 型安全性       | TypeScript                        |

---

## リスクと対策

| リスク                              | 影響度 | 対策                                 |
| ----------------------------------- | ------ | ------------------------------------ |
| マイグレーション失敗                | 高     | 自動バックアップ、フォールバック機能 |
| プリセットテンプレートの重複挿入    | 中     | unique制約、重複チェックロジック     |
| オフライン時のEmbedded Replicas遅延 | 低     | 同期待機時のローディング表示         |
| Webアプリでの実装工数増加           | 中     | Shared Repository層で実装を共通化    |

---

## 完了条件チェックリスト

### 機能要件

- [ ] システムプロンプトテンプレートがTursoに保存される
- [ ] ユーザー認証と連動し、ユーザーごとに管理される
- [ ] プリセットテンプレートは全ユーザーで共有される
- [ ] electron-storeからの自動マイグレーションが実行される
- [ ] Embedded ReplicasによるオフラインCRUD操作が可能

### 非機能要件

- [ ] 保存時のレスポンス時間 < 100ms
- [ ] 一覧取得時のレスポンス時間 < 200ms
- [ ] テストカバレッジ 80%以上
- [ ] マイグレーション成功率 100%（既存データ損失なし）

### 品質要件

- [ ] すべての単体テストが成功
- [ ] TypeScriptエラー 0件
- [ ] ESLintエラー 0件
- [ ] 手動テストで全機能動作確認

---

## Phase -1: Git Worktree環境作成・初期化

### T--1-1: Git Worktree環境作成

```bash
# 現在のブランチを確認（mainまたはdevelopであること）
git branch --show-current

# タイムスタンプ取得
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Worktree作成
git worktree add .worktrees/task-${TIMESTAMP}-system-prompt-db -b task-${TIMESTAMP}

# Worktreeに移動
cd .worktrees/task-${TIMESTAMP}-system-prompt-db

# 依存関係インストール
pnpm install

# 初期ビルド確認
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop typecheck
```

**完了条件**:

- [ ] Worktree環境が作成されている
- [ ] 依存関係がインストールされている
- [ ] ビルドエラーがない

---

## Phase 0: 要件定義

### T-00-1: 機能要件定義

#### Claude Code スラッシュコマンド

```
/ai:define-requirements

機能名: システムプロンプトのデータベース永続化
目的: Tursoデータベースに永続化し、デスクトップとWebで共有
背景: 現在はelectron-storeローカル保存のみ、共有不可
スコープ: データベーススキーマ、Repository層、マイグレーション、Slice更新
```

**完了条件**:

- [ ] `docs/30-workflows/system-prompt-db/task-step00-requirements.md` が作成されている
- [ ] 機能要件（FR）が明確に定義されている
- [ ] 非機能要件（NFR）が定義されている
- [ ] ユーザーストーリーが記載されている

---

## Phase 1: 設計

### T-01-1: データベーススキーマ設計

#### Claude Code スラッシュコマンド

```
/ai:design-database

対象: system_prompt_templatesテーブル
要件: ユーザーごとのテンプレート管理、プリセットフラグ、重複防止
参考: docs/00-requirements/15-database-design.md
```

**完了条件**:

- [ ] `docs/30-workflows/system-prompt-db/task-step01-database-schema.md` が作成されている
- [ ] テーブル構造が定義されている
- [ ] インデックス、制約が設計されている
- [ ] プリセットテンプレートの扱いが明確

### T-01-2: Repository層設計

#### Claude Code スラッシュコマンド

```
/ai:design-repository

Repository名: SystemPromptRepository
操作: CRUD、ユーザーフィルタリング、プリセット保護
参考: docs/00-requirements/06-core-interfaces.md
```

**完了条件**:

- [ ] `docs/30-workflows/system-prompt-db/task-step01-repository-design.md` が作成されている
- [ ] インターフェースが定義されている
- [ ] エラーハンドリングが設計されている

### T-01-3: マイグレーション設計

#### Claude Code スラッシュコマンド

```
/ai:design-migration

移行元: electron-store（~/.config/AIWorkflowOrchestrator/config.json）
移行先: Turso system_prompt_templatesテーブル
戦略: アプリ起動時の自動実行、バックアップ、フォールバック
```

**完了条件**:

- [ ] `docs/30-workflows/system-prompt-db/task-step01-migration-strategy.md` が作成されている
- [ ] マイグレーション手順が明確
- [ ] ロールバック手順が定義されている

---

## Phase 2: 設計レビュー

### T-02-1: 設計レビュー

#### Claude Code スラッシュコマンド

```
/ai:review-design

対象: Phase 1設計ドキュメント全体
観点: 要件充足性、技術的妥当性、リスク評価
```

**完了条件**:

- [ ] `docs/30-workflows/system-prompt-db/task-step02-design-review.md` が作成されている
- [ ] レビュー結果がPASSである
- [ ] 指摘事項がすべて解決されている

---

## Phase 3: テスト作成（TDD）

### T-03-1: Repositoryテスト作成

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests

対象: packages/shared/src/repositories/systemPromptRepository.ts
範囲: CRUD操作、ユーザーフィルタリング、プリセット保護
```

### T-03-2: Sliceテスト作成

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests

対象: apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts
範囲: DB連携、状態更新、エラーハンドリング
```

### T-03-3: マイグレーションテスト作成

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests

対象: apps/desktop/src/main/migration/electronStoreMigration.ts
範囲: データ読み込み、変換、挿入、ロールバック
```

**完了条件**:

- [ ] すべてのテストが失敗（Red状態）
- [ ] テストケースが網羅的

---

## Phase 4: 実装

### T-04-1: データベーススキーマ実装

#### Claude Code スラッシュコマンド

```
/ai:implement-feature

対象: packages/shared/src/db/schema/systemPrompt.ts
参考: task-step01-database-schema.md
TDD: はい（T-03-1のテスト基準）
```

### T-04-2: Repository実装

#### Claude Code スラッシュコマンド

```
/ai:implement-feature

対象: packages/shared/src/repositories/systemPromptRepository.ts
参考: task-step01-repository-design.md
TDD: はい（T-03-1のテスト基準）
```

### T-04-3: Slice更新（DB連携）

#### Claude Code スラッシュコマンド

```
/ai:implement-feature

対象: apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts
参考: task-step01-repository-design.md
TDD: はい（T-03-2のテスト基準）
変更内容: electron-store → Repository切り替え
```

### T-04-4: マイグレーション実装

#### Claude Code スラッシュコマンド

```
/ai:implement-feature

対象: apps/desktop/src/main/migration/electronStoreMigration.ts
参考: task-step01-migration-strategy.md
TDD: はい（T-03-3のテスト基準）
```

**完了条件**:

- [ ] すべてのテストが成功（Green状態）
- [ ] TypeScriptエラーなし

---

## Phase 5: リファクタリング

### T-05-1: コードリファクタリング

#### Claude Code スラッシュコマンド

```
/ai:refactor-code

対象: Phase 4実装ファイル全体
観点: DRY原則、命名規則、循環的複雑度、エラーハンドリング
```

**完了条件**:

- [ ] コード品質が向上
- [ ] すべてのテストが成功維持

---

## Phase 6: 品質保証

### T-06-1: 品質保証

#### Claude Code スラッシュコマンド

```
/ai:quality-check

対象: システムプロンプトDB永続化機能全体
チェック項目: テスト、型チェック、lint、ビルド
```

**完了条件**:

- [ ] すべてのテスト成功
- [ ] TypeScriptエラー 0件
- [ ] ESLintエラー 0件
- [ ] ビルド成功

---

## Phase 7: 最終レビュー

### T-07-1: 最終レビュー

#### Claude Code スラッシュコマンド

```
/ai:final-review

対象: システムプロンプトDB永続化機能全体
観点: 要件充足性、設計準拠性、コード品質、テストカバレッジ
```

**完了条件**:

- [ ] `docs/30-workflows/system-prompt-db/task-step07-final-review.md` が作成されている
- [ ] レビュー結果がPASSである
- [ ] 指摘事項がすべて解決されている

---

## Phase 8: 手動テスト

### T-08-1: 手動テスト検証

#### 手動実施（Claude Code経由でガイド取得可能）

**テストケース**:

1. 初回起動時のマイグレーション動作確認
2. テンプレート保存（ユーザーA）
3. テンプレート一覧取得（ユーザーA）
4. テンプレート削除（ユーザーA）
5. プリセットテンプレート削除試行（エラー確認）
6. 別ユーザーでログイン（ユーザーB）
7. テンプレート一覧（ユーザーBは空、プリセットのみ）
8. オフライン状態でのCRUD操作
9. オンライン復帰後の同期確認

**完了条件**:

- [ ] `docs/30-workflows/system-prompt-db/task-step08-manual-test-results.md` が作成されている
- [ ] すべてのテストケースが成功
- [ ] 不具合が0件

---

## Phase 9: ドキュメント更新

### T-09-1: ドキュメント更新

#### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

**更新対象**:

- `docs/00-requirements/15-database-design.md` - テーブル追加
- `docs/00-requirements/05-architecture.md` - 状態管理セクション更新

**完了条件**:

- [ ] すべての対象ドキュメントが更新されている
- [ ] ドキュメントの整合性が保たれている

---

## Phase 10: PR作成

### T-10-1: コミット作成

#### Claude Code スラッシュコマンド

```
/ai:create-commit

対象: システムプロンプトDB永続化機能全体
メッセージ: feat(chat): システムプロンプトのデータベース永続化
```

### T-10-2: PR作成

#### Claude Code スラッシュコマンド

```
/ai:create-pr

タイトル: feat(chat): システムプロンプトのデータベース永続化
ベースブランチ: main
説明: Tursoデータベース連携、electron-storeマイグレーション、オフライン対応
```

**完了条件**:

- [ ] PRが作成されている
- [ ] CIが成功している
- [ ] レビュー準備完了

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2025-12-26 | 1.0 | 初版作成 | Claude |
