/**
 * History Search shared types
 *
 * TASK-UI-01 / TASK-UI-06 で使用する履歴検索の共通型定義。
 */

export type HistoryItemType = "chat" | "file" | "skill";

export interface ChatHistoryMetadata {
  type: "chat";
  sessionId: string;
  messageCount: number;
  lastModel?: string;
}

export interface FileHistoryMetadata {
  type: "file";
  filePath: string;
  additions: number;
  deletions: number;
}

export interface SkillHistoryMetadata {
  type: "skill";
  skillName: string;
  executionId: string;
  status: "success" | "failure" | "cancelled";
  outputFile?: string;
  executionTimeMs?: number;
  modelUsed?: string;
  outputFileSizeBytes?: number;
}

export type HistoryItemMetadata =
  | ChatHistoryMetadata
  | FileHistoryMetadata
  | SkillHistoryMetadata;

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  preview: string;
  timestamp: string;
  metadata: HistoryItemMetadata;
}

export interface HistorySearchRequest {
  query: string;
  filter: HistoryItemType | "all";
  limit: number;
  offset: number;
}

export interface HistorySearchResult {
  items: HistoryItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface HistorySearchStats {
  chat: number;
  file: number;
  skill: number;
  total: number;
}
