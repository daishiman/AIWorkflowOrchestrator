# Phase 5: 実装

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 5                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

親 workflow の Phase 12 文書、ledger、backlog、index を順序どおりに更新する。

## 実行タスク

- workflow body 更新: `index.md`、`phase-12-documentation.md`、`artifacts.json`、`outputs/artifacts.json` を同期する
- Phase 12 outputs 更新: `implementation-guide.md`、summary、changelog、detection、compliance-check を是正する
- ledger / index 更新: backlog、lessons、topic-map、keywords を更新する

## 参照資料

| 資料名                | パス                                                                                          | 説明           |
| --------------------- | --------------------------------------------------------------------------------------------- | -------------- |
| phase-4 test creation | `phase-4-test-creation.md`                                                                    | command suite  |
| command plan          | `outputs/phase-4/command-plan.md`                                                             | 実行順         |
| parent workflow       | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md` | 更新対象       |
| backlog               | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                  | canonical path |
| completed ledger      | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                | follow-up 記録 |

## 実行手順

### ステップ1: workflow body を更新する

4点同期対象を揃え、親 workflow 本文の status と完了条件を current facts へ寄せる。

### ステップ2: Phase 12 outputs を更新する

Part 1 / Part 2、Step 1 / Step 2、unassigned detection、compliance-check を是正する。

### ステップ3: ledger と index を更新する

backlog、lessons、topic-map、keywords を更新し、same-wave sync を閉じる。

## 統合テスト連携

| 観点              | 実施内容                                            |
| ----------------- | --------------------------------------------------- |
| file update order | workflow body → outputs → ledger / index の順を守る |
| parity            | root / outputs artifacts が同値になる               |
| ledger            | completed ledger と backlog の task path を確認する |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                     |
| -------- | --------------------------------------------- |
| 実務性   | 更新順が手戻りを作らないか                    |
| 境界意識 | code change と docs change を混同していないか |
| 監査性   | 誰が見ても更新理由を追跡できるか              |

## サブタスク管理

1. workflow body 更新
2. Phase 12 outputs 更新
3. ledger / index 更新
4. Phase 6 へ渡す diff 整理

## 成果物

| 成果物                   | パス                                          | 説明         |
| ------------------------ | --------------------------------------------- | ------------ |
| file change plan         | `outputs/phase-5/file-change-plan.md`         | 更新対象一覧 |
| execution sequence       | `outputs/phase-5/execution-sequence.md`       | 実行順       |
| update surface checklist | `outputs/phase-5/update-surface-checklist.md` | 更新漏れ防止 |

## 完了条件

- [ ] 4点同期対象の更新順が定義されている
- [ ] Phase 12 outputs の更新対象が列挙されている
- [ ] backlog / lessons / index の更新先が列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 4 を参照した
- [ ] file change plan を定義した
- [ ] execution sequence を定義した
- [ ] ledger 更新対象を定義した

## 次のPhase

Phase 6: テスト拡充
