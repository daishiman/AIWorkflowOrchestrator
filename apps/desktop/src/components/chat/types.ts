/**
 * チャット履歴UIコンポーネント型定義
 *
 * @see docs/30-workflows/chat-history-persistence/ui-ux-design.md
 */

import type { ChatSession } from "@repo/shared/types";

/**
 * セッショングループ（日付別・ピン留め別のグループ化）
 */
export interface SessionGroup {
  /** グループラベル（「今日」「昨日」「ピン留め」など） */
  label: string;
  /** グループ内のセッション一覧 */
  sessions: ChatSession[];
}

/**
 * モデル情報
 */
export interface ModelInfo {
  /** プロバイダー（openai, anthropic, googleなど） */
  provider: string;
  /** モデル名（gpt-4, claude-3-5-sonnetなど） */
  model: string;
}

/**
 * 日付プリセット
 */
export type DatePreset = "today" | "7days" | "30days" | "custom" | null;

/**
 * 検索フィルター
 */
export interface SearchFilters {
  /** 検索クエリ */
  query: string;
  /** 開始日 */
  dateFrom: Date | null;
  /** 終了日 */
  dateTo: Date | null;
  /** 選択されたモデル（provider/model形式） */
  models: string[];
  /** 日付プリセット */
  preset: DatePreset;
}

/**
 * ChatHistoryListコンポーネントのProps
 */
export interface ChatHistoryListProps {
  /** セッショングループ一覧 */
  sessionGroups: SessionGroup[];
  /** 選択中のセッションID */
  selectedSessionId: string | null;
  /** セッション選択時のコールバック */
  onSelectSession: (sessionId: string) => void;
  /** ピン留めトグル時のコールバック */
  onTogglePin: (sessionId: string, isPinned: boolean) => Promise<void>;
  /** お気に入りトグル時のコールバック */
  onToggleFavorite: (sessionId: string, isFavorite: boolean) => Promise<void>;
  /** セッション削除時のコールバック */
  onDeleteSession: (sessionId: string) => Promise<void>;
  /** タイトル更新時のコールバック */
  onUpdateTitle: (sessionId: string, title: string) => Promise<void>;
  /** 追加読み込み時のコールバック（無限スクロール） */
  onLoadMore?: () => void;
  /** 追加データがあるか */
  hasMore?: boolean;
  /** ローディング状態 */
  isLoading?: boolean;
  /** エラー */
  error?: Error | null;
  /** カスタム空状態コンポーネント */
  emptyState?: React.ReactNode;
}

/**
 * ChatHistorySearchコンポーネントのProps
 */
export interface ChatHistorySearchProps {
  /** 現在のフィルター設定 */
  filters: SearchFilters;
  /** フィルター変更時のコールバック */
  onFiltersChange: (filters: SearchFilters) => void;
  /** フィルタークリア時のコールバック */
  onClearFilters: () => void;
  /** 検索実行時のコールバック */
  onSearch: (filters: SearchFilters) => void;
  /** 利用可能なモデル一覧 */
  availableModels: ModelInfo[];
  /** デバウンス時間（ミリ秒） */
  debounceMs?: number;
}

/**
 * エクスポート形式
 */
export type ExportFormat = "markdown" | "json";

/**
 * エクスポート範囲
 */
export type ExportRange = "all" | "selected";

/**
 * エクスポートオプション
 */
export interface ExportOptions {
  /** エクスポート形式 */
  format: ExportFormat;
  /** エクスポート範囲 */
  range: ExportRange;
  /** 選択されたメッセージID（rangeが"selected"の場合のみ） */
  selectedMessageIds?: string[];
  /** メタデータを含めるか */
  includeMetadata?: boolean;
}

/**
 * エクスポートダイアログに必要な最小限のセッション情報
 */
export interface ExportSessionInfo {
  /** セッションID */
  id: string;
  /** セッションタイトル */
  title: string;
  /** メッセージ数 */
  messageCount: number;
}

/**
 * ChatHistoryExportコンポーネントのProps
 */
export interface ChatHistoryExportProps {
  /** エクスポート対象のセッション（最小限の情報） */
  session: ExportSessionInfo | ChatSession;
  /** エクスポート実行時のコールバック */
  onExport: (options: ExportOptions) => Promise<void>;
  /** ダイアログを閉じる時のコールバック */
  onClose: () => void;
  /** 初期選択されたメッセージID */
  initialSelectedMessageIds?: string[];
}

// Re-export ChatSession for convenience
export type { ChatSession };
