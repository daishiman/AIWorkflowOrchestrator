/**
 * @file ui-state-vocabulary-contract.test.ts
 * @description Concern B: state 語彙契約テスト（CB-1 〜 CB-5）
 * @task TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
 * @phase Phase 4: テスト作成（TDD RED）
 *
 * contract-matrix.md の Concern B に基づき、
 * Renderer selector が capability → uiState を正しく変換することを検証する。
 *
 * ownership: capability -> state の変換は Renderer 層の専用 selector / hook が担う。
 * Main Process は uiState を計算しない（Concern B の ownership 確認）。
 *
 * | capability        | 補助条件               | 期待 uiState  |
 * | ----------------- | ---------------------- | ------------- |
 * | integratedRuntime | 接続成功               | ready         |
 * | terminalSurface   | terminal 利用可能      | ready         |
 * | both              | 両 lane 利用可能       | ready         |
 * | none              | 解決 action あり       | blocked       |
 * | none              | 解決 action なし       | unavailable   |
 *
 * P9準拠: beforeEach でモックをリセットしてテスト間リークを防止
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  type UiState,
  type CapabilityContext,
  resolveUiState,
} from "../execution-capability";

// ============================================================
// テストフィクスチャ
// ============================================================

/**
 * CB-1: integratedRuntime / 接続成功
 * API 接続が成功しており、即時実行可能な状態
 */
const contextIntegratedReady: CapabilityContext = {
  capability: "integratedRuntime",
  isConnectionAvailable: true,
  isTerminalAvailable: false,
  hasResolutionAction: false,
};

/**
 * CB-2: terminalSurface / terminal 利用可能
 * terminal launcher が利用可能で、handoff CTA が表示できる状態
 */
const contextTerminalReady: CapabilityContext = {
  capability: "terminalSurface",
  isConnectionAvailable: false,
  isTerminalAvailable: true,
  hasResolutionAction: false,
};

/**
 * CB-3: both / 両 lane 利用可能
 * integratedRuntime と terminalSurface の両方が利用可能な状態
 */
const contextBothReady: CapabilityContext = {
  capability: "both",
  isConnectionAvailable: true,
  isTerminalAvailable: true,
  hasResolutionAction: false,
};

/**
 * CB-4: none / 解決 action あり
 * API key を設定すれば integratedRuntime になれる状態（設定画面で復旧可能）
 */
const contextNoneBlocked: CapabilityContext = {
  capability: "none",
  isConnectionAvailable: false,
  isTerminalAvailable: false,
  hasResolutionAction: true, // 設定画面遷移で復旧可能
};

/**
 * CB-5: none / 解決 action なし
 * 端末環境の制約などでどちらの lane も利用できない状態
 */
const contextNoneUnavailable: CapabilityContext = {
  capability: "none",
  isConnectionAvailable: false,
  isTerminalAvailable: false,
  hasResolutionAction: false, // 解決方法なし
};

// ============================================================
// Concern B テスト
// ============================================================

describe("Concern B: resolveUiState - state 語彙変換", () => {
  // P9準拠: テスト間状態リーク防止
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------
  // CB-1: integratedRuntime / 接続成功 → ready
  // ----------------------------------------------------------
  describe("CB-1: capability=integratedRuntime, 接続成功", () => {
    it("uiState が 'ready' であること", () => {
      // API 接続が成功しているなら ready を返すこと
      const result = resolveUiState(contextIntegratedReady);
      expect(result.uiState).toBe("ready");
    });

    it("blockedReason が undefined であること（ready 状態ではブロック理由不要）", () => {
      const result = resolveUiState(contextIntegratedReady);
      expect(result.blockedReason).toBeUndefined();
    });

    it("blockedAction が undefined であること（ready 状態では解決アクション不要）", () => {
      const result = resolveUiState(contextIntegratedReady);
      expect(result.blockedAction).toBeUndefined();
    });

    it("'blocked' / 'unavailable' を返さないこと（state drift 防止）", () => {
      const result = resolveUiState(contextIntegratedReady);
      expect(result.uiState).not.toBe("blocked");
      expect(result.uiState).not.toBe("unavailable");
    });
  });

  // ----------------------------------------------------------
  // CB-2: terminalSurface / terminal 利用可能 → terminal-only（8 値ロジック P3）
  // ----------------------------------------------------------
  describe("CB-2: capability=terminalSurface, terminal 利用可能", () => {
    it("uiState が 'terminal-only' であること（8 値ロジック P3）", () => {
      // terminal launcher が利用可能なら terminal-only を返す（P3 優先順位）
      const result = resolveUiState(contextTerminalReady);
      expect(result.uiState).toBe("terminal-only");
    });

    it("blockedReason が undefined であること", () => {
      const result = resolveUiState(contextTerminalReady);
      expect(result.blockedReason).toBeUndefined();
    });

    it("blockedAction が undefined であること", () => {
      const result = resolveUiState(contextTerminalReady);
      expect(result.blockedAction).toBeUndefined();
    });
  });

  // ----------------------------------------------------------
  // CB-3: both / 両 lane 利用可能 → ready
  // ----------------------------------------------------------
  describe("CB-3: capability=both, 両 lane 利用可能", () => {
    it("uiState が 'ready' であること", () => {
      // 両 lane が利用可能なら ready を返すこと
      const result = resolveUiState(contextBothReady);
      expect(result.uiState).toBe("ready");
    });

    it("blockedReason が undefined であること", () => {
      const result = resolveUiState(contextBothReady);
      expect(result.blockedReason).toBeUndefined();
    });

    it("blockedAction が undefined であること", () => {
      const result = resolveUiState(contextBothReady);
      expect(result.blockedAction).toBeUndefined();
    });

    it("'blocked' に誤変換されないこと（state drift 防止）", () => {
      // both が利用可能なのに blocked にならないこと
      const result = resolveUiState(contextBothReady);
      expect(result.uiState).not.toBe("blocked");
      expect(result.uiState).not.toBe("unavailable");
    });
  });

  // ----------------------------------------------------------
  // CB-4: none / 解決 action あり → blocked
  // ----------------------------------------------------------
  describe("CB-4: capability=none, 解決 action あり", () => {
    it("uiState が 'blocked' であること", () => {
      // 解決 action がある場合は blocked を返すこと（unavailable ではない）
      const result = resolveUiState(contextNoneBlocked);
      expect(result.uiState).toBe("blocked");
    });

    it("blockedReason が設定されていること（ブロック理由は必須）", () => {
      // blocked 状態では blockedReason が必須
      const result = resolveUiState(contextNoneBlocked);
      expect(result.blockedReason).toBeDefined();
      expect(typeof result.blockedReason).toBe("string");
      expect(result.blockedReason?.length).toBeGreaterThan(0);
    });

    it("blockedAction が設定されていること（解決アクションは必須）", () => {
      // blocked 状態では blockedAction が必須（no-op CTA 禁止のため）
      const result = resolveUiState(contextNoneBlocked);
      expect(result.blockedAction).toBeDefined();
      expect(result.blockedAction?.label).toBeDefined();
      expect(result.blockedAction?.targetRoute).toBeDefined();
    });

    it("blockedAction.label が空でないこと", () => {
      const result = resolveUiState(contextNoneBlocked);
      expect(result.blockedAction?.label.length).toBeGreaterThan(0);
    });

    it("blockedAction.targetRoute が空でないこと", () => {
      const result = resolveUiState(contextNoneBlocked);
      expect(result.blockedAction?.targetRoute.length).toBeGreaterThan(0);
    });

    it("'unavailable' を返さないこと（解決 action がある場合は blocked）", () => {
      const result = resolveUiState(contextNoneBlocked);
      expect(result.uiState).not.toBe("unavailable");
    });
  });

  // ----------------------------------------------------------
  // CB-5: none / 解決 action なし → unavailable
  // ----------------------------------------------------------
  describe("CB-5: capability=none, 解決 action なし", () => {
    it("uiState が 'unavailable' であること", () => {
      // 解決 action がない場合は unavailable を返すこと
      const result = resolveUiState(contextNoneUnavailable);
      expect(result.uiState).toBe("unavailable");
    });

    it("blockedReason が設定されていること（理由テキストは必要）", () => {
      // unavailable でも理由テキストは必要
      const result = resolveUiState(contextNoneUnavailable);
      expect(result.blockedReason).toBeDefined();
      expect(typeof result.blockedReason).toBe("string");
    });

    it("blockedAction が undefined であること（解決方法なし）", () => {
      // unavailable 状態では解決 action を提供しない
      const result = resolveUiState(contextNoneUnavailable);
      expect(result.blockedAction).toBeUndefined();
    });

    it("'blocked' を返さないこと（解決 action がない場合は unavailable）", () => {
      const result = resolveUiState(contextNoneUnavailable);
      expect(result.uiState).not.toBe("blocked");
    });
  });

  // ----------------------------------------------------------
  // 型安全性テスト: uiState が 3 種類の有効な値のいずれかに限定される
  // ----------------------------------------------------------
  describe("型テスト: uiState の値制約", () => {
    it("uiState が有効な 8 値のいずれかであること", () => {
      const validStates: UiState[] = [
        "ready",
        "blocked",
        "unavailable",
        "streaming",
        "handoff",
        "terminal-only",
        "guidance-only",
        "degraded",
      ];

      const contexts: CapabilityContext[] = [
        contextIntegratedReady,
        contextTerminalReady,
        contextBothReady,
        contextNoneBlocked,
        contextNoneUnavailable,
      ];

      contexts.forEach((ctx) => {
        const result = resolveUiState(ctx);
        expect(validStates).toContain(result.uiState);
      });
    });
  });
});
