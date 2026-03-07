# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 4                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 1, Phase 2, Phase 3                       |
| 後続Phase  | Phase 5                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

active set の導出、3台帳の一致、監査PASS を再現可能にするテストケースとコマンド列を定義する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと     | 実行順序    | 役割                                                    |
| -------- | ------------ | ----------- | ------------------------------------------------------- |
| A        | 正常系ケース | 先行        | 最新状態から active set を導出できるケースを定義する    |
| B        | 境界系ケース | Aと並列     | 完了済みUT、追加UT、旧件数の混在ケースを定義する        |
| C        | 監査ケース   | A/B後に直列 | `verify-unassigned-links` と `audit` の期待値を定義する |
| D        | テスト統合   | C後に直列   | ケース間の前提と順序を固定する                          |

## 実行タスク

- 正常系ケース作成: 最新 active set が3台帳で一致するケースを定義する
- 境界系ケース作成: 2026-03-05 の完了済みUTと新規UT追加を含むケースを定義する
- 監査ケース作成: `currentViolations=0` と `missing=0` を確認するケースを定義する
- コマンド列固定: `rg` と監査スクリプトの実行順を固定する

## 参照資料

### 前Phase成果物

| 資料名                   | パス                                               | 用途                   |
| ------------------------ | -------------------------------------------------- | ---------------------- |
| Phase 1 要件定義         | `outputs/phase-1/requirements-definition.md`       | 期待値を引き継ぐ       |
| Phase 2 台帳同期設計     | `outputs/phase-2/ledger-sync-design.md`            | 変更対象を引き継ぐ     |
| Phase 2 検証コマンド契約 | `outputs/phase-2/verification-command-contract.md` | コマンド順を引き継ぐ   |
| Phase 3 レビュー結果     | `outputs/phase-3/design-review-result.md`          | 指摘事項を反映する     |
| Phase 3 ゲート判定       | `outputs/phase-3/review-gate-decision.md`          | レビュー条件を反映する |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                          | 用途                                                      |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| タスク運用正本   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | active set と残課題表の期待値を確認する                   |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`    | 配置先判定とリンク整合条件をテスト観点へ落とし込む        |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト仕様書と回帰計画の粒度を確認する                    |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 検証コマンド記録の粒度を確認する                          |
| 教訓正本         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | `current` / `baseline` 誤読パターンを再発防止へ落とし込む |

### 補助資料とスクリプト

| 資料名           | パス                                                                            | 用途                   |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------- |
| 元未タスク指示書 | `docs/30-workflows/completed-tasks/task-10a-b-unassigned-count-resync-guard.md` | テスト観点を確認する   |
| リンク検証       | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`  | 参照切れ検証を定義する |
| 未タスク監査     | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`   | 監査ケースを定義する   |

## 実行手順

1. 正常系を「active set 導出」「3台帳一致」「監査PASS」の3段に分ける。
2. 境界系を「完了済みUT除外」「追加UT反映」「旧件数残置」の3ケースに分ける。
3. `rg` で抽出したID集合と監査結果を1ケース1期待値で定義する。
4. コマンドの実行順を変更しないことを明記する。

## 統合テスト連携

- `rg` の出力が Phase 5 の唯一の入力になる。
- `verify-unassigned-links` は 3台帳更新後に固定し、更新前には使わない。
- `audit-unassigned-tasks --diff-from HEAD` は最終コマンドに固定し、途中値を合否に使わない。

## 多角的チェック観点（関心分離）

| 観点   | 確認内容                                  | 正本                             |
| ------ | ----------------------------------------- | -------------------------------- |
| 正常系 | active set と件数が一致するか             | test-cases.md                    |
| 境界系 | 完了済みUTと追加UTを誤分類しないか        | ledger-consistency-matrix.md     |
| 監査系 | `current` と `missing` の両方を検証するか | test-specification.md            |
| 順序系 | コマンド順が固定されているか              | verification-command-contract.md |

## 成果物

| 成果物       | パス                                           | 説明                         |
| ------------ | ---------------------------------------------- | ---------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`        | ケース群の全体設計を記録する |
| テストケース | `outputs/phase-4/test-cases.md`                | ケース別の期待値を記録する   |
| 台帳一致行列 | `outputs/phase-4/ledger-consistency-matrix.md` | 3台帳の一致条件を記録する    |

## 完了条件

- [x] 正常系、境界系、監査系のケースを定義した
- [x] コマンド順と期待値を固定した
- [x] Phase 5 の実行に必要なケースが揃った
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 前Phase成果物の確認
2. SubAgent-A/B のケース作成
3. SubAgent-C の監査ケース作成
4. SubAgent-D の統合作業
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の3ファイルを定義した
- [x] `rg`、link 検証、audit の期待値を固定した
- [x] Phase 5 の変更順をケースへ接続した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 5: 実装
