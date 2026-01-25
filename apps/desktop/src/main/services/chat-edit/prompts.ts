/**
 * Chat Edit プロンプトテンプレート
 *
 * LLM に送信するプロンプトテンプレートを定義
 */
import type { EditCommandType } from "./types";

/**
 * プロンプト設定
 */
export interface PromptConfig {
  /** プロンプトテンプレート */
  template: string;
  /** プロンプトの説明 */
  description: string;
}

/**
 * コマンドタイプ別プロンプト設定
 */
export const EDIT_PROMPTS: Record<EditCommandType, PromptConfig> = {
  continue: {
    template: `以下のコードの続きを書いてください。
コンテキストを参考に、適切なコードを生成してください。

{context}

続きを書いてください:`,
    description: "コードの続きを生成",
  },

  refactor: {
    template: `以下のコードをリファクタリングしてください。
可読性、保守性、パフォーマンスを改善してください。

{context}

リファクタリング結果:`,
    description: "リファクタリング",
  },

  "generate-test": {
    template: `以下のコードのテストを生成してください。
カバレッジを意識し、主要なケースをカバーしてください。

{context}

テストコード:`,
    description: "テストコード生成",
  },

  "add-comment": {
    template: `以下のコードにコメントを追加してください。
関数の目的、引数、戻り値を説明するコメントを追加してください。

{context}

コメント付きコード:`,
    description: "コメント追加",
  },

  custom: {
    template: `{instruction}

{context}`,
    description: "カスタム命令",
  },
};

/**
 * コマンドタイプが有効かチェック
 */
export function isValidCommandType(type: string): type is EditCommandType {
  return type in EDIT_PROMPTS;
}

/**
 * プロンプトを構築
 */
export function buildPromptFromTemplate(
  commandType: EditCommandType,
  context: string,
  instruction?: string,
): string {
  const config = EDIT_PROMPTS[commandType];
  let prompt = config.template.replace("{context}", context);

  if (commandType === "custom" && instruction) {
    prompt = prompt.replace("{instruction}", instruction);
  }

  return prompt;
}
