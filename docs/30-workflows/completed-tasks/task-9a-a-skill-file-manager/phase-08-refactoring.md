# Phase 8: リファクタリング（TDD-Refactor）

## 1. リファクタリング方針

### 1.1 原則

| 原則           | 説明                                   |
| -------------- | -------------------------------------- |
| テスト維持     | リファクタリング前後でテストが全てPASS |
| 小さなステップ | 一度に大きな変更をしない               |
| 可読性向上     | 複雑なロジックを分割・命名改善         |
| 重複排除       | DRY原則に従い共通処理を抽出            |

### 1.2 スコープ

| 対象             | 対象外                                |
| ---------------- | ------------------------------------- |
| コード構造の改善 | 機能追加                              |
| 命名の改善       | APIシグネチャの変更                   |
| 重複コードの排除 | パフォーマンス最適化（Phase 9で実施） |

## 2. リファクタリング項目

### 2.1 共通処理の抽出

| 処理                  | 現状                                     | リファクタリング後                |
| --------------------- | ---------------------------------------- | --------------------------------- |
| readonly チェック     | 各メソッドで個別実装                     | `ensureWritable()` メソッドに抽出 |
| パス検証              | findSkillDir + validatePath の組み合わせ | `resolveAndValidatePath()` に統合 |
| fs エラーハンドリング | 各メソッドで個別実装                     | `handleFsError()` ヘルパーに抽出  |

### 2.2 命名改善

| 現在の名前   | 改善後の名前             | 理由                         |
| ------------ | ------------------------ | ---------------------------- |
| findSkillDir | resolveSkillDirectory    | より明確な意味               |
| walkDir      | walkDirectoryRecursively | 再帰処理であることを明示     |
| createBackup | createBackupFile         | ファイル操作であることを明示 |

### 2.3 コード構造改善

#### 2.3.1 エラーハンドリングの統一

```typescript
// Before: 各メソッドで個別処理
try {
  await fs.readFile(fullPath, "utf-8");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === "ENOENT") {
    throw new FileNotFoundError(relativePath);
  }
  throw error;
}

// After: ヘルパーメソッドで統一
private handleFsError(error: unknown, path: string, operation: string): never {
  const nodeError = error as NodeJS.ErrnoException;
  switch (nodeError.code) {
    case "ENOENT":
      throw new FileNotFoundError(path);
    case "EACCES":
      throw new PermissionError(path, operation);
    default:
      throw error;
  }
}
```

#### 2.3.2 バックアップパターン解析の分離

```typescript
// Before: restoreBackup 内でインライン実装
const backupPattern = /\.(backup|deleted)\.(\d+)$/;
const match = backupPath.match(backupPattern);

// After: 専用メソッドに分離
private parseBackupPath(backupPath: string): { originalPath: string; type: BackupType; timestamp: number } {
  // ロジックを分離
}
```

### 2.4 型安全性の向上

| 改善箇所           | 現状              | 改善後                       |
| ------------------ | ----------------- | ---------------------------- | ------------------------- |
| エラーコード       | 文字列リテラル    | const enum に変更            |
| バックアップタイプ | `'backup'         | 'deleted'`                   | `BackupType` 型エイリアス |
| オプション型       | 部分的に optional | Required<> と Partial<> 活用 |

## 3. リファクタリング手順

### 3.1 Step 1: エラーハンドリング統一

1. `handleFsError()` ヘルパーを実装
2. 各メソッドのエラーハンドリングを置換
3. テスト実行で PASS を確認

### 3.2 Step 2: 共通処理抽出

1. `ensureWritable()` メソッドを実装
2. writeFile, createFile, deleteFile, restoreBackup を更新
3. テスト実行で PASS を確認

### 3.3 Step 3: 命名改善

1. プライベートメソッドの名前を変更
2. 影響箇所を一括置換
3. テスト実行で PASS を確認

### 3.4 Step 4: コードフォーマット

1. ESLint --fix を実行
2. Prettier を実行
3. テスト実行で PASS を確認

## 4. リファクタリングチェックリスト

### 4.1 実施前チェック

- [ ] 全テストが PASS している
- [ ] カバレッジが目標値を達成している
- [ ] リファクタリング計画がレビュー済み

### 4.2 実施中チェック

- [ ] 各ステップ後にテストを実行
- [ ] コミットを小さく分割
- [ ] 変更理由をコミットメッセージに記載

### 4.3 実施後チェック

- [ ] 全テストが PASS している
- [ ] カバレッジが維持されている
- [ ] ESLint/Prettier エラーがない
- [ ] TypeScript コンパイルエラーがない

## 5. 統合テスト連携【必須】

### リファクタ後の統合テスト継続成功確認（本タスク固有）

```bash
# リファクタリング後の全テスト実行
pnpm --filter @repo/desktop test SkillFileManager

# 統合テスト
pnpm --filter @repo/desktop test SkillFileManager.integration

# セキュリティテスト
pnpm --filter @repo/desktop test SkillFileManager.security
```

| 確認項目           | 基準           |
| ------------------ | -------------- |
| ユニットテスト     | 全て PASS      |
| 統合テスト         | 全て PASS      |
| セキュリティテスト | 全て PASS      |
| カバレッジ維持     | Phase 7以上    |
| IPC/API統合        | **スコープ外** |

> **注記**: IPC連携のテストは本タスクスコープ外（TASK-9A-B で対応）

## 6. 完了条件

- [ ] 全リファクタリング項目が完了
- [ ] テストが全て PASS
- [ ] カバレッジが Phase 7 と同等以上
- [ ] コードレビュー観点でクリーン
- [ ] 統合テストが継続成功している
