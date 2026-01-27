# [機能名] インターフェース・型定義仕様

> TypeScript型定義・インターフェースの仕様
> カテゴリ: インターフェース
> 読み込み条件: [機能名] の型定義確認・実装時

---

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| バージョン   | 1.0.0                                |
| 最終更新     | YYYY-MM-DD                           |
| 実装ファイル | `packages/shared/src/types/xxx.ts`   |
| スキーマ     | `packages/shared/src/schemas/xxx.ts` |

---

## 1. 型定義一覧

### 1.1 エンティティ型

| 型名        | 用途               | 定義箇所 |
| ----------- | ------------------ | -------- |
| Entity      | メインエンティティ | L10-25   |
| EntityDTO   | データ転送用       | L27-35   |
| EntityInput | 入力用             | L37-45   |

### 1.2 列挙型

| 型名         | 値                       | 用途     |
| ------------ | ------------------------ | -------- |
| EntityStatus | pending/active/completed | 状態管理 |
| EntityType   | typeA/typeB/typeC        | 分類     |

---

## 2. エンティティ型詳細

### 2.1 Entity

メインエンティティの型定義。

```typescript
export interface Entity {
  /** 一意識別子 */
  id: string;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
  /** ステータス */
  status: EntityStatus;
  // ... 他のフィールド
}
```

| フィールド | 型           | 必須 | 説明             |
| ---------- | ------------ | ---- | ---------------- |
| id         | string       | ✓    | UUID形式         |
| createdAt  | Date         | ✓    | 作成日時         |
| updatedAt  | Date         | ✓    | 更新日時         |
| status     | EntityStatus | ✓    | 現在のステータス |

### 2.2 EntityDTO

API応答/永続化用のデータ転送オブジェクト。

```typescript
export interface EntityDTO {
  id: string;
  createdAt: string; // ISO 8601形式
  updatedAt: string;
  status: string;
}
```

### 2.3 EntityInput

作成/更新時の入力型。

```typescript
export interface EntityInput {
  // 必須フィールド
  name: string;
  // オプションフィールド
  description?: string;
}
```

---

## 3. Zodスキーマ

### 3.1 バリデーションスキーマ

```typescript
import { z } from "zod";

export const EntityInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const EntityIdSchema = z.string().uuid();
```

### 3.2 スキーマ-型変換

```typescript
export type EntityInput = z.infer<typeof EntityInputSchema>;
```

---

## 4. Result型パターン

### 4.1 操作結果型

```typescript
export type EntityResult = OperationResult<Entity>;
export type EntityListResult = OperationResult<Entity[]>;
```

### 4.2 エラー型

```typescript
export type EntityError =
  | { code: "NOT_FOUND"; message: string }
  | { code: "VALIDATION_ERROR"; message: string; details: unknown }
  | { code: "CONFLICT"; message: string };
```

---

## 5. ユーティリティ型

### 5.1 変換関数型

```typescript
export type EntityToDTO = (entity: Entity) => EntityDTO;
export type DTOToEntity = (dto: EntityDTO) => Entity;
```

### 5.2 フィルター型

```typescript
export interface EntityFilter {
  status?: EntityStatus;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}
```

---

## 6. 実装ファイル

| 種別               | パス                                    |
| ------------------ | --------------------------------------- |
| 型定義             | `packages/shared/src/types/entity.ts`   |
| Zodスキーマ        | `packages/shared/src/schemas/entity.ts` |
| 変換ユーティリティ | `packages/shared/src/utils/entity.ts`   |
| テスト             | `packages/shared/src/types/__tests__/`  |

---

## 関連ドキュメント

| ドキュメント       | 説明            |
| ------------------ | --------------- |
| api-xxx.md         | API仕様         |
| interfaces-core.md | 共通型定義      |
| database-schema.md | DB スキーマ対応 |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
