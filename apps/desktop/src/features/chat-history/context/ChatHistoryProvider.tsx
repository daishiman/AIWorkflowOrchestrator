import React, { useMemo, useState, useEffect, type ReactNode } from "react";
import {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  TogglePinnedUseCase,
  SearchSessionsUseCase,
  type IChatSessionRepository,
  type IChatMessageRepository,
} from "@repo/shared";
import {
  ChatHistoryContext,
  type ChatHistoryContextValue,
} from "./ChatHistoryContext";

export interface ChatHistoryProviderProps {
  children: ReactNode;
  sessionRepository?: IChatSessionRepository;
  messageRepository?: IChatMessageRepository;
}

/**
 * Use Cases Factory関数
 * RepositoryからUse Casesを生成する
 */
function createUseCases(
  sessionRepo: IChatSessionRepository,
  messageRepo: IChatMessageRepository,
) {
  return {
    createSession: new CreateChatSessionUseCase(sessionRepo),
    addUserMessage: new AddUserMessageUseCase(sessionRepo, messageRepo),
    addAssistantMessage: new AddAssistantMessageUseCase(
      sessionRepo,
      messageRepo,
    ),
    togglePinned: new TogglePinnedUseCase(sessionRepo),
    searchSessions: new SearchSessionsUseCase(sessionRepo),
  };
}

/**
 * ChatHistoryProvider
 * Use Casesをコンポーネントツリーに提供する
 */
export function ChatHistoryProvider({
  children,
  sessionRepository,
  messageRepository,
}: ChatHistoryProviderProps) {
  const [isReady, setIsReady] = useState(false);

  const useCases = useMemo(() => {
    // カスタムリポジトリが渡された場合はそれを使用
    // そうでない場合はデフォルトのDrizzle Repositoryを使用
    // TODO: デフォルトRepository実装後に有効化
    if (!sessionRepository || !messageRepository) {
      throw new Error(
        "Repository must be provided. Default repository not yet implemented.",
      );
    }
    return createUseCases(sessionRepository, messageRepository);
  }, [sessionRepository, messageRepository]);

  const value = useMemo<ChatHistoryContextValue>(
    () => ({
      ...useCases,
      isReady,
    }),
    [useCases, isReady],
  );

  useEffect(() => {
    // 初期化処理
    setIsReady(true);
  }, []);

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}
