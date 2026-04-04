# Phase 12: Documentation Changelog

## 変更ファイル

| ファイル                                                               | 変更種別 | 概要                                                                                                               |
| ---------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `index.md`                                                             | 修正     | `T-01` を `未着手` に是正し、spec_created workflow と整合させた                                                    |
| `phase-1-requirements.md`                                              | 修正     | 完了チェックを unchecked に是正し、曖昧語を除去した                                                                |
| `phase-2-design.md`                                                    | 修正     | 完了チェックを unchecked に是正し、copy command を `node + scriptPath + args` に補正、error 契約の境界を明確化した |
| `phase-3-design-review.md`                                             | 修正     | 完了チェックを unchecked に是正し、fallback / artifact sync の表現を定量化した                                     |
| `phase-7-coverage-check.md`                                            | 修正     | 未カバー時の判定を定量化した                                                                                       |
| `outputs/phase-7/coverage-report.md`                                   | 修正     | error path の sanitize と manager null fallback のカバレッジを `index.integration.test.ts` に同期した              |
| `phase-11-manual-test.md`                                              | 修正     | Main process IPC task として非表示検証に是正し、Copy Command の期待値を実 launch command へ補正した                |
| `outputs/phase-11/manual-test-result.md`                               | 修正     | docs-only 表現を除去し、Renderer UI 変更なしの NON_VISUAL 判定へ是正した                                           |
| `outputs/phase-11/manual-test-report.md`                               | 修正     | docs-only 表現を除去し、非表示検証の説明へ是正した                                                                 |
| `outputs/phase-11/ui-sanity-visual-review.md`                          | 修正     | docs-only 表現を除去し、Main process IPC task の理由へ是正した                                                     |
| `outputs/phase-11/phase11-capture-metadata.json`                       | 修正     | notes を Renderer UI unchanged の表現へ是正した                                                                    |
| `artifacts.json`                                                       | 修正     | `title` / `type` / `status` / `taskType` を正規化した                                                              |
| `outputs/artifacts.json`                                               | 修正     | root と同一内容へ同期した                                                                                          |
| `phase-12-documentation.md`                                            | 修正     | Task 12-1〜12-6 の分担、current contract、target delta、no-op 判定、完了条件の checked 化を追記した                |
| `outputs/phase-4/test-plan.md`                                         | 新規     | ADV-16〜ADV-19 の Red plan を追加した                                                                              |
| `outputs/phase-12/implementation-guide.md`                             | 修正     | Copy Command の launch fidelity と `SESSION_NOT_FOUND` の内外契約を current facts に同期した                       |
| `outputs/phase-12/system-spec-update-summary.md`                       | 修正     | skill source update の実測値に合わせて no-op 判定を是正した                                                        |
| `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md` | 修正     | `getClaudeCliManager()` と shared state owner の境界を current facts に追記した                                    |
| `outputs/phase-12/unassigned-task-detection.md`                        | 新規     | 0件の未タスク検出レポートを追加し、source spec が `completed` であることを明記した                                 |
| `outputs/phase-12/skill-feedback-report.md`                            | 新規     | skill への改善提案を追加した                                                                                       |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`               | 新規     | Task 12-1〜12-6 の準拠確認と Phase 11 PASS 根拠を追加した                                                          |

## 実装同期

| ファイル                                               | 変更種別 | 概要                                                                                                                                 |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/main/claude-cli/index.ts`            | 修正     | `getClaudeCliManager()` を barrel export に追加した                                                                                  |
| `apps/desktop/src/main/ipc/index.ts`                   | 修正     | Advanced Console callback を manager 経由に接続し、`SESSION_NOT_FOUND` を付与、Copy Command を `node + scriptPath + args` に補正した |
| `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` | 修正     | catch 応答の message を `sanitizeForApiKeys()` で整えた                                                                              |
| `apps/desktop/src/main/ipc/__tests__/*.test.ts`        | 修正     | manager null fallback / sanitize / export / launch command fidelity を確認するテストを追加した                                       |

## artifacts 同期

| 対象                     | 結果                                      |
| ------------------------ | ----------------------------------------- |
| `artifacts.json`         | root / outputs で一致                     |
| `outputs/artifacts.json` | root / outputs で一致                     |
| Phase 12 成果物          | 6 ファイルすべて `outputs/phase-12/` 配下 |

## validator

| チェック                                                                | 結果 | 根拠                                                                             |
| ----------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `validate-phase-output.js`                                              | PASS | root / outputs の存在と構造を確認                                                |
| `validate-phase12-implementation-guide.js`                              | PASS | Part 1 / Part 2、TypeScript 型、使用例、エラー処理、エッジケース、定数一覧を確認 |
| 文言監査                                                                | PASS | `outputs/phase-12/*.md` に future wording は残っていない                         |
| `artifacts.json` parity                                                 | PASS | root と outputs が同一内容                                                       |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` | PASS | topic-map / keywords を再生成                                                    |
| `.claude/.agents skill mirror parity`                                   | PASS | aiworkflow-requirements / task-specification-creator を同期                      |

## 実装検証

| コマンド                                                                                                                                                                                                                                                 | 結果    | 補足                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                  | PASS    | `claude-cli` / `ipc` / docs sync と整合                           |
| `pnpm --filter @repo/desktop test:run -- --reporter=verbose apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts apps/desktop/src/main/ipc/__tests__/index.integration.test.ts` | BLOCKED | local esbuild host/binary version mismatch で Vitest を起動できず |

## current / baseline

| 項目                         | baseline                                               | current                                                                            |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `index.md` の task breakdown | `T-01` が `進行中`                                     | `T-01` を `未着手` に統一                                                          |
| Phase 1〜3 完了チェック      | `[x]` で false-green                                   | `[ ]` に是正                                                                       |
| `artifacts.json`             | `type: spec_created` / `status: pending` / title drift | `type: improvement` / `status: spec_created` / title を index と統一               |
| Phase 4 成果物               | `outputs/phase-4/test-plan.md` なし                    | `outputs/phase-4/test-plan.md` を追加                                              |
| Phase 12 成果物              | 0件                                                    | 6件に分割                                                                          |
| source spec status           | open と誤読されうる                                    | `completed-tasks/unassigned-task/` 配下の `completed` source spec であることを明記 |
