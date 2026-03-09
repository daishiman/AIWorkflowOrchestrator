# Phase 11: 発見課題

## メタ情報

| 項目     | 値              |
| -------- | --------------- |
| タスクID | TASK-10A-G      |
| Phase    | 11 - 手動テスト |
| 実行日   | 2026-03-09      |

## 発見課題一覧

### ENV-01: Rollup optional dependency 欠落（環境差異）

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| 分類         | 環境 blocker                                                          |
| 影響         | `@rollup/rollup-darwin-x64` の `require.resolve` が失敗する環境がある |
| 再現条件     | worktree環境で `uname=x86_64` と `node.arch=arm64` が混在する場合     |
| 現在の扱い   | WARN（vitest は実行可能、170 tests PASS）                             |
| 恒久対策候補 | 依存再解決手順を preflight に明記（`pnpm fetch` / 再install）         |
| 重要度       | LOW                                                                   |

## 既存 backlog（スコープ外）

| ID                                             | 内容                                 | 状態                     |
| ---------------------------------------------- | ------------------------------------ | ------------------------ |
| TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION | SkillEditor direct IPC の Store 移行 | 別管理済み、重複起票なし |

## product defect

なし。対象6 suite は 170 tests PASS、画面証跡 TC-11-01〜09 も期待結果と一致。

## 新規 backlog 候補

なし。既存 backlog に吸収できない課題は検出されなかった。
