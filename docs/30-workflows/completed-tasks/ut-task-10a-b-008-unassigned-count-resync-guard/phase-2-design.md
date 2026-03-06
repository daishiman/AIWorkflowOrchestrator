# Phase 2: 設計

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 2                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 1                                         |
| 後続Phase  | Phase 3                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

active set の再計算方法、3台帳の同期順序、監査コマンドの実行順序を設計し、誰が実行しても同じ差分になる更新計画を定義する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと            | 実行順序    | 役割                                                                    |
| -------- | ------------------- | ----------- | ----------------------------------------------------------------------- |
| A        | active set 算出設計 | 先行        | 物理ファイル配置と状態表の優先順位を設計する                            |
| B        | workflow 台帳設計   | A後に並列   | `task-workflow.md` の更新箇所を設計する                                 |
| C        | UI仕様台帳設計      | A後に並列   | `ui-ux-feature-components.md` と detection レポートの更新箇所を設計する |
| D        | 監査順序設計        | B/C後に直列 | `verify-unassigned-links` と `audit` の実行順序を固定する               |

## 実行タスク

- 情報源3層設計: canonical / derived / historical の責務境界と判定順を設計する
- 台帳更新順序設計: canonical から derived へ同期する更新順を定義する
- コマンド契約設計: `rg`、`verify-unassigned-links`、`audit-unassigned-tasks`、`validate-schema` の実行順と期待値を定義する
- 日付整合設計: 起票日 2026-03-02 と最新更新日 2026-03-05 以降を混同しない記録方法を定義する

## 参照資料

### 前Phase成果物

| 資料名               | パス                                            | 用途                        |
| -------------------- | ----------------------------------------------- | --------------------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md`    | FR/NFR を引き継ぐ           |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`        | 合格条件を引き継ぐ          |
| Phase 1 スコープ定義 | `outputs/phase-1/scope-definition.md`           | 対象外を固定する            |
| Phase 1 正本定義     | `outputs/phase-1/source-of-truth-definition.md` | active set の前提を引き継ぐ |

### システム仕様（aiworkflow-requirements）

| 資料名                       | パス                                                                                        | 用途                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| プロジェクト概要             | `.claude/skills/aiworkflow-requirements/references/overview.md`                             | active set 再同期ガードを仕様全体の設計原則へ位置づける   |
| アーキテクチャ概要           | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 3台帳同期の責務境界を確認する                             |
| 実装パターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 直列/並列更新の設計パターンを確認する                     |
| タスク運用正本               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 残課題表と完了済みUTの現状を確認する                      |
| タスクワークローフェーズ定義 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                 | Phase責務と設計出力の粒度を確認する                       |
| タスク運用ルール             | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 未タスク配置先と完了移管条件を固定する                    |
| UI機能仕様正本               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView の表構造を確認する                      |
| UI/UX コンポーネント規約     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | SkillAnalysisView の既存UI文脈を確認する                  |
| 教訓正本                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | `current` 判定を固定する                                  |
| パターン集                   | `.claude/skills/aiworkflow-requirements/references/patterns.md`                             | Phase 12 の成功/失敗パターンと未タスク3ステップを確認する |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 設計レビューの判定軸を確認する                            |
| 開発ガイドライン             | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 変更順序と記録粒度を確認する                              |

### スクリプト

| 資料名       | パス                                                                           | 用途                               |
| ------------ | ------------------------------------------------------------------------------ | ---------------------------------- |
| リンク検証   | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 参照切れを検出する                 |
| 未タスク監査 | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`  | `current` と `baseline` を分離する |

## 実行手順

1. Phase 1 の正本定義を読み、historical / canonical / derived の3層分類を確定する。
2. canonical を `task-workflow.md` 残課題表、完了済み指示書ステータス、実際の配置に固定し、`ui-ux-feature-components.md` と `unassigned-task-detection.md` は derived ledger として扱う。
3. 変更順は「canonical の active set 確定 → derived ledger 同期 → 監査実行 → 教訓更新」に固定し、historical source で canonical を上書きしない設計にする。
4. 2026-03-02 の歴史的件数修正と、2026-03-05 以降の最新状態を別列で記録する設計にする。

## 統合テスト連携

- Phase 4 のテストケースは、active set 導出、3台帳一致、監査PASS の3束へ分割する。
- SubAgent-B/C は同じ active set を入力に使い、Phase 5 で並列更新できる状態にする。
- SubAgent-D は B/C 完了後のみ実行し、監査の順序逆転を防ぐ。

## 多角的チェック観点（関心分離）

| 観点       | 確認内容                                              | 正本                             |
| ---------- | ----------------------------------------------------- | -------------------------------- |
| 情報源分類 | historical / canonical / derived の責務境界が一意か   | architecture-design.md           |
| 導出規則   | active set の算出元が canonical に固定されているか    | source-of-truth-definition.md    |
| 更新順序   | detection、workflow、UI仕様の更新順が明示されているか | ledger-sync-design.md            |
| 監査順序   | link 検証と audit の順番が固定されているか            | verification-command-contract.md |
| 日付整合   | 2026-03-02 と 2026-03-05 の意味が分離されているか     | architecture-design.md           |

## 成果物

| 成果物             | パス                                               | 説明                           |
| ------------------ | -------------------------------------------------- | ------------------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | 正本と更新順序を設計する       |
| 台帳同期設計       | `outputs/phase-2/ledger-sync-design.md`            | 3台帳の変更手順を設計する      |
| 検証コマンド契約   | `outputs/phase-2/verification-command-contract.md` | コマンド順序と期待値を定義する |

## 完了条件

- [x] active set 導出ルールと情報源3層分類を設計書へ固定した
- [x] 3台帳の更新順を設計書へ固定した
- [x] `current` 判定の監査順序を設計書へ固定した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1 成果物の確認
2. SubAgent-A の算出設計
3. SubAgent-B/C の並列設計
4. SubAgent-D の監査順序設計
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の3ファイルを定義した
- [x] 情報源3層、active set、3台帳、監査順序、日付整合を設計した
- [x] Phase 3 のレビュー論点を準備した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 3: 設計レビューゲート
