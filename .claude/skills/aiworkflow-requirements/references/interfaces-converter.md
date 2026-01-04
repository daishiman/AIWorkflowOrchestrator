# コンバーター インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## A IConverter インターフェース

> **詳細設計**: `docs/30-workflows/completed-tasks/conversion-base/requirements-interface.md`
> **実装**: `packages/shared/src/services/conversion/types.ts`

ファイル変換処理の共通インターフェース。すべてのコンバーター実装が準拠する。

### A.1 必須プロパティ

| プロパティ           | 型                  | 説明                     |
| -------------------- | ------------------- | ------------------------ |
| `id`                 | `string`            | コンバーターID（一意）   |
| `name`               | `string`            | コンバーター名（表示用） |
| `supportedMimeTypes` | `readonly string[]` | サポートMIMEタイプ       |
| `priority`           | `number`            | 優先度（高いほど優先）   |

### A.2 必須メソッド

| メソッド                        | 戻り値                                       | 説明               |
| ------------------------------- | -------------------------------------------- | ------------------ |
| `canConvert(input)`             | `boolean`                                    | 変換可能性の判定   |
| `convert(input, options?)`      | `Promise<Result<ConverterOutput, RAGError>>` | ファイル変換実行   |
| `estimateProcessingTime(input)` | `number`                                     | 推定処理時間（ms） |

### A.3 使用例

```typescript
import { globalConverterRegistry } from "@repo/shared/services/conversion";

const result = globalConverterRegistry.findConverter(input);
if (result.success) {
  const converted = await result.data.convert(input);
}
```

### A.4 実装クラス

#### 実装一覧

| 実装クラス         | サポートMIME                                      | 優先度 | 主要機能                             | 実装状況  |
| ------------------ | ------------------------------------------------- | ------ | ------------------------------------ | --------- |
| HTMLConverter      | text/html                                         | 10     | HTML→Markdown、script/style除去      | ✅ 実装済 |
| MarkdownConverter  | text/markdown, text/x-markdown                    | 10     | 見出し・リンク・コードブロック抽出   | ✅ 実装済 |
| CodeConverter      | text/x-typescript, text/javascript, text/x-python | 10     | 関数・クラス・インポート抽出         | ✅ 実装済 |
| YAMLConverter      | application/x-yaml, text/yaml, text/x-yaml        | 10     | 構造解析、トップレベルキー抽出       | ✅ 実装済 |
| CSVConverter       | text/csv, text/tab-separated-values               | 5      | CSV/TSV→テーブル、区切り文字自動検出 | ✅ 実装済 |
| JSONConverter      | application/json                                  | 5      | JSON→構造化Markdown、ネスト対応      | ✅ 実装済 |
| PlainTextConverter | text/plain                                        | 0      | BOM除去、改行コード正規化            | ⏸️ 未実装 |

#### HTMLConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/html-converter.ts`

```typescript
import { HTMLConverter } from "@repo/shared/services/conversion/converters/html-converter";

const converter = new HTMLConverter();

// サポート確認
console.log(converter.supportedMimeTypes); // ['text/html']
console.log(converter.priority); // 10

// 変換実行
const input = {
  fileId: "file-123",
  filePath: "/path/to/page.html",
  mimeType: "text/html",
  content:
    "<html><head><title>ページタイトル</title></head><body><h1>見出し</h1><p>本文</p></body></html>",
  encoding: "utf-8",
};

const result = await converter.convert(input);

if (result.success) {
  console.log(result.value.convertedContent);
  // # 見出し
  //
  // 本文

  console.log(result.value.extractedMetadata);
  // { title: 'ページタイトル', description: null, keywords: null, lang: null }
}
```

#### CSVConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/csv-converter.ts`

```typescript
import { CSVConverter } from "@repo/shared/services/conversion/converters/csv-converter";

const converter = new CSVConverter();

// サポート確認
console.log(converter.supportedMimeTypes); // ['text/csv', 'text/tab-separated-values']
console.log(converter.priority); // 5

// CSV変換
const csvInput = {
  fileId: "file-456",
  filePath: "/path/to/users.csv",
  mimeType: "text/csv",
  content: "ID,名前,年齢\n1,田中太郎,30\n2,鈴木花子,25",
  encoding: "utf-8",
};

const csvResult = await converter.convert(csvInput);

if (csvResult.success) {
  console.log(csvResult.value.convertedContent);
  // | ID | 名前     | 年齢 |
  // | -- | -------- | ---- |
  // | 1  | 田中太郎 | 30   |
  // | 2  | 鈴木花子 | 25   |

  console.log(csvResult.value.extractedMetadata);
  // { rowCount: 2, columnCount: 3, delimiter: ',' }
}

// TSV変換
const tsvInput = {
  fileId: "file-789",
  filePath: "/path/to/users.tsv",
  mimeType: "text/tab-separated-values",
  content: "ID\t名前\t年齢\n1\t田中太郎\t30",
  encoding: "utf-8",
};

const tsvResult = await converter.convert(tsvInput);
// メタデータの delimiter は '\t'
```

#### JSONConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/json-converter.ts`

```typescript
import { JSONConverter } from "@repo/shared/services/conversion/converters/json-converter";

const converter = new JSONConverter();

// サポート確認
console.log(converter.supportedMimeTypes); // ['application/json']
console.log(converter.priority); // 5

// 変換実行
const input = {
  fileId: "file-abc",
  filePath: "/path/to/config.json",
  mimeType: "application/json",
  content: JSON.stringify({
    title: "プロジェクト概要",
    version: "1.0.0",
    features: ["機能A", "機能B", "機能C"],
    config: {
      debug: true,
      timeout: 3000,
    },
  }),
  encoding: "utf-8",
};

const result = await converter.convert(input);

if (result.success) {
  console.log(result.value.convertedContent);
  // ## title
  // プロジェクト概要
  //
  // ## version
  // 1.0.0
  //
  // ## features
  // - 機能A
  // - 機能B
  // - 機能C
  //
  // ## config
  // ### debug
  // true
  //
  // ### timeout
  // 3000

  console.log(result.value.extractedMetadata);
  // { depth: 2, keyCount: 6 }
}
```

#### MarkdownConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/markdown-converter.ts`

```typescript
import { MarkdownConverter } from "@repo/shared/services/conversion/converters/markdown-converter";

const converter = new MarkdownConverter();

// サポート確認
console.log(converter.supportedMimeTypes); // ['text/markdown', 'text/x-markdown']
console.log(converter.priority); // 10

// 変換実行
const input = {
  fileId: "file-md1",
  filePath: "/path/to/document.md",
  mimeType: "text/markdown",
  content: `---
title: APIドキュメント
author: John Doe
---

# APIドキュメント

## 概要

このドキュメントは...

\`\`\`typescript
function example() {
  return 'Hello';
}
\`\`\`

[リンク](https://example.com)
`,
  encoding: "utf-8",
};

const result = await converter.convert(input);

if (result.success) {
  console.log(result.value.extractedMetadata);
  // {
  //   title: 'APIドキュメント',
  //   headers: [{ level: 1, text: 'APIドキュメント' }, { level: 2, text: '概要' }],
  //   links: ['https://example.com'],
  //   codeBlocks: 1,
  //   language: 'ja',
  //   hasFrontmatter: true,
  //   hasCodeBlocks: true
  // }
}
```

#### CodeConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/code-converter.ts`

```typescript
import { CodeConverter } from "@repo/shared/services/conversion/converters/code-converter";

const converter = new CodeConverter();

// サポート確認
console.log(converter.supportedMimeTypes);
// ['text/x-typescript', 'text/javascript', 'text/x-python', ...]
console.log(converter.priority); // 10

// TypeScript変換
const input = {
  fileId: "file-ts1",
  filePath: "/path/to/user.ts",
  mimeType: "text/x-typescript",
  content: `import { User } from './types';

export class UserService {
  async getUser(id: string): Promise<User> {
    return fetch(\`/api/users/\${id}\`).then(r => r.json());
  }
}

export const formatUser = (user: User) => \`\${user.name} <\${user.email}>\`;
`,
  encoding: "utf-8",
};

const result = await converter.convert(input);

if (result.success) {
  console.log(result.value.extractedMetadata);
  // {
  //   language: 'typescript',
  //   functions: ['formatUser'],
  //   classes: ['UserService'],
  //   imports: ['./types'],
  //   exports: ['UserService', 'formatUser'],
  //   classCount: 1,
  //   functionCount: 1
  // }
}
```

#### YAMLConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/yaml-converter.ts`

```typescript
import { YAMLConverter } from "@repo/shared/services/conversion/converters/yaml-converter";

const converter = new YAMLConverter();

// サポート確認
console.log(converter.supportedMimeTypes);
// ['application/x-yaml', 'text/yaml', 'text/x-yaml']
console.log(converter.priority); // 10

// 変換実行
const input = {
  fileId: "file-yaml1",
  filePath: "/path/to/config.yaml",
  mimeType: "application/x-yaml",
  content: `# アプリケーション設定
app:
  name: MyApp
  version: 1.0.0

database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
`,
  encoding: "utf-8",
};

const result = await converter.convert(input);

if (result.success) {
  console.log(result.value.extractedMetadata);
  // {
  //   topLevelKeys: ['app', 'database'],
  //   hasComments: true,
  //   maxIndentDepth: 4,
  //   totalLines: 8
  // }
}
```

### A.5 IConverter 拡張ガイド

新規コンバーター実装時の拡張ポイントと実装パターン。

#### BaseConverter 継承による実装

**必須実装メソッド**:

```typescript
protected abstract doConvert(
  input: ConverterInput,
  options: ConverterOptions
): Promise<Result<ConverterOutput, RAGError>>;
```

**BaseConverter が提供するヘルパーメソッド**:

| メソッド                          | 用途                                   | 戻り値   |
| --------------------------------- | -------------------------------------- | -------- |
| `getTextContent(input)`           | ConverterInputから文字列を取得         | `string` |
| `trimContent(content, maxLength)` | コンテンツを最大長でトリミング         | `string` |
| `getDescription()`                | コンバーター説明文（オーバーライド可） | `string` |

**継承の利点**:

- タイミング計測を自動化（processingTimeの自動設定）
- エラーハンドリングの統一（try-catchの共通化）
- テキスト取得・トリミングの共通処理
- Result型の一貫した返却

#### 実装の最小構成

```typescript
export class MinimalConverter extends BaseConverter {
  readonly id = "minimal-converter";
  readonly name = "Minimal Converter";
  readonly supportedMimeTypes = ["text/minimal"] as const;
  readonly priority = 5;

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      // 1. コンテンツ取得
      const content = this.getTextContent(input);

      // 2. 処理（ここに固有のロジック）
      const processed = content.trim();

      // 3. トリミング
      const trimmed = this.trimContent(processed, options.maxContentLength);

      // 4. メタデータ生成
      const metadata = {
        title: null,
        author: null,
        language: "en" as const,
        wordCount: trimmed.split(/\s+/).length,
        lineCount: trimmed.split("\n").length,
        charCount: trimmed.length,
        headers: [],
        codeBlocks: 0,
        links: [],
      };

      // 5. Result型で返却
      return ok({
        convertedContent: trimmed,
        extractedMetadata: metadata,
        processingTime: 0, // BaseConverterが自動設定
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
          { converterId: this.id, fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }
}
```

#### カスタムメタデータの追加

**パターン1: custom フィールドの活用**（推奨）

```typescript
const metadata = {
  // 基本フィールド
  title: null,
  author: null,
  language: "en" as const,
  // ...

  // カスタムフィールド
  custom: {
    customField1: "value",
    customField2: 123,
    customArray: ["item1", "item2"],
  },
};
```

**パターン2: 型定義の拡張**（共通化が必要な場合）

`packages/shared/src/services/conversion/types.ts` を更新:

```typescript
export interface ExtractedMetadata {
  // 既存フィールド
  title: string | null;
  // ...

  // 新規追加フィールド
  newCommonField?: string; // オプショナルで追加
}
```

#### エラーハンドリングのベストプラクティス

**推奨パターン**:

```typescript
try {
  const content = this.getTextContent(input);
  // ... 処理 ...
  return ok(result);
} catch (error) {
  // エラーコンテキストを含める
  return err(
    createRAGError(
      ErrorCodes.CONVERSION_FAILED,
      `Failed to convert: ${error instanceof Error ? error.message : String(error)}`,
      {
        converterId: this.id,
        fileId: input.fileId,
        mimeType: input.mimeType,
        // 追加のコンテキスト情報
        filePath: input.filePath,
      },
      error as Error, // 元のエラーを cause として保持
    ),
  );
}
```

**エラーコード選択基準**:

| エラーコード        | 使用場面                                         |
| ------------------- | ------------------------------------------------ |
| `VALIDATION_FAILED` | 入力検証エラー（MIMEタイプ不一致、不正な形式等） |
| `CONVERSION_FAILED` | 変換処理中のエラー（パース失敗、構造抽出失敗等） |
| `INTERNAL_ERROR`    | 予期しないシステムエラー                         |

#### テストの実装パターン

**基本テスト構造**:

```typescript
describe("CustomConverter", () => {
  beforeEach(() => {
    globalConverterRegistry.clear();
    resetRegistrationState();
  });

  describe("convert", () => {
    it("should convert valid input", async () => {
      const converter = new CustomConverter();
      const input = createTestInput();

      const result = await converter.convert(input, {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBeTruthy();
      }
    });

    it("should handle empty content", async () => {
      const converter = new CustomConverter();
      const input = createTestInput({ content: "" });

      const result = await converter.convert(input, {});

      expect(result.success).toBe(true);
    });

    it("should respect maxContentLength", async () => {
      const converter = new CustomConverter();
      const input = createTestInput({ content: "A".repeat(200000) });

      const result = await converter.convert(input, {
        maxContentLength: 100000,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeLessThanOrEqual(100000);
      }
    });
  });
});
```

**テストヘルパー関数**:

```typescript
function createTestInput(overrides?: Partial<ConverterInput>): ConverterInput {
  return {
    fileId: generateFileId(),
    content: "test content",
    mimeType: "text/test",
    filePath: "/test/file.txt",
    ...overrides,
  };
}
```

#### PlainTextConverter（未実装）

**予定ファイルパス**: `packages/shared/src/services/conversion/converters/plain-text-converter.ts`

**関連タスク**: `docs/30-workflows/unassigned-task/task-plaintext-converter-implementation.md` (QUALITY-02)

**予定API**:

```typescript
import { PlainTextConverter } from "@repo/shared/services/conversion/converters/plain-text-converter";

const converter = new PlainTextConverter();

// サポート確認
console.log(converter.supportedMimeTypes); // ['text/plain']
console.log(converter.priority); // 0

// 変換実行（BOM除去、改行正規化）
const input = {
  fileId: "file-xyz",
  filePath: "/path/to/readme.txt",
  mimeType: "text/plain",
  content: "\ufeffテキストコンテンツ\r\n改行あり",
  encoding: "utf-8",
};

const result = await converter.convert(input);

if (result.success) {
  console.log(result.value.convertedContent);
  // テキストコンテンツ
  // 改行あり
  // (BOMが除去され、改行コードがLFに正規化される)
}
```

---
