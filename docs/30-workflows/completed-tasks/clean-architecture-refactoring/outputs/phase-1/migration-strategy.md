# 移行戦略書

## 概要

本文書は、Strangler Fig Patternを適用したチャット履歴機能のClean Architecture移行戦略を定義する。

**作成日**: 2026-01-18
**パターン**: Strangler Fig Pattern
**移行期間**: Phase 4〜11（実装〜手動テスト）

---

## 1. Strangler Fig Pattern概要

### 1.1 パターン説明

Strangler Fig Pattern（絞め殺しの木パターン）は、既存システムを段階的に新システムに置き換える移行パターン。

```
┌─────────────────────────────────────────────────────────────┐
│                        ユーザーリクエスト                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      ルーター/ファサード                      │
│                  (フィーチャーフラグで振り分け)                │
└───────────┬─────────────────────────────┬───────────────────┘
            │                             │
     USE_NEW_ARCH=false              USE_NEW_ARCH=true
            │                             │
            ▼                             ▼
┌───────────────────────┐     ┌───────────────────────┐
│     旧アーキテクチャ    │     │     新アーキテクチャ    │
│   ChatHistoryService   │     │      Use Cases        │
│   (単一クラス)         │     │   (責務分離)          │
└───────────────────────┘     └───────────────────────┘
```

### 1.2 採用理由

| 理由                 | 説明                                        |
| -------------------- | ------------------------------------------- |
| リスク軽減           | 段階的移行でリグレッションリスクを最小化    |
| 継続的デリバリー可能 | 移行中も既存機能が動作し続ける              |
| ロールバック容易     | フィーチャーフラグOFFで即座に旧実装に戻せる |
| 並行開発可能         | 新旧アーキテクチャを同時にメンテナンス可能  |

---

## 2. 移行フェーズ

### フェーズA: 並行実装（Phase 4〜5）

**期間**: Phase 4（テスト作成）〜 Phase 5（実装）
**目標**: 新アーキテクチャを既存コードと並行して実装

#### 実施内容

1. **新ディレクトリ構造の作成**

   ```
   packages/shared/src/
   ├── core/
   │   └── Result.ts                    # 新規作成
   ├── features/chat-history/
   │   ├── domain/                      # 新規作成
   │   │   ├── entities/
   │   │   ├── value-objects/
   │   │   └── repositories/
   │   └── application/                 # 新規作成
   │       ├── use-cases/
   │       └── dto/
   └── infrastructure/
       └── persistence/                 # 新規作成
           ├── drizzle/
           └── mappers/
   ```

2. **Domain層の実装**
   - `ChatSession`エンティティ（Rich Domain Model）
   - `ChatMessage`エンティティ
   - 値オブジェクト（`ChatSessionId`, `ChatSessionTitle`, `MessageContent`）
   - リポジトリインターフェース（`IChatSessionRepository`, `IChatMessageRepository`）

3. **Application層の実装**
   - Use Caseクラス群
   - DTO定義

4. **Infrastructure層の実装**
   - `DrizzleChatSessionRepository`
   - `DrizzleChatMessageRepository`
   - Mapper（Entity ↔ DTO ↔ Persistence）

5. **テストの整備**
   - 新アーキテクチャ用ユニットテスト
   - 旧テストは維持（リグレッション検出用）

#### 並行状態

```
packages/shared/src/
├── features/chat-history/
│   ├── chat-history-service.ts        # 旧: 維持
│   ├── domain/                        # 新: 追加
│   │   └── ...
│   └── application/                   # 新: 追加
│       └── ...
├── repositories/
│   ├── chat-session-repository.ts     # 旧: 維持
│   └── chat-message-repository.ts     # 旧: 維持
├── infrastructure/
│   └── persistence/                   # 新: 追加
│       └── ...
└── types/
    ├── chat-session.ts                # 旧: 維持（後で削除）
    └── chat-message.ts                # 旧: 維持（後で削除）
```

---

### フェーズB: 段階的切り替え（Phase 5後半〜Phase 9）

**期間**: Phase 5後半 〜 Phase 9
**目標**: フィーチャーフラグで新アーキテクチャへ段階的に切り替え

#### 2.1 フィーチャーフラグの導入

**設定場所**: `packages/shared/src/config/feature-flags.ts`

```typescript
export const FEATURE_FLAGS = {
  /**
   * 新チャット履歴アーキテクチャを使用するかどうか
   * true: 新アーキテクチャ（Use Case + Clean Architecture）
   * false: 旧アーキテクチャ（ChatHistoryService）
   */
  USE_NEW_CHAT_HISTORY_ARCH: false,
};
```

#### 2.2 ファサードパターンの導入

**目的**: UI層からの呼び出しを新旧どちらにも振り分け可能にする

```typescript
// application/ChatHistoryFacade.ts
export class ChatHistoryFacade {
  constructor(
    private oldService: ChatHistoryService,
    private newUseCases: {
      createSession: CreateChatSessionUseCase;
      addMessage: AddMessageUseCase;
      // ...
    },
  ) {}

  async createSession(userId: string, options?: CreateSessionOptions) {
    if (FEATURE_FLAGS.USE_NEW_CHAT_HISTORY_ARCH) {
      return this.newUseCases.createSession.execute({ userId, ...options });
    }
    return this.oldService.createSession(userId, options);
  }

  // 他のメソッドも同様
}
```

#### 2.3 切り替え順序

| 順序 | 機能                    | フラグ切り替え条件                 |
| ---- | ----------------------- | ---------------------------------- |
| 1    | セッション作成          | ユニットテスト100%パス             |
| 2    | セッション取得          | ユニットテスト100%パス             |
| 3    | セッション一覧          | ユニットテスト100%パス             |
| 4    | メッセージ追加          | ユニットテスト100%パス             |
| 5    | メッセージ取得          | ユニットテスト100%パス             |
| 6    | セッション検索          | ユニットテスト100%パス             |
| 7    | セッション更新          | ユニットテスト100%パス             |
| 8    | セッション削除          | ユニットテスト100%パス             |
| 9    | エクスポート（MD/JSON） | ユニットテスト100%パス             |
| 10   | 全機能                  | 統合テスト100%パス、手動テスト完了 |

#### 2.4 UI層の更新

**更新対象**: `apps/desktop/src/contexts/ChatHistoryContext.tsx`

```typescript
// 新旧両方をサポート
export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const facade = useMemo(() => {
    // DI設定
    const db = getDatabase();

    if (FEATURE_FLAGS.USE_NEW_CHAT_HISTORY_ARCH) {
      // 新アーキテクチャ
      const sessionRepo = new DrizzleChatSessionRepository(db);
      const messageRepo = new DrizzleChatMessageRepository(db);
      return new ChatHistoryFacade(null, {
        createSession: new CreateChatSessionUseCase(sessionRepo),
        // ...
      });
    } else {
      // 旧アーキテクチャ
      const oldSessionRepo = new ChatSessionRepository(db);
      const oldMessageRepo = new ChatMessageRepository(db);
      const oldService = new ChatHistoryService(oldSessionRepo, oldMessageRepo);
      return new ChatHistoryFacade(oldService, null);
    }
  }, []);

  return (
    <ChatHistoryContext.Provider value={facade}>
      {children}
    </ChatHistoryContext.Provider>
  );
};
```

---

### フェーズC: 旧実装削除（Phase 10〜12）

**期間**: Phase 10（最終レビュー後）〜 Phase 12
**目標**: 旧実装を完全に削除し、新アーキテクチャのみにする

#### 3.1 削除前提条件

- [ ] フィーチャーフラグ `USE_NEW_CHAT_HISTORY_ARCH = true` がデフォルト
- [ ] 全テスト（ユニット/統合/手動）がパス
- [ ] 本番環境で最低1週間の稼働実績（該当する場合）

#### 3.2 削除対象ファイル

| ファイル                                        | 理由                              |
| ----------------------------------------------- | --------------------------------- |
| `types/chat-session.ts`                         | domain/entities/に移行済み        |
| `types/chat-message.ts`                         | domain/entities/に移行済み        |
| `repositories/chat-session-repository.ts`       | infrastructure/drizzle/に移行済み |
| `repositories/chat-message-repository.ts`       | infrastructure/drizzle/に移行済み |
| `features/chat-history/chat-history-service.ts` | Use Casesに分割済み               |

#### 3.3 削除手順

1. **フィーチャーフラグの削除**

   ```typescript
   // 削除: feature-flags.ts の USE_NEW_CHAT_HISTORY_ARCH
   ```

2. **ファサードの簡略化**

   ```typescript
   // ChatHistoryFacade → 新Use Case直接呼び出しに変更
   // または Facade自体を削除
   ```

3. **旧ファイルの削除**

   ```bash
   rm packages/shared/src/types/chat-session.ts
   rm packages/shared/src/types/chat-message.ts
   rm packages/shared/src/repositories/chat-session-repository.ts
   rm packages/shared/src/repositories/chat-message-repository.ts
   rm packages/shared/src/features/chat-history/chat-history-service.ts
   ```

4. **import文の整理**
   - 旧ファイルへのimportを検索・削除
   - 未使用のexportを削除

5. **テストの整理**
   - 旧実装用テストを削除
   - 新アーキテクチャテストのみ残す

---

## 3. 移行スケジュール

| Phase | 内容                         | フェーズ | フラグ状態                |
| ----- | ---------------------------- | -------- | ------------------------- |
| 4     | 新アーキテクチャ用テスト作成 | A        | 未導入                    |
| 5     | 新アーキテクチャ実装         | A        | `false`（旧のみ動作）     |
| 6     | テスト拡充                   | B        | `false`（段階的切り替え） |
| 7     | カバレッジ確認               | B        | `false`→`true`（部分的）  |
| 8     | リファクタリング             | B        | `true`（新のみ動作）      |
| 9     | 品質保証                     | B        | `true`（固定）            |
| 10    | 最終レビュー                 | B→C      | `true`（固定）            |
| 11    | 手動テスト                   | C        | `true`（固定）            |
| 12    | ドキュメント更新・旧実装削除 | C        | 削除（新のみ）            |

---

## 4. リスク軽減策

### 4.1 各フェーズ完了後のチェック

| チェック項目         | 実施タイミング       |
| -------------------- | -------------------- |
| 全ユニットテスト実行 | 各Phase完了時        |
| TypeScript型チェック | 各Phase完了時        |
| ESLint実行           | 各Phase完了時        |
| 統合テスト実行       | Phase 6, 9, 10完了時 |
| 手動テスト実行       | Phase 11             |

### 4.2 問題発生時の対応

| 問題レベル | 対応                                          |
| ---------- | --------------------------------------------- |
| 軽微       | フラグを`false`に戻し、修正後に再切り替え     |
| 中程度     | フラグを`false`に戻し、原因分析→修正→再テスト |
| 重大       | git revertで直近のコミットを巻き戻し          |

---

## 5. 成功基準

### フェーズA完了基準

- [ ] 新ディレクトリ構造が作成されている
- [ ] Domain層が完全に実装されている
- [ ] Application層が完全に実装されている
- [ ] Infrastructure層が完全に実装されている
- [ ] 新アーキテクチャ用ユニットテストがパスする

### フェーズB完了基準

- [ ] フィーチャーフラグが導入されている
- [ ] ファサードパターンが実装されている
- [ ] 全機能が新アーキテクチャで動作する
- [ ] 統合テストがパスする

### フェーズC完了基準

- [ ] 旧実装が完全に削除されている
- [ ] フィーチャーフラグが削除されている
- [ ] 全テストがパスする
- [ ] ドキュメントが更新されている

---

## 6. 参考資料

- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html) - Martin Fowler
- [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) - Pete Hodgson
