/**
 * MockTokenizer
 *
 * @description テスト用のトークナイザーモック
 */

import type { ITokenizer } from "../../interfaces";

/**
 * テスト用トークナイザー
 *
 * 簡易実装: 1文字 = 1トークン
 */
export class MockTokenizer implements ITokenizer {
  /**
   * テキストをトークンIDに変換
   *
   * @param text - トークン化対象テキスト
   * @returns トークンID配列
   */
  encode(text: string): number[] {
    // 簡易実装: 各文字をASCIIコードに変換
    return Array.from(text, (char) => char.charCodeAt(0));
  }

  /**
   * トークンIDをテキストに変換
   *
   * @param tokens - トークンID配列
   * @returns テキスト
   */
  decode(tokens: number[]): string {
    // 簡易実装: ASCIIコードを文字に戻す
    return tokens.map((t) => String.fromCharCode(t)).join("");
  }

  /**
   * テキストのトークン数をカウント
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  countTokens(text: string): number {
    // 簡易実装: 文字数 = トークン数
    return text.length;
  }
}

/**
 * カスタムトークン数を返すモックトークナイザー
 *
 * テストで特定のトークン数を設定したい場合に使用
 */
export class ConfigurableTokenizer implements ITokenizer {
  private tokenCountMap: Map<string, number> = new Map();

  /**
   * テキストに対するトークン数を設定
   *
   * @param text - テキスト
   * @param count - トークン数
   */
  setTokenCount(text: string, count: number): void {
    this.tokenCountMap.set(text, count);
  }

  encode(text: string): number[] {
    const count = this.tokenCountMap.get(text) ?? text.length;
    return Array.from({ length: count }, (_, i) => i);
  }

  decode(tokens: number[]): string {
    return tokens.map((t) => String.fromCharCode(65 + (t % 26))).join("");
  }

  countTokens(text: string): number {
    return this.tokenCountMap.get(text) ?? text.length;
  }
}
