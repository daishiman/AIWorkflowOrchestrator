/**
 * @vitest-environment happy-dom
 * @file ConversationalInterview.restoredPendingRequest.test.tsx
 * @description RALLY-002 targeted regression tests — restoredPendingRequest 合成ルール検証
 *
 * verify_existing タスクのため、新規ロジック追加なし。
 * 既存の合成式 `restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null`
 * およびクリア条件 useEffect の挙動を固定する。
 *
 * 正常系シナリオ:
 *   S-1 (TC-S1-01): restoredPendingRequest が非 null のとき snapshot より優先される
 *   S-2 (TC-S2-01): snapshot の requestId 変化で restoredPendingRequest がクリアされる
 *   S-3 (TC-S3-01): 通常フロー — restoredPendingRequest が null のとき snapshot 値にフォールバック
 *
 * 異常系・エッジケース:
 *   EC-1 (TC-EC1-01): 両値が同時に非 null — restoredPendingRequest が優先
 *   EC-2 (TC-EC2-01): 通常フローでのクリア useEffect 呼び出しは冪等
 *   EC-3 (TC-EC3-01): requestId 不変時にクリアが発生しない
 *   EC-4 (TC-EC4-01): 復元フロー → 通常フロー切り替え境界
 *   EC-5 (TC-EC5-01): 再マウント後の初期状態
 *   EC-6 (TC-EC6-01): undo 復元中の再送信は restored requestId へ送られる
 *   EC-7 (TC-EC7-01): 再送信成功後も新 snapshot 到着まで restored UI を維持する
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConversationalInterview } from "../ConversationalInterview";
import type {
  SkillCreatorWorkflowUiSnapshot,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";

function buildSnapshot(
  planId: string,
  request: SkillCreatorUserInputRequest | null,
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
    title: "選択質問",
    prompt,
    kind: "single_select",
    options: [
      { id: "opt-a", label: "選択肢A" },
      { id: "opt-b", label: "選択肢B" },
    ],
    requestedAt: new Date().toISOString(),
  };
}

function buildFreeTextRequest(
  requestId: string,
  prompt: string,
): SkillCreatorUserInputRequest {
  return {
    requestId,
    reason: "plan_review",
    title: "テキスト質問",
    prompt,
    kind: "free_text",
    requestedAt: new Date().toISOString(),
  };
}

describe("ConversationalInterview — restoredPendingRequest 合成ルール (RALLY-002)", () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 正常系 ────────────────────────────────────────────────────────────────────

  // TC-S3-01: 通常フロー — restoredPendingRequest が null のとき snapshot 値にフォールバック
  it("TC-S3-01: uses workflowSnapshot.awaitingUserInput when restoredPendingRequest is null", () => {
    const req = buildSingleSelectRequest("req-s3", "S3: snapshot フローの質問");
    const snapshot = buildSnapshot("plan-s3", req);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    // snapshot の prompt がチャットエリアに表示される
    expect(screen.getByText("S3: snapshot フローの質問")).toBeInTheDocument();
    // single_select widget が表示される
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
  });

  // TC-S1-01: restoredPendingRequest が非 null のとき snapshot より優先される
  // セットアップ: Q1 を submit → Q2 へ遷移 → undo → restoredPendingRequest = Q1, snapshot = Q2
  it("TC-S1-01: prioritizes restoredPendingRequest over snapshot.awaitingUserInput after undo", async () => {
    const req1 = buildSingleSelectRequest(
      "req-s1-001",
      "S1: Q1 の質問（single_select）",
    );
    const req2 = buildFreeTextRequest(
      "req-s1-002",
      "S1: Q2 の質問（free_text）",
    );

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-s1", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // Q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // 親が workflowSnapshot を Q2 に更新
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-s1", req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    // Q2 のチャットバブルが表示されたことを確認
    expect(screen.getByText("S1: Q2 の質問（free_text）")).toBeInTheDocument();

    // undo: restoredPendingRequest = Q1 がセットされる
    fireEvent.click(screen.getByTestId("interview-undo"));

    // pendingRequest = restoredPendingRequest (Q1) ?? snapshot (Q2) = Q1
    // → single_select widget が表示される（Q1 の入力形式）
    await waitFor(() => {
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });
    // Q2 の free_text widget は表示されない
    expect(screen.queryByTestId("free-text-input")).not.toBeInTheDocument();
    // Q2 のチャットバブルは undo で除去される
    expect(
      screen.queryByText("S1: Q2 の質問（free_text）"),
    ).not.toBeInTheDocument();
  });

  // TC-S2-01: snapshot の requestId が変化すると restoredPendingRequest がクリアされる
  it("TC-S2-01: clears restoredPendingRequest when snapshot.awaitingUserInput.requestId changes", async () => {
    const req1 = buildSingleSelectRequest("req-s2-001", "S2: Q1 の質問");
    const req2 = buildFreeTextRequest("req-s2-002", "S2: Q2 の質問");
    const req3 = buildFreeTextRequest(
      "req-s2-003",
      "S2: Q3 の質問（クリア後）",
    );

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-s2", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // Q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // 親が workflowSnapshot を Q2 に更新
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-s2", req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    // undo: restoredPendingRequest = Q1
    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });

    // 親が workflowSnapshot を Q3 に更新（新しい requestId）
    // → クリア条件 useEffect が発火し restoredPendingRequest → null
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-s2", req3)}
        onSubmit={mockOnSubmit}
      />,
    );

    // pendingRequest = null ?? Q3 = Q3 → free_text widget が表示される
    await waitFor(() => {
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("single-select-chips")).not.toBeInTheDocument();
  });

  // ── 異常系・エッジケース ──────────────────────────────────────────────────────

  // TC-EC1-01: 両値が同時に非 null — null 合体演算子の左辺（restoredPendingRequest）が優先
  // S-1 と同じシナリオを別の requestId で検証
  it("TC-EC1-01: restoredPendingRequest wins over snapshot when both are non-null", async () => {
    const reqRestore = buildSingleSelectRequest(
      "req-ec1-restore",
      "EC1: 復元リクエスト（single_select）",
    );
    const reqLive = buildFreeTextRequest(
      "req-ec1-live",
      "EC1: 通常リクエスト（free_text）",
    );

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec1", reqRestore)}
        onSubmit={mockOnSubmit}
      />,
    );

    // reqRestore に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // snapshot を reqLive に更新
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec1", reqLive)}
        onSubmit={mockOnSubmit}
      />,
    );

    // undo: restoredPendingRequest = reqRestore, snapshot.awaitingUserInput = reqLive
    // — 両方非 null の競合状態
    fireEvent.click(screen.getByTestId("interview-undo"));

    // restoredPendingRequest (single_select) が優先される
    await waitFor(() => {
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("free-text-input")).not.toBeInTheDocument();
  });

  // TC-EC2-01: 通常フローでは restoredPendingRequest が null のため、クリア useEffect は冪等
  it("TC-EC2-01: clear useEffect is idempotent when restoredPendingRequest is already null", async () => {
    const req1 = buildSingleSelectRequest("req-ec2-001", "EC2: Q1 の質問");
    const req2 = buildFreeTextRequest("req-ec2-002", "EC2: Q2 の質問");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec2", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // Q1 に回答して submit (restoredPendingRequest は submit 後も null のまま)
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // snapshot を Q2 に更新 → クリア useEffect が発火するが restoredPendingRequest は既に null
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec2", req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    // クラッシュなく Q2 の widget が正しく表示される
    await waitFor(() => {
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
    });
    // single_select chips は Q2 のため非表示
    expect(screen.queryByTestId("single-select-chips")).not.toBeInTheDocument();
  });

  // TC-EC3-01: requestId が不変のまま snapshot が更新されてもクリアは発生しない
  it("TC-EC3-01: does not clear restoredPendingRequest when requestId is unchanged", async () => {
    const req1 = buildSingleSelectRequest("req-ec3-001", "EC3: Q1 の質問");
    const req2 = buildFreeTextRequest("req-ec3-002", "EC3: Q2 の質問");
    // Q2 と同じ requestId だが prompt だけ変わった snapshot（requestId 不変）
    const req2SameId: SkillCreatorUserInputRequest = {
      ...req2,
      requestId: "req-ec3-002",
      prompt: "EC3: Q2 更新版（requestId 不変）",
    };

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec3", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // Q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // snapshot を Q2 に更新
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec3", req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    // undo: restoredPendingRequest = Q1
    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });

    // requestId が不変のまま snapshot を更新 → クリア useEffect は再発火しない
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec3", req2SameId)}
        onSubmit={mockOnSubmit}
      />,
    );

    // restoredPendingRequest はクリアされず Q1 の widget が継続表示
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    expect(screen.queryByTestId("free-text-input")).not.toBeInTheDocument();
  });

  // TC-EC4-01: 復元フロー → 通常フロー切り替え境界（RALLY-002 の核心シナリオ）
  it("TC-EC4-01: transitions from restored to normal flow when snapshot requestId changes", async () => {
    const req1 = buildSingleSelectRequest("req-ec4-001", "EC4: Q1 の質問");
    const req2 = buildFreeTextRequest("req-ec4-002", "EC4: Q2 の質問");
    const req3 = buildFreeTextRequest(
      "req-ec4-003",
      "EC4: Q3 の質問（通常フローへ切替）",
    );

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec4", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // Q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // snapshot を Q2 に更新
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec4", req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    // undo: restoredPendingRequest = Q1, snapshot = Q2 → 復元フロー
    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      // 復元フロー: single_select widget (Q1) が表示
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });

    // snapshot を Q3（新 requestId）に更新 → 通常フローへ切り替え
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec4", req3)}
        onSubmit={mockOnSubmit}
      />,
    );

    // 通常フロー: restoredPendingRequest = null, pendingRequest = Q3 の free_text
    await waitFor(() => {
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("single-select-chips")).not.toBeInTheDocument();
  });

  // TC-EC5-01: 再マウント後は restoredPendingRequest が null（初期状態）に戻る
  it("TC-EC5-01: resets restoredPendingRequest to null on remount", async () => {
    const req1 = buildSingleSelectRequest("req-ec5-001", "EC5: Q1 の質問");
    const req2 = buildFreeTextRequest("req-ec5-002", "EC5: Q2 の質問");
    const reqNew = buildFreeTextRequest(
      "req-ec5-new",
      "EC5: 再マウント後の質問",
    );

    const { rerender, unmount } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec5", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    // Q1 に回答して submit
    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    // snapshot を Q2 に更新してから undo
    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec5", req2)}
        onSubmit={mockOnSubmit}
      />,
    );
    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });

    // コンポーネントをアンマウント → 再マウント（全 state がリセット）
    unmount();
    render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec5-new", reqNew)}
        onSubmit={mockOnSubmit}
      />,
    );

    // 再マウント後: restoredPendingRequest = null（初期値）、pendingRequest = reqNew
    expect(screen.getByText("EC5: 再マウント後の質問")).toBeInTheDocument();
    expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
    expect(screen.queryByTestId("single-select-chips")).not.toBeInTheDocument();
  });

  // TC-EC6-01: undo 復元中の再送信は restored requestId を送る
  it("TC-EC6-01: submits restored requestId while undo state is active", async () => {
    const req1 = buildSingleSelectRequest("req-ec6-001", "EC6: Q1 の質問");
    const req2 = buildFreeTextRequest("req-ec6-002", "EC6: Q2 の質問");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec6", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec6", req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("chip-opt-b"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(2));
    expect(mockOnSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        planId: "plan-ec6",
        requestId: "req-ec6-001",
        selectedOptionId: "opt-b",
      }),
    );
  });

  // TC-EC7-01: 再送信成功後は新 snapshot 到着まで restored UI を維持する
  it("TC-EC7-01: keeps restored widget visible until a new snapshot request arrives", async () => {
    const req1 = buildSingleSelectRequest("req-ec7-001", "EC7: Q1 の質問");
    const req2 = buildFreeTextRequest("req-ec7-002", "EC7: Q2 の質問");
    const req3 = buildFreeTextRequest("req-ec7-003", "EC7: Q3 の質問");

    const { rerender } = render(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec7", req1)}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec7", req2)}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("interview-undo"));
    await waitFor(() => {
      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("chip-opt-b"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    expect(screen.queryByTestId("free-text-input")).not.toBeInTheDocument();

    rerender(
      <ConversationalInterview
        workflowSnapshot={buildSnapshot("plan-ec7", req3)}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("single-select-chips")).not.toBeInTheDocument();
  });
});
