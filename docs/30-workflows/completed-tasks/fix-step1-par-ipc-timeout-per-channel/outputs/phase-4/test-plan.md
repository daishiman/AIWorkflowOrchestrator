# Phase 4: テスト計画

## テストファイル

`apps/desktop/src/preload/__tests__/ipc-utils.test.ts`（新規作成）

## テストケース一覧

### getChannelTimeout（T-001〜T-008）

| ID    | シナリオ                                  | 期待結果       |
| ----- | ----------------------------------------- | -------------- |
| T-001 | `getChannelTimeout("auth:login")`         | `500` を返す   |
| T-002 | `getChannelTimeout("auth:get-session")`   | `10000` を返す |
| T-003 | `getChannelTimeout("auth:refresh")`       | `10000` を返す |
| T-004 | `getChannelTimeout("skill-creator:plan")` | `30000` を返す |
| T-005 | `getChannelTimeout("skill:execute")`      | `60000` を返す |
| T-006 | `getChannelTimeout("unknown:channel")`    | `5000` を返す  |
| T-007 | `getChannelTimeout("")`                   | `5000` を返す  |
| T-008 | `IPC_TIMEOUT_MS` の値が `5000` である     | `5000` を確認  |

### invokeWithTimeout タイムアウト動作（T-009〜T-012）

| ID    | シナリオ                                                        | 期待結果                                  |
| ----- | --------------------------------------------------------------- | ----------------------------------------- |
| T-009 | `skill:execute` チャンネルで 60000ms 以内に応答があれば resolve | resolve する                              |
| T-010 | `skill:execute` チャンネルで 60000ms を超えると timeout error   | `did not respond within 60000ms` でreject |
| T-011 | 未定義チャンネルで 5000ms を超えると timeout error              | `did not respond within 5000ms` でreject  |
| T-012 | 許可されていないチャンネルは即座に reject                       | `Channel X is not allowed` でreject       |

### エッジケース（T-013〜T-018）

| ID    | シナリオ                                                     | 期待結果                         |
| ----- | ------------------------------------------------------------ | -------------------------------- |
| T-013 | ランダムな未知文字列を渡す                                   | `IPC_TIMEOUT_MS`（5000）を返す   |
| T-014 | `CHANNEL_TIMEOUTS` の全エントリが正の整数である              | 全値が 0 より大きい              |
| T-015 | `auth:login` が他の auth チャンネルより短い                  | `auth:login < auth:get-session`  |
| T-016 | タイムアウト後に ipcRenderer が応答しても二重 reject しない  | 最初の reject のみ発生する       |
| T-017 | `skill:execute` タイムアウトエラーに `60000ms` が含まれる    | `did not respond within 60000ms` |
| T-018 | デフォルトチャンネルタイムアウトエラーに `5000ms` が含まれる | `did not respond within 5000ms`  |

## 完了確認

- [x] 全テストケースが RED から GREEN になった
- [x] 既存テスト（ipc-utils.safeInvoke-timeout.test.ts）が PASS を維持
