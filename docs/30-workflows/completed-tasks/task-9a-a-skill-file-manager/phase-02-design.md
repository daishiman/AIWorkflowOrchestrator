# Phase 2: 設計

## 1. クラス設計

### 1.1 SkillFileManager クラス

```
┌─────────────────────────────────────────────────────────────┐
│                     SkillFileManager                         │
├─────────────────────────────────────────────────────────────┤
│ - aiworkflowSkillsDir: string                               │
│ - claudeSkillsDir: string                                   │
├─────────────────────────────────────────────────────────────┤
│ + constructor(options?: SkillFileManagerOptions)            │
│ + readFile(skillName, relativePath): Promise<string>        │
│ + writeFile(skillName, relativePath, content): Promise<void>│
│ + createFile(skillName, relativePath, content): Promise<void>│
│ + deleteFile(skillName, relativePath): Promise<void>        │
│ + listBackups(skillName): Promise<BackupInfo[]>             │
│ + restoreBackup(skillName, backupPath): Promise<void>       │
│ + isReadonly(skillName): Promise<boolean>                   │
│ - validatePath(targetPath, basePath): void                  │
│ - findSkillDir(skillName): Promise<SkillDirInfo>            │
│ - createBackup(fullPath, type): Promise<string>             │
│ - walkDir(dir): Promise<string[]>                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 型定義

```typescript
// コンストラクタオプション
interface SkillFileManagerOptions {
  aiworkflowSkillsDir?: string;
  claudeSkillsDir?: string;
}

// スキルディレクトリ情報
interface SkillDirInfo {
  path: string;
  readonly: boolean;
}

// バックアップ情報
interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}

// ファイル操作結果
interface FileOperationResult {
  success: boolean;
  path: string;
  backupPath?: string;
}
```

## 2. アーキテクチャ設計

### 2.1 レイヤー構成

```
┌────────────────────────────────────────────┐
│           IPC Handler (TASK-9A-B)          │ ← 次タスクで実装
├────────────────────────────────────────────┤
│           SkillFileManager                  │ ← 本タスク
├────────────────────────────────────────────┤
│           Node.js fs/promises               │
└────────────────────────────────────────────┘
```

### 2.2 既存サービスとの連携

| サービス     | 連携内容                     |
| ------------ | ---------------------------- |
| SkillScanner | ディレクトリパス設定を共有   |
| SkillService | 将来的にFacadeとして統合予定 |

## 3. メソッド設計

### 3.1 readFile

```
入力: skillName, relativePath
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. validatePath() でパストラバーサルチェック
  3. fs.readFile() でファイル読み込み
出力: ファイル内容（string）
```

### 3.2 writeFile

```
入力: skillName, relativePath, content
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. readonly チェック → true なら ReadonlySkillError
  3. validatePath() でパストラバーサルチェック
  4. 既存ファイルがあれば createBackup() でバックアップ
  5. 親ディレクトリを mkdir -p
  6. fs.writeFile() で書き込み
出力: void
```

### 3.3 createFile

```
入力: skillName, relativePath, content
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. readonly チェック → true なら ReadonlySkillError
  3. validatePath() でパストラバーサルチェック
  4. fs.access() で既存チェック → 存在すれば FileExistsError
  5. 親ディレクトリを mkdir -p
  6. fs.writeFile() で書き込み
出力: void
```

### 3.4 deleteFile

```
入力: skillName, relativePath
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. readonly チェック → true なら ReadonlySkillError
  3. validatePath() でパストラバーサルチェック
  4. createBackup() でバックアップ作成（type: 'deleted'）
  5. fs.unlink() でファイル削除
出力: void
```

### 3.5 listBackups

```
入力: skillName
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. walkDir() で全ファイルを再帰取得
  3. .backup.{timestamp} と .deleted.{timestamp} をフィルタ
  4. BackupInfo 形式に変換
出力: BackupInfo[]
```

### 3.6 restoreBackup

```
入力: skillName, backupPath
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. readonly チェック → true なら ReadonlySkillError
  3. validatePath() でパストラバーサルチェック
  4. バックアップファイルパスから元ファイルパスを算出
  5. fs.readFile() でバックアップ内容読み込み
  6. fs.writeFile() で元ファイルパスに書き込み
出力: void
```

## 4. エラー設計

| エラークラス       | 条件                               | コード                  |
| ------------------ | ---------------------------------- | ----------------------- |
| SkillNotFoundError | スキルディレクトリが存在しない     | SKILL_NOT_FOUND         |
| ReadonlySkillError | 読み取り専用スキルへの書き込み試行 | READONLY_SKILL          |
| PathTraversalError | パストラバーサル検出               | PATH_TRAVERSAL_DETECTED |
| FileExistsError    | createFile で既存ファイルがある    | FILE_ALREADY_EXISTS     |
| FileNotFoundError  | 操作対象ファイルが存在しない       | FILE_NOT_FOUND          |

## 5. セキュリティ設計

### 5.1 パストラバーサル防止

```
validatePath(targetPath, basePath):
  1. path.resolve(basePath, targetPath) で絶対パス化
  2. resolved.startsWith(basePath) で検証
  3. 違反なら PathTraversalError をスロー
```

### 5.2 読み取り専用保護

```
findSkillDir(skillName):
  1. ~/.aiworkflow/skills/{skillName} をチェック
  2. 存在すれば { path, readonly: false } を返す
  3. ~/.claude/skills/{skillName} をチェック
  4. 存在すれば { path, readonly: true } を返す
  5. どちらも存在しなければ SkillNotFoundError
```

## 6. テスト設計方針

| テストカテゴリ | 方針                                       |
| -------------- | ------------------------------------------ |
| 単体テスト     | fs/promises をモックしてロジックを検証     |
| 統合テスト     | 一時ディレクトリで実際のファイル操作を検証 |
| セキュリティ   | パストラバーサル、readonly保護を検証       |

## 7. ファイル構成

```
apps/desktop/src/main/services/skill/
├── SkillFileManager.ts      ← 新規作成
├── SkillScanner.ts          ← 既存
├── SkillService.ts          ← 既存
├── index.ts                 ← export追加
└── __tests__/
    └── SkillFileManager.test.ts  ← 新規作成
```

## 8. 統合テスト連携【必須】

### 統合ポイント/契約（本タスク固有）

| 統合ポイント        | 契約定義                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| SkillScanner連携    | 同一のディレクトリパス設定を使用（aiworkflowSkillsDir, claudeSkillsDir） |
| Node.js fs/promises | 標準API（readFile, writeFile, mkdir, unlink, readdir）                   |
| バックアップ契約    | `{filename}.{type}.{timestamp}` 形式（type: backup \| deleted）          |
| IPC契約             | **本タスクスコープ外**（TASK-9A-B で定義）                               |

> **注記**: 本タスクはサービスクラスの設計であり、IPC通信の契約定義は後続タスクで対応する。

## 9. 実装優先順位

| 順位 | メソッド      | 理由                   |
| ---- | ------------- | ---------------------- |
| 1    | constructor   | 初期化ロジック         |
| 2    | findSkillDir  | 他メソッドの共通基盤   |
| 3    | validatePath  | セキュリティ基盤       |
| 4    | readFile      | 最も基本的な操作       |
| 5    | writeFile     | バックアップ連携の基盤 |
| 6    | createFile    | writeFile の派生       |
| 7    | deleteFile    | バックアップ連携       |
| 8    | listBackups   | バックアップ管理       |
| 9    | restoreBackup | バックアップ復元       |
