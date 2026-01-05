# MetadataExtractor - メタデータ抽出詳細設計書

## 1. 概要

### 1.1 目的

テキストコンテンツから各種メタデータ（タイトル、見出し、リンク、言語等）を抽出するユーティリティクラスの詳細設計を提供する。

### 1.2 設計方針

| 方針           | 内容                                             |
| -------------- | ------------------------------------------------ |
| ステートレス   | すべてのメソッドをstaticとし、内部状態を持たない |
| 単一責任       | メタデータ抽出のみを担当（変換処理は担当しない） |
| 拡張性         | オプションによる抽出制御が可能                   |
| パフォーマンス | 正規表現の事前コンパイルによる高速化             |
| エラー耐性     | 抽出失敗時もデフォルト値を返す（例外なし）       |

### 1.3 責務

| 責務               | 内容                                           |
| ------------------ | ---------------------------------------------- |
| タイトル抽出       | 最初の見出しまたはファイル名からタイトルを抽出 |
| 見出し抽出         | Markdown見出し（h1～h6）を抽出                 |
| リンク抽出         | URL、相対パスを抽出                            |
| コードブロック検出 | コードブロックの数をカウント                   |
| 言語検出           | 簡易的な言語判定（日本語/英語）                |
| 統計情報           | 単語数、行数、文字数のカウント                 |

---

## 2. クラス構造

### 2.1 クラス定義

````typescript
/**
 * メタデータ抽出ユーティリティ
 *
 * テキストコンテンツから各種メタデータを抽出する。
 * すべてのメソッドはstaticで、インスタンス化不要。
 */
export class MetadataExtractor {
  // ========================================
  // 正規表現パターン（事前コンパイル）
  // ========================================

  /**
   * Markdown見出しパターン（h1～h6）
   */
  private static readonly HEADING_PATTERN = /^(#{1,6})\s+(.+)$/gm;

  /**
   * URLパターン（http/https）
   */
  private static readonly URL_PATTERN = /https?:\/\/[^\s]+/g;

  /**
   * Markdownリンクパターン（[text](url)）
   */
  private static readonly MD_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

  /**
   * コードブロックパターン（```...```）
   */
  private static readonly CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;

  /**
   * インラインコードパターン（`...`）
   */
  private static readonly INLINE_CODE_PATTERN = /`[^`]+`/g;

  /**
   * 日本語文字パターン（ひらがな、カタカナ、漢字）
   */
  private static readonly JAPANESE_PATTERN =
    /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

  // ========================================
  // メイン抽出メソッド
  // ========================================

  /**
   * テキストからメタデータを抽出
   *
   * @param text - 抽出対象のテキスト
   * @param options - 抽出オプション
   * @returns 抽出されたメタデータ
   */
  static extractFromText(
    text: string,
    options?: ConverterOptions,
  ): ExtractedMetadata {
    const mergedOptions = mergeConverterOptions(options);

    return {
      title: this.extractTitle(text),
      author: null, // ファイルから抽出不可（メタデータから取得する場合あり）
      language: this.detectLanguage(text),
      wordCount: this.countWords(text),
      lineCount: this.countLines(text),
      charCount: text.length,
      headers: mergedOptions.extractHeaders ? this.extractHeaders(text) : [],
      codeBlocks: this.countCodeBlocks(text),
      links: mergedOptions.extractLinks ? this.extractLinks(text) : [],
      custom: {},
    };
  }

  // ========================================
  // タイトル抽出
  // ========================================

  /**
   * タイトルを抽出
   *
   * アルゴリズム:
   * 1. 最初のh1見出しがあればそれをタイトルとする
   * 2. h1がなければ最初の見出し（h2～h6）をタイトルとする
   * 3. 見出しがなければnull
   *
   * @param text - 抽出対象のテキスト
   * @returns タイトルまたはnull
   */
  static extractTitle(text: string): string | null {
    const headers = this.extractHeaders(text);

    if (headers.length === 0) {
      return null;
    }

    // 最初のh1見出しを探す
    const h1 = headers.find((header) => header.level === 1);
    if (h1) {
      return h1.text;
    }

    // h1がなければ最初の見出しを返す
    return headers[0].text;
  }

  // ========================================
  // 見出し抽出
  // ========================================

  /**
   * 見出しを抽出
   *
   * Markdown形式の見出し（# ～ ######）を抽出。
   *
   * @param text - 抽出対象のテキスト
   * @returns 見出しの配列
   */
  static extractHeaders(text: string): Array<{ level: number; text: string }> {
    const headers: Array<{ level: number; text: string }> = [];
    const matches = text.matchAll(this.HEADING_PATTERN);

    for (const match of matches) {
      const level = match[1].length; // #の数 = レベル
      const text = match[2].trim();
      headers.push({ level, text });
    }

    return headers;
  }

  // ========================================
  // リンク抽出
  // ========================================

  /**
   * リンクを抽出
   *
   * 以下の形式のリンクを抽出:
   * - http/https URL
   * - Markdownリンク: [text](url)
   *
   * @param text - 抽出対象のテキスト
   * @returns リンクの配列（重複なし、ソート済み）
   */
  static extractLinks(text: string): string[] {
    const links = new Set<string>();

    // URL抽出
    const urlMatches = text.matchAll(this.URL_PATTERN);
    for (const match of urlMatches) {
      links.add(match[0]);
    }

    // Markdownリンク抽出
    const mdLinkMatches = text.matchAll(this.MD_LINK_PATTERN);
    for (const match of mdLinkMatches) {
      const url = match[2];
      // URLまたは相対パス
      links.add(url);
    }

    // 重複削除、ソート
    return Array.from(links).sort();
  }

  // ========================================
  // コードブロック検出
  // ========================================

  /**
   * コードブロック数をカウント
   *
   * Markdown形式のコードブロック（```...```）をカウント。
   *
   * @param text - 抽出対象のテキスト
   * @returns コードブロック数
   */
  static countCodeBlocks(text: string): number {
    const matches = text.match(this.CODE_BLOCK_PATTERN);
    return matches ? matches.length : 0;
  }

  // ========================================
  // 言語検出
  // ========================================

  /**
   * 言語を検出（簡易版）
   *
   * アルゴリズム:
   * 1. 日本語文字（ひらがな、カタカナ、漢字）を含む場合は"ja"
   * 2. それ以外は"en"
   *
   * 注意: 簡易的な判定のため、多言語ドキュメントでは不正確な場合あり
   *
   * @param text - 判定対象のテキスト
   * @returns 言語コード（"ja" | "en"）
   */
  static detectLanguage(text: string): "ja" | "en" {
    return this.JAPANESE_PATTERN.test(text) ? "ja" : "en";
  }

  // ========================================
  // 統計情報
  // ========================================

  /**
   * 単語数をカウント
   *
   * アルゴリズム:
   * - 日本語の場合: 文字数をカウント（形態素解析なし）
   * - 英語の場合: 空白区切りで単語をカウント
   *
   * @param text - カウント対象のテキスト
   * @returns 単語数
   */
  static countWords(text: string): number {
    const language = this.detectLanguage(text);

    if (language === "ja") {
      // 日本語: 空白・改行・記号を除いた文字数
      const cleaned = text.replace(/[\s\n\r\t]/g, "");
      return cleaned.length;
    } else {
      // 英語: 空白区切りの単語数
      const words = text.trim().split(/\s+/);
      return words.filter((word) => word.length > 0).length;
    }
  }

  /**
   * 行数をカウント
   *
   * @param text - カウント対象のテキスト
   * @returns 行数
   */
  static countLines(text: string): number {
    if (text.length === 0) return 0;
    return text.split("\n").length;
  }

  /**
   * 文字数をカウント
   *
   * @param text - カウント対象のテキスト
   * @returns 文字数
   */
  static countChars(text: string): number {
    return text.length;
  }

  // ========================================
  // ヘルパーメソッド
  // ========================================

  /**
   * コードブロックを除去
   *
   * メタデータ抽出時にコードブロックを除外したい場合に使用。
   *
   * @param text - 処理対象のテキスト
   * @returns コードブロックを除去したテキスト
   */
  static removeCodeBlocks(text: string): string {
    return text.replace(this.CODE_BLOCK_PATTERN, "").trim();
  }

  /**
   * インラインコードを除去
   *
   * @param text - 処理対象のテキスト
   * @returns インラインコードを除去したテキスト
   */
  static removeInlineCode(text: string): string {
    return text.replace(this.INLINE_CODE_PATTERN, "").trim();
  }

  /**
   * Markdown記法を除去（見出しのみ）
   *
   * @param text - 処理対象のテキスト
   * @returns 見出し記号を除去したテキスト
   */
  static stripHeadingMarkers(text: string): string {
    return text.replace(/^#{1,6}\s+/gm, "");
  }
}
````

---

## 3. ExtractedMetadata型定義

### 3.1 型定義

````typescript
/**
 * 抽出されたメタデータ
 *
 * テキストから自動抽出される構造化情報。
 */
export interface ExtractedMetadata {
  /**
   * タイトル
   *
   * 最初の見出しから抽出。見出しがない場合はnull。
   */
  readonly title: string | null;

  /**
   * 著者
   *
   * テキストからの自動抽出は困難なため、通常null。
   * ファイルメタデータから設定される場合あり。
   */
  readonly author: string | null;

  /**
   * 言語コード（ISO 639-1形式）
   *
   * 簡易的な判定（日本語/英語）。
   * 値: "ja" | "en"
   */
  readonly language: "ja" | "en";

  /**
   * 単語数
   *
   * - 日本語: 文字数（形態素解析なし）
   * - 英語: 空白区切りの単語数
   */
  readonly wordCount: number;

  /**
   * 行数
   */
  readonly lineCount: number;

  /**
   * 文字数
   */
  readonly charCount: number;

  /**
   * 見出しの配列
   *
   * Markdown形式の見出し（h1～h6）。
   * extractHeaders オプションがfalseの場合は空配列。
   */
  readonly headers: Array<{ level: number; text: string }>;

  /**
   * コードブロック数
   *
   * Markdown形式のコードブロック（```...```）の数。
   */
  readonly codeBlocks: number;

  /**
   * リンクの配列
   *
   * URLまたは相対パス。重複なし、ソート済み。
   * extractLinks オプションがfalseの場合は空配列。
   */
  readonly links: string[];

  /**
   * カスタムメタデータ
   *
   * コンバーター固有の追加メタデータを格納。
   */
  readonly custom: Record<string, unknown>;
}
````

---

## 4. 抽出アルゴリズム詳細

### 4.1 タイトル抽出アルゴリズム

```
1. extractHeaders()で全見出しを抽出
2. 見出しが0件の場合 → null
3. h1見出しを検索
   - 見つかった場合 → 最初のh1見出しのテキストを返す
   - 見つからない場合 → 最初の見出し（h2～h6）のテキストを返す
```

**実装例**:

```typescript
static extractTitle(text: string): string | null {
  const headers = this.extractHeaders(text);

  if (headers.length === 0) {
    return null;
  }

  // 最初のh1見出しを探す
  const h1 = headers.find((header) => header.level === 1);
  if (h1) {
    return h1.text;
  }

  // h1がなければ最初の見出しを返す
  return headers[0].text;
}
```

---

### 4.2 見出し抽出アルゴリズム

```
1. 正規表現 /^(#{1,6})\s+(.+)$/gm で行頭の見出しをマッチ
2. マッチした各行について:
   - #の数（1～6）をレベルとして記録
   - #以降のテキストをtrimして記録
3. 見出しの配列を返す
```

**正規表現の詳細**:

```
^           : 行頭
(#{1,6})    : 1～6個の#をキャプチャ（グループ1 = レベル）
\s+         : 1個以上の空白
(.+)        : 残りのテキストをキャプチャ（グループ2 = テキスト）
$           : 行末
gm          : グローバル＋マルチラインフラグ
```

---

### 4.3 リンク抽出アルゴリズム

```
1. URLパターンでhttp/https URLを抽出
2. Markdownリンクパターンで [text](url) を抽出
   - グループ2（url部分）を取得
3. 重複を除去（Set使用）
4. ソートして配列で返す
```

**実装例**:

```typescript
static extractLinks(text: string): string[] {
  const links = new Set<string>();

  // URL抽出
  const urlMatches = text.matchAll(this.URL_PATTERN);
  for (const match of urlMatches) {
    links.add(match[0]);
  }

  // Markdownリンク抽出
  const mdLinkMatches = text.matchAll(this.MD_LINK_PATTERN);
  for (const match of mdLinkMatches) {
    const url = match[2];
    links.add(url);
  }

  return Array.from(links).sort();
}
```

---

### 4.4 言語検出アルゴリズム（簡易版）

```
1. テキストに日本語文字（ひらがな、カタカナ、漢字）が含まれるかチェック
   - Unicode範囲:
     - ひらがな: \u3040-\u309F
     - カタカナ: \u30A0-\u30FF
     - 漢字: \u4E00-\u9FFF
2. 含まれる場合 → "ja"
3. 含まれない場合 → "en"
```

**注意事項**:

- 簡易的な判定のため、以下の制限あり:
  - 多言語ドキュメント（日英混在等）では不正確
  - 韓国語、中国語、その他の言語は未対応
- 将来的にはライブラリ（franc等）の使用を検討

---

### 4.5 単語数カウントアルゴリズム

```
1. 言語を検出
2. 日本語の場合:
   - 空白・改行・タブを除去
   - 残った文字数をカウント
3. 英語の場合:
   - 空白区切りで分割
   - 空文字列を除外
   - 単語数をカウント
```

**実装例**:

```typescript
static countWords(text: string): number {
  const language = this.detectLanguage(text);

  if (language === "ja") {
    // 日本語: 空白・改行・記号を除いた文字数
    const cleaned = text.replace(/[\s\n\r\t]/g, "");
    return cleaned.length;
  } else {
    // 英語: 空白区切りの単語数
    const words = text.trim().split(/\s+/);
    return words.filter((word) => word.length > 0).length;
  }
}
```

---

## 5. 使用例

### 5.1 基本的な使用例

```typescript
import { MetadataExtractor } from "./metadata-extractor";

const text = `
# Hello World

This is a **sample** document with [a link](https://example.com).

\`\`\`typescript
const x = 42;
\`\`\`
`;

const metadata = MetadataExtractor.extractFromText(text);

console.log(metadata);
// {
//   title: "Hello World",
//   author: null,
//   language: "en",
//   wordCount: 8,
//   lineCount: 9,
//   charCount: 123,
//   headers: [{ level: 1, text: "Hello World" }],
//   codeBlocks: 1,
//   links: ["https://example.com"],
//   custom: {}
// }
```

### 5.2 オプション付き使用例

```typescript
const metadata = MetadataExtractor.extractFromText(text, {
  extractHeaders: false, // 見出し抽出スキップ
  extractLinks: false, // リンク抽出スキップ
});

console.log(metadata.headers); // []
console.log(metadata.links); // []
```

### 5.3 日本語テキストの例

```typescript
const japaneseText = `
# こんにちは

これは日本語のサンプルです。

- リスト1
- リスト2
`;

const metadata = MetadataExtractor.extractFromText(japaneseText);

console.log(metadata.language); // "ja"
console.log(metadata.wordCount); // 日本語文字数
console.log(metadata.title); // "こんにちは"
```

---

## 6. テスト戦略

### 6.1 単体テスト

```typescript
import { describe, it, expect } from "vitest";
import { MetadataExtractor } from "./metadata-extractor";

describe("MetadataExtractor", () => {
  describe("extractTitle()", () => {
    it("should extract h1 heading as title", () => {
      const text = "# Main Title\n## Sub Title";
      const title = MetadataExtractor.extractTitle(text);
      expect(title).toBe("Main Title");
    });

    it("should extract first heading if no h1", () => {
      const text = "## Sub Title\n### Smaller Title";
      const title = MetadataExtractor.extractTitle(text);
      expect(title).toBe("Sub Title");
    });

    it("should return null if no headings", () => {
      const text = "Just plain text";
      const title = MetadataExtractor.extractTitle(text);
      expect(title).toBeNull();
    });
  });

  describe("extractHeaders()", () => {
    it("should extract all headings with levels", () => {
      const text = `
# H1
## H2
### H3
`;
      const headers = MetadataExtractor.extractHeaders(text);

      expect(headers).toEqual([
        { level: 1, text: "H1" },
        { level: 2, text: "H2" },
        { level: 3, text: "H3" },
      ]);
    });

    it("should trim whitespace from heading text", () => {
      const text = "#   Title with spaces   ";
      const headers = MetadataExtractor.extractHeaders(text);

      expect(headers[0].text).toBe("Title with spaces");
    });
  });

  describe("extractLinks()", () => {
    it("should extract HTTP URLs", () => {
      const text = "Visit https://example.com and http://test.org";
      const links = MetadataExtractor.extractLinks(text);

      expect(links).toContain("https://example.com");
      expect(links).toContain("http://test.org");
    });

    it("should extract Markdown links", () => {
      const text = "[Google](https://google.com) and [Local](./file.md)";
      const links = MetadataExtractor.extractLinks(text);

      expect(links).toContain("https://google.com");
      expect(links).toContain("./file.md");
    });

    it("should remove duplicates and sort", () => {
      const text = `
https://example.com
[Link](https://example.com)
https://aaa.com
`;
      const links = MetadataExtractor.extractLinks(text);

      expect(links).toEqual(["https://aaa.com", "https://example.com"]);
    });
  });

  describe("countCodeBlocks()", () => {
    it("should count code blocks", () => {
      const text = `
Text
\`\`\`
code block 1
\`\`\`
More text
\`\`\`
code block 2
\`\`\`
`;
      const count = MetadataExtractor.countCodeBlocks(text);
      expect(count).toBe(2);
    });

    it("should return 0 if no code blocks", () => {
      const text = "Just text";
      const count = MetadataExtractor.countCodeBlocks(text);
      expect(count).toBe(0);
    });
  });

  describe("detectLanguage()", () => {
    it("should detect Japanese", () => {
      const text = "これは日本語です";
      const lang = MetadataExtractor.detectLanguage(text);
      expect(lang).toBe("ja");
    });

    it("should detect English", () => {
      const text = "This is English";
      const lang = MetadataExtractor.detectLanguage(text);
      expect(lang).toBe("en");
    });

    it("should detect Japanese for mixed text", () => {
      const text = "Hello こんにちは";
      const lang = MetadataExtractor.detectLanguage(text);
      expect(lang).toBe("ja");
    });
  });

  describe("countWords()", () => {
    it("should count English words", () => {
      const text = "Hello world from TypeScript";
      const count = MetadataExtractor.countWords(text);
      expect(count).toBe(4);
    });

    it("should count Japanese characters", () => {
      const text = "こんにちは世界";
      const count = MetadataExtractor.countWords(text);
      expect(count).toBe(7); // 7文字
    });

    it("should handle multiple spaces", () => {
      const text = "Hello    world";
      const count = MetadataExtractor.countWords(text);
      expect(count).toBe(2);
    });
  });

  describe("countLines()", () => {
    it("should count lines", () => {
      const text = "Line 1\nLine 2\nLine 3";
      const count = MetadataExtractor.countLines(text);
      expect(count).toBe(3);
    });

    it("should return 0 for empty text", () => {
      const text = "";
      const count = MetadataExtractor.countLines(text);
      expect(count).toBe(0);
    });
  });

  describe("extractFromText()", () => {
    it("should extract all metadata", () => {
      const text = `
# Sample Document

This is a [link](https://example.com).

\`\`\`
code
\`\`\`
`;

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.title).toBe("Sample Document");
      expect(metadata.language).toBe("en");
      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.lineCount).toBeGreaterThan(0);
      expect(metadata.charCount).toBeGreaterThan(0);
      expect(metadata.headers.length).toBe(1);
      expect(metadata.codeBlocks).toBe(1);
      expect(metadata.links).toContain("https://example.com");
    });

    it("should respect extractHeaders option", () => {
      const text = "# Title\n## Subtitle";

      const metadata = MetadataExtractor.extractFromText(text, {
        extractHeaders: false,
      });

      expect(metadata.headers).toEqual([]);
      expect(metadata.title).toBeNull(); // タイトルも見出しから抽出されるため
    });

    it("should respect extractLinks option", () => {
      const text = "Visit https://example.com";

      const metadata = MetadataExtractor.extractFromText(text, {
        extractLinks: false,
      });

      expect(metadata.links).toEqual([]);
    });
  });
});
```

---

## 7. パフォーマンス考慮事項

### 7.1 正規表現の事前コンパイル

```typescript
// ✓ 良い例: クラスレベルで事前コンパイル
class MetadataExtractor {
  private static readonly HEADING_PATTERN = /^(#{1,6})\s+(.+)$/gm;

  static extractHeaders(text: string) {
    return text.matchAll(this.HEADING_PATTERN);
  }
}

// ✗ 悪い例: 毎回コンパイル
class MetadataExtractor {
  static extractHeaders(text: string) {
    const pattern = /^(#{1,6})\s+(.+)$/gm; // 毎回生成
    return text.matchAll(pattern);
  }
}
```

### 7.2 時間計算量

| メソッド          | 時間計算量 | 理由                         |
| ----------------- | ---------- | ---------------------------- |
| extractTitle()    | O(n)       | extractHeaders()の呼び出し   |
| extractHeaders()  | O(n)       | テキスト全体を走査           |
| extractLinks()    | O(n)       | テキスト全体を走査           |
| countCodeBlocks() | O(n)       | テキスト全体を走査           |
| detectLanguage()  | O(1)       | 最初の文字で判定（最悪O(n)） |
| countWords()      | O(n)       | テキスト全体を走査           |
| countLines()      | O(n)       | 改行で分割                   |
| extractFromText() | O(n)       | 各メソッドを1回ずつ呼び出し  |

---

## 8. 実装ガイドライン

### 8.1 ファイル構成

```
packages/shared/src/services/conversion/
├── metadata-extractor.ts          # MetadataExtractor実装
├── metadata-extractor.test.ts     # MetadataExtractorテスト
└── types.ts                        # ExtractedMetadata型定義
```

### 8.2 インポート順序

```typescript
// 1. 外部依存
// （なし - 標準ライブラリのみ使用）

// 2. 内部依存
import type { ExtractedMetadata, ConverterOptions } from "./types";
import { mergeConverterOptions } from "./types";

// 3. クラス定義
export class MetadataExtractor {
  /* ... */
}
```

### 8.3 命名規約

| 要素         | 規約                               | 例                           |
| ------------ | ---------------------------------- | ---------------------------- |
| クラス名     | PascalCase + Extractor接尾辞       | `MetadataExtractor`          |
| メソッド     | camelCase + 動詞                   | `extractTitle`, `countWords` |
| 正規表現定数 | UPPER_SNAKE_CASE + \_PATTERN接尾辞 | `HEADING_PATTERN`            |

---

## 9. 将来の拡張

### 9.1 高度な言語検出

```typescript
import { franc } from "franc"; // ライブラリ使用

static detectLanguageAdvanced(text: string): string {
  // francライブラリで120以上の言語を検出
  const langCode = franc(text);
  return langCode; // ISO 639-3形式（3文字）
}
```

### 9.2 形態素解析（日本語）

```typescript
import kuromoji from "kuromoji";

static async countWordsJapanese(text: string): Promise<number> {
  const tokenizer = await kuromoji.builder({ /* ... */ }).build();
  const tokens = tokenizer.tokenize(text);
  return tokens.length; // 形態素数
}
```

### 9.3 読了時間の推定

```typescript
/**
 * 読了時間を推定（分）
 *
 * - 英語: 200単語/分
 * - 日本語: 600文字/分
 */
static estimateReadingTime(text: string): number {
  const language = this.detectLanguage(text);
  const wordCount = this.countWords(text);

  if (language === "ja") {
    return Math.ceil(wordCount / 600); // 600文字/分
  } else {
    return Math.ceil(wordCount / 200); // 200単語/分
  }
}
```

---

## 10. 変更履歴

| 日付       | バージョン | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 2025-12-20 | 1.0.0      | AI     | 初版作成 |

---

## 11. 完了条件チェックリスト

- [ ] タイトル抽出アルゴリズムが設計されている
- [ ] 見出し抽出アルゴリズムが設計されている
- [ ] リンク抽出アルゴリズムが設計されている
- [ ] コードブロック検出アルゴリズムが設計されている
- [ ] 言語検出アルゴリズムが設計されている
- [ ] 統計情報（単語数、行数、文字数）のアルゴリズムが設計されている
- [ ] ExtractedMetadata型が定義されている
- [ ] テスト戦略が明確
- [ ] パフォーマンス考慮事項が記載されている
- [ ] 将来の拡張が検討されている
