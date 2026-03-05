# Phase 6 異常系結果

## 検証対象

- 未登録解除
- 二重登録抑止
- 再登録サイクル耐久

## 結果

| ケース                                   | 期待                    | 結果 |
| ---------------------------------------- | ----------------------- | ---- |
| 未登録状態で `unregisterAuthKeyHandlers` | 例外なし / remove未実行 | Pass |
| 二重 `registerAuthKeyHandlers`           | 2回目はスキップ         | Pass |
| `register -> unregister` 複数サイクル    | 状態破綻なし            | Pass |

## 補足

- `auth-key:exists` のレスポンス形状 `{ exists: boolean }` は既存テストで維持確認済み。
