# IConverter 拡張ガイド

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [interfaces-converter.md](./interfaces-converter.md)

新規コンバーター実装時の拡張ポイントと実装パターン。

---

## BaseConverter 継承による実装

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

---

## 実装の最小構成

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

---

## カスタムメタデータの追加

### パターン1: custom フィールドの活用（推奨）

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

### パターン2: 型定義の拡張（共通化が必要な場合）

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

---

## エラーハンドリングのベストプラクティス

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

---

## テストの実装パターン

### 基本テスト構造

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

### テストヘルパー関数

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

---

## 関連ドキュメント

- [コンバーターインターフェース仕様](./interfaces-converter.md)
- [コンバーター実装クラス詳細](./interfaces-converter-implementations.md)
- [エラーハンドリング仕様](./error-handling.md)
