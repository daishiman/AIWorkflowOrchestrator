# パスワードハッシングガイド

## 推奨アルゴリズム詳細

### bcrypt

**特徴**:
- Blowfish暗号に基づくアルゴリズム
- 計算コストを調整可能（work factor/cost factor）
- レインボーテーブル攻撃への耐性（自動ソルト付加）
- 広く採用され、成熟したライブラリが存在

**Cost Factorの選択**:
```
| Cost | 時間（概算） | 推奨用途 |
|------|-------------|---------|
| 10   | ~100ms     | 一般的なWebアプリケーション |
| 12   | ~250ms     | 高セキュリティ要件 |
| 14   | ~1s        | 極めて高いセキュリティ（管理者アカウント等） |
```

**実装例（Node.js）**:
```javascript
const bcrypt = require('bcrypt');

// ハッシュ化
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);

// 検証
const isValid = await bcrypt.compare(password, hash);
```

**セキュリティ考慮事項**:
- Cost factorは定期的に見直し（ハードウェア性能向上に対応）
- 10未満は脆弱、12が標準、14以上は慎重に（UX影響）

---

### argon2

**特徴**:
- Password Hashing Competition（PHC）優勝アルゴリズム
- メモリハード関数（GPU/ASIC攻撃への耐性が高い）
- 3種類のバリアント: argon2d, argon2i, argon2id（推奨）
- 最新の暗号学的研究に基づく

**パラメータ**:
- `memoryCost`: メモリ使用量（KB）
- `timeCost`: イテレーション回数
- `parallelism`: 並列度

**推奨設定**:
```javascript
const argon2 = require('argon2');

const options = {
  type: argon2.argon2id,  // ハイブリッド型（推奨）
  memoryCost: 65536,      // 64 MB
  timeCost: 3,            // イテレーション
  parallelism: 4          // 4並列
};

// ハッシュ化
const hash = await argon2.hash(password, options);

// 検証
const isValid = await argon2.verify(hash, password);
```

**選択理由**:
- bcryptよりもブルートフォース攻撃への耐性が高い
- メモリハード特性によりGPU攻撃が困難
- 2015年以降の新規システムでの第一選択

---

### scrypt

**特徴**:
- メモリハード関数
- bcryptよりも設定可能なパラメータが多い
- Tarsnap等で実戦使用されている

**パラメータ**:
- `N`: CPU/メモリコスト（2のべき乗）
- `r`: ブロックサイズ
- `p`: 並列化パラメータ

**推奨設定**:
```javascript
const crypto = require('crypto');

// ハッシュ化
crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
  // derivedKeyを保存
});
```

---

## 非推奨アルゴリズム

### MD5

**問題点**:
- 衝突攻撃が可能（異なる入力で同じハッシュ）
- 高速すぎる（ブルートフォースが容易）
- レインボーテーブルが広く利用可能

**使用禁止**: パスワードハッシング、デジタル署名には絶対に使用しない

---

### SHA-1

**問題点**:
- 2017年にGoogle/CWIが実用的な衝突攻撃を実証
- MD5と同様に高速すぎる
- パスワードハッシングには不適

**使用禁止**: パスワードハッシング、証明書署名には使用しない

---

### 平文保存

**リスク**:
- データベース漏洩時に全パスワードが露出
- 内部犯行のリスク
- コンプライアンス違反（GDPR、PCI DSS等）

**絶対に禁止**

---

## ソルトの重要性

### ソルトとは

- パスワードに追加されるランダムな値
- 同じパスワードでも異なるハッシュ値を生成
- レインボーテーブル攻撃を無効化

### ソルトのベストプラクティス

**生成**:
- 暗号論的に安全な乱数生成器（CSPRNG）を使用
- ユーザーごとにユニークなソルト
- 最低16バイト（推奨: 32バイト）

**保存**:
- ソルトはハッシュと一緒に保存（秘密にする必要なし）
- 一般的なフォーマット: `$algorithm$cost$salt$hash`

**誤った実装**:
```javascript
// ❌ グローバルソルト（全ユーザー共通）
const globalSalt = "my_secret_salt";
const hash = bcrypt.hash(password + globalSalt, 10);

// ✅ ユーザーごとのソルト（bcryptが自動生成）
const hash = bcrypt.hash(password, 12);
```

---

## パスワードポリシーの設計

### 強度要件

**最小要件**:
- 長さ: 8文字以上
- 複雑性: 大文字、小文字、数字、記号を含む
- 辞書チェック: 一般的なパスワードを拒否

**推奨要件**:
- 長さ: 12文字以上（パスフレーズ推奨）
- エントロピー: 最低50ビット
- 過去のパスワード: 過去3-5個の再利用禁止

### ブラックリスト

**含めるべき項目**:
1. Top 10,000 common passwords（"password", "123456"等）
2. ユーザー名、メールアドレスの一部
3. サービス名、会社名
4. 連続文字（"aaaa", "1234"）
5. キーボードパターン（"qwerty", "asdf"）

**判断基準**:
- [ ] パスワード強度チェックが実装されているか？
- [ ] 一般的なパスワードがブラックリストで拒否されるか？
- [ ] ユーザーにパスワード強度のフィードバックが提供されるか？

---

## パスワードリセットのセキュリティ

### リセットトークン

**要件**:
- 予測不可能: 暗号論的に安全な乱数
- 一時的: 短い有効期限（15分-1時間）
- 1回限り: 使用後に無効化
- ユーザーバインディング: 特定ユーザーにのみ有効

**実装パターン**:
```javascript
// トークン生成
const resetToken = crypto.randomBytes(32).toString('hex');
const tokenHash = await bcrypt.hash(resetToken, 10);
const expiresAt = new Date(Date.now() + 3600000); // 1時間後

// DB保存
await db.users.update({
  id: userId,
  resetTokenHash: tokenHash,
  resetTokenExpiresAt: expiresAt
});

// メール送信
sendEmail(user.email, `https://example.com/reset?token=${resetToken}`);
```

### セキュリティ考慮事項

- [ ] リセットトークンはDBにハッシュ化して保存されているか？
- [ ] トークンの有効期限は適切か（1時間以内推奨）？
- [ ] トークン使用後に無効化されるか？
- [ ] リセット要求にレート制限があるか？
- [ ] リセット成功時に既存セッションが無効化されるか？

---

## 参考文献

- **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **Password Storage Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **NIST SP 800-63B**: Digital Identity Guidelines（Authentication and Lifecycle Management）
- **RFC 6238**: TOTP（Time-Based One-Time Password Algorithm）
