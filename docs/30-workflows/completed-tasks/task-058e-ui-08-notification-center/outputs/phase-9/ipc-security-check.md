# Phase 9 IPCセキュリティ確認

## 確認項目

| 項目                                                                | 結果 |
| ------------------------------------------------------------------- | ---- |
| `notification:delete` が preload invoke allowlist に含まれる        | PASS |
| `notification:new` のみ on allowlist に残る                         | PASS |
| main handler が sender 検証を通す                                   | PASS |
| `notificationId` が string / empty / blank の 3段 validation を持つ | PASS |
| error message が `sanitizeErrorMessage()` を経由する                | PASS |

## 補足

- `notification:clear` は互換用として残置。UI 経路からは切断済み
- clear/delete の両方で validation/error path を持ち、互換経路でも安全性を落としていない
