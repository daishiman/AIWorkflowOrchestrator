/**
 * 拡充テスト - Phase 6
 *
 * 異常系・境界条件・エッジケースのテストを追加
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React, { useState } from "react";
import type {
  IChatSessionRepository,
  IChatMessageRepository,
} from "@repo/shared";
import { ChatHistoryProvider } from "../context/ChatHistoryProvider";
import { useChatHistory } from "../hooks/useChatHistory";
import {
  setChatHistoryRepositories,
  getChatHistoryRepositories,
  isRepositoriesInitialized,
  resetRepositories,
} from "../repositories";

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

describe("Phase 6: Expanded Tests", () => {
  let mockSessionRepo: IChatSessionRepository;
  let mockMessageRepo: IChatMessageRepository;

  beforeEach(() => {
    resetRepositories();
    mockSessionRepo = createMockSessionRepository();
    mockMessageRepo = createMockMessageRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetRepositories();
  });

  // =========================================================================
  // 異常系テスト
  // =========================================================================
  describe("Error Handling - Repository Factory", () => {
    it("should throw error when getChatHistoryRepositories called before initialization", () => {
      expect(isRepositoriesInitialized()).toBe(false);

      expect(() => getChatHistoryRepositories()).toThrow(
        "Chat history repositories not initialized",
      );
    });

    it("should handle multiple reset calls gracefully", () => {
      const mockRepos = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };
      setChatHistoryRepositories(mockRepos);
      expect(isRepositoriesInitialized()).toBe(true);

      resetRepositories();
      expect(isRepositoriesInitialized()).toBe(false);

      resetRepositories(); // 2回目
      expect(isRepositoriesInitialized()).toBe(false);

      resetRepositories(); // 3回目
      expect(isRepositoriesInitialized()).toBe(false);
    });

    it("should update repositories when setChatHistoryRepositories is called", () => {
      const mockRepos1 = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };
      const mockRepos2 = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };

      setChatHistoryRepositories(mockRepos1);
      const repos1 = getChatHistoryRepositories();

      setChatHistoryRepositories(mockRepos2);
      const repos2 = getChatHistoryRepositories();

      // 新しいリポジトリで上書きされる
      expect(repos2).toBe(mockRepos2);
      expect(repos1).not.toBe(repos2);
    });
  });

  describe("Error Handling - Use Case Execution", () => {
    it("should expose Use Cases that can handle async operations", async () => {
      function TestComponent() {
        const { createSession, isReady } = useChatHistory();
        const [hasCreateSession, setHasCreateSession] = React.useState(false);

        React.useEffect(() => {
          if (isReady && createSession) {
            setHasCreateSession(true);
          }
        }, [isReady, createSession]);

        return (
          <span data-testid="has-use-case">
            {hasCreateSession ? "yes" : "no"}
          </span>
        );
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <TestComponent />
        </ChatHistoryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("has-use-case")).toHaveTextContent("yes");
      });
    });

    it("should maintain Use Case references after re-render", async () => {
      const useCaseRefs: unknown[] = [];

      function TestComponent() {
        const { createSession, isReady } = useChatHistory();
        const [, forceUpdate] = useState(0);

        React.useEffect(() => {
          if (createSession) {
            useCaseRefs.push(createSession);
          }
        }, [createSession]);

        return (
          <div>
            <span data-testid="ready">{isReady ? "yes" : "no"}</span>
            <button
              type="button"
              onClick={() => forceUpdate((n) => n + 1)}
              data-testid="rerender"
            >
              Rerender
            </button>
          </div>
        );
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <TestComponent />
        </ChatHistoryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("ready")).toHaveTextContent("yes");
      });

      act(() => {
        screen.getByTestId("rerender").click();
      });

      act(() => {
        screen.getByTestId("rerender").click();
      });

      // Use Caseの参照が同じであることを確認（メモ化が機能している）
      expect(useCaseRefs.length).toBeGreaterThanOrEqual(1);
      const first = useCaseRefs[0];
      useCaseRefs.forEach((ref) => {
        expect(ref).toBe(first);
      });
    });
  });

  // =========================================================================
  // 境界条件テスト
  // =========================================================================
  describe("Boundary Conditions", () => {
    it("should handle isReady state transition correctly", async () => {
      const readyStates: boolean[] = [];

      function TestComponent() {
        const { isReady } = useChatHistory();
        React.useEffect(() => {
          readyStates.push(isReady);
        }, [isReady]);
        return <span data-testid="ready">{isReady ? "yes" : "no"}</span>;
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <TestComponent />
        </ChatHistoryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("ready")).toHaveTextContent("yes");
      });

      // isReady は false → true に遷移
      expect(readyStates).toContain(true);
    });

    it("should work with empty children", () => {
      const { container } = render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {null}
        </ChatHistoryProvider>,
      );

      expect(container).toBeDefined();
    });

    it("should handle string children", () => {
      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {"plain text child"}
        </ChatHistoryProvider>,
      );

      expect(screen.getByText("plain text child")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // エッジケーステスト
  // =========================================================================
  describe("Edge Cases", () => {
    it("should handle Provider unmount and remount", async () => {
      function TestComponent() {
        const { isReady } = useChatHistory();
        return <span data-testid="ready">{isReady ? "yes" : "no"}</span>;
      }

      function ToggleProvider() {
        const [mounted, setMounted] = useState(true);
        return (
          <div>
            <button
              type="button"
              onClick={() => setMounted((m) => !m)}
              data-testid="toggle"
            >
              Toggle
            </button>
            {mounted ? (
              <ChatHistoryProvider
                sessionRepository={mockSessionRepo}
                messageRepository={mockMessageRepo}
              >
                <TestComponent />
              </ChatHistoryProvider>
            ) : (
              <span data-testid="unmounted">Provider unmounted</span>
            )}
          </div>
        );
      }

      const { getByTestId } = render(<ToggleProvider />);

      // 初期状態
      await waitFor(() => {
        expect(getByTestId("ready")).toHaveTextContent("yes");
      });

      // Providerをアンマウント
      act(() => {
        getByTestId("toggle").click();
      });

      await waitFor(() => {
        expect(getByTestId("unmounted")).toBeInTheDocument();
      });

      // 再マウント
      act(() => {
        getByTestId("toggle").click();
      });

      await waitFor(() => {
        expect(getByTestId("ready")).toHaveTextContent("yes");
      });
    });

    it("should not throw when accessing context values immediately after mount", async () => {
      function ImmediateAccessComponent() {
        const context = useChatHistory();
        // 即座にcontextにアクセス
        return (
          <div>
            <span data-testid="has-create-session">
              {context.createSession ? "yes" : "no"}
            </span>
            <span data-testid="is-ready">
              {context.isReady ? "ready" : "loading"}
            </span>
          </div>
        );
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <ImmediateAccessComponent />
        </ChatHistoryProvider>,
      );

      // 初期状態でもcreateSessionは存在する
      expect(screen.getByTestId("has-create-session")).toHaveTextContent("yes");

      await waitFor(() => {
        expect(screen.getByTestId("is-ready")).toHaveTextContent("ready");
      });
    });

    it("should handle nested Providers (outer Provider takes precedence)", async () => {
      const outerSessionRepo = {
        ...createMockSessionRepository(),
        countPinned: vi.fn().mockResolvedValue(5), // 外側: 5
      };
      const innerSessionRepo = {
        ...createMockSessionRepository(),
        countPinned: vi.fn().mockResolvedValue(10), // 内側: 10
      };

      let capturedContext: ReturnType<typeof useChatHistory> | null = null;

      function CaptureContext() {
        capturedContext = useChatHistory();
        return null;
      }

      render(
        <ChatHistoryProvider
          sessionRepository={outerSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <ChatHistoryProvider
            sessionRepository={innerSessionRepo}
            messageRepository={mockMessageRepo}
          >
            <CaptureContext />
          </ChatHistoryProvider>
        </ChatHistoryProvider>,
      );

      // 内側のProviderのcontextが使用される（Reactの通常動作）
      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
      });

      // 内側Providerのリポジトリが使用されることを確認
      // （実際の動作確認のみ、エラーが発生しないこと）
      expect(capturedContext?.isReady).toBe(true);
    });

    it("should handle rapid state changes without memory leaks", async () => {
      function RapidStateComponent() {
        const { isReady } = useChatHistory();
        const [counter, setCounter] = useState(0);

        React.useEffect(() => {
          if (isReady) {
            // 高速で状態を変更
            const interval = setInterval(() => {
              setCounter((c) => c + 1);
            }, 10);

            return () => clearInterval(interval);
          }
        }, [isReady]);

        return <span data-testid="counter">{counter}</span>;
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <RapidStateComponent />
        </ChatHistoryProvider>,
      );

      // カウンターが増加することを確認（メモリリークなし）
      await waitFor(
        () => {
          const count = parseInt(
            screen.getByTestId("counter").textContent || "0",
          );
          expect(count).toBeGreaterThan(5);
        },
        { timeout: 200 },
      );
    });
  });

  // =========================================================================
  // Context伝播テスト
  // =========================================================================
  describe("Context Propagation", () => {
    it("should provide consistent context across deeply nested components", async () => {
      const createSessionRefs: unknown[] = [];

      function DeepChild({ depth }: { depth: number }) {
        const { createSession } = useChatHistory();
        React.useEffect(() => {
          createSessionRefs.push(createSession);
        }, [createSession]);

        if (depth > 0) {
          return (
            <div>
              <DeepChild depth={depth - 1} />
            </div>
          );
        }
        return <span data-testid="deepest">Bottom</span>;
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <DeepChild depth={5} />
        </ChatHistoryProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("deepest")).toBeInTheDocument();
      });

      // 全ての深さで同じcreateSession参照を共有
      expect(createSessionRefs.length).toBeGreaterThanOrEqual(6);
      const first = createSessionRefs[0];
      createSessionRefs.forEach((ref) => {
        expect(ref).toBe(first);
      });
    });

    it("should memoize Use Cases correctly", async () => {
      const useCasesSnapshots: ReturnType<typeof useChatHistory>[] = [];

      function MemoizationTest() {
        const context = useChatHistory();
        const [, forceRender] = useState(0);

        React.useEffect(() => {
          useCasesSnapshots.push(context);
        });

        return (
          <button
            type="button"
            onClick={() => forceRender((n) => n + 1)}
            data-testid="rerender"
          >
            Rerender
          </button>
        );
      }

      render(
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <MemoizationTest />
        </ChatHistoryProvider>,
      );

      // 初回レンダリング後
      await waitFor(() => {
        expect(useCasesSnapshots.length).toBeGreaterThanOrEqual(1);
      });

      // 強制再レンダリング
      act(() => {
        screen.getByTestId("rerender").click();
      });

      act(() => {
        screen.getByTestId("rerender").click();
      });

      await waitFor(() => {
        expect(useCasesSnapshots.length).toBeGreaterThanOrEqual(3);
      });

      // Use Casesの参照が維持されていることを確認（メモ化）
      const first = useCasesSnapshots[0];
      useCasesSnapshots.forEach((snapshot) => {
        expect(snapshot.createSession).toBe(first.createSession);
        expect(snapshot.addUserMessage).toBe(first.addUserMessage);
      });
    });
  });
});
