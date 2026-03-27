# Phase 2: 設計

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 2                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

stale evidence 棚卸し、completed judgement、validator path 更新を partial update なしで実行できる設計へ落とす。

## 実行タスク

- evidence audit lane を設計する
- completed judgement lane を設計する
- documentation sync lane を設計する
- validation lane を設計する

## 参照資料

| 資料名          | パス                                                                                                                        | 説明                          |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 要件    | `phase-1-requirements.md`                                                                                                   | acceptance と current fact    |
| Phase 1 成果物  | `outputs/phase-1/spec-extraction-map.md`                                                                                    | 更新対象の一覧                |
| 親 verification | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/verification-report.md`                | current validation 記録       |
| 親 unassigned   | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/unassigned-task-detection.md` | follow-up 導線の current fact |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                              | 内容                                   |
| -------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| backlog current fact | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | follow-up formalize の正本             |
| lessons              | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                    | close-out 再監査時の説明責務           |
| Phase 12 lessons     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | same-wave と stale evidence 是正ルール |

## 成果物

| 成果物                       | パス                                              | 説明                                  |
| ---------------------------- | ------------------------------------------------- | ------------------------------------- |
| stale evidence audit matrix  | `outputs/phase-2/stale-evidence-audit-matrix.md`  | 旧 path、current fact、更新対象の対応 |
| completed judgement decision | `outputs/phase-2/completed-judgement-decision.md` | `spec_created` 維持判断の根拠         |

## 統合テスト連携

- Phase 4 は `outputs/phase-2/stale-evidence-audit-matrix.md` を command 観点へ写像する。
- Phase 5 は `outputs/phase-2/completed-judgement-decision.md` を close-out judgement 本文へ反映する。
- Phase 9 は Phase 2 の 4 lane が partial update なしで閉じたかを validator と grep で確認する。

## 完了条件

- [ ] evidence audit、judgement、documentation、validation の 4 lane が定義されている
- [ ] `outputs/phase-12/system-spec-update-summary.md`、`outputs/phase-12/unassigned-task-detection.md`、`outputs/phase-13/local-check-result.md`、`outputs/verification-report.md` の更新順が明記されている
- [ ] `spec_created` 維持判断の条件が current fact ベースで定義されている
- [ ] validator コマンドが completed-tasks 配下の current path を指す設計になっている
- [ ] **本Phase内の全タスクを100%実行完了**
