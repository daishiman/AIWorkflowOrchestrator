# エラーコード分析 - 既存と新規の整合性確認

## 1. 既存エラーコード（packages/shared/src/types/rag/errors.ts）

### 1.1 現在定義されているエラーコード

| カテゴリ     | エラーコード               | 説明                             |
| ------------ | -------------------------- | -------------------------------- |
| ファイル     | FILE_NOT_FOUND             | ファイルが見つからない           |
| ファイル     | FILE_READ_ERROR            | ファイル読み込みエラー           |
| ファイル     | FILE_WRITE_ERROR           | ファイル書き込みエラー           |
| ファイル     | UNSUPPORTED_FILE_TYPE      | サポートされていないファイル形式 |
| 変換         | CONVERSION_FAILED          | 変換処理失敗                     |
| 変換         | CONVERTER_NOT_FOUND        | コンバーターが見つからない       |
| データベース | DB_CONNECTION_ERROR        | DB接続エラー                     |
| データベース | DB_QUERY_ERROR             | DBクエリエラー                   |
| データベース | DB_TRANSACTION_ERROR       | DBトランザクションエラー         |
| データベース | RECORD_NOT_FOUND           | レコードが見つからない           |
| 埋め込み     | EMBEDDING_GENERATION_ERROR | 埋め込み生成エラー               |
| 埋め込み     | EMBEDDING_PROVIDER_ERROR   | 埋め込みプロバイダーエラー       |
| 検索         | SEARCH_ERROR               | 検索エラー                       |
| 検索         | QUERY_PARSE_ERROR          | クエリ解析エラー                 |
| グラフ       | ENTITY_EXTRACTION_ERROR    | エンティティ抽出エラー           |
| グラフ       | RELATION_EXTRACTION_ERROR  | 関係抽出エラー                   |
| グラフ       | COMMUNITY_DETECTION_ERROR  | コミュニティ検出エラー           |
| 汎用         | VALIDATION_ERROR           | バリデーションエラー             |
| 汎用         | INTERNAL_ERROR             | 内部エラー                       |

---

## 2. 設計書で使用されているエラーコード

### 2.1 使用箇所の分析

| エラーコード        | 使用箇所                 | 既存定義 | 対応                                                    |
| ------------------- | ------------------------ | -------- | ------------------------------------------------------- |
| CONVERSION_FAILED   | design-base-converter.md | ✓ あり   | そのまま使用                                            |
| CONVERTER_NOT_FOUND | design-registry.md       | ✓ あり   | そのまま使用                                            |
| INVALID_INPUT       | design-base-converter.md | ✗ なし   | **VALIDATION_ERROR**で代用                              |
| TIMEOUT             | design-service.md        | ✗ なし   | **追加が必要**                                          |
| RESOURCE_EXHAUSTED  | design-service.md        | ✗ なし   | **追加が必要**                                          |
| NOT_FOUND           | design-registry.md       | ✗ なし   | **RECORD_NOT_FOUND**または**CONVERTER_NOT_FOUND**で代用 |
| INTERNAL_ERROR      | design-service.md        | ✓ あり   | そのまま使用                                            |

---

## 3. 追加が必要なエラーコード

### 3.1 TIMEOUT

**用途**: 変換処理がタイムアウトした場合

**使用箇所**: `ConversionService.convertWithTimeout()`

**定義**:

```typescript
TIMEOUT: "TIMEOUT";
```

**追加理由**:

- 長時間実行の変換処理を中断するため必須
- タイムアウトとその他の変換失敗を区別する必要がある

---

### 3.2 RESOURCE_EXHAUSTED

**用途**: 同時実行数が上限に達した場合

**使用箇所**: `ConversionService.convert()`

**定義**:

```typescript
RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED";
```

**追加理由**:

- システムリソース保護のため必須
- 一時的なリソース不足と恒久的なエラーを区別する必要がある

---

## 4. 代用可能なエラーコード

### 4.1 INVALID_INPUT → VALIDATION_ERROR

**設計書の使用箇所**: `BaseConverter.validateInput()`

**変更内容**:

```typescript
// 変更前
return err(
  createRAGError(ErrorCodes.INVALID_INPUT, "fileId is required", {
    converterId: this.id,
  }),
);

// 変更後
return err(
  createRAGError(ErrorCodes.VALIDATION_ERROR, "fileId is required", {
    converterId: this.id,
  }),
);
```

**理由**: 既存の`VALIDATION_ERROR`で同じ意図を表現可能

---

### 4.2 NOT_FOUND → CONVERTER_NOT_FOUND

**設計書の使用箇所**: `ConverterRegistry.get()`, `ConverterRegistry.unregister()`

**変更内容**:

```typescript
// 変更前
return err(
  createRAGError(ErrorCodes.NOT_FOUND, `Converter not found: ${converterId}`, {
    converterId,
  }),
);

// 変更後
return err(
  createRAGError(
    ErrorCodes.CONVERTER_NOT_FOUND,
    `Converter not found: ${converterId}`,
    { converterId },
  ),
);
```

**理由**: 既存の`CONVERTER_NOT_FOUND`で明示的に表現可能

---

## 5. エラーコード追加の提案

### 5.1 errors.tsへの追加内容

```typescript
export const ErrorCodes = Object.freeze({
  // ... 既存のエラーコード

  // 変換関連（追加）
  CONVERSION_FAILED: "CONVERSION_FAILED", // 既存
  CONVERTER_NOT_FOUND: "CONVERTER_NOT_FOUND", // 既存
  TIMEOUT: "TIMEOUT", // ← 追加
  RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED", // ← 追加

  // ... 残りのエラーコード
} as const);
```

---

## 6. 設計書の修正箇所

### 6.1 design-base-converter.md

```typescript
// 修正箇所1: validateInput()
protected validateInput(input: ConverterInput): Result<void, RAGError> {
  if (!input.fileId) {
    return err(
      createRAGError(
        ErrorCodes.VALIDATION_ERROR,  // INVALID_INPUT → VALIDATION_ERROR
        "fileId is required",
        { converterId: this.id }
      )
    );
  }
  // ... 他のバリデーションも同様に修正
}
```

### 6.2 design-registry.md

```typescript
// 修正箇所1: register()
if (!converter.id) {
  return err(
    createRAGError(
      ErrorCodes.VALIDATION_ERROR, // INVALID_INPUT → VALIDATION_ERROR
      "Converter ID is required",
      { converterId: converter.id },
    ),
  );
}

// 修正箇所2: get(), unregister()
if (!this.converters.has(converterId)) {
  return err(
    createRAGError(
      ErrorCodes.CONVERTER_NOT_FOUND, // NOT_FOUND → CONVERTER_NOT_FOUND
      `Converter not found: ${converterId}`,
      { converterId },
    ),
  );
}
```

### 6.3 design-service.md

```typescript
// 修正なし（TIMEOUTとRESOURCE_EXHAUSTEDを新規追加するため）
```

---

## 7. 実装時の対応

### 7.1 エラーコード追加（packages/shared/src/types/rag/errors.ts）

```typescript
export const ErrorCodes = Object.freeze({
  // ファイル関連
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_READ_ERROR: "FILE_READ_ERROR",
  FILE_WRITE_ERROR: "FILE_WRITE_ERROR",
  UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE",

  // 変換関連
  CONVERSION_FAILED: "CONVERSION_FAILED",
  CONVERTER_NOT_FOUND: "CONVERTER_NOT_FOUND",
  TIMEOUT: "TIMEOUT", // ← 追加
  RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED", // ← 追加

  // データベース関連
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
  DB_QUERY_ERROR: "DB_QUERY_ERROR",
  DB_TRANSACTION_ERROR: "DB_TRANSACTION_ERROR",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",

  // 埋め込み関連
  EMBEDDING_GENERATION_ERROR: "EMBEDDING_GENERATION_ERROR",
  EMBEDDING_PROVIDER_ERROR: "EMBEDDING_PROVIDER_ERROR",

  // 検索関連
  SEARCH_ERROR: "SEARCH_ERROR",
  QUERY_PARSE_ERROR: "QUERY_PARSE_ERROR",

  // グラフ関連
  ENTITY_EXTRACTION_ERROR: "ENTITY_EXTRACTION_ERROR",
  RELATION_EXTRACTION_ERROR: "RELATION_EXTRACTION_ERROR",
  COMMUNITY_DETECTION_ERROR: "COMMUNITY_DETECTION_ERROR",

  // 汎用
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const);
```

### 7.2 設計書の修正

以下の設計書でエラーコードを修正:

- `design-base-converter.md`: INVALID_INPUT → VALIDATION_ERROR
- `design-registry.md`: INVALID_INPUT → VALIDATION_ERROR, NOT_FOUND → CONVERTER_NOT_FOUND

---

## 8. 変更履歴

| 日付       | バージョン | 変更者 | 変更内容                     |
| ---------- | ---------- | ------ | ---------------------------- |
| 2025-12-20 | 1.0.0      | AI     | 初版作成（エラーコード分析） |
