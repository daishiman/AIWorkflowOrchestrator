# Phase 12: 未タスク検出レポート - UT-SKILL-WIZARD-W2-seq-03a

## メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | UT-SKILL-WIZARD-W2-seq-03a |
| 作成日   | 2026-04-11                 |

---

## 検出結果

未タスク件数: **1件**

| #   | タスクID                                  | タスク名                                                     | 優先度 | 規模   |
| --- | ----------------------------------------- | ------------------------------------------------------------ | ------ | ------ |
| 1   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 | SkillCreateWizard LLM生成フロー describe.skip クリーンアップ | 低     | 小規模 |

### 検出詳細

**UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001**

- **発見箇所**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` 行 144（`describe.skip`）
- **発見根拠**: W2-seq-03a で `generationMode` ラジオボタン UI を削除したことにより、旧 TASK-SC-07 の `planSkill`/`executePlan` フローに対する 30 テストが `describe.skip` でスキップ状態になっている。TODO コメントが明示的に本タスクの必要性を記録している。
- **仕様書パス**: `docs/30-workflows/unassigned-task/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001.md`
- **影響**: CI には現時点で影響なし。将来 `describe.skip` が外れた場合に 30 テストが一斉失敗するリスクあり。

## スコープ外として識別した項目

| 項目                                                   | 判断理由                  |
| ------------------------------------------------------ | ------------------------- |
| `wizard/index.ts` の `GenerationMode` エクスポート削除 | W2-seq-03b の担当スコープ |
| `W3-seq-04` 計装タスクの実装                           | 別タスク（ready 状態）    |
