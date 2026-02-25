# Phase 8 技術負債更新

## 解消済み

- TD-01: `SkillId` / `SkillName` の未分離（コンパイル時取り違え未検出）。
- TD-02: SkillImportDialog のID判定ロジック重複。

## 未解消

- TD-03: `@repo/shared build` が esbuild 環境不整合で失敗（Host/Binary mismatch）。
- TD-04: 全体カバレッジ閾値（global）未達。影響範囲限定計測の運用見直しが必要。
- TD-05: `as unknown as Skill[]` の既存回避コード（別タスク管理）。

## Phase 9 引き継ぎ

- 品質監査で TD-03/TD-04 を既知制約として評価。
