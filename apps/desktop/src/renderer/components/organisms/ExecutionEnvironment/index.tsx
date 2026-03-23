/**
 * ExecutionEnvironment - 実行環境コンテナコンポーネント
 * 環境タイプに応じて適切なプレビュー環境を表示
 * @module ExecutionEnvironment
 */

import React from "react";
import clsx from "clsx";
import type { EnvironmentType, PreviewContent } from "@repo/shared/types/agent";
import type { HandoffGuidance } from "@repo/shared";
import { HTMLPreviewEnvironment } from "../HTMLPreviewEnvironment";
import { MarkdownPreviewEnvironment } from "../MarkdownPreviewEnvironment";
import { TerminalHandoffCard } from "../TerminalHandoffCard";

export interface ExecutionEnvironmentProps {
  /** 環境タイプ */
  environmentType: EnvironmentType;
  /** プレビューコンテンツ */
  content: PreviewContent | null;
  /** terminal 用 HandoffGuidance */
  handoffGuidance?: HandoffGuidance | null;
  /** リフレッシュハンドラ */
  onRefresh?: () => void;
  /** エラーハンドラ */
  onError?: (error: Error) => void;
  /** カスタムクラス */
  className?: string;
}

/**
 * プレースホルダーコンポーネントのプロパティ
 */
interface PlaceholderProps {
  /** SVGパス */
  iconPath: string;
  /** メインメッセージ */
  title: string;
  /** サブメッセージ */
  subtitle: string;
  /** data-testid属性 */
  testId: string;
}

/**
 * 汎用プレースホルダーコンポーネント
 * プレビュー環境の各種状態表示に使用
 */
const Placeholder: React.FC<PlaceholderProps> = ({
  iconPath,
  title,
  subtitle,
  testId,
}) => (
  <div
    className={clsx(
      "flex flex-col items-center justify-center h-full",
      "text-[var(--text-tertiary)]",
    )}
    data-testid={testId}
  >
    <svg
      className="h-12 w-12 mb-4 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d={iconPath}
      />
    </svg>
    <p className="text-sm">{title}</p>
    <p className="text-xs mt-1 opacity-70">{subtitle}</p>
  </div>
);

/**
 * プレースホルダー設定
 */
const PLACEHOLDER_CONFIG = {
  noPreview: {
    iconPath:
      "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "プレビューは利用できません",
    subtitle: "環境タイプを選択してプレビューを有効にしてください",
    testId: "no-preview",
  },
  terminalWaiting: {
    iconPath:
      "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    title: "ターミナル環境",
    subtitle: "実行コンテキストを待機中...",
    testId: "terminal-waiting",
  },
  code: {
    iconPath: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    title: "コード実行環境",
    subtitle: "Coming soon",
    testId: "code-placeholder",
  },
  empty: {
    iconPath:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "コンテンツを待機中",
    subtitle: "プレビューするコンテンツがありません",
    testId: "empty-preview",
  },
} as const;

/**
 * ExecutionEnvironment コンポーネント
 */
export const ExecutionEnvironment: React.FC<ExecutionEnvironmentProps> = ({
  environmentType,
  content,
  handoffGuidance,
  onRefresh,
  onError,
  className,
}) => {
  const contentString = content?.content || "";

  // コンテンツがない場合はプレースホルダーを表示
  const showEmptyPlaceholder =
    (environmentType === "html" || environmentType === "markdown") && !content;

  return (
    <div
      className={clsx(
        "h-full w-full overflow-hidden flex-1",
        "bg-[var(--bg-primary)]",
        className,
      )}
      data-testid="execution-environment"
    >
      {(() => {
        // コンテンツがない場合
        if (showEmptyPlaceholder) {
          return <Placeholder {...PLACEHOLDER_CONFIG.empty} />;
        }

        switch (environmentType) {
          case "html":
            return (
              <HTMLPreviewEnvironment
                content={contentString}
                onLoad={onRefresh}
                onError={onError}
              />
            );

          case "markdown":
            return <MarkdownPreviewEnvironment content={contentString} />;

          case "terminal":
            if (!handoffGuidance) {
              return <Placeholder {...PLACEHOLDER_CONFIG.terminalWaiting} />;
            }
            return (
              <TerminalHandoffCard
                guidance={handoffGuidance}
                onCopyCommand={() => {
                  navigator.clipboard
                    .writeText(handoffGuidance.terminalCommand)
                    .catch(() => {});
                }}
                onDismiss={() => {}}
              />
            );

          case "code":
            return <Placeholder {...PLACEHOLDER_CONFIG.code} />;

          case "none":
          default:
            return <Placeholder {...PLACEHOLDER_CONFIG.noPreview} />;
        }
      })()}
    </div>
  );
};

ExecutionEnvironment.displayName = "ExecutionEnvironment";
