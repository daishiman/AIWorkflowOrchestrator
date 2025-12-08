import React, { useRef, useEffect, useState, useCallback } from "react";
import clsx from "clsx";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { ChatInput } from "../../components/organisms/ChatInput";
import { ChatMessage } from "../../components/molecules/ChatMessage";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { useAppStore } from "../../store";

export interface ChatViewProps {
  className?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ className }) => {
  // Use flat store structure
  const chatMessages = useAppStore((state) => state.chatMessages);
  const isSending = useAppStore((state) => state.isSending);
  const addMessage = useAppStore((state) => state.addMessage);
  const setChatInput = useAppStore((state) => state.setChatInput);
  const chatInput = useAppStore((state) => state.chatInput);
  const ragConnectionStatus = useAppStore((state) => state.ragConnectionStatus);

  // Local state for error
  const [error] = useState<string | null>(null);

  // Derived values
  const ragEnabled = ragConnectionStatus === "connected";

  // Action handlers
  const sendMessage = useCallback(
    (content: string) => {
      const newMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content,
        timestamp: new Date(),
      };
      addMessage(newMessage);
      setChatInput("");
    },
    [addMessage, setChatInput],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (chatInput.trim() && !isSending) {
      sendMessage(chatInput);
    }
  };

  const handleInputChange = (value: string) => {
    setChatInput(value);
  };

  if (error) {
    return <ErrorDisplay message={error} className={className} />;
  }

  return (
    <div
      className={clsx("flex flex-col h-full", className)}
      data-testid="chat-view"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h1 className="text-lg font-semibold text-white">AIチャット</h1>
          <p className="text-sm text-gray-400">
            {ragEnabled
              ? "RAG有効: ナレッジベースを参照して回答します"
              : "通常モード"}
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-auto p-4">
        <div role="log" aria-label="チャット履歴" className="h-full">
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 mb-2">
                  メッセージを入力してAIと会話を始めましょう
                </p>
                <p className="text-sm text-gray-500">
                  Shift + Enter で改行、Enter で送信
                </p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </main>

      {/* Input Area */}
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
    </div>
  );
};

ChatView.displayName = "ChatView";
