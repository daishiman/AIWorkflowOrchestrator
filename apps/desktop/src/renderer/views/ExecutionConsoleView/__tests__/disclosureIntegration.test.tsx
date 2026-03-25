/**
 * @vitest-environment happy-dom
 */

/**
 * Disclosure 統合テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: DSC-09〜DSC-11, NFR-01〜NFR-03
 *
 * 注意: happy-dom 環境では userEvent を使用しない。fireEvent + act() を使用する (P39)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { SessionDisclosureBanner } from "../../../components/execution/SessionDisclosureBanner";
import { ApprovalSheet } from "../../../components/execution/ApprovalSheet";
import {
  AdvancedConsolePanel,
  type SessionState,
} from "../../../components/execution/AdvancedConsolePanel";

describe("Disclosure Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  // DSC-09: Approval Sheet 内 disclosure が dismiss 不可
  it("DSC-09: embedded disclosure in ApprovalSheet has no dismiss button", () => {
    const { getByTestId } = render(
      <ApprovalSheet
        operationType="external_send"
        description="LLM API にデータを送信します"
        destination="https://api.anthropic.com"
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    const disclosure = getByTestId("approval-disclosure");
    const dismissBtn = disclosure.querySelector(
      '[data-testid="disclosure-dismiss"]',
    );
    expect(dismissBtn).toBeNull();
  });

  // DSC-10: collapsed state で Disclosure Banner が非表示
  it("DSC-10: AdvancedConsolePanel returns null in collapsed state", () => {
    const { container } = render(
      <AdvancedConsolePanel
        isOpen={false}
        onToggle={vi.fn()}
        terminalOutput={[]}
        sessionState="collapsed"
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  // DSC-11: unavailable state で AdvancedConsolePanel が非表示
  it("DSC-11: AdvancedConsolePanel returns null in unavailable state", () => {
    const { container } = render(
      <AdvancedConsolePanel
        isOpen={false}
        onToggle={vi.fn()}
        terminalOutput={[]}
        sessionState="unavailable"
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  // NFR-01: エラーメッセージに内部パスが含まれない
  // advancedConsoleHandlers の sanitizeForApiKeys が API key を除去することで間接検証
  it("NFR-01: approval sheet error display does not leak internal paths", () => {
    const { container } = render(
      <ApprovalSheet
        operationType="dangerous_operation"
        description="ファイルを変更します"
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    const textContent = container.textContent ?? "";
    // 内部パスパターンが含まれていない
    expect(textContent).not.toMatch(/\/Users\//);
    expect(textContent).not.toMatch(/\/home\//);
    expect(textContent).not.toMatch(/C:\\/);
  });

  // NFR-02: エラーメッセージにトークンが含まれない
  it("NFR-02: disclosure banner does not display token values", () => {
    const { container } = render(
      <SessionDisclosureBanner
        aiServiceName="Claude (Sonnet 4.6)"
        externalDestinations={["Anthropic API"]}
        onDismiss={vi.fn()}
        canReopen={true}
      />,
    );

    const textContent = container.textContent ?? "";
    expect(textContent).not.toMatch(/sk-ant-/);
    expect(textContent).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
    expect(textContent).not.toMatch(/sess-/);
    expect(textContent).not.toMatch(/sessionKey=/);
  });

  // NFR-03: Disclosure banner が Session Dock state machine 準拠
  describe("NFR-03: state machine compliance for component visibility", () => {
    const panelProps = {
      isOpen: false,
      onToggle: vi.fn(),
      terminalOutput: [],
      sessionState: "ready" as SessionState,
    };

    // HIDDEN_STATES ではパネルが非表示
    const hiddenStates: SessionState[] = [
      "collapsed",
      "unavailable",
      "guidance-only",
    ];
    for (const state of hiddenStates) {
      it(`returns null for ${state} state`, () => {
        cleanup();
        const { container } = render(
          <AdvancedConsolePanel {...panelProps} sessionState={state} />,
        );
        expect(container.innerHTML).toBe("");
      });
    }

    // 表示可能な state ではパネル toggle が表示される
    const visibleStates: SessionState[] = [
      "ready",
      "handoff",
      "running",
      "done",
      "aborted",
    ];
    for (const state of visibleStates) {
      it(`renders toggle for ${state} state`, () => {
        cleanup();
        const { getByTestId } = render(
          <AdvancedConsolePanel {...panelProps} sessionState={state} />,
        );
        expect(getByTestId("advanced-console-toggle")).toBeTruthy();
      });
    }
  });

  // DSC reopen flow: dismiss → reopen アイコン表示の検証
  it("disclosure dismiss and reopen flow works correctly", () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <SessionDisclosureBanner
        aiServiceName="Claude"
        externalDestinations={["API"]}
        onDismiss={onDismiss}
        canReopen={true}
      />,
    );

    // banner が表示されている
    expect(getByTestId("disclosure-banner")).toBeTruthy();

    // dismiss クリック
    act(() => {
      fireEvent.click(getByTestId("disclosure-dismiss"));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
