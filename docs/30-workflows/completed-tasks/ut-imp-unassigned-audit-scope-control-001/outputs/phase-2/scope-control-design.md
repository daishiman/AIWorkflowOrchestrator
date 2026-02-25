# Phase 2 設計書（scope control）

## SubAgent設計成果

| SubAgent   | 担当             | 結果                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------ |
| SubAgent-A | CLI設計          | `--target-file`, `--diff-from`, 入力検証・未知オプションエラー設計 |
| SubAgent-B | 分類ロジック設計 | full/scoped の2モード + current/baseline 分類定義                  |
| Lead       | 統合設計         | 互換性・JSON拡張・exit code を統合                                 |

## フロー

`all violations` → `scope判定` → `currentViolations` / `baselineViolations` → `exit code決定`

## truth table

| mode   | current違反 | baseline違反 | exit code |
| ------ | ----------- | ------------ | --------- |
| full   | >0          | 任意         | 1         |
| full   | 0           | 0            | 0         |
| scoped | >0          | 任意         | 1         |
| scoped | 0           | >0           | 0         |
| scoped | 0           | 0            | 0         |

## 互換性

- 既存フィールドは維持。
- 新規フィールドは追加のみ（破壊的変更なし）。
