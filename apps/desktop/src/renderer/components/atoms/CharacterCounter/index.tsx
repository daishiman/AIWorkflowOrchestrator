import { clsx } from "clsx";

export interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

/**
 * 文字数カウンターコンポーネント
 * - 通常時: 白色（透明度40%）
 * - 警告(80%+): 黄色
 * - エラー(95%+): 赤色
 */
export function CharacterCounter({
  current,
  max,
  className,
}: CharacterCounterProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  const colorClass =
    percentage >= 95
      ? "text-red-400"
      : percentage >= 80
        ? "text-yellow-400"
        : "text-white/40";

  // Use assertive for warning/error states
  const ariaLive = percentage >= 80 ? "assertive" : "polite";

  return (
    <div
      id="character-counter"
      data-testid="character-counter"
      className={clsx("text-right text-xs", colorClass, className)}
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {current.toLocaleString()} / {max.toLocaleString()} 文字
      {percentage >= 95 && (
        <span className="sr-only" data-testid="character-limit-warning">
          文字数制限に達しています
        </span>
      )}
    </div>
  );
}

export default CharacterCounter;
