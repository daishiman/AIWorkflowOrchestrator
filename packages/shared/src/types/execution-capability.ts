/**
 * Execution Capability 型定義
 *
 * authMode と認証情報の有無から導出される「実行能力」を表す型群。
 * UI 状態（ready / blocked / unavailable）と CTA 契約（ボタンラベル・アクション）を
 * pure function で導出する。
 *
 * @module execution-capability
 */

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
 * UI 表示状態 3 値
 *
 * - ready: 実行可能（capability が integratedRuntime / terminalSurface / both）
 * - blocked: 設定が必要（認証情報が不足、ただし回復操作がある）
 * - unavailable: この画面ではアクションを取れない（設定画面への誘導なし）
 */
export type UiState = "ready" | "blocked" | "unavailable";

/**
 * 有効な UiState 値の readonly tuple
 */
export const UI_STATE_VALUES = [
  "ready",
  "blocked",
  "unavailable",
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
  /**
   * API key は有効だが接続 timeout / degraded 状態
   * @deprecated v0.8.0 で削除予定。HealthPolicy.isDegraded を使用してください。
   * @see TASK-IMP-HEALTH-POLICY-UNIFICATION-001
   */
  apiKeyDegraded?: boolean;
}

/**
 * UI state 判定の入力コンテキスト（Concern B）
 */
export interface CapabilityContext {
  capability: AccessCapability;
  isConnectionAvailable: boolean;
  isTerminalAvailable: boolean;
  hasResolutionAction: boolean;
}

/**
 * UI state 判定結果（Concern B）
 */
export interface UiStateResult {
  uiState: UiState;
  blockedReason?: string;
  blockedAction?: { label: string; targetRoute: string };
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
 * 判定ロジック:
 * - capability が integratedRuntime/terminalSurface/both → ready
 * - capability が none かつ hasResolutionAction → blocked（理由+解決action付き）
 * - capability が none かつ hasResolutionAction=false → unavailable
 */
export function resolveUiState(context: CapabilityContext): UiStateResult;
export function resolveUiState(
  capability: AccessCapability,
  conditions: { hasCredentialPath: boolean },
): UiState;
export function resolveUiState(
  capabilityOrContext: AccessCapability | CapabilityContext,
  conditions?: { hasCredentialPath: boolean },
): UiState | UiStateResult {
  // overload 1: CapabilityContext
  if (typeof capabilityOrContext === "object") {
    const ctx = capabilityOrContext;
    if (
      ctx.capability === "integratedRuntime" ||
      ctx.capability === "terminalSurface" ||
      ctx.capability === "both"
    ) {
      return { uiState: "ready" };
    }

    // capability === "none"
    if (ctx.hasResolutionAction) {
      return {
        uiState: "blocked",
        blockedReason: "認証情報が設定されていません",
        blockedAction: {
          label: "設定を開く",
          targetRoute: "/settings",
        },
      };
    }

    return {
      uiState: "unavailable",
      blockedReason: "利用可能な実行環境がありません",
    };
  }

  // overload 2: simple (AccessCapability, conditions)
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

// =============================================================================
// Concern C: CTA 契約導出
// =============================================================================

/**
 * capability × uiState から CTA 契約を導出する
 *
 * contract-matrix 準拠:
 * | capability        | uiState     | primary            | secondary          |
 * |-------------------|-------------|--------------------|--------------------|
 * | integratedRuntime | ready       | AI で実行          | 設定を開く         |
 * | terminalSurface   | ready       | ターミナルで実行   | コマンドをコピー   |
 * | both              | ready       | AI で実行          | ターミナルで実行   |
 * | none              | blocked     | 設定を開く         | ヘルプを表示       |
 * | none              | unavailable | (null)             | セットアップガイド |
 */
export function resolveCtaContract(input: CtaInput): CtaContract;
export function resolveCtaContract(
  capability: AccessCapability,
  uiState: UiState,
): CtaContract;
export function resolveCtaContract(
  capabilityOrInput: AccessCapability | CtaInput,
  uiStateArg?: UiState,
): CtaContract {
  const capability =
    typeof capabilityOrInput === "object"
      ? capabilityOrInput.capability
      : capabilityOrInput;
  const uiState =
    typeof capabilityOrInput === "object"
      ? capabilityOrInput.uiState
      : uiStateArg!;
  const blockedAction =
    typeof capabilityOrInput === "object"
      ? capabilityOrInput.blockedAction
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
