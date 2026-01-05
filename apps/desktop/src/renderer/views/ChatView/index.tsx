/**
 * ChatView - AIチャットメインビュー
 *
 * ユーザーがAIとリアルタイムで会話するためのメインインターフェース。
 * RAG（Retrieval-Augmented Generation）モードをサポート。
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { History } from "lucide-react";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { ChatInput } from "../../components/organisms/ChatInput";
import { ChatMessage } from "../../components/molecules/ChatMessage";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { SystemPromptPanel } from "../../components/organisms/SystemPromptPanel";
import { SystemPromptToggleButton } from "../../components/atoms/SystemPromptToggleButton";
import { SaveTemplateDialog } from "../../components/organisms/SaveTemplateDialog";
import { useAppStore } from "../../store";

// ============================================
// 定数定義
// ============================================
const EMPTY_STATE_MESSAGES = {
  primary: "メッセージを入力してAIと会話を始めましょう",
  hint: "Shift + Enter で改行、Enter で送信",
} as const;

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
  // Effects - テンプレート初期化
  // ----------------------------------------
  useEffect(() => {
    initializeTemplates();
  }, [initializeTemplates]);

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
  // Local State
  // ----------------------------------------
  const [error] = useState<string | null>(null);

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
  // Render - エラー状態
  // ----------------------------------------
  if (error) {
    return <ErrorDisplay message={error} className={className} />;
  }

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
        <button
          type="button"
          onClick={() => navigate("/chat/history")}
          aria-label="チャット履歴"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <History className="h-5 w-5" />
        </button>
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
