import clsx from "clsx";

interface TimelineGroupHeaderProps {
  label: string;
}

export function TimelineGroupHeader({ label }: TimelineGroupHeaderProps) {
  return (
    <div
      className={clsx(
        "sticky top-0 z-10 -mx-1 flex items-center gap-3 px-1 py-3",
        "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg-primary)_96%,white_4%),color-mix(in_srgb,var(--bg-primary)_82%,transparent))] backdrop-blur",
      )}
    >
      <span className="text-xs font-semibold tracking-[0.18em] text-[var(--text-secondary)] uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--border-primary)]" />
    </div>
  );
}
