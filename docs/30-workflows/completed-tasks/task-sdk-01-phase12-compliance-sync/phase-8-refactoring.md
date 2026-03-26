# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 8                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

同じ意味を複数箇所に書いたことで再び drift が起きないよう、文言とリンクを整理する。

## 実行タスク

- wording 正規化: status 表現、Step 1 / Step 2 表現、no-op 表現を揃える
- duplication review: summary と changelog の重複断片を整理する
- link cleanup: backlog、completed ledger、unassigned-task の導線を整理する

## 参照資料

| 資料名                 | パス                                                                                          | 説明              |
| ---------------------- | --------------------------------------------------------------------------------------------- | ----------------- |
| phase-1 requirements   | `phase-1-requirements.md`                                                                     | 用語基準          |
| phase-2 design         | `phase-2-design.md`                                                                           | topology          |
| phase-5 implementation | `phase-5-implementation.md`                                                                   | 更新対象          |
| phase-6 test expansion | `phase-6-test-expansion.md`                                                                   | 回帰観点          |
| phase-7 coverage check | `phase-7-coverage-check.md`                                                                   | coverage 外の論点 |
| parent workflow        | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md` | wording 整理対象  |

## 実行手順

### ステップ1: wording を揃える

`completed`、`blocked`、`spec_created`、`no-op` の使い分けを fixed vocabulary に揃える。

### ステップ2: 重複説明を整理する

summary と changelog に書く役割を分け、同じ根拠を 2 箇所に分断しない。

### ステップ3: link cleanup を行う

task ID、file path、related task 記法を揃える。

## 統合テスト連携

| 観点                | 実施内容                                    |
| ------------------- | ------------------------------------------- |
| wording consistency | 同じ status が同じ意味で使われているか      |
| duplication         | summary と changelog が別役割になっているか |
| links               | link path が存在しているか                  |

## 多角的チェック観点

| 観点     | この Phase で確認する内容            |
| -------- | ------------------------------------ |
| 可読性   | 監査者が 1 回で読める構造か          |
| 保守性   | 同じ情報を複数箇所で直す必要がないか |
| 正本意識 | canonical path がぶれていないか      |

## サブタスク管理

1. wording 正規化
2. duplication review
3. link cleanup
4. Phase 9 input 整理

## 成果物

| 成果物                | パス                                       | 説明           |
| --------------------- | ------------------------------------------ | -------------- |
| wording normalization | `outputs/phase-8/wording-normalization.md` | 用語統一方針   |
| duplication review    | `outputs/phase-8/duplication-review.md`    | 重複箇所の整理 |
| link cleanup          | `outputs/phase-8/link-cleanup.md`          | link 整理結果  |

## 完了条件

- [ ] fixed vocabulary が定義されている
- [ ] summary と changelog の役割分担が明記されている
- [ ] link cleanup 対象が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 6 を参照した
- [ ] Phase 7 を参照した

## 次のPhase

Phase 9: 品質保証
