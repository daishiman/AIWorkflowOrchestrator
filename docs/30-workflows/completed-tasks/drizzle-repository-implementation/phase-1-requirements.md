# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| Phase名    | 要件定義                          |
| 前提Phase  | なし                              |
| 後続Phase  | Phase 2                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

Drizzle ORMベースのリポジトリ実装に必要な機能要件・非機能要件を明確化し、実装スコープを確定する。

## 背景

ARCH-001 Clean Architectureリファクタリングで定義されたリポジトリインターフェース（`IChatSessionRepository`, `IChatMessageRepository`）に対して、本番環境で使用するDrizzle ORM実装を行う。現在はテスト用InMemoryRepositoryのみが存在する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存インターフェース仕様の確認

**目的**: 実装対象となるリポジトリインターフェースの全メソッドシグネチャを把握する

**実行手順**:

1. `packages/shared/src/features/chat-history/domain/repositories/IChatSessionRepository.ts` を読み込み、全メソッドを列挙
2. `packages/shared/src/features/chat-history/domain/repositories/IChatMessageRepository.ts` を読み込み、全メソッドを列挙
3. 各メソッドの引数・戻り値・責務を一覧化

**期待される成果物**:

- `outputs/phase-1/interface-analysis.md`: インターフェース分析結果

---

### タスク2: DBスキーマとの対応関係確認

**目的**: DBスキーマとドメインエンティティの対応関係を明確化する

**実行手順**:

1. `packages/shared/src/db/schema/chat-history.ts` を読み込み、テーブル定義を確認
2. `chatSessions` テーブルと `ChatSession` エンティティのフィールド対応を整理
3. `chatMessages` テーブルと `ChatMessage` エンティティのフィールド対応を整理
4. 型変換が必要な箇所を特定（boolean ↔ integer、Date ↔ string 等）

**期待される成果物**:

- `outputs/phase-1/schema-entity-mapping.md`: スキーマ-エンティティ対応表

---

### タスク3: Mapper実装の確認

**目的**: 既存Mapperの変換ロジックを把握し、Drizzle実装で再利用可能か確認する

**実行手順**:

1. `packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatSessionMapper.ts` を確認
2. `packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatMessageMapper.ts` を確認
3. `toDomain()`, `toPersistence()` メソッドの変換ロジックを把握
4. Drizzle実装でMapperをそのまま使用可能か判定

**期待される成果物**:

- `outputs/phase-1/mapper-analysis.md`: Mapper分析結果

---

### タスク4: 機能要件の定義

**目的**: 実装すべき機能要件を一覧化する

**実行手順**:

1. IChatSessionRepository の各メソッドに対応する機能要件を定義
2. IChatMessageRepository の各メソッドに対応する機能要件を定義
3. 全文検索（FTS5）要件を定義（search メソッド用）
4. トランザクション要件を定義（save, delete メソッド用）

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`: 機能要件定義書

---

### タスク5: 非機能要件の定義

**目的**: 品質・性能・セキュリティに関する非機能要件を定義する

**実行手順**:

1. テストカバレッジ要件を定義（Line ≥80%, Branch ≥60%, Function ≥80%）
2. 型安全性要件を定義（型エラー0件）
3. コード品質要件を定義（Lintエラー0件）
4. エラーハンドリング要件を定義（Result<T, E>型の使用）

**期待される成果物**:

- `outputs/phase-1/non-functional-requirements.md`: 非機能要件定義書

---

### タスク6: スコープ確定・除外事項の明記

**目的**: 実装スコープを確定し、除外事項を明確化する

**実行手順**:

1. 実装スコープ（含むもの）を列挙:
   - DrizzleChatSessionRepository の全メソッド実装
   - DrizzleChatMessageRepository の全メソッド実装
   - ユニットテスト作成
   - 統合テスト作成
2. 除外事項を列挙:
   - UI統合（別タスク）
   - React Context DI実装（別タスク: UT-006）
   - マイグレーションスクリプト（既存スキーマ使用）

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`: スコープ定義書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | Repository IF定義      |
| API仕様              | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          | Use Case API詳細       |

### 実装参照

| 参照資料          | パス                                                                                                | 内容                   |
| ----------------- | --------------------------------------------------------------------------------------------------- | ---------------------- |
| IChatSessionRepo  | `packages/shared/src/features/chat-history/domain/repositories/IChatSessionRepository.ts`           | セッションリポジトリIF |
| IChatMessageRepo  | `packages/shared/src/features/chat-history/domain/repositories/IChatMessageRepository.ts`           | メッセージリポジトリIF |
| DBスキーマ        | `packages/shared/src/db/schema/chat-history.ts`                                                     | Drizzleスキーマ定義    |
| ChatSessionMapper | `packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatSessionMapper.ts` | セッション変換Mapper   |
| ChatMessageMapper | `packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatMessageMapper.ts` | メッセージ変換Mapper   |

---

## 成果物

| 成果物                      | パス                                             | 内容               |
| --------------------------- | ------------------------------------------------ | ------------------ |
| インターフェース分析        | `outputs/phase-1/interface-analysis.md`          | IF全メソッド一覧   |
| スキーマ-エンティティ対応表 | `outputs/phase-1/schema-entity-mapping.md`       | DB-Entity対応      |
| Mapper分析                  | `outputs/phase-1/mapper-analysis.md`             | Mapper再利用可否   |
| 機能要件定義書              | `outputs/phase-1/functional-requirements.md`     | 機能要件一覧       |
| 非機能要件定義書            | `outputs/phase-1/non-functional-requirements.md` | 品質要件一覧       |
| スコープ定義書              | `outputs/phase-1/scope-definition.md`            | スコープ・除外事項 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1での統合テスト連携アクション**:

- DB接続要件を機能要件に明記（Drizzle DB接続方式）
- トランザクション要件を機能要件に明記（save/deleteでの使用）
- エラーハンドリング要件を非機能要件に明記（DB接続エラー、クエリエラー等）

---

## 完了条件

- [ ] IChatSessionRepository の全メソッド（7メソッド）が分析されている
- [ ] IChatMessageRepository の全メソッド（8メソッド）が分析されている
- [ ] DBスキーマと各エンティティの全フィールド対応が整理されている
- [ ] 既存Mapperの再利用可否が判定されている
- [ ] 機能要件が全メソッドに対して定義されている
- [ ] 非機能要件（テストカバレッジ、型安全性、コード品質）が定義されている
- [ ] 実装スコープと除外事項が明記されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認（6ファイル）

---

## 依存関係

- **前提**: なし（本タスクの起点Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-2-design.md`
