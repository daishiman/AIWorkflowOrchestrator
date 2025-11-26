---
name: encryption-key-lifecycle
description: |
  暗号化と鍵ライフサイクル管理スキル。暗号化アルゴリズム選定、
  鍵生成、保管、ローテーション、廃棄の全フェーズを網羅します。
  保存時・転送時・使用時の暗号化戦略を提供します。

  使用タイミング:
  - 暗号化方式を選択する時
  - 鍵生成・保管方法を設計する時
  - Secret Rotationプロセスを実装する時
  - 鍵の廃棄・無効化手順を定義する時
  - データ保護要件を評価する時

  Use when selecting encryption algorithms, designing key management,
  implementing rotation processes, or establishing data protection.
version: 1.0.0
---

# Encryption & Key Lifecycle Management

## 概要

機密情報の保護には、適切な暗号化技術と鍵の全ライフサイクル管理が不可欠です。
このスキルは、保存時、転送時、使用時の各段階での暗号化方式選択と、
鍵の生成から廃棄までの完全なライフサイクル管理を提供します。

## 暗号化レベルの選択

### レベル1: 保存時暗号化（Encryption at Rest）

**対象**: ディスク、データベース、バックアップ

**推奨アルゴリズム**:
- **AES-256-GCM**: 標準的な対称鍵暗号化（高速、安全）
- **ChaCha20-Poly1305**: モバイル・組み込みデバイス向け

**基本実装**:
```typescript
import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  encrypt(plaintext: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex') };
  }
}
```

**詳細**: `resources/symmetric-encryption-guide.md`

### レベル2: 転送時暗号化（Encryption in Transit）

**必須要件**:
- **TLS 1.3**: すべてのHTTP通信（HTTPS）
- **SSH**: Git操作、サーバーアクセス

**実装**:
```typescript
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  httpsAgent: new https.Agent({
    rejectUnauthorized: true,
    minVersion: 'TLSv1.3',
  }),
});
```

### レベル3: 使用時暗号化（Encryption in Use）

**手法**: Secret使用後の即座メモリクリア

**実装**:
```typescript
class SecureString {
  private buffer: Buffer;

  use<T>(callback: (secret: string) => T): T {
    try {
      return callback(this.buffer.toString('utf8'));
    } finally {
      this.buffer.fill(0); // ゼロクリア
    }
  }
}
```

## 鍵ライフサイクル管理

### Phase 1: 鍵生成（Generation）

**要件**:
- 暗号学的に安全な乱数生成器（CSRNG）使用
- 十分な鍵長（AES-256、RSA-4096）

**実装**:
```typescript
// 対称鍵生成
function generateSymmetricKey(): Buffer {
  return crypto.randomBytes(32); // 256 bits
}

// 非対称鍵ペア生成
function generateAsymmetricKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
  });
}
```

**詳細**: `resources/key-generation-guide.md`

### Phase 2: 鍵保管（Storage）

**保管方式選択**:

| 鍵タイプ | 重要度 | 推奨保管方式 |
|---------|-------|------------|
| マスター暗号化キー | Critical | HSM, KMS |
| データベースパスワード | Critical | Secrets Manager |
| APIキー | High | Secrets Manager |
| セッションSecret | High | 環境変数 |

**詳細**: `resources/key-storage-strategies.md`

### Phase 3: 鍵使用（Usage）

**原則**:
- 最小権限でのみアクセス
- すべてのアクセスをログ記録
- 使用後のメモリクリア

### Phase 4: 鍵ローテーション（Rotation）

**ゼロダウンタイムRotation（5段階）**:
1. 新鍵生成
2. 両方の鍵を有効化（新旧並存）
3. アプリケーションを新鍵に移行
4. 旧鍵を無効化（読み取り専用）
5. 監視期間後、旧鍵を完全削除

**詳細**: `resources/rotation-procedures.md`

### Phase 5: 鍵廃棄（Disposal）

**要件**:
- セキュアな上書き・ゼロ化
- ストレージとバックアップから完全削除
- 廃棄の監査証跡

**実装**:
```typescript
async function disposeKey(key: Buffer): Promise<void> {
  // 複数回上書き
  for (let i = 0; i < 3; i++) {
    key.fill(0);
    key.fill(255);
  }
  key.fill(0); // 最終ゼロクリア
}
```

## 暗号化アルゴリズム選択

### 対称鍵暗号

| アルゴリズム | 鍵長 | 用途 | 推奨度 |
|------------|-----|------|-------|
| AES-256-GCM | 256-bit | データ暗号化 | ⭐⭐⭐⭐⭐ |
| ChaCha20-Poly1305 | 256-bit | モバイル・IoT | ⭐⭐⭐⭐ |

**推奨**: AES-256-GCM

### 非対称鍵暗号

| アルゴリズム | 鍵長 | 用途 | 推奨度 |
|------------|-----|------|-------|
| RSA-4096 | 4096-bit | 鍵交換、署名 | ⭐⭐⭐⭐ |
| Ed25519 | 256-bit | SSH、署名 | ⭐⭐⭐⭐⭐ |

**推奨**: Ed25519

### ハッシュ関数

| アルゴリズム | 用途 | 推奨度 |
|------------|------|-------|
| SHA-256 | 汎用ハッシュ | ⭐⭐⭐⭐⭐ |
| Argon2 | パスワードハッシュ | ⭐⭐⭐⭐⭐ |

## Rotationスケジューリング

### 頻度の決定

| Secret重要度 | Rotation頻度 | 自動化 |
|------------|-------------|--------|
| Critical | 30日毎 | 推奨 |
| High | 90日毎 | 推奨 |
| Medium | 180日毎 | オプション |
| Low | 不定期 | 不要 |

### 自動化実装

```typescript
import cron from 'node-cron';

class AutoRotation {
  setup(): void {
    // Critical: 毎月1日
    cron.schedule('0 0 1 * *', () => this.rotateCritical());

    // High: 四半期初日
    cron.schedule('0 0 1 */3 *', () => this.rotateHigh());
  }
}
```

**詳細**: `resources/rotation-automation.md`

## 実装チェックリスト

### 暗号化設計
- [ ] 保存時・転送時・使用時の各段階で暗号化されているか？
- [ ] 適切なアルゴリズムが選択されているか？
- [ ] 鍵長が十分か？（AES-256、RSA-4096）

### 鍵管理
- [ ] 鍵生成にCSRNGが使用されているか？
- [ ] 鍵と暗号化データが分離保管されているか？
- [ ] 鍵のバージョニングが実装されているか？

### Rotationプロセス
- [ ] Rotation手順がダウンタイムを発生させないか？
- [ ] ロールバック手順が明確か？
- [ ] Rotation頻度が適切か？

## 関連スキル

- `.claude/skills/secret-management-architecture/SKILL.md` - Secret管理
- `.claude/skills/zero-trust-security/SKILL.md` - アクセス制御

## リソースファイル

- `resources/rotation-procedures.md` - Rotation手順詳細

## スクリプト

- `scripts/generate-keys.mjs` - 鍵生成スクリプト
