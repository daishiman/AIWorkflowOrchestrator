import React from "react";

type ProvenanceSource = "selection" | "recent" | "session";

interface TranscriptProvenanceChipProps {
  source: ProvenanceSource;
  label: string;
}

const sourceIcons: Record<ProvenanceSource, string> = {
  selection: "\u2702",
  recent: "\u25B6",
  session: "\uD83D\uDCCB",
};

export const TranscriptProvenanceChip: React.FC<
  TranscriptProvenanceChipProps
> = ({ source, label }) => {
  return (
    <span
      data-testid="workspace-transcript-chip"
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-0.5 text-xs text-[var(--text-primary)] opacity-70"
    >
      <span aria-hidden="true">{sourceIcons[source]}</span>
      {label}
    </span>
  );
};
