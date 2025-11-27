# 入力検証ガイド

## 1. 検証の原則

### 信頼境界

```
外部入力（信頼しない）
├── ユーザー入力
├── APIリクエスト
├── ファイルアップロード
├── 環境変数（実行時）
└── サードパーティAPI応答

内部データ（条件付き信頼）
├── データベースからの値
├── キャッシュからの値
└── 内部APIからの応答
```

### 検証戦略

```
1. ホワイトリスト > ブラックリスト
   - 許可するものだけを通す
   - 禁止リストは常に不完全

2. 早期検証
   - 入力を受け取った直後に検証
   - 不正な入力は即座に拒否

3. 多層防御
   - 複数のレイヤーで検証
   - 単一障害点を作らない
```

## 2. 型別検証パターン

### 文字列

```typescript
interface StringValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  format?: 'email' | 'url' | 'uuid' | 'date';
  enum?: string[];
  trim?: boolean;
  lowercase?: boolean;
}

function validateString(value: unknown, rules: StringValidation): string {
  if (typeof value !== 'string') {
    throw new Error('Expected string');
  }

  let str = value;

  if (rules.trim) str = str.trim();
  if (rules.lowercase) str = str.toLowerCase();

  if (rules.minLength && str.length < rules.minLength) {
    throw new Error(`Minimum length is ${rules.minLength}`);
  }

  if (rules.maxLength && str.length > rules.maxLength) {
    throw new Error(`Maximum length is ${rules.maxLength}`);
  }

  if (rules.pattern && !rules.pattern.test(str)) {
    throw new Error('Invalid format');
  }

  if (rules.enum && !rules.enum.includes(str)) {
    throw new Error(`Must be one of: ${rules.enum.join(', ')}`);
  }

  return str;
}
```

### 数値

```typescript
interface NumberValidation {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  multipleOf?: number;
}

function validateNumber(value: unknown, rules: NumberValidation): number {
  const num = Number(value);

  if (isNaN(num)) {
    throw new Error('Expected number');
  }

  if (rules.integer && !Number.isInteger(num)) {
    throw new Error('Expected integer');
  }

  if (rules.positive && num <= 0) {
    throw new Error('Must be positive');
  }

  if (rules.min !== undefined && num < rules.min) {
    throw new Error(`Minimum value is ${rules.min}`);
  }

  if (rules.max !== undefined && num > rules.max) {
    throw new Error(`Maximum value is ${rules.max}`);
  }

  if (rules.multipleOf && num % rules.multipleOf !== 0) {
    throw new Error(`Must be multiple of ${rules.multipleOf}`);
  }

  return num;
}
```

### 配列

```typescript
interface ArrayValidation<T> {
  minItems?: number;
  maxItems?: number;
  unique?: boolean;
  itemValidator?: (item: unknown) => T;
}

function validateArray<T>(value: unknown, rules: ArrayValidation<T>): T[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected array');
  }

  if (rules.minItems && value.length < rules.minItems) {
    throw new Error(`Minimum items is ${rules.minItems}`);
  }

  if (rules.maxItems && value.length > rules.maxItems) {
    throw new Error(`Maximum items is ${rules.maxItems}`);
  }

  let items = value;

  if (rules.itemValidator) {
    items = value.map(rules.itemValidator);
  }

  if (rules.unique) {
    const uniqueSet = new Set(items.map(i => JSON.stringify(i)));
    if (uniqueSet.size !== items.length) {
      throw new Error('Items must be unique');
    }
  }

  return items;
}
```

## 3. サニタイゼーションパターン

### HTMLエスケープ（XSS対策）

```typescript
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
}

// 使用例
const userInput = '<script>alert("XSS")</script>';
const safeOutput = escapeHtml(userInput);
// 結果: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

### SQLパラメータ化（SQLインジェクション対策）

```typescript
// 悪い例（直接埋め込み）
const badQuery = `SELECT * FROM users WHERE id = ${userId}`;

// 良い例（パラメータ化）
const goodQuery = {
  text: 'SELECT * FROM users WHERE id = $1',
  values: [userId]
};
```

### パス正規化（パストラバーサル対策）

```typescript
import path from 'path';

function sanitizePath(userPath: string, allowedRoot: string): string {
  // パスを正規化
  const normalized = path.normalize(userPath);

  // 絶対パスを構築
  const absolutePath = path.resolve(allowedRoot, normalized);

  // 許可されたディレクトリ内かチェック
  if (!absolutePath.startsWith(path.resolve(allowedRoot))) {
    throw new Error('Path traversal detected');
  }

  return absolutePath;
}

// 使用例
const userInput = '../../../etc/passwd';
const allowedDir = '/var/www/uploads';
// throws Error: Path traversal detected
```

### コマンドインジェクション対策

```typescript
import { execFile } from 'child_process';

// 悪い例（シェル経由）
// exec(`ls -la ${userInput}`);  // 危険！

// 良い例（引数として渡す）
execFile('ls', ['-la', userInput], (error, stdout) => {
  // 安全
});

// または、入力をホワイトリストでチェック
function sanitizeFilename(filename: string): string {
  // 英数字、ハイフン、アンダースコア、ドットのみ許可
  if (!/^[\w\-.]+$/.test(filename)) {
    throw new Error('Invalid filename');
  }
  return filename;
}
```

## 4. 一般的な攻撃パターンと対策

### SQLインジェクション

```
攻撃例: ' OR '1'='1
対策: パラメータ化クエリ、ORM使用
```

### XSS（クロスサイトスクリプティング）

```
攻撃例: <script>document.cookie</script>
対策: HTMLエスケープ、CSP設定
```

### パストラバーサル

```
攻撃例: ../../../etc/passwd
対策: パス正規化、ホワイトリスト
```

### コマンドインジェクション

```
攻撃例: ; rm -rf /
対策: execFile使用、入力検証
```

### LDAP インジェクション

```
攻撃例: *)(objectClass=*)
対策: LDAP エスケープ
```

### XXE（XML外部エンティティ）

```
攻撃例: <!ENTITY xxe SYSTEM "file:///etc/passwd">
対策: DTD無効化、外部エンティティ禁止
```

## 5. Zodによる検証例

```typescript
import { z } from 'zod';

// ユーザー入力スキーマ
const UserInputSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  email: z.string()
    .email('Invalid email format'),

  age: z.number()
    .int('Age must be an integer')
    .min(0, 'Age must be positive')
    .max(150, 'Invalid age'),

  website: z.string()
    .url('Invalid URL')
    .optional(),

  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags')
    .optional()
});

// 使用例
function validateUserInput(data: unknown) {
  const result = UserInputSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    throw new ValidationError('Invalid input', errors);
  }

  return result.data;
}
```

## 6. 検証チェックリスト

### 入力受信時

- [ ] 型チェック（string, number, boolean, etc.）
- [ ] 長さ/サイズ制限
- [ ] 形式検証（regex, format）
- [ ] 範囲チェック
- [ ] 必須/任意の確認
- [ ] デフォルト値の適用

### データ使用時

- [ ] SQLパラメータ化
- [ ] HTMLエスケープ
- [ ] パス正規化
- [ ] コマンド引数分離
- [ ] エンコーディング確認

### 出力時

- [ ] Content-Type設定
- [ ] 文字エンコーディング指定
- [ ] セキュリティヘッダー設定
