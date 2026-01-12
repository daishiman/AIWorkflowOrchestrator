/**
 * AgentMessageInput - エージェント実行用メッセージ入力コンポーネント
 * @module AgentMessageInput
 */
import { type KeyboardEvent, type ChangeEvent, useCallback } from "react";

/**
 * AgentMessageInputのプロパティ
 */
export interface AgentMessageInputProps {
  /** 入力値 */
  value: string;
  /** 値変更ハンドラ */
  onChange: (value: string) => void;
  /** 送信ハンドラ */
  onSubmit: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** プレースホルダー */
  placeholder?: string;
}

/**
 * メッセージ入力コンポーネント
 *
 * - テキスト入力フィールドと送信ボタンを提供
 * - Enterキーで送信、Shift+Enterで改行
 * - 空メッセージの送信を防止
 */
export const AgentMessageInput: React.FC<AgentMessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "メッセージを入力...",
}) => {
  /**
   * 入力変更ハンドラ
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  /**
   * キーダウンハンドラ
   * Enterで送信、Shift+Enterは改行
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim()) {
          onSubmit();
          onChange("");
        }
      }
    },
    [value, onSubmit, onChange],
  );

  /**
   * 送信ボタンクリックハンドラ
   */
  const handleSendClick = useCallback(() => {
    if (value.trim()) {
      onSubmit();
      onChange("");
    }
  }, [value, onSubmit, onChange]);

  return (
    <div className="flex items-end gap-2 p-3 border-t border-gray-700 bg-gray-800">
      <textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="メッセージ入力"
        className="flex-1 resize-none rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        rows={1}
      />
      <button
        type="button"
        onClick={handleSendClick}
        disabled={disabled || !value.trim()}
        aria-label="送信"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        送信
      </button>
    </div>
  );
};
