# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 1                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | -                                               |
| 後続Phase  | Phase 2                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

Issue #996 が 2026-03-02 に解決した「7件から5件への件数再同期」を、2026-03-05 の `UT-TASK-10A-B-001` 完了と `UT-TASK-10A-B-009` 追加を踏まえた最新状態でも再発させないために、件数算出の正本と同期対象を一意に定義する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと           | 実行順序    | 役割                                                                                        |
| -------- | ------------------ | ----------- | ------------------------------------------------------------------------------------------- |
| A        | 有効ID集合の導出   | 先行        | `docs/30-workflows/unassigned-task/` と `completed-tasks/` の配置から active set を算出する |
| B        | task-workflow 同期 | A後に並列   | `task-workflow.md` の残課題表と TASK-10A-B 節の整合条件を定義する                           |
| C        | UI仕様台帳同期     | A後に並列   | `ui-ux-feature-components.md` の関連未タスク表の整合条件を定義する                          |
| D        | 監査・教訓         | B/C後に直列 | `verify-unassigned-links` と `audit-unassigned-tasks` の合否基準を固定する                  |

## 実行タスク

- 歴史的背景の固定: 2026-03-02 の Issue #996 と元未タスク指示書が持つ起票時前提を historical source として整理する
- 情報源3層分類の固定: canonical / derived / historical の責務境界を定義し、active set 判定の正本を一意化する
- 受け入れ基準化: 3台帳と監査コマンドの合格条件を検証可能な文で定義する
- 非スコープ固定: 新規UI機能実装と既存UTの一括棚卸しを対象外として固定する

## 参照資料

### 入力文書

| 資料名               | パス                                                                                                  | 用途                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 元未タスク指示書     | `docs/30-workflows/completed-tasks/task-10a-b-unassigned-count-resync-guard.md`                       | Why/What/How の起点を確認する        |
| GitHub Issue         | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/996`                                      | 2026-03-02 時点の起票内容を確認する  |
| 親タスク検出レポート | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md` | 件数ドリフトの初回修正内容を確認する |

### システム仕様（aiworkflow-requirements）

| 資料名                       | パス                                                                            | 用途                                                      |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| プロジェクト概要             | `.claude/skills/aiworkflow-requirements/references/overview.md`                 | active set 再同期ガードを仕様全体の目的に位置づける       |
| タスク運用正本               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 最新の完了済みUTと未実施UTを確認する                      |
| タスクワークローフェーズ定義 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`     | Phase責務と文書化粒度の基準を確認する                     |
| タスク運用ルール             | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`      | 未完了/完了移管の配置規則と残課題更新規則を確認する       |
| UI機能仕様正本               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillAnalysisView の関連未タスク表を確認する              |
| 教訓正本                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | `current` と `baseline` の分離ルールを確認する            |
| パターン集                   | `.claude/skills/aiworkflow-requirements/references/patterns.md`                 | Phase 12 の成功/失敗パターンと未タスク3ステップを確認する |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | ドキュメント同期タスクの完了基準を確認する                |
| リソースマップ               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                | 参照漏れを防ぐ                                            |

### 作業規約

| 資料名              | パス                                                                                 | 用途                             |
| ------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| 未タスク記録ガイド  | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク正本の品質基準を確認する |
| create ワークフロー | `.claude/skills/task-specification-creator/references/create-workflow.md`            | 仕様書作成の進め方を確認する     |

## 実行手順

1. 2026-03-02 の起票時要件と、2026-03-05 以降の `task-workflow.md` / `lessons-learned.md` 更新状態を並べて読む。
2. 情報源を `historical`（Issue #996 / 元未タスク指示書）、`canonical`（`task-workflow.md` 残課題表、完了済み指示書ステータス、実際の配置）、`derived`（`ui-ux-feature-components.md` / `unassigned-task-detection.md`）に分類する。
3. active set は canonical からだけ導出し、historical source は背景説明、derived source は同期対象として扱う。
4. 監査合否は `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD` の `currentViolations=0` に固定し、baseline は監視値として分離する。

## 統合テスト連携

- Phase 4 で `rg`、`verify-unassigned-links`、`audit-unassigned-tasks` を組み合わせた検証ケースへ落とし込む。
- Phase 5 以降は SubAgent-A の active set 出力を唯一の入力とし、B/C/D は同じ集合を使う。
- Phase 11 ではコマンド出力と台帳記述を人手で照合し、差分ゼロを確認する。

## 多角的チェック観点（関心分離）

| 観点       | 確認内容                                                        | 正本                                                                        |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 情報源分類 | canonical / derived / historical の責務境界が明文化されているか | source-of-truth-definition.md                                               |
| 有効ID     | active set を固定レンジでなく canonical から導出しているか      | source-of-truth-definition.md                                               |
| 台帳同期   | 3台帳が同じID集合と件数を保持するか                             | unassigned-task-detection.md、task-workflow.md、ui-ux-feature-components.md |
| 監査解釈   | `current` と `baseline` を分離しているか                        | lessons-learned.md                                                          |
| 変更境界   | 本タスクが運用ガードであり新規実装を含まないか                  | scope-definition.md                                                         |

## 成果物

| 成果物       | パス                                            | 説明                                      |
| ------------ | ----------------------------------------------- | ----------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`    | FR/NFR/AC を定義する                      |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`        | 合格条件を定義する                        |
| スコープ定義 | `outputs/phase-1/scope-definition.md`           | 対象と対象外を固定する                    |
| 正本定義     | `outputs/phase-1/source-of-truth-definition.md` | active set と同期対象の正本順序を定義する |

## 完了条件

- [x] 2026-03-02 の起票内容と 2026-03-05 の最新状態差分を文書化した
- [x] active set を固定レンジでなく canonical source からの動的導出へ切り替える要件を定義した
- [x] 3台帳と2系統監査の合格条件を明文化した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 入力文書の確認
2. SubAgent-A の active set 定義
3. SubAgent-B/C の同期要件定義
4. SubAgent-D の監査基準定義
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の4ファイルを定義した
- [x] 情報源3層、active set、台帳同期、監査解釈、変更境界を記録した
- [x] Phase 2 が迷わず開始できる状態にした

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 2: 設計
