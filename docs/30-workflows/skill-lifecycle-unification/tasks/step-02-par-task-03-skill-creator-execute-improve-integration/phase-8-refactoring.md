# Phase 8: リファクタリング - タスク仕様書

## 目的

統合後に残る二重 facade、古い wizard 依存、過剰な委譲分岐を整理する。

## 対象

- `skill.create` と `skillCreatorAPI` の重複
- wizard 内ロジックの残存
- internal delegate 条件分岐の過密化

## 完了条件

- [ ] 統合後の責務が 1 箇所に集約されている
