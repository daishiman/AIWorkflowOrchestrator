# Clean Architecture完全準拠リファクタリング - タスク指示書

## メタ情報

| 項目             | 内容                                                     |
| ---------------- | -------------------------------------------------------- |
| タスクID         | ARCH-001                                                 |
| タスク名         | チャット履歴機能のClean Architecture準拠リファクタリング |
| 分類             | アーキテクチャ改善                                       |
| 対象機能         | chat-history（全体）                                     |
| 優先度           | 高                                                       |
| 見積もり規模     | 大規模（3-4週間）                                        |
| ステータス       | 未実施                                                   |
| 発見元           | Phase 7 - 最終レビューゲート                             |
| 発見日           | 2024-12-23                                               |
| 発見エージェント | .claude/agents/arch-police.md                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 7の最終レビュー（.claude/agents/arch-police.md）で、チャット履歴機能のアーキテクチャが**Clean Architectureの基本原則に重大な違反**をしていることが発見されました。

**アーキテクチャ準拠率**: **45%** (9/20項目)

**検出された重大違反**:

- **Critical**: 3件（ドメイン層のインフラ依存、型定義3重複、リポジトリ配置誤り）
- **High**: 5件（God Object、貧血モデル、エラーハンドリング不統一、UI直接依存、スキーマ密結合）

### 1.2 問題点・課題

#### C-01: ドメイン層のインフラ依存

```typescript
// ❌ 違反: ドメイン層がDrizzle ORMに依存
// packages/shared/src/features/chat-history/domain/ChatSession.ts
import type { ChatSessionRecord } from "@/db/schema/chat-history";

export class ChatSession {
  static fromRecord(record: ChatSessionRecord): ChatSession {
    // ...
  }
}
```

**問題**: Clean Architectureの**依存関係ルール**違反

- 内側（ドメイン層）→ 外側（インフラ層）への依存は禁止
- ORM変更時にドメイン層も変更が必要
- テスト容易性の低下

#### C-02: 型定義の3重複

```typescript
// ❌ 3箇所で同じ概念の型定義が重複
1. types/chat-session.ts        // Zodスキーマベース
2. domain/ChatSession.ts        // ドメインエンティティ
3. db/schema/chat-history.ts    // Drizzleスキーマ
```

**問題**: **Single Source of Truth**原則違反

- 変更時に3箇所の修正が必要
- 責務が不明確

#### H-01: God Object（ChatHistoryService）

```typescript
// ❌ 違反: 1クラスに複数責務
export class ChatHistoryService {
  // セッション管理
  async createSession() {}
  async updateSession() {}
  async deleteSession() {}

  // メッセージ管理
  async addMessage() {}
  async updateMessage() {}

  // 検索機能
  async searchSessions() {}

  // エクスポート機能
  async exportSession() {}
}
```

**問題**: **Single Responsibility Principle**違反

- 変更理由が複数存在

#### H-02: 貧血ドメインモデル（Anemic Domain Model）

```typescript
// ❌ 違反: データ構造のみでビジネスロジックなし
export class ChatSession {
  constructor(
    public readonly id: string,
    public readonly title: string,
  ) {}

  // ビジネスロジックがない！
}
```

**問題**: **Domain-Driven Design**原則違反

- ビジネスロジックがサービス層に漏出

### 1.3 放置した場合の影響

**技術的影響度**: Critical

- **保守性の低下**: アーキテクチャ腐敗が進行し、変更コスト増大
- **テスト容易性の低下**: モック化困難、テストが脆弱
- **拡張性の低下**: 新機能追加時の影響範囲が不明確
- **技術的負債の蓄積**: 将来のリファクタリングコストが指数関数的に増大

**ビジネス影響**:

- 開発速度の低下（複雑性増大により）
- バグ混入リスク増大
- 新規参画メンバーのオンボーディングコスト増

---

## 2. 何を達成するか（What）

### 2.1 目的

チャット履歴機能を**Clean Architecture**と**Domain-Driven Design**の原則に完全準拠させ、アーキテクチャ準拠率を**45% → 100%**に引き上げる。

### 2.2 最終ゴール

- ✅ ドメイン層がインフラから完全に独立している
- ✅ 型定義が3層（Domain/DTO/Persistence）に明確に分離されている
- ✅ リポジトリ実装が `infrastructure/` に配置されている
- ✅ Use Caseパターンが導入され、単一責務が守られている
- ✅ Rich Domain Modelでビジネスロジックがドメイン層に集約されている
- ✅ Result型によるRailway-Oriented Programmingが実装されている
- ✅ React ContextによるDIパターンが実装されている
- ✅ すべてのテストが成功している（リグレッションなし）
- ✅ アーキテクチャ準拠率100%達成

### 2.3 スコープ

#### 含むもの

**Phase 1: ドメイン層の純粋化**

- ChatSession, ChatMessage エンティティの純粋化
- 値オブジェクト（ChatSessionId, ChatSessionTitle等）の導入
- ドメインロジックの実装（Rich Domain Model）
- Result型の導入

**Phase 2: 型定義の3層分離**

- `types/` ディレクトリ削除
- DTO層の整備（application/dto/）
- Persistenceマッパーの整備（infrastructure/mappers/）

**Phase 3: リポジトリの再配置**

- `infrastructure/persistence/drizzle/` 作成
- リポジトリ具象実装の移動
- インターフェースはドメイン層に残す

**Phase 4: Use Caseパターン導入**

- ChatHistoryServiceの分割
- 各Use Caseクラスの実装
  - CreateChatSessionUseCase
  - AddMessageUseCase
  - SearchSessionsUseCase
  - ExportSessionUseCase
  - 等

**Phase 5: DIパターン実装**

- React Contextでサービス注入
- カスタムフックの整備
- UI層の疎結合化

#### 含まないもの

- データベーススキーマ変更（DB-001で対応）
- セキュリティ機能追加（SECURITY-001〜004で対応）
- desktop側テストカバレッジ向上（TEST-001で対応）
- 新機能の追加

### 2.4 成果物

| 種別               | 成果物             | 配置先                                                             |
| ------------------ | ------------------ | ------------------------------------------------------------------ |
| ドメイン層         | 純粋なエンティティ | `packages/shared/src/features/chat-history/domain/`                |
| ドメイン層         | 値オブジェクト     | `packages/shared/src/features/chat-history/domain/value-objects/`  |
| アプリケーション層 | Use Caseクラス     | `packages/shared/src/features/chat-history/application/use-cases/` |
| アプリケーション層 | DTO                | `packages/shared/src/features/chat-history/application/dto/`       |
| インフラ層         | リポジトリ実装     | `packages/shared/src/infrastructure/persistence/drizzle/`          |
| インフラ層         | マッパー           | `packages/shared/src/infrastructure/persistence/mappers/`          |
| UI層               | Context & Hooks    | `apps/desktop/src/contexts/ChatHistoryContext.tsx`                 |
| ドキュメント       | ADR                | `docs/30-workflows/chat-history-persistence/adr/`                  |
| ドキュメント       | アーキテクチャ図   | `docs/30-workflows/chat-history-persistence/architecture.md`       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Phase 7: 最終レビューゲートが完了していること
- アーキテクチャレビューレポートが作成済み
- すべてのテストが成功していること（リグレッション検出用ベースライン）

### 3.2 依存タスク

- T-07-1: 最終レビューゲート（完了）

### 3.3 必要な知識・スキル

- Clean Architecture（Robert C. Martin）
- Domain-Driven Design（Eric Evans）
- SOLID原則
- Railway-Oriented Programming（Scott Wlaschin）
- TypeScript高度な型システム
- Drizzle ORM
- React Context API
- カスタムフック設計

### 3.4 推奨アプローチ

**段階的リファクタリング戦略**（Strangler Fig Pattern）:

1. **新しいアーキテクチャを並行実装**
2. **段階的に移行**（一度にすべて書き換えない）
3. **常にテストGreen状態を維持**
4. **旧実装を徐々に削除**

**リスク管理**:

- 各Phase完了後にテスト実行（リグレッション検出）
- 問題発生時は即座にロールバック
- フィーチャーフラグで新旧切り替え可能にする

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（アーキテクチャ要件、移行戦略）
Phase 1: 設計（新アーキテクチャ設計、マッパー設計）
Phase 2: 設計レビューゲート
Phase 3: テスト作成（新アーキテクチャ用テスト）
Phase 4: 実装（段階的移行）
  - Phase 4.1: ドメイン層純粋化
  - Phase 4.2: 型定義3層分離
  - Phase 4.3: リポジトリ再配置
  - Phase 4.4: Use Caseパターン導入
  - Phase 4.5: DIパターン実装
Phase 5: リファクタリング
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### T-00-1: アーキテクチャリファクタリング要件定義

##### 目的

Clean Architecture準拠の詳細要件と移行戦略を定義する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements architecture-refactoring
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/arch-police.md`
- **選定理由**: Clean Architectureの専門家、準拠状況を既にレビュー済み
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                              | 活用方法               |
| ----------------------------------------------------- | ---------------------- |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離要件定義   |
| .claude/skills/domain-driven-design/SKILL.md          | ドメインモデル要件定義 |
| .claude/skills/solid-principles/SKILL.md              | SOLID準拠基準設定      |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物               | パス                                                                      | 内容                             |
| -------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| アーキテクチャ要件書 | `docs/30-workflows/chat-history-persistence/requirements-architecture.md` | Clean Architecture要件、移行戦略 |

##### 完了条件

- [ ] レイヤー分離要件が明確に定義されている
- [ ] 依存関係ルールが明文化されている
- [ ] 移行戦略（Strangler Fig Pattern）が定義されている
- [ ] リスク軽減策が記載されている

##### 依存関係

- **前提**: T-07-1
- **後続**: T-01-1

---

### Phase 1: 設計

#### T-01-1: 新アーキテクチャ設計

##### 目的

Clean Architecture準拠の新しいディレクトリ構造・クラス設計を行う。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:design-architecture clean-architecture
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/arch-police.md`
- **選定理由**: Clean Architecture設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                              | 活用方法           |
| ----------------------------------------------------- | ------------------ |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離設計   |
| .claude/skills/domain-driven-design/SKILL.md          | ドメインモデル設計 |
| dependency-inversion                                  | DIPパターン適用    |
| .claude/skills/repository-pattern/SKILL.md            | リポジトリ抽象化   |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物               | パス                                                                                | 内容                                       |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| アーキテクチャ設計書 | `docs/30-workflows/chat-history-persistence/design-clean-architecture.md`           | 新ディレクトリ構造、クラス図、シーケンス図 |
| ADR                  | `docs/30-workflows/chat-history-persistence/adr/001-clean-architecture-adoption.md` | アーキテクチャ決定記録                     |

##### 完了条件

- [ ] ディレクトリ構造が設計されている
- [ ] ドメインエンティティ・値オブジェクトが設計されている
- [ ] Use Caseクラスが設計されている
- [ ] マッパークラスが設計されている
- [ ] DIコンテナ設計が完了している

##### 依存関係

- **前提**: T-00-1
- **後続**: T-02-1

---

### Phase 2: 設計レビューゲート

#### T-02-1: アーキテクチャ設計レビュー

##### レビュー参加エージェント

| エージェント                     | レビュー観点           | 選定理由                     |
| -------------------------------- | ---------------------- | ---------------------------- |
| .claude/agents/arch-police.md    | Clean Architecture準拠 | アーキテクチャ原則の専門家   |
| .claude/agents/domain-modeler.md | ドメインモデル妥当性   | DDD実践の専門家              |
| .claude/agents/code-quality.md   | 実装可能性評価         | リファクタリング実践の専門家 |

- **参照**: `.claude/agents/agent_list.md`

##### レビューチェックリスト

**Clean Architecture** (.claude/agents/arch-police.md)

- [ ] 依存関係ルールが守られているか
- [ ] レイヤー分離が明確か
- [ ] SOLID原則に準拠しているか

**ドメインモデル** (.claude/agents/domain-modeler.md)

- [ ] ドメインロジックがエンティティに集約されているか
- [ ] 値オブジェクトの境界が適切か
- [ ] ユビキタス言語が反映されているか

**実装可能性** (.claude/agents/code-quality.md)

- [ ] 段階的な移行が可能か
- [ ] リスクが適切に管理されているか
- [ ] テスト戦略が明確か

##### 完了条件

- [ ] 全レビュー観点で問題なし
- [ ] Phase 3（テスト作成）へ進行可能

##### 依存関係

- **前提**: T-01-1
- **後続**: T-03-1

---

### Phase 3: テスト作成（TDD: Red）

#### T-03-1: 新アーキテクチャ用テスト作成

##### 目的

新しいドメインエンティティ・Use Case・マッパーのテストを実装前に作成する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests domain-entities
/ai:generate-unit-tests use-cases
/ai:generate-unit-tests mappers
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: TDD原則に基づくテスト設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                        | 活用方法           |
| ----------------------------------------------- | ------------------ |
| .claude/skills/tdd-principles/SKILL.md          | Red-Green-Refactor |
| .claude/skills/test-doubles/SKILL.md            | モック・スタブ設計 |
| .claude/skills/boundary-value-analysis/SKILL.md | 境界値テスト       |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物         | パス                                                               | 内容                               |
| -------------- | ------------------------------------------------------------------ | ---------------------------------- |
| ドメインテスト | `packages/shared/src/features/chat-history/domain/__tests__/`      | エンティティ・値オブジェクトテスト |
| Use Caseテスト | `packages/shared/src/features/chat-history/application/__tests__/` | Use Caseテスト                     |
| マッパーテスト | `packages/shared/src/infrastructure/persistence/__tests__/`        | マッパーテスト                     |

##### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run chat-history
```

- [ ] 新しいテストが失敗することを確認（Red状態）

##### 完了条件

- [ ] ドメインエンティティの全テストケースが実装されている
- [ ] Use Caseの全テストケースが実装されている
- [ ] マッパーの全テストケースが実装されている
- [ ] すべてRed状態（失敗）である

##### 依存関係

- **前提**: T-02-1
- **後続**: T-04-1

---

### Phase 4: 実装（TDD: Green）

#### T-04-1: ドメイン層純粋化実装

##### 目的

Drizzle依存を除去し、純粋なドメインエンティティを実装する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic domain-entities
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/domain-modeler.md`
- **選定理由**: DDD実践、ドメインモデル実装の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                      | 活用方法                   |
| --------------------------------------------- | -------------------------- |
| .claude/skills/domain-driven-design/SKILL.md  | Rich Domain Model実装      |
| .claude/skills/value-object-patterns/SKILL.md | 値オブジェクト実装         |
| result-type-pattern                           | Result型エラーハンドリング |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物                  | パス                                                              | 内容                       |
| ----------------------- | ----------------------------------------------------------------- | -------------------------- |
| ChatSessionエンティティ | `packages/shared/src/features/chat-history/domain/ChatSession.ts` | 純粋なドメインエンティティ |
| ChatMessageエンティティ | `packages/shared/src/features/chat-history/domain/ChatMessage.ts` | 純粋なドメインエンティティ |
| 値オブジェクト          | `packages/shared/src/features/chat-history/domain/value-objects/` | ID、Title等                |
| Result型                | `packages/shared/src/core/Result.ts`                              | 共通Result型定義           |

##### TDD検証: 部分Green状態確認

```bash
pnpm --filter @repo/shared test:run domain
```

- [ ] ドメイン層のテストが成功することを確認

##### 完了条件

- [ ] ドメインエンティティがDrizzle依存から解放されている
- [ ] ビジネスロジックがドメイン層に実装されている
- [ ] 値オブジェクトで不変条件が保証されている
- [ ] ドメイン層のテストが全て成功している

##### 依存関係

- **前提**: T-03-1
- **後続**: T-04-2

---

#### T-04-2: Use Caseパターン導入実装

##### 目的

ChatHistoryServiceを単一責務のUse Caseに分割する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic use-cases
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: アプリケーション層ロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                              | 活用方法         |
| ----------------------------------------------------- | ---------------- |
| .claude/skills/clean-architecture-principles/SKILL.md | Use Case層の実装 |
| command-query-separation                              | CQRSパターン適用 |
| railway-oriented-programming                          | Result型での実装 |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物           | パス                                                               | 内容           |
| ---------------- | ------------------------------------------------------------------ | -------------- |
| Use Caseクラス群 | `packages/shared/src/features/chat-history/application/use-cases/` | 各Use Case実装 |

##### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run use-cases
```

- [ ] Use Caseのテストが成功することを確認

##### 完了条件

- [ ] ChatHistoryServiceが分割されている
- [ ] 各Use Caseが単一責務を満たしている
- [ ] すべてのテストが成功している

##### 依存関係

- **前提**: T-04-1
- **後続**: T-04-3

---

#### T-04-3: リポジトリ再配置とマッパー実装

##### 目的

リポジトリを `infrastructure/` に移動し、マッパーでドメインとDBを分離する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic infrastructure-layer
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/repo-dev.md`
- **選定理由**: リポジトリパターン実装の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                              | 活用方法                |
| ----------------------------------------------------- | ----------------------- |
| .claude/skills/repository-pattern/SKILL.md            | リポジトリ抽象化        |
| mapper-pattern                                        | ドメイン-永続化マッパー |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離            |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物         | パス                                                      | 内容            |
| -------------- | --------------------------------------------------------- | --------------- |
| リポジトリ実装 | `packages/shared/src/infrastructure/persistence/drizzle/` | Drizzle実装     |
| マッパー       | `packages/shared/src/infrastructure/persistence/mappers/` | Domain ↔ DB変換 |

##### 完了条件

- [ ] リポジトリが `infrastructure/` に配置されている
- [ ] マッパーでドメイン-DB変換が実装されている
- [ ] すべてのテストが成功している

##### 依存関係

- **前提**: T-04-2
- **後続**: T-04-4

---

#### T-04-4: React Context DIパターン実装

##### 目的

UI層の直接的なサービス依存を解消し、DIパターンを実装する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic dependency-injection
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/state-manager.md`
- **選定理由**: React Context、カスタムフック設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                      | 活用方法           |
| --------------------------------------------- | ------------------ |
| .claude/skills/custom-hooks-patterns/SKILL.md | カスタムフック設計 |
| context-api-patterns                          | React Context DI   |
| dependency-injection                          | DIパターン適用     |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物             | パス                                               | 内容         |
| ------------------ | -------------------------------------------------- | ------------ |
| ChatHistoryContext | `apps/desktop/src/contexts/ChatHistoryContext.tsx` | DIコンテナ   |
| カスタムフック     | `apps/desktop/src/hooks/useChatHistory.ts`         | DI済みフック |

##### 完了条件

- [ ] React Contextが実装されている
- [ ] カスタムフックが実装されている
- [ ] UIコンポーネントがサービスに直接依存していない
- [ ] すべてのテストが成功している

##### 依存関係

- **前提**: T-04-3
- **後続**: T-04-5

---

#### T-04-5: 型定義3層分離実装

##### 目的

`types/` を削除し、Domain/DTO/Persistenceの3層に型定義を明確に分離する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor type-definitions
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/arch-police.md`
- **選定理由**: 型定義の責務分離の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物     | パス                                                         | 内容                 |
| ---------- | ------------------------------------------------------------ | -------------------- |
| DTO        | `packages/shared/src/features/chat-history/application/dto/` | API用DTO             |
| ドメイン型 | `packages/shared/src/features/chat-history/domain/`          | ドメインエンティティ |
| 永続化型   | `packages/shared/src/db/schema/chat-history.ts`              | Drizzleスキーマ      |

##### 完了条件

- [ ] `types/chat-session.ts` が削除されている
- [ ] `types/chat-message.ts` が削除されている
- [ ] 3層の型定義が明確に分離されている
- [ ] すべてのテストが成功している

##### 依存関係

- **前提**: T-04-4
- **後続**: T-05-1

---

### Phase 5-9: リファクタリング～ドキュメント更新

各フェーズは標準的な流れに従います。

---

## 5. 完了条件チェックリスト

### アーキテクチャ要件

- [ ] ドメイン層がインフラから独立している
- [ ] 型定義が3層に分離されている
- [ ] リポジトリが `infrastructure/` に配置されている
- [ ] Use Caseパターンが導入されている
- [ ] Rich Domain Modelである
- [ ] Result型で統一されている
- [ ] DIパターンが実装されている

### 品質要件

- [ ] すべてのテストが成功している
- [ ] アーキテクチャ準拠率100%
- [ ] Clean Architecture違反0件

### ドキュメント要件

- [ ] アーキテクチャ図が作成されている
- [ ] ADRが記録されている
- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### アーキテクチャ準拠確認

```bash
# レイヤー違反検出（dependency-cruiser使用）
pnpm depcruise --validate -- packages/shared/src

# テスト実行（全成功確認）
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                 |
| ------------------------------------ | ------ | -------- | ------------------------------------ |
| 大規模リファクタリングによるバグ混入 | 高     | 中       | TDDサイクル厳守、各Phase後テスト実行 |
| 既存機能の破壊                       | 高     | 中       | Strangler Fig Pattern、段階的移行    |
| 開発期間の長期化                     | 中     | 高       | Phase分割、優先度付け                |
| チーム学習コスト                     | 中     | 中       | ペアプログラミング、ドキュメント整備 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/chat-history-persistence/final-review-report.md` - 最終レビューレポート
- `.claude/agents/arch-police.md` - アーキテクチャ監視エージェント
- `.claude/skills/clean-architecture-principles/SKILL.md` - Clean Architecture原則
- `.claude/skills/domain-driven-design/SKILL.md` - DDD実践

### 参考資料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Robert C. Martin
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/) - Eric Evans
- [Railway-Oriented Programming](https://fsharpforfunandprofit.com/rop/) - Scott Wlaschin
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html) - Martin Fowler

---

## 9. 備考

### レビュー指摘の原文

```
### アーキテクチャ準拠率: 45% (9/20項目)

### Critical違反（3件）
- C-01: ドメイン層のインフラ依存
- C-02: 型定義の3重複
- C-03: リポジトリ配置の誤り

### High違反（5件）
- H-01: God Object（ChatHistoryService）
- H-02: 貧血ドメインモデル
- H-03: エラーハンドリング不統一
- H-04: UI直接依存
- H-05: スキーマ・ドメイン密結合

**総評**: 早急な是正が必要。現状のままではアーキテクチャ腐敗が進行。
```

### 補足事項

**実装上の注意点**:

1. **一度にすべて書き換えない**: Strangler Fig Patternで段階的移行
2. **常にテストGreen維持**: 各Phase完了後に全テスト実行
3. **フィーチャーフラグ活用**: 新旧アーキテクチャを切り替え可能にする

**期待効果**:

- テスト容易性向上（モック化が容易）
- 保守性向上（責務が明確）
- 拡張性向上（OCP準拠で新機能追加が容易）
- チーム協業性向上（レイヤー分離で並行開発可能）
