/**
 * HealthPolicy 統一インターフェース
 *
 * 接続状態・API key 有効性・レート制限状態を一元管理する。
 * RuntimePolicyResolver（Main Process）、mainlineAccess（Renderer）、
 * useMainlineExecutionAccess（Renderer Hook）が共通消費する。
 * @see apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts
 *
 * @module health-policy
 * @see TASK-IMP-HEALTH-POLICY-UNIFICATION-001
 */

import type { HealthCheckResult } from "./llm/schemas/health";

// =============================================================================
// 型定義
// =============================================================================

/**
 * 総合ヘルスステータス
 *
 * 37 ファイルに分散していた判定ロジックを集約する統一型。
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/**
 * 統一 HealthPolicy インターフェース
 *
 * 接続状態・API key 有効性・レート制限状態を一元管理する。
 * RuntimePolicyResolver（Main Process）と mainlineAccess（Renderer）が共通消費する。
 */
export interface HealthPolicy {
  /** 接続が利用可能か */
  isConnectionAvailable: boolean;
  /** API key が有効だが品質低下しているか */
  isDegraded: boolean;
  /** レート制限中か */
  isRateLimited: boolean;
  /** 総合ヘルスステータス */
  healthStatus: HealthStatus;
  /** 最終チェック日時 */
  lastCheckedAt: Date | null;
  /** エラー詳細（unhealthy 時） */
  errorDetail?: string;
}

// =============================================================================
// 入力型定義
// =============================================================================

/**
 * resolveHealthPolicy() への入力パラメータ。
 * 各サービスから収集した接続状態情報を集約する。
 */
export interface HealthPolicyInput {
  /** 接続状態 */
  connectionStatus: "connected" | "disconnected" | "error";
  /**
   * API key が有効かどうか。
   * 現在 resolveHealthPolicy() の分岐ロジックでは未使用。
   * HealthPolicy は接続品質のみ判定し、API key 有効性は
   * ExecutionCapabilityInput.apiKeyValid に委ねる設計。
   * 将来のバリデーションルール拡張用に入力として保持。
   */
  isApiKeyValid: boolean;
  /** API key が有効だが品質低下しているか */
  apiKeyDegraded: boolean;
  /** レートリミット中か */
  isRateLimited: boolean;
  /** 最終ヘルスチェック結果（null = 未実施） */
  lastHealthCheck: HealthCheckResult | null;
}

// =============================================================================
// Pure function
// =============================================================================

// Phase 8 リファクタリング判断: アプローチA（現状維持）を採用。
// 5分岐の if-return チェーンは十分シンプルで、各分岐が返す HealthPolicy の全体像が
// 一目で把握できる。責務分離は HealthStatus 拡張時に検討する（YAGNI）。

/**
 * HealthPolicyInput から HealthPolicy を導出する純粋関数。
 *
 * 導出ルール（優先度順）:
 * 1. lastHealthCheck === null → unknown（isConnectionAvailable=false, isDegraded=false）
 * 2. isRateLimited → degraded（isDegraded=true）
 * 3. apiKeyDegraded → degraded（isDegraded=true）
 *    ※ 接続エラー時でも API key が valid なら subscription fallback を優先するため
 *    ※ connectionStatus チェック（ルール4）より先に評価する
 * 4. connectionStatus === "disconnected" || "error" → unhealthy（isConnectionAvailable=false）
 * 5. それ以外 → healthy（isConnectionAvailable=true, isDegraded=false）
 */
export function resolveHealthPolicy(input: HealthPolicyInput): HealthPolicy {
  const { connectionStatus, apiKeyDegraded, isRateLimited, lastHealthCheck } =
    input;

  // ルール 1: ヘルスチェック未実施 → unknown
  if (lastHealthCheck === null) {
    return {
      isConnectionAvailable: false,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "unknown",
      lastCheckedAt: null,
    };
  }

  const lastCheckedAt = lastHealthCheck.checkedAt;

  // ルール 2/3: レート制限 または API key 劣化 → degraded
  // 接続エラー（ルール4）より先に評価: valid API key + connection error の場合も
  // subscription fallback を有効化するため isDegraded = true を返す。
  if (isRateLimited || apiKeyDegraded) {
    return {
      isConnectionAvailable: false,
      isDegraded: true,
      isRateLimited,
      healthStatus: "degraded",
      lastCheckedAt,
    };
  }

  // ルール 4: 接続断 → unhealthy
  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return {
      isConnectionAvailable: false,
      isDegraded: false,
      isRateLimited,
      healthStatus: "unhealthy",
      lastCheckedAt,
      errorDetail:
        lastHealthCheck.errorMessage ?? `Connection ${connectionStatus}`,
    };
  }

  // ルール 5: 正常 → healthy
  return {
    isConnectionAvailable: true,
    isDegraded: false,
    isRateLimited: false,
    healthStatus: "healthy",
    lastCheckedAt,
  };
}
