import React, { type ReactNode } from "react";
import { vi } from "vitest";
import type {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  TogglePinnedUseCase,
  SearchSessionsUseCase,
} from "@repo/shared";
import {
  ChatHistoryContext,
  type ChatHistoryContextValue,
} from "../ChatHistoryContext";

export interface MockChatHistoryProviderProps {
  children: ReactNode;
  overrides?: Partial<ChatHistoryContextValue>;
}

// デフォルトのモックセッション
const mockSession = {
  id: "mock-session-id",
  userId: "mock-user-id",
  title: "Mock Session",
  lastMessagePreview: null,
  messageCount: 0,
  isPinned: false,
  pinOrder: null,
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// デフォルトのモックメッセージ
const mockMessage = {
  id: "mock-message-id",
  sessionId: "mock-session-id",
  role: "user" as const,
  content: "Mock message",
  messageIndex: 0,
  llmModel: null,
  llmProvider: null,
  tokenUsage: null,
  createdAt: new Date().toISOString(),
};

/**
 * MockChatHistoryProvider
 * テスト用のモックProviderを提供する
 */
export function MockChatHistoryProvider({
  children,
  overrides,
}: MockChatHistoryProviderProps) {
  const mockValue: ChatHistoryContextValue = {
    createSession: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { session: mockSession },
      }),
    } as unknown as CreateChatSessionUseCase,
    addUserMessage: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { message: mockMessage, updatedSession: mockSession },
      }),
    } as unknown as AddUserMessageUseCase,
    addAssistantMessage: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          message: { ...mockMessage, role: "assistant" },
          updatedSession: mockSession,
        },
      }),
    } as unknown as AddAssistantMessageUseCase,
    togglePinned: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { session: { ...mockSession, isPinned: true }, isPinned: true },
      }),
    } as unknown as TogglePinnedUseCase,
    searchSessions: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { sessions: [mockSession], total: 1 },
      }),
    } as unknown as SearchSessionsUseCase,
    isReady: true,
    ...overrides,
  };

  return (
    <ChatHistoryContext.Provider value={mockValue}>
      {children}
    </ChatHistoryContext.Provider>
  );
}
