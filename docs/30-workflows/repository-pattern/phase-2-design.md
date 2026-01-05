# Phase 2: 設計 - Repository パターン実装

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-05                    |
| 機能名     | repository-pattern            |
| タスクID   | CONV-04-06                    |

---

## 目的

Phase 1で定義した要件に基づき、Repositoryパターンのアーキテクチャ設計・詳細設計を行う。
BaseRepositoryの抽象設計、各具象Repositoryの設計、型安全なインターフェース設計を完了する。

## 背景

Repository パターンはDDDにおけるデータアクセス抽象化の標準パターンであり、
Drizzle ORMと組み合わせることで型安全なデータアクセス層を構築できる。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:
リポジトリパターン、コレクション風API、抽象化設計

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/architecture-design.md` - アーキテクチャ設計書
- `outputs/phase-2/class-diagram.md` - クラス図

---

### スキル2: drizzle-orm

**パス**: `.claude/skills/drizzle-orm/SKILL.md`

**Trigger条件**:
Drizzle ORM、スキーマ定義、型安全クエリ

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/drizzle-integration.md` - Drizzle統合設計

---

### スキル3: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**:
TypeScript型安全、ブランド型、型ガード

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/type-definitions.md` - 型定義設計

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                 | 内容                       |
| -------------------- | -------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義書   | `outputs/phase-1/requirements-definition.md`                         | 機能要件・非機能要件       |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                             | 受け入れ条件               |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/task-04-06-repository-pattern.md` | コード例・ディレクトリ構造 |
| RAG型定義            | `packages/shared/src/types/rag/`                                     | Result型、Branded ID       |
| DBスキーマ           | `packages/shared/src/db/schema/`                                     | テーブル定義               |

---

## 成果物

| 成果物             | パス                                     | 内容                       |
| ------------------ | ---------------------------------------- | -------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | レイヤー構成・依存関係     |
| クラス図           | `outputs/phase-2/class-diagram.md`       | Repository継承関係         |
| Drizzle統合設計    | `outputs/phase-2/drizzle-integration.md` | ORM統合方針                |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | ジェネリクス・型パラメータ |

---

## 完了条件

- [ ] BaseRepository<TTable, TSelect, TInsert, TId>のジェネリクス設計が完了
- [ ] 各具象Repositoryの継承関係が設計されている
- [ ] `Result<T, RAGError>`を返すメソッドシグネチャが定義されている
- [ ] Drizzle ORMとの統合方針が決定されている
- [ ] ファイル構成・ディレクトリ構造が決定されている
- [ ] 依存関係（drizzle-orm, types/rag等）が明確化されている
- [ ] 成果物が `outputs/phase-2/` に出力されている
- [ ] `artifacts.json` の Phase 2 が更新されている

---

## 設計の指針

### アーキテクチャ設計

```
packages/shared/src/db/repositories/
├── index.ts              # バレルエクスポート・ファクトリ
├── base.repository.ts    # 基底Repository
├── file.repository.ts    # FileRepository
├── chunk.repository.ts   # ChunkRepository
├── entity.repository.ts  # EntityRepository
├── relation.repository.ts      # RelationRepository（将来）
├── community.repository.ts     # CommunityRepository（将来）
├── embedding.repository.ts     # EmbeddingRepository（将来）
└── conversion.repository.ts    # ConversionRepository（将来）
```

### BaseRepository設計

```typescript
abstract class BaseRepository<
  TTable extends SQLiteTable,
  TSelect,
  TInsert,
  TId extends string,
> {
  constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
    protected readonly idColumn: SQLiteColumn,
  ) {}

  // CRUD operations...
}
```

### 型パラメータ

| 型パラメータ | 説明            | 例             |
| ------------ | --------------- | -------------- |
| TTable       | Drizzleテーブル | `typeof files` |
| TSelect      | SELECT結果型    | `File`         |
| TInsert      | INSERT入力型    | `NewFile`      |
| TId          | ID型（Branded） | `FileId`       |

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- repository-pattern: {{result}}
- drizzle-orm: {{result}}
- type-safety-patterns: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/repository-pattern/phase-3-review-gate.md`
