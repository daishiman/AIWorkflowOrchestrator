# Phase 8: リファクタリング

## 目的

冗長・重複・旧前提を削り、spec を最小複雑性へ寄せる。

## リファクタリング判断テーブル【必須】

| 対象      | Before                       | After                              | 理由                       |
| --------- | ---------------------------- | ---------------------------------- | -------------------------- |
| 実装前提  | `finally + createdByThisRun` | `catch + cleanupCancelledSkillDir` | 実コード実態へ合わせる     |
| task 分類 | docs-only 混在               | NON_VISUAL code task               | Phase 11/12 規約へ合わせる |
| 成果物名  | `report` / `result` 混在     | canonical 名へ統一                 | 参照切れ防止               |

## 成果物

| 成果物                | パス                                       |
| --------------------- | ------------------------------------------ |
| refactor decision log | `outputs/phase-8/refactor-decision-log.md` |

## 完了条件

- [ ] Before / After / 理由 が記録されている
- [ ] 冗長説明を削減している
