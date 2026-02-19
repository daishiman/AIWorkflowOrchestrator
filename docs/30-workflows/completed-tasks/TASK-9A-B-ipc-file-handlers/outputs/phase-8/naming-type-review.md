# 命名規則・型定義レビューレポート

| 項目     | 値                   |
| -------- | -------------------- |
| タスクID | TASK-9A-B            |
| Phase    | 8 (リファクタリング) |
| 作成日   | 2026-02-19           |

## 分析結果

### 1. 型名（PascalCase 準拠）

| 型名               | 用途                         | 準拠 |
| ------------------ | ---------------------------- | ---- |
| SkillNotFoundError | スキル未検出エラー           | OK   |
| ReadonlySkillError | 読み取り専用スキルエラー     | OK   |
| PathTraversalError | パストラバーサルエラー       | OK   |
| FileExistsError    | ファイル重複エラー           | OK   |
| FileNotFoundError  | ファイル未検出エラー         | OK   |
| BackupInfo         | バックアップ情報型           | OK   |
| SkillAPI           | Preload API インターフェース | OK   |

全型名が PascalCase に準拠している。

### 2. 関数名（camelCase 準拠）

| 関数名                      | 用途                 | 準拠 |
| --------------------------- | -------------------- | ---- |
| registerSkillFileHandlers   | ハンドラー一括登録   | OK   |
| unregisterSkillFileHandlers | ハンドラー一括解除   | OK   |
| isKnownSkillFileError       | 既知エラー判定       | OK   |
| readFile                    | ファイル読み取り     | OK   |
| writeFile                   | ファイル書き込み     | OK   |
| createFile                  | ファイル作成         | OK   |
| deleteFile                  | ファイル削除         | OK   |
| listBackups                 | バックアップ一覧取得 | OK   |
| restoreBackup               | バックアップ復元     | OK   |

全関数名が camelCase に準拠している。

### 3. 定数名（UPPER_SNAKE_CASE 準拠）

| 定数名               | 値                    | 準拠 |
| -------------------- | --------------------- | ---- |
| SKILL_READ_FILE      | `skill:readFile`      | OK   |
| SKILL_WRITE_FILE     | `skill:writeFile`     | OK   |
| SKILL_CREATE_FILE    | `skill:createFile`    | OK   |
| SKILL_DELETE_FILE    | `skill:deleteFile`    | OK   |
| SKILL_LIST_BACKUPS   | `skill:listBackups`   | OK   |
| SKILL_RESTORE_BACKUP | `skill:restoreBackup` | OK   |

全定数名が UPPER_SNAKE_CASE に準拠している。

### 4. boolean 関数プレフィックス

| 関数名                | プレフィックス | 準拠 |
| --------------------- | -------------- | ---- |
| isKnownSkillFileError | `is`           | OK   |

コーディング規約（`is` / `has` / `can` / `should` プレフィックス）に準拠している。

### 5. エラーメッセージ言語

全エラーメッセージは英語で統一されている。これは既存パターン（`skillHandlers.ts` 等）に合わせた設計である。

| エラーメッセージ例                        | 言語 |
| ----------------------------------------- | ---- |
| `"skillName must be a non-empty string"`  | 英語 |
| `"fileName must be a non-empty string"`   | 英語 |
| `"content must be a string"`              | 英語 |
| `"backupPath must be a non-empty string"` | 英語 |
| `"Internal error"`                        | 英語 |

## 改善判定

**全項目準拠 -- 改善不要。**

| 検査項目                | 結果 |
| ----------------------- | ---- |
| 型名 PascalCase         | OK   |
| 関数名 camelCase        | OK   |
| 定数名 UPPER_SNAKE_CASE | OK   |
| boolean プレフィックス  | OK   |
| エラーメッセージ言語    | OK   |

## 完了条件

- [x] 型名の PascalCase 準拠を確認
- [x] 関数名の camelCase 準拠を確認
- [x] 定数名の UPPER_SNAKE_CASE 準拠を確認
- [x] boolean 関数のプレフィックス規約を確認
- [x] エラーメッセージの言語統一を確認
- [x] 改善要否を判定（全項目準拠、改善不要）
