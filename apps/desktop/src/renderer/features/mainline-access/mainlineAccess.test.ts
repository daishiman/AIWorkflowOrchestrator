import { describe, expect, it } from "vitest";
import { buildMainlineExecutionAccessState } from "./mainlineAccess";

describe("buildMainlineExecutionAccessState", () => {
  it("API key のみ有効なら integratedRuntime になる", () => {
    const result = buildMainlineExecutionAccessState({
      apiKeyValid: true,
      subscriptionValid: false,
      isAuthenticated: true,
    });

    expect(result.capability).toBe("integratedRuntime");
    expect(result.uiState).toBe("ready");
    expect(result.ctaContract.primary?.label).toBe("AI で実行");
    expect(result.launcherDisabled).toBe(true);
  });

  it("subscription のみ有効なら terminalSurface になり launcher が有効", () => {
    const result = buildMainlineExecutionAccessState({
      apiKeyValid: false,
      subscriptionValid: true,
      isAuthenticated: true,
    });

    expect(result.capability).toBe("terminalSurface");
    expect(result.uiState).toBe("terminal-only");
    expect(result.ctaContract.primary?.action).toBe("openTerminal");
    expect(result.launcherDisabled).toBe(false);
    expect(result.launcherDisabledReason).toBeUndefined();
  });

  it("両 credential がない場合は blocked になり blockedInfo を返す", () => {
    const result = buildMainlineExecutionAccessState({
      apiKeyValid: false,
      subscriptionValid: false,
      isAuthenticated: true,
    });

    expect(result.capability).toBe("none");
    expect(result.uiState).toBe("blocked");
    expect(result.blockedInfo?.blockedAction).toBe("設定を開く");
  });

  it("未認証時は launcher を disabled にし理由を返す", () => {
    const result = buildMainlineExecutionAccessState({
      apiKeyValid: true,
      subscriptionValid: true,
      isAuthenticated: false,
    });

    expect(result.capability).toBe("both");
    expect(result.launcherDisabled).toBe(true);
    expect(result.launcherDisabledReason).toBe("認証が必要です");
  });

  it("API key が degraded で subscription fallback があれば terminalSurface に降格する", () => {
    const result = buildMainlineExecutionAccessState({
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: true,
      isAuthenticated: true,
      healthStatus: {
        status: "disconnected",
        providerId: "anthropic",
        checkedAt: new Date("2026-03-22T00:00:00Z"),
      },
    });

    expect(result.capability).toBe("terminalSurface");
    expect(result.uiState).toBe("terminal-only");
    expect(result.ctaContract.primary?.action).toBe("openTerminal");
    expect(result.launcherDisabled).toBe(false);
  });

  it("loading 中は launcher を一時的に無効化する", () => {
    const result = buildMainlineExecutionAccessState({
      apiKeyValid: false,
      subscriptionValid: true,
      isAuthenticated: true,
      isLoading: true,
    });

    expect(result.launcherDisabled).toBe(true);
    expect(result.launcherDisabledReason).toBe("実行経路を確認中です");
  });
});
