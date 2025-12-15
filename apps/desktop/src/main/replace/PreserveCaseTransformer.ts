/**
 * PreserveCaseTransformer - 大文字/小文字パターンを保持した置換
 *
 * 機能:
 * - 元のテキストの大文字/小文字パターンを検出
 * - 置換テキストに同じパターンを適用
 * - UPPER_CASE, lower_case, Title Case, camelCase, PascalCase 対応
 */

type CasePattern = "upper" | "lower" | "title" | "camel" | "mixed" | "unknown";

export class PreserveCaseTransformer {
  /**
   * 元のテキストの大文字/小文字パターンを保持して置換テキストを変換
   * @param original 元のテキスト（パターン検出元）
   * @param replacement 置換テキスト
   * @returns 変換後の置換テキスト
   */
  transform(original: string, replacement: string): string {
    if (!original || !replacement) {
      return replacement;
    }

    const pattern = this.detectPattern(original);

    // アルファベット部分のみを比較して長さの違いを判定
    const originalLetters = original.replace(/[^a-zA-Z]/g, "");
    const replacementLetters = replacement.replace(/[^a-zA-Z]/g, "");

    // 元のテキストより置換テキストが長い場合は文字ごとのパターン適用（上限付き）
    if (
      originalLetters.length < replacementLetters.length &&
      originalLetters.length > 0 &&
      originalLetters.length <= 2 &&
      pattern === "upper"
    ) {
      // 短い大文字パターンの場合、文字ごとに適用して残りは小文字
      return this.applyCharacterByCharacter(original, replacement);
    }

    switch (pattern) {
      case "upper":
        return replacement.toUpperCase();
      case "lower":
        return replacement.toLowerCase();
      case "title":
        return this.toTitleCase(replacement);
      case "camel":
        // camelCaseは置換テキストがすでにcamelCaseならそのまま維持
        if (this.isCamelCase(replacement)) {
          return replacement;
        }
        return replacement.toLowerCase();
      case "mixed":
        // mixed caseの場合、交互パターン (AbCd) なら文字ごとパターン適用
        if (
          originalLetters.length === replacementLetters.length &&
          this.isAlternatingCase(originalLetters)
        ) {
          return this.applyCharacterByCharacter(original, replacement);
        }
        // そうでなければ先頭ケースのみ
        return this.applyFirstCharacterCase(original, replacement);
      default:
        return replacement;
    }
  }

  /**
   * camelCaseかどうかを判定
   */
  private isCamelCase(text: string): boolean {
    const letters = text.replace(/[^a-zA-Z]/g, "");
    if (!letters) return false;
    // 先頭が小文字で、途中に大文字がある
    return /^[a-z].*[A-Z]/.test(letters);
  }

  /**
   * 交互に大文字・小文字が入れ替わるパターンかどうかを判定
   */
  private isAlternatingCase(letters: string): boolean {
    if (letters.length < 2) return false;

    let expectedUpper = /^[A-Z]/.test(letters);
    for (let i = 0; i < letters.length; i++) {
      const isUpper = letters[i] === letters[i].toUpperCase();
      if (isUpper !== expectedUpper) return false;
      expectedUpper = !expectedUpper;
    }
    return true;
  }

  /**
   * 先頭文字のケースのみを適用
   */
  private applyFirstCharacterCase(
    original: string,
    replacement: string,
  ): string {
    const firstOriginalLetter = original.match(/[a-zA-Z]/)?.[0];
    if (!firstOriginalLetter) {
      return replacement;
    }

    const isFirstUpper =
      firstOriginalLetter === firstOriginalLetter.toUpperCase();

    return replacement.replace(/[a-zA-Z]/, (char) =>
      isFirstUpper ? char.toUpperCase() : char.toLowerCase(),
    );
  }

  /**
   * テキストの大文字/小文字パターンを検出
   */
  private detectPattern(text: string): CasePattern {
    // アルファベットのみを抽出
    const letters = text.replace(/[^a-zA-Z]/g, "");

    if (!letters) {
      return "unknown";
    }

    const isAllUpper = letters === letters.toUpperCase();
    const isAllLower = letters === letters.toLowerCase();

    if (isAllUpper) {
      return "upper";
    }

    if (isAllLower) {
      return "lower";
    }

    // スペースで区切られた複数単語のTitle Caseチェック
    const words = text.split(/[\s\-_]+/).filter((w) => /[a-zA-Z]/.test(w));
    const isTitleCase = words.every((word) => {
      const wordLetters = word.replace(/[^a-zA-Z]/g, "");
      if (!wordLetters) return true;
      return (
        /^[A-Z]/.test(wordLetters) &&
        wordLetters.slice(1) === wordLetters.slice(1).toLowerCase()
      );
    });

    if (isTitleCase && words.length > 0) {
      return "title";
    }

    // 単一単語でのTitle Case（PascalCase）
    const isFirstUpper = /^[A-Z]/.test(letters);
    if (isFirstUpper && letters.slice(1) === letters.slice(1).toLowerCase()) {
      return "title";
    }

    // camelCase: 先頭小文字で途中に大文字
    const hasUpperAfterFirst = /^[a-z].*[A-Z]/.test(letters);
    if (!isFirstUpper && hasUpperAfterFirst) {
      return "camel";
    }

    return "mixed";
  }

  /**
   * タイトルケースに変換（各単語の先頭を大文字に）
   */
  private toTitleCase(text: string): string {
    return text
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\B\w/g, (char) => char.toLowerCase());
  }

  /**
   * 文字ごとにケースパターンを適用
   */
  private applyCharacterByCharacter(
    original: string,
    replacement: string,
  ): string {
    const result: string[] = [];
    let originalIndex = 0;

    for (let i = 0; i < replacement.length; i++) {
      const char = replacement[i];

      // 非アルファベットはそのまま
      if (!/[a-zA-Z]/.test(char)) {
        result.push(char);
        continue;
      }

      // 対応する元の文字を探す
      while (
        originalIndex < original.length &&
        !/[a-zA-Z]/.test(original[originalIndex])
      ) {
        originalIndex++;
      }

      if (originalIndex < original.length) {
        const originalChar = original[originalIndex];
        if (originalChar === originalChar.toUpperCase()) {
          result.push(char.toUpperCase());
        } else {
          result.push(char.toLowerCase());
        }
        originalIndex++;
      } else {
        // 元のテキストより長い場合は小文字で継続
        result.push(char.toLowerCase());
      }
    }

    return result.join("");
  }
}
