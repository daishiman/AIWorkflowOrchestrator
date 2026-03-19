# Phase 4: テスト作成

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 4                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 3（設計レビュー）PASS             |
| 次Phase  | Phase 5（実装）                         |

## 目的

`initializeConversationDatabase` Factory 関数群と DI 変更のテストケースを TDD Red Phase で作成する。

## 事前確認

- [ ] IPC レスポンス形式: 既存の `{ success: false, error: { code, message } }` ラッパーを維持
- [ ] テスト対象ファイルの import 副作用: `better-sqlite3` の `new Database()` はコンストラクタ内のためトップレベル副作用なし
- [ ] 既存ユーティリティ重複: `grep -rn "DatabaseManager\|initializeDatabase" apps/desktop/src/main/` で確認

## 実行タスク

- タスク1: `initializeConversationDatabase` Factory 関数群の単体テスト設計（T-01〜T-03: 15件）
- タスク2: `registerAllIpcHandlers` DI 変更の回帰テスト設計（T-04: 2件）

## テストケース一覧

### T-01: 正常系 - DB 初期化成功

```typescript
describe("initializeConversationDatabase", () => {
  it("initialize() で DB ファイルが自動作成される", () => {});
  it("initialize() で WAL モードが設定される", () => {});
  it("initialize() で foreign_keys が有効化される", () => {});
  it("initialize() で busy_timeout が設定される", () => {});
  it("getConversationDatabase() で初期化済み DB インスタンスを返す", () => {});
  it("isConversationDatabaseInitialized() が true を返す", () => {});
});
```

### T-02: 異常系 - DB 初期化失敗

```typescript
describe("ConversationDatabaseManager - エラー", () => {
  it("ディレクトリ作成失敗時にエラーを投げる", () => {});
  it("DB ファイル作成失敗時にエラーを投げる", () => {});
  it("未初期化で getDatabase() を呼ぶとエラー", () => {});
  it("二重初期化は既存インスタンスを返す", () => {});
});
```

| T-02-P42 | DBパスがスペースのみの場合はエラー | P42準拠3段バリデーション |

### T-03: ライフサイクル管理

```typescript
describe("initializeConversationDatabase - ライフサイクル", () => {
  it("closeConversationDatabase() で DB が安全にクローズされる", () => {});
  it("close() 後に isConversationDatabaseInitialized() が false を返す", () => {});
  it("close() 後に getConversationDatabase() がエラーを投げる", () => {});
  it("_resetForTesting() で内部状態がリセットされる", () => {});
});
```

### T-04: DI 統合

```typescript
describe("registerAllIpcHandlers - DB DI", () => {
  it("conversationDb を渡すと Section 13 で内部 DB 初期化をスキップする", () => {});
  it("conversationDb を渡さない場合は従来通り内部で初期化する（後方互換）", () => {});
});
```

## 参照資料

### 前Phase成果物

| 成果物               | パス                                         |
| -------------------- | -------------------------------------------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md` |
| 受入基準             | `outputs/phase-1/acceptance-criteria.md`     |
| 設計レビュー結果     | `outputs/phase-3/design-review-report.md`    |
| 設計サマリー         | `outputs/phase-2/design-summary.md`          |
| インターフェース定義 | `outputs/phase-2/interface-definitions.md`   |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン  |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーコード体系 |

## 統合テスト連携【必須】

既存 conversation テスト133件の回帰確認（テスト作成時に既存テストとの整合性を確認）。

## 多角的チェック観点（AIが判断）

| 観点                              | チェック項目                                                                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P40（テスト実行ディレクトリ依存） | テスト実行は `cd apps/desktop && pnpm vitest run` で行っているか。プロジェクトルートからの実行は `vitest.config.ts` の `environment` / `setupFiles` が読み込まれず失敗する |
| P9（テスト間リーク防止）          | `_resetForTesting()` を `afterEach` / `beforeEach` で呼び出し、モジュールスコープの DB 状態がテスト間でリークしないことを確認しているか                                    |
| P60（IPC レスポンス形式）         | DI 統合テスト（T-04）のアサーションが既存ハンドラの `{ success: boolean, error?: { code, message } }` ラッパー形式と一致しているか                                         |
| テストケース網羅性                | 正常系（T-01: 6件）+ 異常系（T-02: 5件）+ ライフサイクル（T-03: 4件）+ DI統合（T-04: 2件）= 合計17件が設計されているか                                                     |

## 成果物

| 成果物               | パス                                                                    | 説明                                   |
| -------------------- | ----------------------------------------------------------------------- | -------------------------------------- |
| テスト設計           | `outputs/phase-4/test-matrix.md`                                        | テストケース一覧・設計根拠             |
| テストコード（新規） | `apps/desktop/src/main/database/__tests__/conversationDatabase.test.ts` | ConversationDatabaseManager 単体テスト |
| テストコード（DI）   | `apps/desktop/src/main/ipc/__tests__/ipc-index-di.test.ts`              | DI 統合テスト                          |

## 完了条件

- [ ] テストケースが17件定義されている（T-01: 6件, T-02: 5件, T-03: 4件, T-04: 2件）
- [ ] テストファイルが作成され、全テストが RED（未実装で失敗）である
- [ ] テスト実行ディレクトリが `apps/desktop/` であること（P40対策）
- [ ] テスト実行は `cd apps/desktop` から行っていること（P40対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] タスク1: `initializeConversationDatabase` の単体テスト設計（T-01〜T-03: 15件）
- [ ] タスク2: `registerAllIpcHandlers` DI 変更の回帰テスト設計（T-04: 2件）
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

Phase 4 完了後、Phase 5（実装）に進む。
