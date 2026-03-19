# コンバーター実装クラス詳細

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [interfaces-converter.md](./interfaces-converter.md)

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|------------|----------|
| 2025-01-26 | 1.1.0 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |

---

## 実装クラス一覧

| 実装クラス         | サポートMIME                                      | 優先度 | 主要機能                             | 実装状況  |
| ------------------ | ------------------------------------------------- | ------ | ------------------------------------ | --------- |
| HTMLConverter      | text/html                                         | 10     | HTML→Markdown、script/style除去      | 実装済 |
| MarkdownConverter  | text/markdown, text/x-markdown                    | 10     | 見出し・リンク・コードブロック抽出   | 実装済 |
| CodeConverter      | text/x-typescript, text/javascript, text/x-python | 10     | 関数・クラス・インポート抽出         | 実装済 |
| YAMLConverter      | application/x-yaml, text/yaml, text/x-yaml        | 10     | 構造解析、トップレベルキー抽出       | 実装済 |
| CSVConverter       | text/csv, text/tab-separated-values               | 5      | CSV/TSV→テーブル、区切り文字自動検出 | 実装済 |
| JSONConverter      | application/json                                  | 5      | JSON→構造化Markdown、ネスト対応      | 実装済 |
| PlainTextConverter | text/plain                                        | 0      | BOM除去、改行コード正規化            | 未実装 |

---

## HTMLConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/html-converter.ts`

### 基本情報

| 項目 | 値 |
|------|-----|
| サポートMIMEタイプ | text/html |
| 優先度 | 10 |
| インポート元 | @repo/shared/services/conversion/converters/html-converter |

### 入力パラメータ

| パラメータ | 型 | 説明 | 例 |
|------------|-----|------|-----|
| fileId | string | ファイル識別子 | file-123 |
| filePath | string | ファイルパス | /path/to/page.html |
| mimeType | string | MIMEタイプ | text/html |
| content | string | HTML文字列 | HTMLドキュメント全体 |
| encoding | string | 文字エンコーディング | utf-8 |

### 変換処理

HTMLConverterはHTML文書をMarkdown形式に変換します。head要素内のscript/styleタグは除去され、body要素内の構造がMarkdownに変換されます。

#### 変換例

**入力**: titleタグに「ページタイトル」、h1タグに「見出し」、pタグに「本文」を含むHTMLドキュメント

**出力**:
- convertedContent: 見出しレベル1として「見出し」、続いて「本文」が出力される
- extractedMetadata: title、description、keywords、lang属性が抽出される

### 抽出メタデータ

| フィールド | 型 | 説明 |
|------------|-----|------|
| title | string または null | titleタグの内容 |
| description | string または null | meta descriptionの内容 |
| keywords | string または null | meta keywordsの内容 |
| lang | string または null | html要素のlang属性 |

---

## CSVConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/csv-converter.ts`

### 基本情報

| 項目 | 値 |
|------|-----|
| サポートMIMEタイプ | text/csv, text/tab-separated-values |
| 優先度 | 5 |
| インポート元 | @repo/shared/services/conversion/converters/csv-converter |

### 入力パラメータ

| パラメータ | 型 | 説明 | 例 |
|------------|-----|------|-----|
| fileId | string | ファイル識別子 | file-456 |
| filePath | string | ファイルパス | /path/to/users.csv |
| mimeType | string | MIMEタイプ | text/csv または text/tab-separated-values |
| content | string | CSV/TSV文字列 | ID,名前,年齢（改行）1,田中太郎,30 |
| encoding | string | 文字エンコーディング | utf-8 |

### 変換処理

CSVConverterはCSV/TSV形式のデータをMarkdownテーブルに変換します。区切り文字はMIMEタイプに基づいて自動検出されます。

#### CSV変換例

**入力**: 3カラム（ID, 名前, 年齢）、2行のCSVデータ

**出力**: Markdownテーブル形式で出力される

| ID | 名前 | 年齢 |
|----|------|------|
| 1 | 田中太郎 | 30 |
| 2 | 鈴木花子 | 25 |

#### TSV変換

TSV（タブ区切り）の場合も同様にMarkdownテーブルに変換されます。メタデータのdelimiterフィールドにはタブ文字が設定されます。

### 抽出メタデータ

| フィールド | 型 | 説明 |
|------------|-----|------|
| rowCount | number | データ行数（ヘッダー除く） |
| columnCount | number | カラム数 |
| delimiter | string | 区切り文字（カンマまたはタブ） |

---

## JSONConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/json-converter.ts`

### 基本情報

| 項目 | 値 |
|------|-----|
| サポートMIMEタイプ | application/json |
| 優先度 | 5 |
| インポート元 | @repo/shared/services/conversion/converters/json-converter |

### 入力パラメータ

| パラメータ | 型 | 説明 | 例 |
|------------|-----|------|-----|
| fileId | string | ファイル識別子 | file-abc |
| filePath | string | ファイルパス | /path/to/config.json |
| mimeType | string | MIMEタイプ | application/json |
| content | string | JSON文字列 | 設定オブジェクトのJSON文字列 |
| encoding | string | 文字エンコーディング | utf-8 |

### 変換処理

JSONConverterはJSON構造を構造化されたMarkdownに変換します。ネストされたオブジェクトは見出しレベルで階層化され、配列はリスト形式で表現されます。

#### 変換例

**入力**: title、version、features配列、configオブジェクトを含むJSON

**出力構造**:
- トップレベルキーはh2見出しとして出力
- 文字列・数値はその値が直接出力
- 配列要素はMarkdownリスト（ハイフン形式）で出力
- ネストされたオブジェクトはサブ見出し（h3以下）で階層化

### 抽出メタデータ

| フィールド | 型 | 説明 |
|------------|-----|------|
| depth | number | JSONの最大ネスト深度 |
| keyCount | number | 総キー数 |

---

## MarkdownConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/markdown-converter.ts`

### 基本情報

| 項目 | 値 |
|------|-----|
| サポートMIMEタイプ | text/markdown, text/x-markdown |
| 優先度 | 10 |
| インポート元 | @repo/shared/services/conversion/converters/markdown-converter |

### 入力パラメータ

| パラメータ | 型 | 説明 | 例 |
|------------|-----|------|-----|
| fileId | string | ファイル識別子 | file-md1 |
| filePath | string | ファイルパス | /path/to/document.md |
| mimeType | string | MIMEタイプ | text/markdown |
| content | string | Markdown文字列 | フロントマター付きMarkdownドキュメント |
| encoding | string | 文字エンコーディング | utf-8 |

### 変換処理

MarkdownConverterはMarkdownドキュメントを解析し、構造情報を抽出します。変換後のコンテンツはそのままのMarkdownですが、メタデータとして見出し構造、リンク、コードブロック情報などが抽出されます。

#### 解析対象

- YAML形式のフロントマター（title、author等）
- 見出し階層（レベルとテキスト）
- リンクURL
- コードブロック数
- 言語推定

### 抽出メタデータ

| フィールド | 型 | 説明 |
|------------|-----|------|
| title | string | フロントマターまたはh1から取得 |
| headers | array | 見出し情報の配列（level, text） |
| links | array | ドキュメント内のリンクURL一覧 |
| codeBlocks | number | コードブロックの総数 |
| language | string | 推定言語（例: ja） |
| hasFrontmatter | boolean | フロントマターの有無 |
| hasCodeBlocks | boolean | コードブロックの有無 |

---

## CodeConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/code-converter.ts`

### 基本情報

| 項目 | 値 |
|------|-----|
| サポートMIMEタイプ | text/x-typescript, text/javascript, text/x-python, その他 |
| 優先度 | 10 |
| インポート元 | @repo/shared/services/conversion/converters/code-converter |

### 入力パラメータ

| パラメータ | 型 | 説明 | 例 |
|------------|-----|------|-----|
| fileId | string | ファイル識別子 | file-ts1 |
| filePath | string | ファイルパス | /path/to/user.ts |
| mimeType | string | MIMEタイプ | text/x-typescript |
| content | string | ソースコード文字列 | TypeScript/JavaScript/Pythonコード |
| encoding | string | 文字エンコーディング | utf-8 |

### 変換処理

CodeConverterはソースコードを解析し、関数・クラス・インポート・エクスポート情報を抽出します。言語に応じた構文解析により、コード構造のメタデータを生成します。

#### 解析対象

- import文（モジュールパス）
- export文（エクスポート名）
- class定義（クラス名）
- function定義（関数名）
- アロー関数・関数式

### 抽出メタデータ

| フィールド | 型 | 説明 |
|------------|-----|------|
| language | string | プログラミング言語（例: typescript） |
| functions | array | 関数名の一覧 |
| classes | array | クラス名の一覧 |
| imports | array | インポート元モジュールパスの一覧 |
| exports | array | エクスポート名の一覧 |
| classCount | number | クラス定義の総数 |
| functionCount | number | 関数定義の総数 |

---

## YAMLConverter

**ファイルパス**: `packages/shared/src/services/conversion/converters/yaml-converter.ts`

### 基本情報

| 項目 | 値 |
|------|-----|
| サポートMIMEタイプ | application/x-yaml, text/yaml, text/x-yaml |
| 優先度 | 10 |
| インポート元 | @repo/shared/services/conversion/converters/yaml-converter |

### 入力パラメータ

| パラメータ | 型 | 説明 | 例 |
|------------|-----|------|-----|
| fileId | string | ファイル識別子 | file-yaml1 |
| filePath | string | ファイルパス | /path/to/config.yaml |
| mimeType | string | MIMEタイプ | application/x-yaml |
| content | string | YAML文字列 | アプリケーション設定YAML |
| encoding | string | 文字エンコーディング | utf-8 |

### 変換処理

YAMLConverterはYAML構造を解析し、トップレベルキーやネスト深度などの構造情報を抽出します。コメント行の有無も検出されます。

#### 解析例

**入力**: appセクション（name, version）とdatabaseセクション（host, port, credentials）を含むYAML

**抽出情報**:
- トップレベルキー: app, database
- コメント有無: あり
- 最大インデント深度: 4（credentialsの子要素）
- 総行数: 8

### 抽出メタデータ

| フィールド | 型 | 説明 |
|------------|-----|------|
| topLevelKeys | array | ルートレベルのキー名一覧 |
| hasComments | boolean | コメント行の有無 |
| maxIndentDepth | number | 最大インデント深度 |
| totalLines | number | 総行数 |

---

## PlainTextConverter（未実装）

**予定ファイルパス**: `packages/shared/src/services/conversion/converters/plain-text-converter.ts`

**関連タスク**: `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-plaintext-converter-implementation.md` (QUALITY-02)

### 基本情報（予定）

| 項目 | 値 |
|------|-----|
| サポートMIMEタイプ | text/plain |
| 優先度 | 0 |
| インポート元 | @repo/shared/services/conversion/converters/plain-text-converter |

### 入力パラメータ（予定）

| パラメータ | 型 | 説明 | 例 |
|------------|-----|------|-----|
| fileId | string | ファイル識別子 | file-xyz |
| filePath | string | ファイルパス | /path/to/readme.txt |
| mimeType | string | MIMEタイプ | text/plain |
| content | string | プレーンテキスト文字列 | BOM付きテキスト |
| encoding | string | 文字エンコーディング | utf-8 |

### 変換処理（予定）

PlainTextConverterは以下の正規化処理を行います:

1. **BOM除去**: UTF-8 BOM（U+FEFF）を文字列先頭から除去
2. **改行コード正規化**: CRLF（Windows）およびCR（旧Mac）をLF（Unix）に統一

変換後のコンテンツは正規化されたプレーンテキストとして出力されます。

---

## 関連ドキュメント

- [コンバーターインターフェース仕様](./interfaces-converter.md)
- [コンバーター拡張ガイド](./interfaces-converter-extension.md)
- [内部API仕様（ConversionService）](./api-internal-conversion.md)
