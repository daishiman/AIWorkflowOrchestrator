# Phase 4: テスト作成

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 4                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

## 目的

false-success 再発防止と explicit error union の整合をテストケースへ落とす。

## 実行タスク

- plan logical error のテストを作成する
- improve logical error のテストを作成する
- execute 抑止の UI テストを作成する
- IPC transport failure 分離テストを作成する
- 正常系 / terminal handoff 回帰テストを作成する

## 参照資料

| 資料名           | パス                                                                                                  | 説明                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 2 設計     | `phase-2-design.md`                                                                                   | 目標契約                          |
| Phase 3 レビュー | `phase-3-design-review.md`                                                                            | gate 結果                         |
| Facade test      | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`                  | 既存テストパターン                |
| plan test        | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`             | plan ガードのテストパターン参照元 |
| stub-elimination | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts` | 新規作成対象（execute guard）     |
| renderer test    | `apps/desktop/src/renderer/components/skill/__tests__/`                                               | UI テストパターン                 |

## 実行手順

### ステップ1: テストマトリクス

| TC    | 対象            | 条件                  | 期待結果                                                              | AC         | 実装状況 |
| ----- | --------------- | --------------------- | --------------------------------------------------------------------- | ---------- | -------- |
| TC-01 | plan            | `llmAdapter` 未注入   | `success:false` の plan error union                                   | AC-1       | 実装済み |
| TC-02 | plan            | `resourceLoader` 不足 | `error.code === "resource_loader_unavailable"`                        | AC-1       | 実装済み |
| TC-03 | improve         | degraded 条件         | `RuntimeSkillCreatorImproveErrorResponse`                             | AC-3       | 実装済み |
| TC-04 | IPC             | plan logical error    | outer `success:true`, `data.success:false`                            | AC-5       | 実装済み |
| TC-05 | IPC             | validation failure    | outer `success:false`                                                 | AC-5       | 実装済み |
| TC-06 | renderer        | plan logical error    | error message 表示、execute CTA 無効                                  | AC-2, AC-6 | 実装済み |
| TC-07 | renderer        | unknown reason code   | fallback message を表示                                               | AC-6       | 実装済み |
| TC-08 | plan 正常系     | runtime 初期化済み    | 既存成功 shape 維持                                                   | AC-7       | 実装済み |
| TC-09 | improve handoff | `terminal_handoff`    | 既存 union 維持                                                       | AC-7       | 実装済み |
| TC-10 | execute         | `llmAdapter` 未注入   | `success:false`・`error` メッセージを含む `SkillExecuteResult` を返す | AC-1       | 実装済み |
| TC-11 | execute 正常系  | `llmAdapter` 注入済み | 通常の execute 処理が継続される（回帰テスト）                         | AC-7       | 実装済み |

### ステップ2: TC-10 / TC-11 テストファイル概要

- **テストファイルパス**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts`
- **参照パターン**: `RuntimeSkillCreatorFacade.plan.test.ts` の llmAdapter ガードテストと同様の構造
- **TC-10 実装結果**:
  - `RuntimeSkillCreatorFacade` のインスタンスを `llmAdapter` なしで生成し、`execute()` の `success:false` を確認済み
  - 戻り値の `error` に `DEGRADED_REASON_MESSAGES.llm_adapter_unavailable` の文言が含まれることを確認済み
  - `workflowEngine.recordExecutionFailure()` と `governanceHooks.onSessionEnd()` が呼ばれることを確認済み
- **TC-11 実装結果**:
  - `llmAdapter` を注入した状態で `execute()` が例外なく継続されることを確認済み
  - execute の実処理をモックして正常系 shape が維持されることを確認済み

## 統合テスト連携

- Phase 6 で edge case を追加する
- Phase 7 で TC と concern coverage を対応付ける

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| エラーハンドリング | 必須     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 必須     | `aiworkflow-requirements: ui-ux-*.md`                  |
| IPC通信            | 必須     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |

## 成果物

| 成果物      | パス                             | 説明       |
| ----------- | -------------------------------- | ---------- |
| テスト仕様  | `phase-4-test-creation.md`       | テスト計画 |
| test matrix | `outputs/phase-4/test-matrix.md` | TC 一覧    |

## 完了条件

- [x] logical error / transport error / 正常系 / handoff が分離されている
- [x] execute 抑止が UI テストに含まれている
- [x] wizard / lifecycle の両導線が対象化されている
- [x] **本Phase内の全タスクを100%実行完了**
