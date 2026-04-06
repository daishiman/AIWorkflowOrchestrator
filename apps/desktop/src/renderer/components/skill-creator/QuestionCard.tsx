import React, { useState } from "react";
import type {
  InterviewUserAnswer,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";
import { ChoiceButton } from "./ChoiceButton";
import { FreeTextInput } from "./FreeTextInput";

const FREE_TEXT_LABEL = "その他（自由入力）";
const FREE_TEXT_ID = "__free_text__";

export interface QuestionCardProps {
  request: SkillCreatorUserInputRequest;
  onAnswer: (answer: InterviewUserAnswer) => void;
  isSubmitting?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  request,
  onAnswer,
  isSubmitting = false,
}) => {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isFreeTextVisible, setIsFreeTextVisible] = useState(false);

  const optionsWithFreeText = [
    ...(request.options ?? []),
    { id: FREE_TEXT_ID, label: FREE_TEXT_LABEL },
  ];

  const handleSingleSelectClick = (optionId: string) => {
    if (optionId === FREE_TEXT_ID) {
      setSelectedOptionIds([]);
      setIsFreeTextVisible(true);
      return;
    }
    setIsFreeTextVisible(false);
    onAnswer({ kind: "single_select", selectedOptionId: optionId });
  };

  const handleMultiSelectClick = (optionId: string) => {
    if (optionId === FREE_TEXT_ID) {
      setSelectedOptionIds([]);
      setIsFreeTextVisible(true);
      return;
    }
    setIsFreeTextVisible(false);
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  };

  const cardClass = "rounded-lg shadow-md p-6 bg-white";

  const renderHeader = () => (
    <>
      <p className="mb-2 text-lg font-medium text-gray-800">{request.title}</p>
      {request.prompt && (
        <p className="mb-4 text-sm text-gray-500">{request.prompt}</p>
      )}
      {request.reason && (
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
          {request.reason}
        </p>
      )}
    </>
  );

  switch (request.kind) {
    case "free_text":
      return (
        <div className={cardClass}>
          {renderHeader()}
          <FreeTextInput
            onSubmit={(text) =>
              onAnswer({ kind: "free_text", textValue: text })
            }
            isVisible={true}
            placeholder={request.placeholder}
            disabled={isSubmitting}
          />
        </div>
      );

    case "secret":
      return (
        <div className={cardClass}>
          {renderHeader()}
          <FreeTextInput
            onSubmit={(text) => onAnswer({ kind: "secret", secretValue: text })}
            isVisible={true}
            isSecret={true}
            placeholder={
              request.placeholder ?? "シークレット値を入力してください..."
            }
            disabled={isSubmitting}
          />
        </div>
      );

    case "confirm":
      return (
        <div className={cardClass}>
          {renderHeader()}
          <div className="flex gap-3">
            <ChoiceButton
              label="はい"
              isSelected={false}
              onClick={() => onAnswer({ kind: "confirm", confirmed: true })}
              disabled={isSubmitting}
            />
            <ChoiceButton
              label="いいえ"
              isSelected={false}
              onClick={() => onAnswer({ kind: "confirm", confirmed: false })}
              disabled={isSubmitting}
            />
          </div>
        </div>
      );

    case "multi_select":
      return (
        <div className={cardClass}>
          {renderHeader()}
          <div className="flex flex-col gap-2">
            {optionsWithFreeText.map((option) => (
              <ChoiceButton
                key={option.id}
                label={option.label}
                isSelected={selectedOptionIds.includes(option.id)}
                isFreeText={option.id === FREE_TEXT_ID}
                onClick={() => handleMultiSelectClick(option.id)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          <FreeTextInput
            onSubmit={(text) =>
              onAnswer({ kind: "multi_select", selectedValues: [text] })
            }
            isVisible={isFreeTextVisible}
            placeholder={request.placeholder}
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() =>
              onAnswer({
                kind: "multi_select",
                selectedOptionIds: selectedOptionIds,
                selectedValues: selectedOptionIds,
              })
            }
            disabled={isSubmitting || selectedOptionIds.length === 0}
          >
            送信
          </button>
        </div>
      );

    // single_select（デフォルト）
    default:
      return (
        <div className={cardClass}>
          {renderHeader()}
          <div className="flex flex-col gap-2">
            {optionsWithFreeText.map((option) => (
              <ChoiceButton
                key={option.id}
                label={option.label}
                isSelected={false}
                isFreeText={option.id === FREE_TEXT_ID}
                onClick={() => handleSingleSelectClick(option.id)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          <FreeTextInput
            onSubmit={(text) =>
              onAnswer({ kind: "free_text", textValue: text })
            }
            isVisible={isFreeTextVisible}
            disabled={isSubmitting}
          />
        </div>
      );
  }
};
