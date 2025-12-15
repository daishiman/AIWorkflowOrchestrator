/**
 * SearchService - ファイル検索のオーケストレーション
 *
 * 機能:
 * - 複数ファイルを横断した検索
 * - 行番号・列番号の正確な取得
 * - コンテキスト行の取得
 * - フィルタリング（除外パターン、サイズ制限、バイナリスキップ）
 */

import {
  PatternMatcher,
  type SearchOptions as PatternOptions,
} from "./PatternMatcher";
import { FileReader } from "./FileReader";
import { GlobResolver } from "./GlobResolver";
import { BinaryDetector } from "./BinaryDetector";
import { validateRegex } from "../utils";

export interface SearchOptions {
  query: string;
  include: string[];
  exclude?: string[];
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  contextLines?: number;
  maxFileSize?: number;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  lineText: string;
  contextBefore?: string[];
  contextAfter?: string[];
}

export class SearchService {
  private patternMatcher: PatternMatcher;
  private fileReader: FileReader;
  private globResolver: GlobResolver;
  private binaryDetector: BinaryDetector;

  constructor() {
    this.patternMatcher = new PatternMatcher();
    this.fileReader = new FileReader();
    this.globResolver = new GlobResolver();
    this.binaryDetector = new BinaryDetector();
  }

  /**
   * 検索を実行
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    // 空クエリの場合は空配列を返す
    if (!options.query) {
      return [];
    }

    // 正規表現の場合は事前に検証
    if (options.useRegex) {
      validateRegex(options.query);
    }

    // ファイルパターンを解決
    const files = await this.globResolver.resolveMultiple(options.include, {
      exclude: options.exclude,
    });

    // 各ファイルで検索
    const results: SearchResult[] = [];

    for (const file of files) {
      try {
        const fileResults = await this.searchInFile(file, options);
        results.push(...fileResults);
      } catch {
        // ファイル読み込みエラーは無視して次へ
        continue;
      }
    }

    return results;
  }

  /**
   * 単一ファイル内で検索
   */
  private async searchInFile(
    filePath: string,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    // ファイルサイズチェック
    if (options.maxFileSize) {
      const stats = await this.getFileStats(filePath);
      if (stats && stats.size > options.maxFileSize) {
        return [];
      }
    }

    // バイナリファイルチェック
    if (await this.binaryDetector.isBinary(filePath)) {
      return [];
    }

    // ファイル内容を読み込み
    const fileContent = await this.fileReader.readFile(filePath);
    if (!fileContent) {
      return [];
    }

    // 行に分割
    const lines = fileContent.content.split("\n");

    // パターンマッチングオプション
    const patternOptions: PatternOptions = {
      caseSensitive: options.caseSensitive,
      wholeWord: options.wholeWord,
      useRegex: options.useRegex,
    };

    // 各行で検索
    const results: SearchResult[] = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const lineText = lines[lineIndex];

      // 行内でマッチを検索
      const matches = this.patternMatcher.match(
        lineText,
        options.query,
        patternOptions,
      );

      // 各マッチを結果に追加
      for (const match of matches) {
        const result: SearchResult = {
          file: filePath,
          line: lineIndex,
          column: match.start,
          match: match.match,
          lineText,
        };

        // コンテキスト行を追加
        if (options.contextLines && options.contextLines > 0) {
          result.contextBefore = this.getContextLines(
            lines,
            lineIndex,
            -options.contextLines,
          );
          result.contextAfter = this.getContextLines(
            lines,
            lineIndex,
            options.contextLines,
          );
        }

        results.push(result);
      }
    }

    return results;
  }

  /**
   * コンテキスト行を取得
   */
  private getContextLines(
    lines: string[],
    currentLine: number,
    count: number,
  ): string[] {
    const contextLines: string[] = [];

    if (count < 0) {
      // 前の行
      const start = Math.max(0, currentLine + count);
      for (let i = start; i < currentLine; i++) {
        contextLines.push(lines[i]);
      }
    } else {
      // 後の行
      const end = Math.min(lines.length, currentLine + count + 1);
      for (let i = currentLine + 1; i < end; i++) {
        contextLines.push(lines[i]);
      }
    }

    return contextLines;
  }

  /**
   * ファイルの統計情報を取得
   */
  private async getFileStats(
    filePath: string,
  ): Promise<{ size: number } | null> {
    try {
      const fs = await import("fs/promises");
      const stats = await fs.stat(filePath);
      return { size: stats.size };
    } catch {
      return null;
    }
  }
}
