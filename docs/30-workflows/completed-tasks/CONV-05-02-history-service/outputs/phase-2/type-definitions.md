# 履歴取得サービス - 型定義設計書

> Phase 2: 設計 成果物
> 作成日: 2026-01-09
> スキル: type-safety-patterns

---

## 1. 概要

本ドキュメントは履歴取得サービスで使用するTypeScript型定義を設計する。

---

## 2. コア型定義

### 2.1 VersionHistoryItem

バージョン履歴の1アイテムを表す型。

```typescript
/**
 * バージョン履歴アイテム
 * @description ファイルの1バージョンを表すデータ構造
 */
interface VersionHistoryItem {
  /** 変換ID（UUID） */
  conversionId: string;

  /** ファイルID（UUID） */
  fileId: string;

  /** ファイル名 */
  fileName: string;

  /** バージョン番号（1から連番、新しいほど大きい） */
  version: number;

  /** 作成日時 */
  createdAt: Date;

  /** MIMEタイプ */
  mimeType: string;

  /** コンテンツハッシュ（SHA-256） */
  contentHash: string;

  /** ファイルサイズ（バイト） */
  sizeBytes: number;

  /** メタデータ（拡張用） */
  metadata?: Record<string, unknown>;

  /** 現在のバージョンかどうか */
  isCurrentVersion: boolean;
}
```

### 2.2 VersionDiff

2バージョン間の差分情報を表す型。

```typescript
/**
 * バージョン差分情報
 * @description 2つのバージョン間の差分を表すデータ構造
 */
interface VersionDiff {
  /** 比較元の変換ID */
  conversionIdA: string;

  /** 比較先の変換ID */
  conversionIdB: string;

  /** サイズ変更（B - A、正の値は増加） */
  sizeChange: number;

  /** メタデータの変更点 */
  metadataChanges: MetadataChange[];

  /** コンテンツが変更されたか */
  contentChanged: boolean;
}

/**
 * メタデータ変更情報
 */
interface MetadataChange {
  /** 変更されたキー */
  key: string;

  /** 変更前の値 */
  oldValue: unknown;

  /** 変更後の値 */
  newValue: unknown;
}
```

---

## 3. オプション型

### 3.1 HistoryFilter

履歴のフィルタ条件。

```typescript
/**
 * 履歴フィルタ
 * @description 履歴取得時のフィルタ条件
 */
interface HistoryFilter {
  /** 開始日（この日以降） */
  dateFrom?: Date;

  /** 終了日（この日以前） */
  dateTo?: Date;

  /** 対象MIMEタイプ（複数指定可） */
  mimeTypes?: string[];
}
```

### 3.2 PaginationOptions

ページネーション設定。

```typescript
/**
 * ページネーションオプション
 * @description 履歴取得時のページネーション設定
 */
interface PaginationOptions {
  /** 取得件数（1-100、デフォルト20） */
  limit: number;

  /** オフセット（0以上、デフォルト0） */
  offset: number;
}
```

### 3.3 HistoryOptions

履歴取得の複合オプション。

```typescript
/**
 * 履歴取得オプション
 */
interface HistoryOptions {
  /** フィルタ条件 */
  filter?: HistoryFilter;

  /** ページネーション */
  pagination?: PaginationOptions;
}
```

---

## 4. 結果型

### 4.1 PaginatedResult

ページネーション結果のジェネリック型。

```typescript
/**
 * ページネーション結果
 * @template T 結果アイテムの型
 */
interface PaginatedResult<T> {
  /** 結果アイテム配列 */
  items: T[];

  /** 総件数 */
  total: number;

  /** 次ページが存在するか */
  hasMore: boolean;
}
```

### 4.2 Result型

既存のResult型を使用。

```typescript
// packages/shared/src/types/rag/result.ts からインポート
import { Result, ok, err } from "@repo/shared/types/rag/result";
```

---

## 5. 入力型

### 5.1 CreateConversionInput

復元時の新規変換作成入力。

```typescript
/**
 * 変換作成入力
 * @description 復元時に新規変換を作成するための入力データ
 */
interface CreateConversionInput {
  /** ファイルID */
  fileId: string;

  /** ファイル名 */
  fileName: string;

  /** MIMEタイプ */
  mimeType: string;

  /** コンテンツ */
  content: Buffer | string;

  /** メタデータ */
  metadata?: Record<string, unknown>;
}
```

---

## 6. 内部型（Conversion）

ConversionRepositoryが返す内部型。

```typescript
/**
 * 変換データ（Repository層）
 * @description ConversionRepositoryから返されるデータ構造
 */
interface Conversion {
  /** ID（UUID） */
  id: string;

  /** ファイルID */
  fileId: string;

  /** ファイル名 */
  fileName: string;

  /** 作成日時 */
  createdAt: Date;

  /** MIMEタイプ */
  mimeType: string;

  /** コンテンツハッシュ */
  contentHash: string;

  /** ファイルサイズ */
  sizeBytes: number;

  /** メタデータ */
  metadata?: Record<string, unknown>;

  /** コンテンツ（復元時に使用） */
  content?: Buffer | string;
}
```

---

## 7. 型ガード

### 7.1 VersionHistoryItem型ガード

```typescript
/**
 * VersionHistoryItemの型ガード
 */
function isVersionHistoryItem(value: unknown): value is VersionHistoryItem {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.conversionId === "string" &&
    typeof obj.fileId === "string" &&
    typeof obj.fileName === "string" &&
    typeof obj.version === "number" &&
    obj.createdAt instanceof Date &&
    typeof obj.mimeType === "string" &&
    typeof obj.contentHash === "string" &&
    typeof obj.sizeBytes === "number" &&
    typeof obj.isCurrentVersion === "boolean"
  );
}
```

---

## 8. ジェネリック設計

### 8.1 PaginatedResult

```typescript
// 汎用ページネーション結果型
// 履歴以外でも再利用可能
type PaginatedResult<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
};

// 使用例
type PaginatedHistory = PaginatedResult<VersionHistoryItem>;
```

---

## 9. Discriminated Union設計

### 9.1 Result型（既存）

```typescript
// 識別可能ユニオンによるResult型
type Success<T> = { success: true; data: T };
type Failure<E> = { success: false; error: E };
type Result<T, E = Error> = Success<T> | Failure<E>;

// 網羅性チェック
function handleResult<T>(result: Result<T>) {
  if (result.success) {
    // result.data: T
    return result.data;
  } else {
    // result.error: Error
    throw result.error;
  }
}
```

---

## 10. 型のインポート構成

```typescript
// packages/shared/src/services/history/types.ts

// 外部インポート
import { z } from "zod";

// 型エクスポート
export type {
  VersionHistoryItem,
  VersionDiff,
  MetadataChange,
  HistoryFilter,
  PaginationOptions,
  HistoryOptions,
  PaginatedResult,
  CreateConversionInput,
  Conversion,
};

// 型ガードエクスポート
export { isVersionHistoryItem };

// Zodスキーマエクスポート（api-specification.mdで定義）
export {
  versionHistoryItemSchema,
  historyFilterSchema,
  paginationOptionsSchema,
};
```

---

## 11. 型安全性チェックリスト

| チェック項目            | 対応                 |
| ----------------------- | -------------------- |
| strictモード有効        | o                    |
| any型不使用             | o                    |
| unknown + 型ガード使用  | o                    |
| Discriminated Union使用 | o（Result型）        |
| ジェネリック活用        | o（PaginatedResult） |
| 必須/オプションの明示   | o                    |
| readonly活用            | 検討中               |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-09 | 1.0.0      | 初版作成 |
