# CONV-02-03: Markdown/コードコンバーター実装

## 概要

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | CONV-02-03                                            |
| タスク名 | Markdown/コードコンバーター実装                       |
| 依存     | CONV-02-01                                            |
| 規模     | 中                                                    |
| 出力場所 | `packages/shared/src/services/conversion/converters/` |

## 目的

Markdown、TypeScript、JavaScript、Python、YAML等のコード系ファイルを変換するコンバーターを実装する。

## 成果物

### 1. Markdownコンバーター

````typescript
// packages/shared/src/services/conversion/converters/markdown-converter.ts

import { BaseConverter } from "../base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError, ExtractedMetadata } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { FileTypes } from "../../../types/rag/file";

/**
 * Markdownコンバーター
 * Markdownを正規化し、構造情報を抽出
 */
export class MarkdownConverter extends BaseConverter {
  readonly id = "markdown";
  readonly name = "Markdown Converter";
  readonly supportedMimeTypes = [FileTypes.MARKDOWN] as const;
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

      // 正規化
      const normalizedContent = this.normalizeMarkdown(content, options);

      // メタデータ抽出
      const metadata = this.extractMarkdownMetadata(normalizedContent);

      return ok({
        convertedContent: normalizedContent,
        extractedMetadata: metadata,
        processingTime: 0,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          "Failed to convert Markdown",
          { fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * Markdown正規化
   */
  private normalizeMarkdown(
    content: string,
    options: ConverterOptions,
  ): string {
    let normalized = content;

    // BOM除去
    normalized = normalized.replace(/^\uFEFF/, "");

    // 改行コード統一
    normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // フロントマター処理（YAML形式）
    const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n/);
    if (frontmatterMatch) {
      // フロントマターは除去（メタデータとして別途抽出）
      normalized = normalized.slice(frontmatterMatch[0].length);
    }

    // 連続空行を制限
    normalized = normalized.replace(/\n{3,}/g, "\n\n");

    // コードブロック内は処理しない
    const parts: string[] = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(normalized)) !== null) {
      // コードブロック前のテキストを処理
      parts.push(
        this.normalizeTextPart(normalized.slice(lastIndex, match.index)),
      );
      // コードブロックはそのまま
      parts.push(match[0]);
      lastIndex = match.index + match[0].length;
    }

    // 残りのテキスト
    parts.push(this.normalizeTextPart(normalized.slice(lastIndex)));

    return parts.join("").trim();
  }

  /**
   * テキスト部分の正規化
   */
  private normalizeTextPart(text: string): string {
    let normalized = text;

    // 行末空白除去
    normalized = normalized
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");

    return normalized;
  }

  /**
   * Markdownメタデータ抽出
   */
  private extractMarkdownMetadata(content: string): ExtractedMetadata {
    const lines = content.split("\n");

    // 見出し抽出
    const headers: string[] = [];
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headerRegex.exec(content)) !== null) {
      headers.push(`${"#".repeat(match[1].length)} ${match[2]}`);
    }

    // タイトル（最初のH1）
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : null;

    // コードブロックカウント
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;

    // リンク抽出
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: string[] = [];
    while ((match = linkRegex.exec(content)) !== null) {
      if (match[2].startsWith("http")) {
        links.push(match[2]);
      }
    }

    // 言語検出
    const language = this.detectLanguage(content);

    // ワードカウント（コードブロック除外）
    const textWithoutCode = content.replace(/```[\s\S]*?```/g, "");
    const words = textWithoutCode.split(/\s+/).filter((w) => w.length > 0);

    return {
      title,
      author: null,
      language,
      wordCount: words.length,
      lineCount: lines.length,
      charCount: content.length,
      headers,
      codeBlocks,
      links: [...new Set(links)],
      custom: {
        hasCodeBlocks: codeBlocks > 0,
        headerCount: headers.length,
      },
    };
  }

  /**
   * 言語検出
   */
  private detectLanguage(content: string): string | null {
    // 日本語判定
    const japaneseChars = content.match(
      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g,
    );
    if (japaneseChars && japaneseChars.length > 100) {
      return "ja";
    }
    return "en";
  }
}
````

### 2. TypeScript/JavaScriptコンバーター

````typescript
// packages/shared/src/services/conversion/converters/code-converter.ts

import { BaseConverter } from "../base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError, ExtractedMetadata } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { FileTypes } from "../../../types/rag/file";

/**
 * コードファイルコンバーター
 * TypeScript, JavaScript, Pythonなどのコードファイルを処理
 */
export class CodeConverter extends BaseConverter {
  readonly id = "code";
  readonly name = "Code File Converter";
  readonly supportedMimeTypes = [
    FileTypes.JAVASCRIPT,
    FileTypes.TYPESCRIPT,
    FileTypes.PYTHON,
  ] as const;
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

      // 言語判定
      const language = this.detectLanguage(input.mimeType, input.filePath);

      // コード構造を抽出
      const structure = this.extractCodeStructure(content, language);

      // Markdown形式で整形
      const formattedContent = this.formatAsMarkdown(
        content,
        language,
        structure,
      );

      // メタデータ
      const metadata = this.createMetadata(content, language, structure);

      return ok({
        convertedContent: formattedContent,
        extractedMetadata: metadata,
        processingTime: 0,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          "Failed to convert code",
          { fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * 言語判定
   */
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

  /**
   * コード構造を抽出
   */
  private extractCodeStructure(
    content: string,
    language: string,
  ): CodeStructure {
    const structure: CodeStructure = {
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      comments: [],
    };

    if (language === "typescript" || language === "javascript") {
      this.extractJSStructure(content, structure);
    } else if (language === "python") {
      this.extractPythonStructure(content, structure);
    }

    return structure;
  }

  /**
   * JavaScript/TypeScript構造抽出
   */
  private extractJSStructure(content: string, structure: CodeStructure): void {
    // 関数定義
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      structure.functions.push(match[1]);
    }

    // アロー関数（const name = () =>）
    const arrowRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
    while ((match = arrowRegex.exec(content)) !== null) {
      structure.functions.push(match[1]);
    }

    // クラス定義
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      structure.classes.push(match[1]);
    }

    // インポート
    const importRegex = /import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(content)) !== null) {
      structure.imports.push(match[1]);
    }

    // エクスポート
    const exportRegex =
      /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      structure.exports.push(match[1]);
    }
  }

  /**
   * Python構造抽出
   */
  private extractPythonStructure(
    content: string,
    structure: CodeStructure,
  ): void {
    // 関数定義
    const functionRegex = /def\s+(\w+)\s*\(/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      structure.functions.push(match[1]);
    }

    // クラス定義
    const classRegex = /class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      structure.classes.push(match[1]);
    }

    // インポート
    const importRegex = /(?:from\s+(\S+)\s+)?import\s+(.+)/g;
    while ((match = importRegex.exec(content)) !== null) {
      structure.imports.push(match[1] || match[2]);
    }
  }

  /**
   * Markdown形式で整形
   */
  private formatAsMarkdown(
    content: string,
    language: string,
    structure: CodeStructure,
  ): string {
    const parts: string[] = [];

    // 構造情報をサマリーとして追加
    if (structure.classes.length > 0 || structure.functions.length > 0) {
      parts.push("## Code Structure\n");

      if (structure.classes.length > 0) {
        parts.push("### Classes");
        parts.push(structure.classes.map((c) => `- \`${c}\``).join("\n"));
        parts.push("");
      }

      if (structure.functions.length > 0) {
        parts.push("### Functions");
        parts.push(structure.functions.map((f) => `- \`${f}\``).join("\n"));
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

  /**
   * メタデータ作成
   */
  private createMetadata(
    content: string,
    language: string,
    structure: CodeStructure,
  ): ExtractedMetadata {
    const lines = content.split("\n");

    return {
      title: null,
      author: null,
      language,
      wordCount: content.split(/\s+/).filter((w) => w.length > 0).length,
      lineCount: lines.length,
      charCount: content.length,
      headers: [
        ...structure.classes.map((c) => `class ${c}`),
        ...structure.functions.map((f) => `function ${f}`),
      ],
      codeBlocks: 1,
      links: [],
      custom: {
        language,
        classCount: structure.classes.length,
        functionCount: structure.functions.length,
        importCount: structure.imports.length,
        exportCount: structure.exports.length,
        classes: structure.classes,
        functions: structure.functions,
      },
    };
  }
}

/**
 * コード構造
 */
interface CodeStructure {
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
  comments: string[];
}
````

### 3. YAMLコンバーター

````typescript
// packages/shared/src/services/conversion/converters/yaml-converter.ts

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
 * YAMLコンバーター
 */
export class YAMLConverter extends BaseConverter {
  readonly id = "yaml";
  readonly name = "YAML Converter";
  readonly supportedMimeTypes = [FileTypes.YAML] as const;
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

      // YAML構造を解析
      const structure = this.analyzeYAMLStructure(content);

      // Markdown形式で整形
      const formattedContent = this.formatAsMarkdown(content, structure);

      // メタデータ
      const lines = content.split("\n");
      const metadata = {
        title: null,
        author: null,
        language: "yaml",
        wordCount: content.split(/\s+/).filter((w) => w.length > 0).length,
        lineCount: lines.length,
        charCount: content.length,
        headers: structure.topLevelKeys,
        codeBlocks: 1,
        links: [],
        custom: {
          topLevelKeys: structure.topLevelKeys,
          hasComments: structure.hasComments,
          nestedDepth: structure.maxDepth,
        },
      };

      return ok({
        convertedContent: formattedContent,
        extractedMetadata: metadata,
        processingTime: 0,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          "Failed to convert YAML",
          { fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * YAML構造を解析
   */
  private analyzeYAMLStructure(content: string): YAMLStructure {
    const lines = content.split("\n");
    const topLevelKeys: string[] = [];
    let hasComments = false;
    let maxDepth = 0;

    for (const line of lines) {
      // コメント検出
      if (line.trim().startsWith("#")) {
        hasComments = true;
        continue;
      }

      // トップレベルキー検出
      const topKeyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):/);
      if (topKeyMatch) {
        topLevelKeys.push(topKeyMatch[1]);
      }

      // インデント深さ検出
      const indentMatch = line.match(/^(\s*)/);
      if (indentMatch) {
        const depth = Math.floor(indentMatch[1].length / 2);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return {
      topLevelKeys,
      hasComments,
      maxDepth,
    };
  }

  /**
   * Markdown形式で整形
   */
  private formatAsMarkdown(content: string, structure: YAMLStructure): string {
    const parts: string[] = [];

    // 構造サマリー
    if (structure.topLevelKeys.length > 0) {
      parts.push("## Structure\n");
      parts.push("### Top-level Keys");
      parts.push(structure.topLevelKeys.map((k) => `- \`${k}\``).join("\n"));
      parts.push("");
    }

    // YAML本体
    parts.push("## Content\n");
    parts.push("```yaml");
    parts.push(content);
    parts.push("```");

    return parts.join("\n");
  }
}

/**
 * YAML構造
 */
interface YAMLStructure {
  topLevelKeys: string[];
  hasComments: boolean;
  maxDepth: number;
}
````

### 4. コンバーター登録追加

```typescript
// packages/shared/src/services/conversion/converters/index.ts に追加

import { MarkdownConverter } from "./markdown-converter";
import { CodeConverter } from "./code-converter";
import { YAMLConverter } from "./yaml-converter";

// エクスポート追加
export { MarkdownConverter } from "./markdown-converter";
export { CodeConverter } from "./code-converter";
export { YAMLConverter } from "./yaml-converter";

/**
 * デフォルトコンバーターを登録（更新）
 */
export const registerDefaultConverters = (): void => {
  // テキスト系
  globalConverterRegistry.register(new PlainTextConverter());
  globalConverterRegistry.register(new HTMLConverter());
  globalConverterRegistry.register(new CSVConverter());
  globalConverterRegistry.register(new JSONConverter());

  // Markdown/コード系
  globalConverterRegistry.register(new MarkdownConverter());
  globalConverterRegistry.register(new CodeConverter());
  globalConverterRegistry.register(new YAMLConverter());
};
```

## ディレクトリ構造

```
packages/shared/src/services/conversion/converters/
├── index.ts                  # バレルエクスポート・登録
├── plain-text-converter.ts   # CONV-02-02
├── html-converter.ts         # CONV-02-02
├── csv-converter.ts          # CONV-02-02
├── json-converter.ts         # CONV-02-02
├── markdown-converter.ts     # 本タスク
├── code-converter.ts         # 本タスク
└── yaml-converter.ts         # 本タスク
```

## 受け入れ条件

- [ ] `MarkdownConverter` がMarkdownを正規化できる
- [ ] `MarkdownConverter` が見出し・リンク・コードブロックを抽出できる
- [ ] `CodeConverter` がTypeScript/JavaScript/Pythonの構造を抽出できる
- [ ] `CodeConverter` が関数・クラス・インポートを検出できる
- [ ] `YAMLConverter` がYAML構造を解析できる
- [ ] 全コンバーターが `BaseConverter` を継承している
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-02-01: ファイル変換基盤・インターフェース

### このタスクに依存するもの

- CONV-06-01: チャンキング戦略実装（コード向けの特別なチャンキング）

## 備考

- コード解析は正規表現ベースの簡易版（AST解析が必要な場合はtypescript, @babel/parser等を使用）
- YAML解析も簡易版（完全なパースが必要な場合はjs-yamlを使用）
- フロントマター（YAML形式のメタデータ）はMarkdownコンバーターで処理
- コードの構造情報はチャンキング時にセマンティックな分割に活用可能
