# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 7                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 5 と Phase 6 の成果を使い、root acceptance criteria と task 証跡の対応を確認する。

## 実行タスク

- coverage matrix 作成: AC-1 から AC-4 を Task01-03 の phase 証跡へ結びつける
- sequence gate 作成: Task02 と Task03 に進む前に確認する条件を整理する
- gap 明示: まだ child task に委譲されていない root 観点を洗い出す

## 参照資料

| 資料名           | パス                                                                          | 説明                     |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Phase 5          | `phase-5-implementation.md`                                                   | 実装順                   |
| Phase 6          | `phase-6-test-expansion.md`                                                   | regression と edge case  |
| artifacts        | `artifacts.json`                                                              | root acceptance criteria |
| Task01 artifacts | `tasks/step-01-seq-task-01-guided-execution-shell-foundation/artifacts.json`  | foundation 証跡          |
| Task02 artifacts | `tasks/step-02-seq-task-02-session-dock-artifact-bridge/artifacts.json`       | session 証跡             |
| Task03 artifacts | `tasks/step-03-seq-task-03-advanced-console-safety-governance/artifacts.json` | safety 証跡              |

## 実行手順

### ステップ1: AC を task に割り当てる

AC-1 は Task01、AC-2 と AC-3 は Task01 と Task02、AC-4 は Task03 を中心に割り当てる。

### ステップ2: 順番 gate を確認する

Task02 は Task01 を、Task03 は Task01 と Task02 を前提にする gate を明記する。

### ステップ3: 未割当観点を残す

task に落ちていない root 観点があれば unassigned 候補として残す。

## 統合テスト連携

root coverage は `入口` `結果` `共有` `高度表示` の 4 面から task 証跡へ落ちていることを確認する。

## 成果物

| 成果物          | パス                                 | 説明                                        |
| --------------- | ------------------------------------ | ------------------------------------------- |
| coverage matrix | `outputs/phase-7/coverage-matrix.md` | AC と task 証跡の対応                       |
| sequence gate   | `outputs/phase-7/sequence-gate.md`   | child task を順番どおり進めるための確認条件 |

## 完了条件

- [ ] AC-1 から AC-4 の全てに task 証跡が割り当てられている
- [ ] Task02 と Task03 の順番 gate が書かれている
- [ ] 未割当観点の有無が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
