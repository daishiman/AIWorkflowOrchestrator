# Phase 5: 実装

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 5                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 4                                         |
| 後続Phase  | Phase 6                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

設計とテスト仕様に沿って active set を再計算し、3台帳と教訓文書を同一ターンで同期する実装差分を定義する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと                 | 実行順序    | 役割                                                                       |
| -------- | ------------------------ | ----------- | -------------------------------------------------------------------------- |
| A        | active set 再計算        | 先行        | 物理配置と残課題表から当日有効集合を導出する                               |
| B        | workflow 台帳更新        | A後に並列   | `task-workflow.md` の節と残課題表を更新する                                |
| C        | UI仕様・検出レポート更新 | A後に並列   | `ui-ux-feature-components.md` と `unassigned-task-detection.md` を更新する |
| D        | 教訓更新                 | B/C後に直列 | `lessons-learned.md` に再利用ルールを追加する                              |

## 実行タスク

- active set 再計算: `docs/30-workflows/unassigned-task/` と `completed-tasks/` の最新配置から有効集合を導出する
- 3台帳更新: `unassigned-task-detection`、`task-workflow`、`ui-ux-feature-components` を同一ターンで更新する
- 教訓更新: `lessons-learned.md` に固定レンジ依存を避ける再利用ルールを追記する
- 変更証跡整理: 変更対象ファイル、更新順、反映理由を実装サマリーへ記録する

## 参照資料

### 前Phase成果物

| 資料名               | パス                                           | 用途                         |
| -------------------- | ---------------------------------------------- | ---------------------------- |
| Phase 4 テスト仕様書 | `outputs/phase-4/test-specification.md`        | 実装完了条件を引き継ぐ       |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`                | ケース別期待値を引き継ぐ     |
| Phase 4 台帳一致行列 | `outputs/phase-4/ledger-consistency-matrix.md` | 更新対象の一致条件を引き継ぐ |

### 更新対象文書

| 資料名       | パス                                                                                                  | 用途                        |
| ------------ | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| 検出レポート | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md` | active set と件数を更新する |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                                        | 用途                                               |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 3台帳同期と責務分離の境界を確認する                |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | active set 再計算と直列/並列更新パターンを確認する |
| タスク運用正本     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 残課題表と TASK-10A-B 節を更新する                 |
| タスク運用ルール   | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 未完了/完了移管の配置条件を固定する                |
| UI機能仕様正本     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 関連未タスク表を更新する                           |
| 教訓正本           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再利用ルールを追記する                             |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 実装後の品質証跡の粒度を確認する                   |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 変更順と記録方法を固定する                         |

## 実行手順

1. SubAgent-A が当日の active set を導出し、ID集合と件数を固定する。
2. SubAgent-B/C が同じ集合を使って `task-workflow.md`、`ui-ux-feature-components.md`、`unassigned-task-detection.md` を更新する。
3. SubAgent-D が `lessons-learned.md` に「固定レンジ依存を避ける」「合否は `current` 固定」の2ルールを追加する。
4. 更新順、変更理由、差分対象を `implementation-summary.md` と `change-set-plan.md` に記録する。

## 統合テスト連携

- Phase 6 では Phase 5 の active set 証跡を再利用し、別日付ケースで回帰確認する。
- `task-workflow.md` と `ui-ux-feature-components.md` の更新は同じID集合を入力に使う。
- `lessons-learned.md` は監査結果が出る前に更新しない。

## 多角的チェック観点（関心分離）

| 観点 | 確認内容                                                    | 正本                      |
| ---- | ----------------------------------------------------------- | ------------------------- |
| 実体 | active set が物理配置から導出されているか                   | active-id-proof.md        |
| 台帳 | 3台帳が同一集合を保持しているか                             | change-set-plan.md        |
| 教訓 | 再発防止ルールが再利用できる文になっているか                | implementation-summary.md |
| 履歴 | 2026-03-02 の起点と 2026-03-05 の最新状態が混線していないか | implementation-summary.md |

## 成果物

| 成果物          | パス                                        | 説明                             |
| --------------- | ------------------------------------------- | -------------------------------- |
| 実装サマリー    | `outputs/phase-5/implementation-summary.md` | 実装差分と理由を記録する         |
| 変更セット計画  | `outputs/phase-5/change-set-plan.md`        | 更新対象ファイルと順序を記録する |
| active set 証跡 | `outputs/phase-5/active-id-proof.md`        | 当日有効集合の根拠を記録する     |

## 完了条件

- [x] active set を当日状態から導出した
- [x] 3台帳を同一ターンで更新する実装差分を定義した
- [x] 教訓文書への追記内容を定義した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 4 成果物の確認
2. SubAgent-A の先行導出
3. SubAgent-B/C の並列更新
4. SubAgent-D の教訓更新
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の3ファイルを定義した
- [x] active set、3台帳、教訓の更新順を固定した
- [x] Phase 6 の回帰入力を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 6: テスト拡充
