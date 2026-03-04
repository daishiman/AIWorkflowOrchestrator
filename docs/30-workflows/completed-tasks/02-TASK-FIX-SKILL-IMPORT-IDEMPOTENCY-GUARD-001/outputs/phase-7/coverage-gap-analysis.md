# Phase 7 カバレッジギャップ分析

## 現状

- 修正箇所の直接ケースはテスト追加済み。

## 残ギャップ

- MainとRendererの冪等判定条件が将来ずれると重複挿入リスクが再発する
- importedSkills比較がname基準のため将来的にid基準へ統一検討が必要
- UI Hook（`useSkillCenter`）とStore（`agentSlice.importSkill`）で重複ガード条件が乖離すると、不要アニメーション再発の余地がある

## 対応方針

- 次回関連変更時に同種入力境界のケースを水平展開する。
- `useSkillCenter` と `agentSlice` の重複判定ロジックを同時変更・同時テスト更新する運用ルールを適用する。
