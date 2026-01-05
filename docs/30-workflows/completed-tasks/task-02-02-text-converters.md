# CONV-02-02: テキスト系コンバーター実装

## 概要

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | CONV-02-02                                            |
| タスク名 | テキスト系コンバーター実装                            |
| 依存     | CONV-02-01                                            |
| 規模     | 中                                                    |
| 出力場所 | `packages/shared/src/services/conversion/converters/` |

## 目的

プレーンテキスト、HTML、CSV/TSV、PDF、DOCX等のテキスト系ファイルを変換するコンバーターを実装する。

## 成果物

### 1. プレーンテキストコンバーター

```typescript
// packages/shared/src/services/conversion/converters/plain-text-converter.ts

import { BaseConverter } from "../base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { MetadataExtractor } from "../metadata-extractor";
import { FileTypes } from "../../../types/rag/file";

/**
 * プレーンテキストコンバーター
 */
export class PlainTextConverter extends BaseConverter {
  readonly id = "plain-text";
  readonly name = "Plain Text Converter";
  readonly supportedMimeTypes = [FileTypes.TEXT] as const;
  readonly priority = 10;

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      // コンテンツ取得
      let content: string;
      if (typeof input.content === "string") {
        content = input.content;
      } else {
        content = new TextDecoder(input.encoding || "utf-8").decode(
          input.content,
        );
      }

      // 最大長制限
      if (
        options.maxContentLength &&
        content.length > options.maxContentLength
      ) {
        content = content.slice(0, options.maxContentLength);
      }

      // 正規化処理
      content = this.normalizeText(content, options);

      // メタデータ抽出
      const metadata = MetadataExtractor.extractFromText(content);

      return ok({
        convertedContent: content,
        extractedMetadata: metadata,
        processingTime: 0, // 後で計算される
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          "Failed to convert plain text",
          { fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * テキスト正規化
   */
  private normalizeText(content: string, options: ConverterOptions): string {
    let normalized = content;

    // BOM除去
    normalized = normalized.replace(/^\uFEFF/, "");

    // 改行コード統一（CRLF/CR → LF）
    normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 連続空行を2行に制限
    normalized = normalized.replace(/\n{3,}/g, "\n\n");

    // 行末空白除去
    if (options.preserveFormatting !== true) {
      normalized = normalized
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n");
    }

    return normalized.trim();
  }
}
```

### 2. HTMLコンバーター

````typescript
// packages/shared/src/services/conversion/converters/html-converter.ts

import { BaseConverter } from "../base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { MetadataExtractor } from "../metadata-extractor";
import { FileTypes } from "../../../types/rag/file";

/**
 * HTMLコンバーター
 * HTMLをMarkdown形式のテキストに変換
 */
export class HTMLConverter extends BaseConverter {
  readonly id = "html";
  readonly name = "HTML Converter";
  readonly supportedMimeTypes = [FileTypes.HTML] as const;
  readonly priority = 10;

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      let content: string;
      if (typeof input.content === "string") {
        content = input.content;
      } else {
        content = new TextDecoder(input.encoding || "utf-8").decode(
          input.content,
        );
      }

      // HTMLをテキストに変換
      const textContent = this.htmlToText(content, options);

      // メタデータ抽出
      const metadata = {
        ...MetadataExtractor.extractFromText(textContent),
        title: this.extractHtmlTitle(content),
        links:
          options.extractLinks !== false ? this.extractHtmlLinks(content) : [],
      };

      return ok({
        convertedContent: textContent,
        extractedMetadata: metadata,
        processingTime: 0,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          "Failed to convert HTML",
          { fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * HTMLをプレーンテキストに変換
   */
  private htmlToText(html: string, options: ConverterOptions): string {
    let text = html;

    // scriptとstyleタグを除去
    text = text.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

    // コメント除去
    text = text.replace(/<!--[\s\S]*?-->/g, "");

    // 見出しをMarkdown形式に変換
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
    text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n#### $1\n");
    text = text.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "\n##### $1\n");
    text = text.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "\n###### $1\n");

    // リストをMarkdown形式に変換
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");

    // 段落・改行
    text = text.replace(/<\/p>/gi, "\n\n");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/div>/gi, "\n");

    // リンクをMarkdown形式に変換
    text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

    // 強調
    text = text.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, "**$2**");
    text = text.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, "*$2*");

    // コードブロック
    text = text.replace(
      /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
      "\n```\n$1\n```\n",
    );
    text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

    // 残りのタグを除去
    text = text.replace(/<[^>]+>/g, "");

    // HTMLエンティティをデコード
    text = this.decodeHtmlEntities(text);

    // 正規化
    text = text.replace(/\n{3,}/g, "\n\n").trim();

    return text;
  }

  /**
   * HTMLエンティティをデコード
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&nbsp;": " ",
      "&mdash;": "—",
      "&ndash;": "–",
      "&hellip;": "…",
      "&copy;": "©",
      "&reg;": "®",
    };

    let decoded = text;
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, "g"), char);
    }

    // 数値エンティティ
    decoded = decoded.replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 10)),
    );
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    );

    return decoded;
  }

  /**
   * HTMLからタイトルを抽出
   */
  private extractHtmlTitle(html: string): string | null {
    const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
    return match ? this.decodeHtmlEntities(match[1].trim()) : null;
  }

  /**
   * HTMLからリンクを抽出
   */
  private extractHtmlLinks(html: string): string[] {
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/gi;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (href && href.startsWith("http")) {
        links.push(href);
      }
    }

    return [...new Set(links)];
  }
}
````

### 3. CSVコンバーター

```typescript
// packages/shared/src/services/conversion/converters/csv-converter.ts

import { BaseConverter } from "../base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { FileTypes } from "../../../types/rag/file";

/**
 * CSV/TSVコンバーター
 */
export class CSVConverter extends BaseConverter {
  readonly id = "csv";
  readonly name = "CSV/TSV Converter";
  readonly supportedMimeTypes = [FileTypes.CSV, FileTypes.TSV] as const;
  readonly priority = 10;

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      let content: string;
      if (typeof input.content === "string") {
        content = input.content;
      } else {
        content = new TextDecoder(input.encoding || "utf-8").decode(
          input.content,
        );
      }

      // 区切り文字を判定
      const delimiter = input.mimeType === FileTypes.TSV ? "\t" : ",";

      // CSVをパース
      const rows = this.parseCSV(content, delimiter);

      // Markdownテーブルに変換
      const markdownTable = this.toMarkdownTable(rows);

      // メタデータ
      const metadata = {
        title: null,
        author: null,
        language: null,
        wordCount: content.split(/\s+/).filter((w) => w.length > 0).length,
        lineCount: rows.length,
        charCount: content.length,
        headers: rows.length > 0 ? rows[0] : [],
        codeBlocks: 0,
        links: [],
        custom: {
          rowCount: rows.length,
          columnCount: rows[0]?.length ?? 0,
          delimiter,
        },
      };

      return ok({
        convertedContent: markdownTable,
        extractedMetadata: metadata,
        processingTime: 0,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          "Failed to convert CSV",
          { fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * CSVをパース
   */
  private parseCSV(content: string, delimiter: string): string[][] {
    const rows: string[][] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.trim().length === 0) continue;

      const row = this.parseLine(line, delimiter);
      rows.push(row);
    }

    return rows;
  }

  /**
   * CSV行をパース（ダブルクォート対応）
   */
  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // エスケープされたダブルクォート
          current += '"';
          i++;
        } else {
          // クォートの開始/終了
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Markdownテーブルに変換
   */
  private toMarkdownTable(rows: string[][]): string {
    if (rows.length === 0) return "";

    const header = rows[0];
    const dataRows = rows.slice(1);

    // ヘッダー行
    let markdown = "| " + header.join(" | ") + " |\n";

    // 区切り行
    markdown += "| " + header.map(() => "---").join(" | ") + " |\n";

    // データ行
    for (const row of dataRows) {
      // 列数を揃える
      const paddedRow = header.map((_, i) => row[i] ?? "");
      markdown += "| " + paddedRow.join(" | ") + " |\n";
    }

    return markdown;
  }
}
```

### 4. JSONコンバーター

```typescript
// packages/shared/src/services/conversion/converters/json-converter.ts

import { BaseConverter } from "../base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { FileTypes } from "../../../types/rag/file";

/**
 * JSONコンバーター
 */
export class JSONConverter extends BaseConverter {
  readonly id = "json";
  readonly name = "JSON Converter";
  readonly supportedMimeTypes = [FileTypes.JSON] as const;
  readonly priority = 10;

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      let content: string;
      if (typeof input.content === "string") {
        content = input.content;
      } else {
        content = new TextDecoder(input.encoding || "utf-8").decode(
          input.content,
        );
      }

      // JSONパース
      const parsed = JSON.parse(content);

      // 人間が読みやすい形式に変換
      const readable = this.jsonToReadableText(parsed, 0);

      // メタデータ
      const metadata = {
        title: null,
        author: null,
        language: null,
        wordCount: readable.split(/\s+/).filter((w) => w.length > 0).length,
        lineCount: readable.split("\n").length,
        charCount: readable.length,
        headers: this.extractTopLevelKeys(parsed),
        codeBlocks: 1, // JSON自体をコードブロックとして扱う
        links: [],
        custom: {
          type: Array.isArray(parsed) ? "array" : typeof parsed,
          keyCount: this.countKeys(parsed),
        },
      };

      return ok({
        convertedContent: readable,
        extractedMetadata: metadata,
        processingTime: 0,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          "Failed to convert JSON",
          { fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * JSONを読みやすいテキストに変換
   */
  private jsonToReadableText(obj: unknown, depth: number): string {
    const indent = "  ".repeat(depth);

    if (obj === null) return `${indent}null`;
    if (obj === undefined) return `${indent}undefined`;

    if (typeof obj === "string") return `${indent}"${obj}"`;
    if (typeof obj === "number" || typeof obj === "boolean")
      return `${indent}${obj}`;

    if (Array.isArray(obj)) {
      if (obj.length === 0) return `${indent}[]`;
      const items = obj.map(
        (item, i) =>
          `${indent}[${i}]: ${this.jsonToReadableText(item, depth + 1).trim()}`,
      );
      return items.join("\n");
    }

    if (typeof obj === "object") {
      const entries = Object.entries(obj);
      if (entries.length === 0) return `${indent}{}`;
      const items = entries.map(
        ([key, value]) =>
          `${indent}${key}: ${this.jsonToReadableText(value, depth + 1).trim()}`,
      );
      return items.join("\n");
    }

    return `${indent}${String(obj)}`;
  }

  /**
   * トップレベルのキーを抽出
   */
  private extractTopLevelKeys(obj: unknown): string[] {
    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      return Object.keys(obj);
    }
    return [];
  }

  /**
   * キー数をカウント（再帰的）
   */
  private countKeys(obj: unknown): number {
    if (typeof obj !== "object" || obj === null) return 0;

    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.countKeys(item), 0);
    }

    let count = Object.keys(obj).length;
    for (const value of Object.values(obj)) {
      count += this.countKeys(value);
    }
    return count;
  }
}
```

### 5. コンバーター登録

```typescript
// packages/shared/src/services/conversion/converters/index.ts

import { globalConverterRegistry } from "../converter-registry";
import { PlainTextConverter } from "./plain-text-converter";
import { HTMLConverter } from "./html-converter";
import { CSVConverter } from "./csv-converter";
import { JSONConverter } from "./json-converter";

// エクスポート
export { PlainTextConverter } from "./plain-text-converter";
export { HTMLConverter } from "./html-converter";
export { CSVConverter } from "./csv-converter";
export { JSONConverter } from "./json-converter";

/**
 * デフォルトコンバーターを登録
 */
export const registerDefaultConverters = (): void => {
  globalConverterRegistry.register(new PlainTextConverter());
  globalConverterRegistry.register(new HTMLConverter());
  globalConverterRegistry.register(new CSVConverter());
  globalConverterRegistry.register(new JSONConverter());
};
```

## ディレクトリ構造

```
packages/shared/src/services/conversion/converters/
├── index.ts              # バレルエクスポート・登録
├── plain-text-converter.ts
├── html-converter.ts
├── csv-converter.ts
└── json-converter.ts
```

## 受け入れ条件

- [ ] `PlainTextConverter` が実装されている
- [ ] `HTMLConverter` がHTMLをMarkdown形式に変換できる
- [ ] `CSVConverter` がCSV/TSVをMarkdownテーブルに変換できる
- [ ] `JSONConverter` がJSONを読みやすいテキストに変換できる
- [ ] 全コンバーターが `BaseConverter` を継承している
- [ ] `registerDefaultConverters` で一括登録できる
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-02-01: ファイル変換基盤・インターフェース

### このタスクに依存するもの

- CONV-06-01: チャンキング戦略実装（変換後のテキストをチャンキング）

## 備考

- HTMLコンバーターは簡易版で、複雑なHTMLには対応していない（必要に応じてTurndownなどのライブラリを使用）
- PDF/DOCXコンバーターは外部ライブラリ（pdf-parse, mammoth等）が必要なため、別タスクとして分離可能
- コンバーターは拡張子ではなくMIMEタイプで判定
