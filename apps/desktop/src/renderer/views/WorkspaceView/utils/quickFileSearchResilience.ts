export interface QuickFileSearchResult {
  path: string;
  fileName: string;
  relativePath: string;
  score: number;
}

export interface QuickFileSearchViewState {
  kind: "idle" | "results" | "no-match";
  liveRegionText: string;
  emptyMessage: string;
}

function splitPath(filePath: string): {
  fileName: string;
  relativePath: string;
} {
  const normalized = filePath.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  const fileName = segments[segments.length - 1] ?? normalized;
  const relativePath =
    segments.length > 1 ? segments.slice(0, -1).join("/") : "";

  return { fileName, relativePath };
}

function hasSubsequenceMatch(candidate: string, query: string): boolean {
  let queryIndex = 0;

  for (let i = 0; i < candidate.length && queryIndex < query.length; i += 1) {
    if (candidate[i] === query[queryIndex]) {
      queryIndex += 1;
    }
  }

  return queryIndex === query.length;
}

function subsequenceScore(candidate: string, query: string): number {
  if (!hasSubsequenceMatch(candidate, query)) {
    return 0;
  }

  return query.length / candidate.length;
}

export function scoreFilePath(filePath: string, query: string): number {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) {
    return 0;
  }

  const { fileName, relativePath } = splitPath(filePath);
  const lowerFileName = fileName.toLowerCase();
  const lowerPath = filePath.toLowerCase();

  if (lowerFileName === trimmedQuery) {
    return 1;
  }

  if (lowerFileName.startsWith(trimmedQuery)) {
    return 0.92;
  }

  if (lowerFileName.includes(trimmedQuery)) {
    return 0.8;
  }

  if (lowerPath.includes(trimmedQuery)) {
    return 0.7;
  }

  const fileNameSubsequence = subsequenceScore(lowerFileName, trimmedQuery);
  const pathSubsequence = subsequenceScore(lowerPath, trimmedQuery);

  if (fileNameSubsequence === 0 && pathSubsequence === 0) {
    return 0;
  }

  const relativeBoost = relativePath.toLowerCase().includes(trimmedQuery)
    ? 0.08
    : 0;
  const fileNameFuzzyScore =
    fileNameSubsequence > 0 ? Math.min(fileNameSubsequence + 0.2, 0.79) : 0;
  const pathFuzzyScore =
    pathSubsequence > 0 ? pathSubsequence + relativeBoost : 0;

  return Math.max(fileNameFuzzyScore, pathFuzzyScore);
}

export function buildSearchResults(
  filePaths: string[],
  query: string,
  maxResults: number,
): QuickFileSearchResult[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  return filePaths
    .map((path) => {
      const { fileName, relativePath } = splitPath(path);
      const score = scoreFilePath(path, trimmedQuery);
      return {
        path,
        fileName,
        relativePath,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.path.localeCompare(b.path);
    })
    .slice(0, maxResults);
}

export function resolveQuickFileSearchViewState(
  query: string,
  resultCount: number,
): QuickFileSearchViewState {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      kind: "idle",
      liveRegionText: "検索語を入力してください",
      emptyMessage: "検索語を入力してください。",
    };
  }

  if (resultCount === 0) {
    return {
      kind: "no-match",
      liveRegionText: "一致するファイルは見つかりませんでした",
      emptyMessage: "一致するファイルは見つかりませんでした。",
    };
  }

  return {
    kind: "results",
    liveRegionText: `${resultCount} 件ヒット`,
    emptyMessage: "",
  };
}
