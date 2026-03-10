# Phase 12: 未タスク検出レポート

## 検出結果サマリー

| ソース                     |                 検出数 |
| -------------------------- | ---------------------: |
| Phase 10 レビュー          |            0件（新規） |
| Phase 11 発見課題          |            1件（新規） |
| アクセシビリティ           | 0件（Phase 11 と同一） |
| コードベース TODO/FIXME 等 |                    0件 |
| **合計**                   |                **1件** |

## 検出タスク一覧

| タスクID                                   | 概要                                              | 優先度 | 配置先                                                                                                                                   |
| ------------------------------------------ | ------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001 | light theme の副次テキスト token コントラスト改善 | 低     | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md` |

補足:

- `UT-UI-03-TYPE-ASSERTION-001` は再監査時点で解消済みのため、`docs/30-workflows/completed-tasks/unassigned-task/` 側へ正規化した
- Phase 11 の light theme 副次テキスト所見は global token 改善タスクとして formalize した

## 監査結果

| コマンド                                                                                                                                                       | 結果                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `移管前: audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md` | `currentViolations=0`, `baselineViolations=130` |
| `audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                            | `currentViolations=0`, `baselineViolations=131` |
| `verify-unassigned-links.js`                                                                                                                                   | `existing=215`, `missing=0`                     |

## 実行コマンド

```bash
grep -rn "TODO\\|FIXME\\|HACK\\|XXX" apps/desktop/src/renderer/components/organisms/AgentView apps/desktop/src/renderer/views/AgentView/index.tsx
node .agents/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .agents/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
# 移管前の root unassigned-task 配置時に実施
node .agents/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md
```
