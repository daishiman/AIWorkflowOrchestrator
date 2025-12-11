# セッション管理パターン

## 1. セッションストレージ戦略

### サーバーサイドセッション

**実装**:

```javascript
// セッションデータをサーバーに保存
const sessionStore = new RedisStore({ client: redisClient });

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000, // 1時間
    },
  }),
);
```

**利点**:

- セッションデータを完全に制御
- 即座にセッション無効化が可能
- データサイズ制限なし

**欠点**:

- サーバーメモリ/ストレージを消費
- 水平スケーリングにRedis等の共有ストアが必要

---

### クライアントサイドセッション（JWT）

**実装**:

```javascript
// セッションデータをJWTとしてCookieに保存
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2],
    maxAge: 3600000,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  }),
);
```

**利点**:

- サーバーサイドストレージ不要
- 水平スケーリングが容易
- ステートレス

**欠点**:

- セッション即座無効化が困難（ブラックリスト必要）
- Cookieサイズ制限（4KB）
- すべてのリクエストでデータ送信（帯域幅）

---

## 2. セッションID生成

### 要件

**エントロピー**: 最低128ビット（推奨: 256ビット）

**生成方法**:

```javascript
// ✅ 暗号論的に安全な乱数生成器（CSPRNG）
const crypto = require("crypto");
const sessionId = crypto.randomBytes(32).toString("hex"); // 256ビット

// ❌ 予測可能な生成
const sessionId = Date.now().toString() + Math.random(); // 危険
```

**形式**: Base64、Hex、UUIDv4が一般的

**判断基準**:

- [ ] crypto.randomBytes()等のCSPRNGを使用しているか？
- [ ] エントロピーは128ビット以上か？
- [ ] Math.random()は使用されていないか？

---

## 3. セッション固定攻撃対策

### 攻撃シナリオ

1. 攻撃者が有効なセッションIDを取得
2. 被害者にそのセッションIDを使用させる
3. 被害者がログイン
4. 攻撃者が同じセッションIDで認証済みアクセス

### 対策

**セッション再生成**:

```javascript
// ログイン成功時
app.post("/login", async (req, res) => {
  const user = await authenticate(req.body.username, req.body.password);

  if (user) {
    // 古いセッションを破棄
    req.session.destroy();

    // 新しいセッションを開始
    req.session.regenerate((err) => {
      req.session.userId = user.id;
      res.json({ success: true });
    });
  }
});
```

**権限変更時の再生成**:

```javascript
// ロール変更時
app.post("/upgrade-to-admin", async (req, res) => {
  await upgradeUser(req.session.userId);

  // セッションを再生成（権限昇格後）
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    req.session.role = "admin";
    res.json({ success: true });
  });
});
```

**判断基準**:

- [ ] ログイン成功時にセッションIDが再生成されるか？
- [ ] 権限変更時にセッションが再生成されるか？
- [ ] セッションIDがURLパラメータに含まれていないか？

---

## 4. セッション有効期限戦略

### 絶対タイムアウト

**定義**: ログインから一定時間経過後、強制ログアウト

**実装**:

```javascript
const sessionStart = Date.now();
const absoluteTimeout = 8 * 3600 * 1000; // 8時間

// 検証
if (Date.now() - sessionStart > absoluteTimeout) {
  session.destroy();
  throw new Error("Session expired (absolute timeout)");
}
```

**推奨設定**:

- 一般的なWebアプリ: 8-24時間
- 高セキュリティ: 2-4時間
- 銀行系: 15-30分

---

### アイドルタイムアウト

**定義**: 非アクティブ時間後にログアウト

**実装**:

```javascript
const idleTimeout = 30 * 60 * 1000; // 30分

// アクティビティ時に更新
app.use((req, res, next) => {
  if (req.session.userId) {
    req.session.lastActivity = Date.now();
  }
  next();
});

// 検証
const timeSinceActivity = Date.now() - req.session.lastActivity;
if (timeSinceActivity > idleTimeout) {
  session.destroy();
  throw new Error("Session expired (idle timeout)");
}
```

**推奨設定**:

- 一般的なWebアプリ: 30-60分
- 高セキュリティ: 15分
- 低リスク: 2-4時間

---

### スライディングウィンドウ

**定義**: アクティビティごとに有効期限を延長

**実装**:

```javascript
app.use((req, res, next) => {
  if (req.session.userId) {
    // アクティビティごとにCookieのmaxAgeを更新
    req.session.cookie.maxAge = 3600000; // 1時間延長
  }
  next();
});
```

**利点**: ユーザーがアクティブな間はログインを維持

**欠点**: 絶対タイムアウトと組み合わせる必要

---

## 5. 同時セッション管理

### 単一デバイス制限

**実装**:

```javascript
// ログイン時
app.post("/login", async (req, res) => {
  const user = await authenticate(req.body.username, req.body.password);

  if (user) {
    // 既存のすべてのセッションを無効化
    await db.sessions.deleteMany({ userId: user.id });

    // 新しいセッションを作成
    const newSession = await createSession(user.id);
    res.json({ sessionId: newSession.id });
  }
});
```

**使用ケース**:

- 高セキュリティ要件
- ライセンス制限（1ユーザー1接続）

---

### 複数デバイス許可

**実装**:

```javascript
// セッション一覧
app.get("/sessions", async (req, res) => {
  const sessions = await db.sessions.find({
    userId: req.session.userId,
    expiresAt: { $gt: new Date() },
  });

  res.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      deviceInfo: s.userAgent,
      ipAddress: s.ipAddress,
      lastActivity: s.lastActivity,
      current: s.id === req.sessionID,
    })),
  });
});

// 特定セッションを削除
app.delete("/sessions/:sessionId", async (req, res) => {
  await db.sessions.deleteOne({
    id: req.params.sessionId,
    userId: req.session.userId, // 所有権確認
  });
  res.json({ success: true });
});
```

**セキュリティ機能**:

- ユーザーが自分のアクティブセッションを確認可能
- 不審なセッションを即座に削除可能
- デバイス情報（User-Agent、IP）を記録

**判断基準**:

- [ ] ユーザーは自分のアクティブセッションを一覧できるか？
- [ ] 個別セッションを削除できるか？
- [ ] セッション情報（デバイス、IP、最終アクティビティ）が表示されるか？

---

## 6. セッションハイジャック対策

### 攻撃ベクター

1. **XSS攻撃**: JavaScriptでCookieを窃取
2. **ネットワーク盗聴**: HTTP通信の傍受
3. **セッション予測**: 弱いセッションID生成アルゴリズム
4. **フィッシング**: ユーザーを騙してセッションIDを取得

### 対策レイヤー

**Layer 1: セッションID保護**

- HttpOnly Cookie（XSS対策）
- Secure Cookie（HTTPS強制、盗聴対策）
- CSP RNG生成（予測対策）

**Layer 2: トランスポート暗号化**

- HTTPS必須（TLS 1.2以上）
- HSTS（HTTP Strict Transport Security）ヘッダー

**Layer 3: 異常検出**

```javascript
// IPアドレス変化検出
if (req.session.ipAddress && req.session.ipAddress !== req.ip) {
  logger.warn("Session hijacking suspected", {
    sessionId: req.sessionID,
    oldIp: req.session.ipAddress,
    newIp: req.ip,
  });

  // オプション: セッション無効化または再認証要求
  req.session.destroy();
}

// User-Agent変化検出
if (
  req.session.userAgent &&
  req.session.userAgent !== req.headers["user-agent"]
) {
  logger.warn("Session hijacking suspected (User-Agent changed)");
  // 対応...
}
```

**Layer 4: 定期的な再認証**

- センシティブ操作前に再認証（パスワード入力）
- 例: パスワード変更、支払い、管理者機能

**判断基準**:

- [ ] セッションCookieにHttpOnly、Secure、SameSite属性があるか？
- [ ] すべての通信でHTTPSが強制されているか？
- [ ] セッションIDは予測不可能か？
- [ ] IP/User-Agent変化を検出しているか？
- [ ] センシティブ操作前に再認証を要求しているか？

---

## 7. セッションストレージ比較

### メモリ内セッション

**利点**:

- 高速
- 実装が簡単

**欠点**:

- サーバー再起動でセッション消失
- 水平スケーリング不可（ロードバランサー問題）
- メモリ消費

**使用ケース**: 開発環境、単一サーバー、一時的なセッション

---

### Redisセッション

**利点**:

- 高速（メモリベース）
- 水平スケーリング可能
- TTLで自動削除
- 永続化オプション

**実装**:

```javascript
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  }),
);
```

**使用ケース**: 本番環境、マルチサーバー、高トラフィック

---

### データベースセッション

**利点**:

- 永続的
- クエリ可能（「すべてのアクティブセッション」等）
- バックアップ対象

**欠点**:

- Redisより遅い
- DB負荷増加

**使用ケース**: セッション監査が必要、永続性重視

---

## 8. セッションセキュリティパターン

### パターン1: Double Submit Cookie

**CSRF対策パターン**:

```javascript
// CSRFトークン生成
const csrfToken = crypto.randomBytes(32).toString("hex");
req.session.csrfToken = csrfToken;
res.cookie("XSRF-TOKEN", csrfToken); // クライアントが読み取り可能

// リクエスト検証
app.post("/api/*", (req, res, next) => {
  const headerToken = req.headers["x-csrf-token"];
  const sessionToken = req.session.csrfToken;

  if (headerToken !== sessionToken) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
});
```

---

### パターン2: Session Fingerprinting

**概要**: セッションを特定の環境にバインド

**実装**:

```javascript
// セッション作成時にフィンgerプリント生成
const createFingerprint = (req) => {
  return crypto
    .createHash("sha256")
    .update(req.headers["user-agent"] || "")
    .update(req.headers["accept-language"] || "")
    .digest("hex");
};

app.post("/login", (req, res) => {
  req.session.fingerprint = createFingerprint(req);
  req.session.userId = user.id;
});

// リクエストごとに検証
app.use((req, res, next) => {
  if (req.session.userId) {
    const currentFingerprint = createFingerprint(req);
    if (currentFingerprint !== req.session.fingerprint) {
      logger.warn("Session fingerprint mismatch");
      req.session.destroy();
      return res.status(401).json({ error: "Session invalid" });
    }
  }
  next();
});
```

**注意**: User-Agentは変化する可能性があるため、false positiveに注意

---

### パターン3: Remember Me

**実装**:

```javascript
// ログイン時
app.post("/login", async (req, res) => {
  const user = await authenticate(req.body.username, req.body.password);

  if (user && req.body.rememberMe) {
    // 長期トークン生成
    const rememberToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rememberToken, 10);

    // DBに保存
    await db.rememberTokens.create({
      userId: user.id,
      tokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000), // 30日
    });

    // Cookieに設定
    res.cookie("remember_token", rememberToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 3600 * 1000,
    });
  }

  // 通常のセッション作成
  req.session.userId = user.id;
  res.json({ success: true });
});

// 自動ログイン
app.use(async (req, res, next) => {
  if (!req.session.userId && req.cookies.remember_token) {
    const tokenHash = await bcrypt.hash(req.cookies.remember_token, 10);
    const record = await db.rememberTokens.findOne({ tokenHash });

    if (record && record.expiresAt > new Date()) {
      req.session.userId = record.userId;
    } else {
      res.clearCookie("remember_token");
    }
  }
  next();
});
```

**セキュリティ考慮事項**:

- [ ] Remember Meトークンはハッシュ化してDB保存されているか？
- [ ] トークンはランダム生成（CSPRNG）されているか？
- [ ] 有効期限は適切か（30日が一般的）？
- [ ] ユーザーがRemember Meトークンを削除できるか？

---

## 9. セッション終了パターン

### 明示的ログアウト

**実装**:

```javascript
app.post("/logout", (req, res) => {
  const sessionId = req.sessionID;

  // サーバーサイドでセッション削除
  req.session.destroy((err) => {
    if (err) {
      logger.error("Logout failed", { sessionId, error: err });
      return res.status(500).json({ error: "Logout failed" });
    }

    // Cookieをクリア
    res.clearCookie("sessionId");
    res.clearCookie("remember_token");

    res.json({ success: true });
  });
});
```

---

### 強制ログアウト（全デバイス）

**実装**:

```javascript
app.post("/logout-all-devices", async (req, res) => {
  const userId = req.session.userId;

  // すべてのセッションを削除
  await db.sessions.deleteMany({ userId });

  // Remember Meトークンも削除
  await db.rememberTokens.deleteMany({ userId });

  // 現在のセッション破棄
  req.session.destroy();

  res.json({ success: true, message: "Logged out from all devices" });
});
```

**トリガー**:

- パスワード変更時
- アカウント侵害検出時
- ユーザーが明示的に要求

---

### 自動セッションクリーンアップ

**Redis TTL**:

```javascript
// Redisは自動的に期限切れキーを削除
const RedisStore = require("connect-redis").default;
const store = new RedisStore({
  client: redisClient,
  ttl: 3600, // 1時間（秒単位）
});
```

**DB定期クリーンアップ**:

```javascript
// Cronジョブで期限切れセッションを削除
cron.schedule("0 * * * *", async () => {
  // 毎時
  const result = await db.sessions.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  logger.info("Expired sessions cleaned", { count: result.deletedCount });
});
```

**判断基準**:

- [ ] 期限切れセッションが自動削除されるか？
- [ ] DB肥大化を防ぐクリーンアップジョブがあるか？
- [ ] ログアウト時にサーバーサイドでセッションが削除されるか？

---

## 10. セッションセキュリティチェックリスト

### セッションID

- [ ] CSPRNG（crypto.randomBytes等）で生成
- [ ] 128ビット以上のエントロピー
- [ ] URLパラメータに含まれていない
- [ ] ログイン時に再生成される
- [ ] 権限変更時に再生成される

### Cookie設定

- [ ] HttpOnly属性が設定されている（XSS対策）
- [ ] Secure属性が設定されている（HTTPS強制）
- [ ] SameSite属性が設定されている（CSRF対策）
- [ ] 適切なPath属性（最小範囲）
- [ ] 適切なDomain属性（サブドメイン考慮）

### 有効期限

- [ ] 絶対タイムアウトが設定されている
- [ ] アイドルタイムアウトが設定されている
- [ ] センシティブ操作前に再認証を要求
- [ ] 有効期限はリスクに応じて適切

### ストレージ

- [ ] 本番環境ではRedis/DB使用（メモリ内は不可）
- [ ] 水平スケーリングに対応
- [ ] セッションデータは暗号化されている（該当する場合）
- [ ] 期限切れセッションの自動クリーンアップ

### ログアウト

- [ ] サーバーサイドでセッション削除
- [ ] Cookieをクリア
- [ ] Remember Meトークンも削除
- [ ] すべてのデバイスからログアウト機能がある

---

## 参考文献

- **OWASP Session Management Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- **RFC 6265**: HTTP State Management Mechanism（Cookie仕様）
- **NIST SP 800-63B**: Digital Identity Guidelines
