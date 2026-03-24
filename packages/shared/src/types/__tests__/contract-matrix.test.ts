/**
 * @file contract-matrix.test.ts
 * @description Contract Matrix 全 32 セルテスト + 到達不能セル 13 件ガードテスト
 * @task TASK-IMP-UISTATE-CONTRACT-EXTENSION-001
 * @phase Phase 4: テスト作成（TDD RED）
 *
 * 8 state x 4 capability = 32 セルの CTA マッピングを網羅的に検証する。
 * Phase 2 設計書 D-5 準拠。
 */

import { describe, it, expect } from "vitest";
import { resolveCtaContract } from "../execution-capability";
import type { UiState, AccessCapability } from "../execution-capability";

// ============================================================
// Contract Matrix - 到達可能セル（19 セル）
// ============================================================

describe("Contract Matrix - 到達可能セル", () => {
  // ready
  it("cell-1: ready x integratedRuntime", () => {
    const cta = resolveCtaContract("ready", "integratedRuntime");
    expect(cta.primary?.label).toBe("AI で実行");
    expect(cta.primary?.action).toBe("executeIntegrated");
    expect(cta.secondary.label).toBe("設定を開く");
  });

  it("cell-3: ready x both", () => {
    const cta = resolveCtaContract("ready", "both");
    expect(cta.primary?.label).toBe("AI で実行");
    expect(cta.secondary.label).toBe("ターミナルで実行");
  });

  // blocked
  it("cell-8: blocked x none", () => {
    const cta = resolveCtaContract("blocked", "none");
    expect(cta.primary?.label).toBe("設定を開く");
    expect(cta.secondary.label).toBe("ヘルプを表示");
  });

  // unavailable
  it("cell-10: unavailable x terminalSurface", () => {
    const cta = resolveCtaContract("unavailable", "terminalSurface");
    expect(cta.primary).toBeNull();
    expect(cta.secondary.label).toBe("セットアップガイド");
  });

  it("cell-12: unavailable x none", () => {
    const cta = resolveCtaContract("unavailable", "none");
    expect(cta.primary).toBeNull();
    expect(cta.secondary.label).toBe("セットアップガイド");
  });

  // streaming
  it("cell-13: streaming x integratedRuntime", () => {
    const cta = resolveCtaContract("streaming", "integratedRuntime");
    expect(cta.primary?.label).toBe("停止");
    expect(cta.primary?.action).toBe("stopStreaming");
    expect(cta.secondary.label).toBe("最新へ移動");
    expect(cta.secondary.action).toBe("scrollToLatest");
  });

  it("cell-15: streaming x both", () => {
    const cta = resolveCtaContract("streaming", "both");
    expect(cta.primary?.action).toBe("stopStreaming");
  });

  // handoff
  it("cell-18: handoff x terminalSurface", () => {
    const cta = resolveCtaContract("handoff", "terminalSurface");
    expect(cta.primary?.label).toBe("terminal を開く");
    expect(cta.primary?.action).toBe("openTerminal");
    expect(cta.secondary.label).toBe("コマンドをコピー");
    expect(cta.secondary.action).toBe("copyCommandToClipboard");
  });

  it("cell-19: handoff x both", () => {
    const cta = resolveCtaContract("handoff", "both");
    expect(cta.primary?.action).toBe("openTerminal");
  });

  // terminal-only
  it("cell-22: terminal-only x terminalSurface", () => {
    const cta = resolveCtaContract("terminal-only", "terminalSurface");
    expect(cta.primary?.label).toBe("terminal を開く");
    expect(cta.primary?.action).toBe("openTerminal");
    expect(cta.secondary.label).toBe("コマンドをコピー");
  });

  // guidance-only
  it("cell-28: guidance-only x none", () => {
    const cta = resolveCtaContract("guidance-only", "none");
    expect(cta.primary?.label).toBe("設定を見る");
    expect(cta.primary?.action).toBe("openSettings");
    expect(cta.secondary.label).toBe("ヘルプを表示");
  });

  // degraded
  it("cell-29: degraded x integratedRuntime", () => {
    const cta = resolveCtaContract("degraded", "integratedRuntime");
    expect(cta.primary?.label).toBe("manual fallback");
    expect(cta.primary?.action).toBe("openManualFallback");
    expect(cta.secondary.label).toBe("ヘルプを表示");
  });

  it("cell-31: degraded x both", () => {
    const cta = resolveCtaContract("degraded", "both");
    expect(cta.primary?.action).toBe("openManualFallback");
  });
});

// ============================================================
// Contract Matrix - 到達不能セル 13 件（Phase 2 D-5 準拠）
// ============================================================

describe("Contract Matrix - 到達不能セル 13 件", () => {
  const unreachableCells: Array<[UiState, AccessCapability]> = [
    // integratedRuntime x handoff/terminal-only/guidance-only
    ["handoff", "integratedRuntime"],
    ["terminal-only", "integratedRuntime"],
    ["guidance-only", "integratedRuntime"],
    // terminalSurface x streaming/guidance-only/degraded
    ["streaming", "terminalSurface"],
    ["guidance-only", "terminalSurface"],
    ["degraded", "terminalSurface"],
    // both x terminal-only/guidance-only
    ["terminal-only", "both"],
    ["guidance-only", "both"],
    // none x ready/streaming/handoff/terminal-only/degraded
    ["ready", "none"],
    ["streaming", "none"],
    ["handoff", "none"],
    ["terminal-only", "none"],
    ["degraded", "none"],
  ];

  it.each(unreachableCells)(
    "unreachable: %s x %s -> safe fallback (no throw)",
    (uiState, capability) => {
      expect(() => resolveCtaContract(uiState, capability)).not.toThrow();
    },
  );
});
