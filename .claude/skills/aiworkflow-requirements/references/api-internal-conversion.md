# 内部サービスAPI（RAG変換システム）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## ConversionService API

RAG Conversion Systemは、HTTPエンドポイントとしてではなく、TypeScriptの内部サービスクラスとして実装されています。

**利用場所**: `packages/shared/src/services/conversion/`

**主要クラス**:

| クラス              | 責務                                       |
| ------------------- | ------------------------------------------ |
| `ConversionService` | 変換処理の統括、タイムアウト・同時実行制御 |
| `ConverterRegistry` | 利用可能なコンバーターの管理と選択         |
| `BaseConverter`     | 共通変換処理の抽象基底クラス               |

### メソッド

#### convert()

```typescript
async convert(
  input: ConverterInput,
  options?: ConverterOptions
): Promise<Result<ConverterOutput, RAGError>>
```

**機能**:

- 単一ファイルを変換
- 同時実行数チェック（デフォルト: 最大5件）
- タイムアウト管理（デフォルト: 60秒）
- 自動コンバーター選択

**パラメータ**:

- `input.fileId`: ファイルID（Branded型）
- `input.content`: ファイルコンテンツ（文字列またはBuffer）
- `input.mimeType`: MIMEタイプ
- `input.filePath`: ファイルパス（オプション）
- `options.maxContentLength`: 最大コンテンツ長（デフォルト: 100,000文字）
- `options.timeout`: タイムアウト時間（ミリ秒）

**戻り値**:

- 成功: `{ success: true, data: ConverterOutput }`
- 失敗: `{ success: false, error: RAGError }`

#### convertBatch()

```typescript
async convertBatch(
  inputs: ConverterInput[],
  options?: ConverterOptions
): Promise<BatchConversionResult[]>
```

**機能**:

- 複数ファイルを一括変換
- チャンク単位で処理（同時実行数制限）
- Promise.allSettled()で一部失敗を許容

**戻り値**:

- 各ファイルの変換結果（成功/失敗）の配列

#### canConvert()

```typescript
canConvert(input: ConverterInput): boolean
```

**機能**:

- 変換可能性を事前確認
- コンバーター検索のみ（変換は実行しない）

#### getSupportedMimeTypes()

```typescript
getSupportedMimeTypes(): string[]
```

**機能**:

- サポートしているMIMEタイプ一覧を取得

### 使用パターン

**パターン1: グローバルインスタンス使用**

```typescript
import { globalConversionService } from "@repo/shared/services/conversion";

const result = await globalConversionService.convert(input);
```

**パターン2: カスタム設定インスタンス**

```typescript
import { createConversionService } from "@repo/shared/services/conversion";

const service = createConversionService(customRegistry, {
  defaultTimeout: 30000,
  maxConcurrentConversions: 10,
});

const result = await service.convert(input);
```

### エラーハンドリング

**エラーコード**:

| コード                | 説明               | 原因                                   |
| --------------------- | ------------------ | -------------------------------------- |
| `RESOURCE_EXHAUSTED`  | 同時実行数超過     | 最大同時実行数に到達                   |
| `TIMEOUT`             | タイムアウト       | 変換処理が指定時間内に完了しなかった   |
| `CONVERTER_NOT_FOUND` | コンバーター未検出 | 対応するコンバーターが登録されていない |
| `CONVERSION_FAILED`   | 変換失敗           | 個別コンバーターでのエラー             |

**Result型パターン**:

```typescript
const result = await service.convert(input);

if (result.success) {
  const { convertedContent, extractedMetadata } = result.data;
  // 成功時の処理
} else {
  const { code, message, context } = result.error;
  // エラー処理
  console.error(`[${code}] ${message}`, context);
}
```

### 性能特性

| 指標                       | 値     |
| -------------------------- | ------ |
| デフォルトタイムアウト     | 60秒   |
| 最大同時実行数             | 5件    |
| サポートMIMEタイプ         | 18種類 |
| 平均変換時間（小ファイル） | 3-50ms |
| 平均変換時間（Markdown）   | 400ms  |
