# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| Phase名    | 実装（TDD: Green）             |
| 前提Phase  | Phase 4（テスト作成）          |
| 後続Phase  | Phase 6（テスト拡充）          |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

Phase 4で作成したテストを通す最小限の実装を行う（TDD: Green状態）。

## 背景

TDDサイクルの2番目のフェーズとして、テストを通す実装を行う。Strangler Fig Patternに従い、既存コードを壊さずに新アーキテクチャを並行実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。サブタスクT-05-1〜T-05-5を順番に実行すること。

### タスク1（T-05-1）: ドメイン層純粋化実装

**目的**: Drizzle依存を除去し、純粋なドメインエンティティを実装する

**実行手順**:

1. Result型を実装する:

   ```typescript
   // packages/shared/src/core/Result.ts
   // Phase 2設計に基づき実装
   ```

2. エラー型階層を実装する:

   ```typescript
   // packages/shared/src/core/errors/index.ts
   // DomainError, ChatSessionError, ChatMessageError等
   ```

3. 値オブジェクトを実装する:
   - `ChatSessionId`
   - `ChatSessionTitle`
   - `MessageContent`
   - `ChatMessageId`
   - `UserId`
   - `MessageRole`
   - `LLMMetadata`

4. ChatSessionエンティティを実装する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/entities/ChatSession.ts
   // Phase 2設計に基づき実装
   // Drizzle型へのimportを含まないこと
   ```

5. ChatMessageエンティティを実装する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/entities/ChatMessage.ts
   // Phase 2設計に基づき実装
   ```

6. リポジトリインターフェースを実装する:
   ```typescript
   // packages/shared/src/features/chat-history/domain/repositories/IChatSessionRepository.ts
   // packages/shared/src/features/chat-history/domain/repositories/IChatMessageRepository.ts
   ```

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run domain
```

- [ ] ドメイン層のテストが成功することを確認

**期待される成果物**:

- `packages/shared/src/core/Result.ts`
- `packages/shared/src/core/errors/index.ts`
- `packages/shared/src/features/chat-history/domain/value-objects/*.ts`
- `packages/shared/src/features/chat-history/domain/entities/*.ts`
- `packages/shared/src/features/chat-history/domain/repositories/*.ts`

---

### タスク2（T-05-2）: Use Caseパターン導入実装

**目的**: ChatHistoryServiceを単一責務のUse Caseに分割する

**実行手順**:

1. DTOを実装する:

   ```typescript
   // packages/shared/src/features/chat-history/application/dto/ChatSessionDTO.ts
   // packages/shared/src/features/chat-history/application/dto/ChatMessageDTO.ts
   ```

2. CreateChatSessionUseCaseを実装する:

   ```typescript
   // packages/shared/src/features/chat-history/application/use-cases/CreateChatSessionUseCase.ts
   ```

3. AddMessageUseCaseを実装する:

   ```typescript
   // packages/shared/src/features/chat-history/application/use-cases/AddMessageUseCase.ts
   ```

4. その他のUse Caseを実装する:
   - `SearchSessionsUseCase`
   - `ExportSessionUseCase`
   - `UpdateSessionUseCase`
   - `DeleteSessionUseCase`
   - `ToggleFavoriteUseCase`
   - `TogglePinnedUseCase`
   - `GetSessionWithMessagesUseCase`
   - `ListSessionsUseCase`

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run use-cases
```

- [ ] Use Caseのテストが成功することを確認

**期待される成果物**:

- `packages/shared/src/features/chat-history/application/dto/*.ts`
- `packages/shared/src/features/chat-history/application/use-cases/*.ts`

---

### タスク3（T-05-3）: リポジトリ再配置とマッパー実装

**目的**: リポジトリを `infrastructure/` に移動し、マッパーでドメインとDBを分離する

**実行手順**:

1. マッパーを実装する:

   ```typescript
   // packages/shared/src/infrastructure/persistence/mappers/ChatSessionMapper.ts
   // packages/shared/src/infrastructure/persistence/mappers/ChatMessageMapper.ts
   ```

2. Drizzleリポジトリ実装を作成する:

   ```typescript
   // packages/shared/src/infrastructure/persistence/drizzle/DrizzleChatSessionRepository.ts
   export class DrizzleChatSessionRepository implements IChatSessionRepository {
     constructor(private readonly db: DrizzleDB) {}

     async findById(id: ChatSessionId): Promise<ChatSession | null> {
       const record = await this.db.query.chatSessions.findFirst({
         where: eq(chatSessions.id, id.value),
       });
       if (!record) return null;
       const result = ChatSessionMapper.toDomain(record);
       return result.ok ? result.value : null;
     }

     // 他のメソッドも同様に実装
   }
   ```

3. DrizzleChatMessageRepositoryを実装する:
   ```typescript
   // packages/shared/src/infrastructure/persistence/drizzle/DrizzleChatMessageRepository.ts
   ```

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run mappers
pnpm --filter @repo/shared test:run repositories
```

- [ ] マッパーのテストが成功することを確認
- [ ] リポジトリのテストが成功することを確認

**期待される成果物**:

- `packages/shared/src/infrastructure/persistence/mappers/*.ts`
- `packages/shared/src/infrastructure/persistence/drizzle/*.ts`

---

### タスク4（T-05-4）: React Context DIパターン実装

**目的**: UI層の直接的なサービス依存を解消し、DIパターンを実装する

**実行手順**:

1. ChatHistoryContextを実装する:

   ```typescript
   // apps/desktop/src/contexts/ChatHistoryContext.tsx
   ```

2. useChatHistoryフックを実装する:

   ```typescript
   // apps/desktop/src/hooks/useChatHistory.ts
   ```

3. ChatHistoryProviderを実装する:

   ```typescript
   // apps/desktop/src/contexts/ChatHistoryProvider.tsx
   export function ChatHistoryProvider({ children }: { children: ReactNode }) {
     // リポジトリのインスタンス化
     const db = useDrizzleDB() // 既存のDB取得フック
     const sessionRepository = useMemo(
       () => new DrizzleChatSessionRepository(db),
       [db]
     )
     const messageRepository = useMemo(
       () => new DrizzleChatMessageRepository(db),
       [db]
     )

     // Use Caseのインスタンス化
     const createSessionUseCase = useMemo(
       () => new CreateChatSessionUseCase(sessionRepository),
       [sessionRepository]
     )
     // ... 他のUse Case

     // 状態管理
     const [currentSession, setCurrentSession] = useState<ChatSessionDTO | null>(null)
     const [sessions, setSessions] = useState<ChatSessionDTO[]>([])
     const [isLoading, setIsLoading] = useState(false)
     const [error, setError] = useState<Error | null>(null)

     // Contextへの提供
     const value: ChatHistoryContextValue = {
       createSession: async (input) => { /* Use Case呼び出し */ },
       // ... 他のメソッド
       currentSession,
       sessions,
       isLoading,
       error,
     }

     return (
       <ChatHistoryContext.Provider value={value}>
         {children}
       </ChatHistoryContext.Provider>
     )
   }
   ```

4. 既存コンポーネントのChatHistoryService直接呼び出しをフック経由に変更する:
   - フィーチャーフラグ `USE_NEW_CHAT_HISTORY_ARCH` を導入
   - フラグONの場合は新Contextを使用
   - フラグOFFの場合は既存実装を使用

**期待される成果物**:

- `apps/desktop/src/contexts/ChatHistoryContext.tsx`
- `apps/desktop/src/contexts/ChatHistoryProvider.tsx`
- `apps/desktop/src/hooks/useChatHistory.ts`

---

### タスク5（T-05-5）: 型定義3層分離実装

**目的**: `types/` を削除し、Domain/DTO/Persistenceの3層に型定義を明確に分離する

**実行手順**:

1. 型定義の移行を確認する:
   - Domain型: `domain/entities/`, `domain/value-objects/` に配置済み
   - DTO型: `application/dto/` に配置済み
   - Persistence型: `db/schema/chat-history.ts` のDrizzle推論型を使用

2. 既存の `types/` ディレクトリの内容を確認する:

   ```
   packages/shared/src/features/chat-history/types/
   ├── chat-session.ts  # → 削除対象
   └── chat-message.ts  # → 削除対象
   ```

3. 既存の `types/` を参照しているコードを特定し、移行する:
   - Domain層: エンティティ/値オブジェクトを直接使用
   - Application層: DTOを使用
   - Infrastructure層: Drizzle推論型を使用

4. `types/` ディレクトリを削除する:
   - 全ての参照が移行されていることを確認
   - ディレクトリを削除

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run
pnpm --filter @repo/shared typecheck
```

- [ ] 全テストが成功することを確認
- [ ] TypeScript型エラーがないことを確認

**期待される成果物**:

- `types/chat-session.ts` の削除
- `types/chat-message.ts` の削除
- 移行完了レポート

---

### タスク6: 全体テスト実行（Green状態確認）

**目的**: 全テストが成功することを確認する

**実行手順**:

1. 全テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run
   pnpm --filter @repo/desktop test:run
   ```

2. 以下を確認する:
   - [ ] 新規作成したテストが全て成功すること（Green状態）
   - [ ] 既存テストが全て成功すること（リグレッションなし）
   - [ ] TypeScript型エラーがないこと

**期待される成果物**:

- `outputs/phase-5/implementation-report.md` - 実装完了レポート

---

## 参照資料

| 参照資料           | パス                                        | 内容             |
| ------------------ | ------------------------------------------- | ---------------- |
| Phase 2成果物      | `outputs/phase-2/`                          | 設計成果物       |
| Phase 4成果物      | テストファイル群                            | テストコード     |
| エンティティ設計書 | `outputs/phase-2/domain-entities-design.md` | エンティティ設計 |
| Use Case設計書     | `outputs/phase-2/use-cases-design.md`       | Use Case設計     |
| インフラ層設計書   | `outputs/phase-2/infrastructure-design.md`  | マッパー設計     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                   |
| ---------------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 既存ビジネスルール仕様 |
| データベース実装             | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM仕様        |

---

## 成果物

| 成果物         | パス                                                               | 内容                   |
| -------------- | ------------------------------------------------------------------ | ---------------------- |
| Result型       | `packages/shared/src/core/Result.ts`                               | Result型実装           |
| エラー型       | `packages/shared/src/core/errors/`                                 | エラー型階層           |
| 値オブジェクト | `packages/shared/src/features/chat-history/domain/value-objects/`  | 値オブジェクト実装     |
| エンティティ   | `packages/shared/src/features/chat-history/domain/entities/`       | エンティティ実装       |
| リポジトリIF   | `packages/shared/src/features/chat-history/domain/repositories/`   | リポジトリIF定義       |
| DTO            | `packages/shared/src/features/chat-history/application/dto/`       | DTO実装                |
| Use Case       | `packages/shared/src/features/chat-history/application/use-cases/` | Use Case実装           |
| マッパー       | `packages/shared/src/infrastructure/persistence/mappers/`          | マッパー実装           |
| リポジトリ実装 | `packages/shared/src/infrastructure/persistence/drizzle/`          | Drizzleリポジトリ実装  |
| Context        | `apps/desktop/src/contexts/`                                       | ChatHistoryContext実装 |
| フック         | `apps/desktop/src/hooks/useChatHistory.ts`                         | カスタムフック実装     |
| 実装レポート   | `outputs/phase-5/implementation-report.md`                         | 実装完了レポート       |

---

## 統合テスト連携

各レイヤー間の接続実装とテスト支援コード整備を行うこと:

- マッパーによるDomain-Persistence変換が正しく動作すること
- Use CaseからRepositoryへの依存注入が正しく動作すること
- React ContextからUse Caseへのアクセスが正しく動作すること

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 完了条件

- [ ] Result型・エラー型が実装されている
- [ ] 全値オブジェクトが実装されている
- [ ] 全エンティティが実装されている
- [ ] リポジトリインターフェースが実装されている
- [ ] 全DTOが実装されている
- [ ] 全Use Caseが実装されている
- [ ] 全マッパーが実装されている
- [ ] Drizzleリポジトリ実装が完了している
- [ ] React Context/Providerが実装されている
- [ ] カスタムフックが実装されている
- [ ] `types/` ディレクトリが削除されている
- [ ] 全テストが成功している（Green状態）
- [ ] 既存テストにリグレッションがない
- [ ] 実装レポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 5ステータスを更新

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-6-test-expansion.md`
