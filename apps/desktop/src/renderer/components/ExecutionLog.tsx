interface LogEntry {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  createdAt: string;
}

interface ExecutionLogProps {
  logs: LogEntry[];
  loading?: boolean;
}

const levelColors = {
  debug: "text-gray-500",
  info: "text-blue-600",
  warn: "text-yellow-600",
  error: "text-red-600",
};

const levelBgColors = {
  debug: "bg-gray-100",
  info: "bg-blue-100",
  warn: "bg-yellow-100",
  error: "bg-red-100",
};

export function ExecutionLog({ logs, loading = false }: ExecutionLogProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">ログがありません</div>
    );
  }

  return (
    <div className="font-mono text-sm">
      {logs.map((log) => (
        <div
          key={log.id}
          className={`p-2 border-b border-gray-100 ${levelBgColors[log.level]}`}
        >
          <div className="flex items-start gap-2">
            <span className="text-gray-400 text-xs whitespace-nowrap">
              {formatTime(log.createdAt)}
            </span>
            <span
              className={`uppercase text-xs font-bold ${levelColors[log.level]}`}
            >
              [{log.level}]
            </span>
            <span className="text-gray-800 break-all">{log.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
