# Phase 12: 仕様同期サマリー

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 12                                                 |
| 作成日   | 2026-03-22                                         |

## 1. code / workflow sync

### 実コード更新

| 対象                                                | 更新内容                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `modelSelectionGuidance.ts`                         | blocked reason / guidance map / action dispatcher を shared 化      |
| `LLMGuidanceBanner.tsx`                             | ChatView の local 判定を shared guidance 参照へ置換                 |
| `useWorkspaceChatController.ts`                     | `blockedReason` 導入、provider/model 未設定時の send guard を明示化 |
| `WorkspaceChatPanel.tsx` / `WorkspaceChatInput.tsx` | shared guidance message / hint / CTA を消費                         |
| `GuidanceBlock.tsx`                                 | secondary CTA props 追加、handler 未注入時は非表示                  |
| tests + capture script                              | runtime/test drift を是正し、Phase11 screenshot evidence を追加     |

### workflow root 更新

| 対象                                        | 更新内容                                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Task04 workflow root                        | `status=implementation_ready`, Phase 1-12 completed, Phase 13 blocked に正規化                            |
| `artifacts.json` / `outputs/artifacts.json` | Phase11 result/coverage/screenshots と Phase12 skill-feedback-report を追加                               |
| parent workflow index                       | Task04 directory を standalone root `../step-03-par-task-04-chat-workspace-guidance-action-wiring` へ更新 |
| Task06 / Task07 phase docs                  | Task04 参照 path を standalone root へ置換                                                                |

## 2. canonical spec / governance sync

### `.claude` 正本へ反映したファイル

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/task-specification-creator/SKILL.md`

### 反映内容

| 項目            | 内容                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| workflow status | Task04 close-out を `implementation_ready` / `spec_created` / `phase13=blocked` として記録 |
| backlog         | follow-up 4件を current backlog へ追加                                                     |
| lessons         | Phase12 same-wave sync の教訓4件を追加                                                     |
| SKILL / LOGS    | Task04 由来の close-out ルールと log を記録                                                |
| indexes         | `topic-map.md` / `keywords.json` を再生成                                                  |

## 3. unassigned formalization

| ID                                                        | 実体パス                                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001`        | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md`        |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001` | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001.md` |
| `UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001`            | `docs/30-workflows/unassigned-task/UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001.md`            |
| `UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001`   | `docs/30-workflows/unassigned-task/UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001.md`   |

## 4. 検証結果

| コマンド / 確認                                                                                | 結果     |
| ---------------------------------------------------------------------------------------------- | -------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                        | PASS     |
| `.agents` 側同コマンド                                                                         | PASS     |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`       | 差分なし |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator` | 差分なし |

## 5. same-wave sync 判定

| 判定軸       | 結果 | 根拠                                                                   |
| ------------ | ---- | ---------------------------------------------------------------------- |
| 矛盾なし     | PASS | workflow root / completed ledger / backlog の status が一致            |
| 漏れなし     | PASS | unassigned 4件、screenshots、Phase12 required 6 artifacts を全記録     |
| 整合性あり   | PASS | Chat / Workspace / docs / canonical refs が shared guidance 前提で整列 |
| 依存関係整合 | PASS | Task04 -> Task06/07 参照 path と follow-up 依存が同期済み              |
