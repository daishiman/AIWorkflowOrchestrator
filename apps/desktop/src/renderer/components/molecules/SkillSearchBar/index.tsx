import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

export interface SkillSearchBarProps {
  /** 検索値 */
  value: string;
  /** 値変更ハンドラ */
  onChange: (value: string) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** カスタムクラス */
  className?: string;
}

/**
 * スキル検索バーコンポーネント
 * デバウンス付きの検索入力フィールド
 */
export const SkillSearchBar: React.FC<SkillSearchBarProps> = ({
  value,
  onChange,
  placeholder = "スキルを検索...",
  className = "",
}) => {
  const [localValue, setLocalValue] = useState(value);

  // デバウンス 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  // 外部からの値変更に対応
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && localValue) {
        e.preventDefault();
        handleClear();
      }
    },
    [localValue, handleClear],
  );

  return (
    <div
      className={`relative bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 ${className}`}
    >
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
        aria-label="検索"
      />
      <input
        type="search"
        role="searchbox"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="スキルを検索"
        className="w-full pl-10 pr-10 py-2 bg-transparent text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="クリア"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-700/50 transition-colors"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>
      )}
    </div>
  );
};

SkillSearchBar.displayName = "SkillSearchBar";
