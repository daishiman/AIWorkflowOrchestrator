# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 1-3 で確定した root 方針を、Task01-03 へ配布できる root test strategy に変換する。

## 実行タスク

- root test strategy 作成: Phase 1-3 の受入基準を task ごとの test 観点へ展開する
- coverage map 作成: Task01-03 の index と Phase 4 を横断して test ownership を固定する
- gate 定義: Task01-03 の Phase 4 着手前に確認する共通 blocked 条件を列挙する

## 参照資料

| 資料名       | パス                                                                    | 説明              |
| ------------ | ----------------------------------------------------------------------- | ----------------- |
| Phase 1      | `phase-1-requirements.md`                                               | root 受入基準     |
| Phase 2      | `phase-2-design.md`                                                     | task 分割と実行順 |
| Phase 3      | `phase-3-design-review.md`                                              | gate 判定         |
| Task01 index | `tasks/step-01-seq-task-01-guided-execution-shell-foundation/index.md`  | 入口責務          |
| Task02 index | `tasks/step-02-seq-task-02-session-dock-artifact-bridge/index.md`       | session 責務      |
| Task03 index | `tasks/step-03-seq-task-03-advanced-console-safety-governance/index.md` | safety 責務       |

## 実行手順

### ステップ1: Phase 1-3 の受入基準を読む

Phase 1 の AC、Phase 2 の task 分割、Phase 3 の gate 条件を 1 つの root test 観点表へ統合する。

### ステップ2: task 単位へ落とし込む

Task01 は routing と shared action、Task02 は dock と artifact、Task03 は approval と disclosure を中心観点として割り当てる。

### ステップ3: cross-task 観点を固定する

Task01 から Task03 までをまたぐ handoff、manual share、advanced console 表示切替を root 観点として残す。

## 統合テスト連携

root では `entry selection` `state handoff` `artifact-first result` `manual-only share` `advanced disclosure` の 5 観点を最低ラインとする。

## 成果物

| 成果物             | パス                                    | 説明                               |
| ------------------ | --------------------------------------- | ---------------------------------- |
| root test strategy | `outputs/phase-4/root-test-strategy.md` | root 共通 test 観点                |
| task coverage map  | `outputs/phase-4/task-coverage-map.md`  | Task01-03 への test ownership 割当 |

## 完了条件

- [ ] Phase 1-3 の root 受入基準が Task01-03 へ配布されている
- [ ] cross-task 観点が 3 件以上定義されている
- [ ] Task01-03 の Phase 4 着手条件が文書化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5（実装計画）](./phase-5-implementation.md)
