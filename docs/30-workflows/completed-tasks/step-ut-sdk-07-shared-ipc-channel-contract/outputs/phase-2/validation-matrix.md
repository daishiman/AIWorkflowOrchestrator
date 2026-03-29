# Phase 2 検証マトリクス

タスクID: `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001`

---

## テスト観測マトリクス

### T-1: shared ユニットテスト -- チャネル定義存在

| 項目           | 内容                                                                  |
| -------------- | --------------------------------------------------------------------- |
| テストファイル | `packages/shared/src/ipc/__tests__/channels.test.ts`                  |
| 対象           | `APPROVAL_CHANNELS`, `EXECUTION_CHANNELS`                             |
| 観測点         | 定数が存在し、期待する文字列値を持つこと                              |
| アサーション例 | `expect(APPROVAL_CHANNELS.APPROVAL_RESPOND).toBe("approval:respond")` |
| 判定基準       | 3チャネル全てが期待値と一致                                           |

### T-2: desktop preload allowlist 正当性テスト

| 項目           | 内容                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| テストファイル | `packages/shared/src/ipc/__tests__/channel-parity.test.ts`                                                                    |
| 対象           | desktop `ALLOWED_INVOKE_CHANNELS`, `ALLOWED_ON_CHANNELS`                                                                      |
| 観測点         | `APPROVAL_RESPOND`, `EXECUTION_GET_DISCLOSURE_INFO` が invoke allowlist に、`APPROVAL_REQUEST` が on allowlist に含まれること |
| アサーション例 | `expect(ALLOWED_INVOKE_CHANNELS).toContain("approval:respond")`                                                               |
| 判定基準       | 各チャネルが正しい allowlist に登録済み                                                                                       |

### T-3: cross-layer parity テスト

| 項目           | 内容                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| テストファイル | `packages/shared/src/ipc/__tests__/channel-parity.test.ts`                       |
| 対象           | shared `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` vs desktop `IPC_CHANNELS`      |
| 観測点         | shared 側で定義した文字列値が desktop 側にも同一値で存在すること                 |
| アサーション例 | `expect(desktopChannels.APPROVAL_RESPOND).toBe(sharedChannels.APPROVAL_RESPOND)` |
| 判定基準       | 3チャネル全てで値が完全一致                                                      |

### T-4: チャネル分離テスト

| 項目           | 内容                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| テストファイル | `packages/shared/src/ipc/__tests__/channels.test.ts`                                                    |
| 対象           | `APPROVAL_CHANNELS` vs `EXECUTION_CHANNELS`                                                             |
| 観測点         | Approval と Execution のチャネル文字列値が衝突しないこと                                                |
| アサーション例 | `expect(APPROVAL_CHANNELS.APPROVAL_RESPOND).not.toBe(EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO)` |
| 判定基準       | 全組み合わせで値が異なる                                                                                |

### T-5: import パス解決テスト

| 項目           | 内容                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| テストファイル | `packages/shared/src/ipc/__tests__/channels.test.ts`                                                 |
| 対象           | `IPC_CHANNELS` スプレッド結合                                                                        |
| 観測点         | `IPC_CHANNELS` に `APPROVAL_CHANNELS` と `EXECUTION_CHANNELS` のエントリが正しくマージされていること |
| アサーション例 | `expect(IPC_CHANNELS.APPROVAL_RESPOND).toBeDefined()`                                                |
| 判定基準       | `IPC_CHANNELS` から3チャネル全てにアクセス可能                                                       |

---

## マトリクスサマリー

| テスト                  | AC対応     | 優先度 | 自動化 |
| ----------------------- | ---------- | ------ | ------ |
| T-1: shared ユニット    | AC-1       | 必須   | Vitest |
| T-2: allowlist 正当性   | AC-2, AC-4 | 必須   | Vitest |
| T-3: cross-layer parity | AC-2, AC-4 | 必須   | Vitest |
| T-4: チャネル分離       | AC-3       | 必須   | Vitest |
| T-5: import パス解決    | AC-1, AC-5 | 必須   | Vitest |
