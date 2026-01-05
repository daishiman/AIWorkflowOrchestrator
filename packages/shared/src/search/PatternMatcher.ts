/**
 * PatternMatcher - パターンマッチング処理を担当
 *
 * 機能:
 * - リテラル/正規表現パターンのマッチング
 * - 大文字小文字区別オプション
 * - 単語単位マッチオプション
 * - ReDoS対策のタイムアウト
 */

import type { PatternMatch } from "./types";

/**
 * パターンマッチャー設定
 */
export interface PatternMatcherOptions {
  /** 大文字小文字を区別 */
  caseSensitive: boolean;
  /** 単語単位でマッチ */
  wholeWord: boolean;
  /** 正規表現を使用 */
  regex: boolean;
}

/**
 * デフォルトのタイムアウト時間 (ms)
 */
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * 正規表現の特殊文字をエスケープ
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * パターンマッチャー
 */
export class PatternMatcher {
  private readonly pattern: string;
  private readonly options: PatternMatcherOptions;
  private readonly regex: RegExp | null;
  private readonly valid: boolean;
  private readonly timeoutMs: number;

  constructor(
    pattern: string,
    options: PatternMatcherOptions,
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {
    this.pattern = pattern;
    this.options = options;
    this.timeoutMs = timeoutMs;

    // 空パターンは無効
    if (!pattern) {
      this.regex = null;
      this.valid = false;
      return;
    }

    try {
      this.regex = this.buildRegex(pattern, options);
      this.valid = true;
    } catch {
      this.regex = null;
      this.valid = false;
    }
  }

  /**
   * パターンが有効かどうか
   */
  isValid(): boolean {
    return this.valid;
  }

  /**
   * テキスト内のマッチを検索
   */
  findMatches(text: string): PatternMatch[] {
    if (!this.regex || !this.valid) {
      return [];
    }

    const matches: PatternMatch[] = [];
    const startTime = Date.now();
    const globalRegex = this.getGlobalRegex();

    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = globalRegex.exec(text)) !== null) {
      // タイムアウトチェック
      if (Date.now() - startTime > this.timeoutMs) {
        throw new Error("timeout");
      }

      // 無限ループ防止（空文字マッチ時）
      if (match.index === lastIndex && match[0].length === 0) {
        globalRegex.lastIndex++;
        continue;
      }
      lastIndex = match.index;

      matches.push({
        index: match.index,
        text: match[0],
        groups: match.groups,
      });
    }

    return matches;
  }

  /**
   * テキスト内のマッチを置換
   */
  replace(text: string, replacement: string): string {
    if (!this.regex || !this.valid) {
      return text;
    }

    return text.replace(this.getGlobalRegex(), replacement);
  }

  /**
   * グローバルフラグ付きの正規表現を取得
   */
  private getGlobalRegex(): RegExp {
    if (!this.regex) {
      throw new Error("Regex not initialized");
    }
    const flags = this.regex.flags.includes("g")
      ? this.regex.flags
      : this.regex.flags + "g";
    return new RegExp(this.regex.source, flags);
  }

  /**
   * 正規表現を構築
   */
  private buildRegex(pattern: string, options: PatternMatcherOptions): RegExp {
    let regexPattern: string;

    if (options.regex) {
      // 正規表現モード
      regexPattern = pattern;
    } else {
      // リテラルモード: 特殊文字をエスケープ
      regexPattern = escapeRegExp(pattern);
    }

    // 単語単位マッチ
    if (options.wholeWord) {
      regexPattern = `\\b${regexPattern}\\b`;
    }

    // フラグ
    const flags = options.caseSensitive ? "g" : "gi";

    return new RegExp(regexPattern, flags);
  }
}
