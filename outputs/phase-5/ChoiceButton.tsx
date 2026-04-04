import React from "react";

export interface ChoiceButtonProps {
  label: string;
  isSelected: boolean;
  isFreeText?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  label,
  isSelected,
  isFreeText = false,
  onClick,
  disabled = false,
}) => {
  const baseClass =
    "w-full py-3 px-4 rounded-lg border-2 text-left transition-colors duration-150";

  const selectedClass = isSelected
    ? "bg-blue-500 text-white border-blue-600"
    : isFreeText
      ? "bg-white text-gray-700 border-dashed border-gray-400 hover:border-blue-400"
      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400";

  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type="button"
      className={`${baseClass} ${selectedClass} ${disabledClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
};
