/**
 * @file uistate-resolve.test.ts
 * @description resolveUiState() 8 値テスト + Guard 関数テスト
 * @task TASK-IMP-UISTATE-CONTRACT-EXTENSION-001
 * @phase Phase 4: テスト作成（TDD RED）
 *
 * Phase 2 D-3 の評価優先順位（P1-P8）に完全準拠したテストケース。
 * P9 準拠: 各テストで CapabilityContext を明示的に構築し、状態をテスト間で共有しない。
 */

import { describe, it, expect } from "vitest";
import {
  resolveUiState,
  assertStreamingCtaContract,
  assertHandoffGuidanceExists,
} from "../execution-capability";
import type {
  CapabilityContext,
  UiStateResult,
  CtaContract,
} from "../execution-capability";

// ============================================================
// resolveUiState() 8 値テスト（Phase 2 D-3 評価優先順位準拠）
// ============================================================

describe("resolveUiState - 8 値分岐テスト", () => {
  // P1: streaming（最優先）
  describe("P1: streaming（最優先）", () => {
    it("should return 'streaming' when isStreaming is true (integratedRuntime)", () => {
      const context: CapabilityContext = {
        capability: "integratedRuntime",
        isConnectionAvailable: true,
        isTerminalAvailable: false,
        hasResolutionAction: false,
        isStreaming: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("streaming");
    });

    it("should return 'streaming' even when isHandoffRequired is also true (P1 > P2)", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isStreaming: true,
        isHandoffRequired: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("streaming");
    });
  });

  // P2: handoff
  describe("P2: handoff", () => {
    it("should return 'handoff' when isHandoffRequired and capability is terminalSurface", () => {
      const context: CapabilityContext = {
        capability: "terminalSurface",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isHandoffRequired: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("handoff");
      expect(result.handoffGuidance).toBeDefined();
    });

    it("should return 'handoff' when isHandoffRequired and capability is both", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isHandoffRequired: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("handoff");
    });
  });

  // P3: terminal-only
  describe("P3: terminal-only", () => {
    it("should return 'terminal-only' when capability is terminalSurface and isTerminalAvailable", () => {
      const context: CapabilityContext = {
        capability: "terminalSurface",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("terminal-only");
    });

    it("should return 'unavailable' when capability is terminalSurface but !isTerminalAvailable", () => {
      const context: CapabilityContext = {
        capability: "terminalSurface",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("unavailable");
    });
  });

  // P4: degraded
  describe("P4: degraded", () => {
    it("should return 'degraded' when isDegraded and capability is integratedRuntime", () => {
      const context: CapabilityContext = {
        capability: "integratedRuntime",
        isConnectionAvailable: true,
        isTerminalAvailable: false,
        hasResolutionAction: false,
        isDegraded: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("degraded");
    });

    it("should return 'degraded' when isDegraded and capability is both", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isDegraded: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("degraded");
    });
  });

  // P5: ready
  describe("P5: ready", () => {
    it("should return 'ready' when capability is integratedRuntime (normal state)", () => {
      const context: CapabilityContext = {
        capability: "integratedRuntime",
        isConnectionAvailable: true,
        isTerminalAvailable: false,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("ready");
    });

    it("should return 'ready' when capability is both", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("ready");
    });
  });

  // P6: guidance-only
  describe("P6: guidance-only", () => {
    it("should return 'guidance-only' when capability is none and hasAlternativeGuidance", () => {
      const context: CapabilityContext = {
        capability: "none",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: false,
        hasAlternativeGuidance: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("guidance-only");
    });
  });

  // P7: blocked
  describe("P7: blocked", () => {
    it("should return 'blocked' when capability is none and hasResolutionAction", () => {
      const context: CapabilityContext = {
        capability: "none",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("blocked");
      expect(result.blockedAction).toBeDefined();
      expect(result.blockedAction?.targetRoute).toBeDefined();
    });
  });

  // P8: unavailable
  describe("P8: unavailable（デフォルト）", () => {
    it("should return 'unavailable' when capability is none with no alternatives", () => {
      const context: CapabilityContext = {
        capability: "none",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("unavailable");
    });
  });
});

// ============================================================
// Phase 6 Task 1: エッジケーステスト（優先順位競合）
// ============================================================

describe("Phase 6: エッジケーステスト（優先順位競合）", () => {
  it("EC-2: isDegraded=true but capability=none → NOT degraded (P4 requires cap !== none)", () => {
    const context: CapabilityContext = {
      capability: "none",
      isConnectionAvailable: false,
      isTerminalAvailable: false,
      hasResolutionAction: true,
      isDegraded: true,
    };
    const result = resolveUiState(context);
    // P4 condition: isDegraded && capability !== "none" → false
    // Falls through to P7: blocked
    expect(result.uiState).toBe("blocked");
    expect(result.uiState).not.toBe("degraded");
  });

  it("EC-3: isHandoffRequired + isDegraded → handoff (P2 > P4)", () => {
    const context: CapabilityContext = {
      capability: "both",
      isConnectionAvailable: true,
      isTerminalAvailable: true,
      hasResolutionAction: false,
      isHandoffRequired: true,
      isDegraded: true,
    };
    const result = resolveUiState(context);
    expect(result.uiState).toBe("handoff");
  });

  it("EC-4: isStreaming + isDegraded → streaming (P1 > P4)", () => {
    const context: CapabilityContext = {
      capability: "integratedRuntime",
      isConnectionAvailable: true,
      isTerminalAvailable: false,
      hasResolutionAction: false,
      isStreaming: true,
      isDegraded: true,
    };
    const result = resolveUiState(context);
    expect(result.uiState).toBe("streaming");
  });

  it("EC-5: all flags true → streaming (P1 highest priority)", () => {
    const context: CapabilityContext = {
      capability: "both",
      isConnectionAvailable: true,
      isTerminalAvailable: true,
      hasResolutionAction: true,
      isStreaming: true,
      isHandoffRequired: true,
      isDegraded: true,
      hasAlternativeGuidance: true,
    };
    const result = resolveUiState(context);
    expect(result.uiState).toBe("streaming");
  });

  it("EC-6: degraded + integratedRuntime → degraded (P4 > P5:ready)", () => {
    const context: CapabilityContext = {
      capability: "integratedRuntime",
      isConnectionAvailable: true,
      isTerminalAvailable: false,
      hasResolutionAction: false,
      isDegraded: true,
    };
    const result = resolveUiState(context);
    expect(result.uiState).toBe("degraded");
    expect(result.uiState).not.toBe("ready");
  });
});

// ============================================================
// Phase 6 Task 2: 境界値テスト
// ============================================================

describe("Phase 6: 境界値テスト", () => {
  it("BV-1: all optional fields undefined → capability-based result", () => {
    const context: CapabilityContext = {
      capability: "integratedRuntime",
      isConnectionAvailable: true,
      isTerminalAvailable: false,
      hasResolutionAction: false,
      // No optional fields set
    };
    const result = resolveUiState(context);
    expect(result.uiState).toBe("ready");
  });

  it("BV-2: all optional fields explicitly false → same result as undefined", () => {
    const context: CapabilityContext = {
      capability: "integratedRuntime",
      isConnectionAvailable: true,
      isTerminalAvailable: false,
      hasResolutionAction: false,
      isStreaming: false,
      isHandoffRequired: false,
      isDegraded: false,
      hasAlternativeGuidance: false,
    };
    const result = resolveUiState(context);
    expect(result.uiState).toBe("ready");
  });

  it("BV-3: capability=none with no optional fields → blocked/unavailable", () => {
    const contextWithAction: CapabilityContext = {
      capability: "none",
      isConnectionAvailable: false,
      isTerminalAvailable: false,
      hasResolutionAction: true,
    };
    const contextWithoutAction: CapabilityContext = {
      capability: "none",
      isConnectionAvailable: false,
      isTerminalAvailable: false,
      hasResolutionAction: false,
    };
    expect(resolveUiState(contextWithAction).uiState).toBe("blocked");
    expect(resolveUiState(contextWithoutAction).uiState).toBe("unavailable");
  });
});

// ============================================================
// Phase 6 Task 3: overload 2 後方互換テスト
// ============================================================

describe("Phase 6: overload 2 後方互換テスト", () => {
  it("OL-1: overload 2 (integratedRuntime, hasCredentialPath=true) → ready", () => {
    const result = resolveUiState("integratedRuntime", {
      hasCredentialPath: true,
    });
    expect(result).toBe("ready");
  });

  it("OL-2: overload 2 (none, hasCredentialPath=true) → blocked", () => {
    const result = resolveUiState("none", { hasCredentialPath: true });
    expect(result).toBe("blocked");
  });

  it("OL-3: overload 2 (none, hasCredentialPath=false) → unavailable", () => {
    const result = resolveUiState("none", { hasCredentialPath: false });
    expect(result).toBe("unavailable");
  });

  it("OL-4: overload 2 (terminalSurface, hasCredentialPath=true) → ready", () => {
    const result = resolveUiState("terminalSurface", {
      hasCredentialPath: true,
    });
    expect(result).toBe("ready");
  });

  it("OL-5: overload 2 (both, hasCredentialPath=true) → ready", () => {
    const result = resolveUiState("both", { hasCredentialPath: true });
    expect(result).toBe("ready");
  });
});

// ============================================================
// Guard 関数テスト（Phase 2 D-7）
// ============================================================

describe("Guard 関数（Phase 2 D-7）", () => {
  describe("assertStreamingCtaContract", () => {
    it("should not throw when streaming state has primary label '停止'", () => {
      const cta: CtaContract = {
        primary: { label: "停止", action: "stopStreaming" },
        secondary: { label: "最新へ移動", action: "scrollToLatest" },
      };
      expect(() => assertStreamingCtaContract("streaming", cta)).not.toThrow();
    });

    it("should throw when streaming state has primary label other than '停止'", () => {
      const cta: CtaContract = {
        primary: { label: "実行", action: "execute" },
        secondary: { label: "設定", action: "openSettings" },
      };
      expect(() => assertStreamingCtaContract("streaming", cta)).toThrow(
        "[assertStreamingCtaContract]",
      );
    });

    it("should not throw when non-streaming state regardless of primary label", () => {
      const cta: CtaContract = {
        primary: { label: "実行", action: "execute" },
        secondary: { label: "設定", action: "openSettings" },
      };
      expect(() => assertStreamingCtaContract("ready", cta)).not.toThrow();
    });
  });

  describe("assertHandoffGuidanceExists", () => {
    it("should not throw when handoff state has handoffGuidance", () => {
      const result: UiStateResult = {
        uiState: "handoff",
        handoffGuidance: {
          terminalCommand: "claude --resume",
          contextSummary: "test context",
          reason: "test reason",
        },
      };
      expect(() =>
        assertHandoffGuidanceExists("handoff", result),
      ).not.toThrow();
    });

    it("should throw when handoff state has no handoffGuidance", () => {
      const result: UiStateResult = {
        uiState: "handoff",
      };
      expect(() => assertHandoffGuidanceExists("handoff", result)).toThrow(
        "[assertHandoffGuidanceExists]",
      );
    });

    it("should not throw when non-handoff state has no handoffGuidance", () => {
      const result: UiStateResult = {
        uiState: "ready",
      };
      expect(() => assertHandoffGuidanceExists("ready", result)).not.toThrow();
    });
  });
});
