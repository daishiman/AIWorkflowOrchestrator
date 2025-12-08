import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "./index";

describe("ChatMessage", () => {
  describe("レンダリング", () => {
    it("メッセージをレンダリングする", () => {
      render(<ChatMessage role="user" content="Hello!" />);
      expect(screen.getByRole("article")).toBeInTheDocument();
    });

    it("コンテンツを表示する", () => {
      render(<ChatMessage role="user" content="Hello, world!" />);
      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });
  });

  describe("ロール", () => {
    it("userロールで右寄せスタイルを適用する", () => {
      render(<ChatMessage role="user" content="User message" />);
      expect(screen.getByRole("article")).toHaveClass("justify-end");
    });

    it("assistantロールで左寄せスタイルを適用する", () => {
      render(<ChatMessage role="assistant" content="Assistant message" />);
      expect(screen.getByRole("article")).toHaveClass("justify-start");
    });

    it("systemロールで中央寄せスタイルを適用する", () => {
      render(<ChatMessage role="system" content="System message" />);
      expect(screen.getByRole("article")).toHaveClass("justify-center");
    });

    it("userロールでaria-labelを設定する", () => {
      render(<ChatMessage role="user" content="Message" />);
      expect(screen.getByRole("article")).toHaveAttribute(
        "aria-label",
        "user message",
      );
    });

    it("assistantロールでaria-labelを設定する", () => {
      render(<ChatMessage role="assistant" content="Message" />);
      expect(screen.getByRole("article")).toHaveAttribute(
        "aria-label",
        "assistant message",
      );
    });
  });

  describe("スタイル", () => {
    it("userメッセージにblue背景を適用する", () => {
      const { container } = render(
        <ChatMessage role="user" content="User message" />,
      );
      const bubble = container.querySelector(".bg-blue-600");
      expect(bubble).toBeInTheDocument();
    });

    it("assistantメッセージにglass背景を適用する", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="Assistant message" />,
      );
      const bubble = container.querySelector(".bg-white\\/10");
      expect(bubble).toBeInTheDocument();
    });

    it("systemメッセージにyellow背景を適用する", () => {
      const { container } = render(
        <ChatMessage role="system" content="System message" />,
      );
      const bubble = container.querySelector(".bg-yellow-500\\/10");
      expect(bubble).toBeInTheDocument();
    });
  });

  describe("アバター", () => {
    it("assistantメッセージでアバターを表示する", () => {
      render(<ChatMessage role="assistant" content="Message" />);
      expect(
        screen.getByRole("img", { name: "Assistant" }),
      ).toBeInTheDocument();
    });

    it("userメッセージでアバターを表示しない", () => {
      render(<ChatMessage role="user" content="Message" />);
      expect(
        screen.queryByRole("img", { name: "Assistant" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("タイムスタンプ", () => {
    it("timestampを表示する", () => {
      const timestamp = new Date("2024-01-15T10:30:00");
      render(
        <ChatMessage role="user" content="Message" timestamp={timestamp} />,
      );
      // ja-JPフォーマットで表示
      expect(screen.getByText("10:30")).toBeInTheDocument();
    });

    it("timestampがない場合は表示しない", () => {
      render(<ChatMessage role="user" content="Message" />);
      expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    });

    it("loading状態ではtimestampを表示しない", () => {
      const timestamp = new Date("2024-01-15T10:30:00");
      render(
        <ChatMessage
          role="user"
          content="Message"
          timestamp={timestamp}
          loading
        />,
      );
      expect(screen.queryByText("10:30")).not.toBeInTheDocument();
    });
  });

  describe("loading状態", () => {
    it("loading=trueでローディングインジケーターを表示する", () => {
      render(<ChatMessage role="user" content="Message" loading />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("loading=falseでローディングインジケーターを表示しない", () => {
      render(<ChatMessage role="user" content="Message" loading={false} />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("loadingインジケーターにaria-labelを設定する", () => {
      render(<ChatMessage role="user" content="Message" loading />);
      expect(screen.getByLabelText("Loading message")).toBeInTheDocument();
    });
  });

  describe("ストリーミング", () => {
    it("streamingContentがある場合、それを表示する", () => {
      render(
        <ChatMessage
          role="assistant"
          content="Original content"
          streamingContent="Streaming content"
        />,
      );
      expect(screen.getByText("Streaming content")).toBeInTheDocument();
      expect(screen.queryByText("Original content")).not.toBeInTheDocument();
    });

    it("ストリーミング中にカーソルを表示する", () => {
      render(
        <ChatMessage
          role="assistant"
          content=""
          streamingContent="Streaming..."
        />,
      );
      expect(screen.getByLabelText("typing")).toBeInTheDocument();
    });

    it("ストリーミングでない場合、カーソルを表示しない", () => {
      render(<ChatMessage role="assistant" content="Complete message" />);
      expect(screen.queryByLabelText("typing")).not.toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(
        <ChatMessage role="user" content="Message" className="custom-class" />,
      );
      expect(screen.getByRole("article")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ChatMessage.displayName).toBe("ChatMessage");
    });
  });
});
