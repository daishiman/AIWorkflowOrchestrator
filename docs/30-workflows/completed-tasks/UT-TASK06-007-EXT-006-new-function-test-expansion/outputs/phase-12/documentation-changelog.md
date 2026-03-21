# documentation-changelog - UT-TASK06-007-EXT-006

## 概要

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | UT-TASK06-007-EXT-006 |
| 実施日   | 2026-03-21            |
| 判定     | Phase 12 完了         |

## Workflow 文書の是正

| ファイル                                                      | 更新内容                                                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `index.md`                                                    | status / line count / Phase 11 成果物 / completed task path を是正                              |
| `phase-1-requirements.md` / `outputs/phase-1/requirements.md` | FR-2 と FR-4 を実テスト（intersection, readonly array, undefined union, generic preload）へ同期 |
| `phase-3-design-review.md`                                    | completed task path と一時ディレクトリ表現を是正                                                |
| `phase-4-test-creation.md`                                    | 20件のサンプルコードを現行テストIDへ同期                                                        |
| `phase-5-implementation.md`                                   | Red→Green 文言を Green 記録へ縮約                                                               |
| `phase-6-test-expansion.md`                                   | 「追加不要（69件で基準充足）」の実績ベースへ差し替え                                            |
| `phase-9-quality-assurance.md`                                | `pnpm lint` ではなく実行した `eslint` コマンドへ訂正                                            |
| `phase-11-manual-test.md`                                     | manual-test-checklist / screenshot-plan / placeholder PNG を補助成果物へ追加                    |

## Phase 11 / 12 出力の是正

| ファイル                                                 | 更新内容                                                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `outputs/phase-11/manual-test-checklist.md`              | 非視覚タスク判定と placeholder 証跡方針を記録                                                                               |
| `outputs/phase-11/manual-test-result.md`                 | 最新 test duration と placeholder screenshot 記録を反映                                                                     |
| `outputs/phase-11/screenshot-plan.json`                  | non-visual placeholder plan を追加                                                                                          |
| `outputs/phase-12/implementation-guide.md`               | why-first / TypeScript型 / CLIシグネチャ / 使用例 / エラーハンドリング / エッジケース / 設定と定数を current facts で再作成 |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G、Step 2 skip、mirror parity、artifacts sync を実績で記録                                                      |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | validator・artifacts・mirror parity を含めた最終準拠表へ更新                                                                |
| `outputs/phase-12/skill-feedback-report.md`              | `tmp file` 表現を廃止し、`mkdtempSync` 戦略と same-wave sync を再評価                                                       |
| `outputs/verification-report.md`                         | 再実行した validator 結果へ更新                                                                                             |

## Canonical spec 更新

| ファイル                                                                                                                  | 更新内容                                            |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-drift-detection.md` | 69件テストと 2026-03-21 実測値へ更新                |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md`             | EXT-006 を completed follow-up として追補           |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                       | current metrics / 導線 / completed extension を更新 |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                                | v1.5.0 と 3教訓を追記                               |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                             | `generate-index.js` で再生成                        |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                                                            | `generate-index.js` で再生成                        |

## 検証ゲート

| コマンド                                                                                                               | 結果                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts`                            | PASS（69 passed / Duration 2.06s）                                                     |
| `pnpm --filter @repo/desktop exec vitest run ... --coverage --coverage.include='scripts/check-ipc-contracts.ts'`       | PASS（Line 95.79 / Branch 91.55 / Function 100）                                       |
| `pnpm --filter @repo/desktop typecheck`                                                                                | PASS                                                                                   |
| `pnpm --filter @repo/desktop exec eslint scripts/check-ipc-contracts.ts scripts/__tests__/check-ipc-contracts.test.ts` | PASS                                                                                   |
| `pnpm --filter @repo/desktop exec tsx scripts/check-ipc-contracts.ts --report-only --format json`                      | `{ totalHandlers: 217, totalPreloads: 189, drifts: 198, orphans: 120, passed: false }` |
| `validate-phase-output.js`                                                                                             | PASS（32項目パス / 0エラー / 0警告）                                                   |
| `verify-all-specs.js --json`                                                                                           | PASS（13/13 Phase, 0 warning）                                                         |
| `validate-phase12-implementation-guide.js`                                                                             | PASS（10/10）                                                                          |
| `quick_validate aiworkflow-requirements`                                                                               | PASS（0 error / 352 warning）                                                          |
| `quick_validate task-specification-creator`                                                                            | PASS（0 error / 26 warning）                                                           |
| `diff -qr .claude ... .agents ...`                                                                                     | 差分なし                                                                               |

## artifacts / current-baseline

- `artifacts.json` と `outputs/artifacts.json` は同期済み
- 今回差分に対する current violations は 0
- baseline 側の既存 warning は `quick_validate` の未リンク参照群のみで、今回差分で新規エラーは発生していない
