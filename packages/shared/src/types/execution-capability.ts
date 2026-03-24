/**
 * Execution Capability 型定義
 *
 * authMode と認証情報の有無から導出される「実行能力」を表す型群。
 * UI 状態（8 値）と CTA 契約（ボタンラベル・アクション）を
 * pure function で導出する。

 *
 * @module execution-capability
 */

import type { HandoffGuidance } from "./handoff";

// =============================================================================
// 基本型定義
// =============================================================================

/**
 * アクセス能力 4 状態
 *
 * - integratedRuntime: API キーが有効で統合ランタイム（integrated API）利用可能
 * - terminalSurface: サブスクリプション認証のみ有効で terminal handoff のみ利用可能
 * - both: API キー + サブスクリプション認証の両方が有効
 * - none: 認証情報が一切なく、いずれのランタイムも利用不可
 */
export type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

/**
 * 有効な AccessCapability 値の readonly tuple
 */
export const CAPABILITY_VALUES = [
  "integratedRuntime",
  "terminalSurface",
  "both",
  "none",
] as const satisfies readonly AccessCapability[];

/**
 * UI 表示状態 8 値
 *
 * 既存 3 値（ready / blocked / unavailable）に
 * streaming / handoff / terminal-only / guidance-only / degraded を追加。
 *
 * @see phase-2-design.md D-1
 */
export type UiState =
  | "ready"
  | "blocked"
  | "unavailable"
  | "streaming"
  | "handoff"
  | "terminal-only"
  | "guidance-only"
  | "degraded";

/**
 * 有効な UiState 値の readonly tuple
 */
export const UI_STATE_VALUES = [
  "ready",
  "blocked",
  "unavailable",
  "streaming",
  "handoff",
  "terminal-only",
  "guidance-only",
  "degraded",
] as const satisfies readonly UiState[];

// =============================================================================
// 入力型定義
// =============================================================================

/**
 * capability 判定の入力（Concern A）
 */
export interface ExecutionCapabilityInput {
  apiKeyValid: boolean;
  subscriptionValid: boolean;
  /** API key は有効だが接続 timeout / degraded 状態 */
  apiKeyDegraded?: boolean;
}

/**
 * UI state 判定の入力コンテキスト（Concern B）
 *
 * @see phase-2-design.md D-2
 */
export interface CapabilityContext {
  capability: AccessCapability;
  isConnectionAvailable: boolean;
  isTerminalAvailable: boolean;
  hasResolutionAction: boolean;

  /** streaming 状態判定（optional, デフォルト false）
   * @see phase-2-design.md D-2
   */
  isStreaming?: boolean;
  /** handoff 条件成立判定（optional, デフォルト false） */
  isHandoffRequired?: boolean;
  /** degraded（legacy lane 品質低下）判定（optional, デフォルト false） */
  isDegraded?: boolean;
  /** guidance-only 条件判定（optional, デフォルト false） */
  hasAlternativeGuidance?: boolean;
}

/**
 * UI state 判定結果（Concern B）
 *
 * @see phase-2-design.md D-4
 */
export interface UiStateResult {
  uiState: UiState;
  blockedReason?: string;
  blockedAction?: { label: string; targetRoute: string };
  /** handoff 状態で返す terminal 委譲ガイダンス */
  handoffGuidance?: HandoffGuidance;
}

/**
 * CTA 契約の入力（Concern C）
 */
export interface CtaInput {
  capability: AccessCapability;
  uiState: UiState;
  blockedAction?: { label: string; targetRoute: string };
}

// =============================================================================
// 補助型定義
// =============================================================================

/**
 * ブロック情報
 */
export interface BlockedInfo {
  blockedReason: string;
  blockedAction: string;
}

/**
 * CTA（Call To Action）契約
 *
 * - primary: メインアクション。unavailable のときは null（DOM に含めない）
 * - secondary: サブアクション（常に存在する）
 */
export interface CtaContract {
  primary: { label: string; action: string } | null;
  secondary: { label: string; action: string };
}

// =============================================================================
// 統合型
// =============================================================================

/**
 * 実行能力ステータス DTO
 */
export interface ExecutionCapabilityStatus {
  capability: AccessCapability;
  uiState: UiState;
  blockedInfo?: BlockedInfo;
  ctaContract: CtaContract;
}

// =============================================================================
// Concern A: capability 判定
// =============================================================================

/**
 * 入力条件から AccessCapability を導出する
 *
 * contract-matrix の判定ルール:
 * - apiKeyValid=true, subscriptionValid=false → integratedRuntime
 * - apiKeyValid=false, subscriptionValid=true → terminalSurface
 * - apiKeyValid=true, subscriptionValid=true → both
 * - apiKeyValid=false, subscriptionValid=false → none
 * - apiKeyDegraded=true → integratedRuntime を除外し terminalSurface に降格
 */
export function resolveCapability(
  input: ExecutionCapabilityInput,
): AccessCapability {
  const { apiKeyValid, subscriptionValid, apiKeyDegraded } = input;

  // degraded 状態: API key は有効だが接続不可 → integratedRuntime を使えない
  if (apiKeyDegraded) {
    return subscriptionValid ? "terminalSurface" : "none";
  }

  if (apiKeyValid && subscriptionValid) return "both";
  if (apiKeyValid) return "integratedRuntime";
  if (subscriptionValid) return "terminalSurface";
  return "none";
}

// =============================================================================
// Concern B: UI state 導出
// =============================================================================

/**
 * capability コンテキストから UiState を導出する
 *
 * 評価優先順位（Phase 2 D-3 準拠）:
 * P1: streaming → P2: handoff → P3: terminal-only →
 * P4: degraded → P5: ready → P6: guidance-only →
 * P7: blocked → P8: unavailable
 *
 * @see phase-2-design.md D-3
 */
export function resolveUiState(context: CapabilityContext): UiStateResult;
/** @deprecated overload 1 への移行を推奨 */
export function resolveUiState(
  capability: AccessCapability,
  conditions: { hasCredentialPath: boolean },
): "ready" | "blocked" | "unavailable";
export function resolveUiState(
  capabilityOrContext: AccessCapability | CapabilityContext,
  conditions?: { hasCredentialPath: boolean },
): UiState | UiStateResult {
  // overload 1: CapabilityContext（8 値対応）
  if (typeof capabilityOrContext === "object") {
    const {
      capability,
      isStreaming = false,
      isHandoffRequired = false,
      isDegraded = false,
      hasAlternativeGuidance = false,
      isTerminalAvailable,
      hasResolutionAction,
    } = capabilityOrContext;

    // P1: streaming は最優先（実行中の表示状態）
    if (isStreaming) {
      return { uiState: "streaming" };
    }

    // P2: handoff（terminal へ委譲する条件が成立）
    if (
      isHandoffRequired &&
      (capability === "terminalSurface" || capability === "both")
    ) {
      return {
        uiState: "handoff",
        handoffGuidance: buildHandoffGuidance(capabilityOrContext),
      };
    }

    // P3: terminal-only（terminal のみが利用可能）
    if (capability === "terminalSurface" && !isTerminalAvailable) {
      return { uiState: "unavailable" };
    }
    if (capability === "terminalSurface") {
      return { uiState: "terminal-only" };
    }

    // P4: degraded（capability ありだが品質低下。integratedRuntime/both で到達可能）
    if (isDegraded && capability !== "none") {
      return { uiState: "degraded" };
    }

    // P5: ready（通常の実行可能状態）
    if (capability === "integratedRuntime" || capability === "both") {
      return { uiState: "ready" };
    }

    // capability === "none" の分岐
    // P6: guidance-only
    if (hasAlternativeGuidance) {
      return { uiState: "guidance-only" };
    }

    // P7: blocked
    if (hasResolutionAction) {
      return {
        uiState: "blocked",
        blockedReason: "認証情報が設定されていません",
        blockedAction: { label: "設定を開く", targetRoute: "/settings" },
      };
    }

    // P8: unavailable（P62 準拠: 明示的なデフォルト）
    return {
      uiState: "unavailable",
      blockedReason: "利用可能な実行環境がありません",
    };
  }

  // overload 2: 後方互換（3 値のみ）
  const capability = capabilityOrContext;
  if (
    capability === "both" ||
    capability === "integratedRuntime" ||
    capability === "terminalSurface"
  ) {
    return "ready";
  }
  return conditions!.hasCredentialPath ? "blocked" : "unavailable";
}

/**
 * handoff ガイダンスを構築するヘルパー（pure function）
 */
function buildHandoffGuidance(context: CapabilityContext): HandoffGuidance {
  return {
    terminalCommand: "claude --resume",
    contextSummary:
      "統合ランタイムで実行できないタスクです。ターミナルで継続してください。",
    reason:
      context.capability === "terminalSurface"
        ? "統合ランタイムが利用できないため、ターミナルへ委譲します"
        : "このタスクはターミナルでの実行が推奨されます",
  };
}

// =============================================================================
// Concern C: CTA 契約導出
// =============================================================================

/**
 * capability × uiState から CTA 契約を導出する
 *
 * contract-matrix 準拠（Phase 2 D-5 拡張）:
 * | uiState        | capability        | primary              | secondary            |
 * |----------------|-------------------|----------------------|----------------------|
 * | ready          | integratedRuntime | AI で実行            | 設定を開く           |
 * | ready          | terminalSurface   | ターミナルで実行     | コマンドをコピー     |
 * | ready          | both              | AI で実行            | ターミナルで実行     |
 * | blocked        | none              | 設定を開く           | ヘルプを表示         |
 * | unavailable    | *                 | (null)               | セットアップガイド   |
 * | streaming      | *                 | 停止                 | 最新へ移動           |
 * | handoff        | *                 | terminal を開く      | コマンドをコピー     |
 * | terminal-only  | *                 | terminal を開く      | コマンドをコピー     |
 * | guidance-only  | *                 | 設定を見る           | ヘルプを表示         |
 * | degraded       | *                 | manual fallback      | ヘルプを表示         |
 */
export function resolveCtaContract(input: CtaInput): CtaContract;
export function resolveCtaContract(
  uiState: UiState,
  capability: AccessCapability,
): CtaContract;
export function resolveCtaContract(
  uiStateOrInput: UiState | CtaInput,
  capabilityArg?: AccessCapability,
): CtaContract {
  const capability =
    typeof uiStateOrInput === "object"
      ? uiStateOrInput.capability
      : capabilityArg!;
  const uiState =
    typeof uiStateOrInput === "object"
      ? uiStateOrInput.uiState
      : uiStateOrInput;
  const blockedAction =
    typeof uiStateOrInput === "object"
      ? uiStateOrInput.blockedAction
      : undefined;

  if (uiState === "unavailable") {
    return {
      primary: null,
      secondary: { label: "セットアップガイド", action: "openSetupGuide" },
    };
  }

  if (uiState === "blocked") {
    return {
      primary: {
        label: blockedAction?.label ?? "設定を開く",
        action: "openSettings",
      },
      secondary: { label: "ヘルプを表示", action: "openHelp" },
    };
  }

  // Phase 2 D-5: 新 5 状態の CTA マッピング
  if (uiState === "streaming") {
    return {
      primary: { label: "停止", action: "stopStreaming" },
      secondary: { label: "最新へ移動", action: "scrollToLatest" },
    };
  }

  if (uiState === "handoff") {
    return {
      primary: { label: "terminal を開く", action: "openTerminal" },
      secondary: {
        label: "コマンドをコピー",
        action: "copyCommandToClipboard",
      },
    };
  }

  if (uiState === "terminal-only") {
    return {
      primary: { label: "terminal を開く", action: "openTerminal" },
      secondary: {
        label: "コマンドをコピー",
        action: "copyCommandToClipboard",
      },
    };
  }

  if (uiState === "guidance-only") {
    return {
      primary: { label: "設定を見る", action: "openSettings" },
      secondary: { label: "ヘルプを表示", action: "openHelp" },
    };
  }

  if (uiState === "degraded") {
    return {
      primary: { label: "manual fallback", action: "openManualFallback" },
      secondary: { label: "ヘルプを表示", action: "openHelp" },
    };
  }

  // uiState === "ready"
  switch (capability) {
    case "integratedRuntime":
      return {
        primary: { label: "AI で実行", action: "executeIntegrated" },
        secondary: { label: "設定を開く", action: "openSettings" },
      };
    case "terminalSurface":
      return {
        primary: {
          label: "ターミナルで実行",
          action: "executeTerminalHandoff",
        },
        secondary: {
          label: "コマンドをコピー",
          action: "copyCommandToClipboard",
        },
      };
    case "both":
      return {
        primary: { label: "AI で実行", action: "executeIntegrated" },
        secondary: {
          label: "ターミナルで実行",
          action: "executeTerminalHandoff",
        },
      };
    default:
      return {
        primary: null,
        secondary: { label: "セットアップガイド", action: "openSetupGuide" },
      };
  }
}

// =============================================================================
// Assertion / Guard 関数
// =============================================================================

/**
 * capability が "none" のとき integratedRuntime への暗黙遷移を禁止するガード
 * P62 対策
 */
export function assertNoSilentFallback(capability: AccessCapability): void {
  if (capability === "none") {
    throw new Error(
      "[assertNoSilentFallback] capability が 'none' のとき integratedRuntime への暗黙遷移は禁止されています。",
    );
  }
}

/**
 * uiState が "unavailable" のとき primary CTA が null であることを検証するガード
 */
export function assertNoPrimaryCta(
  uiState: UiState,
  ctaContract: CtaContract,
): void {
  if (uiState === "unavailable" && ctaContract.primary !== null) {
    throw new Error(
      "[assertNoPrimaryCta] uiState が 'unavailable' のとき primary CTA は null でなければなりません。",
    );
  }
}

/**
 * streaming 状態のとき CTA primary ラベルが "停止" であることを検証するガード
 *
 * @see phase-2-design.md D-7
 */
export function assertStreamingCtaContract(
  uiState: UiState,
  ctaContract: CtaContract,
): void {
  if (uiState === "streaming" && ctaContract.primary?.label !== "停止") {
    throw new Error(
      "[assertStreamingCtaContract] uiState が 'streaming' のとき primary CTA ラベルは '停止' でなければなりません。",
    );
  }
}

/**
 * handoff 状態のとき handoffGuidance が存在することを検証するガード
 *
 * @see phase-2-design.md D-7
 */
export function assertHandoffGuidanceExists(
  uiState: UiState,
  result: UiStateResult,
): void {
  if (uiState === "handoff" && !result.handoffGuidance) {
    throw new Error(
      "[assertHandoffGuidanceExists] uiState が 'handoff' のとき handoffGuidance は必須です。",
    );
  }
}
