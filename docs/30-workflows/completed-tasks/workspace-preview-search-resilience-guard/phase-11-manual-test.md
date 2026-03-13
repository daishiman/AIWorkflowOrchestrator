# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 11                                                   |
| Phase名    | 手動テスト検証                                       |
| ステータス | completed                                            |

## 目的

QuickFileSearch と PreviewPanel の代表状態を current source から撮影し、Apple UI/UX 観点で hierarchy / fallback clarity / dark contrast を確認する。

## 実行タスク

- タスク1: Quick Search の results / no-match / keyboard select を確認する
- タスク2: PreviewPanel の parse fallback / timeout alert を確認する
- タスク3: Apple UI/UX 観点のレビューを記録する

## 参照資料

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-9/quality-report.md`
- `outputs/phase-2/resilience-guard-design.md`
- `outputs/phase-5/implementation-plan.md`
- `outputs/phase-6/expanded-test-plan.md`
- `outputs/phase-7/coverage-report.md`
- `outputs/phase-8/refactor-plan.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`

## 統合テスト連携

- `validate-phase11-screenshot-coverage.js` で TC と `.png` の 1:1 対応を検証する
- manual result と discovered issues を Phase 12 の sync summary へ引き継ぐ

## テストケース

| テストケース | 内容                          | 期待結果                                            |
| ------------ | ----------------------------- | --------------------------------------------------- |
| TC-11-01     | Quick Search result hierarchy | filename / path hierarchy と selected row が明快    |
| TC-11-02     | Quick Search no-match dark    | empty state が暗色でも認識できる                    |
| TC-11-03     | keyboard select preview       | Enter 選択で preview panel が開く                   |
| TC-11-04     | structured parse fallback     | alert + source fallback を同時表示する              |
| TC-11-05     | preview timeout alert         | 5秒 timeout / 3回 retry 後に transport alert が出る |

## 画面カバレッジマトリクス

| テストケース | surface         | 状態                    | 証跡                                                   |
| ------------ | --------------- | ----------------------- | ------------------------------------------------------ |
| TC-11-01     | QuickFileSearch | results                 | `screenshots/TC-11-01-quick-search-results.png`        |
| TC-11-02     | QuickFileSearch | no-match dark           | `screenshots/TC-11-02-quick-search-no-match-dark.png`  |
| TC-11-03     | WorkspaceView   | keyboard select success | `screenshots/TC-11-03-quick-search-select-preview.png` |
| TC-11-04     | PreviewPanel    | structured fallback     | `screenshots/TC-11-04-structured-preview-fallback.png` |
| TC-11-05     | PreviewPanel    | timeout alert           | `screenshots/TC-11-05-preview-timeout-alert.png`       |

## 成果物

| 成果物                   | パス                                           |
| ------------------------ | ---------------------------------------------- |
| manual-test-plan         | `outputs/phase-11/manual-test-plan.md`         |
| manual-test-result       | `outputs/phase-11/manual-test-result.md`       |
| screenshot-plan          | `outputs/phase-11/screenshot-plan.md`          |
| screenshot-coverage      | `outputs/phase-11/screenshot-coverage.md`      |
| discovered-issues        | `outputs/phase-11/discovered-issues.md`        |
| apple-uiux-visual-review | `outputs/phase-11/apple-uiux-visual-review.md` |

## 完了条件

- [x] 5 TC に対して `.png` 証跡を残した
- [x] Apple UI/UX 観点のレビューを文書化した
