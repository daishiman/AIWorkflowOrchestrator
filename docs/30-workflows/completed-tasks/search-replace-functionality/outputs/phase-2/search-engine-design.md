# 検索・置換機能 - 検索エンジン設計書

## 概要

本ドキュメントは、検索・置換機能のバックエンドロジック設計を定義する。

---

## 1. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                       SearchService                              │
│  (ファサード: 検索・置換操作の統一インターフェース)              │
├─────────────────────────────────────────────────────────────────┤
│  + searchInFile(content, pattern, options): SearchMatch[]        │
│  + searchInWorkspace(pattern, options): AsyncGenerator           │
│  + replaceInFile(content, pattern, replacement): ReplaceResult   │
│  + replaceInWorkspace(pattern, replacement): AsyncGenerator      │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ FileSearchEngine  │ │ WorkspaceSearch   │ │  ReplaceEngine    │
│                   │ │     Engine        │ │                   │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ - patternMatcher  │ │ - fileScanner     │ │ - patternMatcher  │
│ - highlighter     │ │ - excludeFilter   │ │ - transformer     │
│ - contextBuilder  │ │ - resultStreamer  │ │ - validator       │
└───────────────────┘ └───────────────────┘ └───────────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                    ┌───────────────────┐
                    │  PatternMatcher   │
                    │  (共通パターン    │
                    │   マッチング)     │
                    └───────────────────┘
```

---

## 2. インターフェース定義

### 2.1 型定義

```typescript
// types.ts

/**
 * 検索オプション
 */
export interface SearchOptions {
  /** 大文字/小文字を区別する */
  caseSensitive: boolean;
  /** 単語単位で検索する */
  wholeWord: boolean;
  /** 正規表現を使用する */
  regex: boolean;
}

/**
 * ワークスペース検索オプション
 */
export interface WorkspaceSearchOptions extends SearchOptions {
  /** 検索対象ファイルパターン (glob形式) */
  include?: string[];
  /** 除外パターン (glob形式) */
  exclude?: string[];
  /** 最大結果数 */
  maxResults?: number;
  /** コンテキスト行数 (前後) */
  contextLines?: number;
}

/**
 * 検索マッチ結果
 */
export interface SearchMatch {
  /** 行番号 (1-indexed) */
  line: number;
  /** 列番号 (1-indexed) */
  column: number;
  /** マッチした文字列の長さ */
  length: number;
  /** マッチした文字列 */
  text: string;
  /** 行全体のテキスト */
  lineText: string;
  /** コンテキスト情報 */
  context: {
    /** 前の行 */
    before: string[];
    /** 後の行 */
    after: string[];
  };
}

/**
 * ファイル検索結果
 */
export interface FileSearchResult {
  /** ファイルパス */
  filePath: string;
  /** マッチ結果一覧 */
  matches: SearchMatch[];
  /** 検索にかかった時間 (ms) */
  searchTime: number;
}

/**
 * 置換結果
 */
export interface ReplaceResult {
  /** 置換後のコンテンツ */
  content: string;
  /** 置換した件数 */
  count: number;
  /** 置換した位置 */
  replacements: Array<{
    line: number;
    column: number;
    originalText: string;
    replacedText: string;
  }>;
}

/**
 * ワークスペース置換結果
 */
export interface WorkspaceReplaceResult {
  /** ファイルパス */
  filePath: string;
  /** 置換した件数 */
  count: number;
  /** 置換が成功したかどうか */
  success: boolean;
  /** エラーメッセージ (失敗時) */
  error?: string;
}
```

### 2.2 SearchService インターフェース

```typescript
// SearchService.ts

export interface ISearchService {
  /**
   * ファイル内容から検索パターンにマッチする箇所を検索
   * @param content - ファイル内容
   * @param pattern - 検索パターン
   * @param options - 検索オプション
   * @returns マッチ結果の配列
   */
  searchInFile(
    content: string,
    pattern: string,
    options: SearchOptions,
  ): SearchMatch[];

  /**
   * ワークスペース全体から検索パターンにマッチする箇所を検索
   * @param pattern - 検索パターン
   * @param options - ワークスペース検索オプション
   * @returns ファイル検索結果のAsyncGenerator
   */
  searchInWorkspace(
    pattern: string,
    options: WorkspaceSearchOptions,
  ): AsyncGenerator<FileSearchResult, void, undefined>;

  /**
   * ファイル内容の検索パターンを置換
   * @param content - ファイル内容
   * @param pattern - 検索パターン
   * @param replacement - 置換文字列
   * @param options - 検索オプション
   * @returns 置換結果
   */
  replaceInFile(
    content: string,
    pattern: string,
    replacement: string,
    options: SearchOptions,
  ): ReplaceResult;

  /**
   * ワークスペース全体で置換を実行
   * @param pattern - 検索パターン
   * @param replacement - 置換文字列
   * @param options - ワークスペース検索オプション
   * @returns ワークスペース置換結果のAsyncGenerator
   */
  replaceInWorkspace(
    pattern: string,
    replacement: string,
    options: WorkspaceSearchOptions & { preview?: boolean; dryRun?: boolean },
  ): AsyncGenerator<WorkspaceReplaceResult, void, undefined>;

  /**
   * 検索をキャンセル
   */
  cancelSearch(): void;
}
```

---

## 3. 詳細設計

### 3.1 PatternMatcher

```typescript
// PatternMatcher.ts

export class PatternMatcher {
  private regex: RegExp | null = null;
  private options: SearchOptions;
  private timeoutMs: number;

  constructor(pattern: string, options: SearchOptions, timeoutMs = 5000) {
    this.options = options;
    this.timeoutMs = timeoutMs;
    this.regex = this.buildRegex(pattern);
  }

  /**
   * 検索パターンから正規表現を構築
   */
  private buildRegex(pattern: string): RegExp | null {
    if (!pattern) return null;

    try {
      let regexPattern: string;

      if (this.options.regex) {
        // 正規表現モード: パターンをそのまま使用
        regexPattern = pattern;
      } else {
        // リテラルモード: 特殊文字をエスケープ
        regexPattern = this.escapeRegex(pattern);
      }

      if (this.options.wholeWord) {
        regexPattern = `\\b${regexPattern}\\b`;
      }

      const flags = this.options.caseSensitive ? "g" : "gi";

      return new RegExp(regexPattern, flags);
    } catch {
      return null;
    }
  }

  /**
   * 正規表現の特殊文字をエスケープ
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * テキスト内でパターンにマッチする箇所を検索
   * @param text - 検索対象テキスト
   * @returns マッチ結果の配列
   */
  findMatches(
    text: string,
  ): Array<{ index: number; length: number; text: string }> {
    if (!this.regex) return [];

    const matches: Array<{ index: number; length: number; text: string }> = [];
    const startTime = Date.now();

    let match: RegExpExecArray | null;
    while ((match = this.regex.exec(text)) !== null) {
      // ReDoS対策: タイムアウトチェック
      if (Date.now() - startTime > this.timeoutMs) {
        throw new Error("Search timeout: pattern may be too complex");
      }

      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
      });

      // 無限ループ防止
      if (match.index === this.regex.lastIndex) {
        this.regex.lastIndex++;
      }
    }

    return matches;
  }

  /**
   * テキストを置換
   * @param text - 置換対象テキスト
   * @param replacement - 置換文字列
   * @returns 置換後のテキスト
   */
  replace(text: string, replacement: string): string {
    if (!this.regex) return text;
    return text.replace(this.regex, replacement);
  }

  /**
   * パターンが有効かどうかを検証
   */
  isValid(): boolean {
    return this.regex !== null;
  }
}
```

### 3.2 FileSearchEngine

```typescript
// FileSearchEngine.ts

export class FileSearchEngine {
  /**
   * ファイル内容を検索
   */
  search(
    content: string,
    pattern: string,
    options: SearchOptions,
    contextLines = 1,
  ): SearchMatch[] {
    const matcher = new PatternMatcher(pattern, options);
    if (!matcher.isValid()) return [];

    const lines = content.split("\n");
    const matches: SearchMatch[] = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineMatches = matcher.findMatches(line);

      for (const match of lineMatches) {
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          length: match.length,
          text: match.text,
          lineText: line,
          context: {
            before: this.getContextLines(lines, lineIndex, -contextLines),
            after: this.getContextLines(lines, lineIndex, contextLines),
          },
        });
      }
    }

    return matches;
  }

  /**
   * コンテキスト行を取得
   */
  private getContextLines(
    lines: string[],
    currentIndex: number,
    count: number,
  ): string[] {
    const result: string[] = [];
    const direction = count > 0 ? 1 : -1;
    const absCount = Math.abs(count);

    for (let i = 1; i <= absCount; i++) {
      const index = currentIndex + i * direction;
      if (index >= 0 && index < lines.length) {
        if (direction > 0) {
          result.push(lines[index]);
        } else {
          result.unshift(lines[index]);
        }
      }
    }

    return result;
  }
}
```

### 3.3 WorkspaceSearchEngine

```typescript
// WorkspaceSearchEngine.ts

import { glob } from "fast-glob";
import { readFile } from "fs/promises";

export class WorkspaceSearchEngine {
  private readonly defaultExclude = [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**",
    "**/*.min.js",
    "**/*.min.css",
  ];

  private abortController: AbortController | null = null;

  /**
   * ワークスペース全体を検索
   */
  async *search(
    workspacePath: string,
    pattern: string,
    options: WorkspaceSearchOptions,
  ): AsyncGenerator<FileSearchResult> {
    this.abortController = new AbortController();
    const fileSearchEngine = new FileSearchEngine();

    const files = await this.getFiles(workspacePath, options);

    let resultCount = 0;
    const maxResults = options.maxResults ?? 10000;

    for (const filePath of files) {
      if (this.abortController.signal.aborted) {
        return;
      }

      if (resultCount >= maxResults) {
        return;
      }

      try {
        const startTime = performance.now();
        const content = await readFile(filePath, "utf-8");
        const matches = fileSearchEngine.search(
          content,
          pattern,
          options,
          options.contextLines ?? 1,
        );

        if (matches.length > 0) {
          resultCount += matches.length;
          yield {
            filePath: filePath.replace(workspacePath + "/", ""),
            matches,
            searchTime: performance.now() - startTime,
          };
        }
      } catch (error) {
        // ファイル読み取りエラーは無視して続行
        console.warn(`Failed to read file: ${filePath}`, error);
      }
    }
  }

  /**
   * 検索対象ファイルを取得
   */
  private async getFiles(
    workspacePath: string,
    options: WorkspaceSearchOptions,
  ): Promise<string[]> {
    const include = options.include?.length ? options.include : ["**/*"];

    const exclude = [...this.defaultExclude, ...(options.exclude ?? [])];

    return glob(include, {
      cwd: workspacePath,
      absolute: true,
      ignore: exclude,
      onlyFiles: true,
      followSymbolicLinks: false,
    });
  }

  /**
   * 検索をキャンセル
   */
  cancel(): void {
    this.abortController?.abort();
  }
}
```

### 3.4 ReplaceEngine

```typescript
// ReplaceEngine.ts

export class ReplaceEngine {
  /**
   * ファイル内容を置換
   */
  replace(
    content: string,
    pattern: string,
    replacement: string,
    options: SearchOptions,
  ): ReplaceResult {
    const matcher = new PatternMatcher(pattern, options);
    if (!matcher.isValid()) {
      return { content, count: 0, replacements: [] };
    }

    const lines = content.split("\n");
    const replacements: ReplaceResult["replacements"] = [];
    let newContent = "";
    let totalCount = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineMatches = matcher.findMatches(line);

      if (lineMatches.length > 0) {
        // 行内の置換を実行
        let newLine = line;
        let offset = 0;

        for (const match of lineMatches) {
          const replacedText = this.buildReplacement(
            match.text,
            replacement,
            options.regex,
          );

          const adjustedIndex = match.index + offset;
          newLine =
            newLine.slice(0, adjustedIndex) +
            replacedText +
            newLine.slice(adjustedIndex + match.length);

          offset += replacedText.length - match.length;

          replacements.push({
            line: lineIndex + 1,
            column: match.index + 1,
            originalText: match.text,
            replacedText,
          });

          totalCount++;
        }

        newContent += newLine;
      } else {
        newContent += line;
      }

      if (lineIndex < lines.length - 1) {
        newContent += "\n";
      }
    }

    return {
      content: newContent,
      count: totalCount,
      replacements,
    };
  }

  /**
   * 置換文字列を構築 (キャプチャグループ対応)
   */
  private buildReplacement(
    matchText: string,
    replacement: string,
    isRegex: boolean,
  ): string {
    if (!isRegex) {
      return replacement;
    }

    // $1, $2 などのキャプチャグループ参照を処理
    // この実装では、実際のマッチ情報が必要なため、
    // PatternMatcherにマッチ情報を保持させる必要がある
    return replacement;
  }
}
```

---

## 4. SearchService 実装

```typescript
// SearchService.ts

export class SearchService implements ISearchService {
  private readonly fileSearchEngine: FileSearchEngine;
  private readonly workspaceSearchEngine: WorkspaceSearchEngine;
  private readonly replaceEngine: ReplaceEngine;

  constructor() {
    this.fileSearchEngine = new FileSearchEngine();
    this.workspaceSearchEngine = new WorkspaceSearchEngine();
    this.replaceEngine = new ReplaceEngine();
  }

  searchInFile(
    content: string,
    pattern: string,
    options: SearchOptions,
  ): SearchMatch[] {
    return this.fileSearchEngine.search(content, pattern, options);
  }

  async *searchInWorkspace(
    pattern: string,
    options: WorkspaceSearchOptions,
  ): AsyncGenerator<FileSearchResult> {
    const workspacePath = options.workspacePath ?? process.cwd();
    yield* this.workspaceSearchEngine.search(workspacePath, pattern, options);
  }

  replaceInFile(
    content: string,
    pattern: string,
    replacement: string,
    options: SearchOptions,
  ): ReplaceResult {
    return this.replaceEngine.replace(content, pattern, replacement, options);
  }

  async *replaceInWorkspace(
    pattern: string,
    replacement: string,
    options: WorkspaceSearchOptions & { preview?: boolean; dryRun?: boolean },
  ): AsyncGenerator<WorkspaceReplaceResult> {
    const workspacePath = options.workspacePath ?? process.cwd();

    for await (const fileResult of this.workspaceSearchEngine.search(
      workspacePath,
      pattern,
      options,
    )) {
      try {
        const fullPath = `${workspacePath}/${fileResult.filePath}`;
        const content = await readFile(fullPath, "utf-8");
        const result = this.replaceEngine.replace(
          content,
          pattern,
          replacement,
          options,
        );

        if (!options.dryRun && !options.preview && result.count > 0) {
          await writeFile(fullPath, result.content, "utf-8");
        }

        yield {
          filePath: fileResult.filePath,
          count: result.count,
          success: true,
        };
      } catch (error) {
        yield {
          filePath: fileResult.filePath,
          count: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  }

  cancelSearch(): void {
    this.workspaceSearchEngine.cancel();
  }
}
```

---

## 5. パフォーマンス最適化

### 5.1 検索の最適化

| 最適化項目             | 実装方法                    | 効果                     |
| ---------------------- | --------------------------- | ------------------------ |
| 早期終了               | maxResults到達時に検索中断  | 大規模検索の高速化       |
| 並列ファイル読み取り   | Promise.all + バッチ処理    | I/O待ち時間削減          |
| ファイルフィルタリング | glob パターンで事前フィルタ | 不要ファイルスキップ     |
| バイナリ検出           | ファイル先頭のNULL検出      | バイナリファイルスキップ |
| メモリストリーミング   | AsyncGenerator使用          | メモリ使用量削減         |

### 5.2 ReDoS対策

```typescript
// ReDoS対策の実装
const REGEX_TIMEOUT_MS = 5000;
const MAX_BACKTRACK_LIMIT = 100000;

function safeRegexExec(regex: RegExp, text: string): RegExpExecArray | null {
  const startTime = Date.now();
  let backtrackCount = 0;

  // 危険なパターンの検出
  const dangerousPatterns = [
    /(\w+)+$/, // nested quantifiers
    /(\w|\d)+$/, // alternation with quantifiers
    /(a+)+$/, // polynomial backtracking
  ];

  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(regex.source)) {
      console.warn("Potentially dangerous regex pattern detected");
    }
  }

  try {
    return regex.exec(text);
  } catch {
    return null;
  }
}
```

### 5.3 キャッシング

```typescript
// 検索結果のキャッシング
class SearchCache {
  private cache = new Map<
    string,
    { results: SearchMatch[]; timestamp: number }
  >();
  private maxAge = 5000; // 5秒

  getCacheKey(
    content: string,
    pattern: string,
    options: SearchOptions,
  ): string {
    return `${hashString(content)}:${pattern}:${JSON.stringify(options)}`;
  }

  get(key: string): SearchMatch[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.results;
    }
    return null;
  }

  set(key: string, results: SearchMatch[]): void {
    this.cache.set(key, { results, timestamp: Date.now() });
  }
}
```

---

## 6. エラーハンドリング

### 6.1 エラー種別

| エラー種別          | 原因                     | 対処                |
| ------------------- | ------------------------ | ------------------- |
| InvalidPatternError | 無効な正規表現           | UIでエラー表示      |
| SearchTimeoutError  | ReDoS検出                | 検索中断 + 警告表示 |
| FileReadError       | ファイル読み取り失敗     | スキップして続行    |
| EncodingError       | 文字エンコーディング問題 | UTF-8でリトライ     |
| AbortError          | ユーザーキャンセル       | 正常終了            |

### 6.2 エラークラス

```typescript
export class SearchError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false,
  ) {
    super(message);
    this.name = "SearchError";
  }
}

export class InvalidPatternError extends SearchError {
  constructor(pattern: string) {
    super(`Invalid search pattern: ${pattern}`, "INVALID_PATTERN", true);
  }
}

export class SearchTimeoutError extends SearchError {
  constructor() {
    super("Search timeout: pattern may be too complex", "SEARCH_TIMEOUT", true);
  }
}
```

---

## 7. テスト戦略

### 7.1 単体テスト

```typescript
describe("PatternMatcher", () => {
  it("リテラル検索が正しく動作する", () => {
    const matcher = new PatternMatcher("hello", {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
    });

    const matches = matcher.findMatches("hello world hello");
    expect(matches).toHaveLength(2);
    expect(matches[0].index).toBe(0);
    expect(matches[1].index).toBe(12);
  });

  it("大文字小文字区別が正しく動作する", () => {
    const matcher = new PatternMatcher("Hello", {
      caseSensitive: true,
      wholeWord: false,
      regex: false,
    });

    const matches = matcher.findMatches("hello Hello HELLO");
    expect(matches).toHaveLength(1);
    expect(matches[0].index).toBe(6);
  });

  it("単語単位検索が正しく動作する", () => {
    const matcher = new PatternMatcher("test", {
      caseSensitive: false,
      wholeWord: true,
      regex: false,
    });

    const matches = matcher.findMatches("test testing testcase test");
    expect(matches).toHaveLength(2);
  });

  it("正規表現検索が正しく動作する", () => {
    const matcher = new PatternMatcher("\\d+", {
      caseSensitive: false,
      wholeWord: false,
      regex: true,
    });

    const matches = matcher.findMatches("abc 123 def 456");
    expect(matches).toHaveLength(2);
  });
});
```

### 7.2 統合テスト

```typescript
describe("SearchService", () => {
  it("ファイル内検索が正しく動作する", () => {
    const service = new SearchService();
    const content = `line 1: hello world
line 2: hello there
line 3: goodbye world`;

    const matches = service.searchInFile(content, "hello", {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
    });

    expect(matches).toHaveLength(2);
    expect(matches[0].line).toBe(1);
    expect(matches[1].line).toBe(2);
  });

  it("置換が正しく動作する", () => {
    const service = new SearchService();
    const content = "hello world hello";

    const result = service.replaceInFile(content, "hello", "hi", {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
    });

    expect(result.content).toBe("hi world hi");
    expect(result.count).toBe(2);
  });
});
```
