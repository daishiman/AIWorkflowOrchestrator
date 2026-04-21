# Phase 6 Expanded Test Cases

| ID        | 観点            | 内容                                                   |
| --------- | --------------- | ------------------------------------------------------ |
| TC-RPR-01 | 通常経路        | `restoredPendingRequest === null` なら snapshot を表示 |
| TC-RPR-02 | 復元優先        | undo 後は restored request を優先表示                  |
| TC-RPR-03 | 切替条件        | requestId 変化で restored state を clear               |
| TC-RPR-04 | submit 後 clear | 成功送信後に restored state が残留しない               |
| TC-RPR-05 | 待機表示        | restored / awaiting の両方が null なら待機 UI          |

## 追加観点

- same requestId では clear effect が過剰発火しない
- `RALLY-010` の waiting UI 変更と競合しない
