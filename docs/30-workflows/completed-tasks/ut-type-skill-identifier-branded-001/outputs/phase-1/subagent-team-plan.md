# Phase 1 SubAgent責務表

## チーム編成

- Lead（統合担当）
- SubAgent-A（型要件担当）
- SubAgent-B（UI/Store境界担当）
- SubAgent-C（IPC契約担当）

## 並列実行計画

- SubAgent-A（並列）
  - Branded Type定義方針（Brand実装方式、互換性方針）
  - `Skill` / `SkillMetadata` / `ImportedSkill` への適用影響評価
- SubAgent-B（並列）
  - `SkillImportDialog` / `AgentView` / `agentSlice` の境界点抽出
  - `selectedIds` と `onImport` の型責務分離案
- SubAgent-C（並列）
  - `skill:import` / `skill:remove` 契約型の適用案
  - sender検証・バリデーション維持要件の確認

## 直列統合（Lead）

1. 3系統の要件を単一の受け入れ基準に統合。
2. 依存タスクとの境界（P45命名統一、UT-FIX-5-1-001）を除外スコープに固定。
3. Phase 2 に渡す設計入力（型定義、変換境界、テスト観点）を確定。

## 引き継ぎ事項（Phase 2）

- `SkillId` / `SkillName` の公開場所は `packages/shared/src/types/skill.ts`。
- 文字列互換性を維持しつつID/Name相互代入は型エラー化する。
- 実装順序は `shared -> renderer/store -> preload/main -> tests`。
