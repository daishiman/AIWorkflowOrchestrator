# Phase 2 IPC API仕様

## 利用API（Preload）

- `readFile(skillName, relativePath): Promise<string>`
- `writeFile(skillName, relativePath, content): Promise<void>`
- `createFile(skillName, relativePath, content): Promise<void>`
- `deleteFile(skillName, relativePath): Promise<void>`
- `listBackups(skillName): Promise<BackupInfo[]>`
- `restoreBackup(skillName, backupPath): Promise<void>`

## 呼び出し契約

- `skillName`: 非空文字列
- `relativePath`: 非空、パストラバーサル禁止（Mainで最終防御）
- `content`: string

## エラー契約

- 既知エラー: `SkillNotFoundError`, `ReadonlySkillError`, `PathTraversalError`, `FileExistsError`, `FileNotFoundError`
- Renderer: メッセージをUI alert領域へ表示し、編集内容は保持。

## 互換性

- TASK-9A-B 実装済み契約をそのまま利用（API追加なし、破壊的変更なし）。

## 判定

PASS
