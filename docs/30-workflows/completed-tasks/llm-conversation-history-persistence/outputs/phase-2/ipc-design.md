# IPC設計書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-LLM-HISTORY-001                   |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |

---

## 概要

Electron IPC（Inter-Process Communication）を使用して、Renderer ProcessからMain Processの`ConversationRepository`にアクセスするためのインターフェース設計。

---

## チャンネル一覧

| チャンネル              | メソッド | 説明               |
| ----------------------- | -------- | ------------------ |
| conversation:list       | invoke   | 会話一覧取得       |
| conversation:get        | invoke   | 会話詳細取得       |
| conversation:create     | invoke   | 会話作成           |
| conversation:update     | invoke   | 会話更新           |
| conversation:delete     | invoke   | 会話削除（ソフト） |
| conversation:addMessage | invoke   | メッセージ追加     |
| conversation:search     | invoke   | 会話検索           |

---

## 型定義

### 共通レスポンス型

```typescript
// apps/desktop/src/preload/types.ts

/**
 * IPC成功レスポンス
 */
export interface IPCSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * IPCエラーレスポンス
 */
export interface IPCErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * IPCレスポンス（Union型）
 */
export type IPCResponse<T> = IPCSuccessResponse<T> | IPCErrorResponse;
```

### チャンネル別型定義

```typescript
// apps/desktop/src/preload/types.ts

/**
 * conversation:list
 */
export interface ConversationListRequest {
  userId: string;
  limit?: number;
  offset?: number;
}
export type ConversationListResponse = IPCResponse<ConversationSummary[]>;

/**
 * conversation:get
 */
export interface ConversationGetRequest {
  id: string;
}
export type ConversationGetResponse = IPCResponse<Conversation | null>;

/**
 * conversation:create
 */
export interface ConversationCreateRequest {
  userId: string;
  title: string;
  firstMessage?: {
    content: string;
    role: "user";
    systemPrompt?: string;
    llmProvider?: string;
    llmModel?: string;
  };
}
export type ConversationCreateResponse = IPCResponse<Conversation>;

/**
 * conversation:update
 */
export interface ConversationUpdateRequest {
  id: string;
  data: {
    title?: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    pinOrder?: number | null;
  };
}
export type ConversationUpdateResponse = IPCResponse<Conversation>;

/**
 * conversation:delete
 */
export interface ConversationDeleteRequest {
  id: string;
}
export type ConversationDeleteResponse = IPCResponse<{ deleted: boolean }>;

/**
 * conversation:addMessage
 */
export interface ConversationAddMessageRequest {
  sessionId: string;
  message: {
    role: "user" | "assistant";
    content: string;
    llmProvider?: string;
    llmModel?: string;
    llmMetadata?: Record<string, unknown>;
    systemPrompt?: string;
  };
}
export type ConversationAddMessageResponse = IPCResponse<Message>;

/**
 * conversation:search
 */
export interface ConversationSearchRequest {
  userId: string;
  query: string;
}
export type ConversationSearchResponse = IPCResponse<ConversationSummary[]>;
```

---

## Preload Bridge

```typescript
// apps/desktop/src/preload/index.ts

import { contextBridge, ipcRenderer } from "electron";

export const conversationAPI = {
  /**
   * 会話一覧を取得
   */
  list: (
    request: ConversationListRequest,
  ): Promise<ConversationListResponse> => {
    return ipcRenderer.invoke("conversation:list", request);
  },

  /**
   * 会話詳細を取得
   */
  get: (request: ConversationGetRequest): Promise<ConversationGetResponse> => {
    return ipcRenderer.invoke("conversation:get", request);
  },

  /**
   * 会話を作成
   */
  create: (
    request: ConversationCreateRequest,
  ): Promise<ConversationCreateResponse> => {
    return ipcRenderer.invoke("conversation:create", request);
  },

  /**
   * 会話を更新
   */
  update: (
    request: ConversationUpdateRequest,
  ): Promise<ConversationUpdateResponse> => {
    return ipcRenderer.invoke("conversation:update", request);
  },

  /**
   * 会話を削除
   */
  delete: (
    request: ConversationDeleteRequest,
  ): Promise<ConversationDeleteResponse> => {
    return ipcRenderer.invoke("conversation:delete", request);
  },

  /**
   * メッセージを追加
   */
  addMessage: (
    request: ConversationAddMessageRequest,
  ): Promise<ConversationAddMessageResponse> => {
    return ipcRenderer.invoke("conversation:addMessage", request);
  },

  /**
   * 会話を検索
   */
  search: (
    request: ConversationSearchRequest,
  ): Promise<ConversationSearchResponse> => {
    return ipcRenderer.invoke("conversation:search", request);
  },
};

// Rendererに公開
contextBridge.exposeInMainWorld("electronAPI", {
  conversation: conversationAPI,
  // ... 他のAPI
});
```

---

## Main Process Handler

```typescript
// apps/desktop/src/main/handlers/conversationHandlers.ts

import { ipcMain } from "electron";
import { ConversationRepository } from "../repositories/conversationRepository";

export function registerConversationHandlers(
  repository: ConversationRepository,
) {
  /**
   * conversation:list
   */
  ipcMain.handle(
    "conversation:list",
    async (_event, request: ConversationListRequest) => {
      try {
        const data = repository.listConversations(request.userId, {
          limit: request.limit,
          offset: request.offset,
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "DB_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  /**
   * conversation:get
   */
  ipcMain.handle(
    "conversation:get",
    async (_event, request: ConversationGetRequest) => {
      try {
        const data = repository.getConversation(request.id);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "DB_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  /**
   * conversation:create
   */
  ipcMain.handle(
    "conversation:create",
    async (_event, request: ConversationCreateRequest) => {
      try {
        const data = repository.createConversation(request);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "DB_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  /**
   * conversation:update
   */
  ipcMain.handle(
    "conversation:update",
    async (_event, request: ConversationUpdateRequest) => {
      try {
        const data = repository.updateConversation(request.id, request.data);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "DB_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  /**
   * conversation:delete
   */
  ipcMain.handle(
    "conversation:delete",
    async (_event, request: ConversationDeleteRequest) => {
      try {
        repository.deleteConversation(request.id);
        return { success: true, data: { deleted: true } };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "DB_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  /**
   * conversation:addMessage
   */
  ipcMain.handle(
    "conversation:addMessage",
    async (_event, request: ConversationAddMessageRequest) => {
      try {
        const data = repository.addMessage(request.sessionId, request.message);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "DB_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  /**
   * conversation:search
   */
  ipcMain.handle(
    "conversation:search",
    async (_event, request: ConversationSearchRequest) => {
      try {
        const data = repository.searchConversations(
          request.userId,
          request.query,
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "DB_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );
}
```

---

## Renderer側での使用例

```typescript
// apps/desktop/src/renderer/hooks/useConversations.ts

import { useCallback } from "react";
import { useDispatch } from "react-redux";

export function useConversations() {
  const dispatch = useDispatch();

  const loadConversations = useCallback(async () => {
    const response = await window.electronAPI.conversation.list({
      userId: "local-user",
      limit: 50,
    });

    if (response.success) {
      dispatch(setConversations(response.data));
    } else {
      console.error("Failed to load conversations:", response.error);
      dispatch(setError(response.error.message));
    }
  }, [dispatch]);

  const selectConversation = useCallback(
    async (id: string) => {
      const response = await window.electronAPI.conversation.get({ id });

      if (response.success && response.data) {
        dispatch(setCurrentConversation(response.data));
      } else {
        console.error("Failed to get conversation:", response.error);
      }
    },
    [dispatch],
  );

  return { loadConversations, selectConversation };
}
```

---

## エラーコード

| コード           | 説明               | 対処                       |
| ---------------- | ------------------ | -------------------------- |
| DB_ERROR         | データベースエラー | エラーメッセージをUIに表示 |
| NOT_FOUND        | 会話が見つからない | 一覧をリロード             |
| VALIDATION_ERROR | 入力データ不正     | 入力フォームにエラー表示   |
| UNKNOWN          | 不明なエラー       | 汎用エラーメッセージ表示   |

---

## テスト観点

| テスト観点 | 説明                                     |
| ---------- | ---------------------------------------- |
| 正常系     | 各チャンネルが正しくレスポンスを返すか   |
| エラー系   | エラー時に適切なエラーレスポンスを返すか |
| 型整合性   | 型定義通りのデータがやり取りされるか     |
| 並行処理   | 同時リクエストで問題が発生しないか       |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
