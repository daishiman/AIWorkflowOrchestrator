/**
 * GlobResolver - Globパターンによるファイル検索
 *
 * 機能:
 * - Globパターンによるファイル検索
 * - 複数パターンのサポート
 * - 除外パターンのサポート
 * - .gitignore連携
 */

import fg from "fast-glob";
import * as fs from "fs/promises";
import * as path from "path";

export interface GlobOptions {
  /** 除外パターン */
  exclude?: string[];
  /** .gitignoreを使用するか */
  useGitignore?: boolean;
}

export class GlobResolver {
  /**
   * 単一のGlobパターンを解決
   */
  async resolve(pattern: string, options?: GlobOptions): Promise<string[]> {
    return this.resolveMultiple([pattern], options);
  }

  /**
   * 複数のGlobパターンを解決
   */
  async resolveMultiple(
    patterns: string[],
    options?: GlobOptions,
  ): Promise<string[]> {
    try {
      // デフォルトの除外パターン
      const defaultIgnore = ["**/node_modules/**", "**/.git/**"];

      // ユーザー指定の除外パターン
      const userIgnore = options?.exclude || [];

      // .gitignoreからの除外パターン
      let gitignorePatterns: string[] = [];
      if (options?.useGitignore) {
        gitignorePatterns = await this.loadGitignorePatterns(patterns[0]);
      }

      // すべての除外パターンを結合
      const ignore = [...defaultIgnore, ...userIgnore, ...gitignorePatterns];

      // fast-globでファイルを検索
      const files = await fg(patterns, {
        ignore,
        absolute: true,
        onlyFiles: true,
        followSymbolicLinks: true,
        suppressErrors: true,
      });

      // 重複を除去してソート
      return [...new Set(files)].sort();
    } catch {
      // エラーが発生した場合は空配列を返す
      return [];
    }
  }

  /**
   * .gitignoreファイルからパターンを読み込む
   */
  private async loadGitignorePatterns(pattern: string): Promise<string[]> {
    try {
      // パターンからディレクトリを推測
      const baseDir = this.getBaseDirectory(pattern);
      const gitignorePath = path.join(baseDir, ".gitignore");

      // .gitignoreファイルを読み込む
      const content = await fs.readFile(gitignorePath, "utf-8");

      // パターンを解析
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          // ディレクトリパターンを調整
          if (line.endsWith("/")) {
            return `**/${line}**`;
          }
          return `**/${line}`;
        });
    } catch {
      // .gitignoreが存在しない場合は空配列を返す
      return [];
    }
  }

  /**
   * Globパターンからベースディレクトリを取得
   */
  private getBaseDirectory(pattern: string): string {
    // Glob特殊文字の前までがベースディレクトリ
    const globChars = ["*", "?", "[", "{"];
    let baseDir = pattern;

    for (const char of globChars) {
      const index = baseDir.indexOf(char);
      if (index !== -1) {
        baseDir = baseDir.substring(0, index);
      }
    }

    // 最後のディレクトリ区切り文字までを取得
    const lastSep = baseDir.lastIndexOf(path.sep);
    if (lastSep !== -1) {
      baseDir = baseDir.substring(0, lastSep);
    }

    return baseDir || ".";
  }
}
