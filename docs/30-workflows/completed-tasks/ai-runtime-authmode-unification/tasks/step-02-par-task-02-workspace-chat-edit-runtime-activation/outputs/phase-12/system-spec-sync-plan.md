# system spec 同期計画

## Step 1（完了記録）

- current workflow: `step-02-par-task-02-workspace-chat-edit-runtime-activation`
- Phase 11 証跡を `outputs/phase-11/screenshots/` へ保存（`TC-11-01..03`）
- Phase 12 implementation guide を validator 10/10 要件へ是正

## Step 2（domain spec sync 判定）

### 判定: 更新済み（本ターンで実施）

理由: Task02 の実装差分で IPC request/response と runtime 分岐契約、preload 公開契約が変化したため。

### 更新先（実施済み）

1. `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`
2. `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`
3. `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
4. `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`
5. `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`
6. `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
7. `.claude/skills/aiworkflow-requirements/LOGS.md`

### 同期した主要契約

- `SendWithContextRequest.workspacePath?`
- `SendWithContextResponse.handoff?` / `guidance?`
- `HandoffGuidance` DTO
- `RuntimeResolver`（`subscription` / `api-key` + key 有無で integrated/handoff 分岐）
- preload `chatEditAPI` の `contextBridge` 公開
- `workspacePath` 指定時の `isAllowedPath()` 境界検証

## Step 3（canonical / mirror 同期）

- canonical root: `.claude/skills/...`
- mirror root: `.agents/skills/...`
- 同期方法: canonical 更新後に mirror へ同一ファイルをコピー
- 検証: `cmp` で差分なしを確認（mirror sync: OK）

## Step 4（再検証）

- `validate-phase11-screenshot-coverage --workflow <task02>`: PASS（3/3）
- `validate-phase12-implementation-guide --workflow <task02>`: PASS（10/10）
- `verify-all-specs --workflow <task02>`: PASS
- `validate-phase-output <task02>`: PASS
