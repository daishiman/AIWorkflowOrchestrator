# Phase 7 Output: Coverage Matrix

## target x gate

| ID    | file                                                 | family | line budget | parent/child   | discovery/mirror       | 結果    |
| ----- | ---------------------------------------------------- | ------ | ----------- | -------------- | ---------------------- | ------- |
| G0-01 | `indexes/topic-map.md`                               | G0     | `wc -l`     | generated only | Phase 9 blocked record | BLOCKED |
| F1-01 | `LOGS.md`                                            | F1     | PASS        | PASS           | PASS                   | PASS    |
| F1-02 | `references/lessons-learned.md`                      | F1     | PASS        | PASS           | PASS                   | PASS    |
| F1-03 | `references/task-workflow.md`                        | F1     | PASS        | PASS           | PASS                   | PASS    |
| F2-01 | `references/architecture-implementation-patterns.md` | F2     | PASS        | PASS           | PASS                   | PASS    |
| F2-02 | `references/patterns.md`                             | F2     | PASS        | PASS           | PASS                   | PASS    |
| F2-03 | `references/quality-requirements.md`                 | F2     | PASS        | PASS           | PASS                   | PASS    |
| F2-04 | `references/testing-component-patterns.md`           | F2     | PASS        | PASS           | PASS                   | PASS    |
| F2-05 | `references/development-guidelines.md`               | F2     | PASS        | PASS           | PASS                   | PASS    |
| F2-06 | `references/error-handling.md`                       | F2     | PASS        | PASS           | PASS                   | PASS    |
| F3-01 | `references/arch-state-management.md`                | F3     | PASS        | PASS           | PASS                   | PASS    |
| F3-02 | `references/arch-ui-components.md`                   | F3     | PASS        | PASS           | PASS                   | PASS    |
| F3-03 | `references/arch-electron-services.md`               | F3     | PASS        | PASS           | PASS                   | PASS    |
| F3-04 | `references/architecture-auth-security.md`           | F3     | PASS        | PASS           | PASS                   | PASS    |
| F3-05 | `references/architecture-overview.md`                | F3     | PASS        | PASS           | PASS                   | PASS    |
| F3-06 | `references/directory-structure.md`                  | F3     | PASS        | PASS           | PASS                   | PASS    |
| F4-01 | `references/interfaces-agent-sdk-skill.md`           | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-02 | `references/interfaces-agent-sdk-executor.md`        | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-03 | `references/interfaces-agent-sdk-history.md`         | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-04 | `references/interfaces-auth.md`                      | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-05 | `references/interfaces-chat-history.md`              | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-06 | `references/api-ipc-agent.md`                        | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-07 | `references/api-ipc-system.md`                       | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-08 | `references/security-electron-ipc.md`                | F4     | PASS        | PASS           | PASS                   | PASS    |
| F4-09 | `references/security-skill-ipc.md`                   | F4     | PASS        | PASS           | PASS                   | PASS    |
| F5-01 | `references/ui-ux-feature-components.md`             | F5     | PASS        | PASS           | PASS                   | PASS    |
| F5-02 | `references/ui-ux-design-principles.md`              | F5     | PASS        | PASS           | PASS                   | PASS    |
| F5-03 | `references/ui-ux-atoms-patterns.md`                 | F5     | PASS        | PASS           | PASS                   | PASS    |
| F5-04 | `references/ui-ux-components.md`                     | F5     | PASS        | PASS           | PASS                   | PASS    |
| F5-05 | `references/ui-ux-agent-execution.md`                | F5     | PASS        | PASS           | PASS                   | PASS    |
| F5-06 | `references/ui-ux-search-panel.md`                   | F5     | PASS        | PASS           | PASS                   | PASS    |
| F5-07 | `references/ui-ux-settings.md`                       | F5     | PASS        | PASS           | PASS                   | PASS    |
| F6-01 | `references/deployment.md`                           | F6     | PASS        | PASS           | PASS                   | PASS    |
| F6-02 | `references/database-implementation.md`              | F6     | PASS        | PASS           | PASS                   | PASS    |
| F6-03 | `references/technology-devops.md`                    | F6     | PASS        | PASS           | PASS                   | PASS    |

## 補足

- manual docs 34 件は `validate-structure.js` + raw `wc -l` + backlink/discovery smoke の 3 系統で覆った
- G0 は manual docs と別列で管理し、未検証扱いではなく blocked dependency として記録した
