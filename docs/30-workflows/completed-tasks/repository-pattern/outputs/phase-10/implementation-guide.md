# Repository パターン実装ガイド

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | CONV-04-06         |
| Phase    | 10                 |
| 作成日   | 2026-01-05         |
| 機能名   | repository-pattern |

---

## Part 1: 概念的な説明

### 1.1 Repositoryパターンとは？

**比喩で説明**: Repositoryは「図書館の司書」のようなものです。

```
あなた（アプリケーション）が本（データ）を探したいとき、
直接本棚（データベース）を漁る必要はありません。
司書（Repository）に「〇〇という本を探して」と頼むだけでOK。

司書は:
- 本の場所を知っている（データベースアクセス）
- 整理・分類のルールを知っている（ビジネスロジック）
- あなたに必要な本だけを渡してくれる（型安全な結果）
```

### 1.2 なぜRepositoryパターンが必要？

#### ❌ 悪い例: 直接データベースアクセス

```typescript
// コンポーネントやサービスでDBを直接操作
const files = await db.select().from(filesTable).where(eq(filesTable.id, id));
if (!files[0]) {
  throw new Error("File not found");
}
```

**問題点**:

- データベース操作のコードが散らばる
- エラーハンドリングが統一されない
- テストしにくい（実際のDBが必要）
- データベースの変更が全体に影響する

#### ✅ 良い例: Repositoryを使用

```typescript
// Repositoryを通じてアクセス
const result = await fileRepository.findById(fileId);
if (!result.success) {
  // 型安全なエラーハンドリング
  return err(result.error);
}
```

**利点**:

- データアクセスロジックが一箇所に集約
- 統一されたエラーハンドリング（Result型）
- テスト時にモック可能
- データベースの変更が局所化

### 1.3 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (サービス、ユースケース、コントローラー)                 │
└────────────────────────┬────────────────────────────────┘
                         │ 依存
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Repository Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  FileRepo   │ │  ChunkRepo  │ │   EntityRepo    │   │
│  └──────┬──────┘ └──────┬──────┘ └────────┬────────┘   │
│         │               │                  │            │
│         └───────────────┼──────────────────┘            │
│                         │                               │
│              ┌──────────▼──────────┐                   │
│              │   BaseRepository    │                   │
│              │  (共通CRUD操作)      │                   │
│              └──────────┬──────────┘                   │
└─────────────────────────┼───────────────────────────────┘
                          │ 依存
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │ Drizzle ORM │ │   Schema    │ │  types/rag/*    │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Part 2: 技術的な詳細

### 2.1 BaseRepository - 基底クラス

#### なぜ基底クラスを作ったのか？

**理由**: 4つのRepositoryに共通するCRUD操作を重複なく実装するため。

```typescript
// 基底クラスのジェネリクス型パラメータ
export abstract class BaseRepository<
  TTable extends SQLiteTable, // Drizzleテーブル型
  TSelect, // SELECT結果型
  TInsert, // INSERT入力型
  TId extends string, // Branded ID型
> {
  constructor(
    protected readonly db: Database, // DBインスタンス
    protected readonly table: TTable, // 対象テーブル
    protected readonly idColumn: SQLiteColumn, // IDカラム
  ) {}
}
```

#### 提供するメソッド

| メソッド             | 戻り値型                                     | 説明                                   |
| -------------------- | -------------------------------------------- | -------------------------------------- |
| `findById(id)`       | `Result<TSelect \| null, RAGError>`          | IDでレコードを取得                     |
| `findAll(params?)`   | `Result<PaginatedResult<TSelect>, RAGError>` | 全レコード取得（ページネーション付き） |
| `create(data)`       | `Result<TSelect, RAGError>`                  | レコード作成                           |
| `createMany(data[])` | `Result<TSelect[], RAGError>`                | 一括作成                               |
| `update(id, data)`   | `Result<TSelect, RAGError>`                  | レコード更新                           |
| `delete(id)`         | `Result<void, RAGError>`                     | レコード削除                           |
| `exists(id)`         | `Result<boolean, RAGError>`                  | 存在確認                               |
| `count()`            | `Result<number, RAGError>`                   | 件数取得                               |

### 2.2 具体Repository

#### FileRepository

filesテーブル用。論理削除とハッシュ検索をサポート。

```typescript
// 固有メソッド
findByHash(hash: string)      // ハッシュ値で検索（重複排除用）
findByPath(path: string)      // パスで検索
findByCategory(category)      // カテゴリ別一覧
softDelete(id)                // 論理削除（deletedAtを設定）
findByIds(ids[])              // 複数ID一括取得
```

**設計判断**: `findById`をオーバーライドして`isNull(deletedAt)`条件を追加。論理削除されたレコードは自動的に除外される。

#### ChunkRepository

chunksテーブル用。ファイル単位の操作と隣接チャンク取得をサポート。

```typescript
// 固有メソッド
findByFileId(fileId)         // ファイルの全チャンク取得（chunkIndex順）
deleteByFileId(fileId)       // ファイルのチャンク一括削除
findByHash(hash)             // ハッシュ検索（重複検出用）
findByIds(ids[])             // 複数ID一括取得
findAdjacent(chunkId)        // 前後のチャンクを取得
```

**設計判断**: `findByFileId`は`chunkIndex`でソート。チャンクの順序が重要なため。

#### EntityRepository

entitiesテーブル用。Knowledge Graph検索とUpsertをサポート。

```typescript
// 固有メソッド
findByNormalizedNameAndType(name, type)  // 正規化名+タイプで検索
findByType(type)                         // タイプ別一覧
searchByName(query, limit?)              // 名前部分一致検索（重要度順）
findTopByImportance(limit?)              // 重要度上位取得
upsert(data)                             // 存在すれば更新、なければ作成
```

**設計判断**: `upsert`は`normalizedName + type`の組み合わせで既存判定。同名の異なるタイプのエンティティを区別。

### 2.3 エラーハンドリング

#### Result型パターン

```typescript
// 成功時
return ok(result[0]);

// 失敗時（エラーコードとコンテキスト付き）
return err(
  createRAGError(
    ErrorCodes.DB_QUERY_ERROR,
    `Failed to find file by ID: ${id}`,
    { id }, // コンテキスト情報
    error as Error, // 元のエラー（cause）
  ),
);
```

#### 使用するErrorCodes

| コード             | 意味           | 発生ケース                      |
| ------------------ | -------------- | ------------------------------- |
| `DB_QUERY_ERROR`   | DBクエリエラー | SQL実行失敗時                   |
| `RECORD_NOT_FOUND` | レコード未検出 | update/delete時にIDが存在しない |

### 2.4 ファクトリ関数

```typescript
// 使用例
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { createRepositories } from "@repo/shared/db/repositories";

const sqlite = new Database("./data.db");
const db = drizzle(sqlite);
const repos = createRepositories(db);

// 各Repositoryにアクセス
const fileResult = await repos.files.findById(fileId);
const chunkResult = await repos.chunks.findByFileId(fileId);
const entityResult = await repos.entities.searchByName("TypeScript");
```

**設計判断**: DI（依存性注入）パターンにより、テスト時にin-memory DBを渡すことで実DB不要のテストが可能。

---

## Part 3: 用語集

| 用語         | 読み方                   | 意味                                                          |
| ------------ | ------------------------ | ------------------------------------------------------------- |
| Repository   | リポジトリ               | データアクセスを抽象化するパターン                            |
| Branded Type | ブランデッド・タイプ     | 見た目は同じstring型だがコンパイル時に区別できる型            |
| Result型     | リザルト型               | 成功/失敗を明示的に表現する型（Railway Oriented Programming） |
| Drizzle ORM  | ドリズル・オーアールエム | TypeScript向けの軽量ORM                                       |
| CRUD         | クラッド                 | Create, Read, Update, Deleteの略                              |
| DI           | ディーアイ               | Dependency Injection（依存性注入）                            |
| Upsert       | アップサート             | Update + Insert（存在すれば更新、なければ作成）               |
| Soft Delete  | ソフト・デリート         | 論理削除（実際には削除せずフラグを立てる）                    |
| Pagination   | ページネーション         | 大量データを分割して取得する仕組み                            |

---

## Part 4: ディレクトリ構造

```
packages/shared/src/db/repositories/
├── index.ts              # バレルエクスポート・ファクトリ関数
├── base.repository.ts    # 基底Repositoryクラス（抽象）
├── file.repository.ts    # FileRepository（filesテーブル）
├── chunk.repository.ts   # ChunkRepository（chunksテーブル）
├── entity.repository.ts  # EntityRepository（entitiesテーブル）
└── __tests__/
    ├── base.repository.test.ts    # BaseRepository単体テスト
    ├── file.repository.test.ts    # FileRepository単体テスト
    ├── chunk.repository.test.ts   # ChunkRepository単体テスト
    ├── entity.repository.test.ts  # EntityRepository単体テスト
    ├── index.test.ts              # ファクトリ関数テスト
    └── integration.test.ts        # 統合テスト
```

---

## Part 5: 関連ドキュメント

| ドキュメント                                 | 内容               |
| -------------------------------------------- | ------------------ |
| `outputs/phase-1/requirements-definition.md` | 機能要件定義       |
| `outputs/phase-2/architecture-design.md`     | アーキテクチャ設計 |
| `outputs/phase-2/type-definitions.md`        | 型定義詳細         |
| `outputs/phase-3/design-review-result.md`    | 設計レビュー結果   |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
