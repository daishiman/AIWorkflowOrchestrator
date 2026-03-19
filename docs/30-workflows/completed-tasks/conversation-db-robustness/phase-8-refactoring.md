# Phase 8: リファクタリング

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 8                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 7（カバレッジ確認）               |
| 次Phase  | Phase 9（品質検証）                     |

## 目的

コード品質を改善し、重複を削除する。

## 実行タスク

- タスク1: `CONVERSATION_DB_SCHEMA` の `conversationDatabase.ts` への co-locate 確認（ipc/index.ts から完全に移動済みか）
- タスク2: DB パス解決ロジックの重複排除
- タスク3: エラーメッセージの統一（`sanitizeRegistrationErrorMessage` との整合）

## 参照資料

### 前Phase成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 受入基準       | `outputs/phase-1/acceptance-criteria.md` |
| 設計サマリー   | `outputs/phase-2/design-summary.md`      |
| 実装計画       | `outputs/phase-5/implementation-plan.md` |
| 回帰テスト計画 | `outputs/phase-6/regression-plan.md`     |
| カバレッジ計画 | `outputs/phase-7/coverage-plan.md`       |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容               |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------ |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン    |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーハンドリング |

## 実行手順

### ステップ1: DRY/SRP 観点の問題特定

- `CONVERSATION_DB_SCHEMA` の配置が `ipc/index.ts` から `conversationDatabase.ts` に完全移動済みか確認
- P61 チェック: DB 初期化ハンドラが具象クラスではなくインターフェースに依存しているか確認

### ステップ2: 重複排除

- DB パス解決ロジックの重複箇所を特定・統合

### ステップ3: 命名統一

- エラーメッセージの統一

### ステップ4: テスト回帰確認

```bash
cd apps/desktop && pnpm vitest run src/main/database/ src/main/ipc/ --reporter=verbose
```

## 統合テスト連携【必須】

既存 conversation テスト133件の回帰確認（リファクタリング後に全テスト PASS を確認）。

## 多角的チェック観点（AIが判断）

| 観点                     | チェック項目                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 重複排除の完全性         | `CONVERSATION_DB_SCHEMA` が `conversationDatabase.ts` に co-locate され、`ipc/index.ts` に残存していないか。`grep -rn "CONVERSATION_DB_SCHEMA" apps/desktop/src/main/` で確認 |
| DB パス解決の一元化      | DB パス解決ロジックが `conversationDatabase.ts` 内の1箇所に集約され、`ipc/index.ts` や `main/index.ts` に重複がないか                                                         |
| P61（DIP 準拠）          | IPC ハンドラ登録関数が `Database.Database` インターフェースに依存し、具象クラスへの直接依存がないか                                                                           |
| リファクタリング後の回帰 | 全テスト PASS を確認し、リファクタリングによる機能退行がないか                                                                                                                |

## 成果物

| 成果物               | パス                               | 説明                   |
| -------------------- | ---------------------------------- | ---------------------- |
| リファクタリング計画 | `outputs/phase-8/refactor-plan.md` | 実施した変更内容の記録 |

## 完了条件

- [ ] リファクタリング後も全テストが PASS している
- [ ] 重複コードが排除されている
- [ ] 命名が一貫している
- [ ] P61 チェック: IPC ハンドラ登録関数がインターフェース（ConversationDatabasePort）に依存していることを確認
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] タスク1: `CONVERSATION_DB_SCHEMA` の `conversationDatabase.ts` への co-locate 確認
- [ ] タスク2: DB パス解決ロジックの重複排除
- [ ] タスク3: エラーメッセージの統一（`sanitizeRegistrationErrorMessage` との整合）
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

Phase 8 完了後、Phase 9（品質検証）に進む。
