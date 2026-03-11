interface WorkspaceSuggestionBubblesProps {
  suggestions: readonly string[];
  onSelect: (text: string) => void;
}

export function WorkspaceSuggestionBubbles({
  suggestions,
  onSelect,
}: WorkspaceSuggestionBubblesProps): JSX.Element {
  return (
    <div
      className="flex flex-wrap gap-2"
      data-testid="workspace-chat-suggestions"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion}
          type="button"
          className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2 text-left text-sm text-[var(--text-primary)] shadow-sm transition hover:border-[var(--status-primary)] hover:text-[var(--status-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)]"
          onClick={() => onSelect(suggestion)}
          data-testid={`workspace-suggestion-${index + 1}`}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
