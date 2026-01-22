# Phase 5: 実装（TDD Green） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装（TDD Green）                 |
| 前提Phase  | Phase 4                           |
| 後続Phase  | Phase 6                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

TDD（テスト駆動開発）のGreenフェーズとして、Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

Red状態のテストに対して、テストを通す実装を行う。Clean Architecture準拠で、既存のMapper・スキーマを活用し、Drizzle ORMクエリを使用したリポジトリ実装を完成させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: DrizzleChatSessionRepository 基盤実装

**目的**: セッションリポジトリの基盤構造を実装する

**実行手順**:

1. ファイル作成:
   ```
   packages/shared/src/features/chat-history/infrastructure/persistence/DrizzleChatSessionRepository.ts
   ```
2. クラス構造を実装:

   ```typescript
   import { eq, desc, and, sql, count } from "drizzle-orm";
   import { chatSessions } from "@/db/schema/chat-history";
   import type {
     IChatSessionRepository,
     ChatSessionSearchCriteria,
   } from "../../domain/repositories/IChatSessionRepository";
   import type { ChatSession } from "../../domain/entities/ChatSession";
   import type { ChatSessionId } from "../../domain/value-objects/ChatSessionId";
   import type { UserId } from "../../domain/value-objects/UserId";
   import { ChatSessionMapper } from "./mappers/ChatSessionMapper";

   export class DrizzleChatSessionRepository implements IChatSessionRepository {
     constructor(private readonly db: DrizzleDB) {}
   }
   ```

3. DB型定義をインポート（DrizzleDB型）

**期待される成果物**:

- `DrizzleChatSessionRepository.ts`: 基盤構造

---

### タスク2: DrizzleChatSessionRepository 各メソッド実装

**目的**: セッションリポジトリの全メソッドを実装する

**実行手順**:

1. `findById` 実装:
   ```typescript
   async findById(id: ChatSessionId): Promise<ChatSession | null> {
     const result = await this.db.query.chatSessions.findFirst({
       where: eq(chatSessions.id, id.value),
     });
     if (!result) return null;
     const mapped = ChatSessionMapper.toDomain(result);
     return mapped.isOk() ? mapped.value : null;
   }
   ```
2. `findByUserId` 実装:
   - ページネーション対応（limit/offset）
   - updatedAt降順でソート
3. `findPinned` 実装:
   - isPinned = 1 でフィルタ
   - pinOrder昇順でソート
4. `search` 実装（FTS5）:
   - `chat_sessions_fts` 仮想テーブルを使用
   - MATCH句でキーワード検索
5. `save` 実装（upsert）:
   ```typescript
   async save(session: ChatSession): Promise<void> {
     const record = ChatSessionMapper.toPersistence(session);
     await this.db.insert(chatSessions)
       .values(record)
       .onConflictDoUpdate({
         target: chatSessions.id,
         set: { ...record, id: undefined },
       });
   }
   ```
6. `delete` 実装
7. `exists` 実装
8. `countPinned` 実装

**期待される成果物**:

- `DrizzleChatSessionRepository.ts`: 全メソッド実装完了

---

### タスク3: DrizzleChatMessageRepository 基盤実装

**目的**: メッセージリポジトリの基盤構造を実装する

**実行手順**:

1. ファイル作成:
   ```
   packages/shared/src/features/chat-history/infrastructure/persistence/DrizzleChatMessageRepository.ts
   ```
2. クラス構造を実装:

   ```typescript
   import { eq, desc, asc, count } from "drizzle-orm";
   import { chatMessages } from "@/db/schema/chat-history";
   import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository";
   import type { ChatMessage } from "../../domain/entities/ChatMessage";
   import type { ChatMessageId } from "../../domain/value-objects/ChatMessageId";
   import type { ChatSessionId } from "../../domain/value-objects/ChatSessionId";
   import { ChatMessageMapper } from "./mappers/ChatMessageMapper";

   export class DrizzleChatMessageRepository implements IChatMessageRepository {
     constructor(private readonly db: DrizzleDB) {}
   }
   ```

**期待される成果物**:

- `DrizzleChatMessageRepository.ts`: 基盤構造

---

### タスク4: DrizzleChatMessageRepository 各メソッド実装

**目的**: メッセージリポジトリの全メソッドを実装する

**実行手順**:

1. `findById` 実装
2. `findBySessionId` 実装:
   - messageIndex昇順でソート
   - ページネーション対応
3. `findLatestBySessionId` 実装:
   - messageIndex降順で最初の1件
4. `countBySessionId` 実装
5. `save` 実装（upsert）
6. `saveMany` 実装（バッチ挿入）:
   ```typescript
   async saveMany(messages: ChatMessage[]): Promise<void> {
     if (messages.length === 0) return;
     const records = messages.map(m => ChatMessageMapper.toPersistence(m));
     await this.db.insert(chatMessages).values(records);
   }
   ```
7. `delete` 実装
8. `deleteBySessionId` 実装

**期待される成果物**:

- `DrizzleChatMessageRepository.ts`: 全メソッド実装完了

---

### タスク5: エクスポート設定

**目的**: 実装したリポジトリをモジュールからエクスポートする

**実行手順**:

1. `packages/shared/src/features/chat-history/infrastructure/persistence/index.ts` を作成/更新:
   ```typescript
   export { DrizzleChatSessionRepository } from "./DrizzleChatSessionRepository";
   export { DrizzleChatMessageRepository } from "./DrizzleChatMessageRepository";
   export { ChatSessionMapper } from "./mappers/ChatSessionMapper";
   export { ChatMessageMapper } from "./mappers/ChatMessageMapper";
   ```
2. 必要に応じて上位のindex.tsを更新

**期待される成果物**:

- `index.ts`: エクスポート設定完了

---

### タスク6: テストGreen状態確認

**目的**: 実装によりPhase 4のテストが全てパスすることを確認する

**実行手順**:

1. テスト実行:
   ```bash
   pnpm --filter @repo/shared test -- --grep "DrizzleChatSessionRepository"
   pnpm --filter @repo/shared test -- --grep "DrizzleChatMessageRepository"
   ```
2. 全テストがPASS（Green状態）であることを確認
3. 型チェック:
   ```bash
   pnpm --filter @repo/shared typecheck
   ```
4. 型エラーがないことを確認

**期待される成果物**:

- `outputs/phase-5/test-green-confirmation.md`: Green状態確認レポート

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | Repository IF定義      |

### Phase 2/4成果物

| 参照資料       | パス                                                        | 内容            |
| -------------- | ----------------------------------------------------------- | --------------- |
| Session設計書  | `outputs/phase-2/drizzle-chat-session-repository-design.md` | クラス設計      |
| Message設計書  | `outputs/phase-2/drizzle-chat-message-repository-design.md` | クラス設計      |
| クエリパターン | `outputs/phase-2/drizzle-query-patterns.md`                 | Drizzle API使用 |

---

## 成果物

| 成果物                       | パス                                                                                                   | 内容           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ | -------------- |
| DrizzleChatSessionRepository | `packages/shared/src/features/chat-history/infrastructure/persistence/DrizzleChatSessionRepository.ts` | 実装コード     |
| DrizzleChatMessageRepository | `packages/shared/src/features/chat-history/infrastructure/persistence/DrizzleChatMessageRepository.ts` | 実装コード     |
| エクスポート設定             | `packages/shared/src/features/chat-history/infrastructure/persistence/index.ts`                        | モジュール設定 |
| Green状態確認レポート        | `outputs/phase-5/test-green-confirmation.md`                                                           | 確認結果       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5での統合テスト連携アクション**:

- Drizzle DB接続実装
- Mapper活用によるDB Record ↔ Entity変換
- テスト支援コード整備（インメモリSQLiteセットアップ）

---

## 完了条件

- [ ] DrizzleChatSessionRepository の全メソッド（7メソッド）が実装されている
- [ ] DrizzleChatMessageRepository の全メソッド（8メソッド）が実装されている
- [ ] 全テストがGreen状態（パス）であることが確認されている
- [ ] 型エラーがないことが確認されている
- [ ] エクスポート設定が完了している

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --grep "Drizzle"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-6-test-expansion.md`
