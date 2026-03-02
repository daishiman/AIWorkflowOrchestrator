# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 11                                    |
| タスクID  | TASK-10A-B                            |
| 機能名    | SkillAnalysisView（スキル分析ビュー） |
| 作成日    | 2026-03-02                            |
| 状態      | **完了（PASS）**                      |
| 依存Phase | Phase 10（最終レビュー）PASS 後に実行 |

## 目的

自動テストでは確認しづらい画面表示・操作導線・状態遷移（通常/選択/選択適用後/全自動改善後/エラー/ローディング/ライト/モバイル）を、実スクリーンショット証跡付きで確認する。

---

## 実行タスク

- 前提確認: Phase 10 PASS と実行環境を確認
- 手動検証: TC-01〜TC-08 を実施
- 画面証跡: Playwright スクリプトでスクリーンショットを取得
- 判定記録: `outputs/phase-11/manual-test-result.md` に結果を反映
- 発見事項整理: `outputs/phase-11/discovered-issues.md` に記録

## 参照資料

| 資料名                   | パス                                                                         | 用途                       |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計             | `phase-2-design.md`                                                          | UI構造・状態遷移基準       |
| Phase 5 実装             | `phase-5-implementation.md`                                                  | 実装済み仕様との照合       |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                                  | 追加テスト観点の照合       |
| Phase 7 カバレッジ       | `phase-7-coverage-check.md`                                                  | カバレッジ達成前提の確認   |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                     | UI責務分離の確認           |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`                                               | 品質ゲート通過条件の確認   |
| Phase 10 最終レビュー    | `phase-10-final-review.md`                                                   | レビュー指摘事項の確認     |
| aiworkflow UI仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | HIG/WCAG 観点の確認        |
| aiworkflow a11yテスト    | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | キーボード/ARIA 観点の確認 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                     | 実行結果の正本             |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`                                      | 課題管理                   |

## 前提条件

- [x] `pnpm --filter @repo/shared build` 実施済み
- [x] `pnpm --filter @repo/desktop typecheck` 実施済み
- [x] Phase 9（品質検証）が PASS
- [x] Phase 10（最終レビュー）が PASS

---

## テストケース

| テストケース | 名称                           | 判定 |
| ------------ | ------------------------------ | ---- |
| TC-01        | 分析画面の表示                 | PASS |
| TC-02        | スコア表示                     | PASS |
| TC-03        | 改善提案リスト                 | PASS |
| TC-04        | リスク情報                     | PASS |
| TC-05        | 改善提案の選択と適用           | PASS |
| TC-06        | 全自動改善                     | PASS |
| TC-07        | エラーハンドリング             | PASS |
| TC-08        | アクセシビリティとダークモード | PASS |

---

## スクリーンショット取得手順

1. `pnpm --filter @repo/desktop run screenshot:skill-analysis` を実行
2. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-analysis-view` を実行
3. `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/` を確認
4. 以下 8 ケースを証跡として保存

- `TC-01-analysis-default-dark.png`
- `TC-02-analysis-selection-dark.png`
- `TC-03-analysis-apply-improved-dark.png`
- `TC-04-analysis-auto-improved-dark.png`
- `TC-05-analysis-error-dark.png`
- `TC-06-analysis-loading-dark.png`
- `TC-07-analysis-default-light.png`
- `TC-08-analysis-default-mobile-dark.png`

## 画面カバレッジマトリクス

| TC     | 観点                                 | 証跡ファイル                                                                 |
| ------ | ------------------------------------ | ---------------------------------------------------------------------------- |
| TC-01  | 分析画面の表示（通常表示）           | `TC-01-analysis-default-dark.png`                                            |
| TC-02  | 改善提案の選択状態                   | `TC-02-analysis-selection-dark.png`                                          |
| TC-03  | 選択適用前後の改善提案状態           | `TC-02-analysis-selection-dark.png`                                          |
| TC-04  | リスク情報表示                       | `TC-01-analysis-default-dark.png`                                            |
| TC-05  | 選択適用後の改善状態                 | `TC-03-analysis-apply-improved-dark.png`                                     |
| TC-06  | 全自動改善後の改善状態               | `TC-04-analysis-auto-improved-dark.png`                                      |
| TC-07  | エラーハンドリング表示               | `TC-05-analysis-error-dark.png`                                              |
| TC-08  | アクセシビリティ/テーマ/レスポンシブ | `TC-07-analysis-default-light.png`, `TC-08-analysis-default-mobile-dark.png` |
| SUP-01 | 補助証跡（ローディング状態）         | `TC-06-analysis-loading-dark.png`                                            |

## 成果物

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/screenshots/`（上記8ファイル）

## 統合テスト連携

| 連携先                | 方針                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Phase 10 最終レビュー | MINOR 指摘（M1〜M5）は未タスク化し、Phase 11 では修正済み項目（D1/D2）の回帰確認を実施                 |
| Phase 12 未タスク検出 | `outputs/phase-12/unassigned-task-detection.md` に 5 件を引き渡し                                      |
| UI仕様書群            | `ui-ux-components.md` / `ui-ux-feature-components.md` / `arch-ui-components.md` へ画面証跡ベースで同期 |

## 完了条件

- [x] TC-01〜TC-08 を実行済み
- [x] 全テストケースが PASS
- [x] 実スクリーンショット証跡を取得済み
- [x] 発見事項を整理済み（Phase 11 起点の新規課題 0 件）
- [x] Critical/Major の発見事項が 0 件

## 次の Phase

Phase 12: ドキュメント更新
