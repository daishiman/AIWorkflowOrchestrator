# Markdown/コードコンバーター実装要件詳細

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| ドキュメント | 実装要件詳細化                                  |
| タスクID     | CONV-02-03                                      |
| 作成日       | 2025-12-25                                      |
| ステータス   | Phase 0: 要件定義完了                           |
| 依存タスク   | CONV-02-01 (ファイル変換基盤・インターフェース) |

---

## 1. 概要

### 1.1 目的

Markdown、TypeScript、JavaScript、Python、YAMLファイルを変換するコンバーターを実装し、RAGシステムで検索可能なテキスト形式に変換する。

### 1.2 背景

- CONV-02-01で`BaseConverter`とインターフェースが実装済み
- CONV-02-02でテキスト系コンバーター（PlainText、HTML、CSV、JSON）が実装済み
- コード系ファイル（Markdown、TypeScript、JavaScript、Python、YAML）への対応が必要

### 1.3 スコープ

#### 含むもの

- MarkdownConverter実装
- CodeConverter実装（TypeScript/JavaScript/Python対応）
- YAMLConverter実装
- 各コンバーターのユニットテスト

#### 含まないもの

- AST（抽象構文木）解析（正規表現ベースの簡易実装のみ）
- js-yamlライブラリの導入（正規表現ベースの簡易実装のみ）
- 多言語検出（日本語/英語のみ）
- コードブロック内のシンタックスハイライト

---

## 2. 依存関係の確認

### 2.1 BaseConverter

**確認済み**: `packages/shared/src/services/conversion/base-converter.ts`

#### 継承必須要素

```typescript
export abstract class BaseConverter implements IConverter {
  // 実装必須プロパティ
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly supportedMimeTypes: readonly string[];
  abstract readonly priority: number;

  // 実装必須メソッド
  protected abstract doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>>;
}
```

#### 利用可能なヘルパーメソッド

- `getTextContent(input)`: content を string 型で取得（ArrayBuffer → デコード）
- `validateInput(input)`: 入力バリデーション
- `handleError(error, input)`: エラーハンドリング
- `trimContent(content, maxLength)`: コンテンツの最大長トリミング
- `getContentSize(input)`: コンテンツサイズ取得

### 2.2 型定義

**確認済み**: `packages/shared/src/services/conversion/types.ts`

#### ConverterInput

```typescript
interface ConverterInput {
  readonly fileId: FileId; // ファイル一意識別子
  readonly filePath: string; // ファイル絶対パス
  readonly mimeType: string; // MIMEタイプ
  readonly content: ArrayBuffer | string; // ファイル内容
  readonly encoding: string; // 文字エンコーディング（デフォルト: "utf-8"）
  readonly metadata?: Record<string, unknown>; // 追加メタデータ
}
```

#### ConverterOutput

```typescript
interface ConverterOutput {
  readonly convertedContent: string; // 変換後のテキスト
  readonly extractedMetadata: ExtractedMetadata; // 抽出されたメタデータ
  readonly processingTime: number; // 処理時間（ミリ秒）
}
```

#### ExtractedMetadata

```typescript
interface ExtractedMetadata {
  readonly title: string | null; // タイトル
  readonly author: string | null; // 著者
  readonly language: "ja" | "en"; // 言語コード
  readonly wordCount: number; // 単語数
  readonly lineCount: number; // 行数
  readonly charCount: number; // 文字数
  readonly headers: Array<{ level: number; text: string }>; // 見出し配列
  readonly codeBlocks: number; // コードブロック数
  readonly links: string[]; // リンク配列
  readonly custom: Record<string, unknown>; // カスタムメタデータ
}
```

**重要**: `headers` フィールドは `Array<{ level: number; text: string }>` 形式であり、元タスク定義の `string[]` 形式とは異なる。

#### ConverterOptions

```typescript
interface ConverterOptions {
  readonly preserveFormatting?: boolean; // フォーマット保持（デフォルト: false）
  readonly extractLinks?: boolean; // リンク抽出（デフォルト: true）
  readonly extractHeaders?: boolean; // 見出し抽出（デフォルト: true）
  readonly maxContentLength?: number; // コンテンツ最大長
  readonly language?: string; // 言語ヒント
  readonly timeout?: number; // タイムアウト時間
  readonly custom?: Record<string, unknown>; // カスタムオプション
}
```

### 2.3 エラーハンドリング

**確認済み**: `packages/shared/src/types/rag/errors.ts`

#### Result型

```typescript
import { ok, err } from "../../types/rag/result";
import { createRAGError, ErrorCodes } from "../../types/rag/errors";

// 成功時
return ok({ convertedContent, extractedMetadata, processingTime: 0 });

// エラー時
return err(
  createRAGError(
    ErrorCodes.CONVERSION_FAILED,
    "Failed to convert Markdown",
    { fileId: input.fileId },
    error as Error,
  ),
);
```

#### エラーコード

- `ErrorCodes.CONVERSION_FAILED`: 変換処理中のエラー
- `ErrorCodes.VALIDATION_ERROR`: 入力データが不正
- `ErrorCodes.UNSUPPORTED_FILE_TYPE`: サポートされていない形式

---

## 3. MarkdownConverter 要件

### 3.1 基本仕様

#### 3.1.1 メタデータ

```typescript
readonly id = "markdown";
readonly name = "Markdown Converter";
readonly supportedMimeTypes = ["text/markdown", "text/x-markdown"] as const;
readonly priority = 10;
```

#### 3.1.2 入力

- **MIMEタイプ**: `text/markdown`, `text/x-markdown`
- **content型**: `string` または `ArrayBuffer`
- **encoding**: デフォルト `utf-8`

#### 3.1.3 出力

- **convertedContent**: 正規化されたMarkdownテキスト
- **extractedMetadata**: 抽出されたメタデータ（下記参照）

### 3.2 正規化処理

#### 3.2.1 必須処理

1. **BOM除去**: `\uFEFF` を削除
2. **改行コード統一**: `\r\n` → `\n`, `\r` → `\n`
3. **連続空行制限**: 3行以上の連続空行 → 2行
4. **フロントマター除去**: YAML形式のフロントマター（`---\n...\n---\n`）を除去
   - フロントマターは `custom.frontmatter` に格納（将来拡張用）
5. **行末空白除去**: 各行の末尾空白を削除
6. **コードブロック保護**: コードブロック内（` ```...``` `）は正規化対象外

#### 3.2.2 正規化ロジック

````typescript
private normalizeMarkdown(content: string, options: ConverterOptions): string {
  let normalized = content;

  // 1. BOM除去
  normalized = normalized.replace(/^\uFEFF/, "");

  // 2. 改行コード統一
  normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 3. フロントマター除去
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatterMatch) {
    normalized = normalized.slice(frontmatterMatch[0].length);
  }

  // 4. 連続空行制限
  normalized = normalized.replace(/\n{3,}/g, "\n\n");

  // 5. コードブロック内外の分離処理
  const parts: string[] = [];
  const codeBlockRegex = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(normalized)) !== null) {
    // コードブロック前のテキスト → normalizeTextPart()
    parts.push(this.normalizeTextPart(normalized.slice(lastIndex, match.index)));
    // コードブロックはそのまま
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  // 残りのテキスト
  parts.push(this.normalizeTextPart(normalized.slice(lastIndex)));

  return parts.join("").trim();
}

private normalizeTextPart(text: string): string {
  // 行末空白除去
  return text.split("\n")
    .map(line => line.trimEnd())
    .join("\n");
}
````

### 3.3 メタデータ抽出

#### 3.3.1 extractedMetadata フィールド

```typescript
interface ExtractedMetadata {
  title: string | null; // 最初のh1見出し、なければnull
  author: string | null; // null（Markdownからは抽出不可）
  language: "ja" | "en"; // 言語検出（日本語文字100文字以上で"ja"）
  wordCount: number; // コードブロック除外後の単語数
  lineCount: number; // 行数
  charCount: number; // 文字数
  headers: Array<{ level: number; text: string }>; // 見出し配列
  codeBlocks: number; // コードブロック数
  links: string[]; // 外部URLのみ（重複なし）
  custom: Record<string, unknown>; // カスタムメタデータ
}
```

#### 3.3.2 見出し抽出

- **正規表現**: `/^(#{1,6})\s+(.+)$/gm`
- **形式**: `{ level: number, text: string }`
  - `level`: 1～6（h1～h6に対応）
  - `text`: 見出しテキスト（`#` 記号を除く）
- **例**:
  ```typescript
  // "# タイトル" → { level: 1, text: "タイトル" }
  // "## サブタイトル" → { level: 2, text: "サブタイトル" }
  ```

#### 3.3.3 タイトル抽出

- **ルール**: 最初の `h1` 見出し（`# ...`）をタイトルとする
- **正規表現**: `/^#\s+(.+)$/m`
- **見つからない場合**: `null`

#### 3.3.4 リンク抽出

- **正規表現**: `/\[([^\]]+)\]\(([^)]+)\)/g`
- **条件**: `http` または `https` で始まるURLのみ
- **重複除去**: `[...new Set(links)]`

#### 3.3.5 コードブロックカウント

- **正規表現**: `/```[\s\S]*?```/g`
- **カウント**: マッチ数

#### 3.3.6 言語検出

- **日本語判定**: `[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]` が100文字以上
- **結果**: `"ja"` または `"en"`

#### 3.3.7 ワードカウント

- **コードブロック除外**: コードブロックを空文字に置換
- **分割**: `/\s+/` で分割
- **フィルタ**: 空文字列を除外

### 3.4 エラーハンドリング

#### 3.4.1 エラーケース

1. **content が null/undefined**: `validateInput()` でエラー
2. **デコード失敗**: `handleError()` でエラー
3. **予期しない例外**: `try-catch` で捕捉し `Result.err` を返す

#### 3.4.2 エラーレスポンス

```typescript
return err(
  createRAGError(
    ErrorCodes.CONVERSION_FAILED,
    "Failed to convert Markdown",
    { fileId: input.fileId },
    error as Error,
  ),
);
```

---

## 4. CodeConverter 要件

### 4.1 基本仕様

#### 4.1.1 メタデータ

```typescript
readonly id = "code";
readonly name = "Code File Converter";
readonly supportedMimeTypes = [
  "text/x-typescript",
  "text/typescript",
  "application/typescript",
  "text/javascript",
  "application/javascript",
  "text/x-python",
  "text/x-python-script",
  "application/x-python",
] as const;
readonly priority = 10;
```

#### 4.1.2 対応言語

- **TypeScript**: `.ts`, `.tsx`, `.mts`, `.cts`
- **JavaScript**: `.js`, `.jsx`, `.mjs`, `.cjs`
- **Python**: `.py`

### 4.2 言語判定

#### 4.2.1 判定ロジック

```typescript
private detectLanguage(mimeType: string, filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    mts: "typescript",
    cts: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
  };

  return languageMap[ext ?? ""] ?? "text";
}
```

### 4.3 構造抽出

#### 4.3.1 JavaScript/TypeScript構造抽出

**関数定義**:

- 正規表現: `/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g`
- 例: `function foo()`, `export async function bar()`

**アロー関数**:

- 正規表現: `/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g`
- 例: `const foo = () =>`, `export const bar = async ()`

**クラス定義**:

- 正規表現: `/(?:export\s+)?class\s+(\w+)/g`
- 例: `class Foo`, `export class Bar`

**インポート**:

- 正規表現: `/import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g`
- 例: `import foo from "bar"`, `import "baz"`

**エクスポート**:

- 正規表現: `/export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g`
- 例: `export const foo`, `export default class Bar`

#### 4.3.2 Python構造抽出

**関数定義**:

- 正規表現: `/def\s+(\w+)\s*\(/g`
- 例: `def foo()`

**クラス定義**:

- 正規表現: `/class\s+(\w+)/g`
- 例: `class Foo`

**インポート**:

- 正規表現: `/(?:from\s+(\S+)\s+)?import\s+(.+)/g`
- 例: `from foo import bar`, `import baz`

#### 4.3.3 CodeStructure インターフェース

```typescript
interface CodeStructure {
  functions: string[]; // 関数名の配列
  classes: string[]; // クラス名の配列
  imports: string[]; // インポート元の配列
  exports: string[]; // エクスポート名の配列
  comments: string[]; // コメント（将来拡張用、現在は未使用）
}
```

### 4.4 Markdown形式での整形

#### 4.4.1 出力フォーマット

````markdown
## Code Structure

### Classes

- `Foo`
- `Bar`

### Functions

- `baz`
- `qux`

## Source Code

```typescript
// 元のソースコード
```
````

````

#### 4.4.2 実装

```typescript
private formatAsMarkdown(
  content: string,
  language: string,
  structure: CodeStructure,
): string {
  const parts: string[] = [];

  // 構造情報サマリー
  if (structure.classes.length > 0 || structure.functions.length > 0) {
    parts.push("## Code Structure\n");

    if (structure.classes.length > 0) {
      parts.push("### Classes");
      parts.push(structure.classes.map(c => `- \`${c}\``).join("\n"));
      parts.push("");
    }

    if (structure.functions.length > 0) {
      parts.push("### Functions");
      parts.push(structure.functions.map(f => `- \`${f}\``).join("\n"));
      parts.push("");
    }
  }

  // コード本体
  parts.push("## Source Code\n");
  parts.push(`\`\`\`${language}`);
  parts.push(content);
  parts.push("```");

  return parts.join("\n");
}
````

### 4.5 メタデータ生成

#### 4.5.1 extractedMetadata フィールド

```typescript
{
  title: null,                       // コードファイルにはタイトルなし
  author: null,                      // null
  language: "typescript" | "javascript" | "python",  // 判定された言語
  wordCount: number,                 // 単語数
  lineCount: number,                 // 行数
  charCount: number,                 // 文字数
  headers: [                         // クラス・関数を見出しとして扱う
    { level: 2, text: `class ${className}` },
    { level: 2, text: `function ${functionName}` },
    ...
  ],
  codeBlocks: 1,                     // ソースコード全体を1つのコードブロックとして扱う
  links: [],                         // コードファイルにはリンクなし
  custom: {
    language: string,                // 言語名
    classCount: number,              // クラス数
    functionCount: number,           // 関数数
    importCount: number,             // インポート数
    exportCount: number,             // エクスポート数
    classes: string[],               // クラス名の配列
    functions: string[],             // 関数名の配列
  }
}
```

---

## 5. YAMLConverter 要件

### 5.1 基本仕様

#### 5.1.1 メタデータ

```typescript
readonly id = "yaml";
readonly name = "YAML Converter";
readonly supportedMimeTypes = [
  "text/yaml",
  "text/x-yaml",
  "application/yaml",
  "application/x-yaml",
] as const;
readonly priority = 10;
```

### 5.2 YAML構造解析

#### 5.2.1 トップレベルキー抽出

- **正規表現**: `/^([a-zA-Z_][a-zA-Z0-9_]*):/`
- **条件**: 行頭にあるキー（インデントなし）
- **例**: `key:` → `["key"]`

#### 5.2.2 コメント検出

- **正規表現**: `/^\s*#/`
- **結果**: `boolean`（コメントが存在するか）

#### 5.2.3 インデント深さ検出

- **正規表現**: `/^(\s*)/`
- **計算**: インデント長 ÷ 2（2スペース = 1レベル）
- **結果**: 最大インデント深さ

#### 5.2.4 YAMLStructure インターフェース

```typescript
interface YAMLStructure {
  topLevelKeys: string[]; // トップレベルキーの配列
  hasComments: boolean; // コメントの有無
  maxDepth: number; // 最大インデント深さ
}
```

### 5.3 Markdown形式での整形

#### 5.3.1 出力フォーマット

````markdown
## Structure

### Top-level Keys

- `key1`
- `key2`

## Content

```yaml
# 元のYAML内容
```
````

````

### 5.4 メタデータ生成

#### 5.4.1 extractedMetadata フィールド

```typescript
{
  title: null,                       // YAMLファイルにはタイトルなし
  author: null,                      // null
  language: "en",                    // YAMLは通常英語
  wordCount: number,                 // 単語数
  lineCount: number,                 // 行数
  charCount: number,                 // 文字数
  headers: [                         // トップレベルキーを見出しとして扱う
    { level: 2, text: `${key}` },
    ...
  ],
  codeBlocks: 1,                     // YAML全体を1つのコードブロックとして扱う
  links: [],                         // YAMLファイルにはリンクなし
  custom: {
    topLevelKeys: string[],          // トップレベルキーの配列
    hasComments: boolean,            // コメントの有無
    nestedDepth: number,             // 最大インデント深さ
  }
}
````

---

## 6. 共通要件

### 6.1 BaseConverter継承

すべてのコンバーターは`BaseConverter`を継承し、以下を実装する：

```typescript
export class MarkdownConverter extends BaseConverter {
  readonly id = "markdown";
  readonly name = "Markdown Converter";
  readonly supportedMimeTypes = ["text/markdown", "text/x-markdown"] as const;
  readonly priority = 10;

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    // 実装
  }
}
```

### 6.2 content型の処理

#### 6.2.1 型判定

```typescript
let content: string;
if (typeof input.content === "string") {
  content = input.content;
} else {
  // ArrayBuffer → デコード
  content = new TextDecoder(input.encoding || "utf-8").decode(input.content);
}
```

または `BaseConverter.getTextContent()` を使用:

```typescript
const content = this.getTextContent(input);
```

### 6.3 エラーハンドリング

#### 6.3.1 try-catch パターン

```typescript
protected async doConvert(
  input: ConverterInput,
  options: ConverterOptions,
): Promise<Result<ConverterOutput, RAGError>> {
  try {
    // 変換処理
    return ok({ convertedContent, extractedMetadata, processingTime: 0 });
  } catch (error) {
    return err(createRAGError(
      ErrorCodes.CONVERSION_FAILED,
      `Failed to convert ${this.id}`,
      { fileId: input.fileId },
      error as Error
    ));
  }
}
```

### 6.4 ExtractedMetadata整合性

#### 6.4.1 headers フィールドの注意点

元タスク定義では `string[]` 形式だったが、実際の型定義は `Array<{ level: number; text: string }>` 形式である。

**修正が必要**:

```typescript
// 元のタスク定義（誤り）
headers: [`# ${title}`, `## ${subtitle}`];

// 正しい形式
headers: [
  { level: 1, text: title },
  { level: 2, text: subtitle },
];
```

#### 6.4.2 language フィールドの注意点

型定義では `"ja" | "en"` のみ許可されている。CodeConverterやYAMLConverterで `"typescript"` 等を設定することはできない。

**対応方針**:

- `language` フィールドは `"en"` または `"ja"` のみ
- 言語名（`"typescript"` 等）は `custom.language` に格納

```typescript
// CodeConverter の場合
{
  language: "en",           // 型定義に準拠
  custom: {
    language: "typescript", // 実際の言語名
    ...
  }
}
```

### 6.5 処理時間計測

`BaseConverter.convert()` メソッドが自動的に処理時間を計測するため、`doConvert()` では `processingTime: 0` を返す。

```typescript
return ok({
  convertedContent,
  extractedMetadata,
  processingTime: 0, // BaseConverterが自動設定
});
```

---

## 7. テスト要件

### 7.1 ユニットテスト

#### 7.1.1 テストケース

各コンバーターについて以下のテストケースを作成:

1. **正常系**:
   - 標準的なファイルの変換
   - メタデータの正しい抽出

2. **エッジケース**:
   - 空ファイル
   - 見出しなし
   - コードブロックなし
   - 巨大ファイル

3. **異常系**:
   - content が null
   - デコードエラー

#### 7.1.2 テストファイル配置

```
packages/shared/src/services/conversion/converters/__tests__/
├── markdown-converter.test.ts
├── code-converter.test.ts
└── yaml-converter.test.ts
```

### 7.2 カバレッジ目標

- 各コンバーターで80%以上のカバレッジ

---

## 8. 実装ガイドライン

### 8.1 正規表現の注意点

#### 8.1.1 グローバルフラグ

正規表現に `g` フラグを使用する場合、`RegExp.exec()` はステートフルなので注意。

```typescript
// 正しい
const regex = /pattern/g;
let match;
while ((match = regex.exec(content)) !== null) {
  // 処理
}

// 誤り（無限ループの可能性）
const regex = /pattern/g;
while (regex.exec(content)) {
  // 処理
}
```

#### 8.1.2 パフォーマンス

- 大規模ファイルでのパフォーマンスを考慮
- 必要に応じて早期リターンを実装

### 8.2 型安全性

#### 8.2.1 ExtractedMetadata 生成

型定義に準拠したオブジェクトを生成:

```typescript
const metadata: ExtractedMetadata = {
  title: titleMatch ? titleMatch[1] : null,
  author: null,
  language: "ja", // "ja" | "en" のみ
  wordCount: words.length,
  lineCount: lines.length,
  charCount: content.length,
  headers: headers.map((h) => ({ level: h.level, text: h.text })),
  codeBlocks: codeBlockCount,
  links: [...new Set(links)],
  custom: {
    // カスタムフィールド
  },
};
```

### 8.3 コードの可読性

- メソッド分割: 複雑なロジックは小さなメソッドに分割
- 命名規則: `private` メソッドは明確な命名
- コメント: 複雑なロジックには説明コメントを追加

---

## 9. 将来拡張（未完了タスク候補）

### 9.1 AST解析への拡張

現在は正規表現ベースの簡易実装だが、将来的にAST解析を導入する可能性がある。

- **TypeScript**: TypeScript Compiler API
- **JavaScript**: `@babel/parser`
- **Python**: `ast` モジュール（Python環境が必要）

### 9.2 js-yamlライブラリの導入

完全なYAMLパースが必要な場合、`js-yaml` ライブラリの導入を検討。

### 9.3 多言語検出

現在は日本語/英語のみだが、将来的に他言語の検出を追加。

### 9.4 コードコメント抽出

JSDoc、Pythonドキュメンテーション文字列等のコメント抽出。

---

## 10. 受け入れ基準

### 10.1 機能要件

- [ ] MarkdownConverterが正規化を実行できる
- [ ] MarkdownConverterが見出しを `Array<{ level, text }>` 形式で抽出できる
- [ ] MarkdownConverterがリンクを抽出できる
- [ ] CodeConverterがTypeScript/JavaScript/Pythonの構造を抽出できる
- [ ] CodeConverterが関数・クラス・インポート・エクスポートを検出できる
- [ ] YAMLConverterがYAML構造を解析できる

### 10.2 品質要件

- [ ] すべてのコンバーターがBaseConverterを継承している
- [ ] ExtractedMetadata型に準拠している
- [ ] Result型でエラーハンドリングしている
- [ ] ユニットテストが80%以上のカバレッジを達成している

### 10.3 非機能要件

- [ ] 型チェックがクリアしている
- [ ] ESLintエラーがない
- [ ] ビルドが成功する

---

## 11. リスク

| リスク                                        | 影響度 | 発生確率 | 対策                                                  |
| --------------------------------------------- | ------ | -------- | ----------------------------------------------------- |
| 正規表現パターンの誤検出                      | 中     | 中       | 十分なテストケースで検証                              |
| headers型定義の不整合（元タスク定義との差異） | 高     | 高       | 本要件定義書で明確化（`Array<{ level, text }>` 形式） |
| language型定義の制約（"ja" \| "en" のみ）     | 中     | 中       | custom.language に実際の言語名を格納                  |
| パフォーマンス問題（大規模ファイル）          | 中     | 低       | ベンチマークテストで検証                              |

---

## 12. 参照ドキュメント

- `docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md` - 元のタスク定義
- `packages/shared/src/services/conversion/base-converter.ts` - BaseConverter実装
- `packages/shared/src/services/conversion/types.ts` - 型定義
- `packages/shared/src/types/rag/index.ts` - RAG型定義
- `packages/shared/src/types/rag/errors.ts` - エラー型定義

---

## 変更履歴

| 日付       | バージョン | 変更内容                          |
| ---------- | ---------- | --------------------------------- |
| 2025-12-25 | 1.0.0      | 初版作成（Phase 0: 要件定義完了） |
