# system spec 同期計画

## Step 1（完了記録）

- current workflow: `step-02-par-task-10-claude-code-terminal-surface`
- Phase 11 証跡を `outputs/phase-11/screenshots/` へ保存
- Phase 12 必須成果物（implementation-guide/changelog/unassigned/feedback/compliance）を作成

## Step 2（domain spec sync 判定）

### 判定: 更新必要

理由: 今回差分で IPC request/response と runtime 分岐契約が増えたため。

### 更新対象

1. `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`
2. `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`
3. `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
4. `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`
5. `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`
6. `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
7. `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`

## canonical root / mirror policy

- canonical root: `.claude/skills/...`
- mirror root: `.agents/skills/...`
- canonical 更新後に mirror へ同一差分を同期し、`diff -qr` で確認する。
