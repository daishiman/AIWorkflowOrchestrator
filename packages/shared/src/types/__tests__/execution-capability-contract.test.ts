/**
 * @file execution-capability-contract.test.ts
 * @description Concern A: capability 判定契約テスト（CA-1 〜 CA-5）
 * @task TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
 * @phase Phase 4: テスト作成（TDD RED）
 *
 * contract-matrix.md の Concern A に基づき、
 * RuntimePolicyResolver が返す capability 値の正確性を検証する。
 *
 * | 入力条件                           | 期待 capability   |
 * | ---------------------------------- | ----------------- |
 * | apiKeyValid=true, subValid=false   | integratedRuntime |
 * | apiKeyValid=false, subValid=true   | terminalSurface   |
 * | apiKeyValid=true, subValid=true    | both              |
 * | apiKeyValid=false, subValid=false  | none              |
 * | apiKeyValid=true+timeout, sub=true | terminalSurface   |
 *
 * P9準拠: beforeEach でモックをリセットしてテスト間リークを防止
 * P42準拠: 空文字列 / スペースのみの API key は null 同等として扱う
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  type AccessCapability,
  type ExecutionCapabilityInput,
  resolveCapability,
} from "../execution-capability";

// ============================================================
// テストフィクスチャ
// ============================================================

/** CA-1: API key 有効 / subscription 無効 */
const inputApiKeyOnly: ExecutionCapabilityInput = {
  apiKeyValid: true,
  subscriptionValid: false,
};

/** CA-2: API key 無効 / subscription 有効 */
const inputSubscriptionOnly: ExecutionCapabilityInput = {
  apiKeyValid: false,
  subscriptionValid: true,
};

/** CA-3: API key 有効 / subscription 有効 */
const inputBoth: ExecutionCapabilityInput = {
  apiKeyValid: true,
  subscriptionValid: true,
};

/** CA-4: API key 無効 / subscription 無効 */
const inputNone: ExecutionCapabilityInput = {
  apiKeyValid: false,
  subscriptionValid: false,
};

/** CA-5: API key 有効だが接続 timeout / subscription 有効（degraded fallback） */
const inputTimeoutWithSubscription: ExecutionCapabilityInput = {
  apiKeyValid: true,
  subscriptionValid: true,
  apiKeyDegraded: true, // timeout / 接続不可フラグ
};

// ============================================================
// Concern A テスト
// ============================================================

describe("Concern A: resolveCapability - capability 判定", () => {
  // P9準拠: テスト間状態リーク防止
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------
  // CA-1: API key 有効 / subscription 無効 → integratedRuntime
  // ----------------------------------------------------------
  describe("CA-1: apiKeyValid=true, subscriptionValid=false", () => {
    it("capability が 'integratedRuntime' であること", () => {
      // API key のみ有効な場合、統合ランタイムを返す
      const result = resolveCapability(inputApiKeyOnly);
      expect(result).toBe("integratedRuntime");
    });

    it("'terminalSurface' / 'both' / 'none' を返さないこと（silent fallback 禁止）", () => {
      const result = resolveCapability(inputApiKeyOnly);
      expect(result).not.toBe("terminalSurface");
      expect(result).not.toBe("both");
      expect(result).not.toBe("none");
    });
  });

  // ----------------------------------------------------------
  // CA-2: API key 無効 / subscription 有効 → terminalSurface
  // ----------------------------------------------------------
  describe("CA-2: apiKeyValid=false, subscriptionValid=true", () => {
    it("capability が 'terminalSurface' であること", () => {
      // サブスクリプションのみ有効な場合、ターミナルサーフェスを返す
      const result = resolveCapability(inputSubscriptionOnly);
      expect(result).toBe("terminalSurface");
    });

    it("'integratedRuntime' を返さないこと（silent fallback 禁止）", () => {
      // API key が無効なのに integrated runtime にならないこと
      const result = resolveCapability(inputSubscriptionOnly);
      expect(result).not.toBe("integratedRuntime");
    });
  });

  // ----------------------------------------------------------
  // CA-3: API key 有効 / subscription 有効 → both
  // ----------------------------------------------------------
  describe("CA-3: apiKeyValid=true, subscriptionValid=true", () => {
    it("capability が 'both' であること", () => {
      // 両方有効な場合、both を返す
      const result = resolveCapability(inputBoth);
      expect(result).toBe("both");
    });

    it("'integratedRuntime' のみを返さないこと（both を明示すること）", () => {
      // 両方有効なのに片方だけを返さないこと
      const result = resolveCapability(inputBoth);
      expect(result).not.toBe("integratedRuntime");
      expect(result).not.toBe("terminalSurface");
    });
  });

  // ----------------------------------------------------------
  // CA-4: API key 無効 / subscription 無効 → none
  // ----------------------------------------------------------
  describe("CA-4: apiKeyValid=false, subscriptionValid=false", () => {
    it("capability が 'none' であること", () => {
      // 両方無効な場合、none を返す
      const result = resolveCapability(inputNone);
      expect(result).toBe("none");
    });

    it("どの capability にも silent fallback しないこと（FR-4 対応）", () => {
      // 両方無効なのに他の capability を返さないこと
      const result = resolveCapability(inputNone);
      expect(result).not.toBe("integratedRuntime");
      expect(result).not.toBe("terminalSurface");
      expect(result).not.toBe("both");
    });
  });

  // ----------------------------------------------------------
  // CA-5: API key 有効だが timeout / subscription 有効
  //       → terminalSurface（degraded fallback は明示通知付き）
  // ----------------------------------------------------------
  describe("CA-5: apiKeyValid=true（timeout/degraded）, subscriptionValid=true", () => {
    it("capability が 'terminalSurface' であること（degraded fallback）", () => {
      // API key が有効でも接続 timeout の場合は terminalSurface に fallback する
      // ただし silent fallback ではなく、明示的な通知が必要（blockedReason に反映される）
      const result = resolveCapability(inputTimeoutWithSubscription);
      expect(result).toBe("terminalSurface");
    });

    it("degraded 状態で 'integratedRuntime' を返さないこと", () => {
      // timeout 時に integratedRuntime を使用しないこと（silent fallback 禁止）
      const result = resolveCapability(inputTimeoutWithSubscription);
      expect(result).not.toBe("integratedRuntime");
    });

    it("degraded 状態で 'both' を返さないこと", () => {
      // timeout 時に both を使用しないこと
      const result = resolveCapability(inputTimeoutWithSubscription);
      expect(result).not.toBe("both");
    });
  });

  // ----------------------------------------------------------
  // CA-5 型テスト: capability 値が 4 種類のいずれかに限定される
  // ----------------------------------------------------------
  describe("CA-5（型テスト）: capability 値の列挙型制約", () => {
    it("capability が 4 種類の有効な値のいずれかであること", () => {
      // 4 種類の入力すべてで有効な capability が返ること
      const validCapabilities: AccessCapability[] = [
        "integratedRuntime",
        "terminalSurface",
        "both",
        "none",
      ];

      const inputs: ExecutionCapabilityInput[] = [
        inputApiKeyOnly,
        inputSubscriptionOnly,
        inputBoth,
        inputNone,
      ];

      inputs.forEach((input) => {
        const result = resolveCapability(input);
        expect(validCapabilities).toContain(result);
      });
    });

    it("capability が 4 種類以外の値を返さないこと", () => {
      // 想定外の値が返らないこと
      const invalidValues = [
        "integrated",
        "terminal",
        "api-key",
        "subscription",
        "INTEGRATED_RUNTIME",
        "",
        null,
        undefined,
      ];

      const result = resolveCapability(inputApiKeyOnly);
      expect(invalidValues).not.toContain(result);
    });
  });
});
