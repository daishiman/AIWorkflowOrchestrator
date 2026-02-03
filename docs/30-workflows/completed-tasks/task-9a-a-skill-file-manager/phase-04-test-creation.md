# Phase 4: テスト作成（TDD-Red）

## 1. テスト方針

### 1.1 テストカテゴリ

| カテゴリ     | 対象                           | モック戦略             |
| ------------ | ------------------------------ | ---------------------- |
| 単体テスト   | メソッドロジック               | fs/promises をモック   |
| 統合テスト   | ファイルシステム連携           | 一時ディレクトリを使用 |
| セキュリティ | パストラバーサル、readonly保護 | 攻撃パターンを網羅     |

### 1.2 テストファイル構成

```
apps/desktop/src/main/services/skill/__tests__/
├── SkillFileManager.test.ts           ← 単体テスト
├── SkillFileManager.integration.test.ts ← 統合テスト
└── SkillFileManager.security.test.ts  ← セキュリティテスト
```

## 2. 単体テスト仕様

### 2.1 constructor

```typescript
describe("SkillFileManager", () => {
  describe("constructor", () => {
    it("should use default directories when no options provided");
    it("should use custom directories when options provided");
    it("should resolve paths to absolute paths");
  });
});
```

### 2.2 readFile

```typescript
describe("readFile", () => {
  it("should read file content from aiworkflow skills directory");
  it("should read file content from claude skills directory");
  it("should throw SkillNotFoundError when skill does not exist");
  it("should throw FileNotFoundError when file does not exist");
  it("should throw PathTraversalError for ../path patterns");
});
```

### 2.3 writeFile

```typescript
describe("writeFile", () => {
  it("should write file content to aiworkflow skills directory");
  it("should create backup before writing existing file");
  it("should create parent directories if not exist");
  it("should throw ReadonlySkillError for claude skills directory");
  it("should throw SkillNotFoundError when skill does not exist");
  it("should throw PathTraversalError for ../path patterns");
});
```

### 2.4 createFile

```typescript
describe("createFile", () => {
  it("should create new file in aiworkflow skills directory");
  it("should create parent directories if not exist");
  it("should throw FileExistsError when file already exists");
  it("should throw ReadonlySkillError for claude skills directory");
  it("should throw PathTraversalError for ../path patterns");
});
```

### 2.5 deleteFile

```typescript
describe("deleteFile", () => {
  it("should delete file from aiworkflow skills directory");
  it("should create backup before deleting");
  it("should throw ReadonlySkillError for claude skills directory");
  it("should throw FileNotFoundError when file does not exist");
  it("should throw PathTraversalError for ../path patterns");
});
```

### 2.6 listBackups

```typescript
describe("listBackups", () => {
  it("should list all backup files in skill directory");
  it("should include both .backup and .deleted files");
  it("should return empty array when no backups exist");
  it("should parse timestamp from backup filename");
  it("should throw SkillNotFoundError when skill does not exist");
});
```

### 2.7 restoreBackup

```typescript
describe("restoreBackup", () => {
  it("should restore file from backup");
  it("should restore file from deleted backup");
  it("should throw ReadonlySkillError for claude skills directory");
  it("should throw FileNotFoundError when backup does not exist");
  it("should throw PathTraversalError for ../path patterns");
});
```

### 2.8 isReadonly

```typescript
describe("isReadonly", () => {
  it("should return false for aiworkflow skills");
  it("should return true for claude skills");
  it("should throw SkillNotFoundError when skill does not exist");
});
```

## 3. セキュリティテスト仕様

### 3.1 パストラバーサル防止

```typescript
describe("Path Traversal Prevention", () => {
  const traversalPatterns = [
    "../etc/passwd",
    "../../etc/passwd",
    "foo/../../../etc/passwd",
    "foo/bar/../../../etc/passwd",
    "./../../etc/passwd",
    "foo/./../../etc/passwd",
  ];

  traversalPatterns.forEach((pattern) => {
    it(`should block path traversal: ${pattern}`);
  });
});
```

### 3.2 読み取り専用保護

```typescript
describe("Readonly Protection", () => {
  const writeOperations = [
    "writeFile",
    "createFile",
    "deleteFile",
    "restoreBackup",
  ];

  writeOperations.forEach((operation) => {
    it(`should block ${operation} on claude skills directory`);
  });

  it("should allow readFile on claude skills directory");
  it("should allow listBackups on claude skills directory");
});
```

## 4. 統合テスト仕様

### 4.1 ファイル操作フロー

```typescript
describe("Integration: File Operations", () => {
  it("should complete full write-read cycle");
  it("should complete full create-read-delete cycle");
  it("should preserve file content through backup-restore cycle");
});
```

### 4.2 バックアップフロー

```typescript
describe("Integration: Backup Flow", () => {
  it("should create backup with correct timestamp format");
  it("should list backups in chronological order");
  it("should restore exact content from backup");
});
```

## 5. テストデータ

### 5.1 ディレクトリ構造

```
/tmp/skill-file-manager-test-{uuid}/
├── aiworkflow/
│   └── test-skill/
│       ├── SKILL.md
│       └── references/
│           └── test-file.md
└── claude/
    └── readonly-skill/
        ├── SKILL.md
        └── references/
            └── test-file.md
```

### 5.2 テストフィクスチャ

| ファイル     | 内容                            |
| ------------ | ------------------------------- |
| SKILL.md     | `---\nname: test-skill\n---`    |
| test-file.md | `# Test Content\n\nHello World` |

## 6. 期待するテスト数

| カテゴリ      | テスト数 |
| ------------- | -------- |
| constructor   | 3        |
| readFile      | 5        |
| writeFile     | 6        |
| createFile    | 5        |
| deleteFile    | 5        |
| listBackups   | 5        |
| restoreBackup | 5        |
| isReadonly    | 3        |
| セキュリティ  | 10       |
| 統合          | 6        |
| **合計**      | **53**   |

## 7. テスト実行コマンド

```bash
# 単体テスト
pnpm --filter @repo/desktop test SkillFileManager.test.ts

# 統合テスト
pnpm --filter @repo/desktop test SkillFileManager.integration.test.ts

# セキュリティテスト
pnpm --filter @repo/desktop test SkillFileManager.security.test.ts

# 全テスト
pnpm --filter @repo/desktop test SkillFileManager
```

## 8. 統合テスト連携【必須】

### 統合テストシナリオ（本タスク固有）

| シナリオカテゴリ     | 検証内容                                               | テストファイル                         |
| -------------------- | ------------------------------------------------------ | -------------------------------------- |
| ファイルシステム統合 | 実ファイルの読み書き・作成・削除・一時ディレクトリ使用 | `SkillFileManager.integration.test.ts` |
| バックアップ統合     | バックアップ作成・一覧取得・復元の往復確認             | `SkillFileManager.integration.test.ts` |
| セキュリティ統合     | パストラバーサル・readonly保護の実環境検証             | `SkillFileManager.security.test.ts`    |
| SkillScanner連携     | ディレクトリパス設定の共有（将来的な統合テスト）       | **本タスクでは単独テストのみ**         |

> **注記**: IPC接続テスト・認証連携テスト・状態同期テストは本タスクスコープ外（TASK-9A-B で対応）

## 9. 完了条件

- [ ] 全テストケースが記述されている
- [ ] テストが全て FAIL している（実装前）
- [ ] テストフィクスチャが準備されている
- [ ] セキュリティテストが網羅的である
- [ ] 統合テストシナリオが定義されている
