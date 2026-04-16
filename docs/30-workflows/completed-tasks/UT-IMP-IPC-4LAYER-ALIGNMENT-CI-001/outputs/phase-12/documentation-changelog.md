# Phase 12 成果物: ドキュメント更新履歴

## 更新対象

| file                                                          | change  | note                                                                               |
| ------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `index.md`                                                    | updated | workflow status を `spec_created` に同期し、Phase 1-12 を `completed` に更新       |
| `artifacts.json` / `outputs/artifacts.json`                   | updated | phase 12 artifact 名を canonical path に同期、status を current facts へ更新       |
| `outputs/phase-12/implementation-guide.md`                    | updated | current validation snapshot、CI 統合、公開 API 数、共存説明を current facts へ更新 |
| `outputs/phase-12/task-completion-summary.md`                 | updated | 113 tests / current gaps / canonical phase-12 file 名へ更新                        |
| `outputs/phase-12/system-spec-update-summary.md`              | created | システム仕様更新の current facts を記録                                            |
| `outputs/phase-12/system-spec-sync.md`                        | deleted | stale alias を削除して canonical file 名に統一                                     |
| `outputs/phase-12/documentation-changelog.md`                 | created | 本履歴を current facts として記録                                                  |
| `outputs/phase-12/unassigned-task-detection.md`               | created | current gaps の既存 task family への対応関係を記録                                 |
| `outputs/phase-12/skill-feedback-report.md`                   | created | phase 12 close-out の学びと改善点を記録                                            |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`      | created | phase 12 の存在・整合性を最終確認                                                  |
| `.github/workflows/ci.yml`                                    | updated | `verify-ipc-4layer` job を追加し build needs へ反映                                |
| `apps/desktop/src/main/agent/agent-handler.ts`                | updated | `agent:getStatus` を `agent:get-status` に是正                                     |
| `apps/desktop/src/main/agent/__tests__/agent-handler.test.ts` | updated | handler 名の期待値を `agent:get-status` に同期                                     |
| `scripts/verify-ipc-4layer.cjs`                               | updated | imported standalone constant 解決を external map 対応へ拡張                        |
| `scripts/__tests__/verify-ipc-4layer/parsers.test.ts`         | updated | external map 解決の回帰テストを追加                                                |

## validator 記録

| command                                                                                              | result                                                |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `node scripts/verify-ipc-4layer.cjs`                                                                 | Rule-1: 12 missing / Rule-2: 8 missing / Rule-3: PASS |
| `pnpm vitest run scripts/__tests__/verify-ipc-4layer`                                                | 4 files / 113 tests / all pass                        |
| `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('VALID')"`         | VALID                                                 |
| `node -e "const m = require('./scripts/verify-ipc-4layer.cjs'); console.log(Object.keys(m).length)"` | 20 exports                                            |

## current facts

- current outputs に planned wording は残していない
- NON_VISUAL のため screenshot アーティファクトは作成していない
- `Rule-1` / `Rule-2` の残件は `unassigned-task-detection.md` に current facts として残している
- 変更したドキュメントは canonical file 名で統一している
