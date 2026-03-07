# Phase 4: 統合テストケース

## タスク ID: TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

## 統合テスト観点

### 1. コンポーネント統合: loadProviders -> setState -> レンダリング

| ケース          | 入力                                            | 期待される状態遷移                                               |
| --------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| 正常系          | `{ success: true, data: { providers: [...] } }` | isLoading: true -> false, providers: 配列セット                  |
| API未到達       | `window.electronAPI` = undefined                | isLoading: true -> false, error: 「APIキー機能が利用できません」 |
| 応答異常        | `apiKey.list()` -> undefined                    | isLoading: true -> false, error: 「Failed to load API keys」     |
| providers型異常 | `providers: "not-array"`                        | isLoading: true -> false, providers: []                          |

### 2. エラーリカバリ統合

| ケース                            | 操作                           | 期待結果                                                |
| --------------------------------- | ------------------------------ | ------------------------------------------------------- |
| API未到達 -> エラー表示 -> 再試行 | エラー表示後「再試行」クリック | loadProviders が再呼び出しされる                        |
| providers異常 -> 空一覧表示       | providers が非配列             | 空の一覧が表示、エラーメッセージなし（silent fallback） |

### 3. 既存テストとの整合性

- 既存の正常系テスト 33 件が全て PASS であることを確認済み
- 新規テスト 6 件は `afterEach` で window.electronAPI を元に戻すため、テスト間の状態リークなし
