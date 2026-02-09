import type { electronAPI } from "./index";
import type { ConversationAPI } from "../shared/types/conversation";

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
  }
}

export {};
