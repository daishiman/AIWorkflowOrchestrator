# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                                                                                                                                                                                        |
| Phase名    | PR作成                                                                                                                                                                                                                                                    |
| タスクID   | TASK-SKILL-LIFECYCLE-04                                                                                                                                                                                                                                   |
| 前提Phase  | Phase 1（要件定義）, Phase 2（設計）, Phase 5（実装）, Phase 6（テスト拡充）, Phase 7（テストカバレッジ確認）, Phase 8（リファクタリング）, Phase 9（品質保証）, Phase 10（最終レビューゲート）, Phase 11（手動テスト検証）, Phase 12（ドキュメント更新） |
| 後続Phase  | -                                                                                                                                                                                                                                                         |
| ステータス | completed                                                                                                                                                                                                                                                 |
| 作成日     | 2026-03-12                                                                                                                                                                                                                                                |
| 機能名     | skill-lifecycle-evaluation-gate                                                                                                                                                                                                                           |

## 目的

Task04 の変更を reviewer が短時間で追跡できるように、影響範囲、検証結果、system spec 更新、残課題を整理する。

## 実行タスク

- PR summary 作成: 何を変えたか、Task03 / Task05 に何が追加されたかを要約する
- review checklist 作成: gate engine、hard block、manual test、system spec 同期、残課題を確認できる一覧を作成する
- evidence 添付: QA、manual test、Phase 12 成果物の参照を並べる
- リスク記載: reviewer が見るべき risk と fallback を列挙する
- 制約記載: `Atent Team` / `SubAgent` / `Codex` は内部 role であり UI 主導線ではないことを記載する

## 参照資料

| 参照資料                 | パス                                       | 説明                  |
| ------------------------ | ------------------------------------------ | --------------------- |
| Phase 2 設計             | `phase-2-design.md`                        | 設計要約の元          |
| Phase 5 実装             | `phase-5-implementation.md`                | 実装範囲              |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                | regression 範囲       |
| Phase 7 coverage         | `phase-7-coverage-check.md`                | coverage 要約         |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                   | 重複排除結果          |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`             | QA 要約               |
| Phase 10 final review    | `phase-10-final-review.md`                 | 最終判定              |
| Phase 11 manual test     | `phase-11-manual-test.md`                  | 実画面証跡            |
| Phase 12 documentation   | `phase-12-documentation.md`                | 同期成果物            |
| gate engine 設計         | `outputs/phase-2/gate-decision-design.md`  | reviewer 向け判定仕様 |
| implementation plan      | `outputs/phase-5/implementation-plan.md`   | 変更責務一覧          |
| regression plan          | `outputs/phase-6/regression-plan.md`       | 回帰確認一覧          |
| coverage gap             | `outputs/phase-7/coverage-gap-analysis.md` | 未検証残件            |
| refactor plan            | `outputs/phase-8/refactor-plan.md`         | 集約内容              |
| quality gate report      | `outputs/phase-9/quality-gate-report.md`   | QA 判定               |
| final review report      | `outputs/phase-10/final-review-report.md`  | 判定根拠              |
| manual test result       | `outputs/phase-11/manual-test-result.md`   | 実測結果              |
| implementation guide     | `outputs/phase-12/implementation-guide.md` | ドキュメント成果物    |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容           |
| --------------- | ---------------------------------------------------------------------- | -------------- |
| task-workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了記録の整合 |
| lessons-learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発防止確認   |

## 実行手順

### ステップ1: summary と evidence を整理する

Task03 / Task05 への影響、QA、manual test、Phase 12 成果物を一覧化する。

### ステップ2: reviewer checklist を作成する

gate engine、hard block、cross-task handoff、system spec 同期を確認できる項目へ整理する。

### ステップ3: リスクと fallback を整理する

reviewer が見るべき残課題と fallback を記録する。

### ステップ4: PR本文と補足コメントを準備する

`.github/pull_request_template.md` に合わせて PR 本文を生成し、`outputs/phase-12/implementation-guide.md` の全文を PR コメントへ投稿する。UI/UX 変更があるため、Phase 11 screenshot 6件を PR 本文へ含める。

## 実行結果

- `outputs/phase-13/pr-summary.md` と `outputs/phase-13/review-checklist.md` を作成し、Task03 / Task05 影響、Phase 11/12 証跡、残課題、internal role 非露出方針を整理した。
- `origin/main` 取り込み後に発生した skill / spec / mirror 系競合は `.claude` 正本優先で解消し、`generate-index.js` と `.agents` mirror sync で整合させた。
- `node .claude/skills/github-issue-manager/scripts/sync_new_issues.js` は「未同期仕様書なし」で完了し、follow-up 未タスク Issue `#1192` / `#1193` は open のまま残課題として維持した。
- ユーザーが 2026-03-13 に `pnpm typecheck` / `pnpm lint` / `pnpm --filter @repo/shared build` / `pnpm --filter @repo/desktop build` / `pnpm test --testTimeout=900000` を直前実行済みであり、main 取り込み後の追加差分が skill / spec 文書競合解消に限られたため、フルテスト再実行は省略した。
- 代替確認として `git diff --check`、skill mirror `diff -qr`、Issue 同期を実施し、PR 作成前の整合性を確認した。

## 成果物

| 成果物           | パス                                   | 内容                 |
| ---------------- | -------------------------------------- | -------------------- |
| PR summary       | `outputs/phase-13/pr-summary.md`       | 変更要約と証跡リンク |
| review checklist | `outputs/phase-13/review-checklist.md` | reviewer 用確認項目  |

## 完了条件

- [x] PR summary に Task03 / Task05 への影響が記載されている
- [x] QA / manual test / documentation の証跡が列挙されている
- [x] reviewer checklist が作成されている
- [x] 残課題と fallback が記載されている
- [x] internal role 非露出方針が記載されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- この仕様書セットは PR 作成で完了。次のPhaseはありません。
