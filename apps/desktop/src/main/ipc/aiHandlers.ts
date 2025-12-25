import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  AIChatRequest,
  AIChatResponse,
  AICheckConnectionResponse,
  AIIndexRequest,
  AIIndexResponse,
} from "../../preload/types";

// Mock conversation storage
const conversations = new Map<string, string[]>();

// Generate unique conversation ID
function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function registerAIHandlers(): void {
  // Chat with AI
  ipcMain.handle(
    IPC_CHANNELS.AI_CHAT,
    async (_event, request: AIChatRequest): Promise<AIChatResponse> => {
      try {
        const conversationId =
          request.conversationId || generateConversationId();

        // Store message in conversation
        if (!conversations.has(conversationId)) {
          conversations.set(conversationId, []);
        }
        conversations.get(conversationId)?.push(request.message);

        // Log system prompt if provided (for debugging)
        if (request.systemPrompt) {
          console.log(
            `[AI_CHAT] System prompt provided (${request.systemPrompt.length} chars)`,
          );
        }

        // TODO: Replace with actual AI API call
        // When implementing real LLM integration, include systemPrompt:
        // const apiResponse = await callLLMAPI({
        //   messages: [
        //     ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        //     { role: 'user', content: request.message }
        //   ],
        //   ragEnabled: request.ragEnabled,
        // });

        // For now, return a mock response
        const mockResponses = [
          "ご質問ありがとうございます。ナレッジベースを検索しています...",
          "関連するドキュメントが見つかりました。詳細をお伝えします。",
          "その情報については、設計ドキュメントに詳しく記載されています。",
          "追加の質問があればお気軽にどうぞ。",
        ];

        const responseIndex = Math.floor(Math.random() * mockResponses.length);
        const aiMessage = mockResponses[responseIndex];

        return {
          success: true,
          data: {
            message: aiMessage,
            conversationId,
            ragSources: request.ragEnabled
              ? ["docs/design.md", "docs/api.md"]
              : undefined,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Check AI/RAG connection
  ipcMain.handle(
    IPC_CHANNELS.AI_CHECK_CONNECTION,
    async (): Promise<AICheckConnectionResponse> => {
      try {
        // TODO: Replace with actual connection check
        return {
          success: true,
          data: {
            status: "connected",
            indexedDocuments: 892,
            lastSyncTime: new Date(),
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Index documents for RAG
  ipcMain.handle(
    IPC_CHANNELS.AI_INDEX,
    async (_event, request: AIIndexRequest): Promise<AIIndexResponse> => {
      try {
        // TODO: Replace with actual indexing logic
        console.log(
          `Indexing folder: ${request.folderPath}, recursive: ${request.recursive}`,
        );

        // Simulate indexing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          success: true,
          data: {
            indexedCount: 15,
            skippedCount: 3,
            errors: [],
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}
