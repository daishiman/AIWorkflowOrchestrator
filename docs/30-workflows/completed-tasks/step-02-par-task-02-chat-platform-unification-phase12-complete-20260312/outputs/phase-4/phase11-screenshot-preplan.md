# Phase 11 Screenshot Preplan

## 撮影対象

| TC-ID    | route                                                                | selector                                         | 備考                       |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| TC-11-01 | `/phase11-chat-platform.html?scenario=general&theme=light`           | `[data-testid='chat-view']`                      | current general chat       |
| TC-11-02 | `/phase11-chat-platform.html?scenario=workspace-handoff&theme=light` | `[data-testid='workspace-view']`                 | Workspace handoff source   |
| TC-11-03 | `/phase11-chat-platform.html?scenario=skill-lifecycle&theme=light`   | `[data-testid='skill-lifecycle-panel']`          | `prepare` click 後を撮る   |
| TC-11-04 | `/phase11-chat-platform.html?scenario=revive&theme=light`            | `[data-testid='phase11-revive-evidence']`        | revive contract evidence   |
| TC-11-05 | `/phase11-chat-platform.html?scenario=stream-cancel&theme=light`     | `[data-testid='phase11-stream-cancel-evidence']` | non-persist reset evidence |

## ready 判定

- general: `chat-view`
- workspace: `workspace-view`
- skill-lifecycle: `skill-lifecycle-panel`
- revive: `phase11-revive-evidence`
- stream-cancel: `phase11-stream-cancel-evidence`
