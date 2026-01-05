/**
 * ChatHistoryList状態表示コンポーネント
 *
 * ローディング、エラー、空状態を表示するコンポーネント群。
 */

import { MessageSquare, AlertCircle } from "lucide-react";

/**
 * スケルトンローダーコンポーネント
 */
export function SkeletonLoader() {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-live="polite">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton animate-pulse space-y-2">
          <div className="skeleton-line h-4 w-3/4 rounded bg-hig-bg-tertiary" />
          <div className="skeleton-line h-3 w-1/2 rounded bg-hig-bg-tertiary" />
          <div className="skeleton-line h-3 w-1/4 rounded bg-hig-bg-tertiary" />
        </div>
      ))}
    </div>
  );
}

/**
 * デフォルト空状態コンポーネント
 */
export function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MessageSquare className="mb-4 h-12 w-12 text-hig-text-secondary" />
      <p className="text-hig-text-primary font-medium">
        まだチャット履歴がありません
      </p>
      <p className="mt-1 text-sm text-hig-text-secondary">
        新しいチャットを開始してください
      </p>
    </div>
  );
}

/**
 * エラー状態コンポーネント
 */
export function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-hig-error" />
      <p className="text-hig-text-primary font-medium">エラーが発生しました</p>
      <p className="mt-1 text-sm text-hig-text-secondary">{error.message}</p>
    </div>
  );
}
