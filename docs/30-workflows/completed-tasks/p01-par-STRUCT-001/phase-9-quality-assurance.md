# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 9                            |
| Phase名    | 品質保証                     |
| 対象機能   | TASK-SW-STRUCT-001           |
| 前提Phase  | Phase 8: リファクタリング    |
| 次Phase    | Phase 10: 最終レビューゲート |
| ステータス | 未実施                       |
| 作成日     | 2026-04-15                   |

## 目的

lint / typecheck / test の品質ゲートを全て通過していることを確認する。
Phase 10（最終レビューゲート）への進行可否を判断する。

## 実行タスク

### Task 1: lint 実行

```bash
pnpm --filter @repo/desktop lint
```

期待結果: 0 エラー

### Task 2: typecheck 実行

```bash
pnpm --filter @repo/desktop typecheck
```

期待結果: 0 エラー

### Task 3: テスト全件実行

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

期待結果: 全テスト Green（TC-01〜TC-08、TC-R01〜TC-R02 を含む）

### Task 4: 品質ゲート判定

| ゲート    | コマンド                                | 期待結果 | 実測結果 |
| --------- | --------------------------------------- | -------- | -------- |
| lint      | `pnpm --filter @repo/desktop lint`      | 0 エラー | TBD      |
| typecheck | `pnpm --filter @repo/desktop typecheck` | 0 エラー | TBD      |
| test      | `pnpm --filter @repo/desktop test`      | 全 Green | TBD      |

全ゲートが通過した場合のみ Phase 10 へ進む。
いずれかが失敗した場合は該当 Phase へ戻り修正する。

## 統合テスト連携

- ユニットテストの全件実行結果を品質ゲートとして記録する
- IPC/Preload 層への変更がないため統合テストの再実行は不要

## 参照資料

- `outputs/phase-8/TASK-SW-STRUCT-001-refactoring-record.md` — 実装の current facts
- `outputs/phase-7/TASK-SW-STRUCT-001-coverage-report.md` — カバレッジ確認結果
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — current facts の正本

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-SW-STRUCT-001 の current facts と state 同期                |
| arch-electron-services-details-part1 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part1.md` | `SkillCreatorService` と `StructurePlanJson` の current contract |
| lessons-learned-current-2026-04      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`      | create workflow の責務分離に関する current lessons               |

## 成果物

| 成果物                               | パス                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| TASK-SW-STRUCT-001-quality-report.md | `outputs/phase-9/TASK-SW-STRUCT-001-quality-report.md` |

## 完了条件

- [ ] lint が 0 エラーで通過している
- [ ] typecheck が 0 エラーで通過している
- [ ] 全テストが Green である
- [ ] 品質ゲート判定テーブルが埋まっている

## タスク100%実行確認【必須】

- [ ] Task 1（lint 実行）を100%実行した
- [ ] Task 2（typecheck 実行）を100%実行した
- [ ] Task 3（テスト全件実行）を100%実行した
- [ ] Task 4（品質ゲート判定）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-001-quality-report.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 10: 最終レビューゲート](./phase-10-final-review.md)
