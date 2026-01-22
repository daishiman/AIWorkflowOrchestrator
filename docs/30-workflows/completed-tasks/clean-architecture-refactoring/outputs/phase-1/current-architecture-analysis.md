# 現状アーキテクチャ分析レポート

## 概要

本レポートは、チャット履歴機能の現状アーキテクチャを分析し、Clean Architecture違反箇所を特定したものである。

**分析日**: 2026-01-18
**対象機能**: chat-history
**アーキテクチャ準拠率**: 45% (9/20項目)

---

## 1. 現状のファイル構成

```
packages/shared/src/
├── types/
│   ├── chat-session.ts      # 型定義（貧血モデル）
│   ├── chat-message.ts      # 型定義（貧血モデル）
│   └── llm-metadata.ts      # LLMメタデータ型
├── repositories/
│   ├── chat-session-repository.ts   # 具象リポジトリ（インフラ依存）
│   └── chat-message-repository.ts   # 具象リポジトリ（インフラ依存）
├── features/chat-history/
│   ├── chat-history-service.ts      # God Object
│   ├── date-formatter.ts            # ユーティリティ
│   └── constants.ts                 # 定数
└── db/schema/
    └── chat-history.ts              # Drizzleスキーマ
```

---

## 2. 検出された違反箇所

### Critical違反（3件）

| ID   | 違反箇所                                    | 違反内容                           | 違反原則                | 修正方針                                              |
| ---- | ------------------------------------------- | ---------------------------------- | ----------------------- | ----------------------------------------------------- |
| C-01 | `types/chat-session.ts:1-119`               | 型定義のみでビジネスロジックがない | ドメイン層の独立性      | Rich Domain Modelに変換、Value Objectを導入           |
| C-02 | `repositories/chat-session-repository.ts:7` | `drizzle-orm`を直接import          | 依存性逆転の原則（DIP） | インターフェースをDomain層に定義、実装をInfra層に移動 |
| C-03 | `repositories/chat-message-repository.ts:7` | `drizzle-orm`を直接import          | 依存性逆転の原則（DIP） | インターフェースをDomain層に定義、実装をInfra層に移動 |

### Critical違反詳細

#### C-01: ドメイン層のインフラ非依存が未達成

**問題コード** (`types/chat-session.ts`):

```typescript
// 型定義のみで、ビジネスロジックがない（貧血モデル）
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  // ... 単なるデータ構造
}
```

**違反原則**: Clean Architectureのドメイン層は、ビジネスルールを持つRich Domain Modelであるべき

**修正方針**:

- ChatSession/ChatMessageをクラスに変換
- ビジネスルール（タイトル3〜100文字、ピン留め上限10件等）をエンティティに集約
- Value Object（ChatSessionId, MessageContent等）を導入

#### C-02, C-03: リポジトリがインフラ技術に直接依存

**問題コード** (`repositories/chat-session-repository.ts:7-28`):

```typescript
import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";

export class ChatSessionRepository {
  private sqlite: Database.Database;

  constructor(private db: BetterSQLite3Database) {
    this.sqlite = (db as any).$client as Database.Database;
  }
  // ...
}
```

**違反原則**: 依存性逆転の原則（DIP）- 上位モジュールは下位モジュールに依存すべきでない

**修正方針**:

- `IChatSessionRepository`インターフェースをDomain層に定義
- `DrizzleChatSessionRepository`をInfrastructure層に移動
- Dependency Injectionでインターフェース経由で注入

---

### High違反（5件）

| ID   | 違反箇所                                         | 違反内容                                 | 違反原則                     | 修正方針                          |
| ---- | ------------------------------------------------ | ---------------------------------------- | ---------------------------- | --------------------------------- |
| H-01 | `chat-history-service.ts:43-464`                 | 複数責務が1クラスに集中（God Object）    | 単一責務の原則（SRP）        | Use Caseパターンで責務分割        |
| H-02 | `types/chat-session.ts`, `types/chat-message.ts` | ビジネスロジックがサービスに分散         | ドメイン駆動設計             | Rich Domain Modelに移行           |
| H-03 | `chat-history-service.ts` 全体                   | 例外ベースのエラーハンドリング           | Railway-Oriented Programming | Result型を導入                    |
| H-04 | UI層（未確認）                                   | サービスを直接import                     | レイヤー分離                 | React Context + カスタムHookでDI  |
| H-05 | 型定義3重複                                      | types/, schema/, Serviceで同じ概念が重複 | DRY原則                      | Domain/DTO/Persistence型の3層分離 |

### High違反詳細

#### H-01: God Object（ChatHistoryService）

**問題コード** (`chat-history-service.ts`):

```typescript
export class ChatHistoryService {
  // 責務1: セッション管理（CRUD）
  async createSession(...) { ... }
  async getSession(...) { ... }
  async listSessions(...) { ... }
  async deleteSession(...) { ... }
  async updateSession(...) { ... }

  // 責務2: メッセージ管理
  async addUserMessage(...) { ... }
  async addAssistantMessage(...) { ... }
  async getMessages(...) { ... }

  // 責務3: 検索
  async searchSessions(...) { ... }

  // 責務4: エクスポート
  async exportToMarkdown(...) { ... }
  async exportToJson(...) { ... }

  // 責務5: プレビュー生成
  private truncatePreview(...) { ... }

  // 責務6: トークン計算
  private calculateTotalTokens(...) { ... }
}
```

**違反原則**: 単一責務の原則（SRP）- 1クラスは1つの変更理由のみを持つべき

**修正方針**:

- `CreateChatSessionUseCase`
- `AddMessageUseCase`
- `SearchSessionsUseCase`
- `ExportSessionUseCase`
- 各Use Caseに責務を分割

#### H-02: 貧血ドメインモデル

**現状**:

- `ChatSession`/`ChatMessage`は単なる型定義（interface）
- ビジネスルールがサービス層に分散
  - タイトル自動生成: `ChatSessionRepository.save()`
  - ピン留め上限チェック: `ChatSessionRepository.save()`
  - プレビュー切り詰め: `ChatHistoryService.truncatePreview()`

**修正方針**:

- ドメインエンティティをclassで実装
- ビジネスルールをエンティティメソッドに集約
- Value Objectで不変条件を保証

#### H-03: エラーハンドリングの不統一

**問題コード**:

```typescript
// 例外ベースのエラーハンドリング
private async validateSession(sessionId: string): Promise<ChatSession> {
  const session = await this.sessionRepository.findById(sessionId);
  if (!session) {
    throw new Error("セッションが見つかりません");  // 例外スロー
  }
  return session;
}

// リポジトリでも例外
if (pinnedCount >= 10) {
  throw new Error("ピン留めは最大10件までです");
}
```

**修正方針**:

- Result型（`Result<T, E>`）を導入
- Railway-Oriented Programmingで成功/失敗を型で表現
- 呼び出し元での明示的なエラーハンドリングを強制

#### H-04: UI直接依存

**現状（推定）**:

- UIコンポーネントが`ChatHistoryService`を直接import
- サービスインスタンスの管理が不明確

**修正方針**:

- `ChatHistoryContext`でサービスをProvider経由で提供
- `useChatHistory()`カスタムHookでアクセス
- DIパターンでテスト容易性を確保

#### H-05: 型定義の3重複

**現状**:

1. `types/chat-session.ts` - アプリケーション型
2. `db/schema/chat-history.ts` - Drizzleスキーマ + 推論型
3. `ChatHistoryService`内での暗黙的な型変換

**修正方針**:

- **Domain型**: `domain/entities/ChatSession.ts` - ビジネスロジックを持つエンティティ
- **DTO型**: `application/dto/ChatSessionDTO.ts` - レイヤー間データ転送用
- **Persistence型**: `db/schema/chat-history.ts` - DB固有の型（既存維持）
- **Mapper**: 各型間の変換を明示的に定義

---

## 3. 依存関係分析

### 現状の依存方向

```
UI Layer
    ↓
ChatHistoryService (Application)
    ↓
ChatSessionRepository / ChatMessageRepository (Repository)
    ↓
Drizzle ORM (Infrastructure)
    ↓
SQLite (Database)
```

**問題点**:

- Repository が Infrastructure（Drizzle ORM）に直接依存
- ドメイン層が存在しない
- UI から Service への直接依存

### Clean Architecture準拠後の依存方向

```
UI Layer (React Components)
    ↓ (Context/Hook経由)
Application Layer (Use Cases)
    ↓ (インターフェース経由)
Domain Layer (Entities, Value Objects, Repository Interfaces)
    ↑ (実装)
Infrastructure Layer (Drizzle Repositories, Mappers)
    ↓
Database (SQLite)
```

---

## 4. 修正優先度

| 優先度 | 対象       | 理由                                  |
| ------ | ---------- | ------------------------------------- |
| 1      | C-02, C-03 | リポジトリインターフェース分離が基盤  |
| 2      | C-01       | Rich Domain Model化で他の修正が容易に |
| 3      | H-01       | Use Case分割でSRP達成                 |
| 4      | H-03       | Result型で一貫したエラーハンドリング  |
| 5      | H-05       | 型分離で保守性向上                    |
| 6      | H-02       | ビジネスロジックのドメイン集約        |
| 7      | H-04       | UI層のDI化で結合度低下                |

---

## 5. 結論

現状のチャット履歴機能は、以下のClean Architecture原則に違反している：

1. **依存性逆転の原則（DIP）違反**: リポジトリが具体的なORM実装に依存
2. **単一責務の原則（SRP）違反**: ChatHistoryServiceに複数責務が集中
3. **ドメイン層の欠如**: ビジネスロジックを持たない貧血モデル
4. **レイヤー分離の不徹底**: UI→Service直接依存

Strangler Fig Patternによる段階的リファクタリングで、アーキテクチャ準拠率を100%に引き上げる必要がある。
