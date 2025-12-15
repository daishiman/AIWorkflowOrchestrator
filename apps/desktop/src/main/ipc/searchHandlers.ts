/**
 * Search/Replace IPC Handlers
 *
 * 検索・置換機能のIPCハンドラー実装
 */

import { ipcMain } from "electron";
import * as fs from "fs/promises";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  SearchFileRequest,
  SearchFileResponse,
  SearchWorkspaceRequest,
  SearchWorkspaceResponse,
  ReplaceFileSingleRequest,
  ReplaceFileSingleResponse,
  ReplaceFileAllRequest,
  ReplaceFileAllResponse,
  ReplaceWorkspaceAllRequest,
  ReplaceWorkspaceAllResponse,
  ReplaceUndoRequest,
  ReplaceUndoResponse,
  ReplaceRedoRequest,
  ReplaceRedoResponse,
  SearchMatch,
} from "../../preload/types";
import {
  validatePath,
  validateString,
  createValidationErrorResponse,
} from "./validation";
import { PatternMatcher } from "../search/PatternMatcher";
import { FileReader } from "../search/FileReader";
import {
  WorkspaceSearchService,
  type WorkspaceSearchOptions,
} from "../search/WorkspaceSearchService";
import { ReplaceService } from "../replace/ReplaceService";
import {
  WorkspaceReplaceService,
  type WorkspaceReplaceOptions,
} from "../replace/WorkspaceReplaceService";

// Service instances
const patternMatcher = new PatternMatcher();
const fileReader = new FileReader();
const workspaceSearchService = new WorkspaceSearchService();
const replaceService = new ReplaceService();
const workspaceReplaceService = new WorkspaceReplaceService();

/**
 * 単一ファイル内検索
 */
async function searchInFile(
  filePath: string,
  query: string,
  options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean },
): Promise<SearchMatch[]> {
  const fileContent = await fileReader.readFile(filePath);
  if (!fileContent) {
    return [];
  }

  const lines = fileContent.content.split("\n");
  const matches: SearchMatch[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex];
    const lineMatches = patternMatcher.match(lineText, query, options);

    for (const match of lineMatches) {
      matches.push({
        text: match.match,
        line: lineIndex + 1, // 1-indexed for UI
        column: match.start + 1, // 1-indexed for UI
        length: match.match.length,
      });
    }
  }

  return matches;
}

export function registerSearchHandlers(): void {
  // ===== Search handlers =====

  // Search in single file
  ipcMain.handle(
    IPC_CHANNELS.SEARCH_FILE_EXECUTE,
    async (_event, request: SearchFileRequest): Promise<SearchFileResponse> => {
      try {
        // Validate inputs
        const pathValidation = validatePath(request.filePath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(
            pathValidation.error!,
          ) as SearchFileResponse;
        }

        const queryValidation = validateString(request.query, {
          maxLength: 10000,
        });
        if (!queryValidation.valid) {
          return createValidationErrorResponse(
            queryValidation.error!,
          ) as SearchFileResponse;
        }

        // Empty query returns empty results
        if (!request.query) {
          return {
            success: true,
            data: {
              matches: [],
              totalCount: 0,
            },
          };
        }

        const matches = await searchInFile(
          request.filePath,
          request.query,
          request.options,
        );

        return {
          success: true,
          data: {
            matches,
            totalCount: matches.length,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Search in workspace
  ipcMain.handle(
    IPC_CHANNELS.SEARCH_WORKSPACE_EXECUTE,
    async (
      _event,
      request: SearchWorkspaceRequest,
    ): Promise<SearchWorkspaceResponse> => {
      try {
        // Validate inputs
        const pathValidation = validatePath(request.rootPath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(
            pathValidation.error!,
          ) as SearchWorkspaceResponse;
        }

        const queryValidation = validateString(request.query, {
          maxLength: 10000,
        });
        if (!queryValidation.valid) {
          return createValidationErrorResponse(
            queryValidation.error!,
          ) as SearchWorkspaceResponse;
        }

        // Empty query returns empty results
        if (!request.query) {
          return {
            success: true,
            data: {
              matches: [],
              totalCount: 0,
              fileCount: 0,
            },
          };
        }

        const searchOptions: WorkspaceSearchOptions = {
          query: request.query,
          workspacePath: request.rootPath,
          include: request.includePattern ? [request.includePattern] : ["**/*"],
          exclude: request.excludePatterns,
          caseSensitive: request.options.caseSensitive,
          wholeWord: request.options.wholeWord,
          useRegex: request.options.useRegex,
        };

        const results = await workspaceSearchService.search(searchOptions);

        const matches = results.map((r) => ({
          text: r.match,
          line: r.line + 1, // 1-indexed for UI
          column: r.column + 1, // 1-indexed for UI
          length: r.match.length,
          filePath: r.file,
        }));

        const fileCount = new Set(matches.map((m) => m.filePath)).size;

        return {
          success: true,
          data: {
            matches,
            totalCount: matches.length,
            fileCount,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // ===== Replace handlers =====

  // Replace single match in file
  ipcMain.handle(
    IPC_CHANNELS.REPLACE_FILE_SINGLE,
    async (
      _event,
      request: ReplaceFileSingleRequest,
    ): Promise<ReplaceFileSingleResponse> => {
      try {
        // Validate inputs
        const pathValidation = validatePath(request.filePath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(
            pathValidation.error!,
          ) as ReplaceFileSingleResponse;
        }

        // Read file content
        const content = await fs.readFile(request.filePath, "utf-8");

        // Perform replacement
        const result = replaceService.replaceSingle(
          content,
          request.match,
          request.replaceString,
          {
            ...request.searchOptions,
            pattern: request.query,
          },
          request.replaceOptions,
        );

        // Write back to file
        await fs.writeFile(request.filePath, result.newContent, "utf-8");

        return {
          success: true,
          data: {
            newContent: result.newContent,
            undoGroupId: `single-${Date.now()}`,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Replace all matches in single file
  ipcMain.handle(
    IPC_CHANNELS.REPLACE_FILE_ALL,
    async (
      _event,
      request: ReplaceFileAllRequest,
    ): Promise<ReplaceFileAllResponse> => {
      try {
        // Validate inputs
        const pathValidation = validatePath(request.filePath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(
            pathValidation.error!,
          ) as ReplaceFileAllResponse;
        }

        // Read file content
        const content = await fs.readFile(request.filePath, "utf-8");

        // Find all matches first
        const matches = await searchInFile(
          request.filePath,
          request.query,
          request.searchOptions,
        );

        if (matches.length === 0) {
          return {
            success: true,
            data: {
              replacedCount: 0,
              undoGroupId: "",
            },
          };
        }

        // Perform all replacements
        const result = replaceService.replaceMatches(
          content,
          matches,
          request.replaceString,
          {
            ...request.searchOptions,
            pattern: request.query,
          },
          request.replaceOptions,
        );

        // Write back to file
        await fs.writeFile(request.filePath, result.newContent, "utf-8");

        return {
          success: true,
          data: {
            replacedCount: result.replacements.length,
            undoGroupId: `all-${Date.now()}`,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Replace all matches in workspace
  ipcMain.handle(
    IPC_CHANNELS.REPLACE_WORKSPACE_ALL,
    async (
      _event,
      request: ReplaceWorkspaceAllRequest,
    ): Promise<ReplaceWorkspaceAllResponse> => {
      try {
        // Validate inputs
        const pathValidation = validatePath(request.rootPath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(
            pathValidation.error!,
          ) as ReplaceWorkspaceAllResponse;
        }

        const replaceOptions: WorkspaceReplaceOptions = {
          searchQuery: request.query,
          replacement: request.replaceString,
          workspacePath: request.rootPath,
          include: request.includePattern ? [request.includePattern] : ["**/*"],
          exclude: request.excludePatterns,
          caseSensitive: request.searchOptions.caseSensitive,
          wholeWord: request.searchOptions.wholeWord,
          useRegex: request.searchOptions.useRegex,
          preserveCase: request.replaceOptions.preserveCase,
        };

        const result = await workspaceReplaceService.replaceAll(replaceOptions);

        return {
          success: true,
          data: {
            replacedCount: result.totalReplacements,
            fileCount: result.filesModified,
            undoGroupId: result.undoId,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Undo replacement
  ipcMain.handle(
    IPC_CHANNELS.REPLACE_UNDO,
    async (
      _event,
      request: ReplaceUndoRequest,
    ): Promise<ReplaceUndoResponse> => {
      try {
        await workspaceReplaceService.undo(request.undoGroupId);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Redo replacement
  ipcMain.handle(
    IPC_CHANNELS.REPLACE_REDO,
    async (
      _event,
      request: ReplaceRedoRequest,
    ): Promise<ReplaceRedoResponse> => {
      try {
        await workspaceReplaceService.redo(request.undoGroupId);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}
