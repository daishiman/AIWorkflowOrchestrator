# Phase 11: 手動テスト - SkillExecutionStatus 型同期の視覚検証

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| 機能名     | execution-status-type-spec-sync |
| 作成日     | 2026-03-20                      |
| タスク種別 | docs + UI verification          |
| 検証方式   | `SCREENSHOT + WALKTHROUGH`      |

## 目的

`review` / `improve_ready` / `reuse_ready` の 3 状態と review board 全体表示を実画面で確認し、shared 型、system spec、renderer 表示、mirror parity、validator 結果が同じ事実を指す状態に揃える。

## 実行タスク

- Capture 実行: visual harness を build し、4 件の screenshot を取得する
- 整合確認: shared 型、renderer 実装、system spec の 9 値整合を確認する
- 検証再実行: `.claude` / `.agents` parity と validator を再実行する
- handoff 整理: 発見事項を分類し、Phase 12 へ引き継ぐ

## テストケース

| テストケース | 種別        | 検証内容                                                   | 証跡                                                             |
| ------------ | ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| TC-11-01     | SCREENSHOT  | `review` のラベル・配色・文言を確認する                    | `outputs/phase-11/screenshots/TC-11-01-status-review.png`        |
| TC-11-02     | SCREENSHOT  | `improve_ready` のラベル・配色・文言を確認する             | `outputs/phase-11/screenshots/TC-11-02-status-improve-ready.png` |
| TC-11-03     | SCREENSHOT  | `reuse_ready` のラベル・配色・文言を確認する               | `outputs/phase-11/screenshots/TC-11-03-status-reuse-ready.png`   |
| TC-11-04     | SCREENSHOT  | 3状態の review board 全体を確認する                        | `outputs/phase-11/screenshots/TC-11-04-status-review-board.png`  |
| NV-11-05     | WALKTHROUGH | shared 型、renderer、system spec の 9 値一致を確認する     | `outputs/phase-11/manual-test-result.md`                         |
| NV-11-06     | WALKTHROUGH | targeted tests と screenshot coverage validator を確認する | `outputs/phase-11/manual-test-result.md`                         |
| NV-11-07     | WALKTHROUGH | `.claude` / `.agents` parity と phase validator を確認する | `outputs/phase-11/manual-test-result.md`                         |

## 画面カバレッジマトリクス

| テストケース | 対象               | 確認観点                 | 期待結果                                    | 証跡                                                             |
| ------------ | ------------------ | ------------------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| TC-11-01     | review card        | 色・ラベル・用語統一     | `レビュー中` が紫系バッジで表示される       | `outputs/phase-11/screenshots/TC-11-01-status-review.png`        |
| TC-11-02     | improve_ready card | 色・ラベル・用語統一     | `改善準備完了` が橙系バッジで表示される     | `outputs/phase-11/screenshots/TC-11-02-status-improve-ready.png` |
| TC-11-03     | reuse_ready card   | 色・ラベル・用語統一     | `再利用準備完了` が青緑系バッジで表示される | `outputs/phase-11/screenshots/TC-11-03-status-reuse-ready.png`   |
| TC-11-04     | review board 全体  | 視認性・整列・全体可読性 | 3 状態が同一画面で重複なく識別できる        | `outputs/phase-11/screenshots/TC-11-04-status-review-board.png`  |

## walkthrough の必須5観点

| 観点                   | 内容                                                                     | 必須 |
| ---------------------- | ------------------------------------------------------------------------ | ---- |
| 仕様書の自己完結性     | workflow 単体で前提条件、成果物、検証経路を追える                        | ✅   |
| 型定義・参照整合       | `packages/shared/src/types/skill.ts` と canonical spec が 9 値で一致する | ✅   |
| スコープ外の残課題整理 | 実装/仕様の漏れとプロセス改善 backlog を分離して記録できる               | ✅   |
| Phase 10 指摘との照合  | M10-01/M10-02 を Phase 11/12 の成果物で回収できる                        | ✅   |
| handoff の明確性       | Phase 12 で更新すべきファイルと証跡が特定されている                      | ✅   |

## 参照資料

| 資料名               | パス                                              | 説明                          |
| -------------------- | ------------------------------------------------- | ----------------------------- |
| Phase 2 設計         | `outputs/phase-2/design.md`                       | 分岐設計                      |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`       | 実装結果                      |
| Phase 6 拡充結果     | `outputs/phase-6/expanded-test-results.md`        | validator 前提の整理          |
| Phase 7 カバレッジ   | `outputs/phase-7/coverage-report.md`              | 参照網羅性                    |
| Phase 8 結果         | `outputs/phase-8/refactoring-report.md`           | 文言統一                      |
| Phase 9 品質結果     | `outputs/phase-9/quality-report.md`               | validator / parity の最終状態 |
| Phase 10 結果        | `outputs/phase-10/final-review-result.md`         | M10 系指摘                    |
| aiworkflow SKILL     | `.claude/skills/aiworkflow-requirements/SKILL.md` | canonical 導線                |
| aiworkflow LOGS      | `.claude/skills/aiworkflow-requirements/LOGS.md`  | 完了記録                      |
| screenshot plan      | `outputs/phase-11/screenshot-plan.json`           | TC と画像の対応               |
| checklist            | `outputs/phase-11/manual-test-checklist.md`       | 実施項目の完了確認            |

## 実行手順

### ステップ1: build / capture を実行する

```bash
pnpm --filter @repo/desktop build
node apps/desktop/scripts/capture-execution-status-type-spec-sync-phase11.mjs
```

### ステップ2: walkthrough を行う

- `packages/shared/src/types/skill.ts` の 9 値定義を確認する
- `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` の `STATUS_CONFIG` を確認する
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` と `arch-state-management-core.md` の 9 値記述を確認する

### ステップ3: validator を確認する

```bash
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill.test.ts src/types/__tests__/skill-import.test.ts
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/execution-status-type-spec-sync --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/execution-status-type-spec-sync --phase 11
```

### ステップ4: parity を確認する

```bash
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

## 統合テスト連携

| 検証項目                     | 方法                                              | 期待結果        |
| ---------------------------- | ------------------------------------------------- | --------------- |
| representative screenshot    | capture script                                    | 4件の証跡が揃う |
| shared 型テスト              | `pnpm --filter @repo/shared exec vitest run ...`  | 72/72 PASS      |
| desktop UI / selector テスト | `pnpm --filter @repo/desktop exec vitest run ...` | 158/158 PASS    |
| screenshot coverage          | `validate-phase11-screenshot-coverage.js`         | PASS            |
| mirror parity                | `diff -qr`                                        | diff 0          |

## 成果物

| 成果物         | パス                                          | 説明                            |
| -------------- | --------------------------------------------- | ------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`      | screenshot / walkthrough の詳細 |
| 手動テスト報告 | `outputs/phase-11/manual-test-report.md`      | 実施概要と所見                  |
| チェックリスト | `outputs/phase-11/manual-test-checklist.md`   | TC / NV の実施記録              |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`       | capture 定義                    |
| カバレッジ     | `outputs/phase-11/screenshot-coverage.md`     | TC と画像の対応                 |
| 視覚レビュー   | `outputs/phase-11/ui-sanity-visual-review.md` | UI 所見                         |
| 発見事項       | `outputs/phase-11/discovered-issues.md`       | 差異と解消内容                  |

## 完了条件

- [x] 4 件の screenshot TC が定義されている
- [x] screenshot plan / checklist / metadata が揃っている
- [x] root parity と validator の再実行結果が記録されている
- [x] 発見事項が分類されている
- [x] 必須 5 観点と handoff が明確化されている
- [x] 本 Phase 内の全タスクを実行完了している

## 次のPhase

Phase 12: ドキュメント更新
