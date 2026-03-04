# [#862] "[UT-FIX-SKILL-VALIDATION-CONSISTENCY-001] skill:ハンドラP42準拠バリデーション形式統一"

## タスク概要

skillHandlers.ts内の全ハンドラにP42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）を適用し、セキュリティとバリデーション形式を統一する。

## 背景

UT-FIX-SKILL-IMPORT-RETURN-TYPE-001でskill:importとskill:removeに3段バリデーションが導入されたが、他6ハンドラはtrim()チェックが欠如。

P42準拠状況:

- ✅ 5/11: skill:import, skill:remove, skill:optimize, skill:optimize:variants, skill:optimize:evaluate
- ❌ 6/11: skill:get-detail, skill:execute, skill:abort, skill:get-status, skill:analyze, skill:improve

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                    |
| 分類     | セキュリティ                                               |
| 優先度   | 中                                                         |
| 規模     | 小規模                                                     |
| 発見元   | Phase 12（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 コード調査） |

## 仕様書

`docs/30-workflows/completed-tasks/unassigned-task/task-skill-validation-consistency.md`
