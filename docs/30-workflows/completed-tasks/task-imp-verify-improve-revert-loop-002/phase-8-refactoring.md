# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 8                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

リファクタリング（コード品質向上）。Phase 5 で実装した verify→improve→re-verify 閉ループのコード品質を改善し、可読性・保守性・一貫性を高める。

## 実行タスク

### Task 8-1: `verifyAndImproveLoop()` の処理分割検証

**対象**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

`verifyAndImproveLoop()` メソッドが長大になっていないかを検証し、必要に応じてヘルパーメソッドに分割する。

| 分割候補                    | 抽出先メソッド名（案） | 判断基準                                            |
| --------------------------- | ---------------------- | --------------------------------------------------- |
| verify 実行 + 結果判定      | `executeVerifyStep()`  | verify 実行 + allPassed 判定が10行以上あれば抽出    |
| improve 実行（LLM + apply） | `executeImproveStep()` | improve + apply + エラー処理が15行以上あれば抽出    |
| ループ結果の構築            | `buildLoopResult()`    | 結果オブジェクト構築が3箇所以上で重複していれば抽出 |

**確認事項**:

- [ ] メソッドの総行数を確認（目安: 50行以下が望ましい）
- [ ] 分岐の深さが3段以上ネストしていないか確認
- [ ] 抽出した場合、元のメソッドのフローが一目で追えるか確認
- [ ] 抽出後もテストが全件 PASS することを確認

### Task 8-2: `formatVerifyChecksAsFeedback()` の関数純度確認

**対象**: `apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts`

| 確認項目             | 期待                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| 副作用なし           | `console.log` / ファイル書き込み / グローバル変数変更がないこと                        |
| 冪等性               | 同一入力に対して常に同一出力を返すこと                                                 |
| 入力の非破壊         | 引数の `checks` 配列を変更（mutate）していないこと                                     |
| 空配列のハンドリング | `checks = []` の場合に空文字列またはヘッダーのみを返すこと                             |
| ソート安定性         | `severity` による並び替えが安定ソート（`Array.prototype.sort` の仕様に依存しないこと） |

### Task 8-3: 型定義の冗長性チェック

**対象**: `packages/shared/src/types/skillCreator.ts`

| チェック項目                                       | 確認内容                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 重複型定義                                         | `SkillCreatorVerifyResult` の拡張フィールドが他の型と重複していないか                                        |
| optional フィールドの一貫性                        | 新規追加フィールド（`improveAttemptCount?`, `maxImproveRetry?`, `loopExhausted?`）が全て optional であること |
| `RuntimeSkillCreatorVerifyAndImproveResult` の配置 | Facade 内部型として適切な場所に定義されているか（IPC に露出していないか）                                    |
| export の最小化                                    | 内部型が不必要に export されていないか                                                                       |

### Task 8-4: ネーミング一貫性チェック

**対象**: 全変更ファイル

| チェック項目                                            | 確認内容                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `improveAttemptCount` vs `attemptCount`                 | ローカル変数とフィールド名で混在していないか。統一ルールを確認           |
| `loopExhausted` の命名規約                              | プロジェクト内の既存パターン（`isXxx` / `xxxed` / `hasXxx`）と整合するか |
| `totalAttempts` vs `improveAttemptCount`                | 結果型と状態型で異なる名前を使用している理由が明確か                     |
| メソッド名: `recordVerifyPass` / `recordImproveAttempt` | 既存の `recordVerifyFailure` / `recordExecuteResult` との命名規約整合    |
| `failedChecksSummary` の命名                            | `Summary` が `feedback` と混同されないか                                 |

### Task 8-5: JSDoc コメント整備

**対象**: 全新規公開メソッド・型定義

| 対象                                        | 必要な JSDoc 内容                                                |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `recordVerifyPass()`                        | `@param planId`, `@param checks`, `@returns`, 状態遷移の説明     |
| `recordImproveAttempt()`                    | `@param planId`, `@param failedChecks`, `@returns`, 副作用の説明 |
| `getImproveAttemptCount()`                  | `@param planId`, `@returns`                                      |
| `verifyAndImproveLoop()`                    | 全 `@param`, `@returns`, ループ停止条件の列挙、`@throws` の有無  |
| `formatVerifyChecksAsFeedback()`            | `@param checks`, `@returns`, フォーマット仕様の説明              |
| `RuntimeSkillCreatorVerifyAndImproveResult` | 各フィールドの `/** */` コメント                                 |
| `SkillCreatorVerifyResult` 拡張フィールド   | 各新規フィールドの `/** */` コメント                             |

**確認事項**:

- [ ] 全新規公開メソッドに JSDoc が付与されている
- [ ] `@param` と `@returns` が記載されている
- [ ] 副作用がある場合は明記されている（例: 状態遷移を引き起こす）

## 検証

リファクタリング後に以下のコマンドで全テストが PASS することを確認する。

```bash
# 対象テスト実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorWorkflowEngine
pnpm --filter @repo/desktop test -- --reporter=verbose RuntimeSkillCreatorFacade
pnpm --filter @repo/desktop test -- --reporter=verbose formatVerifyChecksAsFeedback

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 参照資料

| 資料名               | パス                                                                     | 説明               |
| -------------------- | ------------------------------------------------------------------------ | ------------------ |
| Phase 1 要件         | `phase-1-requirements.md`                                                | 要件定義           |
| Phase 2 設計         | `phase-2-design.md`                                                      | 詳細設計           |
| Phase 3 設計レビュー | `phase-3-design-review.md`                                               | レビュー結果       |
| WorkflowEngine       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`   | 状態管理の拡張対象 |
| Facade               | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    | パイプライン追加先 |
| ヘルパー関数         | `apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts` | ユーティリティ     |
| 型定義               | `packages/shared/src/types/skillCreator.ts`                              | 型追加先           |

## 統合テスト連携

| 観点               | 内容                                                              |
| ------------------ | ----------------------------------------------------------------- |
| リファクタリング後 | 全テスト（Phase 4/6 で作成分 + 既存テスト）が PASS することを確認 |
| リグレッション確認 | TASK-P0-01 の既存テスト（25件+）にリグレッションがないことを確認  |

## 成果物

| 成果物               | パス                                   | 説明             |
| -------------------- | -------------------------------------- | ---------------- |
| リファクタリング記録 | `phase-8-refactoring.md`（本ファイル） | リファクタリング |

## 完了条件

- [ ] `verifyAndImproveLoop()` の処理分割が検証され、必要に応じて分割されている
- [ ] `formatVerifyChecksAsFeedback()` の関数純度が確認されている
- [ ] 型定義に冗長性・重複がないことを確認している
- [ ] ネーミングの一貫性が全変更ファイルで確認されている
- [ ] 全新規公開メソッド・型に JSDoc が整備されている
- [ ] リファクタリング後に全テストが PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
