/**
 * @file skill-wizard-label-map.ts
 * @description スキルウィザードの semantic default 値を UI ラベルへ変換する正準マッピング定義。
 * ConversationRoundStep の resolveSemanticLabel() が参照する共有テーブル。
 *
 * @task UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001
 */

/**
 * 質問IDと semantic default 値の UI ラベルへのマッピング型。
 * questionId → (rawValue → displayLabel) の2段階構造。
 * rawValue は toLowerCase() 正規化後の文字列をキーに使用する。
 */
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;

/**
 * inferSmartDefaults() の返り値を UI ラベルへ変換する正準マッピング定数。
 * 各 questionId と rawValue → displayLabel の変換テーブル。
 *
 * rawValue は toLowerCase() 済みの文字列を想定する。
 * エントリが存在しない場合は resolveSemanticLabel() が元の値をそのまま返す（フォールバック）。
 *
 * 将来 q7 以降が追加された場合はこのファイルにエントリを追記するだけで対応できる。
 */
export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  /** Q1: 利用者（誰が使うか）— inferSmartDefaults が "自分だけ" を返す場合に "自分のみ" へ正規化 */
  q1: { 自分だけ: "自分のみ" },
  /** Q2: 入力データ — 変換エントリなし */
  q2: {},
  /** Q3: 実行タイミング — "scheduled" を "定期実行" へ正規化 */
  q3: { scheduled: "定期実行" },
  /** Q4: 出力先 — 変換エントリなし */
  q4: {},
  /**
   * Q5: 外部ツール連携 — lowercase semantic 値を UI 表示ラベルへ正規化
   * notion → "その他" のエントリは SEMANTIC_LABEL_MAP に含めるが、
   * createQuestionAnswer 側で freeText: "Notion" の設定も行うため特別ケース扱い
   */
  q5: { slack: "Slack", github: "GitHub", notion: "その他" },
  /** Q6: 出力フォーマット — 頻度系の表記揺れを吸収（Phase 12 仕様準拠） */
  q6: { 週次: "週に1回" },
};

/**
 * semantic default の rawValue を UI ラベルへ正規化する純粋関数。
 * SEMANTIC_LABEL_MAP を参照し、マッピングが存在しない場合は value をそのまま返す。
 *
 * @param value - 変換対象の raw 値（toLowerCase() 済みを推奨）
 * @param questionId - 質問ID（q1〜q6）
 * @param labelMap - 変換テーブル（省略時は SEMANTIC_LABEL_MAP を使用）
 * @returns 正規化後の UI ラベル、または undefined（value が undefined の場合）
 *
 * @example
 * resolveSemanticLabel("自分だけ", "q1") // => "自分のみ"
 * resolveSemanticLabel("slack", "q5")    // => "Slack"
 * resolveSemanticLabel(undefined, "q1") // => undefined
 */
export function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined {
  if (value === undefined) return undefined;
  const questionMap = labelMap[questionId];
  if (!questionMap) return value;
  return questionMap[value] ?? value;
}
