# Next.js Web認証フロー PKCE移行 - タスク指示書

## メタ情報

```yaml
issue_number: 727
```

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | TASK-AUTH-WEB-PKCE-001                        |
| タスク名     | Next.js Web認証フロー PKCE移行                |
| 分類         | 認証（auth）                                  |
| 対象機能     | OAuth認証（Web）                              |
| 優先度       | 中                                            |
| 見積もり規模 | 中規模                                        |
| ステータス   | 未着手                                        |
| 発見元       | TASK-AUTH-CALLBACK-001 Phase 1 スコープアウト |
| 発見日       | 2026-02-06                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-AUTH-CALLBACK-001（OAuth PKCE移行）はDesktopアプリ（Electron）のみを対象としており、Next.js Webアプリ（`apps/web`）の認証フロー変更はスコープ外として除外された。Desktop側ではAuthorization Code Flow + PKCEに移行完了しているが、Web側は未対応のままである。

### 1.2 問題点・課題

**Desktop vs Web の認証実装状況比較**:

| 項目                 | Desktop（Electron）          | Web（Next.js）           |
| -------------------- | ---------------------------- | ------------------------ |
| 認証フロー           | ✅ Authorization Code + PKCE | ❌ Implicit Flow（推定） |
| State parameter      | ✅ 実装済み                  | ❓ 要確認                |
| PKCE                 | ✅ 実装済み                  | ❌ 未実装                |
| コールバック方式     | ローカルHTTPサーバー         | HTTPリダイレクト         |
| リフレッシュトークン | safeStorage暗号化            | httpOnly Cookie（推定）  |

**セキュリティリスク**:

- WebアプリでImplicit Flowを使用している場合、アクセストークンがブラウザの履歴やリファラーに漏洩するリスク
- PKCEなしでは認可コード横取り攻撃のリスクが残存

### 1.3 放置した場合の影響

| 影響領域     | 影響度 | 説明                                                |
| ------------ | ------ | --------------------------------------------------- |
| セキュリティ | Medium | Webアプリのトークン漏洩リスクが残存                 |
| 一貫性       | Medium | Desktop/Web間で認証フローが異なり、保守コストが増加 |
| OAuth 2.1    | Medium | OAuth 2.1ではPKCE必須のため、将来的な準拠に必要     |

---

## 2. 何を達成するか（What）

### 2.1 目的

Next.js WebアプリのOAuth認証フローをAuthorization Code Flow + PKCEに移行し、Desktop版と同等のセキュリティレベルを確保する。

### 2.2 最終ゴール

- Next.js WebアプリでPKCE対応のAuthorization Code Flowを実装
- サーバーサイド（Route Handler）でトークン交換を実行
- `code_verifier` をサーバーサイドセッションまたはhttpOnly Cookieで安全に保持
- Desktop版との共通コード（`packages/shared`）を最大限活用

### 2.3 スコープ

#### 含むもの

- Next.js Route Handler（`/api/auth/callback`）でのトークン交換
- PKCE code_verifier/code_challenge生成（`packages/shared` から共有可能部分を抽出）
- State parameter検証（サーバーサイド）
- httpOnly Cookie でのセッション管理
- ユニットテスト・統合テスト

#### 含まないもの

- Desktopアプリの認証フロー変更（完了済み）
- バックエンドサーバー（`apps/backend`）の認証変更
- WebSocket認証
- CDNエッジでのトークン検証

### 2.4 成果物

| 種別         | 成果物                      | 配置先                                        |
| ------------ | --------------------------- | --------------------------------------------- |
| 実装         | 共有PKCE ユーティリティ     | `packages/shared/core/auth/pkce.ts`           |
| 実装         | Auth Callback Route Handler | `apps/web/src/app/api/auth/callback/route.ts` |
| 実装         | Auth Login Route Handler    | `apps/web/src/app/api/auth/login/route.ts`    |
| 実装         | Session管理ミドルウェア     | `apps/web/src/middleware.ts`                  |
| テスト       | Route Handler単体テスト     | `apps/web/src/__tests__/`                     |
| ドキュメント | Web認証アーキテクチャ       | `docs/30-workflows/`                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] TASK-AUTH-CALLBACK-001（Desktop PKCE移行）が完了していること
- [ ] Next.js Webアプリ（`apps/web`）の現在の認証実装を調査済みであること
- [ ] Supabase Auth SDKのサーバーサイドPKCEサポートを確認済みであること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- TASK-AUTH-CALLBACK-001: Desktop PKCE移行（完了済み）

**同時実施可能なタスク**:

- task-auth-token-refresh-optimization（トークンリフレッシュ最適化）

### 3.3 必要な知識・スキル

- Next.js 15 App Router（Route Handlers, Middleware）
- サーバーサイドOAuth 2.0 / PKCE
- httpOnly Cookie によるセッション管理
- Supabase Auth SDK（サーバーサイド: `@supabase/ssr`）
- PKCE（RFC 7636）- Desktop実装から学んだ知見

### 3.4 推奨アプローチ

1. **共有コード抽出**: `pkce.ts` のcode_verifier/code_challenge生成ロジックを `packages/shared` に移動
2. **サーバーサイドトークン交換**: Route Handler内でSupabase SDK `exchangeCodeForSession()` を使用
3. **code_verifier保持**: httpOnly Cookie（暗号化）でcode_verifierを一時保持、トークン交換後に削除
4. **Supabase SSR**: `@supabase/ssr` パッケージのサーバーサイドヘルパーを活用

### 3.5 実装上の注意点（TASK-AUTH-CALLBACK-001の知見）

| 課題                                         | 原因                                                                | 解決策                              | 本タスクへの適用                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| カスタムプロトコルURLの`new URL()`パース失敗 | RFC 3986のauthorityコンポーネント解釈でカスタムプロトコルが誤パース | `extractProtocolPath()`で独自パース | **Web版では発生しない**。HTTPリダイレクト（`https://`）を使用するため`new URL()`で正しくパース可能。ただし、`packages/shared`にPKCEコードを共有する際、Desktop固有のパースコードを混入させないよう注意 |
| PKCEバリデーション定数のデッドコード化       | TDDでテスト用定数と実装用定数が分離                                 | 共有定数ファイルで一元管理          | `packages/shared/core/auth/constants.ts`で定数を定義し、Desktop/Web両方で同一定数をimport                                                                                                              |
| `code_verifier` のメモリリーク               | Desktop版ではpendingFlowsにTTLを設定して5分で自動削除               | Map + TTLパターン                   | Web版ではhttpOnly Cookie（`Max-Age: 300`）で5分後自動削除。サーバーサイドのメモリ管理は不要                                                                                                            |
| ルールファイルと仕様書の同期ギャップ         | 仕様書更新後にrulesファイル更新を忘れた                             | 3箇所同時更新                       | Web認証アーキテクチャ追加時に`architecture-auth-security.md` + `01-architecture.md` + 仕様書を同時更新                                                                                                 |

**参照先**:

- `architecture-auth-security.md` - Desktop認証アーキテクチャ（Web版との比較用）
- `skill-creator/references/patterns.md` - PKCE + ローカルHTTPサーバー認証パターン（Desktop版参考）
- `apps/desktop/src/main/auth/pkce.ts` - Desktop版PKCE実装（共有コード抽出元）

---

## 4. 実行手順

### Phase構成

```
Phase 1: 現行Web認証実装調査・共有コード設計
  ↓
Phase 2: packages/shared にPKCEユーティリティ抽出
  ↓
Phase 3: Auth Login Route Handler実装（PKCE開始）
  ↓
Phase 4: Auth Callback Route Handler実装（トークン交換）
  ↓
Phase 5: Session管理ミドルウェア実装
  ↓
Phase 6: TDD Green確認・統合テスト
  ↓
Phase 7: 手動テスト（全プロバイダー）
  ↓
Phase 8: ドキュメント更新
```

### Phase 2 詳細: 共有コード設計

Desktop版 `apps/desktop/src/main/auth/pkce.ts` から以下を抽出:

```
packages/shared/core/auth/
  ├── pkce.ts              # code_verifier/code_challenge生成（プラットフォーム非依存）
  ├── constants.ts         # PKCE関連定数（Desktop/Web共通）
  └── types.ts             # PKCEフロー型定義
```

**抽出時の注意**:

- `crypto.randomBytes` はNode.js/Web Crypto API両方で動作するよう抽象化
- Desktop固有の`safeStorage`やElectron依存コードは含めない
- `packages/shared/package.json` に必要な依存を宣言（P8: 幽霊依存防止）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Next.js WebアプリでPKCE対応ログイン成功（Google/GitHub/Discord）
- [ ] サーバーサイドでのトークン交換完了
- [ ] httpOnly Cookieによるセッション管理
- [ ] Desktop版の既存テストに影響なし（リグレッションなし）

### 品質要件

- [ ] Route Handlerユニットテスト（8テストケース以上）
- [ ] 共有PKCEユーティリティテスト（Desktop/Web両方で動作確認）
- [ ] テストカバレッジ80%以上
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] `architecture-auth-security.md` にWeb認証セクション追加
- [ ] `packages/shared` のexportsパス更新
- [ ] Desktop/Web認証の比較表をドキュメントに追加

---

## 6. 検証方法

### ユニットテスト

1. PKCE code_verifier生成（共有モジュール）
2. PKCE code_challenge生成（共有モジュール）
3. Login Route Handler: PKCEフロー開始
4. Login Route Handler: code_verifier Cookie保存
5. Callback Route Handler: トークン交換成功
6. Callback Route Handler: State検証失敗時のエラー
7. Callback Route Handler: 期限切れcode_verifierのエラー
8. Middleware: セッションCookie検証

### 手動テスト

| No  | カテゴリ | テスト項目            | 操作手順                                | 期待結果                         |
| --- | -------- | --------------------- | --------------------------------------- | -------------------------------- |
| 1   | 正常系   | Webログイン（Google） | Webアプリでgoogleログインボタンクリック | ログイン成功、ダッシュボード表示 |
| 2   | 正常系   | Webログイン（GitHub） | WebアプリでGitHubログインボタンクリック | ログイン成功                     |
| 3   | 正常系   | セッション維持        | ログイン後、ブラウザリロード            | セッション維持、再ログイン不要   |
| 4   | 異常系   | 改ざんState           | コールバックURLのstateを改ざん          | エラー表示、ログイン失敗         |

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                          |
| --------------------------------------- | ------ | -------- | --------------------------------------------- |
| Desktop版PKCEコードがNode.js固有API依存 | Medium | High     | Web Crypto API互換レイヤーの導入              |
| `@supabase/ssr`のPKCEサポート不足       | High   | Medium   | Supabase公式ドキュメント事前確認              |
| httpOnly Cookie のサイズ制限（4KB）     | Low    | Low      | code_verifierは128文字以内のためサイズ制限内  |
| Desktop版テストへのリグレッション       | High   | Low      | 共有コード変更後、Desktop/Web両方のテスト実行 |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/auth/pkce.ts` - Desktop版PKCE実装（共有コード抽出元）
- `apps/desktop/src/main/auth/authFlowOrchestrator.ts` - Desktop版フロー管理（参考）
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`
- `.claude/rules/01-architecture.md` - モノレポ構造・依存方向ルール

### 関連タスク

- TASK-AUTH-CALLBACK-001: Desktop PKCE移行（完了・共有コード元）
- task-auth-token-refresh-optimization: トークンリフレッシュ最適化（同時実施可能）

### 参考資料

- Next.js 15 App Router Route Handlers
- Supabase SSR Auth Documentation
- RFC 7636 - Proof Key for Code Exchange
- Web Crypto API (SubtleCrypto.digest)

---

## 9. 備考

### TASK-AUTH-CALLBACK-001の設計資産活用

- **`pkce.ts`**: code_verifier/code_challenge生成ロジックは`packages/shared`に抽出して両プラットフォームで共有
- **設計パターン**: State + PKCE + Timeout の組み合わせパターンはWeb版でも同構造で適用
- **テスト設計**: Desktop版の68テストケースのうち、PKCEユニットテストはWeb版でも再利用可能

### 苦戦ポイントの事前対策

1. **カスタムプロトコルURL問題はWeb版では発生しない**: Web版はHTTPリダイレクト（`https://`）を使用するため、`new URL()`で正しくパース可能。Desktop固有の`extractProtocolPath()`は`packages/shared`に含めないこと
2. **`crypto.randomBytes` のプラットフォーム差異**: Node.jsの`crypto.randomBytes`とWebの`crypto.getRandomValues`は異なるAPI。`packages/shared`に抽出する際はプラットフォーム検出＋適切なAPI選択を実装
3. **幽霊依存防止（P8）**: `packages/shared`にPKCEコードを移動する際、`package.json`に必要な依存（`crypto`のpolyfill等）を明示的に宣言すること
4. **定数の一元管理**: PKCE関連の定数（verifier長、challenge method、TTL）はDesktop/Web共通の`packages/shared/core/auth/constants.ts`で定義
