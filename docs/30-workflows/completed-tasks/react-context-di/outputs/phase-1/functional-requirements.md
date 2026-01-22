# Phase 1 - 機能要件定義

## 確認日時

2026-01-22

---

## 1. 機能要件一覧

| 要件ID | 要件                                    | 優先度 | 詳細                                                  |
| ------ | --------------------------------------- | ------ | ----------------------------------------------------- |
| FR-001 | ChatHistoryContextが型安全に定義される  | 必須   | 5種のUse Casesを含む型定義をContextに設定             |
| FR-002 | ChatHistoryProviderが5種Use Casesを提供 | 必須   | Provider内でUse Casesを生成し、子コンポーネントに提供 |
| FR-003 | useChatHistoryが型安全にContextを取得   | 必須   | Custom HookでContextから型安全にUse Casesを取得       |
| FR-004 | Provider外使用時にエラーをスロー        | 必須   | Hookの不正使用を検知し、明確なエラーメッセージを表示  |
| FR-005 | MockChatHistoryProviderでテスト可能     | 必須   | テスト時にモックUse Casesを注入可能                   |
| FR-006 | カスタムRepository注入が可能            | 任意   | Providerに異なるRepository実装を注入可能              |

---

## 2. 機能要件詳細

### FR-001: ChatHistoryContextが型安全に定義される

**概要**: ReactのContext APIを使用して、5種のUse Casesインスタンスを型安全に保持する。

**詳細仕様**:

- Context値の型は`ChatHistoryContextValue`として定義
- 全5種のUse Casesメソッドを含む
- 初期値は`null`または`undefined`（Provider外検知用）

**型定義**:

```typescript
interface ChatHistoryContextValue {
  createChatSession: CreateChatSessionUseCase;
  addUserMessage: AddUserMessageUseCase;
  addAssistantMessage: AddAssistantMessageUseCase;
  togglePinned: TogglePinnedUseCase;
  searchSessions: SearchSessionsUseCase;
}
```

---

### FR-002: ChatHistoryProviderが5種Use Casesを提供

**概要**: Repositoryを受け取り、Use Casesを生成してContextに提供する。

**詳細仕様**:

- Props: `children`, `sessionRepository`, `messageRepository`
- Use Casesの生成はFactory関数で実施
- Contextの`Provider`を返す

**シグネチャ**:

```typescript
interface ChatHistoryProviderProps {
  children: React.ReactNode;
  sessionRepository: IChatSessionRepository;
  messageRepository: IChatMessageRepository;
}
```

---

### FR-003: useChatHistoryが型安全にContextを取得

**概要**: Context値を取得するCustom Hookを提供する。

**詳細仕様**:

- `useContext`でContext値を取得
- 型安全なContext値を返す
- Provider外の場合はエラーをスロー（FR-004）

**シグネチャ**:

```typescript
function useChatHistory(): ChatHistoryContextValue;
```

---

### FR-004: Provider外使用時にエラーをスロー

**概要**: Provider外でHookを使用した場合、明確なエラーをスローする。

**詳細仕様**:

- エラーメッセージ: `"useChatHistory must be used within a ChatHistoryProvider"`
- エラー型: `Error`
- Context値が`null`または`undefined`の場合にスロー

**エラー処理**:

```typescript
if (!context) {
  throw new Error("useChatHistory must be used within a ChatHistoryProvider");
}
```

---

### FR-005: MockChatHistoryProviderでテスト可能

**概要**: テスト用に全Use Casesをモック可能なProviderを提供する。

**詳細仕様**:

- デフォルトモック実装を提供
- 個別のUse Casesをオーバーライド可能
- スパイ関数のサポート

**シグネチャ**:

```typescript
interface MockChatHistoryProviderProps {
  children: React.ReactNode;
  overrides?: Partial<ChatHistoryContextValue>;
}
```

---

### FR-006: カスタムRepository注入が可能（任意）

**概要**: 異なるRepository実装を注入可能にする。

**詳細仕様**:

- Drizzle以外のRepository実装も対応可能
- InMemory実装、Test用実装等
- 将来の拡張性を確保

---

## 3. 受け入れ基準

| 基準ID | 基準                                    | 検証方法                        |
| ------ | --------------------------------------- | ------------------------------- |
| AC-001 | 全Use CasesにProvider経由でアクセス可能 | テストで5種全てのアクセスを検証 |
| AC-002 | TypeScript型エラーなし                  | `pnpm typecheck`で検証          |
| AC-003 | Provider外使用時にエラーメッセージ表示  | テストでエラースローを検証      |
| AC-004 | Line Coverage 80%以上                   | Vitestカバレッジレポートで検証  |
| AC-005 | MockProviderでテスト実行可能            | テストでモック動作を検証        |

---

## 4. 非機能要件

| 要件ID  | 要件         | 詳細                                  |
| ------- | ------------ | ------------------------------------- |
| NFR-001 | 型安全性     | TypeScript strictモードで型エラーなし |
| NFR-002 | テスト容易性 | 全コンポーネントがテスト可能          |
| NFR-003 | 保守性       | Clean Architecture原則に準拠          |
| NFR-004 | 再利用性     | 他の機能にも同様のパターンを適用可能  |

---

## 5. Use Cases連携仕様

### 5.1 CreateChatSessionUseCase

| 項目 | 内容                                    |
| ---- | --------------------------------------- |
| 入力 | `{ sessionId?, userId, model, title? }` |
| 出力 | `Promise<ChatSession>`                  |
| 依存 | `IChatSessionRepository`                |

### 5.2 AddUserMessageUseCase

| 項目 | 内容                                               |
| ---- | -------------------------------------------------- |
| 入力 | `{ sessionId, content }`                           |
| 出力 | `Promise<ChatMessage>`                             |
| 依存 | `IChatSessionRepository`, `IChatMessageRepository` |

### 5.3 AddAssistantMessageUseCase

| 項目 | 内容                                               |
| ---- | -------------------------------------------------- |
| 入力 | `{ sessionId, content, model?, inputTokens? }`     |
| 出力 | `Promise<ChatMessage>`                             |
| 依存 | `IChatSessionRepository`, `IChatMessageRepository` |

### 5.4 TogglePinnedUseCase

| 項目 | 内容                     |
| ---- | ------------------------ |
| 入力 | `{ sessionId }`          |
| 出力 | `Promise<ChatSession>`   |
| 依存 | `IChatSessionRepository` |

### 5.5 SearchSessionsUseCase

| 項目 | 内容                            |
| ---- | ------------------------------- |
| 入力 | `{ userId, keyword?, filters }` |
| 出力 | `Promise<ChatSession[]>`        |
| 依存 | `IChatSessionRepository`        |

---

## 結論

**Phase 1 タスク3: 完了**

全機能要件と受け入れ基準が定義され、実装に必要な仕様が明確になった。
