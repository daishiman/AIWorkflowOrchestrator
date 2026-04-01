# Phase 6: テスト拡張記録

## 追加テストケース（T-013〜T-018）

エッジケーステストは Phase 4/5 の ipc-utils.test.ts に同梱して実装済み。

### getChannelTimeout エッジケース

| ID    | シナリオ                              | 結果 |
| ----- | ------------------------------------- | ---- |
| T-013 | ランダムな未知文字列 → IPC_TIMEOUT_MS | PASS |
| T-014 | 全エントリが正の整数                  | PASS |
| T-015 | auth:login < auth:get-session         | PASS |

### invokeWithTimeout エッジケース

| ID    | シナリオ                                        | 結果 |
| ----- | ----------------------------------------------- | ---- |
| T-016 | タイムアウト後の遅延 resolve → 二重 reject なし | PASS |
| T-017 | skill:execute エラーに 60000ms 含まれる         | PASS |
| T-018 | デフォルトチャンネルエラーに 5000ms 含まれる    | PASS |

## 完了確認

- [x] `getChannelTimeout` の edge case が追加されている
- [x] `invokeWithTimeout` の境界動作が追加されている
- [x] 既存テストの意図が崩れていない
