# Phase 6: エッジケーステスト設計

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| Phase    | 6 (テスト拡充)               |
| 作成日   | 2026-02-09                   |
| 作成者   | Claude Agent                 |

## 概要

Phase 5で実装した認証方式選択機能に対して、エッジケースと境界値のテストを追加した。

## 追加したテストファイル

### 1. AuthModeService.edge.test.ts

**場所**: `apps/desktop/src/main/services/auth/__tests__/AuthModeService.edge.test.ts`

| テストカテゴリ             | テスト数 | 説明                                          |
| -------------------------- | -------- | --------------------------------------------- |
| ストア破損時の動作         | 4        | 例外スロー、null値、数値、空文字              |
| 並行setMode呼び出し        | 2        | 同時複数呼び出し、高速連続呼び出し            |
| リスナーエラー分離         | 2        | 1つのリスナーエラー、全リスナーエラー         |
| モード変更イベント詳細     | 2        | タイムスタンプ検証、authModeUpdatedAt保存     |
| getStatus エッジケース     | 1        | hasToken例外時の挙動                          |
| getCredential エッジケース | 2        | subscriptionモードエラー、api-keyモードエラー |
| validateMode エッジケース  | 2        | hasTokenエラー、hasKeyエラー                  |
| onModeChange 解除シナリオ  | 2        | 解除後の呼び出し、同一リスナー複数登録        |

**合計: 17テスト**

### 2. SubscriptionAuthProvider.edge.test.ts

**場所**: `apps/desktop/src/main/services/auth/__tests__/SubscriptionAuthProvider.edge.test.ts`

| テストカテゴリ         | テスト数 | 説明                                                                  |
| ---------------------- | -------- | --------------------------------------------------------------------- |
| キャッシュ有効期限境界 | 3        | TTL-1ms有効、TTLちょうど期限切れ、TTL+1ms確実期限切れ                 |
| トークン長境界         | 3        | 最小長有効、最小長未満無効、最大長超過無効                            |
| 同時リクエスト競合状態 | 2        | 同時getToken、キャッシュクリアと同時取得                              |
| 環境変数フォールバック | 3        | 有効トークン、無効形式、短すぎるトークン                              |
| プラットフォーム境界   | 2        | Linux環境、Windows環境                                                |
| Keychain異常系         | 5        | タイムアウト、アクセス拒否、破損JSON、空オブジェクト、数値accessToken |
| clearCache 境界        | 2        | キャッシュなし状態、連続クリア                                        |
| アカウント名取得       | 2        | USERNAME使用、unknown使用                                             |

**合計: 22テスト**

### 3. authModeHandlers.error.test.ts

**場所**: `apps/desktop/src/main/ipc/__tests__/authModeHandlers.error.test.ts`

| テストカテゴリ                  | テスト数 | 説明                                                                      |
| ------------------------------- | -------- | ------------------------------------------------------------------------- |
| エラーメッセージサニタイズ      | 4        | トークン情報マスク、APIキー情報マスク、sk-ant-マスク、非Errorオブジェクト |
| Sender検証                      | 5        | null sender、破棄済みsender、外部ドメイン拒否、localhost許可×2            |
| ウィンドウ破棄時のイベント送信  | 2        | 破棄時スキップ、有効時送信                                                |
| 入力バリデーション              | 5        | undefined、null、数値、空文字、余分スペース                               |
| サービスエラー伝播              | 2        | getStatusエラー、validateModeエラー                                       |
| auth-mode:validate エッジケース | 2        | undefined request、undefined mode                                         |

**合計: 21テスト**

### 4. authModeSlice.error.test.ts

**場所**: `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.error.test.ts`

| テストカテゴリ                  | テスト数 | 説明                                                    |
| ------------------------------- | -------- | ------------------------------------------------------- |
| IPC障害                         | 3        | fetchMode失敗、setMode失敗、fetchStatus失敗             |
| レスポンスエラー                | 4        | success:false、error未定義、message未定義、validate失敗 |
| ネットワークエラー変換          | 2        | fetch failed、Network含む                               |
| Keychainエラー変換              | 2        | keychain含む、access denied含む                         |
| 非Errorオブジェクトのエラー処理 | 3        | 文字列、数値、null                                      |
| electronAPI利用不可             | 2        | authMode undefined、electronAPI undefined               |
| ローディング状態管理            | 2        | fetchMode開始時、エラー発生時                           |
| confirmModeChangeエッジケース   | 2        | pendingMode null、確定後クリア                          |
| リスナー登録エッジケース        | 2        | onModeChanged undefined、二重初期化                     |
| clearError                      | 1        | エラーなし状態でのクリア                                |
| resetAuthMode                   | 1        | エラー状態リセット                                      |

**合計: 24テスト**

## テスト設計の根拠

### 1. 境界値テスト

- **キャッシュTTL**: 5分(300,000ms)の境界でキャッシュの有効/無効を検証
- **トークン長**: 最小長20文字、最大長500文字の境界を検証

### 2. 競合状態テスト

- **同時リクエスト**: 10個の同時getToken呼び出しでも正しく動作することを確認
- **キャッシュクリア競合**: clearCacheとgetTokenの同時実行でエラーが発生しないことを確認

### 3. エラーリカバリーテスト

- **リスナーエラー分離**: 1つのリスナーでエラーが発生しても他のリスナーは実行される
- **サービスエラー伝播**: サービス層のエラーが適切にIPC層に伝播される

### 4. セキュリティテスト

- **エラーメッセージサニタイズ**: トークン・APIキー情報がエラーメッセージに含まれない
- **Sender検証**: 不正な送信元からのリクエストを拒否

## 既存テストの修正

### authModeSlice.test.ts

- モックオブジェクトのリセット処理を改善
- `beforeEach`で`mockElectronAPI.authMode`を再作成するように修正
- 原因: Listener Registrationテストで`onModeChanged`を直接代入していたため、後続テストでモックが破損

## 参照資料

- [Phase 4: テスト設計](../phase-4/test-design.md)
- [06-known-pitfalls.md](/.claude/rules/06-known-pitfalls.md) - P9, P13, P21
