# React Context DI実装 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-006                                     |
| タスク名     | React Context DI実装                       |
| 分類         | リファクタリング                           |
| 対象機能     | チャット履歴機能（chat-history）           |
| 優先度       | 高                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（ドキュメント更新・未タスク検出） |
| 発見日       | 2026-01-19                                 |
| 関連タスク   | ARCH-001 Clean Architecture Refactoring    |
| 依存タスク   | UT-005 Drizzle Repository実装              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ARCH-001 Clean Architectureリファクタリングにて、`packages/shared`にチャット履歴機能のDomain/Application/Infrastructure層が実装された。これらのUse Caseやリポジトリを`apps/desktop`（Electronアプリ）から利用するには、依存性注入（Dependency Injection）の仕組みが必要である。

Clean Architecture設計では、Presentation層（React UI）がApplication層（Use Cases）に依存するが、具体的なRepositoryやServiceの実装は外部から注入される必要がある。

### 1.2 問題点・課題

- `packages/shared`のUse CasesをReactコンポーネントから直接利用する方法が未整備
- Repository実装の注入方法が未定義
- コンポーネント間での状態共有が考慮されていない
- テスト時のモック注入パターンが未確立

### 1.3 放置した場合の影響

- UI統合タスクがブロックされる
- チャット履歴機能がデスクトップアプリで利用できない
- テスタビリティが低下する
- コンポーネント間の依存関係が密結合になる

---

## 2. 何を達成するか（What）

### 2.1 目的

ReactのContext APIを使用して、Clean ArchitectureのUse CasesとRepositoriesをコンポーネントツリー全体に注入可能にする。

### 2.2 最終ゴール

- `ChatHistoryContext`によるDI基盤の構築
- `ChatHistoryProvider`コンポーネントの実装
- `useChatHistory` Custom Hookの実装
- Use Cases（5種類）へのアクセスを提供
- テスト用モックプロバイダーの実装

### 2.3 スコープ

#### 含むもの

- `ChatHistoryContext`の定義
- `ChatHistoryProvider`コンポーネントの実装
- `useChatHistory` Custom Hookの実装
- Use Cases Factory関数の実装
- テスト用`MockChatHistoryProvider`の実装
- 基本的なユニットテスト

#### 含まないもの

- 実際のUI統合（別タスク）
- フィーチャーフラグ実装
- 既存レガシーコードのマイグレーション
- パフォーマンス最適化（useMemo/useCallback）

### 2.4 成果物

| 成果物                      | 配置先                                                      |
| --------------------------- | ----------------------------------------------------------- |
| ChatHistoryContext.tsx      | `apps/desktop/src/features/chat-history/context/`           |
| ChatHistoryProvider.tsx     | `apps/desktop/src/features/chat-history/context/`           |
| useChatHistory.ts           | `apps/desktop/src/features/chat-history/hooks/`             |
| useChatHistoryFactory.ts    | `apps/desktop/src/features/chat-history/hooks/`             |
| MockChatHistoryProvider.tsx | `apps/desktop/src/features/chat-history/context/__mocks__/` |
| ChatHistoryContext.test.tsx | `apps/desktop/src/features/chat-history/context/__tests__/` |
| useChatHistory.test.ts      | `apps/desktop/src/features/chat-history/hooks/__tests__/`   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-005（Drizzle Repository実装）が完了していること
- 以下のUse Casesが`packages/shared`に実装済み:
  - `CreateChatSessionUseCase`
  - `AddUserMessageUseCase`
  - `AddAssistantMessageUseCase`
  - `TogglePinnedUseCase`
  - `SearchSessionsUseCase`
- 以下のリポジトリが実装済み:
  - `DrizzleChatSessionRepository`
  - `DrizzleChatMessageRepository`

### 3.2 依存タスク

| タスク   | ステータス | 必要性 |
| -------- | ---------- | ------ |
| ARCH-001 | 完了       | 必須   |
| UT-005   | 未着手     | 必須   |

### 3.3 必要な知識

- React Context API
- React Hooks（useContext, useMemo, useCallback）
- Clean Architecture DIパターン
- TypeScriptジェネリクス
- Vitest/Testing Library

### 3.4 推奨アプローチ

1. Context型定義から開始
2. Provider実装でUse Casesを構築
3. Custom Hookで型安全なアクセスを提供
4. テスト用モックプロバイダーを並行実装
5. ユニットテストで動作検証

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 概要                       |
| ----- | ------------ | -------------------------- |
| 1     | Context定義  | 型・インターフェース定義   |
| 2     | Provider実装 | DIコンテナとしてのProvider |
| 3     | Hook実装     | Custom Hookとファクトリー  |
| 4     | テスト・検証 | ユニットテスト・型検証     |

---

### Phase 1: Context定義

#### 目的

ChatHistoryContextの型定義とインターフェースを確立する。

#### 手順

1. `ChatHistoryContext.tsx`ファイルを作成

2. コンテキスト値の型を定義:

   ```typescript
   import type {
     CreateChatSessionUseCase,
     AddUserMessageUseCase,
     AddAssistantMessageUseCase,
     TogglePinnedUseCase,
     SearchSessionsUseCase,
   } from "@repo/shared";

   export interface ChatHistoryContextValue {
     // Use Cases
     createSession: CreateChatSessionUseCase;
     addUserMessage: AddUserMessageUseCase;
     addAssistantMessage: AddAssistantMessageUseCase;
     togglePinned: TogglePinnedUseCase;
     searchSessions: SearchSessionsUseCase;

     // State（将来拡張用）
     isReady: boolean;
   }
   ```

3. createContextでコンテキストを作成:

   ```typescript
   export const ChatHistoryContext =
     createContext<ChatHistoryContextValue | null>(null);
   ```

#### 成果物

- `ChatHistoryContext.tsx`

#### 完了条件

- 型定義が完了している
- ESLint/TypeScriptエラーなし

---

### Phase 2: Provider実装

#### 目的

Use Casesをインスタンス化し、コンポーネントツリーに提供するProviderを実装する。

#### 手順

1. `ChatHistoryProvider.tsx`ファイルを作成

2. Provider Props型を定義:

   ```typescript
   interface ChatHistoryProviderProps {
     children: React.ReactNode;
     // オプション：テスト用のカスタムリポジトリ注入
     sessionRepository?: IChatSessionRepository;
     messageRepository?: IChatMessageRepository;
   }
   ```

3. Use Cases Factory関数を実装:

   ```typescript
   function createUseCases(
     sessionRepo: IChatSessionRepository,
     messageRepo: IChatMessageRepository,
   ) {
     return {
       createSession: new CreateChatSessionUseCase(sessionRepo, messageRepo),
       addUserMessage: new AddUserMessageUseCase(sessionRepo, messageRepo),
       addAssistantMessage: new AddAssistantMessageUseCase(
         sessionRepo,
         messageRepo,
       ),
       togglePinned: new TogglePinnedUseCase(sessionRepo),
       searchSessions: new SearchSessionsUseCase(sessionRepo),
     };
   }
   ```

4. Providerコンポーネントを実装:

   ```typescript
   export function ChatHistoryProvider({
     children,
     sessionRepository,
     messageRepository,
   }: ChatHistoryProviderProps) {
     const [isReady, setIsReady] = useState(false);

     const useCases = useMemo(() => {
       // デフォルトはDrizzle Repositoryを使用
       const sessionRepo = sessionRepository ?? new DrizzleChatSessionRepository(db);
       const messageRepo = messageRepository ?? new DrizzleChatMessageRepository(db);
       return createUseCases(sessionRepo, messageRepo);
     }, [sessionRepository, messageRepository]);

     const value = useMemo<ChatHistoryContextValue>(
       () => ({
         ...useCases,
         isReady,
       }),
       [useCases, isReady]
     );

     useEffect(() => {
       // 初期化処理（DB接続確認など）
       setIsReady(true);
     }, []);

     return (
       <ChatHistoryContext.Provider value={value}>
         {children}
       </ChatHistoryContext.Provider>
     );
   }
   ```

#### 成果物

- `ChatHistoryProvider.tsx`

#### 完了条件

- Providerがコンパイルエラーなく実装されている
- Use Casesが正しく生成される

---

### Phase 3: Hook実装

#### 目的

コンポーネントからContext値を型安全に取得するCustom Hookを実装する。

#### 手順

1. `useChatHistory.ts`ファイルを作成

2. Custom Hookを実装:

   ```typescript
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

3. 個別Use Case Hooksを実装（オプション）:

   ```typescript
   export function useCreateSession() {
     const { createSession } = useChatHistory();
     return useCallback(
       (userId: string, title?: string) =>
         createSession.execute({ userId, title }),
       [createSession],
     );
   }

   export function useSearchSessions() {
     const { searchSessions } = useChatHistory();
     return useCallback(
       (params: SearchSessionsInput) => searchSessions.execute(params),
       [searchSessions],
     );
   }
   ```

4. エクスポート用インデックスファイルを作成

#### 成果物

- `useChatHistory.ts`
- `useChatHistoryFactory.ts`（オプション）

#### 完了条件

- Hookがnullチェックを含む
- 型推論が正しく機能する

---

### Phase 4: テスト・検証

#### 目的

ユニットテストとテスト用モックプロバイダーを実装し、動作を検証する。

#### 手順

1. `MockChatHistoryProvider.tsx`を作成:

   ```typescript
   export function MockChatHistoryProvider({
     children,
     overrides,
   }: {
     children: React.ReactNode;
     overrides?: Partial<ChatHistoryContextValue>;
   }) {
     const mockValue: ChatHistoryContextValue = {
       createSession: {
         execute: vi.fn().mockResolvedValue({ success: true, data: mockSession }),
       } as unknown as CreateChatSessionUseCase,
       // ... 他のUse Casesも同様
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

2. Context/Providerのテストを作成:

   ```typescript
   describe("ChatHistoryProvider", () => {
     it("should provide use cases to children", () => {
       const { result } = renderHook(() => useChatHistory(), {
         wrapper: ChatHistoryProvider,
       });

       expect(result.current.createSession).toBeDefined();
       expect(result.current.isReady).toBe(true);
     });

     it("should throw error when used outside provider", () => {
       expect(() => renderHook(() => useChatHistory())).toThrow();
     });
   });
   ```

3. 型チェック・Lint実行:

   ```bash
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/desktop lint
   ```

4. テスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage
   ```

#### 成果物

- `MockChatHistoryProvider.tsx`
- `ChatHistoryContext.test.tsx`
- `useChatHistory.test.ts`

#### 完了条件

- 全テストパス
- カバレッジ≥80%
- 型エラー0件
- Lintエラー0件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ChatHistoryContext`が定義されている
- [ ] `ChatHistoryProvider`が実装されている
- [ ] `useChatHistory`が実装されている
- [ ] 5種類のUse Casesにアクセス可能
- [ ] `MockChatHistoryProvider`が実装されている

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### ドキュメント要件

- [ ] JSDocコメントが記述されている
- [ ] 使用例がコメントに含まれている

---

## 6. 検証方法

### テストケース

| #   | テストケース                 | 期待結果                         |
| --- | ---------------------------- | -------------------------------- |
| 1   | Provider内でuseContextを使用 | Use Casesが取得できる            |
| 2   | Provider外でuseContextを使用 | エラーがスローされる             |
| 3   | createSessionの呼び出し      | Result型が返却される             |
| 4   | MockProviderでのテスト       | モックされた値が返却される       |
| 5   | カスタムリポジトリの注入     | 注入されたリポジトリが使用される |
| 6   | isReady初期状態              | falseで開始、trueに遷移          |

### 検証手順

1. ユニットテスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage
   ```

2. 型チェック:

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

3. Lint:

   ```bash
   pnpm --filter @repo/desktop lint
   ```

---

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                                    |
| ------------------------------- | ------ | -------- | --------------------------------------- |
| Use Cases型がexportされていない | 高     | 低       | packages/shared/index.tsを確認・修正    |
| DB接続の初期化タイミング問題    | 中     | 中       | isReadyフラグで初期化完了を管理         |
| テスト時のモック設定が複雑      | 中     | 中       | MockProviderでoverridesを提供           |
| パフォーマンス問題              | 低     | 低       | useMemo/useCallbackで最適化（将来対応） |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` |
| API仕様              | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   |
| Drizzle Repository   | `docs/30-workflows/unassigned-task/task-drizzle-repository-implementation.md`    |

### 参考資料

- [React Context Documentation](https://react.dev/reference/react/createContext)
- [Clean Architecture DIパターン](https://blog.cleancoder.com/)
- Clean Architecture (Robert C. Martin)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 12 未タスク検出レポートより:

UT-006: React Context DI実装
- 概要: apps/desktopでのReact Context DI実装
- 詳細: ChatHistoryContext, ChatHistoryProvider, useChatHistory hook
- 優先度: High
- 対応期限: UI統合時
- ステータス: 未着手（UI統合タスクに含める）
```

### 補足事項

- 本タスクはUI統合の前提条件として実装が必要
- UT-005（Drizzle Repository実装）完了後に着手可能
- パフォーマンス最適化（React.memo、useMemo活用）は将来対応
- フィーチャーフラグとの連携は別タスクで対応

---

**作成日**: 2026-01-19
**作成者**: Claude Code
**バージョン**: 1.0
