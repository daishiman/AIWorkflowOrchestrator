# Phase 1 スコープ定義

## 対象

- TASK-10A-B 系の未タスク台帳同期
- `task-workflow.md` / `ui-ux-feature-components.md` / parent `unassigned-task-detection.md`
- completed 指示書 3件と active 指示書 6件の区分
- 検証スクリプトとテストの追加

## 対象外

- `SkillAnalysisView` の新規 UI 実装
- 既存未タスクの内容自体の実装
- repo 全体の baseline 既存負債の一括解消

## out-of-scope だが記録する事項

| 項目                                             | 扱い                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| duplicate ID を持つ physical-only anomaly        | active set には入れず、risk register に記録        |
| 既存 `verify-unassigned-links` baseline 参照切れ | 今回差分の blocking には使わず verification に記録 |
