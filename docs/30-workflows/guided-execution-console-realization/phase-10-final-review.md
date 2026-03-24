# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 10                                   |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 1、Phase 2、Phase 5 の前提を満たしたまま、親パックが `implementation_ready` へ進めるかを判定する。

## 実行タスク

- final gate 判定: root と Task01-03 の推奨実行順が崩れていないか確認する
- evidence 整理: child task の主要証跡を root 判定へ集約する
- reopen 条件定義: gate 失敗時に戻る Phase を固定する

## 参照資料

| 資料名       | パス                                                                    | 説明                |
| ------------ | ----------------------------------------------------------------------- | ------------------- |
| Phase 1      | `phase-1-requirements.md`                                               | root 受入基準       |
| Phase 2      | `phase-2-design.md`                                                     | 責務分離            |
| Phase 5      | `phase-5-implementation.md`                                             | 実装順              |
| Phase 9      | `phase-9-quality-assurance.md`                                          | 品質とリスク        |
| Task01 index | `tasks/step-01-seq-task-01-guided-execution-shell-foundation/index.md`  | foundation 証跡入口 |
| Task02 index | `tasks/step-02-seq-task-02-session-dock-artifact-bridge/index.md`       | session 証跡入口    |
| Task03 index | `tasks/step-03-seq-task-03-advanced-console-safety-governance/index.md` | safety 証跡入口     |

## 実行手順

### ステップ1: root 受入基準を再確認する

AC-1 から AC-4 が child task 証跡で説明できるかを確認する。

### ステップ2: gate 判定を出す

PASS、MINOR、MAJOR のいずれかで判定し、MAJOR の場合は Phase 8 または Phase 9 に戻す。

### ステップ3: implementation_ready 判定を残す

親パックとして実装着手可能かを final gate に記録する。

## 統合テスト連携

final review では Task01-03 の統合テスト対象が root acceptance criteria を覆っているかを確認する。

## 成果物

| 成果物              | パス                                      | 説明      |
| ------------------- | ----------------------------------------- | --------- |
| final review report | `outputs/phase-10/final-review-report.md` | 判定結果  |
| final gate decision | `outputs/phase-10/final-gate-decision.md` | gate 結論 |

## 完了条件

- [ ] root acceptance criteria の説明責任が child task 証跡へ結びついている
- [ ] final gate の reopen 条件が書かれている
- [ ] `implementation_ready` 判定の条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 11（手動テスト検証）](./phase-11-manual-test.md)
