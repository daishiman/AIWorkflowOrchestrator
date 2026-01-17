/**
 * @file CRAG公開API
 * @description CONV-07-06: Corrective RAG - 公開エクスポート
 */

// =============================================================================
// クラスエクスポート
// =============================================================================

export { RelevanceEvaluator } from "./relevance-evaluator";
export { CorrectiveRAG } from "./corrective-rag";

// =============================================================================
// 型エクスポート
// =============================================================================

export type {
  // インターフェース
  IRelevanceEvaluator,
  ICorrectiveRAG,
  ILLMClient,
  IWebSearcher,
  // オプション
  EvaluatorOptions,
  CRAGOptions,
  // 結果型
  RelevanceEvaluation,
  IndividualScore,
  CRAGResult,
  CorrectionAction,
  WebSearchResult,
  // 共通型
  RelevanceAction,
} from "./types";

// =============================================================================
// 定数エクスポート
// =============================================================================

export { CRAG_DEFAULTS } from "./types";

// =============================================================================
// ユーティリティエクスポート
// =============================================================================

export {
  isCRAGResultCorrect,
  isCRAGResultIncorrect,
  isCRAGResultAmbiguous,
  isKeepAction,
  isDiscardAction,
  isWebSearchAction,
} from "./types";
