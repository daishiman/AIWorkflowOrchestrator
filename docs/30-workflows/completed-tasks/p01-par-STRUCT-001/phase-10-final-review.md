# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 10                   |
| Phase名    | 最終レビューゲート   |
| 対象機能   | TASK-SW-STRUCT-001   |
| 前提Phase  | Phase 9: 品質保証    |
| 次Phase    | Phase 11: 手動テスト |
| ステータス | 未実施               |
| 作成日     | 2026-04-15           |

## 目的

AC・依存関係・品質ゲート・技術的負債の4条件が全て満たされていることを最終確認し、
Phase 11（手動テスト）への進行可否を判断する。

## 実行タスク

### Task 1: AC 最終確認

| AC   | 条件                                                                                                | 達成状態 |
| ---- | --------------------------------------------------------------------------------------------------- | -------- |
| AC-1 | `structurePlan.purpose` に `options.description` が設定される（エージェントプロンプト文字列でない） | TBD      |
| AC-2 | `structurePlan.agents` に `["extract-purpose", "plan-structure"]` が設定される                      | TBD      |
| AC-3 | `structurePlan.features` が空配列で維持されている                                                   | TBD      |
| AC-4 | `runCreateWorkflow` の内部エラーが発生した場合でも `createSkill()` は成功する                       | TBD      |
| AC-5 | `collaborative` モードの既存テストが全てパスし続ける                                                | TBD      |

### Task 2: 依存関係確認

| 確認項目                                                               | 状態 |
| ---------------------------------------------------------------------- | ---- |
| `generateSkillMd()` の前提条件として本タスクの成果物が提供されているか | TBD  |
| `StructurePlanJson` の内容が current facts と整合しているか            | TBD  |
| `createSkill()` の外部 API 契約に破壊的変更がないか                    | TBD  |

### Task 3: 品質ゲート再確認

| ゲート    | 状態 |
| --------- | ---- |
| lint      | TBD  |
| typecheck | TBD  |
| test      | TBD  |

### Task 4: 技術的負債の最終確認

Phase 8 で記録した技術的負債（TD-001〜TD-003）が適切に記録・追跡されていることを確認する。

### Task 5: ゲート判定

PASS / MINOR / MAJOR の判定を下す。

- **PASS**: 全 AC 達成・品質ゲート通過・依存関係整合 → Phase 11 へ進む
- **MINOR**: 軽微な指摘あり → Phase 11 進行可だが MINOR を記録する
- **MAJOR**: 重大な問題あり → 該当 Phase へ差し戻す

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-SW-STRUCT-001 の current facts と state 同期                               |
| arch-electron-services-details-part1 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part1.md` | SkillCreatorService / StructurePlanJson / generateSkillMd() の current contract |
| lessons-learned-current-2026-04      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`      | create workflow の責務分離に関する current lessons                              |

- `outputs/phase-9/TASK-SW-STRUCT-001-quality-report.md` — 品質ゲート結果
- `outputs/phase-8/TASK-SW-STRUCT-001-refactoring-record.md` — 技術的負債記録

## 統合テスト連携

- Phase 9 の品質ゲート結果を最終レビューで確認する
- `generateSkillMd()` との接続整合性を確認する

## 成果物

| 成果物                                    | パス                                                         |
| ----------------------------------------- | ------------------------------------------------------------ |
| TASK-SW-STRUCT-001-final-review-result.md | `outputs/phase-10/TASK-SW-STRUCT-001-final-review-result.md` |

## 完了条件

- [ ] 全 AC（AC-1〜AC-5）が達成されていることを確認した
- [ ] 依存関係確認が完了している
- [ ] 品質ゲート再確認が完了している
- [ ] 技術的負債の最終確認が完了している
- [ ] ゲート判定（PASS / MINOR / MAJOR）が下されている

## タスク100%実行確認【必須】

- [ ] Task 1（AC 最終確認）を100%実行した
- [ ] Task 2（依存関係確認）を100%実行した
- [ ] Task 3（品質ゲート再確認）を100%実行した
- [ ] Task 4（技術的負債の最終確認）を100%実行した
- [ ] Task 5（ゲート判定）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-001-final-review-result.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 11: 手動テスト](./phase-11-manual-test.md)
