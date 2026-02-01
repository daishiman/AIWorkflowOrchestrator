# [#622] [task-imp-skillstream-type-unification] SkillStreamMessage型定義の統一

## タスク概要

skill.tsとskill-execution.tsに存在するSkillStreamMessage型定義の重複・競合を統一し、setupSkillListeners.tsの安全でない`as`型アサーションを排除する。

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | task-imp-skillstream-type-unification         |
| 分類     | リファクタリング                              |
| 優先度   | 中                                            |
| 規模     | 小規模                                        |
| 発見元   | task-imp-permission-tool-metadata-001 Phase 9 |

## 仕様書

`docs/30-workflows/completed-tasks/task-imp-skillstream-type-unification.md`
