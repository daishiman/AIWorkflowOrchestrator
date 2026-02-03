# Phase 2: 設計ドキュメント

## 実行日: 2026-02-03

## 1. クラス設計

### 1.1 SkillFileManager クラス図

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

### 1.2 アーキテクチャ

```
┌────────────────────────────────────────────┐
│           IPC Handler (TASK-9A-B)          │ ← 次タスクで実装
├────────────────────────────────────────────┤
│           SkillFileManager                  │ ← 本タスク
├────────────────────────────────────────────┤
│           Node.js fs/promises               │
└────────────────────────────────────────────┘
```

## 2. 型定義

### 2.1 インターフェース定義

```typescript
/**
 * コンストラクタオプション
 */
interface SkillFileManagerOptions {
  aiworkflowSkillsDir?: string;
  claudeSkillsDir?: string;
}

/**
 * スキルディレクトリ情報
 */
interface SkillDirInfo {
  path: string;
  readonly: boolean;
}

/**
 * バックアップ情報
 */
interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}

/**
 * バックアップタイプ
 */
type BackupType = "backup" | "deleted";
```

## 3. エラークラス設計

| エラークラス       | エラーコード            | 発生条件                       |
| ------------------ | ----------------------- | ------------------------------ |
| SkillNotFoundError | SKILL_NOT_FOUND         | スキルディレクトリが存在しない |
| ReadonlySkillError | READONLY_SKILL          | 読み取り専用スキルへの書き込み |
| PathTraversalError | PATH_TRAVERSAL_DETECTED | パストラバーサル検出           |
| FileExistsError    | FILE_ALREADY_EXISTS     | createFile で既存ファイルあり  |
| FileNotFoundError  | FILE_NOT_FOUND          | 操作対象ファイルが存在しない   |

## 4. メソッド設計

### 4.1 constructor

```
入力: options?: SkillFileManagerOptions
処理:
  1. オプションからディレクトリパスを取得
  2. デフォルト値: ~/.aiworkflow/skills/, ~/.claude/skills/
  3. path.resolve() で絶対パスに変換
```

### 4.2 findSkillDir

```
入力: skillName
処理:
  1. aiworkflowSkillsDir/{skillName} の存在チェック
  2. 存在すれば { path, readonly: false } を返す
  3. claudeSkillsDir/{skillName} の存在チェック
  4. 存在すれば { path, readonly: true } を返す
  5. どちらも存在しなければ SkillNotFoundError
出力: SkillDirInfo
```

### 4.3 validatePath

```
入力: relativePath, basePath
処理:
  1. path.resolve(basePath, relativePath) で絶対パス化
  2. resolved.startsWith(basePath) で検証
  3. 違反なら PathTraversalError をスロー
出力: void (例外スロー可能)
```

### 4.4 readFile

```
入力: skillName, relativePath
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. validatePath() でパストラバーサルチェック
  3. fs.readFile() でファイル読み込み
  4. ENOENT なら FileNotFoundError
出力: ファイル内容（string）
```

### 4.5 writeFile

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

### 4.6 createFile

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

### 4.7 deleteFile

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

### 4.8 createBackup

```
入力: fullPath, type ('backup' | 'deleted')
処理:
  1. 既存ファイルの存在チェック
  2. 存在しなければ早期リターン
  3. ファイル内容を読み込み
  4. バックアップファイル名を生成（{path}.{type}.{timestamp}）
  5. バックアップファイルに書き込み
出力: バックアップパス（string | undefined）
```

### 4.9 listBackups

```
入力: skillName
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. walkDir() で全ファイルを再帰取得
  3. .backup.{timestamp} と .deleted.{timestamp} をフィルタ
  4. BackupInfo 形式に変換
出力: BackupInfo[]
```

### 4.10 restoreBackup

```
入力: skillName, backupPath
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. readonly チェック → true なら ReadonlySkillError
  3. validatePath() でパストラバーサルチェック
  4. 正規表現でバックアップパターンを解析
  5. 元ファイルパスを算出
  6. fs.readFile() でバックアップ内容読み込み
  7. fs.writeFile() で元ファイルパスに書き込み
出力: void
```

### 4.11 isReadonly

```
入力: skillName
処理:
  1. findSkillDir(skillName) でスキルディレクトリを特定
  2. readonly フラグを返す
出力: boolean
```

### 4.12 walkDir

```
入力: dir
処理:
  1. fs.readdir() でエントリ取得
  2. 各エントリについて:
     - ディレクトリなら再帰呼び出し
     - ファイルならパスを結果に追加
  3. 全パスを配列で返す
出力: string[]
```

## 5. ファイル構成

```
apps/desktop/src/main/services/skill/
├── SkillFileManager.ts          ← 新規作成
├── errors.ts                    ← 新規作成（または既存に追加）
├── SkillScanner.ts              ← 既存
├── SkillService.ts              ← 既存
├── index.ts                     ← export追加
└── __tests__/
    ├── SkillFileManager.test.ts          ← 新規作成（単体テスト）
    ├── SkillFileManager.integration.test.ts ← 新規作成（統合テスト）
    └── SkillFileManager.security.test.ts ← 新規作成（セキュリティテスト）
```

## 6. SkillScanner との連携

| 観点             | SkillScanner            | SkillFileManager       |
| ---------------- | ----------------------- | ---------------------- |
| デフォルトパス   | `~/.aiworkflow/skills/` | 同一                   |
| 読み取り専用判定 | `readonly` フラグ       | 同一ロジック           |
| パストラバーサル | `validatePath()`        | 同様のパターン         |
| オプション型     | `SkillScannerOptions`   | 同様のOptions パターン |

## 7. 実装優先順位

| 順位 | メソッド      | 理由                   |
| ---- | ------------- | ---------------------- |
| 1    | constructor   | 初期化ロジック         |
| 2    | findSkillDir  | 他メソッドの共通基盤   |
| 3    | validatePath  | セキュリティ基盤       |
| 4    | readFile      | 最も基本的な操作       |
| 5    | createBackup  | 書き込み系の前提       |
| 6    | writeFile     | バックアップ連携の基盤 |
| 7    | createFile    | writeFile の派生       |
| 8    | deleteFile    | バックアップ連携       |
| 9    | walkDir       | listBackups の前提     |
| 10   | listBackups   | バックアップ管理       |
| 11   | restoreBackup | バックアップ復元       |
| 12   | isReadonly    | 簡単なヘルパー         |

## 8. 完了チェック

- [x] クラス設計が完了
- [x] 型定義が明確
- [x] エラークラスが設計されている
- [x] メソッドの入出力が定義されている
- [x] 既存サービスとの整合性を確認
