import { useState, useCallback, useMemo } from "react";

function findLastIdx<T>(arr: T[], pred: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (pred(arr[i])) return i;
  }
  return -1;
}
import type {
  SkillCreatorUserInputRequest,
  SkillCreatorUserInputSubmission,
  SkillCreatorWorkflowUiSnapshot,
  InterviewMessage,
  InterviewUserAnswer,
  InterviewProficiency,
} from "@repo/shared/types/skillCreator";

export interface UseInterviewStateReturn {
  messages: InterviewMessage[];
  proficiency: InterviewProficiency;
  currentStepIndex: number;
  totalSteps: number;
  canUndo: boolean;
  setProficiency: (p: InterviewProficiency) => void;
  addAssistantMessage: (request: SkillCreatorUserInputRequest) => void;
  addUserMessage: (answer: InterviewUserAnswer, displayText: string) => void;
  rollbackLastUserMessage: () => void;
  undo: () => {
    restoredRequest: SkillCreatorUserInputRequest | null;
    restoredAnswer: InterviewUserAnswer | null;
  };
  buildSubmission: (
    snapshot: SkillCreatorWorkflowUiSnapshot,
    answer: InterviewUserAnswer,
  ) => SkillCreatorUserInputSubmission | null;
  reset: () => void;
}

export function useInterviewState(
  initialProficiency: InterviewProficiency = "beginner",
): UseInterviewStateReturn {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [proficiency, setProficiency] =
    useState<InterviewProficiency>(initialProficiency);
  const [totalSteps, setTotalSteps] = useState(0);

  const currentStepIndex = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages],
  );

  const canUndo = currentStepIndex > 0;

  const addAssistantMessage = useCallback(
    (request: SkillCreatorUserInputRequest) => {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) =>
            m.role === "assistant" &&
            m.inputRequest?.requestId === request.requestId,
        );
        if (alreadyExists) return prev;

        return [
          ...prev,
          {
            id: `assistant-${request.requestId}`,
            role: "assistant" as const,
            kind: request.kind,
            content: request.prompt,
            inputRequest: request,
            timestamp: new Date().toISOString(),
          },
        ];
      });
      setTotalSteps((prev) => Math.max(prev, currentStepIndex + 1));
    },
    [currentStepIndex],
  );

  const addUserMessage = useCallback(
    (answer: InterviewUserAnswer, displayText: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user" as const,
          kind: answer.kind,
          content: displayText,
          userAnswer: answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    [],
  );

  const rollbackLastUserMessage = useCallback(() => {
    setMessages((prev) => {
      const lastUserIdx = findLastIdx(prev, (m) => m.role === "user");
      if (lastUserIdx === -1) {
        return prev;
      }
      return prev.filter((_, index) => index !== lastUserIdx);
    });
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) {
      return {
        restoredRequest: null,
        restoredAnswer: null,
      };
    }

    const lastUserIdx = findLastIdx(messages, (m) => m.role === "user");
    if (lastUserIdx === -1) {
      return {
        restoredRequest: null,
        restoredAnswer: null,
      };
    }

    const lastAssistantIdx = findLastIdx(
      messages.slice(0, lastUserIdx),
      (m) => m.role === "assistant",
    );
    if (lastAssistantIdx === -1) {
      return {
        restoredRequest: null,
        restoredAnswer: null,
      };
    }

    const restoredRequest = messages[lastAssistantIdx].inputRequest ?? null;
    const restoredAnswer = messages[lastUserIdx].userAnswer ?? null;
    setMessages(messages.slice(0, lastUserIdx));

    return { restoredRequest, restoredAnswer };
  }, [canUndo, messages]);

  const buildSubmission = useCallback(
    (
      snapshot: SkillCreatorWorkflowUiSnapshot,
      answer: InterviewUserAnswer,
    ): SkillCreatorUserInputSubmission | null => {
      const request = snapshot.awaitingUserInput;
      if (!request) return null;

      const submission: SkillCreatorUserInputSubmission = {
        planId: snapshot.planId,
        requestId: request.requestId,
      };

      switch (answer.kind) {
        case "single_select":
          submission.selectedOptionId = answer.selectedOptionId;
          break;
        case "multi_select":
          submission.selectedOptionIds =
            answer.selectedOptionIds ?? answer.selectedValues;
          submission.selectedValues =
            answer.selectedValues ?? answer.selectedOptionIds;
          break;
        case "free_text":
          submission.textValue = answer.textValue;
          break;
        case "secret":
          submission.secretValue = answer.secretValue;
          break;
        case "confirm":
          submission.confirmed = answer.confirmed;
          break;
      }

      return submission;
    },
    [],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setTotalSteps(0);
  }, []);

  return {
    messages,
    proficiency,
    currentStepIndex,
    totalSteps,
    canUndo,
    setProficiency,
    addAssistantMessage,
    addUserMessage,
    rollbackLastUserMessage,
    undo,
    buildSubmission,
    reset,
  };
}
