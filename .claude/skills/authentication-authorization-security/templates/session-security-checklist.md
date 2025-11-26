# セッションセキュリティチェックリスト

このチェックリストを使用して、アプリケーションのセッション管理がセキュリティベストプラクティスに準拠しているかを確認します。

---

## 1. セッションID生成

- [ ] **CSPRNG使用**: `crypto.randomBytes()`等の暗号論的に安全な乱数生成器を使用
- [ ] **十分なエントロピー**: 128ビット以上（32文字の16進数文字列）
- [ ] **予測不可能**: `Date.now() + Math.random()`等の予測可能な生成は使用しない
- [ ] **衝突回避**: UUID v4またはそれと同等のユニーク性を保証

---

## 2. Cookie属性設定

### HttpOnly

- [ ] **HttpOnly: true**: JavaScriptからのアクセスを防止（XSS対策）
- [ ] **例外なし適用**: すべてのセッションCookieに設定

### Secure

- [ ] **Secure: true**: HTTPS通信でのみCookieを送信
- [ ] **HSTS設定**: HTTP Strict Transport Securityヘッダーで強制
- [ ] **開発環境考慮**: localhostではSecure不要（条件分岐）

### SameSite

- [ ] **SameSite設定**: `strict`、`lax`、または`none`（Secureと併用）
- [ ] **strict推奨**: クロスサイトリクエストで一切送信しない（CSRF最強対策）
- [ ] **lax許容**: トップレベルナビゲーションでは送信（利便性とのバランス）
- [ ] **none禁止**: クロスサイト必須の場合のみ、Secureと併用

### その他属性

- [ ] **Path**: 最小限のパスに制限（`/`は広すぎる場合あり）
- [ ] **Domain**: サブドメイン共有が必要な場合のみ設定
- [ ] **MaxAge/Expires**: 適切な有効期限設定

---

## 3. セッション有効期限

### 絶対タイムアウト

- [ ] **設定あり**: ログインから一定時間後に強制ログアウト
- [ ] **適切な期間**:
  - 一般Webアプリ: 8-24時間
  - 高セキュリティ: 2-4時間
  - 銀行系: 15-30分
- [ ] **実装確認**: セッション作成時刻と現在時刻を比較

### アイドルタイムアウト

- [ ] **設定あり**: 非アクティブ時間後にログアウト
- [ ] **適切な期間**:
  - 一般Webアプリ: 30-60分
  - 高セキュリティ: 15分
  - 低リスク: 2-4時間
- [ ] **最終アクティビティ追跡**: リクエストごとに更新

### スライディングウィンドウ

- [ ] **実装判断**: アクティビティで期限延長するか決定
- [ ] **絶対タイムアウトと併用**: スライディングのみは危険
- [ ] **UX考慮**: ユーザーがアクティブな間は維持

---

## 4. セッション固定攻撃対策

- [ ] **ログイン時再生成**: 認証成功時に必ず新しいセッションIDを発行
- [ ] **権限変更時再生成**: ロール変更、権限昇格時にセッションID再生成
- [ ] **古いセッション無効化**: 再生成時に古いセッションを破棄
- [ ] **URLパラメータ禁止**: セッションIDをURLパラメータに含めない

**実装確認**:
```javascript
// ✅ ログイン時の再生成
req.session.regenerate((err) => {
  req.session.userId = user.id;
});

// ❌ 再生成なし
req.session.userId = user.id;
```

---

## 5. セッションストレージ

### 本番環境

- [ ] **Redis/Memcached使用**: メモリストアは避ける
- [ ] **接続プール設定**: 適切な最大接続数
- [ ] **永続化設定**: Redis AOF/RDB設定（該当する場合）
- [ ] **バックアップ**: セッションストアのバックアップ計画

### 開発環境

- [ ] **メモリストア許容**: 開発環境のみ
- [ ] **環境分離**: 環境変数で本番と開発を切り替え

### クリーンアップ

- [ ] **自動削除**: 期限切れセッションの自動削除（Redis TTLまたはCronジョブ）
- [ ] **定期メンテナンス**: ストレージ肥大化防止

---

## 6. セッションハイジャック対策

### トランスポートセキュリティ

- [ ] **HTTPS強制**: すべての通信でHTTPS使用
- [ ] **HSTS ヘッダー**: `Strict-Transport-Security`設定
- [ ] **TLS 1.2以上**: 古いプロトコル無効化

### Cookieセキュリティ

- [ ] **HttpOnly**: JavaScript読み取り禁止
- [ ] **Secure**: HTTPS通信のみ
- [ ] **SameSite**: クロスサイト送信制限

### 異常検出

- [ ] **IPアドレス検証**: セッション作成時のIPと比較（オプション）
- [ ] **User-Agent検証**: 変化検出（false positive注意）
- [ ] **不審なアクティビティ**: 異常なパターン検出とアラート

**実装確認**:
```javascript
// IPアドレス変化検出
if (req.session.ipAddress && req.session.ipAddress !== req.ip) {
  logger.warn('Session hijacking suspected');
  // 対応: セッション無効化または再認証要求
}
```

---

## 7. セッションライフサイクル

### 作成

- [ ] **認証後のみ**: ログイン成功後にセッション作成
- [ ] **セッションID再生成**: 認証前の匿名セッションIDを破棄
- [ ] **初期属性設定**: userId、role、createdAt等を保存

### 維持

- [ ] **アクティビティ追跡**: リクエストごとに最終アクティビティ時刻を更新
- [ ] **有効期限チェック**: ミドルウェアで期限切れを検証
- [ ] **自動延長**: スライディングウィンドウ実装（該当する場合）

### 終了

- [ ] **明示的ログアウト**: サーバーサイドでセッション削除
- [ ] **Cookieクリア**: クライアント側のCookie削除
- [ ] **Remember Me削除**: 永続トークンも削除
- [ ] **全デバイスログアウト**: オプションで提供

---

## 8. 同時セッション管理

### 単一デバイス制限

- [ ] **実装判断**: セキュリティ要件で必要か決定
- [ ] **既存セッション無効化**: 新規ログイン時に古いセッション削除
- [ ] **ユーザー通知**: 他デバイスからログアウトされたことを通知

### 複数デバイス許可

- [ ] **セッション一覧**: ユーザーがアクティブセッションを確認可能
- [ ] **個別削除**: 特定セッションを削除可能
- [ ] **デバイス情報**: User-Agent、IP、最終アクティビティを表示

**UI要件**:
```
あなたのアクティブセッション:
1. Chrome on Windows (192.168.1.100) - 2時間前 [削除]
2. Safari on iPhone (192.168.1.105) - 10分前 [現在]
3. Firefox on Mac (192.168.1.102) - 1日前 [削除]

[すべてのセッションを削除]
```

---

## 9. Remember Me 機能

### トークン生成

- [ ] **CSPRNG使用**: 暗号論的に安全な乱数
- [ ] **ハッシュ化保存**: DBにはハッシュ化したトークンを保存
- [ ] **十分な長さ**: 32バイト以上

### 有効期限

- [ ] **適切な期間**: 7-30日（長すぎない）
- [ ] **ユーザー選択**: Remember Me機能をオプトイン
- [ ] **期限切れ自動削除**: DB肥大化防止

### セキュリティ

- [ ] **トークンローテーション**: 使用時に新しいトークン発行
- [ ] **削除機能**: ユーザーがRemember Meを無効化可能
- [ ] **全デバイス削除**: パスワード変更時に全Remember Meトークン削除

---

## 10. ログアウトの完全性

### サーバーサイド

- [ ] **セッション削除**: DBまたはRedisからセッション削除
- [ ] **ブラックリスト追加**: JWTの場合、jtiをブラックリストに追加
- [ ] **関連トークン削除**: Remember Me、リフレッシュトークンも削除

### クライアントサイド

- [ ] **Cookie削除**: `res.clearCookie('sessionId')`
- [ ] **ローカルストレージクリア**: トークンをメモリから削除
- [ ] **リダイレクト**: ログインページへリダイレクト

### 全デバイスログアウト

- [ ] **機能提供**: ユーザーがすべてのセッションを削除可能
- [ ] **トリガー**: パスワード変更時、アカウント侵害検出時
- [ ] **通知**: 他デバイスで強制ログアウトされたことを通知

---

## 11. セッション監査ログ

### ログ記録イベント

- [ ] **ログイン成功/失敗**: ユーザー、時刻、IP、User-Agent
- [ ] **ログアウト**: ユーザー、時刻、タイプ（明示的/タイムアウト）
- [ ] **セッション再生成**: トリガー（ログイン/権限変更）
- [ ] **権限昇格試行**: 失敗した認可チェック
- [ ] **異常検出**: IP変化、User-Agent変化

### ログフォーマット

```json
{
  "timestamp": "2025-11-26T10:30:00Z",
  "event": "login_success",
  "userId": "user_12345",
  "sessionId": "sess_abc...def",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 ...",
  "context": {
    "loginMethod": "password",
    "mfaUsed": true,
    "rememberMe": false
  }
}
```

---

## 12. セキュリティヘッダー

### CSRF対策

- [ ] **CSRFトークン**: Double Submit Cookie または Synchronizer Token
- [ ] **SameSite Cookie**: `strict`または`lax`
- [ ] **Originヘッダー検証**: クロスオリジンリクエストを検証

### Content Security Policy

- [ ] **CSP設定**: inline scriptを制限
- [ ] **nonce/hash**: 必要なinline scriptのみ許可

### その他ヘッダー

- [ ] **X-Frame-Options**: `DENY`または`SAMEORIGIN`（Clickjacking対策）
- [ ] **X-Content-Type-Options**: `nosniff`
- [ ] **Referrer-Policy**: `no-referrer`または`strict-origin-when-cross-origin`

---

## 13. 環境別設定

### 開発環境

```javascript
{
  cookie: {
    secure: false,  // localhostではHTTPを許可
    sameSite: 'lax',
    httpOnly: true
  },
  store: new MemoryStore()  // 開発環境ではメモリストア許容
}
```

### 本番環境

```javascript
{
  cookie: {
    secure: true,
    sameSite: 'strict',
    httpOnly: true,
    domain: '.example.com'
  },
  store: new RedisStore({ client: redisClient })
}
```

### 環境分離

- [ ] **環境変数使用**: 設定を環境変数で管理
- [ ] **条件分岐**: `process.env.NODE_ENV`で切り替え
- [ ] **設定検証**: 本番環境でsecure: falseは禁止

---

## 14. エラーハンドリング

### セッションエラー

- [ ] **期限切れ**: 明確なエラーメッセージとログインページへのリダイレクト
- [ ] **無効セッション**: 401 Unauthorizedレスポンス
- [ ] **ストア接続エラー**: フォールバック処理またはエラーページ

### ユーザーフィードバック

- [ ] **タイムアウト警告**: 期限切れ前に警告表示（オプション）
- [ ] **再ログイン誘導**: セッション切れ時の案内
- [ ] **多重ログイン通知**: 他デバイスからのログインを通知（オプション）

---

## 15. テストシナリオ

### 機能テスト

- [ ] **ログイン成功**: セッションが作成される
- [ ] **セッション維持**: 有効期限内はアクセス可能
- [ ] **タイムアウト**: 期限切れ後はアクセス拒否
- [ ] **ログアウト**: セッションが完全に削除される

### セキュリティテスト

- [ ] **セッション固定**: ログイン時にセッションIDが変わるか
- [ ] **CSRF攻撃**: SameSite/CSRFトークンで防御されるか
- [ ] **XSS攻撃**: HttpOnlyでCookie読み取り不可か
- [ ] **セッションハイジャック**: IP/User-Agent変化で検出されるか

---

## 16. パフォーマンス考慮事項

### セッションストアのパフォーマンス

- [ ] **Redis接続プール**: 適切な最大接続数設定
- [ ] **キャッシュ戦略**: 頻繁にアクセスされるセッションデータ
- [ ] **シリアライゼーション**: 効率的なデータ形式（JSON、MessagePack等）

### スケーラビリティ

- [ ] **水平スケーリング**: 複数サーバー間でセッション共有
- [ ] **ロードバランサー**: スティッキーセッション不要（Redis使用時）
- [ ] **フェイルオーバー**: Redisクラスター、レプリケーション

---

## 17. コンプライアンス

### GDPR

- [ ] **同意**: Cookie使用への同意取得
- [ ] **データ最小化**: 必要最小限のデータのみセッションに保存
- [ ] **削除権**: ユーザーがセッションデータを削除可能

### PCI DSS（決済情報を扱う場合）

- [ ] **セッションタイムアウト**: 15分以内の強制ログアウト
- [ ] **再認証**: 決済前の再認証要求
- [ ] **監査ログ**: すべてのセッションイベントを記録

---

## 18. 完全なセッション設定例

### Express.js

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,  // 32文字以上
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',  // デフォルト名を変更
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000  // 1時間
  },
  rolling: true,  // アクティビティで期限延長
  unset: 'destroy'  // セッション削除時にストアからも削除
}));
```

### Next.js（Iron Session）

```javascript
import { withIronSessionApiRoute } from 'iron-session/next';

export default withIronSessionApiRoute(handler, {
  cookieName: 'app_session',
  password: process.env.SESSION_SECRET,  // 32文字以上
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 3600  // 秒単位
  }
});
```

---

## 19. 最終チェック

### Critical（必須）

- [ ] HttpOnly: true
- [ ] Secure: true（本番環境）
- [ ] セッションIDはCSPRNGで生成
- [ ] ログイン時にセッションID再生成
- [ ] サーバーサイドでセッション無効化

### Important（推奨）

- [ ] SameSite: 'strict' または 'lax'
- [ ] 本番環境でRedis/DBストア使用
- [ ] 適切な有効期限設定
- [ ] セッション監査ログ
- [ ] Remember Me機能のセキュアな実装

### Optional（ケースバイケース）

- [ ] IP/User-Agent検証
- [ ] 同時セッション制限
- [ ] セッション一覧UI
- [ ] タイムアウト警告

---

## 20. よくある間違い

### ❌ やってはいけないこと

1. **HttpOnly: falseまたは未設定**: JavaScriptでCookie読み取り可能（XSS攻撃）
2. **Secure: falseで本番運用**: HTTP通信でセッションID漏洩
3. **セッションIDをURLに含める**: ブラウザ履歴、Refererヘッダーで漏洩
4. **Math.random()でセッションID生成**: 予測可能（セッション予測攻撃）
5. **ログイン時にセッションID再生成しない**: セッション固定攻撃
6. **クライアントサイドのみでログアウト**: サーバーサイドで無効化しない
7. **期限切れセッション放置**: ストレージ肥大化、セキュリティリスク

### ✅ ベストプラクティス

1. HttpOnly、Secure、SameSite すべて設定
2. CSPRNG（crypto.randomBytes）でセッションID生成
3. ログイン成功時にセッション再生成
4. 本番環境でRedis/DBストア使用
5. 適切な有効期限（絶対+アイドル）
6. サーバーサイドでセッション無効化
7. 監査ログ記録

---

## 参考文献

- **OWASP Session Management Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- **RFC 6265**: HTTP State Management Mechanism（Cookie仕様）
- **Express Session Documentation**: https://github.com/expressjs/session
- **Iron Session Documentation**: https://github.com/vvo/iron-session
