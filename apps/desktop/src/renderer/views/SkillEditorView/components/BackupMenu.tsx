import React from "react";
import { History, RotateCcw } from "lucide-react";

export interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}

export interface BackupMenuProps {
  backups: BackupInfo[];
  isLoading: boolean;
  onRestore: (backupPath: string) => void;
}

const formatDate = (date: Date): string => {
  const d = new Date(date);
  return d.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const BackupMenu: React.FC<BackupMenuProps> = ({
  backups,
  isLoading,
  onRestore,
}) => {
  if (isLoading) {
    return (
      <div
        className="p-4 text-sm text-[var(--text-secondary)]"
        data-testid="backup-loading"
      >
        読み込み中...
      </div>
    );
  }

  if (backups.length === 0) {
    return (
      <div
        className="p-4 text-sm text-[var(--text-secondary)]"
        data-testid="backup-empty"
      >
        <History size={16} className="inline mr-1.5" />
        バックアップはありません
      </div>
    );
  }

  return (
    <div role="menu" aria-label="バックアップ一覧" className="py-1">
      {backups.map((backup) => (
        <button
          key={backup.relativePath}
          type="button"
          role="menuitem"
          onClick={() => onRestore(backup.relativePath)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
        >
          <RotateCcw
            size={14}
            className="shrink-0 text-[var(--text-secondary)]"
          />
          <span className="truncate">{backup.filename}</span>
          <span className="ml-auto text-xs text-[var(--text-secondary)] shrink-0">
            {formatDate(backup.createdAt)}
          </span>
        </button>
      ))}
    </div>
  );
};

BackupMenu.displayName = "BackupMenu";
