import type { UsePanelResizeReturn } from "./hooks/usePanelResize";

export interface PanelResizeHandleProps {
  testId: string;
  label: string;
  resize: UsePanelResizeReturn;
}

export function PanelResizeHandle({
  testId,
  label,
  resize,
}: PanelResizeHandleProps): JSX.Element {
  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      tabIndex={0}
      data-testid={testId}
      className={[
        "relative w-2 shrink-0 cursor-col-resize rounded-full",
        resize.isDragging ? "bg-[var(--status-primary)]/30" : "bg-transparent",
      ].join(" ")}
      onMouseDown={resize.handleMouseDown}
      onDoubleClick={resize.handleDoubleClick}
      onKeyDown={resize.handleKeyDown}
    >
      <span className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-[var(--border-default)]" />
    </div>
  );
}
