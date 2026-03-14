/**
 * Runtime handoff guidance shared types
 */

/**
 * ターミナルハンドオフ案内
 *
 * 実行を統合経路で継続できない場合に、CLI 継続用のガイダンスを返す。
 */
export interface HandoffGuidance {
  /** Claude Code CLI で継続するためのコマンド例 */
  terminalCommand: string;
  /** 実行コンテキストの要約 */
  contextSummary: string;
  /** handoff になった理由 */
  reason: string;
}
