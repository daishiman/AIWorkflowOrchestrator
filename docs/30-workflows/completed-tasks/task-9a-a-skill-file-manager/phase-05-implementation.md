# Phase 5: 実装（TDD-Green）

## 1. 実装ファイル

| ファイル                                                   | 説明               |
| ---------------------------------------------------------- | ------------------ |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts` | メインクラス       |
| `apps/desktop/src/main/services/skill/errors.ts`           | カスタムエラー定義 |
| `apps/desktop/src/main/services/skill/index.ts`            | export追加         |

## 2. 実装順序

### 2.1 Step 1: エラークラス定義

**ファイル**: `errors.ts`（新規作成または既存に追加）

| エラークラス       | 継承元 | プロパティ      |
| ------------------ | ------ | --------------- |
| SkillNotFoundError | Error  | skillName, code |
| ReadonlySkillError | Error  | skillName, code |
| PathTraversalError | Error  | path, code      |
| FileExistsError    | Error  | path, code      |
| FileNotFoundError  | Error  | path, code      |

### 2.2 Step 2: 型定義

**ファイル**: `SkillFileManager.ts`

```typescript
interface SkillFileManagerOptions {
  aiworkflowSkillsDir?: string;
  claudeSkillsDir?: string;
}

interface SkillDirInfo {
  path: string;
  readonly: boolean;
}

interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}
```

### 2.3 Step 3: コンストラクタ実装

```
処理:
1. オプションからディレクトリパスを取得
2. デフォルト値: ~/.aiworkflow/skills/, ~/.claude/skills/
3. path.resolve() で絶対パスに変換
```

### 2.4 Step 4: findSkillDir 実装

```
処理:
1. aiworkflowSkillsDir/{skillName} の存在チェック
2. 存在すれば { path, readonly: false } を返す
3. claudeSkillsDir/{skillName} の存在チェック
4. 存在すれば { path, readonly: true } を返す
5. どちらも存在しなければ SkillNotFoundError
```

### 2.5 Step 5: validatePath 実装

```
処理:
1. path.resolve(basePath, relativePath) で絶対パス化
2. resolved.startsWith(basePath) で検証
3. 違反なら PathTraversalError をスロー
```

### 2.6 Step 6: readFile 実装

```
処理:
1. findSkillDir(skillName) でスキルディレクトリを特定
2. validatePath() でパストラバーサルチェック
3. fs.readFile() でファイル読み込み
4. ENOENT なら FileNotFoundError
```

### 2.7 Step 7: createBackup 実装

```
処理:
1. 既存ファイルの存在チェック
2. 存在しなければ早期リターン
3. ファイル内容を読み込み
4. バックアップファイル名を生成（{path}.{type}.{timestamp}）
5. バックアップファイルに書き込み
```

### 2.8 Step 8: writeFile 実装

```
処理:
1. findSkillDir(skillName) でスキルディレクトリを特定
2. readonly チェック → true なら ReadonlySkillError
3. validatePath() でパストラバーサルチェック
4. createBackup() でバックアップ作成
5. fs.mkdir() で親ディレクトリ作成
6. fs.writeFile() で書き込み
```

### 2.9 Step 9: createFile 実装

```
処理:
1. findSkillDir(skillName) でスキルディレクトリを特定
2. readonly チェック → true なら ReadonlySkillError
3. validatePath() でパストラバーサルチェック
4. fs.access() で既存チェック → 存在すれば FileExistsError
5. fs.mkdir() で親ディレクトリ作成
6. fs.writeFile() で書き込み
```

### 2.10 Step 10: deleteFile 実装

```
処理:
1. findSkillDir(skillName) でスキルディレクトリを特定
2. readonly チェック → true なら ReadonlySkillError
3. validatePath() でパストラバーサルチェック
4. createBackup() でバックアップ作成（type: 'deleted'）
5. fs.unlink() でファイル削除
```

### 2.11 Step 11: walkDir 実装

```
処理:
1. fs.readdir() でエントリ取得
2. 各エントリについて:
   - ディレクトリなら再帰呼び出し
   - ファイルならパスを結果に追加
3. 全パスを配列で返す
```

### 2.12 Step 12: listBackups 実装

```
処理:
1. findSkillDir(skillName) でスキルディレクトリを特定
2. walkDir() で全ファイルを取得
3. .backup.{timestamp} と .deleted.{timestamp} をフィルタ
4. BackupInfo 形式に変換
```

### 2.13 Step 13: restoreBackup 実装

```
処理:
1. findSkillDir(skillName) でスキルディレクトリを特定
2. readonly チェック → true なら ReadonlySkillError
3. validatePath() でパストラバーサルチェック
4. 正規表現でバックアップパターンを解析
5. 元ファイルパスを算出
6. fs.readFile() でバックアップ内容読み込み
7. fs.writeFile() で元ファイルパスに書き込み
```

### 2.14 Step 14: isReadonly 実装

```
処理:
1. findSkillDir(skillName) でスキルディレクトリを特定
2. readonly フラグを返す
```

## 3. export追加

**ファイル**: `index.ts`

```typescript
export { SkillFileManager } from "./SkillFileManager";
export type { SkillFileManagerOptions, BackupInfo } from "./SkillFileManager";
```

## 4. 実装時の注意事項

### 4.1 Electron Main Process配置

| 観点           | 要件                                    |
| -------------- | --------------------------------------- |
| ファイルパス   | `apps/desktop/src/main/services/skill/` |
| インポート形式 | Node.js `fs/promises` を使用            |
| 非同期処理     | 全メソッドを `async` で実装             |

### 4.2 SkillScannerとの整合性

| 観点             | SkillScanner            | SkillFileManager |
| ---------------- | ----------------------- | ---------------- |
| デフォルトパス   | `~/.aiworkflow/skills/` | 同一             |
| 読み取り専用判定 | `readonly` フラグ       | 同一ロジック     |
| パストラバーサル | `validatePath()`        | 同様のパターン   |

## 5. テスト実行

```bash
# 実装後のテスト実行
pnpm --filter @repo/desktop test SkillFileManager

# 特定のテストファイルのみ
pnpm --filter @repo/desktop test SkillFileManager.test.ts
```

## 6. 統合テスト連携【必須】

### フロント/バック接続の実装（本タスク固有）

| 実装項目             | 内容                                                    |
| -------------------- | ------------------------------------------------------- |
| ファイルシステム連携 | Node.js fs/promises APIを使用した実ファイル操作の実装   |
| SkillScanner連携     | ディレクトリパス設定を共有、同一のデフォルトパスを使用  |
| バックアップ連携     | writeFile/deleteFile 実行前に createBackup() を呼び出し |
| IPC接続              | **本タスクスコープ外**（TASK-9A-B で実装）              |

> **注記**: 本タスクはサービスクラスの実装であり、IPC通信・API接続・状態同期の実装は後続タスクで対応する。

## 7. 完了条件

- [ ] 全メソッドが実装されている
- [ ] Phase 4 のテストが全て PASS している
- [ ] TypeScript コンパイルエラーがない
- [ ] ESLint エラーがない
- [ ] 統合テスト連携の実装項目が完了している
