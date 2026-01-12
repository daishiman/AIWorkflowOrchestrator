# 内部サービスAPI（RAG変換システム）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## ConversionService API

RAG Conversion Systemは、HTTPエンドポイントとしてではなく、TypeScriptの内部サービスクラスとして実装されています。

**利用場所**: `packages/shared/src/services/conversion/`

**主要クラス**:

| クラス              | 責務                                       |
| ------------------- | ------------------------------------------ |
| `ConversionService` | 変換処理の統括、タイムアウト・同時実行制御 |
| `ConverterRegistry` | 利用可能なコンバーターの管理と選択         |
| `BaseConverter`     | 共通変換処理の抽象基底クラス               |

### メソッド

#### convert()

```typescript
async convert(
  input: ConverterInput,
  options?: ConverterOptions
): Promise<Result<ConverterOutput, RAGError>>
```

**機能**:

- 単一ファイルを変換
- 同時実行数チェック（デフォルト: 最大5件）
- タイムアウト管理（デフォルト: 60秒）
- 自動コンバーター選択

**パラメータ**:

- `input.fileId`: ファイルID（Branded型）
- `input.content`: ファイルコンテンツ（文字列またはBuffer）
- `input.mimeType`: MIMEタイプ
- `input.filePath`: ファイルパス（オプション）
- `options.maxContentLength`: 最大コンテンツ長（デフォルト: 100,000文字）
- `options.timeout`: タイムアウト時間（ミリ秒）

**戻り値**:

- 成功: `{ success: true, data: ConverterOutput }`
- 失敗: `{ success: false, error: RAGError }`

#### convertBatch()

```typescript
async convertBatch(
  inputs: ConverterInput[],
  options?: ConverterOptions
): Promise<BatchConversionResult[]>
```

**機能**:

- 複数ファイルを一括変換
- チャンク単位で処理（同時実行数制限）
- Promise.allSettled()で一部失敗を許容

**戻り値**:

- 各ファイルの変換結果（成功/失敗）の配列

#### canConvert()

```typescript
canConvert(input: ConverterInput): boolean
```

**機能**:

- 変換可能性を事前確認
- コンバーター検索のみ（変換は実行しない）

#### getSupportedMimeTypes()

```typescript
getSupportedMimeTypes(): string[]
```

**機能**:

- サポートしているMIMEタイプ一覧を取得

### 使用パターン

**パターン1: グローバルインスタンス使用**

```typescript
import { globalConversionService } from "@repo/shared/services/conversion";

const result = await globalConversionService.convert(input);
```

**パターン2: カスタム設定インスタンス**

```typescript
import { createConversionService } from "@repo/shared/services/conversion";

const service = createConversionService(customRegistry, {
  defaultTimeout: 30000,
  maxConcurrentConversions: 10,
});

const result = await service.convert(input);
```

### エラーハンドリング

**エラーコード**:

| コード                | 説明               | 原因                                   |
| --------------------- | ------------------ | -------------------------------------- |
| `RESOURCE_EXHAUSTED`  | 同時実行数超過     | 最大同時実行数に到達                   |
| `TIMEOUT`             | タイムアウト       | 変換処理が指定時間内に完了しなかった   |
| `CONVERTER_NOT_FOUND` | コンバーター未検出 | 対応するコンバーターが登録されていない |
| `CONVERSION_FAILED`   | 変換失敗           | 個別コンバーターでのエラー             |

**Result型パターン**:

```typescript
const result = await service.convert(input);

if (result.success) {
  const { convertedContent, extractedMetadata } = result.data;
  // 成功時の処理
} else {
  const { code, message, context } = result.error;
  // エラー処理
  console.error(`[${code}] ${message}`, context);
}
```

### 性能特性

| 指標                       | 値     |
| -------------------------- | ------ |
| デフォルトタイムアウト     | 60秒   |
| 最大同時実行数             | 5件    |
| サポートMIMEタイプ         | 18種類 |
| 平均変換時間（小ファイル） | 3-50ms |
| 平均変換時間（Markdown）   | 400ms  |

---

## HistoryService API

変換履歴のバージョン管理サービス。履歴一覧取得、バージョン間差分比較、過去バージョンへの復元機能を提供。

**利用場所**: `packages/shared/src/services/history/`

**主要クラス**:

| クラス           | 責務                               |
| ---------------- | ---------------------------------- |
| `HistoryService` | 履歴取得・差分比較・復元処理の統括 |

### メソッド

#### getFileHistory()

```typescript
async getFileHistory(
  fileId: string,
  options?: HistoryOptions
): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>
```

**機能**:

- ファイル単位のバージョン履歴一覧取得
- ページネーション対応（limit/offset）
- 結果は作成日時の降順（最新が先頭）

**パラメータ**:

- `fileId`: ファイルID
- `options.pagination.limit`: 取得件数（デフォルト: 10）
- `options.pagination.offset`: オフセット（デフォルト: 0）

**戻り値**:

- 成功: `{ success: true, data: { items, total, hasMore } }`
- 失敗: `{ success: false, error: Error }`

#### getVersionDetail()

```typescript
async getVersionDetail(
  conversionId: string
): Promise<Result<VersionHistoryItem, Error>>
```

**機能**:

- 特定バージョンの詳細情報取得
- 変換ステータス、ハッシュ値、サイズ等を含む

**エラーコード**:

- `Conversion not found`: 指定IDの変換履歴が存在しない

#### getVersionDiff()

```typescript
async getVersionDiff(
  conversionIdA: string,
  conversionIdB: string
): Promise<Result<VersionDiff, Error>>
```

**機能**:

- 2つのバージョン間の差分を比較
- サイズ変更、メタデータ変更、コンテンツ変更を検出

**戻り値**:

```typescript
{
  sizeChange: number;           // バイト単位の差分
  metadataChanges: string[];    // 変更されたメタデータキー
  contentChanged: boolean;      // 出力ハッシュの差異有無
}
```

#### restoreToVersion()

```typescript
async restoreToVersion(
  fileId: string,
  conversionId: string
): Promise<Result<VersionHistoryItem, Error>>
```

**機能**:

- 過去バージョンの状態に復元
- 新規変換レコードとして作成（非破壊的）
- 入力ハッシュ、出力ハッシュ、サイズ情報をコピー

#### getLatestVersion()

```typescript
async getLatestVersion(
  fileId: string
): Promise<Result<VersionHistoryItem | null, Error>>
```

**機能**:

- ファイルの最新変換結果を取得
- 存在しない場合は `null` を返す

#### getVersionCount()

```typescript
async getVersionCount(
  fileId: string
): Promise<Result<number, Error>>
```

**機能**:

- ファイルの総バージョン数をカウント

### 使用パターン

**パターン1: ファクトリ関数使用**

```typescript
import { createHistoryService } from "@repo/shared/services/history";

const service = createHistoryService(repository, logger);
const result = await service.getFileHistory("file-123");
```

**パターン2: Result型パターン**

```typescript
const result = await service.getVersionDiff(idA, idB);

if (result.success) {
  const { sizeChange, metadataChanges, contentChanged } = result.data;
  // 成功時の処理
} else {
  console.error(result.error.message);
  // エラー処理
}
```

### エラーハンドリング

**エラーメッセージ**:

| メッセージ                           | 説明                             |
| ------------------------------------ | -------------------------------- |
| `Conversion not found`               | 指定IDの変換履歴が存在しない     |
| `Source conversion not found`        | 差分比較の元バージョンが存在しない |
| `Target conversion not found`        | 差分比較の先バージョンが存在しない |
| `Cannot restore: conversion not found` | 復元対象のバージョンが存在しない |

### 性能特性

| 指標                 | 値       |
| -------------------- | -------- |
| テストカバレッジ     | 100%     |
| テスト数             | 41ケース |
| 平均レスポンス時間   | < 50ms   |

### 関連ドキュメント

- [IHistoryService インターフェース](./interfaces-converter.md#ihistoryservice-インターフェース)
- [ConversionRepository インターフェース](./interfaces-converter.md#conversionrepository-インターフェース)
- [ファイル変換アーキテクチャ](./architecture-file-conversion.md)

---

## Electron HistoryService API

Electron MainプロセスのHistoryServiceは、shared HistoryServiceとIPCを橋渡しするアダプター層。

**実装場所**: `apps/desktop/src/main/services/HistoryService.ts`
**統合日**: 2026-01-12（history-service-db-integration）

### アーキテクチャ

```
Renderer → IPC → Electron HistoryService → shared HistoryService → DB
                        ↓
                  LogRepository → DB (logs)
```

### IPCチャンネル

#### history:getFileHistory

```typescript
// Renderer側
const result = await window.historyAPI.getFileHistory(fileId, options);

// 戻り値型
Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>
```

| パラメータ | 型 | 必須 | デフォルト |
|------------|----|----|----------|
| fileId | string | ✓ | - |
| options.limit | number | - | 20 |
| options.offset | number | - | 0 |

#### history:getVersionDetail

```typescript
// Renderer側
const result = await window.historyAPI.getVersionDetail(conversionId);

// 戻り値型
Promise<Result<VersionDetailData, Error>>
```

`VersionDetailData`はバージョン情報とログ一覧を統合した型。

#### history:getConversionLogs

```typescript
// Renderer側
const result = await window.historyAPI.getConversionLogs(conversionId, options);

// 戻り値型
Promise<Result<PaginatedResult<ConversionLog>, Error>>
```

| パラメータ | 型 | 必須 | デフォルト |
|------------|----|----|----------|
| conversionId | string | ✓ | - |
| options.limit | number | - | 50 |
| options.offset | number | - | 0 |
| options.level | string | - | undefined |

#### history:restoreVersion

```typescript
// Renderer側
const result = await window.historyAPI.restoreVersion(fileId, conversionId);

// 戻り値型
Promise<Result<VersionHistoryItem, Error>>
```

### 型変換（shared → Renderer）

| shared型 | Renderer型 | 変換 |
|----------|------------|------|
| `sizeBytes` | `size` | フィールド名変更 |
| `contentHash` | `hash` | フィールド名変更 |
| `isCurrentVersion` | `isLatest` | フィールド名変更 |
| `createdAt: Date` | `createdAt: string` | ISO 8601形式 |

### エラーメッセージ（日本語ローカライズ）

| 内部エラー | ユーザー向けメッセージ |
|-----------|---------------------|
| `Conversion not found` | 「指定されたバージョンが見つかりません」 |
| `does not belong to file` | 「このファイルには復元できません」 |
| `database` / `DB` | 「データベース接続に問題があります」 |
| その他 | 「予期しないエラーが発生しました」 |

### 使用パターン

**パターン1: DI使用（推奨）**

```typescript
import { createHistoryServiceWithDI } from "./services/HistoryService";

const historyService = createHistoryServiceWithDI(
  sharedHistoryService,
  logRepository,
  logger
);
```

**パターン2: IPCハンドラー登録**

```typescript
ipcMain.handle("history:getFileHistory", async (_, fileId, options) => {
  return historyService.getFileHistory(fileId, options);
});
```

### 性能特性

| 指標 | 目標 | 実績 |
|------|------|------|
| getFileHistory | <200ms | 達成 |
| getVersionDetail | <100ms | 達成 |
| getConversionLogs | <200ms | 達成 |
| restoreVersion | <500ms | 達成 |

### 品質メトリクス

| 指標 | 実績 |
|------|------|
| Line Coverage | 92.16% |
| Branch Coverage | 100% |
| Function Coverage | 91.66% |
| 統合テスト数 | 31ケース |
