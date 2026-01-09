# 履歴取得サービス - アーキテクチャ設計書

> Phase 2: 設計 成果物
> 作成日: 2026-01-09
> スキル: repository-pattern

---

## 1. 概要

本ドキュメントは履歴取得サービス（HistoryService）のアーキテクチャ設計を定義する。

---

## 2. レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    HistoryService                        ││
│  │  • getFileHistory()      • getVersionDiff()              ││
│  │  • getVersionDetail()    • restoreToVersion()            ││
│  │  • getLatestVersion()    • getVersionCount()             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ VersionHistoryItem│  │ VersionDiff                      │ │
│  │ • conversionId    │  │ • sizeChange                     │ │
│  │ • fileId          │  │ • metadataChanges                │ │
│  │ • version         │  │ • contentChanged                 │ │
│  │ • createdAt       │  │                                  │ │
│  │ • isCurrentVersion│  │                                  │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│  ┌────────────────────┐  ┌────────────────────────────────┐ │
│  │ConversionRepository│  │ IConversionLogger              │ │
│  │ • findByFileId()   │  │ • info()                       │ │
│  │ • findById()       │  │ • warn()                       │ │
│  │ • create()         │  │ • error()                      │ │
│  │ • countByFileId()  │  │                                │ │
│  └────────────────────┘  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 依存関係

### 3.1 依存グラフ

```
HistoryService
    ├── ConversionRepository (依存)
    │   ├── findByFileId()
    │   ├── findById()
    │   ├── create()
    │   └── countByFileId()
    │
    ├── FileRepository (依存、将来拡張用)
    │   └── findById()
    │
    └── IConversionLogger (依存)
        └── info()
```

### 3.2 依存性注入

```typescript
// コンストラクタによる依存性注入
class HistoryService implements IHistoryService {
  constructor(
    private readonly conversionRepository: ConversionRepository,
    private readonly fileRepository: FileRepository,
    private readonly logger: IConversionLogger,
  ) {}
}
```

---

## 4. インターフェース設計

### 4.1 IHistoryService

```typescript
interface IHistoryService {
  /**
   * ファイルのバージョン履歴一覧を取得
   * @param fileId ファイルID
   * @param options フィルタ・ページネーション
   * @returns ページネーション付き履歴一覧
   */
  getFileHistory(
    fileId: string,
    options?: HistoryOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>;

  /**
   * 特定バージョンの詳細を取得
   * @param conversionId 変換ID
   * @returns バージョン詳細
   */
  getVersionDetail(
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;

  /**
   * 2つのバージョン間の差分情報を取得
   * @param conversionIdA 比較元
   * @param conversionIdB 比較先
   * @returns 差分情報
   */
  getVersionDiff(
    conversionIdA: string,
    conversionIdB: string,
  ): Promise<Result<VersionDiff, Error>>;

  /**
   * 特定バージョンに復元（新バージョン作成）
   * @param fileId ファイルID
   * @param conversionId 復元対象の変換ID
   * @returns 復元後の新バージョン
   */
  restoreToVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;

  /**
   * 最新バージョンを取得
   * @param fileId ファイルID
   * @returns 最新バージョン（存在しない場合null）
   */
  getLatestVersion(
    fileId: string,
  ): Promise<Result<VersionHistoryItem | null, Error>>;

  /**
   * バージョン数を取得
   * @param fileId ファイルID
   * @returns バージョン総数
   */
  getVersionCount(fileId: string): Promise<Result<number, Error>>;
}
```

### 4.2 ConversionRepository（依存インターフェース）

```typescript
interface ConversionRepository {
  /**
   * ファイルIDで変換履歴を検索
   */
  findByFileId(
    fileId: string,
    options?: {
      orderBy?: "createdAt";
      orderDirection?: "asc" | "desc";
      limit?: number;
      offset?: number;
      filter?: HistoryFilter;
    },
  ): Promise<Result<Conversion[], Error>>;

  /**
   * 変換IDで単一取得
   */
  findById(conversionId: string): Promise<Result<Conversion | null, Error>>;

  /**
   * 新規変換を作成
   */
  create(data: CreateConversionInput): Promise<Result<Conversion, Error>>;

  /**
   * ファイルIDでカウント
   */
  countByFileId(fileId: string): Promise<Result<number, Error>>;
}
```

---

## 5. ファイル構成

```
packages/shared/src/services/history/
├── index.ts                 # 公開API（エクスポート）
├── types.ts                 # 型定義・Zodスキーマ
├── history-service.ts       # HistoryServiceクラス
└── __tests__/
    ├── history-service.test.ts
    └── mocks/
        ├── conversion-repository.mock.ts
        └── logger.mock.ts
```

---

## 6. データフロー

### 6.1 履歴一覧取得フロー

```
getFileHistory(fileId, options)
    │
    ├── 1. conversionRepository.findByFileId(fileId, options)
    │       └── Result<Conversion[]>
    │
    ├── 2. getLatestVersion(fileId)
    │       └── Result<VersionHistoryItem | null>
    │
    ├── 3. getVersionCount(fileId)
    │       └── Result<number>
    │
    └── 4. Conversion[] → VersionHistoryItem[] 変換
            └── Result<PaginatedResult<VersionHistoryItem>>
```

### 6.2 バージョン復元フロー

```
restoreToVersion(fileId, conversionId)
    │
    ├── 1. conversionRepository.findById(conversionId)
    │       └── 存在確認 → エラーハンドリング
    │
    ├── 2. fileId一致検証
    │       └── 不一致 → エラー
    │
    ├── 3. conversionRepository.create(newConversion)
    │       └── 新バージョン作成（メタデータにrestoredFrom追加）
    │
    ├── 4. logger.info({ action: "restore", ... })
    │       └── ログ記録
    │
    └── 5. getVersionDetail(newConversionId)
            └── Result<VersionHistoryItem>
```

---

## 7. エラーハンドリング戦略

### 7.1 Result型パターン

```typescript
// 成功
return ok({
  items: historyItems,
  total: totalCount,
  hasMore: hasMore,
});

// 失敗
return err(new Error("Conversion not found: " + conversionId));
```

### 7.2 エラー種別

| エラー種別       | メッセージパターン                                 | 対応         |
| ---------------- | -------------------------------------------------- | ------------ |
| 変換が存在しない | `Conversion not found: {id}`                       | Result.error |
| ファイル不一致   | `Conversion {id} does not belong to file {fileId}` | Result.error |
| Repository障害   | Repository層のエラーをそのまま伝播                 | Result.error |

### 7.3 エラー伝播

```typescript
// Repository層のエラーを伝播
if (!result.success) {
  return err(result.error);
}
```

---

## 8. 統合ポイント

### 8.1 ConversionRepository連携

| メソッド      | 呼び出し元                                         | 備考                         |
| ------------- | -------------------------------------------------- | ---------------------------- |
| findByFileId  | getFileHistory, getLatestVersion                   | ソート・ページネーション対応 |
| findById      | getVersionDetail, getVersionDiff, restoreToVersion | 単一取得                     |
| create        | restoreToVersion                                   | 復元時の新規作成             |
| countByFileId | getVersionCount, getFileHistory                    | 総件数取得                   |

### 8.2 IConversionLogger連携

| メソッド | 呼び出し元       | ログ内容       |
| -------- | ---------------- | -------------- |
| info     | restoreToVersion | 復元操作のログ |

---

## 9. 非機能要件対応

### 9.1 パフォーマンス

- ページネーションによる大量データ対応
- limit+1取得によるhasMore判定（追加クエリ不要）
- Promise.allによる並列取得（getVersionDiff）

### 9.2 テスタビリティ

- 依存性注入による疎結合設計
- モック可能なRepositoryインターフェース
- Result型による確定的なエラーハンドリング

### 9.3 保守性

- 単一責任原則（SRP）の遵守
- ドメイン層とインフラ層の分離
- 明確なインターフェース定義

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-09 | 1.0.0      | 初版作成 |
