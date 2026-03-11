# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 13                                                       |
| Phase名    | PR作成                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                  |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤               |
| 前提Phase  | [phase-12-documentation.md](./phase-12-documentation.md) |
| ステータス | not_started                                              |
| 作成日     | 2026-03-11                                               |

## 目的

Task01 実装後にレビュー可能な差分、依存関係、確認観点を PR 用資料として整理する。

## 実行タスク

- 差分要約: 導線再編、画面責務変更、advanced 導線整理を要約する
- 証跡整理: テスト、screenshot、仕様同期の証跡を整理する
- 依存影響整理: Task02-05 の追従条件を整理する
- PRドラフト作成: 本文案のみを作成する

## 重要制約

- ユーザーの明示許可なしに commit / PR を実行しない
- Phase 13 では PR本文・レビュー観点・証跡一覧の作成に留める

## 参照資料

| 参照資料              | パス                                                                       | 内容                |
| --------------------- | -------------------------------------------------------------------------- | ------------------- |
| responsibility matrix | `outputs/phase-2/surface-responsibility-matrix.md`                         | 画面責務            |
| implementation log    | `outputs/phase-5/implementation-log.md`                                    | 実装要約            |
| test expansion result | `outputs/phase-6/test-expansion-result.md`                                 | テスト拡充結果      |
| coverage report       | `outputs/phase-7/coverage-report.md`                                       | カバレッジ結果      |
| refactoring log       | `outputs/phase-8/refactoring-log.md`                                       | 最終構造            |
| quality report        | `outputs/phase-9/quality-report.md`                                        | 品質監査            |
| implementation guide  | `outputs/phase-12/implementation-guide.md`                                 | 実装説明            |
| spec update summary   | `outputs/phase-12/spec-update-summary.md`                                  | 仕様同期内容        |
| changelog             | `outputs/phase-12/documentation-changelog.md`                              | 更新履歴            |
| manual test result    | `outputs/phase-11/manual-test-result.md`                                   | 視覚証跡            |
| final review          | `outputs/phase-10/final-review-result.md`                                  | 判定結果            |
| execute workflow      | `.claude/skills/task-specification-creator/references/execute-workflow.md` | PR 非自動実行ルール |

## 実行手順

1. 差分要約、証跡整理、依存影響整理を並列で作成する。
2. PR 本文ドラフトを作成する。
3. commit / PR 実行はせず、ユーザー確認待ちの状態で止める。

## 成果物

| 成果物         | パス                                    | 説明                |
| -------------- | --------------------------------------- | ------------------- |
| PR要約ドラフト | `outputs/phase-13/pr-summary-draft.md`  | 変更概要            |
| 証跡一覧       | `outputs/phase-13/evidence-index.md`    | テストと screenshot |
| 依存影響一覧   | `outputs/phase-13/downstream-impact.md` | Task02-05 追従条件  |
| PR本文ドラフト | `outputs/phase-13/pr-body-draft.md`     | 実行しない本文案    |

## 完了条件

- [ ] レビュー担当が導線変更を追跡できる
- [ ] Task02-05 の追従条件が整理されている
- [ ] テストと仕様同期証跡が整理されている
- [ ] commit / PR を未実行のままドラフトのみが残っている
- [ ] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-12-documentation.md](./phase-12-documentation.md)

## サブタスク管理

- [ ] 差分要約
- [ ] 証跡整理
- [ ] downstream impact 整理
- [ ] PR本文ドラフト
- [ ] 完了条件検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PR実行が未実施である
- [ ] ユーザー確認用のドラフトが揃っている
