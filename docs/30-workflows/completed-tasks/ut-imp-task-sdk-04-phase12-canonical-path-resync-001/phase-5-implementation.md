# Phase 5: 実装

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 5                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 4 の test matrix に従い、Task04 close-out 証跡を current path と current fact へ同期する。

## 実行タスク

- parent workflow の Phase 12 evidence を更新する
- parent workflow の Phase 13 local check を更新する
- parent workflow の verification report を更新する
- path drift と judgement drift を同一 turn で解消する

## 参照資料

| 資料名          | パス                                                                                                                         | 説明                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 4 テスト  | `phase-4-test-creation.md`                                                                                                   | 実装の受入観点               |
| test matrix     | `outputs/phase-4/test-matrix.md`                                                                                             | 実更新対象と expected result |
| 親 Phase 12     | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/system-spec-update-summary.md` | close-out 本文               |
| 親 unassigned   | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/unassigned-task-detection.md`  | follow-up 記録               |
| 親 Phase 13     | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-13/local-check-result.md`         | validator 記録               |
| 親 verification | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/verification-report.md`                 | 集約記録                     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                                    |
| ---------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| backlog current  | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | follow-up 導線                          |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | `spec_created` close-out 基準           |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | stale evidence remediation の実装ルール |

## 実行手順

1. `system-spec-update-summary.md` の current canonical set と Step 判定を current facts へ寄せる
2. `outputs/phase-12/unassigned-task-detection.md` の `UT-SC-02-006`、`TASK-SDK-04-U1..U3`、completed ledger 判断を current facts へ寄せる
3. `outputs/phase-13/local-check-result.md` と `outputs/verification-report.md` の validator コマンドを current path へ寄せる
4. 相互参照と artifacts parity を再確認する

## 成果物

| 成果物   | パス                        | 説明                   |
| -------- | --------------------------- | ---------------------- |
| 実装手順 | `phase-5-implementation.md` | close-out 4 点の更新順 |

## 統合テスト連携

- Phase 6 は Phase 5 の更新順に対して drift 再発観点を追加する。
- Phase 7 は Phase 5 の更新対象が coverage 軸を満たすか確認する。
- Phase 9 は Phase 5 の更新結果を validator と grep へ写像する。

## 完了条件

- [ ] Phase 4 の検証観点を満たす実更新が定義されている
- [ ] `outputs/phase-12/system-spec-update-summary.md`、`outputs/phase-12/unassigned-task-detection.md`、`outputs/phase-13/local-check-result.md`、`outputs/verification-report.md` の更新順が明記されている
- [ ] path drift と judgement drift を同一 turn で閉じる手順になっている
- [ ] `spec_created` 維持理由が current fact ベースで説明される
- [ ] **本Phase内の全タスクを100%実行完了**
