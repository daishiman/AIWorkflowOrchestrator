# テスト仕様書 - HistoryService DB統合

## 文書情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | history-service-db-integration |
| Phase    | 4                              |
| 作成日   | 2026-01-12                     |
| 状態     | 完了                           |

---

## 1. テスト方針

### 1.1 テスト戦略

| テスト種別     | 対象                        | 責務                                   |
| -------------- | --------------------------- | -------------------------------------- |
| ユニットテスト | Electron HistoryService     | 型変換、エラーハンドリング             |
| 統合テスト     | HistoryService + Repository | データフロー、DI連携                   |
| E2Eテスト      | IPC → HistoryService → DB   | エンドツーエンド動作（既存22件で対応） |

### 1.2 既存テストとの関係

| テストファイル                                                | テスト数 | 維持方針         |
| ------------------------------------------------------------- | -------- | ---------------- |
| `apps/desktop/src/main/ipc/__tests__/historyHandlers.test.ts` | 22件     | 維持（変更なし） |

### 1.3 新規テストファイル

| テストファイル                                                                | 役割                     |
| ----------------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts` | HistoryService統合テスト |

---

## 2. モック戦略

### 2.1 モック対象

| 依存                  | モック方法                | 理由                 |
| --------------------- | ------------------------- | -------------------- |
| shared HistoryService | `vi.fn()`でメソッドモック | ユニットテストで分離 |
| ConversionRepository  | モックオブジェクト        | DB接続なしでテスト   |
| FileRepository        | モックオブジェクト        | DB接続なしでテスト   |
| LogRepository         | モックオブジェクト        | DB接続なしでテスト   |
| IConversionLogger     | `vi.fn()`でメソッドモック | ログ出力を検証       |

### 2.2 モックファクトリ

```typescript
// テスト用モックファクトリ
function createMockSharedHistoryService() {
  return {
    getFileHistory: vi.fn(),
    getVersionDetail: vi.fn(),
    getVersionDiff: vi.fn(),
    restoreToVersion: vi.fn(),
    getLatestVersion: vi.fn(),
    getVersionCount: vi.fn(),
  };
}

function createMockLogRepository() {
  return {
    findByConversionId: vi.fn(),
  };
}

function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}
```

---

## 3. テストデータ設計

### 3.1 基本テストデータ

```typescript
// shared VersionHistoryItem
const sharedVersionItem = {
  conversionId: "conv-001",
  fileId: "file-123",
  fileName: "test.md",
  version: 1,
  createdAt: new Date("2026-01-12T10:00:00Z"),
  mimeType: "text/markdown",
  contentHash: "abc123def456",
  sizeBytes: 1024,
  metadata: { author: "test" },
  isCurrentVersion: true,
};

// 期待されるRenderer VersionHistoryItem
const expectedRendererItem = {
  conversionId: "conv-001",
  fileId: "file-123",
  version: 1,
  createdAt: "2026-01-12T10:00:00.000Z",
  mimeType: "text/markdown",
  hash: "abc123def456",
  size: 1024,
  metadata: { author: "test" },
  isLatest: true,
};
```

### 3.2 エラーテストデータ

```typescript
// 存在しないID
const nonExistentId = "non-existent-id";

// 不一致fileId
const mismatchedFileId = "different-file-id";
```

---

## 4. テストケース一覧

### 4.1 getFileHistory テストケース

| ID        | テスト名                                 | 種別   | 優先度 |
| --------- | ---------------------------------------- | ------ | ------ |
| HS-GFH-01 | 正常系: ファイルIDに対応する履歴を取得   | 正常系 | 高     |
| HS-GFH-02 | 正常系: ページネーションが正しく動作     | 正常系 | 高     |
| HS-GFH-03 | 正常系: hasMoreが正しく判定される        | 正常系 | 高     |
| HS-GFH-04 | 正常系: 空の履歴の場合は空配列を返す     | 正常系 | 中     |
| HS-GFH-05 | 正常系: 型変換が正しく行われる           | 正常系 | 高     |
| HS-GFH-06 | 異常系: Repositoryエラー時はエラーを返す | 異常系 | 高     |

### 4.2 getVersionDetail テストケース

| ID        | テスト名                               | 種別   | 優先度 |
| --------- | -------------------------------------- | ------ | ------ |
| HS-GVD-01 | 正常系: 変換IDに対応する詳細を取得     | 正常系 | 高     |
| HS-GVD-02 | 正常系: ログデータが含まれる           | 正常系 | 高     |
| HS-GVD-03 | 正常系: 型変換が正しく行われる         | 正常系 | 高     |
| HS-GVD-04 | 異常系: 存在しない変換IDでエラーを返す | 異常系 | 高     |

### 4.3 getConversionLogs テストケース

| ID        | テスト名                                 | 種別   | 優先度 |
| --------- | ---------------------------------------- | ------ | ------ |
| HS-GCL-01 | 正常系: 変換ログを取得                   | 正常系 | 高     |
| HS-GCL-02 | 正常系: ログレベルでフィルタ可能         | 正常系 | 中     |
| HS-GCL-03 | 正常系: ページネーションが動作する       | 正常系 | 中     |
| HS-GCL-04 | 正常系: 型変換が正しく行われる           | 正常系 | 高     |
| HS-GCL-05 | 異常系: Repositoryエラー時はエラーを返す | 異常系 | 高     |

### 4.4 restoreVersion テストケース

| ID       | テスト名                                 | 種別   | 優先度 |
| -------- | ---------------------------------------- | ------ | ------ |
| HS-RV-01 | 正常系: バージョンを復元できる           | 正常系 | 高     |
| HS-RV-02 | 正常系: 復元後に新バージョンが作成される | 正常系 | 高     |
| HS-RV-03 | 正常系: 型変換が正しく行われる           | 正常系 | 高     |
| HS-RV-04 | 異常系: 存在しない変換IDでエラーを返す   | 異常系 | 高     |
| HS-RV-05 | 異常系: ファイルIDが一致しない場合エラー | 異常系 | 高     |

### 4.5 型変換テストケース

| ID       | テスト名                                    | 種別   | 優先度 |
| -------- | ------------------------------------------- | ------ | ------ |
| HS-TC-01 | createdAtがDateからISO文字列に変換される    | 正常系 | 高     |
| HS-TC-02 | sizeBytesがsizeにリネームされる             | 正常系 | 高     |
| HS-TC-03 | contentHashがhashにリネームされる           | 正常系 | 高     |
| HS-TC-04 | isCurrentVersionがisLatestにリネームされる  | 正常系 | 高     |
| HS-TC-05 | metadataがundefinedの場合も正しく変換される | 正常系 | 中     |

---

## 5. テストカバレッジ目標

| メトリクス | 目標    |
| ---------- | ------- |
| Line       | 80%以上 |
| Branch     | 60%以上 |
| Function   | 80%以上 |

---

## 6. TDDサイクル確認

### 6.1 Red Phase（本Phase）

- [x] 全テストケースを作成
- [x] 全テストが失敗状態（Red）であることを確認

**Red Phase 実行結果（2026-01-12）:**

```
Test Files  1 failed (1)
      Tests  16 failed | 9 passed (25)
   Duration  4.54s
```

| 結果   | 件数 | 説明                                       |
| ------ | ---- | ------------------------------------------ |
| FAILED | 16   | 実装が必要なテストケース（期待される失敗） |
| PASSED | 9    | スタブ実装で期待される動作と一致           |

### 6.2 Green Phase（Phase 5）

- [ ] 実装を行い全テストをパス

### 6.3 Refactor Phase（Phase 8）

- [ ] コード品質改善

---

## 7. テスト実行コマンド

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts

# カバレッジ付き実行
pnpm --filter @repo/desktop test --coverage apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts
```

---

## 8. 完了確認

- [x] テスト方針が策定されている
- [x] モック戦略が決定されている
- [x] テストデータが設計されている
- [x] テストケース一覧が作成されている
- [x] テストカバレッジ目標が設定されている
