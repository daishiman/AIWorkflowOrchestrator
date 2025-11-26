# PIIマスキングパターン

## PII（個人識別情報）の定義

### 高リスクPII

**完全マスキング必須**:
- パスワード
- クレジットカード番号
- 社会保障番号（SSN）
- パスポート番号
- 運転免許証番号
- APIキー、トークン、秘密鍵

### 中リスクPII

**部分マスキング推奨**:
- メールアドレス
- 電話番号
- 氏名
- 住所

### 低リスクPII

**状況に応じてマスキング**:
- ユーザーID（ハッシュ化推奨）
- IPアドレス（部分マスキング）
- セッションID（ハッシュ化または除外）

## マスキング戦略

### 完全マスキング

**適用対象**: パスワード、クレジットカード番号、秘密鍵

**パターン**:
```typescript
// 完全に***に置換
const masked = "***";

// 元の値
password: "MySecret123!"
// マスキング後
password: "***"
```

**実装**:
```typescript
function maskSecret(value: string): string {
  return "***";
}
```

### 部分マスキング

#### メールアドレス

**パターン**: ローカル部の最初と最後の文字のみ表示
```typescript
// 元の値
email: "john.doe@example.com"
// マスキング後
email: "j***e@example.com"
```

**実装**:
```typescript
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
```

#### 電話番号

**パターン**: 最後の4桁のみ表示
```typescript
// 元の値
phone: "+1-555-123-4567"
// マスキング後
phone: "***-***-***-4567"
```

**実装**:
```typescript
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const lastFour = digits.slice(-4);
  return `***-***-***-${lastFour}`;
}
```

#### IPアドレス

**パターン**: 最後のオクテットをマスキング
```typescript
// IPv4
ip: "192.168.1.100"
// マスキング後
ip: "192.168.1.***"

// IPv6
ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
// マスキング後
ip: "2001:0db8:85a3:****:****:****:****:****"
```

**実装**:
```typescript
function maskIP(ip: string): string {
  if (ip.includes('.')) {
    // IPv4
    const parts = ip.split('.');
    return `${parts.slice(0, 3).join('.')}.***`;
  } else {
    // IPv6
    const parts = ip.split(':');
    return `${parts.slice(0, 3).join(':')}:****:****:****:****:****`;
  }
}
```

### ハッシュ化

#### ユーザーID

**パターン**: SHA256ハッシュに変換
```typescript
// 元の値
user_id: "user_12345"
// ハッシュ後
user_id_hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
```

**実装**:
```typescript
import crypto from 'crypto';

function hashUserId(userId: string): string {
  return crypto.createHash('sha256').update(userId).digest('hex');
}
```

**用途**:
- ログ分析で同一ユーザーの追跡が必要
- ユーザー識別子そのものは不要
- プライバシー保護とトレーサビリティの両立

### 除外（ログに含めない）

**適用対象**: 最も機密性の高い情報

**例**:
```typescript
// ❌ 悪い例 - パスワードをログに含める
logger.info("User login attempt", { email, password });

// ✅ 良い例 - パスワードは完全に除外
logger.info("User login attempt", { email: maskEmail(email) });
```

**除外すべき情報**:
- パスワード（平文、ハッシュ含む）
- APIキー、アクセストークン
- クレジットカード番号、CVV
- 社会保障番号、パスポート番号

## コンプライアンス対応

### GDPR（EU一般データ保護規則）

**要件**:
- 個人データの処理を最小化
- ユーザーの同意なしに個人データをログに記録しない
- ログ保持期間を明示（30日推奨）
- ユーザーがログ削除を要求できる仕組み

**実装指針**:
```typescript
// ユーザー識別にはハッシュ化IDを使用
logger.info("User action", {
  user_id_hash: hashUserId(user_id),
  action: "purchase",
  // 氏名、メールアドレスは含めない
});
```

### CCPA（カリフォルニア州消費者プライバシー法）

**要件**:
- 個人情報の収集と使用目的を開示
- ユーザーが個人情報の削除を要求可能
- ログ保持期間を明示

**実装指針**:
```typescript
// CCPAのDo Not Sell要求を尊重
if (user.ccpa_opt_out) {
  // 最小限のログのみ
  logger.info("User action", { action: "purchase", anonymous_id });
} else {
  logger.info("User action", { user_id_hash, action: "purchase" });
}
```

### HIPAA（医療情報保護、該当する場合）

**要件**:
- PHI（保護対象医療情報）をログに含めない
- ログアクセスを厳格に制御
- 監査ログを保持

**実装指針**:
```typescript
// 医療情報は完全に除外
logger.info("Medical record accessed", {
  record_id_hash: hashRecordId(record_id),
  accessor_id: doctor_id,
  // 医療情報の内容は含めない
});
```

## 自動マスキング実装

### フィールドベースマスキング

**特定フィールドを自動マスキング**:
```typescript
const PII_FIELDS = ['email', 'phone', 'ssn', 'credit_card', 'password'];

function autoMaskPII(data: Record<string, any>): Record<string, any> {
  const masked = { ...data };

  for (const field of PII_FIELDS) {
    if (masked[field]) {
      if (field === 'email') {
        masked[field] = maskEmail(masked[field]);
      } else if (field === 'phone') {
        masked[field] = maskPhone(masked[field]);
      } else {
        masked[field] = '***';
      }
    }
  }

  return masked;
}
```

### 正規表現ベースマスキング

**パターンマッチでマスキング**:
```typescript
function maskSensitiveData(text: string): string {
  return text
    // メールアドレス
    .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
             (match, local, domain) => `${local[0]}***@${domain}`)
    // クレジットカード番号（16桁）
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****')
    // 電話番号
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '***-***-****')
    // APIキー（32文字以上の英数字）
    .replace(/\b[a-zA-Z0-9]{32,}\b/g, '***');
}
```

## ロギングライブラリ統合

### Winston（Node.js）

```typescript
import winston from 'winston';

const maskingFormat = winston.format((info) => {
  if (info.email) info.email = maskEmail(info.email);
  if (info.phone) info.phone = maskPhone(info.phone);
  return info;
});

const logger = winston.createLogger({
  format: winston.format.combine(
    maskingFormat(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});
```

### Pino（Node.js）

```typescript
import pino from 'pino';

const logger = pino({
  serializers: {
    email: maskEmail,
    phone: maskPhone,
    user_id: hashUserId
  }
});
```

## テストとバリデーション

### マスキングテスト

```typescript
describe('PII Masking', () => {
  it('should mask email addresses', () => {
    expect(maskEmail('john.doe@example.com')).toBe('j***e@example.com');
  });

  it('should mask credit card numbers', () => {
    const text = 'Card: 1234-5678-9012-3456';
    expect(maskSensitiveData(text)).toBe('Card: ****-****-****-****');
  });

  it('should not log passwords', () => {
    const logSpy = jest.spyOn(logger, 'info');
    logger.info('User created', { email, password });

    const loggedData = logSpy.mock.calls[0][1];
    expect(loggedData).not.toHaveProperty('password');
  });
});
```

### ログ出力検証

```bash
# ログにPIIが含まれていないかチェック
grep -E '(password|ssn|credit_card)' logs/*.log
# 何も出力されなければOK
```

## ベストプラクティス

1. **デフォルトでマスキング**: PIIは明示的に除外しない限りマスキング
2. **多層防御**: フィールドベース + 正規表現ベース
3. **ホワイトリスト方式**: 安全なフィールドのみログに含める
4. **定期監査**: ログ出力を定期的にレビュー
5. **自動化**: CI/CDでPII検出テストを実行

## アンチパターン

❌ **PIIをそのままログ**: `logger.info({ email: "user@example.com" })`
✅ **自動マスキング**: `logger.info({ email: maskEmail("user@example.com") })`

❌ **手動マスキング忘れ**: `logger.error("Login failed", { password })`
✅ **除外**: `logger.error("Login failed", { email: maskEmail(email) })`

❌ **不十分なマスキング**: `email: "***@example.com"` (ドメインから推測可能)
✅ **適切なマスキング**: `email: "u***@example.com"` (最小限の情報)
