# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 11 |
| Phase名 | 手動テスト検証 |
| ステータス | completed |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase | Phase 12 |

## 目的

初回起動、skip、complete、rerun、theme、responsive、focus、overlay 体験を画面証跡付きで確認する。

## 実行タスク

- タスク1: desktop / tablet / mobile の screenshot plan を作成する
- タスク2: 初回起動と rerun の動作を目視確認する
- タスク3: keyboard navigation と focus trap を確認する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | AC と scope |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | UI 設計 |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-6/` | regression |
| Phase 7 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-7/` | coverage |
| Phase 8 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-8/` | refactor |
| Phase 9 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-9/` | quality |
| Phase 10 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-10/` | final review |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| navigation contract | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | overlay と keyboard |
| UX language | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | copy と feedback |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | focus と keyboard 観点 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| screenshot evidence | desktop / tablet / mobile / light / dark / kanagawa-dragon を代表状態で撮る |
| rerun evidence | settings からの再表示と skip / complete 後の遷移を別 TC に分ける |
| accessibility evidence | Tab、Enter、Escape、screen reader label を別 TC に分ける |

## 成果物

| 成果物 | パス |
| --- | --- |
| manual-test-plan | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/manual-test-plan.md` |
| screenshot-plan | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/screenshot-plan.json` |
| manual-test-result | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/manual-test-result.md` |

## 画面カバレッジマトリクス

| TC | 種別 | 検証観点 | 証跡 |
| --- | --- | --- | --- |
| TC-11-01 | SCREENSHOT | desktop light の Step 1 表示 | `screenshots/TC-11-01-desktop-step1-light.png` |
| TC-11-02 | SCREENSHOT | tablet dark の Step 3 表示 | `screenshots/TC-11-02-tablet-step3-dark.png` |
| TC-11-03 | SCREENSHOT | mobile kanagawa の Step 4 表示 | `screenshots/TC-11-03-mobile-step4-kanagawa.png` |
| TC-11-04 | SCREENSHOT | Settings 上の rerun card 表示 | `screenshots/TC-11-04-settings-rerun-entry-dark.png` |
| TC-11-05 | SCREENSHOT | rerun 実行後の dark overlay 表示 | `screenshots/TC-11-05-settings-rerun-triggered-dark.png` |

## 非視覚テストメモ

- キーボード操作のスポットチェックは `outputs/phase-11/manual-test-result.md` に記録する。

## 完了条件

- [x] representative screenshot plan が作成されている
- [x] 初回起動、skip、complete、rerun の手動確認が記録されている
- [x] keyboard navigation と focus trap の結果が記録されている

## 次Phase

Phase 12: ドキュメント更新
