# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 1                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

`auth:login` IPC ハンドラーが 5 秒以内にレスポンスを返さず、スキル生成ボタン押下時にタイムアウトエラーが発生する問題の要件を定義する。

## 調査結果サマリー

### エラー

```
authSlice.ts:300 [AuthSlice] Login error: Error: IPC timeout: auth:login did not respond within 5000ms
```

### 根本原因

`authHandlers.ts` の `auth:login` ハンドラーが `await authFlowOrchestrator.startOAuthFlow(provider)` を実行しており、OAuth フロー完了（最大 300,000ms）までレンダラーへのレスポンスがブロックされる。IPC タイムアウト（`IPC_TIMEOUT_MS = 5000ms`）を大幅に超えるため、タイムアウトエラーが発生する。

### 調査対象ファイル

| ファイル                                       | 調査結果                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`    | `auth:login` ハンドラーが OAuth フロー完了を await している（ブロッキングの根本原因） |
| `apps/desktop/src/renderer/store/authSlice.ts` | L300 でエラーをキャッチ、L395-491 で `AUTH_STATE_CHANGED` リスナーを実装済み          |
| `apps/desktop/src/main/ipc/ipc-utils.ts`       | `IPC_TIMEOUT_MS = 5000`（5秒）を定義                                                  |

## 機能要件

| ID    | 要件                                                                                                                         | 優先度 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `auth:login` IPC ハンドラーは、OAuth フロー開始後 5 秒以内に `{ success: true }` をレスポンスとして返すこと                  | must   |
| FR-02 | OAuth フロー完了（成功・失敗）は `AUTH_STATE_CHANGED` IPC イベント経由でレンダラーへ通知すること                             | must   |
| FR-03 | OAuth フロー中にエラーが発生した場合、`AUTH_STATE_CHANGED` イベントに `{ authenticated: false, error: string }` を含めること | must   |
| FR-04 | `auth:login` ハンドラーは `authFlowOrchestrator.startOAuthFlow(provider)` の呼び出し自体は維持すること                       | must   |

## 非機能要件

| ID     | 要件                                                                              | 優先度 |
| ------ | --------------------------------------------------------------------------------- | ------ |
| NFR-01 | OAuth フローの正常動作（認証成功・失敗・キャンセル）を損なわないこと              | must   |
| NFR-02 | 既存の `authSlice.ts` L395-491 の `AUTH_STATE_CHANGED` リスナーと互換性を保つこと | must   |
| NFR-03 | エラーメッセージのサニタイズ（`sanitizeErrorMessage`）は継続して適用すること      | must   |
| NFR-04 | 変更スコープを `authHandlers.ts` の `auth:login` ハンドラーのみに限定すること     | should |

## 受け入れ基準

| ID    | 基準                                                                             | 確認方法                  |
| ----- | -------------------------------------------------------------------------------- | ------------------------- |
| AC-01 | スキル生成ボタン押下時に `auth:login` タイムアウトエラーが発生しないこと         | 手動テスト（Phase 11）    |
| AC-02 | `auth:login` ハンドラーが 5000ms 以内にレスポンスを返すこと                      | ユニットテスト（Phase 4） |
| AC-03 | OAuth 完了後に `AUTH_STATE_CHANGED` イベントが発火すること                       | ユニットテスト（Phase 4） |
| AC-04 | OAuth エラー時に `AUTH_STATE_CHANGED` で `authenticated: false` が通知されること | ユニットテスト（Phase 4） |
| AC-05 | 既存の全テストが PASS すること                                                   | CI（Phase 9）             |

## 参照資料

| 資料名          | パス                                           | 説明                                      |
| --------------- | ---------------------------------------------- | ----------------------------------------- |
| authHandlers.ts | `apps/desktop/src/main/ipc/authHandlers.ts`    | 修正対象ファイル                          |
| authSlice.ts    | `apps/desktop/src/renderer/store/authSlice.ts` | `AUTH_STATE_CHANGED` リスナー（L395-491） |
| ipc-utils.ts    | `apps/desktop/src/main/ipc/ipc-utils.ts`       | `IPC_TIMEOUT_MS = 5000` 定義              |

## 実行手順

### ステップ 1: 問題の確認

- `authHandlers.ts` の `auth:login` ハンドラー実装を確認する
- `await authFlowOrchestrator.startOAuthFlow(provider)` がブロッキングの原因であることを確認する
- `IPC_TIMEOUT_MS = 5000` の値を確認する

### ステップ 2: 既存の通知機構を確認

- `authSlice.ts` L395-491 の `AUTH_STATE_CHANGED` リスナー実装を確認する
- `onAuthStateChanged` または相当するイベント送信機構が既に存在することを確認する

### ステップ 3: 修正要件の確定

- FR-01 〜 FR-04 の機能要件を確定する
- NFR-01 〜 NFR-04 の非機能要件を確定する
- AC-01 〜 AC-05 の受け入れ基準を確定する

## 成果物

| 成果物   | パス                      | 説明       |
| -------- | ------------------------- | ---------- |
| 要件定義 | `phase-1-requirements.md` | 本ファイル |

## 完了条件

- [ ] エラーの根本原因が特定されている
- [ ] 機能要件（FR）が明記されている
- [ ] 非機能要件（NFR）が明記されている
- [ ] 受け入れ基準（AC）が明記されている
- [ ] 変更スコープが `authHandlers.ts` に限定されていることが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
