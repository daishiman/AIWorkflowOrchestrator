# サニタイズ仕様書 - PermissionRequest Hook 統合

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-3-1-C                  |
| Phase    | 2 - 設計                    |
| 作成日   | 2026-01-25                  |
| 機能名   | PermissionRequest Hook 統合 |

---

## 概要

ツール引数に含まれる機密情報を除去し、Renderer に送信する前に安全な形式に変換する。
サニタイズ後のデータは**表示専用**であり、実際のツール実行には元の引数が使用される。

---

## サニタイズルール一覧

| ID   | ルール名               | 対象               | 処理                      | 優先度 |
| ---- | ---------------------- | ------------------ | ------------------------- | ------ |
| SR-1 | 機密キー除去           | 機密キーを含む引数 | 値を `[REDACTED]` に置換  | 1      |
| SR-2 | 長文省略               | 500文字超の文字列  | 先頭200文字 + `...[省略]` | 2      |
| SR-3 | ネストオブジェクト処理 | オブジェクト型の値 | 再帰的にサニタイズ        | 3      |
| SR-4 | 配列処理               | 配列型の値         | 各要素に対してサニタイズ  | 3      |
| SR-5 | プリミティブ保持       | その他の値         | そのまま保持              | 4      |

---

## SR-1: 機密キー除去

### 機密キーワード一覧

以下のキーワードを**大文字小文字を区別せず**に検出する。

| カテゴリ     | キーワード                                           |
| ------------ | ---------------------------------------------------- |
| パスワード系 | `password`, `passwd`, `pwd`                          |
| 認証情報系   | `secret`, `token`, `key`, `credential`, `auth`       |
| API キー系   | `api_key`, `apikey`, `api-key`                       |
| トークン系   | `bearer`, `access_token`, `refresh_token`            |
| 暗号鍵系     | `private_key`, `private-key`, `privatekey`           |
| 環境変数系   | `env`, `environment` (値が key=value 形式の場合のみ) |

### マッチング規則

```typescript
const SENSITIVE_KEYS = [
  "password",
  "passwd",
  "pwd",
  "secret",
  "token",
  "key",
  "credential",
  "auth",
  "apikey",
  "api_key",
  "api-key",
  "bearer",
  "access_token",
  "refresh_token",
  "private_key",
  "private-key",
  "privatekey",
];

function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));
}
```

### 置換形式

```
[REDACTED]
```

### 例

```typescript
// Before
{
  api_key: "sk-1234567890abcdef",
  username: "john",
  password: "secret123",
  auth_token: "eyJhbG...",
}

// After
{
  api_key: "[REDACTED]",
  username: "john",
  password: "[REDACTED]",
  auth_token: "[REDACTED]",
}
```

---

## SR-2: 長文省略

### 閾値

| 設定         | 値  |
| ------------ | --- |
| 最大文字数   | 500 |
| 先頭保持文字 | 200 |

### 省略形式

```
{先頭200文字}...[省略: {残り文字数}文字]
```

### 例

```typescript
// Before (600文字の文字列)
{
  content: "Lorem ipsum dolor sit amet... (600文字)",
}

// After
{
  content: "Lorem ipsum dolor sit amet... (200文字)...[省略: 400文字]",
}
```

### 実装

```typescript
function truncateValue(value: string, maxLength: number = 500): string {
  if (value.length <= maxLength) {
    return value;
  }

  const keepLength = 200;
  const omittedCount = value.length - keepLength;
  return `${value.substring(0, keepLength)}...[省略: ${omittedCount}文字]`;
}
```

---

## SR-3: ネストオブジェクト処理

### 処理方法

ネストしたオブジェクトに対して再帰的にサニタイズを適用する。

### 最大ネスト深度

| 設定           | 値  |
| -------------- | --- |
| 最大ネスト深度 | 10  |

深度を超えた場合は `[NESTED_OBJECT]` に置換する。

### 例

```typescript
// Before
{
  config: {
    database: {
      host: "localhost",
      password: "db_secret",
    },
    api: {
      key: "api_key_12345",
    },
  },
}

// After
{
  config: {
    database: {
      host: "localhost",
      password: "[REDACTED]",
    },
    api: {
      key: "[REDACTED]",
    },
  },
}
```

---

## SR-4: 配列処理

### 処理方法

配列の各要素に対してサニタイズを適用する。

### 配列長制限

| 設定           | 値  |
| -------------- | --- |
| 最大表示要素数 | 10  |

要素数を超えた場合は省略表示。

### 例

```typescript
// Before
{
  items: [
    { name: "item1", secret: "value1" },
    { name: "item2", secret: "value2" },
    // ... 15要素
  ],
}

// After
{
  items: [
    { name: "item1", secret: "[REDACTED]" },
    { name: "item2", secret: "[REDACTED]" },
    // ... 8要素
    "[省略: 残り5要素]",
  ],
}
```

---

## 完全実装

```typescript
const SENSITIVE_KEYS = [
  "password",
  "passwd",
  "pwd",
  "secret",
  "token",
  "key",
  "credential",
  "auth",
  "apikey",
  "api_key",
  "bearer",
  "access_token",
  "refresh_token",
  "private_key",
  "privatekey",
];

const MAX_STRING_LENGTH = 500;
const KEEP_STRING_LENGTH = 200;
const MAX_NEST_DEPTH = 10;
const MAX_ARRAY_LENGTH = 10;

function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));
}

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }
  const omitted = value.length - KEEP_STRING_LENGTH;
  return `${value.substring(0, KEEP_STRING_LENGTH)}...[省略: ${omitted}文字]`;
}

function sanitizeValue(value: unknown, depth: number = 0): unknown {
  // 深度チェック
  if (depth > MAX_NEST_DEPTH) {
    return "[NESTED_OBJECT]";
  }

  // null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // 文字列
  if (typeof value === "string") {
    return truncateString(value);
  }

  // 配列
  if (Array.isArray(value)) {
    const sanitized = value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitizeValue(item, depth + 1));

    if (value.length > MAX_ARRAY_LENGTH) {
      sanitized.push(`[省略: 残り${value.length - MAX_ARRAY_LENGTH}要素]`);
    }

    return sanitized;
  }

  // オブジェクト
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitizeValue(val, depth + 1);
      }
    }

    return result;
  }

  // その他のプリミティブ
  return value;
}

export function sanitizeArgs(
  args: Record<string, unknown>,
): Record<string, unknown> {
  return sanitizeValue(args, 0) as Record<string, unknown>;
}
```

---

## テストケース

| ID     | 入力                          | 期待される出力               |
| ------ | ----------------------------- | ---------------------------- |
| TC-001 | `{ password: "secret123" }`   | `{ password: "[REDACTED]" }` |
| TC-002 | `{ API_KEY: "sk-xxx" }`       | `{ API_KEY: "[REDACTED]" }`  |
| TC-003 | `{ name: "a" * 600 }`         | 先頭200文字 + 省略表示       |
| TC-004 | `{ nested: { secret: "x" } }` | ネスト内も REDACTED          |
| TC-005 | `{ items: [1,2,...,15] }`     | 10要素 + 省略表示            |
| TC-006 | `{ normal: "value" }`         | 変更なし                     |
| TC-007 | `{}`                          | `{}`                         |
| TC-008 | `{ authToken: "xxx" }`        | `{ authToken: "[REDACTED]"}` |
| TC-009 | 深度11のネストオブジェクト    | `[NESTED_OBJECT]`            |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
