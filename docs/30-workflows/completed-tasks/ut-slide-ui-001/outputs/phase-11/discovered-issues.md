# Phase 11 発見された Issue

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 11                           |
| タスクID | UT-SLIDE-UI-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 発見された Issue 一覧

### Issue 1: native terminal launch IPC が未実装

| 項目   | 内容                                                               |
| ------ | ------------------------------------------------------------------ |
| 深刻度 | 中                                                                 |
| 分類   | runtime / handoff follow-up                                        |
| 対象   | `SlideWorkspace.tsx`, `TerminalLauncher.tsx`, slide runtime bridge |

現状の open ボタンは copy fallback を呼ぶだけで、ネイティブに terminal を開く IPC は存在しない。UI shell と copy 導線は成立したが、task-09 正本が想定する terminal open は `UT-SLIDE-IMPL-001` 側で残る。

### Issue 2: close / cancel error が UI surface に返らない

| 項目   | 内容                 |
| ------ | -------------------- |
| 深刻度 | 低                   |
| 分類   | error surface        |
| 対象   | `useSlideProject.ts` |

`closeProject()` / `cancelExecution()` は失敗時に `console.error` のみで、ユーザー向け error surface を持たない。通常系 UI は整ったが、終了系エラーの通知は別対応が必要。

### Issue 3: synced badge のコントラスト不足

| 項目   | 内容                |
| ------ | ------------------- |
| 深刻度 | 低                  |
| 分類   | accessibility       |
| 対象   | `SlideSyncCard.tsx` |

`synced` badge は `#34C759` 背景に white text を載せており、WCAG AA の観点では弱い。focus ring 漏れは今回解消したが、badge 配色は別タスクで詰める。

### Issue 4: live preview 再撮影は環境依存で block

| 項目   | 内容                    |
| ------ | ----------------------- |
| 深刻度 | 情報                    |
| 分類   | test environment        |
| 対象   | Vite / Electron preview |

`@esbuild/darwin-arm64` と `darwin-x64` の不整合により current worktree では live preview を起動できない。Phase 11 は static fallback capture を採用し、`phase11-capture-metadata.json` に理由を固定した。

## Phase 12 への引き継ぎ

| Issue   | 対応先                                         |
| ------- | ---------------------------------------------- |
| Issue 1 | `UT-SLIDE-IMPL-001`                            |
| Issue 2 | `UT-SLIDE-UI-CLOSE-ERROR-001`                  |
| Issue 3 | `UT-SLIDE-UI-ACCESSIBILITY-001`                |
| Issue 4 | `UT-SLIDE-IMPL-001` に環境再整備条件として記録 |
