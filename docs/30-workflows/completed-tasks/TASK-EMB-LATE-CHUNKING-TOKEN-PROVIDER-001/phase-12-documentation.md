# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目                | 内容                                                 |
| ------------------- | ---------------------------------------------------- |
| Phase               | 12                                                   |
| タスクID            | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001            |
| タスク名            | Late Chunking トークンレベル隠れ状態プロバイダー実装 |
| タスク種別          | NON_VISUAL code task                                 |
| implementation_mode | new                                                  |
| ステータス          | completed                                            |
| 作成日              | 2026-04-20                                           |
| 前Phase             | 11: 手動テスト                                       |
| 次Phase             | 13: PR 作成                                          |

---

## 目的

Late Chunking トークンレベル隠れ状態プロバイダーの実装結果を、
`task-specification-creator` と `aiworkflow-requirements` の正本運用フローに沿ってドキュメントへ同期する。
本 Phase の正本は `outputs/phase-12/` 配下の成果物群であり、将来表現を残さず、更新有無と判断根拠を明記する。

---

## 実行タスク

### Task 12-1: 実装ガイド作成

**成果物**: `outputs/phase-12/implementation-guide.md`

- Part 1: 中学生レベルの概念説明
- Part 2: 型、シグネチャ、使用例、エラー、エッジケース
- `## 視覚証跡` に次を固定で書く

```md
UI/UX変更なしのため Phase 11 スクリーンショット不要
```

### Task 12-2: system spec update summary

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

- Step 1-A: 完了記録対象を列挙する
- Step 1-B: 実装状況更新の要否を記録する
- Step 1-C: 関連 task / unassigned task の同期要否を記録する
- Step 1-D: `topic-map.md` / `keywords.json` 再生成要否を記録する
- Step 1-E: `.claude` / `.agents` mirror 影響範囲を記録する
- Step 1-F: `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の更新要否を記録する
- Step 1-G: 検証コマンド結果を要約する
- Step 2: interface / type 追加に伴う system spec 更新要否を、対象ファイルと理由付きで記録する

### Task 12-3: documentation changelog

**成果物**: `outputs/phase-12/documentation-changelog.md`

- 更新ファイル一覧
- validator / verify 結果
- current / baseline の区別

### Task 12-4: unassigned task detection

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

- 0 件でも出力する
- 後続 task との境界を明記する

### Task 12-5: skill feedback report

**成果物**: `outputs/phase-12/skill-feedback-report.md`

- 改善点がなくても理由を書く

### Task 12-6: task spec 準拠チェック

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- Task 12-1〜12-5 の完了確認
- `index.md` / `artifacts.json` / `outputs/artifacts.json` の整合確認
- validator / verify 実測値の記録
- 将来表現チェックの実測結果を `outputs/phase-12/phase12-task-spec-compliance-check.md` に記録する

## 参照資料

| 参照資料                 | パス                                                                                   | 内容                                 |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 12 テンプレート    | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`       | mandatory 6 tasks の正本             |
| Phase 12 ガイド          | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | NON_VISUAL close-out と canonical 名 |
| system spec 更新フロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2 の正本               |
| 仕様記述ガイド           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                 | 命名・記述ルール                     |
| Phase 2 設計             | `outputs/phase-2/design.md`                                                            | 契約要約                             |
| Phase 5 実装             | `outputs/phase-5/implementation-notes.md`                                              | 実装差分                             |
| Phase 6 テスト拡充       | `outputs/phase-6/test-expansion-result.md`                                             | 追加検証                             |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md`                                                   | 分岐網羅                             |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-summary.md`                                               | 整理結果                             |
| Phase 9 品質保証         | `outputs/phase-9/quality-gate-report.md`                                               | quality gate                         |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-result.md`                                              | 最終判定                             |
| Phase 11 手動テスト      | `outputs/phase-11/manual-test-result.md`                                               | primary evidence                     |

## 成果物

| ファイル                                                 | 説明                  | ステータス |
| -------------------------------------------------------- | --------------------- | ---------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド            | 作成済み   |
| `outputs/phase-12/system-spec-update-summary.md`         | system spec sync 要約 | 作成済み   |
| `outputs/phase-12/documentation-changelog.md`            | 更新履歴              | 作成済み   |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出          | 作成済み   |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック  | 作成済み   |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 最終監査     | 作成済み   |

## 完了条件

- [x] Task 12-1〜12-6 の成果物が存在する
- [x] LOGS.md 2 ファイルの更新要否が記録されている
- [x] system spec Step 2 の要否が記録されている
- [x] `outputs/phase-12/phase12-task-spec-compliance-check.md` が存在する
- [x] 将来表現が残っていない
- [x] `artifacts.json` と `outputs/artifacts.json` が同期している

## 次のPhase

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-13-pr-creation.md`
