# Repository実装テンプレート

## 基本テンプレート

```typescript
// ファイル: src/shared/infrastructure/database/repositories/{{EntityName}}Repository.ts

import { eq, and, desc, inArray } from 'drizzle-orm'
import type { DatabaseClient } from '../db'
import { {{tableName}} } from '../schema'
import type { I{{EntityName}}Repository } from '@/shared/core/interfaces/I{{EntityName}}Repository'
import type { {{EntityName}} } from '@/shared/core/entities/{{EntityName}}'
import type { {{EntityName}}Id } from '@/shared/core/types/{{EntityName}}Id'

/**
 * {{EntityName}} DBレコード型
 */
type {{EntityName}}Record = typeof {{tableName}}.$inferSelect

/**
 * {{EntityName}} Repositoryの実装
 *
 * @description
 * Drizzle ORMを使用した{{EntityName}}のデータアクセス層実装。
 * ドメインエンティティとDBレコード間の変換を担当します。
 */
export class {{EntityName}}Repository implements I{{EntityName}}Repository {
  constructor(private readonly db: DatabaseClient) {}

  // ===== 変換関数 =====

  /**
   * DBレコードをドメインエンティティに変換
   */
  private toEntity(record: {{EntityName}}Record): {{EntityName}} {
    return {
      id: record.id as {{EntityName}}Id,
      // TODO: フィールドマッピングを実装
      // status: record.status as {{EntityName}}Status,
      // name: record.name,
      // config: record.config_json ? JSON.parse(record.config_json) : null,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    }
  }

  /**
   * ドメインエンティティをDBレコードに変換
   */
  private toRecord(entity: {{EntityName}}): Partial<{{EntityName}}Record> {
    return {
      id: entity.id,
      // TODO: フィールドマッピングを実装
      // status: entity.status,
      // name: entity.name,
      // config_json: entity.config ? JSON.stringify(entity.config) : null,
      updated_at: new Date().toISOString(),
    }
  }

  // ===== 基本CRUD操作 =====

  async add(entity: {{EntityName}}): Promise<{{EntityName}}> {
    const record = this.toRecord(entity)

    const [inserted] = await this.db
      .insert({{tableName}})
      .values({
        ...record,
        id: entity.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
      })
      .returning()

    return this.toEntity(inserted)
  }

  async findById(id: {{EntityName}}Id): Promise<{{EntityName}} | null> {
    const records = await this.db
      .select()
      .from({{tableName}})
      .where(eq({{tableName}}.id, id))
      .limit(1)

    return records[0] ? this.toEntity(records[0]) : null
  }

  async findAll(): Promise<{{EntityName}}[]> {
    const records = await this.db
      .select()
      .from({{tableName}})
      .orderBy(desc({{tableName}}.created_at))

    return records.map(r => this.toEntity(r))
  }

  async update(entity: {{EntityName}}): Promise<{{EntityName}}> {
    const record = this.toRecord(entity)

    const [updated] = await this.db
      .update({{tableName}})
      .set(record)
      .where(eq({{tableName}}.id, entity.id))
      .returning()

    if (!updated) {
      throw new Error(`{{EntityName}} with id ${entity.id} not found`)
    }

    return this.toEntity(updated)
  }

  async remove(entity: {{EntityName}}): Promise<void> {
    await this.removeById(entity.id)
  }

  async removeById(id: {{EntityName}}Id): Promise<boolean> {
    // 論理削除の場合
    const result = await this.db
      .update({{tableName}})
      .set({ deleted_at: new Date().toISOString() })
      .where(eq({{tableName}}.id, id))

    // 物理削除の場合
    // const result = await this.db
    //   .delete({{tableName}})
    //   .where(eq({{tableName}}.id, id))

    return result.rowCount > 0
  }

  // ===== 存在確認・カウント =====

  async exists(id: {{EntityName}}Id): Promise<boolean> {
    const records = await this.db
      .select({ id: {{tableName}}.id })
      .from({{tableName}})
      .where(eq({{tableName}}.id, id))
      .limit(1)

    return records.length > 0
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from({{tableName}})

    return Number(result[0]?.count ?? 0)
  }

  // ===== ドメイン固有検索 =====

  // TODO: ビジネス要件に応じて実装
  // async findByStatus(status: {{EntityName}}Status): Promise<{{EntityName}}[]> {
  //   const records = await this.db
  //     .select()
  //     .from({{tableName}})
  //     .where(eq({{tableName}}.status, status))
  //     .orderBy(desc({{tableName}}.created_at))
  //
  //   return records.map(r => this.toEntity(r))
  // }

  // async findByUserId(userId: UserId): Promise<{{EntityName}}[]> {
  //   const records = await this.db
  //     .select()
  //     .from({{tableName}})
  //     .where(eq({{tableName}}.user_id, userId))
  //     .orderBy(desc({{tableName}}.created_at))
  //
  //   return records.map(r => this.toEntity(r))
  // }
}
```

## 変数置換ガイド

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{EntityName}}` | エンティティ名（PascalCase） | `Workflow` |
| `{{tableName}}` | Drizzleテーブル変数名 | `workflowsTable` |
| `{{EntityName}}Id` | ID型 | `WorkflowId` |
| `{{EntityName}}Status` | ステータスEnum | `WorkflowStatus` |
| `{{EntityName}}Record` | DBレコード型 | `WorkflowRecord` |

## 論理削除対応版

```typescript
// findAllを論理削除対応にする場合
async findAll(): Promise<{{EntityName}}[]> {
  const records = await this.db
    .select()
    .from({{tableName}})
    .where(isNull({{tableName}}.deleted_at))  // 削除済みを除外
    .orderBy(desc({{tableName}}.created_at))

  return records.map(r => this.toEntity(r))
}

// findByIdも論理削除対応
async findById(id: {{EntityName}}Id): Promise<{{EntityName}} | null> {
  const records = await this.db
    .select()
    .from({{tableName}})
    .where(and(
      eq({{tableName}}.id, id),
      isNull({{tableName}}.deleted_at)  // 削除済みを除外
    ))
    .limit(1)

  return records[0] ? this.toEntity(records[0]) : null
}
```

## エラーハンドリング付き版

```typescript
import {
  EntityNotFoundError,
  UniqueConstraintError,
  RepositoryError,
} from '@/shared/core/errors'

export class {{EntityName}}Repository implements I{{EntityName}}Repository {
  // ...

  async add(entity: {{EntityName}}): Promise<{{EntityName}}> {
    try {
      const record = this.toRecord(entity)

      const [inserted] = await this.db
        .insert({{tableName}})
        .values({
          ...record,
          id: entity.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
        })
        .returning()

      return this.toEntity(inserted)
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new UniqueConstraintError('id', entity.id)
      }
      throw new RepositoryError('Failed to add {{EntityName}}', error as Error)
    }
  }

  async update(entity: {{EntityName}}): Promise<{{EntityName}}> {
    const record = this.toRecord(entity)

    const [updated] = await this.db
      .update({{tableName}})
      .set(record)
      .where(eq({{tableName}}.id, entity.id))
      .returning()

    if (!updated) {
      throw new EntityNotFoundError(entity.id)
    }

    return this.toEntity(updated)
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (error as any)?.code === '23505'  // PostgreSQL unique violation
  }
}
```

## 配置ルール

- **ファイルパス**: `src/shared/infrastructure/database/repositories/{{EntityName}}Repository.ts`
- **テストパス**: `src/shared/infrastructure/database/repositories/__tests__/{{EntityName}}Repository.test.ts`
- **依存関係**: インターフェース（core層）とORM（infrastructure層）
