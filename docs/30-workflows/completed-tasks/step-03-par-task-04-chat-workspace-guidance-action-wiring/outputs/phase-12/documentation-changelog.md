# Phase 12: 更新履歴

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 12                                                 |
| 作成日   | 2026-03-22                                         |

## 変更記録

| 日時       | 対象グループ           | 変更内容                                                                                   |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| 2026-03-22 | renderer code          | shared guidance module 追加、Chat / Workspace の local 判定を `blockedReason` ベースへ統一 |
| 2026-03-22 | renderer tests         | guidance unit / panel / runtime tests を green 化し、stale Red comment を除去              |
| 2026-03-22 | phase11 evidence       | dedicated capture script で 4 screenshots、metadata、manual-test-result、coverage を追加   |
| 2026-03-22 | Task04 workflow        | standalone root の index / artifacts / Phase 11 / Phase 12 / Phase 13 を actual 化         |
| 2026-03-22 | parent/downstream docs | parent workflow index と Task06/07 の Task04 参照 path を standalone root へ更新           |
| 2026-03-22 | unassigned tasks       | follow-up 4件の Markdown 本体を作成                                                        |
| 2026-03-22 | canonical skills       | task-workflow / completed / backlog / lessons / LOGS / SKILL / topic-map / keywords を更新 |
| 2026-03-22 | mirror sync            | `.claude` 正本と `.agents` mirror の parity を再確認                                       |

## Step 完了結果

| Step | 内容                    | 結果                                                                                                   |
| ---- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| 1-A  | タスク完了記録          | `task-workflow.md` / `task-workflow-completed.md` / workflow ref に Task04 close-out を記録            |
| 1-B  | 実装状況テーブル        | Task04 workflow root=`implementation_ready`、completed ledger=`spec_created`、Phase13=`blocked` を同期 |
| 1-C  | 関連タスクテーブル      | parent workflow index と Task06/07 phase docs の path drift を修正                                     |
| 1-D  | index 再生成            | `aiworkflow-requirements` の `topic-map.md` / `keywords.json` を再生成                                 |
| 2    | システム仕様更新        | backlog / lessons / LOGS / SKILL / mirror parity まで反映                                              |
| 3    | documentation-changelog | 本ファイルに current wave の更新を事後記録                                                             |
| 4    | 未タスク検出            | 4件を Markdown / backlog / completed / lessons の4点で同期                                             |

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
cd apps/desktop && pnpm exec vitest run src/renderer/guidance/__tests__/modelSelectionGuidance.test.ts src/renderer/views/WorkspaceView/components/__tests__/GuidanceBlock.test.tsx src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.runtime.test.tsx src/renderer/views/WorkspaceView/hooks/__tests__/useWorkspaceChatController.runtime.test.ts
node apps/desktop/scripts/capture-task-chat-workspace-guidance-action-wiring-phase11.mjs
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .agents/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring --regenerate
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring --json
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring --json
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/outputs/phase-12/unassigned-task-detection.md
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```
