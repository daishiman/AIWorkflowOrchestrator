# Phase 6: テスト拡充

## メタ情報

- **タスクID**: UT-UI-05A-GETFILETREE-001
- **Phase**: 6（テスト拡充）
- **実行日**: 2026-03-03

## テスト追加内容

### 追加テスト一覧

| テストID | テストファイル            | テスト内容                                                        | カテゴリ     |
| -------- | ------------------------- | ----------------------------------------------------------------- | ------------ |
| FT-15    | skillFileHandlers.test.ts | validateIpcSender の getAllowedWindows が mainWindow を返す (P41) | セキュリティ |
| FT-16    | skillFileHandlers.test.ts | null 引数で VALIDATION_ERROR を返す                               | エッジケース |
| P41全体  | skillFileHandlers.test.ts | 全7ハンドラーの getAllowedWindows が mainWindow を返す            | セキュリティ |

### テスト数推移

| テストファイル                       | Phase 5完了時 | Phase 6完了時 | 追加数 |
| ------------------------------------ | ------------- | ------------- | ------ |
| skillFileHandlers.test.ts            | 47            | 50            | +3     |
| SkillFileManager.getFileTree.test.ts | 5             | 5             | 0      |
| skill-api.getFileTree.test.ts        | 1             | 1             | 0      |
| **合計**                             | **53**        | **56**        | **+3** |

### P41パターン対策

v8カバレッジプロバイダはインラインarrow function（`getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントするため、`validateIpcSender.mock.calls` から `getAllowedWindows()` コールバックを取得し、明示的に実行して `[mainWindow]` を返すことを検証。

全7ハンドラー（readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup, getFileTree）のコールバックをカバー。

## 完了条件チェックリスト

- [x] P41パターン（getAllowedWindows コールバック検証）を全ハンドラーに適用
- [x] getFileTree 固有のエッジケース（null引数）を追加
- [x] 全56テストがPASS
- [x] テスト間で状態共有なし（beforeEach でリセット）
