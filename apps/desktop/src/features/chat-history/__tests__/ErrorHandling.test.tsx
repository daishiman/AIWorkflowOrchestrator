/**
 * エラーハンドリングテスト
 *
 * Phase 4: タスク4 - TDD Red Phase
 * Provider/Hookのエラーハンドリングを検証する
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { ChatHistoryProvider } from "../context/ChatHistoryProvider";
import { useChatHistory } from "../hooks/useChatHistory";

describe("Error Handling Tests", () => {
  describe("useChatHistory without Provider", () => {
    it("should throw error when used outside of Provider", () => {
      // Provider外でuseChatHistoryを呼び出すとエラーがスローされる
      expect(() => {
        renderHook(() => useChatHistory());
      }).toThrow("useChatHistory must be used within a ChatHistoryProvider");
    });
  });

  describe("ChatHistoryProvider without repositories", () => {
    it("should throw error when sessionRepository is not provided", () => {
      // consoleエラーを抑制
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useChatHistory(), {
          wrapper: ({ children }) => (
            <ChatHistoryProvider messageRepository={undefined as never}>
              {children}
            </ChatHistoryProvider>
          ),
        });
      }).toThrow("Repository must be provided");

      consoleError.mockRestore();
    });

    it("should throw error when messageRepository is not provided", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useChatHistory(), {
          wrapper: ({ children }) => (
            <ChatHistoryProvider sessionRepository={undefined as never}>
              {children}
            </ChatHistoryProvider>
          ),
        });
      }).toThrow("Repository must be provided");

      consoleError.mockRestore();
    });

    it("should throw error when both repositories are not provided", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useChatHistory(), {
          wrapper: ({ children }) => (
            <ChatHistoryProvider>{children}</ChatHistoryProvider>
          ),
        });
      }).toThrow("Repository must be provided");

      consoleError.mockRestore();
    });
  });

  describe("Error message clarity", () => {
    it("should provide clear error message for missing Provider", () => {
      try {
        renderHook(() => useChatHistory());
      } catch (error: any) {
        expect(error.message).toContain("ChatHistoryProvider");
        expect(error.message).toContain("useChatHistory");
      }
    });

    it("should provide clear error message for missing repositories", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        renderHook(() => useChatHistory(), {
          wrapper: ({ children }) => (
            <ChatHistoryProvider>{children}</ChatHistoryProvider>
          ),
        });
      } catch (error: any) {
        expect(error.message).toContain("Repository");
      }

      consoleError.mockRestore();
    });
  });
});
