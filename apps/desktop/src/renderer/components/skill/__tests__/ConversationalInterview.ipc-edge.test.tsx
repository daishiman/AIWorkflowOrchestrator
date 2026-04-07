/**
 * @vitest-environment happy-dom
 * @file ConversationalInterview.ipc-edge.test.tsx
 * @description Phase 6 IPC エッジケーステスト
 * IPC-TO-01〜03: Runtime IPC タイムアウト時の UI 挙動
 * IPC-ER-01〜03: IPC エラーレスポンス時の UI 挙動
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConversationalInterview } from "../ConversationalInterview";
import type {
  SkillCreatorWorkflowUiSnapshot,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";

function buildSnapshot(
  request: SkillCreatorUserInputRequest | null = null,
): SkillCreatorWorkflowUiSnapshot {
  return {
    planId: "plan-ipc",
    currentPhase: "review",
    awaitingUserInput: request,
    verifyResult: null,
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId: "plan-ipc",
      currentPhase: "review",
      artifactCount: 0,
      updatedAt: new Date().toISOString(),
    },
  };
}

function buildSingleSelectRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-ipc-1",
    reason: "plan_review",
    title: "IPC テスト",
    prompt: "選択肢を選んでください",
    kind: "single_select",
    options: [
      { id: "opt-a", label: "選択肢A" },
      { id: "opt-b", label: "選択肢B" },
    ],
    requestedAt: new Date().toISOString(),
  };
}

describe("ConversationalInterview — IPC edge cases", () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── IPC-TO: タイムアウト系 ─────────────────────────────────────────────────

  // IPC-TO-01: onSubmit が reject した後、送信ボタンが再活性化される
  it("IPC-TO-01: re-enables submit button after onSubmit rejects", async () => {
    const failingSubmit = vi.fn().mockRejectedValue(new Error("timeout"));

    const snapshot = buildSnapshot(buildSingleSelectRequest());
    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={failingSubmit}
        onError={mockOnError}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    // submit 後にボタンが再活性化されるまで待つ
    await waitFor(() => {
      const btn = screen.getByTestId("interview-submit");
      expect(btn).not.toBeDisabled();
    });
  });

  // IPC-TO-02: onSubmit が reject した後、onError コールバックが呼ばれる
  it("IPC-TO-02: calls onError when onSubmit rejects (timeout scenario)", async () => {
    const failingSubmit = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 0),
          ),
      );

    const snapshot = buildSnapshot(buildSingleSelectRequest());
    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={failingSubmit}
        onError={mockOnError}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("回答の送信に失敗しました");
    });
  });

  // IPC-TO-03: onSubmit が pending 中、送信ボタンが disabled かつ "送信中..." 表示になる
  it("IPC-TO-03: shows loading state while onSubmit is pending", async () => {
    let resolveSubmit!: () => void;
    const pendingSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    const snapshot = buildSnapshot(buildSingleSelectRequest());
    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={pendingSubmit}
        onError={mockOnError}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    // Promise が pending の間はボタンが disabled かつ "送信中..."
    await waitFor(() => {
      const btn = screen.getByTestId("interview-submit");
      expect(btn).toBeDisabled();
      expect(btn).toHaveTextContent("送信中...");
    });

    // Promise を解決してクリーンアップ
    resolveSubmit();
    await waitFor(() => {
      expect(screen.getByTestId("interview-submit")).not.toBeDisabled();
    });
  });

  // ── IPC-ER: エラーレスポンス系 ──────────────────────────────────────────────

  // IPC-ER-01: IPC エラー時に onError が呼ばれ、コンポーネントが送信前状態に戻る
  it("IPC-ER-01: calls onError and restores submit state on IPC error", async () => {
    const failingSubmit = vi.fn().mockRejectedValue(new Error("network error"));

    const snapshot = buildSnapshot(buildSingleSelectRequest());
    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={failingSubmit}
        onError={mockOnError}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    // 送信ボタンが再活性化されている
    expect(screen.getByTestId("interview-submit")).not.toBeDisabled();
    expect(screen.getByTestId("interview-submit")).toHaveTextContent("送信");
  });

  // IPC-ER-02: IPC エラー後に再送信できる（ボタンが再活性化されフォームが操作可能）
  it("IPC-ER-02: allows re-submission after IPC error", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("first error"))
      .mockResolvedValueOnce(undefined);

    const snapshot = buildSnapshot(buildSingleSelectRequest());
    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={submit}
        onError={mockOnError}
      />,
    );

    // 1回目: エラー
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    // 2回目: 再送信可能（選択状態は保持されているため再クリックのみ）
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => {
      expect(submit).toHaveBeenCalledTimes(2);
    });
  });

  // IPC-ER-03: 現在の実装では onError に詳細エラーコードは伝達されない (TODO: 要改善)
  it.todo(
    "IPC-ER-03: passes error code to onError for permission errors (not yet implemented — always passes generic string)",
  );
});
