# Phase 12 Documentation Changelog

## 変更一覧（アプリ実装）

| ファイル                                                                                             | 種別 | 要点                                                                                                                  |
| ---------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/package.json`                                                                          | fix  | `lint` script を追加し、`pnpm --filter @repo/desktop lint` の検証経路を確保                                           |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`                            | fix  | line 73: `window.electronAPI.skillCreator.applyRuntimeImprovement` → `window.skillCreatorAPI.applyRuntimeImprovement` |
| `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`                | fix  | `getGovernanceApi()` 関数: `electronAPI?.skillCreator` → `skillCreatorAPI`、エラーメッセージ更新                      |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                            | fix  | `window.electronAPI?.skillCreator` → `window.skillCreatorAPI` を優先する canonical-first 化                           |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                   | fix  | `getSkillCreatorApi()` を `window.skillCreatorAPI` 優先に変更                                                         |
| `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`                            | fix  | `skillCreatorAPI` を先に読むように変更し、legacy fallback は補助経路に整理                                            |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                 | fix  | `getSkillCreatorApi()` を `skillCreatorAPI` 優先に変更                                                                |
| `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalPanel.test.tsx`             | fix  | `beforeEach` のモック設定: `window.electronAPI.skillCreator` → `window.skillCreatorAPI`                               |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` | fix  | `setupMockApi`・`afterEach`・TC-R-11 を `skillCreatorAPI` 経路に更新                                                  |
| `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`                             | fix  | モックを `window.skillCreatorAPI` に変更し、afterEach で cleanup を追加                                               |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`     | fix  | `window.skillCreatorAPI` モックに更新し、F-2 のフォールバック検証も canonical-first に追従                            |

## 変更一覧（workflow spec 整備）

| ファイル                                         | 種別   | 要点                                                                  |
| ------------------------------------------------ | ------ | --------------------------------------------------------------------- |
| `index.md`                                       | update | NON_VISUAL 証跡方式、要件レビュー一次結論、Phase 11/12 成果物の具体化 |
| `phase-1-requirements.md`                        | update | 統合テスト連携を追加                                                  |
| `phase-2-design.md`                              | update | preload 互換シム残存の方針を明文化                                    |
| `phase-3-design-review.md`                       | update | renderer direct ref の 0 件確認に修正                                 |
| `phase-4-test-creation.md`                       | update | 実行タスクを箇条書きで明記                                            |
| `phase-7-coverage-check.md`                      | update | 参照資料と実行タスクを追加                                            |
| `phase-8-refactoring.md`                         | update | 参照資料と実行タスクを追加                                            |
| `phase-9-quality-assurance.md`                   | update | 実行タスクと参照資料を追加                                            |
| `phase-10-final-review.md`                       | update | 実行タスクと参照資料を追加                                            |
| `phase-11-manual-test.md`                        | update | NON_VISUAL 判定、参照資料、成果物を追加                               |
| `outputs/phase-12/implementation-guide.md`       | fix    | 実 API の戻り値 envelope と `skillCreatorAPI` シグネチャを整合        |
| `outputs/phase-12/system-spec-update-summary.md` | fix    | ブランチ scope を renderer 実装込みに修正                             |
| `phase-12-documentation.md`                      | update | Task 12-6、Part 2 要件、互換シム方針を追加                            |
| `artifacts.json`                                 | update | phase 1-12 を completed、phase 13 を pending に更新                   |
| `outputs/artifacts.json`                         | update | root と parity を維持しつつ phase 状態を同期                          |
| `outputs/phase-11/manual-test-checklist.md`      | add    | NON_VISUAL manual test のチェックリスト                               |
| `outputs/phase-11/manual-test-result.md`         | add    | NON_VISUAL result テンプレート                                        |
| `outputs/phase-11/discovered-issues.md`          | add    | 発見課題テンプレート                                                  |

## 検証

| コマンド                                                                                                                              | 結果                  |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                                                               | PASS                  |
| `pnpm --filter @repo/desktop lint`                                                                                                    | PASS（warnings only） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ui-03-ipc-renderer-migration` | PASS                  |
| `artifacts.json` / `outputs/artifacts.json` parity                                                                                    | PASS                  |

## current / baseline

- baseline: 初期 skeleton の workflow spec
- current: NON_VISUAL と phase 11 / 12 の output scaffold を含む workflow spec
