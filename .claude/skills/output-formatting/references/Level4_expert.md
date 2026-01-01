# Level 4: ベストプラクティス

## 目的

エキスパートレベルのフォーマット設計、アンチパターン回避、保守性の高い出力設計を習得する。

---

## 1. アーキテクチャパターン

### 1.1 Adapter パターン

```typescript
// 内部データ構造を外部フォーマットに変換
interface DataAdapter<T> {
  toJSON(): string;
  toYAML(): string;
  toMarkdown(): string;
}

class UserAdapter implements DataAdapter<User> {
  constructor(private user: User) {}

  toJSON(): string {
    return JSON.stringify(
      {
        id: this.user.id,
        name: this.user.fullName,
        contact: { email: this.user.email },
      },
      null,
      2,
    );
  }

  toYAML(): string {
    // YAML変換実装
  }

  toMarkdown(): string {
    return `# ${this.user.fullName}\n\nEmail: ${this.user.email}`;
  }
}
```

### 1.2 Builder パターン

```typescript
class MarkdownBuilder {
  private content = "";

  heading(level: number, text: string): this {
    this.content += `${"#".repeat(level)} ${text}\n\n`;
    return this;
  }

  paragraph(text: string): this {
    this.content += `${text}\n\n`;
    return this;
  }

  list(items: string[]): this {
    items.forEach((item) => {
      this.content += `- ${item}\n`;
    });
    this.content += "\n";
    return this;
  }

  build(): string {
    return this.content.trim();
  }
}

// 使用例
const md = new MarkdownBuilder()
  .heading(1, "Title")
  .paragraph("Introduction")
  .list(["Item 1", "Item 2"])
  .build();
```

---

## 2. アンチパターンと解決策

### 2.1 過度なネスト

**悪い例**:

```json
{
  "level1": {
    "level2": {
      "level3": {
        "level4": {
          "level5": {
            "data": "value"
          }
        }
      }
    }
  }
}
```

**良い例**:

```json
{
  "data": {
    "path": "level1.level2.level3.level4.level5",
    "value": "value"
  }
}
```

### 2.2 不統一な命名

**悪い例**:

```json
{
  "userName": "John",
  "user_email": "john@example.com",
  "UserAge": 30
}
```

**良い例**:

```json
{
  "userName": "John",
  "userEmail": "john@example.com",
  "userAge": 30
}
```

### 2.3 冗長性

**悪い例**:

```json
{
  "user": {
    "userId": "123",
    "userName": "John",
    "userEmail": "john@example.com"
  }
}
```

**良い例**:

```json
{
  "user": {
    "id": "123",
    "name": "John",
    "email": "john@example.com"
  }
}
```

---

## 3. セキュリティ考慮事項

### 3.1 機密情報の扱い

```typescript
// 機密情報のマスキング
function sanitizeForLogging(data: any): any {
  const sensitive = ["password", "token", "apiKey", "secret"];
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (sensitive.includes(key)) {
        return "***REDACTED***";
      }
      return value;
    }),
  );
}
```

### 3.2 XSS 対策（Markdown）

```typescript
function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
}
```

### 3.3 インジェクション対策（JSON/YAML）

```typescript
// ユーザー入力をそのまま埋め込まない
function safeJSON(userInput: string): string {
  // 検証とサニタイズ
  const validated = validateInput(userInput);
  return JSON.stringify({ input: validated });
}
```

---

## 4. テスタビリティ

### 4.1 形式検証テスト

```typescript
describe("JSON Formatter", () => {
  it("should produce valid JSON", () => {
    const result = formatToJSON(data);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("should maintain data integrity", () => {
    const result = JSON.parse(formatToJSON(data));
    expect(result.id).toBe(data.id);
  });
});
```

### 4.2 スナップショットテスト

```typescript
test("markdown output matches snapshot", () => {
  const md = generateMarkdown(testData);
  expect(md).toMatchSnapshot();
});
```

---

## 5. 保守性とドキュメント

### 5.1 自己文書化フォーマット

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$comment": "User configuration schema v2.0",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "User's full name",
      "examples": ["John Doe"]
    }
  }
}
```

### 5.2 バージョン管理

```typescript
interface VersionedFormat {
  version: string;
  data: unknown;
}

function formatWithVersion(data: unknown, version = "1.0"): VersionedFormat {
  return {
    version,
    data,
  };
}
```

---

## 6. パフォーマンスとスケーラビリティ

### 6.1 遅延評価

```typescript
class LazyFormatter {
  private _cached: string | null = null;

  constructor(private data: unknown) {}

  get formatted(): string {
    if (!this._cached) {
      this._cached = JSON.stringify(this.data, null, 2);
    }
    return this._cached;
  }
}
```

### 6.2 ストリーミング

```typescript
async function* streamJSON(items: AsyncIterable<unknown>) {
  yield "[\n";
  let first = true;
  for await (const item of items) {
    if (!first) yield ",\n";
    yield `  ${JSON.stringify(item)}`;
    first = false;
  }
  yield "\n]";
}
```

---

## 7. 高度な設計原則

### 7.1 SOLID 原則の適用

| 原則 | 適用方法                                 |
| ---- | ---------------------------------------- |
| SRP  | フォーマッターは1つの形式のみ担当        |
| OCP  | インターフェース経由で拡張可能           |
| LSP  | すべてのフォーマッターが同一の契約に従う |
| ISP  | 必要なメソッドのみ提供                   |
| DIP  | 具体実装ではなく抽象に依存               |

### 7.2 DRY 原則

```typescript
// 共通処理の抽出
abstract class BaseFormatter {
  protected validate(data: unknown): void {
    // 共通検証ロジック
  }

  abstract format(data: unknown): string;
}

class JSONFormatter extends BaseFormatter {
  format(data: unknown): string {
    this.validate(data);
    return JSON.stringify(data, null, 2);
  }
}
```

---

## 8. エラーハンドリング戦略

### 8.1 階層的エラー処理

```typescript
class FormatError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: unknown,
  ) {
    super(message);
  }
}

function formatSafely(data: unknown): Result<string, FormatError> {
  try {
    return Ok(JSON.stringify(data));
  } catch (error) {
    return Err(
      new FormatError("JSON serialization failed", "FORMAT_ERROR", {
        data,
        error,
      }),
    );
  }
}
```

### 8.2 フォールバック戦略

```typescript
function formatWithFallback(data: unknown, preferredFormat: Format): string {
  try {
    return formatters[preferredFormat](data);
  } catch (primaryError) {
    try {
      return formatters.plainText(data);
    } catch (fallbackError) {
      return String(data);
    }
  }
}
```

---

## 9. チェックリスト

### 9.1 設計時

- [ ] 対象読者と用途を明確化
- [ ] 適切な形式を選択
- [ ] スキーマを定義（JSON/YAML）
- [ ] バージョニング戦略を決定
- [ ] エラーハンドリングを設計

### 9.2 実装時

- [ ] 命名規則を統一
- [ ] インデントルールを適用
- [ ] テストを書く
- [ ] 機密情報をマスキング
- [ ] パフォーマンスを考慮

### 9.3 レビュー時

- [ ] 仕様準拠を確認
- [ ] 可読性を検証
- [ ] 保守性を評価
- [ ] セキュリティをチェック
- [ ] ドキュメントを更新

---

## まとめ

エキスパートレベルのフォーマット設計では、技術的正確性だけでなく、
保守性、セキュリティ、パフォーマンス、テスタビリティを総合的に考慮する。
