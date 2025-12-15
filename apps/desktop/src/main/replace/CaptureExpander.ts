/**
 * CaptureExpander - 正規表現キャプチャグループの展開
 *
 * 機能:
 * - $0 (マッチ全体), $1, $2... のキャプチャグループ展開
 * - $<name> の名前付きキャプチャグループ展開
 * - $$ のリテラル $ エスケープ
 */

export class CaptureExpander {
  /**
   * キャプチャグループを展開して置換文字列を生成
   * @param text 検索対象テキスト
   * @param pattern 正規表現パターン
   * @param replacement 置換文字列（$1, $<name>等を含む）
   * @returns 展開後の置換文字列
   */
  expand(text: string, pattern: RegExp, replacement: string): string {
    const match = text.match(pattern);

    if (!match) {
      // マッチしない場合は置換文字列をそのまま返す
      return replacement;
    }

    return this.expandCaptures(match, replacement);
  }

  /**
   * マッチ結果からキャプチャグループを展開
   */
  private expandCaptures(match: RegExpMatchArray, replacement: string): string {
    let result = replacement;

    // $$ をリテラル $ に変換（一時的にプレースホルダーを使用）
    const dollarPlaceholder = "\u0000DOLLAR\u0000";
    result = result.replace(/\$\$/g, dollarPlaceholder);

    // 名前付きキャプチャグループ $<name>
    result = result.replace(/\$<([^>]+)>/g, (_, name: string) => {
      if (match.groups && name in match.groups) {
        return match.groups[name] ?? "";
      }
      return `$<${name}>`;
    });

    // 番号付きキャプチャグループ $0, $1, $2, ... $99
    // $12 のような2桁の数字を先に処理する必要があるため、降順で処理
    result = result.replace(/\$(\d{1,2})/g, (fullMatch, numStr: string) => {
      const num = parseInt(numStr, 10);

      if (num === 0) {
        // $0 はマッチ全体
        return match[0];
      }

      if (num < match.length) {
        return match[num] ?? "";
      }

      // 存在しないキャプチャグループはそのまま
      return fullMatch;
    });

    // プレースホルダーを $ に戻す
    result = result.replace(new RegExp(dollarPlaceholder, "g"), "$");

    return result;
  }
}
