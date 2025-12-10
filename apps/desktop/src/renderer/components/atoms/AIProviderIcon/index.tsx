/**
 * AIプロバイダーアイコンコンポーネント
 *
 * 各AIプロバイダー（OpenAI、Anthropic、Google、xAI）の公式ロゴを表示
 *
 * @see https://icons.getbootstrap.com/icons/openai/
 * @see https://icons.getbootstrap.com/icons/anthropic/
 * @see https://icons.getbootstrap.com/icons/google/
 */

import React from "react";
import clsx from "clsx";
import type { AIProvider } from "@repo/shared/types/api-keys";

export interface AIProviderIconProps {
  provider: AIProvider;
  size?: number;
  className?: string;
}

/**
 * OpenAI ロゴ (Bootstrap Icons)
 * @see https://icons.getbootstrap.com/icons/openai/
 */
const OpenAIIcon: React.FC<{ size: number; className?: string }> = ({
  size,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
    aria-hidden="true"
  >
    <path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934 4.1 4.1 0 0 0-1.778-.113 4.15 4.15 0 0 0-2.118-.186 4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679 4 4 0 0 0-1.095 1.257 3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z" />
  </svg>
);

/**
 * Anthropic ロゴ (Bootstrap Icons)
 * @see https://icons.getbootstrap.com/icons/anthropic/
 */
const AnthropicIcon: React.FC<{ size: number; className?: string }> = ({
  size,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9.218 2h2.402L16 12.987h-2.402zM4.379 2h2.512l4.38 10.987H8.82l-.895-2.308h-4.58l-.896 2.307H0L4.38 2.001zm2.755 6.64L5.635 4.777 4.137 8.64z"
    />
  </svg>
);

/**
 * Google ロゴ (Bootstrap Icons)
 * @see https://icons.getbootstrap.com/icons/google/
 */
const GoogleIcon: React.FC<{ size: number; className?: string }> = ({
  size,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
    aria-hidden="true"
  >
    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
  </svg>
);

/**
 * xAI (Grok) ロゴ
 * シンプルな "X" ベースのデザイン
 */
const XAIIcon: React.FC<{ size: number; className?: string }> = ({
  size,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
    aria-hidden="true"
  >
    {/* xAI/Grok "X" style logo */}
    <path d="M1.5 1.5L6.5 8L1.5 14.5H3.5L8 9L12.5 14.5H14.5L9.5 8L14.5 1.5H12.5L8 7L3.5 1.5H1.5Z" />
  </svg>
);

/**
 * AIプロバイダーアイコン
 *
 * 各AIプロバイダーの公式/ブランドアイコンを表示
 */
export const AIProviderIcon: React.FC<AIProviderIconProps> = ({
  provider,
  size = 18,
  className,
}) => {
  const iconClass = clsx("flex-shrink-0", className);

  switch (provider) {
    case "openai":
      return <OpenAIIcon size={size} className={iconClass} />;
    case "anthropic":
      return <AnthropicIcon size={size} className={iconClass} />;
    case "google":
      return <GoogleIcon size={size} className={iconClass} />;
    case "xai":
      return <XAIIcon size={size} className={iconClass} />;
    default:
      return null;
  }
};

AIProviderIcon.displayName = "AIProviderIcon";

export default AIProviderIcon;
