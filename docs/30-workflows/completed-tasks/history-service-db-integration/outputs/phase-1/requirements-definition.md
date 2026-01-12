# 要件定義書 - HistoryService DB統合

## 文書情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | history-service-db-integration |
| Phase    | 1                              |
| 作成日   | 2026-01-12                     |
| 状態     | 完了                           |

---

## 1. 目的

ElectronのHistoryService（スタブ実装）をsharedパッケージのHistoryService（CONV-05-02実装）と統合し、実際のデータベースから履歴データを取得できるようにする。

---

## 2. shared HistoryService API リスト（CONV-05-02実装）

### 2.1 公開メソッド

| メソッド           | 引数                                           | 戻り値                                                        |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------- |
| `getFileHistory`   | `fileId: string, options?: HistoryOptions`     | `Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>` |
| `getVersionDetail` | `conversionId: string`                         | `Promise<Result<VersionHistoryItem, Error>>`                  |
| `getVersionDiff`   | `conversionIdA: string, conversionIdB: string` | `Promise<Result<VersionDiff, Error>>`                         |
| `restoreToVersion` | `fileId: string, conversionId: string`         | `Promise<Result<VersionHistoryItem, Error>>`                  |
| `getLatestVersion` | `fileId: string`                               | `Promise<Result<VersionHistoryItem \| null, Error>>`          |
| `getVersionCount`  | `fileId: string`                               | `Promise<Result<number, Error>>`                              |

### 2.2 依存するリポジトリ

| リポジトリ             | インターフェース                       | 責務                   |
| ---------------------- | -------------------------------------- | ---------------------- |
| `ConversionRepository` | `packages/shared/.../types.ts`         | 変換データのCRUD操作   |
| `FileRepository`       | `packages/shared/.../types.ts`         | ファイルメタデータ取得 |
| `IConversionLogger`    | `packages/shared/.../logging/types.ts` | ログ記録               |

---

## 3. インターフェース互換性分析

### 3.1 型対応表

| フィールド         | shared型                  | Renderer型                | 変換必要 |
| ------------------ | ------------------------- | ------------------------- | -------- |
| `conversionId`     | `string`                  | `string`                  | 不要     |
| `fileId`           | `string`                  | `string`                  | 不要     |
| `fileName`         | `string`                  | なし                      | 削除     |
| `version`          | `number`                  | `number`                  | 不要     |
| `createdAt`        | `Date`                    | `string` (ISO8601)        | 必要     |
| `mimeType`         | `string`                  | `string`                  | 不要     |
| `contentHash`      | `string`                  | `hash: string`            | リネーム |
| `sizeBytes`        | `number`                  | `size: number`            | リネーム |
| `metadata`         | `Record<string, unknown>` | `Record<string, unknown>` | 不要     |
| `isCurrentVersion` | `boolean`                 | `isLatest: boolean`       | リネーム |

### 3.2 PaginatedResult型

両者で互換性あり（同一構造）:

```typescript
interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
```

### 3.3 Result型

| 項目   | shared                             | Renderer                           |
| ------ | ---------------------------------- | ---------------------------------- |
| 成功時 | `{ success: true, data: T }`       | `{ success: true, data: T }`       |
| 失敗時 | `{ success: false, error: Error }` | `{ success: false, error: Error }` |

構造は同一だが、sharedは `@repo/shared/types/rag/result` からインポート。

---

## 4. 機能要件

### 4.1 履歴一覧取得（FR-001）

| 項目 | 内容                                            |
| ---- | ----------------------------------------------- |
| 機能 | ファイルIDに対応するバージョン履歴一覧を取得    |
| 入力 | `fileId: string`, `options?: PaginationOptions` |
| 出力 | `PaginatedResult<VersionHistoryItem>`           |
| 制約 | デフォルト20件、新しい順でソート                |

### 4.2 バージョン詳細取得（FR-002）

| 項目 | 内容                                 |
| ---- | ------------------------------------ |
| 機能 | 変換IDに対応するバージョン詳細を取得 |
| 入力 | `conversionId: string`               |
| 出力 | `VersionDetailData` (version + logs) |
| 制約 | 存在しないIDはエラー                 |

### 4.3 変換ログ取得（FR-003）

| 項目 | 内容                                                 |
| ---- | ---------------------------------------------------- |
| 機能 | 変換IDに対応するログ一覧を取得                       |
| 入力 | `conversionId: string`, `options?: LogFilterOptions` |
| 出力 | `PaginatedResult<ConversionLog>`                     |
| 制約 | ログレベルでフィルタ可能（info/warn/error/debug）    |

### 4.4 バージョン復元（FR-004）

| 項目 | 内容                                             |
| ---- | ------------------------------------------------ |
| 機能 | 指定バージョンを復元（新バージョンとして作成）   |
| 入力 | `fileId: string`, `conversionId: string`         |
| 出力 | `VersionHistoryItem`（新規作成されたバージョン） |
| 制約 | 異なるファイルIDへの復元はエラー                 |

---

## 5. 非機能要件

### 5.1 パフォーマンス

| 操作                | 目標応答時間 |
| ------------------- | ------------ |
| `getFileHistory`    | < 200ms      |
| `getVersionDetail`  | < 100ms      |
| `getConversionLogs` | < 200ms      |
| `restoreVersion`    | < 500ms      |

### 5.2 エラーハンドリング

- Result型パターンで統一的にエラーを伝搬
- IPC境界でエラーメッセージを適切に変換
- フロントエンドでのエラー表示と連携

### 5.3 ログ出力

- 復元操作時にログを記録（`IConversionLogger.info`）
- エラー発生時にスタックトレースを記録

---

## 6. 依存関係

### 6.1 前提タスク

| タスクID   | 状態 | 説明                      |
| ---------- | ---- | ------------------------- |
| CONV-05-01 | 完了 | ロギングサービス          |
| CONV-05-02 | 完了 | shared HistoryService実装 |

### 6.2 依存パッケージ

| パッケージ     | 依存内容                                    |
| -------------- | ------------------------------------------- |
| `@repo/shared` | HistoryService, ConversionRepository, types |
| Drizzle ORM    | データベース接続                            |
| SQLite (Turso) | データベースエンジン                        |

---

## 7. 統合方式決定

### 7.1 推奨パターン: アダプター統合

**理由:**

1. Renderer型とshared型の差異を吸収
2. 既存のIPCハンドラーインターフェースを維持
3. shared HistoryServiceを直接変更せずに統合可能

**構成:**

```
[IPCハンドラー] → [Electron HistoryService (Adapter)] → [shared HistoryService] → [Repository] → [DB]
```

### 7.2 型変換責務

Electron HistoryService が以下の変換を担当:

- `Date` → ISO8601文字列
- `sizeBytes` → `size`
- `contentHash` → `hash`
- `isCurrentVersion` → `isLatest`

---

## 8. 実装ファイル一覧

| ファイル                                                  | 役割                       |
| --------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/HistoryService.ts`        | 統合アダプター（更新対象） |
| `packages/shared/src/services/history/history-service.ts` | shared HistoryService      |
| `packages/shared/src/services/history/types.ts`           | shared型定義               |
| `apps/desktop/src/renderer/components/history/types.ts`   | Renderer型定義             |
| `apps/desktop/src/main/ipc/historyHandlers.ts`            | IPCハンドラー              |

---

## 9. 完了確認

- [x] CONV-05-02のAPIインターフェースが理解されている
- [x] ElectronとsharedのHistoryService間の型差異が特定されている
- [x] 依存リポジトリ（ConversionRepository等）の実装状況が確認されている
- [x] 統合方法が決定されている（アダプターパターン）
- [x] 要件定義書が作成されている
