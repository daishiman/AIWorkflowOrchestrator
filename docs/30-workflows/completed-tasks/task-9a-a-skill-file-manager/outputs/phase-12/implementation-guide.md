# SkillFileManager 実装ガイド

## Part 1: 概念説明（中学生レベル）

### SkillFileManager とは？

**日常の例え話**:
スマートフォンのフォトアルバムアプリを想像してください。

- **読み込み**: アルバムから写真を見る
- **書き込み**: 写真を編集して保存する（編集前の写真は自動でバックアップ）
- **作成**: 新しい写真をアルバムに追加する
- **削除**: 写真を削除する（ゴミ箱に移動されるので復元可能）
- **バックアップ一覧**: ゴミ箱や編集履歴を見る
- **復元**: ゴミ箱や編集履歴から写真を元に戻す

SkillFileManager は、この「フォトアルバムアプリ」のように、スキルファイルを安全に管理するための機能です。

### なぜ必要？

1. **誤って削除しても大丈夫**: 削除前に自動でバックアップが作られる
2. **編集履歴が残る**: 書き込み前の内容がバックアップされる
3. **安全に管理**: 重要なファイル（Claude CLIのスキル）は編集できないように保護

### 2つのスキルフォルダ

| フォルダ                | 役割                 | 編集     |
| ----------------------- | -------------------- | -------- |
| `~/.aiworkflow/skills/` | あなたが作ったスキル | できる   |
| `~/.claude/skills/`     | Claude公式のスキル   | できない |

---

## Part 2: 技術的詳細（開発者レベル）

### インターフェース定義

```typescript
interface SkillFileManagerOptions {
  aiworkflowSkillsDir?: string; // デフォルト: ~/.aiworkflow/skills/
  claudeSkillsDir?: string; // デフォルト: ~/.claude/skills/
}

interface BackupInfo {
  filename: string; // バックアップファイル名
  relativePath: string; // スキルディレクトリからの相対パス
  originalPath: string; // 元ファイルのパス
  type: "backup" | "deleted"; // バックアップ種別
  timestamp: number; // タイムスタンプ（ミリ秒）
  createdAt: Date; // 作成日時
}
```

### API シグネチャ

| メソッド      | シグネチャ                                                                    | 説明             |
| ------------- | ----------------------------------------------------------------------------- | ---------------- |
| readFile      | `(skillName: string, relativePath: string) => Promise<string>`                | ファイル読み込み |
| writeFile     | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル書き込み |
| createFile    | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル作成     |
| deleteFile    | `(skillName: string, relativePath: string) => Promise<void>`                  | ファイル削除     |
| listBackups   | `(skillName: string) => Promise<BackupInfo[]>`                                | バックアップ一覧 |
| restoreBackup | `(skillName: string, backupPath: string) => Promise<void>`                    | バックアップ復元 |
| isReadonly    | `(skillName: string) => Promise<boolean>`                                     | 読み取り専用判定 |

### エラークラス

| エラークラス       | エラーコード            | 発生条件                       |
| ------------------ | ----------------------- | ------------------------------ |
| SkillNotFoundError | SKILL_NOT_FOUND         | スキルディレクトリが存在しない |
| ReadonlySkillError | READONLY_SKILL          | 読み取り専用スキルへの書き込み |
| PathTraversalError | PATH_TRAVERSAL_DETECTED | パストラバーサル検出           |
| FileExistsError    | FILE_ALREADY_EXISTS     | createFile で既存ファイルあり  |
| FileNotFoundError  | FILE_NOT_FOUND          | 操作対象ファイルが存在しない   |

### 使用例

```typescript
import { SkillFileManager } from "./services/skill";

const manager = new SkillFileManager();

// ファイル読み込み
const content = await manager.readFile("my-skill", "references/guide.md");

// ファイル書き込み（バックアップ自動作成）
await manager.writeFile(
  "my-skill",
  "references/guide.md",
  "# Updated Guide\n...",
);

// バックアップ一覧取得
const backups = await manager.listBackups("my-skill");
console.log(backups);
// [{ filename: 'guide.md.backup.1738500000000', type: 'backup', ... }]

// バックアップから復元
await manager.restoreBackup(
  "my-skill",
  "references/guide.md.backup.1738500000000",
);
```

### セキュリティ考慮事項

1. **パストラバーサル防止**: `../` を含むパスは自動で拒否
2. **読み取り専用保護**: `~/.claude/skills/` への書き込みは全て拒否
3. **Nullバイト検証**: Nullバイトを含むパスは安全に処理

### インポート方法

```typescript
import {
  SkillFileManager,
  SkillNotFoundError,
  ReadonlySkillError,
  PathTraversalError,
  FileExistsError,
  FileNotFoundError,
} from "@repo/desktop/main/services/skill";

// または
import type {
  SkillFileManagerOptions,
  BackupInfo,
} from "@repo/desktop/main/services/skill";
```
