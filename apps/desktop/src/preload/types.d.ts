import type { electronAPI } from "./index";
import type { ConversationAPI } from "../shared/types/conversation";
import type { SkillAPI } from "./skill-api";

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    skillAPI: SkillAPI;
  }
}

export {};
