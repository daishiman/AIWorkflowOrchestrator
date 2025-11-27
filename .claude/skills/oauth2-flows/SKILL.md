---
name: oauth2-flows
description: |
  OAuth 2.0認可フローの実装パターンとセキュリティベストプラクティス。
  Authorization Code Flow、PKCE、Refresh Token Flowの正確な実装を提供。
  Aaron PareckiのOAuth 2.0 Simplifiedに基づく実践的ガイダンス。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/oauth2-flows/resources/authorization-code-flow.md`: Authorization Code Flow 詳細実装
  - `.claude/skills/oauth2-flows/resources/pkce-implementation.md`: PKCE (Proof Key for Code Exchange) 実装詳細
  - `.claude/skills/oauth2-flows/resources/security-checklist.md`: OAuth 2.0 セキュリティチェックリスト
  - `.claude/skills/oauth2-flows/resources/token-storage-strategies.md`: トークンストレージ戦略
  - `.claude/skills/oauth2-flows/scripts/validate-oauth-config.mjs`: OAuth 2.0設定のセキュリティ検証（state・redirect_uri・スコープ・トークンストレージの妥当性確認）
  - `.claude/skills/oauth2-flows/templates/auth-code-flow-template.ts`: サーバーサイドOAuth認可コードフロー実装（state検証・トークン交換・エラーハンドリング含む）
  - `.claude/skills/oauth2-flows/templates/pkce-implementation-template.ts`: SPA/モバイル向けPKCE実装（Code Verifier生成・SHA-256チャレンジ・検証フロー含む）

  使用タイミング:
  - OAuth 2.0プロバイダー統合時（Google、GitHub、Discord等）
  - 認可フローの選択と実装が必要な時
  - PKCEによるSPA・モバイルアプリ対応時
  - トークンライフサイクル管理の設計時
  - OAuth 2.0セキュリティベストプラクティス適用時

  関連スキル:
  - `.claude/skills/session-management/SKILL.md` - セッション管理とトークン戦略
  - `.claude/skills/nextauth-patterns/SKILL.md` - NextAuth.js統合パターン
  - `.claude/skills/security-headers/SKILL.md` - CSRF/XSS対策

  Use when implementing OAuth 2.0, integrating authentication providers,
  or designing secure authorization flows for web/mobile applications.

version: 1.0.0
---

# OAuth 2.0 Flows Implementation

## スキル概要

このスキルは、OAuth 2.0 認可フローの実装とセキュリティベストプラクティスを提供します。

**コアドメイン**:

- OAuth 2.0 仕様の理解と実装
- 適切なフロー選択基準
- PKCE（Proof Key for Code Exchange）実装
- セキュリティ考慮事項とベストプラクティス

**専門家の思想**:

- **Aaron Parecki**: OAuth 2.0 の実用的セキュリティガイドライン策定者
- **核心概念**: シンプルで堅牢、実装者が正しく使える認可フロー設計

**参照書籍**:

- 『OAuth 2.0 Simplified』- 実装者向けの実践的ガイド
- OAuth 2.0 RFC 6749 - 公式仕様

## OAuth 2.0 フローの種類と選択基準

### 1. Authorization Code Flow（認可コードフロー）

**概要**: 最も安全で推奨される OAuth フロー

**適用場面**:

- サーバーサイド Web アプリケーション
- クライアントシークレットを安全に保管できる環境
- Next.js App Router 等の SSR/SSG 環境

**フロー**:

```
1. クライアント → 認可サーバー: 認可リクエスト
2. 認可サーバー → ユーザー: ログイン画面表示
3. ユーザー → 認可サーバー: 認証・同意
4. 認可サーバー → クライアント: 認可コード返却（redirect）
5. クライアント → 認可サーバー: 認可コード + クライアントシークレット
6. 認可サーバー → クライアント: アクセストークン返却
```

**セキュリティ考慮事項**:

- クライアントシークレットはサーバー側のみで保管
- redirect URI の厳格な検証必須
- state パラメータで CSRF 対策
- 認可コードは一度のみ使用可能（再利用検出）

**実装時の判断基準**:

- [ ] アプリケーションはサーバーサイドコンポーネントを持つか？
- [ ] クライアントシークレットを安全に保管できるか？
- [ ] redirect URI は事前登録されているか？

### 2. Authorization Code Flow + PKCE

**概要**: パブリッククライアント（SPA、モバイルアプリ）向けのセキュア化拡張

**適用場面**:

- シングルページアプリケーション（React、Vue 等）
- モバイルアプリ（iOS、Android）
- クライアントシークレットを安全に保管できない環境

**PKCE の仕組み**:

```
1. Code Verifier生成: ランダムな43-128文字の文字列
2. Code Challenge生成: SHA256(Code Verifier) → Base64URL
3. 認可リクエスト: code_challenge + code_challenge_method=S256
4. トークンリクエスト: code_verifier（元の文字列）
5. 認可サーバー検証: SHA256(code_verifier) == code_challenge
```

**セキュリティ考慮事項**:

- Code Verifier は暗号学的に安全な乱数生成器で作成
- code_challenge_method は必ず"S256"を使用（"plain"は非推奨）
- Code Verifier はメモリにのみ L 保持、永続化しない
- 認可コードインターセプト攻撃を防止

**実装時の判断基準**:

- [ ] クライアントシークレットを安全に保管できないか？
- [ ] SPA またはモバイルアプリか？
- [ ] PKCE は OAuth 2.0 プロバイダーでサポートされているか？

### 3. Refresh Token Flow

**概要**: 長期間のアクセス維持のためのトークン更新メカニズム

**適用場面**:

- ユーザーが長時間ログイン状態を維持する必要がある
- アクセストークンの有効期限が短い（15 分-1 時間）
- バックグラウンド処理や定期的な API 呼び出しが必要

**フロー**:

```
1. 初回認証: Authorization Code Flow → アクセストークン + リフレッシュトークン
2. アクセストークン期限切れ検出
3. リフレッシュトークン → 認可サーバー: トークン更新リクエスト
4. 認可サーバー → クライアント: 新アクセストークン（+ 新リフレッシュトークン）
```

**セキュリティ考慮事項**:

- リフレッシュトークンはセキュアストレージに保管（HttpOnly Cookie 推奨）
- リフレッシュトークンローテーション実装（再利用検出）
- リフレッシュトークンの有効期限設定（例: 30 日-90 日）
- トークンファミリー管理と異常検出

**実装時の判断基準**:

- [ ] アクセストークン有効期限は 1 時間以下か？
- [ ] ユーザーは長期間ログイン状態を維持するか？
- [ ] リフレッシュトークンローテーションはサポートされているか？

## OAuth 2.0 セキュリティベストプラクティス

### 1. State Parameter（CSRF 対策）

**目的**: CSRF による認可コード窃取を防止

**実装**:

```typescript
// 認可リクエスト時
const state = generateRandomString(32);
sessionStorage.setItem("oauth_state", state);
window.location.href = `${authEndpoint}?state=${state}&...`;

// コールバック時
const returnedState = new URL(window.location.href).searchParams.get("state");
const savedState = sessionStorage.getItem("oauth_state");
if (returnedState !== savedState) {
  throw new Error("State mismatch - potential CSRF attack");
}
```

**判断基準**:

- [ ] state パラメータは暗号学的に安全な乱数か？
- [ ] state は認可リクエストとコールバックで一致するか？
- [ ] state は一度使用後に削除されるか？

### 2. Redirect URI Validation

**目的**: オープンリダイレクタ脆弱性を防止

**実装パターン**:

- 完全一致検証（ホワイトリスト方式）
- ワイルドカード使用禁止
- スキーム（https://）も含めた検証
- ローカル開発用 URI と本番用 URI の分離

**判断基準**:

- [ ] redirect URI は事前に OAuth プロバイダーに登録されているか？
- [ ] 動的な redirect URI 生成を避けているか？
- [ ] 本番環境では HTTPS 必須になっているか？

### 3. Scope Design（最小権限の原則）

**目的**: 必要最小限の権限のみ要求

**設計原則**:

- アプリケーションが本当に必要とするスコープのみ要求
- 段階的権限要求（初回は最小限、必要時に追加）
- スコープの詳細な説明（ユーザーの同意を得やすくする）

**例**:

```typescript
// ❌ 過剰な権限要求
scope: "user:email user:profile repo admin:org";

// ✅ 最小権限
scope: "user:email"; // メールアドレスのみ必要な場合
```

**判断基準**:

- [ ] 各スコープの必要性は明確か？
- [ ] 管理者権限は本当に必要か？
- [ ] 段階的権限要求は考慮されているか？

### 4. Token Storage（トークン保管）

**保管場所の評価**:

| 保管場所            | セキュリティ | XSS 耐性 | CSRF 耐性 | 推奨用途                  |
| ------------------- | ------------ | -------- | --------- | ------------------------- |
| **HttpOnly Cookie** | 高           | ✅ 高    | ⚠️ 要対策 | サーバーサイドアプリ      |
| **Memory（変数）**  | 中           | ✅ 高    | ✅ 高     | SPA（タブクローズで消失） |
| **localStorage**    | 低           | ❌ 低    | ✅ 高     | 非推奨（XSS 脆弱）        |
| **sessionStorage**  | 低           | ❌ 低    | ✅ 高     | 非推奨（XSS 脆弱）        |

**推奨パターン**:

- **アクセストークン**: メモリまたは HttpOnly Cookie
- **リフレッシュトークン**: HttpOnly Cookie（Secure、SameSite=Lax/Strict）
- **ID トークン**: メモリまたは HttpOnly Cookie

**判断基準**:

- [ ] XSS 攻撃シナリオは考慮されているか？
- [ ] トークンは localStorage に保存されていないか？
- [ ] HttpOnly Cookie 使用時、CSRF 対策は実装されているか？

## リソース参照

### 詳細実装パターン

```bash
cat .claude/skills/oauth2-flows/resources/authorization-code-flow.md
```

### PKCE 実装詳細

```bash
cat .claude/skills/oauth2-flows/resources/pkce-implementation.md
```

### セキュリティチェックリスト

```bash
cat .claude/skills/oauth2-flows/resources/security-checklist.md
```

### トークンストレージ戦略

```bash
cat .claude/skills/oauth2-flows/resources/token-storage-strategies.md
```

## スクリプト実行

### OAuth 2.0 設定検証

```bash
node .claude/skills/oauth2-flows/scripts/validate-oauth-config.mjs <config-file>
```

## テンプレート参照

### Authorization Code Flow 実装テンプレート

```bash
cat .claude/skills/oauth2-flows/templates/auth-code-flow-template.ts
```

### PKCE 実装テンプレート

```bash
cat .claude/skills/oauth2-flows/templates/pkce-implementation-template.ts
```

## 実装時のワークフロー

### Phase 1: フロー選定

1. アプリケーションタイプを分析（サーバーサイド/SPA/モバイル）
2. クライアントシークレット保管可否を評価
3. 適切なフローを選択（Authorization Code / Authorization Code + PKCE）
4. 選択理由を文書化

### Phase 2: プロバイダー設定

1. OAuth 2.0 プロバイダーを選定（Google、GitHub 等）
2. プロバイダーにアプリケーション登録
3. Client ID / Client Secret を取得
4. redirect URI を登録（開発・本番環境別）
5. 必要なスコープを定義

### Phase 3: 実装

1. 認可リクエスト実装（state、PKCE 含む）
2. コールバックハンドラー実装
3. トークン交換ロジック実装
4. エラーハンドリング実装

### Phase 4: セキュリティ強化

1. state パラメータ検証実装
2. redirect URI 検証強化
3. トークンストレージのセキュア化
4. CSRF/XSS 対策の多層化

### Phase 5: テストと検証

1. 正常系フローのテスト
2. エラーケース（認証拒否、タイムアウト等）のテスト
3. セキュリティテスト（CSRF、リダイレクタ等）
4. 本番環境での検証

## 判断基準

### フロー選択の判断

- [ ] アプリケーションタイプは正確に把握されているか？
- [ ] クライアントシークレットの保管可否は評価されているか？
- [ ] PKCE の必要性は判断されているか？
- [ ] リフレッシュトークンの使用可否は決定されているか？

### セキュリティの判断

- [ ] state パラメータは実装されているか？
- [ ] redirect URI は厳格に検証されているか？
- [ ] トークンストレージは適切か？
- [ ] スコープは最小権限の原則に従っているか？

### 実装品質の判断

- [ ] エラーハンドリングは包括的か？
- [ ] ログとモニタリングは実装されているか？
- [ ] テストカバレッジは十分か（80%以上）？
- [ ] ドキュメンテーションは完全か？

## ベストプラクティス

### セキュアなパラメータ生成

```typescript
// Code Verifier（PKCE用）
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// State Parameter
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}
```

### エラーハンドリング

- 認証エラーは詳細情報を漏らさない
- ユーザーフレンドリーなエラーメッセージ
- セキュリティイベントはログに記録
- リトライ戦略の実装（一時的障害用）

### 環境変数管理

```bash
# .env.example
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
OAUTH_AUTHORIZE_URL=https://provider.com/oauth/authorize
OAUTH_TOKEN_URL=https://provider.com/oauth/token
```

## 関連スキル連携

### session-management との連携

- OAuth 2.0 で取得したトークンのセッション統合
- トークン有効期限とセッション有効期限の整合
- リフレッシュフローとセッション延長の連携

### nextauth-patterns との連携

- NextAuth.js での OAuth 2.0 プロバイダー設定
- カスタムプロバイダー実装
- セッションコールバックでのトークン管理

### security-headers との連携

- CSRF 対策の多層化（state + CSRF トークン）
- Cookie 属性の適切な設定
- セキュリティヘッダーによる追加保護

## バージョン履歴

| バージョン | 日付       | 変更内容                                    |
| ---------- | ---------- | ------------------------------------------- |
| 1.0.0      | 2025-11-26 | 初版リリース - OAuth 2.0 フロー実装パターン |
