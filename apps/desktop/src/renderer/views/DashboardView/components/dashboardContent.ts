import type { IconName } from "../../../components/atoms/Icon";
import type { ActivityItem, ViewType } from "../../../store/types";

export const MAX_TIMELINE_ITEMS = 5;

export interface DashboardGreetingContent {
  title: string;
  description: string;
  eyebrow: string;
}

export interface DashboardSuggestion {
  id: string;
  title: string;
  description: string;
  view: Extract<
    ViewType,
    "workspace" | "skillCenter" | "agent" | "historySearch"
  >;
  icon: IconName;
  accent: "primary" | "info" | "success";
}

export interface DashboardTimelineEntry {
  id: string;
  title: string;
  timestamp: string;
  icon: IconName;
  statusLabel: string;
}

interface SuggestionOptions {
  activityCount: number;
  pendingCount: number;
}

function normalizeDisplayName(displayName?: string | null): string | null {
  const trimmed = displayName?.trim();
  if (!trimmed || trimmed.toLowerCase() === "user") {
    return null;
  }
  return trimmed;
}

function getSalutation(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) {
    return "こんばんは";
  }
  if (hour < 11) {
    return "おはようございます";
  }
  if (hour < 18) {
    return "こんにちは";
  }
  return "こんばんは";
}

function getGreetingDescription(
  date: Date,
  pendingCount: number,
  activityCount: number,
): string {
  if (pendingCount > 0) {
    return `${pendingCount}件の保留があります。優先度の高い導線を上に並べています。`;
  }
  if (activityCount === 0) {
    return "最初の一歩を選びやすいように、おすすめの導線をまとめました。";
  }
  if (date.getHours() < 12) {
    return "朝の立ち上がりに必要な導線だけを、短く並べています。";
  }
  return "直近の動きと次の一手を、この画面からすぐ辿れます。";
}

export function getGreetingContent(
  displayName: string | null | undefined,
  now: Date,
  pendingCount: number,
  activityCount: number,
): DashboardGreetingContent {
  const name = normalizeDisplayName(displayName);
  const salutation = getSalutation(now);

  return {
    eyebrow: "今日のホーム",
    title: name ? `${salutation}、${name}さん` : `${salutation}`,
    description: getGreetingDescription(now, pendingCount, activityCount),
  };
}

function buildSuggestion(
  id: DashboardSuggestion["id"],
  title: DashboardSuggestion["title"],
  description: DashboardSuggestion["description"],
  view: DashboardSuggestion["view"],
  icon: DashboardSuggestion["icon"],
  accent: DashboardSuggestion["accent"],
): DashboardSuggestion {
  return {
    id,
    title,
    description,
    view,
    icon,
    accent,
  };
}

export function getDashboardSuggestions({
  activityCount,
  pendingCount,
}: SuggestionOptions): DashboardSuggestion[] {
  if (activityCount === 0) {
    return [
      buildSuggestion(
        "skill-center",
        "ツールを探す",
        "まずは使えるスキルを見つけて、最短で作業を始めます。",
        "skillCenter",
        "puzzle",
        "primary",
      ),
      buildSuggestion(
        "workspace",
        "作業スペースを見る",
        "ファイルや資料を確認して、次の編集や整理に入ります。",
        "workspace",
        "folder-tree",
        "info",
      ),
      buildSuggestion(
        "agent",
        "AIアシスタントを開く",
        "やりたいことを自然文で渡して、最初の提案を受けます。",
        "agent",
        "bot",
        "success",
      ),
    ];
  }

  if (pendingCount > 0) {
    return [
      buildSuggestion(
        "agent",
        "AIアシスタントを開く",
        "保留中の作業から優先度の高いものを、すぐ再開できます。",
        "agent",
        "bot",
        "primary",
      ),
      buildSuggestion(
        "history-search",
        "履歴を見直す",
        "直近の会話や操作履歴から、文脈を取り戻します。",
        "historySearch",
        "search",
        "info",
      ),
      buildSuggestion(
        "workspace",
        "作業スペースへ戻る",
        "関連ファイルを確認しながら、続きを進めます。",
        "workspace",
        "folder-tree",
        "success",
      ),
    ];
  }

  return [
    buildSuggestion(
      "workspace",
      "作業スペースを見る",
      "今触っている資料やファイルへ、最短距離で戻れます。",
      "workspace",
      "folder-tree",
      "primary",
    ),
    buildSuggestion(
      "skill-center",
      "ツールを探す",
      "次のアクションに合うスキルを、一覧から選べます。",
      "skillCenter",
      "puzzle",
      "info",
    ),
    buildSuggestion(
      "history-search",
      "履歴を見直す",
      "直近の会話と操作から、流れを振り返れます。",
      "historySearch",
      "search",
      "success",
    ),
  ];
}

function getTimelineIcon(type: ActivityItem["type"]): IconName {
  switch (type) {
    case "success":
      return "check-circle";
    case "warning":
      return "alert-triangle";
    case "error":
      return "alert-circle";
    case "info":
    default:
      return "clock";
  }
}

function getTimelineStatusLabel(type: ActivityItem["type"]): string {
  switch (type) {
    case "success":
      return "完了";
    case "warning":
      return "確認";
    case "error":
      return "注意";
    case "info":
    default:
      return "更新";
  }
}

export function getTimelineEntries(
  activities: ActivityItem[],
): DashboardTimelineEntry[] {
  return activities.slice(0, MAX_TIMELINE_ITEMS).map((activity) => ({
    id: activity.id,
    title: activity.message.trim() || "アクティビティ",
    timestamp: activity.time,
    icon: getTimelineIcon(activity.type),
    statusLabel: getTimelineStatusLabel(activity.type),
  }));
}
