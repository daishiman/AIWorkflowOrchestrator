// Knowledge Studio Store Types

// ビュー型
export type ViewType =
  // コア画面
  | "dashboard"
  | "workspace"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  // スキル関連
  | "skillCenter"
  | "skill-editor"
  | "skill-center" // legacy alias → normalizeSkillLifecycleView で "skillCenter" に正規化
  | "skillAnalysis"
  | "skillCreate"
  // エージェント・ワークフロー
  | "agent"
  | "executionConsole"
  | "chainBuilder"
  | "scheduleManager"
  // 検索・履歴
  | "historySearch"
  // デバッグ・分析
  | "debugPanel"
  | "analyticsDashboard";

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

// 通知設定型
export interface NotificationSettings {
  email: boolean;
  desktop: boolean;
  sound: boolean;
  workflowComplete: boolean;
  workflowError: boolean;
}

// 通知型（TASK-UI-01 / TASK-UI-08）
export type NotificationType = "info" | "success" | "warning" | "error";

export type NotificationSource =
  | { kind: "skill_execution"; skillName: string }
  | { kind: "file_operation"; fileName: string; operation: string }
  | { kind: "system"; eventType: string };

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  detail?: string;
  timestamp: string;
  isRead: boolean;
  source: NotificationSource;
}

// ユーザープロフィール型
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro" | "enterprise";
  // 拡張プロフィール属性
  timezone?: string;
  locale?: "ja" | "en" | "zh-CN" | "zh-TW" | "ko";
  notificationSettings?: NotificationSettings;
  preferences?: Record<string, unknown>;
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

// プロンプトテンプレート型
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// テーマ型
/**
 * テーマモード
 * - kanagawa-dragon: Kanagawa Dragon テーマ（デフォルト）
 * - light: ライトテーマ
 * - dark: ダークテーマ
 * - system: システム設定に従う
 */
export type ThemeMode = "kanagawa-dragon" | "light" | "dark" | "system";

/**
 * 解決済みテーマ
 * systemモードを除いた実際に適用されるテーマ
 */
export type ResolvedTheme = "kanagawa-dragon" | "light" | "dark";

/**
 * テーマカラースキーム
 * テーマが持つ基本的な明暗の分類
 */
export type ThemeColorScheme = "light" | "dark";

/**
 * テーマからカラースキームを取得
 * @param theme - 解決済みテーマ
 * @returns カラースキーム（light または dark）
 */
export function getThemeColorScheme(theme: ResolvedTheme): ThemeColorScheme {
  switch (theme) {
    case "light":
      return "light";
    case "kanagawa-dragon":
    case "dark":
    default:
      return "dark";
  }
}

// Store Slice baseline inventory types (TASK-UI-01-A)
export type StoreBoundaryDecision =
  | "new"
  | "extend"
  | "no-change"
  | "local-useState";

export type StoreSlicePersistenceStrategy =
  | "persisted"
  | "partial-persisted"
  | "non-persisted";

export interface StoreSlicePersistence {
  strategy: StoreSlicePersistenceStrategy;
  keys: readonly string[];
}

export interface StoreSliceInventoryItem {
  sliceName: string;
  state: readonly string[];
  actions: readonly string[];
  selectors: readonly string[];
  persistence: StoreSlicePersistence;
  ownerView: readonly string[];
  filePath: string;
}

export type StoreBoundaryDomain =
  | "Notification"
  | "HistorySearch"
  | "SkillCenter"
  | "ViewType"
  | "Workspace";

export interface StoreBoundaryMatrixItem {
  domain: StoreBoundaryDomain;
  decision: StoreBoundaryDecision;
  target: string;
  rationale: string;
  handoffTask: string;
}

export interface StoreSelectorNamingConvention {
  stateSelectorPattern: string;
  actionSelectorPattern: string;
  requireDomainSuffix: boolean;
}

export interface StoreSelectorPolicy {
  namingConvention: StoreSelectorNamingConvention;
  deprecatedCompositeHooks: readonly string[];
  bannedGenericSelectorNames: readonly string[];
  requiredDomainSelectors: readonly string[];
  notes: readonly string[];
}
