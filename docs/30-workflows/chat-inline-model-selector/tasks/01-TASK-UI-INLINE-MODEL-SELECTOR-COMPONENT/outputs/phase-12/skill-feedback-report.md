# スキルフィードバックレポート

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| タスクID | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT |
| 作成日   | 2026-03-22                              |

## スキル改善検討結果

改善点あり。

## 反映した改善

1. `phase-12-documentation-guide.md` に「Phase 12 の人手作成成果物は task root 直下ではなく `outputs/phase-12/` に配置する」ルールを追加した
2. `spec-update-workflow.md` に「shared component task は consumer surface の completed まで主張しない」ルールを追加した
3. `spec-update-workflow.md` に `docs/30-workflows/unassigned-task/` を global canonical path として扱う補足を追加した

## この改善が必要だった理由

- Task01 では task root 直下の `phase-12-documentation.md` だけ更新され、実体成果物の配置と同期が崩れていた
- shared component 作成と ChatView / Workspace 統合を混同すると、system spec に completed false positive が残る
- unassigned-task の canonical path が曖昧だと path drift が再発しやすい
