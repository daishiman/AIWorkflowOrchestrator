/**
 * useWorkspaceSearch - ワークスペース検索プロバイダを提供するカスタムフック
 *
 * electronAPI経由でワークスペース検索を実行し、
 * 結果をAsyncGeneratorとして返す
 */

import { useCallback } from "react";
import type {
  FileSearchResult,
  SearchProviderOptions,
} from "../../../../features/search";

export type WorkspaceSearchProvider = (
  wsPath: string,
  query: string,
  options: SearchProviderOptions,
) => AsyncGenerator<FileSearchResult>;

/**
 * ワークスペース検索プロバイダを提供するカスタムフック
 */
export function useWorkspaceSearch(): WorkspaceSearchProvider {
  const workspaceSearchProvider = useCallback(async function* (
    wsPath: string,
    query: string,
    options: SearchProviderOptions,
  ): AsyncGenerator<FileSearchResult> {
    // electronAPIが利用できない場合は何も返さない
    if (!window.electronAPI?.search) {
      return;
    }

    try {
      const response = await window.electronAPI.search.executeWorkspace({
        rootPath: wsPath,
        query,
        options: {
          caseSensitive: options.caseSensitive,
          wholeWord: options.wholeWord,
          useRegex: options.regex,
        },
        includePattern: options.includePattern,
        excludePatterns: options.excludePattern
          ? [options.excludePattern]
          : undefined,
      });

      if (!response.success || !response.data) {
        return;
      }

      // マッチをファイルごとにグループ化
      const fileGroups = new Map<
        string,
        {
          filePath: string;
          matches: Array<{
            line: number;
            column: number;
            length: number;
            text: string;
            lineText: string;
          }>;
        }
      >();

      for (const match of response.data.matches) {
        const filePath = match.filePath;
        if (!fileGroups.has(filePath)) {
          fileGroups.set(filePath, { filePath, matches: [] });
        }
        fileGroups.get(filePath)!.matches.push({
          line: match.line,
          column: match.column,
          length: match.length,
          text: match.text,
          lineText: match.text, // IPCレスポンスにlineTextがない場合はtextを使用
        });
      }

      // 各ファイルの結果をyield
      for (const fileResult of fileGroups.values()) {
        yield fileResult;
      }
    } catch (error) {
      console.error("Workspace search error:", error);
    }
  }, []);

  return workspaceSearchProvider;
}
