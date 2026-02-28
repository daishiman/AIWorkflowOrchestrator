# Phase 1 aiworkflow 抽出表

## 適用必須

- `.claude/skills/aiworkflow-requirements/references/security-implementation.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`
- `.claude/skills/aiworkflow-requirements/references/directory-structure.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

## 非適用（今回変更なし）

- `api-ipc-system.md`（システムIPC拡張なし）
- `database-schema.md`（永続化変更なし）
- `ui-ux-*`（UI変更なし）

## 抽出結論

- 本タスクは「認証コールバック待機/停止責務の境界修正」に限定される。
- システム仕様への反映対象は `security-implementation.md` を主軸に、台帳系 (`task-workflow.md`, `lessons-learned.md`) を同期する。
