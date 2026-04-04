import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterviewState } from "../hooks/useInterviewState";
import type { SkillCreatorUserInputRequest } from "@repo/shared/types/skillCreator";

function buildRequest(
  overrides?: Partial<SkillCreatorUserInputRequest>,
): SkillCreatorUserInputRequest {
  return {
    requestId: "req-1",
    reason: "plan_review",
    title: "テスト",
    prompt: "テスト質問",
    kind: "single_select",
    options: [{ id: "a", label: "A" }],
    requestedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("useInterviewState", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useInterviewState());

    expect(result.current.messages).toEqual([]);
    expect(result.current.proficiency).toBe("beginner");
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);
  });

  it("initializes with custom proficiency", () => {
    const { result } = renderHook(() => useInterviewState("engineer"));
    expect(result.current.proficiency).toBe("engineer");
  });

  it("adds assistant message", () => {
    const { result } = renderHook(() => useInterviewState());
    const request = buildRequest();

    act(() => {
      result.current.addAssistantMessage(request);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    expect(result.current.messages[0].inputRequest).toBe(request);
  });

  it("does not duplicate assistant messages with same requestId", () => {
    const { result } = renderHook(() => useInterviewState());
    const request = buildRequest();

    act(() => {
      result.current.addAssistantMessage(request);
      result.current.addAssistantMessage(request);
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it("adds user message and increments step", () => {
    const { result } = renderHook(() => useInterviewState());

    act(() => {
      result.current.addAssistantMessage(buildRequest());
    });

    act(() => {
      result.current.addUserMessage(
        { kind: "single_select", selectedOptionId: "a" },
        "A",
      );
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe("user");
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.canUndo).toBe(true);
  });

  it("undo removes last user and restores assistant question", () => {
    const { result } = renderHook(() => useInterviewState());
    const request = buildRequest();

    act(() => {
      result.current.addAssistantMessage(request);
      result.current.addUserMessage(
        { kind: "single_select", selectedOptionId: "a" },
        "A",
      );
    });

    let restored:
      | {
          restoredRequest: SkillCreatorUserInputRequest | null;
          restoredAnswer: {
            kind: "single_select";
            selectedOptionId: string;
          } | null;
        }
      | undefined;
    act(() => {
      restored = result.current.undo();
    });

    expect(restored).toEqual({
      restoredRequest: request,
      restoredAnswer: { kind: "single_select", selectedOptionId: "a" },
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.canUndo).toBe(false);
  });

  it("undo returns null when no messages to undo", () => {
    const { result } = renderHook(() => useInterviewState());

    let restored:
      | {
          restoredRequest: SkillCreatorUserInputRequest | null;
          restoredAnswer: unknown;
        }
      | undefined;
    act(() => {
      restored = result.current.undo();
    });

    expect(restored).toEqual({
      restoredRequest: null,
      restoredAnswer: null,
    });
  });

  it("sets proficiency", () => {
    const { result } = renderHook(() => useInterviewState());

    act(() => {
      result.current.setProficiency("engineer");
    });

    expect(result.current.proficiency).toBe("engineer");
  });

  it("builds submission for single_select", () => {
    const { result } = renderHook(() => useInterviewState());

    const snapshot = {
      planId: "plan-1",
      currentPhase: "review" as const,
      awaitingUserInput: buildRequest(),
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1" as const,
        planId: "plan-1",
        currentPhase: "review" as const,
        artifactCount: 0,
        updatedAt: new Date().toISOString(),
      },
    };

    const submission = result.current.buildSubmission(snapshot, {
      kind: "single_select",
      selectedOptionId: "a",
    });

    expect(submission).toEqual({
      planId: "plan-1",
      requestId: "req-1",
      selectedOptionId: "a",
    });
  });

  it("builds submission for multi_select", () => {
    const { result } = renderHook(() => useInterviewState());

    const snapshot = {
      planId: "plan-1",
      currentPhase: "review" as const,
      awaitingUserInput: buildRequest({
        requestId: "req-multi",
        kind: "multi_select",
      }),
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1" as const,
        planId: "plan-1",
        currentPhase: "review" as const,
        artifactCount: 0,
        updatedAt: new Date().toISOString(),
      },
    };

    const submission = result.current.buildSubmission(snapshot, {
      kind: "multi_select",
      selectedOptionIds: ["a", "b"],
    });

    expect(submission).toEqual({
      planId: "plan-1",
      requestId: "req-multi",
      selectedOptionIds: ["a", "b"],
      selectedValues: ["a", "b"],
    });
  });

  it("rolls back last user message", () => {
    const { result } = renderHook(() => useInterviewState());

    act(() => {
      result.current.addAssistantMessage(buildRequest());
      result.current.addUserMessage(
        { kind: "single_select", selectedOptionId: "a" },
        "A",
      );
    });

    act(() => {
      result.current.rollbackLastUserMessage();
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    expect(result.current.canUndo).toBe(false);
  });

  it("resets state", () => {
    const { result } = renderHook(() => useInterviewState());

    act(() => {
      result.current.addAssistantMessage(buildRequest());
      result.current.addUserMessage(
        { kind: "single_select", selectedOptionId: "a" },
        "A",
      );
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.currentStepIndex).toBe(0);
  });
});
