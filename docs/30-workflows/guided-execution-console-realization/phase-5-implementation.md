# Phase 5: 実装計画

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 4 の root test strategy を前提に、Task01-03 の着手順と shared contract 更新順を固定する。

## 実行タスク

- sequencing 定義: Phase 4 の coverage map を実装順へ変換する
- shared contract 定義: `openExecutionConsole()`、session bridge、approval contract の更新順を決める
- rollback 境界定義: Task01-03 の独立 rollback 単位を明記する

## 参照資料

| 資料名         | パス                                                                             | 説明               |
| -------------- | -------------------------------------------------------------------------------- | ------------------ |
| Phase 4        | `phase-4-test-creation.md`                                                       | root test strategy |
| Task01 Phase 2 | `tasks/step-01-seq-task-01-guided-execution-shell-foundation/phase-2-design.md`  | shell 設計         |
| Task02 Phase 2 | `tasks/step-02-seq-task-02-session-dock-artifact-bridge/phase-2-design.md`       | session 設計       |
| Task03 Phase 2 | `tasks/step-03-seq-task-03-advanced-console-safety-governance/phase-2-design.md` | safety 設計        |

## 実行手順

### ステップ1: Task01 を先頭に固定する

front 名称、route、shared launcher を閉じてから他 task に進む。

### ステップ2: Task02 を中間に固定する

Task01 の surface が閉じた後に、session dock と artifact summary を接続する。

### ステップ3: Task03 を最後に固定する

approval、AI 開示、advanced console は Task01 と Task02 の surface が存在する前提で締める。

## 統合テスト連携

Task01 の route 変更が Task02 の dock 表示を壊さず、Task03 の approval flow を欠落させないことを root 観点とする。

## 成果物

| 成果物                      | パス                                             | 説明               |
| --------------------------- | ------------------------------------------------ | ------------------ |
| implementation sequencing   | `outputs/phase-5/implementation-sequencing.md`   | Task01-03 の着手順 |
| shared contract update plan | `outputs/phase-5/shared-contract-update-plan.md` | contract 更新順    |

## 完了条件

- [ ] Task01 → Task02 → Task03 の直列順が固定されている
- [ ] shared contract の更新責務が task ごとに分かれている
- [ ] rollback 単位が task 単位で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)
