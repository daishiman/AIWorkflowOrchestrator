# コンバーター インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

ファイル変換処理の共通インターフェース。すべてのコンバーター実装が準拠する。

> **詳細設計**: `docs/30-workflows/completed-tasks/conversion-base/requirements-interface.md`
> **実装**: `packages/shared/src/services/conversion/types.ts`

## ドキュメント構成

| ドキュメント | ファイル | 説明 |
|-------------|----------|------|
| 実装クラス詳細 | [interfaces-converter-implementations.md](./interfaces-converter-implementations.md) | 各コンバーターの使用例とメタデータ |
| 拡張ガイド | [interfaces-converter-extension.md](./interfaces-converter-extension.md) | 新規コンバーター実装パターン |

---

## IConverter インターフェース

### 必須プロパティ

| プロパティ           | 型                  | 説明                     |
| -------------------- | ------------------- | ------------------------ |
| `id`                 | `string`            | コンバーターID（一意）   |
| `name`               | `string`            | コンバーター名（表示用） |
| `supportedMimeTypes` | `readonly string[]` | サポートMIMEタイプ       |
| `priority`           | `number`            | 優先度（高いほど優先）   |

### 必須メソッド

| メソッド                        | 戻り値                                       | 説明               |
| ------------------------------- | -------------------------------------------- | ------------------ |
| `canConvert(input)`             | `boolean`                                    | 変換可能性の判定   |
| `convert(input, options?)`      | `Promise<Result<ConverterOutput, RAGError>>` | ファイル変換実行   |
| `estimateProcessingTime(input)` | `number`                                     | 推定処理時間（ms） |

### 使用例

```typescript
import { globalConverterRegistry } from "@repo/shared/services/conversion";

const result = globalConverterRegistry.findConverter(input);
if (result.success) {
  const converted = await result.data.convert(input);
}
```

---

## 実装クラス一覧

| 実装クラス         | サポートMIME                                      | 優先度 | 実装状況 |
| ------------------ | ------------------------------------------------- | ------ | -------- |
| HTMLConverter      | text/html                                         | 10     | 実装済 |
| MarkdownConverter  | text/markdown, text/x-markdown                    | 10     | 実装済 |
| CodeConverter      | text/x-typescript, text/javascript, text/x-python | 10     | 実装済 |
| YAMLConverter      | application/x-yaml, text/yaml, text/x-yaml        | 10     | 実装済 |
| CSVConverter       | text/csv, text/tab-separated-values               | 5      | 実装済 |
| JSONConverter      | application/json                                  | 5      | 実装済 |
| PlainTextConverter | text/plain                                        | 0      | 未実装 |

詳細な使用例は [interfaces-converter-implementations.md](./interfaces-converter-implementations.md) を参照。

---

## 関連ドキュメント

- [内部API仕様（ConversionService）](./api-internal-conversion.md)
- [コアインターフェース仕様](./interfaces-core.md)
- [エラーハンドリング仕様](./error-handling.md)
