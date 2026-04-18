# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 12                          |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18                  |

## 目的

NON_VISUAL docs-only task として、implementation guide、system spec update summary、documentation changelog、unassigned detection、skill feedback、phase12 compliance-check を same-wave で閉じる。

## 実行タスク

1. `implementation-guide.md` を 2パート構成で作成する
2. `system-spec-update-summary.md` に ledger / artifacts / LOGS / topic-map / canonical root / mirror 状態の同期結果を書く
3. `documentation-changelog.md` に変更ファイルと validator 実測を残す
4. `unassigned-task-detection.md` に follow-up の有無を残す
5. `skill-feedback-report.md` に skill 改善点を残す
6. `phase12-task-spec-compliance-check.md` で planned wording と evidence を検証する

## 参照資料

| 資料名           | パス                                                                                   | 用途                         |
| ---------------- | -------------------------------------------------------------------------------------- | ---------------------------- |
| phase 12 guide   | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 必須成果物と same-wave sync  |
| phase 11 result  | `docs/30-workflows/conflict-prevent-skills-001/phase-11-manual-test.md`                | 引継ぎ                       |
| aiworkflow skill | `.agents/skills/aiworkflow-requirements/SKILL.md`                                      | canonical root / mirror 方針 |

## 実行手順

### ステップ1: implementation guide

- Part 1: 中学生レベルで「なぜ必要か」を先に説明する
- Part 2: custom driver、`.gitattributes`、generator、hook install、warning flow、schema 不変 EVALS を技術者向けに説明する
- TypeScript 風の型・API・エラー系・edge case・定数一覧まで記録する
- `NON_VISUAL` のため `## 視覚証跡` には `UI/UX変更なしのため Phase 11 スクリーンショット不要` と明記する

### ステップ2: system spec update summary

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `lane/index.md` または N/A 理由
- `artifacts.json`
- `outputs/artifacts.json`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`

上記対象の同期結果を記録し、mirror は「部分 sync 済み / full sync 未完」を分離して書く。

### ステップ3: compliance-check

- planned wording を残さない
- `manual-test-result.md` を evidence として参照する
- Task 12-1〜12-6 と Step 1-A〜1-C の充足状況を明示する
- Phase 13 は approval 未取得なら `blocked` を維持する

## 統合テスト連携

- Phase 9 実測と Phase 11 evidence を compliance-check に接続する

## 多角的チェック観点（AIが判断）

- 抽象化思考: 初学者説明と技術者説明を混ぜていないか
- ダブル・ループ思考: close-out 自体が drift を増やしていないか
- 価値提案思考: documentation と ledger sync が運用上の価値を持つか

## サブタスク管理

| SubTask | 内容                       | 担当   |
| ------- | -------------------------- | ------ |
| ST-22   | implementation guide       | Lane C |
| ST-23   | spec / ledger sync summary | Lane C |
| ST-24   | compliance-check           | Lane C |

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 完了条件

- [ ] Part 1 / Part 2 の implementation guide 方針がある
- [ ] same-wave sync 対象の記録方針がある
- [ ] planned wording を禁止している
- [ ] Phase 13 blocked 維持が明記されている

## タスク100%実行確認【必須】

- [ ] 6成果物を列挙した
- [ ] same-wave sync を記載した
- [ ] NON_VISUAL 規則を記載した

## 次Phase

Phase 13 は user approval を得るまで blocked のまま保持する。
