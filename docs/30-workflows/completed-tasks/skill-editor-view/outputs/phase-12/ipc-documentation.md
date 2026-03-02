# SkillEditorView IPC ドキュメント

## 概要

SkillEditorView が利用する IPC チャネルの API 仕様を記述する。

## IPC チャネル一覧

### skill:getFileTree

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| チャネル | `skill:getFileTree`                                  |
| 引数     | `skillName: string`                                  |
| 戻り値   | `{ tree: SkillFileTreeNode[] }`                      |
| 実装状態 | **未実装**（UT-UI-05A-GETFILETREE-001 で管理）       |
| 説明     | スキル配下のファイル・ディレクトリ構造を再帰的に取得 |

```typescript
interface SkillFileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: SkillFileTreeNode[];
}
```

### skill:readFile

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| チャネル | `skill:readFile`                             |
| 引数     | `skillName: string, relativePath: string`    |
| 戻り値   | `string`（ファイル内容）                     |
| 実装状態 | 実装済み                                     |
| 説明     | 指定スキルの指定パスのファイル内容を読み込む |

### skill:writeFile

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| チャネル | `skill:writeFile`                                          |
| 引数     | `skillName: string, relativePath: string, content: string` |
| 戻り値   | `void`                                                     |
| 実装状態 | 実装済み                                                   |
| 説明     | 指定スキルの指定パスにファイル内容を書き込む               |

### skill:createFile

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| チャネル | `skill:createFile`                                         |
| 引数     | `skillName: string, relativePath: string, content: string` |
| 戻り値   | `void`                                                     |
| 実装状態 | 実装済み                                                   |
| 説明     | 指定スキルの配下に新規ファイルを作成する                   |

### skill:deleteFile

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| チャネル | `skill:deleteFile`                        |
| 引数     | `skillName: string, relativePath: string` |
| 戻り値   | `void`                                    |
| 実装状態 | 実装済み                                  |
| 説明     | 指定スキルの指定パスのファイルを削除する  |

### skill:listBackups

| 項目     | 内容                       |
| -------- | -------------------------- |
| チャネル | `skill:listBackups`        |
| 引数     | `skillName: string`        |
| 戻り値   | `BackupEntry[]`            |
| 実装状態 | 実装済み                   |
| 説明     | バックアップ一覧を取得する |

```typescript
interface BackupEntry {
  path: string;
  timestamp: string;
}
```

### skill:restoreBackup

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| チャネル | `skill:restoreBackup`                   |
| 引数     | `skillName: string, backupPath: string` |
| 戻り値   | `void`                                  |
| 実装状態 | 実装済み                                |
| 説明     | 指定バックアップからファイルを復元する  |

## バリデーション要件

全チャネルで P42 準拠の3段バリデーションを実施:

1. **型チェック**: `typeof skillName !== "string"`
2. **空文字列チェック**: `skillName === ""`
3. **トリム空文字列チェック**: `skillName.trim() === ""`

## セキュリティ要件

- 全チャネルで送信元ウィンドウを検証
- `relativePath` にパストラバーサル攻撃（`../`）が含まれないことを検証
- エラーはサニタイズしてから Renderer に送信
