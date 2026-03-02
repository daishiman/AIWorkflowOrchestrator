/**
 * deferred-tests.md パース結果の各テスト項目
 */
export interface DeferredTestItem {
  id: string;
  testContent: string;
  reason: string;
  environment: string;
  deadline: string;
  status: string;
}

/**
 * deferred-tests.md パース結果
 */
export interface DeferredTestsResult {
  items: DeferredTestItem[];
  allResolved: boolean;
}

/**
 * Markdown テーブルのパースに失敗した場合に throw されるエラー
 */
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

/**
 * deferred-tests.md ファイルが見つからない場合に throw されるエラー
 */
export class DeferredTestsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeferredTestsNotFoundError";
  }
}

/**
 * deferred-tests.md の Markdown テーブル内容をパースする。
 *
 * @param content - deferred-tests.md のファイル内容（文字列）
 * @returns パース結果（テスト項目一覧と全項目解消フラグ）
 * @throws ParseError テーブル形式が不正な場合
 * @throws DeferredTestsNotFoundError content が null/undefined の場合
 */
export function parseDeferredTests(content: string): DeferredTestsResult {
  if (content === null || content === undefined) {
    throw new DeferredTestsNotFoundError("deferred-tests.md が見つかりません");
  }

  const trimmed = content.trim();
  if (trimmed === "") {
    return { items: [], allResolved: true };
  }

  const lines = trimmed.split("\n").filter((line) => line.trim() !== "");
  const tableLines = lines.filter((line) => line.includes("|"));

  if (tableLines.length === 0) {
    throw new ParseError("Markdown テーブルが見つかりません");
  }

  // ヘッダー行とセパレーター行を除外（先頭2行）
  const dataLines = tableLines.filter((_, index) => index >= 2);

  const items: DeferredTestItem[] = dataLines.map((line) => {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell !== "");
    if (cells.length < 6) {
      throw new ParseError(`テーブル行のカラム数が不足しています: ${line}`);
    }
    return {
      id: cells[0],
      testContent: cells[1],
      reason: cells[2],
      environment: cells[3],
      deadline: cells[4],
      status: cells[5],
    };
  });

  const resolvedStatuses = new Set(["完了", "対応不要", "対象外"]);
  const allResolved =
    items.length === 0 ||
    items.every((item) => resolvedStatuses.has(item.status));

  return { items, allResolved };
}
