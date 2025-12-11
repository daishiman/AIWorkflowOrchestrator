# CSPRNG実装ガイド

## 暗号論的に安全な乱数生成器（CSPRNG）

CSPRNG（Cryptographically Secure Pseudo-Random Number Generator）は、暗号用途に適した予測不可能な乱数を生成します。

---

## Node.js実装

### crypto.randomBytes()

**推奨**: セキュリティトークン、セッションID、ソルト生成

```javascript
const crypto = require("crypto");

// バイナリ形式
const randomBytes = crypto.randomBytes(32); // 32バイト = 256ビット

// 16進数文字列
const randomHex = crypto.randomBytes(16).toString("hex");

// Base64エンコード
const randomBase64 = crypto.randomBytes(24).toString("base64");

// URL-safe Base64
const randomUrlSafe = crypto.randomBytes(24).toString("base64url");
```

### crypto.randomUUID()

**用途**: UUID v4生成

```javascript
const uuid = crypto.randomUUID();
// 例: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
```

### crypto.randomInt()

**用途**: 整数の乱数生成

```javascript
// 0 ~ 99
const randomInt = crypto.randomInt(100);

// 10 ~ 20
const randomInRange = crypto.randomInt(10, 21);
```

---

## Python実装

### secrets モジュール

**推奨**: Python 3.6以降

```python
import secrets

# バイト列
random_bytes = secrets.token_bytes(32)

# 16進数文字列
random_hex = secrets.token_hex(32)  # 32バイト = 64文字

# URL-safe文字列
random_urlsafe = secrets.token_urlsafe(32)

# 整数
random_int = secrets.randbelow(100)  # 0 ~ 99

# セキュアな選択
import string
alphabet = string.ascii_letters + string.digits
password = ''.join(secrets.choice(alphabet) for i in range(20))
```

### os.urandom()

**用途**: より低レベルなインターフェース

```python
import os

random_bytes = os.urandom(32)
```

---

## ブラウザ（JavaScript）実装

### crypto.getRandomValues()

**Web Crypto API**:

```javascript
// Uint8Array
const array = new Uint8Array(32);
crypto.getRandomValues(array);

// 16進数文字列に変換
const hex = Array.from(array)
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");

// Base64に変換
const base64 = btoa(String.fromCharCode.apply(null, array));
```

### crypto.randomUUID()

**用途**: UUID v4生成（モダンブラウザ）

```javascript
const uuid = crypto.randomUUID();
```

---

## 使用ケース別推奨

### セッションID生成

```javascript
// Node.js
const sessionId = crypto.randomBytes(32).toString('hex');  // 64文字

// Python
import secrets
session_id = secrets.token_hex(32)
```

**要件**: 256ビット以上のエントロピー

---

### CSRF トークン生成

```javascript
// Node.js
const csrfToken = crypto.randomBytes(16).toString("base64");

// Python
csrf_token = secrets.token_urlsafe(16);
```

**要件**: 128ビット以上

---

### API キー生成

```javascript
// Node.js
const apiKey = 'sk-' + crypto.randomBytes(32).toString('base64url');

// Python
import secrets
api_key = f"sk-{secrets.token_urlsafe(32)}"
```

**要件**: 256ビット以上、プレフィックス推奨

---

### パスワードソルト生成

```javascript
// Node.js (bcrypt自動生成)
const bcrypt = require("bcrypt");
const hash = await bcrypt.hash(password, 12); // ソルト自動生成

// 手動ソルト生成（PBKDF2等）
const salt = crypto.randomBytes(16);
```

**要件**: 128ビット以上

---

### OAuth state/nonce生成

```javascript
// Node.js
const state = crypto.randomBytes(16).toString("hex");
const nonce = crypto.randomBytes(16).toString("hex");

// Python
state = secrets.token_hex(16);
nonce = secrets.token_hex(16);
```

**要件**: 128ビット以上

---

## 危険な実装（使用禁止）

### ❌ Math.random()

**問題**: 予測可能、暗号用途には不適

```javascript
// ❌ 絶対に使用禁止
const token = Math.random().toString(36).substring(2);
const sessionId = Date.now() + Math.random();
```

**理由**: Mersenne Twisterアルゴリズム（予測可能）

---

### ❌ Date.now()ベース

**問題**: 予測可能

```javascript
// ❌ 危険
const token = Date.now().toString(36);
const id = new Date().getTime();
```

---

### ❌ ランダムではないシード

**問題**: 固定シードで同じ乱数列

```python
# ❌ 危険
import random
random.seed(12345)  # 固定シード
value = random.random()
```

---

## テストとデバッグ

### エントロピー検証

```javascript
// 生成された値のユニーク性テスト
const seen = new Set();
for (let i = 0; i < 100000; i++) {
  const value = crypto.randomBytes(16).toString("hex");
  if (seen.has(value)) {
    console.error("Collision detected!");
    break;
  }
  seen.add(value);
}
console.log("100,000 unique values generated");
```

### パフォーマンス測定

```javascript
const iterations = 10000;
const start = Date.now();

for (let i = 0; i < iterations; i++) {
  crypto.randomBytes(32);
}

const duration = Date.now() - start;
console.log(`${iterations} iterations: ${duration}ms`);
console.log(`Per operation: ${(duration / iterations).toFixed(3)}ms`);
```

---

## 参考文献

- **NIST SP 800-90A**: Recommendation for Random Number Generation
- **Node.js crypto documentation**: https://nodejs.org/api/crypto.html
- **Python secrets documentation**: https://docs.python.org/3/library/secrets.html
- **Web Crypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
