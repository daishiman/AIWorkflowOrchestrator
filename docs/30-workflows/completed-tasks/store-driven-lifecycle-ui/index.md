# TASK-10A-F: スキルライフサイクルUIのStore駆動統合

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | TASK-10A-F                                 |
| Tier     | 2                                          |
| 優先度   | critical                                   |
| 状態     | pending                                    |
| 作成日   | 2026-03-07                                 |
| 依存元   | TASK-10A-B, TASK-10A-C, TASK-10A-D         |
| 並列可能 | TASK-10A-E                                 |
| ブロック | TASK-10A-G                                 |
| タグ     | frontend, renderer, integration, store, ui |

## 目的

`SkillCreateWizard` と `SkillAnalysisView` の直接 `window.electronAPI` 呼び出しを排除し、`agentSlice` 経由に統一する。作成完了後の一覧同期と分析/改善状態の一貫性を確保し、`TASK-10A-G` の統合テスト基盤を固定する。

## 排除対象（直接IPC呼び出し4箇所）

| #   | ファイル                    | 行  | 呼び出し                                          |
| --- | --------------------------- | --- | ------------------------------------------------- |
| 1   | `SkillCreateWizard.tsx`     | 46  | `window.electronAPI.skill.create({...})`          |
| 2   | `hooks/useSkillAnalysis.ts` | 94  | `window.electronAPI.skill.analyze(skillName)`     |
| 3   | `hooks/useSkillAnalysis.ts` | 140 | `window.electronAPI.skill.applyImprovements(...)` |
| 4   | `hooks/useSkillAnalysis.ts` | 171 | `window.electronAPI.skill.autoImprove(skillName)` |

## 修正対象ファイル

| ファイル                                                                          | 変更内容                          |
| --------------------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | 直接IPC → `useCreateSkill()` 経由 |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`            | 直接IPC → 個別セレクタ経由        |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`             | 作成後一覧同期の確認              |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | テスト更新                        |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` | テスト更新                        |

## Phase一覧

| Phase | 名称                   | 仕様書                                                               | 状態    |
| ----- | ---------------------- | -------------------------------------------------------------------- | ------- |
| 1     | 要件定義               | [phase-1-requirements.md](phase-1-requirements.md)                   | pending |
| 2     | 設計                   | [phase-2-design.md](phase-2-design.md)                               | pending |
| 3     | 設計レビューゲート     | [phase-3-design-review.md](phase-3-design-review.md)                 | pending |
| 4     | テスト作成（TDD: Red） | [phase-4-test-creation.md](phase-4-test-creation.md)                 | pending |
| 5     | 実装（TDD: Green）     | [phase-5-implementation.md](phase-5-implementation.md)               | pending |
| 6     | テスト拡充             | [phase-6-test-expansion.md](phase-6-test-expansion.md)               | pending |
| 7     | カバレッジ確認         | [phase-7-coverage-verification.md](phase-7-coverage-verification.md) | pending |
| 8     | リファクタリング       | [phase-8-refactoring.md](phase-8-refactoring.md)                     | pending |
| 9     | 品質保証               | [phase-9-quality-assurance.md](phase-9-quality-assurance.md)         | pending |
| 10    | 最終レビューゲート     | [phase-10-final-review.md](phase-10-final-review.md)                 | pending |
| 11    | 手動テスト検証         | [phase-11-manual-testing.md](phase-11-manual-testing.md)             | pending |
| 12    | ドキュメント更新       | [phase-12-documentation.md](phase-12-documentation.md)               | pending |
| 13    | PR作成                 | [phase-13-pr-creation.md](phase-13-pr-creation.md)                   | pending |

## Phase間依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
                                                                  ↓
Phase 13 ← Phase 12 ← Phase 11 ← Phase 10 ← Phase 9 ← Phase 8 ←┘
```

- Phase 7でカバレッジ未達の場合、Phase 6へ差戻し
- Phase 3でMAJOR判定の場合、Phase 1または2へ差戻し
- Phase 10でMAJOR/CRITICAL判定の場合、Phase 1-5へ差戻し

## 参照資料（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 使用目的                   |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| 状態管理仕様          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | action/selector責務分離    |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | store駆動UIパターン、S18   |
| UI機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 作成/分析/改善のUI遷移     |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | create/analyze/improve契約 |
| IPC API仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャネル責務境界           |
| エラー仕様            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーステート定義         |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト・品質ゲート基準     |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender/P42/境界検証        |
| 仕様クイック参照      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | 実装時に参照する要点抽出   |
| 仕様リソースマップ    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 必要仕様の探索漏れ防止     |
| 抽出網羅マトリクス    | `outputs/requirements-coverage-matrix.md`                                                   | 必要仕様抽出の充足証跡     |

## 親タスク仕様書

[task-044-task-10a-f-store-driven-lifecycle-ui.md](../skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-044-task-10a-f-store-driven-lifecycle-ui.md)
