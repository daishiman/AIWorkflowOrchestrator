import { useState, useCallback, useRef, useEffect } from "react";

export interface SecretInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SecretInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
}: SecretInputProps) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (value.trim()) {
          onSubmit();
        }
      }
    },
    [onSubmit, value],
  );

  return (
    <div className="mt-3" data-testid="secret-input">
      <div className="relative">
        <input
          ref={inputRef}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "秘密の値を入力..."}
          disabled={disabled}
          className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--status-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="secret-input-field"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label={visible ? "入力を隠す" : "入力を表示"}
          data-testid="secret-toggle"
        >
          {visible ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
