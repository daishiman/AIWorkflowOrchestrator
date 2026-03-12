# Phase 9 リスク一覧

| ID   | レベル | 内容                                                                                                    | 対応                                    |
| ---- | ------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| R-01 | Medium | `SkillLifecycleSessionCard` の branch coverage は 62.50% で、例外系の一部が手動検証依存                 | Phase 11 で screenshot と手動確認を実施 |
| R-02 | Medium | session card は list view 上部に追加したため、長文 prompt 時の視覚負荷は自動テストで保証できない        | Phase 11 Apple UI/UX review で確認      |
| R-03 | Low    | `executeSkill` は prompt を create 入力と共有するため、将来は実行 prompt 専用欄が必要になる可能性がある | follow-up 候補として Phase 12 に記録    |
