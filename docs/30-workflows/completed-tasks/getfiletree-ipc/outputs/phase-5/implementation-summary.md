# Phase 5: 実装サマリー — skill:getFileTree IPC

## 実装概要

| 項目           | 値                        |
| -------------- | ------------------------- |
| タスクID       | UT-UI-05A-GETFILETREE-001 |
| Phase          | 5（実装）                 |
| 変更ファイル数 | 7                         |
| 追加行数       | 約254行（テスト含む）     |

## 変更ファイル一覧

| ファイル                                                               | 変更種別 | 概要                                                        |
| ---------------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`                                 | 修正     | `SKILL_GET_FILE_TREE` チャネル定義追加                      |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts`             | 修正     | `SkillFileTreeNode` 型・`getFileTree`・`buildFileTree` 追加 |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts`                       | 修正     | `skill:getFileTree` IPCハンドラ追加                         |
| `apps/desktop/src/preload/types.ts`                                    | 修正     | `SkillFileTreeNode` 型定義追加                              |
| `apps/desktop/src/preload/skill-api.ts`                                | 修正     | `getFileTree` API追加（`safeInvokeUnwrap`経由）             |
| `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` | 修正     | `window.electronAPI.skill.getFileTree` 直接呼び出しに変更   |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`        | 修正     | getFileTree ハンドラテスト8件追加                           |

## 新規テストファイル

| ファイル                                                                              | テスト数 | テスト対象       |
| ------------------------------------------------------------------------------------- | -------- | ---------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.getFileTree.test.ts` | 5        | SkillFileManager |
| `apps/desktop/src/preload/__tests__/skill-api.getFileTree.test.ts`                    | 1        | Preload API      |

## 実装詳細

### Task 5-1: IPC チャネル定義

- `IPC_CHANNELS.SKILL_GET_FILE_TREE = "skill:getFileTree"` を追加
- `ALLOWED_INVOKE_CHANNELS` ホワイトリストにも追加

### Task 5-2: SkillFileManager

- `SkillFileTreeNode` インターフェース（`name`, `path`, `type`, `children?`）をエクスポート
- `getFileTree(skillName)`: スキルディレクトリを検索し `buildFileTree` を呼び出す
- `buildFileTree(dir, basePath)`: 再帰的にファイルツリーを構築
  - `BACKUP_PATTERN` でバックアップファイルを除外
  - ディレクトリ先頭・名前順ソート
  - 相対パスは `/` 区切りに正規化

### Task 5-3: IPC ハンドラ

- `validateIpcSender` によるセキュリティ検証
- P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）
- `isKnownSkillFileError` による既知エラー/未知エラーの分岐
- `unregisterSkillFileHandlers` にも解除処理を追加

### Task 5-4: Preload API

- `SkillFileTreeNode` 型を `preload/types.ts` に追加
- `SkillAPI` インターフェースと実装に `getFileTree` メソッド追加
- `safeInvokeUnwrap` で `{ success, data }` レスポンスを自動アンラップ

### Task 5-5: useFileTree フック

- Linter自動修正により `window.electronAPI.skill.getFileTree(skillName)` を直接使用する形に更新

## テスト結果

- Phase 5完了時: 全53テスト PASS（skillFileHandlers: 47件 + SkillFileManager.getFileTree: 5件 + skill-api.getFileTree: 1件）
- Phase 6拡充後: 全56テスト PASS（skillFileHandlers: 50件 + SkillFileManager.getFileTree: 5件 + skill-api.getFileTree: 1件）

## 設計上の注意点

- `SkillFileTreeNode` は3箇所（SkillFileManager.ts / preload/types.ts / SkillEditorView/types.ts）で構造的に同一の型を定義。Electron のレイヤー分離を維持するため、クロスレイヤーの import は行わない
- SkillFileManager コンストラクタは `SkillFileManagerOptions` オブジェクトを受け取る（テスト設計書の `[tmpDir]` 記法とは異なる）
