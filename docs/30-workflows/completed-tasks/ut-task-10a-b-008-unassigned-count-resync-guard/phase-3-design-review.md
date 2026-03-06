# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 3                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 1, Phase 2                                |
| 後続Phase  | Phase 4                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

設計が「固定レンジ依存を排除して active set を導出する」「3台帳を同一ターンで同期する」「監査合否を `current` に固定する」の3条件を満たしているかを審査する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと         | 実行順序    | 役割                                      |
| -------- | ---------------- | ----------- | ----------------------------------------- |
| A        | 算出規則レビュー | 先行        | active set 導出規則の抜け漏れを点検する   |
| B        | 台帳同期レビュー | Aと並列     | 3台帳の更新箇所が不足していないか点検する |
| C        | 監査契約レビュー | A/B後に直列 | `current` と `baseline` の扱いを点検する  |
| D        | ゲート判定       | C後に直列   | PASS/FAIL と差戻し条件を記録する          |

## 実行タスク

- 算出規則レビュー: active set が物理配置と状態表の両方を使って導出されるか確認する
- 台帳同期レビュー: `unassigned-task-detection`、`task-workflow`、`ui-ux-feature-components` の3台帳が全て更新対象になっているか確認する
- 監査契約レビュー: `verify-unassigned-links` と `audit --diff-from HEAD` の順序と判定軸を確認する
- ゲート判定: 差戻し条件、保留条件、通過条件を明記する

## 参照資料

### 前Phase成果物

| 資料名                     | パス                                               | 用途                 |
| -------------------------- | -------------------------------------------------- | -------------------- |
| Phase 1 要件定義           | `outputs/phase-1/requirements-definition.md`       | 要件を再確認する     |
| Phase 1 正本定義           | `outputs/phase-1/source-of-truth-definition.md`    | 正本順序を再確認する |
| Phase 2 アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | 導出規則を再確認する |
| Phase 2 台帳同期設計       | `outputs/phase-2/ledger-sync-design.md`            | 更新順序を再確認する |
| Phase 2 検証コマンド契約   | `outputs/phase-2/verification-command-contract.md` | 監査順序を再確認する |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                                        | 用途                                              |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 3台帳同期の責務境界を再確認する                   |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | active set 再計算と台帳更新の分離方針を再確認する |
| タスク運用正本     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 現行残課題表の粒度を確認する                      |
| タスク運用ルール   | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 未タスク配置先とリンク整合条件を再確認する        |
| UI機能仕様正本     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 現行関連未タスク表の粒度を確認する                |
| 教訓正本           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発パターンを確認する                            |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | レビューゲートの判定軸を確認する                  |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 仕様変更のレビュー観点を補強する                  |

## 実行手順

1. Phase 1 と Phase 2 の成果物を並べ、active set 導出規則と更新順序を読み合わせる。
2. 3台帳のどれか1つでも更新対象から漏れていないかを確認する。
3. 監査合否が `currentViolations=0` に固定されているかを確認する。
4. FAIL の場合は差戻し先を Phase 2 に固定する。

## 統合テスト連携

- Phase 4 では、このレビューで通過した導出規則だけをテストケースへ変換する。
- Phase 5 で想定する変更ファイル数と更新順序をレビュー記録へ残し、実装差分と比較できるようにする。

## 多角的チェック観点（関心分離）

| 観点       | 確認内容                                   | 正本                             |
| ---------- | ------------------------------------------ | -------------------------------- |
| 算出規則   | 固定レンジ依存が残っていないか             | architecture-design.md           |
| 台帳境界   | 3台帳の責務が混線していないか              | ledger-sync-design.md            |
| 監査境界   | `current` と `baseline` が混線していないか | verification-command-contract.md |
| 差戻し条件 | FAIL 時の戻り先が一意か                    | review-gate-decision.md          |

## 成果物

| 成果物           | パス                                      | 説明                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー指摘を記録する |
| ゲート判定       | `outputs/phase-3/review-gate-decision.md` | PASS/FAIL を記録する   |

## 完了条件

- [x] 算出規則、3台帳、監査順序の3観点をレビューした
- [x] 差戻し条件を明文化した
- [x] 通過後に Phase 4 が実行できる状態にした
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1/2 成果物の読み合わせ
2. SubAgent-A/B の並列レビュー
3. SubAgent-C の監査レビュー
4. SubAgent-D のゲート判定
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の2ファイルを定義した
- [x] 差戻し条件を明記した
- [x] Phase 4 の入力条件を固定した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 4: テスト作成
