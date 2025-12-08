interface WatcherStatusProps {
  isRunning: boolean;
  watchPath: string | null;
  onStart: () => void;
  onStop: () => void;
}

export function WatcherStatus({
  isRunning,
  watchPath,
  onStart,
  onStop,
}: WatcherStatusProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">ファイル監視</h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isRunning ? "監視中" : "停止"}
            </span>
          </div>
          {watchPath && (
            <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
              監視パス: {watchPath}
            </p>
          )}
        </div>
        <button
          onClick={isRunning ? onStop : onStart}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isRunning ? "停止" : "開始"}
        </button>
      </div>
    </div>
  );
}
