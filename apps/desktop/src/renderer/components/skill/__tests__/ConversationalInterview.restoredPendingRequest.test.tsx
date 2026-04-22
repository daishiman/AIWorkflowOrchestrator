/**
 * @vitest-environment happy-dom
 * @file ConversationalInterview.restoredPendingRequest.test.tsx
 * @description TASK-RALLY-002: restoredPendingRequest 合成ルール targeted regression test
 *
 * 検証する契約:
 *   pendingRequest = restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null
 *
 * TC-RPR-01: 通常経路 — restoredPendingRequest が null のとき awaitingUserInput を使う
 * TC-RPR-02: 復元経路 — undo 後に restoredPendingRequest が awaitingUserInput より優先される
 * TC-RPR-03: clear 条件 — requestId が変化したとき restoredPendingRequest がクリアされる
 * TC-RPR-04: submit 後のクリア — submit 完了後に restoredPendingRequest がクリアされる
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConversationalInterview } from "../ConversationalInterview";
import type {
  SkillCreatorWorkflowUiSnapshot,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";

function buildSnapshot(
  request: SkillCreatorUserInputRequest | null,
  planId = "plan-rpr",
): SkillCreatorWorkflowUiSnapshot {
  return {
    planId,
    currentPhase: "review",
    awaitingUserInput: request,
    verifyResult: null,
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId,
      currentPhase: "review",
      artifactCount: 0,
      updatedAt: new Date().toISOString(),
    },
  };
}

function buildSingleSelectRequest(
  requestId: string,
  prompt: string,
): SkillCreatorUserInputRequest {
  return {
    requestId,
    reason: "plan_review",
    title: "テスト質問",
    prompt,
    kind: "single_select",
    options: [
      { id: "opt-a", label: "選択肢A" },
      { id: "opt-b", label: "選択肢B" },
    ],
    requestedAt: new Date().toISOString(),
  };
}

describe("ConversationalInterview — restoredPendingRequest 合成ルール", () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-RPR-01: 通常経路 — restoredPendingRequest が null (初期状態) のとき awaitingUserInput を使う
  it("TC-RPR-01: shows awaitingUserInput question in normal flow (no restoration)", () => {
    const q1 = buildSingleSelectRequest("req-normal-1", "通常フローの質問");
    const snapshot = buildSnapshot(q1);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText("通常フローの質問")).toBeInTheDocument();
    expect(screen.getByTestId("interview-input-area")).toBeInTheDocument();
  });

  // TC-RPR-02: 復元経路 — undo 後に restoredPendingRequest が awaitingUserInput より優先される
  it("TC-RPR-02: restoredPendingRequest takes priority over awaitingUserInput after undo", async () => {
    const q1 = buildSingleSelectRequest("req-restore-1", "復元されるべき質問");
    const snapshot = buildSnapshot(q1);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    // q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    // undo → restoredPendingRequest = q1 が設定される
    fireEvent.click(screen.getByTestId("interview-undo"));

    // q1 の選択肢が復元されている（restoredPendingRequest 経由）
    await waitFor(() => {
      expect(screen.getByTestId("chip-opt-a")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });
    expect(screen.getByTestId("interview-input-area")).toBeInTheDocument();
  });

  // TC-RPR-03: clear 条件 — workflowSnapshot?.awaitingUserInput?.requestId が変化したとき
  //            restoredPendingRequest がクリアされ、新しい質問へ切り替わる
  it("TC-RPR-03: clears restoredPendingRequest when snapshot requestId changes", async () => {
    const q1 = buildSingleSelectRequest("req-clear-1", "古い質問（復元中）");
    const q2 = buildSingleSelectRequest("req-clear-2", "新しい質問（切替後）");
    const snapshot1 = buildSnapshot(q1);
    const snapshot2 = buildSnapshot(q2);

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={snapshot1}
        onSubmit={mockOnSubmit}
      />,
    );

    // q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    // undo → restoredPendingRequest = q1
    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      expect(screen.getByTestId("chip-opt-a")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    // 新しい snapshot (requestId 変化) でリレンダー → clear useEffect 発火
    rerender(
      <ConversationalInterview
        workflowSnapshot={snapshot2}
        onSubmit={mockOnSubmit}
      />,
    );

    // q2 の質問がチャットに追加される（通常フローへ切り替わり）
    await waitFor(() => {
      expect(screen.getByText("新しい質問（切替後）")).toBeInTheDocument();
    });
  });

  // TC-RPR-04: submit 後のクリア — submit 完了後に restoredPendingRequest がクリアされる
  //            (undo で復元した質問への回答を送信した後、undo ボタンが有効のまま)
  it("TC-RPR-04: clears restoredPendingRequest after successful submit", async () => {
    const q1 = buildSingleSelectRequest(
      "req-submit-1",
      "送信後にクリアされる質問",
    );
    const snapshot = buildSnapshot(q1);

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    // q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    // undo → restoredPendingRequest = q1
    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      expect(screen.getByTestId("chip-opt-a")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    // 復元された状態から再 submit → restoredPendingRequest がクリアされる
    fireEvent.click(screen.getByTestId("chip-opt-b"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });

    // submit 完了後に restoredPendingRequest がクリアされていれば、
    // awaitingUserInput=null の snapshot へ戻したとき待機表示へ遷移する。
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot(null)}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("interview-waiting")).toBeInTheDocument();
    });
  });

  // TC-RPR-05: awaitingUserInput が null かつ restoredPendingRequest も null のとき待機表示
  it("TC-RPR-05: shows waiting state when both restoredPendingRequest and awaitingUserInput are null", () => {
    const snapshot = buildSnapshot(null);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("interview-waiting")).toBeInTheDocument();
    expect(screen.getByText("質問を待っています...")).toBeInTheDocument();
  });
});
