import { useContext } from "react";
import {
  ChatHistoryContext,
  type ChatHistoryContextValue,
} from "../context/ChatHistoryContext";

/**
 * useChatHistory Hook
 * Provider内でのみ使用可能
 * Provider外で使用するとエラーをスローする
 */
export function useChatHistory(): ChatHistoryContextValue {
  const context = useContext(ChatHistoryContext);

  if (context === null) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }

  return context;
}
