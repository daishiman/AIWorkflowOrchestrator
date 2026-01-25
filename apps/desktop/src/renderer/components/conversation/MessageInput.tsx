/**
 * MessageInput Component
 *
 * Molecule component for composing and sending messages.
 *
 * @module @repo/desktop/renderer/components/conversation/MessageInput
 */

import React, { useState, useCallback, useRef, useEffect, useId } from "react";

export interface MessageInputProps {
  onSend: (message: string) => void;
  onAttach?: () => void;
  onTyping?: () => void;
  onRemoveAttachment?: (index: number) => void;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  maxRows?: number;
  autoFocus?: boolean;
  attachments?: File[];
}

export function MessageInput({
  onSend,
  onAttach,
  onTyping,
  onRemoveAttachment,
  placeholder = "メッセージを入力",
  disabled = false,
  isSending = false,
  maxLength,
  autoResize = false,
  maxRows = 5,
  autoFocus = false,
  attachments = [],
}: MessageInputProps): React.ReactElement {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCountId = useId();

  const isDisabled = disabled || isSending;
  const trimmedValue = value.trim();
  const canSend = trimmedValue.length > 0 && !isDisabled;
  const showCharCount = maxLength && value.length > maxLength * 0.8;
  const isAtLimit = maxLength && value.length >= maxLength;

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto resize
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      const computedLineHeight = parseInt(
        getComputedStyle(textarea).lineHeight,
      );
      // Fallback to 20px line height when computed value is NaN (e.g., in JSDOM)
      const lineHeight = isNaN(computedLineHeight) ? 20 : computedLineHeight;
      const maxHeight = lineHeight * maxRows;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      textarea.style.maxHeight = `${maxHeight}px`;
    }
  }, [value, autoResize, maxRows]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = event.target.value;
      if (maxLength && newValue.length > maxLength) {
        newValue = newValue.slice(0, maxLength);
      }
      setValue(newValue);
      onTyping?.();
    },
    [maxLength, onTyping],
  );

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(trimmedValue);
    setValue("");
    // Refocus after send
    textareaRef.current?.focus();
  }, [canSend, trimmedValue, onSend]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleRemoveAttachment = useCallback(
    (index: number) => {
      onRemoveAttachment?.(index);
    },
    [onRemoveAttachment],
  );

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div
          data-testid="attachment-preview"
          className="mb-3 flex flex-wrap gap-2"
        >
          {attachments.map((file, index) => (
            <div
              key={index}
              className="relative flex items-center gap-2 rounded bg-gray-100 px-3 py-2"
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="max-w-[150px] truncate text-sm text-gray-700">
                {file.name}
              </span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  aria-label="削除"
                  className="ml-1 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach button */}
        {onAttach && (
          <button
            type="button"
            onClick={onAttach}
            disabled={isDisabled}
            aria-label="添付"
            className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
        )}

        {/* Text input */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            aria-label={placeholder}
            aria-describedby={showCharCount ? charCountId : undefined}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          {/* Character count */}
          {showCharCount && (
            <div
              id={charCountId}
              data-testid="character-count"
              className={`absolute bottom-2 right-14 text-xs ${
                isAtLimit ? "warning text-red-500" : "text-gray-400"
              }`}
            >
              {value.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="送信"
          className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSending ? (
            <span
              data-testid="sending-indicator"
              className="block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Sending status for screen readers */}
      {isSending && (
        <div role="status" className="sr-only">
          送信中...
        </div>
      )}
    </div>
  );
}
