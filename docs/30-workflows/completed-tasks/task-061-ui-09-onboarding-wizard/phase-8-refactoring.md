# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 8 |
| Phase名 | リファクタリング |
| ステータス | completed |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |
| 後続Phase | Phase 9 |

## 目的

wizard local component、helper、animation、display name fallback の配置を整理し、shared / view-local 境界を保つ。

## 実行タスク

- タスク1: view-local と shared の境界を再確認する
- タスク2: helper と animation 定義の配置を整理する
- タスク3: selector 利用と render 回数の安定性を確認する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | 要件 |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 初期設計 |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-6/` | 回帰観点 |
| Phase 7 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-7/` | coverage gap |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| ui catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` | shared / local の境界 |
| state management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | selector と local state |
| implementation patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | helper 配置パターン |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| refactor safety | Phase 4-7 の test set を退行防止の基準にする |
| render stability | selector と local state の責務分離を Phase 9 へ渡す |
| manual impact | animation と overlay の体感差分を Phase 11 へ渡す |

## 成果物

| 成果物 | パス |
| --- | --- |
| refactoring-plan | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-8/refactoring-plan.md` |
| extraction-decision | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-8/extraction-decision.md` |

## 完了条件

- [x] shared / local の境界が再確認されている
- [x] helper と animation の配置が整理されている
- [x] render stability の確認項目が残っている

## 次Phase

Phase 9: 品質保証
