# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 1                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

`auth:login` IPC ハンドラーが `authFlowOrchestrator.startOAuthFlow(provider)` の完了を待ってしまい、`CHANNEL_TIMEOUTS["auth:login"] = 500` の制約を超える問題を定義する。

## 実行タスク

- 現行の timeout / event contract / 依存ファイルを確認する
- `authHandlers.ts` の await が timeout 超過の根本原因であることを固定する
- FR / NFR / AC を 500ms 前提で検証可能な形にする
- 変更対象を `authHandlers.ts` に限定し、既存 `AUTH_STATE_CHANGED` 契約を維持する

## 調査結果サマリー

### エラー

```
authSlice.ts:300 [AuthSlice] Login error: Error: IPC timeout: auth:login did not respond within 500ms
```

### 根本原因

`apps/desktop/src/main/ipc/authHandlers.ts` の `auth:login` ハンドラーが `await authFlowOrchestrator.startOAuthFlow(provider)` を実行しており、OAuth フロー完了までレンダラーへのレスポンスを返していない。
`auth:login` の timeout は `apps/desktop/src/preload/ipc-utils.ts` の `CHANNEL_TIMEOUTS` により 500ms に固定されているため、タイムアウトエラーになる。

### 調査対象ファイル

| ファイル                                              | 調査結果                                           |
| ----------------------------------------------------- | -------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`           | `auth:login` が OAuth フロー完了を await している  |
| `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | 成功・失敗の `AUTH_STATE_CHANGED` を送る責務を保持 |
| `apps/desktop/src/renderer/store/slices/authSlice.ts` | `AUTH_STATE_CHANGED` を受けて認証状態を更新する    |
| `apps/desktop/src/preload/ipc-utils.ts`               | `CHANNEL_TIMEOUTS["auth:login"] = 500` を定義      |

## 機能要件

| ID    | 要件                                                                                 | 優先度 |
| ----- | ------------------------------------------------------------------------------------ | ------ |
| FR-01 | `auth:login` は OAuth フロー開始後、500ms 以内にレスポンスを返すこと                 | must   |
| FR-02 | `auth:login` は `startOAuthFlow(provider)` を fire-and-forget で起動すること         | must   |
| FR-03 | OAuth の成功・失敗通知は既存の `AUTH_STATE_CHANGED` イベントで継続すること           | must   |
| FR-04 | `authHandlers.ts` 側で `AUTH_STATE_CHANGED` を重複送信しないこと                     | must   |
| FR-05 | `provider` のバリデーションは維持し、無効値は即時 `auth/invalid-provider` で返すこと | must   |

## 非機能要件

| ID     | 要件                                                                 | 優先度 |
| ------ | -------------------------------------------------------------------- | ------ |
| NFR-01 | 既存の `authSlice.ts` の listener 実装と互換性を保つこと             | must   |
| NFR-02 | エラーメッセージのサニタイズ（`sanitizeErrorMessage`）を継続すること | must   |
| NFR-03 | 変更スコープを `authHandlers.ts` と関連テストに限定すること          | should |
| NFR-04 | `AUTH_STATE_CHANGED` の通知責務を `AuthFlowOrchestrator` に残すこと  | must   |

## 受け入れ基準

| ID    | 基準                                                                       | 確認方法                        |
| ----- | -------------------------------------------------------------------------- | ------------------------------- |
| AC-01 | スキル生成ボタン押下時に `auth:login` timeout エラーが発生しない           | 手動テスト（Phase 11）          |
| AC-02 | `auth:login` ハンドラーが 500ms 以内にレスポンスを返す                     | ユニットテスト（Phase 4）       |
| AC-03 | OAuth 完了後に `AUTH_STATE_CHANGED` イベントが継続して発火する             | `authFlowOrchestrator` のテスト |
| AC-04 | OAuth 失敗時に `AUTH_STATE_CHANGED` で `authenticated: false` が通知される | `authFlowOrchestrator` のテスト |
| AC-05 | `authHandlers.ts` 側で同じ失敗通知を二重送信しない                         | ユニットテスト（Phase 4）       |
| AC-06 | 既存の全テストが PASS する                                                 | CI（Phase 9）                   |

## 参照資料

| 資料名                  | パス                                                  | 説明                          |
| ----------------------- | ----------------------------------------------------- | ----------------------------- |
| authHandlers.ts         | `apps/desktop/src/main/ipc/authHandlers.ts`           | 修正対象ファイル              |
| authFlowOrchestrator.ts | `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | 既存通知責務                  |
| authSlice.ts            | `apps/desktop/src/renderer/store/slices/authSlice.ts` | `AUTH_STATE_CHANGED` listener |
| ipc-utils.ts            | `apps/desktop/src/preload/ipc-utils.ts`               | `auth:login=500ms`            |

## 実行手順

### ステップ 1: 問題の確認

- `authHandlers.ts` の `auth:login` 実装を確認する
- `await authFlowOrchestrator.startOAuthFlow(provider)` がブロッキング原因であることを確認する
- `CHANNEL_TIMEOUTS["auth:login"] = 500` を確認する

### ステップ 2: 既存の通知機構の確認

- `authFlowOrchestrator.ts` が成功・失敗の `AUTH_STATE_CHANGED` を送信していることを確認する
- `authSlice.ts` の listener 実装を確認する

### ステップ 3: 修正要件の確定

- FR-01 〜 FR-05 を確定する
- NFR-01 〜 NFR-04 を確定する
- AC-01 〜 AC-06 を確定する

## 統合テスト連携

| 判定項目               | 基準                       | 結果 |
| ---------------------- | -------------------------- | ---- |
| handler response time  | 500ms 以内                 | TBD  |
| provider validation    | invalid provider を拒否    | TBD  |
| auth state propagation | orchestrator で継続通知    | TBD  |
| listener compatibility | `authSlice` の受信互換維持 | TBD  |

## 多角的チェック観点（AIが判断）

| 観点 | 確認内容                                                   |
| ---- | ---------------------------------------------------------- |
| 論理 | await が timeout 超過の主因か                              |
| 構造 | handler / orchestrator / renderer の責務境界が閉じているか |
| 価値 | 最小変更で最も大きい UX 改善が得られるか                   |
| 依存 | timeout / event / listener の依存関係が整合しているか      |

## サブタスク管理

- SubAgent 1: timeout / contract 差分の検証
- SubAgent 2: 既存 `AUTH_STATE_CHANGED` と listener 互換の確認
- SubAgent 3: 30種の思考法に基づく改善案の整理

## 成果物

| 成果物   | パス                      | 説明       |
| -------- | ------------------------- | ---------- |
| 要件定義 | `phase-1-requirements.md` | 本ファイル |

## 完了条件

- [ ] 根本原因が特定されている
- [ ] 機能要件（FR）が明記されている
- [ ] 非機能要件（NFR）が明記されている
- [ ] 受け入れ基準（AC）が検証可能な形で明記されている
- [ ] 変更スコープが `authHandlers.ts` に限定されている
- [ ] `authSlice.ts` の既存 listener 互換が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
