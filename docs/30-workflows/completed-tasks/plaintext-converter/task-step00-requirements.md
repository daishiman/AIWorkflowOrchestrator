# PlainTextConverter 詳細要件定義書

## メタ情報

| 項目           | 内容                           |
| -------------- | ------------------------------ |
| タスクID       | QUALITY-02 / T-00-1            |
| ドキュメント名 | PlainTextConverter詳細要件定義 |
| 作成日         | 2025-12-25                     |
| ステータス     | 完了                           |
| Phase          | Phase 0: 要件定義              |

---

## 1. 既存実装調査結果

### 1.1 BaseConverterインターフェース分析

**ファイル**: `packages/shared/src/services/conversion/base-converter.ts`

**必須実装プロパティ**:
| プロパティ | 型 | 説明 | PlainTextConverterでの値 |
|-----------|-----|------|-------------------------|
| `id` | `string` | コンバーターID（一意、ケバブケース） | `"plain-text-converter"` |
| `name` | `string` | 表示名 | `"Plain Text Converter"` |
| `supportedMimeTypes` | `readonly string[]` | サポートMIMEタイプ | `["text/plain"]` |
| `priority` | `number` | 優先度（高いほど優先） | `0`（フォールバック） |

**必須実装メソッド**:
| メソッド | シグネチャ | 説明 |
|---------|-----------|------|
| `doConvert` | `(input: ConverterInput, options: ConverterOptions) => Promise<Result<ConverterOutput, RAGError>>` | 実変換処理 |

**利用可能ヘルパー**:
| メソッド | 説明 |
|---------|------|
| `getTextContent(input)` | 入力からテキストコンテンツを取得（ArrayBuffer対応） |
| `trimContent(content, maxLength)` | コンテンツを最大長でトリミング |
| `validateInput(input)` | 入力バリデーション |
| `handleError(error, input)` | エラーハンドリング |

**オプショナルフック**:
| メソッド | デフォルト動作 | オーバーライド推奨度 |
|---------|---------------|---------------------|
| `preprocess(input, options)` | 入力をそのまま返す | 低（必要な場合のみ） |
| `postprocess(output, input, options)` | 出力をそのまま返す | 低（必要な場合のみ） |
| `getDescription()` | MIMEタイプ説明 | 推奨 |
| `getVersion()` | "1.0.0" | 低 |

### 1.2 HTMLConverter実装パターン分析

**ファイル**: `packages/shared/src/services/conversion/converters/html-converter.ts`

**参考になるパターン**:

1. **メタデータ抽出パターン**:

   ```typescript
   // ベースメタデータ（テキストから抽出）
   const baseMetadata = MetadataExtractor.extractFromText(text, options);

   // 固有メタデータ（フォーマット固有の情報）
   const htmlMetadata = this.extractHTMLMetadata(html);

   // マージして返す
   const extractedMetadata = this.mergeMetadata(baseMetadata, htmlMetadata);
   ```

2. **エラーハンドリングパターン**:

   ```typescript
   try {
     // 変換処理
     return ok({ convertedContent, extractedMetadata, processingTime: 0 });
   } catch (error) {
     return err(
       createRAGError(
         ErrorCodes.CONVERSION_FAILED,
         `Failed to convert: ${error instanceof Error ? error.message : String(error)}`,
         {
           converterId: this.id,
           fileId: input.fileId,
           mimeType: input.mimeType,
         },
         error as Error,
       ),
     );
   }
   ```

3. **JSDocパターン**: 全メソッドにJSDocコメント記述

### 1.3 レジストリ登録パターン分析

**ファイル**: `packages/shared/src/services/conversion/converters/index.ts`

**登録手順**:

1. クラスをエクスポート: `export { PlainTextConverter } from "./plain-text-converter";`
2. クラスをインポート: `import { PlainTextConverter } from "./plain-text-converter";`
3. レジストリに登録（`registerDefaultConverters`内）

**現在の優先度設定**:
| コンバーター | priority | 説明 |
|-------------|----------|------|
| HTMLConverter | 10 | 高優先度 |
| JSONConverter | 5 | 中優先度 |
| CSVConverter | 5 | 中優先度 |
| PlainTextConverter | 0 | フォールバック（追加予定） |

---

## 2. PlainTextConverter要件仕様

### 2.1 機能要件

#### FR-001: BOM除去機能

**概要**: Byte Order Mark（BOM）を自動的に検出・除去する

**詳細仕様**:
| BOMタイプ | バイトシーケンス | Unicode表現 | 対応必須度 |
|----------|-----------------|-------------|-----------|
| UTF-8 BOM | `0xEF 0xBB 0xBF` | `\uFEFF` | 必須 |
| UTF-16 BE BOM | `0xFE 0xFF` | `\uFEFF` | 推奨 |
| UTF-16 LE BOM | `0xFF 0xFE` | `\uFEFF` | 推奨 |
| UTF-32 BE BOM | `0x00 0x00 0xFE 0xFF` | - | 任意 |
| UTF-32 LE BOM | `0xFF 0xFE 0x00 0x00` | - | 任意 |

**実装方針**:

- 文字列として取得後のBOM除去（`\uFEFF`のチェック）を基本とする
- ArrayBuffer入力の場合はバイトシーケンスでの検出も考慮

**テストケース**:
| ケース | 入力 | 期待出力 |
|--------|------|----------|
| UTF-8 BOM付き | `\uFEFFHello` | `Hello` |
| BOMなし | `Hello` | `Hello` |
| 空文字列 | `""` | `""` |
| BOMのみ | `\uFEFF` | `""` |

#### FR-002: 改行コード正規化機能

**概要**: 異なるプラットフォームの改行コードをLFに統一する

**詳細仕様**:
| 元の改行コード | プラットフォーム | 変換先 |
|---------------|-----------------|--------|
| CRLF (`\r\n`) | Windows | LF (`\n`) |
| CR (`\r`) | Classic Mac | LF (`\n`) |
| LF (`\n`) | Unix/Linux/macOS | そのまま |

**処理順序**: CRLF → CR の順で置換（順序重要）

**実装方針**:

```typescript
text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
```

**テストケース**:
| ケース | 入力 | 期待出力 |
|--------|------|----------|
| CRLF | `Line1\r\nLine2` | `Line1\nLine2` |
| CR | `Line1\rLine2` | `Line1\nLine2` |
| LF | `Line1\nLine2` | `Line1\nLine2` |
| 混在 | `A\r\nB\rC\nD` | `A\nB\nC\nD` |
| 連続CRLF | `A\r\n\r\nB` | `A\n\nB` |

#### FR-003: メタデータ抽出機能

**概要**: プレーンテキスト固有のメタデータを抽出する

**抽出項目**:
| 項目 | 型 | 計算方法 | 説明 |
|------|-----|---------|------|
| `lineCount` | `number` | `text.split('\n').length` | 行数 |
| `wordCount` | `number` | `text.split(/\s+/).filter(w => w.length > 0).length` | 単語数 |
| `charCount` | `number` | `text.length` | 文字数 |

**BaseMetadataとの統合**:

- `MetadataExtractor.extractFromText()` を使用してベースメタデータを抽出
- プレーンテキスト固有のメタデータを追加/上書き

**テストケース**:
| ケース | 入力 | 期待メタデータ |
|--------|------|---------------|
| 単一行 | `Hello World` | `lines: 1, words: 2, chars: 11` |
| 複数行 | `A\nB\nC` | `lines: 3, words: 3, chars: 5` |
| 空白のみ | `   \n  ` | `lines: 2, words: 0, chars: 6` |
| 空文字列 | `""` | `lines: 1, words: 0, chars: 0` |
| 日本語 | `こんにちは 世界` | `lines: 1, words: 2, chars: 8` |
| 複数スペース | `Hello   World` | `lines: 1, words: 2, chars: 13` |

### 2.2 非機能要件

#### NFR-001: パフォーマンス

| メトリクス       | 目標値               | 備考                       |
| ---------------- | -------------------- | -------------------------- |
| 変換速度（1KB）  | < 1ms                | 単純処理のため高速         |
| 変換速度（1MB）  | < 100ms              | 許容範囲                   |
| 変換速度（10MB） | < 1000ms             | 大規模ファイル             |
| メモリ使用量     | ≤ ファイルサイズ × 3 | 文字列操作による一時メモリ |

#### NFR-002: 信頼性

| 項目               | 要件                             |
| ------------------ | -------------------------------- |
| エラーハンドリング | 全例外をResult型でラップ         |
| バリデーション     | BaseConverterのvalidateInput使用 |
| 入力安全性         | null/undefined入力でのエラー回避 |

#### NFR-003: 互換性

| 項目                 | 要件                       |
| -------------------- | -------------------------- |
| MIMEタイプ           | `text/plain`               |
| エンコーディング入力 | UTF-8, UTF-16（BOMで検出） |
| エンコーディング出力 | UTF-8（LF改行）            |

### 2.3 インターフェース仕様

#### 入力 (ConverterInput)

```typescript
interface ConverterInput {
  fileId: FileId; // ファイルID
  filePath: string; // ファイルパス
  mimeType: string; // "text/plain"
  content: string | ArrayBuffer; // ファイル内容
  encoding: string; // "utf-8" 等
}
```

#### 出力 (ConverterOutput)

```typescript
interface ConverterOutput {
  convertedContent: string; // 変換後テキスト（BOM除去、LF正規化済み）
  extractedMetadata: ExtractedMetadata; // 抽出メタデータ
  processingTime: number; // 処理時間(ms)
}
```

#### 抽出メタデータ (ExtractedMetadata)

```typescript
interface ExtractedMetadata {
  title?: string; // ファイル名から推定（任意）
  author?: string; // null
  language?: string; // 推定言語（任意）
  wordCount: number; // 単語数
  lineCount: number; // 行数
  charCount: number; // 文字数
  headers: Array<{ level: number; text: string }>; // 空配列
  codeBlocks: Array<{ language: string; content: string }>; // 空配列
  links: Array<{ url: string; text: string }>; // 空配列
  custom?: Record<string, unknown>; // 拡張用
}
```

---

## 3. 設計制約

### 3.1 アーキテクチャ制約

| 制約     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 継承     | `BaseConverter` を継承すること                       |
| パターン | Template Methodパターンに従うこと                    |
| 状態     | ステートレスであること（コンストラクタでの設定のみ） |

### 3.2 コーディング規約

| 項目       | 規約                               |
| ---------- | ---------------------------------- |
| JSDoc      | 全publicメソッドに記述必須         |
| エラー     | Result型で返却（例外スローしない） |
| 定数       | マジックナンバー禁止（定数化）     |
| 関数サイズ | 1関数20行以内推奨                  |

### 3.3 テスト要件

| 項目           | 目標                                |
| -------------- | ----------------------------------- |
| カバレッジ     | ≥ 95%                               |
| テストケース数 | ≥ 20                                |
| エッジケース   | 空ファイル、BOMのみ、巨大ファイル等 |

---

## 4. 優先度設定根拠

**priority: 0 の理由**:

1. **フォールバック役割**: 他のコンバーターで変換できない場合の最終手段
2. **汎用性**: `text/plain` は最も基本的なMIMEタイプ
3. **変換の軽量性**: 複雑な変換処理を行わない
4. **既存コンバーターとの棲み分け**:
   - HTML (priority: 10) > JSON (5) > CSV (5) > PlainText (0)

---

## 5. 完了条件チェックリスト

- [x] サポートするBOMタイプが明確（UTF-8必須、UTF-16推奨）
- [x] 改行コード正規化ルールが明確（CRLF/CR → LF）
- [x] メタデータ抽出項目が明確（行数、単語数、文字数）
- [x] 対応MIMEタイプが定義されている（text/plain）
- [x] 優先度が定義されている（priority: 0）
- [x] BaseConverterインターフェースが理解されている
- [x] 既存コンバーターの実装パターンが把握されている
- [x] パフォーマンス要件が定義されている
- [x] テスト要件が定義されている

---

## 6. 次フェーズへの引き継ぎ事項

### Phase 1: 設計へ

1. **クラス設計**: 本要件に基づきクラス構造を設計
2. **メソッド設計**: doConvert, removeBOM, normalizeLineEndings, extractPlainTextMetadataのシグネチャ定義
3. **エラーハンドリング設計**: 発生しうるエラーパターンの洗い出し

### 参照すべきファイル

- `packages/shared/src/services/conversion/base-converter.ts` - 親クラス
- `packages/shared/src/services/conversion/converters/html-converter.ts` - 参考実装
- `packages/shared/src/services/conversion/metadata-extractor.ts` - メタデータ抽出
- `packages/shared/src/services/conversion/types.ts` - 型定義

---

**作成日**: 2025-12-25
**作成者**: Requirements Analyst Agent
**レビュー状態**: 未レビュー
