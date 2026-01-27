# IConverter 拡張ガイド

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [interfaces-converter.md](./interfaces-converter.md)

新規コンバーター実装時の拡張ポイントと実装パターン。

---

## BaseConverter 継承による実装

### 必須実装メソッド

| メソッド名 | 戻り値型 | 説明 |
| --- | --- | --- |
| `doConvert` | `Promise<Result<ConverterOutput, RAGError>>` | 入力を変換して結果を返す抽象メソッド |

**doConvertメソッドのパラメータ**:

| パラメータ | 型 | 説明 |
| --- | --- | --- |
| `input` | `ConverterInput` | 変換対象の入力データ |
| `options` | `ConverterOptions` | 変換オプション設定 |

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

### コンバータークラスの必須プロパティ

| プロパティ | 型 | 説明 | 例 |
| --- | --- | --- | --- |
| `id` | `string` | コンバーターの一意識別子 | `"minimal-converter"` |
| `name` | `string` | 表示名 | `"Minimal Converter"` |
| `supportedMimeTypes` | `readonly string[]` | 対応するMIMEタイプの配列 | `["text/minimal"]` |
| `priority` | `number` | 優先度（低いほど高優先） | `5` |

### doConvertメソッドの実装手順

実装は以下の5段階で構成される。

| 手順 | 処理内容 | 使用メソッド/操作 |
| --- | --- | --- |
| 1 | コンテンツ取得 | `this.getTextContent(input)` |
| 2 | 固有処理の実行 | コンバーター固有のロジック |
| 3 | コンテンツのトリミング | `this.trimContent(processed, options.maxContentLength)` |
| 4 | メタデータ生成 | ExtractedMetadataオブジェクトの構築 |
| 5 | Result型で返却 | `ok({ convertedContent, extractedMetadata, processingTime })` |

### 基本メタデータフィールド

| フィールド | 型 | 説明 | 初期値例 |
| --- | --- | --- | --- |
| `title` | `string \| null` | ドキュメントタイトル | `null` |
| `author` | `string \| null` | 作成者 | `null` |
| `language` | `string` | 言語コード | `"en"` |
| `wordCount` | `number` | 単語数 | 動的に計算 |
| `lineCount` | `number` | 行数 | 動的に計算 |
| `charCount` | `number` | 文字数 | 動的に計算 |
| `headers` | `string[]` | ヘッダー一覧 | `[]` |
| `codeBlocks` | `number` | コードブロック数 | `0` |
| `links` | `string[]` | リンク一覧 | `[]` |

### エラー発生時の処理

エラーが発生した場合は、`createRAGError`関数を使用して`err`結果を返却する。コンテキスト情報として`converterId`と`fileId`を含める。

---

## カスタムメタデータの追加

### パターン1: custom フィールドの活用（推奨）

既存のExtractedMetadata型には`custom`フィールドが用意されており、任意のカスタムデータを格納できる。

**customフィールドの構造**:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `custom` | `Record<string, unknown>` | 任意のキー・値ペアを格納可能 |

**格納可能なデータ例**:

| キー例 | 値の型 | 説明 |
| --- | --- | --- |
| `customField1` | `string` | 文字列型のカスタムデータ |
| `customField2` | `number` | 数値型のカスタムデータ |
| `customArray` | `string[]` | 配列型のカスタムデータ |

### パターン2: 型定義の拡張（共通化が必要な場合）

複数のコンバーターで共通して使用するフィールドは、型定義ファイルを更新して追加する。

**更新対象ファイル**: `packages/shared/src/services/conversion/types.ts`

**ExtractedMetadata型への新規フィールド追加ルール**:

| ルール | 説明 |
| --- | --- |
| オプショナルで追加 | 既存コンバーターとの互換性のため、`?`を付けてオプショナルにする |
| 既存フィールドは変更しない | 後方互換性を維持するため、既存フィールドの型や名前は変更しない |

---

## エラーハンドリングのベストプラクティス

### 推奨パターンの構造

1. try-catchでメイン処理を囲む
2. 正常終了時は`ok(result)`を返却
3. 異常終了時は`err(createRAGError(...))`を返却

### createRAGErrorに渡すパラメータ

| パラメータ | 説明 | 例 |
| --- | --- | --- |
| 第1引数: エラーコード | ErrorCodesからの定数 | `ErrorCodes.CONVERSION_FAILED` |
| 第2引数: メッセージ | エラー詳細メッセージ | `"Failed to convert: {error.message}"` |
| 第3引数: コンテキスト | 追加情報のオブジェクト | `{ converterId, fileId, mimeType, filePath }` |
| 第4引数: 元エラー | causeとして保持する元のError | `error as Error` |

### コンテキストに含める推奨情報

| キー | 説明 | 必須/推奨 |
| --- | --- | --- |
| `converterId` | コンバーターID | 必須 |
| `fileId` | 処理対象ファイルID | 必須 |
| `mimeType` | MIMEタイプ | 推奨 |
| `filePath` | ファイルパス | 推奨 |

### エラーコード選択基準

| エラーコード        | 使用場面                                         |
| ------------------- | ------------------------------------------------ |
| `VALIDATION_FAILED` | 入力検証エラー（MIMEタイプ不一致、不正な形式等） |
| `CONVERSION_FAILED` | 変換処理中のエラー（パース失敗、構造抽出失敗等） |
| `INTERNAL_ERROR`    | 予期しないシステムエラー                         |

---

## テストの実装パターン

### テストの前処理（beforeEach）

各テストの前に以下を実行して、クリーンな状態を確保する。

| 処理 | 説明 |
| --- | --- |
| `globalConverterRegistry.clear()` | レジストリをクリア |
| `resetRegistrationState()` | 登録状態をリセット |

### 基本テストケース一覧

| テストケース | 入力 | 期待結果 |
| --- | --- | --- |
| 有効な入力の変換 | 正常なテスト入力 | `result.success`が`true`、`convertedContent`が存在 |
| 空コンテンツの処理 | `content: ""`の入力 | `result.success`が`true`（空でもエラーにならない） |
| maxContentLengthの尊重 | 200,000文字の入力、オプション`maxContentLength: 100000` | 出力が100,000文字以下 |

### テストヘルパー関数の設計

テスト用の入力データを生成するヘルパー関数を用意する。

**関数名**: `createTestInput`

**パラメータ**:

| パラメータ | 型 | 説明 |
| --- | --- | --- |
| `overrides` | `Partial<ConverterInput>` | デフォルト値を上書きするオプション |

**戻り値（ConverterInput）のデフォルト値**:

| フィールド | デフォルト値 |
| --- | --- |
| `fileId` | `generateFileId()`で生成 |
| `content` | `"test content"` |
| `mimeType` | `"text/test"` |
| `filePath` | `"/test/file.txt"` |

---

## 関連ドキュメント

- [コンバーターインターフェース仕様](./interfaces-converter.md)
- [コンバーター実装クラス詳細](./interfaces-converter-implementations.md)
- [エラーハンドリング仕様](./error-handling.md)

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2025-01-26 | v1.1.0 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
