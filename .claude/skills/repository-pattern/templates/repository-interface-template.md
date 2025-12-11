# Repositoryインターフェーステンプレート

## 基本テンプレート

```typescript
// ファイル: src/shared/core/interfaces/I{{EntityName}}Repository.ts

import type { {{EntityName}} } from '../entities/{{EntityName}}'
import type { {{EntityName}}Id } from '../types/{{EntityName}}Id'

/**
 * {{EntityName}}エンティティのリポジトリインターフェース
 *
 * @description
 * {{EntityNameDescription}}のCRUD操作と検索機能を提供します。
 * 実装はインフラストラクチャ層で行い、ドメイン層はこのインターフェースにのみ依存します。
 */
export interface I{{EntityName}}Repository {
  // ===== 基本CRUD操作 =====

  /**
   * 新しい{{EntityName}}を追加
   * @param entity 追加するエンティティ
   * @returns 追加されたエンティティ（ID付き）
   */
  add(entity: {{EntityName}}): Promise<{{EntityName}}>

  /**
   * IDで{{EntityName}}を取得
   * @param id エンティティID
   * @returns エンティティまたはnull
   */
  findById(id: {{EntityName}}Id): Promise<{{EntityName}} | null>

  /**
   * 全ての{{EntityName}}を取得
   * @returns エンティティの配列
   */
  findAll(): Promise<{{EntityName}}[]>

  /**
   * {{EntityName}}を更新
   * @param entity 更新するエンティティ
   * @returns 更新されたエンティティ
   * @throws EntityNotFoundError エンティティが存在しない場合
   */
  update(entity: {{EntityName}}): Promise<{{EntityName}}>

  /**
   * {{EntityName}}を削除
   * @param entity 削除するエンティティ
   */
  remove(entity: {{EntityName}}): Promise<void>

  /**
   * IDで{{EntityName}}を削除
   * @param id エンティティID
   * @returns 削除に成功した場合true
   */
  removeById(id: {{EntityName}}Id): Promise<boolean>

  // ===== 存在確認・カウント =====

  /**
   * 指定IDのエンティティが存在するか確認
   * @param id エンティティID
   * @returns 存在する場合true
   */
  exists(id: {{EntityName}}Id): Promise<boolean>

  /**
   * エンティティの総数を取得
   * @returns エンティティ数
   */
  count(): Promise<number>

  // ===== ドメイン固有検索 =====

  // TODO: ビジネス要件に応じて追加
  // 例:
  // findByStatus(status: {{EntityName}}Status): Promise<{{EntityName}}[]>
  // findByUserId(userId: UserId): Promise<{{EntityName}}[]>
  // findCreatedAfter(date: Date): Promise<{{EntityName}}[]>
}
```

## 変数置換ガイド

| 変数                        | 説明                         | 例               |
| --------------------------- | ---------------------------- | ---------------- |
| `{{EntityName}}`            | エンティティ名（PascalCase） | `Workflow`       |
| `{{EntityNameDescription}}` | エンティティの説明           | `ワークフロー`   |
| `{{EntityName}}Id`          | ID型（ブランド型推奨）       | `WorkflowId`     |
| `{{EntityName}}Status`      | ステータスEnum               | `WorkflowStatus` |

## ドメイン固有メソッド追加例

### ステータス検索

```typescript
/**
 * 指定ステータスの{{EntityName}}を取得
 * @param status 検索するステータス
 * @returns マッチするエンティティの配列
 */
findByStatus(status: {{EntityName}}Status): Promise<{{EntityName}}[]>

/**
 * 処理待ちの{{EntityName}}を取得
 * @returns PENDINGステータスのエンティティ配列
 */
findPending(): Promise<{{EntityName}}[]>
```

### ユーザー検索

```typescript
/**
 * 指定ユーザーの{{EntityName}}を取得
 * @param userId ユーザーID
 * @returns マッチするエンティティの配列
 */
findByUserId(userId: UserId): Promise<{{EntityName}}[]>
```

### 期間検索

```typescript
/**
 * 指定日以降に作成された{{EntityName}}を取得
 * @param date 開始日
 * @returns マッチするエンティティの配列
 */
findCreatedAfter(date: Date): Promise<{{EntityName}}[]>

/**
 * 指定期間内に作成された{{EntityName}}を取得
 * @param start 開始日
 * @param end 終了日
 * @returns マッチするエンティティの配列
 */
findCreatedBetween(start: Date, end: Date): Promise<{{EntityName}}[]>
```

### ページネーション

```typescript
/**
 * ページネーション付きで{{EntityName}}を取得
 * @param page ページ番号（0始まり）
 * @param size 1ページあたりの件数
 * @returns ページ情報付きエンティティ配列
 */
findAllPaginated(page: number, size: number): Promise<Page<{{EntityName}}>>
```

### バルク操作

```typescript
/**
 * 複数IDで{{EntityName}}を取得
 * @param ids ID配列
 * @returns マッチするエンティティの配列
 */
findByIds(ids: {{EntityName}}Id[]): Promise<{{EntityName}}[]>

/**
 * 複数の{{EntityName}}を一括追加
 * @param entities エンティティ配列
 * @returns 追加されたエンティティ配列
 */
addAll(entities: {{EntityName}}[]): Promise<{{EntityName}}[]>
```

## 配置ルール

- **ファイルパス**: `src/shared/core/interfaces/I{{EntityName}}Repository.ts`
- **依存関係**: ドメインエンティティと型のみに依存
- **DB非依存**: ORM固有の型やSQLを含めない
