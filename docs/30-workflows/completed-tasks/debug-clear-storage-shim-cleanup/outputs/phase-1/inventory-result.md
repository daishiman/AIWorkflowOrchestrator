# Phase 1: 棚卸し結果 - debug-clear-storage 残骸一覧

## P50チェック結果

| 判定   | 条件                                              |
| ------ | ------------------------------------------------- |
| 未実装 | `debug-clear-storage` 残骸が apps/ 配下に多数検出 |

App.tsx 本体のデバッグコードは `c7fd2b57f` (PR #1119) で削除済みだが、repo-wide の残骸は未対処。

## 検出箇所一覧

### カテゴリ A: e2e global-setup（test helper）

| #   | ファイルパス                       | 行番号 | コンテキスト                                                   | 用途推定                                                |
| --- | ---------------------------------- | ------ | -------------------------------------------------------------- | ------------------------------------------------------- |
| A-1 | `apps/desktop/e2e/global-setup.ts` | L30    | コメント: `debug-clear-storage reload と競合しないよう`        | stale comment（App.tsx 側は削除済み）                   |
| A-2 | `apps/desktop/e2e/global-setup.ts` | L86    | `window.sessionStorage.setItem("debug-clear-storage", "done")` | 不要な preflight（App.tsx 側の debug コードは削除済み） |

### カテゴリ B: screenshot scripts（test helper）

| #    | ファイルパス                                                        | 行番号 | コンテキスト                                                 | 用途推定                           |
| ---- | ------------------------------------------------------------------- | ------ | ------------------------------------------------------------ | ---------------------------------- |
| B-1  | `scripts/capture-task-058e-notification-center-phase11.mjs`         | L57    | `sessionStorage.setItem("debug-clear-storage", "done")`      | 不要な preflight                   |
| B-2  | `scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | L237   | `window.sessionStorage.setItem(...)`                         | 不要な preflight                   |
| B-3  | `scripts/capture-task-056c-phase11-screenshots.mjs`                 | L23    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-4  | `scripts/capture-ipc-graceful-degradation-phase11.mjs`              | L97    | `window.sessionStorage.setItem(...)`                         | 不要な preflight                   |
| B-5  | `scripts/capture-ui-design-foundation-phase11.mjs`                  | L89    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-6  | `scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs`   | L89    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-7  | `scripts/capture-task-fix-safeinvoke-timeout-phase11.mjs`           | L196   | `window.sessionStorage.setItem(...)`                         | 不要な preflight                   |
| B-8  | `scripts/capture-auth-mode-contract-alignment-phase11.mjs`          | L167   | `window.sessionStorage.setItem(...)`                         | 不要な preflight                   |
| B-9  | `scripts/capture-skill-center-phase11.mjs`                          | L104   | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-10 | `scripts/capture-task-056e-integration-gate-screenshots.mjs`        | L163   | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-11 | `scripts/capture-task-057-phase11-screenshots.mjs`                  | L64    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-12 | `scripts/capture-organisms-components-screenshots.mjs`              | L89    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-13 | `scripts/capture-task-authguard-timeout-phase11.mjs`                | L196   | `window.sessionStorage.setItem(...)`                         | 不要な preflight                   |
| B-14 | `scripts/capture-task-ipc-layer-integrity-fix-phase11.mjs`          | L81    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-15 | `scripts/capture-skill-create-wizard-screenshots.mjs`               | L158   | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-16 | `scripts/capture-task-09-settings-preload-iterable-phase11.mjs`     | L93    | `window.localStorage.setItem('debug-clear-storage', 'done')` | 不要な preflight（localStorage版） |
| B-17 | `scripts/capture-task-10a-g-phase11-screenshots.mjs`                | L64    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-18 | `scripts/capture-electron-sandbox-iterable-phase11.mjs`             | L174   | `window.sessionStorage.setItem(...)`                         | 不要な preflight                   |
| B-19 | `scripts/capture-task-11-supabase-fallback-phase11.mjs`             | L201   | `window.sessionStorage.setItem(...)`                         | 不要な preflight                   |
| B-20 | `scripts/capture-task-skill-lifecycle-routing-step02-phase11.mjs`   | L89    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-21 | `scripts/capture-task-056-phase11-screenshots.mjs`                  | L69    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-22 | `scripts/capture-task-056c-notification-history-screenshots.mjs`    | L133   | `sessionStorage.setItem(...)`                                | 不要な preflight                   |
| B-23 | `scripts/capture-task-skill-lifecycle-01-phase11.mjs`               | L77    | `sessionStorage.setItem(...)`                                | 不要な preflight                   |

### カテゴリ C: Renderer ソースコード

| #   | ファイルパス                                       | 行番号 | コンテキスト                                            | 用途推定                                     |
| --- | -------------------------------------------------- | ------ | ------------------------------------------------------- | -------------------------------------------- |
| C-1 | `src/renderer/phase11-agentview-improve-route.tsx` | L178   | `sessionStorage.setItem("debug-clear-storage", "done")` | Phase11 テスト用 harness（不要な preflight） |

### カテゴリ D: 開発ドキュメント

| #   | ファイルパス                                     | 行番号 | コンテキスト                      | 用途推定                   |
| --- | ------------------------------------------------ | ------ | --------------------------------- | -------------------------- |
| D-1 | `apps/desktop/docs/development/clear-storage.md` | L34,38 | 方法2: コードから強制クリアの説明 | historical doc（降格対象） |

### カテゴリ E: テストファイル（維持）

| #   | ファイルパス                                        | 行番号     | コンテキスト                         | 用途推定                 |
| --- | --------------------------------------------------- | ---------- | ------------------------------------ | ------------------------ |
| E-1 | `src/renderer/__tests__/App.debug-removal.test.tsx` | L8,218,223 | TC-3: debug-clear-storage 参照テスト | 維持（親タスクのテスト） |

### カテゴリ F: .claude/skills/ 内の記述

| #   | ファイルパス                                                            | コンテキスト   | 用途推定                   |
| --- | ----------------------------------------------------------------------- | -------------- | -------------------------- |
| F-1 | `references/task-workflow-completed-skill-lifecycle-authfix.md`         | 完了タスク記録 | historical doc             |
| F-2 | `references/task-workflow-completed-chat-lifecycle-tests.md`            | 完了タスク記録 | historical doc             |
| F-3 | `references/task-workflow-backlog.md`                                   | バックログ     | historical doc（降格対象） |
| F-4 | `references/lessons-learned-ui-agent-view-nav-notification-history.md`  | 教訓集         | historical doc             |
| F-5 | `references/lessons-learned-skill-contrast-guard-lifecycle-followup.md` | 教訓集         | historical doc             |
| F-6 | `SKILL.md`                                                              | スキル定義     | historical doc（降格対象） |

### カテゴリ G: docs/30-workflows/ 内（本タスク自身 + 親タスク）

本タスク自身の仕様書と親タスクの成果物: **除外対象**（スキャン対象外）

### カテゴリ H: localStorage.clear() 検出箇所

| #   | ファイルパス                                                 | 行番号 | コンテキスト                         | 用途推定                                        |
| --- | ------------------------------------------------------------ | ------ | ------------------------------------ | ----------------------------------------------- |
| H-1 | `scripts/capture-task-058b-workspace-layout-phase11.mjs`     | L272   | `window.localStorage.clear()`        | screenshot harness のクリーンアップ（維持検討） |
| H-2 | `scripts/capture-task-ai-runtime-chat-edit-phase11.mjs`      | L256   | `window.localStorage.clear()`        | screenshot harness のクリーンアップ（維持検討） |
| H-3 | `scripts/capture-task-059a-workspace-chat-panel-phase11.mjs` | L327   | `window.localStorage.clear()`        | screenshot harness のクリーンアップ（維持検討） |
| H-4 | `apps/desktop/docs/development/clear-storage.md`             | L37    | `localStorage.clear()`               | 開発ドキュメント（D-1 と同一ファイル）          |
| H-5 | `src/renderer/store/__tests__/customStorage.test.ts`         | L27    | `localStorage.clear()` in beforeEach | テストヘルパー（正当使用: 維持）                |
| H-6 | `src/renderer/__tests__/App.debug-removal.test.tsx`          | L204   | TC-1 テスト                          | テスト（正当使用: 維持）                        |

## 分類サマリー

| カテゴリ                | 件数 | 対処方針                                                                          |
| ----------------------- | ---- | --------------------------------------------------------------------------------- |
| A: e2e global-setup     | 2    | 削除（stale comment + 不要 preflight）                                            |
| B: screenshot scripts   | 23   | 削除（`sessionStorage.setItem("debug-clear-storage", ...)` 行のみ）               |
| C: Renderer ソース      | 1    | 削除                                                                              |
| D: 開発ドキュメント     | 1    | historical note に降格                                                            |
| E: テストファイル       | 1    | 維持（親タスクのテスト）                                                          |
| F: .claude/skills/      | 6    | historical note に降格（記述更新）                                                |
| G: 本タスク仕様書       | -    | 除外                                                                              |
| H: localStorage.clear() | 6    | H-1〜H-3: 維持（screenshot harness用）、H-4: D-1と同一、H-5/H-6: 維持（テスト用） |
