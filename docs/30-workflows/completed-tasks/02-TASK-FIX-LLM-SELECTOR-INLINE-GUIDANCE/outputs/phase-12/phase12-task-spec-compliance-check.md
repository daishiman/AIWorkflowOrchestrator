# Phase 12 Task Spec Compliance Check

## メタ情報

| 項目     | 値                                                               |
| -------- | ---------------------------------------------------------------- |
| タスクID | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE                            |
| 作成日   | 2026-03-21                                                       |
| 目的     | Phase 12 の root evidence と validator 実測値を 1 箇所に集約する |

## Task 1-5 完了チェック

| Task | 内容                 | 状態 | 証跡                                             |
| ---- | -------------------- | ---- | ------------------------------------------------ |
| 1    | 実装ガイド作成       | 完了 | `outputs/phase-12/implementation-guide.md`       |
| 2    | システム仕様更新     | 完了 | `outputs/phase-12/system-spec-update-summary.md` |
| 3    | changelog 作成       | 完了 | `outputs/phase-12/documentation-changelog.md`    |
| 4    | 未タスク検出         | 完了 | `outputs/phase-12/unassigned-task-detection.md`  |
| 5    | スキルフィードバック | 完了 | `outputs/phase-12/skill-feedback-report.md`      |

## 30観点レビュー記録

| 観点         | 要約                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| 論理分析系   | old path / current path / actual code の矛盾を排除                          |
| 構造分解系   | workflow / outputs / parent / system spec / unassigned に分解して漏れを監査 |
| メタ・抽象系 | worktree 先送りという誤前提を除去                                           |
| 発想・拡張系 | dismiss / direct scroll を follow-up として formalize                       |
| システム系   | parent workflow、inventory、backlog、lessons の依存更新を同期               |
| 戦略・価値系 | UI 導線価値を落とさず、scope 外は未タスクに分離                             |
| 問題解決系   | placeholder、計画語句、legacy path を根本原因として処理                     |

## Validation

| コマンド                                                                                                                                                                                                                                                                                                                                                    | 結果              | 実測値 / 補足                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE --json`                                                                                                                                                                                                   | PASS              | `timestamp=2026-03-21T00:58:11.358Z`、`errors=0`、`warnings=0`、`info=0`、13/13 phase pass                                                 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE`                                                                                                                                                                                                                | PASS with warning | 23項目 pass、0 error、9 warning。warning は `実行タスク` 検出 heuristic 由来で、`verify-all-specs` では 0 warning                          |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE`                                                                                                                                                                                      | PASS              | expected TC 4 / covered TC 4                                                                                                               |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE`                                                                                                                                                                                     | PASS              | `checks=10/10`                                                                                                                             |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/unassigned-task-detection.md`                                                                                                                                                       | PASS              | total 2 / existing 2 / missing 0                                                                                                           |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-ut-llm-settings-direct-scroll-001.md`                                                                                                                                                                         | PASS              | `checkedAt=2026-03-21T00:58:53.317Z`、`currentViolations=0`、`baselineViolations=172`                                                      |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-ut-llm-guidance-banner-dismiss-001.md`                                                                                                                                                                        | PASS              | `checkedAt=2026-03-21T00:58:53.317Z`、`currentViolations=0`、`baselineViolations=172`                                                      |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                                                                                                                                                                                                    | PASS              | mirror drift 0                                                                                                                             |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                                                                                                                                                              | PASS              | mirror drift 0                                                                                                                             |
| `ESBUILD_BINARY_PATH=$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild pnpm --filter @repo/desktop exec vitest run src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx` | PASS              | 3 files / 18 tests pass。Node が `darwin x64` のため root `@esbuild/darwin-x64@0.25.12` を拾う環境差分があり、binary path を固定して再実行 |

## 総合判定

- 矛盾なし: canonical root、legacy path register、parent workflow、artifact inventory の参照先が一致
- 漏れなし: Phase 11 screenshot evidence、Phase 12 compliance、follow-up 2件、same-wave sync を補完
- 整合性あり: `.claude` 正本と `.agents` mirror の diff は 0 件
- 依存関係整合: workflow / system spec / backlog / lessons / unassigned の導線を相互参照で閉じた
