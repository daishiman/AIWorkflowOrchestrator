# Phase 2: 実行計画書

## 実行日時

2026-03-31

## 1. 環境クリーンアップ手順

| ステップ | コマンド                                                                                              | 目的                           |
| -------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1        | `rm -rf node_modules apps/desktop/node_modules packages/shared/node_modules packages/ui/node_modules` | バイナリ不整合の根本原因を除去 |
| 2        | `pnpm install`                                                                                        | クリーンな状態で再インストール |
| 3        | `node -e "require('esbuild')"`                                                                        | esbuild 動作確認               |
| 4        | `pnpm exec vitest --version`                                                                          | Vitest 起動確認                |

### フォールバック手順

```bash
pnpm store prune
pnpm install
```

## 2. テスト実行計画

| 順序 | 対象            | AC   | コマンド                                                                                                                                         |
| ---- | --------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Engine テスト   | AC-1 | `cd apps/desktop && pnpm exec vitest run src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts --reporter=verbose`              |
| 2    | Renderer テスト | AC-2 | `cd apps/desktop && pnpm exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx --reporter=verbose` |
| 3    | typecheck       | 品質 | `pnpm typecheck`                                                                                                                                 |
| 4    | lint            | 品質 | `pnpm lint`                                                                                                                                      |

## 3. ドキュメント更新計画

| ファイル                                                                                                                        | 更新内容                             | 更新タイミング |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------- |
| `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/quality-report.md`       | テスト結果を反映し「PASS」状態に更新 | Phase 10       |
| `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/final-review-result.md` | 「AC-4: 要再確認」→「PASS」に更新    | Phase 10       |

## 4. artifacts.json / outputs/artifacts.json 同期

- 各Phase完了時に `artifacts.json` のステータスを更新する
- Phase 12 完了時に `outputs/artifacts.json` と同期する

## 完了判定

- [x] 環境クリーンアップ手順が定義済み
- [x] フォールバック手順が定義済み
- [x] テスト実行順序（AC 対応付き）が定義済み
- [x] ドキュメント更新対象と更新内容が定義済み
- [x] artifacts.json 同期前提が記録済み
