# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 7                                                                 |
| Phase名    | カバレッジ確認                                                    |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 6: テスト拡充                                               |
| 次Phase    | Phase 8: リファクタリング                                         |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

テンプレート改修が全ての受入条件（AC-1〜AC-5）と全テストケース（TC-01〜TC-11）をカバーしているかを確認する。docs-only タスクのため、コードカバレッジではなく「変更網羅率」として確認する。

## 実行タスク

### Task 7-1: AC カバレッジマトリクスの確認

| AC   | テストケース        | 実装での対応箇所                                         | 達成状況 |
| ---- | ------------------- | -------------------------------------------------------- | -------- |
| AC-1 | TC-01, TC-04        | `phase-spec-template.md` Task/Step 分離ガイドライン追加  | -        |
| AC-2 | TC-02, TC-09        | Phase 11 docs-only evidence ルール追記                   | -        |
| AC-3 | TC-01, TC-03, TC-10 | Phase 12 テンプレートへの「実行タスク」/「検証ログ」分離 | -        |
| AC-4 | TC-05, TC-08        | Handlebars 条件分岐の追加                                | -        |
| AC-5 | TC-06, TC-11        | 既存仕様書との互換性確認                                 | -        |

**カバレッジ基準**: 全 AC が少なくとも 1 つのテストケースでカバーされること

### Task 7-2: 変更漏れの確認

以下のチェックで変更漏れがないことを確認する。

```bash
# phase-spec-template.md の変更内容確認
git diff .claude/skills/task-specification-creator/assets/phase-spec-template.md | grep "^+" | head -50

# Task/Step 分離ガイドラインの追加確認
grep -n "Task/Step\|実行タスク.*計画\|検証ログ.*current" \
  .claude/skills/task-specification-creator/assets/phase-spec-template.md

# docs-only Phase 11 evidence の確認
grep -n "manual-test-checklist.md\|TC-ID ↔ evidence\|screenshot-plan.json.*生成しない" \
  .claude/skills/task-specification-creator/assets/phase-spec-template.md

# Phase 12 root evidence / spec_created の確認
grep -n "phase12-task-spec-compliance-check.md\|spec_created" \
  .claude/skills/task-specification-creator/assets/phase-spec-template.md

# unassigned-task-template.md の苦戦箇所欄確認
grep -n "苦戦箇所\|記入必須" \
  .claude/skills/task-specification-creator/assets/unassigned-task-template.md
```

### Task 7-3: 未カバー箇所の記録

カバーされていない AC またはテストケースがある場合、以下を記録する:

- 未カバーの原因
- 追加テストケースの追加（Phase 6 の成果物に追記）または許容判断

## 成果物

| 成果物             | パス                                 | 説明                                |
| ------------------ | ------------------------------------ | ----------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC カバレッジマトリクス・変更網羅率 |

## 参照資料

| 資料名               | パス                                |
| -------------------- | ----------------------------------- |
| Phase 6 テスト拡充   | `outputs/phase-6/test-expansion.md` |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`     |

## 統合テスト連携

- Phase 8 のリファクタリングで本カバレッジの漏れがないことを前提にする。
- Phase 9 以降の品質確認では、AC-1〜AC-5 が各テストケースに紐付いていることを再利用する。

## 完了条件

- [ ] 全 AC（AC-1〜AC-5）が少なくとも 1 つのテストケースでカバーされている
- [ ] 変更漏れがないことが確認されている
- [ ] 未カバー箇所がある場合、原因と対応が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
