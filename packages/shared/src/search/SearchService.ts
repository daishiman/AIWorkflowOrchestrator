/**
 * SearchService - 検索・置換機能のファサード
 *
 * 機能:
 * - ファイル内検索/置換
 * - ワークスペース検索/置換
 * - 統一されたAPI
 */

import * as fs from "fs/promises";
import type {
  FileSearchResult,
  ReplaceResult,
  SearchMatch,
  SearchOptions,
  WorkspaceReplaceResult,
  WorkspaceSearchOptions,
} from "./types";
import { FileSearchEngine } from "./FileSearchEngine";
import { ReplaceEngine } from "./ReplaceEngine";
import { WorkspaceSearchEngine } from "./WorkspaceSearchEngine";

/**
 * 検索サービス
 */
export class SearchService {
  private fileSearchEngine: FileSearchEngine;
  private replaceEngine: ReplaceEngine;
  private workspaceSearchEngine: WorkspaceSearchEngine;

  constructor() {
    this.fileSearchEngine = new FileSearchEngine();
    this.replaceEngine = new ReplaceEngine();
    this.workspaceSearchEngine = new WorkspaceSearchEngine();
  }

  /**
   * ファイル内を検索
   *
   * @param content - 検索対象のテキスト
   * @param pattern - 検索パターン
   * @param options - 検索オプション
   * @returns マッチ情報の配列
   */
  searchInFile(
    content: string,
    pattern: string,
    options: SearchOptions,
  ): SearchMatch[] {
    return this.fileSearchEngine.search(content, pattern, options);
  }

  /**
   * ワークスペース内を検索
   *
   * @param pattern - 検索パターン
   * @param options - 検索オプション
   * @yields ファイル検索結果
   */
  async *searchInWorkspace(
    pattern: string,
    options: WorkspaceSearchOptions & { workspacePath?: string },
  ): AsyncGenerator<FileSearchResult> {
    const workspacePath = options.workspacePath ?? process.cwd();

    for await (const result of this.workspaceSearchEngine.search(
      workspacePath,
      pattern,
      options,
    )) {
      yield result;
    }
  }

  /**
   * ファイル内を置換
   *
   * @param content - 置換対象のテキスト
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
  ): ReplaceResult {
    return this.replaceEngine.replace(content, pattern, replacement, options);
  }

  /**
   * ワークスペース内を置換
   *
   * @param pattern - 検索パターン
   * @param replacement - 置換文字列
   * @param options - 検索オプション
   * @yields ファイル置換結果
   */
  async *replaceInWorkspace(
    pattern: string,
    replacement: string,
    options: WorkspaceSearchOptions & { workspacePath?: string },
  ): AsyncGenerator<WorkspaceReplaceResult> {
    const workspacePath = options.workspacePath ?? process.cwd();
    const isPreview = options.preview ?? false;
    const isDryRun = options.dryRun ?? false;

    for await (const searchResult of this.workspaceSearchEngine.search(
      workspacePath,
      pattern,
      options,
    )) {
      const { filePath } = searchResult;

      try {
        // ファイル内容を読み取り
        const content = await fs.readFile(filePath, "utf-8");

        // 置換を実行
        const replaceResult = this.replaceEngine.replace(
          content,
          pattern,
          replacement,
          {
            caseSensitive: options.caseSensitive,
            wholeWord: options.wholeWord,
            regex: options.regex,
          },
        );

        // プレビューまたはドライランモードでない場合は書き込み
        if (!isPreview && !isDryRun && replaceResult.count > 0) {
          await fs.writeFile(filePath, replaceResult.content, "utf-8");
        }

        yield {
          filePath,
          success: true,
          count: replaceResult.count,
          replacements: isPreview ? replaceResult.replacements : undefined,
        };
      } catch (error) {
        yield {
          filePath,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  }

  /**
   * 検索をキャンセル
   */
  cancelSearch(): void {
    this.workspaceSearchEngine.cancel();
  }
}
