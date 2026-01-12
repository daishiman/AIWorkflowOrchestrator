/**
 * AgentChatInterface コンポーネントテスト
 * TDD: Red Phase - 実装前にテストを作成
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentChatInterface } from "../AgentChatInterface";
import type { AgentMessage } from "@repo/shared/types/agent";

// テスト用のモックメッセージ
const mockUserMessage: AgentMessage = {
  id: "msg-1",
  role: "user",
  content: "Hello, agent!",
  timestamp: new Date("2026-01-12T10:00:00Z"),
};

const mockAssistantMessage: AgentMessage = {
  id: "msg-2",
  role: "assistant",
  content: "Hello! How can I help you today?",
  timestamp: new Date("2026-01-12T10:00:05Z"),
};

const mockMessages: AgentMessage[] = [mockUserMessage, mockAssistantMessage];

describe("AgentChatInterface", () => {
  describe("rendering", () => {
    it("should render message list", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={mockMessages}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      expect(screen.getByRole("log")).toBeInTheDocument();
    });

    it("should render streaming output when streaming", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={[]}
          streamingContent="Streaming content..."
          isStreaming={true}
        />,
      );

      // Assert
      expect(screen.getByText("Streaming content...")).toBeInTheDocument();
    });

    it("should show empty state when no messages", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={[]}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      expect(
        screen.getByText(/メッセージを入力してください/i),
      ).toBeInTheDocument();
    });
  });

  describe("user messages", () => {
    it("should display user messages with correct styling", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={[mockUserMessage]}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      const messageElement = screen.getByText("Hello, agent!");
      expect(messageElement).toBeInTheDocument();
      // ユーザーメッセージは右寄せスタイルを持つべき
      expect(messageElement.closest("[data-role='user']")).toBeInTheDocument();
    });

    it("should display user avatar", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={[mockUserMessage]}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
    });
  });

  describe("assistant messages", () => {
    it("should display assistant messages with correct styling", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={[mockAssistantMessage]}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      const messageElement = screen.getByText(
        "Hello! How can I help you today?",
      );
      expect(messageElement).toBeInTheDocument();
      expect(
        messageElement.closest("[data-role='assistant']"),
      ).toBeInTheDocument();
    });

    it("should display assistant avatar", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={[mockAssistantMessage]}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      expect(screen.getByTestId("assistant-avatar")).toBeInTheDocument();
    });

    it("should render markdown content", () => {
      // Arrange
      const markdownMessage: AgentMessage = {
        id: "msg-3",
        role: "assistant",
        content: "Here is **bold** and *italic* text",
        timestamp: new Date(),
      };

      // Act
      render(
        <AgentChatInterface
          messages={[markdownMessage]}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      expect(screen.getByText("bold")).toBeInTheDocument();
      expect(screen.getByText("italic")).toBeInTheDocument();
    });
  });

  describe("streaming", () => {
    it("should display streaming content with cursor", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={[]}
          streamingContent="Generating response"
          isStreaming={true}
        />,
      );

      // Assert
      expect(screen.getByText("Generating response")).toBeInTheDocument();
      expect(screen.getByTestId("streaming-cursor")).toBeInTheDocument();
    });

    it("should auto-scroll to bottom on new content", async () => {
      // Arrange
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      // Act
      const { rerender } = render(
        <AgentChatInterface
          messages={[]}
          streamingContent="First"
          isStreaming={true}
        />,
      );

      rerender(
        <AgentChatInterface
          messages={[]}
          streamingContent="First Second"
          isStreaming={true}
        />,
      );

      // Assert
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have proper aria-labels", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={mockMessages}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      expect(screen.getByRole("log")).toHaveAttribute(
        "aria-label",
        expect.stringContaining("チャット"),
      );
    });

    it("should be keyboard navigable", () => {
      // Arrange & Act
      render(
        <AgentChatInterface
          messages={mockMessages}
          streamingContent=""
          isStreaming={false}
        />,
      );

      // Assert
      const log = screen.getByRole("log");
      expect(log).toHaveAttribute("tabIndex", "0");
    });
  });
});
