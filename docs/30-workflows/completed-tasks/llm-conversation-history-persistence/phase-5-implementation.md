# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | llm-conversation-history-persistence |
| 作成日 | 2026-01-24                           |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

- **Repository実装**: ConversationRepositoryクラスの実装
- **IPCハンドラー実装**: conversation:\*チャンネルのハンドラー実装
- **型定義**: TypeScript型定義の作成
- **DB初期化**: スキーマ・マイグレーション確認
- **エラーハンドリング**: 適切なエラー処理の実装

## 参照資料

| 資料名             | パス                                                                   | 説明          |
| ------------------ | ---------------------------------------------------------------------- | ------------- |
| 設計書             | `outputs/phase-2/architecture-design.md`                               | Phase 2成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                | Phase 4成果物 |
| database-schema.md | `.claude/skills/aiworkflow-requirements/references/database-schema.md` | DBスキーマ    |
| interfaces-llm.md  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`  | LLM型定義     |

## 実行手順

### ステップ1: 型定義の作成

```typescript
// apps/desktop/src/shared/types/conversation.ts

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string | null;
  isFavorite: boolean;
  isPinned: boolean;
}

export interface Conversation extends ConversationSummary {
  userId: string;
  messages: Message[];
  metadata: Record<string, unknown>;
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  messageIndex: number;
  timestamp: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
}

export interface CreateConversationInput {
  userId: string;
  title: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateConversationInput {
  title?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
}

export interface ListConversationsOptions {
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}
```

### ステップ2: Repository実装

```typescript
// apps/desktop/src/main/repositories/conversationRepository.ts

import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

export class ConversationRepository {
  constructor(private db: Database.Database) {}

  listConversations(
    userId: string,
    options?: ListConversationsOptions,
  ): ConversationSummary[] {
    // 実装
  }

  getConversation(id: string): Conversation | null {
    // 実装
  }

  createConversation(data: CreateConversationInput): Conversation {
    // トランザクション内で実行
  }

  updateConversation(id: string, data: UpdateConversationInput): Conversation {
    // 実装
  }

  deleteConversation(id: string): void {
    // ソフトデリート実装
  }

  addMessage(sessionId: string, message: CreateMessageInput): Message {
    // トランザクション内で実行
    // messageCount更新、lastMessagePreview更新、updatedAt更新
  }

  searchConversations(userId: string, query: string): ConversationSummary[] {
    // LIKE検索実装
  }
}
```

### ステップ3: IPCハンドラー実装

```typescript
// apps/desktop/src/main/handlers/conversation.ts

import { ipcMain } from "electron";
import { ConversationRepository } from "../repositories/conversationRepository";

export function registerConversationHandlers(
  repository: ConversationRepository,
) {
  ipcMain.handle("conversation:list", async (event, { userId, options }) => {
    try {
      const conversations = repository.listConversations(userId, options);
      return { success: true, data: conversations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("conversation:get", async (event, { id }) => {
    try {
      const conversation = repository.getConversation(id);
      return { success: true, data: conversation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("conversation:create", async (event, data) => {
    try {
      const conversation = repository.createConversation(data);
      return { success: true, data: conversation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("conversation:update", async (event, { id, data }) => {
    try {
      const conversation = repository.updateConversation(id, data);
      return { success: true, data: conversation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("conversation:delete", async (event, { id }) => {
    try {
      repository.deleteConversation(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(
    "conversation:addMessage",
    async (event, { sessionId, message }) => {
      try {
        const newMessage = repository.addMessage(sessionId, message);
        return { success: true, data: newMessage };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  );

  ipcMain.handle("conversation:search", async (event, { userId, query }) => {
    try {
      const conversations = repository.searchConversations(userId, query);
      return { success: true, data: conversations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
```

### ステップ4: Preload API追加

```typescript
// apps/desktop/src/preload/index.ts（追加部分）

export const conversationApi = {
  list: (userId: string, options?: ListConversationsOptions) =>
    ipcRenderer.invoke("conversation:list", { userId, options }),
  get: (id: string) => ipcRenderer.invoke("conversation:get", { id }),
  create: (data: CreateConversationInput) =>
    ipcRenderer.invoke("conversation:create", data),
  update: (id: string, data: UpdateConversationInput) =>
    ipcRenderer.invoke("conversation:update", { id, data }),
  delete: (id: string) => ipcRenderer.invoke("conversation:delete", { id }),
  addMessage: (sessionId: string, message: CreateMessageInput) =>
    ipcRenderer.invoke("conversation:addMessage", { sessionId, message }),
  search: (userId: string, query: string) =>
    ipcRenderer.invoke("conversation:search", { userId, query }),
};
```

### ステップ5: DBスキーマ確認・マイグレーション

既存の`chat_sessions`/`chat_messages`テーブルが存在するか確認し、なければマイグレーションを実行。

## 統合テスト連携【必須】

Main-Renderer間IPC接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                                   |
| ------------------ | ------------------------------------------------------ |
| IPC接続            | conversation:\*チャンネル7種のハンドラー登録           |
| エラーハンドリング | try-catch + { success: false, error } 形式でレスポンス |
| 状態同期           | 楽観的更新のためのIPC成功時Redux更新                   |

## 成果物

| 成果物        | パス                                                           | 説明           |
| ------------- | -------------------------------------------------------------- | -------------- |
| 型定義        | `apps/desktop/src/shared/types/conversation.ts`                | 会話関連型定義 |
| Repository    | `apps/desktop/src/main/repositories/conversationRepository.ts` | Repository実装 |
| IPCハンドラー | `apps/desktop/src/main/handlers/conversation.ts`               | IPC実装        |
| Preload API   | `apps/desktop/src/preload/index.ts`                            | Renderer用API  |

## 完了条件

- [ ] 型定義が作成されている
- [ ] ConversationRepositoryが実装されている
- [ ] 全IPCハンドラーが実装されている
- [ ] Preload APIが追加されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] IPC接続が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
