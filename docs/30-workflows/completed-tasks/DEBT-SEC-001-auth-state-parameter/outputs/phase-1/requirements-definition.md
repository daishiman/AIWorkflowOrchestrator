# Phase 1: 要件定義書

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 1                                 |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-06                        |
| 状態   | 完了                              |

## 機能要件（FR）

| FR-ID | 要件                                                          | 優先度 |
| ----- | ------------------------------------------------------------- | ------ |
| FR-01 | OAuth認証開始時にランダムなstateパラメータを生成する          | 高     |
| FR-02 | stateパラメータをメモリ（Main Process Map）に一時保存する     | 高     |
| FR-03 | コールバック受信時にstateパラメータを検証する                 | 高     |
| FR-04 | 不正なstateの場合はトークンを拒否しエラーメッセージを表示する | 高     |
| FR-05 | stateパラメータに有効期限（10分）を設定する                   | 中     |
| FR-06 | 検証成功後にstateを削除する（ワンタイムユース）               | 高     |
| FR-07 | stateとOAuthプロバイダーを紐付けて保存する                    | 中     |

## 非機能要件（NFR）

| NFR-ID | 要件                                                               | 優先度 |
| ------ | ------------------------------------------------------------------ | ------ |
| NFR-01 | crypto.randomBytes(32)で高エントロピーな乱数を使用する             | 高     |
| NFR-02 | 既存テストが全て通過する                                           | 高     |
| NFR-03 | TypeScript型安全性が維持される                                     | 高     |
| NFR-04 | RFC 6749 Section 10.12のCSRF対策に準拠する                         | 高     |
| NFR-05 | 期限切れstateの自動クリーンアップ                                  | 中     |
| NFR-06 | CSRF検証失敗を認証失敗イベントとしてセキュリティログに記録すること | 高     |
| NFR-07 | stateパラメータの形式を検証すること（64文字hex文字列）             | 高     |

## 受け入れ基準

### AC-01: State生成

**Given**: ユーザーがOAuthログインボタンをクリックする
**When**: auth:loginハンドラーが実行される
**Then**: ランダムなstateパラメータが生成され、Supabase OAuth URLに含まれる

### AC-02: State検証成功

**Given**: 正しいstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: stateが検証に成功し、トークン処理が続行される

### AC-03: State検証失敗（不正なstate）

**Given**: 不正なstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: トークン処理が拒否され、エラーメッセージが表示される

### AC-04: State検証失敗（stateなし）

**Given**: stateパラメータを含まないコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: トークン処理が拒否され、エラーメッセージが表示される

### AC-05: 有効期限切れ

**Given**: 10分以上経過したstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: stateが期限切れとして拒否される

### AC-06: ワンタイムユース

**Given**: 既に使用されたstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: stateが無効として拒否される

## スコープ定義

### 含むもの

- StateManagerモジュールの新規作成
- authHandlers.ts修正（state生成・OAuth URLへの追加）
- index.ts修正（コールバック受信時のstate検証）
- StateManagerユニットテスト作成
- 手動テスト（3プロバイダー正常系 + 2異常系）
- セキュリティガイドライン更新

### 含まないもの

- PKCE実装（DEBT-SEC-002として別タスク）
- カスタムプロトコルURL詳細検証（DEBT-SEC-003として別タスク）
- セッション管理の改善（別タスク）

## アーキテクチャ層別要件

| 層           | 要件                                                       |
| ------------ | ---------------------------------------------------------- |
| Main Process | StateManagerモジュール作成、state生成・検証ロジック        |
| IPC通信      | authHandlers.ts修正（state生成をsignInWithOAuthに追加）    |
| Preload      | 変更不要（既存チャネル使用）                               |
| Renderer     | 変更不要（エラーメッセージはAUTH_STATE_CHANGED経由で受信） |

## 完了確認

- [x] 全要件が抽出されている（FR 7件、NFR 7件）
- [x] 各要件に受け入れ基準がある（AC 6件）
- [x] FR/NFRが分類されている
- [x] スコープが定義されている
- [x] アーキテクチャ層別要件が明記されている
- [x] 本Phase内の全タスクを100%実行完了
