# Phase 2: 変更計画書

## 変更計画テーブル

### Group 1: e2e global-setup（優先度: 高）

| #   | ファイルパス                       | 行範囲 | カテゴリ       | 対処 | 変更内容                                                                                               | 依存関係      |
| --- | ---------------------------------- | ------ | -------------- | ---- | ------------------------------------------------------------------------------------------------------ | ------------- |
| 1   | `apps/desktop/e2e/global-setup.ts` | L30    | stale comment  | 削除 | `// NOTE: App.tsx の debug-clear-storage reload と競合しないよう sessionStorage を事前設定する` を削除 | なし          |
| 2   | `apps/desktop/e2e/global-setup.ts` | L86    | 不要 preflight | 削除 | `window.sessionStorage.setItem("debug-clear-storage", "done");` を削除                                 | #1 と同時実施 |

### Group 2: screenshot scripts（優先度: 中、一括処理）

| #    | ファイルパス             | 対処 | 変更内容                                                                                                                                                                                                     | 依存関係               |
| ---- | ------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 3-25 | B-1〜B-23 の 23 ファイル | 削除 | `sessionStorage.setItem("debug-clear-storage", "done")` または `window.sessionStorage.setItem("debug-clear-storage", "done")` または `window.localStorage.setItem('debug-clear-storage', 'done')` の行を削除 | なし（各ファイル独立） |

### Group 3: Renderer ソース（優先度: 中）

| #   | ファイルパス                                       | 行範囲 | カテゴリ       | 対処 | 変更内容                                                        | 依存関係 |
| --- | -------------------------------------------------- | ------ | -------------- | ---- | --------------------------------------------------------------- | -------- |
| 26  | `src/renderer/phase11-agentview-improve-route.tsx` | L178   | 不要 preflight | 削除 | `sessionStorage.setItem("debug-clear-storage", "done");` を削除 | なし     |

### Group 4: 開発ドキュメント降格（優先度: 低）

| #   | ファイルパス                                     | 行範囲 | カテゴリ       | 対処 | 変更内容                                                | 依存関係 |
| --- | ------------------------------------------------ | ------ | -------------- | ---- | ------------------------------------------------------- | -------- |
| 27  | `apps/desktop/docs/development/clear-storage.md` | L26-48 | historical doc | 降格 | 方法2 セクションに Historical Note プレフィックスを追加 | なし     |

### Group 5: .claude/skills/ 内記述降格（優先度: 低）

| #     | ファイルパス | カテゴリ       | 対処 | 変更内容                                                                                        | 依存関係 |
| ----- | ------------ | -------------- | ---- | ----------------------------------------------------------------------------------------------- | -------- |
| 28-33 | F-1〜F-6     | historical doc | 降格 | `debug-clear-storage` 参照箇所に `[解決済み: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001]` を付記 | なし     |

## 変更実行順序

1. Group 1: e2e global-setup（テストの前提に影響するため最初）
2. Group 2: screenshot scripts（大量だが各ファイル独立、一括処理可能）
3. Group 3: Renderer ソース
4. Group 4: 開発ドキュメント降格
5. Group 5: .claude/skills/ 内記述降格

## 維持対象（変更なし）

- E-1: `App.debug-removal.test.tsx` - 親タスクのテスト。`debug-clear-storage` が App.tsx に存在しないことを検証するテスト自体は有用
- H-1〜H-3: screenshot harness の `localStorage.clear()` - debug-clear-storage とは独立した harness cleanup
- H-5: `customStorage.test.ts` の `localStorage.clear()` - テスト用 beforeEach
