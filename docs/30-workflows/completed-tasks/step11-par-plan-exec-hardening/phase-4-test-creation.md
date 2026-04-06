# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 4                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

Phase 3 のレビュー結果をもとに、実装前に drift 再発を止めるテストを定義する。

## 実行タスク

- P0-07 用の runtime テストケースを定義する
- U2 用の renderer テストケースを定義する
- 並列実装時にテストファイルが競合しないことを確認する

## 参照資料

| 資料名            | パス                                                                                               | 参照理由              |
| ----------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| runtime plan test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`          | P0-07 の追加先        |
| renderer llm test | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | U2 の追加先           |
| runtime facade    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                              | P0-07 の current code |
| renderer panel    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | U2 の current code    |

## テスト方針

### TASK-P0-07

- `PLAN_RESOURCE_REQUESTS` の agent エントリだけが agent 名導出に使われることを確認する
- `AGENT_NAMES` の残留参照が runtime services にないことを確認する
- fallback path が current source of truth を読んでいることを確認する

### TASK-SDK-04-U2

- plan 生成後に textarea を編集しても `executePlan(planId, approvedSkillSpec)` の第 2 引数が変わらないことを確認する
- cancel で snapshot が null に戻ることを確認する
- generate → edit → execute の drift 再現を固定する

## テストケース詳細

### TASK-P0-07

| ID      | シナリオ                                                                                   | 期待結果                                                                   |
| ------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| T-P7-01 | `RuntimeSkillCreatorFacade.plan()` が `PLAN_RESOURCE_REQUESTS` の agent エントリを読み込む | `discover-problem` / `design-workflow` / `plan-structure` が順番に読まれる |
| T-P7-02 | `PLAN_RESOURCE_REQUESTS` に reference エントリがあっても agent 名導出に混ざらない          | agent 以外は無視される                                                     |
| T-P7-03 | fallback path でも agent 名導出が current source of truth と一致する                       | prompt に同じ agent セットが入る                                           |
| T-P7-04 | runtime test で `AGENT_NAMES` 残留参照を検出する                                           | 0 件で pass                                                                |

### TASK-SDK-04-U2

| ID      | シナリオ                             | 期待結果                                         |
| ------- | ------------------------------------ | ------------------------------------------------ |
| T-S4-01 | plan 生成後に textarea を編集する    | execute payload は plan 承認時の snapshot のまま |
| T-S4-02 | `approvedSkillSpec` が cancel される | `null` に戻る                                    |
| T-S4-03 | generate → edit → execute            | live draft が execute に流れない                 |
| T-S4-04 | plan 失敗時                          | approved snapshot は更新されない                 |

## 成果物

| 成果物     | パス                           | 説明             |
| ---------- | ------------------------------ | ---------------- |
| テスト計画 | `phase-4-test-creation.md`     | RED phase の固定 |
| テストメモ | `outputs/phase-4/test-plan.md` | 実装時の参照メモ |

## 完了条件

- [ ] P0-07 のテストケースが current code anchor に対応している
- [ ] U2 の drift 防止テストが current code anchor に対応している
- [ ] 2 つのテストファイルが競合せずに並列実装できる

## サブタスク管理

1. P0-07 の runtime テスト定義
2. U2 の renderer テスト定義
3. 並列競合の確認
4. テストケースの README 化

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 2 ファイルの責務が重複していない
- [ ] Phase 5 で RED から GREEN に進める
