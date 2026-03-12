# Chat Mode State Machine

## 状態

| 状態          | 説明                                                     |
| ------------- | -------------------------------------------------------- |
| entry-ready   | entry surface で request / context を整える              |
| handoff-built | `ChatHandoffPayload` が確定した                          |
| executing     | `ChatView` または controller が LLM request を送っている |
| persisted     | conversation persistence が成立した                      |
| revived       | revive snapshot から active session を再構築した         |
| overlay-reset | cancel / end / error 後に非永続 overlay を空に戻した     |

## 遷移

1. general: `entry-ready -> executing -> overlay-reset`
2. workspace: `entry-ready -> handoff-built -> executing -> persisted -> revived`
3. skill-lifecycle: `entry-ready -> handoff-built -> executing`

## 禁止遷移

- `overlay-reset -> revived` に非永続 overlay を戻さない。
- `skill-center -> persisted` を直接結ばない。entry surface は persistence の所有者ではない。
