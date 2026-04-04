import React, { useState } from "react";

export interface FreeTextInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  isVisible: boolean;
  isSecret?: boolean;
  disabled?: boolean;
}

export const FreeTextInput: React.FC<FreeTextInputProps> = ({
  placeholder = "自由に入力してください...",
  onSubmit,
  isVisible,
  isSecret = false,
  disabled = false,
}) => {
  const [value, setValue] = useState("");

  if (!isVisible) {
    return null;
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setValue("");
      }
    }
  };

  const inputClass =
    "w-full p-3 border-2 rounded-lg resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none border-gray-300 mt-2";

  if (isSecret) {
    return (
      <input
        type="password"
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
    );
  }

  return (
    <textarea
      className={inputClass}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      rows={3}
    />
  );
};
