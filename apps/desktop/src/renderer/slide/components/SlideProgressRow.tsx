/**
 * SlideProgressRow コンポーネント
 * スライド同期の進捗状況を表示する行コンポーネント
 * @module renderer/slide/components/SlideProgressRow
 */

export interface SlideProgressRowProps {
  percent: number; // 0-100
  message: string;
  onCancel: () => void;
}

export function SlideProgressRow({
  percent,
  message,
  onCancel,
}: SlideProgressRowProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      data-testid="slide-progress-row"
      className="flex flex-col gap-2 p-4 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#C6C6C8] dark:border-[#38383A]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#000000] dark:text-[#FFFFFF] flex-1 min-w-0 truncate">
          {message}
        </p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="キャンセル"
          className="shrink-0 px-3 py-1 rounded-lg text-sm font-medium text-white bg-[#FF3B30] dark:bg-[#FF453A] hover:opacity-80 active:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2"
        >
          キャンセル
        </button>
      </div>

      <div
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`進捗: ${clampedPercent}%`}
        className="w-full h-2 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-[#007AFF] dark:bg-[#0A84FF] transition-[width] duration-200"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}

SlideProgressRow.displayName = "SlideProgressRow";
