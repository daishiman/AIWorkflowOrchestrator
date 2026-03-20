/**
 * ChatView - AIチャットメインビュー
 *
 * ユーザーがAIとリアルタイムで会話するためのメインインターフェース。
 * RAG（Retrieval-Augmented Generation）モードをサポート。
 */
import React, { useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { History } from "lucide-react";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { ChatInput } from "../../components/organisms/ChatInput";
import { ChatMessage } from "../../components/molecules/ChatMessage";
import { SystemPromptPanel } from "../../components/organisms/SystemPromptPanel";
import { SystemPromptToggleButton } from "../../components/atoms/SystemPromptToggleButton";
import { SaveTemplateDialog } from "../../components/organisms/SaveTemplateDialog";
import { useAppStore, useChatError, useClearChatError } from "../../store";

// ============================================
// 定数定義
// ============================================
const EMPTY_STATE_MESSAGES = {
  primary: "メッセージを入力してAIと会話を始めましょう",
  hint: "Shift + Enter で改行、Enter で送信",
} as const;

const ERROR_MESSAGES: Record<string, string> = {
  AI_UNAVAILABLE: "AI機能が利用できません。アプリを再起動してください。",
  API_CALL_FAILED:
    "メッセージの送信に失敗しました。しばらく待ってから再試行してください。",
  UNKNOWN_ERROR: "予期しないエラーが発生しました。",
  API_KEY_MISSING:
    "APIキーが設定されていません。設定画面からAPIキーを入力してください。",
  PROVIDER_NOT_FOUND: "選択されたAIプロバイダーが見つかりません。",
  MODEL_NOT_FOUND: "選択されたモデルが見つかりません。",
  RATE_LIMIT_EXCEEDED:
    "API利用制限に達しました。しばらく待ってから再試行してください。",
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
};

const ERROR_CODE_PATTERN = /^[A-Z0-9_]+$/;

function getErrorMessage(code: string): string {
  const normalized = code.trim();
  if (normalized.length === 0) {
    return ERROR_MESSAGES["UNKNOWN_ERROR"] ?? "エラーが発生しました。";
  }

  if (normalized in ERROR_MESSAGES) {
    return ERROR_MESSAGES[normalized]!;
  }

  // Main Process は user-facing message string を返す場合がある。
  if (!ERROR_CODE_PATTERN.test(normalized)) {
    return normalized;
  }

  return ERROR_MESSAGES["UNKNOWN_ERROR"] ?? "エラーが発生しました。";
}

const RAG_STATUS_MESSAGES = {
  enabled: "RAG有効: ナレッジベースを参照して回答します",
  disabled: "通常モード",
} as const;

// ============================================
// 型定義
// ============================================
export interface ChatViewProps {
  className?: string;
}

// ============================================
// コンポーネント
// ============================================
export const ChatView: React.FC<ChatViewProps> = ({ className }) => {
  const navigate = useNavigate();

  // ----------------------------------------
  // Store State - チャット関連
  // ----------------------------------------
  const chatMessages = useAppStore((state) => state.chatMessages);
  const chatInput = useAppStore((state) => state.chatInput);
  const isSending = useAppStore((state) => state.isSending);

  // ----------------------------------------
  // Store State - RAG関連
  // ----------------------------------------
  const ragConnectionStatus = useAppStore((state) => state.ragConnectionStatus);
  const isRagEnabled = ragConnectionStatus === "connected";

  // ----------------------------------------
  // Store State - システムプロンプト関連
  // ----------------------------------------
  const isSystemPromptPanelExpanded = useAppStore(
    (state) => state.isSystemPromptPanelExpanded,
  );
  const systemPrompt = useAppStore((state) => state.systemPrompt || "");
  const templates = useAppStore((state) => state.templates || []);
  const selectedTemplateId = useAppStore((state) => state.selectedTemplateId);
  const isSaveTemplateDialogOpen = useAppStore(
    (state) => state.isSaveTemplateDialogOpen,
  );

  // ----------------------------------------
  // Store Actions
  // ----------------------------------------
  const setChatInput = useAppStore((state) => state.setChatInput);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const toggleSystemPromptPanel = useAppStore(
    (state) => state.toggleSystemPromptPanel,
  );
  const setSystemPrompt = useAppStore((state) => state.setSystemPrompt);
  const clearSystemPrompt = useAppStore((state) => state.clearSystemPrompt);
  const openSaveTemplateDialog = useAppStore(
    (state) => state.openSaveTemplateDialog,
  );
  const closeSaveTemplateDialog = useAppStore(
    (state) => state.closeSaveTemplateDialog,
  );
  const saveTemplate = useAppStore((state) => state.saveTemplate);
  const deleteTemplate = useAppStore((state) => state.deleteTemplate);
  const initializeTemplates = useAppStore((state) => state.initializeTemplates);

  // ----------------------------------------
  // Store State - エラー関連
  // ----------------------------------------
  const chatError = useChatError();
  const clearChatError = useClearChatError();

  // ----------------------------------------
  // Effects - テンプレート初期化
  // ----------------------------------------
  useEffect(() => {
    initializeTemplates();
  }, [initializeTemplates]);

  // ----------------------------------------
  // Effects - エラー自動消去（5秒タイマー）
  // ----------------------------------------
  useEffect(() => {
    if (!chatError) return;
    const timer = setTimeout(() => clearChatError(), 5000);
    return () => clearTimeout(timer);
  }, [chatError, clearChatError]);

  // ----------------------------------------
  // Callbacks - システムプロンプト
  // ----------------------------------------
  const handleSelectTemplate = useCallback(
    (template: (typeof templates)[number]) => {
      setSystemPrompt(template.content);
    },
    [setSystemPrompt],
  );

  const handleSaveTemplate = useCallback(() => {
    openSaveTemplateDialog();
  }, [openSaveTemplateDialog]);

  const handleConfirmSaveTemplate = useCallback(
    async (name: string) => {
      await saveTemplate(name, systemPrompt);
      closeSaveTemplateDialog();
    },
    [saveTemplate, systemPrompt, closeSaveTemplateDialog],
  );

  const existingTemplateNames = templates.map((t) => t.name);

  // ----------------------------------------
  // Refs
  // ----------------------------------------
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------
  // Callbacks - メッセージ送信
  // ----------------------------------------
  const handleSend = useCallback(async () => {
    const trimmedInput = chatInput.trim();
    if (trimmedInput && !isSending) {
      // Send message to LLM with system prompt
      await sendMessage(chatInput);
      setChatInput("");
    }
  }, [chatInput, isSending, sendMessage, setChatInput]);

  const handleInputChange = useCallback(
    (value: string) => {
      setChatInput(value);
    },
    [setChatInput],
  );

  // ----------------------------------------
  // Effects - 自動スクロール
  // ----------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ----------------------------------------
  // Render - メインビュー
  // ----------------------------------------
  const hasMessages = chatMessages.length > 0;
  const ragStatusMessage = isRagEnabled
    ? RAG_STATUS_MESSAGES.enabled
    : RAG_STATUS_MESSAGES.disabled;

  return (
    <div
      className={clsx("flex flex-col h-full", className)}
      data-testid="chat-view"
    >
      {/* ヘッダー: タイトルとナビゲーション */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h1 className="text-lg font-semibold text-white">AIチャット</h1>
          <p className="text-sm text-gray-400">{ragStatusMessage}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView("skillCenter")}
            aria-label="スキル管理"
            className="px-3 py-1.5 text-sm rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            スキル管理
          </button>
          <button
            type="button"
            onClick={() => navigate("/chat/history")}
            aria-label="チャット履歴"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <History className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* システムプロンプトトグルボタン */}
      <div className="px-4 pt-3">
        <SystemPromptToggleButton
          isExpanded={isSystemPromptPanelExpanded}
          onClick={toggleSystemPromptPanel}
          hasContent={systemPrompt.trim().length > 0}
          disabled={isSending}
        />
      </div>

      {/* システムプロンプトパネル */}
      {isSystemPromptPanelExpanded && (
        <div className="px-4 pb-3">
          <SystemPromptPanel
            isExpanded={isSystemPromptPanelExpanded}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={deleteTemplate}
            onClear={clearSystemPrompt}
          />
        </div>
      )}

      {/* メッセージエリア: チャット履歴またはエンプティステート */}
      <main className="flex-1 overflow-auto p-4">
        <div
          role="log"
          aria-label="チャット履歴"
          data-testid="message-list"
          className="h-full"
        >
          {hasMessages ? (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  loading={message.isStreaming}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 mb-2">
                  {EMPTY_STATE_MESSAGES.primary}
                </p>
                <p className="text-sm text-gray-500">
                  {EMPTY_STATE_MESSAGES.hint}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* エラーバナー */}
      {chatError && (
        <div
          role="alert"
          className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          <span className="flex-1">{getErrorMessage(chatError)}</span>
          <button
            type="button"
            onClick={clearChatError}
            aria-label="エラーを閉じる"
            className="ml-2 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* 入力エリア: メッセージ入力フォーム */}
      <footer className="p-4 border-t border-white/10">
        <GlassPanel className="p-2">
          <ChatInput
            value={chatInput}
            onChange={handleInputChange}
            onSend={handleSend}
            sending={isSending}
            disabled={isSending}
          />
        </GlassPanel>
      </footer>

      {/* テンプレート保存ダイアログ */}
      <SaveTemplateDialog
        isOpen={isSaveTemplateDialogOpen}
        onClose={closeSaveTemplateDialog}
        onSave={handleConfirmSaveTemplate}
        previewContent={systemPrompt}
        existingNames={existingTemplateNames}
      />
    </div>
  );
};

ChatView.displayName = "ChatView";
