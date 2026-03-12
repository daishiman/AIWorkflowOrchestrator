# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 13                                                       |
| Phase名    | PR作成                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 前提Phase  | [phase-12-documentation.md](./phase-12-documentation.md) |
| ステータス | not_started                                              |
| 作成日     | 2026-03-12                                               |

## 目的

Task02 実装後に、mode 統合と基盤再編の差分をレビューしやすい形で PR にまとめる。

## 実行タスク

- PR 要約: 作成する
- mode 差分: 共通基盤差分と分けて整理する
- Task03 影響: 整理する
- 証跡整理: 手動テストと system spec 更新結果をまとめる
- archive/current split: レビュー観点へ入れる

## 参照資料

| 参照資料                | パス                                          | 内容           |
| ----------------------- | --------------------------------------------- | -------------- |
| session model           | `outputs/phase-2/session-model.md`            | session 契約   |
| implementation log      | `outputs/phase-5/implementation-log.md`       | 実装差分       |
| test expansion          | `outputs/phase-6/test-expansion-result.md`    | 追加テスト結果 |
| coverage report         | `outputs/phase-7/coverage-report.md`          | coverage 結果  |
| refactoring log         | `outputs/phase-8/refactoring-log.md`          | 最終構造       |
| quality report          | `outputs/phase-9/quality-report.md`           | 品質判定       |
| implementation guide    | `outputs/phase-12/implementation-guide.md`    | 実装説明       |
| spec update summary     | `outputs/phase-12/spec-update-summary.md`     | 仕様同期結果   |
| documentation changelog | `outputs/phase-12/documentation-changelog.md` | 更新履歴       |
| manual test result      | `outputs/phase-11/manual-test-result.md`      | 手動テスト証跡 |
| final review result     | `outputs/phase-10/final-review-result.md`     | 最終判定       |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容 |
| --------------- | ---------------------------------------------------------------------- | ---- |
| task-workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 台帳 |
| lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 教訓 |

## 成果物

| 成果物    | パス                               | 説明           |
| --------- | ---------------------------------- | -------------- |
| PR 下書き | `outputs/phase-13/pr-draft.md`     | レビュー用要約 |
| 差分要約  | `outputs/phase-13/diff-summary.md` | 基盤差分整理   |

## 完了条件

- [ ] 基盤変更のレビュー観点が PR 下書きに明記されている
- [ ] Task03 への影響が明記されている
- [ ] handoff / revive / archive split が説明されている
- [ ] ユーザー承認なしに PR 作成しない前提が維持されている
