# Documentation Changelog

## 2026-04-06

### 修正した workflow 文書

| ファイル                    | 変更内容                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `index.md`                  | 出力ツリーの古いディレクトリ参照を current workflow path に是正 + Session/Runtime API 列挙の整合 |
| `phase-1-requirements.md`   | 統合テスト連携セクションを追加                                                                   |
| `phase-4-test-creation.md`  | Session/Runtime チャネル分類の整合                                                               |
| `phase-11-manual-test.md`   | placeholder PNG を含む画面カバレッジマトリクスを追加 + Session/Runtime 手順の整理                |
| `phase-12-documentation.md` | ステータスを completed に同期し、完了条件を current facts に整理                                 |
| `phase-13-pr-creation.md`   | 証跡参照を outputs ベースへ寄せ、blocked の根拠を明確化                                          |

### 追加・更新した Phase 11 / Phase 12 / Phase 13 成果物

| ファイル                                                  | 状態                                                      |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `outputs/artifacts.json`                                  | 更新（root と parity 同期）                               |
| `outputs/phase-11/manual-test-checklist.md`               | 追加（Session/Runtime API 整合）                          |
| `outputs/phase-11/manual-test-result.md`                  | 更新（Session/Runtime API 整合）                          |
| `outputs/phase-11/screenshot-plan.json`                   | 追加                                                      |
| `outputs/phase-11/screenshots/non-visual-placeholder.png` | 追加                                                      |
| `outputs/phase-12/implementation-guide.md`                | 更新（スクリーンショット参照 + Session/Runtime API 整合） |
| `outputs/phase-12/system-spec-update-summary.md`          | 更新（参照正本の明記）                                    |
| `outputs/phase-12/documentation-changelog.md`             | 更新（本ファイル）                                        |
| `outputs/phase-12/unassigned-task-detection.md`           | 更新                                                      |
| `outputs/phase-12/skill-feedback-report.md`               | 更新                                                      |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`  | 更新                                                      |
| `outputs/phase-13/local-check-result.md`                  | 追加                                                      |

### 追加・更新した実装 / テスト

| ファイル                                                                                           | 変更内容                                                              |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                 | `window.skillCreatorAPI` へ直接統一                                   |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | `window.skillCreatorAPI` へ直接統一 + session delete の結果確認を追加 |
| `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`                          | `window.skillCreatorAPI` へ直接統一                                   |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`                                  | sender 検証を `validateIpcSender` ベースに統一                        |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                     | `deleteSession` を `IpcResult<void>` 返却へ統一                       |
| `apps/desktop/src/preload/skill-creator-api.ts`                                                    | `deleteSession` 型を `IpcResult<void>` に同期                         |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.sessionResume.test.ts`                        | `deleteSession` の成功 / 失敗結果を検証                               |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`   | `skillCreatorAPI` モックへ移行                                        |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | `skillCreatorAPI` モックへ移行                                        |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | `skillCreatorAPI` モックへ移行                                        |
| `apps/desktop/src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts`           | `skillCreatorAPI` モックへ移行                                        |

### 実装検証結果

| コマンド                                                                                                                                                                                                                                                                                                                                                    | 結果 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `pnpm -C apps/desktop exec vitest run src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts src/main/ipc/__tests__/creatorHandlers.sessionResume.test.ts`                                                                                                                                                                                       | PASS |
| `pnpm -C apps/desktop exec vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts` | PASS |
| `pnpm -C apps/desktop typecheck`                                                                                                                                                                                                                                                                                                                            | PASS |

### validator 結果

- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/step-12-par-task-ui-03-ipc-session-runtime-unification --json`
  - `PASS`
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/step-12-par-task-ui-03-ipc-session-runtime-unification`
  - `PASS`
- `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/step-12-par-task-ui-03-ipc-session-runtime-unification --json`
  - `PASS`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/step-12-par-task-ui-03-ipc-session-runtime-unification --json`
  - `PASS`

### current / baseline

- current: 旧 path drift、Phase 11 補助成果物不足、Phase 12 status drift、API surface drift（`skillCreatorAPI` 直参照 + `deleteSession` 結果整合）を解消
- baseline: 新規 unassigned task は 0 件、関連 follow-up は `IpcResult<T>` の共有化のみ

### 補足

- `artifacts.json` と `outputs/artifacts.json` の parity を確認済み
- `task-specification-creator` / `aiworkflow-requirements` の skill 本体は no-op とした
