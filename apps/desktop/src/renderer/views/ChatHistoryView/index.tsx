/**
 * ChatHistoryView - チャット履歴詳細ページ
 *
 * 特定のセッションの詳細表示とエクスポート機能を提供する。
 * URLパラメータからセッションIDを取得し、APIからデータを取得する。
 *
 * @see docs/30-workflows/chat-history-persistence/ui-ux-design.md
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, ArrowLeft, MessageCircle } from "lucide-react";
import {
  ChatHistoryExport,
  type ExportOptions,
  type ExportSessionInfo,
} from "../../../components/chat";

/**
 * セッションデータの型定義（API応答）
 */
interface SessionData extends ExportSessionInfo {
  totalTokens?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * メッセージデータの型定義
 */
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  llmMetadata?: {
    provider: string;
    model: string;
    tokenUsage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  };
}

/**
 * ChatHistoryView コンポーネント
 */
export const ChatHistoryView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // 状態管理
  const [session, setSession] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // セッションとメッセージの取得
  useEffect(() => {
    if (!sessionId) {
      setError("セッションIDが指定されていません");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // セッション取得
        const sessionResponse = await fetch(`/api/v1/sessions/${sessionId}`);
        if (!sessionResponse.ok) {
          throw new Error("セッションの取得に失敗しました");
        }
        const sessionData = await sessionResponse.json();
        setSession(sessionData);

        // メッセージ取得
        const messagesResponse = await fetch(
          `/api/v1/sessions/${sessionId}/messages`,
        );
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages || []);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  // エクスポートダイアログを閉じたときにbodyのスクロールを復元
  useEffect(() => {
    if (isExportDialogOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isExportDialogOpen]);

  // エクスポート処理
  const handleExport = useCallback(
    async (options: ExportOptions) => {
      if (!sessionId || !session) return;

      const params = new URLSearchParams({
        format: options.format,
        range: options.range,
        includeMetadata: String(options.includeMetadata ?? true),
        download: "true",
      });

      if (options.range === "selected" && options.selectedMessageIds) {
        params.set("messageIds", options.selectedMessageIds.join(","));
      }

      const response = await fetch(
        `/api/v1/sessions/${sessionId}/export?${params.toString()}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("セッションが見つかりませんでした");
        }
        if (response.status === 422) {
          throw new Error("選択したメッセージが不正です");
        }
        throw new Error(errorData.detail || "エクスポートに失敗しました");
      }

      // ファイルダウンロード
      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${session.title}.${options.format === "markdown" ? "md" : "json"}`;

      if (contentDisposition) {
        // RFC 5987のfilename*パラメータを優先的に使用（UTF-8対応）
        const filenameStarMatch = contentDisposition.match(
          /filename\*=UTF-8''(.+?)(?:;|$)/,
        );
        if (filenameStarMatch) {
          try {
            filename = decodeURIComponent(filenameStarMatch[1]);
          } catch (e) {
            // デコード失敗時はフォールバック
            console.warn("Failed to decode filename:", e);
          }
        } else {
          // 通常のfilenameパラメータ
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match) {
            filename = match[1];
          }
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // 成功時はダイアログを閉じる
      setIsExportDialogOpen(false);
    },
    [sessionId, session],
  );

  // 戻るボタン処理
  const handleBack = () => {
    navigate(-1);
  };

  // エラー表示
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-hig-error mb-4" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-hig-sm bg-hig-bg-secondary px-4 py-2 text-hig-text-primary hover:bg-hig-bg-tertiary"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>
        </div>
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div
        className="flex h-full items-center justify-center p-4"
        role="status"
        aria-label="読み込み中"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-hig-accent border-t-transparent" />
      </div>
    );
  }

  // セッションがない場合
  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-hig-text-secondary">セッションが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <header className="flex items-center justify-between border-b border-hig-border p-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-hig-sm p-2 text-hig-text-secondary hover:bg-hig-bg-secondary"
            aria-label="戻る"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-hig-text-primary">
              {session.title}
            </h1>
            <p className="text-sm text-hig-text-secondary">
              {session.messageCount}件のメッセージ
              {session.totalTokens && ` · ${session.totalTokens}トークン`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExportDialogOpen(true)}
          aria-label="エクスポート"
          className="flex items-center gap-2 rounded-hig-sm bg-hig-accent px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4" data-testid="download-icon" />
          <span>エクスポート</span>
        </button>
      </header>

      {/* メッセージ一覧 */}
      <main className="flex-1 overflow-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-hig-text-secondary">
              <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>メッセージがありません</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                data-testid={`message-checkbox-${message.id}`}
                className={`rounded-hig-sm p-4 ${
                  message.role === "user"
                    ? "ml-auto max-w-[80%] bg-hig-accent/10"
                    : "mr-auto max-w-[80%] bg-hig-bg-secondary"
                }`}
              >
                <div className="mb-2 flex items-center justify-between text-xs text-hig-text-secondary">
                  <span className="font-medium">
                    {message.role === "user" ? "ユーザー" : "アシスタント"}
                  </span>
                  <span>
                    {new Date(message.timestamp).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-hig-text-primary">
                  {message.content}
                </p>
                {message.llmMetadata && (
                  <div className="mt-2 text-xs text-hig-text-secondary">
                    <span>{message.llmMetadata.model}</span>
                    {message.llmMetadata.tokenUsage && (
                      <span className="ml-2">
                        · 入力: {message.llmMetadata.tokenUsage.inputTokens},
                        出力: {message.llmMetadata.tokenUsage.outputTokens}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* エクスポートダイアログ */}
      {isExportDialogOpen && (
        <ChatHistoryExport
          session={session}
          onExport={handleExport}
          onClose={() => setIsExportDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatHistoryView;
