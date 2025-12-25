# YAMLConverter 詳細設計書

**作成日**: 2025-12-25
**フェーズ**: Phase 1-3 (T-01-3)
**対象**: `packages/shared/src/services/conversion/converters/yaml-converter.ts`

---

## 1. 概要

### 1.1 目的

YAMLConverter は YAML ファイルを RAG システム向けに最適化された Markdown 形式に変換するコンバータです。YAML 構造を解析し、トップレベルキー、コメント、インデント深さなどの構造情報をメタデータとして抽出します。

### 1.2 責務

- **YAML構造解析**: トップレベルキー、コメント、インデント深さの検出
- **Markdown形式整形**: YAML構造サマリー + YAML本体のフォーマット
- **メタデータ生成**: 構造情報を `ExtractedMetadata` 形式で提供
- **エラーハンドリング**: YAML パースエラーの適切な処理

### 1.3 入出力

#### 入力 (ConverterInput)

```typescript
{
  content: string | ArrayBuffer; // YAML ファイル内容
  mimeType: "application/x-yaml" | "text/yaml" | "text/x-yaml";
  filePath: string; // ".yml" または ".yaml"
}
```

#### 出力 (ConverterOutput)

```typescript
{
  convertedContent: string;  // Markdown形式の変換結果
  extractedMetadata: {
    title: string | null;                       // ファイル名ベース
    author: string | null;                      // null（YAMLには著者情報なし）
    language: "ja" | "en";                      // オプションから（デフォルト: "ja"）
    wordCount: number;                          // 空白区切りの単語数
    lineCount: number;                          // 行数
    charCount: number;                          // 文字数
    headers: Array<{ level: number; text: string }>;  // 空配列（YAMLにヘッダー概念なし）
    codeBlocks: number;                         // 1（YAML全体を1ブロックとして扱う）
    links: string[];                            // 空配列（YAMLにリンク概念なし）
    custom: {
      hasComments: boolean;                     // コメント有無
      maxIndentDepth: number;                   // 最大インデント深さ
      topLevelKeys: string[];                   // トップレベルキー一覧
      totalLines: number;                       // 空行を除く行数
    };
  };
  processingTime: number;
}
```

---

## 2. 前提条件

### 2.1 継承

```typescript
export class YAMLConverter extends BaseConverter {
  // BaseConverter の抽象メソッドを実装
}
```

### 2.2 依存型

- `BaseConverter` から: `ConverterInput`, `ConverterOutput`, `ConverterOptions`
- `types/rag` から: `Result`, `RAGError`, `ok`, `err`, `createRAGError`, `ErrorCodes`

### 2.3 制約

- `headers` フィールドは常に空配列（YAML にヘッダー概念なし）
- `language` フィールドは `"ja" | "en"` のみ（YAML構造解析には言語検出不要）
- YAML固有情報は `custom` フィールドに格納

---

## 3. メソッド設計

### 3.1 doConvert() - メイン変換ロジック

**シグネチャ**:

```typescript
protected async doConvert(
  input: ConverterInput,
  options: ConverterOptions,
): Promise<Result<ConverterOutput, RAGError>>
```

**処理フロー**:

```typescript
1. rawContent = this.getTextContent(input)
2. normalizedContent = this.normalizeYAML(rawContent)
3. yamlStructure = this.extractYAMLStructure(normalizedContent)
4. markdownContent = this.formatAsMarkdown(normalizedContent, yamlStructure)
5. trimmedContent = this.trimContent(markdownContent, options.maxContentLength)
6. extractedMetadata = this.extractYAMLMetadata(normalizedContent, yamlStructure, options)
7. return ok({ convertedContent: trimmedContent, extractedMetadata, processingTime: 0 })
```

**エラーハンドリング**:

```typescript
try {
  // 変換処理
} catch (error) {
  return err(
    createRAGError(
      ErrorCodes.CONVERSION_FAILED,
      `YAML conversion failed: ${error instanceof Error ? error.message : String(error)}`,
      { filePath: input.filePath, mimeType: input.mimeType },
    ),
  );
}
```

---

### 3.2 normalizeYAML() - YAML内容の正規化

**シグネチャ**:

```typescript
private normalizeYAML(content: string): string
```

**処理内容**:

1. **BOM除去**: UTF-8 BOM を削除
2. **行末正規化**: `\r\n` → `\n` に統一
3. **末尾空白除去**: 各行の末尾空白を削除
4. **連続空行削除**: 3行以上の空行を2行に削減

**実装例**:

```typescript
private normalizeYAML(content: string): string {
  let normalized = content;

  // BOM除去
  if (normalized.charCodeAt(0) === 0xfeff) {
    normalized = normalized.slice(1);
  }

  // 行末正規化
  normalized = normalized.replace(/\r\n/g, "\n");

  // 末尾空白除去
  normalized = normalized.replace(/[ \t]+$/gm, "");

  // 連続空行削減
  normalized = normalized.replace(/\n{3,}/g, "\n\n");

  return normalized;
}
```

---

### 3.3 extractYAMLStructure() - YAML構造の抽出

**シグネチャ**:

```typescript
private extractYAMLStructure(content: string): YAMLStructure
```

**戻り値型**:

```typescript
interface YAMLStructure {
  topLevelKeys: string[];
  hasComments: boolean;
  maxIndentDepth: number;
  totalLines: number;
}
```

**処理内容**:

1. **トップレベルキー検出**: 正規表現で抽出
2. **コメント検出**: `#` で始まる行の有無をチェック
3. **インデント深さ計算**: 各行のインデントを測定し最大値を取得
4. **行数カウント**: 空行を除く行数

**実装例**:

```typescript
private extractYAMLStructure(content: string): YAMLStructure {
  const lines = content.split("\n");
  const topLevelKeys: string[] = [];
  let hasComments = false;
  let maxIndentDepth = 0;
  let totalLines = 0;

  for (const line of lines) {
    if (line.trim() === "") continue;
    totalLines++;

    // トップレベルキー検出
    const topKeyMatch = line.match(/^([a-zA-Z_][\w-]*?):\s*/);
    if (topKeyMatch) {
      topLevelKeys.push(topKeyMatch[1]);
    }

    // コメント検出
    if (line.includes("#")) {
      hasComments = true;
    }

    // インデント深さ計算
    const indentMatch = line.match(/^(\s+)/);
    if (indentMatch) {
      const depth = indentMatch[1].length;
      maxIndentDepth = Math.max(maxIndentDepth, depth);
    }
  }

  return {
    topLevelKeys,
    hasComments,
    maxIndentDepth,
    totalLines,
  };
}
```

---

### 3.4 formatAsMarkdown() - Markdown形式への整形

**シグネチャ**:

```typescript
private formatAsMarkdown(
  yamlContent: string,
  structure: YAMLStructure,
): string
```

**出力フォーマット**:

````markdown
## YAML Structure

- **Top-level keys**: key1, key2, key3
- **Has comments**: Yes/No
- **Max indent depth**: 2 spaces
- **Total lines**: 42

## YAML Content

```yaml
<YAML本体>
```
````

````

**実装例**:
```typescript
private formatAsMarkdown(
  yamlContent: string,
  structure: YAMLStructure,
): string {
  const parts: string[] = [];

  // 構造サマリー
  parts.push("## YAML Structure\n");
  parts.push(`- **Top-level keys**: ${structure.topLevelKeys.join(", ") || "None"}`);
  parts.push(`- **Has comments**: ${structure.hasComments ? "Yes" : "No"}`);
  parts.push(`- **Max indent depth**: ${structure.maxIndentDepth} spaces`);
  parts.push(`- **Total lines**: ${structure.totalLines}`);
  parts.push("");

  // YAML本体
  parts.push("## YAML Content\n");
  parts.push("```yaml");
  parts.push(yamlContent);
  parts.push("```");

  return parts.join("\n");
}
````

---

### 3.5 extractYAMLMetadata() - メタデータ抽出

**シグネチャ**:

```typescript
private extractYAMLMetadata(
  content: string,
  structure: YAMLStructure,
  options: ConverterOptions,
): ExtractedMetadata
```

**処理内容**:

1. **title**: ファイル名を `input.filePath` から抽出
2. **author**: `null`（YAML には著者情報なし）
3. **language**: `options.language` から取得（デフォルト: `"ja"`）
4. **wordCount**: 空白区切りの単語数をカウント
5. **lineCount**: 全行数をカウント
6. **charCount**: 全文字数をカウント
7. **headers**: 空配列（YAML にヘッダー概念なし）
8. **codeBlocks**: `1`（YAML 全体を1ブロックとして扱う）
9. **links**: 空配列（YAML にリンク概念なし）
10. **custom**: YAML固有情報を格納

**実装例**:

```typescript
private extractYAMLMetadata(
  content: string,
  structure: YAMLStructure,
  options: ConverterOptions,
): ExtractedMetadata {
  const lines = content.split("\n");

  return {
    title: null,  // YAMLファイルにはタイトル概念なし
    author: null,
    language: (options.language as "ja" | "en") ?? "ja",
    wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
    lineCount: lines.length,
    charCount: content.length,
    headers: [],  // YAML にヘッダー概念なし
    codeBlocks: 1,  // YAML全体を1ブロックとして扱う
    links: [],
    custom: {
      hasComments: structure.hasComments,
      maxIndentDepth: structure.maxIndentDepth,
      topLevelKeys: structure.topLevelKeys,
      totalLines: structure.totalLines,
    },
  };
}
```

---

## 4. 正規表現パターン

### 4.1 パターン一覧

| パターン名                | 正規表現                    | 目的             | フラグ |
| ------------------------- | --------------------------- | ---------------- | ------ |
| BOM_PATTERN               | `/^\uFEFF/`                 | UTF-8 BOM検出    | -      |
| LINE_ENDING_PATTERN       | `/\r\n/g`                   | Windows改行検出  | g      |
| TRAILING_SPACE_PATTERN    | `/[ \t]+$/gm`               | 行末空白検出     | gm     |
| MULTIPLE_NEWLINES_PATTERN | `/\n{3,}/g`                 | 連続空行検出     | g      |
| TOP_LEVEL_KEY_PATTERN     | `/^([a-zA-Z_][\w-]*?):\s*/` | トップレベルキー | -      |
| COMMENT_PATTERN           | `/#/`                       | コメント検出     | -      |
| INDENT_PATTERN            | `/^(\s+)/`                  | インデント検出   | -      |

### 4.2 パターン詳細

#### TOP_LEVEL_KEY_PATTERN

```regex
/^([a-zA-Z_][\w-]*?):\s*/
```

- **説明**: 行頭でインデントなしのキーを検出
- **キャプチャグループ1**: キー名（英数字、アンダースコア、ハイフン）
- **例**:
  - `name: "John"` → キャプチャ: `name`
  - `api_version: 1.0` → キャプチャ: `api_version`
  - `  nested_key: value` → マッチしない（インデントあり）

#### INDENT_PATTERN

```regex
/^(\s+)/
```

- **説明**: 行頭の空白文字を検出
- **キャプチャグループ1**: 空白文字（スペースまたはタブ）
- **例**:
  - `  key: value` → キャプチャ: `"  "` (2スペース)
  - `    - item` → キャプチャ: `"    "` (4スペース)
  - `\t\tkey: value` → キャプチャ: `"\t\t"` (2タブ)

---

## 5. 処理フロー

### 5.1 全体フロー図

```
┌─────────────────────┐
│ ConverterInput      │
│ (YAML content)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ getTextContent()    │  ← BaseConverter継承
│ (Buffer → string)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ normalizeYAML()     │
│ - BOM除去           │
│ - 行末正規化        │
│ - 空白整理          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ extractYAMLStructure│
│ - トップレベルキー  │
│ - コメント検出      │
│ - インデント深さ    │
└──────────┬──────────┘
           │
           ├─────────────────────┐
           │                     │
           ▼                     ▼
┌─────────────────────┐  ┌──────────────────┐
│ formatAsMarkdown()  │  │ extractYAMLMeta  │
│ - 構造サマリー      │  │ - title          │
│ - YAML本体          │  │ - keywords       │
└──────────┬──────────┘  │ - custom         │
           │             └──────────┬───────┘
           ▼                        │
┌─────────────────────┐             │
│ trimContent()       │             │
│ (maxContentLength)  │             │
└──────────┬──────────┘             │
           │                        │
           └────────┬───────────────┘
                    │
                    ▼
           ┌─────────────────────┐
           │ ConverterOutput     │
           │ - convertedContent  │
           │ - extractedMetadata │
           └─────────────────────┘
```

### 5.2 エラーフロー

```
任意の処理ステップ
     │
     ▼
  [エラー発生]
     │
     ▼
createRAGError(
  ErrorCodes.CONVERSION_FAILED,
  message,
  context
)
     │
     ▼
err(RAGError)
```

---

## 6. エラーハンドリング

### 6.1 エラーケース

| エラーケース           | 検出タイミング           | エラーコード        | メッセージ例                    |
| ---------------------- | ------------------------ | ------------------- | ------------------------------- |
| 不正なYAML構造         | `extractYAMLStructure()` | `CONVERSION_FAILED` | "Invalid YAML structure"        |
| 空のYAMLファイル       | `normalizeYAML()`        | `CONVERSION_FAILED` | "Empty YAML content"            |
| エンコーディングエラー | `getTextContent()`       | `CONVERSION_FAILED` | "Failed to decode YAML content" |

### 6.2 エラーコンテキスト

すべてのエラーに以下のコンテキストを付与:

```typescript
{
  filePath: input.filePath,
  mimeType: input.mimeType,
  // 追加情報（必要に応じて）
  contentLength?: number,
  lineNumber?: number,
}
```

---

## 7. テスト観点

### 7.1 正常系テスト

| テストケース     | 入力                                 | 期待される出力                        |
| ---------------- | ------------------------------------ | ------------------------------------- |
| 基本的なYAML     | `name: test\nvalue: 123`             | トップレベルキー: `["name", "value"]` |
| コメント付きYAML | `# Comment\nkey: value`              | `hasComments: true`                   |
| ネストしたYAML   | `parent:\n  child: value`            | `maxIndentDepth: 2`                   |
| 複数行文字列     | `text: \|`<br>`  line1`<br>`  line2` | 正しく構造解析                        |
| リスト構造       | `items:\n  - item1\n  - item2`       | トップレベルキー: `["items"]`         |

### 7.2 異常系テスト

| テストケース     | 入力               | 期待される動作                |
| ---------------- | ------------------ | ----------------------------- |
| 空ファイル       | `""`               | エラー: "Empty YAML content"  |
| BOM付きYAML      | `\uFEFFname: test` | BOM除去後に正常処理           |
| 不正なインデント | タブとスペース混在 | 正常処理（警告なし）          |
| 超長行           | 10,000文字の1行    | `maxContentLength` で切り捨て |

### 7.3 メタデータ検証

| 検証項目                | 期待値                             |
| ----------------------- | ---------------------------------- |
| `title`                 | `null`（YAMLにはタイトル概念なし） |
| `author`                | `null`                             |
| `language`              | オプションの値または `"ja"`        |
| `wordCount`             | 空白区切りの単語数                 |
| `lineCount`             | 全行数                             |
| `charCount`             | 全文字数                           |
| `headers`               | 常に空配列 `[]`                    |
| `codeBlocks`            | 常に `1`                           |
| `links`                 | 常に空配列 `[]`                    |
| `custom.topLevelKeys`   | 重複なしで正しく抽出               |
| `custom.hasComments`    | コメント有無が正確                 |
| `custom.maxIndentDepth` | 最大インデントが正確               |
| `custom.totalLines`     | 空行を除く行数                     |

---

## 8. 実装上の注意点

### 8.1 YAML パーサーを使用しない理由

- **依存関係削減**: 軽量な正規表現ベースの実装
- **構造解析のみ**: YAML値のパースは不要（RAG用途）
- **エラー耐性**: 厳密なパースでエラーにならないようにする

### 8.2 インデント検出の柔軟性

- スペースとタブの両方に対応
- 混在している場合でも処理を継続
- 最大インデント深さを文字数でカウント

### 8.3 トップレベルキーの定義

- **条件**: 行頭（インデントなし）で `:` が続くキー
- **命名規則**: 英字・アンダースコアで始まり、英数字・アンダースコア・ハイフンを含む
- **除外**: コメント内のキー、ネストしたキー

### 8.4 コメント検出の制限事項

現在の実装では `line.includes("#")` でコメントを検出しているため、以下のケースで誤検知が発生する可能性がある:

```yaml
# これは本当のコメント ← 正常検出
url: "https://example.com/#section" # ← 誤検知（文字列内の#）
password: "test#123" # ← 誤検知（文字列内の#）
```

**許容理由**:

- RAG用途では厳密なコメント検出は必須ではない
- 正規表現ベースの簡易実装を維持するため
- 将来的にYAMLパーサー導入時に改善可能

**改善案（将来実装）**:

```typescript
// 行頭コメントのみを検出する場合
const trimmedLine = line.trim();
if (trimmedLine.startsWith("#")) {
  hasComments = true;
}
```

---

## 9. 実装チェックリスト

### 9.1 コード実装

- [ ] `YAMLConverter` クラス作成
- [ ] `doConvert()` メソッド実装
- [ ] `normalizeYAML()` メソッド実装
- [ ] `extractYAMLStructure()` メソッド実装
- [ ] `formatAsMarkdown()` メソッド実装
- [ ] `extractYAMLMetadata()` メソッド実装
- [ ] 正規表現パターンの定義
- [ ] エラーハンドリングの実装

### 9.2 テスト実装

- [ ] 基本的なYAMLの変換テスト
- [ ] コメント検出テスト
- [ ] インデント深さ検出テスト
- [ ] トップレベルキー抽出テスト
- [ ] 空ファイルエラーテスト
- [ ] BOM除去テスト
- [ ] メタデータ検証テスト
- [ ] `maxContentLength` 制限テスト

### 9.3 統合

- [ ] `converters/index.ts` にエクスポート追加
- [ ] 適切な MIME タイプで登録
- [ ] E2Eテストの追加

---

## 10. 設計レビュー観点

### 10.1 アーキテクチャ整合性

- [ ] BaseConverter パターンに準拠
- [ ] MarkdownConverter/CodeConverter と同一構造
- [ ] Result型による一貫したエラーハンドリング

### 10.2 型安全性

- [ ] `ExtractedMetadata` 型制約への準拠
  - `headers: Array<{ level: number; text: string }>` (空配列)
  - `language: "ja" | "en"`
  - YAML固有情報は `custom` に格納
- [ ] `YAMLStructure` インターフェースの適切な定義

### 10.3 パフォーマンス

- [ ] 正規表現の効率性（大きなYAMLファイル対応）
- [ ] 不要なループの排除
- [ ] メモリ効率的な文字列操作

### 10.4 保守性

- [ ] コードコメントの適切性
- [ ] メソッド責務の単一性
- [ ] テストカバレッジの十分性

---

## 11. 参考実装

### 11.1 既存実装との対応

| YAMLConverter            | MarkdownConverter           | CodeConverter           |
| ------------------------ | --------------------------- | ----------------------- |
| `normalizeYAML()`        | `normalizeMarkdown()`       | -                       |
| `extractYAMLStructure()` | `extractHeaders()`          | `detectLanguage()`      |
| `formatAsMarkdown()`     | -                           | `formatAsMarkdown()`    |
| `extractYAMLMetadata()`  | `extractMarkdownMetadata()` | `extractCodeMetadata()` |

### 11.2 共通パターン

- すべて `BaseConverter` を継承
- `doConvert()` でテンプレートメソッドパターン
- 正規表現ベースの構造解析
- `Result<T, E>` によるエラーハンドリング
- Markdown形式での出力統一

---

**以上、YAMLConverter の詳細設計書**
