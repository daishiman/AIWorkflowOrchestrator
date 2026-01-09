# Phase 4: テストケース設計

## 概要

履歴取得サービスのテストケース設計とモック/スタブ設計を定義する。

## モック設計

### ConversionRepository モック

```typescript
// packages/shared/src/services/history/__tests__/mocks/conversion-repository.mock.ts

export function createMockConversionRepository(): ConversionRepository & {
  _conversions: Conversion[];
  _setConversions: (conversions: Conversion[]) => void;
  _addConversion: (conversion: Conversion) => void;
  _clear: () => void;
};
```

**機能**:

- `_setConversions`: テストデータのセットアップ
- `_addConversion`: テストデータの追加
- `_clear`: データのクリア
- `findByFileId`: フィルタ、ソート、ページネーションを完全サポート
- `findById`: IDによる検索
- `create`: 新規変換の作成
- `countByFileId`: 件数取得

### Logger モック

```typescript
// packages/shared/src/services/history/__tests__/mocks/logger.mock.ts

export function createMockLogger(): IConversionLogger & {
  _logs: ConversionLog[];
  _getLogs: () => ConversionLog[];
  _clear: () => void;
};
```

**機能**:

- `_getLogs`: 記録されたログの取得（検証用）
- `_clear`: ログのクリア
- `info/warn/error/batch/flush`: 標準ロガーインターフェースの実装

### テストデータファクトリ

```typescript
// packages/shared/src/services/history/__tests__/mocks/conversion-repository.mock.ts

export function createMockConversion(
  overrides: Partial<Conversion> = {},
): Conversion;
```

**デフォルト値**:

- `id`: ランダムUUID
- `fileId`: "file-123"
- `fileName`: "test.txt"
- `createdAt`: 現在時刻
- `mimeType`: "text/plain"
- `contentHash`: ランダムハッシュ
- `sizeBytes`: 1024
- `metadata`: {}

## テストシナリオ詳細

### シナリオ1: 履歴一覧取得の基本フロー

```
┌─────────────────────────────────────────────────────────┐
│ Test: AC-001-01 ファイルの履歴一覧を取得できる           │
├─────────────────────────────────────────────────────────┤
│ Given:                                                  │
│   - mockConvRepo._setConversions([conv1, conv2, conv3]) │
│                                                         │
│ When:                                                   │
│   - result = await service.getFileHistory("file-123")   │
│                                                         │
│ Then:                                                   │
│   - result.success === true                             │
│   - result.data.items.length === 3                      │
│   - result.data.total === 3                             │
│   - result.data.hasMore === false                       │
└─────────────────────────────────────────────────────────┘
```

### シナリオ2: ページネーション

```
┌─────────────────────────────────────────────────────────┐
│ Test: AC-001-02 ページネーションが正しく動作する         │
├─────────────────────────────────────────────────────────┤
│ Given:                                                  │
│   - 10件のConversionをセットアップ                       │
│                                                         │
│ When:                                                   │
│   - result = await service.getFileHistory("file-123",   │
│       { pagination: { limit: 5, offset: 0 } })          │
│                                                         │
│ Then:                                                   │
│   - result.data.items.length === 5                      │
│   - result.data.total === 10                            │
│   - result.data.hasMore === true                        │
└─────────────────────────────────────────────────────────┘
```

### シナリオ3: バージョン復元

```
┌─────────────────────────────────────────────────────────┐
│ Test: AC-004-01 バージョンを復元できる                   │
├─────────────────────────────────────────────────────────┤
│ Given:                                                  │
│   - 古いバージョン conv-old が存在                       │
│                                                         │
│ When:                                                   │
│   - result = await service.restoreToVersion(            │
│       "file-123", "conv-old")                           │
│                                                         │
│ Then:                                                   │
│   - result.success === true                             │
│   - result.data.conversionId !== "conv-old"             │
│   - result.data.fileId === "file-123"                   │
│   - result.data.metadata.restoredFrom === "conv-old"    │
│                                                         │
│ Side Effects:                                           │
│   - mockLogger._getLogs() にログが記録される             │
└─────────────────────────────────────────────────────────┘
```

## エラーケーステスト

### エラー分類

| エラー種別       | テストケース | エラーメッセージ                                   |
| ---------------- | ------------ | -------------------------------------------------- |
| NotFound         | AC-002-02    | "Conversion not found: {id}"                       |
| NotFound         | AC-003-05    | "Conversion A not found: {id}"                     |
| NotFound         | AC-003-06    | "Conversion B not found: {id}"                     |
| InvalidOperation | AC-004-03    | "Conversion {id} does not belong to file {fileId}" |

### エラーテストパターン

```typescript
it("AC-002-02: 存在しない変換IDはエラー", async () => {
  // Given: データなし
  mockConvRepo._setConversions([]);

  // When: 存在しないIDで取得
  const result = await service.getVersionDetail("not-found");

  // Then: エラー
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.message).toContain("Conversion not found");
  }
});
```

## 境界値テスト

### ページネーション境界値

| ケース          | 入力                        | 期待結果                |
| --------------- | --------------------------- | ----------------------- |
| ちょうどlimit件 | total=20, limit=20          | hasMore=false           |
| limit+1件       | total=21, limit=20          | hasMore=true            |
| offset超過      | total=5, offset=10          | items=[], total=5       |
| offset=0        | total=10, offset=0, limit=5 | items=5件, hasMore=true |

### 日付フィルタ境界値

| ケース       | 入力                       | 期待結果     |
| ------------ | -------------------------- | ------------ |
| dateFromのみ | 2026-01-05以降             | 条件以降のみ |
| dateToのみ   | 2026-01-05まで             | 条件以前のみ |
| 両方指定     | 01-03〜01-08               | 範囲内のみ   |
| 範囲外       | 01-20〜01-30（データなし） | items=[]     |

## テスト実行順序

```
1. HistoryService
   ├── getFileHistory
   │   ├── AC-001-01: 基本取得
   │   ├── AC-001-02: ページネーション
   │   ├── AC-001-03: 日付フィルタ
   │   ├── AC-001-04: 空の履歴
   │   └── AC-001-05: ソート順
   │
   ├── getVersionDetail
   │   ├── AC-002-01: 基本取得
   │   ├── AC-002-02: NotFound
   │   └── AC-002-03: 最新フラグ
   │
   ├── getVersionDiff
   │   ├── AC-003-01: サイズ変更
   │   ├── AC-003-02: コンテンツ変更
   │   ├── AC-003-03: コンテンツ未変更
   │   ├── AC-003-04: メタデータ変更
   │   ├── AC-003-05: 変換A NotFound
   │   └── AC-003-06: 変換B NotFound
   │
   ├── restoreToVersion
   │   ├── AC-004-01: 基本復元
   │   ├── AC-004-02: NotFound
   │   ├── AC-004-03: 別ファイル
   │   └── AC-004-04: ログ記録
   │
   ├── getLatestVersion
   │   ├── AC-005-01: 基本取得
   │   └── AC-005-02: 履歴なし
   │
   ├── getVersionCount
   │   ├── AC-006-01: 基本取得
   │   └── AC-006-02: 履歴なし
   │
   └── Edge Cases
       ├── EC-001: ページネーション境界
       ├── EC-002: オフセット超過
       └── EC-003: 同一バージョン差分
```

## テスト状態

| 状態    | 説明                                           |
| ------- | ---------------------------------------------- |
| **Red** | テストは作成済み、実装未完了のため全テスト失敗 |

## 次のステップ

Phase 5で`HistoryService`を実装し、すべてのテストを通過させる（Green状態へ）。

## 作成日

2026-01-09

## 関連ドキュメント

- `packages/shared/src/services/history/__tests__/history-service.test.ts`
- `packages/shared/src/services/history/__tests__/mocks/`
