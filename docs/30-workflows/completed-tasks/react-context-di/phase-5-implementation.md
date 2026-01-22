# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装（TDD Green）     |
| 前提Phase  | Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充） |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | React Context DI実装  |

---

## 目的

TDDのGreen（テストを通す実装）フェーズとして、Phase 4で作成したテストを通す実装を行う。

## 背景

Phase 4で作成した失敗するテストを通すための最小限の実装を行う。Clean Architecture原則に従い、Use CasesをReactコンポーネントツリーに注入する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ディレクトリ構造作成

**目的**: 実装ファイルの配置先ディレクトリを作成する。

**実行手順**:

1. ディレクトリを作成:

   ```bash
   mkdir -p apps/desktop/src/features/chat-history/context
   mkdir -p apps/desktop/src/features/chat-history/hooks
   ```

2. インデックスファイルを作成（空）:
   - `apps/desktop/src/features/chat-history/context/index.ts`
   - `apps/desktop/src/features/chat-history/hooks/index.ts`

**期待される成果物**:

- ディレクトリ構造
- インデックスファイル（空）

---

### タスク2: ChatHistoryContext実装

**目的**: ChatHistoryContextの型定義とContext作成を実装する。

**実行手順**:

1. `ChatHistoryContext.tsx` を作成:

   ```typescript
   import { createContext } from "react";
   import type {
     CreateChatSessionUseCase,
     AddUserMessageUseCase,
     AddAssistantMessageUseCase,
     TogglePinnedUseCase,
     SearchSessionsUseCase,
   } from "@repo/shared";

   /**
    * ChatHistoryContext値の型定義
    * Clean ArchitectureのUse Casesを提供する
    */
   export interface ChatHistoryContextValue {
     // Use Cases
     createSession: CreateChatSessionUseCase;
     addUserMessage: AddUserMessageUseCase;
     addAssistantMessage: AddAssistantMessageUseCase;
     togglePinned: TogglePinnedUseCase;
     searchSessions: SearchSessionsUseCase;

     // State
     isReady: boolean;
   }

   /**
    * ChatHistoryContext
    * Provider外での使用時はnullを返す
    */
   export const ChatHistoryContext =
     createContext<ChatHistoryContextValue | null>(null);
   ```

2. テストを実行してContext定義テストが通ることを確認

**期待される成果物**:

- `apps/desktop/src/features/chat-history/context/ChatHistoryContext.tsx`

---

### タスク3: ChatHistoryProvider実装

**目的**: Use Casesをインスタンス化し、コンポーネントツリーに提供するProviderを実装する。

**実行手順**:

1. `ChatHistoryProvider.tsx` を作成:

   ```typescript
   import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
   import {
     CreateChatSessionUseCase,
     AddUserMessageUseCase,
     AddAssistantMessageUseCase,
     TogglePinnedUseCase,
     SearchSessionsUseCase,
     type IChatSessionRepository,
     type IChatMessageRepository,
   } from '@repo/shared';
   import {
     ChatHistoryContext,
     type ChatHistoryContextValue,
   } from './ChatHistoryContext';

   interface ChatHistoryProviderProps {
     children: ReactNode;
     sessionRepository?: IChatSessionRepository;
     messageRepository?: IChatMessageRepository;
   }

   /**
    * Use Cases Factory関数
    * RepositoryからUse Casesを生成する
    */
   function createUseCases(
     sessionRepo: IChatSessionRepository,
     messageRepo: IChatMessageRepository,
   ) {
     return {
       createSession: new CreateChatSessionUseCase(sessionRepo, messageRepo),
       addUserMessage: new AddUserMessageUseCase(sessionRepo, messageRepo),
       addAssistantMessage: new AddAssistantMessageUseCase(sessionRepo, messageRepo),
       togglePinned: new TogglePinnedUseCase(sessionRepo),
       searchSessions: new SearchSessionsUseCase(sessionRepo),
     };
   }

   /**
    * ChatHistoryProvider
    * Use Casesをコンポーネントツリーに提供する
    */
   export function ChatHistoryProvider({
     children,
     sessionRepository,
     messageRepository,
   }: ChatHistoryProviderProps) {
     const [isReady, setIsReady] = useState(false);

     const useCases = useMemo(() => {
       // カスタムリポジトリが渡された場合はそれを使用
       // そうでない場合はデフォルトのDrizzle Repositoryを使用
       // TODO: デフォルトRepository実装後に有効化
       if (!sessionRepository || !messageRepository) {
         throw new Error(
           'Repository must be provided. Default repository not yet implemented.',
         );
       }
       return createUseCases(sessionRepository, messageRepository);
     }, [sessionRepository, messageRepository]);

     const value = useMemo<ChatHistoryContextValue>(
       () => ({
         ...useCases,
         isReady,
       }),
       [useCases, isReady],
     );

     useEffect(() => {
       // 初期化処理
       setIsReady(true);
     }, []);

     return (
       <ChatHistoryContext.Provider value={value}>
         {children}
       </ChatHistoryContext.Provider>
     );
   }
   ```

2. テストを実行してProviderテストが通ることを確認

**期待される成果物**:

- `apps/desktop/src/features/chat-history/context/ChatHistoryProvider.tsx`

---

### タスク4: useChatHistory Hook実装

**目的**: Contextから値を型安全に取得するCustom Hookを実装する。

**実行手順**:

1. `useChatHistory.ts` を作成:

   ```typescript
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
       throw new Error(
         "useChatHistory must be used within a ChatHistoryProvider",
       );
     }

     return context;
   }
   ```

2. テストを実行してHookテストが通ることを確認

**期待される成果物**:

- `apps/desktop/src/features/chat-history/hooks/useChatHistory.ts`

---

### タスク5: MockChatHistoryProvider実装

**目的**: テスト用のMockProviderを実装する。

**実行手順**:

1. `MockChatHistoryProvider.tsx` を作成:

   ```typescript
   import React, { type ReactNode } from 'react';
   import { vi } from 'vitest';
   import type {
     CreateChatSessionUseCase,
     AddUserMessageUseCase,
     AddAssistantMessageUseCase,
     TogglePinnedUseCase,
     SearchSessionsUseCase,
   } from '@repo/shared';
   import {
     ChatHistoryContext,
     type ChatHistoryContextValue,
   } from '../ChatHistoryContext';

   interface MockChatHistoryProviderProps {
     children: ReactNode;
     overrides?: Partial<ChatHistoryContextValue>;
   }

   // デフォルトのモックセッション
   const mockSession = {
     id: 'mock-session-id',
     userId: 'mock-user-id',
     title: 'Mock Session',
     preview: '',
     isPinned: false,
     isFavorite: false,
     createdAt: new Date(),
     updatedAt: new Date(),
   };

   // デフォルトのモックメッセージ
   const mockMessage = {
     id: 'mock-message-id',
     sessionId: 'mock-session-id',
     role: 'user' as const,
     content: 'Mock message',
     messageIndex: 0,
     createdAt: new Date(),
   };

   /**
    * MockChatHistoryProvider
    * テスト用のモックProviderを提供する
    */
   export function MockChatHistoryProvider({
     children,
     overrides,
   }: MockChatHistoryProviderProps) {
     const mockValue: ChatHistoryContextValue = {
       createSession: {
         execute: vi.fn().mockResolvedValue({
           isOk: true,
           value: mockSession,
         }),
       } as unknown as CreateChatSessionUseCase,
       addUserMessage: {
         execute: vi.fn().mockResolvedValue({
           isOk: true,
           value: mockMessage,
         }),
       } as unknown as AddUserMessageUseCase,
       addAssistantMessage: {
         execute: vi.fn().mockResolvedValue({
           isOk: true,
           value: { ...mockMessage, role: 'assistant' },
         }),
       } as unknown as AddAssistantMessageUseCase,
       togglePinned: {
         execute: vi.fn().mockResolvedValue({
           isOk: true,
           value: { ...mockSession, isPinned: true },
         }),
       } as unknown as TogglePinnedUseCase,
       searchSessions: {
         execute: vi.fn().mockResolvedValue({
           isOk: true,
           value: { sessions: [mockSession], total: 1 },
         }),
       } as unknown as SearchSessionsUseCase,
       isReady: true,
       ...overrides,
     };

     return (
       <ChatHistoryContext.Provider value={mockValue}>
         {children}
       </ChatHistoryContext.Provider>
     );
   }
   ```

2. テストを実行してMockProviderテストが通ることを確認

**期待される成果物**:

- `apps/desktop/src/features/chat-history/context/__mocks__/MockChatHistoryProvider.tsx`

---

### タスク6: インデックスファイル更新

**目的**: 各モジュールのエクスポートを設定する。

**実行手順**:

1. `apps/desktop/src/features/chat-history/context/index.ts` を更新:

   ```typescript
   export {
     ChatHistoryContext,
     type ChatHistoryContextValue,
   } from "./ChatHistoryContext";
   export { ChatHistoryProvider } from "./ChatHistoryProvider";
   ```

2. `apps/desktop/src/features/chat-history/hooks/index.ts` を更新:

   ```typescript
   export { useChatHistory } from "./useChatHistory";
   ```

**期待される成果物**:

- `apps/desktop/src/features/chat-history/context/index.ts`
- `apps/desktop/src/features/chat-history/hooks/index.ts`

---

### タスク7: テスト実行確認（Green状態）

**目的**: 全テストが成功する（Green状態）ことを確認する。

**実行手順**:

1. Phase 4で作成したテストを更新（importコメント解除、Red→Green）
2. 全テストを実行:
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/
   ```
3. 全テストが成功することを確認
4. テスト結果を `outputs/phase-5/test-green-result.md` に記録

**期待される成果物**:

- `outputs/phase-5/test-green-result.md`（全テスト成功の証跡）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 型定義・Repository IF  |

### 前Phase成果物

| 参照資料         | パス                                 | 内容           |
| ---------------- | ------------------------------------ | -------------- |
| 設計ドキュメント | `outputs/phase-2/design-document.md` | 詳細設計       |
| Red状態結果      | `outputs/phase-4/test-red-result.md` | テスト失敗証跡 |

---

## 成果物

| 成果物        | パス                                                                                   | 内容             |
| ------------- | -------------------------------------------------------------------------------------- | ---------------- |
| Context       | `apps/desktop/src/features/chat-history/context/ChatHistoryContext.tsx`                | Context定義      |
| Provider      | `apps/desktop/src/features/chat-history/context/ChatHistoryProvider.tsx`               | Provider実装     |
| Hook          | `apps/desktop/src/features/chat-history/hooks/useChatHistory.ts`                       | Custom Hook      |
| MockProvider  | `apps/desktop/src/features/chat-history/context/__mocks__/MockChatHistoryProvider.tsx` | テスト用Mock     |
| Context Index | `apps/desktop/src/features/chat-history/context/index.ts`                              | エクスポート設定 |
| Hooks Index   | `apps/desktop/src/features/chat-history/hooks/index.ts`                                | エクスポート設定 |
| Green状態結果 | `outputs/phase-5/test-green-result.md`                                                 | テスト成功証跡   |

---

## 統合テスト連携（Phase 5は必須）

Use Cases連携実装とモック対応:

- MockProviderで全Use Casesがモック可能
- カスタムRepository注入でテスト時の依存解決

---

## 完了条件

- [ ] タスク1: ディレクトリ構造作成完了
- [ ] タスク2: ChatHistoryContext実装完了
- [ ] タスク3: ChatHistoryProvider実装完了
- [ ] タスク4: useChatHistory Hook実装完了
- [ ] タスク5: MockChatHistoryProvider実装完了
- [ ] タスク6: インデックスファイル更新完了
- [ ] タスク7: テスト実行確認（全テスト成功）完了
- [ ] 全成果物が出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証（Phase 5）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-6-test-expansion.md`
