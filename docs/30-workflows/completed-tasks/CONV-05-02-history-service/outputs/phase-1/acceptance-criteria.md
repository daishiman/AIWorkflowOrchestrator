# 履歴取得サービス - 受け入れ基準

> Phase 1: 要件定義 成果物
> 作成日: 2026-01-09
> スキル: acceptance-criteria-writing

---

## 概要

本ドキュメントはGiven-When-Then形式で記述された、履歴取得サービスの受け入れ基準を定義する。

---

## AC-001: 履歴一覧取得

### AC-001-01: 正常系 - 履歴一覧の取得

```gherkin
Given: ファイルID "file-123" に3件のバージョン履歴が存在する
When: getFileHistory("file-123") を呼び出す
Then: Result.success が true である
  And: Result.data.items の長さが 3 である
  And: Result.data.total が 3 である
  And: Result.data.hasMore が false である
```

### AC-001-02: 正常系 - ページネーション

```gherkin
Given: ファイルID "file-123" に10件のバージョン履歴が存在する
When: getFileHistory("file-123", { pagination: { limit: 5, offset: 0 } }) を呼び出す
Then: Result.success が true である
  And: Result.data.items の長さが 5 である
  And: Result.data.total が 10 である
  And: Result.data.hasMore が true である
```

### AC-001-03: 正常系 - 日付範囲フィルタ

```gherkin
Given: ファイルID "file-123" に以下の履歴が存在する
  | createdAt  |
  | 2026-01-01 |
  | 2026-01-05 |
  | 2026-01-10 |
When: getFileHistory("file-123", { filter: { dateFrom: "2026-01-03", dateTo: "2026-01-08" } }) を呼び出す
Then: Result.success が true である
  And: Result.data.items の長さが 1 である
  And: Result.data.items[0].createdAt が "2026-01-05" の日付である
```

### AC-001-04: 境界値 - 空の履歴

```gherkin
Given: ファイルID "file-empty" に履歴が存在しない
When: getFileHistory("file-empty") を呼び出す
Then: Result.success が true である
  And: Result.data.items の長さが 0 である
  And: Result.data.total が 0 である
  And: Result.data.hasMore が false である
```

### AC-001-05: 正常系 - 履歴の並び順

```gherkin
Given: ファイルID "file-123" に以下の履歴が存在する（古い順に作成）
  | id     | createdAt  |
  | conv-1 | 2026-01-01 |
  | conv-2 | 2026-01-02 |
  | conv-3 | 2026-01-03 |
When: getFileHistory("file-123") を呼び出す
Then: Result.data.items[0].conversionId が "conv-3" である（最新が先頭）
  And: Result.data.items[2].conversionId が "conv-1" である（最古が末尾）
```

---

## AC-002: バージョン詳細取得

### AC-002-01: 正常系 - 詳細取得

```gherkin
Given: 変換ID "conv-123" が存在する
  And: 以下のデータを持つ
    | fileId   | fileName | mimeType   | sizeBytes |
    | file-123 | test.txt | text/plain | 1024      |
When: getVersionDetail("conv-123") を呼び出す
Then: Result.success が true である
  And: Result.data.conversionId が "conv-123" である
  And: Result.data.fileId が "file-123" である
  And: Result.data.fileName が "test.txt" である
  And: Result.data.mimeType が "text/plain" である
  And: Result.data.sizeBytes が 1024 である
```

### AC-002-02: 異常系 - 存在しない変換ID

```gherkin
Given: 変換ID "not-found" が存在しない
When: getVersionDetail("not-found") を呼び出す
Then: Result.success が false である
  And: Result.error.message が "Conversion not found: not-found" を含む
```

### AC-002-03: 正常系 - 最新バージョンフラグ

```gherkin
Given: ファイルID "file-123" に以下の履歴が存在する
  | id     | createdAt  |
  | conv-1 | 2026-01-01 |
  | conv-2 | 2026-01-02 | (最新)
When: getVersionDetail("conv-2") を呼び出す
Then: Result.data.isCurrentVersion が true である

When: getVersionDetail("conv-1") を呼び出す
Then: Result.data.isCurrentVersion が false である
```

---

## AC-003: バージョン差分取得

### AC-003-01: 正常系 - サイズ変更の検出

```gherkin
Given: 以下の2つの変換が存在する
  | id     | sizeBytes |
  | conv-1 | 1000      |
  | conv-2 | 1500      |
When: getVersionDiff("conv-1", "conv-2") を呼び出す
Then: Result.success が true である
  And: Result.data.sizeChange が 500 である
```

### AC-003-02: 正常系 - コンテンツ変更の検出

```gherkin
Given: 以下の2つの変換が存在する
  | id     | contentHash |
  | conv-1 | hash-abc    |
  | conv-2 | hash-xyz    |
When: getVersionDiff("conv-1", "conv-2") を呼び出す
Then: Result.data.contentChanged が true である
```

### AC-003-03: 正常系 - コンテンツ未変更の検出

```gherkin
Given: 以下の2つの変換が存在する（同一コンテンツ）
  | id     | contentHash |
  | conv-1 | hash-abc    |
  | conv-2 | hash-abc    |
When: getVersionDiff("conv-1", "conv-2") を呼び出す
Then: Result.data.contentChanged が false である
```

### AC-003-04: 正常系 - メタデータ変更の検出

```gherkin
Given: 以下の2つの変換が存在する
  | id     | metadata               |
  | conv-1 | { "author": "Alice" }  |
  | conv-2 | { "author": "Bob" }    |
When: getVersionDiff("conv-1", "conv-2") を呼び出す
Then: Result.data.metadataChanges の長さが 1 である
  And: Result.data.metadataChanges[0].key が "author" である
  And: Result.data.metadataChanges[0].oldValue が "Alice" である
  And: Result.data.metadataChanges[0].newValue が "Bob" である
```

### AC-003-05: 異常系 - 変換Aが存在しない

```gherkin
Given: 変換ID "not-found" が存在しない
  And: 変換ID "conv-2" が存在する
When: getVersionDiff("not-found", "conv-2") を呼び出す
Then: Result.success が false である
  And: Result.error.message が "Conversion A not found: not-found" を含む
```

### AC-003-06: 異常系 - 変換Bが存在しない

```gherkin
Given: 変換ID "conv-1" が存在する
  And: 変換ID "not-found" が存在しない
When: getVersionDiff("conv-1", "not-found") を呼び出す
Then: Result.success が false である
  And: Result.error.message が "Conversion B not found: not-found" を含む
```

---

## AC-004: バージョン復元

### AC-004-01: 正常系 - バージョン復元

```gherkin
Given: 変換ID "conv-old" がファイルID "file-123" に属している
  And: 以下のデータを持つ
    | fileName | mimeType   | content       |
    | test.txt | text/plain | "old content" |
When: restoreToVersion("file-123", "conv-old") を呼び出す
Then: Result.success が true である
  And: Result.data.conversionId が "conv-old" とは異なる（新規ID）
  And: Result.data.fileId が "file-123" である
  And: Result.data.fileName が "test.txt" である
  And: Result.data.metadata.restoredFrom が "conv-old" である
  And: Result.data.metadata.restoredAt が ISO8601形式の日時文字列である
```

### AC-004-02: 異常系 - 存在しない変換の復元

```gherkin
Given: 変換ID "not-found" が存在しない
When: restoreToVersion("file-123", "not-found") を呼び出す
Then: Result.success が false である
  And: Result.error.message が "Conversion not found: not-found" を含む
```

### AC-004-03: 異常系 - 別ファイルのバージョンを復元

```gherkin
Given: 変換ID "conv-other" がファイルID "file-other" に属している
When: restoreToVersion("file-123", "conv-other") を呼び出す
Then: Result.success が false である
  And: Result.error.message が "does not belong to file" を含む
```

### AC-004-04: 正常系 - 復元時のログ記録

```gherkin
Given: 変換ID "conv-old" がファイルID "file-123" に属している
When: restoreToVersion("file-123", "conv-old") を呼び出す
Then: IConversionLogger.info が呼び出される
  And: ログの action が "restore" である
  And: ログの fileId が "file-123" である
```

---

## AC-005: 最新バージョン取得

### AC-005-01: 正常系 - 最新バージョン取得

```gherkin
Given: ファイルID "file-123" に以下の履歴が存在する
  | id     | createdAt  |
  | conv-1 | 2026-01-01 |
  | conv-2 | 2026-01-02 |
  | conv-3 | 2026-01-03 |
When: getLatestVersion("file-123") を呼び出す
Then: Result.success が true である
  And: Result.data が null でない
  And: Result.data.conversionId が "conv-3" である
  And: Result.data.isCurrentVersion が true である
```

### AC-005-02: 正常系 - 履歴なしの場合

```gherkin
Given: ファイルID "file-empty" に履歴が存在しない
When: getLatestVersion("file-empty") を呼び出す
Then: Result.success が true である
  And: Result.data が null である
```

---

## AC-006: バージョン数取得

### AC-006-01: 正常系 - バージョン数取得

```gherkin
Given: ファイルID "file-123" に5件のバージョン履歴が存在する
When: getVersionCount("file-123") を呼び出す
Then: Result.success が true である
  And: Result.data が 5 である
```

### AC-006-02: 正常系 - 履歴なしの場合

```gherkin
Given: ファイルID "file-empty" に履歴が存在しない
When: getVersionCount("file-empty") を呼び出す
Then: Result.success が true である
  And: Result.data が 0 である
```

---

## エッジケース

### EC-001: ページネーション境界値

```gherkin
Given: ファイルID "file-123" にちょうど20件の履歴が存在する
When: getFileHistory("file-123", { pagination: { limit: 20, offset: 0 } }) を呼び出す
Then: Result.data.items の長さが 20 である
  And: Result.data.hasMore が false である
```

### EC-002: オフセットが件数を超える場合

```gherkin
Given: ファイルID "file-123" に5件の履歴が存在する
When: getFileHistory("file-123", { pagination: { limit: 10, offset: 10 } }) を呼び出す
Then: Result.data.items の長さが 0 である
  And: Result.data.total が 5 である
  And: Result.data.hasMore が false である
```

### EC-003: 同一バージョン間の差分

```gherkin
Given: 変換ID "conv-1" が存在する
When: getVersionDiff("conv-1", "conv-1") を呼び出す
Then: Result.success が true である
  And: Result.data.sizeChange が 0 である
  And: Result.data.contentChanged が false である
  And: Result.data.metadataChanges の長さが 0 である
```

---

## テスト可能性チェックリスト

| 受け入れ基準 | 具体的 | 測定可能 | 達成可能 | 関連性 |
| ------------ | ------ | -------- | -------- | ------ |
| AC-001-01    | o      | o        | o        | o      |
| AC-001-02    | o      | o        | o        | o      |
| AC-001-03    | o      | o        | o        | o      |
| AC-001-04    | o      | o        | o        | o      |
| AC-001-05    | o      | o        | o        | o      |
| AC-002-01    | o      | o        | o        | o      |
| AC-002-02    | o      | o        | o        | o      |
| AC-002-03    | o      | o        | o        | o      |
| AC-003-01    | o      | o        | o        | o      |
| AC-003-02    | o      | o        | o        | o      |
| AC-003-03    | o      | o        | o        | o      |
| AC-003-04    | o      | o        | o        | o      |
| AC-003-05    | o      | o        | o        | o      |
| AC-003-06    | o      | o        | o        | o      |
| AC-004-01    | o      | o        | o        | o      |
| AC-004-02    | o      | o        | o        | o      |
| AC-004-03    | o      | o        | o        | o      |
| AC-004-04    | o      | o        | o        | o      |
| AC-005-01    | o      | o        | o        | o      |
| AC-005-02    | o      | o        | o        | o      |
| AC-006-01    | o      | o        | o        | o      |
| AC-006-02    | o      | o        | o        | o      |
| EC-001       | o      | o        | o        | o      |
| EC-002       | o      | o        | o        | o      |
| EC-003       | o      | o        | o        | o      |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-09 | 1.0.0      | 初版作成 |
