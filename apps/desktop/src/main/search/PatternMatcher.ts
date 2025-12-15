/**
 * PatternMatcher - テキスト検索のパターンマッチング
 *
 * 機能:
 * - 通常の文字列検索
 * - 正規表現検索
 * - 大文字/小文字区別オプション
 * - 単語単位検索
 * - ReDoS対策
 */

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface MatchResult {
  start: number;
  end: number;
  match: string;
}

// ReDoSの危険なパターンを検出する正規表現
const REDOS_PATTERNS = [
  // ネストした量指定子: (a+)+, (a*)+, (a+)*, (a*)*, etc.
  /\([^)]*[+*][^)]*\)[+*]/,
  // 重複する量指定子: a++, a**, a+*, etc.
  /[+*]{2,}/,
  // 後方参照を含むネストした繰り返し（キャプチャグループ）
  /\([^)]*\)[+*].*\\1/,
];

/**
 * 正規表現パターンがReDoS脆弱性を持つ可能性があるかチェック
 */
function isUnsafeRegexPattern(pattern: string): boolean {
  return REDOS_PATTERNS.some((redosPattern) => redosPattern.test(pattern));
}

/**
 * 正規表現の特殊文字をエスケープ
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class PatternMatcher {
  /**
   * テキスト内でパターンをマッチングし、結果を返す
   */
  match(text: string, query: string, options: SearchOptions): MatchResult[] {
    // 空クエリの場合は空配列を返す
    if (!query) {
      return [];
    }

    // 空テキストの場合も空配列を返す
    if (!text) {
      return [];
    }

    // 正規表現パターンを構築
    const pattern = this.buildPattern(query, options);

    // マッチング実行
    return this.executeMatch(text, pattern);
  }

  /**
   * 検索パターンを構築
   */
  private buildPattern(query: string, options: SearchOptions): RegExp {
    let pattern: string;

    if (options.useRegex) {
      // ReDoS脆弱性チェック
      if (isUnsafeRegexPattern(query)) {
        throw new Error(
          "Unsafe regex pattern detected: potential ReDoS vulnerability",
        );
      }

      pattern = query;
    } else {
      // リテラル検索: 特殊文字をエスケープ
      pattern = escapeRegex(query);
    }

    // 単語単位検索の場合、単語境界を追加
    if (options.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    // フラグを構築
    const flags = options.caseSensitive ? "g" : "gi";

    try {
      return new RegExp(pattern, flags);
    } catch (e) {
      throw new Error(
        `Invalid regex pattern: ${e instanceof Error ? e.message : "unknown error"}`,
      );
    }
  }

  /**
   * パターンマッチングを実行
   */
  private executeMatch(text: string, pattern: RegExp): MatchResult[] {
    const results: MatchResult[] = [];
    let match: RegExpExecArray | null;

    // 無限ループ防止のためのカウンター
    const maxIterations = 100000;
    let iterations = 0;

    while ((match = pattern.exec(text)) !== null) {
      iterations++;
      if (iterations > maxIterations) {
        throw new Error("Search exceeded maximum iterations");
      }

      results.push({
        start: match.index,
        end: match.index + match[0].length,
        match: match[0],
      });

      // ゼロ幅マッチの場合、無限ループを防ぐためにインデックスを進める
      if (match[0].length === 0) {
        pattern.lastIndex++;
      }
    }

    return results;
  }
}
