# TASK-P0-08 発見課題一覧

## 検出件数: 3 件

| #   | 内容                                                                                                                    | 影響度 | 対応                              |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------- |
| 1   | `phase-11-manual-test.md` が `SessionListPanel` を前提にしていたが、実装は `SessionResumePrompt` 内包リストだった       | 中     | task spec を current facts に修正 |
| 2   | `outputs/phase-11/` が手動 UI 検証完了のように記述していたが、screenshot 0 件・coverage 0% のままだった                 | 高     | 成果物を未完了状態へ是正          |
| 3   | `outputs/phase-12/` が canonical spec sync 完了と断定していたが、task-local evidence と system spec sync が未完了だった | 高     | Phase 12 成果物を実測ベースへ修正 |

## 補足

- `RuntimeSkillCreatorFacade` は `SkillCreatorWorkflowSessionRepository` を使って checkpoint を扱っている
- 今回の主要課題は機能実装より close-out evidence と spec drift にあった
