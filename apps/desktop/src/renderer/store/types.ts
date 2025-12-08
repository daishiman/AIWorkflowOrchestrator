// Knowledge Studio Store Types

// ビュー型
export type ViewType = "dashboard" | "editor" | "chat" | "graph" | "settings";

// ファイルノード型
export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  isRagIndexed?: boolean;
}

// チャットメッセージ型
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// グラフノード型
export interface GraphNode {
  id: string;
  label: string;
  type: "main" | "document" | "concept";
  x: number;
  y: number;
  size: number;
  vx?: number;
  vy?: number;
  metadata?: {
    tags?: string[];
    [key: string]: unknown;
  };
}

// グラフリンク型
export interface GraphLink {
  source: string;
  target: string;
}

// ユーザープロフィール型
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro" | "enterprise";
}

// ダッシュボード統計型
export interface DashboardStats {
  totalDocs: number;
  ragIndexed: number;
  pending: number;
  storageUsed: number;
  storageTotal: number;
}

// アクティビティアイテム型
export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
}

// Dynamic Island状態型
export interface DynamicIslandState {
  visible: boolean;
  status: "processing" | "completed";
  message: string;
}

// レスポンシブモード型
export type ResponsiveMode = "mobile" | "tablet" | "desktop";

// ウィンドウサイズ型
export interface WindowSize {
  width: number;
  height: number;
}

// RAG接続状態型
export type RagConnectionStatus = "connected" | "disconnected" | "error";

// テーマ型
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
