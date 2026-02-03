/**
 * SDK呼び出しユーティリティ
 * TASK-9C: スキル改善・自動修正機能 - Phase 8 リファクタリング
 *
 * Claude Agent SDK呼び出しの共通パターンを集約
 */

/**
 * SDK query呼び出しのパラメータ
 */
export interface QueryParams {
  prompt: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * SDK query呼び出しの結果
 */
export interface QueryResult {
  content: string;
}

/**
 * JSON応答のパースオプション
 */
export interface ParseOptions {
  /** JSONが見つからない場合にエラーをスローするか */
  throwOnMissing?: boolean;
  /** デフォルト値（JSONが見つからない場合） */
  defaultValue?: unknown;
}

/**
 * SDK応答からJSON部分を抽出してパース
 * マークダウンコードブロック内のJSONにも対応
 *
 * @param content SDK応答の文字列
 * @param options パースオプション
 * @returns パース結果
 * @throws JSONが見つからない/パースに失敗した場合
 */
export function parseJsonResponse<T>(
  content: string,
  options: ParseOptions = {},
): T {
  const { throwOnMissing = true, defaultValue } = options;

  try {
    // JSON部分を抽出（マークダウンコードブロック対応）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      if (throwOnMissing) {
        throw new Error("JSONが見つかりません");
      }
      return defaultValue as T;
    }

    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    throw new Error(
      `AI応答のパースに失敗しました: ${(error as Error).message}`,
    );
  }
}

/**
 * 配列形式のJSON応答をパース
 *
 * @param content SDK応答の文字列
 * @returns パース結果の配列
 */
export function parseJsonArrayResponse<T>(content: string): T[] {
  try {
    // 配列部分を抽出
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      throw new Error("JSON配列が見つかりません");
    }

    return JSON.parse(arrayMatch[0]) as T[];
  } catch (error) {
    throw new Error(
      `AI応答のパースに失敗しました: ${(error as Error).message}`,
    );
  }
}

/**
 * SDK応答のバリデーション関数型
 */
export type ResponseValidator<T> = (response: T) => boolean;

/**
 * SDK応答をパースしてバリデーション
 *
 * @param content SDK応答の文字列
 * @param validator バリデーション関数
 * @param defaults デフォルト値を設定するオブジェクト
 * @returns バリデート済み応答
 */
export function parseAndValidate<T extends object>(
  content: string,
  defaults?: Partial<T>,
): T {
  const parsed = parseJsonResponse<T>(content);

  // デフォルト値をマージ
  if (defaults) {
    for (const [key, value] of Object.entries(defaults)) {
      if (parsed[key as keyof T] === undefined) {
        (parsed as Record<string, unknown>)[key] = value;
      }
    }
  }

  return parsed;
}

/**
 * プロンプトのバリデーション
 *
 * @param prompt 検証するプロンプト
 * @throws プロンプトが空の場合
 */
export function validatePrompt(prompt: string): void {
  if (!prompt || prompt.trim() === "") {
    throw new Error("プロンプトが空です");
  }
}

/**
 * スキル名のバリデーション
 *
 * @param name 検証するスキル名
 * @throws スキル名が空または無効な文字を含む場合
 */
export function validateSkillName(name: string): void {
  if (!name || name.trim() === "") {
    throw new Error("スキル名が空です");
  }

  // 危険な特殊文字をブロック
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(name)) {
    throw new Error("スキル名に無効な文字が含まれています");
  }
}
