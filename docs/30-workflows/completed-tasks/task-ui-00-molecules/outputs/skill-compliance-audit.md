# Skill Compliance Audit

## 対象

- workflow: `docs/30-workflows/completed-tasks/task-ui-00-molecules/`
- 監査日: 2026-03-04
- 監査観点:
  1. `task-specification-creator` createモード準拠
  2. `aiworkflow-requirements` の必要仕様抽出妥当性

## SubAgent分担（関心ごとの分離）

| SubAgent | 責務               | 実施内容                                                 |
| -------- | ------------------ | -------------------------------------------------------- |
| A        | task-spec構造監査  | Phase 1-13 の必須セクション欠落監査                      |
| B        | aiworkflow抽出監査 | `search-spec.js`（Molecules/WCAG/P31）で必要仕様を再抽出 |
| C        | 仕様補正           | 全Phaseへ不足セクション追補                              |
| D        | 横断検証           | `validate-phase-output` / `verify-all-specs` 実行        |

## 監査結果

### 1) task-specification-creator 準拠

- 初回監査で不足検出:
  - `背景`
  - `実行手順`
  - `システム仕様（aiworkflow-requirements）`
  - `多角的チェック観点`
  - `サブタスク管理`
  - `タスク100%実行確認【必須】`
  - `次のPhase`
- 補正後: 全Phaseへ追補済み

### 2) aiworkflow-requirements 抽出妥当性

- 抽出コマンド（並列実行）:
  - `search-spec.js "Molecules"`
  - `search-spec.js "WCAG"`
  - `search-spec.js "P31"`
- 補完抽出（直接照合）:
  - `rg -n "theme|kanagawa|token|fireEvent|happy-dom|fixture|props|P31|WCAG" .claude/skills/aiworkflow-requirements/references/{ui-ux-design-system.md,testing-fixtures.md,architecture-implementation-patterns.md,ui-ux-atoms-patterns.md,testing-component-patterns.md}`
- 採用仕様（11件）:
  - `ui-ux-components.md`
  - `ui-ux-design-principles.md`
  - `ui-ux-design-system.md`
  - `arch-ui-components.md`
  - `arch-state-management.md`
  - `architecture-implementation-patterns.md`
  - `ui-ux-atoms-patterns.md`
  - `testing-component-patterns.md`
  - `testing-fixtures.md`
  - `testing-accessibility.md`
  - `quality-requirements.md`

## 最終検証

- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-00-molecules`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-ui-00-molecules --json`
