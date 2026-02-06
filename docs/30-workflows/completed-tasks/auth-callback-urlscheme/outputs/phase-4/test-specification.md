# Phase 4: テスト仕様書

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-AUTH-CALLBACK-001 |
| Phase    | 4                      |
| 作成日   | 2026-02-06             |

---

## テストケース一覧

### pkce.test.ts（PKCE-01 ~ PKCE-07）

| テストID | テストケース                                    | 状態 |
| -------- | ----------------------------------------------- | ---- |
| PKCE-01  | デフォルト長さのcode_verifierを生成する         | Red  |
| PKCE-02  | Base64URL文字種のみで構成される                 | Red  |
| PKCE-03  | RFC 7636 Appendix Bの検証ベクトルと一致する     | Red  |
| PKCE-04  | codeVerifierとcodeChallengeのペアを返す         | Red  |
| PKCE-04b | codeVerifierからcodeChallengeが正しく導出される | Red  |
| PKCE-05  | カスタム長さ指定で生成される                    | Red  |
| PKCE-06  | 連続呼び出しで異なるcode_verifierが生成される   | Red  |
| PKCE-07  | パディング文字（=）が含まれない                 | Red  |

### authCallbackServer.test.ts（SRV-01 ~ SRV-07）

| テストID | テストケース                                       | 状態 |
| -------- | -------------------------------------------------- | ---- |
| SRV-01   | サーバーが起動しポート番号を返す                   | Red  |
| SRV-02   | 127.0.0.1でバインドされている                      | Red  |
| SRV-03   | authorization_codeとstateを受信する                | Red  |
| SRV-04   | コールバック受信後に認証完了HTMLを返却する         | Red  |
| SRV-05   | stop()でサーバーが停止しポートが解放される         | Red  |
| SRV-06   | タイムアウト時にエラーが発生する                   | Red  |
| SRV-07   | code/stateパラメータ欠如時にエラーレスポンスを返す | Red  |

### authFlowOrchestrator.test.ts（ORC-01 ~ ORC-09）

| テストID | テストケース                               | 状態 |
| -------- | ------------------------------------------ | ---- |
| ORC-01   | 32バイト以上のランダム文字列が生成される   | Red  |
| ORC-02   | state一致時にフローが続行される            | Red  |
| ORC-03   | state不一致時に認証が拒否される            | Red  |
| ORC-04   | OAuth URLにcode_challengeが含まれる        | Red  |
| ORC-05   | トークン交換が正しい引数で呼ばれる         | Red  |
| ORC-06   | トークン交換成功後にセッションが確立される | Red  |
| ORC-07   | shell.openExternalでOAuth URLが開かれる    | Red  |
| ORC-08   | エラー発生時にクリーンアップが実行される   | Red  |
| ORC-09   | トークン交換失敗時にエラーが通知される     | Red  |

### auth-ipc-integration.test.ts（IPC-01 ~ IPC-06）

| テストID | テストケース                                           | 状態 |
| -------- | ------------------------------------------------------ | ---- |
| IPC-01   | auth:loginチャネルが定義されている                     | Red  |
| IPC-02   | auth:state-changedチャネルが定義されている             | Red  |
| IPC-03   | 新規auth:start-oauth-flowチャネルが定義されている      | Red  |
| IPC-04   | auth:start-oauth-flowがPreloadホワイトリストに存在する | Red  |
| IPC-05   | 既存の認証チャネルがホワイトリストに存在する           | Red  |
| IPC-06   | AUTH_STATE_CHANGEDがlistenerチャネルに存在する         | Red  |

---

## テスト総数

| カテゴリ           | テスト数 |
| ------------------ | -------- |
| PKCE生成           | 8        |
| HTTPサーバー       | 7        |
| オーケストレーター | 9        |
| IPC統合            | 6        |
| **合計**           | **30**   |

---

## モック/スタブ設計

| モック対象              | テストファイル               | 方式                       |
| ----------------------- | ---------------------------- | -------------------------- |
| electron (shell, BW)    | authFlowOrchestrator.test.ts | vi.mock('electron')        |
| Supabase Auth API       | authFlowOrchestrator.test.ts | vi.fn() モックオブジェクト |
| SecureStorage           | authFlowOrchestrator.test.ts | vi.fn() モックオブジェクト |
| fetch（HTTPリクエスト） | authCallbackServer.test.ts   | 実際のHTTPリクエスト       |

---

## Red状態確認

全テストファイルのimport先モジュールが未実装のため、import時にエラーとなりRed状態。

- `../pkce` → 未作成
- `../authCallbackServer` → 未作成
- `../authFlowOrchestrator` → 未作成
- `IPC_CHANNELS.AUTH_START_OAUTH_FLOW` → 未追加
