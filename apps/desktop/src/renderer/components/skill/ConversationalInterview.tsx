import { useState, useCallback, useRef, useEffect } from "react";
import type {
  SkillCreatorUserInputRequest,
  SkillCreatorUserInputSubmission,
  SkillCreatorUserInputOption,
  SkillCreatorWorkflowUiSnapshot,
  InterviewUserAnswer,
} from "@repo/shared/types/skillCreator";
import { useInterviewState } from "./hooks/useInterviewState";
import { InterviewProgressBar } from "./InterviewProgressBar";
import {
  SingleSelectChips,
  MultiSelectCheckbox,
  FreeTextInput,
  ConfirmButtons,
  SecretInput,
} from "./interview-widgets";

export interface ConversationalInterviewProps {
  workflowSnapshot: SkillCreatorWorkflowUiSnapshot | null;
  onSubmit: (submission: SkillCreatorUserInputSubmission) => Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function ConversationalInterview({
  workflowSnapshot,
  onSubmit,
  onError,
  disabled,
}: ConversationalInterviewProps) {
  const interview = useInterviewState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [restoredPendingRequest, setRestoredPendingRequest] =
    useState<SkillCreatorUserInputRequest | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // restoredPendingRequest はセッション復元または Undo 操作時のみ非 null になる。
  // 通常フローでは workflowSnapshot?.awaitingUserInput を使用する。
  // 復元セッション中は restoredPendingRequest を優先し、
  // workflowSnapshot の awaitingUserInput が届いた時点でクリアして通常フローに戻る。
  const pendingRequest =
    restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;

  // 新しい質問が来たらアシスタントメッセージを追加
  useEffect(() => {
    if (pendingRequest) {
      interview.addAssistantMessage(pendingRequest);
      resetInputValues();
    }
  }, [pendingRequest?.requestId]);

  // 復元済みリクエストのクリア条件:
  // workflowSnapshot.awaitingUserInput が届いたら restoredPendingRequest を null にし、
  // 通常フローへ切り替える。requestId を依存値にすることで同一質問での再実行を防ぐ。
  // RALLY-010 以降はこのクリア後の通常フロー状態を前提として動作する。
  useEffect(() => {
    if (workflowSnapshot?.awaitingUserInput) {
      setRestoredPendingRequest(null);
    }
  }, [workflowSnapshot?.awaitingUserInput?.requestId]);

  // 自動スクロール
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [interview.messages.length]);

  const resetInputValues = () => {
    setSelectedOptionId(null);
    setSelectedOptionIds([]);
    setTextAnswer("");
    setSecretAnswer("");
    setConfirmAnswer(null);
    setValidationError(null);
  };

  const restoreAnswerInputs = useCallback(
    (answer: InterviewUserAnswer | null) => {
      resetInputValues();
      if (!answer) {
        return;
      }

      switch (answer.kind) {
        case "single_select":
          setSelectedOptionId(answer.selectedOptionId ?? null);
          break;
        case "multi_select":
          setSelectedOptionIds(
            answer.selectedOptionIds ?? answer.selectedValues ?? [],
          );
          break;
        case "free_text":
          setTextAnswer(answer.textValue ?? "");
          break;
        case "secret":
          setSecretAnswer(answer.secretValue ?? "");
          break;
        case "confirm":
          setConfirmAnswer(answer.confirmed ?? null);
          break;
      }
    },
    [],
  );

  const handleToggleMultiSelect = useCallback((id: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const validateAndBuildAnswer = useCallback((): InterviewUserAnswer | null => {
    if (!pendingRequest) return null;

    switch (pendingRequest.kind) {
      case "single_select":
        if (!selectedOptionId) {
          setValidationError("選択肢を1つ選んでください");
          return null;
        }
        return { kind: "single_select", selectedOptionId };

      case "multi_select":
        if (selectedOptionIds.length === 0) {
          setValidationError("少なくとも1つ選択してください");
          return null;
        }
        return {
          kind: "multi_select",
          selectedOptionIds,
          selectedValues: selectedOptionIds,
        };

      case "free_text":
        if (!textAnswer.trim()) {
          setValidationError("テキストを入力してください");
          return null;
        }
        return { kind: "free_text", textValue: textAnswer.trim() };

      case "secret":
        if (!secretAnswer.trim()) {
          setValidationError("値を入力してください");
          return null;
        }
        return { kind: "secret", secretValue: secretAnswer };

      case "confirm":
        if (confirmAnswer === null) {
          setValidationError("選択してください");
          return null;
        }
        return { kind: "confirm", confirmed: confirmAnswer };

      default:
        return null;
    }
  }, [
    pendingRequest,
    selectedOptionId,
    selectedOptionIds,
    textAnswer,
    secretAnswer,
    confirmAnswer,
  ]);

  const getDisplayText = useCallback(
    (answer: InterviewUserAnswer): string => {
      switch (answer.kind) {
        case "single_select": {
          const option = pendingRequest?.options?.find(
            (o: SkillCreatorUserInputOption) =>
              o.id === answer.selectedOptionId,
          );
          return option?.label ?? answer.selectedOptionId ?? "";
        }
        case "multi_select": {
          const labels =
            answer.selectedOptionIds
              ?.map(
                (id: string) =>
                  pendingRequest?.options?.find(
                    (o: SkillCreatorUserInputOption) => o.id === id,
                  )?.label ?? id,
              )
              .join(", ") ?? "";
          return labels;
        }
        case "free_text":
          return answer.textValue ?? "";
        case "secret":
          return "●●●●●●";
        case "confirm":
          return answer.confirmed ? "はい" : "いいえ";
        default:
          return "";
      }
    },
    [pendingRequest],
  );

  const submitAnswer = useCallback(
    async (answer: InterviewUserAnswer, displayText: string) => {
      if (!workflowSnapshot || !pendingRequest) return;

      setIsSubmitting(true);
      interview.addUserMessage(answer, displayText);

      // Undo 復元中の再送信でも、表示中の質問 requestId に紐づく submission を作る。
      const submission = interview.buildSubmission(
        {
          ...workflowSnapshot,
          awaitingUserInput: pendingRequest,
        },
        answer,
      );
      if (!submission) {
        interview.rollbackLastUserMessage();
        onError?.("回答の構築に失敗しました");
        setIsSubmitting(false);
        return;
      }

      try {
        await onSubmit(submission);
        resetInputValues();
      } catch {
        interview.rollbackLastUserMessage();
        onError?.("回答の送信に失敗しました");
      } finally {
        setIsSubmitting(false);
      }
    },
    [workflowSnapshot, pendingRequest, interview, onSubmit, onError],
  );

  const handleSubmit = useCallback(async () => {
    if (!workflowSnapshot || !pendingRequest || isSubmitting) return;

    const answer = validateAndBuildAnswer();
    if (!answer) return;

    setValidationError(null);
    await submitAnswer(answer, getDisplayText(answer));
  }, [
    workflowSnapshot,
    pendingRequest,
    isSubmitting,
    validateAndBuildAnswer,
    getDisplayText,
    submitAnswer,
  ]);

  const handleUndo = useCallback(() => {
    const { restoredRequest, restoredAnswer } = interview.undo();
    if (restoredRequest) {
      setRestoredPendingRequest(restoredRequest);
      restoreAnswerInputs(restoredAnswer);
    }
  }, [interview, restoreAnswerInputs]);

  const handleConfirmAndSubmit = useCallback(
    async (value: boolean) => {
      if (!workflowSnapshot || !pendingRequest || isSubmitting) return;

      setConfirmAnswer(value);
      await submitAnswer(
        { kind: "confirm", confirmed: value },
        value ? "はい" : "いいえ",
      );
    },
    [workflowSnapshot, pendingRequest, isSubmitting, submitAnswer],
  );

  if (!workflowSnapshot) {
    return null;
  }

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]"
      data-testid="conversational-interview"
    >
      {/* Header: Progress + Proficiency */}
      <div className="border-b border-[var(--border-primary)] px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <InterviewProgressBar
              current={interview.currentStepIndex}
              total={interview.totalSteps}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => interview.setProficiency("beginner")}
              className={`rounded-l-md px-2.5 py-1 text-xs transition-colors ${
                interview.proficiency === "beginner"
                  ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              data-testid="proficiency-beginner"
            >
              初心者
            </button>
            <button
              type="button"
              onClick={() => interview.setProficiency("engineer")}
              className={`rounded-r-md px-2.5 py-1 text-xs transition-colors ${
                interview.proficiency === "engineer"
                  ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              data-testid="proficiency-engineer"
            >
              エンジニア
            </button>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4"
        role="log"
        aria-live="polite"
        data-testid="interview-chat-area"
      >
        <div className="space-y-4">
          {interview.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`message-${msg.id}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
                    : "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)]"
                }`}
              >
                {msg.role === "assistant" && msg.inputRequest?.title ? (
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                    {msg.inputRequest.title}
                  </p>
                ) : null}
                <p className="leading-relaxed">{msg.content}</p>
                {msg.role === "assistant" &&
                interview.proficiency === "beginner" &&
                msg.inputRequest?.placeholder ? (
                  <p className="mt-2 text-xs text-[var(--text-secondary)] italic">
                    {msg.inputRequest.placeholder}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input area */}
      {pendingRequest ? (
        <div
          className="border-t border-[var(--border-primary)] px-5 py-4"
          data-testid="interview-input-area"
        >
          {renderInputWidget(
            pendingRequest,
            {
              selectedOptionId,
              selectedOptionIds,
              textAnswer,
              secretAnswer,
              confirmAnswer,
              disabled: disabled || isSubmitting,
            },
            {
              onSelectOption: setSelectedOptionId,
              onToggleMultiSelect: handleToggleMultiSelect,
              onTextChange: setTextAnswer,
              onSecretChange: setSecretAnswer,
              onConfirm: handleConfirmAndSubmit,
              onSubmitText: handleSubmit,
            },
          )}

          {validationError ? (
            <p
              className="mt-2 text-xs text-[var(--status-error)]"
              role="alert"
              data-testid="validation-error"
            >
              {validationError}
            </p>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!interview.canUndo || isSubmitting}
              className="rounded-md px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
              data-testid="interview-undo"
            >
              ← 戻る
            </button>

            {pendingRequest.kind !== "confirm" ? (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={disabled || isSubmitting}
                className="rounded-xl bg-[var(--status-primary)] px-5 py-2 text-sm font-medium text-[var(--text-inverse)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="interview-submit"
              >
                {isSubmitting ? "送信中..." : "送信"}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className="border-t border-[var(--border-primary)] px-5 py-4 text-center text-sm text-[var(--text-secondary)]"
          data-testid="interview-waiting"
        >
          質問を待っています...
        </div>
      )}
    </div>
  );
}

function renderInputWidget(
  request: SkillCreatorUserInputRequest,
  state: {
    selectedOptionId: string | null;
    selectedOptionIds: string[];
    textAnswer: string;
    secretAnswer: string;
    confirmAnswer: boolean | null;
    disabled: boolean;
  },
  handlers: {
    onSelectOption: (id: string) => void;
    onToggleMultiSelect: (id: string) => void;
    onTextChange: (value: string) => void;
    onSecretChange: (value: string) => void;
    onConfirm: (value: boolean) => Promise<void>;
    onSubmitText: () => void;
  },
) {
  switch (request.kind) {
    case "single_select":
      return (
        <SingleSelectChips
          options={request.options ?? []}
          selectedId={state.selectedOptionId}
          onSelect={handlers.onSelectOption}
          disabled={state.disabled}
        />
      );

    case "multi_select":
      return (
        <MultiSelectCheckbox
          options={request.options ?? []}
          selectedIds={state.selectedOptionIds}
          onToggle={handlers.onToggleMultiSelect}
          disabled={state.disabled}
        />
      );

    case "free_text":
      return (
        <FreeTextInput
          value={state.textAnswer}
          onChange={handlers.onTextChange}
          onSubmit={handlers.onSubmitText}
          placeholder={request.placeholder}
          disabled={state.disabled}
        />
      );

    case "secret":
      return (
        <SecretInput
          value={state.secretAnswer}
          onChange={handlers.onSecretChange}
          onSubmit={handlers.onSubmitText}
          placeholder={request.placeholder}
          disabled={state.disabled}
        />
      );

    case "confirm":
      return (
        <ConfirmButtons
          onConfirm={(v) => void handlers.onConfirm(v)}
          selected={state.confirmAnswer}
          disabled={state.disabled}
        />
      );

    default:
      return null;
  }
}
