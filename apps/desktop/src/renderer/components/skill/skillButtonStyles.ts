export const buttonStyles = {
  primary:
    "rounded-md bg-[var(--status-primary)] px-3 py-1 text-sm text-[var(--text-inverse)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
  secondary:
    "rounded-md border border-[var(--border-primary)] px-3 py-1 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
  danger:
    "rounded-md px-3 py-1 text-sm text-[var(--status-error)] hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-error)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
  dangerConfirm:
    "rounded-md bg-[var(--status-error)] px-3 py-1 text-sm text-[var(--text-inverse)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-error)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
} as const;
