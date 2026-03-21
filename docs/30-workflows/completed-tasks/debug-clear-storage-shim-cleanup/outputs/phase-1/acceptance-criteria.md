# Phase 1: 受入基準 確定版

## 受入基準（AC-1〜AC-7）

| ID   | 基準                                                                                | 検証方法                                               |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| AC-1 | `rg "debug-clear-storage"` の全検出箇所が分類済み                                   | 棚卸し結果レビュー（inventory-result.md で完了）       |
| AC-2 | 不要な workaround / stale comment が削除または降格済み                              | `rg` 再実行 + diff レビュー                            |
| AC-3 | e2e global-setup / screenshot script が現行前提で正常動作                           | テスト実行 + コードレビュー                            |
| AC-4 | `verify-unassigned-links.js` が PASS                                                | `node scripts/verify-unassigned-links.js` 実行         |
| AC-5 | `audit-unassigned-tasks --target-file` で `currentViolations=0`                     | `node scripts/audit-unassigned-tasks.js --target-file` |
| AC-6 | task-workflow backlog/history・lessons learned・関連 product/system spec が同期済み | Phase 12 で更新、diff レビュー                         |
| AC-7 | 全既存テストが PASS                                                                 | `cd apps/desktop && pnpm vitest run`                   |

## 対処方針まとめ

### 削除対象（27件）

- A-1, A-2: e2e global-setup の stale comment + 不要 preflight
- B-1〜B-23: screenshot scripts の `sessionStorage.setItem("debug-clear-storage", "done")` 行
- C-1: phase11-agentview-improve-route.tsx の不要 preflight

### 降格対象（7件）

- D-1: clear-storage.md の方法2説明
- F-1〜F-6: .claude/skills/ 内の記述

### 維持対象（4件）

- E-1: App.debug-removal.test.tsx（親タスクのテスト、debug-clear-storage が存在しないことを検証するテスト自体は有用）
- H-1〜H-3: screenshot harness の localStorage.clear()（debug-clear-storage とは独立）
- H-5: customStorage.test.ts の beforeEach 内 localStorage.clear()（テスト用途）
