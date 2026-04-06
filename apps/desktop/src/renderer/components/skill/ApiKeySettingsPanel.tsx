/**
 * @file ApiKeySettingsPanel.tsx
 * @description AuthKeySection への委譲コンポーネント (TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001)
 *
 * IPC 呼び出しロジックは useAuthKeyManagement フックに統合済み。
 * このコンポーネントは AuthKeySection への薄いラッパーとして機能する。
 * 後方互換性のため props インターフェースは維持する。
 *
 * 未タスク: TECH-M-01 — 呼び出し元を AuthKeySection に直接変更した後に廃止
 */

import React from "react";
import type { ApiKeyStatus } from "@repo/shared/types";
import { AuthKeySection } from "../settings/AuthKeySection";

interface ApiKeySettingsPanelProps {
  onStatusChange?: (status: ApiKeyStatus) => void;
}

export function ApiKeySettingsPanel({
  onStatusChange,
}: ApiKeySettingsPanelProps): React.ReactNode {
  return <AuthKeySection onStatusChange={onStatusChange} />;
}
