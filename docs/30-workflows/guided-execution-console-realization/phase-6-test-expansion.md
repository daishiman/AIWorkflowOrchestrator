# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 5 の sequencing を前提に、cross-task regression と edge case の追加観点を定義する。

## 実行タスク

- regression 拡張: Phase 5 の shared contract 変更から回帰対象を洗い出す
- edge case 整理: route fallback、empty transcript、approval cancel を root 例外観点へ追加する
- negative path 定義: silent fallback、hidden send、consumer auth 混入を失敗条件として定義する

## 参照資料

| 資料名         | パス                                                                                    | 説明                     |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| Phase 5        | `phase-5-implementation.md`                                                             | 実装順と contract 更新順 |
| Task01 Phase 4 | `tasks/step-01-seq-task-01-guided-execution-shell-foundation/phase-4-test-creation.md`  | foundation test 観点     |
| Task02 Phase 4 | `tasks/step-02-seq-task-02-session-dock-artifact-bridge/phase-4-test-creation.md`       | session test 観点        |
| Task03 Phase 4 | `tasks/step-03-seq-task-03-advanced-console-safety-governance/phase-4-test-creation.md` | safety test 観点         |

## 実行手順

### ステップ1: contract 変更起点で回帰を洗う

Phase 5 の shared contract 変更点から、Task01-03 へ波及する root regression を抜き出す。

### ステップ2: edge case を task 横断で束ねる

route 未解決、dock 再開、approval 中断、artifact 未生成を cross-task 例外ケースへまとめる。

### ステップ3: negative path を gate 条件にする

hidden send、silent fallback、consumer auth 抱え込みを明示的な fail 条件として残す。

## 統合テスト連携

Task01 の入口選択、Task02 の成果物表示、Task03 の disclosure までを 1 連の regression chain として扱う。

## 成果物

| 成果物                    | パス                                           | 説明                |
| ------------------------- | ---------------------------------------------- | ------------------- |
| regression expansion plan | `outputs/phase-6/regression-expansion-plan.md` | cross-task 回帰計画 |
| cross-task edge cases     | `outputs/phase-6/cross-task-edge-cases.md`     | 例外ケース一覧      |

## 完了条件

- [ ] shared contract 起点の regression が 5 件以上列挙されている
- [ ] negative path に hidden send と silent fallback が含まれている
- [ ] edge case が Task01-03 のいずれかへ ownership 付きで割り当てられている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
