import { useEffect } from "react";

export interface FileContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAttach: () => void;
  onOpenPreview: () => void;
}

export function FileContextMenu({
  x,
  y,
  onClose,
  onAttach,
  onOpenPreview,
}: FileContextMenuProps): JSX.Element {
  useEffect(() => {
    const handleClick = (): void => {
      onClose();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div
      role="menu"
      aria-label="ファイル操作"
      data-testid="workspace-file-context-menu"
      className="fixed z-50 min-w-44 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-2 shadow-lg"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={onAttach}
        className="flex w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[var(--bg-tertiary)]"
      >
        背景情報に追加
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={onOpenPreview}
        className="flex w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[var(--bg-tertiary)]"
      >
        プレビューを開く
      </button>
    </div>
  );
}
