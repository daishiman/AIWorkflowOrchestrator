# Phase 12 成果物: ドキュメント更新履歴

## workflow root 同期

| ファイル                    | 変更内容                                                        |
| --------------------------- | --------------------------------------------------------------- |
| `index.md`                  | `status/current_phase` と Phase テーブルを current facts に同期 |
| `artifacts.json`            | Phase 1-12 完了、Phase 13 pending を維持                        |
| `outputs/artifacts.json`    | root `artifacts.json` と parity 同期                            |
| `phase-5-implementation.md` | `config` パラメータ基準の擬似コードへ修正                       |
| `phase-6-test-expansion.md` | `maxTokenLength` / `generateChunkEmbeddings()` へ用語同期       |
| `phase-10-final-review.md`  | 設計事項 3 を実装実態へ同期                                     |
| `phase-11-manual-test.md`   | progress 契約と実測結果へ同期                                   |
| `phase-12-documentation.md` | Phase 12 成果物 6 件を current facts に同期                     |

## Phase 11 / 12 成果物更新

| ファイル                                                 | 変更内容                                                                   |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `outputs/phase-11/manual-test-result.md`                 | 7 シナリオ、discovered-issues、18 テスト PASS を記録                       |
| `outputs/phase-12/implementation-guide.md`               | fixed phrase、Part 1/2、progress 契約、エッジケースを current facts へ更新 |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2 / parity / ledger 結果を確定                        |
| `outputs/phase-12/unassigned-task-detection.md`          | current gaps 0 件、baseline note 分離                                      |
| `outputs/phase-12/skill-feedback-report.md`              | local workflow drift 修正の記録へ更新                                      |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 最終確認を追加                                             |

## コード・テスト更新

| ファイル                                                                                           | 変更内容                                                              |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/shared/src/services/embedding/pipeline/types.ts`                                         | `PoolingStrategy` 再利用、`PipelineStage.lateChunking` 追加           |
| `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | progress 通知、Stage 3 skip semantics、`chunkId` 整列を追加           |
| `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | Stage 3 skip、progress、undefined timing、順序整列、validation を追加 |

## 正本仕様・ログ同期

| ファイル                                                                               | 変更内容                         |
| -------------------------------------------------------------------------------------- | -------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                   | pipeline 統合型を追記            |
| `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`          | `process()` 契約を追記           |
| `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | Stage 2.5 と整列責務を追記       |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`         | close-out エントリを追加         |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                       | 同期ログを追加                   |
| `.agents/skills/aiworkflow-requirements/...`                                           | canonical と同内容に mirror 同期 |

## validator / search 監査

```text
pnpm --filter @repo/shared typecheck -> PASS
pnpm exec vitest run src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts -> PASS (18 tests)
planned wording audit -> PASS (0 matches)
```

## 結論

workflow root、成果物、正本仕様、mirror の 4 系統を同一 wave で閉じた。future wording は残していない。
