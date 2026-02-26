# Phase 1 受入基準一覧

| ID    | 判定 | 根拠                                                  |
| ----- | ---- | ----------------------------------------------------- |
| AC-01 | PASS | SkillEditor でファイルツリー表示を確認                |
| AC-02 | PASS | `SkillEditor.test.tsx` ファイル切替テスト             |
| AC-03 | PASS | 編集 + save 呼び出しテスト                            |
| AC-04 | PASS | `.claude/skills` パスで readonly UI テスト            |
| AC-05 | PASS | 保存ボタン + ショートカット実装確認                   |
| AC-06 | PASS | `SkillFileManager.test.ts` 既存回帰でバックアップ動作 |
| AC-07 | PASS | createFile UI実装 + IPC呼び出し                       |
| AC-08 | PASS | deleteFile 前 confirm 実装                            |
| AC-09 | PASS | `SKILL.md` 削除禁止ガード実装                         |
| AC-10 | PASS | listBackups 表示 + テスト                             |
| AC-11 | PASS | restoreBackup 実行テスト                              |
| AC-12 | PASS | 未保存時ダイアログ表示テスト                          |
| AC-13 | PASS | 保存/破棄/キャンセルの3分岐実装                       |
| AC-14 | PASS | tree/treeitem + Arrowキー移動テスト                   |
| AC-15 | PASS | 操作ボタンへ aria-label 付与                          |
| AC-16 | PASS | readonly で作成/削除/保存無効化                       |
| AC-17 | PASS | `pnpm --filter @repo/desktop typecheck` 成功          |
| AC-18 | PASS | 既存回帰 164 tests PASS                               |

## 検証コマンド

- `pnpm vitest run src/renderer/components/skill/__tests__/SkillEditor.test.tsx ...`
- `pnpm --filter @repo/desktop typecheck`
- `pnpm vitest run src/main/services/skill/__tests__/SkillFileManager.test.ts src/main/ipc/__tests__/skillFileHandlers.test.ts src/preload/__tests__/skill-api.test.ts src/renderer/components/skill/__tests__/SkillEditor.test.tsx`
