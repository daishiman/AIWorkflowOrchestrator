# Phase 6: テスト拡充

## 1. 追加テストカテゴリ

### 1.1 エッジケーステスト

| テストケース             | 説明                         |
| ------------------------ | ---------------------------- |
| 空ファイルの読み書き     | 0バイトファイルの処理        |
| 大きなファイルの読み書き | 1MB以上のファイル処理        |
| 日本語ファイル名         | マルチバイト文字を含むパス   |
| 深いディレクトリ階層     | 10階層以上のネストされたパス |
| 同時書き込み             | 同一ファイルへの並行書き込み |

### 1.2 エラーリカバリーテスト

| テストケース                       | 説明                  |
| ---------------------------------- | --------------------- |
| ディスク容量不足のシミュレーション | ENOSPC エラー時の挙動 |
| 権限エラー                         | EACCES エラー時の挙動 |
| ファイルロック                     | EBUSY エラー時の挙動  |

### 1.3 境界値テスト

| テストケース       | 説明                                    |
| ------------------ | --------------------------------------- |
| 最大パス長         | OSの最大パス長に近いパス                |
| タイムスタンプ境界 | Date.now() の最大値に近いタイムスタンプ |
| 空のスキル名       | 空文字列のスキル名                      |

## 2. 追加テスト仕様

### 2.1 エッジケーステスト

```typescript
describe("Edge Cases", () => {
  describe("Empty Files", () => {
    it("should read empty file and return empty string");
    it("should write empty content");
    it("should create backup of empty file");
  });

  describe("Large Files", () => {
    it("should handle files larger than 1MB");
    it("should create backup of large files");
  });

  describe("Unicode Paths", () => {
    it("should handle Japanese skill names");
    it("should handle Japanese file names");
    it("should handle emoji in paths");
  });

  describe("Deep Directory Nesting", () => {
    it("should read from deeply nested directory");
    it("should write to deeply nested directory");
    it("should create nested directories recursively");
  });
});
```

### 2.2 エラーリカバリーテスト

```typescript
describe("Error Recovery", () => {
  describe("Disk Space", () => {
    it("should throw appropriate error on ENOSPC");
    it("should not corrupt file on partial write failure");
  });

  describe("Permission Errors", () => {
    it("should throw appropriate error on EACCES");
    it("should include path in error message");
  });

  describe("Concurrent Access", () => {
    it("should handle concurrent reads safely");
    it("should serialize concurrent writes to same file");
  });
});
```

### 2.3 境界値テスト

```typescript
describe("Boundary Values", () => {
  describe("Path Length", () => {
    it("should handle maximum allowed path length");
    it("should throw error for paths exceeding limit");
  });

  describe("Skill Names", () => {
    it("should throw error for empty skill name");
    it("should throw error for whitespace-only skill name");
    it("should handle skill name with special characters");
  });

  describe("File Content", () => {
    it("should handle binary content");
    it("should preserve line endings (LF vs CRLF)");
    it("should handle BOM in UTF-8 files");
  });
});
```

## 3. バックアップ検証テスト

### 3.1 バックアップ整合性

```typescript
describe("Backup Integrity", () => {
  it("should create backup with exact content");
  it("should create unique backup names for rapid writes");
  it("should preserve file permissions in backup");
  it("should handle backup when original is symlink");
});
```

### 3.2 バックアップリスト

```typescript
describe("Backup Listing", () => {
  it("should sort backups by timestamp descending");
  it("should correctly parse backup type from filename");
  it("should handle backups in subdirectories");
  it("should ignore non-backup files with similar names");
});
```

## 4. 統合テスト拡充

### 4.1 複合シナリオ

```typescript
describe("Integration: Complex Scenarios", () => {
  it("should handle create-modify-delete-restore workflow");
  it("should maintain backup chain through multiple edits");
  it("should recover from interrupted write operation");
});
```

### 4.2 SkillScanner連携

```typescript
describe("Integration: SkillScanner", () => {
  it("should operate on skills found by SkillScanner");
  it("should respect readonly flag from SkillScanner");
});
```

## 5. パフォーマンステスト

```typescript
describe("Performance", () => {
  it("should complete single file read within 100ms");
  it("should complete single file write within 100ms");
  it("should handle 100 consecutive operations within 10s");
});
```

## 6. 期待するテスト数（Phase 6追加分）

| カテゴリ             | テスト数 |
| -------------------- | -------- |
| エッジケース         | 12       |
| エラーリカバリー     | 6        |
| 境界値               | 9        |
| バックアップ検証     | 8        |
| 統合テスト           | 5        |
| パフォーマンス       | 3        |
| **Phase 6 追加合計** | **43**   |

## 7. 総テスト数

| Phase      | テスト数 |
| ---------- | -------- |
| Phase 4    | 53       |
| Phase 6    | 43       |
| **総合計** | **96**   |

## 8. 統合テスト連携【必須】

### 統合テストの拡充（本タスク固有）

| テストカテゴリ       | 検証項目                                   | 目標 |
| -------------------- | ------------------------------------------ | ---- |
| ファイルシステム統合 | 実ファイルの読み書き・作成・削除           | 100% |
| バックアップ統合     | バックアップ作成・一覧・復元の往復         | 100% |
| セキュリティ統合     | パストラバーサル・readonly保護の実環境検証 | 100% |
| エッジケース統合     | 空ファイル・大ファイル・深いネスト         | 80%+ |
| エラーリカバリー統合 | ディスクエラー・権限エラー時の挙動         | 80%+ |
| IPC/API接続テスト    | **本タスクスコープ外**（TASK-9A-B で対応） | N/A  |

> **注記**: IPC接続テスト・認証連携テストは本タスクスコープ外

## 9. 完了条件

- [ ] 全追加テストが記述されている
- [ ] エッジケースが網羅されている
- [ ] エラーリカバリーがテストされている
- [ ] 全テストが PASS している
- [ ] 統合テストのカバレッジ目標を達成している
