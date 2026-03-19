# Phase 6: テスト拡充

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 6                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 5（実装）                         |
| 次Phase  | Phase 7（カバレッジ確認）               |

## 目的

回帰テスト・エッジケース・統合テストを追加し、テストカバレッジを拡充する。

## 実行タスク

- タスク1: エッジケーステスト追加（DB パスに空白・日本語を含む場合）
- タスク2: 回帰テスト（既存 conversation ハンドラとの統合）
- タスク3: ライフサイクル回帰（close 後の再初期化）
- タスク4: activate イベント後の DB 再利用テスト

## 参照資料

### 前Phase成果物

| 成果物   | パス                                     |
| -------- | ---------------------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容            |
| ----------------------- | ------------------------------------------------------------------------------ | --------------- |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン |

## 実行手順

### ステップ1: エッジケーステスト追加

対象ファイル: `apps/desktop/src/main/database/__tests__/conversationDatabase.test.ts`

追加テストケース:

- DB パスに日本語文字を含む場合（`/tmp/テスト/db.sqlite`）
- DB パスに空白文字を含む場合（`/tmp/my db/db.sqlite`）
- close() 後の再初期化シナリオ

### ステップ1.5: activate イベント後の DB 再利用テスト

対象ファイル: `apps/desktop/src/main/database/__tests__/conversationDatabase.test.ts`

追加テストケース:

- `initializeConversationDatabase()` 済みの状態で `getConversationDatabase()` を再度呼ぶと同一インスタンスを返す
- `unregisterAllIpcHandlers()` -> `registerAllIpcHandlers(newWindow, getConversationDatabase())` で二重初期化が発生しない

### ステップ2: テスト実行確認（P40対策）

```bash
cd apps/desktop && pnpm vitest run src/main/database/ --reporter=verbose
```

## 統合テスト連携【必須】

既存 conversation テスト133件の回帰確認（テスト拡充後に全テスト PASS を確認）。

## 多角的チェック観点（AIが判断）

| 観点                  | チェック項目                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 回帰テスト網羅性      | Phase 5 で変更した全ファイル（`conversationDatabase.ts`, `ipc/index.ts`, `main/index.ts`）に対応する回帰テストが存在するか       |
| activate 再利用テスト | macOS `activate` イベント後に `getConversationDatabase()` が同一インスタンスを返し、二重初期化が発生しないことをテストしているか |
| エッジケース網羅性    | DB パスの日本語・空白・パストラバーサル・スペースのみ（P42）の各パターンがテストされているか                                     |
| P9（テスト間リーク）  | 追加テストの `beforeEach` で `_resetForTesting()` を呼び出し、テスト間の状態リークがないか                                       |

## 成果物

| 成果物         | パス                                 | 説明                         |
| -------------- | ------------------------------------ | ---------------------------- |
| 回帰テスト計画 | `outputs/phase-6/regression-plan.md` | エッジケース・回帰テスト一覧 |

## 完了条件

- [ ] エッジケーステストが3件以上追加されている
- [ ] 回帰テストが既存テストと整合している
- [ ] 全テストが PASS している
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

- [ ] タスク1: エッジケーステスト追加（DB パスに空白・日本語を含む場合）
- [ ] タスク2: 回帰テスト（既存 conversation ハンドラとの統合）
- [ ] タスク3: ライフサイクル回帰（close 後の再初期化）
- [ ] タスク4: activate イベント後の DB 再利用テスト
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

Phase 6 完了後、Phase 7（カバレッジ確認）に進む。
