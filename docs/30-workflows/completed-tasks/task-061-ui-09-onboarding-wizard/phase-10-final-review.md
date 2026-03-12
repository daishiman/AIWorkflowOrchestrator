# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 10 |
| Phase名 | 最終レビュー |
| ステータス | completed |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 9 |
| 後続Phase | Phase 11 |

## 目的

受入基準と設計補正が実装結果に反映されているかを最終確認する。

## 実行タスク

- タスク1: AC-01 から AC-10 の達成を確認する
- タスク2: open item を分類する
- タスク3: Phase 11 へ渡す manual test 条件を確定する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | 受入基準 |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 設計 |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 9 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-9/` | 品質結果 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | gate と証跡管理 |
| feature catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Dashboard / SkillCreateWizard の前例 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| acceptance gate | AC ごとの根拠を Phase 11 と Phase 12 へ渡す |
| open items | manual test と docs sync の持ち越しを分類する |
| final gate | PASS / MINOR / MAJOR を明文化する |

## 成果物

| 成果物 | パス |
| --- | --- |
| final-review-result | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-10/final-review-result.md` |
| open-items | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-10/open-items.md` |

## 完了条件

- [x] AC-01 から AC-10 の達成が確認されている
- [x] open item の分類が完了している
- [x] Phase 11 へ渡す条件が明文化されている

## 次Phase

Phase 11: 手動テスト
