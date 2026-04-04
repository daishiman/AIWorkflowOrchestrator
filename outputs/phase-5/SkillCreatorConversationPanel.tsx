import React, { useEffect, useReducer } from "react";
import type {
  InterviewUserAnswer,
  SkillCreatorUserInputRequest,
  SkillCreatorUserInputKind,
} from "@repo/shared/src/types/skillCreator";
import type {
  UserInputQuestion,
  UserInputAnswer,
} from "@repo/shared/types/skillCreatorSession";
import { QuestionCard } from "./QuestionCard";
import { ConversationProgress } from "./ConversationProgress";

const ESTIMATED_TOTAL = 10;

// --- 型マッピング ---

function mapQuestionToRequest(
  q: UserInputQuestion,
): SkillCreatorUserInputRequest {
  return {
    requestId: q.toolCallId,
    reason: "plan_review",
    title: q.question,
    prompt: "",
    kind: q.type as SkillCreatorUserInputKind,
    options: q.options?.map((o) => ({
      id: o.value,
      label: o.label,
      description: o.description,
    })),
    placeholder: q.placeholder,
    requestedAt: new Date().toISOString(),
  };
}

function mapAnswerToUserInputAnswer(
  answer: InterviewUserAnswer,
  toolCallId: string,
): UserInputAnswer {
  let value: string | string[] | boolean;

  if (answer.confirmed !== undefined) {
    value = answer.confirmed;
  } else if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
    value = answer.selectedOptionIds;
  } else if (answer.selectedOptionId) {
    value = answer.selectedOptionId;
  } else if (answer.secretValue) {
    value = answer.secretValue;
  } else {
    value = answer.textValue ?? "";
  }

  return { toolCallId, value };
}

// --- State ---

type State = {
  currentRequest: SkillCreatorUserInputRequest | null;
  currentToolCallId: string | null;
  questionIndex: number;
  isSubmitting: boolean;
  terminalState: "idle" | "complete" | "error";
  errorMessage: string | null;
};

type Action =
  | {
      type: "QUESTION_RECEIVED";
      payload: SkillCreatorUserInputRequest;
      toolCallId: string;
    }
  | { type: "ANSWER_SUBMITTING" }
  | { type: "ANSWER_SUBMITTED" }
  | { type: "SESSION_COMPLETE" }
  | { type: "SESSION_ERROR"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUESTION_RECEIVED":
      return {
        ...state,
        currentRequest: action.payload,
        currentToolCallId: action.toolCallId,
        questionIndex: state.questionIndex + 1,
        isSubmitting: false,
        terminalState: "idle",
        errorMessage: null,
      };
    case "ANSWER_SUBMITTING":
      return { ...state, isSubmitting: true };
    case "ANSWER_SUBMITTED":
      return { ...state, isSubmitting: false };
    case "SESSION_COMPLETE":
      return { ...state, terminalState: "complete", isSubmitting: false };
    case "SESSION_ERROR":
      return {
        ...state,
        terminalState: "error",
        errorMessage: action.message,
        isSubmitting: false,
      };
    default:
      return state;
  }
}

// --- Component ---

export interface SkillCreatorConversationPanelProps {
  onComplete?: () => void;
  onError?: (message: string) => void;
}

export const SkillCreatorConversationPanel: React.FC<
  SkillCreatorConversationPanelProps
> = ({ onComplete, onError }) => {
  const [state, dispatch] = useReducer(reducer, {
    currentRequest: null,
    currentToolCallId: null,
    questionIndex: 0,
    isSubmitting: false,
    terminalState: "idle",
    errorMessage: null,
  });

  useEffect(() => {
    const api = window.skillCreatorSessionAPI;

    const unsubQuestion = api.onQuestion((question: UserInputQuestion) => {
      const mapped = mapQuestionToRequest(question);
      dispatch({
        type: "QUESTION_RECEIVED",
        payload: mapped,
        toolCallId: question.toolCallId,
      });
    });

    const unsubComplete = api.onComplete(() => {
      dispatch({ type: "SESSION_COMPLETE" });
    });

    const unsubError = api.onError((event) => {
      const message = event.error ?? "セッションでエラーが発生しました";
      dispatch({ type: "SESSION_ERROR", message });
      onError?.(message);
    });

    return () => {
      unsubQuestion();
      unsubComplete();
      unsubError();
    };
  }, [onError]);

  useEffect(() => {
    if (state.terminalState === "complete") {
      onComplete?.();
    }
  }, [onComplete, state.terminalState]);

  const handleAnswer = async (answer: InterviewUserAnswer) => {
    if (!state.currentRequest || !state.currentToolCallId) {
      return;
    }
    dispatch({ type: "ANSWER_SUBMITTING" });

    try {
      const submission = mapAnswerToUserInputAnswer(
        answer,
        state.currentToolCallId,
      );
      await window.skillCreatorSessionAPI.sendAnswer(submission);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "送信に失敗しました";
      dispatch({ type: "SESSION_ERROR", message });
      onError?.(message);
    } finally {
      dispatch({ type: "ANSWER_SUBMITTED" });
    }
  };

  if (state.terminalState === "error") {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {state.errorMessage ?? "セッションでエラーが発生しました"}
        </div>
      </div>
    );
  }

  if (state.terminalState === "complete") {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-700">
          インタビューが完了しました
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <ConversationProgress
        current={state.questionIndex}
        estimatedTotal={ESTIMATED_TOTAL}
      />
      {state.currentRequest ? (
        <QuestionCard
          key={state.questionIndex}
          request={state.currentRequest}
          onAnswer={handleAnswer}
          isSubmitting={state.isSubmitting}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-500">
          質問を待機中...
        </div>
      )}
    </div>
  );
};
