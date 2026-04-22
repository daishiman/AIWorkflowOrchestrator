import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConversationalInterview } from "../ConversationalInterview";
import type {
  SkillCreatorWorkflowUiSnapshot,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";

function buildSnapshot(
  overrides?: Partial<SkillCreatorWorkflowUiSnapshot>,
  request?: SkillCreatorUserInputRequest | null,
): SkillCreatorWorkflowUiSnapshot {
  return {
    planId: "plan-1",
    currentPhase: "review",
    awaitingUserInput: request ?? null,
    verifyResult: null,
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId: "plan-1",
      currentPhase: "review",
      artifactCount: 0,
      updatedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

function buildSingleSelectRequest(
  overrides?: Partial<SkillCreatorUserInputRequest>,
): SkillCreatorUserInputRequest {
  return {
    requestId: "req-1",
    reason: "plan_review",
    title: "テスト質問",
    prompt: "選択肢を選んでください",
    kind: "single_select",
    options: [
      { id: "opt-a", label: "選択肢A" },
      { id: "opt-b", label: "選択肢B" },
    ],
    requestedAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildMultiSelectRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-multi",
    reason: "plan_review",
    title: "複数選択",
    prompt: "複数選んでください",
    kind: "multi_select",
    options: [
      { id: "m-a", label: "項目A" },
      { id: "m-b", label: "項目B" },
      { id: "m-c", label: "項目C" },
    ],
    requestedAt: new Date().toISOString(),
  };
}

function buildFreeTextRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-text",
    reason: "plan_review",
    title: "テキスト入力",
    prompt: "説明を入力してください",
    kind: "free_text",
    placeholder: "ここに入力...",
    requestedAt: new Date().toISOString(),
  };
}

function buildConfirmRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-confirm",
    reason: "plan_review",
    title: "確認",
    prompt: "続行しますか？",
    kind: "confirm",
    requestedAt: new Date().toISOString(),
  };
}

function buildSecretRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-secret",
    reason: "plan_review",
    title: "APIキー",
    prompt: "APIキーを入力してください",
    kind: "secret",
    placeholder: "sk-...",
    requestedAt: new Date().toISOString(),
  };
}

describe("ConversationalInterview", () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-01: チャットバブル形式でメッセージが表示される
  it("displays assistant message in chat bubble format (TC-01)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("conversational-interview")).toBeInTheDocument();
    expect(screen.getByTestId("interview-chat-area")).toBeInTheDocument();
    expect(screen.getByText("選択肢を選んでください")).toBeInTheDocument();
  });

  // TC-03: single_selectの選択チップ群が表示される
  it("renders single_select as chips (TC-03)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    expect(screen.getByTestId("chip-opt-a")).toBeInTheDocument();
    expect(screen.getByTestId("chip-opt-b")).toBeInTheDocument();
  });

  // TC-04: multi_selectのチェックボックスリストが表示される
  it("renders multi_select as checkboxes (TC-04)", () => {
    const request = buildMultiSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("multi-select-checkbox")).toBeInTheDocument();
    expect(screen.getByTestId("checkbox-m-a")).toBeInTheDocument();
  });

  // TC-05: free_textのテキスト入力が表示される
  it("renders free_text input (TC-05)", () => {
    const request = buildFreeTextRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
  });

  // TC-06: confirmのYes/No CTAが表示される
  it("renders confirm buttons (TC-06)", () => {
    const request = buildConfirmRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("confirm-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-yes")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-no")).toBeInTheDocument();
  });

  // TC-07: secretのマスク付き入力が表示される
  it("renders secret input (TC-07)", () => {
    const request = buildSecretRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("secret-input")).toBeInTheDocument();
  });

  // TC-08: 進捗インジケーターが表示される
  it("displays progress bar (TC-08)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("interview-progress-bar")).toBeInTheDocument();
    expect(screen.getByTestId("progress-text")).toBeInTheDocument();
  });

  // TC-11/TC-12: 熟練度モード切替
  it("shows beginner hints when proficiency is beginner (TC-11)", () => {
    const request = buildFreeTextRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    // デフォルトはbeginner
    expect(screen.getByTestId("proficiency-beginner")).toBeInTheDocument();
    // placeholder が hint として表示される
    expect(screen.getByText("ここに入力...")).toBeInTheDocument();
  });

  it("hides beginner hints in engineer mode (TC-12)", () => {
    const request = buildFreeTextRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("proficiency-engineer"));

    // engineerモードではplaceholder hintが非表示
    const chatArea = screen.getByTestId("interview-chat-area");
    const italicHints = chatArea.querySelectorAll(".italic");
    expect(italicHints.length).toBe(0);
  });

  // TC-15: single_selectの選択 → submission
  it("submits single_select answer (TC-15)", async () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: "plan-1",
          requestId: "req-1",
          selectedOptionId: "opt-a",
        }),
      );
    });
  });

  // TC-17: confirmの「はい」をクリック
  it("submits confirm yes immediately (TC-17)", async () => {
    const request = buildConfirmRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("confirm-yes"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: "plan-1",
          requestId: "req-confirm",
          confirmed: true,
        }),
      );
    });
  });

  // TC-E01: single_selectで未選択のまま送信
  it("shows validation error when submitting single_select without selection (TC-E01)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("interview-submit"));

    expect(screen.getByTestId("validation-error")).toBeInTheDocument();
    expect(screen.getByText("選択肢を1つ選んでください")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // TC-E02: multi_selectで0件選択のまま送信
  it("shows validation error when submitting multi_select without selection (TC-E02)", () => {
    const request = buildMultiSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("interview-submit"));

    expect(screen.getByTestId("validation-error")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("restores previous question and answer on undo", async () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId("interview-undo"));

    expect(screen.getByTestId("chip-opt-a")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("選択肢を選んでください")).toBeInTheDocument();
  });

  it("rolls back optimistic user message when submit fails", async () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);
    const failingOnSubmit = vi
      .fn()
      .mockRejectedValue(new Error("submit failed"));

    const { container } = render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={failingOnSubmit}
        onError={mockOnError}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("回答の送信に失敗しました");
    });

    expect(
      container.querySelector('[data-testid^="message-user-"]'),
    ).toBeNull();
  });

  // TC-E05: 最初の質問で「戻る」ボタンが無効
  it("disables undo button at first question (TC-E05)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    const undoBtn = screen.getByTestId("interview-undo");
    expect(undoBtn).toBeDisabled();
  });

  // TC-E07: workflowSnapshotがnullの場合
  it("renders nothing when workflowSnapshot is null (TC-E07)", () => {
    const { container } = render(
      <ConversationalInterview
        workflowSnapshot={null}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  // TC-E08: pendingRequestがnullの場合
  it("shows waiting message when no pending request (TC-E08)", () => {
    const snapshot = buildSnapshot({}, null);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("interview-waiting")).toBeInTheDocument();
    expect(screen.getByText("質問を待っています...")).toBeInTheDocument();
  });

  // TC-21: secret表示/非表示トグル
  it("toggles secret visibility (TC-21)", () => {
    const request = buildSecretRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    const input = screen.getByTestId("secret-input-field") as HTMLInputElement;
    expect(input.type).toBe("password");

    fireEvent.click(screen.getByTestId("secret-toggle"));
    expect(input.type).toBe("text");

    fireEvent.click(screen.getByTestId("secret-toggle"));
    expect(input.type).toBe("password");
  });
});

// TASK-RALLY-002: pendingRequest合成ロジックのシナリオテスト
describe("pendingRequest合成ロジック", () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildReq(
    id: string,
    prompt: string,
    kind: "single_select" | "free_text" | "confirm" = "single_select",
  ): SkillCreatorUserInputRequest {
    const base = {
      requestId: id,
      reason: "plan_review" as const,
      title: `Title-${id}`,
      prompt,
      requestedAt: new Date().toISOString(),
    };
    if (kind === "single_select") {
      return {
        ...base,
        kind: "single_select",
        options: [{ id: `${id}-opt`, label: "選択肢" }],
      };
    }
    if (kind === "free_text") {
      return { ...base, kind: "free_text" };
    }
    return { ...base, kind: "confirm" };
  }

  // S-1: 通常フロー
  it("S-1: 通常フロー — workflowSnapshot.awaitingUserInput を使用する", () => {
    const req = buildReq("s1", "通常フローの質問");
    render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req)}
        onSubmit={mockOnSubmit}
      />,
    );
    expect(screen.getByText("通常フローの質問")).toBeInTheDocument();
  });

  // S-2: undo後、restoredPendingRequest が pendingRequest として使われる
  it("S-2: undo後 — restoredPendingRequest を優先する", async () => {
    const req1 = buildReq("s2-req1", "最初の質問", "single_select");
    const req2 = buildReq("s2-req2", "次の質問", "free_text");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // req1（single_select）に回答・送信
    fireEvent.click(screen.getByTestId("chip-s2-req1-opt"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // req2（free_text）のスナップショットが届く
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req2)}
        onSubmit={mockOnSubmit}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument(),
    );

    // undo クリック → restoredPendingRequest = req1（single_select）
    fireEvent.click(screen.getByTestId("interview-undo"));

    // req1（single_select）の入力ウィジェットが表示される
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    expect(screen.queryByTestId("free-text-input")).not.toBeInTheDocument();
  });

  // S-3: 新 requestId の snapshot が届いたら restoredPendingRequest がクリアされる
  it("S-3: 新 snapshot 到着後 — restoredPendingRequest がクリアされ pendingRequest が切り替わる", async () => {
    const req1 = buildReq("s3-req1", "最初の質問", "single_select");
    const req2 = buildReq("s3-req2", "次の質問", "free_text");
    const req3 = buildReq("s3-req3", "新しい質問", "confirm");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-s3-req1-opt"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req2)}
        onSubmit={mockOnSubmit}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument(),
    );

    // undo → restoredPendingRequest = req1（single_select）
    fireEvent.click(screen.getByTestId("interview-undo"));
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();

    // req3（confirm）のスナップショットが届く → restoredPendingRequest がクリアされる
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req3)}
        onSubmit={mockOnSubmit}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId("confirm-buttons")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("single-select-chips")).not.toBeInTheDocument();
  });

  // S-4: awaitingUserInput が null → restoredPendingRequest はクリアされない
  it("S-4: awaitingUserInput が null の場合 — restoredPendingRequest はクリアされない", async () => {
    const req1 = buildReq("s4-req1", "最初の質問", "single_select");
    const req2 = buildReq("s4-req2", "次の質問", "free_text");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-s4-req1-opt"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req2)}
        onSubmit={mockOnSubmit}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument(),
    );

    // undo → restoredPendingRequest = req1（single_select）
    fireEvent.click(screen.getByTestId("interview-undo"));
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();

    // awaitingUserInput が null のスナップショットが届く → restoredPendingRequest はクリアされない
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, null)}
        onSubmit={mockOnSubmit}
      />,
    );

    // single_select ウィジェットが引き続き表示される（restoredPendingRequest = req1 のまま）
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
  });

  // X-1: restoredPendingRequest が null のとき awaitingUserInput 更新で setRestoredPendingRequest は呼ばれない
  it("X-1: restoredPendingRequest が null のとき — awaitingUserInput 更新でも影響なし", () => {
    const req1 = buildReq("x1-req1", "最初の質問", "single_select");
    const req2 = buildReq("x1-req2", "次の質問", "confirm");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // restoredPendingRequest = null の状態で awaitingUserInput を更新
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    // req2（confirm）のウィジェットが表示される（restoredPendingRequest は null のまま）
    expect(screen.getByTestId("confirm-buttons")).toBeInTheDocument();
    expect(screen.queryByTestId("single-select-chips")).not.toBeInTheDocument();
  });

  // X-2: 同一 requestId の awaitingUserInput 更新では useEffect が再実行されない（deps安定性）
  it("X-2: 同一 requestId では restoredPendingRequest クリア useEffect が再実行されない", async () => {
    const req1 = buildReq("x2-req1", "最初の質問", "single_select");
    const req2 = buildReq("x2-req2", "次の質問", "free_text");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-x2-req1-opt"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req2)}
        onSubmit={mockOnSubmit}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument(),
    );

    // undo → restoredPendingRequest = req1
    fireEvent.click(screen.getByTestId("interview-undo"));
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();

    // 同一 requestId（req2）のまま新しいオブジェクト参照で rerender → useEffect は再実行されない
    const req2SameId = { ...req2, title: "更新タイトル" };
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot({}, req2SameId)}
        onSubmit={mockOnSubmit}
      />,
    );

    // single_select がそのまま表示（restoredPendingRequest が req1 のままクリアされていない）
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
  });
});
