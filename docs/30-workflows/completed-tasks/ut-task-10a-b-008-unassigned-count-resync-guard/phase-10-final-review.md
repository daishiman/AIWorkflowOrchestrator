# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 10                                              |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 9              |
| 後続Phase  | Phase 11                                        |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

要件、設計、実装差分、品質報告を最終照合し、Phase 11 と Phase 12 へ進めるかを判定する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと | 実行順序    | 役割                                   |
| -------- | -------- | ----------- | -------------------------------------- |
| A        | 要件照合 | 先行        | Phase 1 の要件を満たしているか照合する |
| B        | 設計照合 | Aと並列     | Phase 2 の設計を満たしているか照合する |
| C        | 品質照合 | A/B後に直列 | Phase 9 の品質報告を照合する           |
| D        | 最終判定 | C後に直列   | 通過条件と差戻し条件を記録する         |

## 実行タスク

- 要件照合: Phase 1 の FR/NFR/AC に差分が一致するか確認する
- 設計照合: Phase 2 の正本順序と更新順序に差分が一致するか確認する
- 品質照合: Phase 9 の監査結果と残余リスクを確認する
- 情報源整合照合: canonical / derived / historical の責務破りがないか確認する
- 最終判定: 通過、保留、差戻しの条件を明記する

## 参照資料

### 前Phase成果物

| 資料名               | パス                                         | 用途                 |
| -------------------- | -------------------------------------------- | -------------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md` | 要件照合に使う       |
| Phase 2 台帳同期設計 | `outputs/phase-2/ledger-sync-design.md`      | 設計照合に使う       |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`  | 実装照合に使う       |
| Phase 9 品質報告     | `outputs/phase-9/quality-report.md`          | 品質照合に使う       |
| Phase 9 リスク登録表 | `outputs/phase-9/risk-register.md`           | 残余リスク確認に使う |

### システム仕様（aiworkflow-requirements）

| 資料名                       | パス                                                                            | 用途                                       |
| ---------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| タスク運用正本               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 記録粒度を確認する                         |
| タスクワークローフェーズ定義 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`     | Gateの責務粒度を確認する                   |
| タスク運用ルール             | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`      | 未タスク配置先とリンク整合条件を確認する   |
| UI機能仕様正本               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | derived ledger の同期状態を確認する        |
| 教訓正本                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発条件を確認する                         |
| パターン集                   | `.claude/skills/aiworkflow-requirements/references/patterns.md`                 | Phase 12 成功/失敗パターンの観点を確認する |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | 最終レビューの判定軸を確認する             |
| 開発ガイドライン             | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`   | レビュー記録の粒度を確認する               |

## 実行手順

1. Phase 1、2、5、9 の成果物に加え、`task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` を同時に開き、照合マトリクスを作る。
2. 不一致を「要件」「設計」「品質」「情報源整合」の4区分で記録する。
3. historical source が canonical 判定を上書きしていないか、derived ledger が stale のまま残っていないかを確認する。
4. 不一致がゼロなら通過、残るなら差戻し先を指定し、通過時は Phase 11 と Phase 12 の実行入力を確定する。

## 統合テスト連携

- Phase 11 は Phase 10 通過後だけ開始する。
- Phase 12 は Phase 10 の差戻し条件がゼロになってから着手する。

## 多角的チェック観点（関心分離）

| 観点       | 確認内容                                                | 正本                   |
| ---------- | ------------------------------------------------------- | ---------------------- |
| 要件一致   | FR/NFR/AC を満たしているか                              | final-review-result.md |
| 設計一致   | 正本順序と更新順序を守っているか                        | final-review-result.md |
| 品質一致   | 品質報告と矛盾しないか                                  | final-review-result.md |
| 情報源整合 | canonical / derived / historical の責務が崩れていないか | final-review-result.md |
| 差戻し先   | 差戻しPhaseが一意か                                     | fix-instructions.md    |

## 成果物

| 成果物           | パス                                      | 説明                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 通過可否を記録する         |
| 修正指示         | `outputs/phase-10/fix-instructions.md`    | 差戻し時の修正先を記録する |

## 完了条件

- [x] 要件、設計、品質、情報源整合の4観点を照合した
- [x] 通過条件と差戻し条件を記録した
- [x] Phase 11 と Phase 12 の入力を確定した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1/2/5/9 成果物の確認
2. SubAgent-A/B の並列照合
3. SubAgent-C の品質照合
4. SubAgent-D の最終判定
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の2ファイルを定義した
- [x] 通過条件と差戻し条件を記録した
- [x] Phase 11/12 の前提を確定した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 11: 手動テスト検証
