import { createContext } from "react";
import type {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  TogglePinnedUseCase,
  SearchSessionsUseCase,
} from "@repo/shared";

/**
 * ChatHistoryContext値の型定義
 * Clean ArchitectureのUse Casesを提供する
 */
export interface ChatHistoryContextValue {
  // Use Cases
  createSession: CreateChatSessionUseCase;
  addUserMessage: AddUserMessageUseCase;
  addAssistantMessage: AddAssistantMessageUseCase;
  togglePinned: TogglePinnedUseCase;
  searchSessions: SearchSessionsUseCase;

  // State
  isReady: boolean;
}

/**
 * ChatHistoryContext
 * Provider外での使用時はnullを返す
 */
export const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(
  null,
);
