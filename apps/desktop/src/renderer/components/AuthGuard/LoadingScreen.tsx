import React from "react";
import { Spinner } from "../atoms/Spinner";
import { Icon } from "../atoms/Icon";

/**
 * 認証確認中のローディング画面
 *
 * 認証状態の確認中に表示されるスピナー付きの画面。
 * GlassPanelを使用したデザインで、アプリ全体の統一感を維持。
 *
 * @component
 * @example
 * ```tsx
 * // AuthGuard内部で使用
 * <LoadingScreen />
 * ```
 */
export const LoadingScreen: React.FC = () => {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a]"
      role="status"
      aria-label="認証確認中"
    >
      {/* アプリロゴ */}
      <div className="mb-8">
        <Icon name="sparkles" size={64} className="text-blue-400" />
      </div>

      {/* アプリ名 */}
      <h1 className="text-2xl font-bold text-white mb-8">
        AIWorkflowOrchestrator
      </h1>

      {/* スピナー */}
      <Spinner size="lg" className="text-blue-400" />

      {/* メッセージ */}
      <p className="mt-4 text-white/60 text-sm">読み込み中...</p>
    </div>
  );
};

LoadingScreen.displayName = "LoadingScreen";
