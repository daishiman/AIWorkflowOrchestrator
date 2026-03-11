# Phase 12 仕様更新サマリー

## 更新対象

| ID    | 仕様書                           | 更新内容                                                                         |
| ----- | -------------------------------- | -------------------------------------------------------------------------------- |
| SG-01 | `interfaces-agent-sdk-skill.md`  | lifecycle panel で `detectMode` / `improveSkill` を内部 API として使う契約を追記 |
| SG-02 | `api-ipc-agent.md`               | `skill-creator:*` を単一導線の補助 IPC として使う renderer flow を追記           |
| SG-03 | `security-skill-execution.md`    | Planner / Executor / Improver の権限境界と UI 非露出原則を追記                   |
| SG-04 | `claude-code-agents-workflow.md` | Task03 向け internal orchestration pattern を追記                                |
| SG-05 | `task-workflow.md`               | TASK-SKILL-LIFECYCLE-03 の完了台帳と検証証跡を追記                               |
| SG-06 | `.agents/skills/...` mirror      | `.claude` 正本から mirror を同期                                                 |
