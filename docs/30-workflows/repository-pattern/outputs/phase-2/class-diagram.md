# クラス図 - Repository パターン実装

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | CONV-04-06 |
| Phase    | 2          |
| 作成日   | 2026-01-05 |

---

## 1. 全体クラス図（ASCII）

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          <<interface>>                                       │
│                         Repository<T, ID>                                    │
│      (packages/shared/src/types/rag/interfaces.ts - 既存)                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ + findById(id: ID): Promise<Result<T | null, RAGError>>                      │
│ + findAll(params?: PaginationParams): Promise<Result<PaginatedResult<T>>>    │
│ + create(entity: Omit<T, 'id'|'createdAt'|'updatedAt'>): Promise<Result<T>>  │
│ + update(id: ID, entity: Partial<T>): Promise<Result<T>>                     │
│ + delete(id: ID): Promise<Result<void>>                                      │
└──────────────────────────────────────────────────────────────────────────────┘
                                      △
                                      │ implements
                                      │
┌──────────────────────────────────────────────────────────────────────────────┐
│                    <<abstract>>                                              │
│    BaseRepository<TTable, TSelect, TInsert, TId>                             │
│      (packages/shared/src/db/repositories/base.repository.ts)                │
├──────────────────────────────────────────────────────────────────────────────┤
│ # db: Database                                                               │
│ # table: TTable                                                              │
│ # idColumn: SQLiteColumn                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ + constructor(db: Database, table: TTable, idColumn: SQLiteColumn)           │
│ + findById(id: TId): Promise<Result<TSelect | null, RAGError>>               │
│ + findAll(params?: PaginationParams): Promise<Result<PaginatedResult<>>>     │
│ + create(data: TInsert): Promise<Result<TSelect, RAGError>>                  │
│ + createMany(data: TInsert[]): Promise<Result<TSelect[], RAGError>>          │
│ + update(id: TId, data: Partial<TInsert>): Promise<Result<TSelect>>          │
│ + delete(id: TId): Promise<Result<void, RAGError>>                           │
│ + exists(id: TId): Promise<Result<boolean, RAGError>>                        │
│ + count(): Promise<Result<number, RAGError>>                                 │
└──────────────────────────────────────────────────────────────────────────────┘
        △                       △                       △
        │                       │                       │
        │ extends               │ extends               │ extends
        │                       │                       │
┌───────┴───────────┐   ┌───────┴───────────┐   ┌───────┴───────────┐
│  FileRepository   │   │  ChunkRepository  │   │  EntityRepository │
│  <files, File,    │   │  <chunks, Chunk,  │   │  <entities,       │
│   NewFile, FileId>│   │   NewChunk,       │   │   Entity,NewEntity│
│                   │   │   ChunkId>        │   │   EntityId>       │
├───────────────────┤   ├───────────────────┤   ├───────────────────┤
│ +findByHash()     │   │ +findByFileId()   │   │ +findByNormalized │
│ +findByPath()     │   │ +deleteByFileId() │   │  NameAndType()    │
│ +findByCategory() │   │ +findByHash()     │   │ +findByType()     │
│ +softDelete()     │   │ +findByIds()      │   │ +searchByName()   │
│ +findByIds()      │   │ +findAdjacent()   │   │ +findTopBy        │
│                   │   │                   │   │  Importance()     │
│                   │   │                   │   │ +upsert()         │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

---

## 2. 依存関係図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              index.ts                                       │
│                        (ファクトリ・エクスポート)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  createRepositories(db: Database): Repositories                             │
│  export { FileRepository, ChunkRepository, EntityRepository, ... }          │
└─────────────────────────────────────────────────────────────────────────────┘
         │                         │                          │
         │ imports                 │ imports                  │ imports
         ▼                         ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ FileRepository  │      │ ChunkRepository │      │EntityRepository │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │ imports
                                  ▼
                    ┌──────────────────────────┐
                    │     BaseRepository       │
                    └──────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │ imports                │ imports                │ imports
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐
│   drizzle-orm   │    │   db/schema/*   │    │     types/rag/*         │
│ (eq, sql, and,  │    │ (files, chunks, │    │ (Result, RAGError,      │
│  inArray, etc)  │    │  entities)      │    │  ErrorCodes, ok, err,   │
│                 │    │                 │    │  FileId, ChunkId, etc)  │
└─────────────────┘    └─────────────────┘    └─────────────────────────┘
```

---

## 3. Repositories集約構造

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          <<interface>>                                      │
│                           Repositories                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  readonly files: FileRepository                                             │
│  readonly chunks: ChunkRepository                                           │
│  readonly entities: EntityRepository                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      △
                                      │ returns
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│  createRepositories(db: Database): Repositories                             │
│  ──────────────────────────────────────────────────────────────             │
│  return {                                                                   │
│    files: new FileRepository(db),                                           │
│    chunks: new ChunkRepository(db),                                         │
│    entities: new EntityRepository(db),                                      │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 型パラメータ対応表

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BaseRepository ジェネリクス                           │
├─────────────────────┬───────────────────────────────────────────────────────┤
│ TTable              │ Drizzleテーブル型 (SQLiteTable)                        │
│ TSelect             │ SELECT結果型 (テーブルから推論)                         │
│ TInsert             │ INSERT入力型 (テーブルから推論)                         │
│ TId                 │ Branded ID型 (string拡張)                              │
└─────────────────────┴───────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        具象Repository 型バインディング                       │
├─────────────────────┬───────────┬───────────┬───────────┬───────────────────┤
│ Repository          │ TTable    │ TSelect   │ TInsert   │ TId               │
├─────────────────────┼───────────┼───────────┼───────────┼───────────────────┤
│ FileRepository      │ files     │ File      │ NewFile   │ FileId            │
│ ChunkRepository     │ chunks    │ Chunk     │ NewChunk  │ ChunkId           │
│ EntityRepository    │ entities  │ Entity    │ NewEntity │ EntityId          │
└─────────────────────┴───────────┴───────────┴───────────┴───────────────────┘
```

---

## 5. メソッドシグネチャ詳細

### 5.1 BaseRepository メソッド

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ findById(id: TId)                                                           │
│   └──▶ Promise<Result<TSelect | null, RAGError>>                            │
│                                                                             │
│ findAll(params?: PaginationParams)                                          │
│   └──▶ Promise<Result<PaginatedResult<TSelect>, RAGError>>                  │
│                                                                             │
│ create(data: TInsert)                                                       │
│   └──▶ Promise<Result<TSelect, RAGError>>                                   │
│                                                                             │
│ createMany(data: TInsert[])                                                 │
│   └──▶ Promise<Result<TSelect[], RAGError>>                                 │
│                                                                             │
│ update(id: TId, data: Partial<TInsert>)                                     │
│   └──▶ Promise<Result<TSelect, RAGError>>                                   │
│                                                                             │
│ delete(id: TId)                                                             │
│   └──▶ Promise<Result<void, RAGError>>                                      │
│                                                                             │
│ exists(id: TId)                                                             │
│   └──▶ Promise<Result<boolean, RAGError>>                                   │
│                                                                             │
│ count()                                                                     │
│   └──▶ Promise<Result<number, RAGError>>                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 FileRepository 固有メソッド

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ findByHash(hash: string)                                                    │
│   └──▶ Promise<Result<File | null, RAGError>>                               │
│                                                                             │
│ findByPath(path: string)                                                    │
│   └──▶ Promise<Result<File | null, RAGError>>                               │
│                                                                             │
│ findByCategory(category: string)                                            │
│   └──▶ Promise<Result<File[], RAGError>>                                    │
│                                                                             │
│ softDelete(id: FileId)                                                      │
│   └──▶ Promise<Result<void, RAGError>>                                      │
│                                                                             │
│ findByIds(ids: FileId[])                                                    │
│   └──▶ Promise<Result<File[], RAGError>>                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 ChunkRepository 固有メソッド

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ findByFileId(fileId: FileId)                                                │
│   └──▶ Promise<Result<Chunk[], RAGError>>                                   │
│                                                                             │
│ deleteByFileId(fileId: FileId)                                              │
│   └──▶ Promise<Result<number, RAGError>>                                    │
│                                                                             │
│ findByHash(hash: string)                                                    │
│   └──▶ Promise<Result<Chunk | null, RAGError>>                              │
│                                                                             │
│ findByIds(ids: ChunkId[])                                                   │
│   └──▶ Promise<Result<Chunk[], RAGError>>                                   │
│                                                                             │
│ findAdjacent(chunkId: ChunkId)                                              │
│   └──▶ Promise<Result<{ prev: Chunk|null, next: Chunk|null }, RAGError>>    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 EntityRepository 固有メソッド

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ findByNormalizedNameAndType(normalizedName: string, type: string)           │
│   └──▶ Promise<Result<Entity | null, RAGError>>                             │
│                                                                             │
│ findByType(type: string)                                                    │
│   └──▶ Promise<Result<Entity[], RAGError>>                                  │
│                                                                             │
│ searchByName(query: string)                                                 │
│   └──▶ Promise<Result<Entity[], RAGError>>                                  │
│                                                                             │
│ findTopByImportance(limit?: number)                                         │
│   └──▶ Promise<Result<Entity[], RAGError>>                                  │
│                                                                             │
│ upsert(data: NewEntity)                                                     │
│   └──▶ Promise<Result<Entity, RAGError>>                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
