import type { WorkspaceMentionCandidate } from "./hooks/useWorkspaceMentionQuery";

interface WorkspaceMentionDropdownProps {
  options: WorkspaceMentionCandidate[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPreview: (index: number) => void;
  onHover: (index: number) => void;
}

export function WorkspaceMentionDropdown({
  options,
  activeIndex,
  onSelect,
  onPreview,
  onHover,
}: WorkspaceMentionDropdownProps): JSX.Element {
  return (
    <div
      role="listbox"
      aria-label="ファイル候補"
      className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-20 max-h-56 overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 shadow-lg"
      data-testid="workspace-mention-dropdown"
    >
      {options.map((option, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={option.path}
            role="option"
            aria-selected={isActive}
            className={`group mb-1 flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
              isActive
                ? "bg-[var(--bg-tertiary)] text-[var(--status-primary)]"
                : "text-[var(--text-primary)]"
            }`}
            data-testid={`workspace-mention-option-${index}`}
            onMouseEnter={() => onHover(index)}
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(index)}
            >
              <span className="truncate font-medium">{option.name}</span>
              <span className="mt-1 block truncate text-xs opacity-70">
                {option.path}
              </span>
            </button>
            <button
              type="button"
              className="ml-3 rounded-full border border-[var(--border-subtle)] px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPreview(index)}
            >
              プレビュー
            </button>
          </div>
        );
      })}
    </div>
  );
}
