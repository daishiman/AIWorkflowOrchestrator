# CONV-04-05: Knowledge Graph テーブル群 - ワークフローインデックス

## 概要

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスクID   | CONV-04-05                             |
| タスク名   | Knowledge Graph テーブル群             |
| 依存       | CONV-04-01 (Drizzle ORM セットアップ)  |
| 規模       | 中                                     |
| 出力場所   | `packages/shared/src/db/schema/graph/` |
| ステータス | Phase 10 完了（PR作成待ち）            |
| 作成日     | 2026-01-04                             |

---

## 目的

Knowledge Graph（エンティティ、関係、コミュニティ）を永続化するテーブル群を定義する。
GraphRAGの基盤となる。

---

## 成果物一覧

### コード成果物

| 成果物                    | パス                                                        |
| ------------------------- | ----------------------------------------------------------- |
| entitiesテーブル          | `packages/shared/src/db/schema/graph/entities.ts`           |
| relationsテーブル         | `packages/shared/src/db/schema/graph/relations.ts`          |
| relationEvidenceテーブル  | `packages/shared/src/db/schema/graph/relation-evidence.ts`  |
| communitiesテーブル       | `packages/shared/src/db/schema/graph/communities.ts`        |
| entityCommunitiesテーブル | `packages/shared/src/db/schema/graph/entity-communities.ts` |
| chunkEntitiesテーブル     | `packages/shared/src/db/schema/graph/chunk-entities.ts`     |
| グラフリレーション定義    | `packages/shared/src/db/schema/graph/graph-relations.ts`    |
| スキーマエクスポート      | `packages/shared/src/db/schema/graph/index.ts`              |

---

## 使用スキル

| スキル                      | パス                                             | 用途                        |
| --------------------------- | ------------------------------------------------ | --------------------------- |
| drizzle-orm                 | `.claude/skills/drizzle-orm/SKILL.md`            | Drizzle ORMスキーマ定義     |
| database-normalization      | `.claude/skills/database-normalization/SKILL.md` | 正規化設計・品質検証        |
| ~~foreign-key-constraints~~ | ~~（drizzle-ormに統合）~~                        | 参照整合性・CASCADE動作設計 |
| indexing-strategies         | `.claude/skills/indexing-strategies/SKILL.md`    | SQLiteインデックス戦略      |
| type-safety-patterns        | `.claude/skills/type-safety-patterns/SKILL.md`   | TypeScript型安全設計        |
| tdd-red-green-refactor      | `.claude/skills/tdd-red-green-refactor/SKILL.md` | TDDテスト作成               |

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義           | [phase-1-requirements.md](phase-1-requirements.md)           | ✅ 完了    |
| 2     | 設計               | [phase-2-design.md](phase-2-design.md)                       | ✅ 完了    |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | ✅ 完了    |
| 4     | テスト作成         | [phase-4-test-creation.md](phase-4-test-creation.md)         | ✅ 完了    |
| 5     | 実装               | [phase-5-implementation.md](phase-5-implementation.md)       | ✅ 完了    |
| 6     | リファクタリング   | [phase-6-refactoring.md](phase-6-refactoring.md)             | ✅ 完了    |
| 7     | 品質保証           | [phase-7-quality-assurance.md](phase-7-quality-assurance.md) | ✅ 完了    |
| 8     | 最終レビューゲート | [phase-8-final-review.md](phase-8-final-review.md)           | ✅ 完了    |
| 9     | 手動テスト検証     | [phase-9-manual-testing.md](phase-9-manual-testing.md)       | ✅ 完了    |
| 10    | ドキュメント更新   | [phase-10-documentation.md](phase-10-documentation.md)       | ✅ 完了    |
| 11    | PR作成             | [phase-11-pr-creation.md](phase-11-pr-creation.md)           | 未実施     |

---

## 依存関係

### このタスクが依存するもの

- CONV-04-01: Drizzle ORM セットアップ

### このタスクに依存するもの

- CONV-06-04: エンティティ抽出サービス (NER)
- CONV-06-05: 関係抽出サービス
- CONV-08-01: Knowledge Graph ストア実装
- CONV-08-02: コミュニティ検出 (Leiden)

---

## 受け入れ条件

- [x] `entities` テーブルが定義されている
- [x] `relations` テーブルが定義されている
- [x] `relationEvidence` テーブルが定義されている
- [x] `communities` テーブルが定義されている
- [x] `entityCommunities` 中間テーブルが定義されている
- [x] `chunkEntities` 中間テーブルが定義されている
- [x] 適切なインデックスが設定されている
- [x] 外部キー制約が設定されている
- [x] Drizzleリレーションが定義されている
- [ ] マイグレーションが正常に実行できる（後続タスク: CONV-04-06）
- [x] 単体テストが作成されている（198テスト）

---

## 元のタスク仕様

参照: [task-04-05-knowledge-graph-tables.md](../../unassigned-task/task-04-05-knowledge-graph-tables.md)
