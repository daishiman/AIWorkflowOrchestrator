/**
 * App.tsx Provider統合テスト
 *
 * Phase 4: タスク2 - TDD Red Phase
 * App.tsxへのChatHistoryProvider統合を検証する
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import type {
  IChatSessionRepository,
  IChatMessageRepository,
} from "@repo/shared";
import { ChatHistoryProvider } from "../context/ChatHistoryProvider";
import { useChatHistory } from "../hooks/useChatHistory";

// モックリポジトリの作成
function createMockSessionRepository(): IChatSessionRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPinned: vi.fn(),
    search: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    exists: vi.fn(),
    countPinned: vi.fn().mockResolvedValue(0),
  };
}

function createMockMessageRepository(): IChatMessageRepository {
  return {
    findById: vi.fn(),
    findBySessionId: vi.fn(),
    findLatestBySessionId: vi.fn(),
    countBySessionId: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    saveMany: vi.fn(),
    delete: vi.fn(),
    deleteBySessionId: vi.fn(),
  };
}

// App.tsx風のテスト用コンポーネント
function TestApp({
  sessionRepository,
  messageRepository,
}: {
  sessionRepository: IChatSessionRepository;
  messageRepository: IChatMessageRepository;
}) {
  return (
    <ChatHistoryProvider
      sessionRepository={sessionRepository}
      messageRepository={messageRepository}
    >
      <TestChildComponent />
    </ChatHistoryProvider>
  );
}

function TestChildComponent() {
  const { isReady, createSession } = useChatHistory();

  return (
    <div>
      <span data-testid="is-ready">{isReady ? "ready" : "loading"}</span>
      <span data-testid="has-create-session">
        {createSession ? "yes" : "no"}
      </span>
    </div>
  );
}

describe("App.tsx Integration Tests", () => {
  let mockSessionRepo: IChatSessionRepository;
  let mockMessageRepo: IChatMessageRepository;

  beforeEach(() => {
    mockSessionRepo = createMockSessionRepository();
    mockMessageRepo = createMockMessageRepository();
  });

  describe("ChatHistoryProvider in App context", () => {
    it("should wrap child components with ChatHistoryProvider", async () => {
      render(
        <TestApp
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        />,
      );

      // 子コンポーネントがレンダリングされることを確認
      expect(screen.getByTestId("is-ready")).toBeInTheDocument();
    });

    it("should provide isReady state to child components", async () => {
      render(
        <TestApp
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        />,
      );

      // isReadyがtrueに遷移することを確認
      await waitFor(() => {
        expect(screen.getByTestId("is-ready")).toHaveTextContent("ready");
      });
    });

    it("should provide Use Cases to child components", async () => {
      render(
        <TestApp
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        />,
      );

      // createSessionが提供されることを確認
      await waitFor(() => {
        expect(screen.getByTestId("has-create-session")).toHaveTextContent(
          "yes",
        );
      });
    });
  });

  describe("Provider hierarchy", () => {
    it("should work with multiple levels of nesting", async () => {
      function DeeplyNestedComponent() {
        const { isReady } = useChatHistory();
        return <span data-testid="nested-ready">{isReady ? "yes" : "no"}</span>;
      }

      function MiddleComponent() {
        return (
          <div>
            <div>
              <DeeplyNestedComponent />
            </div>
          </div>
        );
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <MiddleComponent />
        </ChatHistoryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("nested-ready")).toHaveTextContent("yes");
      });
    });
  });

  describe("Multiple routes simulation", () => {
    it("should share context across sibling components", async () => {
      function RouteA() {
        const { isReady } = useChatHistory();
        return (
          <span data-testid="route-a">{isReady ? "a-ready" : "a-loading"}</span>
        );
      }

      function RouteB() {
        const { isReady } = useChatHistory();
        return (
          <span data-testid="route-b">{isReady ? "b-ready" : "b-loading"}</span>
        );
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <div>
            <RouteA />
            <RouteB />
          </div>
        </ChatHistoryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("route-a")).toHaveTextContent("a-ready");
        expect(screen.getByTestId("route-b")).toHaveTextContent("b-ready");
      });
    });
  });
});
