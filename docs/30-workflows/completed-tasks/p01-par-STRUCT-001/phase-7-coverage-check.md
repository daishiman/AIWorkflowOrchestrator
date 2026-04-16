# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 対象機能   | TASK-SW-STRUCT-001        |
| 前提Phase  | Phase 6: テスト拡充       |
| 次Phase    | Phase 8: リファクタリング |
| ステータス | 未実施                    |
| 作成日     | 2026-04-15                |

## 目的

Phase 6 で追加したテストを含め、`runCreateWorkflow` の修正箇所に対するカバレッジが
目標基準を満たしていることを確認する。未カバー分岐があれば Phase 6 に戻ってテストを追加する。

## 実行タスク

### Task 1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --coverage
```

### Task 2: AC 対応表確認

| AC   | 対応テスト     | カバレッジ状態 |
| ---- | -------------- | -------------- |
| AC-1 | TC-01, TC-05   | TBD            |
| AC-2 | TC-02, TC-06   | TBD            |
| AC-3 | TC-03          | TBD            |
| AC-4 | TC-04          | TBD            |
| AC-5 | TC-R01, TC-R02 | TBD            |

### Task 3: branch coverage 確認

`runCreateWorkflow` の `try/catch` 分岐:

- `try` 分岐（正常系）: TC-01〜TC-08 でカバー
- `catch` 分岐（フォールバック）: TC-04 でカバー

### Task 4: カバレッジ目標達成確認

| 指標              | 最低基準 | 推奨基準 | 実測値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | TBD    |
| Branch Coverage   | 60%      | 70%      | TBD    |
| Function Coverage | 80%      | 90%      | TBD    |

目標未達の場合は Phase 6 に戻りテストを追加する。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-SW-STRUCT-001 の current facts と state 同期                               |
| arch-electron-services-details-part1 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part1.md` | SkillCreatorService / StructurePlanJson / generateSkillMd() の current contract |
| lessons-learned-current-2026-04      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`      | create workflow の責務分離に関する current lessons                              |

- `outputs/phase-6/TASK-SW-STRUCT-001-extended-test-record.md` — テストケース一覧

## 統合テスト連携

- ユニットテストのカバレッジを確認する
- 統合テストのカバレッジは `createSkill()` と `generateSkillMd()` の current facts のスコープで確認する

## 成果物

| 成果物                                | パス                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| TASK-SW-STRUCT-001-coverage-report.md | `outputs/phase-7/TASK-SW-STRUCT-001-coverage-report.md` |

## 完了条件

- [ ] カバレッジ測定コマンドを実行した
- [ ] AC 対応表が全件埋まっている
- [ ] branch coverage が最低基準（60%）以上である
- [ ] 目標未達の場合は Phase 6 へ戻る判断を記録している

## タスク100%実行確認【必須】

- [ ] Task 1（カバレッジ測定）を100%実行した
- [ ] Task 2（AC 対応表確認）を100%実行した
- [ ] Task 3（branch coverage 確認）を100%実行した
- [ ] Task 4（カバレッジ目標達成確認）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-001-coverage-report.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
