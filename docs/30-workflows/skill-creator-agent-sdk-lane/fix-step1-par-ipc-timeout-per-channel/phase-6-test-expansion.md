# Phase 6: テスト拡張

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 6                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

Phase 5 の実装が壊れないよう、エッジケースと境界値を追加する。

## 実行タスク

- `getChannelTimeout` のエッジケースを追加検証する
- `invokeWithTimeout` のタイムアウト境界を追加検証する

## 参照資料

| 資料名           | パス                                                   | 参照理由      |
| ---------------- | ------------------------------------------------------ | ------------- |
| ipc-utils テスト | `apps/desktop/src/preload/__tests__/ipc-utils.test.ts` | 拡張先        |
| Phase 5 実装     | `phase-5-implementation.md`                            | current GREEN |

## テスト拡張観点

### getChannelTimeout

- `CHANNEL_TIMEOUTS` にないチャンネルが全て `IPC_TIMEOUT_MS` にフォールバックする
- 空文字・`null`に近い入力でも安全にフォールバックする
- 将来チャンネルを追加する場合に既存の動作が変わらないことを確認する

### invokeWithTimeout

- タイムアウト後に ipcRenderer の応答が来ても reject が二重に呼ばれない
- clearTimeout が正常に呼ばれてリソースリークしない
- チャンネル別タイムアウトが適用されていることをエラーメッセージで確認する

## 追加テストケース

### getChannelTimeout エッジケース

| ID    | シナリオ                                                        | 期待結果                        |
| ----- | --------------------------------------------------------------- | ------------------------------- |
| T-013 | `getChannelTimeout` で存在しないランダムな文字列を渡す          | `IPC_TIMEOUT_MS`（5000）を返す  |
| T-014 | `CHANNEL_TIMEOUTS` の全エントリが正の整数である                 | 全値が 0 より大きい             |
| T-015 | `auth:login` が他の auth チャンネルより短いタイムアウト値を持つ | `auth:login < auth:get-session` |

### invokeWithTimeout エッジケース

| ID    | シナリオ                                                               | 期待結果                                    |
| ----- | ---------------------------------------------------------------------- | ------------------------------------------- |
| T-016 | タイムアウト後に ipcRenderer が応答しても二重 reject しない            | 最初の reject のみ発生する                  |
| T-017 | `skill:execute` タイムアウトエラーメッセージに `60000ms` が含まれる    | `did not respond within 60000ms` が含まれる |
| T-018 | デフォルトチャンネルタイムアウトエラーメッセージに `5000ms` が含まれる | `did not respond within 5000ms` が含まれる  |

## 成果物

| 成果物         | パス                                                   | 説明             |
| -------------- | ------------------------------------------------------ | ---------------- |
| テスト拡張記録 | `phase-6-test-expansion.md`                            | edge case の固定 |
| テストファイル | `apps/desktop/src/preload/__tests__/ipc-utils.test.ts` | 拡張後のテスト   |

## 完了条件

- [ ] `getChannelTimeout` の edge case が追加されている
- [ ] `invokeWithTimeout` の境界動作が追加されている
- [ ] 既存テストの意図が崩れていない

## サブタスク管理

1. `getChannelTimeout` の edge case 追加
2. `invokeWithTimeout` 境界テストの追加
3. 既存テストとの衝突確認

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 追加ケースが current code anchor に対応している
- [ ] Phase 7 で coverage 計測に進める
