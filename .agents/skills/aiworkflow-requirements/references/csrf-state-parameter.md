# State Parameter CSRF防御 実装仕様

> **読み込み条件**: StateManager実装の参照・保守時、PKCE移行（DEBT-SEC-002）設計時
> **正本**: `apps/desktop/src/main/infrastructure/stateManager.ts`

## メタ情報

| 項目     | 値                      |
| -------- | ----------------------- |
| バージョン | 1.0.0                 |
| 作成日   | 2026-02-06              |
| タスクID | DEBT-SEC-001            |
| 準拠規格 | RFC 6749 Section 10.12  |
| テスト   | 21件 ALL PASS           |
| カバレッジ | Line/Branch/Function 100% |

## 概要

OAuth認証フローにおけるCSRF攻撃を防御するため、State Parameterの生成・検証メカニズムを実装。
Main Processのインメモリで管理し、ワンタイムユース・有効期限・暗号学的乱数の3要素で安全性を担保する。

---

## API仕様

### 型定義

```typescript
type OAuthProvider = "google" | "github" | "discord";

interface StateEntry {
  state: string;            // 64文字hex文字列（crypto.randomBytes(32)）
  provider: OAuthProvider;  // 生成時に指定されたプロバイダー
  createdAt: number;        // 生成タイムスタンプ（ms）
  expiresAt: number;        // createdAt + STATE_EXPIRY_MS
}
```

### 定数

| 定数名          | 値                    | 説明             |
| --------------- | --------------------- | ---------------- |
| STATE_EXPIRY_MS | 600,000（10分）       | State有効期限    |
| STATE_FORMAT    | `/^[a-f0-9]{64}$/`   | 64文字hex形式    |

### メソッド

#### `generate(provider: OAuthProvider): string`

暗号学的乱数で64文字hexトークンを生成し、Mapに格納する。

| 項目   | 内容                                    |
| ------ | --------------------------------------- |
| 引数   | provider: OAuthProvider                 |
| 戻り値 | string（64文字hex）                     |
| 副作用 | Map<string, StateEntry>にエントリ追加   |
| 用途   | ログイン開始時（authHandlers.ts）       |

#### `validate(state: string, provider: OAuthProvider): boolean`

3段階検証: 存在確認 → プロバイダー照合 → 有効期限確認。
検証後は成否問わず即座に削除（ワンタイムユース保証）。

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| 引数     | state: string, provider: OAuthProvider        |
| 戻り値   | boolean（true=有効 / false=無効）             |
| 副作用   | 検証対象エントリをMapから削除                 |
| 検証順序 | (1) 存在 → (2) provider一致 → (3) 期限内    |

#### `consumeState(state: string): boolean`

プロバイダー検証なしの簡易検証。Implicit Flowのコールバック時にプロバイダー情報が取得不可のため使用。

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| 引数     | state: string                                 |
| 戻り値   | boolean（true=有効 / false=無効）             |
| 副作用   | 検証対象エントリをMapから削除                 |
| 検証順序 | (1) 存在 → (2) 期限内                        |
| 制約     | プロバイダー照合なし（UT-SEC-001で将来対応）  |

#### `cleanup(): void`

期限切れStateEntryを一括削除。メモリリーク防止用。

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| 引数   | なし                                  |
| 副作用 | 期限切れエントリをMapから削除         |
| 呼出元 | 明示的呼び出し（定期スケジューリングなし） |

#### `_reset(): void`

テスト用ユーティリティ。全Stateを消去する。

---

## 認証フローにおける統合

### State生成（ログイン開始時）

```
Renderer → IPC(auth:login, provider) → Main Process
  ↓
stateManager.generate(provider)  → 64文字hex state
  ↓
supabase.auth.signInWithOAuth({ queryParams: { state } })
  ↓
shell.openExternal(url)  → 外部ブラウザでOAuth認証
```

**実装箇所**: `apps/desktop/src/main/ipc/authHandlers.ts`（auth:loginハンドラ）

### State検証（コールバック受信時）

```
外部ブラウザ → aiworkflow://auth/callback#access_token=xxx&state=yyy
  ↓
Step 1: URLフラグメント(#以降)をURLSearchParamsでパース
Step 2: state パラメータ抽出
Step 3: 形式検証 /^[a-f0-9]{64}$/ → 不一致ならCSRF_VALIDATION_FAILED
Step 4: stateManager.consumeState(state) → 失敗ならCSRF_VALIDATION_FAILED
Step 5: トークン処理へ続行
```

**実装箇所**: `apps/desktop/src/main/index.ts`（handleAuthCallback関数）

### エラーレスポンス

```typescript
// State検証失敗時にRendererへ送信
mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
  authenticated: false,
  error: "認証状態が無効または期限切れです。再度ログインしてください。",
  errorCode: "CSRF_VALIDATION_FAILED",
});
```

---

## セキュリティ設計根拠

| 設計判断   | 選択値                  | 根拠                                                                                         |
| ---------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| エントロピー | 256ビット（32バイト）  | crypto.randomBytes(32)でブルートフォース不可能な状態空間（2^256）                             |
| エンコード | hex（64文字）           | URL-safeかつログ上で視認容易。Base64よりデバッグ時の可読性が高い                              |
| 有効期限   | 10分                    | 典型的OAuth認証操作（2-3分）+ ネットワーク遅延 + ユーザー操作余裕。長すぎるとCSRFウィンドウ拡大 |
| ワンタイム | 即時削除                | リプレイ攻撃防止。RFC 6749 Section 10.12準拠                                                 |
| ストレージ | インメモリMap           | プロセス内完結。認証操作は短命のためディスク永続化は不要                                     |
| 形式検証   | 正規表現先行チェック    | consumeState()呼び出し前に不正形式を除外し、Map検索コストを削減                               |

---

## 既知の制約（Implicit Flow由来）

| 制約                               | 影響                                      | 将来の解決策                                    |
| ---------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| コールバックURLにプロバイダー情報なし | consumeState()でプロバイダー検証不可       | DEBT-SEC-002（PKCE）でAuthorization Code Flow移行 |
| URLフラグメント(#)でパラメータ受信   | url.hash.slice(1)でパース必要             | PKCE移行でurl.search(?)に変更                   |
| Map上限なし                        | 理論上メモリリーク可能                    | cleanup()定期呼び出しで緩和                     |
| state生成・検証がプロセスローカル   | マルチプロセスでは状態共有不可            | 現在はシングルプロセスのため問題なし            |

---

## 苦戦箇所と教訓

### 1. consumeState設計の乖離

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 問題     | 設計書ではvalidate(state, provider)を想定していたが、Implicit FlowのコールバックURLにプロバイダー情報が含まれない |
| 根本原因 | Implicit Flow APIの境界条件を設計段階で検証不足                                                 |
| 解決     | consumeState(state)をプロバイダー検証なしの簡易版として追加実装                                 |
| 教訓     | OAuth仕様の制約は設計Phase（Phase 2）でコールバックURLのサンプルを実際に確認すべき              |

### 2. Phase 12ドキュメント更新漏れ

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 問題     | 初回Phase 12実行で9ファイルの更新漏れが発生                                                    |
| 根本原因 | 正本（references/）と派生（docs/）の2階層に同じ情報が存在することの認識不足                     |
| 解決     | 多角的品質レビュー（コード・ドキュメント・仕様対照の3エージェント並列）で検出・修正            |
| 教訓     | `grep -rn "KEYWORD" references/ docs/` で両階層を検索。06-known-pitfalls.mdを開始前に確認      |

### 3. Implicit Flow固有の制約

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 問題     | パラメータがURLフラグメント(#)に含まれ、url.searchでは取得不可                                  |
| 根本原因 | OAuth Implicit Flowの仕様動作（url.hashにトークンを含む）                                      |
| 解決     | url.hash.slice(1)でパース                                                                      |
| 教訓     | PKCE実装（DEBT-SEC-002）時にurl.search(?)への切り替えが必要                                    |

---

## テストカバレッジ

| カテゴリ         | テスト数 | テストID               |
| ---------------- | -------- | ---------------------- |
| 生成             | 1        | ST-01                  |
| 検証（正常）     | 2        | ST-02, ST-06           |
| 検証（異常）     | 3        | ST-03, ST-04, ST-05    |
| 境界値           | 2        | ST-09, ST-10           |
| クリーンアップ   | 3        | ST-07, ST-12, ST-13    |
| エッジケース     | 3        | ST-08, ST-11, ST-15    |
| consumeState()   | 4        | （行番号ベース）       |
| 統合             | 3        | ST-16, ST-17, ST-18    |
| **合計**         | **21**   | **100%カバレッジ**     |

### 境界値テスト詳細

| テストID | 条件                       | 期待結果 |
| -------- | -------------------------- | -------- |
| ST-09    | 有効期限ちょうど（10分）   | true     |
| ST-10    | 有効期限内（9分59秒999ms） | true     |
| ST-05    | 有効期限超過（10分+1ms）   | false    |

---

## 関連ドキュメント

- [認証セキュリティアーキテクチャ](architecture-auth-security.md) - 認証設計全体
- [セキュリティ原則](security-principles.md) - 実装ステータス一覧
- [認証IPC API](api-ipc-auth.md) - エラーコード定義（CSRF_VALIDATION_FAILED）
- [セキュリティ運用](security-operations.md) - CSRF検証失敗ログ要件
- [DEBT-SEC-001 実装ガイド](../../docs/30-workflows/DEBT-SEC-001-auth-state-parameter/outputs/phase-12/implementation-guide.md) - 概念説明・開発者向け詳細

## 変更履歴

| バージョン | 日付       | 変更内容                             |
| ---------- | ---------- | ------------------------------------ |
| 1.0.0      | 2026-02-06 | DEBT-SEC-001完了に伴い新規作成       |
