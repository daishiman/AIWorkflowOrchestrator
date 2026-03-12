# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 13                                                       |
| Phase名    | PR作成                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 機能名     | chat-platform-unification                                |
| 前提Phase  | [phase-12-documentation.md](./phase-12-documentation.md) |
| ステータス | not_started                                              |
| 作成日     | 2026-03-11                                               |

## 目的

PR 作成前に、変更要約、影響範囲、証跡を整理する。ただし、PR 作成自体はユーザーの明示許可があるまで実行しない。

## 実行タスク

- PR 要約作成: 変更概要と目的を整理する
- 影響範囲整理: Task03 以降への downstream impact を整理する
- 証跡索引作成: Phase 1-12 成果物と検証結果をまとめる
- PR 実行可否確認: ユーザー許可がある場合のみ PR 作成へ進む

## 参照資料

| 参照資料              | パス                                            | 内容            |
| --------------------- | ----------------------------------------------- | --------------- |
| 共通ドメインモデル    | `outputs/phase-2/common-chat-domain-model.md`   | 設計要約        |
| 実装ログ              | `outputs/phase-5/implementation-log.md`         | 実装内容        |
| 回帰ケース一覧        | `outputs/phase-6/regression-case-matrix.md`     | regression      |
| 要件トレーサビリティ  | `outputs/phase-7/requirement-traceability.md`   | AC とテスト     |
| リファクタリングログ  | `outputs/phase-8/refactoring-log.md`            | 最終構造        |
| 品質レポート          | `outputs/phase-9/quality-report.md`             | 品質根拠        |
| 最終レビュー判定      | `outputs/phase-10/final-review-result.md`       | release 可否    |
| 手動テスト結果        | `outputs/phase-11/manual-test-result.md`        | screenshot 証跡 |
| Phase 12 更新サマリー | `outputs/phase-12/spec-update-summary.md`       | 更新内容        |
| 更新履歴              | `outputs/phase-12/documentation-changelog.md`   | changelog       |
| 未タスク検出          | `outputs/phase-12/unassigned-task-detection.md` | 残課題          |
| スキル改善レポート    | `outputs/phase-12/skill-feedback-report.md`     | 今回の改善点    |

## 実行手順

1. Phase 1-12 成果物を evidence index にまとめる。
2. 変更要約と downstream impact をドラフト化する。
3. ユーザー許可がない場合は PR 情報ドラフトまでで止める。

## 成果物

| 成果物            | パス                                    | 説明                   |
| ----------------- | --------------------------------------- | ---------------------- |
| PR 要約ドラフト   | `outputs/phase-13/pr-summary-draft.md`  | 要約                   |
| PR 本文ドラフト   | `outputs/phase-13/pr-body-draft.md`     | PR 本文                |
| 証跡索引          | `outputs/phase-13/evidence-index.md`    | Phase 1-12 証跡一覧    |
| downstream impact | `outputs/phase-13/downstream-impact.md` | 後続タスクへの影響     |
| PR 情報           | `outputs/phase-13/pr-info.md`           | 許可がある場合のみ確定 |

## 完了条件

- [ ] PR 作成前に必要な情報が整理されている
- [ ] downstream impact が記録されている
- [ ] ユーザー許可なしに PR 作成を実行していない
- [ ] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-12-documentation.md](./phase-12-documentation.md)

## サブタスク管理

- [ ] evidence index 作成
- [ ] PR summary / body draft 作成
- [ ] downstream impact 作成
- [ ] 実行可否確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] ユーザー許可なしに PR 作成を実行していない
- [ ] evidence index から Phase 1-12 成果物へ到達できる

## 次のPhase

なし。ユーザーが PR / コミットを明示的に許可した場合のみ実行に進む。
