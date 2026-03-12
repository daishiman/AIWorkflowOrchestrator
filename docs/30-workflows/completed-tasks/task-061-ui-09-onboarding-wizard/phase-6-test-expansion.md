# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 6 |
| Phase名 | テスト拡充 |
| ステータス | completed |
| 前提Phase | Phase 5 |
| 後続Phase | Phase 7 |

## 目的

初回起動、skip、complete、rerun、theme、skill import handoff の回帰観点を拡充する。

## 実行タスク

- タスク1: edge case を追加する
- タスク2: responsive と theme の観点を追加する
- タスク3: import failure と duplicate guard を追加する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 4 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-4/` | 基本 testcase |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 設計前提 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | regression gate |
| testing accessibility | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | keyboard regression |
| feature catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | overlay と screenshot 観点 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| edge cases | import failure、skip、rerun、theme persistence を追加する |
| responsive | desktop / tablet / mobile の代表状態を Phase 11 screenshot plan へ渡す |
| regression | display name fallback と completed flag を回帰対象に含める |

## 成果物

| 成果物 | パス |
| --- | --- |
| regression-matrix | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-6/regression-matrix.md` |
| edge-cases | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-6/edge-cases.md` |

## 完了条件

- [x] edge case が追加されている
- [x] responsive と theme の回帰観点が揃っている
- [x] import failure と duplicate guard の観点が追加されている

## 次Phase

Phase 7: カバレッジ確認
