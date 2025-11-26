---
name: cryptographic-practices
description: |
  暗号化アルゴリズム、セキュアランダム値生成、鍵管理のベストプラクティスを提供します。
  ブルース・シュナイアーの『Applied Cryptography』と現代の暗号学標準に基づき、
  安全な暗号化実装、弱い暗号化の検出、予測可能な乱数生成の排除、
  鍵ライフサイクル管理の評価基準を提供します。

  📚 このスキルの使用タイミング:
  - 暗号化アルゴリズムの選択と評価時
  - パスワードハッシング実装のレビュー時
  - ランダム値生成（トークン、ノンス等）の検証時
  - データ暗号化（at-rest、in-transit）の設計時
  - 暗号鍵管理とローテーション計画時
  - 弱い暗号化（MD5、SHA1等）の検出時
  - デジタル署名実装の評価時

  🔍 評価対象:
  - ハッシュアルゴリズム（MD5/SHA1排除、SHA-256以上推奨）
  - 暗号化アルゴリズム（AES-256-GCM推奨、DES/RC4禁止）
  - 乱数生成器（CSPRNG必須、Math.random()禁止）
  - 鍵サイズと強度（RSA 2048ビット以上、AES 256ビット）
  - 鍵保存と管理（KMS、環境変数、ハードコード排除）

  Use this skill when implementing encryption, validating cryptographic code,
  or auditing random number generation security.
version: 1.0.0
related_skills:
  - .claude/skills/authentication-authorization-security/SKILL.md
  - .claude/skills/input-sanitization/SKILL.md
  - .claude/skills/owasp-top-10/SKILL.md
---

# Cryptographic Practices

## スキル概要

このスキルは、暗号化とランダム値生成のセキュリティ評価に特化した専門知識を提供します。

**専門分野**:
- ハッシュアルゴリズムの評価と選択
- 対称鍵・非対称鍵暗号化
- 暗号論的に安全な乱数生成（CSPRNG）
- デジタル署名とメッセージ認証コード（MAC）
- 鍵管理とライフサイクル

**理論的基盤**:
- ブルース・シュナイアー『Applied Cryptography』: 暗号アルゴリズムの基礎
- NIST暗号標準: FIPS 140-2、SP 800シリーズ
- OWASP Cryptographic Storage Cheat Sheet

---

## 1. ハッシュアルゴリズムの評価

### 安全なハッシュアルゴリズム

| アルゴリズム | 用途 | セキュリティ | ステータス |
|------------|------|-----------|----------|
| **SHA-256** | 一般ハッシング | 高 | ✅ 推奨 |
| **SHA-384** | より高いセキュリティ | 非常に高 | ✅ 推奨 |
| **SHA-512** | 最高レベル | 最高 | ✅ 推奨 |
| **SHA-3** | 最新標準 | 非常に高 | ✅ 推奨 |
| **BLAKE2** | 高速・安全 | 高 | ✅ 推奨 |
| **bcrypt** | パスワード専用 | 高 | ✅ 推奨 |
| **argon2** | パスワード専用 | 最高 | ✅ 推奨 |

### 非推奨・危険なアルゴリズム

| アルゴリズム | 問題点 | ステータス |
|------------|-------|----------|
| **MD5** | 衝突攻撃可能、高速すぎ | ❌ 禁止 |
| **SHA-1** | 衝突攻撃実証済み（2017年） | ❌ 禁止 |
| **MD4** | 深刻な脆弱性 | ❌ 禁止 |
| **CRC32** | 暗号学的に安全でない | ❌ 禁止 |

**判断基準**:
- [ ] MD5、SHA-1が使用されていないか？
- [ ] パスワードハッシングにbcrypt/argon2を使用しているか？
- [ ] データ整合性検証にSHA-256以上を使用しているか？
- [ ] ファイルハッシュにSHA-256またはBLAKE2を使用しているか？

---

## 2. 対称鍵暗号化

### 推奨アルゴリズム

**AES（Advanced Encryption Standard）**:
```
✅ 推奨:
  - AES-256-GCM（認証付き暗号、AEAD）
  - AES-256-CBC（HMACと組み合わせ）

⚠️ 許容:
  - AES-192-GCM
  - AES-128-GCM（128ビットでも十分強固）

❌ 非推奨:
  - AES-ECB（パターン漏洩）
  - DES、3DES（鍵長不足）
  - RC4（複数の脆弱性）
```

**モード選択**:
- **GCM（Galois/Counter Mode）**: 認証付き暗号、データ改ざん検出
- **CBC（Cipher Block Chaining）**: HMAC-SHA256と組み合わせて使用
- **ECB（Electronic Codebook）**: ❌ 絶対に使用しない（パターンが見える）

**実装例（Node.js）**:
```javascript
const crypto = require('crypto');

// AES-256-GCM 暗号化
function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(16);  // 初期化ベクトル
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();  // 認証タグ

  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  };
}

// 復号化
function decrypt(encryptedData, key) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**判断基準**:
- [ ] AES-GCMまたはAES-CBC+HMACを使用しているか？
- [ ] AES-ECBは使用されていないか？
- [ ] DES、3DES、RC4は使用されていないか？
- [ ] IVは毎回ランダム生成されているか？
- [ ] 認証タグ（GCM）またはHMAC（CBC）で改ざん検出しているか？

---

## 3. 非対称鍵暗号化

### RSA

**鍵サイズ**:
```
✅ 推奨:
  - 4096ビット（長期使用）
  - 2048ビット（標準）

⚠️ 最小:
  - 2048ビット（これ未満は危険）

❌ 禁止:
  - 1024ビット以下
```

**パディングスキーム**:
- **OAEP（RSA-OAEP）**: ✅ 推奨（暗号化用）
- **PSS（RSA-PSS）**: ✅ 推奨（署名用）
- **PKCS#1 v1.5**: ⚠️ 古い、脆弱性あり（避ける）

**実装例**:
```javascript
const crypto = require('crypto');
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// 暗号化（OAEP）
const encrypted = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  Buffer.from(plaintext)
);

// 復号化
const decrypted = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  encrypted
);
```

---

### 楕円曲線暗号（ECC）

**推奨曲線**:
- **P-256（secp256r1）**: NIST標準、広く互換性
- **P-384（secp384r1）**: より高いセキュリティ
- **Ed25519**: 高速、EdDSA署名に最適
- **Curve25519**: 鍵交換（ECDH）に最適

**利点**:
- RSAより短い鍵長で同等セキュリティ
- 高速
- モバイルデバイスに最適

**判断基準**:
- [ ] RSA鍵は2048ビット以上か？
- [ ] OAEP/PSSパディングを使用しているか？
- [ ] ECC使用時は推奨曲線（P-256以上、Ed25519、Curve25519）か？

---

## 4. 暗号論的に安全な乱数生成（CSPRNG）

### 安全な乱数生成器

**Node.js**:
```javascript
// ✅ 推奨
const crypto = require('crypto');
const randomBytes = crypto.randomBytes(32);  // 32バイト = 256ビット
const randomHex = crypto.randomBytes(16).toString('hex');
const randomUuid = crypto.randomUUID();  // UUID v4

// ❌ 危険
const random = Math.random();  // 予測可能、暗号用途には不適
```

**Python**:
```python
# ✅ 推奨
import secrets
random_token = secrets.token_hex(32)  # 32バイト
random_url_safe = secrets.token_urlsafe(32)

# ❌ 危険
import random
random_value = random.random()  # 予測可能
```

**ブラウザ（JavaScript）**:
```javascript
// ✅ 推奨
const array = new Uint8Array(32);
crypto.getRandomValues(array);

// ❌ 危険
const random = Math.random();
```

**判断基準**:
- [ ] トークン、ノンス生成にCSPRNGを使用しているか？
- [ ] セッションID生成にCSPRNGを使用しているか？
- [ ] Math.random()は暗号用途に使用されていないか？
- [ ] ソルト生成にCSPRNGを使用しているか？

---

## 5. 用途別の暗号化要件

### パスワード保存

**アルゴリズム**:
```
1位: argon2id（メモリハード、PHC推奨）
2位: bcrypt（広く採用、成熟）
3位: scrypt（メモリハード）
```

**禁止**:
- MD5、SHA-1、SHA-256（高速すぎ）
- 平文保存
- 可逆暗号化（AES等）

---

### データベース暗号化（Data-at-Rest）

**フィールドレベル暗号化**:
```javascript
// ✅ AES-256-GCM
const crypto = require('crypto');

function encryptField(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return JSON.stringify({ iv: iv.toString('base64'), data: encrypted, authTag });
}
```

**対象フィールド**:
- 個人識別情報（PII）
- クレジットカード番号
- 社会保障番号
- 医療情報

**判断基準**:
- [ ] センシティブフィールドは暗号化されているか？
- [ ] AES-256以上を使用しているか？
- [ ] IVは毎回ランダム生成されているか？
- [ ] 鍵は安全に管理されているか（KMS、環境変数）？

---

### 通信暗号化（Data-in-Transit）

**TLS/SSL**:
```
✅ 推奨:
  - TLS 1.3（最新、最も安全）
  - TLS 1.2（広く互換性）

❌ 禁止:
  - SSL 2.0、SSL 3.0（深刻な脆弱性）
  - TLS 1.0、TLS 1.1（非推奨）
```

**暗号スイート**:
- ECDHE + AES-GCM: 前方秘匿性とAEAD
- RSA鍵交換は避ける（前方秘匿性なし）

**判断基準**:
- [ ] すべての通信でHTTPSを使用しているか？
- [ ] TLS 1.2以上を使用しているか？
- [ ] 前方秘匿性のある暗号スイート（ECDHE）を使用しているか？
- [ ] 証明書検証が有効か（NODE_TLS_REJECT_UNAUTHORIZED=1）？

---

## 6. デジタル署名

### アルゴリズム選択

**RSA署名**:
- **RSA-PSS**: ✅ 推奨（Probabilistic Signature Scheme）
- **RSASSA-PKCS1-v1_5**: ⚠️ 古いが互換性高い
- 鍵サイズ: 2048ビット以上

**ECDSA（楕円曲線署名）**:
- **P-256、P-384**: ✅ 推奨
- **Ed25519**: ✅ 推奨（高速、決定的）

**実装例**:
```javascript
const crypto = require('crypto');

// RSA署名
const sign = crypto.createSign('RSA-SHA256');
sign.update(data);
const signature = sign.sign(privateKey, 'hex');

// 検証
const verify = crypto.createVerify('RSA-SHA256');
verify.update(data);
const isValid = verify.verify(publicKey, signature, 'hex');
```

**判断基準**:
- [ ] デジタル署名にSHA-256以上のハッシュを使用しているか？
- [ ] RSA鍵サイズは2048ビット以上か？
- [ ] 署名検証が必ず実行されているか？

---

## 7. メッセージ認証コード（MAC）

### HMAC

**アルゴリズム**:
```
✅ 推奨:
  - HMAC-SHA256
  - HMAC-SHA384
  - HMAC-SHA512

❌ 禁止:
  - HMAC-MD5
  - HMAC-SHA1
```

**実装例**:
```javascript
const crypto = require('crypto');

// HMAC生成
const hmac = crypto.createHmac('sha256', secretKey);
hmac.update(message);
const tag = hmac.digest('hex');

// 検証（タイミング攻撃対策）
function verifyHmac(message, providedTag, secretKey) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  const expectedTag = hmac.digest('hex');

  // タイミングセーフな比較
  return crypto.timingSafeEqual(
    Buffer.from(providedTag, 'hex'),
    Buffer.from(expectedTag, 'hex')
  );
}
```

**使用ケース**:
- API署名（AWS Signature等）
- Cookie改ざん検出
- Webhookペイロード検証

**判断基準**:
- [ ] HMACにSHA-256以上を使用しているか？
- [ ] HMAC検証はタイミングセーフな比較（crypto.timingSafeEqual）を使用しているか？
- [ ] 鍵は十分な長さ（32バイト以上）か？

---

## 8. 初期化ベクトル（IV）とノンス

### IV要件

**生成**:
```javascript
// ✅ 毎回ランダム生成
const iv = crypto.randomBytes(16);  // AES: 16バイト

// ❌ 固定IV（危険）
const iv = Buffer.from('1234567890123456');

// ❌ 予測可能（危険）
const iv = Buffer.from(Date.now().toString().padEnd(16, '0'));
```

**保存**: IVは暗号文と一緒に保存（秘密にする必要なし）

**判断基準**:
- [ ] IVは毎回ランダム生成されているか（CSPRNG使用）？
- [ ] 同じ鍵で同じIVを再利用していないか？
- [ ] IVは適切な長さか（AES: 16バイト、GCM: 12バイト推奨）？

---

### ノンス（Nonce: Number used Once）

**要件**:
- 一度だけ使用
- 予測不可能
- リプレイ攻撃対策

**実装例**:
```javascript
// OAuth/OpenID Connect nonce
const nonce = crypto.randomBytes(16).toString('hex');

// リクエスト時に含める
const authUrl = `${authEndpoint}?nonce=${nonce}&...`;

// ID Token検証時に確認
if (idToken.nonce !== storedNonce) {
  throw new Error('Nonce mismatch (replay attack)');
}
```

**判断基準**:
- [ ] ノンスはCSPRNGで生成されているか？
- [ ] ノンスは1回限りの使用に制限されているか？
- [ ] 使用済みノンスが記録されているか（リプレイ検出）？

---

## 9. 鍵管理

### 鍵生成

**強度要件**:
```
対称鍵:
  - AES-256: 32バイト（256ビット）
  - AES-128: 16バイト（128ビット）

非対称鍵:
  - RSA: 2048ビット以上（推奨: 4096ビット）
  - ECC: P-256以上、Ed25519
```

**生成方法**:
```javascript
// ✅ 安全な鍵生成
const key = crypto.randomBytes(32);  // AES-256

// RSA鍵ペア生成
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096
});
```

---

### 鍵保存

**推奨方法**:
```
1. KMS（Key Management Service）: AWS KMS、Google Cloud KMS
2. ハードウェアセキュリティモジュール（HSM）
3. 環境変数（ローテーション計画あり）
4. 暗号化された設定ファイル
```

**禁止**:
```
❌ ソースコードにハードコード
❌ Gitリポジトリにコミット
❌ ログファイルに出力
❌ 平文ファイルに保存
```

**判断基準**:
- [ ] 鍵はソースコードにハードコードされていないか？
- [ ] 鍵は環境変数またはKMSで管理されているか？
- [ ] .gitignoreに鍵ファイルが含まれているか？
- [ ] 鍵がログに出力されていないか？

---

### 鍵ローテーション

**計画**:
- 定期的なローテーション（3-6ヶ月）
- 鍵漏洩時の緊急ローテーション
- 移行期間（新旧鍵の並行使用）

**実装パターン**:
```javascript
// 鍵バージョニング
const keys = {
  'key-2024-01': process.env.KEY_2024_01,
  'key-2024-07': process.env.KEY_2024_07  // 新しい鍵
};

// 暗号化（最新鍵使用）
function encrypt(data) {
  const currentKeyId = 'key-2024-07';
  const encrypted = encryptWithKey(data, keys[currentKeyId]);
  return { keyId: currentKeyId, data: encrypted };
}

// 復号化（古い鍵にも対応）
function decrypt(encryptedData) {
  const key = keys[encryptedData.keyId];
  if (!key) {
    throw new Error('Unknown key ID');
  }
  return decryptWithKey(encryptedData.data, key);
}
```

**判断基準**:
- [ ] 鍵ローテーション計画が文書化されているか？
- [ ] 鍵バージョニングが実装されているか？
- [ ] 古い鍵で暗号化されたデータも復号可能か？

---

## 10. 暗号化ライブラリの選択

### 推奨ライブラリ

**Node.js**:
- `crypto`（組み込み、OpenSSLベース）: ✅ 推奨
- `bcrypt`（パスワードハッシング）: ✅ 推奨
- `argon2`（パスワードハッシング）: ✅ 推奨
- `tweetnacl`（軽量、高速）: ✅ 許容

**避けるべき**:
- `crypto-js`（純粋JS実装、遅い）: ⚠️ 避ける
- 独自実装: ❌ 絶対に避ける

**Python**:
- `cryptography`（推奨、PyCAベース）: ✅ 推奨
- `hashlib`（組み込み）: ✅ 推奨
- `secrets`（CSPRNG）: ✅ 推奨

**判断基準**:
- [ ] 信頼できる暗号ライブラリを使用しているか？
- [ ] ライブラリは最新版か（脆弱性修正）？
- [ ] 独自の暗号実装を避けているか？

---

## 11. よくある暗号化の間違い

### 間違い1: ECBモード使用

**問題**: 同じ平文ブロックは同じ暗号文ブロックになる

```javascript
// ❌ 危険
const cipher = crypto.createCipheriv('aes-256-ecb', key, null);

// ✅ 安全
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
```

---

### 間違い2: 固定IV使用

**問題**: IVの再利用で暗号文から情報漏洩

```javascript
// ❌ 危険
const fixedIv = Buffer.from('1234567890123456');

// ✅ 安全
const iv = crypto.randomBytes(16);
```

---

### 間違い3: Encrypt-then-MAC順序違反

**正しい順序**: Encrypt-then-MAC（暗号化→認証）

```javascript
// ✅ 推奨（AES-GCMは自動）
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
// GCMモードは自動的に認証タグを生成

// ⚠️ CBCモードの場合、手動でHMAC
const ciphertext = encryptCBC(plaintext, key, iv);
const hmac = crypto.createHmac('sha256', macKey).update(ciphertext).digest();
```

---

### 間違い4: 弱い鍵導出

**問題**: パスワードから直接鍵を生成

```javascript
// ❌ 危険
const key = crypto.createHash('md5').update(password).digest();

// ✅ 安全（PBKDF2）
const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

// ✅ より安全（argon2）
const key = await argon2.hash(password, { salt, hashLength: 32 });
```

---

### 間違い5: Math.random()の暗号用途使用

**問題**: 予測可能、セキュリティ用途には不適

```javascript
// ❌ 危険
const token = Math.random().toString(36).substring(2);

// ✅ 安全
const token = crypto.randomBytes(32).toString('hex');
```

---

## 12. 暗号化実装チェックリスト

### ハッシング

- [ ] パスワードハッシングにbcrypt/argon2を使用
- [ ] データ整合性検証にSHA-256以上を使用
- [ ] MD5、SHA-1を使用していない
- [ ] ソルトは各エントリでユニーク

### 対称鍵暗号化

- [ ] AES-256-GCMまたはAES-256-CBC+HMACを使用
- [ ] AES-ECB、DES、3DES、RC4を使用していない
- [ ] IVは毎回ランダム生成
- [ ] 認証タグ（GCM）またはHMAC（CBC）で改ざん検出

### 非対称鍵暗号化

- [ ] RSA鍵は2048ビット以上
- [ ] OAEPパディング（暗号化）、PSSパディング（署名）を使用
- [ ] ECC使用時は推奨曲線（P-256以上、Ed25519）

### 乱数生成

- [ ] トークン、セッションID生成にCSPRNGを使用
- [ ] Math.random()を暗号用途に使用していない
- [ ] ノンス、IVは毎回ランダム生成

### 鍵管理

- [ ] 鍵はソースコードにハードコードされていない
- [ ] 鍵は環境変数またはKMSで管理
- [ ] 鍵ローテーション計画がある
- [ ] 秘密鍵がGitにコミットされていない

---

## リソース・スクリプト・テンプレート

### リソース
- `resources/algorithm-strength-guide.md`: アルゴリズム強度比較
- `resources/csprng-implementation.md`: CSPRNG実装詳細
- `resources/key-derivation-functions.md`: 鍵導出関数（PBKDF2、argon2）
- `resources/aead-ciphers.md`: 認証付き暗号（GCM、CCM）詳細

### スクリプト
- `scripts/detect-weak-crypto.mjs`: 弱い暗号化の検出
- `scripts/analyze-random-generation.mjs`: 乱数生成分析
- `scripts/check-key-management.mjs`: 鍵管理チェック

### テンプレート
- `templates/encryption-config-template.json`: 暗号化設定テンプレート
- `templates/crypto-audit-checklist.md`: 暗号監査チェックリスト

---

## 関連スキル

- `.claude/skills/authentication-authorization-security/SKILL.md`: JWT署名、トークンセキュリティ
- `.claude/skills/owasp-top-10/SKILL.md`: A02（暗号化の失敗）
- `.claude/skills/input-sanitization/SKILL.md`: ランダムトークン生成

---

## 変更履歴

### v1.0.0 (2025-11-26)
- 初版リリース
- @sec-auditorエージェントから暗号化関連知識を抽出
- ハッシュ、暗号化、乱数生成、デジタル署名、鍵管理の評価基準を定義
