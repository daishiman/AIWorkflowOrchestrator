# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-22                    |
| 機能名     | React Context DI実装          |

---

## 目的

Phase 1で定義した要件に基づき、Context/Provider/Hookの詳細設計を行う。

## 背景

Clean ArchitectureのUse CasesをReactコンポーネントから利用するためのDI基盤設計を行う。依存性逆転の原則（DIP）に従い、具体的な実装に依存せず抽象（Interface）に依存する設計を実現する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Context型設計

**目的**: ChatHistoryContextの型定義を設計する。

**実行手順**:

1. `ChatHistoryContextValue` 型を設計:

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

     // State
     isReady: boolean;
   }
   ```

2. Contextの作成方針を設計:
   - 初期値は `null` とする
   - Provider外での使用時に型安全にエラーをスローする

3. 設計を `outputs/phase-2/context-type-design.md` に記録

**期待される成果物**:

- `outputs/phase-2/context-type-design.md`

---

### タスク2: Provider設計

**目的**: ChatHistoryProviderのコンポーネント設計を行う。

**実行手順**:

1. Provider Props型を設計:

   ```typescript
   import type {
     IChatSessionRepository,
     IChatMessageRepository,
   } from "@repo/shared";

   interface ChatHistoryProviderProps {
     children: React.ReactNode;
     // オプション：テスト用のカスタムリポジトリ注入
     sessionRepository?: IChatSessionRepository;
     messageRepository?: IChatMessageRepository;
   }
   ```

2. Use Cases生成ロジックを設計:
   - デフォルトはDrizzle Repositoryを使用
   - カスタムリポジトリが渡された場合はそれを使用
   - useMemoでインスタンスをメモ化

3. 初期化フローを設計:
   - isReady: false → DB接続確認 → isReady: true

4. 設計を `outputs/phase-2/provider-design.md` に記録

**期待される成果物**:

- `outputs/phase-2/provider-design.md`

---

### タスク3: Hook設計

**目的**: useChatHistory Custom Hookの設計を行う。

**実行手順**:

1. `useChatHistory` hookを設計:

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

2. 個別Use Case Hooksを設計（オプション）:

   ```typescript
   export function useCreateSession() {
     const { createSession } = useChatHistory();
     return useCallback(
       (userId: string, title?: string) =>
         createSession.execute({ userId, title }),
       [createSession],
     );
   }
   ```

3. 設計を `outputs/phase-2/hook-design.md` に記録

**期待される成果物**:

- `outputs/phase-2/hook-design.md`

---

### タスク4: Mock Provider設計

**目的**: テスト用MockChatHistoryProviderの設計を行う。

**実行手順**:

1. MockChatHistoryProviderを設計:

   ```typescript
   interface MockChatHistoryProviderProps {
     children: React.ReactNode;
     overrides?: Partial<ChatHistoryContextValue>;
   }

   export function MockChatHistoryProvider({
     children,
     overrides,
   }: MockChatHistoryProviderProps) {
     const mockValue: ChatHistoryContextValue = {
       createSession: {
         execute: vi.fn().mockResolvedValue({
           success: true,
           data: mockSession,
         }),
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

2. デフォルトモック値を設計
3. overridesによる部分上書きを設計
4. 設計を `outputs/phase-2/mock-provider-design.md` に記録

**期待される成果物**:

- `outputs/phase-2/mock-provider-design.md`

---

### タスク5: インターフェース整合性確認

**目的**: packages/sharedのUse Cases/Repository型との整合性を確認する。

**実行手順**:

1. システム仕様を参照:
   - `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`
   - `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`

2. 以下の型整合性を確認:
   - `CreateChatSessionUseCase` の `execute` メソッドシグネチャ
   - `AddUserMessageUseCase` の `execute` メソッドシグネチャ
   - `AddAssistantMessageUseCase` の `execute` メソッドシグネチャ
   - `TogglePinnedUseCase` の `execute` メソッドシグネチャ
   - `SearchSessionsUseCase` の `execute` メソッドシグネチャ

3. Repository Interfaceとの整合性を確認:
   - `IChatSessionRepository`
   - `IChatMessageRepository`

4. 整合性確認結果を `outputs/phase-2/interface-compatibility.md` に記録

**期待される成果物**:

- `outputs/phase-2/interface-compatibility.md`

---

### タスク6: 設計ドキュメント作成

**目的**: Phase 2の設計を集約し、設計ドキュメントを作成する。

**実行手順**:

1. タスク1〜5の成果物を集約
2. 設計ドキュメントを `outputs/phase-2/design-document.md` に作成
3. 以下のセクションを含める:
   - コンポーネント図
   - 型定義一覧
   - データフロー
   - エラーハンドリング方針

**期待される成果物**:

- `outputs/phase-2/design-document.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 型定義・Repository IF  |
| API仕様              | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          | Use Case API詳細       |

### 前Phase成果物

| 参照資料         | パス                                     | 内容               |
| ---------------- | ---------------------------------------- | ------------------ |
| 要件定義レポート | `outputs/phase-1/requirements-report.md` | 要件・受け入れ基準 |

---

## 成果物

| 成果物               | パス                                         | 内容                 |
| -------------------- | -------------------------------------------- | -------------------- |
| Context型設計        | `outputs/phase-2/context-type-design.md`     | Context型定義        |
| Provider設計         | `outputs/phase-2/provider-design.md`         | Provider設計         |
| Hook設計             | `outputs/phase-2/hook-design.md`             | Custom Hook設計      |
| MockProvider設計     | `outputs/phase-2/mock-provider-design.md`    | テスト用Provider設計 |
| インターフェース整合 | `outputs/phase-2/interface-compatibility.md` | 型整合性確認         |
| 設計ドキュメント     | `outputs/phase-2/design-document.md`         | 集約設計ドキュメント |

---

## 統合テスト連携（Phase 2は必須）

Context/Provider/Hook間の契約を設計に反映する:

- Provider → Context: Use Cases値の提供
- Hook → Context: 値の取得・null チェック
- MockProvider → Context: テスト用モック値の提供

---

## 完了条件

- [ ] タスク1: Context型設計完了
- [ ] タスク2: Provider設計完了
- [ ] タスク3: Hook設計完了
- [ ] タスク4: MockProvider設計完了
- [ ] タスク5: インターフェース整合性確認完了
- [ ] タスク6: 設計ドキュメント作成完了
- [ ] 全成果物が `outputs/phase-2/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-3-design-review.md`
