/**
 * EmptyState Component
 *
 * Reusable empty state component with customizable content.
 *
 * @module @repo/desktop/renderer/components/common/EmptyState
 */

import React from "react";

export type EmptyStateVariant =
  | "conversation"
  | "conversationList"
  | "messages"
  | "search"
  | "custom";

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function ConversationIcon() {
  return (
    <svg
      className="mb-3 h-16 w-16 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="mb-3 h-12 w-12 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

const variantDefaults: Record<
  Exclude<EmptyStateVariant, "custom">,
  { title: string; description?: string; iconSize: string }
> = {
  conversation: {
    title: "会話を選択",
    description: "左側のリストから会話を選ぶか、新しい会話を作成してください",
    iconSize: "h-16 w-16",
  },
  conversationList: {
    title: "会話がありません",
    description: "新しい会話を作成してください",
    iconSize: "h-12 w-12",
  },
  messages: {
    title: "メッセージがありません",
    description: "最初のメッセージを送信してください",
    iconSize: "h-12 w-12",
  },
  search: {
    title: "検索結果がありません",
    description: "別のキーワードで検索してください",
    iconSize: "h-12 w-12",
  },
};

function getDefaultIcon(variant: EmptyStateVariant): React.ReactNode {
  switch (variant) {
    case "search":
      return <SearchIcon />;
    case "conversation":
    case "conversationList":
    case "messages":
    default:
      return <ConversationIcon />;
  }
}

export function EmptyState({
  variant = "custom",
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps): React.ReactElement {
  const defaults =
    variant !== "custom"
      ? variantDefaults[variant]
      : { title: "", iconSize: "" };

  const displayTitle = title || defaults.title;
  const displayDescription = description ?? defaults.description;
  const displayIcon = icon ?? getDefaultIcon(variant);

  return (
    <div
      data-testid="empty-state"
      className={`flex flex-col items-center justify-center p-6 text-center text-gray-500 ${className}`}
    >
      {displayIcon}
      {displayTitle && (
        <p className={variant === "conversation" ? "text-lg" : ""}>
          {displayTitle}
        </p>
      )}
      {displayDescription && (
        <p className="mt-1 text-sm">{displayDescription}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
