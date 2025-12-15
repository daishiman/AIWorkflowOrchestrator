/**
 * WorkspaceReplaceService - ワークスペース全体置換
 *
 * 機能:
 * - 複数ファイルの一括置換
 * - 置換プレビュー生成
 * - トランザクション管理（一括Undo/Redo）
 * - 選択的ファイル置換
 * - 正規表現キャプチャグループ対応
 * - 大文字/小文字保持
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  WorkspaceSearchService,
  type WorkspaceSearchOptions,
  type WorkspaceSearchResult,
} from "../search/WorkspaceSearchService";
import { ReplaceService } from "./ReplaceService";
import { CaptureExpander } from "./CaptureExpander";
import { PreserveCaseTransformer } from "./PreserveCaseTransformer";
// Types from search module (available for future use)
// import type { SearchMatch, SearchOptions as SearchMatchOptions } from "../search/types";
import { validateRegex, generateId } from "../utils";

export interface WorkspaceReplaceOptions {
  searchQuery: string;
  replacement: string;
  workspacePath: string;
  include: string[];
  exclude?: string[];
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  preserveCase: boolean;
  selectedFiles?: string[];
}

export interface ReplacePreviewItem {
  line: number;
  column: number;
  before: string;
  after: string;
  lineText: string;
}

export interface FileReplacePreview {
  filePath: string;
  relativePath: string;
  replacements: ReplacePreviewItem[];
}

export interface ReplacePreview {
  totalMatches: number;
  files: FileReplacePreview[];
}

export interface ReplaceResult {
  filesModified: number;
  totalReplacements: number;
  undoId: string;
  modifiedFiles: string[];
}

interface UndoEntry {
  files: Map<string, string>;
  newContents: Map<string, string>;
}

export class WorkspaceReplaceService {
  private searchService: WorkspaceSearchService;
  private replaceService: ReplaceService;
  private captureExpander: CaptureExpander;
  private caseTransformer: PreserveCaseTransformer;
  private undoStack: Map<string, UndoEntry> = new Map();
  private redoStack: Map<string, UndoEntry> = new Map();

  constructor() {
    this.searchService = new WorkspaceSearchService();
    this.replaceService = new ReplaceService();
    this.captureExpander = new CaptureExpander();
    this.caseTransformer = new PreserveCaseTransformer();
  }

  /**
   * プレビューを生成（ファイルを変更しない）
   */
  async preview(options: WorkspaceReplaceOptions): Promise<ReplacePreview> {
    const searchResults = await this.performSearch(options);

    if (searchResults.length === 0) {
      return { totalMatches: 0, files: [] };
    }

    // ファイルごとにグループ化
    const groupedResults = this.groupByFile(searchResults);

    const files: FileReplacePreview[] = [];

    for (const [filePath, results] of groupedResults) {
      const replacements: ReplacePreviewItem[] = results.map((result) => ({
        line: result.line,
        column: result.column,
        before: result.match,
        after: this.computeReplacement(result.match, options),
        lineText: result.lineText,
      }));

      files.push({
        filePath,
        relativePath: path.relative(options.workspacePath, filePath),
        replacements,
      });
    }

    return {
      totalMatches: searchResults.length,
      files,
    };
  }

  /**
   * 一括置換を実行
   */
  async replaceAll(options: WorkspaceReplaceOptions): Promise<ReplaceResult> {
    if (!options.searchQuery) {
      return {
        filesModified: 0,
        totalReplacements: 0,
        undoId: "",
        modifiedFiles: [],
      };
    }

    // 正規表現の検証
    if (options.useRegex) {
      validateRegex(options.searchQuery);
    }

    const searchResults = await this.performSearch(options);

    if (searchResults.length === 0) {
      return {
        filesModified: 0,
        totalReplacements: 0,
        undoId: "",
        modifiedFiles: [],
      };
    }

    // 選択されたファイルのみに絞り込み
    const filteredResults = options.selectedFiles
      ? searchResults.filter((r) => options.selectedFiles!.includes(r.file))
      : searchResults;

    if (filteredResults.length === 0) {
      return {
        filesModified: 0,
        totalReplacements: 0,
        undoId: "",
        modifiedFiles: [],
      };
    }

    // ファイルごとにグループ化
    const groupedResults = this.groupByFile(filteredResults);

    // Undo用にバックアップを保存
    const undoId = generateId("undo");
    const originalContents = new Map<string, string>();
    const newContents = new Map<string, string>();
    const modifiedFiles: string[] = [];

    let totalReplacements = 0;

    for (const [filePath, results] of groupedResults) {
      try {
        // 元の内容を読み込み
        const originalContent = await fs.readFile(filePath, "utf-8");
        originalContents.set(filePath, originalContent);

        // 置換を実行
        const newContent = this.replaceInContent(
          originalContent,
          results,
          options,
        );

        // ファイルに書き込み
        await fs.writeFile(filePath, newContent, "utf-8");

        newContents.set(filePath, newContent);
        modifiedFiles.push(filePath);
        totalReplacements += results.length;
      } catch {
        // ファイル処理エラーは無視して続行
        continue;
      }
    }

    // Undoエントリを保存
    if (modifiedFiles.length > 0) {
      this.undoStack.set(undoId, {
        files: originalContents,
        newContents,
      });
    }

    return {
      filesModified: modifiedFiles.length,
      totalReplacements,
      undoId,
      modifiedFiles,
    };
  }

  /**
   * 置換をUndoする
   */
  async undo(undoId: string): Promise<void> {
    const entry = this.undoStack.get(undoId);
    if (!entry) {
      throw new Error(`Undo entry not found: ${undoId}`);
    }

    // 元の内容に戻す
    for (const [filePath, content] of entry.files) {
      await fs.writeFile(filePath, content, "utf-8");
    }

    // Redoスタックに移動
    this.redoStack.set(undoId, entry);
    this.undoStack.delete(undoId);
  }

  /**
   * UndoをRedoする
   */
  async redo(undoId: string): Promise<void> {
    const entry = this.redoStack.get(undoId);
    if (!entry) {
      throw new Error(`Redo entry not found: ${undoId}`);
    }

    // 新しい内容に戻す
    for (const [filePath, content] of entry.newContents) {
      await fs.writeFile(filePath, content, "utf-8");
    }

    // Undoスタックに戻す
    this.undoStack.set(undoId, entry);
    this.redoStack.delete(undoId);
  }

  /**
   * 検索を実行
   */
  private async performSearch(
    options: WorkspaceReplaceOptions,
  ): Promise<WorkspaceSearchResult[]> {
    const searchOptions: WorkspaceSearchOptions = {
      query: options.searchQuery,
      workspacePath: options.workspacePath,
      include: options.include,
      exclude: options.exclude,
      caseSensitive: options.caseSensitive,
      wholeWord: options.wholeWord,
      useRegex: options.useRegex,
    };

    return this.searchService.search(searchOptions);
  }

  /**
   * 検索結果をファイルごとにグループ化
   */
  private groupByFile(
    results: WorkspaceSearchResult[],
  ): Map<string, WorkspaceSearchResult[]> {
    const grouped = new Map<string, WorkspaceSearchResult[]>();

    for (const result of results) {
      if (!grouped.has(result.file)) {
        grouped.set(result.file, []);
      }
      grouped.get(result.file)!.push(result);
    }

    return grouped;
  }

  /**
   * コンテンツ内で置換を実行
   */
  private replaceInContent(
    content: string,
    results: WorkspaceSearchResult[],
    options: WorkspaceReplaceOptions,
  ): string {
    // 後ろから置換して位置のズレを防ぐ
    const sortedResults = [...results].sort((a, b) => {
      if (a.line !== b.line) {
        return b.line - a.line;
      }
      return b.column - a.column;
    });

    const lines = content.split("\n");

    for (const result of sortedResults) {
      const lineIndex = result.line;
      if (lineIndex < 0 || lineIndex >= lines.length) {
        continue;
      }

      const line = lines[lineIndex];
      const replacement = this.computeReplacement(result.match, options);

      const before = line.substring(0, result.column);
      const after = line.substring(result.column + result.match.length);
      lines[lineIndex] = before + replacement + after;
    }

    return lines.join("\n");
  }

  /**
   * 置換テキストを計算
   */
  private computeReplacement(
    matchText: string,
    options: WorkspaceReplaceOptions,
  ): string {
    let replacement = options.replacement;

    // 正規表現キャプチャグループの展開
    if (options.useRegex) {
      const pattern = new RegExp(
        options.searchQuery,
        options.caseSensitive ? "" : "i",
      );
      replacement = this.captureExpander.expand(
        matchText,
        pattern,
        options.replacement,
      );
    }

    // 大文字/小文字保持
    if (options.preserveCase) {
      replacement = this.caseTransformer.transform(matchText, replacement);
    }

    return replacement;
  }
}
