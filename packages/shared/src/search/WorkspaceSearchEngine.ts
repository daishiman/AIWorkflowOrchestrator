/**
 * WorkspaceSearchEngine - ワークスペース全体の検索を担当
 *
 * 機能:
 * - 複数ファイルの並列検索
 * - インクルード/エクスクルードパターン
 * - AsyncGeneratorによるストリーミング結果
 * - キャンセル機能
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { FileSearchResult, WorkspaceSearchOptions } from "./types";
import { FileSearchEngine } from "./FileSearchEngine";

/**
 * デフォルトの除外パターン
 */
const DEFAULT_EXCLUDE_PATTERNS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/coverage/**",
  "**/*.min.js",
  "**/*.min.css",
];

/**
 * デフォルトのコンテキスト行数
 */
const DEFAULT_CONTEXT_LINES = 2;

/**
 * ワークスペース検索エンジン
 */
export class WorkspaceSearchEngine {
  private fileSearchEngine: FileSearchEngine;
  private cancelled: boolean = false;

  constructor() {
    this.fileSearchEngine = new FileSearchEngine();
  }

  /**
   * ワークスペース内を検索
   *
   * @param workspacePath - ワークスペースのパス
   * @param pattern - 検索パターン
   * @param options - 検索オプション
   * @yields ファイル検索結果
   */
  async *search(
    workspacePath: string,
    pattern: string,
    options: WorkspaceSearchOptions,
  ): AsyncGenerator<FileSearchResult> {
    this.cancelled = false;

    // ファイル一覧を取得
    const files = await this.getFiles(workspacePath, options);

    let resultCount = 0;
    const maxResults = options.maxResults ?? Infinity;
    const contextLines = options.contextLines ?? DEFAULT_CONTEXT_LINES;

    for (const filePath of files) {
      // キャンセルチェック
      if (this.cancelled) {
        break;
      }

      // 最大結果数チェック
      if (resultCount >= maxResults) {
        break;
      }

      try {
        // ファイル内容を読み取り
        const content = await fs.readFile(filePath, "utf-8");

        // 検索実行
        const matches = this.fileSearchEngine.search(
          content,
          pattern,
          {
            caseSensitive: options.caseSensitive,
            wholeWord: options.wholeWord,
            regex: options.regex,
          },
          contextLines,
        );

        // マッチがあれば結果を yield
        if (matches.length > 0) {
          yield {
            filePath,
            matches,
          };
          resultCount += matches.length;
        }
      } catch (error) {
        // ファイル読み取りエラーはスキップ
        console.warn(`Failed to read file: ${filePath}`, error);
      }
    }
  }

  /**
   * 検索をキャンセル
   */
  cancel(): void {
    this.cancelled = true;
  }

  /**
   * ワークスペース内のファイル一覧を取得
   */
  private async getFiles(
    workspacePath: string,
    options: WorkspaceSearchOptions,
  ): Promise<string[]> {
    const includePatterns = options.include ?? ["**/*"];
    const excludePatterns = options.exclude ?? DEFAULT_EXCLUDE_PATTERNS;

    // fast-globがインストールされている場合はそれを使用
    // フォールバックとして再帰的ファイル検索を実装
    try {
      const glob = await import("fast-glob");
      const files = await glob.default(includePatterns, {
        cwd: workspacePath,
        ignore: excludePatterns,
        absolute: true,
        onlyFiles: true,
        followSymbolicLinks: false,
      });
      return files;
    } catch {
      // fast-globがない場合はフォールバック
      return this.getFilesRecursive(
        workspacePath,
        includePatterns,
        excludePatterns,
      );
    }
  }

  /**
   * 再帰的にファイル一覧を取得（フォールバック）
   */
  private async getFilesRecursive(
    dir: string,
    _includePatterns: string[],
    excludePatterns: string[],
  ): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // 除外パターンチェック（簡易版）
        if (this.shouldExclude(fullPath, excludePatterns)) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.getFilesRecursive(
            fullPath,
            _includePatterns,
            excludePatterns,
          );
          files.push(...subFiles);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory: ${dir}`, error);
    }

    return files;
  }

  /**
   * パスが除外パターンにマッチするかチェック（簡易版）
   */
  private shouldExclude(filePath: string, excludePatterns: string[]): boolean {
    // 除外キーワードマップ（パターン -> パスチェック関数）
    const excludeChecks: Array<{
      keyword: string;
      check: (path: string) => boolean;
    }> = [
      { keyword: "node_modules", check: (p) => p.includes("node_modules") },
      { keyword: ".git", check: (p) => p.includes(".git") },
      { keyword: "dist", check: (p) => p.includes("/dist/") },
      { keyword: "build", check: (p) => p.includes("/build/") },
      { keyword: ".next", check: (p) => p.includes("/.next/") },
      { keyword: "coverage", check: (p) => p.includes("/coverage/") },
    ];

    return excludePatterns.some((pattern) =>
      excludeChecks.some(
        ({ keyword, check }) => pattern.includes(keyword) && check(filePath),
      ),
    );
  }
}
